import { css } from 'hono/css'
import { jsxRenderer } from 'hono/jsx-renderer'
import RootFooter from '../components/RootFooter'
import RootHeader from '../components/RootHeader'
import Layout from '../components/RootLayout'

interface Props {
  title?: string
  description?: string
  thumbnail?: string
  ogImage?: string
  ogImageAlt?: string
  useMath?: boolean
  showHeader?: boolean
  showFooter?: boolean
}

const rootStyle = css`
  html, body { margin: 0; padding: 0; }

  :root {
    --theme-base-color: #e6e6ff;
    --theme-main-color: #000033;
    --theme-accent-color: #ff6666;
  }

  html {
    background: var(--theme-base-color);
    color: var(--theme-main-color);

    scrollbar-gutter: stable both-edges;
  }

  a:visited {
    color: var(--theme-main-color);
  }
  a:active, a:hover {
    color: var(--theme-accent-color);
  }
`

const containerClass = css`
  max-width: 40rem;
  margin-inline: auto;
  @media screen and (max-width: 600px) {
    overflow-x: scroll;
  }
`

export default jsxRenderer(({ children, ...props }) => {
  const navItems = [
    { title: 'Index', href: '/' as const },
    { title: 'Diary', href: '/diary/index.html' as const },
    { title: 'Works', href: '/works/index.html' as const },
    { title: 'Essay', href: '/essays/index.html' as const },
  ]

  const title = props.title ?? props.frontmatter?.title ?? 'Untitled'
  const description = props.description ?? props.frontmatter?.description
  const ogImage = props.ogImage ?? 'https://img.nahcnuj.work/author.jpg'
  const ogImageAlt = props.ogImage ? props.ogImageAlt : "Junichi's face"
  const useMath = props.useMath ?? props.frontmatter?.usemath ?? false

  return (
    <Layout title={title} description={description} ogImage={ogImage} ogImageAlt={ogImageAlt} useMath={useMath}>
      <div class={containerClass}>
        {(props.showHeader ?? true) && <RootHeader navItems={navItems} />}
        {children}
        {(props.showFooter ?? true) && <RootFooter />}
      </div>
    </Layout>
  )
})

declare module 'hono' {
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: <explanation>
    // biome-ignore lint/suspicious/noExplicitAny: frontmatter properties are unknown
    (content: string | Promise<string>, props: Props & { frontmatter?: any }): Response
  }
}
