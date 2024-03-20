import { css } from 'hono/css'

const footerClass = css`
  margin-block-start: 1.5em;
  padding-block: 1em;
  border-top: 1pt solid var(--theme-main-color);
  font-size: smaller;
`

export default function RootFooter() {
  return <footer class={footerClass}>&copy; Junichi Hayashi</footer>
}
