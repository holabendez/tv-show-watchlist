# Agent Rules for TV Show Watchlist

## Testing
- Whenever new functionality is built or significant code changes are made, you must run the regression tests (`npm test` or `npm run test`) to ensure existing functionality is not broken.

## Post-Deployment Follow-ups
- Whenever new functionality is built and approved to be merged to master and deployed to production, you MUST automatically perform these follow-up steps:
  1. Document the addition of this new functionality in the project documentation (e.g., `README.md` or a `CHANGELOG.md`).
  2. Create or verify automated tests for regression testing of the new feature to ensure its logic and UI interactions are covered.
