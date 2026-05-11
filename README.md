# skill-surge

**Your agent's skill library.** 29 curated skills. Auto-install to Claude Code, OpenCode, Cline, and more.

```
npm install -g skill-surge
skill-surge init
```

---

## What is this?

skill-surge gives your AI agent expert-level knowledge across every domain. It comes with 29 skills covering:

- **Workflow** (9): grill-me, tdd, systematic-debugging, writing-plans, brainstorming, etc.
- **Frontend** (2): vercel-react-best-practices, next-best-practices
- **Design** (2): frontend-design, ui-ux-pro-max
- **Backend** (5): node-api-design, auth-systems, error-handling, security-hardening, database-patterns
- **Database** (2): supabase-postgres-best-practices, database-patterns
- **Architecture** (1): system-design
- **DevOps** (1): deploy-to-vercel
- **QA** (1): testing-strategies
- **Planning** (1): project-planning
- **Meta** (2): find-skills, skill-creator

18 skills are installed via [`npx skills add`](https://skills.sh) from top repos (Vercel, Anthropic, Matt Pocock, Supabase). 11 are original opinionated skills written specifically for this package.

---

## Getting Started

```bash
# 1. Install
npm install -g skill-surge

# 2. First-run setup (detects agents, installs skills)
skill-surge init

# 3. Scan your project
skill-surge scan

# 4. Find skills for a task
skill-surge suggest --task "build a login system with OAuth"
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `skill-surge init` | Detect agents, install all 29 skills |
| `skill-surge scan` | Audit project — show installed vs available skills |
| `skill-surge suggest --task "..."` | Find and rank skills for a task |
| `skill-surge install <skill>` | Install a specific skill |
| `skill-surge list` | List all installed skills |
| `skill-surge hook --task "..."` | Agent trigger — returns JSON |
| `skill-surge config` | Show configuration |

---

## How It Works

When you reference a skill in your prompt (e.g., "use auth-systems to build login"), your agent automatically loads the skill's guidance into context. The `hook` command detects skills from task descriptions and returns them as JSON for agent integration.

```
User: "skill-surge: build a login page"
Agent: hook detects auth-systems + react-patterns
       → loads skills into context
       → builds login page with JWT + OAuth2 + React patterns
```

---

## Agent Integration

Add this to your agent instructions:

```
When the user starts a prompt with "skill-surge:" or references a skill by name:
1. Run: skill-surge hook --task "<task>" --json
2. Load detected skills from agent skill directories
3. Proceed with the task using skill guidance
```

---

## Terminal UI

Clean black/white/grey design. No gradients. No neon.

---

## License

MIT
