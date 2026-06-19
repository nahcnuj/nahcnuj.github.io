#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/**
 * Recursively get all MDX files
 */
function getMdxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip fixtures and node_modules
    if (file === 'fixtures' || file === 'node_modules' || file.startsWith('.')) {
      continue;
    }
    
    if (stat.isDirectory()) {
      getMdxFiles(filePath, fileList);
    } else if (file.endsWith('.mdx')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Check if content contains math expressions with $ or $$
 */
function hasMathExpression(content) {
  // Match $ or $$ that is not escaped and has content
  // Pattern: $$ ... $$ or $ ... $ (but not $$ for single dollars)
  const mathPattern = /\$\$[\s\S]*?\$\$|\$(?!\$).*?\$(?!\$)/;
  return mathPattern.test(content);
}

/**
 * Update usemath in frontmatter, preserving original formatting
 */
function updateUseMathFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    // No frontmatter found
    return content;
  }
  
  const frontmatterStr = match[1];
  const body = match[2];
  const hasMath = hasMathExpression(body);
  
  // Check if usemath line exists
  const usemathLineMatch = frontmatterStr.match(/^usemath:\s*(true|false)\s*$/m);
  
  let newFrontmatterStr;
  
  if (hasMath) {
    // Need usemath: true
    if (usemathLineMatch && usemathLineMatch[1] === 'true') {
      // Already has usemath: true, no change needed
      return content;
    } else if (usemathLineMatch) {
      // Replace existing usemath: false with usemath: true
      newFrontmatterStr = frontmatterStr.replace(/^usemath:\s*false\s*$/m, 'usemath: true');
    } else {
      // Add usemath: true at the end
      newFrontmatterStr = frontmatterStr.trimEnd() + '\nusemath: true';
    }
  } else {
    // No math, remove usemath if it exists
    if (usemathLineMatch) {
      newFrontmatterStr = frontmatterStr.replace(/^usemath:.*$/m, '').replace(/\n\n+/g, '\n');
    } else {
      // Already doesn't have usemath, no change needed
      return content;
    }
  }
  
  return `---\n${newFrontmatterStr}\n---\n${body}`;
}

/**
 * Main function
 */
async function main() {
  const appRoutesDir = path.join(rootDir, 'app/routes');
  const files = getMdxFiles(appRoutesDir);
  
  console.log(`Found ${files.length} MDX files to process`);
  
  let updated = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const newContent = updateUseMathFrontmatter(content);
      
      if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf-8');
        
        // Check if usemath is true or not
        const usemathMatch = newContent.match(/^usemath:\s*(true|false)\s*$/m);
        const usemath = usemathMatch ? usemathMatch[1] : 'removed';
        
        console.log(`✓ ${path.relative(rootDir, file)} (usemath: ${usemath})`);
        updated++;
      }
    } catch (error) {
      console.error(`✗ ${path.relative(rootDir, file)}: ${error.message}`);
    }
  }
  
  console.log(`\nUpdated ${updated} file(s)`);
}

main();
