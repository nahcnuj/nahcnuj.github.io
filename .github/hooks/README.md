# Hooks

This directory contains GitHub Copilot agent customization hooks that enforce policies and validate tool operations.

## Hooks Registered

### `validate-protected-files` (`PreToolUse`)

**Purpose**: Block modifications and deletions of protected files.

**Protected File Patterns**:
- **Image files**: Any files with extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp`, `.ico`, `.tiff`, `.tif`
- **VRT test data**: 
  - `*.vrt.test.ts` - Visual regression test files
  - `test-results/*` - VRT baseline snapshots
  - `__snapshots__/*` - Snapshot test data
  - `playwright-report/*` - Playwright test reports

**Behavior**: When the agent attempts to modify or delete a protected file using any file-modification tool (e.g., `replace_string_in_file`, `create_file`, etc.), the hook will:
1. Reject the operation immediately
2. Return an error message explaining which file is protected and why

**Example Rejection**:
```
Cannot modify protected file: public/img/logo.png. 
Image files and VRT test data are protected.
```

## Implementation

- **Cross-platform**: Uses PowerShell on Windows, Bash on Linux/macOS
- **Hook type**: `PreToolUse` - executes before any tool invocation
- **Timeout**: 5 seconds
- **Exit codes**:
  - `0`: Operation allowed
  - `2`: Operation blocked (blocking error)

## Protected Tools

The hook monitors and can block these file-modification tools:
- `replace_string_in_file`
- `multi_replace_string_in_file`
- `create_file`
- `edit_notebook_file`
- `mcp_github_mcp_se_create_or_update_file` (GitHub API)
- `mcp_github_mcp_se_delete_file` (GitHub API)
- `mcp_github_mcp_se_push_files` (GitHub API)

## Why These Files Are Protected

1. **Image files**: Hand-crafted visual assets should not be modified by the agent. Screenshots, graphics, and design elements require human review.
2. **VRT test baselines**: Visual regression test snapshots are the source of truth for expected visual output. Modifying them bypasses the testing validation that catches unintended visual changes.
3. **VRT test code**: Test files that define expected visual behavior must be carefully managed to ensure regressions are properly detected.

## Overriding (Admin Only)

To temporarily disable protection during legitimate updates (e.g., intentional visual changes approved by team):
1. Update the `vrtPatterns` or `imageExtensions` arrays in the validation scripts
2. Commit changes to the repository
3. Notify team members of any changes to protected patterns

## Configuration

See [hooks.json](./hooks.json) for the hook configuration.
