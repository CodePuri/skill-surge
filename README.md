# skill-surge

**Install structured skills into your AI agents**

skill-surge is a CLI that discovers, ranks, and installs SKILL.md files into AI agent environments. Skills give your agent domain expertise — workflow patterns, design guidelines, testing strategies, deployment playbooks, and more.

## Badges

![npm](https://img.shields.io/npm/v/skill-surge.svg)
![node](https://img.shields.io/node/v/skill-surge.svg)
![license](https://img.shields.io/npm/l/skill-surge.svg)
![TypeScript](https://img.shields.io/badge/%3C%20%2F%3E-TypeScript-blue.svg)

## Quick Start

```bash
npm install -g skill-surge    # One-time install
skill-surge init              # Auto-detect agents, install 15 essential skills
skill-surge suggest --task "build a login system"   # Find relevant skills
```

## Features

- **Zero dependencies** — Pure TypeScript/Node.js
- **15 essential skills** — Pre-selected for immediate productivity
- **29 curated skills** — Comprehensive skill library
- **11+ agents supported** — Claude Code, OpenCode, Cline, and more
- **3-phase agent detection** — Finds any agent following ~/.{agent}/skills/ pattern
- **Interactive selector** — Real-time keyboard navigation with Select All
- **Skills.sh compatibility** — Install skills from any skills.sh repository
- **Smart suggestions** — Top 3 skills for any task with auto-install
- **Category-guided discovery** — Browse skills by use case
- **Secure by default** — Shows risk assessments before installation

## Commands

| Command | Description |
|---------|-------------|
| `skill-surge` | Show welcome screen with version and commands |
| `skill-surge init` | First-run setup — detect agents, install 15 essential skills |
| `skill-surge add` | Interactive skill installer (select skills, agents, scope) |
| `skill-surge add <skill-name>` | Direct install a specific skill |
| `skill-surge add <repo>` | Install from skills.sh repository (e.g., vercel-labs/agent-skills) |
| `skill-surge list` | Browse skills by category with install status |
| `skill-surge suggest --task "..."` | Find top 3 skills for a task (auto-install on selection) |
| `skill-surge scan` | Audit project — show dashboard with stats and recommendations |
| `skill-surge hook --task "..."` | Agent trigger — returns JSON with detected skills |
| `skill-surge config` | Show current configuration |

## Skill Catalog

<details>
<summary><strong>Workflow & Planning</strong> (7 skills)</summary>

- brainstorming — Explore intent, requirements, design before implementation
- writing-plans — Define spec/requirements before touching code
- executing-plans — Execute written implementation plan with checkpoints
- finishing-a-development-branch — Guide for merge/PR/cleanup decisions
- verification-before-completion — Require evidence before success claims
- requesting-code-review — Verify work meets requirements before merging
- project-planning — Technical project scoping and planning
</details>

<details>
<summary><strong>Design / UX</strong> (3 skills)</summary>

- accessibility-first — WCAG-compliant design with inclusive components
- frontend-design — Distinctive, production-grade frontend interfaces
- ui-ux-pro-max — Comprehensive UI/UX design intelligence (50+ styles, 161 palettes)
</details>

<details>
<summary><strong>Frontend / UI</strong> (3 skills)</summary>

- vercel-react-best-practices — React/Next.js performance optimization from Vercel
- next-best-practices — Next.js conventions, RSC boundaries, data patterns
- react-patterns — Clean, maintainable React component patterns
</details>

<details>
<summary><strong>Backend / API</strong> (3 skills)</summary>

- node-api-design — Build scalable Node.js APIs with proper architecture
- auth-systems — Authentication systems (JWT, OAuth, sessions, RBAC)
- error-handling — Comprehensive error handling patterns and practices
</details>

<details>
<summary><strong>Database</strong> (2 skills)</summary>

- supabase-postgres-best-practices — Postgres performance optimization from Supabase
- database-patterns — Schema design, migrations, indexing strategies
</details>

<details>
<summary><strong>Security</strong> (1 skill)</summary>

- security-hardening — Security best practices, vulnerability assessment, secure defaults
</details>

<details>
<summary><strong>DevOps / Deploy</strong> (1 skill)</summary>

- deploy-to-vercel — Deploy applications and websites to Vercel with previews
</details>

<details>
<summary><strong>Documentation</strong> (1 skill)</summary>

- docx — Create, read, edit, and manipulate Word documents (.docx files)
</details>

<details>
<summary><strong>QA / Testing</strong> (1 skill)</summary>

- testing-strategies — Comprehensive testing approaches (unit, integration, e2e)
</details>

<details>
<summary><strong>Architecture</strong> (1 skill)</summary>

- system-design — Architectural patterns, scalability, reliability, observability
</details>

<details>
<summary><strong>Meta</strong> (2 skills)</summary>

- find-skills — Discover and install agent skills when looking for functionality
- skill-creator — Create, edit, optimize skills; run evals and benchmark performance
</details>

## How It Works

1. **Discovery** — `skill-surge suggest` tokenizes your task, scores each skill by keyword overlap, install count, and source trust level
2. **Selection** — `skill-surge add` opens an interactive picker with real-time keyboard navigation (arrows, space to toggle, 'a' for select all)
3. **Installation** — Copies or symlinks SKILL.md files into agent-specific directories (`~/.claude/skills/`, `~/.agents/skills/`, etc.)
4. **Activation** — Agents auto-load SKILL.md files from their skills directories when context matches the skill description

## Supported Agents

skill-surge detects and installs skills to any agent that follows the `~/.{agent}/skills/` pattern, including:

- Claude Code (`~/.claude/skills/`)
- OpenCode (`~/.config/opencode/skills/`)
- Cline (`~/.agents/skills/`)
- Codex (`~/.codex/skills/`)
- Cursor (`~/.cursor/skills/`)
- Windsurf (`~/.codeium/windsurf/skills/`)
- GitHub Copilot (`~/.copilot/skills/`)
- Goose (`~/.config/goose/skills/`)
- Roo Code (`~/.roo/skills/`)
- Augment (`~/.augment/skills/`)
- Continue (`~/.continue/skills/`)

## Development

```bash
git clone git@github.com:CodePuri/skill-surge.git
cd skill-surge
npm install
npm run build
npm test
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for module design and [CONTRIBUTING.md](CONTRIBUTING.md) for contributing guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.