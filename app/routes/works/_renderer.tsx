import { jsxRenderer } from 'hono/jsx-renderer'
import Article from '../../components/Article'

export default jsxRenderer(({ Layout, children, frontmatter }) => {
  return (
    <Layout frontmatter={frontmatter}>
      <Article>{children}</Article>
    </Layout>
  )
})
