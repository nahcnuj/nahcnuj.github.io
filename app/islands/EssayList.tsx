import type { Meta } from '../routes/diary/type'

type FilePath = string
type Frontmatter = { frontmatter: Meta }

export default function EssayList({ essays }: { essays: (readonly [FilePath, Frontmatter])[] }) {
  return (
    <ul>
      {essays
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, { frontmatter }]) => (
          <li>
            <a href={filename}>{frontmatter.title}</a>
          </li>
        ))}
    </ul>
  )
}
