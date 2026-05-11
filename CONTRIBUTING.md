# Contributing

## Setup

```bash
git clone git@github.com:CodePuri/skill-surge.git
cd skill-surge
npm install
npm run build
```

## Development

```bash
npm run build    # Compile TypeScript
npm test         # Run tests
npm start        # Run CLI locally: node dist/cli.js
```

## Adding a New Original Skill

1. Add an entry to the `ALL_SKILLS` array in `src/search.ts`
2. Create `skills/original/<skill-name>/SKILL.md` with frontmatter:
   ```markdown
   ---
   name: <skill-name>
   description: What this skill does
   ---

   # <Skill Name>

   ## Guidelines
   ...
   ```
3. Run `npm test` to verify catalog + tests pass
4. Run `node dist/cli.js list` to see it in the table

## Code Style

- TypeScript, ES2022 modules
- No external dependencies (zero deps CLI)
- Functions over classes
- `console.log` for CLI output (no logging library)
- Tests use Node's built-in `node:test` + `node:assert`

## PR Process

1. Create a branch from `main`
2. Make your changes
3. Run `npm run build && npm test` — all must pass
4. Open a PR with a clear description of what changed and why

## Release Process

1. Bump version in `package.json` and `src/cli.ts` VERSION constant
2. Run `npm run build`
3. Run `npm test`
4. Commit: `chore: bump to vX.Y.Z`
5. `npm publish --access public`
6. Tag: `git tag vX.Y.Z && git push --tags`
