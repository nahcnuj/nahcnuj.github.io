import { describe, expect, it, vi } from 'vitest'
import { buildFileDownloadParams, FILE_DOWNLOAD_EVENT, trackFileDownload } from './downloadTracker'

describe('buildFileDownloadParams', () => {
  it('extracts file metadata from a resolved same-origin URL', () => {
    expect(
      buildFileDownloadParams(
        'http://localhost:5173/essays/test.pdf',
        'ダウンロード',
        '/essays/download-link',
      ),
    ).toEqual({
      file_name: 'test.pdf',
      file_extension: 'pdf',
      link_url: 'http://localhost:5173/essays/test.pdf',
      link_text: 'ダウンロード',
      link_id: '/essays/download-link',
    })
  })

  it('extracts file metadata from a cross-origin URL', () => {
    expect(
      buildFileDownloadParams(
        'https://example.com/sample.pdf',
        'サンプルファイルをダウンロード',
        '/works/download-link-test',
      ),
    ).toEqual({
      file_name: 'sample.pdf',
      file_extension: 'pdf',
      link_url: 'https://example.com/sample.pdf',
      link_text: 'サンプルファイルをダウンロード',
      link_id: '/works/download-link-test',
    })
  })
})

describe('trackFileDownload', () => {
  it('sends a GA4 file_download event', () => {
    const gtagFn = vi.fn()
    trackFileDownload(gtagFn, 'http://localhost:5173/essays/test.pdf', 'PDFをダウンロード', '/essays/download-links')

    expect(gtagFn).toHaveBeenCalledWith('event', FILE_DOWNLOAD_EVENT, {
      file_name: 'test.pdf',
      file_extension: 'pdf',
      link_url: 'http://localhost:5173/essays/test.pdf',
      link_text: 'PDFをダウンロード',
      link_id: '/essays/download-links',
    })
  })
})