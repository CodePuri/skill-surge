# Skill Surge — Project Handoff

## Overview

**Project**: Skill Surge (`skill-surge`) — plug-and-play agent intelligence CLI
**Repository**: `git@github.com:CodePuri/skill-surge.git`
**Current branch**: `main`
**Version**: 1.0.1

## Project Structure

```
skill-surge/
├── src/
│   ├── cli.ts              # Main entry — command dispatch
│   ├── types.ts            # TypeScript interfaces (Candidate, Cache, Config, etc.)
│   ├── core/
│   │   ├── config.ts       # Configuration loading (user + default sources.json)
│   │   ├── cache.ts        # JSON cache read/write (home + temp fallback)
│   │   ├── scanner.ts      # SKILL.md discovery (bundle + local)
│   │   ├── ranker.ts       # Scoring, tokenize, dedup, merge, LLM rerank
│   │   ├── registrar.ts    # npx skills find + registry queries
│   │   └── installer.ts     # Safety-gated install execution
│   └── ui/
│       ├── splash.ts       # Vaporwave ASCII logo, help menu, printCandidates
│       ├── box.ts          # boxen wrappers (info/success/warning/error/dashboard)
│       └── table.ts        # cli-table3 candidate table
├── skills/                 # 14 pre-bundled SKILL.md skills
│   ├── catalog.json        # Skill index by category
│   ├── frontend/           # react-patterns, css-mastery, tailwind-architecture
│   ├── backend/            # node-api-design, database-patterns, auth-systems
│   ├── qa/                 # testing-strategies, code-review-excellence
│   ├── design/             # ui-ux-patterns, accessibility-first
│   ├── architecture/       # system-design, microservices-patterns
│   └── planning/           # project-planning, technical-writing
├── config/
│   └── sources.json        # Default config (paths, gitSources, trustedOwners)
├── dist/                   # Compiled JS output
├── docs/                   # This directory
├── README.md               # GitHub landing page
└── SKILL.md                # Portable agent-facing skill file
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `skill-surge init` | First-run wizard — registers bundled skills, detects environment |
| `skill-surge doctor` | Health check — Node, cache, paths, connectivity |
| `skill-surge seed` | Register all 14 bundled skills into cache |
| `skill-surge suggest --task "..."` | Full pipeline: scan → score → rank → display |
| `skill-surge suggest --task "..." --json` | JSON output for programmatic/agent use |
| `skill-surge suggest --task "..." --offline` | Cache only, skip remote |
| `skill-surge refresh` | Scan all sources into cache |
| `skill-surge refresh --network` | + inspect remote git sources |
| `skill-surge install <id> [-y]` | Safety-gated install |
| `skill-surge install <id> --dry-run` | Preview without executing |
| `skill-surge hook --task "..." [--json]` | Agent trigger check |
| `skill-surge list` | Table of all cached skills |
| `skill-surge clean` | Clear cache |
| `skill-surge config` | Show current configuration |

## Paths & Locations

| Item | Path |
|------|------|
| Repo root | `/Users/totem/Desktop/Code/auto-skills` |
| CLI binary | `dist/cli.js` (compiled) |
| Default config | `config/sources.json` |
| User config override | `~/.config/skill-surge/sources.json` |
| Default cache | `~/.cache/skill-surge/index.json` |
| Init marker | `~/.config/skill-surge/.init` |
| Agent skills | `~/.codex/skills/`, `~/.agents/skills/` |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SKILL_SURGE_CACHE` | Override cache file path |
| `AUTO_SKILLS_OFFLINE=1` | Force offline mode for all commands |
| `AUTO_SKILLS_LLM_COMMAND` | External command for LLM-based reranking |
| `SKILL_SURGE=true` | Tier-3 trigger — agent runs hook proactively |

## Weekly Automation

- **Job name**: `skill-surge-weekly-refresh`
- **Schedule**: Monday 09:00 Asia/Kolkata
- **Command**: `node dist/cli.js refresh --network`
- **Policy**: MUST NOT install skills — discovery only

## Active Skill Location

The active Codex skill is at: `/Users/totem/.codex/skills/skill-surge`
This points to the `SKILL.md` at the repo root.

## Build & Test

```bash
# Build
npm run build

# Test all commands
node dist/cli.js --help
node dist/cli.js seed
node dist/cli.js doctor
node dist/cli.js suggest --task "react performance" --json --offline
node dist/cli.js hook --task "hello" --json
node dist/cli.js hook --task "build a responsive dashboard UI with accessibility" --json
node dist/cli.js list
node dist/cli.js clean
node dist/cli.js seed
```

## npm Publishing

```bash
npm publish --access public
# Package name: skill-surge
# Bin: skill-surge
```

After publish: `npm install -g skill-surge` → `skill-surge suggest --task "..."`
