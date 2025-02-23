type FilePath = string

interface Props {
  title: string
  description?: string
}

export default function DiaryList({ diaries }: { diaries: (readonly [FilePath, Props])[] }) {
  return (
    <ul>
      {diaries
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, frontmatter]) => (
          <li key={filename}>
            <a href={filename}>{frontmatter.title}</a>
            {frontmatter.description && `：${frontmatter.description}`}
          </li>
        ))}
    </ul>
  )
}
