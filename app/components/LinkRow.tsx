import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const wrap = css`
  display: flex;
  justify-content: space-evenly;
  margin-top: 0.8rem;
  width: min(48rem, 100%);
  padding: 0 0.6rem;
  /* .item styles moved to LinkRowItem.tsx */
  @media (max-width: 520px) {
    justify-content: space-between;
    gap: 0;
  }
`

export default function LinkRow({ children }: PropsWithChildren) {
  return <div class={wrap}>{children}</div>
}
