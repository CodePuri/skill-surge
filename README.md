# skill-surge

**Install structured skill files into your AI agent environments.**

skill-surge is a CLI that discovers, ranks, and installs SKILL.md files into Claude Code, Cline, OpenCode, Cursor, and more. Skills give your agent domain expertise — workflow patterns, design guidelines, testing strategies, deployment playbooks, and more.

29 skills included (18 from the skills.sh ecosystem + 11 original). Zero dependencies. No API keys needed.

## Quick Start

```bash
npm install -g skill-surge    # One-time install
skill-surge init              # Auto-detect agents, install all skills
skill-surge suggest --task "build a login system"   # Find relevant skills
```

## What's Inside

| Category | Skills |
|----------|-------|
| Workflow | grill-me, tdd, systematic-debugging, writing-plans, executing-plans, brainstorming, verification-before-completion, finishing-a-development-branch, requesting-code-review, git-workflow |
| Design | frontend-design, ui-ux-pro-max, accessibility-first |
| Frontend | vercel-react-best-practices, next-best-practices, react-patterns |
| Backend | node-api-design, auth-systems, error-handling |
| Database | supabase-postgres-best-practices, database-patterns |
| Security | security-hardening |
| DevOps | deploy-to-vercel |
| Docs | docx |
| QA | testing-strategies |
| Architecture | system-design |
| Planning | project-planning |
| Meta | find-skills, skill-creator |

## Commands

| Command | Description |
|---------|-------------|
| `skill-surge` | Splash screen with version and commands |
| `skill-surge init` | First-run setup — detect agents, install all skills |
| `skill-surge add` | Interactive skill installer (select skills, agents, scope) |
| `skill-surge list` | Show all skills grouped by category with install status |
| `skill-surge suggest --task "..."` | Find and rank skills for a task |
| `skill-surge scan` | Audit project — show dashboard with installed vs available |
| `skill-surge hook --task "..."` | Agent trigger — returns JSON with detected skills |
| `skill-surge config` | Show current configuration |

## How It Works

1. **Discovery** — `suggest` tokenizes your task, scores each of the 29 skills by keyword overlap, install count, and source trust level
2. **Selection** — `add` opens an interactive picker with checkbox selection, arrow key navigation, and agent targeting
3. **Installation** — copies or symlinks SKILL.md files into agent-specific directories (`~/.claude/skills/`, `~/.agents/skills/`, etc.)
4. **Activation** — agents auto-load SKILL.md files from their skills directories when a prompt matches the skill description

## Supported Agents

Claude Code, OpenCode, Cline, Codex, Cursor, Windsurf, GitHub Copilot, Goose, Roo Code, Augment, Continue

## Development

```bash
git clone git@github.com:CodePuri/skill-surge.git
cd skill-surge
npm install
npm run build
npm test
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for module design and [CONTRIBUTING.md](CONTRIBUTING.md) for adding skills.

## License

MIT — see [LICENSE](LICENSE)
