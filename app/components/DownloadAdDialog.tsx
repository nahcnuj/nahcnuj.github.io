import { html, raw } from 'hono/html'
import { downloadAdDialogMarkup } from '../lib/downloadAdMarkup'

/** Pre-rendered download popup dialog with literal AdSense markup. */
export default function DownloadAdDialog() {
  return html`${raw(downloadAdDialogMarkup())}`
}