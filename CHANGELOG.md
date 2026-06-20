# Changelog

## 2.3.0 (2026-06-20)
- Add 8 lockfile-backed upstream skills to the catalog: `next-cache-components`, `next-upgrade`, `terminal-ui`, `vercel-cli-with-tokens`, `vercel-composition-patterns`, `vercel-react-native-skills`, `vercel-react-view-transitions`, `web-design-guidelines`
- Refresh `skills-lock.json` hashes after explicit upstream review of source paths, descriptions, and repo licensing state
- Fix bundled original skill installation so published packages resolve `skills/original/*/SKILL.md` relative to the installed tarball
- Include bundled original skills in the npm package and strengthen `prepublishOnly` to run build, typecheck, and tests
- Harden terminal box rendering against ANSI width overflows and isolate the smoke suite to temp home/cache state
- Add CI coverage for Node.js 20, 22, and 24
- Chore: catalog now ships 37 curated skills (26 top-repo + 11 original)

## 2.1.1 (2026-05-12)
- Fix: "Docs: undefined" bug in splash screen (a() function returned undefined)
- Fix: Interactive selector rewritten with raw stdin for reliable key capture
- Fix: Skill table now grouped by category with installed agents shown
- Fix: Branding — header says "skill-surge Skills" instead of "Installed Skills"
- Chore: Collapsed 17 source files to 8 clean files
- Chore: Removed dead v1 skill files polluting the repo
- Chore: 76 tests passing

## 2.1.0 (2026-05-11)
- UI overhaul: ASCII banners, interactive multi-select, tables, dashboard
- New: `add` command — interactive skill installer like skills.sh
- New: `scan` command — project audit with dashboard
- 29 curated skills (18 from top repos + 11 original)
- 11 agent support (Claude Code, Cline, OpenCode, Codex, Cursor, etc.)

## 2.0.0 (2026-05-10)
- Complete rewrite from autoskills v1
- 29 curated skills
- Clean terminal UI
- Multi-agent support

## 1.0.1 (2026-05-09)
- Rename: autoskills → skill-surge

## 1.0.0 (2026-05-08)
- Initial release as autoskills
- 14 bundled skills
- Basic suggest + install flow
