import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, Layout, frontmatter, title, description }) => (
  <Layout title={title} description={description} {...frontmatter}>
    {children}
  </Layout>
))
