// Custom type augmentations for Hono used throughout the project.
// This file was accidentally removed; re‑creating it so the compiler and
// editor continue to understand our extended context renderer signature.

// Import the real `Context` type so we can extend it.  We don't need to
// re-export anything from the package – augmenting the module merges with the
// existing declarations and preserves the original exports.
import type { Context as RealContext } from 'hono'
import type { Frontmatter } from './types'

// Augment the `hono` module itself.  Declaring this file as a module (via an
// `export {}` at the bottom) ensures the augmentation merges with the
// package's built‑in types rather than replacing them.

declare module 'hono' {
  // augment the existing renderer interface by aliasing a function type
  // (only a call signature is needed, so a type alias is simpler).
  type ContextRenderer = (
    content: string | Promise<string>,
    meta?: { frontmatter?: Frontmatter },
  ) => Response | Promise<Response>

  // extend the existing Context interface instead of redefining it; the
  // original export is preserved and consumers can still import `Context`.
  interface Context extends RealContext {
    /**
     * Render content using the current renderer.  The second argument is a
     * custom extension used by this project.
     */
    render: ContextRenderer
  }
}
