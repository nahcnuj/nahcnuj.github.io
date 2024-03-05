import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, Layout, frontmatter }) => (
  <Layout {...frontmatter}>
    <article>{children}</article>
  </Layout>
))
