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
import { remarkAlignEnvironments } from './app/lib/remarkAlignEnvironments'
import { rehypeWrapDisplayMath } from './app/lib/rehypeWrapDisplayMath'

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
      ...(command === 'serve' && mode === 'development' ? [devFixturesPlugin()] : []),
      honox(),
      ssg({ entry }),
      mdx({
        jsxImportSource: 'hono/jsx',
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkMath, remarkAlignEnvironments],
        rehypePlugins: [
          [
            rehypeKatex,
            {
              strict: false,
              trust: true,
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
