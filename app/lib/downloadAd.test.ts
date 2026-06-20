import type { Element, Root as HastRoot } from 'hast'
import type { Root as MdastRoot } from 'mdast'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  adsenseLoaderMarkup,
  DOWNLOAD_AD_DATA_ATTR,
  DOWNLOAD_AD_POPUP_FRONTMATTER_KEY,
  DOWNLOAD_AD_POPUP_ID,
  DOWNLOAD_AD_FALLBACK_ID,
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
  downloadAdDialogMarkup,
  downloadAdPopupMarkup,
  isDownloadLinkText,
  prepareDownloadAdPopup,
  remarkDownloadAdPopup,
  rehypeDownloadLinks,
  resolveDownloadHref,
  setupDownloadAdPopup,
  stripExternalLinkIndicator,
} from './downloadAd'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from './site'

// --- markup ---

describe('download ad markup', () => {
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
    expect(markup).toContain('ダウンロードを開始しました。')
    expect(markup).toContain('自動でダウンロードされない場合はこちらをクリックしてください')
  })
})

// --- remark plugin ---

function applyRemark(tree: MdastRoot): MdastRoot {
  remarkDownloadAdPopup()(tree)
  return tree
}

describe('remarkDownloadAdPopup', () => {
  it('adds downloadAdPopup: true to frontmatter when a download link is present', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'yaml',
          value: 'title: Download test\npublished: 2026-06-20\n',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com/file.zip',
              children: [{ type: 'text', value: 'ファイルをダウンロード' }],
            },
          ],
        },
      ],
    }

    applyRemark(tree)

    expect(tree.children[0]).toMatchObject({ type: 'yaml' })
    expect((tree.children[0] as { value: string }).value).toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}: true`)
  })

  it('throws when a download link is present but YAML frontmatter is missing', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com/file.zip',
              children: [{ type: 'text', value: 'ファイルをダウンロード' }],
            },
          ],
        },
      ],
    }

    expect(() => applyRemark(tree)).toThrow('MDX pages with download links must include YAML frontmatter')
  })

  it('does not modify frontmatter when link text contains ダウンロード but href has no file extension', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'yaml',
          value: 'title: Regular article\npublished: 2026-06-20\n',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: '/download-page',
              children: [{ type: 'text', value: 'ダウンロードページへ' }],
            },
          ],
        },
      ],
    }

    applyRemark(tree)
    expect((tree.children[0] as { value: string }).value).not.toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}:`)
  })

  it('does not modify frontmatter when no download link is present', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'yaml',
          value: 'title: Regular article\npublished: 2026-06-20\n',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com/file.zip',
              children: [{ type: 'text', value: 'ファイルを開く' }],
            },
          ],
        },
      ],
    }

    applyRemark(tree)
    expect((tree.children[0] as { value: string }).value).not.toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}:`)
  })
})

// --- rehype plugin ---

function makeLink(href: string, text: string, extraChildren: Element['children'] = []): Element {
  return {
    type: 'element',
    tagName: 'a',
    properties: { href, target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] },
    children: [{ type: 'text', value: text }, ...extraChildren],
  }
}

function applyRehype(tree: HastRoot): HastRoot {
  rehypeDownloadLinks()(tree)
  return tree
}

describe('isDownloadLinkText', () => {
  it('returns true when link text contains ダウンロード', () => {
    expect(isDownloadLinkText(makeLink('/files/sample.pdf', 'PDFをダウンロード'))).toBe(true)
  })

  it('returns true for [ダウンロード](./test.pdf) style links', () => {
    expect(isDownloadLinkText(makeLink('./test.pdf', 'ダウンロード'))).toBe(true)
  })

  it('returns false when link text does not contain ダウンロード', () => {
    expect(isDownloadLinkText(makeLink('/files/sample.pdf', 'PDFを開く'))).toBe(false)
  })

  it('returns false when link text contains ダウンロード but href has no file extension', () => {
    expect(isDownloadLinkText(makeLink('/download-page', 'ダウンロードページへ'))).toBe(false)
  })

  it('returns false when href is missing', () => {
    const node: Element = {
      type: 'element',
      tagName: 'a',
      properties: {},
      children: [{ type: 'text', value: 'ダウンロード' }],
    }
    expect(isDownloadLinkText(node)).toBe(false)
  })
})

describe('stripExternalLinkIndicator', () => {
  it('removes the new-window indicator span', () => {
    const children = makeLink('https://example.com/file.zip', 'ダウンロード', [
      {
        type: 'element',
        tagName: 'span',
        properties: { 'aria-label': 'open in new window' },
        children: [{ type: 'text', value: ' ⧉' }],
      },
    ]).children

    const result = stripExternalLinkIndicator(children)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ type: 'text', value: 'ダウンロード' })
  })
})

describe('rehypeDownloadLinks', () => {
  it('replaces same-origin download anchors with popover buttons', () => {
    const tree: HastRoot = {
      type: 'root',
      children: [makeLink('./test.pdf', 'ダウンロード')],
    }

    applyRehype(tree)
    const button = tree.children[0] as Element
    expect(button.tagName).toBe('button')
    expect(button.properties.type).toBe('button')
    expect(button.properties.popovertarget).toBe(DOWNLOAD_AD_POPUP_ID)
    expect(button.properties.popovertargetaction).toBe('show')
    expect(button.properties[DOWNLOAD_AD_DATA_ATTR]).toBe('')
    expect(button.properties[DOWNLOAD_HREF_DATA_ATTR]).toBe('./test.pdf')
    expect(button.properties[DOWNLOAD_ATTR_DATA_ATTR]).toBe('')
    expect(button.properties.href).toBeUndefined()
  })

  it('opens cross-origin download links in a new tab via data attribute', () => {
    const tree: HastRoot = {
      type: 'root',
      children: [makeLink('https://example.com/file.zip', 'ダウンロードする')],
    }

    applyRehype(tree)
    const button = tree.children[0] as Element
    expect(button.tagName).toBe('button')
    expect(button.properties[DOWNLOAD_HREF_DATA_ATTR]).toBe('https://example.com/file.zip')
    expect(button.properties[DOWNLOAD_NEW_TAB_DATA_ATTR]).toBe('')
    expect(button.properties[DOWNLOAD_ATTR_DATA_ATTR]).toBeUndefined()
    expect(button.properties.target).toBeUndefined()
  })

  it('does not modify links without ダウンロード in the text', () => {
    const link = makeLink('https://example.com/file.zip', 'ファイルを開く')
    const tree: HastRoot = { type: 'root', children: [link] }

    applyRehype(tree)
    expect((tree.children[0] as Element).tagName).toBe('a')
    expect((tree.children[0] as Element).properties.target).toBe('_blank')
  })
})

// --- client wiring ---

type FakeButton = {
  getAttribute: (name: string) => string | null
  hasAttribute: (name: string) => boolean
}

function makeFakeButton(
  href = 'https://example.com/file.zip',
  opts: { sameOrigin?: boolean; newTab?: boolean } = {},
): FakeButton {
  const { sameOrigin = true, newTab = false } = opts
  return {
    getAttribute: (name) => {
      if (name === DOWNLOAD_HREF_DATA_ATTR) return href
      return null
    },
    hasAttribute: (name) => {
      if (name === DOWNLOAD_ATTR_DATA_ATTR) return sameOrigin
      if (name === DOWNLOAD_NEW_TAB_DATA_ATTR) return newTab
      return false
    },
  }
}

function makeFakePopover() {
  const fallback = {
    download: '',
    removeAttribute: vi.fn(),
    set href(value: string) {
      this._href = value
    },
    get href() {
      return this._href
    },
    _href: '#',
  }

  return {
    querySelector: (selector: string) => (selector === `#${DOWNLOAD_AD_FALLBACK_ID}` ? fallback : null),
    fallback,
  }
}

function makeSetup(
  button: FakeButton | null,
  opts: {
    whenReady?: (fn: () => void) => void
    popover?: ReturnType<typeof makeFakePopover> | null
    startDownload?: ReturnType<typeof vi.fn>
  } = {},
) {
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const popover = opts.popover === undefined ? makeFakePopover() : opts.popover
  const startDownloadFn = opts.startDownload ?? vi.fn()
  let clickHandler: ((event: Event) => void) | undefined

  setupDownloadAdPopup({
    whenReady,
    getPopupElement: () => popover as unknown as HTMLElement | null,
    findDownloadButton: () => (button ? (button as unknown as HTMLButtonElement) : null),
    addClickListener: (handler) => {
      clickHandler = handler
    },
    startDownload: startDownloadFn,
  })

  return { popover, startDownloadFn, triggerClick: () => clickHandler?.({ target: button } as Event) }
}

describe('resolveDownloadHref', () => {
  it('resolves relative paths against the document base URL', () => {
    const button = {
      getAttribute: (name: string) => (name === DOWNLOAD_HREF_DATA_ATTR ? './test.pdf' : null),
    } as HTMLButtonElement
    expect(resolveDownloadHref(button, 'http://localhost:5173/essays/download-link')).toBe(
      'http://localhost:5173/essays/test.pdf',
    )
  })
})

describe('prepareDownloadAdPopup', () => {
  it('updates the fallback link href and download attribute', () => {
    const popover = makeFakePopover()
    prepareDownloadAdPopup(popover as unknown as HTMLElement, 'https://example.com/test.pdf', '')
    expect(popover.fallback.href).toBe('https://example.com/test.pdf')
    expect(popover.fallback.download).toBe('')
  })
})

describe('setupDownloadAdPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates the fallback link and starts the download without opening the popover in script', () => {
    const button = makeFakeButton('https://example.com/file.zip')
    const { popover, startDownloadFn, triggerClick } = makeSetup(button)

    triggerClick()
    expect(popover?.fallback.href).toBe('https://example.com/file.zip')
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', '', false)
  })

  it('opens cross-origin downloads in a new tab', () => {
    const button = makeFakeButton('https://example.com/file.zip', { sameOrigin: false, newTab: true })
    const { startDownloadFn, triggerClick } = makeSetup(button)

    triggerClick()
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', undefined, true)
  })

  it('does nothing when the pre-rendered popover is missing', () => {
    const button = makeFakeButton()
    const { startDownloadFn, triggerClick } = makeSetup(button, { popover: null })

    triggerClick()
    expect(startDownloadFn).not.toHaveBeenCalled()
  })

  it('does not attach listeners before whenReady fires', () => {
    let readyFn: (() => void) | undefined
    const button = makeFakeButton()
    const { startDownloadFn, triggerClick } = makeSetup(button, {
      whenReady: (fn) => {
        readyFn = fn
      },
    })

    triggerClick()
    expect(startDownloadFn).not.toHaveBeenCalled()
    readyFn?.()
    triggerClick()
    expect(startDownloadFn).toHaveBeenCalledOnce()
  })
})