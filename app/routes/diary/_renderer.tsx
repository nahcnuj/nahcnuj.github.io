import { jsxRenderer } from 'hono/jsx-renderer'
import Article from '../../components/Article'

export default jsxRenderer(({ Layout, children, ...props }) => {
  const title = props.frontmatter?.title ?? props.title ?? 'Untitled'
  const description = props.frontmatter?.description ?? props.description
  const thumbnail = props.frontmatter?.thumbnail ?? props.ogImage
  const useMath = props.frontmatter?.usemath ?? props.useMath ?? false

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
