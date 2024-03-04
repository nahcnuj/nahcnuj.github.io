import { Meta } from '../routes/works/type'

export default function WorkList({ works }: { works: [string, Meta][] }) {
  return (
    <ul>
      {works.map(([path, { title, description, begins, ends }]) => (
        <li>
          <a href={`/works/${path}`}>
            <div>
              {begins}&ndash;{ends ?? ''}
              {title}: {description}
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}
