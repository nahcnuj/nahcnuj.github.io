import { css } from 'hono/css'
import { createRoute } from 'honox/factory'
import RemoteImage from '../components/RemoteImage'

export default createRoute((c) => {
  const title = 'Junichi Hayashi, a web engineer'
  const description = 'I am Junichi Hayashi, a web engineer.'

  const headingClass = css`
    text-align: center;
  `
  const headerImageClass = css`
    float: right;
    height: calc(4 * var(--line-height-length));
    margin-inline: 0.2rem;

    & img {
      height: 100%;
      object-fit: scale-down;
    }
  `

  return c.render(
    <main>
      <h1 class={headingClass}>Junichi Hayashi, a web engineer</h1>
      <div class={headerImageClass}>
        <RemoteImage src="/author.jpg" width={150} height={150} alt="" />
      </div>

      <h2>I am ...</h2>
      <p>林純一と申します。都内某企業でウェブエンジニアとして働いています。</p>

      <h2>I like ...</h2>
      <h3>プログラミング</h3>
      <p>
        小学5年生のときに、父が所有していたポケットコンピュータでBASICと出会ってから、
        <abbr title="Hot Soup Processor">HSP</abbr>、C、C++、C#、Java、Perl、TypeScript、Go、Rust、Lean 4など、
        様々な言語でプログラミングを楽しんでいます。
      </p>

      <h3>Perl</h3>
      <p>仕事で主に使っているプログラミング言語です。なんとなく「手作り感」があるのが好きです。</p>

      <h3>TypeScript</h3>
      <p>
        Next.jsやNuxtを使ったウェブサイト構築に挑戦するのと同時に手を出した言語です。
        それまで扱っていた動的型付けなPerlと対比して、静的に型が付くことの便利さを再確認させてくれました。
      </p>

      <h3>型</h3>
      <p>プログラムの型注釈と命題の証明がカリー＝ハワード同型対応によって結び付くという強力さに惚れました。</p>

      <h3>東山奈央さん（声優・歌手）</h3>
      <p>
        2ndシングル「イマココ/月がきれい」を聴いて、そのCDのリリースイベントに足を運んだところから歌手として好きになりました。
      </p>

      <h2>I belonged to ...</h2>
      <ul>
        <li>神戸市立工業高等専門学校電気工学科（2016年3月卒業）</li>
        <li>大阪大学基礎工学部情報科学科（2018年3月卒業）</li>
        <li>大阪大学大学院情報科学研究科コンピュータサイエンス専攻（2019年10月中途退学）</li>
        <li>シーサー株式会社（2020年4月～2023年12月）</li>
      </ul>
    </main>,
    { title, description },
  )
})
