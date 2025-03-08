import { css } from 'hono/css'

const navItems = [
  { title: 'Index', href: '/' as const },
  { title: 'Diary', href: '/diary/index.html' as const },
  { title: 'Work', href: '/works/index.html' as const },
  { title: 'Essay', href: '/essays/index.html' as const },
]

const headerClass = css`
  width: 100%;

  position: sticky;
  top: 0;
  z-index: 1;

  display: flex;
  justify-content: space-evenly;

  background: var(--theme-base-color);
  box-shadow: var(--theme-base-color) 0 2px 5px 5px;
`

const listClass = css`
  --columns: 4;
  // @media screen and (min-width: 600px) {
  //   --columns: 6;
  // }

  margin-block: 0.5em;
  padding-inline-start: 0;

  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);

  list-style: none;
  text-align: center;
`

const itemClass = css`
  display: inline-block;
  height: 2em;
  line-height: 2em;
  font-size: 1.2em;

  & a {
    display: inline-block;
    width: 80%;

    font-family: monospace;
  }
`

export default function RootHeader() {
  return (
    <>
      <header class={headerClass}>
        <nav class={css`width:100%`}>
          <ul class={listClass}>
            {navItems.map(({ href, title }) => (
              <li key={href} class={itemClass}>
                <a href={href}>{title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  )
}
