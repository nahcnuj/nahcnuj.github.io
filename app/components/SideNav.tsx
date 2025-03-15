import { css } from 'hono/css'
import type { Child, JSXNode, PropsWithChildren } from 'hono/jsx'

/**
 * @see https://stackoverflow.com/questions/27746304/how-to-check-if-an-object-is-a-promise
 */
// biome-ignore lint/suspicious/noExplicitAny: type guard
function isPromise<T>(promisable: any): promisable is Promise<T> {
  return promisable instanceof Promise || (promisable && typeof promisable.then === 'function')
}

type IncrementMap = [never, 2, 3, 4, 5, 6, never]
type Increment<N extends 1 | 2 | 3 | 4 | 5 | 6> = N extends 6 ? never : IncrementMap[N]
type HeadingNode<N extends 1 | 2 | 3 | 4 | 5 | 6> = { tag: `h${N}`; props: { id: string }; children: JSXNode[] }

type Outline<N extends 1 | 2 | 3 | 4 | 5 | 6 = 2> = Array<
  N extends 6 ? never : { node: HeadingNode<N>; inner: Outline<Increment<N>> }
>

type Findable<N extends 1 | 2 | 3 | 4 | 5 | 6> = N extends 1
  ? 1 | 2 | 3 | 4 | 5 | 6
  : N extends 2
    ? 2 | 3 | 4 | 5 | 6
    : N extends 3
      ? 3 | 4 | 5 | 6
      : N extends 4
        ? 4 | 5 | 6
        : N extends 5
          ? 5 | 6
          : 6

const findLast = <N extends 1 | 2 | 3 | 4 | 5 | 6, M extends Findable<N>>(
  outline: Outline<N>,
  n: M,
): Outline<M> | undefined => {
  console.trace('100 findLast')
  if (outline.length === 0) {
    console.debug('110 findLast')
    return undefined
  }

  console.debug('200 findLast')
  const last = outline.at(-1)
  if (last) {
    console.debug('210 findLast')
    const cmp = last.node.tag.localeCompare(`h${n}`)
    if (cmp === 0) {
      console.debug('211 findLast')
      // biome-ignore lint/suspicious/noExplicitAny: outline is Outline<M> because Findable<N> always includes N
      return outline as any as Outline<M>
    }

    if (cmp > 0) {
      console.debug('220 findLast', last)
      // biome-ignore lint/suspicious/noExplicitAny: `h${n}` may be in a deeper level
      return findLast(last.inner, n as any) as Outline<M>
    }

    console.debug('230 findLast', last)
    return undefined
  }

  return undefined
}

const parseChildren = (child: Child, acc: Outline = []): Outline => {
  // parse heading elements only
  if (
    child == null ||
    typeof child === 'string' ||
    typeof child === 'number' ||
    typeof child === 'boolean' ||
    typeof child === 'undefined' ||
    isPromise(child)
  ) {
    return acc
  }

  if (Array.isArray(child)) {
    return child.reduce<Outline>((acc, child) => parseChildren(child, acc), acc)
  }

  const { tag, children } = child
  if (typeof tag === 'function') {
    return children.reduce<Outline>((acc, child) => parseChildren(child, acc), acc)
  }

  if (tag === 'h2') {
    return [...acc, { node: child, inner: [] }] as Outline<2>
  }

  if (tag === 'h3') {
    const last = acc.at(-1)
    if (last === undefined) {
      throw new Error('outline is invalid')
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    last.inner.push({ node: child, inner: [] } as any)
  }

  // TODO h4, h5, h6

  return acc
}

export default function ({ children }: PropsWithChildren) {
  const outline = parseChildren(children)

  return outline.length > 0 ? (
    <ol>
      {outline.map(({ node, inner }) => (
        <li key={node.props.id}>
          <a href={`#${node.props.id}`}>{node.children}</a>
          {inner.length > 0 && (
            <ol class={css`margin-inline-start:-1em`}>
              {inner.map(({ node }) => (
                <li key={node.props.id}>
                  <a href={`#${node.props.id}`}>{node.children}</a>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  ) : null
}
