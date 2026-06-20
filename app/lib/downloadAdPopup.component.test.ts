import { describe, expect, it } from 'vitest'
import {
  adsenseLoaderMarkup,
  downloadAdDialogMarkup,
  downloadAdPopupMarkup,
} from './downloadAdMarkup'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from './site'

describe('download ad markup (component)', () => {
  it('renders the AdSense loader script literally', () => {
    expect(adsenseLoaderMarkup()).toBe(
      `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}"
     crossorigin="anonymous"></script>`,
    )
  })

  it('renders the popup AdSense block literally', () => {
    expect(downloadAdPopupMarkup()).toBe(
      `<!-- ポップアップ用 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${ADSENSE_CLIENT_ID}"
     data-ad-slot="${DOWNLOAD_AD_SLOT}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`,
    )
  })

  it('embeds the literal popup AdSense block inside the popover markup', () => {
    const markup = downloadAdDialogMarkup()
    expect(markup).toContain(downloadAdPopupMarkup())
    expect(markup).toContain('id="download-ad-popup"')
    expect(markup).toContain('popover="auto"')
    expect(markup).toContain('popovertarget="download-ad-popup"')
    expect(markup).toContain('popovertargetaction="hide"')
    expect(markup).not.toContain('popovertargetaction="show"')
    expect(markup).toContain('ダウンロードを開始しました。')
    expect(markup).toContain('自動でダウンロードされない場合はこちらをクリックしてください')
  })
})