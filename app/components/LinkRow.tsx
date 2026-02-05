import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const wrap = css`
  display: flex;
  justify-content: space-evenly;
  margin-top: 0.8rem;
  width: min(48rem, 100%);
  padding: 0 0.6rem;
  a {
    color: inherit;
    text-decoration: none;
    font-weight: 600;
    padding: 0.45rem 0.6rem;
    border-radius: 0.35rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    min-width: clamp(5.2rem, 18vw, 9rem);
    font-size: clamp(1rem, 2.8vw, 2rem);
  }
  @media (max-width: 520px) {
    justify-content: space-between;
    gap: 0;
    a {
      min-width: 0;
      flex: 1;
      max-width: 9rem;
      padding-left: 0.2rem;
      padding-right: 0.2rem;
    }
  }
`

export default function LinkRow({ children }: PropsWithChildren) {
  return <div class={wrap}>{children}</div>
}
