# Contributing

Thanks for contributing! Please follow these guidelines to make PRs easier to review.

## Branches & PRs
- Use feature branches with descriptive names (e.g., `feat/ci-gating`).
- Open a Pull Request against `main` and add a short description and checklist.

## Local checks before opening PR
- Run `npm ci` to install dependencies.
- Run `npm run lint` and fix issues.
- Run `npm run check` to type-check the code.
- Run `npm run test:unit` to ensure unit tests pass.
- Run `npm run build` to verify production build.

## Tests
- Add unit tests for new features and bug fixes.
- Use existing test patterns; prefer pure functions and avoid heavy integration where possible.

## CI & Reviews
- PRs require passing CI (lint/check/tests/build) and at least one approving review before merge.

## Security
- Do not commit secrets or credentials. Use GitHub Secrets for CI and env-sensitive values.

---
Thank you for helping make the project better!