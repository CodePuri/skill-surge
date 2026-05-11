# Auto Skills — Automation Policy

## Weekly Refresh Automation

### Job: `skill-aggregator-weekly-refresh`

- **Schedule**: Every Monday at 09:00 Asia/Kolkata
- **Command**: `node dist/cli.js refresh --network`
- **Working directory**: `/Users/totem/Desktop/Code/auto-skills`
- **Timeout**: 5 minutes

### What It Does

1. Loads configuration from `config/sources.json` and user override `~/.config/autoskills/sources.json`
2. Scans all bundled skills (`skills/` directory)
3. Scans all local agent skill folders (`~/.codex/skills`, `~/.agents/skills`)
4. If `--network` is set, inspects configured git sources (`https://github.com/vercel-labs/skills`)
5. Writes updated cache to `~/.cache/autoskills/index.json`

### What It Does NOT Do

- **NEVER installs skills** — `refresh` only discovers and caches
- **NEVER modifies local skill files** — read-only operation
- **NEVER auto-installs** — auto-install requires `install <id> -y` with explicit human consent
- **NEVER uses `-y` flag on behalf of the user** — forbidden in all automation contexts

### Cron Configuration

```bash
# Crontab entry for the automation user
0 9 * * 1 cd /Users/totem/Desktop/Code/auto-skills && /usr/local/bin/node dist/cli.js refresh --network >> ~/.logs/autoskills-refresh.log 2>&1
```

### Monitoring

- Log output: `~/.logs/autoskills-refresh.log`
- Check last run: `tail -5 ~/.logs/autoskills-refresh.log`
- Cache last modified: `~/.cache/autoskills/index.json`

### Recovery on Failure

If `refresh` fails (network timeout, permissions, etc.):

1. The previous cache remains intact — no data loss
2. Next successful run overwrites stale cache
3. All commands fall back to `FALLBACK_CACHE_PATH` in temp directory if home cache is unavailable
4. `autoskills doctor` will report cache status

### Manual Refresh

```bash
# Offline only (fast)
node dist/cli.js refresh

# With network discovery
node dist/cli.js refresh --network

# Dry run (preview without writing)
node dist/cli.js refresh --dry-run
```

## Agent Hook (Proactive Suggestion)

### Trigger Modes (3-Tier)

**Tier 1 — Prompt Prefix** (zero config):
```
auto skills: build a fullstack dashboard
```
Agent detects prefix → runs `autoskills hook --task "build a fullstack dashboard" --json`

**Tier 2 — Config File**:
```json
// ~/.config/autoskills/trigger.json
{ "alwaysSuggest": true }
```
Agent checks for this file on startup → runs hook on every substantial task

**Tier 3 — Environment Variable**:
```bash
export AUTO_SKILLS=true
```
Agent checks env var → runs hook proactively

### Hook Behavior

- Trivial tasks (hi, hello, thanks, ok, etc.) → `shouldSuggest: false`
- Non-trivial tasks → `shouldSuggest: true`, returns top 3 candidates
- NEVER installs — only returns suggestions
- Works fully offline (uses cached data)

## CI/CD Pipeline

```yaml
# Example CI workflow for autoskills
on: [push, pull_request]

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
      - run: node dist/cli.js seed
      - run: node dist/cli.js doctor
      - run: node dist/cli.js suggest --task "react testing" --json --offline
```