import { css } from 'hono/css'
import { html } from 'hono/html'
import type { Child } from 'hono/jsx'
import { jsxRenderer } from 'hono/jsx-renderer'
import AdMax from '../components/AdMax'
import RootFooter from '../components/RootFooter'
import RootHeader from '../components/RootHeader'
import RootLayout from '../components/RootLayout'
import SideNav from '../components/SideNav'
import { SITE_URL } from '../lib/site'
import type { Frontmatter } from '../types'

const mainClass = css`
  @media screen and (min-width: 1200px) {
    max-width: 1000px;
  }
`

const sideClass = css`
  min-width: 180px;
  width: calc(100vw - 1020px);
  height: 100%;

  @media screen and (min-width: 1200px) {
    position: fixed;
    top: 0;
    right: 0;

    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  @media screen and (max-width: 1199px) {
    height: 0;
    overflow: hidden;
  }
`

export default jsxRenderer(
  (
    {
      children,
      frontmatter: { title, description, usemath: useMath, thumbnail, ...props } = { title: 'Untitled' },
    }: {
      children?: Child
      frontmatter?: Partial<Frontmatter>
    },
    c,
  ) => {
    const reqPath = c?.req?.path ?? '/'
    const ogpPath = reqPath === '/' ? 'index' : reqPath.replace(/^\//, '').replace(/\.html$/, '')
    const openGraph = {
      image:
        typeof thumbnail === 'string'
          ? { url: thumbnail }
          : (thumbnail ?? { url: `${SITE_URL}/ogp/${ogpPath}.svg`, alt: title ?? '' }),
    }

    return (
      <RootLayout
        title={title ?? ''}
        description={description}
        openGraph={openGraph}
        useMath={useMath}
        headInjection={html`\
<link rel="preload" href="https://adm.shinobi.jp/o/db2462676e3c50aa524806fb285a546d" as="script">
<link rel="preload" href="https://adm.shinobi.jp/st/t.js" as="script">
<link rel="preload" href="https://adm.shinobi.jp/s/ecef110ee254439d10de8dc383b54066" as="script">
`}
      >
        <main class={mainClass}>
          {(props.showHeader ?? true) && <RootHeader />}
          {(props.showHeaderAd ?? true) && (
            <AdMax height="100px" fullWidth>
              {html`\
<!-- admax -->
<script src="https://adm.shinobi.jp/o/db2462676e3c50aa524806fb285a546d" defer></script>
<!-- admax -->
`}
            </AdMax>
          )}
          {children}
          <AdMax height="100px" fullWidth>
            {html`\
<!-- admax -->
<div class="admax-switch" data-admax-id="11a058af25dce0b8884cd189862eed63" style="display:inline-block;"></div>
<script type="text/javascript">
(admaxads = window.admaxads || []).push({admax_id: "11a058af25dce0b8884cd189862eed63",type: "switch"});</script>
<script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>
<!-- admax -->
`}
          </AdMax>
          {(props.showFooter ?? true) && <RootFooter />}
        </main>
        <div class={sideClass}>
          <div class={css`height:calc(100vh - 600px - 20px);overflow-y:auto`}>
            <SideNav>{children}</SideNav>
          </div>
          <aside class={css`height:600px;text-align:center`}>
            {html`\
<!-- admax -->
<script src="https://adm.shinobi.jp/s/ecef110ee254439d10de8dc383b54066"></script>
<!-- admax -->
`}
          </aside>
        </div>
      </RootLayout>
    )
  },
)
