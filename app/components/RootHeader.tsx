import { css } from 'hono/css'

type NavItem = {
  title: string
  href: `/${string}`
}

export default function RootHeader({ navItems }: { navItems: NavItem[] }) {
  const listClass = css`
    display: grid;
    grid-template-columns: repeat(${Math.max(navItems.length, 6)}, 1fr);
    list-style: none;
    font-size: smaller;
  `

  const itemClass = css`
    display: inline-block;
  `

  return (
    <header>
      <nav>
        <ul class={listClass}>
          {navItems.map(({ href, title }) => (
            <li class={itemClass}>
              <a href={href}>{title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
