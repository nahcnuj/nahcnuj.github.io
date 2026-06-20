import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CLIENT_SCRIPT_PATTERN = /src="\/static\/client-[^"]+\.js"/
const ISLAND_PATTERN = /<honox-island/
/** Honox pages rendered through RootLayout include this style tag. */
const HONOX_PAGE_PATTERN = /id="hono-css"/

function listHtmlFiles(dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      files.push(...listHtmlFiles(path))
    } else if (name.endsWith('.html')) {
      files.push(path)
    }
  }
  return files
}

/** @param {string} distDir */
export function verifyClientScriptOnIslandFreePages(distDir) {
  if (!existsSync(distDir)) {
    throw new Error(`dist directory not found: ${distDir}`)
  }

  const islandFreePages = listHtmlFiles(distDir).filter((file) => {
    const html = readFileSync(file, 'utf8')
    return HONOX_PAGE_PATTERN.test(html) && !ISLAND_PATTERN.test(html)
  })

  if (islandFreePages.length === 0) {
    throw new Error('No island-free Honox HTML pages found under dist/')
  }

  const missing = islandFreePages.filter((file) => !CLIENT_SCRIPT_PATTERN.test(readFileSync(file, 'utf8')))

  return {
    checked: islandFreePages.length,
    missing,
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isMain) {
  const distDir = process.argv[2] ?? 'dist'
  const { checked, missing } = verifyClientScriptOnIslandFreePages(distDir)

  if (missing.length > 0) {
    console.error('Island-free pages missing client script:')
    for (const file of missing) {
      console.error(`  ${file}`)
    }
    process.exit(1)
  }

  console.log(`Verified client script on ${checked} island-free page(s)`)
}