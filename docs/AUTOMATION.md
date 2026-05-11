# skill-surge — Automation Policy

## Agent Hook (Proactive Skill Detection)

The `hook` command is the primary automation integration point. It receives a task description and returns JSON indicating which skills should be loaded.

### Hook Behavior

```
skill-surge hook --task "build a dashboard"
```

**Trivial task detection** (via `isTrivialTask` in `src/core/ranker.ts`):
- Empty or single-token tasks → `{ shouldSuggest: false }`
- Simple words (hi, hello, ok, yes, thanks, etc.) → `{ shouldSuggest: false }`

**Normal task detection**:
- Tokenizes task (removes stopwords)
- Matches against all 29 skills in `ALL_SKILLS` catalog
- Returns top 5 ranked skills as `detectedSkills` array
- Never installs — only returns suggestions

### JSON Output Format

```json
{
  "task": "build a login system with JWT",
  "shouldSuggest": true,
  "detectedSkills": ["auth-systems", "react-patterns", "system-design"],
  "message": "3 skills detected. Run: skill-surge install <skill> --agent '*'"
}
```

### Agent Integration

Add to agent system prompt:

```
When the user references skill names or starts a prompt with "skill-surge:",
run: skill-surge hook --task "<task description>"
Load the detected SKILL.md files from the agent's skills directory.
```

## scan Command Automation

`skill-surge scan` detects the project type (Node.js, React, Python, Rust, etc.) from package.json, requirements.txt, Cargo.toml. Use it in CI to verify skill coverage.

```bash
# CI check — fail if fewer than N skills installed
skill-surge scan --json | jq '.installed | length'
```

## CLI Commands That Never Modify State

- `hook` — read-only JSON output
- `suggest` — read-only ranking display
- `list` — read-only directory listing
- `config` — read-only config display

## CLI Commands That May Modify State

- `init` — installs 29 skills to agent directories
- `install` — installs one skill
- `scan` — optional quick-install of recommended skills

## Automation Rules

1. **Never auto-install without user consent** — `init` and `install` always prompt unless `-y` is passed
2. **Read-only commands are always safe** — hook, suggest, list, config
3. **Cache is always read-first** — `loadCache()` is called before any state writes
4. **Dry-run available** — `install <skill> --dry-run` for preview

## CI/CD Pipeline

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: node dist/cli.js hook --task "build a login system" | jq -e '.shouldSuggest == true'
      - run: node dist/cli.js suggest --task "react performance" --offline
      - run: node dist/cli.js config
```