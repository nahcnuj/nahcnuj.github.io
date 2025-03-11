import { css } from 'hono/css'
import { html } from 'hono/html'
import { jsxRenderer } from 'hono/jsx-renderer'
import AdMax from '../components/AdMax'
import RootFooter from '../components/RootFooter'
import RootHeader from '../components/RootHeader'
import RootLayout from '../components/RootLayout'

const containerClass = css`
  // max-width: 40rem;
  // margin-inline: auto;
  @media screen and (max-width: 600px) {
    overflow-x: scroll;
  }
`

export default jsxRenderer(
  ({
    children,
    frontmatter: { title, description, usemath: useMath, thumbnail, ...props } = { title: 'Untitled' },
  }) => {
    const openGraph = {
      image:
        typeof thumbnail === 'string'
          ? { url: thumbnail }
          : (thumbnail ?? {
              url: 'https://img.nahcnuj.work/author.jpg',
              alt: "Junichi's face",
            }),
    }

    return (
      <RootLayout
        title={title}
        description={description}
        openGraph={openGraph}
        useMath={useMath}
        headInjection={html`<link rel="preload" href="https://adm.shinobi.jp/o/db2462676e3c50aa524806fb285a546d" as="script">`}
      >
        <div class={containerClass}>
          {(props.showHeader ?? true) && <RootHeader />}
          {props.showHeaderAd && (
            <AdMax height="100px" fullWidth>
              {html`
<!-- admax -->
<script src="https://adm.shinobi.jp/o/db2462676e3c50aa524806fb285a546d"></script>
<!-- admax -->
`}
            </AdMax>
          )}
          {children}
          <AdMax height="100px" fullWidth>
            {html`
<!-- admax -->
<div class="admax-switch" data-admax-id="11a058af25dce0b8884cd189862eed63" style="display:inline-block;"></div>
<script type="text/javascript">
(admaxads = window.admaxads || []).push({admax_id: "11a058af25dce0b8884cd189862eed63",type: "switch"});</script>
<script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>
<!-- admax -->
`}
          </AdMax>
          {(props.showFooter ?? true) && <RootFooter />}
        </div>
      </RootLayout>
    )
  },
)
