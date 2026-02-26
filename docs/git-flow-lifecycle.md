# Git Flow Lifecycle Demonstrations

## Feature Branch
1. `git checkout develop`
2. `git checkout -b feature/add-search`
3. Make changes, commit, push.
4. Open PR to `develop`.
5. Merge after Jenkins checks pass.

## Release Branch
1. `git checkout develop`
2. `git checkout -b release/1.0.0`
3. Stabilize changes and update docs.
4. Open PR to `main`.
5. Merge to `main` and tag `v1.0.0`.
6. Merge `release/1.0.0` back into `develop`.

## Hotfix Branch
1. `git checkout main`
2. `git checkout -b hotfix/fix-login`
3. Apply fix, commit, push.
4. Open PR to `main`.
5. Merge to `main` and tag `v1.0.1`.
6. Merge `hotfix/fix-login` back into `develop`.
