# Auto Skills — Project Handoff

## Overview

**Project**: Auto Skills (`autoskills`) — plug-and-play agent intelligence CLI
**Repository**: `git@github.com:CodePuri/Auto-skills.git`
**Current branch**: `Codex/Autoskills/test`
**Target**: `main` (via PR)
**Version**: 1.0.0

## Project Structure

```
auto-skills/
├── src/
│   ├── cli.ts              # Main entry — command dispatch
│   ├── types.ts            # TypeScript interfaces (Candidate, Cache, Config, etc.)
│   ├── core/
│   │   ├── config.ts       # Configuration loading (user + default sources.json)
│   │   ├── cache.ts        # JSON cache read/write (home + temp fallback)
│   │   ├── scanner.ts      # SKILL.md discovery (bundle + local)
│   │   ├── ranker.ts       # Scoring, tokenize, dedup, merge, LLM rerank
│   │   ├── registrar.ts    # npx skills find + registry queries
│   │   └── installer.ts    # Safety-gated install execution
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
| `autoskills init` | First-run wizard — registers bundled skills, detects environment |
| `autoskills doctor` | Health check — Node, cache, paths, connectivity |
| `autoskills seed` | Register all 14 bundled skills into cache |
| `autoskills suggest --task "..."` | Full pipeline: scan → score → rank → display |
| `autoskills suggest --task "..." --json` | JSON output for programmatic/agent use |
| `autoskills suggest --task "..." --offline` | Cache only, skip remote |
| `autoskills refresh` | Scan all sources into cache |
| `autoskills refresh --network` | + inspect remote git sources |
| `autoskills install <id> [-y]` | Safety-gated install |
| `autoskills install <id> --dry-run` | Preview without executing |
| `autoskills hook --task "..." [--json]` | Agent trigger check |
| `autoskills list` | Table of all cached skills |
| `autoskills clean` | Clear cache |
| `autoskills config` | Show current configuration |

## Paths & Locations

| Item | Path |
|------|------|
| Repo root | `/Users/totem/Desktop/Code/auto-skills` |
| CLI binary | `dist/cli.js` (compiled) |
| Default config | `config/sources.json` |
| User config override | `~/.config/autoskills/sources.json` |
| Default cache | `~/.cache/autoskills/index.json` |
| Init marker | `~/.config/autoskills/.init` |
| Agent skills | `~/.codex/skills/`, `~/.agents/skills/` |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `AUTO_SKILLS_CACHE` | Override cache file path |
| `AUTO_SKILLS_OFFLINE=1` | Force offline mode for all commands |
| `AUTO_SKILLS_LLM_COMMAND` | External command for LLM-based reranking |
| `AUTO_SKILLS=true` | Tier-3 trigger — agent runs hook proactively |

## Weekly Automation

- **Job name**: `skill-aggregator-weekly-refresh`
- **Schedule**: Monday 09:00 Asia/Kolkata
- **Command**: `node dist/cli.js refresh --network`
- **Policy**: MUST NOT install skills — discovery only

## Active Skill Location

The active Codex skill is at: `/Users/totem/.codex/skills/auto-skills`
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
# Package name: autoskills
# Bin: autoskills, auto-skills
```

After publish: `npm install -g autoskills` → `autoskills suggest --task "..."`