import type { Meta } from '../routes/diary/type'

type FilePath = string
type Frontmatter = { frontmatter: Meta }

export default function DiaryList({ diaries }: { diaries: (readonly [FilePath, Frontmatter])[] }) {
  return (
    <ul>
      {diaries
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, { frontmatter }]) => (
          <li>
            <a href={filename}>{frontmatter.title}</a>：{frontmatter.description}
          </li>
        ))}
    </ul>
  )
}
