// Shared type definitions used throughout the project.  Extracted from
// the previous `global.d.ts` so that the interface can be imported rather
// than relying on ambient declarations.

export interface Frontmatter {
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

  /** Injected by `remarkDownloadAdPopup` when the page contains a download link. */
  downloadAdPopup?: boolean

  /**
   * ISO date string indicating when the article was published.
   * If not exists, those files should be ignored during static rendering.
   */
  published?: string

  [key: string]: unknown
}
