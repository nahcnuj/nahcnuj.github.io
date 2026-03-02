import { Resvg } from '@resvg/resvg-js'

/**
 * Convert an SVG string to PNG binary data.
 */
export function svg2png(svg: string): Uint8Array {
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: true,
    },
  })
  return resvg.render().asPng()
}
