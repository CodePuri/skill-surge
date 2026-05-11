# Skill Surge — Security Policy

## Core Safety Principle

**Installation is always guarded.** Discovery and suggestion happen automatically, but installation requires explicit human consent and validation against trust thresholds.

## Auto-Install Threshold

A candidate becomes eligible for auto-install only when **ALL** of the following are true:

1. **Score ≥ 70** (out of 100)
2. **AND** either:
   - Source owner is in the trusted list (`vercel-labs`, `anthropics`, `microsoft`, `openai`, `codepuri`), OR
   - Install count ≥ 1,000

This is enforced in `src/core/ranker.ts` → `scoreCandidate()` function.

## Install Command Validation

Only one exact install command shape is accepted:

```bash
npx skills add <repo> --skill <skill-name> -g -a codex -y
```

The command must contain ALL of:
- `npx` (command)
- `skills` (subcommand)
- `add` (action)
- `-g` (global installation)
- `-a codex` (agent target)
- `-y` (auto-confirm)

If ANY of these are missing, the install is **BLOCKED** with exit code 3.

This is enforced in `src/core/installer.ts` → `validateInstallCommand()` function.

## Guarded Commands

| Command | Installs? | Safe? |
|---------|-----------|-------|
| `suggest` | No | ✓ Always safe |
| `hook` | No | ✓ Always safe |
| `refresh` | No | ✓ Always safe (read-only) |
| `init` | No | ✓ Always safe |
| `seed` | No | ✓ Always safe (cache registration only) |
| `doctor` | No | ✓ Always safe |
| `list` | No | ✓ Always safe |
| `clean` | No | ✓ Always safe |
| `config` | No | ✓ Always safe |
| `install <id>` | Yes | ⚠️ Blocked without `-y` flag |
| `install <id> -y` | Yes | ⚠️ Blocked unless candidate passes threshold |
| `install <id> --dry-run` | No | ✓ Preview only |

## Score Calculation

| Factor | Points |
|--------|--------|
| Bundled skill (ships with package) | 50 base |
| Local skill (already installed) | 42 base |
| Remote skill (npx skills find) | 25 base |
| Per intent keyword match | +16 |
| Trusted owner | +20 |
| ≥1,000 installs | +18 |
| ≥100 installs | +10 |
| >0 installs | +4 |
| Skill name verbatim in task | +12 |
| **Maximum** | **100** |

## Trust Lists

### Trusted Owners (auto-install eligible)
- `vercel-labs`
- `anthropics`
- `microsoft`
- `openai`
- `codepuri`

### Default Scan Paths (read-only)
- `~/.codex/skills/`
- `~/.agents/skills/`
- `{REPO_ROOT}/skills/` (bundled)

### Remote Registries
- `https://github.com/vercel-labs/skills`
- Listed in `config/sources.json` → `remoteRegistries`

## Hard Blocks

The following are **ALWAYS BLOCKED** regardless of score or trust:

1. Any install command that doesn't use `npx skills add ... -g -a codex -y`
2. Auto-install of local skills (local skills are for reference, not installation)
3. Any attempt to bypass confirmation via environment variable
4. `refresh` or `hook` making any changes to the filesystem beyond cache

## Security Checklist

Before any new feature or refactor, verify:

- [ ] No new commands that mutate state without explicit flags
- [ ] No hardcoded paths or credentials
- [ ] All user input is validated before use
- [ ] No exec/spawn without command validation
- [ ] Error messages don't leak internal paths
- [ ] Cache writes are wrapped in try/catch
- [ ] All network calls have timeouts
- [ ] Package dependencies are audited (`npm audit`)
- [ ] No `eval()` or dynamic code execution

## Reporting Security Issues

If you discover a security vulnerability in Skill Surge:
1. Do NOT open a public GitHub issue
2. Contact the maintainer directly
3. Allow 48 hours for initial response

## Dependency Audit

Run periodically:

```bash
npm audit
npm audit fix
```

The package has a minimal attack surface:
- `chalk` (terminal colors)
- `boxen` (terminal borders)
- `gradient-string` (ANSI gradients)
- `ora` (spinners)
- `cli-table3` (formatted tables)
- `figlet` (ASCII art)
- `@types/node`, `@types/figlet` (dev)