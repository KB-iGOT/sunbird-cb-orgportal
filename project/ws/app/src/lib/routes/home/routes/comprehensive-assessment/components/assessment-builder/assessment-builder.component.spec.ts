import { SimpleChange, SimpleChanges } from '@angular/core'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { QUESTIONSET_PRIMARY_CATEGORY } from '../../models/comprehensive-assessment.model'
import { AssessmentBuilderComponent } from './assessment-builder.component'

describe('AssessmentBuilderComponent', () => {
  let component: AssessmentBuilderComponent
  let loaderService: any

  const change = (key: string): SimpleChanges => ({
    [key]: new SimpleChange('', 'new', false),
  })

  beforeEach(() => {
    loaderService = { changeLoaderState: jest.fn() }
    component = new AssessmentBuilderComponent(loaderService as LoaderService)
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  describe('the config handed to sb-uic-assessment-main', () => {
    it('should be built up front so the child never renders without one', () => {
      expect(component.config).toEqual({
        identifier: '',
        primaryCategory: QUESTIONSET_PRIMARY_CATEGORY,
        contextCategory: '',
        isReadOnly: false,
      })
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
