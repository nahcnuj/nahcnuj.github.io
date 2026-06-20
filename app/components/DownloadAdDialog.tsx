import { html } from 'hono/html'
import {
  DOWNLOAD_AD_FALLBACK_ID,
  DOWNLOAD_AD_POPUP_ID,
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
} from '../lib/downloadAd'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from '../lib/site'

/** Pre-rendered download popover with an AdSense ad slot. */
export default function DownloadAdDialog() {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: popover is labelled for E2E and assistive tech
    <div id={DOWNLOAD_AD_POPUP_ID} popover="auto" class={DOWNLOAD_DIALOG_CLASS} aria-label={DOWNLOAD_DIALOG_LABEL}>
      <button
        type="button"
        popovertarget={DOWNLOAD_AD_POPUP_ID}
        popovertargetaction="hide"
        class="download-ad-close-icon"
        aria-label="閉じる（×）"
      >
        ×
      </button>
      <p>
        ダウンロードを開始しました。
        {/* biome-ignore lint/a11y/useValidAnchor: href is updated by client script on download click */}
        <a id={DOWNLOAD_AD_FALLBACK_ID} href="#">
          {DOWNLOAD_FALLBACK_LINK_TEXT}
        </a>
      </p>
      <div class="download-ad-container">
        <ins
          class="adsbygoogle"
          style="display:block"
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={DOWNLOAD_AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        {html`<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
      </div>
      <div class="download-ad-actions">
        <button
          type="button"
          popovertarget={DOWNLOAD_AD_POPUP_ID}
          popovertargetaction="hide"
          class="download-ad-close"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}