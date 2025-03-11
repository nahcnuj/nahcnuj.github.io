import {} from 'hono'

// biome-ignore lint/suspicious/noExplicitAny: frontmatter properties are unknown
type WithFrontmatter<T> = T & { frontmatter?: any }

interface Frontmatter {
  title: string
  description?: string
  thumbnail?:
    | string
    | {
        url: string
        alt?: string
      }
  ogImage?: string
  ogImageAlt?: string
  usemath?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showHeaderAd?: boolean

  [key: string]: unknown
}

declare module 'hono' {
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: overwrite hono's interface declaration
    (content: string | Promise<string>, meta?: { frontmatter?: Frontmatter }): Response | Promise<Response>
  }
}
