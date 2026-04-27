import { of } from 'rxjs'
import { OverviewComponent } from './overview.component'
import { NsContent } from '@sunbird-cb/utils-v2'
import { FinalAssessmentPopupComponent } from '../final-assessment-popup/final-assessment-popup.component'
import { ViewerHeaderSideBarToggleService } from './../../../../viewer-header-side-bar-toggle.service'

describe('OverviewComponent', () => {
  let component: OverviewComponent
  let mockDialog: any
  let mockRoute: any
  let mockSnackbar: any
  let mockViewerToggleSvc: any
  let mockLangTranslations: any

  function createComponent() {
    component = new OverviewComponent(
      mockDialog,
      mockRoute,
      mockSnackbar,
      mockViewerToggleSvc,
      mockLangTranslations
    )
  }

  beforeEach(() => {
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(null)),
        componentInstance: {},
      }),
    }

    mockRoute = {
      data: of({
        pageData: { data: { isretakeAllowed: true } },
        content: { data: { identifier: 'content-001' } },
      }),
    }

    mockSnackbar = { open: jest.fn() }

    mockViewerToggleSvc = { visibilityStatus: { next: jest.fn() } }

    mockLangTranslations = {
      translateLabel: jest.fn().mockReturnValue('translated'),
    }

    createComponent()
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise defaults', () => {
    expect(component.loading).toBe(false)
    expect(component.consentGiven).toBe(false)
    expect(component.maxAttempPopup).toBe(false)
    expect(component.currentPage).toBe(0)
    expect(component.points.length).toBe(3)
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should subscribe to route data', () => {
      component.ngOnInit()
      expect(component.dataSubscription).toBeDefined()
    })

    it('should set isretakeAllowed from pageData', () => {
      component.ngOnInit()
      expect(component.isretakeAllowed).toBe(true)
    })

    it('should handle route data without pageData', () => {
      mockRoute.data = of({})
      createComponent()
      component.ngOnInit()
      expect(component.isretakeAllowed).toBe(false)
    })

    it('should handle route data with pageData but no isretakeAllowed', () => {
      mockRoute.data = of({ pageData: { data: {} } })
      createComponent()
      component.ngOnInit()
      expect(component.isretakeAllowed).toBeUndefined()
    })
  })

  // ─── ngOnChanges ───────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should not show popup when forPreview is true', () => {
      component.forPreview = true
      component.canAttempt = { attemptsMade: 5, attemptsAllowed: 3 } as any
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.selectedAssessmentCompatibilityLevel = 7
      const spy = jest.spyOn(component, 'showAssessmentPopup')
      component.ngOnChanges()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not show popup when attempts not exceeded', () => {
      component.forPreview = false
      component.canAttempt = { attemptsMade: 2, attemptsAllowed: 5 } as any
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.selectedAssessmentCompatibilityLevel = 7
      const spy = jest.spyOn(component, 'showAssessmentPopup')
      component.ngOnChanges()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not show popup when primaryCategory is not FINAL_ASSESSMENT', () => {
      component.forPreview = false
      component.canAttempt = { attemptsMade: 5, attemptsAllowed: 3 } as any
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      component.selectedAssessmentCompatibilityLevel = 7
      const spy = jest.spyOn(component, 'showAssessmentPopup')
      component.ngOnChanges()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should call showAssessmentPopup when all conditions met and compatibilityLevel > 6', () => {
      component.forPreview = false
      component.canAttempt = { attemptsMade: 5, attemptsAllowed: 3 } as any
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.selectedAssessmentCompatibilityLevel = 7
      component.maxAttempPopup = false
      const spy = jest.spyOn(component, 'showAssessmentPopup')
      component.ngOnChanges()
      expect(spy).toHaveBeenCalled()
    })

    it('should not call showAssessmentPopup when maxAttempPopup is already true', () => {
      component.forPreview = false
      component.canAttempt = { attemptsMade: 5, attemptsAllowed: 3 } as any
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.selectedAssessmentCompatibilityLevel = 7
      component.maxAttempPopup = true
      const spy = jest.spyOn(component, 'showAssessmentPopup')
      component.ngOnChanges()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not call showAssessmentPopup when compatibilityLevel <= 6', () => {
      component.forPreview = false
      component.canAttempt = { attemptsMade: 5, attemptsAllowed: 3 } as any
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.selectedAssessmentCompatibilityLevel = 6
      component.maxAttempPopup = false
      const spy = jest.spyOn(component, 'showAssessmentPopup')
      component.ngOnChanges()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not throw when canAttempt is undefined', () => {
      component.forPreview = false
      component.canAttempt = undefined as any
      expect(() => component.ngOnChanges()).not.toThrow()
    })
  })

  // ─── showAssessmentPopup ───────────────────────────────────────────────────

  describe('showAssessmentPopup', () => {
    it('should set maxAttempPopup to true', () => {
      component.showAssessmentPopup()
      expect(component.maxAttempPopup).toBe(true)
    })

    it('should open FinalAssessmentPopupComponent dialog', () => {
      component.showAssessmentPopup()
      expect(mockDialog.open).toHaveBeenCalledWith(
        FinalAssessmentPopupComponent,
        expect.objectContaining({ width: '626px' })
      )
    })

    it('should set maxAttempPopup to false when dialog closes with "yes"', () => {
      mockDialog.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of('yes')) })
      component.showAssessmentPopup()
      expect(component.maxAttempPopup).toBe(false)
    })

    it('should handle dialog close with null result', () => {
      mockDialog.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(null)) })
      expect(() => component.showAssessmentPopup()).not.toThrow()
    })

    it('should handle dialog close with unknown result string', () => {
      mockDialog.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of('no')) })
      component.showAssessmentPopup()
      // maxAttempPopup remains true (only 'yes' resets it)
      expect(component.maxAttempPopup).toBe(true)
    })
  })

  // ─── overviewed ────────────────────────────────────────────────────────────

  describe('overviewed', () => {
    it('should set loading=true and emit event in normal mode', () => {
      component.forPreview = false
      const spy = jest.spyOn(component.userSelection, 'emit')
      component.overviewed('start' as any)
      expect(component.loading).toBe(true)
      expect(spy).toHaveBeenCalledWith('start')
    })

    it('should emit event when forCreatorMode (forPreview=false)', () => {
      component.forPreview = false
      const spy = jest.spyOn(component.userSelection, 'emit')
      component.overviewed('start' as any)
      expect(spy).toHaveBeenCalledWith('start')
    })

    it('should show snackbar when forPreview=true, FINAL_ASSESSMENT and quiz not public', () => {
      component.forPreview = true
      component.forCreatorMode = false
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.quizData = { isPublic: false }
      component.overviewed('start' as any)
      expect(mockSnackbar.open).toHaveBeenCalledWith('The content is not available to access.')
    })

    it('should emit event when forPreview=true, FINAL_ASSESSMENT and quiz is public', () => {
      component.forPreview = true
      component.forCreatorMode = false
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.quizData = { isPublic: true }
      const spy = jest.spyOn(component.userSelection, 'emit')
      component.overviewed('start' as any)
      expect(component.loading).toBe(true)
      expect(spy).toHaveBeenCalledWith('start')
    })

    it('should emit event when forPreview=true but primaryCategory is not FINAL_ASSESSMENT', () => {
      component.forPreview = true
      component.forCreatorMode = false
      component.primaryCategory = NsContent.EPrimaryCategory.PRACTICE_RESOURCE
      const spy = jest.spyOn(component.userSelection, 'emit')
      component.overviewed('start' as any)
      expect(spy).toHaveBeenCalledWith('start')
    })

    it('should emit event when forPreview=true and forCreatorMode=true', () => {
      component.forPreview = true
      component.forCreatorMode = true
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      const spy = jest.spyOn(component.userSelection, 'emit')
      component.overviewed('start' as any)
      expect(spy).toHaveBeenCalledWith('start')
    })

    it('should show snackbar when quizData is undefined and FINAL_ASSESSMENT preview', () => {
      component.forPreview = true
      component.forCreatorMode = false
      component.primaryCategory = NsContent.EPrimaryCategory.FINAL_ASSESSMENT
      component.quizData = undefined
      component.overviewed('start' as any)
      expect(mockSnackbar.open).toHaveBeenCalledWith('The content is not available to access.')
    })
  })

  // ─── translateLabels ───────────────────────────────────────────────────────

  describe('translateLabels', () => {
    it('should call langtranslations.translateLabel and return result', () => {
      const result = component.translateLabels('some_label', 'type')
      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('some_label', 'type', '')
      expect(result).toBe('translated')
    })
  })

  // ─── startTestEnable ───────────────────────────────────────────────────────

  describe('startTestEnable', () => {
    it('should toggle consentGiven from false to true', () => {
      component.consentGiven = false
      component.startTestEnable({})
      expect(component.consentGiven).toBe(true)
    })

    it('should toggle consentGiven from true to false', () => {
      component.consentGiven = true
      component.startTestEnable({})
      expect(component.consentGiven).toBe(false)
    })
  })

  // ─── nextPage / previousPage ───────────────────────────────────────────────

  describe('nextPage', () => {
    it('should increment currentPage when within range', () => {
      component.instructionAssessment = ['p1', 'p2', 'p3']
      component.currentPage = 0
      component.nextPage()
      expect(component.currentPage).toBe(1)
    })

    it('should not exceed last index', () => {
      component.instructionAssessment = ['p1', 'p2']
      component.currentPage = 1
      component.nextPage()
      expect(component.currentPage).toBe(1)
    })

    it('should not throw when instructionAssessment is undefined', () => {
      component.instructionAssessment = undefined
      expect(() => component.nextPage()).not.toThrow()
    })
  })

  describe('previousPage', () => {
    it('should decrement currentPage when > 0', () => {
      component.currentPage = 2
      component.previousPage()
      expect(component.currentPage).toBe(1)
    })

    it('should not go below 0', () => {
      component.currentPage = 0
      component.previousPage()
      expect(component.currentPage).toBe(0)
    })
  })

  // ─── ngOnDestroy ───────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe dataSubscription when it exists', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component.dataSubscription, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should not throw when dataSubscription is undefined', () => {
      component.dataSubscription = undefined
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // ─── ViewerHeaderSideBarToggleService direct test ─────────────────────────

  describe('ViewerHeaderSideBarToggleService', () => {
    it('should create service with visibilityStatus Subject', () => {
      const svc = new ViewerHeaderSideBarToggleService()
      expect(svc.visibilityStatus).toBeDefined()
    })

    it('should emit values on visibilityStatus', (done) => {
      const svc = new ViewerHeaderSideBarToggleService()
      svc.visibilityStatus.subscribe(val => {
        expect(val).toBe(true)
        done()
      })
      svc.visibilityStatus.next(true)
    })
  })
})
