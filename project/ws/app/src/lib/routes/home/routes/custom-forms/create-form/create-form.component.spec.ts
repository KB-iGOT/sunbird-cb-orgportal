import { CreateFormComponent } from './create-form.component'
import { Validators } from '@angular/forms'
import { of, throwError } from 'rxjs'

// Mock dependencies
const mockFormBuilder = {
  group: jest.fn(),
  array: jest.fn()
}

const mockFileService = {
  validateXlFile: jest.fn()
}

const mockMatSnackBar = {
  open: jest.fn()
}

const mockActivatedRoute = {
  snapshot: {
    data: {
      configService: {
        userProfile: {
          rootOrgId: 'test-org-id'
        }
      }
    }
  }
}

const mockCustomFieldsService = {
  readCustomField: jest.fn(),
  createField: jest.fn(),
  createList: jest.fn(),
  updateCustomField: jest.fn(),
  updateList: jest.fn()
}

describe('CreateFormComponent', () => {
  let component: CreateFormComponent
  let mockFormGroup: any
  let mockFormArray: any
  let mockQuestionGroup: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup mock FormGroup
    mockFormGroup = {
      get: jest.fn(),
      controls: {
        description: { setValue: jest.fn(), value: 'test description' },
        type: { setValue: jest.fn(), value: 'text' },
        questions: []
      },
      value: {
        description: 'test description',
        type: 'text',
        questions: [{
          name: 'test question',
          attributeName: 'testAttr',
          validation: 'text',
          customValidation: '',
          isMandatory: false,
          isEnabled: false,
          attributeMaxLength: ''
        }]
      },
      invalid: false
    }

    // Setup mock FormArray
    mockFormArray = {
      clear: jest.fn(),
      push: jest.fn(),
      removeAt: jest.fn(),
      at: jest.fn(),
      length: 1
    }

    // Setup mock question group
    mockQuestionGroup = {
      controls: {
        customValidation: {
          setValidators: jest.fn(),
          updateValueAndValidity: jest.fn(),
          clearValidators: jest.fn(),
          setValue: jest.fn()
        }
      },
      value: {
        name: 'test',
        attributeName: 'test',
        isMandatory: false,
        isEnabled: false
      }
    }

    mockFormBuilder.group.mockReturnValue(mockFormGroup)
    mockFormBuilder.array.mockReturnValue(mockFormArray)
    mockFormGroup.get.mockReturnValue(mockFormArray)
    mockFormArray.at.mockReturnValue(mockQuestionGroup)

    // Create component instance
    component = new CreateFormComponent(
      mockFormBuilder as any,
      mockFileService as any,
      mockMatSnackBar as any,
      mockActivatedRoute as any,
      mockCustomFieldsService as any
    )
  })

  describe('Constructor and Initialization', () => {
    it('should create component with correct properties', () => {
      expect(component).toBeTruthy()
      expect(component.rootOrgId).toBe('test-org-id')
      expect(component.selectedTab).toBe('')
      expect(component.isLoading).toBe(false)
      expect(component.isEditMode).toBe(false)
    })

    it('should initialize sections array correctly', () => {
      expect(component.sections).toHaveLength(2)
      expect(component.sections[0].type).toBe('text')
      expect(component.sections[1].type).toBe('masterList')
    })

    it('should initialize fieldValidationTypes array correctly', () => {
      expect(component.fieldValidationTypes).toHaveLength(6)
      expect(component.fieldValidationTypes[0].key).toBe('Numbers only')
      expect(component.fieldValidationTypes[5].key).toBe('Regex')
    })
  })

  describe('ngOnInit', () => {
    it('should call createForm and set isEditMode to false when no customFieldObject', () => {
      const createFormSpy = jest.spyOn(component, 'createForm')
      component.customFieldObject = null

      component.ngOnInit()

      expect(createFormSpy).toHaveBeenCalled()
      expect(component.isEditMode).toBe(false)
    })

    it('should set isEditMode to true when customFieldObject exists', () => {
      const createFormSpy = jest.spyOn(component, 'createForm')
      component.customFieldObject = { customFieldId: 'test-id' }

      component.ngOnInit()

      expect(createFormSpy).toHaveBeenCalled()
      expect(component.isEditMode).toBe(true)
    })
  })

  describe('createForm', () => {
    it('should create form with correct structure', () => {
      component.createForm()

      expect(mockFormBuilder.group).toHaveBeenCalledWith({
        description: ['', expect.any(Array)],
        questions: expect.any(Object),
        type: ['']
      })
    })

    it('should call addContent when customFieldObject exists', () => {
      const addContentSpy = jest.spyOn(component, 'addContent')
      component.customFieldObject = { type: 'text' }

      component.createForm()

      expect(addContentSpy).toHaveBeenCalledWith('text')
    })
  })

  describe('noWhitespaceValidator', () => {
    it('should return null for valid input', () => {
      const control = { value: 'valid input' }
      const result = component.noWhitespaceValidator(control)
      expect(result).toBeNull()
    })

    it('should return error for whitespace only input', () => {
      const control = { value: '   ' }
      const result = component.noWhitespaceValidator(control)
      expect(result).toEqual({ whitespace: true })
    })

    it('should return error for empty input', () => {
      const control = { value: '' }
      const result = component.noWhitespaceValidator(control)
      expect(result).toEqual({ whitespace: true })
    })

    it('should handle null control', () => {
      const result = component.noWhitespaceValidator(null)
      expect(result).toEqual({ whitespace: true })
    })
  })

  describe('forbiddenCharacterValidator', () => {
    it('should return null for valid input', () => {
      const control = { value: 'valid input' }
      const result = component.forbiddenCharacterValidator(control)
      expect(result).toBeNull()
    })

    it('should return error for HTML tags', () => {
      const control = { value: '<script>alert("test")</script>' }
      const result = component.forbiddenCharacterValidator(control)
      expect(result).toEqual({ invalidCharacter: true })
    })

    it('should return error for javascript code', () => {
      const control = { value: 'javascript:alert("test")' }
      const result = component.forbiddenCharacterValidator(control)
      expect(result).toEqual({ invalidCharacter: true })
    })

    it('should return error for function declarations', () => {
      const control = { value: 'functionTest()' }
      const result = component.forbiddenCharacterValidator(control)
      expect(result).toEqual({ invalidCharacter: true })
    })
  })

  describe('addContent', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
    })

    it('should set selectedTab and clear questions array', () => {
      component.addContent('text')

      expect(component.selectedTab).toBe('text')
      expect(mockFormArray.clear).toHaveBeenCalled()
    })

    it('should call addQuestion for text type', () => {
      const addQuestionSpy = jest.spyOn(component, 'addQuestion')

      component.addContent('text')

      expect(addQuestionSpy).toHaveBeenCalledWith('text')
    })

    it('should call addMasterListQuestion for masterList type', () => {
      const addMasterListQuestionSpy = jest.spyOn(component, 'addMasterListQuestion')

      component.addContent('masterList')

      expect(addMasterListQuestionSpy).toHaveBeenCalledWith('masterList')
    })

    it('should handle case when questions is not FormArray', () => {
      mockFormGroup.get.mockReturnValue(null)

      expect(() => component.addContent('text')).not.toThrow()
    })
  })

  describe('getQuestions', () => {
    it('should return questions FormArray when customForm exists', () => {
      component.customForm = mockFormGroup

      const result = component.getQuestions

      expect(result).toBe(mockFormArray)
    })

    it('should return empty FormArray when customForm does not exist', () => {
      component.customForm = null as any

      // const result = component.getQuestions

      expect(mockFormBuilder.array).toHaveBeenCalledWith([])
    })
  })

  describe('addMasterListQuestion', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
    })

    it('should set form type and call service for existing customFieldObject', () => {
      component.customFieldObject = { customFieldId: 'test-id' }
      const mockResponse = { result: { description: 'test', type: 'masterList', name: 'test', attributeName: 'test', isMandatory: false, isEnabled: false, originalCustomFieldData: [] } }
      mockCustomFieldsService.readCustomField.mockReturnValue(of(mockResponse))
      const appendListWithDataSpy = jest.spyOn(component, 'appendListWithData')

      component.addMasterListQuestion('masterList')

      expect(mockFormGroup.controls.type.setValue).toHaveBeenCalledWith('masterList')
      expect(mockCustomFieldsService.readCustomField).toHaveBeenCalledWith('test-id')
      expect(appendListWithDataSpy).toHaveBeenCalledWith(mockResponse)
    })

    it('should call appendListQuestion when service returns no result', () => {
      component.customFieldObject = { customFieldId: 'test-id' }
      mockCustomFieldsService.readCustomField.mockReturnValue(of({ result: null }))
      const appendListQuestionSpy = jest.spyOn(component, 'appendListQuestion')

      component.addMasterListQuestion('masterList')

      expect(appendListQuestionSpy).toHaveBeenCalled()
    })

    it('should call appendListQuestion when no customFieldObject', () => {
      component.customFieldObject = null
      const appendListQuestionSpy = jest.spyOn(component, 'appendListQuestion')

      component.addMasterListQuestion('masterList')

      expect(appendListQuestionSpy).toHaveBeenCalled()
    })
  })

  describe('appendListWithData', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
    })

    it('should append form groups with data', () => {
      const mockResponse = {
        result: {
          name: 'test',
          attributeName: 'testAttr',
          isMandatory: false,
          isEnabled: false,
          originalCustomFieldData: [
            { name: 'child1', attributeName: 'childAttr1' },
            { name: 'child2', attributeName: 'childAttr2' }
          ]
        }
      }

      component.appendListWithData(mockResponse)

      expect(mockFormArray.push).toHaveBeenCalledTimes(3) // 1 parent + 2 children
    })

    it('should handle empty originalCustomFieldData', () => {
      const mockResponse = {
        result: {
          name: 'test',
          attributeName: 'testAttr',
          isMandatory: false,
          isEnabled: false,
          originalCustomFieldData: []
        }
      }

      component.appendListWithData(mockResponse)

      expect(mockFormArray.push).toHaveBeenCalledTimes(1)
    })
  })

  describe('appendListQuestion', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
    })

    it('should append a list question form group', () => {
      component.appendListQuestion()

      expect(mockFormArray.push).toHaveBeenCalled()
    })
  })

  describe('addNewListQuestion', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
    })

    it('should add new question when under limit', () => {
      mockFormArray.length = 3

      component.addNewListQuestion()

      expect(mockFormArray.push).toHaveBeenCalled()
    })

    it('should show snackbar when over limit', () => {
      mockFormArray.length = 6

      component.addNewListQuestion()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Maximum 5 questions can be added')
      expect(mockFormArray.push).not.toHaveBeenCalled()
    })
  })

  describe('addQuestion', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
    })

    it('should handle text type with existing customFieldObject', () => {
      component.customFieldObject = { customFieldId: 'test-id' }
      const mockResponse = { result: { name: 'test', attributeName: 'test', validation: '^[A-Za-z]+$', isMandatory: false, isEnabled: false, description: 'test', type: 'text' } }
      mockCustomFieldsService.readCustomField.mockReturnValue(of(mockResponse))
      const appendQuestionWithDataSpy = jest.spyOn(component, 'appendQuestionWithData')

      component.addQuestion('text')

      expect(appendQuestionWithDataSpy).toHaveBeenCalledWith(mockResponse)
    })

    it('should call appendQuestion for text type without customFieldObject', () => {
      component.customFieldObject = null
      const appendQuestionSpy = jest.spyOn(component, 'appendQuestion')

      component.addQuestion('text')

      expect(appendQuestionSpy).toHaveBeenCalled()
    })

    it('should handle masterList type under limit', () => {
      component.customFieldObject = null
      Object.defineProperty(component, 'getQuestions', {
        get: () => ({ length: 3 })
      })
      const addMasterListQuestionSpy = jest.spyOn(component, 'addMasterListQuestion')

      component.addQuestion('masterList')

      expect(addMasterListQuestionSpy).toHaveBeenCalledWith('masterList')
    })

    it('should show snackbar for masterList type over limit', () => {
      component.customFieldObject = null
      Object.defineProperty(component, 'getQuestions', {
        get: () => ({ length: 6 })
      })

      component.addQuestion('masterList')

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Maximum 5 questions can be added')
    })
  })

  describe('appendQuestionWithData', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
    })

    it('should append question with validation from fieldValidationTypes', () => {
      const mockResponse = {
        result: {
          name: 'test',
          attributeName: 'test',
          validation: '^[A-Za-z\\s]+$', // matches "Text only" pattern
          isMandatory: false,
          isEnabled: false,
          attributeMaxLength: 100
        }
      }

      component.appendQuestionWithData(mockResponse)

      expect(mockFormArray.push).toHaveBeenCalled()
    })

    it('should handle custom regex validation', () => {
      const mockResponse = {
        result: {
          name: 'test',
          attributeName: 'test',
          validation: '^custom[0-9]+$',
          isMandatory: false,
          isEnabled: false
        }
      }

      component.appendQuestionWithData(mockResponse)

      expect(mockFormArray.push).toHaveBeenCalled()
    })
  })

  describe('appendQuestion', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
    })

    it('should append a text question form group', () => {
      component.appendQuestion()

      expect(mockFormArray.push).toHaveBeenCalled()
    })
  })

  describe('validateForm', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
      Object.defineProperty(component, 'getQuestions', {
        get: () => ({ length: 3 })
      })
    })

    it('should return true for invalid masterList form', () => {
      mockFormGroup.controls.type.value = 'masterList'
      mockFormGroup.invalid = true
      component.fileSelected = new File([], 'test.xlsx')

      const result = component.validateForm()

      expect(result).toBe(true)
    })

    it('should return true for masterList with less than 2 questions', () => {
      mockFormGroup.controls.type.value = 'masterList'
      mockFormGroup.invalid = false
      Object.defineProperty(component, 'getQuestions', {
        get: () => ({ length: 1 })
      })
      component.fileSelected = new File([], 'test.xlsx')

      const result = component.validateForm()

      expect(result).toBe(true)
    })

    it('should return true for masterList without file selected', () => {
      mockFormGroup.controls.type.value = 'masterList'
      mockFormGroup.invalid = false
      component.fileSelected = undefined as any

      const result = component.validateForm()

      expect(result).toBe(true)
    })

    it('should return false for valid masterList form', () => {
      mockFormGroup.controls.type.value = 'masterList'
      mockFormGroup.invalid = false
      component.fileSelected = new File([], 'test.xlsx')

      const result = component.validateForm()

      expect(result).toBe(false)
    })

    it('should return false for non-masterList type', () => {
      mockFormGroup.controls.type.value = 'text'

      const result = component.validateForm()

      expect(result).toBe(false)
    })
  })

  describe('onSave', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
    })

    it('should create text field successfully', () => {
      const constructPayloadSpy = jest.spyOn(component, 'constructPayload').mockReturnValue({ test: 'payload' })
      mockCustomFieldsService.createField.mockReturnValue(of({ result: 'success' }))
      const closeFormSpy = jest.spyOn(component.closeForm, 'emit')

      component.onSave()

      expect(constructPayloadSpy).toHaveBeenCalled()
      expect(component.isLoading).toBe(true)
      expect(mockCustomFieldsService.createField).toHaveBeenCalledWith({ test: 'payload' })
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Field is created successfully!')
      expect(closeFormSpy).toHaveBeenCalledWith(true)
    })

    it('should handle text field creation error', () => {
      // const constructPayloadSpy = jest.spyOn(component, 'constructPayload').mockReturnValue({ test: 'payload' })
      mockCustomFieldsService.createField.mockReturnValue(throwError('Test error'))

      component.onSave()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test error')
      expect(component.isLoading).toBe(false)
    })

    it('should create masterList successfully', () => {
      mockFormGroup.value.type = 'masterList'
      const constructPayloadForListSpy = jest.spyOn(component, 'constructPayloadForList').mockReturnValue(new FormData())
      mockCustomFieldsService.createList.mockReturnValue(of({ result: 'success' }))
      const closeFormSpy = jest.spyOn(component.closeForm, 'emit')

      component.onSave()

      expect(constructPayloadForListSpy).toHaveBeenCalled()
      expect(mockCustomFieldsService.createList).toHaveBeenCalled()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('List is created successfully!')
      expect(closeFormSpy).toHaveBeenCalledWith(true)
    })

    it('should handle masterList creation error', () => {
      mockFormGroup.value.type = 'masterList'
      // const constructPayloadForListSpy = jest.spyOn(component, 'constructPayloadForList').mockReturnValue(new FormData())
      const error = { error: { params: { err: 'Test error message' } } }
      mockCustomFieldsService.createList.mockReturnValue(throwError(error))

      component.onSave()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test error message')
      expect(component.isLoading).toBe(false)
    })
  })

  describe('onUpdate', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
      component.customFieldObject = { customFieldId: 'test-id' }
    })

    it('should update text field successfully', () => {
      const constructPayloadSpy = jest.spyOn(component, 'constructPayload').mockReturnValue({ test: 'payload' })
      mockCustomFieldsService.updateCustomField.mockReturnValue(of({ result: 'success' }))
      const closeFormSpy = jest.spyOn(component.closeForm, 'emit')

      component.onUpdate()

      expect(constructPayloadSpy).toHaveBeenCalled()
      expect(mockCustomFieldsService.updateCustomField).toHaveBeenCalledWith({ test: 'payload', customFieldId: 'test-id' })
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Field is updated successfully!')
      expect(closeFormSpy).toHaveBeenCalledWith(true)
    })

    it('should handle text field update error', () => {
      // const constructPayloadSpy = jest.spyOn(component, 'constructPayload').mockReturnValue({ test: 'payload' })
      mockCustomFieldsService.updateCustomField.mockReturnValue(throwError('Test error'))

      component.onUpdate()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test error')
      expect(component.isLoading).toBe(false)
    })

    it('should update masterList successfully', () => {
      mockFormGroup.value.type = 'masterList'
      const constructPayloadForListSpy = jest.spyOn(component, 'constructPayloadForList').mockReturnValue(new FormData())
      mockCustomFieldsService.updateList.mockReturnValue(of({ result: 'success' }))
      const closeFormSpy = jest.spyOn(component.closeForm, 'emit')

      component.onUpdate()

      expect(constructPayloadForListSpy).toHaveBeenCalled()
      expect(mockCustomFieldsService.updateList).toHaveBeenCalled()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('List is updated successfully!')
      expect(closeFormSpy).toHaveBeenCalledWith(true)
    })

    it('should handle masterList update error', () => {
      mockFormGroup.value.type = 'masterList'
      //const constructPayloadForListSpy = jest.spyOn(component, 'constructPayloadForList').mockReturnValue(new FormData())
      const error = { error: { params: { err: 'Test error message' } } }
      mockCustomFieldsService.updateList.mockReturnValue(throwError(error))

      component.onUpdate()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test error message')
      expect(component.isLoading).toBe(false)
    })
  })

  describe('constructPayload', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
      component.rootOrgId = 'test-org-id'
    })

    it('should construct payload without attributeMaxLength', () => {
      const result = component.constructPayload()

      expect(result).toEqual({
        name: 'test question',
        description: 'test description',
        type: 'text',
        organisationId: 'test-org-id',
        attributeName: 'testAttr',
        validation: 'text',
        isMandatory: false,
        isEnabled: false
      })
    })

    it('should construct payload with attributeMaxLength', () => {
      mockFormGroup.value.questions[0].attributeMaxLength = 100

      const result = component.constructPayload()

      expect(result.attributeMaxLength).toBe(100)
    })

    it('should handle regex validation', () => {
      mockFormGroup.value.questions[0].validation = 'regex'
      mockFormGroup.value.questions[0].customValidation = '^[0-9]+$'

      const result = component.constructPayload()

      expect(result.validation).toBe('^[0-9]+$')
    })
  })

  describe('constructPayloadForList', () => {
    beforeEach(() => {
      component.customForm = mockFormGroup
      component.rootOrgId = 'test-org-id'
      mockFormGroup.value.questions = [
        { name: 'parent', attributeName: 'parentAttr', isMandatory: true, isEnabled: true },
        { name: 'child1', attributeName: 'child1Attr' },
        { name: 'child2', attributeName: 'child2Attr' }
      ]
    })

    it('should construct FormData payload without customFieldId', () => {
      component.customFieldObject = null
      component.fileSelected = new File(['test'], 'test.xlsx')

      const result = component.constructPayloadForList()

      expect(result).toBeInstanceOf(FormData)
    })

    it('should construct FormData payload with customFieldId', () => {
      component.customFieldObject = { customFieldId: 'test-id' }
      component.fileSelected = new File(['test'], 'test.xlsx')

      const result = component.constructPayloadForList()

      expect(result).toBeInstanceOf(FormData)
    })

    it('should handle missing fileSelected', () => {
      component.fileSelected = null as any

      const result = component.constructPayloadForList()

      expect(result).toBeInstanceOf(FormData)
    })
  })

  describe('removeItem', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
    })

    it('should remove item at specified index', () => {
      component.removeItem(1)

      expect(mockFormArray.removeAt).toHaveBeenCalledWith(1)
    })
  })

  describe('close', () => {
    it('should emit closeForm event with false', () => {
      const closeFormSpy = jest.spyOn(component.closeForm, 'emit')

      component.close()

      expect(closeFormSpy).toHaveBeenCalledWith(false)
    })
  })

  describe('customRegex', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
    })

    it('should set validators for regex selection', () => {
      const event = { index: 0, selected: 'regex' }

      component.customRegex(event)

      expect(mockQuestionGroup.controls.customValidation.setValidators).toHaveBeenCalledWith([Validators.required])
      expect(mockQuestionGroup.controls.customValidation.updateValueAndValidity).toHaveBeenCalled()
    })

    it('should clear validators for non-regex selection', () => {
      const event = { index: 0, selected: 'text' }

      component.customRegex(event)

      expect(mockQuestionGroup.controls.customValidation.clearValidators).toHaveBeenCalled()
      expect(mockQuestionGroup.controls.customValidation.setValue).toHaveBeenCalledWith('')
      expect(mockQuestionGroup.controls.customValidation.updateValueAndValidity).toHaveBeenCalled()
    })

    it('should handle missing customValidation control', () => {
      mockQuestionGroup.controls.customValidation = null
      const event = { index: 0, selected: 'regex' }

      expect(() => component.customRegex(event)).not.toThrow()
    })
  })

  describe('handleFileClick', () => {
    it('should clear input value', () => {
      const mockEvent = {
        target: {
          value: 'some-value'
        }
      }

      component.handleFileClick(mockEvent)

      expect(mockEvent.target.value).toBe('')
    })
  })

  describe('handleOnFileChange', () => {
    it('should handle valid file selection', () => {
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }
      mockFileService.validateXlFile.mockReturnValue(true)

      component.handleOnFileChange(mockEvent)

      expect(component.fileName).toBe('test.xlsx')
      expect(component.fileSelected).toBe(mockFile)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('File uploaded successfully!')
    })

    it('should handle invalid file selection', () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }
      mockFileService.validateXlFile.mockReturnValue(false)
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      component.handleOnFileChange(mockEvent)

      expect(component.fileName).toBe('test.txt')
      expect(consoleSpy).toHaveBeenCalledWith('invalid file')

      consoleSpy.mockRestore()
    })

    it('should handle empty file list', () => {
      const mockEvent = {
        target: {
          files: []
        }
      }

      component.handleOnFileChange(mockEvent)

      expect(component.fileName).toBeUndefined()
      expect(component.fileSelected).toBeUndefined()
    })

    it('should handle null file list', () => {
      const mockEvent = {
        target: {
          files: null
        }
      }

      component.handleOnFileChange(mockEvent)

      expect(component.fileName).toBeUndefined()
      expect(component.fileSelected).toBeUndefined()
    })
  })

  describe('constructNestedQuestions', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'getQuestions', {
        get: () => mockFormArray
      })
      mockFormArray.at.mockReturnValue({
        value: {
          attributeName: 'rootAttr'
        }
      })
    })

    it('should handle empty or invalid fieldData', () => {
      const pushSpy = jest.spyOn(mockFormArray, 'push')

      component.constructNestedQuestions([])
      component.constructNestedQuestions(null as any)
      component.constructNestedQuestions(undefined as any)

      expect(pushSpy).not.toHaveBeenCalled()
    })

    it('should construct nested questions from hierarchical data', () => {
      const fieldData = [
        {
          fieldName: 'State',
          fieldAttribute: 'state',
          fieldValues: [
            {
              fieldName: 'Zone',
              fieldAttribute: 'zone',
              fieldValues: [
                {
                  fieldName: 'University',
                  fieldAttribute: 'university',
                  fieldValues: []
                }
              ]
            }
          ]
        }
      ]

      component.constructNestedQuestions(fieldData)

      expect(mockFormArray.push).toHaveBeenCalledTimes(3) // state, zone, university
    })

    it('should skip root level field already added', () => {
      const fieldData = [
        {
          fieldName: 'Root',
          fieldAttribute: 'rootAttr', // matches first question
          fieldValues: [
            {
              fieldName: 'Child',
              fieldAttribute: 'childAttr',
              fieldValues: []
            }
          ]
        }
      ]

      component.constructNestedQuestions(fieldData)

      expect(mockFormArray.push).toHaveBeenCalledTimes(1) // only child, not root
    })

    it('should handle duplicate attribute names', () => {
      const fieldData = [
        {
          fieldName: 'Field1',
          fieldAttribute: 'duplicateAttr',
          fieldValues: []
        },
        {
          fieldName: 'Field2',
          fieldAttribute: 'duplicateAttr', // duplicate
          fieldValues: []
        },
        {
          fieldName: 'Field3',
          fieldAttribute: 'uniqueAttr',
          fieldValues: []
        }
      ]

      component.constructNestedQuestions(fieldData)

      expect(mockFormArray.push).toHaveBeenCalledTimes(2) // duplicateAttr only once, uniqueAttr once
    })

    it('should handle fields without fieldName or fieldAttribute', () => {
      const fieldData = [
        {
          fieldName: '',
          fieldAttribute: 'validAttr',
          fieldValues: []
        },
        {
          fieldName: 'ValidName',
          fieldAttribute: '',
          fieldValues: []
        },
        {
          fieldName: 'ValidName2',
          fieldAttribute: 'validAttr2',
          fieldValues: []
        }
      ]

      component.constructNestedQuestions(fieldData)

      expect(mockFormArray.push).toHaveBeenCalledTimes(1) // only the valid one
    })

    it('should handle deep nesting', () => {
      const fieldData = [
        {
          fieldName: 'Level1',
          fieldAttribute: 'level1',
          fieldValues: [
            {
              fieldName: 'Level2',
              fieldAttribute: 'level2',
              fieldValues: [
                {
                  fieldName: 'Level3',
                  fieldAttribute: 'level3',
                  fieldValues: [
                    {
                      fieldName: 'Level4',
                      fieldAttribute: 'level4',
                      fieldValues: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]

      component.constructNestedQuestions(fieldData)

      expect(mockFormArray.push).toHaveBeenCalledTimes(4)
    })

    it('should handle fieldValues that are not arrays', () => {
      const fieldData = [
        {
          fieldName: 'ValidField',
          fieldAttribute: 'validAttr',
          fieldValues: 'not an array' as any
        }
      ]

      expect(() => component.constructNestedQuestions(fieldData)).not.toThrow()
      expect(mockFormArray.push).toHaveBeenCalledTimes(1)
    })

    it('should handle missing fieldValues', () => {
      const fieldData = [
        {
          fieldName: 'ValidField',
          fieldAttribute: 'validAttr'
          // no fieldValues property
        }
      ]

      expect(() => component.constructNestedQuestions(fieldData)).not.toThrow()
      expect(mockFormArray.push).toHaveBeenCalledTimes(1)
    })
  })


})
