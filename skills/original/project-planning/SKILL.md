---
name: project-planning
description: Plan software projects effectively. Use when starting a project, writing user stories, estimating effort, managing sprints, or doing risk assessment. Triggers on: planning, agile, sprint, estimation, user-story, risk, backlog.
---

# Project Planning

Effective project planning patterns. Opinionated. Specific.

## User Story Writing

**Format:**
```
As a [user type]
I want [goal]
so that [benefit/value]
```

**Examples:**

```
As a product manager
I want to export reports to CSV
so that I can analyze data in Excel

As a user
I want to reset my password via email
so that I can regain access when I forget my password

As a developer
I want auto-generated API documentation
so that I spend less time maintaining docs
```

**INVEST criteria for good stories:**
- **I**ndependent — can be developed without depending on another story
- **N**egotiable — scope can be adjusted during conversation
- **V**aluable — delivers value to the user
- **E**stimable — the team can estimate the effort
- **S**mall — can be completed in one sprint
- **T**estable — clear acceptance criteria exist

**Break large stories down:**

```
BAD: "User can manage their account"
GOOD:
- "User can view their account details"
- "User can edit their account details"
- "User can delete their account"
- "User receives email before account deletion"
```

## Estimation

**Use story points, not hours.** Points are relative (this is twice as complex as that).

**Fibonacci scale:** 1, 2, 3, 5, 8, 13, 21

**Planning poker process:**
1. Product Owner reads a user story
2. Team discusses clarifications (3-5 min max)
3. Each person privately selects a card
4. Reveal simultaneously
5. Discuss outliers (high and low)
6. Repeat until consensus

**Velocity calculation:**
```
Sprint 1: 30 points completed
Sprint 2: 28 points completed
Sprint 3: 33 points completed
Average velocity: ~30 points/sprint
```

**Forecasting:** With 30 points/sprint velocity, 120-point project takes ~4 sprints (8 weeks).

**T-shirt sizing as quick estimation:**
- XS: 0.5 days
- S: 1-2 days
- M: 3-5 days
- L: 1-2 weeks
- XL: 2-4 weeks
- XXL: too big, needs breakdown

## MoSCoW Prioritization

**M**ust have — core functionality, no compromise. Ship without this = fail.
**S**hould have — important but not critical. Nice to have.
**C**ould have — desirable but not necessary. Adds value.
**W**on't have (this sprint) — explicitly deprioritized.

**Target distribution:**
- Must have: 60% of sprint capacity
- Should have: 20%
- Could have: 20%

**Never fill 100% capacity.** Leave 10-20% buffer for unexpected work.

## Sprint Planning

**Before the planning meeting:**
- Backlog groomed (all stories have acceptance criteria)
- Dependencies identified
- Team capacity known (holidays, part-time, etc.)

**Planning meeting agenda (1 hour / sprint week):**
1. Review sprint goal (5 min)
2. Select stories for sprint (30 min)
3. Break stories into tasks (20 min)
4. Commit to sprint (5 min)

**Definition of Done (checklist):**
- [ ] Code written and reviewed
- [ ] Unit tests passing
- [ ] Feature working on staging environment
- [ ] Documentation updated
- [ ] Product Owner accepted the story

## Risk Management

**Risk matrix:**

| Probability | Impact | Risk Level | Response |
|------------|--------|-----------|---------|
| High | High | Critical | Mitigate immediately |
| High | Low | Medium | Monitor closely |
| Low | High | High | Mitigate with contingency |
| Low | Low | Low | Accept and monitor |

**Common project risks:**
- Unfamiliar technology
- Third-party API reliability
- Key person dependency
- Scope creep
- Underestimated complexity
- Changing requirements mid-sprint

**Risk mitigation tactics:**
- **Spike:** Time-boxed investigation for unknowns (2 days max)
- **Proof of concept:** Build a small prototype before committing
- **Buffer:** Add 20% time buffer to estimates for risky stories
- **Pair programming:** For critical or complex work

## Retrospectives

**Format: Start-Stop-Continue**

**Start:** Things the team should start doing
**Stop:** Things the team should stop doing
**Continue:** Things the team should keep doing

**Action items:** Each retro generates concrete action items. Assign owners and deadlines. Review in next retro.

**5 Whys for recurring problems:**

```
Problem: Sprint deadlines missed 3 times in a row
Why? Stories took longer than estimated
Why? Complex technical dependencies
Why? Stories weren't broken down enough
Why? Team under pressure to keep scope big
Why? No explicit capacity planning
Action: Mandatory story point estimation before sprint planning
```

## Technical Debt

**Track it explicitly.** Not all technical debt is bad — sometimes fast is the right choice.

```typescript
// Track technical debt with TODO comments
// TODO (tech-debt): Replace this legacy auth with OAuth2
//                    tracked in: https://github.com/org/repo/issues/432
//                    estimate: 3 days
//                    impact: security
```

**Pay down debt during "clean-up sprints":** Dedicate 20% of sprint capacity to debt reduction. Never let it grow indefinitely.

## Sprint Board (Trello/Jira/GitHub Projects)

**Columns:**
```
Backlog → Ready → In Progress → In Review → Done
```

**Rules:**
- Every card in "In Progress" must have an owner
- No card in "In Review" older than 2 days
- "Done" column is cleared each sprint
- Backlog is groomed weekly

## Planning Anti-Patterns

**DO NOT:**
- Estimate in hours (leads to false precision)
- Over-scope to impress stakeholders
- Accept a sprint commitment without knowing team capacity
- Skip backlog grooming ("we'll figure it out as we go")
- Let stories stay in "In Review" for days
- Add stories to a running sprint mid-way
