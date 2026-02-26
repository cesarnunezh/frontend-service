# Design Decisions and Rationale

## Repository Structure
We use a consistent top-level layout across all services to simplify onboarding and CI/CD automation:
- `docs/` for Git flow and architecture notes
- `infra/` reserved for Docker/Kubernetes/Terraform artifacts
- `scripts/` for reproducible local/CI tasks
- `src/` for application code
- `tests/` for unit and smoke tests

## CI/CD Alignment
Each repo includes a `Jenkinsfile` with a baseline pipeline that can be extended in later phases.

## Git Flow
Git Flow is used to support parallel feature work, stable releases, and emergency hotfixes.
