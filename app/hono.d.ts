// Custom type augmentations for Hono used throughout the project.
// This file was accidentally removed; re‑creating it so the compiler and
// editor continue to understand our extended context renderer signature.

/// <reference path="./global.d.ts" />

// Import a few types from the real package so we can reference them in our
// augmentation.  We use direct paths because `moduleResolution: "Bundler"`
// doesn't reliably pick up the `types` entry in `package.json`.
import type { Hono as RealHono } from 'hono/dist/types/hono'
import type { Context as RealContext } from 'hono/dist/types'

// Augment the `hono` module itself.  Making this file a module (via the
// `export {}` at the bottom) ensures the declaration merges with the
// package's declarations rather than replacing them.

// Declare module augmentation for Hono.  The following import
// statements already make this file a module.

declare module 'hono' {
  // forward the actual class so consumers can import it normally
  export { RealHono as Hono }

  // explicit renderer type with metadata parameter
  type ContextRenderer = (
    content: string | Promise<string>,
    meta?: { frontmatter?: Frontmatter },
  ) => Response | Promise<Response>

  // extend the original Context interface rather than redefining it
  interface Context extends RealContext {
    /**
     * Render content using the current renderer.  The second argument is a
     * custom extension used by this project.
     */
    render: ContextRenderer
  }
}

