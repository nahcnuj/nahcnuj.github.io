import { jsxRenderer } from 'hono/jsx-renderer'
import Article from '../../components/Article'

export default jsxRenderer(({ Layout, children, ...props }) => {
  const title = props.title ?? props.frontmatter?.title ?? 'Untitled'
  const description = props.description ?? props.frontmatter?.description
  const thumbnail = props.thumbnail ?? props.frontmatter?.thumbnail
  const useMath = props.useMath ?? props.frontmatter?.usemath ?? false

  return (
    <Layout
      title={title}
      description={description}
      ogImage={thumbnail}
      ogImageAlt={thumbnail ? '' : undefined}
      useMath={useMath}
    >
      <Article>{children}</Article>
    </Layout>
  )
})
