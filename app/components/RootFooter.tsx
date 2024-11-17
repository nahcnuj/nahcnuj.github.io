import { css } from 'hono/css'

const footerClass = css`
  margin-block-start: 1.5em;
  padding-block: 1em;
  border-top: 1pt solid var(--theme-main-color);
  font-size: smaller;

  display: flex;
  aligns-item: center;
  justify-content: space-between;
`

export default function RootFooter() {
  return <footer class={footerClass}>
    <div>&copy; Junichi Hayashi</div>
    <div>
      <a href="//x.com/pronahcnuj" rel="me">X</a>
      {' | '}
      <a href="//github.com/nahcnuj" rel="me">GitHub</a>
    </div>
  </footer>
}
