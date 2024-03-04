import {} from 'hono'

type Head = {
  title?: string
  description?: string
}

declare module 'hono' {
  interface Env {
    // biome-ignore lint/complexity/noBannedTypes: TODO
    Variables: {}
    // biome-ignore lint/complexity/noBannedTypes: TODO
    Bindings: {}
  }
  interface ContextRenderer {
    (content: string | Promise<string>, head?: Head & { frontmatter?: Head }): Response | Promise<Response>
  }
}
