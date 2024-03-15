import { css } from 'hono/css'

type NavItem = {
  title: string
  href: `/${string}`
}

const navItems = [
  { title: 'Index', href: '/' },
  { title: 'Works', href: '/works/index.html' },
] satisfies NavItem[]

export default function RootHeader() {
  return (
    <header>
      <nav>
        <NavList items={navItems} />
      </nav>
    </header>
  )
}

const listClass = css`
  display: grid;
  grid-template-columns: repeat(${Math.max(navItems.length, 6)}, 1fr);
  list-style: none;
  font-size: smaller;
`

const itemClass = css`
  display: inline-block;
`

function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul class={listClass}>
      {items.map(({ href, title }) => (
        <li class={itemClass}>
          <a href={href}>{title}</a>
        </li>
      ))}
    </ul>
  )
}
