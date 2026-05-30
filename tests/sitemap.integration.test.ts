import { describe, expect, it } from 'vitest'
import app from '../app/server'

describe('sitemap.xml', () => {
  it('keeps .xml extension for feed URL', async () => {
    const res = await app.request('http://localhost/sitemap.xml')
    expect(res.status).toBe(200)
    const xml = await res.text()
    expect(xml).toContain('<loc>https://www.nahcnuj.work/feed.xml</loc>')
    expect(xml).not.toContain('feed.xml.html')
  })
})
