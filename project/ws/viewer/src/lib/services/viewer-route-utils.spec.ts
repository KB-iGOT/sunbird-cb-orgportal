import { VIEWER_ROUTE_FROM_MIME, viewerRouteGenerator } from './viewer-route-utils'
import { NsContent } from '../models/constant'

describe('VIEWER_ROUTE_FROM_MIME', () => {
  it('should return "audio" for MP3', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.MP3)).toBe('audio')
  })

  it('should return "audio-native" for M4A', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.M4A)).toBe('audio-native')
  })

  it('should return "html" for COLLECTION', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.COLLECTION)).toBe('html')
  })

  it('should return "certification" for CERTIFICATION', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.CERTIFICATION)).toBe('certification')
  })

  it('should return "html" for HTML_TEXT', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HTML_TEXT)).toBe('html')
  })

  it('should return "html" for HTML', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HTML)).toBe('html')
  })

  it('should return "html" for ZIP', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.ZIP)).toBe('html')
  })

  it('should return "youtube" for TEXT_WEB', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.TEXT_WEB)).toBe('youtube')
  })

  it('should return "survey" for SURVEY', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.SURVEY)).toBe('survey')
  })

  it('should return "iap" for IAP', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.IAP)).toBe('iap')
  })

  it('should return "ilp-fp" for ILP_FP', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.ILP_FP)).toBe('ilp-fp')
  })

  it('should return "pdf" for PDF', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.PDF)).toBe('pdf')
  })

  it('should return "video" for MP4', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.MP4)).toBe('video')
  })

  it('should return "video" for M3U8', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.M3U8)).toBe('video')
  })

  it('should return "youtube" for YOUTUBE', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.YOUTUBE)).toBe('youtube')
  })

  it('should return "web-module" for WEB_MODULE', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.WEB_MODULE)).toBe('web-module')
  })

  it('should return "web-module" for WEB_MODULE_EXERCISE', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.WEB_MODULE_EXERCISE)).toBe('web-module')
  })

  it('should return "class-diagram" for CLASS_DIAGRAM', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.CLASS_DIAGRAM)).toBe('class-diagram')
  })

  it('should return "hands-on" for HANDS_ON', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HANDS_ON)).toBe('hands-on')
  })

  it('should return "rdbms-hands-on" for RDBMS_HANDS_ON', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.RDBMS_HANDS_ON)).toBe('rdbms-hands-on')
  })

  it('should return "html-picker" for HTML_PICKER', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HTML_PICKER)).toBe('html-picker')
  })

  it('should return "quiz" for QUIZ', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.QUIZ)).toBe('quiz')
  })

  it('should return "quiz" for APPLICATION_JSON', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.APPLICATION_JSON)).toBe('quiz')
  })

  it('should return "practice" for PRACTICE_RESOURCE', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.PRACTICE_RESOURCE)).toBe('practice')
  })

  it('should return "resource-collection" for COLLECTION_RESOURCE', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.COLLECTION_RESOURCE)).toBe('resource-collection')
  })

  it('should return "offline-session" for OFFLINE_SESSION', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.OFFLINE_SESSION)).toBe('offline-session')
  })

  it('should return "html" for unknown mimeType', () => {
    expect(VIEWER_ROUTE_FROM_MIME('unknown/type' as any)).toBe('html')
  })

  it('should return "mobile/html" for HTML when url includes mobile/html', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/mobile/html/content' },
      writable: true,
    })
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HTML)).toBe('mobile/html')
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
    })
  })
})

describe('viewerRouteGenerator', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
    })
  })

  it('should generate correct url with id and mimeType', () => {
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF)
    expect(result.url).toBe('/viewer/pdf/id1')
  })

  it('should include collectionId and collectionType in queryParams when both provided', () => {
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF, 'col1', 'Course')
    expect(result.queryParams).toMatchObject({ collectionId: 'col1', collectionType: 'Course' })
  })

  it('should set collectionId to undefined when collectionType is not player-supported', () => {
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF, 'col1', 'Blended')
    expect(result.queryParams).toMatchObject({ collectionId: undefined, collectionType: undefined })
  })

  it('should include batchId when provided', () => {
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF, 'col1', 'Course', false, undefined, 'batch1')
    expect(result.queryParams).toMatchObject({ batchId: 'batch1' })
  })

  it('should include courseName when provided', () => {
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF, undefined, undefined, false, undefined, undefined, 'MyName')
    expect(result.queryParams).toMatchObject({ courseName: 'MyName' })
  })

  it('should include preview: true when forPreview is true', () => {
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF, undefined, undefined, true)
    expect(result.queryParams).toMatchObject({ preview: true })
  })

  it('should include primaryCategory when provided', () => {
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF, undefined, undefined, false, 'Learning Resource')
    expect(result.queryParams).toMatchObject({ primaryCategory: 'Learning Resource' })
  })

  it('should include editMode when url includes editMode=true', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/app?editMode=true' },
      writable: true,
    })
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF)
    expect(result.queryParams).toMatchObject({ editMode: true })
  })

  it('should include editMode when url includes preview', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/author/preview/id1' },
      writable: true,
    })
    const result = viewerRouteGenerator('id1', NsContent.EMimeTypes.PDF)
    expect(result.queryParams).toMatchObject({ editMode: true })
  })
})
