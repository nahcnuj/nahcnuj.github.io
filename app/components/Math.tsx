import { css } from 'hono/css'
import katex from 'katex'

const upperLatinAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * @see https://en.wikipedia.org/wiki/Mathematical_Alphanumeric_Symbols
 */
const variantIrregularMapping: Record<string, Record<string, number>> = {
  italic: {
    h: 0x210e,
  },
  'double-struck': {
    C: 0x2102,
    H: 0x210d,
    N: 0x2115,
    P: 0x2119,
    Q: 0x211a,
    R: 0x211d,
    Z: 0x2124,
  },
  fraktur: {
    C: 0x212d,
    H: 0x210c,
    I: 0x2111,
    R: 0x211c,
    Z: 0x2128,
  },
  script: {
    B: 0x212c,
    E: 0x2130,
    F: 0x2131,
    H: 0x210b,
    I: 0x2110,
    L: 0x2112,
    M: 0x2133,
    R: 0x211b,
    e: 0x212f,
    g: 0x210a,
    o: 0x2134,
  },
}
/**
 * @see https://en.wikipedia.org/wiki/Mathematical_Alphanumeric_Symbols
 */
const variantRegularMapping: Record<string, [number, number]> = {
  normal: [0x41, 0x61],
  italic: [0x1d434, 0x1d44e],
  bold: [0x1d400, 0x1d41a],
  'bold-italic': [0x1d468, 0x1d482],
  'sans-serif': [0x1d5a0, 0x1d5ba],
  monospace: [0x1d670, 0x1d68a],
  'double-struck': [0x1d538, 0x1d552],
  fraktur: [0x1d504, 0x1d51e],
  script: [0x1d49c, 0x1d4b6],
}
const replace = (variant: keyof typeof variantRegularMapping, char: LatinAlphabet) =>
  `&#x${(
    variantIrregularMapping[variant]?.[char] ??
    variantRegularMapping[variant][upperLatinAlphabets.includes(char) ? 0 : 1] +
      upperLatinAlphabets.indexOf(char.toUpperCase())
  ).toString(16)};`

const inlineMathClass = css`
  & .katex {
    margin-inline: 0.5ex;
  }
`

/**
 * インライン数式
 *
 * @example
 * ```tsx
 * - <InlineMath>{String.raw`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`}</InlineMath>
 * - mathrm <InlineMath>{String.raw`\mathrm{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - mathnormal <InlineMath>{String.raw`\mathnormal{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - textrm <InlineMath>{String.raw`\textrm{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - rm <InlineMath>{String.raw`\rm ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`}</InlineMath>
 * - textnormal <InlineMath>{String.raw`\textnormal{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - text <InlineMath>{String.raw`\text{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - mathsf <InlineMath>{String.raw`\mathsf{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - textsf <InlineMath>{String.raw`\textsf{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - sf <InlineMath>{String.raw`\sf ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`}</InlineMath>
 * - mathbf <InlineMath>{String.raw`\mathbf{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - textbf <InlineMath>{String.raw`\textbf{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - bf <InlineMath>{String.raw`\bf ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`}</InlineMath>
 * - bold <InlineMath>{String.raw`\bold{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - boldsymbol <InlineMath>{String.raw`\boldsymbol{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - bm <InlineMath>{String.raw`\bm{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - textmd <InlineMath>{String.raw`\textmd{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - mathtt <InlineMath>{String.raw`\mathtt{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - texttt <InlineMath>{String.raw`\texttt{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - tt <InlineMath>{String.raw`\tt ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`}</InlineMath>
 * - mathit <InlineMath>{String.raw`\mathit{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - textit <InlineMath>{String.raw`\textit{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - it <InlineMath>{String.raw`\it ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`}</InlineMath>
 * - textup <InlineMath>{String.raw`\textup{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - Bbb <InlineMath>{String.raw`\Bbb{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - mathbb <InlineMath>{String.raw`\mathbb{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - frak <InlineMath>{String.raw`\frak{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - mathfrak <InlineMath>{String.raw`\mathfrak{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - cal <InlineMath>{String.raw`\cal{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - mathcal <InlineMath>{String.raw`\mathcal{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * - mathscr <InlineMath>{String.raw`\mathscr{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz}`}</InlineMath>
 * ```
 */
export function InlineMath({ children = '' }: { children?: string }) {
  const html = katex
    .renderToString(children, { output: 'htmlAndMathml', throwOnError: true })
    // replace math identifiers and texts with the appropriate Mathematical Alphanumeric Symbols
    // because legacy mathvariant attribute values are deprecated
    // see: https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mi#mathvariant
    .replaceAll(
      /(<mi mathvariant="([^"]+)">)([A-Za-z])(<\/mi>)/g,
      (_, open, variant, char, close) => `${open}${replace(variant, char)}${close}`,
    )
    .replaceAll(
      /(<mtext mathvariant="([^"]+)">)([A-Za-z]+)(<\/mtext>)/g,
      (_, open, variant, text, close) => `${open}${[...text].map((char) => replace(variant, char)).join('')}${close}`,
    )
  // biome-ignore lint/security/noDangerouslySetInnerHtml: embed HTML generated by KaTeX
  return <span class={inlineMathClass} dangerouslySetInnerHTML={{ __html: html }} />
}

type UpperLatinAlphabet =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
type LowerLatinAlphabet =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
type LatinAlphabet = UpperLatinAlphabet | LowerLatinAlphabet
