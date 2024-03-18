import { jsxRenderer } from 'hono/jsx-renderer'
import Article from '../../components/Article'

export default jsxRenderer(({ children, Layout, frontmatter, title, description }) => (
  <Layout title={title} description={description} {...frontmatter}>
    <Article>{children}</Article>
  </Layout>
))
