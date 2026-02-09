import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const item = css`
  color: inherit;
  font-weight: 600;
  padding: 0.45rem 0.6rem;
  border-radius: 0.35rem;
  display: flex;
  /* let inner <a> control icon/text layout */
  align-items: stretch;
  gap: 0.4rem;
  min-width: clamp(5.2rem, 18vw, 9rem);
  font-size: clamp(1rem, 2.8vw, 2rem);

  /* anchor styles: remove underline and center icon/text */
  a {
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 520px) {
    min-width: 0;
    flex: 1;
    max-width: 9rem;
    padding-left: 0.2rem;
    padding-right: 0.2rem;
  }
`

type Props = PropsWithChildren

export default function LinkRowItem({ children }: Props) {
  return <div class={item}>{children}</div>
}
