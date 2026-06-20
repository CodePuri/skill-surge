# Autonomous Automation Setup

## 1. GitHub

1. Enable GitHub Actions and repository auto-merge for `CodePuri/skill-surge`.
2. Protect `main`: require pull requests, require the `merge-gate` status check, require branches to be current, block force pushes, and allow squash merges.
3. Create labels: `automation:cycle`, `automation:release`, `automation:blocked`, and `automation:rollback`.
4. Confirm `gh auth status` shows an account with repository access.

## 2. npm

1. In the `skill-surge` package settings, configure GitHub Actions trusted publishing for `CodePuri/skill-surge` and `.github/workflows/publish.yml`.
2. Permit `npm publish` and require two-factor authentication while disallowing legacy write tokens.
3. Confirm the release workflow uses Node 24 and npm 11.5.1 or newer.

## 3. Platform Credentials

Create `~/.config/skill-surge/automation.env`, set permissions with `chmod 600`, and define:

```bash
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REFRESH_TOKEN=
X_USER_ID=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_REFRESH_TOKEN=
REDDIT_USER_AGENT=macos:skill-surge-automation:1.0.0:by_CodePuri
SUBSTACK_PUBLICATION_URL=
SUBSTACK_STORAGE_STATE=~/.config/skill-surge/substack.storage-state.json
```

Do not place this file or its values in the repository, GitHub Issues, screenshots, or command output.

## 4. Substack Session

Run `npm run automation:substack-auth`, sign in once in the opened browser, and confirm the storage state is written outside the repository with permissions `0600`.

## 5. Preflight and Activation

```bash
npm ci
npm run build
npm test
npm run automation:preflight
npm run automation:dry-run
```

The preflight must validate GitHub access, npm metadata, credentials, Substack session state, policy configuration, and kill switches without publishing.

After preflight, approve the proposed Codex automation update and creation. The repair job runs Monday at 09:00 Asia/Kolkata; publication runs Monday at 15:00 Asia/Kolkata.

## 6. Emergency Controls

```bash
touch ~/.config/skill-surge/PAUSE_ALL
touch ~/.config/skill-surge/PAUSE_SELF_IMPROVE
touch ~/.config/skill-surge/PAUSE_PUBLISH
```

Remove the relevant file to allow the next scheduled run. A paused run must exit before loading credentials or making network writes.
