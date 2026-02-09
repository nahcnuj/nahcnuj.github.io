import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const wrap = css`
  display: inline-block;
  font-size: inherit; /* inherit from container so parent controls size */
  line-height: 1;
  width: auto;
  text-align: center;
`

export default function Icon({ children }: PropsWithChildren) {
  return (
    <span class={wrap} aria-hidden="true">
      {children}
    </span>
  )
}
