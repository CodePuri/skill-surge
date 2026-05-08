#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const VERSION = "0.1.0";
const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DEFAULT_CONFIG_PATH = path.join(REPO_ROOT, "config", "sources.json");
const USER_CONFIG_PATH = path.join(os.homedir(), ".config", "skill-aggregator", "sources.json");
const DEFAULT_CACHE_PATH = path.join(os.homedir(), ".cache", "skill-aggregator", "index.json");
const FALLBACK_CACHE_PATH = path.join(os.tmpdir(), "skill-aggregator", "index.json");
const SIMPLE_TASK_RE = /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|date|time|pwd|ls|whoami)$/i;
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for", "from", "how", "i",
  "in", "is", "it", "me", "my", "of", "on", "or", "please", "that", "the", "this", "to",
  "use", "with", "you",
]);

function usage() {
  return `skill-aggregator ${VERSION}

Usage:
  skill-aggregator refresh [--dry-run] [--network] [--source <git-url>]
  skill-aggregator suggest --task "<task>" [--json] [--offline] [--llm]
  skill-aggregator install <candidate-id> [--dry-run]
  skill-aggregator hook --task "<task>" [--json] [--offline]

Options:
  --task <task>      Task text used for intent matching.
  --json             Emit machine-readable JSON.
  --dry-run          Print intended work without writing or installing.
  --network          Allow refresh to inspect configured git sources.
  --source <url>     Extra git/GitHub source to inspect during refresh.
  --offline          Do not call npx skills find during suggest/hook.
  --llm              Use SKILL_AGGREGATOR_LLM_COMMAND reranking when configured.
`;
}

function parseArgv(argv) {
  const flags = {};
  const positionals = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (["json", "dry-run", "network", "offline", "llm", "help", "version"].includes(key)) {
      flags[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    if (key === "source") {
      flags.source = [...(flags.source || []), value];
    } else {
      flags[key] = value;
    }
    index += 1;
  }
  return { command: positionals[0], positionals: positionals.slice(1), flags };
}

function expandHome(value) {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function loadConfig() {
  const base = readJson(DEFAULT_CONFIG_PATH, {});
  const user = readJson(USER_CONFIG_PATH, {});
  return {
    localPaths: [...(base.localPaths || []), ...(user.localPaths || [])],
    gitSources: [...(base.gitSources || []), ...(user.gitSources || [])],
    trustedOwners: [...new Set([...(base.trustedOwners || []), ...(user.trustedOwners || [])])],
    autoInstall: {
      ...(base.autoInstall || {}),
      ...(user.autoInstall || {}),
    },
  };
}

function cachePath() {
  return process.env.SKILL_AGGREGATOR_CACHE || DEFAULT_CACHE_PATH;
}

function emptyCache() {
  return { version: 1, generatedAt: null, candidates: [] };
}

function loadCache() {
  const candidates = [cachePath(), FALLBACK_CACHE_PATH];
  let cache = emptyCache();
  for (const candidatePath of candidates) {
    cache = readJson(candidatePath, null);
    if (cache) break;
  }
  if (!cache) cache = emptyCache();
  return {
    version: cache.version || 1,
    generatedAt: cache.generatedAt || null,
    candidates: Array.isArray(cache.candidates) ? cache.candidates : [],
  };
}

function writeCache(cache) {
  const targets = [cachePath(), FALLBACK_CACHE_PATH];
  let lastError = null;
  for (const target of targets) {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, `${JSON.stringify(cache, null, 2)}\n`);
      return target;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function sha(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function stripAnsi(value) {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

function tokenize(value) {
  return new Set(
    String(value)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token && !STOPWORDS.has(token)),
  );
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("\n---", 3);
  if (end === -1) return null;
  const frontmatter = content.slice(3, end).split(/\r?\n/);
  const result = {};
  for (const line of frontmatter) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  if (!result.name || !result.description) return null;
  return result;
}

function findSkillFiles(root, maxDepth = 4) {
  const resolvedRoot = expandHome(root);
  const found = [];
  if (!fs.existsSync(resolvedRoot)) return found;
  function visit(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === "SKILL.md") {
        found.push(full);
      } else if (
        entry.isDirectory() &&
        ![".git", "node_modules", "dist", ".cache", "__pycache__"].includes(entry.name)
      ) {
        visit(full, depth + 1);
      }
    }
  }
  visit(resolvedRoot, 0);
  return found;
}

function localCandidateFromSkill(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const metadata = parseFrontmatter(content);
  if (!metadata) return null;
  const sourceKey = path.dirname(filePath);
  return {
    id: sha(`local:${sourceKey}`).slice(0, 12),
    name: metadata.name,
    description: metadata.description,
    sourceKind: "local",
    source: sourceKey,
    url: null,
    installCount: null,
    installCommand: null,
    hash: sha(content),
    lastSeenAt: new Date().toISOString(),
    score: 0,
    canAutoInstall: false,
    reason: "Installed local skill.",
  };
}

function scanLocalCandidates(config) {
  const seen = new Set();
  const candidates = [];
  for (const root of config.localPaths || []) {
    for (const filePath of findSkillFiles(root)) {
      const candidate = localCandidateFromSkill(filePath);
      if (!candidate || seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      candidates.push(candidate);
    }
  }
  return candidates;
}

function parseInstallCount(raw) {
  if (!raw) return null;
  const match = raw.match(/([\d.]+)\s*([KMB])?/i);
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;
  const suffix = (match[2] || "").toUpperCase();
  const multiplier = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : suffix === "B" ? 1_000_000_000 : 1;
  return Math.round(base * multiplier);
}

function parseSkillsCliOutput(output) {
  const clean = stripAnsi(output);
  const lines = clean.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const candidates = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[A-Za-z0-9_. -]+)\s+(.+?installs?)$/i);
    if (!match) continue;
    const spec = match[1].trim();
    const [repo, skillName] = spec.split("@");
    const linkLine = lines[index + 1] || "";
    const urlMatch = linkLine.match(/https?:\/\/\S+/);
    const installCommand = ["npx", "skills", "add", repo, "--skill", skillName, "-g", "-a", "codex", "-y"];
    candidates.push({
      id: sha(`skills-cli:${spec}`).slice(0, 12),
      name: skillName,
      description: `Skill discovered from Skills CLI result ${spec}.`,
      sourceKind: "skills-cli",
      source: repo,
      url: urlMatch ? urlMatch[0] : null,
      installCount: parseInstallCount(match[2]),
      installCommand,
      packageSpec: spec,
      hash: sha(`${spec}:${urlMatch ? urlMatch[0] : ""}`),
      lastSeenAt: new Date().toISOString(),
      score: 0,
      canAutoInstall: false,
      reason: "Discovered from npx skills find.",
    });
  }
  return candidates;
}

function runSkillsFind(task) {
  const terms = [...tokenize(task)].slice(0, 8);
  if (terms.length === 0) return { candidates: [], error: "Task did not contain searchable terms." };
  const result = spawnSync("npx", ["skills", "find", ...terms], {
    encoding: "utf8",
    timeout: 25_000,
    shell: false,
  });
  if (result.error) {
    return { candidates: [], error: result.error.message };
  }
  if (result.status !== 0) {
    return { candidates: [], error: result.stderr || result.stdout || `npx exited with ${result.status}` };
  }
  return { candidates: parseSkillsCliOutput(result.stdout), error: null };
}

function mergeCandidates(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const candidate of list || []) {
      byId.set(candidate.id, { ...(byId.get(candidate.id) || {}), ...candidate });
    }
  }
  return [...byId.values()];
}

function preferCandidate(candidate) {
  let value = 0;
  if (candidate.sourceKind === "local" && String(candidate.source || "").includes("/.codex/skills/")) value += 8;
  if (candidate.sourceKind === "local") value += 5;
  if (candidate.canAutoInstall) value += 4;
  value += Math.min(3, Math.floor(Number(candidate.installCount || 0) / 1000));
  return value;
}

function dedupeByName(candidates) {
  const byName = new Map();
  for (const candidate of candidates) {
    const key = String(candidate.name || candidate.id).toLowerCase();
    const current = byName.get(key);
    if (!current || candidate.score > current.score || (candidate.score === current.score && preferCandidate(candidate) > preferCandidate(current))) {
      byName.set(key, candidate);
    }
  }
  return [...byName.values()];
}

function scoreCandidate(candidate, task, config) {
  const terms = tokenize(task);
  const text = tokenize(`${candidate.name} ${candidate.description} ${candidate.source || ""}`);
  let overlap = 0;
  for (const term of terms) {
    if (text.has(term)) overlap += 1;
  }
  const owner = String(candidate.source || "").split("/")[0].toLowerCase();
  const trusted = (config.trustedOwners || []).map((item) => item.toLowerCase()).includes(owner);
  const installCount = Number(candidate.installCount || 0);
  let score = candidate.sourceKind === "local" ? 42 : 25;
  score += overlap * 16;
  if (trusted) score += 20;
  if (installCount >= 1000) score += 18;
  else if (installCount >= 100) score += 10;
  else if (installCount > 0) score += 4;
  if (candidate.name && task.toLowerCase().includes(candidate.name.toLowerCase())) score += 12;
  score = Math.min(100, score);
  const minScore = Number(config.autoInstall?.minimumScore || 70);
  const minInstalls = Number(config.autoInstall?.minimumInstallsForPublic || 1000);
  const validInstallCommand = Array.isArray(candidate.installCommand)
    && candidate.installCommand[0] === "npx"
    && candidate.installCommand[1] === "skills"
    && candidate.installCommand[2] === "add"
    && candidate.installCommand.includes("-g")
    && candidate.installCommand.includes("-a")
    && candidate.installCommand.includes("codex")
    && candidate.installCommand.includes("-y");
  const canAutoInstall = candidate.sourceKind !== "local"
    && validInstallCommand
    && score >= minScore
    && (trusted || installCount >= minInstalls);
  return {
    ...candidate,
    score,
    canAutoInstall,
    reason: buildReason(candidate, overlap, trusted, installCount, canAutoInstall),
  };
}

function buildReason(candidate, overlap, trusted, installCount, canAutoInstall) {
  const parts = [];
  if (candidate.sourceKind === "local") parts.push("already installed locally");
  if (overlap > 0) parts.push(`${overlap} intent keyword match${overlap === 1 ? "" : "es"}`);
  if (trusted) parts.push("trusted owner");
  if (installCount) parts.push(`${installCount.toLocaleString()} installs`);
  if (canAutoInstall) parts.push("passes auto-install threshold");
  if (parts.length === 0) return "Weak metadata match.";
  return parts.join("; ");
}

function rerankWithExternalCommand(task, candidates) {
  const command = process.env.SKILL_AGGREGATOR_LLM_COMMAND;
  if (!command) return { candidates, note: "LLM rerank skipped; SKILL_AGGREGATOR_LLM_COMMAND is not configured." };
  const result = spawnSync(command, [], {
    input: JSON.stringify({ task, candidates }),
    encoding: "utf8",
    timeout: 20_000,
    shell: true,
  });
  if (result.status !== 0 || !result.stdout) {
    return { candidates, note: "LLM rerank failed; local ranking used." };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const rankedIds = Array.isArray(parsed) ? parsed : parsed.rankedIds;
    if (!Array.isArray(rankedIds)) throw new Error("missing rankedIds");
    const order = new Map(rankedIds.map((id, index) => [id, index]));
    return {
      candidates: [...candidates].sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999)),
      note: "LLM rerank applied.",
    };
  } catch {
    return { candidates, note: "LLM rerank returned invalid JSON; local ranking used." };
  }
}

function isTrivialTask(task) {
  const trimmed = task.trim();
  const terms = tokenize(trimmed);
  return terms.size <= 1 || SIMPLE_TASK_RE.test(trimmed);
}

function commandRefresh(flags) {
  const config = loadConfig();
  const local = scanLocalCandidates(config);
  const previous = loadCache();
  let external = previous.candidates.filter((candidate) => candidate.sourceKind !== "local");
  const sourceList = [...(config.gitSources || []), ...(flags.source || [])];
  const notes = [`Found ${local.length} local skills.`];
  if (flags.network && sourceList.length > 0) {
    for (const source of sourceList) {
      const result = spawnSync("npx", ["skills", "add", source, "--list"], {
        encoding: "utf8",
        timeout: 30_000,
        shell: false,
      });
      if (result.status === 0) {
        notes.push(`Inspected ${source}.`);
      } else {
        notes.push(`Could not inspect ${source}: ${stripAnsi(result.stderr || result.stdout || "unknown error").trim()}`);
      }
    }
  }
  const cache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    candidates: mergeCandidates(local, external),
    notes,
  };
  const actualCachePath = flags["dry-run"] ? cachePath() : writeCache(cache);
  console.log(JSON.stringify({ dryRun: Boolean(flags["dry-run"]), cachePath: actualCachePath, ...cache }, null, 2));
  return 0;
}

function commandSuggest(flags) {
  const task = flags.task;
  if (!task) throw new Error("suggest requires --task");
  const config = loadConfig();
  let cache = loadCache();
  if (cache.candidates.length === 0) {
    cache = { version: 1, generatedAt: new Date().toISOString(), candidates: scanLocalCandidates(config) };
  }
  const notes = [];
  let external = [];
  if (!flags.offline && process.env.SKILL_AGGREGATOR_OFFLINE !== "1") {
    const result = runSkillsFind(task);
    external = result.candidates;
    if (result.error) notes.push(`Skills CLI search unavailable: ${stripAnsi(result.error).trim()}`);
  }
  let candidates = dedupeByName(mergeCandidates(cache.candidates, external)
    .map((candidate) => scoreCandidate(candidate, task, config))
    .filter((candidate) => candidate.score > 25)
    .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name))))
    .slice(0, 10);
  if (flags.llm) {
    const reranked = rerankWithExternalCommand(task, candidates);
    candidates = reranked.candidates;
    notes.push(reranked.note);
  }
  const updatedCache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    candidates: mergeCandidates(cache.candidates, external).map((candidate) => scoreCandidate(candidate, task, config)),
    notes,
  };
  const actualCachePath = writeCache(updatedCache);
  const payload = { task, cachePath: actualCachePath, notes, candidates };
  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    printCandidates(payload);
  }
  return 0;
}

function printCandidates(payload) {
  if (payload.candidates.length === 0) {
    console.log(`No strong skill candidates found for: ${payload.task}`);
    return;
  }
  for (const candidate of payload.candidates) {
    console.log(`${candidate.id}  ${candidate.name}  score=${candidate.score}  auto=${candidate.canAutoInstall ? "yes" : "no"}`);
    console.log(`  ${candidate.reason}`);
    if (candidate.url) console.log(`  ${candidate.url}`);
    if (candidate.installCommand) console.log(`  ${candidate.installCommand.join(" ")}`);
  }
}

function commandInstall(flags, positionals) {
  const candidateId = positionals[0];
  if (!candidateId) throw new Error("install requires <candidate-id>");
  const cache = loadCache();
  const candidate = cache.candidates.find((item) => item.id === candidateId);
  if (!candidate) {
    console.error(`Candidate not found in cache: ${candidateId}`);
    return 2;
  }
  if (!candidate.canAutoInstall) {
    console.error(`Refusing auto-install for ${candidate.name}: ${candidate.reason || "candidate did not pass safety threshold"}`);
    return 3;
  }
  if (!Array.isArray(candidate.installCommand)) {
    console.error(`Refusing auto-install for ${candidate.name}: no install command`);
    return 3;
  }
  console.log(candidate.installCommand.join(" "));
  if (flags["dry-run"]) return 0;
  const result = spawnSync(candidate.installCommand[0], candidate.installCommand.slice(1), {
    stdio: "inherit",
    shell: false,
  });
  return result.status || 0;
}

function commandHook(flags) {
  const task = flags.task;
  if (!task) throw new Error("hook requires --task");
  if (isTrivialTask(task)) {
    const payload = { task, shouldSuggest: false, message: "No skill suggestion for a trivial request." };
    console.log(flags.json ? JSON.stringify(payload, null, 2) : payload.message);
    return 0;
  }
  const originalOffline = flags.offline;
  flags.offline = flags.offline ?? true;
  const config = loadConfig();
  const cache = loadCache();
  const candidates = dedupeByName(cache.candidates
    .map((candidate) => scoreCandidate(candidate, task, config))
    .filter((candidate) => candidate.score >= 70)
    .sort((a, b) => b.score - a.score))
    .slice(0, 3);
  const payload = {
    task,
    shouldSuggest: candidates.length > 0,
    message: candidates.length > 0
      ? `Skill opportunity: ${candidates.map((item) => item.name).join(", ")}. Do you want me to add or use a skill to improve future work like this?`
      : "No strong cached skill suggestion for this request.",
    candidates,
  };
  flags.offline = originalOffline;
  console.log(flags.json ? JSON.stringify(payload, null, 2) : payload.message);
  return 0;
}

function main() {
  try {
    const { command, positionals, flags } = parseArgv(process.argv.slice(2));
    if (!command || flags.help || command === "help") {
      console.log(usage());
      return 0;
    }
    if (flags.version || command === "version") {
      console.log(VERSION);
      return 0;
    }
    if (command === "refresh") return commandRefresh(flags);
    if (command === "suggest") return commandSuggest(flags);
    if (command === "install") return commandInstall(flags, positionals);
    if (command === "hook") return commandHook(flags);
    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error("");
    console.error(usage());
    return 1;
  }
}

process.exitCode = main();
