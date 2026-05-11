# skill-surge — Agent Guide

## What is this?
A CLI that installs structured skill files (SKILL.md) into AI agent environments (Claude Code, Cline, OpenCode, Cursor, etc.). Skills give agents domain expertise — workflow patterns, design guidelines, testing strategies, etc.

## How to work on this project

```bash
npm install          # Install deps
npm run build        # TypeScript compile (src/ → dist/)
npm test             # Run test suite
npm start            # node dist/cli.js
```

## Source structure

```
src/
  cli.ts       Entry point + all command handlers
  search.ts    Skill catalog + keyword matching + ranking
  install.ts   Agent detection + install/uninstall + cache + config
  types.ts     Shared type interfaces
  ui/
    prompt.ts    Interactive terminal prompts
    terminal.ts  ANSI color helpers
    table.ts     Table renderer
    banner.ts    ASCII art / splash screen
tests/
  smoke.test.ts  76 tests covering all modules
skills/
  original/      11 bundled SKILL.md files (the product)
```

## Commands

| Command | Purpose |
|---------|---------|
| `skill-surge list` | Show all 29 skills grouped by category |
| `skill-surge add` | Interactive skill installer |
| `skill-surge suggest --task "..."` | Find relevant skills for a task |
| `skill-surge scan` | Audit project and show dashboard |
| `skill-surge init` | First-run setup |
| `skill-surge hook --task "..."` | Agent trigger (returns JSON) |
| `skill-surge config` | Show config |

## Adding a new original skill
1. Add entry to `src/search.ts` → `ALL_SKILLS` array
2. Create `skills/original/<name>/SKILL.md`
3. Run `npm test` to verify

## Key data flow
1. User runs `skill-surge suggest --task "build a login"`
2. `src/search.ts` tokenizes the task, scores each skill by keyword overlap
3. Top results displayed as ranked table
4. User runs `skill-surge add` to interactively select and install skills
5. `src/install.ts` copies/symlinks SKILL.md files into agent directories
