# Hook: Validate Protected Files (Images and VRT Test Data)
# Purpose: Block modifications/deletions of image files and VRT test expected values
# Event: PreToolUse

param()

$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

$toolName = $input.toolName
$toolInput = $input.toolInput

# Protected patterns
$imageExtensions = @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif')
$vrtPatterns = @(
    '*.vrt.test.ts',
    'test-results/*',
    '__snapshots__/*',
    'playwright-report/*'
)

function Test-ProtectedPath {
    param([string]$path)
    
    # Normalize path
    $normalizedPath = $path -replace '\\', '/'
    
    # Check image extensions
    foreach ($ext in $imageExtensions) {
        if ($normalizedPath -like "*$ext") {
            return $true
        }
    }
    
    # Check VRT patterns
    foreach ($pattern in $vrtPatterns) {
        if ($normalizedPath -like "*$pattern") {
            return $true
        }
    }
    
    return $false
}

# Tools that modify files
$fileModifyingTools = @(
    'replace_string_in_file',
    'multi_replace_string_in_file',
    'create_file',
    'edit_notebook_file',
    'mcp_github_mcp_se_create_or_update_file',
    'mcp_github_mcp_se_delete_file',
    'mcp_github_mcp_se_push_files'
)

# Check if this is a file-modifying tool
if ($toolName -notin $fileModifyingTools) {
    # Not a file tool, allow it
    $output = @{
        hookSpecificOutput = @{
            hookEventName = "PreToolUse"
            permissionDecision = "allow"
        }
    }
    Write-Output ($output | ConvertTo-Json -Depth 10)
    exit 0
}

# Check the target file
$targetPath = $null

switch ($toolName) {
    'replace_string_in_file' {
        $targetPath = $toolInput.filePath
    }
    'create_file' {
        $targetPath = $toolInput.filePath
    }
    'edit_notebook_file' {
        $targetPath = $toolInput.filePath
    }
    'multi_replace_string_in_file' {
        # Check all files in replacements array
        if ($toolInput.replacements -is [array]) {
            foreach ($replacement in $toolInput.replacements) {
                if (Test-ProtectedPath $replacement.filePath) {
                    $output = @{
                        hookSpecificOutput = @{
                            hookEventName = "PreToolUse"
                            permissionDecision = "deny"
                            permissionDecisionReason = "Cannot modify protected file: $($replacement.filePath). Image files and VRT test data are protected."
                        }
                    }
                    Write-Output ($output | ConvertTo-Json -Depth 10)
                    exit 2
                }
            }
        }
        exit 0
    }
    'mcp_github_mcp_se_delete_file' {
        $targetPath = $toolInput.path
    }
    'mcp_github_mcp_se_create_or_update_file' {
        $targetPath = $toolInput.path
    }
    'mcp_github_mcp_se_push_files' {
        # Check all files in the files array
        if ($toolInput.files -is [array]) {
            foreach ($file in $toolInput.files) {
                if (Test-ProtectedPath $file.path) {
                    $output = @{
                        hookSpecificOutput = @{
                            hookEventName = "PreToolUse"
                            permissionDecision = "deny"
                            permissionDecisionReason = "Cannot modify protected file: $($file.path). Image files and VRT test data are protected."
                        }
                    }
                    Write-Output ($output | ConvertTo-Json -Depth 10)
                    exit 2
                }
            }
        }
        exit 0
    }
}

# Check if target path is protected
if ($targetPath -and (Test-ProtectedPath $targetPath)) {
    $output = @{
        hookSpecificOutput = @{
            hookEventName = "PreToolUse"
            permissionDecision = "deny"
            permissionDecisionReason = "Cannot modify protected file: $targetPath. Image files and VRT test data are protected."
        }
    }
    Write-Output ($output | ConvertTo-Json -Depth 10)
    exit 2
}

# Allow the operation
$output = @{
    hookSpecificOutput = @{
        hookEventName = "PreToolUse"
        permissionDecision = "allow"
    }
}
Write-Output ($output | ConvertTo-Json -Depth 10)
exit 0
