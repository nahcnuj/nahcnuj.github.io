import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import ssg from '@hono/vite-ssg'
import mdx from '@mdx-js/rollup'
import honox from 'honox/vite'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMath from 'remark-math'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig, type Plugin } from 'vite'
import { rehypeDecodeHtmlEntitiesInMath } from './app/lib/rehypeDecodeHtmlEntitiesInMath'
import { rehypeWrapDisplayMath } from './app/lib/rehypeWrapDisplayMath'
import { remarkAlignEnvironments } from './app/lib/remarkAlignEnvironments'

function fixMdxAlignEnvironmentsPlugin(): Plugin {
  return {
    name: 'fix-mdx-align-environments',
    transform(code, id) {
      if (!id.endsWith('.mdx') && !id.endsWith('.md')) return null
      if (!code.includes('\\begin{aligned')) return null

      const before = code
      let modified = code

      // Convert aligned environment to align* and remove & characters
      // aligned + & causes KaTeX parsing errors, but align* doesn't use &
      modified = modified.replace(/\\begin\{aligned\}/g, '\\begin{align*}')
      modified = modified.replace(/\\end\{aligned\}/g, '\\end{align*}')

      // Debug: show what we're working with before & removal
      if (id.includes('derive-fourier')) {
        const alignBlocks = [...modified.matchAll(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g)]
        console.log(`[fixMdxAlign] Found ${alignBlocks.length} align blocks`)
        alignBlocks.forEach((match, idx) => {
          console.log(`[fixMdxAlign] Block ${idx} char count: ${match[1].length}`)
          console.log(`[fixMdxAlign] Block ${idx} first 50 chars: ${match[1].substring(0, 50)}`)
        })
      }

      // Remove all & characters
      modified = modified.replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g, (match) => {
        return match.replace(/&/g, '')
      })

      if (modified !== before) {
        console.log(`[fixMdxAlign] converted aligned to align* and removed & in ${id.substring(id.lastIndexOf('/'))}`)
        return { code: modified }
      }
      return null
    },
  }
}

function devFixturesPlugin(): Plugin {
  const copiedPaths: string[] = []
  return {
    name: 'dev-fixtures',
    configureServer(server) {
      const fixturesDir = join(process.cwd(), 'app/fixtures')
      const routesDir = join(process.cwd(), 'app/routes')

      function copyMdxFiles(srcDir: string, destDir: string) {
        let destDirCreated = false
        for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
          const srcPath = join(srcDir, entry.name)
          const destPath = join(destDir, entry.name)
          if (entry.isDirectory()) {
            copyMdxFiles(srcPath, destPath)
          } else if (entry.name.endsWith('.mdx')) {
            if (!destDirCreated) {
              mkdirSync(destDir, { recursive: true })
              destDirCreated = true
            }
            cpSync(srcPath, destPath)
            copiedPaths.push(destPath)
          }
        }
      }

      copyMdxFiles(fixturesDir, routesDir)

      server.httpServer?.once('close', () => {
        for (const file of copiedPaths) {
          rmSync(file, { force: true })
        }
      })
    },
  }
}

const entry = './app/server.ts'

export default defineConfig(({ command, mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: { input: ['/app/client.ts'] },
        assetsDir: 'static',
        manifest: true,
      },
      oxc: {
        jsx: { importSource: 'hono/jsx/dom' },
      },
    }
  }
  return {
    build: {
      emptyOutDir: false,
    },
    ssr: {
      external: ['@resvg/resvg-js', '@oxc-project/runtime'],
    },
    test: {
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
    },
    plugins: [
      fixMdxAlignEnvironmentsPlugin(),
      ...(command === 'serve' && mode === 'development' ? [devFixturesPlugin()] : []),
      honox(),
      ssg({ entry }),
      mdx({
        jsxImportSource: 'hono/jsx',
        markdown: {
          breaks: false,
        },
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkMath, remarkAlignEnvironments],
        rehypePlugins: [
          rehypeDecodeHtmlEntitiesInMath,
          [
            rehypeKatex,
            {
              strict: false,
              trust: true,
              output: 'htmlAndMathml',
            },
          ],
          rehypeWrapDisplayMath,
          () =>
            rehypeExternalLinks({
              rel: ['nofollow', 'noopener', 'noreferrer'],
              target: '_blank',
              content: { type: 'text', value: ' ⧉' },
              contentProperties: {
                'aria-label': 'open in new window',
                style: 'padding-inline-end:0.5ex;font-size:small;vertical-align:middle',
              },
            }),
          rehypeSlug,
        ],
      }),
    ],
  }
})
