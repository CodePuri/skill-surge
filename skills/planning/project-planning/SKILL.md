---
name: project-planning
description: Project planning patterns including requirements gathering, estimation techniques, sprint planning, risk management, and stakeholder communication.
category: planning
---

# Project Planning

## Requirements Gathering
- Start with user stories: "As a [user], I want to [action] so that [benefit]"
- Acceptance criteria: Define done clearly — use Given/When/Then format
- Prioritize: MoSCoW method (Must-have, Should-have, Could-have, Won't-have)
- Document decisions and rationale — future team members will ask why

## Estimation Techniques
- **T-shirt sizing**: S, M, L, XL for high-level planning
- **Story points**: Relative estimation using Fibonacci (1, 2, 3, 5, 8, 13)
- **Planning poker**: Team-based estimation to avoid anchoring bias
- **Time-based**: Only when requirements are well-defined and team is experienced
- Always include buffer: 20-30% for unknowns

## Sprint Planning
- Capacity: Team velocity × sprint length (account for meetings, reviews)
- Pull from backlog: Prioritized, estimated, and well-defined items only
- Definition of ready: Clear acceptance criteria, dependencies resolved, designed
- Commit: Team commits to scope — not imposed by management

## Risk Management
- Identify risks early: technical unknowns, dependency delays, scope creep
- Mitigation strategies: spike stories for unknowns, buffer for dependencies
- Communicate risks early — bad news doesn't age well
- Regular retrospectives to capture and address systemic issues

## Progress Tracking
- Daily standup: What did I do? What will I do? Any blockers?
- Burndown/burnup charts: Visual progress against planned scope
- Kanban board: Visual workflow — To Do, In Progress, Review, Done
- Weekly stakeholder updates: Progress, risks, decisions needed

## Communication
- Async-first: Write things down (docs, tickets, PR descriptions)
- Sync for decisions: Quick calls to resolve ambiguity
- Document the "why" behind decisions — context survives longer than code
- Regular demos: Show working software every sprint

## Tech Debt Management
- Allocate 20% of each sprint to refactoring and debt reduction
- Track debt items in the backlog with clear cost/benefit
- Fix critical debt immediately (blocking changes, security, performance)
- Leave code cleaner than you found it (boy scout rule)
