import { createRoute } from 'honox/factory'
import { createFeedItems } from '../lib/articles'
import { SITE_URL } from '../lib/site'
import { xmlEscape } from '../lib/xmlEscape'

const buildTime = new Date()

const feedItems = [...createFeedItems('diary'), ...createFeedItems('essays'), ...createFeedItems('works')].sort(
  (a, b) => b.published.localeCompare(a.published),
)

export default createRoute((c) => {
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>nahcnuj.work</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>林 純一 (Junichi Hayashi) のウェブサイト</description>
    <language>ja</language>
    <lastBuildDate>${buildTime.toUTCString()}</lastBuildDate>
${feedItems
  .map(({ path, title, published, description }) => {
    const url = `${SITE_URL}${path}.html`
    const pubDate = new Date(published).toUTCString()
    return `    <item>
      <title>${xmlEscape(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>${description ? `\n      <description>${xmlEscape(description)}</description>` : ''}
    </item>`
  })
  .join('\n')}
  </channel>
</rss>`,
    200,
    { 'Content-Type': 'application/rss+xml; charset=UTF-8' },
  )
})
