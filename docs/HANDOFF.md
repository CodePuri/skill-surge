# skill-surge — Project Handoff

## Overview

**Project**: skill-surge (`skill-surge`) — agent skill library CLI
**Repository**: `git@github.com:CodePuri/skill-surge.git`
**Version**: 2.0.0
**npm**: `npm install -g skill-surge`

## Project Structure

```
skill-surge/
├── src/
│   ├── cli.ts              # Main entry — command dispatch (7 commands)
│   ├── types.ts            # TypeScript interfaces (Agent, Skill, ScanResult, etc.)
│   ├── core/
│   │   ├── agent.ts        # 11-agent detection registry
│   │   ├── cache.ts        # JSON cache read/write (home + fallback)
│   │   ├── config.ts       # Configuration loading (default + user sources.json)
│   │   ├── catalog.ts      # ALL_SKILLS (29 entries), getSkillByName, getters
│   │   ├── auditor.ts      # detectProjectType, auditProject → ScanResult
│   │   ├── ranker.ts       # tokenize, isTrivialTask
│   │   ├── registrar.ts    # runSkillsFind, rankSkillsForTask
│   │   ├── scanner.ts      # scanLocalSkills, getSkillContent
│   │   └── installer.ts    # installSkillToAgents, installTopRepoSkills
│   └── ui/
│       ├── terminal.ts     # ANSI color system (C + T objects), box/divider/header
│       └── prompt.ts       # ask/confirm/select/selectMultiple via readline
├── skills/
│   └── original/           # 11 original SKILL.md files (bundled skills)
├── config/
│   └── sources.json        # Default config (preferredAgents, installMode, scope, trustedOwners)
├── dist/                   # Compiled JS output
├── docs/                   # This directory
├── README.md               # GitHub landing page
└── SKILL.md                # Agent-facing skill file
```

## CLI Commands (7 total)

| Command | Description |
|---------|-------------|
| `skill-surge init` | First-run wizard — detects agents, asks scope, installs all 29 skills |
| `skill-surge scan` | Audit project — detect project type, show installed vs available skills |
| `skill-surge suggest --task "..."` | Find and rank skills for a task |
| `skill-surge install <skill>` | Install a specific skill to selected agents |
| `skill-surge list` | List all installed skills across detected agents |
| `skill-surge hook --task "..."` | Agent trigger — returns JSON with detected skills |
| `skill-surge config` | Show current merged configuration |

## Agent Registry (11 agents)

Claude Code, OpenCode, Codex, Cline, Cursor, Windsurf, GitHub Copilot, Goose, Roo Code, Augment, Continue.

Detection uses `fs.existsSync(expandPath(globalPath))` for each agent's skills directory.

## Paths & Locations

| Item | Path |
|------|------|
| Repo root | `/Users/totem/Desktop/Code/auto-skills` |
| CLI binary | `dist/cli.js` (compiled) |
| Default config | `config/sources.json` |
| User config override | `~/.config/skill-surge/sources.json` |
| Default cache | `~/.cache/skill-surge/index.json` |
| Agent skills (global) | `~/.claude/skills/`, `~/.config/opencode/skills/`, etc. |
| Agent skills (project) | `./.claude/skills/`, `./.agents/skills/`, etc. |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SKILL_SURGE_CACHE` | Override cache file path |

## Skill Installation Flow

**init** command:
1. Detect agents via `detectAgents()`
2. Ask scope: global / project / both
3. Run `installTopRepoSkills()` — `npx skills add` for each top-repo
4. Run `installSkillToAgents()` for each original skill (copy from `skills/original/`)

**install** command:
1. Validate skill name against `ALL_SKILLS` catalog
2. Ask agent selection and scope
3. If `source === 'top-repo'` → `npx skills add <repo> --skill <name> -g`
4. If `source === 'original'` → `fs.copyFileSync` from bundled `skills/original/<name>/SKILL.md`

## Build & Test

```bash
npm run build
node dist/cli.js --help
node dist/cli.js hook --task "hello"
node dist/cli.js hook --task "build a login system"
node dist/cli.js suggest --task "react performance" --offline
node dist/cli.js suggest --task "design a database schema"
node dist/cli.js list
node dist/cli.js config

npm test
```

## npm Publishing

```bash
npm publish --access public
```