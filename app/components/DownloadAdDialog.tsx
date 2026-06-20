import { html, raw } from 'hono/html'
import { downloadAdDialogMarkup } from '../lib/downloadAd'

/** Pre-rendered download popover with literal AdSense markup. */
export default function DownloadAdDialog() {
  return html`${raw(downloadAdDialogMarkup())}`
}