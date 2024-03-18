import { css } from 'hono/css'

const footerClass = css`
  margin-top: 2em;
  padding-top: 1em;
  border-top: 1pt solid var(--theme-main-color);
  font-size: smaller;
`

export default function RootFooter() {
  return <footer class={footerClass}>&copy; Junichi Hayashi</footer>
}
