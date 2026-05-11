# Architecture

## Overview

skill-surge is a CLI tool that discovers, ranks, and installs SKILL.md files into AI agent environments. The SKILL.md files are the product — the CLI is just the delivery mechanism.

## Module Map

```
cli.ts ─────────────────────────────────────────────────
  │                                                      │
  ├── init()    → call install.ts (detect + install)    │
  ├── add()     → call prompt.ts + install.ts           │
  ├── suggest() → call search.ts (tokenize + rank)      │
  ├── list()    → call install.ts (scan agents)         │
  ├── scan()    → call install.ts (audit project)       │
  ├── hook()    → call search.ts + return JSON          │
  └── config()  → call install.ts (load config)         │
                                                        │
src/search.ts ─── ALL_SKILLS catalog + tokenize + rank  │
src/install.ts ─ agent detection + file ops + cache     │
src/types.ts ──── shared TypeScript interfaces           │
src/ui/ ───────── prompt/terminal/table/banner helpers   │
skills/original/ ─ 11 bundled SKILL.md files             │
```

## Data Flow

### suggest flow
```
User input → tokenize() → compare against ALL_SKILLS 
  → score by keyword overlap + installs + source 
  → sort descending → display top candidates
```

### add flow
```
User selects skills → selects agents → selects scope
  → for each skill:
      if top-repo: spawn npx skills add
      if original: copy/symlink from skills/original/<name>/SKILL.md
  → update cache → display summary
```

### install flow
```
installSkillToAgents(name, agents, scope, options)
  → find skill in catalog
  → for each agent × scope:
      mkdir target dir
      symlink or copy SKILL.md
      update ~/.cache/skill-surge/index.json
```

## Key Design Decisions

1. **SKILL.md files are the product** — the CLI is delivery. Files live in `skills/original/<name>/SKILL.md`.
2. **Two skill sources** — `original` (bundled, shipped with package) and `top-repo` (installed via npx skills.sh).
3. **No AI/API keys required** — pure keyword matching for search. Extensible to LLM later.
4. **Cache is optional** — `~/.cache/skill-surge/index.json` tracks install state but is not required to function.
5. **Agent-agnostic** — supports 11 agent types. Adding a new agent is one entry in the registry.
