// Mock the imported NsContent before importing the functions
jest.mock('./widget-content.model', () => ({
  NsContent: {
    EMimeTypes: {
      MP3: 'audio/mp3',
      M4A: 'audio/m4a',
      COLLECTION: 'application/vnd.collection',
      CHANNEL: 'application/vnd.channel',
      CERTIFICATION: 'application/vnd.certification',
      HTML: 'text/html',
      HTML_TEXT: 'text/html-text',
      IAP: 'application/vnd.iap',
      ILP_FP: 'application/vnd.ilp-fp',
      PDF: 'application/pdf',
      MP4: 'video/mp4',
      M3U8: 'application/vnd.apple.mpegurl',
      YOUTUBE: 'video/youtube',
      WEB_MODULE: 'application/vnd.web-module',
      WEB_MODULE_EXERCISE: 'application/vnd.web-module-exercise',
      CLASS_DIAGRAM: 'application/vnd.class-diagram',
      HANDS_ON: 'application/vnd.hands-on',
      RDBMS_HANDS_ON: 'application/vnd.rdbms-hands-on',
      HTML_PICKER: 'application/vnd.html-picker',
      QUIZ: 'application/vnd.quiz',
      COLLECTION_RESOURCE: 'application/vnd.collection-resource'
    },
    PLAYER_SUPPORTED_COLLECTION_TYPES: ['Course', 'LearningPath', 'Resource']
  }
}))

import { VIEWER_ROUTE_FROM_MIME, viewerRouteGenerator } from './viewer-route-util'
import { NsContent } from './widget-content.model'

describe('VIEWER_ROUTE_FROM_MIME', () => {
  it('should return "audio" for MP3 mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.MP3 as any)).toBe('audio')
  })

  it('should return "audio-native" for M4A mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.M4A as any)).toBe('audio-native')
  })

  it('should return "html" for COLLECTION mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.COLLECTION as any)).toBe('html')
  })

  it('should return "channel" for CHANNEL mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.CHANNEL as any)).toBe('channel')
  })

  it('should return "channel" for application/json mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME('application/json' as any)).toBe('channel')
  })

  it('should return "certification" for CERTIFICATION mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.CERTIFICATION as any)).toBe('certification')
  })

  it('should return "html" for HTML mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HTML as any)).toBe('html')
  })

  it('should return "html" for HTML_TEXT mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HTML_TEXT as any)).toBe('html')
  })

  it('should return "iap" for IAP mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.IAP as any)).toBe('iap')
  })

  it('should return "ilp-fp" for ILP_FP mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.ILP_FP as any)).toBe('ilp-fp')
  })

  it('should return "pdf" for PDF mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.PDF as any)).toBe('pdf')
  })

  it('should return "video" for MP4 mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.MP4 as any)).toBe('video')
  })

  it('should return "video" for M3U8 mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.M3U8 as any)).toBe('video')
  })

  it('should return "youtube" for YOUTUBE mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.YOUTUBE as any)).toBe('youtube')
  })

  it('should return "web-module" for WEB_MODULE mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.WEB_MODULE as any)).toBe('web-module')
  })

  it('should return "web-module" for WEB_MODULE_EXERCISE mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.WEB_MODULE_EXERCISE as any)).toBe('web-module')
  })

  it('should return "class-diagram" for CLASS_DIAGRAM mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.CLASS_DIAGRAM as any)).toBe('class-diagram')
  })

  it('should return "hands-on" for HANDS_ON mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HANDS_ON as any)).toBe('hands-on')
  })

  it('should return "rdbms-hands-on" for RDBMS_HANDS_ON mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.RDBMS_HANDS_ON as any)).toBe('rdbms-hands-on')
  })

  it('should return "html-picker" for HTML_PICKER mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.HTML_PICKER as any)).toBe('html-picker')
  })

  it('should return "quiz" for QUIZ mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.QUIZ as any)).toBe('quiz')
  })

  it('should return "resource-collection" for COLLECTION_RESOURCE mime type', () => {
    expect(VIEWER_ROUTE_FROM_MIME(NsContent.EMimeTypes.COLLECTION_RESOURCE as any)).toBe('resource-collection')
  })

  it('should return "html" for unknown mime type (default case)', () => {
    expect(VIEWER_ROUTE_FROM_MIME('unknown/mime-type' as any)).toBe('html')
  })
})

describe('viewerRouteGenerator', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks()
  })

  describe('Basic URL generation', () => {
    it('should generate basic viewer URL without preview', () => {
      const result = viewerRouteGenerator('content-id', NsContent.EMimeTypes.HTML as any)

      expect(result.url).toBe('/viewer/html/content-id')
      expect(result.queryParams).toEqual({})
    })

    it('should generate preview URL when forPreview is true', () => {
      const result = viewerRouteGenerator('content-id', NsContent.EMimeTypes.PDF as any, undefined, undefined, true)

      expect(result.url).toBe('/author/viewer/pdf/content-id')
      expect(result.queryParams).toEqual({})
    })

    it('should use correct route based on mime type', () => {
      const result = viewerRouteGenerator('video-id', NsContent.EMimeTypes.MP4 as any)

      expect(result.url).toBe('/viewer/video/video-id')
    })
  })

  describe('Query parameters', () => {
    it('should include primaryCategory in query params when provided', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        undefined,
        undefined,
        false,
        'Technology'
      )

      expect(result.queryParams).toEqual({
        primaryCategory: 'Technology'
      })
    })

    it('should include collection params when both collectionId and collectionType are provided and supported', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        'collection-123',
        'Course'
      )

      expect(result.queryParams).toEqual({
        collectionId: 'collection-123',
        collectionType: 'Course'
      })
    })

    it('should include batchId in query params when provided', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        undefined,
        undefined,
        false,
        undefined,
        'batch-456'
      )

      expect(result.queryParams).toEqual({
        batchId: 'batch-456'
      })
    })

    it('should combine all query parameters when provided', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        'collection-123',
        'Course',
        false,
        'Technology',
        'batch-456'
      )

      expect(result.queryParams).toEqual({
        primaryCategory: 'Technology',
        collectionId: 'collection-123',
        collectionType: 'Course',
        batchId: 'batch-456'
      })
    })
  })

  describe('Collection type filtering', () => {
    it('should exclude collection params when collectionType is not supported', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        'collection-123',
        'UnsupportedType'
      )

      expect(result.queryParams).toEqual({})
      expect(result.queryParams.collectionId).toBeUndefined()
      expect(result.queryParams.collectionType).toBeUndefined()
    })

    it('should include collection params when collectionType is supported', () => {
      NsContent.PLAYER_SUPPORTED_COLLECTION_TYPES.forEach(supportedType => {
        const result = viewerRouteGenerator(
          'content-id',
          NsContent.EMimeTypes.HTML as any,
          'collection-123',
          supportedType
        )

        expect(result.queryParams).toEqual({
          collectionId: 'collection-123',
          collectionType: supportedType
        })
      })
    })

    it('should not include collection params when only collectionId is provided', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        'collection-123'
      )

      expect(result.queryParams).toEqual({})
    })

    it('should not include collection params when only collectionType is provided', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        undefined,
        'Course'
      )

      expect(result.queryParams).toEqual({})
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string parameters', () => {
      const result = viewerRouteGenerator(
        '',
        NsContent.EMimeTypes.HTML as any,
        '',
        '',
        false,
        '',
        ''
      )

      expect(result.url).toBe('/viewer/html/')
      expect(result.queryParams).toEqual({
        primaryCategory: ''
      })
    })

    it('should handle undefined parameters gracefully', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.HTML as any,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )

      expect(result.url).toBe('/viewer/html/content-id')
      expect(result.queryParams).toEqual({})
    })

    it('should work with preview flag and all other parameters', () => {
      const result = viewerRouteGenerator(
        'content-id',
        NsContent.EMimeTypes.MP4 as any,
        'collection-123',
        'Course',
        true,
        'Technology',
        'batch-456'
      )

      expect(result.url).toBe('/author/viewer/video/content-id')
      expect(result.queryParams).toEqual({
        primaryCategory: 'Technology',
        collectionId: 'collection-123',
        collectionType: 'Course',
        batchId: 'batch-456'
      })
    })
  })
})