import { css } from 'hono/css'
import { createRoute } from 'honox/factory'
import Headline from '../components/Headline'
import Icon from '../components/Icon'
import LinkRow from '../components/LinkRow'

export default createRoute((c) => {
  const title = '林 純一 (Junichi Hayashi)'
  const description =
    '課題を発見し、解決することへの情熱。問題に向き合い、より良い仕組みを作るためにエンジニアリングを行います。'

  const heroWrap = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    min-height: calc(100vh - 25rem);
    padding: 2rem 1rem;
  `

  const heroTitle = css`
    margin: 0;
    font-weight: 700;
    font-size: clamp(1.6rem, 6vw, 3.2rem);
  `

  const heroText = css`
    text-align: center;
    line-height: 1.1;
    & p {
      margin: 0.6rem 0 0;
      font-weight: 400;
      color: #444;
      font-size: clamp(1rem, 2.6vw, 1.25rem);
    }

    /* hero phrase structure */
    & .hero-phrase {
      margin-top: 0.6rem;
    }
    & .hero-phrase .catch {
      font-size: clamp(1.3rem, 4vw, 2rem);
      font-weight: 700;
    }
    & .hero-phrase .sub {
      margin-top: 0.4rem;
      font-weight: 400;
      color: #444;
      font-size: clamp(1rem, 2.6vw, 1.25rem);
      & .line1 { line-height: 1.2; }
      & .line2 { margin-top: 0.25rem; line-height: 1.2; }
    }
  `

  return c.render(
    <div class={heroWrap}>
      <Headline>
        <div class={heroTitle}>林 純一 (Junichi Hayashi)</div>
      </Headline>
      <div class={heroText}>
        <div class="hero-phrase">
          <div class="catch">ウェブエンジニア</div>
          <div class="sub">
            <div class="line1">なぜエンジニアリングするのか</div>
            <div class="line2">そこに課題があるから</div>
          </div>
        </div>
      </div>
      <LinkRow>
        <a href="/diary/index.html">
          <Icon>📓</Icon>
          <span>Diary</span>
        </a>
        <a href="/works/index.html">
          <Icon>🧑‍💻</Icon>
          <span>Work</span>
        </a>
        <a href="/essays/index.html">
          <Icon>📝</Icon>
          <span>Essay</span>
        </a>
      </LinkRow>
    </div>,
    { frontmatter: { title, description, showHeaderAd: false } },
  )
})
