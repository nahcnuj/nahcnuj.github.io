/**
 * E2E test: verify that `npm run dev` serves all fixture MDX files as pages.
 *
 * The `devFixturesPlugin` in vite.config.ts copies files from `app/fixtures/`
 * to `app/routes/` when the dev server starts.  These tests confirm that every
 * MDX file discovered under `app/fixtures/` is reachable via HTTP (HTTP 200)
 * when the dev server is running.
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const fixtureModules = import.meta.glob('../app/fixtures/**/*.mdx')
const fixtureRoutes = Object.keys(fixtureModules).map((modulePath) =>
  modulePath.replace(/^\.\.\/app\/fixtures/, '').replace(/\.mdx$/, '')
)

describe('dev server (npm run dev): all fixture MDX files are routed correctly', () => {
  let devProcess: ChildProcess
  let baseUrl: string

  beforeAll(async () => {
    baseUrl = await new Promise<string>((resolve, reject) => {
      devProcess = spawn('npm', ['run', 'dev'], { stdio: 'pipe' })

      devProcess.stdout?.on('data', (data: Buffer) => {
        const plain = data.toString().replace(/\x1b\[[0-9;]*m/g, '')
        const match = plain.match(/https?:\/\/localhost:\d+/)
        if (match) {
          resolve(match[0])
        }
      })

      devProcess.on('error', reject)
      devProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`npm run dev exited with code ${code}`))
        }
      })
    })
  }, 60_000)

  afterAll(() => {
    devProcess?.kill()
  })

  for (const route of fixtureRoutes) {
    it(`serves ${route} (HTTP 200)`, async () => {
      const res = await fetch(`${baseUrl}${route}`, { redirect: 'manual' })
      expect(res.status).toBe(200)
    })
  }
})
