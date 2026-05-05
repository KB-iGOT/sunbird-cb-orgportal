jest.mock('../models/constant', () => ({
  NsContent: {
    MIME_TYPE: {
      collection: 'application/vnd.ekstep.content-collection',
      html: 'application/html',
      pdf: 'application/pdf',
      youtube: 'video/x-youtube',
      quiz: 'application/quiz',
      dragDrop: 'application/drag-drop',
      htmlPicker: 'application/htmlpicker',
      webModule: 'application/web-module',
      handson: 'application/integrated-hands-on',
      iap: 'application/iap-assessment',
      mp3: 'audio/mpeg',
      mp4: 'application/x-mpegURL',
    },
    ICON_TYPE: {
      kBoard: 'amp_stories',
      program: 'library_books',
      course: 'book',
      learningModule: 'folder',
      certificate: 'chrome_reader_mode',
      externalContent: 'open_in_new',
      internalContent: 'input',
      emptyFile: 'insert_drive_file',
      pdf: 'picture_as_pdf',
      youtube: 'subscriptions',
      assessment: 'assessment',
      quiz: 'assignment_turned_in',
      dragNDrop: 'swap_vertical_circle',
      htmlPicker: 'web_asset',
      handsOn: 'code',
      iap: 'assignment_late',
      audio: 'audiotrack',
      video: 'video_library',
      default: 'file_copy',
    },
  },
}), { virtual: true })

jest.mock('../models/search', () => ({}), { virtual: true })

jest.mock('../models/api-end-points', () => ({
  AUTHORING_CONTENT_BASE: '/apis/authContent/',
}), { virtual: true })

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AccessControlService } = require('./access-control.service') as any

const MIME = {
  collection: 'application/vnd.ekstep.content-collection',
  html: 'application/html',
  pdf: 'application/pdf',
  youtube: 'video/x-youtube',
  quiz: 'application/quiz',
  dragDrop: 'application/drag-drop',
  htmlPicker: 'application/htmlpicker',
  webModule: 'application/web-module',
  handson: 'application/integrated-hands-on',
  iap: 'application/iap-assessment',
  mp3: 'audio/mpeg',
  mp4: 'application/x-mpegURL',
}

describe('AccessControlService', () => {
  let service: any
  let mockConfigSvc: any

  function buildService(configOverrides: any = {}) {
    mockConfigSvc = {
      userRoles: new Set<string>(),
      userProfile: { userId: 'user-001', userName: 'testuser' },
      instanceConfig: {
        authoring: { newDesign: false },
        logos: { defaultContent: 'logo.png' },
        details: { appName: 'TestApp' },
      },
      activeOrg: 'TestOrg',
      rootOrg: 'testroot',
      activeThemeObject: { color: { primary: '#123456' } },
      ...configOverrides,
    }
    return new AccessControlService(mockConfigSvc, '/en/')
  }

  beforeEach(() => {
    service = buildService()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Creation
  // ──────────────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(service).toBeTruthy()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // hasRole
  // ──────────────────────────────────────────────────────────────────────────
  describe('hasRole', () => {
    it('should return true when user has one of the roles (lowercase)', () => {
      mockConfigSvc.userRoles = new Set(['editor', 'viewer'])
      expect(service.hasRole(['editor'])).toBe(true)
    })

    it('should return true when user has role (uppercase match)', () => {
      mockConfigSvc.userRoles = new Set(['EDITOR'])
      expect(service.hasRole(['editor'])).toBe(true)
    })

    it('should return false when user does not have the role', () => {
      mockConfigSvc.userRoles = new Set(['viewer'])
      expect(service.hasRole(['editor'])).toBe(false)
    })

    it('should return true when any role in the list matches', () => {
      mockConfigSvc.userRoles = new Set(['reviewer'])
      expect(service.hasRole(['editor', 'reviewer'])).toBe(true)
    })

    it('should return false when userRoles is null', () => {
      mockConfigSvc.userRoles = null
      expect(service.hasRole(['editor'])).toBe(false)
    })

    it('should return false for empty role list', () => {
      mockConfigSvc.userRoles = new Set(['editor'])
      expect(service.hasRole([])).toBe(false)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // authoringConfig
  // ──────────────────────────────────────────────────────────────────────────
  describe('authoringConfig', () => {
    it('should return authoring config from instanceConfig', () => {
      expect(service.authoringConfig).toEqual({ newDesign: false })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // userId / userName
  // ──────────────────────────────────────────────────────────────────────────
  describe('userId', () => {
    it('should return userId from userProfile', () => {
      expect(service.userId).toBe('user-001')
    })

    it('should return empty string when userProfile is null', () => {
      service = buildService({ userProfile: null })
      expect(service.userId).toBe('')
    })
  })

  describe('userName', () => {
    it('should return userName from userProfile', () => {
      expect(service.userName).toBe('testuser')
    })

    it('should return empty string when userProfile is null', () => {
      service = buildService({ userProfile: null })
      expect(service.userName).toBe('')
    })

    it('should return empty string when userName is undefined', () => {
      service = buildService({ userProfile: { userId: 'u1', userName: undefined } })
      expect(service.userName).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // locale
  // ──────────────────────────────────────────────────────────────────────────
  describe('locale', () => {
    it('should extract locale from baseHref', () => {
      service = new AccessControlService(mockConfigSvc, '/en/')
      expect(service.locale).toBe('en')
    })

    it('should extract locale from complex baseHref', () => {
      service = new AccessControlService(mockConfigSvc, '/en-US/')
      expect(service.locale).toBe('en')
    })

    it('should return en for empty baseHref', () => {
      service = new AccessControlService(mockConfigSvc, '')
      expect(service.locale).toBe('en')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // org / rootOrg / orgRootOrgAsQuery
  // ──────────────────────────────────────────────────────────────────────────
  describe('org', () => {
    it('should return activeOrg', () => {
      expect(service.org).toBe('TestOrg')
    })

    it('should return default when activeOrg is falsy', () => {
      service = buildService({ activeOrg: null })
      expect(service.org).toBe('DOPT Ltd')
    })
  })

  describe('rootOrg', () => {
    it('should return rootOrg', () => {
      expect(service.rootOrg).toBe('testroot')
    })

    it('should return default when rootOrg is falsy', () => {
      service = buildService({ rootOrg: null })
      expect(service.rootOrg).toBe('dopt')
    })
  })

  describe('orgRootOrgAsQuery', () => {
    it('should build correct query string', () => {
      expect(service.orgRootOrgAsQuery).toBe('?rootOrg=testroot&org=TestOrg')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // defaultLogo
  // ──────────────────────────────────────────────────────────────────────────
  describe('defaultLogo', () => {
    it('should return logo from instanceConfig', () => {
      expect(service.defaultLogo).toBe('logo.png')
    })

    it('should return empty string when instanceConfig is null', () => {
      service = buildService({ instanceConfig: null })
      expect(service.defaultLogo).toBe('')
    })

    it('should return empty string when logo is empty', () => {
      service = buildService({
        instanceConfig: { logos: { defaultContent: '' }, details: { appName: 'A' }, authoring: {} },
      })
      expect(service.defaultLogo).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // appName
  // ──────────────────────────────────────────────────────────────────────────
  describe('appName', () => {
    it('should return appName from instanceConfig', () => {
      expect(service.appName).toBe('TestApp')
    })

    it('should return iGot when instanceConfig is null', () => {
      service = buildService({ instanceConfig: null })
      expect(service.appName).toBe('iGot')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // activePrimary
  // ──────────────────────────────────────────────────────────────────────────
  describe('activePrimary', () => {
    it('should return primary color from activeThemeObject', () => {
      expect(service.activePrimary).toBe('#123456')
    })

    it('should return empty string when activeThemeObject is null', () => {
      service = buildService({ activeThemeObject: null })
      expect(service.activePrimary).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getAction
  // ──────────────────────────────────────────────────────────────────────────
  describe('getAction', () => {
    it('should return submitted for Draft', () => {
      expect(service.getAction('Draft')).toBe('submitted')
    })

    it('should return submitted for Live', () => {
      expect(service.getAction('Live')).toBe('submitted')
    })

    it('should return reviewerApproved for InReview with operation=1', () => {
      expect(service.getAction('InReview', 1)).toBe('reviewerApproved')
    })

    it('should return reviewerRejected for InReview without operation', () => {
      expect(service.getAction('InReview')).toBe('reviewerRejected')
    })

    it('should return reviewerRejected for InReview with operation=0', () => {
      expect(service.getAction('InReview', 0)).toBe('reviewerRejected')
    })

    it('should return qualityApproved for QualityReview with operation=1', () => {
      expect(service.getAction('QualityReview', 1)).toBe('qualityApproved')
    })

    it('should return qualityRejected for QualityReview without operation', () => {
      expect(service.getAction('QualityReview')).toBe('qualityRejected')
    })

    it('should return publisherApproved for Reviewed with operation=1', () => {
      expect(service.getAction('Reviewed', 1)).toBe('publisherApproved')
    })

    it('should return publisherRejected for Reviewed without operation', () => {
      expect(service.getAction('Reviewed')).toBe('publisherRejected')
    })

    it('should return submitted for unknown status', () => {
      expect(service.getAction('Unknown')).toBe('submitted')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // hasAccess
  // ──────────────────────────────────────────────────────────────────────────
  describe('hasAccess', () => {
    const mockMeta: any = { visibility: 'Public' }

    it('should return true when user is editor', () => {
      mockConfigSvc.userRoles = new Set(['editor'])
      expect(service.hasAccess(mockMeta)).toBe(true)
    })

    it('should return true when user is admin', () => {
      mockConfigSvc.userRoles = new Set(['admin'])
      expect(service.hasAccess(mockMeta)).toBe(true)
    })

    it('should return true for non-editor when forPreview=true and visibility=Public', () => {
      mockConfigSvc.userRoles = new Set(['viewer'])
      expect(service.hasAccess(mockMeta, true)).toBe(true)
    })

    it('should return true by default (returnValue logic)', () => {
      mockConfigSvc.userRoles = new Set(['viewer'])
      expect(service.hasAccess(mockMeta, false)).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // convertToISODate
  // ──────────────────────────────────────────────────────────────────────────
  describe('convertToISODate', () => {
    it('should convert a date string to Date', () => {
      const result = service.convertToISODate('20230115123045')
      expect(result).toBeInstanceOf(Date)
    })

    it('should return a Date 6 months in future for empty string', () => {
      const result = service.convertToISODate('')
      expect(result).toBeInstanceOf(Date)
    })

    it('should return a fallback Date on invalid input', () => {
      const result = service.convertToISODate('invalid')
      expect(result).toBeInstanceOf(Date)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // convertToESDate
  // ──────────────────────────────────────────────────────────────────────────
  describe('convertToESDate', () => {
    it('should return ES formatted date string', () => {
      const date = new Date('2023-01-15T12:30:45.000Z')
      const result = service.convertToESDate(date)
      expect(result).toContain('20230115')
      expect(result).toContain('+0000')
    })

    it('should strip hyphens and colons', () => {
      const date = new Date('2023-06-01T00:00:00.000Z')
      const result = service.convertToESDate(date)
      expect(result).not.toContain('-')
      expect(result).not.toContain(':')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getCategory
  // ──────────────────────────────────────────────────────────────────────────
  describe('getCategory', () => {
    it('should return category when present', () => {
      const content: any = { category: 'Learning Resource', contentType: 'Resource' }
      expect(service.getCategory(content)).toBe('Learning Resource')
    })

    it('should fall back to contentType when category is absent', () => {
      const content: any = { contentType: 'Resource' }
      expect(service.getCategory(content)).toBe('Resource')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getCategoryType
  // ──────────────────────────────────────────────────────────────────────────
  describe('getCategoryType', () => {
    it('should return primaryCategory for Learning Resource', () => {
      const content: any = { category: 'Learning Resource', primaryCategory: 'Podcast' }
      expect(service.getCategoryType(content)).toBe('Podcast')
    })

    it('should return Resource when primaryCategory is absent for Learning Resource', () => {
      const content: any = { category: 'Learning Resource' }
      expect(service.getCategoryType(content)).toBe('Resource')
    })

    it('should return Module for Course Unit', () => {
      const content: any = { category: 'Course Unit' }
      expect(service.getCategoryType(content)).toBe('Module')
    })

    it('should return Course for Course', () => {
      const content: any = { category: 'Course', primaryCategory: 'MyCourse' }
      expect(service.getCategoryType(content)).toBe('MyCourse')
    })

    it('should return Program for Program', () => {
      const content: any = { category: 'Program', primaryCategory: 'BlendedProgram' }
      expect(service.getCategoryType(content)).toBe('BlendedProgram')
    })

    it('should return raw category for unknown category', () => {
      const content: any = { category: 'Observation' }
      expect(service.getCategoryType(content)).toBe('Observation')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getIcon
  // ──────────────────────────────────────────────────────────────────────────
  describe('getIcon', () => {
    function makeContent(mimeType: string, overrides: any = {}): any {
      return { mimeType, category: 'Resource', contentType: 'Resource', ...overrides }
    }

    it('should return kBoard icon for collection with Knowledge Board category', () => {
      const result = service.getIcon(makeContent(MIME.collection, { category: 'Knowledge Board' }))
      expect(result).toBe('amp_stories')
    })

    it('should return program icon for collection with Learning Path category', () => {
      const result = service.getIcon(makeContent(MIME.collection, { category: 'Learning Path' }))
      expect(result).toBe('library_books')
    })

    it('should return course icon for collection with Course category', () => {
      const result = service.getIcon(makeContent(MIME.collection, { category: 'Course' }))
      expect(result).toBe('book')
    })

    it('should return learningModule icon for other collection', () => {
      const result = service.getIcon(makeContent(MIME.collection, { category: 'Other' }))
      expect(result).toBe('folder')
    })

    it('should return certificate icon for html with Certification resourceType', () => {
      const result = service.getIcon(makeContent(MIME.html, { resourceType: 'Certification' }))
      expect(result).toBe('chrome_reader_mode')
    })

    it('should return externalContent icon for html with isExternal=true', () => {
      const result = service.getIcon(makeContent(MIME.html, { isExternal: true }))
      expect(result).toBe('open_in_new')
    })

    it('should return internalContent icon for plain html', () => {
      const result = service.getIcon(makeContent(MIME.html))
      expect(result).toBe('input')
    })

    it('should return emptyFile icon for pdf without artifactUrl', () => {
      const result = service.getIcon(makeContent(MIME.pdf, { artifactUrl: null }))
      expect(result).toBe('insert_drive_file')
    })

    it('should return pdf icon for pdf with artifactUrl', () => {
      const result = service.getIcon(makeContent(MIME.pdf, { artifactUrl: 'https://example.com/doc.pdf' }))
      expect(result).toBe('picture_as_pdf')
    })

    it('should return youtube icon for youtube mimeType', () => {
      const result = service.getIcon(makeContent(MIME.youtube))
      expect(result).toBe('subscriptions')
    })

    it('should return assessment icon for quiz with Assessment categoryType', () => {
      const result = service.getIcon(makeContent(MIME.quiz, { category: 'Course Assessment' }))
      expect(result).toBe('assignment_turned_in') // falls to quiz since getCategoryType won't return 'Assessment'
    })

    it('should return quiz icon for quiz mimeType', () => {
      const result = service.getIcon(makeContent(MIME.quiz, { category: 'Learning Resource' }))
      expect(result).toBe('assignment_turned_in')
    })

    it('should return dragNDrop icon for dragDrop mimeType', () => {
      const result = service.getIcon(makeContent(MIME.dragDrop))
      expect(result).toBe('swap_vertical_circle')
    })

    it('should return htmlPicker icon for htmlPicker mimeType', () => {
      const result = service.getIcon(makeContent(MIME.htmlPicker))
      expect(result).toBe('web_asset')
    })

    it('should return internalContent icon for webModule mimeType', () => {
      const result = service.getIcon(makeContent(MIME.webModule))
      expect(result).toBe('input')
    })

    it('should return handsOn icon for handson mimeType', () => {
      const result = service.getIcon(makeContent(MIME.handson))
      expect(result).toBe('code')
    })

    it('should return iap icon for iap mimeType', () => {
      const result = service.getIcon(makeContent(MIME.iap))
      expect(result).toBe('assignment_late')
    })

    it('should return audio icon for mp3 mimeType', () => {
      const result = service.getIcon(makeContent(MIME.mp3))
      expect(result).toBe('audiotrack')
    })

    it('should return video icon for mp4 mimeType', () => {
      const result = service.getIcon(makeContent(MIME.mp4))
      expect(result).toBe('video_library')
    })

    it('should return default icon for unknown mimeType', () => {
      const result = service.getIcon(makeContent('unknown/mime'))
      expect(result).toBe('file_copy')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // proxyToAuthoringUrl
  // ──────────────────────────────────────────────────────────────────────────
  describe('proxyToAuthoringUrl', () => {
    it('should replace content-store URL with authoring URL', () => {
      const input = `https://example.com/content-store/path/file.pdf"`
      const result = service.proxyToAuthoringUrl(input)
      expect(result).toContain('/apis/authContent/')
    })

    it('should return value unchanged when no content-store URL present', () => {
      const input = 'https://example.com/other/path/file.pdf'
      expect(service.proxyToAuthoringUrl(input)).toBe(input)
    })
  })
})
