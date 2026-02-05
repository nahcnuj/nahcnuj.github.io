import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const wrap = css`
  display: block;
  font-size: clamp(3rem, 10vw, 5rem);
  line-height: 1;
  width: 100%;
  text-align: center;
`

export default function Icon({ children }: PropsWithChildren) {
  return (
    <span class={wrap} aria-hidden="true">
      {children}
    </span>
  )
}
