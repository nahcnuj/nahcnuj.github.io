import { Resvg } from '@resvg/resvg-js'
import { ogpSvg } from './ogpSvg'

/**
 * Convert the OGP SVG image for the given SVG filename to PNG.
 * The filename (e.g. `"index.svg"`, `"diary/2020-07-04.svg"`) determines which
 * page's title is rendered into the image.
 */
export function ogpPng(svgFilename: `${string}.svg`): Uint8Array {
  const svg = ogpSvg(svgFilename)
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: true,
    },
  })
  return resvg.render().asPng()
}
