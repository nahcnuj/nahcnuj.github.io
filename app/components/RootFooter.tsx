import { css } from 'hono/css'

const footerClass = css`
  margin-block-start: 2em;
  padding-block: 1em;
  border-top: 2pt solid var(--theme-main-color);
  font-size: smaller;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
`

const sectionClass = css`
  display: flex;
  flex-direction: column;
  gap: 0.3em;
`

export default function RootFooter() {
  return (
    <footer class={footerClass}>
      <div class={sectionClass}>
        <div>&copy; Junichi Hayashi</div>
        <div>Powered by Hono. Hosted by GitHub Pages.</div>
      </div>
      <div class={sectionClass}>
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
