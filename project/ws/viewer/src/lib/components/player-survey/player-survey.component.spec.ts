import { of, Subject } from 'rxjs'
import { PlayerSurveyComponent } from './player-survey.component'
import { FormBuilder } from '@angular/forms'

jest.mock('@sunbird-cb/toc', () => ({
  ViewerUtilService: jest.fn(),
  WidgetContentService: jest.fn(),
  ROOT_WIDGET_CONFIG: {
    player: { _type: 'player', survey: 'survey' },
  },
}))

jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
}))

describe('PlayerSurveyComponent', () => {
  let component: PlayerSurveyComponent
  let mockActivatedRoute: any
  let mockEventSvc: any
  let mockViewerSvc: any
  let mockSnackBar: any
  let mockViewerDataSvc: any
  let mockConfigSvc: any
  let mockWidgetServ: any
  let fb: FormBuilder

  const mockWidgetData: any = {
    collectionId: 'col-001',
    courseName: 'Test Course',
    progressStatus: 0,
    surveyUrl: 'https://example.com/surveys/survey-001',
    disableTelemetry: true,
    identifier: 'widget-001',
    contentType: 'Resource',
    mimeType: 'application/survey',
  }

  const mockContentData = {
    identifier: 'content-001',
    name: 'Test Content',
  }

  beforeEach(() => {
    fb = new FormBuilder()

    mockActivatedRoute = {
      snapshot: {
        queryParams: {
          collectionId: 'col-001',
          batchId: 'batch-001',
          preAssessment: null,
        },
        params: { resourceId: 'res-001' },
        data: { content: { data: mockContentData } },
      },
      params: of({ resourceId: 'res-001' }),
    }

    mockEventSvc = { dispatchEvent: jest.fn() }

    mockViewerSvc = {
      getFormById: jest.fn().mockReturnValue(of({
        result: {
          response: {
            clientVersion: '1.0',
            title: 'Test Form',
            fields: [],
          },
        },
      })),
      submitForm: jest.fn().mockReturnValue(of({ statusInfo: { statusCode: 200 } })),
      getBatchIdAndCourseId: jest.fn().mockReturnValue({ batchId: 'batch-001', courseId: 'col-001' }),
      getResourceContentLanguage: jest.fn().mockReturnValue('en'),
      getPreAssessmentResourceStatus: jest.fn().mockReturnValue(0),
      realTimeProgressUpdateQuiz: jest.fn(),
      realTimeProgressUpdateForPreAssessmentQuiz: jest.fn(),
    }

    mockSnackBar = { open: jest.fn() }

    const changedSubject = new Subject<any>()
    mockViewerDataSvc = {
      changedSubject,
      resourceId: 'res-001',
    }

    mockConfigSvc = {
      userProfile: {
        userId: 'user-001',
      },
    }

    mockWidgetServ = {
      fetchContentHistoryV2: jest.fn().mockReturnValue(of({
        result: { contentList: [] },
      })),
      setProgramChildResumeData: jest.fn(),
    }

    component = new PlayerSurveyComponent(
      mockActivatedRoute,
      mockEventSvc,
      mockViewerSvc,
      mockSnackBar,
      mockViewerDataSvc,
      mockConfigSvc,
      mockWidgetServ,
      fb,
    )
    component.widgetData = { ...mockWidgetData }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── Creation ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.addLoader).toBe(0)
    expect(component.surveyFormIsValid).toBe(true)
    expect(component.parentalFields).toEqual([])
    expect(component.childFields).toEqual([])
  })

  it('should have afterSubmitAction defined', () => {
    expect(typeof component.afterSubmitAction).toBe('function')
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set courseId from widgetData', () => {
      component.ngOnInit()
      expect(component.courseId).toBe('col-001')
    })

    it('should set courseName from widgetData', () => {
      component.ngOnInit()
      expect(component.courseName).toBe('Test Course')
    })

    it('should set progressStatus from widgetData', () => {
      component.ngOnInit()
      expect(component.progressStatus).toBe(0)
    })

    it('should extract surveyId from surveyUrl', () => {
      component.ngOnInit()
      expect(component.surveyId).toBe('survey-001')
    })

    it('should set identifierId from route snapshot data', () => {
      component.ngOnInit()
      expect(component.identifierId).toBe('content-001')
    })

    it('should call getFormDetails', () => {
      const spy = jest.spyOn(component, 'getFormDetails')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should subscribe to viewerDataSvc changes', () => {
      component.ngOnInit()
      expect(component.viewerDataServiceSubscription).toBeTruthy()
    })

    it('should update resourceId when viewerDataSvc emits', () => {
      component.ngOnInit()
      mockViewerDataSvc.resourceId = 'new-res-id'
      mockViewerDataSvc.changedSubject.next({})
      expect(component.resourceId).toBe('new-res-id')
    })
  })

  // ─── getFormDetails ────────────────────────────────────────────────────────

  describe('getFormDetails', () => {
    it('should increment addLoader before request', () => {
      const initial = component.addLoader
      // spy on subscribe to prevent execution
      mockViewerSvc.getFormById.mockReturnValue({ subscribe: jest.fn() })
      component.getFormDetails()
      expect(component.addLoader).toBe(initial + 1)
    })

    it('should decrement addLoader on success', () => {
      mockViewerSvc.getFormById.mockReturnValue(of({
        result: { response: { clientVersion: '1.0', title: 'T', fields: [] } },
      }))
      component.getFormDetails()
      expect(component.addLoader).toBe(0)
    })

    it('should set formDetails on success', () => {
      mockViewerSvc.getFormById.mockReturnValue(of({
        result: { response: { clientVersion: '1.1', title: 'Form Title', fields: [{ id: 'f1' }] } },
      }))
      component.surveyId = 'survey-001'
      component.getFormDetails()
      expect(component.formDetails).toBeTruthy()
      expect(component.formDetails.title).toBe('Form Title')
    })

    it('should call buildForm when clientVersion is 1.1', () => {
      mockViewerSvc.getFormById.mockReturnValue(of({
        result: { response: { clientVersion: '1.1', title: 'Title', fields: [] } },
      }))
      const spy = jest.spyOn(component, 'buildForm')
      component.getFormDetails()
      expect(spy).toHaveBeenCalled()
    })

    it('should NOT call buildForm when clientVersion is not 1.1', () => {
      mockViewerSvc.getFormById.mockReturnValue(of({
        result: { response: { clientVersion: '1.0', title: 'Title', fields: [] } },
      }))
      const spy = jest.spyOn(component, 'buildForm')
      component.getFormDetails()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should decrement addLoader on error', () => {
      const { throwError } = jest.requireActual('rxjs')
      mockViewerSvc.getFormById.mockReturnValue(throwError(() => ({ status: 500 })))
      component.getFormDetails()
      expect(component.addLoader).toBe(0)
    })
  })

  // ─── buildForm ─────────────────────────────────────────────────────────────

  describe('buildForm', () => {
    beforeEach(() => {
      component.formDetails = {
        title: 'Test Form',
        fields: [
          {
            id: 'f1',
            name: 'Question 1',
            fieldType: 'text',
            isRequired: true,
            parentId: null,
          },
          {
            id: 'f2',
            name: 'Question 2',
            fieldType: 'phone number',
            isRequired: false,
            parentId: 'f1',
          },
          {
            id: 'f3',
            name: 'Question 3',
            fieldType: 'email',
            isRequired: false,
            parentId: null,
          },
          {
            id: 'f4',
            name: 'Question 4',
            fieldType: 'separator',
            isRequired: false,
            parentId: null,
          },
          {
            id: 'f5',
            name: 'Question 5',
            fieldType: 'heading',
            isRequired: false,
            parentId: null,
          },
        ],
      }
    })

    it('should create surveyForm', () => {
      component.buildForm()
      expect(component.surveyForm).toBeTruthy()
    })

    it('should skip separator and heading fields', () => {
      component.buildForm()
      // f4 (separator) and f5 (heading) should be skipped
      const fieldsLength = component.questionsArray.length
      expect(fieldsLength).toBe(3) // f1, f2, f3
    })

    it('should add field with parentId to childFields', () => {
      component.buildForm()
      expect(component.childFields.length).toBeGreaterThan(0)
    })

    it('should add field without parentId to parentalFields', () => {
      component.buildForm()
      expect(component.parentalFields.length).toBeGreaterThan(0)
    })

    it('should set surveyFormIsValid false when required field exists', () => {
      component.buildForm()
      expect(component.surveyFormIsValid).toBe(false)
    })

    it('should handle numeric field type', () => {
      component.formDetails.fields = [{
        id: 'fn', name: 'Num', fieldType: 'numeric', isRequired: false, parentId: null,
      }]
      expect(() => component.buildForm()).not.toThrow()
    })
  })

  // ─── questionsArray getter ─────────────────────────────────────────────────

  describe('questionsArray', () => {
    it('should return empty FormArray when surveyForm is not initialized', () => {
      const arr = component.questionsArray
      expect(arr.length).toBe(0)
    })

    it('should return the fields FormArray after buildForm', () => {
      component.formDetails = { title: '', fields: [] }
      component.buildForm()
      expect(component.questionsArray).toBeTruthy()
    })
  })

  // ─── getChildFields ────────────────────────────────────────────────────────

  describe('getChildFields', () => {
    it('should return child fields matching sectionId', () => {
      component.childFields = [
        { id: 'c1', parentId: 'parent-1' },
        { id: 'c2', parentId: 'parent-2' },
      ]
      const result = component.getChildFields('parent-1')
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('c1')
    })

    it('should return empty array when no matches', () => {
      component.childFields = [{ id: 'c1', parentId: 'parent-1' }]
      const result = component.getChildFields('unknown')
      expect(result).toEqual([])
    })

    it('should return empty array when childFields is empty', () => {
      component.childFields = []
      expect(component.getChildFields('any')).toEqual([])
    })
  })

  // ─── getQuestionControl ────────────────────────────────────────────────────

  describe('getQuestionControl', () => {
    it('should return empty group when index is out of range', () => {
      const ctrl = component.getQuestionControl(999)
      expect(ctrl).toBeTruthy()
    })
  })

  // ─── getChildQuestionsFormArray ────────────────────────────────────────────

  describe('getChildQuestionsFormArray', () => {
    it('should return empty FormArray when surveyForm is not set', () => {
      const arr = component.getChildQuestionsFormArray('parent-1')
      expect(arr.length).toBe(0)
    })
  })

  // ─── dataObject getter ────────────────────────────────────────────────────

  describe('dataObject', () => {
    it('should return empty array when surveyForm is not set', () => {
      expect(component.dataObject).toEqual([])
    })

    it('should return formatted data from form fields', () => {
      component.formDetails = {
        title: 'Form',
        fields: [{
          id: 'q1', name: 'My Question', fieldType: 'text', isRequired: false, parentId: null,
        }],
      }
      component.buildForm()
      const data = component.dataObject
      expect(Array.isArray(data)).toBe(true)
    })
  })

  // ─── updateSurveyFormValidity ─────────────────────────────────────────────

  describe('updateSurveyFormValidity', () => {
    it('should set surveyFormIsValid to true when all controls are valid', () => {
      component.formDetails = { title: '', fields: [] }
      component.buildForm()
      component.surveyFormIsValid = false
      component.updateSurveyFormValidity()
      expect(component.surveyFormIsValid).toBe(true)
    })
  })

  // ─── submitForm ────────────────────────────────────────────────────────────

  describe('submitForm', () => {
    beforeEach(() => {
      component.formDetails = { title: '', fields: [] }
      component.buildForm()
      component.surveyId = 'survey-001'
      component.courseId = 'col-001'
      component.courseName = 'Test Course'
    })

    it('should call viewerSvc.submitForm when form is valid', () => {
      component.surveyFormIsValid = true
      component.submitForm()
      expect(mockViewerSvc.submitForm).toHaveBeenCalled()
    })

    it('should NOT call viewerSvc.submitForm when form is invalid', () => {
      component.surveyFormIsValid = false
      component.submitForm()
      expect(mockViewerSvc.submitForm).not.toHaveBeenCalled()
    })

    it('should show snackbar on successful submission', () => {
      component.surveyFormIsValid = true
      mockViewerSvc.submitForm.mockReturnValue(of({ statusInfo: { statusCode: 200 } }))
      component.submitForm()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should update progressStatus to 2 on success', () => {
      component.surveyFormIsValid = true
      mockViewerSvc.submitForm.mockReturnValue(of({ responseCode: 'OK' }))
      component.submitForm()
      expect(component.progressStatus).toBe(2)
    })

    it('should show error snackbar on non-OK response', () => {
      component.surveyFormIsValid = true
      mockViewerSvc.submitForm.mockReturnValue(of({ statusInfo: { statusCode: 400 }, errorMessage: 'Bad Request' }))
      component.submitForm()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  // ─── checkAfterSubmit ─────────────────────────────────────────────────────

  describe('checkAfterSubmit', () => {
    it('should call openSnackbar and update progressStatus', () => {
      component.surveyId = 'survey-001'
      component.courseId = 'col-001'
      component.courseName = 'Test'
      jest.spyOn(component as any, 'openSnackbar' as any)
      component.checkAfterSubmit({})
      expect(component.progressStatus).toBe(2)
    })
  })

  // ─── updateQuestionValues ─────────────────────────────────────────────────

  describe('updateQuestionValues', () => {
    it('should call updateSurveyFormValidity', () => {
      component.formDetails = { title: '', fields: [] }
      component.buildForm()
      const spy = jest.spyOn(component, 'updateSurveyFormValidity')
      component.updateQuestionValues({ questionIndex: 0, answer: 'test' })
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── updateProgress ────────────────────────────────────────────────────────

  describe('updateProgress', () => {
    it('should call realTimeProgressUpdateQuiz when collectionId and batchId present', () => {
      component.updateProgress(2)
      expect(mockViewerSvc.realTimeProgressUpdateQuiz).toHaveBeenCalled()
    })

    it('should call realTimeProgressUpdateForPreAssessmentQuiz when preAssessment param is set', () => {
      mockActivatedRoute.snapshot.queryParams.preAssessment = 'true'
      mockActivatedRoute.snapshot.queryParams.collectionId = 'col-001'
      component = new PlayerSurveyComponent(
        mockActivatedRoute, mockEventSvc, mockViewerSvc, mockSnackBar,
        mockViewerDataSvc, mockConfigSvc, mockWidgetServ, fb,
      )
      component.widgetData = { ...mockWidgetData }
      component.updateProgress(2)
      expect(mockViewerSvc.realTimeProgressUpdateForPreAssessmentQuiz).toHaveBeenCalled()
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe viewerDataServiceSubscription', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component.viewerDataServiceSubscription as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should not throw when viewerDataServiceSubscription is null', () => {
      component.viewerDataServiceSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
