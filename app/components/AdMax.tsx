import { css, cx } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

interface Props {
  /** A height of the advertisement */
  height: string

  /** If true, do centering beyond the parent's width. */
  fullWidth?: true
}

const admaxClass = css`
  height: 100%;
  display: grid;
  justify-items: center;
  align-content: space-around;
  text-align: center;
`

const fullWidthClass = css`
  @media screen and (min-width: 40rem) {
    margin-inline: calc(50% - ${728 / 2}px);
  }
`

/**
 * `AdMax` component shows an 忍者AdMax's advertisement.
 * This component reserves the specified height to minimize Cumulative Layout Shift of Core Web Vitals.
 */
export default function AdMax({ height, fullWidth, children }: PropsWithChildren<Props>) {
  return (
    <aside class={css`height:${height}`}>
      <div class={cx(admaxClass, fullWidth && fullWidthClass)}>{children}</div>
    </aside>
  )
}
