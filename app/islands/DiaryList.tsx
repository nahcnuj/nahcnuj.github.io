import type { Frontmatter } from '../routes/diary/index'

type FilePath = string

export default function DiaryList({ diaries }: { diaries: (readonly [FilePath, Frontmatter])[] }) {
  return (
    <ul>
      {diaries
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, { title, description }]) => (
          <li key={filename}>
            <a href={filename}>{title}</a>
            {description && `：${description}`}
          </li>
        ))}
    </ul>
  )
}
