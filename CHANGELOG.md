# Changelog

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
