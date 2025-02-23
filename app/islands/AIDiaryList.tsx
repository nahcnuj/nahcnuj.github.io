import type { Frontmatter } from '../routes/fake'

type FilePath = string

export default function AIDiaryList({ diaries }: { diaries: (readonly [FilePath, Frontmatter])[] }) {
  return (
    <ul>
      {diaries
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, { title, description }]) => (
          <li key={filename}>
            <a href={filename} rel="nofollow">
              {title}
            </a>
            {description && `：${description}`}
          </li>
        ))}
    </ul>
  )
}
