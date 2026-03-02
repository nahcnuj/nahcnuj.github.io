import { ssgParams } from 'hono/ssg'
import { createRoute } from 'honox/factory'
import { allOgpPaths, ogpSvg } from '../../lib/ogpSvg'
import { svg2png } from '../../lib/svg2png'

export default createRoute(
  ssgParams(allOgpPaths.map((p) => ({ path: `${p}.png` }))),
  (c) => {
    const rawPath = c.req.param('path') ?? ''
    const articlePath = rawPath.replace(/\.png$/, '')
    return c.body(svg2png(ogpSvg(`${articlePath}.svg`)), 200, { 'Content-Type': 'image/png' })
  },
)
