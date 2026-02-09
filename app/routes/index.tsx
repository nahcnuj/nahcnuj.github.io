import { css } from 'hono/css'
import { createRoute } from 'honox/factory'
import Headline from '../components/Headline'
import Icon from '../components/Icon'
import LinkRow from '../components/LinkRow'
import LinkRowItem from '../components/LinkRowItem' 

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
    text-align: center;

    .jp {
      display: block;
      font-weight: 700;
    }
    .en {
      display: block;
      font-weight: 400;
      font-size: 1rem;
      color: #444;
    }
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
      text-align: left;
      & .line1 { line-height: 1.2; }
      & .line2 { margin-top: 0.25rem; line-height: 1.2; }
    }
  `

  return c.render(
    <div class={heroWrap}>
      <Headline>
        <div class={heroTitle}>
          <div class="jp">林 純一</div>
          <div class="en">Junichi Hayashi</div>
        </div>
      </Headline>
      <div class={heroText}>
        <div class="hero-phrase">
          <div class="catch">ウェブエンジニア</div>
          <div class="sub">
            <div class="line1">なぜエンジニアリングするのか</div>
            <div class="line2"><span style="letter-spacing:-0.15em;margin-right:0.3em">&mdash;&mdash;</span>そこに課題があるから。</div>
          </div>
        </div>
      </div>
      <LinkRow>
        <LinkRowItem>
          <a href="/diary/index.html">
            <Icon>📓</Icon>
            <span>Diary</span>
          </a>
        </LinkRowItem> 
        <LinkRowItem>
          <a href="/works/index.html">
            <Icon>🧑‍💻</Icon>
            <span>Work</span>
          </a>
        </LinkRowItem> 
        <LinkRowItem>
          <a href="/essays/index.html">
            <Icon>📝</Icon>
            <span>Essay</span>
          </a>
        </LinkRowItem>
      </LinkRow>
    </div>,
    { frontmatter: { title, description, showHeaderAd: false } },
  )
})
