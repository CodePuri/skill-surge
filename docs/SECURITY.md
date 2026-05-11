# skill-surge — Security Policy

## Core Principle

**Read-only commands are safe. Commands that install skills always require explicit user intent.** No automatic skill installation without consent.

## Command Safety Matrix

| Command | Installs? | Safe? | Notes |
|---------|-----------|-------|-------|
| `hook` | No | ✓ Always | Read-only, returns JSON |
| `suggest` | No | ✓ Always | Read-only, ranking display |
| `list` | No | ✓ Always | Read-only directory listing |
| `config` | No | ✓ Always | Read-only config display |
| `scan` | Optional | ✓ Yes | Prompts for quick-install consent |
| `init` | Yes | ✓ Yes | Requires user to select scope |
| `install` | Yes | ✓ Yes | Validates skill name, prompts for agent/scope |

## Install Command Validation

**top-repo skills** (`source === 'top-repo'`):
- Uses `npx skills add <repo> --skill <name> -g`
- Fails fast if `npx` is unavailable
- Timeout: 60 seconds per skill

**original skills** (`source === 'original'`):
- Uses `fs.copyFileSync` from bundled `skills/original/<name>/SKILL.md`
- No shell execution — pure file copy
- Fails if source file is missing

## Trivial Task Filtering

The `hook` command filters out trivial tasks to prevent noise. Tasks matching this pattern always return `shouldSuggest: false`:
- Empty or single-token descriptions
- Simple words: hi, hello, ok, yes, thanks, bye, etc.

This is enforced in `src/core/ranker.ts` → `isTrivialTask()`.

## Score Calculation (for suggest/rank)

| Factor | Points |
|--------|--------|
| top-repo source | +30 |
| original source | +40 |
| Per keyword match | +20 |
| Already installed locally | +15 |
| ≥100,000 installs | +25 |
| ≥10,000 installs | +10 |

## Trust Model

**Trusted owners** (skills.sh repositories):
- `vercel-labs`, `anthropics`, `microsoft`, `mattpocock`, `obra`, `supabase`, `nextlevelbuilder`, `codepuri`

All skills in the catalog are reviewed. Skills.sh repos are vetted before addition.

## Security Checklist

- [ ] No `eval()` or dynamic code execution
- [ ] No hardcoded credentials or API keys
- [ ] All `spawnSync` calls have timeouts (60s max)
- [ ] All filesystem operations wrapped in try/catch
- [ ] No `fs.writeFileSync` without `fs.mkdirSync` (ensureDir)
- [ ] Error messages don't leak internal paths
- [ ] No external network calls without timeout (25s for skills find)
- [ ] Skill names validated against catalog before install
- [ ] Cache reads always have fallbacks (never throw on corrupt JSON)

## Dependency Audit

```bash
npm audit
```

Dependencies: `@types/node` (dev), `typescript` (dev) only. No runtime dependencies.

## Reporting Security Issues

1. Do NOT open a public GitHub issue
2. Contact the maintainer directly at the GitHub repo
3. Allow 48 hours for initial response