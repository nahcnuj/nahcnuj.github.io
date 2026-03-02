import { ssgParams } from 'hono/ssg'
import { createRoute } from 'honox/factory'
import { ogpPng } from '../../lib/ogpPng'
import { allOgpPaths } from '../../lib/ogpSvg'

export default createRoute(
  ssgParams(allOgpPaths.map((p) => ({ path: `${p}.png` }))),
  (c) => {
    const rawPath = c.req.param('path') ?? ''
    const articlePath = rawPath.replace(/\.png$/, '')
    return c.body(ogpPng(`${articlePath}.svg`), 200, { 'Content-Type': 'image/png' })
  },
)
