import {
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
} from './downloadAdPopup'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from './site'

export const DOWNLOAD_AD_POPUP_ID = 'download-ad-popup'
export const DOWNLOAD_AD_FALLBACK_ID = 'download-ad-fallback'
/** Hidden button that opens the popover via `popovertargetaction="show"`. */
export const DOWNLOAD_AD_TRIGGER_ID = 'download-ad-trigger'

/** Literal AdSense loader for `<head>`. */
export function adsenseLoaderMarkup(): string {
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}"
     crossorigin="anonymous"></script>`
}

/** Literal popup AdSense block (`<!-- ポップアップ用 -->` + `<ins>` + `push`). */
export function downloadAdPopupMarkup(): string {
  return `<!-- ポップアップ用 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${ADSENSE_CLIENT_ID}"
     data-ad-slot="${DOWNLOAD_AD_SLOT}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
}

/** Literal popover markup appended to pages that contain download links. */
export function downloadAdDialogMarkup(): string {
  return `<button type="button" id="${DOWNLOAD_AD_TRIGGER_ID}" popovertarget="${DOWNLOAD_AD_POPUP_ID}" popovertargetaction="show" hidden tabindex="-1" aria-hidden="true"></button>
<div id="${DOWNLOAD_AD_POPUP_ID}" popover="auto" class="${DOWNLOAD_DIALOG_CLASS}" aria-label="${DOWNLOAD_DIALOG_LABEL}">
<button type="button" popovertarget="${DOWNLOAD_AD_POPUP_ID}" popovertargetaction="hide" class="download-ad-close-icon" aria-label="閉じる（×）">×</button>
<p>ダウンロードを開始しました。<a id="${DOWNLOAD_AD_FALLBACK_ID}" href="#">${DOWNLOAD_FALLBACK_LINK_TEXT}</a></p>
<div class="download-ad-container">
${downloadAdPopupMarkup()}
</div>
<div class="download-ad-actions"><button type="button" popovertarget="${DOWNLOAD_AD_POPUP_ID}" popovertargetaction="hide" class="download-ad-close">閉じる</button></div>
</div>`
}