import { css } from 'hono/css'

const footerClass = css`
  margin-top: 2em;
  padding-top: 1em;
  border-top: thin solid #333;
  font-size: smaller;
`

export default function RootFooter() {
  return <footer class={footerClass}>&copy; Junichi Hayashi</footer>
}
