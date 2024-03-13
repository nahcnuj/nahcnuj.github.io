import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, Layout, frontmatter, title, description }) => (
  <Layout {...frontmatter} title={title} description={description}>
    <article>{children}</article>
  </Layout>
))
