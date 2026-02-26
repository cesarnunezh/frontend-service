# Branch Protection Rules (GitHub)

Apply these settings in GitHub repository settings:
- Protect `main` and `develop`
- Require pull request reviews before merging (minimum 1 approval)
- Require status checks to pass (Jenkins)
- Require branches to be up to date before merging
- Restrict force pushes
- Disallow direct pushes

These rules enforce Git Flow and prevent direct changes to protected branches.
