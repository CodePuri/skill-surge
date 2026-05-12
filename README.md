# skill-surge

![skill-surge Banner](https://raw.githubusercontent.com/CodePuri/skill-surge/main/.github/banner.svg?refresh=1)

<p align="center">

![npm version](https://img.shields.io/npm/v/skill-surge?color=%23FF6EC7&label=npm&style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D20-00FFFF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-7B68EE?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-00FFFF?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-39FF14?style=for-the-badge)

</p>

---

## █ WHAT IS SKILL-SURGE

**skill-surge** installs structured skill files (SKILL.md) into your AI agents. One command and your agent gains domain expertise — workflow patterns, design guidelines, testing strategies, deployment playbooks, and more.

It ships with **29 curated skills** (18 from the skills.sh ecosystem + 11 original) and can install from any skills.sh repository. Zero dependencies.

```
  ╔══════════════════════════════════════════════════════════╗
  ║  npm install -g skill-surge                              ║
  ║  skill-surge init             # 15 essential skills      ║
  ║  skill-surge suggest --task "your task"  # Top 3 picks   ║
  ║  skill-surge add              # Interactive selector     ║
  ╚══════════════════════════════════════════════════════════╝
```

---

## ██ QUICK START

```bash
# Install globally (one-time)
npm install -g skill-surge

# First-run setup — detects agents, installs 15 essential skills
skill-surge init

# Find skills for your task
skill-surge suggest --task "build a React dashboard with Node.js"

# Browse + install interactively
skill-surge add
```

---

## ██ EXAMPLE OUTPUT

### Suggest
```
$ skill-surge suggest --task "build a login system"

◇  Analyzing task...

  Top matches:
    [1] ● auth-systems       — 1 keyword match; installed locally
    [2] ○ node-api-design    — 1 keyword match; 177,900 installs
    [3] ○ database-patterns  — Schema design, migrations, indexing

Install one? [1-3 / Enter to skip]: 1

  Installing auth-systems...
  ✓ Installed auth-systems to 7 agent(s).
```

### Add — Interactive Selector
```
◇  Select skills to install (space to toggle)

  ▸ ● ☐ Select All (29 skills)
    ○ grill-me
    ○ tdd
    ○ systematic-debugging
    ○ writing-plans
    ○ executing-plans
    Space: toggle  a: select all  ↑↓: move  Enter: done  q: quit
```

### Scan — Dashboard
```
$ skill-surge scan

╔════════  SKILL-SURGE DASHBOARD  ═════════╗
║  Version              2.2.2           ✓  ║
║  Node                 v24.1.0         ✓  ║
║  Platform             darwin          ✓  ║
║  Skills Installed     82              ✓  ║
║  Skills Available     29              ✓  ║
╚══════════════════════════════════════════╝

┌─  Installed Skills──────────────────────────────────────┐
│ ✓ accessibility-first  in /Users/totem/.claude           │
│ ✓ auth-systems         in /Users/totem/.claude           │
│ ✓ node-api-design      in /Users/totem/.claude           │
└─────────────────────────────────────────────────────────┘
```

---

## ██ 29 SKILLS

Skill-surge ships with **29 real, actionable skills** — not stubs.

### Workflow & Planning (11)
| Skill | What It Covers |
|-------|---------------|
| `brainstorming` | Structured ideation, problem decomposition frameworks |
| `writing-plans` | Implementation plans before touching code |
| `executing-plans` | Step-by-step execution with checkpoints |
| `systematic-debugging` | Hypothesis-driven debugging loop |
| `tdd` | Red-green-refactor test-driven development |
| `verification-before-completion` | Evidence pass before marking complete |
| `finishing-a-development-branch` | Branch close checklist |
| `requesting-code-review` | Self-review, PR prep, test coverage |
| `grill-me` | Relentless interview about plans and designs |
| `git-workflow` | Branching, conventional commits, hooks |
| `project-planning` | Agile planning, user stories, sprints |

### Frontend / UI (3)
| Skill | What It Covers |
|-------|---------------|
| `vercel-react-best-practices` | 69 rules: React, Next.js, performance |
| `next-best-practices` | App Router, RSC, async APIs, metadata |
| `react-patterns` | Hooks, TanStack Query, component patterns |

### Backend / API (3)
| Skill | What It Covers |
|-------|---------------|
| `node-api-design` | REST APIs, middleware, Zod validation |
| `auth-systems` | JWT RS256, OAuth2/PKCE, RBAC, bcrypt |
| `error-handling` | Typed errors, centralized handlers, Sentry |

### Database (2)
| Skill | What It Covers |
|-------|---------------|
| `supabase-postgres-best-practices` | Schema design, RLS, indexing, migrations |
| `database-patterns` | Indexing, connection pooling, Redis caching |

### Design / UX (3)
| Skill | What It Covers |
|-------|---------------|
| `frontend-design` | Universal frontend design guidelines |
| `ui-ux-pro-max` | 50+ styles, 161 palettes, 57 font pairings |
| `accessibility-first` | WCAG 2.1 AA, semantic HTML, ARIA |

### Security (1)
| Skill | What It Covers |
|-------|---------------|
| `security-hardening` | Helmet, CORS, rate limiting, CSP |

### DevOps / Deploy (1)
| Skill | What It Covers |
|-------|---------------|
| `deploy-to-vercel` | Deploy apps with preview URLs, aliases |

### QA / Testing (1)
| Skill | What It Covers |
|-------|---------------|
| `testing-strategies` | Unit, integration, E2E with Playwright |

### Architecture (1)
| Skill | What It Covers |
|-------|---------------|
| `system-design` | Caching, queues, microservices, observability |

### Documentation (1)
| Skill | What It Covers |
|-------|---------------|
| `docx` | Generate rich Word documents |

### Meta (2)
| Skill | What It Covers |
|-------|---------------|
| `find-skills` | Discover skills from skills.sh in-session |
| `skill-creator` | Create, test, publish new skills |

---

## ██ COMMANDS

| Command | Description |
|---------|-------------|
| `skill-surge` | Splash screen with version and commands |
| `skill-surge init` | First-run setup — detect agents, choose scope, install 15 essential skills |
| `skill-surge add` | Interactive keyboard-driven skill picker with Select All |
| `skill-surge add <skill-name>` | Direct install a specific skill by name |
| `skill-surge add <repo>` | Install from skills.sh (e.g., `skill-surge add vercel-labs/agent-skills`) |
| `skill-surge list` | Category-first guided discovery — pick a category, browse skills |
| `skill-surge suggest --task "..."` | Top 3 ranked matches with one-key auto-install |
| `skill-surge scan` | Dashboard: installed vs available, project recommendations |
| `skill-surge hook --task "..."` | Agent trigger — returns JSON with detected skills |
| `skill-surge config` | Show current configuration |

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
    │   BUNDLED   │             │   SKILLS.SH │             │    LOCAL     │
    │  skills/orig│             │  ALL_SKILLS │             │ installed on │
    │  11 skills  │             │  18 skills  │             │  agent paths │
    └──────┬──────┘             └──────┬──────┘             └──────┬───────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   3-PHASE AGENT DETECTION        │
                     │  ├── Phase 1: Known config paths │
                     │  ├── Phase 2: ~/.config/*/skills/│
                     │  └── Phase 2b: ~/.{*}/skills/    │
                     └──────────────┬───────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   SCORE EVERY CANDIDATE (0-100)  │
                     │  ├── Overlap × 20                │
                     │  ├── Pre-bundled +40             │
                     │  ├── Already installed +15       │
                     │  └── Install count bonus         │
                     └──────────────┬───────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   TOP 3 RESULTS                  │
                     │  ├── [1] Auto-install on request │
                     │  ├── [2] Auto-install on request │
                     │  └── [3] Auto-install on request │
                     └──────────────┬───────────────────┘
                                      ▼
                     ┌──────────────────────────────────┐
                     │   INSTALL                        │
                     │  ├── Symlink or copy             │
                     │  ├── Global or project           │
                     │  └── To 1+ agents                │
                     └──────────────────────────────────┘
```

---

## ██ AGENT DETECTION — 3-PHASE GENIUS SCAN

skill-surge dynamically detects **every AI agent** on your system:

| Phase | What It Checks | Example |
|-------|---------------|---------|
| **Phase 1** | 11 known agent config paths | `~/.claude/skills/`, `~/.config/opencode/skills/` |
| **Phase 2** | Globs under `~/.config/*/skills/` | Catches Goose, future agents |
| **Phase 2b** | Any `~/.{something}/skills/` pattern | Catches any agent following convention |
| **Phase 3** | Fallback: creates `~/.agents/skills/` | Guarantees a target |

**11+ agents detected out of the box:**

| Agent | Path |
|-------|------|
| Claude Code | `~/.claude/skills/` |
| OpenCode | `~/.config/opencode/skills/` |
| Cline | `~/.agents/skills/` |
| Codex | `~/.codex/skills/` |
| Cursor | `~/.cursor/skills/` |
| Windsurf | `~/.codeium/windsurf/skills/` |
| GitHub Copilot | `~/.copilot/skills/` |
| Goose | `~/.config/goose/skills/` |
| Roo Code | `~/.roo/skills/` |
| Augment | `~/.augment/skills/` |
| Continue | `~/.continue/skills/` |

---

## ██ INTERACTIVE INSTALL FLOW

skill-surge's `add` command guides you through every step:

```
Step 1: Detect agents ──── 3-phase scan finds all agent directories
Step 2: Select skills ──── Keyboard-driven picker with checkboxes
                           ▸ Space to toggle  a: select all  ↑↓: nav  Enter: done
Step 3: Pick agents ────── Choose which agents receive skills
Step 4: Choose scope ───── Global (~/.agent/skills/) or Project (./.agents/skills/)
Step 5: Choose method ──── Symlink (recommended) or Copy
Step 6: Review summary ─── Shows install paths + security risk assessment
Step 7: Confirm ────────── One-key Y/n to proceed
Step 8: Done! ──────────── Skills installed, ready to use
```

---

## ██ SAFETY — INSTALL IS ALWAYS GUARDED

- **Security table** shown before every install (Gen AI risk, Socket alerts, Snyk status)
- **Confirmation required** — one-key Y/n before any files change
- **Dry-run available** — `installSkillToAgents()` accepts `dryRun: true` option
- **Symlink mode** — keeps skills referenceable without duplication
- **No stealth installs** — `hook` and `scan` are read-only, never install

---

## ██ AGENT INTEGRATION

### For Claude Code / OpenCode / Cline / Codex agents

Add this trigger to your agent instructions:

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
npm test

# Run
node dist/cli.js
node dist/cli.js suggest --task "build a login system"
node dist/cli.js scan
node dist/cli.js hook --task "test" --json
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
