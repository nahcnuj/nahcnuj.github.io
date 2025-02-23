import {} from 'hono'

// biome-ignore lint/suspicious/noExplicitAny: frontmatter properties are unknown
type WithFrontmatter<T> = T & { frontmatter?: any }

interface Props {
  title?: string
  description?: string
  ogImage?: string
  ogImageAlt?: string
  useMath?: boolean
  showHeader?: boolean
  showFooter?: boolean
}

declare module 'hono' {
  interface Env {
    // biome-ignore lint/complexity/noBannedTypes: TODO
    Variables: {}
    // biome-ignore lint/complexity/noBannedTypes: TODO
    Bindings: {}
  }
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: overwrite hono's interface declaration
    (content: string | Promise<string>, props: WithFrontmatter<Props>): Response
  }
}
