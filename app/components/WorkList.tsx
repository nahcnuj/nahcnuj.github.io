import { css } from 'hono/css'
import { Meta } from '../routes/works/type'
import RemoteImage from './RemoteImage'

const listClass = css`
  list-style: none;
`
const itemClass = css`
  margin-block: 2em;
  height: 8em;
`
const anchorClass = css`
  display: block;
  height: 100%;
  color: inherit;
  text-decoration: none;
`
export default function WorkList({ works }: { works: [string, Meta][] }) {
  return (
    <ul class={listClass}>
      {works.map(([path, work]) => (
        <li class={itemClass}>
          <a href={`/works/${path}`} class={anchorClass}>
            <Work {...work} />
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
  place-items: center start;

  border: thin solid darkgray;
  & >* {
  border: thin solid darkgray;
  }
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

function Work({ title, description, begins, ends, thumbnail }: Meta) {
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
