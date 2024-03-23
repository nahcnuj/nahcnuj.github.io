import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'
import { Temporal } from 'temporal-polyfill'

const insertedClass = css`
  background-color: #aceebb;
  padding-inline: 0.2rem;
  border-radius: 0.2rem;
  border: 2pt solid #393;

  &:has(p) {
    display: block;
    box-sizing: border-box;
    margin-block: -3pt;
    margin-inline: 0.2rem;
    text-decoration: none;
  }

  &::before {
    content: "【" attr(datetime) "追記】";
  }
  &::after {
    content: "【追記終わり】";
  }
`

export default function Inserted({ children, date }: PropsWithChildren<{ date: Temporal.ZonedDateTimeLike }>) {
  return (
    <ins
      class={insertedClass}
      datetime={Temporal.ZonedDateTime.from({ timeZone: 'Asia/Tokyo', ...date })
        .toPlainDate()
        .toString()}
    >
      {children}
    </ins>
  )
}
