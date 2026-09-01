// Augment @ws-widget/collection to include the missing NsDiscussionForum that
// the component incorrectly imports from this package (correct source is @sunbird-cb/collection)
declare module '@ws-widget/collection' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NsDiscussionForum {
    enum EDiscussionType { LEARNING = 'learning' }
    interface IDiscussionForumInput {
      description: string
      id: string
      name: EDiscussionType
      title: string
      initialPostCount: number
      isDisabled: boolean
    }
  }
}

jest.mock('@ws-widget/collection', () => ({
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'learning' },
  },
  NsContent: {},
}), { virtual: true })

jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}), { virtual: true })

import { of } from 'rxjs'
import { AppTocDiscussionComponent } from './app-toc-discussion.component'

describe('AppTocDiscussionComponent', () => {
  let component: AppTocDiscussionComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any

  const mockContent = {
    identifier: 'content-001',
    description: 'Test description',
    name: 'Test Content',
  } as any

  function buildComponent() {
    return new AppTocDiscussionComponent(mockActivatedRoute, mockConfigSvc)
  }

  beforeEach(() => {
    mockActivatedRoute = {
      parent: {
        data: of({ content: { data: mockContent } }),
      },
    }
    mockConfigSvc = {
      restrictedFeatures: new Set<string>(),
    }
    component = buildComponent()
    component.content = { ...mockContent }

    Object.defineProperty(window, 'location', {
      value: { href: 'http://test.com/app/toc/content-001' },
      configurable: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ── Creation ──────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with isRestricted true and forPreview false', () => {
    expect(component.isRestricted).toBe(true)
    expect(component.forPreview).toBe(false)
    expect(component.discussionForumWidget).toBeNull()
    expect(component.showDiscussionForum).toBe(false)
  })

  // ── ngOnChanges ───────────────────────────────────────────────────────────
  describe('ngOnChanges', () => {
    it('should set discussionForumWidget when content is provided', () => {
      component.ngOnChanges()
      expect(component.discussionForumWidget).not.toBeNull()
    })

    it('should set forPreview true when URL contains /author/', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://test.com/author/content-001' },
        configurable: true,
      })
      component.ngOnChanges()
      expect(component.forPreview).toBe(true)
    })

    it('should set forPreview false when URL does not contain /author/', () => {
      component.ngOnChanges()
      expect(component.forPreview).toBe(false)
    })

    it('should not set discussionForumWidget when content is undefined', () => {
      component.content = undefined as any
      component.ngOnChanges()
      expect(component.discussionForumWidget).toBeNull()
    })

    it('should populate widgetData with correct content fields', () => {
      component.ngOnChanges()
      const widgetData = component.discussionForumWidget!.widgetData
      expect(widgetData.id).toBe('content-001')
      expect(widgetData.title).toBe('Test Content')
      expect(widgetData.description).toBe('Test description')
      expect(widgetData.initialPostCount).toBe(2)
    })

    it('should set widgetData.name to learning type', () => {
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetData.name).toBe('learning')
    })

    it('should set isDisabled based on forPreview value', () => {
      component.forPreview = false
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(false)
    })

    it('should set isDisabled to true when forPreview is true', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://test.com/author/path' },
        configurable: true,
      })
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(true)
    })

    it('should set widgetType and widgetSubType to discussionForum', () => {
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetType).toBe('discussionForum')
      expect(component.discussionForumWidget!.widgetSubType).toBe('discussionForum')
    })
  })

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should set isRestricted false when restrictedFeatures is empty', () => {
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should set isRestricted true when disscussionForum is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
      component = buildComponent()
      component.content = { ...mockContent }
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('should set isRestricted true when disscussionForumTRPU is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForumTRPU'])
      component = buildComponent()
      component.content = { ...mockContent }
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('should not change isRestricted when restrictedFeatures is null', () => {
      mockConfigSvc.restrictedFeatures = null
      component = buildComponent()
      component.content = { ...mockContent }
      component.ngOnInit()
      // default value is true, no restrictedFeatures check happens
      expect(component.isRestricted).toBe(true)
    })

    it('should update content from parent route data', () => {
      const routeContent = { identifier: 'new-id', description: 'New', name: 'New Content' }
      mockActivatedRoute = {
        parent: { data: of({ content: { data: routeContent } }) },
      }
      component = buildComponent()
      component.content = { identifier: 'old-id' } as any
      component.ngOnInit()
      expect(component.content).toEqual(routeContent as any)
    })

    it('should call ngOnChanges after updating content from route data', () => {
      const spy = jest.spyOn(component, 'ngOnChanges')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should not update content when route data is missing content', () => {
      mockActivatedRoute = {
        parent: { data: of({ otherData: {} }) },
      }
      component = buildComponent()
      component.content = { identifier: 'original-id' } as any
      component.ngOnInit()
      expect(component.content.identifier).toBe('original-id')
    })

    it('should handle missing parent route gracefully', () => {
      mockActivatedRoute = { parent: null }
      component = buildComponent()
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })
})

describe('AppTocDiscussionComponent', () => {
  let component: AppTocDiscussionComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any

  const mockContent = {
    identifier: 'content-001',
    description: 'Test description',
    name: 'Test Content',
  } as any

  function buildComponent() {
    return new AppTocDiscussionComponent(mockActivatedRoute, mockConfigSvc)
  }

  beforeEach(() => {
    mockActivatedRoute = {
      parent: {
        data: of({ content: { data: mockContent } }),
      },
    }
    mockConfigSvc = {
      restrictedFeatures: new Set<string>(),
    }
    component = buildComponent()
    component.content = { ...mockContent }

    Object.defineProperty(window, 'location', {
      value: { href: 'http://test.com/app/toc/content-001' },
      configurable: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ── Creation ──────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with isRestricted true and forPreview false', () => {
    expect(component.isRestricted).toBe(true)
    expect(component.forPreview).toBe(false)
    expect(component.discussionForumWidget).toBeNull()
    expect(component.showDiscussionForum).toBe(false)
  })

  // ── ngOnChanges ───────────────────────────────────────────────────────────
  describe('ngOnChanges', () => {
    it('should set discussionForumWidget when content is provided', () => {
      component.ngOnChanges()
      expect(component.discussionForumWidget).not.toBeNull()
    })

    it('should set forPreview true when URL contains /author/', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://test.com/author/content-001' },
        configurable: true,
      })
      component.ngOnChanges()
      expect(component.forPreview).toBe(true)
    })

    it('should set forPreview false when URL does not contain /author/', () => {
      component.ngOnChanges()
      expect(component.forPreview).toBe(false)
    })

    it('should not set discussionForumWidget when content is undefined', () => {
      component.content = undefined as any
      component.ngOnChanges()
      expect(component.discussionForumWidget).toBeNull()
    })

    it('should populate widgetData with correct content fields', () => {
      component.ngOnChanges()
      const widgetData = component.discussionForumWidget!.widgetData
      expect(widgetData.id).toBe('content-001')
      expect(widgetData.title).toBe('Test Content')
      expect(widgetData.description).toBe('Test description')
      expect(widgetData.initialPostCount).toBe(2)
    })

    it('should set widgetData.name to learning type', () => {
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetData.name).toBe('learning')
    })

    it('should set isDisabled based on forPreview value', () => {
      component.forPreview = false
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(false)
    })

    it('should set isDisabled to true when forPreview is true', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://test.com/author/path' },
        configurable: true,
      })
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(true)
    })

    it('should set widgetType and widgetSubType to discussionForum', () => {
      component.ngOnChanges()
      expect(component.discussionForumWidget!.widgetType).toBe('discussionForum')
      expect(component.discussionForumWidget!.widgetSubType).toBe('discussionForum')
    })
  })

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should set isRestricted false when restrictedFeatures is empty', () => {
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should set isRestricted true when disscussionForum is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
      component = buildComponent()
      component.content = { ...mockContent }
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('should set isRestricted true when disscussionForumTRPU is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForumTRPU'])
      component = buildComponent()
      component.content = { ...mockContent }
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('should not change isRestricted when restrictedFeatures is null', () => {
      mockConfigSvc.restrictedFeatures = null
      component = buildComponent()
      component.content = { ...mockContent }
      component.ngOnInit()
      // default value is true, no restrictedFeatures check happens
      expect(component.isRestricted).toBe(true)
    })

    it('should update content from parent route data', () => {
      const routeContent = { identifier: 'new-id', description: 'New', name: 'New Content' }
      mockActivatedRoute = {
        parent: { data: of({ content: { data: routeContent } }) },
      }
      component = buildComponent()
      component.content = { identifier: 'old-id' } as any
      component.ngOnInit()
      expect(component.content).toEqual(routeContent as any)
    })

    it('should call ngOnChanges after updating content from route data', () => {
      const spy = jest.spyOn(component, 'ngOnChanges')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should not update content when route data is missing content', () => {
      mockActivatedRoute = {
        parent: { data: of({ otherData: {} }) },
      }
      component = buildComponent()
      component.content = { identifier: 'original-id' } as any
      component.ngOnInit()
      expect(component.content.identifier).toBe('original-id')
    })

    it('should handle missing parent route gracefully', () => {
      mockActivatedRoute = { parent: null }
      component = buildComponent()
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })
})
