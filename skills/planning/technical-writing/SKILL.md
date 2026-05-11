---
name: technical-writing
description: Technical writing patterns including documentation structure, API docs, README creation, code comments, and knowledge base management.
category: planning
---

# Technical Writing

## Documentation Types
- **README**: What, why, how to start — first thing someone reads
- **API docs**: Endpoints, request/response shapes, auth, errors
- **Architecture docs**: System overview, decisions, data flow, trade-offs
- **Runbooks**: How to deploy, debug, recover from common issues
- **Contributing guide**: How to set up, test, and submit changes

## README Structure
1. **Project name + one-liner**: What it is
2. **Quick start**: Copy-paste commands to get running in 30 seconds
3. **Usage**: Common commands, examples, expected output
4. **Configuration**: Environment variables, config files
5. **Contributing**: PR process, coding standards, test expectations
6. **License**: MIT, Apache, etc.

## Writing Style
- Active voice: "The server reads the config" not "The config is read by the server"
- Short sentences: One idea per sentence, 15-20 words average
- Consistent terminology: Don't use "start", "launch", "boot" interchangeably
- Code examples: Always include — show, don't just tell
- Screenshots/ASCII diagrams for complex concepts

## Code Comments
- Comment *why*, not *what* — the code already shows what
- Document assumptions, edge cases, and trade-offs
- Keep comments close to the code they describe
- Update comments when code changes — stale comments are worse than none
- Use JSDoc/TSDoc for public APIs

## Knowledge Base
- Centralize documentation in a single source of truth (wiki, docs folder, Notion)
- Keep a changelog: notable changes, deprecations, migration guides
- Document post-mortems: what went wrong, what was learned, what changed
- Review docs quarterly — outdated docs erode trust

## Markdown Best Practices
- Use heading hierarchy (H1 → H2 → H3) don't skip levels
- Code blocks with language labels for syntax highlighting
- Tables for structured data
- Links inline rather than "click here" — use descriptive link text
- Checklists for multi-step processes

## Diagram as Code
- Mermaid.js for flowcharts, sequence diagrams, Gantt charts
- PlantUML for UML diagrams
- ASCII diagrams in code comments for quick sketches
- Keep diagrams in version control alongside code
