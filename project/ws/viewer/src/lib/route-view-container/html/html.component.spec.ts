import { HtmlComponent } from './html.component'
import { of } from 'rxjs'
import { SimpleChange } from '@angular/core'

describe('HtmlComponent (route-view-container)', () => {
  let component: HtmlComponent
  let mockActivatedRoute: any
  let mockDomSanitizer: any
  let mockPipeLimitTo: any
  let mockValueSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
      },
    }
    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((v: string) => `safe:${v}`),
    }
    mockPipeLimitTo = {
      transform: jest.fn().mockImplementation((v: string, _limit: number) => v),
    }
    mockValueSvc = {
      isLtMedium$: of(false),
    }
    mockConfigSvc = {
      restrictedFeatures: new Set<string>(),
    }

    component = new HtmlComponent(
      mockActivatedRoute,
      mockDomSanitizer,
      mockPipeLimitTo,
      mockValueSvc,
      mockConfigSvc,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set isTypeOfCollection to true when collectionType queryParam exists', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course' }
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(true)
    })

    it('should set isTypeOfCollection to false when collectionType queryParam is absent', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should set isRestricted to true when restrictedFeatures does NOT have disscussionForum', () => {
      mockConfigSvc.restrictedFeatures = new Set<string>(['someOtherFeature'])
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('should set isRestricted to false when restrictedFeatures HAS disscussionForum', () => {
      mockConfigSvc.restrictedFeatures = new Set<string>(['disscussionForum'])
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should not set isRestricted when restrictedFeatures is falsy', () => {
      mockConfigSvc.restrictedFeatures = null
      component.isRestricted = false
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should update isLtMedium from valueSvc subscription', () => {
      mockValueSvc.isLtMedium$ = of(true)
      component.ngOnInit()
      expect(component.isLtMedium).toBe(true)
    })

    it('should set isLtMedium to false when stream emits false', () => {
      mockValueSvc.isLtMedium$ = of(false)
      component.ngOnInit()
      expect(component.isLtMedium).toBe(false)
    })
  })

  // ─── ngOnChanges ───────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should set isScormContent to true when artifactUrl starts with https://scorm.', () => {
      component.htmlData = {
        artifactUrl: 'https://scorm.example.com/content',
      } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(component.isScormContent).toBe(true)
    })

    it('should set isScormContent to false when artifactUrl does not start with https://scorm.', () => {
      component.htmlData = {
        artifactUrl: 'https://example.com/content',
      } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(component.isScormContent).toBe(false)
    })

    it('should set isScormContent to false when htmlData is null', () => {
      component.htmlData = null
      const changes = { htmlData: new SimpleChange(null, null, true) }
      component.ngOnChanges(changes)
      expect(component.isScormContent).toBe(false)
    })

    it('should set isScormContent to false when artifactUrl is falsy', () => {
      component.htmlData = { artifactUrl: null } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(component.isScormContent).toBe(false)
    })

    it('should sanitize learningObjective when htmlData has learningObjective', () => {
      component.htmlData = {
        artifactUrl: 'https://example.com',
        learningObjective: '<p>Learn something</p>',
      } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<p>Learn something</p>')
      expect(component.learningObjective).toBe('safe:<p>Learn something</p>')
    })

    it('should not set learningObjective when htmlData has no learningObjective', () => {
      component.learningObjective = 'old'
      component.htmlData = { artifactUrl: 'https://example.com' } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(component.learningObjective).toBe('old')
    })

    it('should sanitize description when htmlData has description', () => {
      mockPipeLimitTo.transform.mockReturnValue('<p>Short desc</p>')
      component.htmlData = {
        artifactUrl: 'https://example.com',
        description: '<p>A very long description here</p>',
      } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(mockPipeLimitTo.transform).toHaveBeenCalledWith('<p>A very long description here</p>', 450)
      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<p>Short desc</p>')
      expect(component.description).toBe('safe:<p>Short desc</p>')
    })

    it('should not set description when htmlData has no description', () => {
      component.description = 'old-desc'
      component.htmlData = { artifactUrl: 'https://example.com' } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(component.description).toBe('old-desc')
    })

    it('should not call bypassSecurityTrustHtml when htmlData is null', () => {
      component.htmlData = null
      const changes = { htmlData: new SimpleChange(null, null, true) }
      component.ngOnChanges(changes)
      expect(mockDomSanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
    })

    it('should ignore changes for non-htmlData properties', () => {
      component.htmlData = null
      const changes = { someOtherProp: new SimpleChange(null, 'val', true) }
      component.ngOnChanges(changes)
      expect(component.isScormContent).toBe(false)
      expect(mockDomSanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
    })

    it('should handle both learningObjective and description together', () => {
      mockPipeLimitTo.transform.mockReturnValue('truncated')
      component.htmlData = {
        artifactUrl: 'https://scorm.example.com/content',
        learningObjective: '<p>Objective</p>',
        description: '<p>Description</p>',
      } as any
      const changes = { htmlData: new SimpleChange(null, component.htmlData, true) }
      component.ngOnChanges(changes)
      expect(component.isScormContent).toBe(true)
      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(2)
    })
  })

  // ─── Default property values ────────────────────────────────────────────────

  describe('default property values', () => {
    it('should have isNotEmbed default true', () => {
      expect(component.isNotEmbed).toBe(true)
    })

    it('should have isFetchingDataComplete default false', () => {
      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('should have htmlData default null', () => {
      expect(component.htmlData).toBeNull()
    })

    it('should have discussionForumWidget default null', () => {
      expect(component.discussionForumWidget).toBeNull()
    })

    it('should have isPreviewMode default false', () => {
      expect(component.isPreviewMode).toBe(false)
    })

    it('should have forPreview default false', () => {
      expect(component.forPreview).toBe(false)
    })

    it('should have isTypeOfCollection default false', () => {
      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should have isScormContent default false', () => {
      expect(component.isScormContent).toBe(false)
    })

    it('should have isRestricted default false', () => {
      expect(component.isRestricted).toBe(false)
    })
  })
})
