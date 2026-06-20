import { html } from 'hono/html'
import { DOWNLOAD_AD_FALLBACK_ID, DOWNLOAD_AD_POPUP_ID } from '../lib/downloadAdMarkup'
import {
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
} from '../lib/downloadAdPopup'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from '../lib/site'

/** Pre-rendered download popup dialog with literal AdSense markup. */
export default function DownloadAdDialog() {
  return html`<dialog id="${DOWNLOAD_AD_POPUP_ID}" class="${DOWNLOAD_DIALOG_CLASS}" aria-label="${DOWNLOAD_DIALOG_LABEL}">
<form method="dialog">
<button type="submit" value="cancel" class="download-ad-close-icon" aria-label="閉じる（×）">×</button>
<p>ダウンロードを開始しました。<a id="${DOWNLOAD_AD_FALLBACK_ID}" href="#">${DOWNLOAD_FALLBACK_LINK_TEXT}</a></p>
<div class="download-ad-container">
<!-- ポップアップ用 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${ADSENSE_CLIENT_ID}"
     data-ad-slot="${DOWNLOAD_AD_SLOT}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
</div>
<div class="download-ad-actions"><button type="submit" value="cancel" class="download-ad-close">閉じる</button></div>
</form>
</dialog>`
}