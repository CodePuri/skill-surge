# Auto Skills (Skill Aggregator)

Why bother adding skills manually? Run this and your IDE, terminal, and agent will find and add skills automatically, according to the task at hand.

`skill-aggregator` is a local-first CLI for finding relevant agent skills for a task. It scans installed skill folders, can query the Skills CLI, ranks candidates by intent fit and trust signals, and only auto-installs candidates that pass a high-confidence safety threshold.

## Commands

```bash
node dist/cli.js refresh
node dist/cli.js refresh --dry-run
node dist/cli.js suggest --task "react performance testing" --json
node dist/cli.js install <candidate-id> --dry-run
node dist/cli.js hook --task "build a polished dashboard UI"
```

## Sources

Default sources are configured in `config/sources.json`:

- `~/.codex/skills`
- `~/.agents/skills`
- `/Users/totem/Desktop/Code/Skills`
- Configured git sources such as `https://github.com/vercel-labs/skills`

User-specific config can also be placed at `~/.config/skill-aggregator/sources.json`.

## Cache

The metadata cache is stored at `~/.cache/skill-aggregator/index.json` by default. Set `SKILL_AGGREGATOR_CACHE` to override it.

## Optional LLM Rerank

Local matching is the default. To add an optional reranker, set `SKILL_AGGREGATOR_LLM_COMMAND` to a command that accepts JSON on stdin and returns either an array of candidate IDs or `{ "rankedIds": [...] }`.

## Safety

Auto-install uses Codex global scope:

```bash
npx skills add <repo> --skill <skill-name> -g -a codex -y
```

Candidates from unknown or weak sources remain recommendation-only. The `install` command refuses candidates that do not pass the score and trust threshold unless a future implementation adds an explicit manual override flow.
