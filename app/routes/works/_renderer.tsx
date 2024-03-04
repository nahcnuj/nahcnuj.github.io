import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, Layout, frontmatter }) => {
  return (
    <Layout {...frontmatter}>
      <article>{children}</article>
    </Layout>
  )
})
