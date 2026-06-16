---
name: capture-command-output
description: 'Execute shell commands with output redirected to files for inspection. Use when you need to capture, preserve, and review command output (stdout/stderr) without scrolling through terminal history.'
argument-hint: 'Command to run (e.g., npm test, git log, build commands)'
---

# Capture Command Output to Files

Execute shell commands and redirect their standard output and standard error to files for later inspection and analysis.

## When to Use

- **Long-running commands**: Execute async commands without blocking the terminal view
- **Large outputs**: Capture voluminous output that would scroll away in the terminal
- **Debugging**: Preserve error messages and logs for later analysis
- **CI/Build logs**: Keep records of build, test, or deployment command output
- **Command comparison**: Run multiple commands and compare their outputs side-by-side

## Quick Reference

### Basic Pattern

**Terminal (PowerShell):**
```powershell
<command> 2>&1 | Tee-Object -FilePath output.log
```

**Terminal (Bash/sh):**
```bash
<command> 2>&1 | tee output.log
```

### Examples by Use Case

#### Capture Test Output
```powershell
npm test 2>&1 | Tee-Object -FilePath test-output.log
```

#### Capture Build Logs
```powershell
npm run build 2>&1 | Tee-Object -FilePath build.log
```

#### Capture Git Log
```powershell
git log --oneline -n 20 2>&1 | Tee-Object -FilePath git-log.txt
```

#### Capture Error Messages Only
```powershell
npm run lint 2>&1 | Tee-Object -FilePath lint-errors.log
```

## Procedure

1. **Prepare the command**: Identify the shell command you want to run
   - Note the working directory (if not current)
   - Consider if you need both stdout and stderr

2. **Choose output destination**: Decide where to save the log
   - Project root: `build.log`, `test-output.log`
   - Subdirectory: `logs/build-2026-06-16.log`
   - Descriptive filename: Include timestamp if multiple runs needed

3. **Construct the redirect**: Use the platform-appropriate syntax
   - **PowerShell** (Windows): `<command> 2>&1 | Tee-Object -FilePath <filename>`
   - **Bash/sh** (Linux/Mac): `<command> 2>&1 | tee <filename>`
   - `2>&1` redirects stderr to stdout
   - `Tee-Object` / `tee` outputs to both terminal and file simultaneously

4. **Run and monitor**: Execute the command
   - Output appears in real-time in both terminal and file
   - Note the filename for later review

5. **Review output**: Examine the file in VS Code
   - Open the file in editor
   - Search for errors: `Ctrl+F` → `error`
   - Analyze full context without terminal scrollback limits

## File Organization Tips

- Create a `logs/` directory in project root for persistent output files
- Use timestamps in filenames: `test-2026-06-16-143022.log`
- Add `.log` or `.txt` extension for syntax highlighting
- Include the command in a comment at the top of the file for reference

## Avoiding Terminal Bloat

If you have many output files, consider:
- Rotating logs (old ones → archive)
- Filtering before saving: `npm test 2>&1 | Select-String "error" | Tee-Object -FilePath errors.log` (PowerShell)
- Running in background: use `Start-Job` (PowerShell) or `nohup` (Bash)
