# skill-surge

**Your agent's skill library.** 29 expert-level skills, auto-installed to Claude Code, OpenCode, Cline, and more — in one command.

```
npm install -g skill-surge
skill-surge init
```

That's it. Your agent is now armed with production-grade guidance for every task.

---

## What is this?

skill-surge gives your AI agent expert-level knowledge across every domain. It's a curated collection of 29 skills covering workflow, frontend, backend, database, architecture, design, QA, and planning.

**18 skills** come from top [skills.sh](https://skills.sh) repositories (Vercel, Anthropic, Matt Pocock, Supabase) — the same skills used by thousands of production agents. **11 original skills** are opinionated, production-tested guides written specifically for this package.

When your agent loads a skill, it gains the accumulated knowledge and patterns from real-world experts. No more reinventing auth systems, database schemas, or API designs from scratch.

---

## Quick Start

```bash
# Install the CLI
npm install -g skill-surge

# One-time setup — detect your agents, install all skills
skill-surge init

# See what's installed in your project
skill-surge scan

# Ask for skill recommendations on any task
skill-surge suggest --task "build a login system with OAuth"

# Hook your agent into skill-surge for automatic skill detection
skill-surge hook --task "add user authentication"
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `skill-surge init` | Detect agents, choose scope (global/project/both), install all 29 skills |
| `skill-surge scan` | Audit your project — detect type (React, Node, Python...), show installed vs missing skills |
| `skill-surge suggest --task "..."` | Find and rank skills for any task. See scores, install counts, and match reasons |
| `skill-surge install <skill>` | Install a specific skill to selected agents |
| `skill-surge list` | Show all installed skills grouped by category |
| `skill-surge hook --task "..."` | JSON output for agent integration — detects relevant skills for a task |
| `skill-surge config` | Show current configuration |

---

## Skills Catalog — 29 Total

### Workflow (9)
| Skill | Description | Installs |
|-------|-------------|----------|
| `find-skills` | Discover skills from skills.sh inside your agent | 1.4M |
| `grill-me` | Interview yourself relentlessly until requirements are crystal clear | 113K |
| `tdd` | Red → Green → Refactor loop | 77K |
| `systematic-debugging` | Hypothesis → test → verify cycle | 89K |
| `writing-plans` | Structured implementation plans before starting | 89K |
| `executing-plans` | Step-by-step with checkpoints and verification | 72K |
| `brainstorming` | Structured ideation and problem decomposition | 149K |
| `verification-before-completion` | Force a verification pass before marking any task done | 64K |
| `finishing-a-development-branch` | Branch close checklist: tests, commit, PR, review | 57K |
| `requesting-code-review` | Prepare code for review: self-review, test coverage, PR description | 78K |
| `git-workflow` | Standardized Git: branching, conventional commits, PR workflow, hooks | — |

### Frontend (4)
| Skill | Description | Installs |
|-------|-------------|----------|
| `vercel-react-best-practices` | React + Next.js performance optimization with 69 rules | 388K |
| `next-best-practices` | Next.js App Router conventions, RSC, async APIs, metadata | 82K |
| `react-patterns` | Hooks, TanStack Query, component patterns, performance | — |
| `docx` | Generate Word documents programmatically with rich formatting | 83K |

### Design (3)
| Skill | Description | Installs |
|-------|-------------|----------|
| `frontend-design` | Universal frontend design guidelines for any project | 394K |
| `ui-ux-pro-max` | Visual hierarchy, design systems, expert UI/UX critique | 156K |
| `accessibility-first` | WCAG 2.1 AA: semantic HTML, ARIA, keyboard nav, screen readers | — |

### Backend (5)
| Skill | Description | Installs |
|-------|-------------|----------|
| `node-api-design` | Production REST API patterns: routing, middleware, validation | — |
| `auth-systems` | JWT RS256, OAuth2/PKCE, RBAC, bcrypt, session management | — |
| `error-handling` | Typed error classes, centralized handlers, logging, Sentry | — |
| `security-hardening` | Helmet, CORS, rate limiting, input sanitization, CSP | — |
| `deploy-to-vercel` | Environment setup, preview URLs, production deploy, alias management | 47K |

### Database (2)
| Skill | Description | Installs |
|-------|-------------|----------|
| `supabase-postgres-best-practices` | Schema design, RLS, indexing, query performance, migrations | 156K |
| `database-patterns` | Schema design, indexing, connection pooling, migrations, Redis | — |

### Architecture (1)
| Skill | Description | Installs |
|-------|-------------|----------|
| `system-design` | Scalability, caching, message queues, microservices, observability | — |

### QA (1)
| Skill | Description | Installs |
|-------|-------------|----------|
| `testing-strategies` | Unit, integration, E2E with Playwright, TDD flow, CI coverage | — |

### Planning (1)
| Skill | Description | Installs |
|-------|-------------|----------|
| `project-planning` | Agile planning: user stories, story points, sprints, risk matrix | — |

### Meta (2)
| Skill | Description | Installs |
|-------|-------------|----------|
| `skill-creator` | Create, test, and publish new skills from inside your agent | 197K |
| `skill-surge` | This package — hook into skill-surge for automatic detection | — |

---

## Agent Integration

Add this to your agent's system prompt or config to enable automatic skill detection:

```
When the user references skill names or starts a prompt with "skill-surge:",
run: skill-surge hook --task "<task description>"
Load the detected SKILL.md files from the agent's skills directory.
```

The `hook` command:
- Returns **JSON** — safe to parse programmatically
- Detects **trivial tasks** (hi, hello, ok...) and returns `shouldSuggest: false`
- Returns **top 5 ranked skills** for real tasks with match reasons
- Works **offline** — no network required

---

## How It Works

```
You: "skill-surge: build a login page"
        ↓
Agent: skill-surge hook --task "build a login page"
        ↓
skill-surge: {
  "task": "build a login page",
  "shouldSuggest": true,
  "detectedSkills": ["auth-systems", "react-patterns"],
  "message": "2 skills detected."
}
        ↓
Agent: loads auth-systems + react-patterns into context
        ↓
Agent: builds login page with JWT, OAuth2, React best practices
```

---

## Supported Agents

Claude Code, OpenCode, Cline, Codex, Cursor, Windsurf, GitHub Copilot, Goose, Roo Code, Augment, Continue.

skill-surge detects which agents you have installed and offers to install skills to all of them — or just one.

---

## Terminal UI

Clean black/grey/white design. No gradients. No neon. Every pixel earns its place.

---

## Requirements

- Node.js 20+
- npm 9+

## License

MIT