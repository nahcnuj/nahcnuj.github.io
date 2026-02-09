import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const style = css`
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding-block: 0.5rem;
  border-block: 2pt solid var(--theme-main-color);
  background: var(--theme-base-color);
  line-height: 1.5;
`

export default function ({ children }: PropsWithChildren) {
  return <h1 class={style}>{children}</h1>
}
