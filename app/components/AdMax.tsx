import { css, cx } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

interface Props {
  /** A height of the advertisement */
  height: string

  /** If true, do centering beyond the parent's width. */
  fullWidth?: true
}

const admaxClass = css`
  position: relative;
  height: calc(100% + 1.2rem);
  box-sizing: border-box;
  padding-block-end: 0.5rem;

  background: linear-gradient(to bottom,
    rgba(173, 216, 230, 0.5),
    var(--theme-base-color) 5%,
    var(--theme-base-color) 95%,
    rgba(173, 216, 230, 0.5)
  );

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  &::before {
    position: absolute;
    top: -0.8rem;
    left: 0.8rem;
    padding: 0.05rem 0.4rem;

    background-color: color-mix(in srgb, var(--theme-base-color) 50%, lightblue);
    border-radius: 0.1rem;
    box-shadow: 0 0.1rem 0.1rem rgba(0, 0, 0, 0.1);

    content: "Advertisement";
    font-family: serif;
    font-size: 0.8rem;
  }
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
    <aside class={css`margin-block-start:1.5rem;margin-block-end:2rem;height:${height}`}>
      <div class={cx(admaxClass, fullWidth && fullWidthClass)}>{children}</div>
    </aside>
  )
}
