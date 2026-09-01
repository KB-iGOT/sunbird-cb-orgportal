jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EPrimaryCategory: {
      MODULE: 'Learning Module',
      COURSE: 'Course',
      RESOURCE: 'Learning Resource',
      PRACTICE_RESOURCE: 'Practice Resource',
      FINAL_ASSESSMENT: 'Final Assessment',
      OFFLINE_SESSION: 'Offline Session',
    },
  },
}))

jest.mock('../../services/app-toc.service', () => ({
  AppTocService: class MockAppTocService {
    subtitleOnBanners = false
    showDescription = true
    initData = jest.fn().mockReturnValue({ content: null, errorCode: null })
    getTocStructure = jest.fn().mockReturnValue({
      assessment: 0, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0,
      learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0,
      practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0,
      youtube: 0, interactivecontent: 0, offlineSession: 0,
    })
    fetchContentParent = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { AppTocOverviewComponent } from './app-toc-overview.component'

function makeMockContent(overrides: any = {}): any {
  return {
    identifier: 'c-001',
    name: 'Test Content',
    body: 'some body',
    primaryCategory: 'Learning Resource',
    children: [],
    ...overrides,
  }
}

describe('AppTocOverviewComponent (components)', () => {
  let component: AppTocOverviewComponent
  let mockRoute: any
  let mockTocSharedSvc: any
  let mockConfigSvc: any
  let mockDomSanitizer: any
  let mockAuthAccessControlSvc: any

  beforeEach(() => {
    mockRoute = {
      parent: {
        data: of({
          content: { data: makeMockContent() },
          pageData: { data: { subtitleOnBanners: true, showDescription: true } },
        }),
      },
    }

    mockTocSharedSvc = {
      subtitleOnBanners: false,
      showDescription: true,
      initData: jest.fn().mockReturnValue({ content: makeMockContent(), errorCode: null }),
      getTocStructure: jest.fn().mockReturnValue({
        assessment: 0, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0,
        learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0,
        practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0,
        youtube: 0, interactivecontent: 0, offlineSession: 0,
      }),
      fetchContentParent: jest.fn().mockReturnValue(of({ collections: [] })),
    }

    mockConfigSvc = {
      restrictedFeatures: new Set<string>(),
    }

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html: string) => html),
    }

    mockAuthAccessControlSvc = {
      proxyToAuthoringUrl: jest.fn((url: string) => url),
    }

    component = new AppTocOverviewComponent(
      mockRoute,
      mockTocSharedSvc,
      mockConfigSvc,
      mockDomSanitizer,
      mockAuthAccessControlSvc,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set askAuthorEnabled=true when restrictedFeatures does not have askAuthor', () => {
    expect(component.askAuthorEnabled).toBe(true)
  })

  it('should set askAuthorEnabled=false when restrictedFeatures has askAuthor', () => {
    mockConfigSvc.restrictedFeatures = new Set(['askAuthor'])
    const c = new AppTocOverviewComponent(mockRoute, mockTocSharedSvc, mockConfigSvc, mockDomSanitizer, mockAuthAccessControlSvc)
    expect(c.askAuthorEnabled).toBe(false)
  })

  it('should set trainingLHubEnabled=true when restrictedFeatures does not have trainingLHub', () => {
    // restrictedFeatures is empty Set, so !has('trainingLHub') = true
    expect(component.trainingLHubEnabled).toBe(true)
  })

  it('should set trainingLHubEnabled=false when restrictedFeatures has trainingLHub', () => {
    mockConfigSvc.restrictedFeatures = new Set(['trainingLHub'])
    const c = new AppTocOverviewComponent(mockRoute, mockTocSharedSvc, mockConfigSvc, mockDomSanitizer, mockAuthAccessControlSvc)
    expect(c.trainingLHubEnabled).toBe(false)
  })

  describe('ngOnInit()', () => {
    it('should subscribe to route.parent.data and call initData', () => {
      component.ngOnInit()
      expect(mockTocSharedSvc.initData).toHaveBeenCalled()
    })

    it('should set content from initData result', () => {
      component.ngOnInit()
      expect(component.content).toBeDefined()
      expect(component.content!.identifier).toBe('c-001')
    })

    it('should handle route without parent gracefully', () => {
      component['route'] = { parent: null } as any
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should set forPreview to true when URL includes /author/', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/author/toc/c-001' },
      })
      component.forPreview = false
      component.ngOnInit()
      expect(component.forPreview).toBe(true)
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/app/toc/c-001' },
      })
    })
  })

  describe('ngOnDestroy()', () => {
    it('should unsubscribe routeSubscription if present', () => {
      component.ngOnInit()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should not throw when routeSubscription is null', () => {
      component.routeSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('showSubtitleOnBanner getter', () => {
    it('should return value from tocSharedSvc.subtitleOnBanners', () => {
      mockTocSharedSvc.subtitleOnBanners = true
      expect(component.showSubtitleOnBanner).toBe(true)
    })
  })

  describe('showDescription getter', () => {
    it('should return true when content has no body', () => {
      component.content = makeMockContent({ body: null })
      expect(component.showDescription).toBe(true)
    })

    it('should return tocSharedSvc.showDescription when content has body', () => {
      component.content = makeMockContent({ body: '<p>Body</p>' })
      mockTocSharedSvc.showDescription = false
      expect(component.showDescription).toBe(false)
    })

    it('should return tocSharedSvc.showDescription when content is null', () => {
      component.content = null
      mockTocSharedSvc.showDescription = true
      expect(component.showDescription).toBe(true)
    })
  })

  describe('getContentParent()', () => {
    it('should not call fetchContentParent when content is null', () => {
      component.content = null
      component.getContentParent()
      expect(mockTocSharedSvc.fetchContentParent).not.toHaveBeenCalled()
    })

    it('should call fetchContentParent with content identifier', () => {
      component.content = makeMockContent({ identifier: 'c-123' })
      component.getContentParent()
      expect(mockTocSharedSvc.fetchContentParent).toHaveBeenCalledWith(
        'c-123',
        { fields: ['contentType', 'name'] },
        false,
      )
    })

    it('should handle fetchContentParent error gracefully', () => {
      component.content = makeMockContent()
      mockTocSharedSvc.fetchContentParent.mockReturnValue(throwError('error'))
      expect(() => component.getContentParent()).not.toThrow()
      expect(component.contentParents).toEqual({})
    })
  })

  describe('parseContentParent()', () => {
    it('should populate contentParents from collections', () => {
      const mockResponse: any = {
        collections: [
          {
            contentType: 'Course',
            identifier: 'parent-001',
            collections: [],
          },
        ],
      }
      component.contentParents = {}
      component.parseContentParent(mockResponse)
      expect(component.contentParents['Course']).toBeDefined()
      expect(component.contentParents['Course'].length).toBe(1)
    })

    it('should group multiple collections of same type', () => {
      const mockResponse: any = {
        collections: [
          { contentType: 'Course', identifier: 'p1', collections: [] },
          { contentType: 'Course', identifier: 'p2', collections: [] },
        ],
      }
      component.contentParents = {}
      component.parseContentParent(mockResponse)
      expect(component.contentParents['Course'].length).toBe(2)
    })

    it('should recursively parse nested collections', () => {
      const mockResponse: any = {
        collections: [
          {
            contentType: 'Program',
            identifier: 'prog-001',
            collections: [
              { contentType: 'Course', identifier: 'c-001', collections: [] },
            ],
          },
        ],
      }
      component.contentParents = {}
      component.parseContentParent(mockResponse)
      expect(component.contentParents['Program']).toBeDefined()
      expect(component.contentParents['Course']).toBeDefined()
    })
  })

  describe('resetAndFetchTocStructure()', () => {
    it('should reset tocStructure to all zeros', () => {
      component.content = null
      component.resetAndFetchTocStructure()
      expect(component.tocStructure).toBeDefined()
      expect(component.tocStructure!.assessment).toBe(0)
    })

    it('should call getTocStructure when content is set', () => {
      component.content = makeMockContent()
      component.resetAndFetchTocStructure()
      expect(mockTocSharedSvc.getTocStructure).toHaveBeenCalled()
    })

    it('should set hasTocStructure=true when any structure count > 0', () => {
      component.content = makeMockContent()
      mockTocSharedSvc.getTocStructure.mockReturnValue({
        assessment: 2, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0,
        learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0,
        practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0,
        youtube: 0, interactivecontent: 0, offlineSession: 0,
      })
      component.resetAndFetchTocStructure()
      expect(component.hasTocStructure).toBe(true)
    })

    it('should set hasTocStructure=false when all structure counts are 0', () => {
      component.content = makeMockContent()
      component.hasTocStructure = true
      component.resetAndFetchTocStructure()
      expect(component.hasTocStructure).toBe(false)
    })
  })
})
