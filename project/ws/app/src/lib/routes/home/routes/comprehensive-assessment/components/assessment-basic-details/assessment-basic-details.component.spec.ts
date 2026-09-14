/**
 * `ckeditor5` ships as ESM only and its package exports carry no `require` entry, so jest
 * cannot resolve it. The component only holds the editor class and its plugin list in a
 * config object, none of it is executed here, so it is stood in for virtually.
 */
jest.mock('ckeditor5', () => {
  const stub = class { }
  return {
    ClassicEditor: stub,
    Autosave: stub,
    BlockQuote: stub,
    Bold: stub,
    Essentials: stub,
    Heading: stub,
    Indent: stub,
    IndentBlock: stub,
    Italic: stub,
    Link: stub,
    List: stub,
    Paragraph: stub,
    Underline: stub,
  }
},        { virtual: true })

import { DatePipe } from '@angular/common'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { Subject, of } from 'rxjs'
import { aparPlan, comprehensiveAssessment } from '../../models/comprehensive-assessment.model'
import { BasicInfoComponent } from '../../dialogs/basic-info/basic-info.component'
import { PlanPickerComponent } from '../../dialogs/plan-picker/plan-picker.component'
import { AssessmentBasicDetailsComponent } from './assessment-basic-details.component'

describe('AssessmentBasicDetailsComponent', () => {
  let component: AssessmentBasicDetailsComponent
  let dialog: any
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

  const form = (values: any = {}) => new FormGroup({
    linkedPlan: new FormControl(values.linkedPlan ?? null),
    assessmentName: new FormControl(values.assessmentName ?? '', [Validators.required]),
    description: new FormControl(values.description ?? ''),
    learningOutcome: new FormControl(values.learningOutcome ?? ''),
    appIcon: new FormControl(values.appIcon ?? ''),
  })

  beforeEach(() => {
    afterClosed = new Subject<any>()
    dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => afterClosed.asObservable() }) }
    component = new AssessmentBasicDetailsComponent(dialog as MatDialog, new DatePipe('en-IN'))
    component.assessmentDetails = form()
    component.userProfile = userProfile
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should carry the lengths the counters and the errors are read off', () => {
    expect(component.descriptionMinLength).toBe(comprehensiveAssessment.DESCRIPTION_MIN_LENGTH)
    expect(component.descriptionMaxLength).toBe(comprehensiveAssessment.DESCRIPTION_MAX_LENGTH)
    expect(component.learningOutcomeMaxLength).toBe(comprehensiveAssessment.LEARNING_OUTCOME_MAX_LENGTH)
  })

  describe('the editor config', () => {
    it('should be built up front and handed back unchanged', () => {
      expect(component.getConfig()).toBe(component.ckEditorConfig)
      expect(component.ckEditor).toBeDefined()
    })

    it('should offer only the formatting the flow allows', () => {
      expect(component.ckEditorConfig.toolbar).toEqual(expect.objectContaining({
        items: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'underline', '|',
          'bulletedList', 'numberedList', '|', 'link'],
        shouldNotGroupWhenFull: false,
      }))
    })

    /** Auto transformations would rewrite the text behind the length checks. */
    it('should keep the typing transformations off', () => {
      expect(component.ckEditorConfig.typing).toEqual({ transformations: { include: [] } })
    })

    it('should open external links safely on their own protocol', () => {
      expect(component.ckEditorConfig.link).toEqual({
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
      })
    })
  })

  describe('the linked plan', () => {
    it('should be nothing until a plan is picked', () => {
      expect(component.linkedPlan).toBeNull()
      expect(component.planWindowDisplay).toBe('')
    })

    it('should be read off the form once one is linked', () => {
      component.assessmentDetails = form({ linkedPlan })

      expect(component.linkedPlan).toEqual(linkedPlan)
    })

    it('should show the end of the window the plan carries', () => {
      component.assessmentDetails = form({ linkedPlan })

      expect(component.planWindowDisplay).toBe('31 Mar, 2027')
    })

    it('should show no window for a plan with no end date', () => {
      component.assessmentDetails = form({ linkedPlan: { ...linkedPlan, endDate: '' } })

      expect(component.planWindowDisplay).toBe('')
    })
  })

  describe('openPlanPicker', () => {
    it('should open the picker on the plan already linked', () => {
      component.assessmentDetails = form({ linkedPlan })

      component.openPlanPicker()

      expect(dialog.open).toHaveBeenCalledWith(PlanPickerComponent, expect.objectContaining({
        panelClass: 'apar-plan-picker-dialog',
        data: { userProfile, selectedPlanId: 'plan-1' },
      }))
    })

    it('should open the picker with nothing selected when no plan is linked', () => {
      component.openPlanPicker()

      expect(dialog.open).toHaveBeenCalledWith(PlanPickerComponent, expect.objectContaining({
        data: { userProfile, selectedPlanId: '' },
      }))
    })

    /** The plan is patched as one object, every derived value moves together with it. */
    it('should patch the whole plan the picker hands back', () => {
      component.openPlanPicker()

      afterClosed.next(linkedPlan)

      expect(component.linkedPlan).toEqual(linkedPlan)
    })

    it('should keep the linked plan when the picker is cancelled', () => {
      component.assessmentDetails = form({ linkedPlan })
      dialog.open.mockReturnValue({ afterClosed: () => of(undefined) })

      component.openPlanPicker()

      expect(component.linkedPlan).toEqual(linkedPlan)
    })
  })

  describe('openBasicInfoDialog', () => {
    beforeEach(() => {
      component.assessmentDetails = form({ assessmentName: 'APAR assessment', appIcon: 'icon.png' })
    })

    it('should reuse the create dialog in edit mode on the current values', () => {
      component.openBasicInfoDialog()

      expect(dialog.open).toHaveBeenCalledWith(BasicInfoComponent, expect.objectContaining({
        panelClass: 'create-comprehensive-assessment-dialog',
        data: {
          userProfile,
          mode: 'edit',
          assessmentName: 'APAR assessment',
          appIcon: 'icon.png',
        },
      }))
    })

    it('should patch the name and the image the dialog hands back', () => {
      component.openBasicInfoDialog()

      afterClosed.next({ assessmentName: 'Renamed assessment', appIcon: 'new-icon.png' })

      expect(component.assessmentName).toBe('Renamed assessment')
      expect(component.appIcon).toBe('new-icon.png')
    })

    it('should keep the current values when the dialog is cancelled', () => {
      component.openBasicInfoDialog()

      afterClosed.next(undefined)

      expect(component.assessmentName).toBe('APAR assessment')
      expect(component.appIcon).toBe('icon.png')
    })
  })

  describe('durationDisplay', () => {
    it('should show nothing while the question set has no duration', () => {
      expect(component.durationDisplay).toBe('')

      component.duration = 0
      expect(component.durationDisplay).toBe('')

      component.duration = -60
      expect(component.durationDisplay).toBe('')
    })

    it('should show whole minutes on their own', () => {
      component.duration = 2400

      expect(component.durationDisplay).toBe('40 min')
    })

    it('should show the hours and the minutes together', () => {
      component.duration = 6000

      expect(component.durationDisplay).toBe('1 hr 40 min')
    })

    it('should show whole hours without a minutes part', () => {
      component.duration = 7200

      expect(component.durationDisplay).toBe('2 hr')
    })

    it('should show the seconds only while the duration is under an hour', () => {
      component.duration = 90
      expect(component.durationDisplay).toBe('1 min 30 sec')

      // an hour and a half minute reads as an hour, the seconds are noise at that scale
      component.duration = 3630
      expect(component.durationDisplay).toBe('1 hr')
    })

    it('should show a duration under a minute in seconds', () => {
      component.duration = 45

      expect(component.durationDisplay).toBe('45 sec')
    })
  })

  describe('the rich text counters', () => {
    it('should count the visible text rather than the editor markup', () => {
      component.assessmentDetails = form({
        description: '<p>hello</p>',
        learningOutcome: '<p><strong>outcome</strong></p>',
      })

      expect(component.descriptionLength).toBe(5)
      expect(component.learningOutcomeLength).toBe(7)
    })

    it('should count an untouched editor as empty', () => {
      component.assessmentDetails = form({ description: '<p>&nbsp;</p>' })

      expect(component.descriptionLength).toBe(0)
    })
  })

  describe('the editor lifecycle', () => {
    const editor = (change: any = jest.fn()) => ({
      editing: { view: { change, document: { getRoot: () => 'root' } } },
      enableReadOnlyMode: jest.fn(),
    })

    it('should give the editor room to type in', () => {
      const writer = { setStyle: jest.fn() }
      const instance = editor((fn: any) => fn(writer))

      component.onEditorReady(instance)

      expect(writer.setStyle).toHaveBeenCalledWith('min-height', '150px', 'root')
    })

    it('should lock the editor while the assessment is opened to view', () => {
      const instance = editor((fn: any) => fn({ setStyle: jest.fn() }))
      component.openMode = 'view'

      component.onEditorReady(instance)

      expect(instance.enableReadOnlyMode).toHaveBeenCalledWith('comprehensive-assessment-preview')
    })

    it('should leave the editor editable in edit mode', () => {
      const instance = editor((fn: any) => fn({ setStyle: jest.fn() }))

      component.onEditorReady(instance)

      expect(instance.enableReadOnlyMode).not.toHaveBeenCalled()
    })

    it('should take the editor branding out of the page', () => {
      const branding = document.createElement('div')
      branding.className = 'ck ck-powered-by'
      document.body.appendChild(branding)

      component.onEditorFocus()

      expect(document.querySelector('.ck.ck-powered-by')).toBeNull()
    })

    it('should be safe on a page the branding never rendered on', () => {
      expect(() => component.onEditorFocus()).not.toThrow()
    })
  })

  describe('showValidationMsg', () => {
    it('should stay quiet on a field the user has not been to yet', () => {
      expect(component.showValidationMsg('assessmentName', 'required')).toBe(false)
    })

    it('should report the error once the field is touched', () => {
      component.assessmentDetails.get('assessmentName')?.markAsTouched()

      expect(component.showValidationMsg('assessmentName', 'required')).toBe(true)
    })

    it('should stay quiet for an error the field does not carry', () => {
      component.assessmentDetails.get('assessmentName')?.markAsTouched()

      expect(component.showValidationMsg('assessmentName', 'minlength')).toBe(false)
    })

    it('should stay quiet for a field that is not on the form', () => {
      expect(component.showValidationMsg('notAField', 'required')).toBe(false)
    })
  })
})
