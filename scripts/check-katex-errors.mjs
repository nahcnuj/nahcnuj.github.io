#!/usr/bin/env node

/**
 * Comprehensive KaTeX error detection script
 * 
 * Detects:
 * 1. katex-error HTML elements
 * 2. KaTeX ParseError patterns in HTML content
 * 3. Unknown command errors
 * 4. Various KaTeX rendering failures
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '../dist')

// Recursively find all HTML files
function findHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip common non-content directories
      if (!['_nuxt', 'node_modules', '.git'].includes(entry.name)) {
        findHtmlFiles(path.join(dir, entry.name), files)
      }
    } else if (entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name))
    }
  }
  return files
}

// Error patterns to detect
const errorPatterns = [
  {
    name: 'KaTeX Error Span',
    pattern: /class="katex-error"/g,
    severity: 'error'
  },
  {
    name: 'ParseError in HTML',
    pattern: /ParseError|parse error/gi,
    severity: 'error'
  },
  {
    name: 'Unknown Command',
    pattern: /Unknown command|undefined control sequence/gi,
    severity: 'error'
  },
  {
    name: 'KaTeX Failure Message',
    pattern: /\[object Object\].*?katex|KaTeX.*?failed|rendering.*?failed/gi,
    severity: 'error'
  },
  {
    name: 'Expected EOF Error',
    pattern: /Expected.*?EOF|Unexpected.*?token/gi,
    severity: 'error'
  },
  {
    name: 'Math Mode Error',
    pattern: /can only be used in.*?mode|not allowed in.*?mode/gi,
    severity: 'error'
  }
]

const results = {
  total: 0,
  errors: [],
  files_with_errors: new Set(),
  pattern_counts: {}
}

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error(`❌ dist directory not found at ${distDir}`)
  process.exit(1)
}

console.log(`📂 Scanning for KaTeX errors in: ${distDir}\n`)

// Find all HTML files
const htmlFiles = findHtmlFiles(distDir)
  .map(f => path.relative(distDir, f))
  .sort()

console.log(`📄 Found ${htmlFiles.length} HTML files to check\n`)

// Check each file
htmlFiles.forEach((file) => {
  const filePath = path.join(distDir, file)
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    errorPatterns.forEach((pattern) => {
      const matches = content.match(pattern.pattern)
      if (matches) {
        results.files_with_errors.add(file)
        
        if (!results.pattern_counts[pattern.name]) {
          results.pattern_counts[pattern.name] = 0
        }
        results.pattern_counts[pattern.name] += matches.length
        
        // Extract context around error
        const lines = content.split('\n')
        lines.forEach((line, lineNum) => {
          if (pattern.pattern.test(line)) {
            results.errors.push({
              file,
              line: lineNum + 1,
              pattern: pattern.name,
              severity: pattern.severity,
              context: line.substring(0, 200)
            })
            results.total++
          }
        })
      }
    })
  } catch (err) {
    console.error(`⚠️  Error reading ${file}: ${err.message}`)
  }
})

// Report results
if (results.total > 0) {
  console.log(`\n❌ KaTeX ERRORS DETECTED:\n`)
  
  // Summary by pattern
  console.log('📊 Error Summary:')
  Object.entries(results.pattern_counts).forEach(([pattern, count]) => {
    console.log(`   ${pattern}: ${count} occurrence(s)`)
  })
  
  // Files with errors
  console.log(`\n📁 Files with errors (${results.files_with_errors.size}):`)
  Array.from(results.files_with_errors).slice(0, 10).forEach((file) => {
    console.log(`   - ${file}`)
  })
  
  if (results.files_with_errors.size > 10) {
    console.log(`   ... and ${results.files_with_errors.size - 10} more`)
  }
  
  // Detailed errors (first 5)
  console.log(`\n🔍 Error Details (first 5):`)
  results.errors.slice(0, 5).forEach((err) => {
    console.log(`   ${err.file}:${err.line}`)
    console.log(`   Pattern: ${err.pattern}`)
    console.log(`   Context: ${err.context.substring(0, 100)}...`)
    console.log()
  })
  
  // Write detailed log
  const logFile = path.resolve(distDir, '../katex-errors-detailed.log')
  fs.writeFileSync(logFile, JSON.stringify(results, null, 2))
  console.log(`📝 Detailed log written to: ${logFile}`)
  
  process.exit(1)
} else {
  console.log(`✅ No KaTeX errors detected in ${htmlFiles.length} files`)
  process.exit(0)
}
