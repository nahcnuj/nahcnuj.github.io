import { cpSync, createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import rehypeMathML from '@daiji256/rehype-mathml'
import ssg from '@hono/vite-ssg'
import mdx from '@mdx-js/rollup'
import honox from 'honox/vite'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import { rehypeDownloadLinks, remarkDownloadAdPopup } from './app/lib/downloadAd'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMath from 'remark-math'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig, type Plugin } from 'vite'

function devFixturesPlugin(): Plugin {
  const copiedPaths: string[] = []
  return {
    name: 'dev-fixtures',
    configureServer(server) {
      const fixturesDir = join(process.cwd(), 'app/fixtures')
      const routesDir = join(process.cwd(), 'app/routes')

      function copyFixtureFiles(srcDir: string, destDir: string) {
        for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
          const srcPath = join(srcDir, entry.name)
          const destPath = join(destDir, entry.name)
          if (entry.isDirectory()) {
            copyFixtureFiles(srcPath, destPath)
          } else if (!entry.name.startsWith('.')) {
            mkdirSync(destDir, { recursive: true })
            cpSync(srcPath, destPath)
            copiedPaths.push(destPath)
          }
        }
      }

      copyFixtureFiles(fixturesDir, routesDir)

      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? '').split('?')[0] ?? '')
        const relativePath = pathname.replace(/^\//, '')
        if (!relativePath || relativePath.includes('..')) {
          next()
          return
        }

        const fixturePath = join(fixturesDir, relativePath)
        if (!existsSync(fixturePath) || !statSync(fixturePath).isFile() || extname(fixturePath) === '.mdx') {
          next()
          return
        }

        const ext = extname(fixturePath).toLowerCase()
        const contentTypes: Record<string, string> = {
          '.pdf': 'application/pdf',
        }
        res.setHeader('Content-Type', contentTypes[ext] ?? 'application/octet-stream')
        if (ext === '.pdf') {
          res.setHeader('Content-Disposition', 'inline')
        }

        const stream = createReadStream(fixturePath)
        stream.on('error', (err) => next(err))
        stream.pipe(res)
      })

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
        remarkPlugins: [remarkFrontmatter, remarkDownloadAdPopup, remarkMdxFrontmatter, remarkMath],
        rehypePlugins: [
          rehypeMathML,
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
          rehypeDownloadLinks,
          rehypeSlug,
        ],
      }),
    ],
  }
})
