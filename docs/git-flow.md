# Git Flow Branching Model

## Branch Types
- `main`: Production-ready code only.
- `develop`: Integration branch for completed work.
- `feature/*`: New feature development, branched from `develop`.
- `release/*`: Release stabilization, branched from `develop`.
- `hotfix/*`: Emergency fixes, branched from `main`.

## Usage Rules
- No direct pushes to `main` or `develop`.
- All changes merge via pull requests.
- `feature/*` merges into `develop`.
- `release/*` merges into `main` and back into `develop`.
- `hotfix/*` merges into `main` and back into `develop`.

## Feature Workflow
1. `git checkout develop`
2. `git checkout -b feature/<short-name>`
3. Work, commit, push, open PR to `develop`.
4. Merge after checks pass.

## Release Workflow
1. `git checkout develop`
2. `git checkout -b release/<version>`
3. Stabilize, fix bugs, update docs.
4. Open PR to `main`.
5. Merge to `main`, tag release.
6. Merge `release/<version>` back into `develop`.

## Hotfix Workflow
1. `git checkout main`
2. `git checkout -b hotfix/<short-name>`
3. Fix and commit.
4. Open PR to `main`.
5. Merge to `main`, tag release.
6. Merge `hotfix/<short-name>` back into `develop`.
