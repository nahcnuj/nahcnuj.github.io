---
description: "Use when completing feature implementation, bug fixes, or making code changes to this repository. Ensures PR and CI workflow is followed correctly for feature branches."
---

# CI/GitHub Actions Workflow Requirements

When completing work on this repository, follow this workflow to ensure changes are properly validated:

## 1. Create or Update Pull Request

At the end of your work:
- **Create a new PR** if one doesn't exist yet for your branch
- **Update the existing PR** if one already exists
- PR title should clearly describe the changes
- PR description should include:
  - Summary of changes
  - Why the changes are needed
  - Any relevant file modifications
  - Testing notes (local test results, VRT baseline updates, etc.)

```bash
# Verify the PR exists at https://github.com/nahcnuj/nahcnuj.github.io/pull/[number]
```

## 2. Verify CI Passes

After the PR is created/updated:
- **Wait for GitHub Actions to run** (CI job automatically triggers on PR)
- **Check the PR status** for all checks to pass (green checkmarks)
- **Key CI job**: `e2e` test suite with Playwright visual regression tests
- **Expected**: All tests should pass on Linux environment (ubuntu-latest)

## 3. Handle CI Failures

If CI tests fail:

1. **Review the logs** in GitHub Actions
   - Click "Details" on the failing check
   - Look for error messages, assertion failures, or rendering issues
2. **Identify the root cause** from log output
3. **Make necessary fixes** locally
4. **Push fixes to the same branch** (PR automatically updates)
5. **Wait for CI to re-run** and verify all tests pass
6. **Repeat until all tests pass**

### Common Issues
- **VRT test failures**: Visual rendering mismatch → Check baseline screenshots or rendering changes
- **Build failures**: Compilation errors → Fix TypeScript, MDX, or build configuration issues
- **E2E test failures**: Test assertion failures → Verify page rendering, element presence, or styling

## Workflow Checklist

- [ ] Code changes complete and locally tested
- [ ] Commit(s) pushed to feature branch
- [ ] PR created or updated with clear description
- [ ] GitHub Actions CI job triggered (watch for workflow in Actions tab)
- [ ] All checks pass (green status on PR)
- [ ] If tests fail, logs reviewed and fixes implemented
- [ ] All tests pass on final run before marking as ready
- [ ] Ready to merge or request review

## Example: KaTeX Fix Workflow

1. Implement math rendering fix
2. Run local tests: `npm run build && npm run test:vrt`
3. Update PR #711 with changes and testing results
4. Push to `feat/katex` branch
5. GitHub Actions runs automatically on PR
6. If tests fail on Linux, check logs and update code
7. Push fixes, wait for re-run
8. Once all tests pass, PR is ready for merge
