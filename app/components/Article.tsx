import { css } from 'hono/css'
import { html } from 'hono/html'
import type { ArticleLink } from '../lib/articles'
import AdMax from './AdMax'
import MakamujoBanner from './MakamujoBanner'
import { $, $$ } from './Math'
import RelatedArticles from './RelatedArticles'

const articleClass = css`
  --line-height: 2;
  --line-height-length: calc(var(--line-height) * 1rem);
  line-height: var(--line-height-length);
  @supports (line-height-step: 1px) {
    line-height-step: var(--line-height-length);
  }

  & h1, & h2, & h3, & h4, & h5, & h6, & p, & ul, & ol, & dl, & div {
    box-sizing: border-box;
    margin-block: 0;
    line-height: inherit;
  }

  & h1, & h2, & h3, & h4, & h5, & h6, & p {
    padding-inline: 0.2rem;
  }

  & > ul, & > ol, & > dl {
    padding-inline-end: 0.2rem;
  }

  & h2, & h3, & h4, & h5, & h6 {
    margin-block-start: 2rem;
    margin-block-end: 0;

    & + & {
      margin-block-start: 0.5rem;
    }
  }

  & h1 { font-size: 200% }
  & h2 { font-size: 160% }
  & h3 { font-size: 120% }

  & h2 { margin-block-end: 0.5rem }

  & h1 {
    margin-block: 2rem;
    padding-block: 0.5rem;
    border-block: 2pt solid var(--theme-main-color);
    background: var(--theme-base-color);
    line-height: 1.5;
  }

  & h3::before {
    content: "■";
    margin-inline-end: 0.3ex;
  }

  & p, & li, & dd {
    text-align: left;
  }

  & p + p {
    margin-block-start: var(--line-height-length);
  }

  &, & honox-island {
    & > p, & > ul, & > ol {
      padding-block-end: 0.5pt;
      background: linear-gradient(#ccf 0.5pt, transparent 0.5pt) top/100% var(--line-height-length);
    }
  }

  & figure {
    max-width: 80%;
    margin-inline: auto;
    text-align: center;

    & img {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      object-fit: scale-down;
    }
  }

  & pre {
    box-sizing: border-box;
    margin-inline: 0.5rem;
    padding-block: calc(var(--line-height-length) / 4 - 2pt);
    padding-inline: 0.75em;
    border: 1pt solid var(--theme-main-color);
    border-radius: 0.5rem;
    overflow-x: scroll;
    scrollbar-width: none;
    font-size: 1rem;
    line-height: 1.5;
  }

  & code {
    padding: 0.25em;
    font-size: 1em;
    overflow-wrap: anywhere;
  }

  & p code {
    font-size: 1rem;
  }
`

export default function Article({
  children,
  relatedArticles,
  currentPath,
}: {
  // the JSX renderer gives us a `Child` (string, element, null, …); we
  // only inspect `children` at runtime, so allow any value here.
  // biome-ignore lint/suspicious/noExplicitAny: runtime type check only
  children?: any
  relatedArticles?: ArticleLink[]
  currentPath?: string
}) {
  const toTemplate = (tex: string) => Object.assign([tex], { raw: [tex] }) as unknown as TemplateStringsArray

  const tokenizeMath = (value: string) => {
    const parts: Array<string | { tex: string; display: boolean }> = []
    let plainStart = 0
    let i = 0

    const isEscaped = (index: number) => {
      let backslashes = 0
      for (let j = index - 1; j >= 0 && value[j] === '\\'; j--) backslashes++
      return backslashes % 2 === 1
    }

    while (i < value.length) {
      if (value[i] !== '$' || isEscaped(i)) {
        i++
        continue
      }

      const display = value[i + 1] === '$'
      const delimiterLength = display ? 2 : 1
      const openAt = i
      const contentStart = openAt + delimiterLength

      let closeAt = contentStart
      while (closeAt < value.length) {
        if (value[closeAt] !== '$' || isEscaped(closeAt)) {
          closeAt++
          continue
        }

        if (display) {
          if (value[closeAt + 1] === '$' && !isEscaped(closeAt + 1)) break
          closeAt++
          continue
        }

        break
      }

      const hasClose = display ? closeAt + 1 < value.length && value[closeAt + 1] === '$' : closeAt < value.length
      if (!hasClose) {
        i = openAt + delimiterLength
        continue
      }

      if (openAt > plainStart) parts.push(value.slice(plainStart, openAt))
      parts.push({ tex: value.slice(contentStart, closeAt), display })

      i = closeAt + delimiterLength
      plainStart = i
    }

    if (plainStart < value.length) parts.push(value.slice(plainStart))
    return parts
  }

  // biome-ignore lint/suspicious/noExplicitAny: traversal over arbitrary JSX-like nodes
  const rewriteMarkdownMath = (node: any): any => {
    if (typeof node === 'string') {
      const tokens = tokenizeMath(node)
      if (tokens.length === 1 && typeof tokens[0] === 'string') return node
      return tokens.map((token) => {
        if (typeof token === 'string') return token
        return token.display ? $$(toTemplate(token.tex)) : $(toTemplate(token.tex))
      })
    }

    if (!node || typeof node !== 'object') return node

    if (Array.isArray(node)) {
      return node.flatMap((child) => {
        const rewritten = rewriteMarkdownMath(child)
        return Array.isArray(rewritten) ? rewritten : [rewritten]
      })
    }

    // biome-ignore lint/suspicious/noExplicitAny: runtime traversal over unknown JSX node shape
    const readNodeChildren = (target: any): unknown[] | undefined => {
      if (Array.isArray(target.children)) return target.children
      const propsChildren = target.props?.children
      if (Array.isArray(propsChildren)) return propsChildren
      if (propsChildren === undefined || propsChildren === null) return undefined
      return [propsChildren]
    }

    // biome-ignore lint/suspicious/noExplicitAny: runtime traversal over unknown JSX node shape
    const writeNodeChildren = (target: any, nextChildren: unknown[]) => {
      if (Array.isArray(target.children)) {
        target.children = nextChildren
        return
      }
      if (target.props) {
        target.props.children = nextChildren
      }
    }

    const elementType = node.type
    if (elementType === 'pre' || elementType === 'code') return node

    const nodeChildren = readNodeChildren(node)

    if (elementType === 'p' && Array.isArray(nodeChildren) && nodeChildren.every((child: unknown) => typeof child === 'string')) {
      const paragraphText = nodeChildren.join('')
      const displayOnly = paragraphText.match(/^\s*\$\$([\s\S]+?)\$\$\s*$/)
      if (displayOnly) {
        return $$(toTemplate(displayOnly[1]))
      }
    }

    if (Array.isArray(nodeChildren)) {
      const rewrittenChildren = nodeChildren.flatMap((child: unknown) => {
        const rewritten = rewriteMarkdownMath(child)
        return Array.isArray(rewritten) ? rewritten : [rewritten]
      })
      writeNodeChildren(node, rewrittenChildren)
    }

    return node
  }

  const rewrittenChildren = rewriteMarkdownMath(children)
  children = Array.isArray(rewrittenChildren) ? <>{rewrittenChildren}</> : rewrittenChildren

  // biome-ignore lint/suspicious/noExplicitAny: internal traversal of JSX tree
  const childArray = children && Array.isArray((children as any).children) ? (children as any).children : undefined

  if (Array.isArray(childArray)) {
    const newChildren = []
    let paragraphCount = 0

    for (const child of childArray) {
      if (
        child.type === 'p' ||
        child.type === 'h3' ||
        child.type === 'h4' ||
        child.type === 'pre' ||
        child.type === 'div'
      ) {
        paragraphCount++
        if (paragraphCount >= 7) {
          newChildren.push(
            <AdMax height="270px">
              {html`
<!-- admax -->
<div class="admax-switch" data-admax-id="70a63675255ffbb9d4ac3fedd2a19b3d" style="display:inline-block;"></div>
<script type="text/javascript">
(admaxads = window.admaxads || []).push({admax_id: "70a63675255ffbb9d4ac3fedd2a19b3d",type: "switch"});</script>
${'' /*<script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>*/}\
<!-- admax -->
`}
            </AdMax>,
          )
          paragraphCount = 0
        }
      }
      newChildren.push(child)
    }
    children.children = newChildren
  }

  const isIndexPage = currentPath?.endsWith('/index.html') ?? false

  return (
    <article class={articleClass}>
      {children}
      {!isIndexPage && <MakamujoBanner />}
      {relatedArticles && relatedArticles.length > 0 && currentPath && (
        <>
          <h2>他の記事</h2>
          <RelatedArticles articles={relatedArticles} />
        </>
      )}
    </article>
  )
}

