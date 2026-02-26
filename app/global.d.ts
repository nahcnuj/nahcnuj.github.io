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

  /**
   * ISO date string indicating when the article was published.
   * If not exists, those files should be ignored during static rendering.
   */
  published?: string

  [key: string]: unknown
}

declare module 'hono' {
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: overwrite hono's interface declaration
    (content: string | Promise<string>, meta?: { frontmatter?: Frontmatter }): Response | Promise<Response>
  }
}
