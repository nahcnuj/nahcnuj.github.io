import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const paperClass = css`
  background: hsl(from var(--theme-base-color) h s 99%);

  border: thin solid hsl(from var(--theme-main-color) h s 90%);

  padding-inline: 1em;

  position: relative;

  &::after {
    content: "";
    z-index: -1;
    position: absolute;
    bottom: 13px;
    right: 12px;
    left: auto;
    width: 90%;
    top: 10%;
    background: transparent;
    box-shadow: 0 10px 10px var(--theme-main-color);
    transform: rotate(2deg);
  }
`

export default function PaperCard({ children }: PropsWithChildren) {
  return <div class={paperClass}>{children}</div>
}
