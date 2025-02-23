type FilePath = string

interface Props {
  title: string
  description?: string
}

export default function AIDiaryList({ diaries }: { diaries: (readonly [FilePath, Props])[] }) {
  return (
    <ul>
      {diaries
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, frontmatter]) => (
          <li key={filename}>
            <a href={filename} rel="nofollow">
              {frontmatter.title}
            </a>
            {frontmatter.description && `：${frontmatter.description}`}
          </li>
        ))}
    </ul>
  )
}
