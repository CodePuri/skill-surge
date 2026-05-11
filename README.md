![Skill Surge — Vaporwave Terminal](https://raw.githubusercontent.com/CodePuri/skill-surge/main/.github/banner.svg)

<p align="center">

![npm version](https://img.shields.io/npm/v/skill-surge?color=%23FF6EC7&label=npm&style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D20-00FFFF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-7B68EE?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-00FFFF?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-39FF14?style=for-the-badge)

</p>

---

## █ OVERVIEW

**Skill Surge** is a plug-and-play CLI that transforms your AI agent into an expert across every domain. No manual skill hunting. No copy-paste. Just run it and your agent knows more.

It ships with **14 pre-bundled skills** covering frontend, backend, QA, design, architecture, and planning — and auto-discovers hundreds more from [skills.sh](https://skills.sh) and [skillsmp.com](https://skillsmp.com).

```
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  ▓  npm install -g skill-surge                  ▓
  ▓  npx skill-surge suggest --task "your task"     ▓
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

---

## ██ QUICK START

```bash
# Install globally (one-time)
npm install -g skill-surge

# First-run setup — detects environment, registers all skills
npx skill-surge init

# Discover what your agent should know
npx skill-surge suggest --task "build a React dashboard with Node.js and PostgreSQL"

# See everything that's available
npx skill-surge list

# Health check
npx skill-surge doctor
```

---

## ██ EXAMPLE OUTPUT

### Suggest
```
$ npx skill-surge suggest --task "react performance testing" --offline

     _   _   _ _____ ___    ____  _  _____ _     _     ____
    / \ | | | |_   _/ _ \  / ___|| |/ /_ _| |   | |   / ___|
   / _ \| | | | | || | | | \___ \| ' / | || |   | |   \___ \
  / ___ \ |_| | | || |_| |  ___) | . \ | || |___| |___ ___) |
 /_/   \_\___/  |_| \___/  |____/|_|\_\___|_____|_____|____/

█ Skills Found for: "react performance testing" █ 12 candidates

╭──────────────────────────────────────────────────────╮
│ react-patterns       █████████░░ 82   █ PRE-LOADED  │
│ │  React best practices, hooks, performance          │
│ │  reason: pre-bundled; 2 intent keyword matches     │
╰──────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────╮
│ testing-strategies   ███████░░░ 66   █ PRE-LOADED    │
│ │  Unit tests, integration, E2E, TDD approach        │
│ │  reason: pre-bundled; 1 intent keyword match      │
╰──────────────────────────────────────────────────────╯
```

### List
```
$ npx skill-surge list

┌──────────────────────────┬──────────┬──────────────┬────────────────────────┐
│ Skill                    │ Score    │ Status       │ Trust                  │
├──────────────────────────┼──────────┼──────────────┼────────────────────────┤
│ react-patterns           │ ████████ │ BUNDLED      │ bundled                │
│ node-api-design          │ ████████ │ BUNDLED      │ bundled                │
│ database-patterns        │ ████████ │ BUNDLED      │ bundled                │
│ testing-strategies       │ ████████ │ BUNDLED      │ bundled                │
│ ui-ux-patterns           │ ████████ │ BUNDLED      │ bundled                │
│ accessibility-first      │ ████████ │ BUNDLED      │ bundled                │
└──────────────────────────┴──────────┴──────────────┴────────────────────────┘

  ▸ 14 bundled  ▸ 0 local  ▸ 0 remote  ▸ Total: 14
```

### Doctor
```
$ npx skill-surge doctor

╔════════  AUTO SKILLS DASHBOARD  ═════════╗
║  Version         1.0.0                    ║
║  Node            v24.1.0                  ║
║  Platform        darwin                   ║
║  Bundled Skills  ✓ 6 categories           ║
║  Cache Entries   14                       ║
║  Codex Skills    ✓ exists                 ║
║  Agent Skills    ✓ exists                 ║
╚══════════════════════════════════════════╝

  ✓ All systems operational.
```

---

## ██ 14 BUNDLED SKILLS

Every skill ships with real, actionable content — not stubs.

| # | Skill | Category | What It Covers |
|---|-------|----------|---------------|
| 1 | `react-patterns` | Frontend | Hooks, state management, TanStack Query, performance |
| 2 | `css-mastery` | Frontend | Flexbox, Grid, animations, CUBE CSS, logical properties |
| 3 | `tailwind-architecture` | Frontend | Design tokens, component extraction, JIT, dark mode |
| 4 | `node-api-design` | Backend | REST, middleware, error handling, Zod validation, security |
| 5 | `database-patterns` | Backend | Indexing, migrations, PgBouncer, N+1 avoidance, Redis caching |
| 6 | `auth-systems` | Backend | JWT RS256, OAuth2/PKCE, RBAC, bcrypt, session rotation |
| 7 | `testing-strategies` | QA | Test pyramid, Vitest, Playwright, TDD, CI thresholds |
| 8 | `code-review-excellence` | QA | What to check, feedback patterns, critical/should/nit taxonomy |
| 9 | `ui-ux-patterns` | Design | Visual hierarchy, F/Z-pattern, design systems, WCAG color |
| 10 | `accessibility-first` | Design | WCAG AA, semantic HTML, ARIA, keyboard nav, reduced motion |
| 11 | `system-design` | Architecture | Scalability, CQRS, event sourcing, CDN, circuit breakers |
| 12 | `microservices-patterns` | Architecture | Bounded contexts, Saga, service mesh, blue-green, Observability |
| 13 | `project-planning` | Planning | MoSCoW, planning poker, burndown, risk matrix, tech debt 20% rule |
| 14 | `technical-writing` | Planning | README structure, JSDoc, Mermaid diagrams, Markdown best practices |

---

## ██ COMMANDS

| Command | Flags | Description |
|---------|-------|-------------|
| `skill-surge` | | Splash screen + full help menu |
| `npx skill-surge init` | | First-run setup wizard |
| `npx skill-surge doctor` | | System health check |
| `npx skill-surge seed` | | Register all 14 bundled skills into cache |
| `npx skill-surge suggest` | `--task "..."` `--json` `--offline` `--llm` | Discover, score, rank, and display skills |
| `npx skill-surge refresh` | `[--network]` `[--dry-run]` | Scan all sources and update cache |
| `npx skill-surge install` | `<id>` `[-y]` `[--dry-run]` | Safety-gated skill installation |
| `npx skill-surge hook` | `--task "..."` `[--json]` | Agent trigger check — returns JSON |
| `npx skill-surge list` | `[--json]` | Formatted table of all cached skills |
| `npx skill-surge clean` | | Clear all cached data |
| `npx skill-surge config` | | Show current configuration |
| `skill-surge` | `--help` | Show usage and examples |
| `skill-surge` | `--version` | Show version number |

---

## ██ HOW IT WORKS — THE PIPELINE

```
                    ┌───────────────────────────────────┐
                     │  skill-surge suggest --task "..."  │
                    └──────────────┬────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌────────────────┐
    │  BUNDLED    │         │   LOCAL     │         │    REMOTE      │
    │  skills/    │         │ ~/.codex/   │         │ npx skills find│
    │  14 skills  │         │ ~/.agents/  │         │ skills.sh      │
    │  (shipped)  │         │ (installed)│         │ skillsmp.com   │
    └──────┬──────┘         └──────┬──────┘         └───────┬────────┘
           │                     │                        │
           └─────────────────────┼────────────────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  SCORE EVERY CANDIDATE    │
                    │  ├── Intent match (+16)  │
                    │  ├── Trusted owner (+20) │
                    │  ├── Install count       │
                    │  └── Skill name (+12)    │
                    └────────────┬─────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  RANK (top 12)          │
                    │  ├── score ≥ 70 → AUTO │
                    │  ├── score ≥ 50 → REC   │
                    │  └── score < 50 → skip  │
                    └────────────┬─────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  DISPLAY (vaporwave UI)  │
                    │  └── OR JSON (--json)   │
                    └──────────────────────────┘
```

---

## ██ SCORING MODEL

Every candidate is scored 0–100 based on:

| Factor | Points |
|--------|--------|
| Pre-bundled with package | **50** base |
| Already installed locally | **42** base |
| Found via skills CLI | **25** base |
| Per keyword match in name/description | **+16** |
| From trusted owner | **+20** |
| ≥1,000 installs | **+18** |
| ≥100 installs | **+10** |
| >0 installs | **+4** |
| Skill name verbatim in task | **+12** |

---

## ██ SAFETY — INSTALL IS ALWAYS GUARDED

**Auto-install requires ALL of:**
1. Score ≥ **70**
2. **AND** either a trusted owner (vercel-labs, anthropics, microsoft, openai, codepuri) **OR** ≥**1,000** installs

**Hard blocks — always refused:**
- `refresh` and `hook` never install (read-only)
- Any install command not in the exact form: `npx skills add <repo> --skill <name> -g -a codex -y`
- Local skills (bundled/local are reference-only)
- Bypassing confirmation via environment variable

**Install flow:**
```
npx skill-surge install <id>         → BLOCKED (needs -y)
npx skill-surge install <id> -y     → BLOCKED (score too low or unknown source)
npx skill-surge install <id> -y     → PASSES threshold → INSTALLED
```

---

## ██ TRIGGER SYSTEM — 3 TIERS

Start your prompt with `skill-surge:` and your agent auto-discovers relevant skills.

```
USER: skill-surge: build a fullstack dashboard with React, Node, and PostgreSQL

AGENT: ✓ Detected "skill-surge:" prefix
       ✓ Running skill-surge hook --task "build a fullstack..."
       ✓ Found: react-patterns, node-api-design, database-patterns, system-design
       ✓ Frontloading 4 skills into context
       → Building the dashboard...
```

**Tier 1 — Prefix** (zero config): `skill-surge: ...`
**Tier 2 — Config** (`~/.config/skill-surge/trigger.json`): `{ "alwaysSuggest": true }`
**Tier 3 — Env** (`export AUTO_SKILLS=true`)

---

## ██ AGENT INTEGRATION

### For Codex / Claude / Cursor agents

Add this to your agent instructions:

```
When the user starts a prompt with "skill-surge:", immediately:
1. Extract the task after the colon
2. Run: skill-surge hook --task "<task>" --json
3. Present the top candidates (score ≥ 70)
4. If approved: skill-surge install <id> -y
5. Load the skill file(s) into context before working

When the user starts a prompt with "skill-surge:", immediately run:
  skill-surge hook --task "..." --json

Available commands:
  skill-surge init       # First-run setup
  skill-surge doctor     # Health check
  skill-surge seed       # Register 14 bundled skills
  skill-surge list       # Show all cached skills
  skill-surge clean      # Clear cache
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTO_SKILLS_CACHE` | Override cache file path |
| `AUTO_SKILLS_OFFLINE=1` | Force offline — skip `npx skills find` |
| `AUTO_SKILLS_LLM_COMMAND` | External LLM for semantic reranking |
| `AUTO_SKILLS=true` | Tier-3 trigger — proactive hook on every task |

---

## ██ CONFIGURATION

Default config: `config/sources.json` in the package

```json
{
  "localPaths": ["~/.codex/skills", "~/.agents/skills"],
  "gitSources": ["https://github.com/vercel-labs/skills"],
  "trustedOwners": ["vercel-labs", "anthropics", "microsoft", "openai", "codepuri"],
  "autoInstall": { "minimumScore": 70, "minimumInstallsForPublic": 1000 }
}
```

Override: create `~/.config/skill-surge/sources.json`

---

## ██ DEVELOPMENT

```bash
# Clone
git clone git@github.com:CodePuri/skill-surge.git
cd Auto-skills

# Install
npm install

# Build
npm run build

# Test
node dist/cli.js seed
node dist/cli.js doctor
node dist/cli.js suggest --task "react testing" --json --offline
node dist/cli.js hook --task "hello" --json
node dist/cli.js hook --task "build a dashboard" --json
```

### Project Structure

```
src/
  cli.ts              # Command dispatch, async entry point
  types.ts            # Candidate, Cache, Config interfaces
  core/
    config.ts         # Merge default + user config
    cache.ts          # JSON read/write with temp fallback
    scanner.ts        # SKILL.md discovery (bundle + local)
    ranker.ts         # Scoring, dedup, merge, LLM rerank
    registrar.ts      # npx skills find + registry queries
    installer.ts      # Validate + execute install
  ui/
    splash.ts         # ASCII art, help menu, printCandidates
    box.ts            # boxen wrappers (info/success/warning/error)
    table.ts          # cli-table3 candidate table
skills/
  catalog.json        # Index of all bundled skills
  frontend/           # react-patterns, css-mastery, tailwind-architecture
  backend/            # node-api-design, database-patterns, auth-systems
  qa/                 # testing-strategies, code-review-excellence
  design/             # ui-ux-patterns, accessibility-first
  architecture/       # system-design, microservices-patterns
  planning/           # project-planning, technical-writing
docs/
  HANDOFF.md          # Paths, commands, automation, build/test
  AUTOMATION.md       # Weekly refresh policy, 3-tier trigger, CI/CD
  SECURITY.md         # Trust thresholds, command validation, checklist
```

---

## ██ WEEKLY AUTOMATION

The automation runs every **Monday 09:00 Asia/Kolkata**:

```bash
node dist/cli.js refresh --network
```

- **Discovers only** — never installs anything
- Writes updated cache to `~/.cache/skill-surge/index.json`
- Logs output to `~/.logs/skill-surge-refresh.log`

See `docs/AUTOMATION.md` for cron setup, monitoring, and recovery.

---

## ██ DOCUMENTATION

| Doc | What It Covers |
|-----|---------------|
| `docs/HANDOFF.md` | Paths, commands, automation, build/test, npm publish |
| `docs/AUTOMATION.md` | Weekly refresh policy, 3-tier trigger, CI/CD pipeline |
| `docs/SECURITY.md` | Trust thresholds, command validation, safety checklist |

---

## ██ LINKS

<p align="center">

[![npm](https://img.shields.io/badge/npm-skill-surge-FF6EC7?style=for-the-badge)](https://www.npmjs.com/package/skill-surge)
[![GitHub](https://img.shields.io/badge/GitHub-Auto--Skills-00FFFF?style=for-the-badge)](https://github.com/CodePuri/skill-surge)
[![PRs](https://img.shields.io/badge/PRs-welcome-39FF14?style=for-the-badge)](https://github.com/CodePuri/skill-surge/pulls)

</p>

- **npm**: [skill-surge](https://www.npmjs.com/package/skill-surge)
- **GitHub**: [github.com/CodePuri/skill-surge](https://github.com/CodePuri/skill-surge)
- **Skills Registry**: [skills.sh](https://skills.sh)
- **Skills Marketplace**: [skillsmp.com](https://skillsmp.com)

---

<p align="center">

![Banner](https://raw.githubusercontent.com/CodePuri/skill-surge/main/.github/banner.svg)

**Plug-and-play agent intelligence.** Built with vaporwave aesthetics by [CodePuri](https://github.com/CodePuri).

MIT License © 2026

</p>