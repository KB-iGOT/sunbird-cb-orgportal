import { PdfComponent } from './pdf.component'
import { Subject } from 'rxjs'

describe('PdfComponent', () => {
  let component: PdfComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any
  let mockPdfScormDataService: any
  let handlePdfMarkComplete: Subject<any>

  beforeEach(() => {
    handlePdfMarkComplete = new Subject<any>()

    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
      },
    }

    mockConfigSvc = {
      restrictedFeatures: new Set<string>(),
    }

    mockPdfScormDataService = {
      handlePdfMarkComplete,
      handleBackFromPdfScormFullScreen: {
        next: jest.fn(),
      },
    }

    component = new PdfComponent(mockActivatedRoute, mockConfigSvc, mockPdfScormDataService)
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation & defaults ──────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isFetchingDataComplete to false', () => {
    expect(component.isFetchingDataComplete).toBe(false)
  })

  it('should default pdfData to null', () => {
    expect(component.pdfData).toBeNull()
  })

  it('should default forPreview to false', () => {
    expect(component.forPreview).toBe(false)
  })

  it('should default isPreviewMode to false', () => {
    expect(component.isPreviewMode).toBe(false)
  })

  it('should default playPdfContentFlag to true', () => {
    expect(component.playPdfContentFlag).toBe(true)
  })

  it('should default isRestricted to false', () => {
    expect(component.isRestricted).toBe(false)
  })

  it('should default isTypeOfCollection to false', () => {
    expect(component.isTypeOfCollection).toBe(false)
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set isRestricted=true when restrictedFeatures does NOT have disscussionForum', () => {
      mockConfigSvc.restrictedFeatures = new Set(['someFeature'])
      component.ngOnInit()
      expect(component.isRestricted).toBe(true)
    })

    it('should set isRestricted=false when restrictedFeatures HAS disscussionForum', () => {
      mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should not set isRestricted when restrictedFeatures is null', () => {
      mockConfigSvc.restrictedFeatures = null
      component.isRestricted = false
      component.ngOnInit()
      expect(component.isRestricted).toBe(false)
    })

    it('should set isTypeOfCollection=true when collectionType queryParam exists', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course' }
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(true)
    })

    it('should set isTypeOfCollection=false when collectionType queryParam is absent', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(false)
    })

    it('should subscribe to handlePdfMarkComplete and store contentData', () => {
      component.ngOnInit()
      const contentData = { status: 1, id: 'c1' }
      handlePdfMarkComplete.next(contentData)
      expect(component.pdfContentProgressData).toEqual(contentData)
    })

    it('should set playPdfContentFlag=true when status is 2', () => {
      component.playPdfContentFlag = false
      component.ngOnInit()
      handlePdfMarkComplete.next({ status: 2 })
      expect(component.playPdfContentFlag).toBe(true)
    })

    it('should not change playPdfContentFlag when status is not 2', () => {
      component.playPdfContentFlag = false
      component.ngOnInit()
      handlePdfMarkComplete.next({ status: 1 })
      expect(component.playPdfContentFlag).toBe(false)
    })

    it('should not crash when contentData is null', () => {
      component.ngOnInit()
      expect(() => handlePdfMarkComplete.next(null)).not.toThrow()
    })
  })

  // ─── openPdf ──────────────────────────────────────────────────────────────────

  describe('openPdf', () => {
    it('should set playPdfContentFlag to true', () => {
      component.playPdfContentFlag = false
      component.openPdf()
      expect(component.playPdfContentFlag).toBe(true)
    })

    it('should call handleBackFromPdfScormFullScreen.next(true)', () => {
      component.openPdf()
      expect(mockPdfScormDataService.handleBackFromPdfScormFullScreen.next)
        .toHaveBeenCalledWith(true)
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call handleBackFromPdfScormFullScreen.next(false)', () => {
      component.ngOnDestroy()
      expect(mockPdfScormDataService.handleBackFromPdfScormFullScreen.next)
        .toHaveBeenCalledWith(false)
    })
  })
})
