import { css } from 'hono/css'
import type { Frontmatter } from '../routes/works'
import RemoteImage from './RemoteImage'

const listClass = css`
  list-style: none;
  padding-inline-start: 0;
  line-height: var(--line-height-length);
`
const itemClass = css`
  margin-block: var(--line-height-length);
`
const anchorClass = css`
  display: block;
  height: 100%;
  @media screen and (min-width: 40rem) {
    height: calc(5 * var(--line-height-length));
  }
  color: inherit;
  text-decoration: none;
`
export default function WorkList({ works }: { works: (readonly [string, Frontmatter])[] }) {
  return (
    <ul class={listClass}>
      {works.map(([path, frontmatter]) => (
        <li key={path} class={itemClass}>
          <a href={`/works/${path}`} class={anchorClass}>
            <Work {...frontmatter} />
          </a>
        </li>
      ))}
    </ul>
  )
}

const workClass = css`
  height: 100%;
  display: grid;
  grid-template-columns: 2fr 5fr;
  grid-template-rows: 100%;
  column-gap: 2%;
  place-items: center start;
`

const thumbnailClass = css`
  width: 100%;
  height: 100%;

  & img {
    width: 100%;
    height: 100%;
    object-fit: scale-down;
  }
`
const contentClass = css`
  width: 100%;
  height: 100%;
`
const titleClass = css`
  font-size: 1.3em;
  font-weight: bold;
`

function Work({ title, description, begins, ends, thumbnail }: Frontmatter) {
  return (
    <div class={workClass}>
      <div class={thumbnailClass}>{thumbnail && <RemoteImage src={thumbnail} alt="" />}</div>
      <div class={contentClass}>
        <div class={titleClass}>{title}</div>
        <div>{description}</div>
        <div>
          {begins}年{begins !== ends && <>～{ends}</>}
        </div>
      </div>
    </div>
  )
}
