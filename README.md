# skill-surge

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

**skill-surge** is a plug-and-play CLI that installs structured skill files into your AI agents. No manual hunting. No copy-paste. One command and your agent gains domain expertise across every domain.

It ships with **29 curated skills** (18 from the skills.sh ecosystem + 11 original) covering workflow, frontend, backend, database, design, security, DevOps, QA, architecture, and planning — and can install skills from any [skills.sh](https://skills.sh) repository.

```
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  ▓  npm install -g skill-surge                 ▓
  ▓  skill-surge suggest --task "your task"    ▓
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

---

## ██ QUICK START

```bash
# Install globally (one-time)
npm install -g skill-surge

# First-run setup — detects agents, installs 15 essential skills
skill-surge init

# Discover skills for your task
skill-surge suggest --task "build a React dashboard with Node.js and PostgreSQL"

# Browse everything available
skill-surge list

# Health check
skill-surge scan
```

---

## ██ EXAMPLE OUTPUT

### Suggest
```
$ skill-surge suggest --task "react performance testing"

◇  Analyzing task...

  Top matches:
    [1] ● vercel-react-best-practices — 1 keyword match; 388,200 installs
    [2] ● react-patterns       — 1 keyword match; installed locally

Install one? [1-3 / Enter to skip]: 1

  Installing vercel-react-best-practices...
  ✓ Installed vercel-react-best-practices to 7 agent(s).
```

### List
```
$ skill-surge list

██ skill-surge Catalog ██

What are you building?
  ▸ Workflow & Planning
    Frontend / UI
    Backend / API
    Database
    Security
    DevOps / Deploy
    Design / UX
    QA / Testing
    Architecture
    All Skills (29 total)
```

### Scan
```
$ skill-surge scan

╔════════  SKILL-SURGE DASHBOARD  ═════════╗
║  Version              2.2.2           ✓  ║
║  Node                 v24.1.0         ✓  ║
║  Platform             darwin          ✓  ║
║  Skills Installed     82              ✓  ║
║  Skills Available     29              ✓  ║
╚══════════════════════════════════════════╝

  ✓ All systems operational.
```

---

## ██ 29 SKILLS

Every skill ships with real, actionable content — not stubs.

### Workflow & Planning
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `brainstorming` | Structured ideation, problem decomposition frameworks |
| 2 | `writing-plans` | Implementation plans before touching code |
| 3 | `executing-plans` | Step-by-step execution with checkpoints |
| 4 | `systematic-debugging` | Hypothesis-driven debugging loop |
| 5 | `tdd` | Red-green-refactor test-driven development |
| 6 | `verification-before-completion` | Evidence pass before marking complete |
| 7 | `finishing-a-development-branch` | Branch close checklist |
| 8 | `requesting-code-review` | Self-review, PR prep, test coverage |
| 9 | `grill-me` | Relentless interview about plans and designs |
| 10 | `git-workflow` | Branching, conventional commits, hooks |
| 11 | `project-planning` | Agile planning, user stories, sprints |

### Frontend / UI
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `vercel-react-best-practices` | 69 rules: React, Next.js, performance |
| 2 | `next-best-practices` | App Router, RSC, async APIs, metadata |
| 3 | `react-patterns` | Hooks, TanStack Query, component patterns |

### Backend / API
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `node-api-design` | REST APIs, middleware, Zod validation |
| 2 | `auth-systems` | JWT RS256, OAuth2/PKCE, RBAC, bcrypt |
| 3 | `error-handling` | Typed errors, centralized handlers, Sentry |

### Database
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `supabase-postgres-best-practices` | Schema design, RLS, indexing, migrations |
| 2 | `database-patterns` | Indexing, connection pooling, Redis caching |

### Design / UX
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `frontend-design` | Universal frontend design guidelines |
| 2 | `ui-ux-pro-max` | 50+ styles, 161 palettes, 57 font pairings |
| 3 | `accessibility-first` | WCAG 2.1 AA, semantic HTML, ARIA |

### Security
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `security-hardening` | Helmet, CORS, rate limiting, CSP |

### DevOps / Deploy
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `deploy-to-vercel` | Deploy apps with preview URLs, aliases |

### QA / Testing
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `testing-strategies` | Unit, integration, E2E with Playwright |

### Architecture
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `system-design` | Caching, queues, microservices, observability |

### Documentation
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `docx` | Generate rich Word documents |

### Meta
| # | Skill | What It Covers |
|---|-------|---------------|
| 1 | `find-skills` | Discover skills from skills.sh in-session |
| 2 | `skill-creator` | Create, test, publish new skills |

---

## ██ COMMANDS

| Command | Flags | Description |
|---------|-------|-------------|
| `skill-surge` | | Splash screen with version and commands |
| `skill-surge init` | | First-run setup — detect agents, scope, install 15 essential skills |
| `skill-surge add` | `[<skill>]` `[<repo>]` | Interactive keyboard-driven skill picker with Select All |
| `skill-surge suggest` | `--task "..."` | Top 3 ranked matches with one-key auto-install |
| `skill-surge list` | | Category-first guided discovery — pick a category, browse skills |
| `skill-surge scan` | | Dashboard: installed vs available, project recommendations |
| `skill-surge hook` | `--task "..."` | Agent trigger check — returns JSON |
| `skill-surge config` | | Show current configuration |
| `skill-surge` | `--help` | Show usage and examples |
| `skill-surge` | `--version` | Show version number |

---

## ██ HOW IT WORKS — THE PIPELINE

```
                    ┌─────────────────────────────────────────┐
                    │  skill-surge suggest --task "..."       │
                    └──────────────────┬──────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
    ┌─────────────┐             ┌─────────────┐             ┌──────────────┐
    │  BUNDLED    │             │  SKILLS.SH  │             │    LOCAL     │
    │  skills/    │             │  ALL_SKILLS │             │ installed on │
    │  11 skills  │             │  18 skills  │             │  agent paths │
    │  (original) │             │  (top-repo) │             │              │
    └──────┬──────┘             └──────┬──────┘             └──────┬───────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   3-PHASE AGENT DETECTION        │
                     │  ├── Phase 1: Known paths        │
                     │  ├── Phase 2: ~/.config/*/skills/│
                     │  └── Phase 2b: ~/.{*}/skills/    │
                     └──────────────┬───────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   SCORE EVERY CANDIDATE (0-100)  │
                     │  ├── Keyword overlap × 20        │
                     │  ├── Pre-bundled source +40      │
                     │  ├── Already installed +15       │
                     │  ├── Install count bonus         │
                     │  └── Trusted owner               │
                     └──────────────┬───────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   RANK (top 3)                   │
                     │  ├── [1] best match              │
                     │  ├── [2] second best             │
                     │  └── [3] third best              │
                     └──────────────┬───────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   INSTALL                        │
                     │  ├── Symlink or copy             │
                     │  ├── Global or project scope     │
                     │  └── To 1+ detected agents       │
                     └──────────────────────────────────┘
```

---

## ██ SCORING MODEL

Every candidate is scored 0–100 based on:

| Factor | Points |
|--------|--------|
| Pre-bundled with package | **40** base |
| Already installed locally | **15** bonus |
| Per keyword match in name/description | **+20** |
| From trusted source (top-repo) | **+30** |
| ≥100,000 installs | **+25** |
| ≥10,000 installs | **+10** |
| >0 installs | **+5** |

---

## ██ SAFETY — INSTALL IS ALWAYS GUARDED

**Install requires:**
1. Security table shown before every install (Gen AI risk, Socket alerts, Snyk status)
2. One-key Y/n confirmation before any files change
3. Scope selection (global or project) before install

**Hard blocks — always refused:**
- `hook` and `scan` never install (read-only)
- `suggest` only installs when user explicitly selects 1-3
- Direct `add <skill>` requires the skill to exist in catalog

**Install flow:**
```
skill-surge add                     → Interactive picker → scope → method → confirm → install
skill-surge add <skill-name>        → Direct install to all agents
skill-surge add <repo>              → Delegates to npx skills add
skill-surge suggest --task "..."    → Show top 3 → pick one → auto-install
```

---

## ██ INTERACTIVE INSTALL FLOW

skill-surge's `add` command guides you through every step:

```
Step 1: Detect agents ──── 3-phase scan finds all agent directories
Step 2: Select skills ──── Keyboard-driven picker with checkboxes
                           ▸ Space: toggle  a: select all  ↑↓: move  Enter: done
Step 3: Pick agents ────── Choose which agents receive skills
Step 4: Choose scope ───── Global or Project
Step 5: Choose method ──── Symlink (recommended) or Copy
Step 6: Review summary ─── Shows install paths + security assessment
Step 7: Confirm ────────── One-key Y/n to proceed
Step 8: Done! ──────────── Skills installed, ready to use
```

---

## ██ AGENT DETECTION — 3 TYPES

skill-surge dynamically detects AI agents using a 3-phase scan:

| Phase | What It Checks | Example |
|-------|---------------|---------|
| **Phase 1** | 11 known agent config paths | `~/.claude/skills/`, `~/.config/opencode/skills/` |
| **Phase 2** | Globs under `~/.config/*/skills/` | Catches Goose, future agents |
| **Phase 2b** | Any `~/.{something}/skills/` pattern | Catches any agent following convention |
| **Phase 3** | Fallback: creates `~/.agents/skills/` | Guarantees a target exists |

**Detected out of the box:** Claude Code, OpenCode, Cline, Codex, Cursor, Windsurf, GitHub Copilot, Goose, Roo Code, Augment, Continue

---

## ██ AGENT INTEGRATION

### For Claude Code / OpenCode / Cline / Codex agents

Add this to your agent instructions:

```
When the user runs "skill-surge hook --task <task>", install detected skills.

Available commands:
  skill-surge init       # First-run setup
  skill-surge add        # Interactive skill installer
  skill-surge list       # Browse skills by category
  skill-surge scan       # Audit project
  skill-surge suggest    # Find skills for a task
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `SKILL_SURGE_CACHE` | Override cache file path |
| `CLAUDE_CODE=true` | Auto-detect Claude Code agent |
| `CLINE=true` | Auto-detect Cline agent |
| `OPENCODE=true` | Auto-detect OpenCode agent |

---

## ██ CONFIGURATION

Default config: `config/sources.json` in the package

```json
{
  "preferredAgents": ["claude-code", "opencode", "cline"],
  "installMode": "copy",
  "scope": "global",
  "trustedOwners": ["vercel-labs", "anthropics", "microsoft", "codepuri"],
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
node dist/cli.js suggest --task "react testing"
node dist/cli.js scan
node dist/cli.js hook --task "build a dashboard"
npm test
```

### Project Structure

```
src/
  cli.ts              # Command dispatch, async handlers
  search.ts           # Skill catalog (ALL_SKILLS), tokenizer, scorer
  install.ts          # 3-phase agent detection, install/uninstall, cache
  types.ts            # Agent, Skill, Config, InstallResult interfaces
  ui/
    prompt.ts         # Keyboard-driven selectors (arrows, space, a, enter)
    terminal.ts       # ANSI color constants, box, divider helpers
    banner.ts         # ASCII logo, success/error banners, info boxes
    table.ts          # Candidate table, installed table, dashboard
    spinner.ts        # Terminal spinner (start/stop/stopWithSuccess)
tests/
  smoke.test.ts       # 76 tests covering all modules
```

---

## ██ DOCUMENTATION

| Doc | What It Covers |
|-----|---------------|
| `ARCHITECTURE.md` | Module design, data flow, command hierarchy |
| `CONTRIBUTING.md` | Adding skills, development workflow, PR guidelines |
| `CHANGELOG.md` | Release history and version notes |
| `CLAUDE.md` | Agent instructions for working on this project |

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

![Banner](https://raw.githubusercontent.com/CodePuri/skill-surge/main/.github/banner.svg)

**Skill up your AI agents.** Built with vaporwave aesthetics by [CodePuri](https://github.com/CodePuri).

MIT License © 2026

</p>
