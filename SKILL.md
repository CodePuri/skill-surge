---
name: skill-surge
description: Your agent's skill library. 29 curated skills. Interactive installation like skills.sh. Use when building software, designing systems, writing tests, debugging, planning, or deploying. Triggers on: skill-surge, add, suggest, hook, scan, list.
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
| `skill-surge` | Splash screen with ASCII banner |
| `skill-surge init` | First-run setup — detect agents, install all skills |
| `skill-surge add` | Interactive skill installation (like npx skills add) |
| `skill-surge scan` | Audit project — show dashboard with installed vs available |
| `skill-surge suggest --task "..."` | Find and rank skills for a task |
| `skill-surge list` | Table of installed skills grouped by category |
| `skill-surge hook --task "..."` | Agent trigger — returns JSON |
| `skill-surge config` | Show current configuration |

## Agent Integration

When the user starts a prompt with "skill-surge:" or references skills:
1. Run: `skill-surge hook --task "<task>"`
2. Load the detected SKILL.md files into context
3. Proceed with the task using skill guidance

## Skills Catalog (29 total)

### Workflow (11)
- find-skills, grill-me, tdd, systematic-debugging, writing-plans, executing-plans, brainstorming, verification-before-completion, finishing-a-development-branch, requesting-code-review, git-workflow

### Frontend (4)
- vercel-react-best-practices (388K), next-best-practices (82K), react-patterns, docx (83K)

### Design (3)
- frontend-design (394K), ui-ux-pro-max (156K), accessibility-first

### Backend (5)
- node-api-design, auth-systems, error-handling, security-hardening, deploy-to-vercel (47K)

### Database (2)
- supabase-postgres-best-practices (156K), database-patterns

### Architecture (1)
- system-design

### QA (1)
- testing-strategies

### Planning (1)
- project-planning

### Meta (2)
- skill-creator (197K), skill-surge

## Example Usage

```
$ skill-surge add
# Shows interactive UI with skill selection, agent selection, scope, method
# Similar to npx skills add from skills.sh

$ skill-surge hook --task "build a login system"
# Returns JSON with detected skills

$ skill-surge list
# Shows table of installed skills
```

## Source

- **npm**: [skill-surge](https://www.npmjs.com/package/skill-surge)
- **GitHub**: [github.com/CodePuri/skill-surge](https://github.com/CodePuri/skill-surge)
- **Skills Registry**: [skills.sh](https://skills.sh)