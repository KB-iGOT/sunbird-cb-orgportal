import { ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { TestBed } from '@angular/core/testing'
import { FormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { StepperSelectionEvent } from '@angular/cdk/stepper'
import { Subject, of, throwError } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import {
  aparPlan,
  comprehensiveAssessment,
  comprehensiveAssessmentList,
} from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { CreateAssessmentComponent } from './create-assessment.component'

describe('CreateAssessmentComponent', () => {
  let component: CreateAssessmentComponent
  let assessmentSvc: any
  let activatedRoute: any
  let router: any
  let matSnackBar: any
  let loaderService: any
  let cdr: any
  let dialog: any
  let locationService: any
  let queryParams: Subject<any>
  let afterClosed: Subject<any>

  const userProfile = { rootOrgId: 'org-1', userId: 'user-1' }

  const linkedPlan: aparPlan.ILinkedPlan = {
    id: 'plan-1',
    name: 'APAR 2026-27 — Section Officer & Under Secretary',
    planYear: '2026-27',
    endDate: '2027-03-31T00:00:00.000Z',
    orgName: 'Department of Personnel & Training',
    gatingCourseCount: 2,
  }

  const content = (overrides: any = {}) => ({
    identifier: 'do_123',
    name: 'APAR comprehensive assessment',
    description: `<p>${'d'.repeat(comprehensiveAssessment.DESCRIPTION_MIN_LENGTH)}</p>`,
    purpose: '<p>the outcome</p>',
    appIcon: 'icon.png',
    duration: '2400',
    versionKey: 'v1',
    ...overrides,
  })

  /** The three stepper steps, as `MatStepper.steps.toArray()` hands them over. */
  const steps = [{ label: 'Basic Details' }, { label: 'Assessment' }, { label: 'Preview' }]
  const withStepper = () => {
    component.stepper = { steps: { toArray: () => steps, length: steps.length }, selectedIndex: 0 } as any
  }

  const selection = (from: number, to: number) =>
    ({ previouslySelectedIndex: from, selectedIndex: to } as StepperSelectionEvent)

  /** Fills in everything step 1 refuses to move on without. */
  const fillBasicDetails = () => {
    component.assessmentDetailsForm.patchValue({
      linkedPlan,
      assessmentName: 'APAR comprehensive assessment',
      description: `<p>${'d'.repeat(comprehensiveAssessment.DESCRIPTION_MIN_LENGTH)}</p>`,
      learningOutcome: '<p>the outcome</p>',
      appIcon: 'icon.png',
    })
  }

  /**
   * The component pulls `Location` with `inject()` in a field initializer, so it can only
   * be built inside an injection context.
   */
  const build = (routeData: any = {}, params: any = { mode: 'edit', preview: 'true', editMode: 'true' }) => {
    queryParams = new Subject<any>()
    activatedRoute = {
      queryParams: queryParams.asObservable(),
      snapshot: { data: { configService: { userProfile }, ...routeData } },
    }
    const instance = TestBed.runInInjectionContext(() => new CreateAssessmentComponent(
      assessmentSvc as ComprehensiveAssessmentService,
      activatedRoute as ActivatedRoute,
      new FormBuilder(),
      router as Router,
      matSnackBar as MatSnackBar,
      loaderService as LoaderService,
      cdr as ChangeDetectorRef,
      dialog as MatDialog
    ))
    instance.ngOnInit()
    queryParams.next(params)
    return instance
  }

  beforeEach(() => {
    locationService = { back: jest.fn() }
    TestBed.configureTestingModule({
      providers: [{ provide: Location, useValue: locationService }],
    })
    afterClosed = new Subject<any>()
    assessmentSvc = {
      readPlanMetadata: jest.fn().mockReturnValue(linkedPlan),
      buildPlanMetadata: jest.fn().mockReturnValue({ aparPlanId: 'plan-1' }),
      getLinkedAssessmentId: jest.fn().mockReturnValue(''),
      updateContent: jest.fn().mockReturnValue(of({ result: { versionKey: 'v2' } })),
      getContentHierarchy: jest.fn().mockReturnValue(of({ result: { content: content() } })),
      getQuestionSetHierarchy: jest.fn().mockReturnValue(of({ expectedDuration: 2400 })),
      linkAssessmentToCollection: jest.fn().mockReturnValue(of({})),
      publishAssessment: jest.fn().mockReturnValue(of({})),
      isWindowOpen: jest.fn().mockReturnValue(true),
    }
    router = { url: '/app/home/comprehensive-assessment/edit/do_123', navigate: jest.fn() }
    matSnackBar = { open: jest.fn() }
    loaderService = { changeLoaderState: jest.fn() }
    cdr = { detectChanges: jest.fn() }
    dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => afterClosed.asObservable() }) }
    component = build()
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  describe('the form', () => {
    it('should open on the first step with nothing filled in', () => {
      expect(component.currentStepperIndex).toBe(0)
      expect(component.selectedStepperLable).toBe('Basic Details')
      expect(component.assessmentDetailsForm.valid).toBe(false)
    })

    it('should require the plan, the name and the description', () => {
      const form = component.assessmentDetailsForm

      expect(form.get('linkedPlan')?.hasError('required')).toBe(true)
      expect(form.get('assessmentName')?.hasError('required')).toBe(true)
      expect(form.get('description')?.hasError('required')).toBe(true)
    })

    /** The thumbnail is optional, step 1 moves on without one. */
    it('should not demand a thumbnail', () => {
      expect(component.assessmentDetailsForm.get('appIcon')?.valid).toBe(true)
    })

    /** The learning outcome is capped but never demanded at a minimum length. */
    it('should accept a short learning outcome and refuse an overlong one', () => {
      const control = component.assessmentDetailsForm.get('learningOutcome')

      control?.setValue('<p>ab</p>')
      expect(control?.valid).toBe(true)

      control?.setValue(`<p>${'a'.repeat(comprehensiveAssessment.LEARNING_OUTCOME_MAX_LENGTH + 1)}</p>`)
      expect(control?.hasError('maxlength')).toBe(true)
    })

    it('should refuse a description that only holds editor markup', () => {
      component.assessmentDetailsForm.get('description')?.setValue('<p>&nbsp;</p>')

      expect(component.assessmentDetailsForm.get('description')?.hasError('required')).toBe(true)
    })

    it('should be valid once every field is filled in', () => {
      fillBasicDetails()

      expect(component.assessmentDetailsForm.valid).toBe(true)
    })

    /** Any edit invalidates the copy the preview step renders. */
    it('should stale the preview the moment anything is edited', () => {
      component.previewReady = true

      component.assessmentDetailsForm.patchValue({ assessmentName: 'Renamed' })

      expect(component.previewReady).toBe(false)
    })
  })

  describe('reading the route', () => {
    it('should take the open mode and the tab off the query params', () => {
      component = build({}, { mode: 'view', pathUrl: 'draft', preview: 'true', editMode: 'true' })

      expect(component.openMode).toBe('view')
      expect(component.pathUrl).toBe('draft')
    })

    it('should lock the whole form while the assessment is opened to view', () => {
      component = build({}, { mode: 'view', preview: 'true', editMode: 'true' })

      expect(component.assessmentDetailsForm.disabled).toBe(true)
    })

    it('should default to edit on the live tab when the params say nothing', () => {
      component = build({}, { preview: 'true', editMode: 'true' })

      expect(component.openMode).toBe('edit')
      expect(component.pathUrl).toBe('live')
    })

    /**
     * @sunbird-cb/toc picks its hierarchy endpoint by sniffing the url, so both markers
     * are put back on whenever they are missing.
     */
    it('should put the preview markers back on a url that lost them', () => {
      component = build({}, { mode: 'edit' })

      expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: { preview: 'true', editMode: 'true' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }))
    })

    it('should leave a url that already carries the markers alone', () => {
      expect(router.navigate).not.toHaveBeenCalled()
    })
  })

  describe('the resolved assessment', () => {
    it('should patch the authored fields off the hierarchy', () => {
      component = build({ assessmentDetails: { data: content() } })

      expect(component.contentId).toBe('do_123')
      expect(component.assessmentDetailsForm.get('assessmentName')?.value)
        .toBe('APAR comprehensive assessment')
      expect(component.assessmentDetailsForm.get('learningOutcome')?.value).toBe('<p>the outcome</p>')
      expect(component.assessmentDetailsForm.get('appIcon')?.value).toBe('icon.png')
      expect(component.assessmentDetailsForm.get('linkedPlan')?.value).toEqual(linkedPlan)
    })

    it('should read the duration the content already carries', () => {
      component = build({ assessmentDetails: { data: content() } })

      expect(component.duration).toBe(2400)
    })

    it('should treat an unreadable duration as none', () => {
      component = build({ assessmentDetails: { data: content({ duration: 'soon' }) } })

      expect(component.duration).toBe(0)
    })

    it('should pull the duration off a question set that is already linked', () => {
      assessmentSvc.getLinkedAssessmentId.mockReturnValue('do_456')
      assessmentSvc.getQuestionSetHierarchy.mockReturnValue(of({ expectedDuration: 6000 }))

      component = build({ assessmentDetails: { data: content() } })

      expect(component.linkedAssessmentId).toBe('do_456')
      expect(component.duration).toBe(6000)
    })

    it('should not ask for a question set while none is linked', () => {
      component = build({ assessmentDetails: { data: content() } })

      expect(assessmentSvc.getQuestionSetHierarchy).not.toHaveBeenCalled()
    })

    it('should say so when the assessment could not be resolved', () => {
      component = build({ assessmentDetails: { data: null, error: 'not found' } })

      expect(matSnackBar.open).toHaveBeenCalledWith('Unable to load the assessment, please try again')
      expect(component.contentId).toBe('')
    })
  })

  describe('moving between the steps', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
      withStepper()
    })

    it('should refuse to leave step 1 while the plan is not linked', () => {
      jest.useFakeTimers()
      component.assessmentDetailsForm.patchValue({ linkedPlan: null })

      component.onSelectionChange(selection(0, 1))
      jest.runAllTimers()

      expect(component.currentStepperIndex).toBe(0)
      expect(component.stepper?.selectedIndex).toBe(0)
      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Link an APAR plan, the reporting year and access criteria are read from it'
      )
      jest.useRealTimers()
    })

    it('should refuse to leave step 1 while a mandatory field is empty', () => {
      jest.useFakeTimers()
      component.assessmentDetailsForm.patchValue({ linkedPlan, assessmentName: '' })

      component.onSelectionChange(selection(0, 1))
      jest.runAllTimers()

      expect(component.currentStepperIndex).toBe(0)
      expect(matSnackBar.open).toHaveBeenCalledWith('Please fill mandatory fields')
      jest.useRealTimers()
    })

    it('should refuse to leave step 2 until an assessment is created', () => {
      fillBasicDetails()
      component.selectedStepperLable = 'Assessment'

      component.onSelectionChange(selection(1, 2))

      expect(matSnackBar.open).toHaveBeenCalledWith('Please create the assessment before moving ahead')
      expect(component.currentStepperIndex).toBe(1)
    })

    it('should move on once every step behind it is filled in', () => {
      fillBasicDetails()
      component.linkedAssessmentId = 'do_456'

      component.onSelectionChange(selection(0, 1))

      expect(component.currentStepperIndex).toBe(1)
      expect(component.selectedStepperLable).toBe('Assessment')
    })

    it('should always let the user step back', () => {
      component.assessmentDetailsForm.patchValue({ linkedPlan: null })

      component.onSelectionChange(selection(2, 0))

      expect(component.currentStepperIndex).toBe(0)
    })

    /** A read only assessment is walked through, nothing on it can be filled in. */
    it('should let a view only assessment be stepped through freely', () => {
      component = build({ assessmentDetails: { data: content() } }, { mode: 'view', preview: 'true', editMode: 'true' })
      withStepper()

      component.onSelectionChange(selection(0, 2))

      expect(component.currentStepperIndex).toBe(2)
    })

    it('should touch the form on the way out of step 1 so its errors show', () => {
      fillBasicDetails()
      component.linkedAssessmentId = 'do_456'

      component.onSelectionChange(selection(0, 1))

      expect(component.assessmentDetailsForm.touched).toBe(true)
    })

    it('should save the draft on the way into the preview step', () => {
      fillBasicDetails()
      component.linkedAssessmentId = 'do_456'

      component.onSelectionChange(selection(1, 2))

      expect(assessmentSvc.updateContent).toHaveBeenCalled()
      expect(component.previewReady).toBe(true)
    })

    it('should not save again for a preview that is already current', () => {
      fillBasicDetails()
      component.linkedAssessmentId = 'do_456'
      component.previewReady = true

      component.onSelectionChange(selection(1, 2))

      expect(assessmentSvc.updateContent).not.toHaveBeenCalled()
    })
  })

  describe('moveToNextForm', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
      withStepper()
      fillBasicDetails()
    })

    it('should stay put while the current step is not valid', () => {
      component.assessmentDetailsForm.patchValue({ assessmentName: '' })

      component.moveToNextForm()

      expect(component.currentStepperIndex).toBe(0)
      expect(assessmentSvc.updateContent).not.toHaveBeenCalled()
    })

    it('should save the step and move on', () => {
      component.moveToNextForm()

      expect(assessmentSvc.updateContent).toHaveBeenCalledWith('do_123', expect.any(Object))
      expect(component.currentStepperIndex).toBe(1)
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should read the hierarchy back so the next step renders what was saved', () => {
      component.moveToNextForm()

      expect(assessmentSvc.getContentHierarchy).toHaveBeenCalledWith('do_123')
      expect(component.previewContent).toEqual(content())
      expect(component.previewReady).toBe(true)
    })

    it('should stay on the step and say why the save failed', () => {
      assessmentSvc.updateContent.mockReturnValue(
        throwError(() => ({ error: { message: 'versionKey is stale' } }))
      )

      component.moveToNextForm()

      expect(matSnackBar.open).toHaveBeenCalledWith('versionKey is stale')
      expect(component.currentStepperIndex).toBe(0)
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.updateContent.mockReturnValue(throwError(() => ({})))

      component.moveToNextForm()

      expect(matSnackBar.open).toHaveBeenCalledWith('Something went wrong while saving, please try again')
    })

    it('should just move on when there is no assessment to save yet', () => {
      component.contentId = ''

      component.moveToNextForm()

      expect(assessmentSvc.updateContent).not.toHaveBeenCalled()
      expect(component.currentStepperIndex).toBe(1)
    })

    it('should not step past the last step', () => {
      component.currentStepperIndex = 2
      component.contentId = ''

      component.moveToNextForm()

      expect(component.currentStepperIndex).toBe(2)
    })

    it('should step back on request', () => {
      component.currentStepperIndex = 2

      component.moveToPreviousForm()

      expect(component.currentStepperIndex).toBe(1)
    })

    it('should refuse to leave the assessment step until a question set exists', () => {
      component.selectedStepperLable = 'Assessment'
      component.currentStepperIndex = 1

      component.moveToNextForm()

      expect(component.canMoveToNext).toBe(false)
      expect(matSnackBar.open).toHaveBeenCalledWith('Please create the assessment before moving ahead')
      expect(component.currentStepperIndex).toBe(1)
    })

    it('should leave the assessment step once a question set is linked', () => {
      component.selectedStepperLable = 'Assessment'
      component.currentStepperIndex = 1
      component.linkedAssessmentId = 'do_456'

      component.moveToNextForm()

      expect(component.currentStepperIndex).toBe(2)
    })

    /** The preview step asks nothing of the user, it is always free to move on from. */
    it('should ask nothing of the preview step', () => {
      component.selectedStepperLable = 'Preview'

      expect(component.canMoveToNext).toBe(true)
    })
  })

  describe('linking the question set', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
    })

    it('should link the question set and pull its duration once it is created', () => {
      component.onAssessmentSaved('do_456')

      expect(component.linkedAssessmentId).toBe('do_456')
      expect(assessmentSvc.linkAssessmentToCollection).toHaveBeenCalledWith(content(), 'do_456')
      expect(component.duration).toBe(2400)
    })

    it('should reload the hierarchy once the question set is attached', () => {
      assessmentSvc.getContentHierarchy.mockClear()

      component.linkAssessment('do_456')

      expect(assessmentSvc.getContentHierarchy).toHaveBeenCalledWith('do_123')
    })

    /** The question set is already saved, a failed link is not fatal for authoring. */
    it('should warn but carry on when the link fails', () => {
      assessmentSvc.linkAssessmentToCollection.mockReturnValue(
        throwError(() => ({ error: { message: 'hierarchy is locked' } }))
      )

      component.linkAssessment('do_456')

      expect(matSnackBar.open).toHaveBeenCalledWith('hierarchy is locked')
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.linkAssessmentToCollection.mockReturnValue(throwError(() => ({})))

      component.linkAssessment('do_456')

      expect(matSnackBar.open).toHaveBeenCalledWith('Unable to attach the assessment to this collection')
    })

    it('should not link without an assessment or a loaded collection', () => {
      component.linkAssessment('')
      component.contentDetails = null
      component.linkAssessment('do_456')

      expect(assessmentSvc.linkAssessmentToCollection).not.toHaveBeenCalled()
    })

    it('should keep the loaded hierarchy when the reload fails', () => {
      assessmentSvc.getContentHierarchy.mockReturnValue(throwError(() => ({})))

      component.reloadContentHierarchy()

      expect(component.contentDetails).toEqual(content())
    })

    it('should not reload a hierarchy that was never loaded', () => {
      component.contentId = ''
      assessmentSvc.getContentHierarchy.mockClear()

      component.reloadContentHierarchy()

      expect(assessmentSvc.getContentHierarchy).not.toHaveBeenCalled()
    })
  })

  describe('refreshDuration', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
      component.linkedAssessmentId = 'do_456'
    })

    it('should mirror the duration the question set was configured with', () => {
      assessmentSvc.getQuestionSetHierarchy.mockReturnValue(of({ expectedDuration: 6000 }))

      component.refreshDuration()

      expect(component.duration).toBe(6000)
    })

    it('should treat a question set with no duration as none', () => {
      assessmentSvc.getQuestionSetHierarchy.mockReturnValue(of({}))

      component.refreshDuration()

      expect(component.duration).toBe(0)
    })

    it('should keep the stored duration when the question set cannot be read', () => {
      component.duration = 2400
      assessmentSvc.getQuestionSetHierarchy.mockReturnValue(throwError(() => ({})))

      component.refreshDuration()

      expect(component.duration).toBe(2400)
    })

    it('should do nothing while no question set is linked', () => {
      component.linkedAssessmentId = ''
      assessmentSvc.getQuestionSetHierarchy.mockClear()

      component.refreshDuration()

      expect(assessmentSvc.getQuestionSetHierarchy).not.toHaveBeenCalled()
    })
  })

  describe('getContentUpdateBody', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
      fillBasicDetails()
    })

    it('should send the authored fields under the keys the content api expects', () => {
      component.assessmentDetailsForm.patchValue({ assessmentName: '  APAR comprehensive assessment  ' })
      component.duration = 2400

      const body = component.getContentUpdateBody()

      expect(body).toEqual(expect.objectContaining({
        versionKey: 'v1',
        name: 'APAR comprehensive assessment',
        purpose: '<p>the outcome</p>',
        appIcon: 'icon.png',
        posterImage: 'icon.png',
        aparPlanId: 'plan-1',
      }))
    })

    /** The content schema types duration as a String, a number fails validation. */
    it('should send the duration as a string', () => {
      component.duration = 2400

      expect(component.getContentUpdateBody().duration).toBe('2400')
    })

    it('should send a zero duration rather than leaving it out', () => {
      component.duration = 0

      expect(component.getContentUpdateBody().duration).toBe('0')
    })

    it('should read the plan through the service so the keys stay in one place', () => {
      component.getContentUpdateBody()

      expect(assessmentSvc.buildPlanMetadata).toHaveBeenCalledWith(linkedPlan)
    })

    it('should send the fields of a view only assessment too', () => {
      component.assessmentDetailsForm.disable()

      expect(component.getContentUpdateBody().name).toBe('APAR comprehensive assessment')
    })
  })

  describe('syncVersionKey', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
    })

    /** Every update returns a new versionKey, a stale one fails the next save. */
    it('should carry the new version key onto the loaded content', () => {
      component.syncVersionKey({ result: { versionKey: 'v2' } })

      expect(component.contentDetails.versionKey).toBe('v2')
    })

    it('should keep the current key when the answer carries none', () => {
      component.syncVersionKey({ result: {} })

      expect(component.contentDetails.versionKey).toBe('v1')
    })

    it('should be safe before any content is loaded', () => {
      component.contentDetails = null

      expect(() => component.syncVersionKey({ result: { versionKey: 'v2' } })).not.toThrow()
    })
  })

  describe('saveBeforePreview', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
      fillBasicDetails()
    })

    it('should save the draft and read it back for the preview', () => {
      component.saveBeforePreview()

      expect(assessmentSvc.updateContent).toHaveBeenCalled()
      expect(component.previewContent).toEqual(content())
      expect(component.previewReady).toBe(true)
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should say why the preview could not be refreshed', () => {
      assessmentSvc.updateContent.mockReturnValue(throwError(() => ({})))

      component.saveBeforePreview()

      expect(matSnackBar.open).toHaveBeenCalledWith('Unable to refresh the preview, please try again')
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should do nothing for an assessment that was never created', () => {
      component.contentId = ''

      component.saveBeforePreview()

      expect(assessmentSvc.updateContent).not.toHaveBeenCalled()
    })
  })

  describe('saveAndExit', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component = build({ assessmentDetails: { data: content() } })
      fillBasicDetails()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should save and return to the tab the assessment was opened from', () => {
      component.saveAndExit()
      jest.runAllTimers()

      expect(assessmentSvc.updateContent).toHaveBeenCalledWith('do_123', expect.any(Object))
      expect(matSnackBar.open).toHaveBeenCalledWith('Assessment details saved successfully')
      expect(router.navigate).toHaveBeenCalledWith(['/app/home/comprehensive-assessment', 'live'])
    })

    it('should carry the new version key back onto the content', () => {
      component.saveAndExit()

      expect(component.contentDetails.versionKey).toBe('v2')
    })

    it('should refuse to save an incomplete step 1', () => {
      component.assessmentDetailsForm.patchValue({ linkedPlan: null })

      component.saveAndExit()

      expect(assessmentSvc.updateContent).not.toHaveBeenCalled()
    })

    it('should stay on the builder and say why the save failed', () => {
      assessmentSvc.updateContent.mockReturnValue(
        throwError(() => ({ error: { message: 'versionKey is stale' } }))
      )

      component.saveAndExit()
      jest.runAllTimers()

      expect(matSnackBar.open).toHaveBeenCalledWith('versionKey is stale')
      expect(router.navigate).not.toHaveBeenCalled()
    })
  })

  describe('preview', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
      withStepper()
      fillBasicDetails()
      component.linkedAssessmentId = 'do_456'
    })

    it('should jump to the preview step', () => {
      component.preview()

      expect(component.currentStepperIndex).toBe(2)
    })

    it('should refuse while step 1 is incomplete', () => {
      component.assessmentDetailsForm.patchValue({ linkedPlan: null })

      component.preview()

      expect(component.currentStepperIndex).toBe(0)
    })

    it('should refuse while no assessment has been created', () => {
      component.linkedAssessmentId = ''

      component.preview()

      expect(component.currentStepperIndex).toBe(0)
      expect(matSnackBar.open).toHaveBeenCalledWith('Please create the assessment before moving ahead')
    })

    it('should stay put when the stepper has no preview step', () => {
      component.stepper = { steps: { toArray: () => [{ label: 'Basic Details' }], length: 1 } } as any

      component.preview()

      expect(component.currentStepperIndex).toBe(0)
    })
  })

  describe('publishing from the preview step', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
      fillBasicDetails()
      component.linkedAssessmentId = 'do_456'
    })

    it('should offer the publish only on a complete assessment being edited', () => {
      expect(component.canPublish).toBe(true)
    })

    it('should not offer the publish before an assessment exists', () => {
      component.contentId = ''
      expect(component.canPublish).toBe(false)

      component.contentId = 'do_123'
      component.linkedAssessmentId = ''
      expect(component.canPublish).toBe(false)
    })

    it('should not offer the publish on a view only assessment', () => {
      component = build({ assessmentDetails: { data: content() } }, { mode: 'view', preview: 'true', editMode: 'true' })
      component.linkedAssessmentId = 'do_456'

      expect(component.canPublish).toBe(false)
    })

    it('should ask before publishing', () => {
      component.publishAssessment()

      expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        data: expect.objectContaining({
          message: 'Are you sure you want to publish this assessment?',
        }),
      }))
      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })

    /** The draft is saved first, so what goes Live is what the preview just showed. */
    it('should save the draft and publish once the user confirms', () => {
      component.publishAssessment()

      afterClosed.next(true)

      expect(assessmentSvc.updateContent).toHaveBeenCalled()
      expect(assessmentSvc.publishAssessment).toHaveBeenCalledWith('do_123', 'user-1')
    })

    it('should leave the draft alone when the user backs out', () => {
      component.publishAssessment()

      afterClosed.next(false)

      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })

    it('should return to the Live tab once the assessment is published', () => {
      component.publishAssessment()

      afterClosed.next(true)

      expect(matSnackBar.open).toHaveBeenCalledWith('Assessment published successfully')
      expect(router.navigate).toHaveBeenCalledWith(['/app/home/comprehensive-assessment', 'live'])
    })

    /**
     * The window belongs to the linked plan and only the plan can correct it, so it is
     * checked here rather than sending a publish that can only be rejected.
     */
    it('should refuse to publish once the assessment window has ended', () => {
      assessmentSvc.isWindowOpen.mockReturnValue(false)

      component.publishAssessment()

      expect(dialog.open).not.toHaveBeenCalled()
      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
      expect(matSnackBar.open).toHaveBeenCalledWith(comprehensiveAssessmentList.WINDOW_CLOSED_MESSAGE)
    })

    it('should check the window of the plan the assessment is linked to', () => {
      component.publishAssessment()

      expect(assessmentSvc.isWindowOpen).toHaveBeenCalledWith(linkedPlan.endDate)
    })

    it('should refuse to publish an assessment with no plan linked', () => {
      component.assessmentDetailsForm.patchValue({ linkedPlan: null })

      component.publishAssessment()

      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })

    it('should refuse to publish before a question set is created', () => {
      component.linkedAssessmentId = ''

      component.publishAssessment()

      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
      expect(matSnackBar.open).toHaveBeenCalledWith('Please create the assessment before moving ahead')
    })

    it('should stay on the builder and say why the publish failed', () => {
      assessmentSvc.publishAssessment.mockReturnValue(
        throwError(() => ({ error: { message: 'question bank is short of 8 questions' } }))
      )

      component.publishAssessment()
      afterClosed.next(true)

      expect(matSnackBar.open).toHaveBeenCalledWith('question bank is short of 8 questions')
      expect(router.navigate).not.toHaveBeenCalled()
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.publishAssessment.mockReturnValue(throwError(() => ({})))

      component.publishAssessment()
      afterClosed.next(true)

      expect(matSnackBar.open).toHaveBeenCalledWith('Unable to publish the assessment, please try again')
    })
  })

  describe('leaving the builder', () => {
    beforeEach(() => {
      component = build({ assessmentDetails: { data: content() } })
    })

    it('should warn about unsaved work before leaving an editable assessment', () => {
      component.openConfirmationPopup()

      expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        data: expect.objectContaining({ message: 'Are you sure you want to exit without saving?' }),
        disableClose: true,
      }))
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('should leave once the user confirms', () => {
      component.openConfirmationPopup()

      afterClosed.next(true)

      expect(router.navigate).toHaveBeenCalledWith(['/app/home/comprehensive-assessment', 'live'])
    })

    it('should stay when the user backs out', () => {
      component.openConfirmationPopup()

      afterClosed.next(false)

      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('should leave a view only assessment without asking', () => {
      component = build({ assessmentDetails: { data: content() } }, { mode: 'view', preview: 'true', editMode: 'true' })

      component.openConfirmationPopup()

      expect(dialog.open).not.toHaveBeenCalled()
      expect(router.navigate).toHaveBeenCalledWith(['/app/home/comprehensive-assessment', 'live'])
    })

    it('should return to the tab it was opened from', () => {
      component = build(
        { assessmentDetails: { data: content() } },
        { mode: 'edit', pathUrl: 'draft', preview: 'true', editMode: 'true' }
      )

      component.navigateBack()

      expect(router.navigate).toHaveBeenCalledWith(['/app/home/comprehensive-assessment', 'draft'])
    })

    /** The builder is also reachable from outside the flow, there Back is a plain step back. */
    it('should step back in history when it was not opened from the flow', () => {
      router.url = '/app/home/some-other-place'

      component.navigateBack()

      expect(locationService.back).toHaveBeenCalled()
      expect(router.navigate).not.toHaveBeenCalled()
    })
  })
})
