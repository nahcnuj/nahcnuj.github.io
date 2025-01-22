import { inspectRoutes } from 'hono/dev'
import { createRoute } from 'honox/factory'
import app from '../server'

const buildTime = new Date()

export default createRoute((c) => {
  const routes = inspectRoutes(app).filter(
    ({ method, isMiddleware, path }) => method === 'GET' && path !== '/sitemap.xml' && !isMiddleware,
  )
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ({ path }) => `
  <url>
    <loc>https://www.nahcnuj.work${path}${path.endsWith('/') ? 'index.html' : '.html'}</loc>
    <lastmod>${buildTime.toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
  )
  .join('')}
</urlset>`,
    200,
    {
      'Content-Type': 'application/xml',
    },
  )
})
