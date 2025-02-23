import type { Frontmatter } from '../routes/essays'

type FilePath = string

export default function EssayList({ essays }: { essays: (readonly [FilePath, Frontmatter])[] }) {
  return (
    <ul>
      {essays
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, { title }]) => (
          <li key={filename}>
            <a href={filename}>{title}</a>
          </li>
        ))}
    </ul>
  )
}
