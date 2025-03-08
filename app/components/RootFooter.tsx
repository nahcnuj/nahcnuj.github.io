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
  return (
    <footer class={footerClass}>
      <div>
        <div>&copy; Junichi Hayashi</div>
        <div>Powered by Hono. Hosted by GitHub Pages.</div>
      </div>
      <div>
        <div>
          <a href="https://github.com/nahcnuj" rel="me noreferrer" target="_blank">
            GitHub / nahcnuj
          </a>
        </div>
        <div>
          <a href="https://x.com/pronahcnuj" rel="me noreferrer" target="_blank">
            X（旧Twitter） / @pronahcnuj
          </a>
        </div>
      </div>
    </footer>
  )
}
