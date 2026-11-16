import { SimpleChange, SimpleChanges } from '@angular/core'
import { of } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import {
  QUESTIONSET_CONTEXT_CATEGORY,
  QUESTIONSET_PRIMARY_CATEGORY,
} from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { AssessmentBuilderComponent } from './assessment-builder.component'

describe('AssessmentBuilderComponent', () => {
  let component: AssessmentBuilderComponent
  let loaderService: any
  let assessmentSvc: any

  const change = (key: string): SimpleChanges => ({
    [key]: new SimpleChange('', 'new', false),
  })

  beforeEach(() => {
    loaderService = { changeLoaderState: jest.fn() }
    assessmentSvc = { getRefContent: jest.fn().mockReturnValue(of([])) }
    component = new AssessmentBuilderComponent(
      loaderService as LoaderService,
      assessmentSvc as ComprehensiveAssessmentService
    )
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  describe('the config handed to sb-uic-assessment-main', () => {
    it('should be built up front so the child never renders without one', () => {
      expect(component.config).toEqual({
        identifier: '',
        primaryCategory: QUESTIONSET_PRIMARY_CATEGORY,
        contextCategory: QUESTIONSET_CONTEXT_CATEGORY,
        name: '',
        isReadOnly: false,
        aiQuestionsGen: { enable: true, refContent: [] },
      })
    })

    /**
     * A Live comprehensive assessment is a `Course Assessment` like any other, so this is
     * what the consumption side has to tell it apart by - it used to go out empty.
     */
    it('should name the comprehensive assessment as the context the question set is in', () => {
      expect(component.buildConfig().contextCategory).toBe('Comprehensive Assessment')
    })

    it('should carry the assessment the builder was opened on', () => {
      component.assessmentId = 'do_123'

      expect(component.buildConfig().identifier).toBe('do_123')
    })

    it('should be read only only while the assessment is opened to view', () => {
      component.openMode = 'view'
      expect(component.buildConfig().isReadOnly).toBe(true)

      component.openMode = 'edit'
      expect(component.buildConfig().isReadOnly).toBe(false)
    })
  })

  describe('the reference content of AI question generation', () => {
    const named = [
      { identifier: 'do_course_1', name: 'Course one', courseCategory: 'Course' },
      { identifier: 'do_course_2', name: 'Course two', courseCategory: 'Program' },
    ]

    it('should ask the search for the identifiers of the linked plan courses', () => {
      component.contentList = [
        { identifier: 'do_course_1', mandatory: true },
        { identifier: '', mandatory: true },
        { identifier: 'do_course_2', mandatory: false },
      ]

      component.ngOnChanges(change('contentList'))

      expect(assessmentSvc.getRefContent).toHaveBeenCalledWith(['do_course_1', 'do_course_2'])
    })

    it('should ask for no course while no plan is linked', () => {
      component.contentList = null

      component.ngOnChanges(change('contentList'))

      expect(assessmentSvc.getRefContent).toHaveBeenCalledWith([])
    })

    it('should hand the named courses to AI question generation', () => {
      assessmentSvc.getRefContent.mockReturnValue(of(named))
      component.contentList = [{ identifier: 'do_course_1', mandatory: true }]

      component.ngOnChanges(change('contentList'))

      expect(component.config.aiQuestionsGen).toEqual({ enable: true, refContent: named })
    })

    /** The library writes the question set categories back onto the config it was handed. */
    it('should keep the config already handed down, only swapping what AI generation reads', () => {
      const existing = component.config
      existing.primaryCategory = 'Written back by the library'
      assessmentSvc.getRefContent.mockReturnValue(of(named))

      component.ngOnChanges(change('contentList'))

      expect(component.config).toBe(existing)
      expect(component.config.primaryCategory).toBe('Written back by the library')
      expect(component.config.aiQuestionsGen.refContent).toEqual(named)
    })

    it('should keep the named courses when the config is rebuilt', () => {
      assessmentSvc.getRefContent.mockReturnValue(of(named))
      component.ngOnChanges(change('contentList'))
      component.assessmentId = 'do_123'

      component.ngOnChanges(change('assessmentId'))

      expect(component.config.aiQuestionsGen.refContent).toEqual(named)
    })

    it('should drop a search still running when the plan courses change again', () => {
      const unsubscribe = jest.fn()
      assessmentSvc.getRefContent.mockReturnValueOnce({ subscribe: () => ({ unsubscribe }) })
      component.ngOnChanges(change('contentList'))

      component.ngOnChanges(change('contentList'))

      expect(unsubscribe).toHaveBeenCalled()
    })

    it('should drop a search still running when the builder is left', () => {
      const unsubscribe = jest.fn()
      assessmentSvc.getRefContent.mockReturnValueOnce({ subscribe: () => ({ unsubscribe }) })
      component.ngOnChanges(change('contentList'))

      component.ngOnDestroy()

      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('ngOnChanges', () => {
    it('should rebuild the config when the assessment changes', () => {
      component.assessmentId = 'do_123'

      component.ngOnChanges(change('assessmentId'))

      expect(component.config.identifier).toBe('do_123')
    })

    it('should rebuild the config when the open mode changes', () => {
      component.openMode = 'view'

      component.ngOnChanges(change('openMode'))

      expect(component.config.isReadOnly).toBe(true)
    })

    it('should leave the config alone for any other input', () => {
      const existing = component.config
      component.assessmentId = 'do_123'

      component.ngOnChanges(change('somethingElse'))

      expect(component.config).toBe(existing)
    })
  })

  describe('what the settings step is told', () => {
    it('should not pass the assessment name on to the settings step', () => {
      component.assessmentName = 'APAR comprehensive assessment'

      expect(component.buildConfig().name).toBe('')
    })

    it('should rebuild the config when the name changes', () => {
      const existing = component.config
      component.assessmentName = 'Renamed'

      component.ngOnChanges(change('assessmentName'))

      expect(component.config).not.toBe(existing)
    })
  })

  describe('onAssessmentSaved', () => {
    it('should pass the new question set identifier up to the builder', () => {
      const emitted = jest.spyOn(component.assessmentSaved, 'emit')

      component.onAssessmentSaved('do_456')

      expect(emitted).toHaveBeenCalledWith('do_456')
    })

    it('should stay quiet when the child saves without an identifier', () => {
      const emitted = jest.spyOn(component.assessmentSaved, 'emit')

      component.onAssessmentSaved('')

      expect(emitted).not.toHaveBeenCalled()
    })
  })

  describe('onLoader', () => {
    it('should pass the loader state of the child on to the app loader', () => {
      component.onLoader(true)
      expect(loaderService.changeLoaderState).toHaveBeenCalledWith(true)

      component.onLoader(false)
      expect(loaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })
  })
})
