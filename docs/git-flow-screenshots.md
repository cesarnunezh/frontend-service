# Screenshot Capture Guide

Capture screenshots for each step below.

## Initial Branch Setup
- Show `main` and `develop` branches after creation.
- Capture GitHub branches view.

## Feature Workflow
- Create `feature/*` branch.
- Commit and push.
- Open PR to `develop`.
- Merge after checks pass.

## Release Workflow
- Create `release/*` from `develop`.
- Open PR to `main`.
- Merge and tag release.
- Merge back into `develop`.

## Hotfix Workflow
- Create `hotfix/*` from `main`.
- Open PR to `main`.
- Merge and tag hotfix.
- Merge back into `develop`.

## Git Flow Interaction Graph
- Run: `git log --graph --oneline --decorate --all`
- Capture output showing all branch types.
