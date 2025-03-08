import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

interface Props {
  columns: number
}

const gridClass = (columns: number) => css`
  display: grid;
  gap: 2em;
  justify-content: space-between;
  @media screen and (min-width: 600px) {
    grid-template-columns: repeat(${columns}, 1fr);
  }
`

export default function GridSheetLayout({ columns, children }: PropsWithChildren<Props>) {
  return <div class={gridClass(columns)}>{children}</div>
}
