type FilePath = string

interface Props {
  title: string
}

export default function EssayList({ essays }: { essays: (readonly [FilePath, Props])[] }) {
  return (
    <ul>
      {essays
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([filename, frontmatter]) => (
          <li key={filename}>
            <a href={filename}>{frontmatter.title}</a>
          </li>
        ))}
    </ul>
  )
}
