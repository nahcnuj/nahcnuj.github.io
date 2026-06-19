#!/bin/bash
# Hook: Validate Protected Files (Images and VRT Test Data)
# Purpose: Block modifications/deletions of image files and VRT test expected values
# Event: PreToolUse

set -e

# Read JSON input from stdin
input=$(cat)

# Extract tool name and input
toolName=$(echo "$input" | jq -r '.toolName // empty')
toolInput=$(echo "$input" | jq '.toolInput // empty')

# Protected patterns
imageExtensions=(png jpg jpeg gif webp svg bmp ico tiff tif)
vrtPatterns=(
    '*.vrt.test.ts'
    'test-results/*'
    '__snapshots__/*'
    'playwright-report/*'
)

# Function to check if path matches protected patterns
test_protected_path() {
    local path="$1"
    local lowerPath="${path,,}"  # Convert to lowercase for case-insensitive matching

    # Check image extensions
    for ext in "${imageExtensions[@]}"; do
        if [[ "$lowerPath" == *".$ext" ]]; then
            return 0
        fi
    done

    # Check VRT patterns
    for pattern in "${vrtPatterns[@]}"; do
        if [[ "$path" == *$pattern* ]]; then
            return 0
        fi
    done

    return 1
}

# File-modifying tools
fileModifyingTools=(
    'replace_string_in_file'
    'multi_replace_string_in_file'
    'create_file'
    'edit_notebook_file'
    'mcp_github_mcp_se_create_or_update_file'
    'mcp_github_mcp_se_delete_file'
    'mcp_github_mcp_se_push_files'
)

# Check if this is a file-modifying tool
is_file_tool=false
for tool in "${fileModifyingTools[@]}"; do
    if [[ "$toolName" == "$tool" ]]; then
        is_file_tool=true
        break
    fi
done

if [[ "$is_file_tool" == false ]]; then
    # Not a file tool, allow it
    jq -n '{
        hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "allow"
        }
    }'
    exit 0
fi

# Extract target path(s) based on tool type
targetPaths=()

case "$toolName" in
    replace_string_in_file)
        targetPaths+=($(echo "$toolInput" | jq -r '.filePath // empty'))
        ;;
    create_file)
        targetPaths+=($(echo "$toolInput" | jq -r '.filePath // empty'))
        ;;
    edit_notebook_file)
        targetPaths+=($(echo "$toolInput" | jq -r '.filePath // empty'))
        ;;
    mcp_github_mcp_se_delete_file)
        targetPaths+=($(echo "$toolInput" | jq -r '.path // empty'))
        ;;
    mcp_github_mcp_se_create_or_update_file)
        targetPaths+=($(echo "$toolInput" | jq -r '.path // empty'))
        ;;
    multi_replace_string_in_file)
        # Check all files in replacements array
        count=$(echo "$toolInput" | jq '.replacements | length')
        for ((i=0; i<count; i++)); do
            path=$(echo "$toolInput" | jq -r ".replacements[$i].filePath // empty")
            if [[ ! -z "$path" ]]; then
                targetPaths+=("$path")
            fi
        done
        ;;
    mcp_github_mcp_se_push_files)
        # Check all files in files array
        count=$(echo "$toolInput" | jq '.files | length')
        for ((i=0; i<count; i++)); do
            path=$(echo "$toolInput" | jq -r ".files[$i].path // empty")
            if [[ ! -z "$path" ]]; then
                targetPaths+=("$path")
            fi
        done
        ;;
esac

# Check if any target path is protected
for path in "${targetPaths[@]}"; do
    if [[ ! -z "$path" ]] && test_protected_path "$path"; then
        jq -n --arg path "$path" '{
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: ("Cannot modify protected file: " + $path + ". Image files and VRT test data are protected.")
            }
        }'
        exit 2
    fi
done

# Allow the operation
jq -n '{
    hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow"
    }
}'
exit 0
