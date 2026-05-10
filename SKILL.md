---
name: auto-skills
description: Automatically discover, refresh, recommend, and safely install agent skills using the Auto Skills CLI. This skill includes strict trust checks and mandatory user approval for all installations.
---

# Auto Skills

Automatically discover, refresh, recommend, and safely install agent skills using the Auto Skills CLI.

## Safety First: Guarded Installation

**CRITICAL RULE:** Discovery alone is permitted automatically, but **installation must explicitly be guarded**. Antigravity must never install a skill without explicit user confirmation after presenting trust metrics.

### Trust & Safety Guidelines

1. **Reputation Check**: Before recommending a skill, verify its metadata in the JSON output:
   - **Install Count**: Prefer skills with high install counts (e.g., >1,000).
   - **Source Reputation**: Trust official or well-known organizations (e.g., `vercel-labs`, `anthropics`, `CodePuri`).
   - **Score/Reason**: Pay attention to the `score` and `reason` provided by the CLI.
2. **Mandatory Review**: Always present the skill's name, description, source URL, and why it's being recommended to the user.
3. **Explicit Consent**: You must ask: *"I found the '[skill-name]' skill which helps with [task]. Would you like me to install it?"*
4. **No Background Installs**: Never use flags that bypass confirmation (like `-y` in the underlying CLI) unless the user has already given explicit permission for that specific operation.

## Workflow

### Step 1: Discovery
When the user asks to find a skill, improve capabilities, or discover tools, run:
```bash
node /Users/totem/Desktop/Code/auto-skills/dist/cli.js suggest --task "<task>" --json
```

### Step 2: Verify & Present
- Parse the JSON results.
- Filter for the most relevant and high-trust candidates.
- Present the top options to the user with their trust metrics (installs, source).

### Step 3: Approval & Installation
If the user selects a skill and says "Yes" or "Go ahead", run the install command using the `id` from the suggestion:
```bash
node /Users/totem/Desktop/Code/auto-skills/dist/cli.js install <candidate-id>
```

## Source Repository
- **Local Path**: `/Users/totem/Desktop/Code/auto-skills`
- **Remote Source**: `git@github.com:CodePuri/Auto-skills.git`
