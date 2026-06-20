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

const fixtureModules = import.meta.glob('../../app/fixtures/**/*.mdx')
const fixtureRoutes = Object.keys(fixtureModules).map((modulePath) =>
  modulePath.replace(/^\.\.\/\.\.\/app\/fixtures/, '').replace(/\.mdx$/, ''),
)

describe('dev server (npm run dev): all fixture MDX files are routed correctly', () => {
  let devProcess: ChildProcess
  let baseUrl: string

  beforeAll(async () => {
    baseUrl = await new Promise<string>((resolve, reject) => {
      devProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        env: { ...process.env, NO_COLOR: '1' },
        detached: process.platform !== 'win32',
        shell: process.platform === 'win32',
      })

      devProcess.stdout?.on('data', (data: Buffer) => {
        const match = data.toString().match(/https?:\/\/localhost:\d+/)
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

  afterAll(async () => {
    if (!devProcess) return

    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(devProcess.pid), '/T', '/F'], { shell: true })
      return
    }

    await new Promise<void>((resolve) => {
      const pid = devProcess.pid
      const killTimeout = setTimeout(() => {
        try {
          if (pid) process.kill(-pid, 'SIGKILL')
          else devProcess.kill('SIGKILL')
        } catch {
          /* already dead */
        }
        resolve()
      }, 5_000)
      devProcess.on('close', () => {
        clearTimeout(killTimeout)
        resolve()
      })
      try {
        if (pid) process.kill(-pid, 'SIGTERM')
        else devProcess.kill('SIGTERM')
      } catch {
        resolve()
      }
    })
  })

  it('discovers at least one fixture MDX file', () => {
    expect(fixtureRoutes.length).toBeGreaterThan(0)
  })

  for (const route of fixtureRoutes) {
    it(`serves ${route} (HTTP 200)`, async () => {
      const res = await fetch(`${baseUrl}${route}`, { redirect: 'manual' })
      expect(res.status).toBe(200)
    })
  }
})
