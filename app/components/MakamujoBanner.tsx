import { css } from 'hono/css'

const wrap = css`
  display: flex;
  justify-content: center;
  margin: 0.8rem 0;
`

export default function MakamujoBanner({ mapName = 'makamujo-banner-map' }: { mapName?: string } = {}) {
  return (
    <div class={wrap}>
      <img
        src="https://www.nahcnuj.work/makamujo/banner.svg"
        alt="馬可無序（まか・むじょ）- AI-VTuber"
        width="320"
        height="100"
        usemap={`#${mapName}`}
        style="max-width: 100%; height: auto;"
      />
      <map name={mapName}>
        {/* Banner is 320x100px. The "ニコニコ生放送で配信中" badge occupies the bottom strip at x:105-306, y:67-87. */}
        <area
          shape="rect"
          coords="105,67,306,87"
          href="https://live.nicovideo.jp/watch/user/14171889"
          target="_blank"
          rel="noopener noreferrer"
          alt="ニコニコ生放送で配信中"
          data-gtag-event="click_makamujo_nicovideo"
        />
        <area
          shape="default"
          href="https://www.nahcnuj.work/makamujo/index.html"
          target="_blank"
          rel="noopener noreferrer"
          alt="馬可無序プロジェクト"
          data-gtag-event="click_makamujo_landing"
        />
      </map>
    </div>
  )
}
