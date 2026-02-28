# Automation Strategy

## Objectives
- Catch regressions in critical user flows before merge
- Validate UI behavior without requiring live Graph access in CI
- Keep feedback fast for developers

## Current Automated Layers
- Unit/Component tests: Vitest + Testing Library
- CI checks: install, build, test run on push/PR

## Covered Scenarios
- App authentication gate and sign-in transition
- Dashboard task creation and status movement
- Teams integration panel empty/success/license-error flows

## Suggested Next Increment (Optional)
- Add Playwright E2E smoke tests for real browser rendering
- Add mocked API contract tests around `graphService`
- Add quality gates: minimum coverage threshold and flaky-test tracking

## Local Commands
- `npm run test` for watch mode
- `npm run test:run` for one-time CI-style run
- `npm run test:coverage` for coverage report
