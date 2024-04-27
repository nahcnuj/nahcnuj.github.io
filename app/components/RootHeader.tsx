import { css } from 'hono/css'

type NavItem = {
  title: string
  href: `/${string}`
}

export default function RootHeader({ navItems }: { navItems: NavItem[] }) {
  const listClass = css`
    --columns: 4;
    @media screen and (min-width: 600px) {
      --columns: 6;
    }

    padding-inline-start: 0;

    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    grid-row-gap: 1rem;

    list-style: none;
    font-size: smaller;
    text-align: center;
  `

  const itemClass = css`
    display: inline-block;
    line-height: 2;
  `

  return (
    <header>
      <nav>
        <ul class={listClass}>
          {navItems.map(({ href, title }) => (
            <li key={href} class={itemClass}>
              <a href={href}>{title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
