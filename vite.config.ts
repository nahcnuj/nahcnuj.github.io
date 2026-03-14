import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import ssg from '@hono/vite-ssg'
import mdx from '@mdx-js/rollup'
import honox from 'honox/vite'
import client from 'honox/vite/client'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig, type Plugin } from 'vite'

function devFixturesPlugin(): Plugin {
  const copiedPaths: string[] = []
  return {
    name: 'dev-fixtures',
    apply: 'serve',
    configureServer(server) {
      const fixturesDir = join(process.cwd(), 'app/fixtures')
      const routesDir = join(process.cwd(), 'app/routes')

      for (const dir of readdirSync(fixturesDir, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue
        const srcDir = join(fixturesDir, dir.name)
        const destDir = join(routesDir, dir.name)
        for (const file of readdirSync(srcDir)) {
          const dest = join(destDir, file)
          if (!existsSync(dest)) {
            mkdirSync(destDir, { recursive: true })
            cpSync(join(srcDir, file), dest)
            copiedPaths.push(dest)
          }
        }
      }

      server.httpServer?.once('close', () => {
        for (const file of copiedPaths) {
          rmSync(file, { force: true })
        }
      })
    },
  }
}

const entry = './app/server.ts'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [client()],
    }
  }
  return {
    build: {
      emptyOutDir: false,
    },
    ssr: {
      external: ['@resvg/resvg-js', '@oxc-project/runtime'],
    },
    plugins: [
      devFixturesPlugin(),
      honox(),
      ssg({ entry }),
      mdx({
        jsxImportSource: 'hono/jsx',
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [
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
