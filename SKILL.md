---
name: skill-surge
description: Your agent's skill library. 29 curated skills auto-installed to Claude Code, OpenCode, Cline, and more. Use when building software, designing systems, writing tests, debugging, planning, or deploying. Triggers on: skill-surge, suggest, hook, install, scan, find skills.
---

# skill-surge

Your agent's skill library. 29 curated skills covering workflow, frontend, backend, database, architecture, design, QA, and planning.

## Installation

```bash
npm install -g skill-surge
skill-surge init
```

## Commands

| Command | Description |
|---------|-------------|
| `skill-surge init` | Detect agents, install all 29 skills |
| `skill-surge scan` | Audit project — show installed vs available |
| `skill-surge suggest --task "..."` | Find and rank skills for a task |
| `skill-surge install <skill>` | Install a skill to selected agents |
| `skill-surge list` | List all installed skills |
| `skill-surge hook --task "..."` | Agent trigger — returns JSON |
| `skill-surge config` | Show current configuration |

## Agent Integration

When the user starts a prompt with "skill-surge:" or references a skill by name:
1. Run: `skill-surge hook --task "<task>" --json`
2. Load detected skills from agent skill directories
3. Proceed with the task using skill guidance

## Skills Catalog (29 total)

**Top-repo skills** (installed via `npx skills add`):
- find-skills (1.4M installs) — discover skills from skills.sh
- grill-me (113.9K) — align requirements before building
- tdd, systematic-debugging, writing-plans, executing-plans, brainstorming, verification-before-completion, finishing-a-development-branch, requesting-code-review
- frontend-design (394K), ui-ux-pro-max (156.9K)
- vercel-react-best-practices (388.2K), next-best-practices (82.9K)
- supabase-postgres-best-practices (156.4K)
- deploy-to-vercel, skill-creator, docx

**Original skills** (bundled):
- node-api-design, auth-systems, database-patterns, error-handling, security-hardening
- react-patterns, testing-strategies, accessibility-first
- git-workflow, system-design, project-planning

## Source

- **npm**: [skill-surge](https://www.npmjs.com/package/skill-surge)
- **GitHub**: [github.com/CodePuri/skill-surge](https://github.com/CodePuri/skill-surge)
