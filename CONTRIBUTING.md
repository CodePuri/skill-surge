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
npm run verify   # Typecheck + build + tests
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
3. Run `npm run verify` — all must pass
4. Open a PR with a clear description of what changed and why

## Release Process

1. Bump `package.json` and `src/types.ts` to the same version.
2. Review any `skills-lock.json` hash changes explicitly before accepting them.
3. Run `npm run verify`.
4. Run `npm pack --dry-run` and `npm pack --pack-destination /tmp`.
5. Audit the tarball contents and smoke-test the unpacked package.
6. Commit the verified release changes.
7. Publish the exact verified tarball with `npm publish /tmp/<tarball> --access public`.
8. Verify npm reports the new version as `latest`.
9. Tag and push: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push --follow-tags`.
