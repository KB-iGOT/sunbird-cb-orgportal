(window as any)['env'] = {
  name: 'test-environment',
  sitePath: '/test-site-path',
  karmYogiPath: '/test-karm-yogi-path',
  cbpPath: '/test-cbp-path'
}
import '@angular/compiler'
import { AppTocSinglePageComponent } from './app-toc-single-page.component'
import { Subject } from 'rxjs'
import _ from 'lodash'

describe('AppTocSinglePageComponent', () => {
  let component: AppTocSinglePageComponent
  let mockRouter: any
  let mockRoute: any
  let mockTocSharedSvc: any
  let mockDomSanitizer: any
  let mockAuthAccessControlSvc: any
  let mockLogger: any
  let mockTitleTagService: any
  let mockCreateBatchDialog: any
  let mockMobileAppsSvc: any
  let mockConfigSvc: any
  let mockConnectionHoverService: any
  let mockEventSvc: any
  let mockRatingSvc: any
  let mockTranslate: any
  let mockLangTranslations: any

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn()
    }

    mockRoute = {
      fragment: new Subject(),
      data: new Subject()
    }

    mockTocSharedSvc = {
      getSelectedBatch: new Subject(),
      initData: jest.fn(),
      getTocStructure: jest.fn(),
      updateBatchData: jest.fn()
    }

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn(val => val)
    }

    mockAuthAccessControlSvc = {
      proxyToAuthoringUrl: jest.fn(val => val)
    }

    mockLogger = {
      error: jest.fn()
    }

    mockTitleTagService = {
      setSocialMediaTags: jest.fn()
    }

    mockCreateBatchDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => new Subject()
      })
    }

    mockConfigSvc = {
      restrictedFeatures: new Set(),
      userProfile: {
        userId: 'test-user-id'
      },
      activeLocale: {
        path: 'en'
      }
    }

    mockRatingSvc = {
      getRatingSummary: jest.fn(),
      getRatingLookup: jest.fn(),
      getRatingReply: jest.fn()
    }

    mockTranslate = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    }

    component = new AppTocSinglePageComponent(
      mockRouter,
      mockRoute,
      mockTocSharedSvc,
      mockDomSanitizer,
      mockAuthAccessControlSvc,
      mockLogger,
      mockTitleTagService,
      mockCreateBatchDialog,
      mockMobileAppsSvc,
      mockConfigSvc,
      mockConnectionHoverService,
      mockEventSvc,
      mockRatingSvc,
      mockTranslate,
      mockLangTranslations
    )
  })

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.showMoreGlance).toBeFalsy()
      expect(component.askAuthorEnabled).toBeTruthy()
      expect(component.trainingLHubEnabled).toBeTruthy()
      expect(component.body).toBeNull()
      expect(component.viewMoreRelatedTopics).toBeFalsy()
      expect(component.hasTocStructure).toBeFalsy()
    })
  })

  describe('detailUrl', () => {
    it('should return correct URL for CHANNEL type', () => {
      const data = {
        primaryCategory: 'Channel',
        artifactUrl: '/test-url'
      }
      const result = component.detailUrl(data)
      expect(result).toBe(`${location.origin}/en/test-url`)
    })

    it('should return correct URL for KNOWLEDGE_BOARD type', () => {
      const data = {
        primaryCategory: 'Knowledge Board',
        identifier: 'test-id'
      }
      const result = component.detailUrl(data)
      expect(result).toBe(`${location.origin}/en/app/knowledge-board/test-id`)
    })
  })


  describe('openDialog', () => {
    it('should open create batch dialog', () => {
      const mockContent = { id: 'test' }
      component.openDialog(mockContent)

      expect(mockCreateBatchDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        {
          width: '600px',
          data: { content: mockContent }
        }
      )
    })
  })

  describe('getUserFullName', () => {
    it('should return full name when first and last name exist', () => {
      const user = {
        first_name: 'John ',
        last_name: ' Doe '
      }
      expect(component.getUserFullName(user)).toBe('John Doe')
    })

    it('should return empty string when names are missing', () => {
      const user = {}
      expect(component.getUserFullName(user)).toBe('')
    })
  })
})