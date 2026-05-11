![skill-surge — Vaporwave Terminal](https://raw.githubusercontent.com/CodePuri/skill-surge/main/.github/banner.svg)

<p align="center">

![npm version](https://img.shields.io/npm/v/skill-surge?color=%23FF6EC7&label=npm&style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D20-00FFFF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-7B68EE?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-00FFFF?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-39FF14?style=for-the-badge)

</p>

---

## █ OVERVIEW

**skill-surge** is a plug-and-play CLI that transforms your AI agent into an expert across every domain. No manual skill hunting. No copy-paste. Just run it and your agent knows more.

It ships with **29 curated skills** covering workflow, frontend, backend, QA, design, architecture, and planning — and auto-discovers hundreds more from [skills.sh](https://skills.sh).

```
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  ▓  npm install -g skill-surge                ▓
  ▓  skill-surge add                          ▓
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

---

## ██ QUICK START

```bash
# Install globally (one-time)
npm install -g skill-surge

# First-run setup — detects environment, registers all skills
skill-surge init

# Interactive skill installation (like skills.sh)
skill-surge add

# Discover what your agent should know
skill-surge suggest --task "build a React dashboard with Node.js and PostgreSQL"

# See everything that's available
skill-surge list

# Audit your project
skill-surge scan
```

---

## ██ EXAMPLE OUTPUT

### Add (Interactive)
```
$ skill-surge add

███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝

◇  Source: https://github.com/CodePuri/skill-surge-skills.git

◇  Found 29 skills

◇  Select skills to install (space to toggle)
  ☑ node-api-design
  ☑ auth-systems
  ☑ database-patterns
  ...
  
◇  4 agents
◇  Which agents do you want to install to?
  ☑ Claude Code
  ☑ Cline
  ☑ OpenCode
  
◇  Installation scope
  Global
  
◇  Installation method
  Symlink (Recommended)

◇  Proceed with installation?
  Yes

◇  Installation complete

└  Done!  Review skills before use; they run with full agent permissions.
```

### Suggest
```
$ skill-surge suggest --task "react performance testing"

██ Skills Found for: "react performance testing" █

┌─────────────────────────────┬──────────┬─────────────────────────────┐
│ Skill                       │ Score    │ Reason                      │
├─────────────────────────────┼──────────┼─────────────────────────────┤
│ vercel-react-best-practices │ █████████░░ 95 │ 2 intent keyword matches │
│ react-patterns              │ ████████░░ 80 │ pre-bundled; 1 match      │
│ testing-strategies          │ ███████░░░ 66 │ 1 intent keyword match   │
└─────────────────────────────┴──────────┴─────────────────────────────┘
```

### List
```
$ skill-surge list

██ Installed Skills █

┌─────────────────────────────┬────────────────┬──────────────────────┐
│ Skill                       │ Category       │ Status                │
├─────────────────────────────┼────────────────┼──────────────────────┤
│ node-api-design             │ backend        │ INSTALLED             │
│ auth-systems                │ backend        │ INSTALLED             │
│ database-patterns           │ database       │ INSTALLED             │
│ react-patterns              │ frontend       │ INSTALLED             │
└─────────────────────────────┴────────────────┴──────────────────────┘

▸ 11 bundled  ▸ 18 remote  ▸ Total: 29
```

### Scan
```
$ skill-surge scan

╔════════  SKILL-SURGE DASHBOARD  ═════════╗
║  Version         2.0.1                    ║
║  Node            v20.x.x                  ║
║  Platform        darwin                   ║
║  Skills Installed 4                       ║
║  Skills Available 29                      ║
╚══════════════════════════════════════════╝
```

---

## ██ 29 CURATED SKILLS

Every skill ships with real, actionable content — not stubs.

| # | Skill | Category | What It Covers | Installs |
|---|-------|----------|---------------|----------|
| 1 | `find-skills` | meta | Discover skills from skills.sh | 1.4M |
| 2 | `grill-me` | workflow | Interview yourself until requirements are clear | 113K |
| 3 | `tdd` | workflow | Red → Green → Refactor loop | 77K |
| 4 | `systematic-debugging` | workflow | Hypothesis → test → verify cycle | 89K |
| 5 | `writing-plans` | workflow | Structured implementation plans | 89K |
| 6 | `executing-plans` | workflow | Step-by-step with checkpoints | 72K |
| 7 | `brainstorming` | workflow | Structured ideation | 149K |
| 8 | `verification-before-completion` | workflow | Force verification before completion | 64K |
| 9 | `finishing-a-development-branch` | workflow | Branch close checklist | 57K |
| 10 | `requesting-code-review` | workflow | Prepare code for review | 78K |
| 11 | `vercel-react-best-practices` | frontend | React + Next.js 69 rules | 388K |
| 12 | `next-best-practices` | frontend | Next.js App Router | 82K |
| 13 | `react-patterns` | frontend | Hooks, TanStack Query, performance | — |
| 14 | `frontend-design` | design | Universal frontend design | 394K |
| 15 | `ui-ux-pro-max` | design | Visual hierarchy, design systems | 156K |
| 16 | `accessibility-first` | design | WCAG AA, ARIA, keyboard nav | — |
| 17 | `node-api-design` | backend | REST, middleware, validation | — |
| 18 | `auth-systems` | backend | JWT, OAuth2, RBAC, bcrypt | — |
| 19 | `error-handling` | backend | Typed errors, centralized handlers | — |
| 20 | `security-hardening` | backend | Helmet, CORS, rate limiting | — |
| 21 | `deploy-to-vercel` | devops | Preview URLs, production deploy | 47K |
| 22 | `supabase-postgres-best-practices` | database | Schema, RLS, indexing | 156K |
| 23 | `database-patterns` | database | Indexing, migrations, Redis | — |
| 24 | `system-design` | architecture | Scalability, caching, queues | — |
| 25 | `testing-strategies` | qa | Unit, integration, E2E, Playwright | — |
| 26 | `project-planning` | planning | Agile, user stories, sprints | — |
| 27 | `skill-creator` | meta | Create and publish new skills | 197K |
| 28 | `docx` | docs | Generate Word documents | 83K |
| 29 | `git-workflow` | workflow | Branching, commits, PRs | — |

---

## ██ COMMANDS

| Command | Flags | Description |
|---------|-------|-------------|
| `skill-surge` | | Splash screen with ASCII banner |
| `skill-surge init` | | First-run setup wizard |
| `skill-surge add` | `[repo]` | Interactive skill installation |
| `skill-surge scan` | | Project audit with dashboard |
| `skill-surge suggest` | `--task "..."` `--offline` | Find skills for a task |
| `skill-surge list` | | Table of installed skills |
| `skill-surge hook` | `--task "..."` | Agent trigger — returns JSON |
| `skill-surge config` | | Show current configuration |
| `skill-surge` | `--help` | Show usage and examples |
| `skill-surge` | `--version` | Show version number |

---

## ██ HOW IT WORKS — THE PIPELINE

```
                    ┌───────────────────────────────────┐
                    │  skill-surge add                  │
                    └──────────────┬────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌────────────┐
    │  BUNDLED    │         │   LOCAL    │         │   REMOTE   │
    │  skills/    │         │ ~/.agents/  │         │npx skills  │
    │  29 skills  │         │ (installed)│         │ find       │
    └──────┬──────┘         └──────┬──────┘         └─────┬──────┘
           │                     │                        │
           └─────────────────────┼────────────────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  INTERACTIVE UI           │
                    │  ├── Skill selection     │
                    │  ├── Agent selection     │
                    │  ├── Scope selection     │
                    │  └── Confirmation        │
                    └────────────┬─────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  INSTALL                  │
                    │  ├── Symlink or Copy     │
                    │  ├── Global or Project   │
                    │  └── Per-agent paths     │
                    └────────────┬─────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  SUCCESS                 │
                    │  └── Summary box         │
                    └──────────────────────────┘
```

---

## ██ SCORING MODEL (for suggest/hook)

Every candidate is scored 0–100 based on:

| Factor | Points |
|--------|--------|
| Original (bundled) | **40** base |
| Top-repo | **30** base |
| Per keyword match | **+20** |
| Already installed | **+15** |
| ≥100,000 installs | **+25** |
| ≥10,000 installs | **+10** |

---

## ██ AGENT INTEGRATION

### For Claude Code, Cline, OpenCode, Cursor

Add this to your agent instructions:

```
When the user starts a prompt with "skill-surge:" or references skills:
1. Run: skill-surge hook --task "<task>"
2. Load the detected SKILL.md files into context
3. Proceed with the task using skill guidance
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `SKILL_SURGE_CACHE` | Override cache file path |

---

## ██ CONFIGURATION

Default config: `config/sources.json` in the package

```json
{
  "preferredAgents": ["claude-code", "opencode", "cline"],
  "installMode": "copy",
  "scope": "global",
  "trustedOwners": ["vercel-labs", "anthropics", "mattpocock", "obra", "supabase", "codepuri"],
  "customSources": []
}
```

Override: create `~/.config/skill-surge/sources.json`

---

## ██ DEVELOPMENT

```bash
# Clone
git clone git@github.com:CodePuri/skill-surge.git
cd skill-surge

# Install
npm install

# Build
npm run build

# Test
npm test
node dist/cli.js init
node dist/cli.js add
node dist/cli.js list
node dist/cli.js suggest --task "react testing"
node dist/cli.js hook --task "build a dashboard"
```

---

## ██ SUPPORTED AGENTS

Claude Code, OpenCode, Cline, Codex, Cursor, Windsurf, GitHub Copilot, Goose, Roo Code, Augment, Continue.

---

## ██ DOCUMENTATION

| Doc | What It Covers |
|-----|---------------|
| `docs/HANDOFF.md` | Paths, commands, automation, build/test |
| `docs/AUTOMATION.md` | Weekly refresh policy, trigger system |
| `docs/SECURITY.md` | Trust thresholds, safety checklist |

---

## ██ LINKS

<p align="center">

[![npm](https://img.shields.io/badge/npm-skill--surge-FF6EC7?style=for-the-badge)](https://www.npmjs.com/package/skill-surge)
[![GitHub](https://img.shields.io/badge/GitHub-skill--surge-00FFFF?style=for-the-badge)](https://github.com/CodePuri/skill-surge)
[![PRs](https://img.shields.io/badge/PRs-welcome-39FF14?style=for-the-badge)](https://github.com/CodePuri/skill-surge/pulls)

</p>

- **npm**: [skill-surge](https://www.npmjs.com/package/skill-surge)
- **GitHub**: [github.com/CodePuri/skill-surge](https://github.com/CodePuri/skill-surge)
- **Skills Registry**: [skills.sh](https://skills.sh)

---

<p align="center">

**Plug-and-play agent intelligence.** Built with terminal aesthetics by [CodePuri](https://github.com/CodePuri).

MIT License © 2026

</p>