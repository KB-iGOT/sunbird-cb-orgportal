import { CustomInputTextComponent } from './custom-input-text.component'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'

describe('CustomInputTextComponent', () => {
  let component: CustomInputTextComponent

  beforeEach(() => {
    component = new CustomInputTextComponent()
  })

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize fieldValidationTypes with correct values', () => {
      expect(component.fieldValidationTypes).toEqual([
        { key: 'Numbers only', value: "^[0-9]+$" },
        { key: 'Text only', value: "^[A-Za-z\s]+$" },
        { key: 'Alphanumeric', value: "^[A-Za-z0-9\s]+$" },
        { key: 'Email', value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" },
        { key: 'Phone number', value: "^[6-9]\\d{9}$" },
        { key: 'Regex', value: "regex" }
      ])
    })

    it('should initialize removeRow as EventEmitter', () => {
      expect(component.removeRow).toBeDefined()
      expect(component.removeRow.emit).toBeDefined()
    })

    it('should initialize customRegex as EventEmitter', () => {
      expect(component.customRegex).toBeDefined()
      expect(component.customRegex.emit).toBeDefined()
    })
  })

  describe('ngOnInit', () => {
    it('should not subscribe when question is undefined', () => {
      component.question = undefined

      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should subscribe to name field valueChanges when question is defined', () => {
      const nameControl = new UntypedFormControl('Test Name')
      const attributeNameControl = new UntypedFormControl('')

      component.question = new UntypedFormGroup({
        name: nameControl,
        attributeName: attributeNameControl
      })

      jest.spyOn(component, 'createParameterName').mockReturnValue('test_name')
      jest.spyOn(attributeNameControl, 'setValue').mockImplementation(() => { })

      component.ngOnInit()

      // Trigger value change
      nameControl.setValue('New Test Name')

      expect(component.createParameterName).toHaveBeenCalledWith('New Test Name')
      expect(attributeNameControl.setValue).toHaveBeenCalledWith('test_name')
    })

    it('should handle null value from name field', () => {
      const nameControl = new UntypedFormControl(null)
      const attributeNameControl = new UntypedFormControl('')

      component.question = new UntypedFormGroup({
        name: nameControl,
        attributeName: attributeNameControl
      })

      jest.spyOn(component, 'createParameterName').mockReturnValue('')
      jest.spyOn(attributeNameControl, 'setValue').mockImplementation(() => { })

      component.ngOnInit()

      // Trigger value change with null
      nameControl.setValue(null)

      expect(component.createParameterName).toHaveBeenCalledWith('')
      expect(attributeNameControl.setValue).toHaveBeenCalledWith('')
    })

    it('should handle case when attributeName control does not exist', () => {
      const nameControl = new UntypedFormControl('Test Name')

      component.question = new UntypedFormGroup({
        name: nameControl
        // No attributeName control
      })

      jest.spyOn(component, 'createParameterName').mockReturnValue('test_name')

      expect(() => {
        component.ngOnInit()
        nameControl.setValue('New Test Name')
      }).not.toThrow()

      expect(component.createParameterName).toHaveBeenCalledWith('New Test Name')
    })

    it('should handle case when name control does not exist', () => {
      component.question = new UntypedFormGroup({
        // No name control
        attributeName: new UntypedFormControl('')
      })

      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('removeItem', () => {
    it('should emit removeRow event with index', () => {
      const mockIndex = new UntypedFormGroup({})
      component.index = mockIndex

      jest.spyOn(component.removeRow, 'emit').mockImplementation(() => { })

      component.removeItem()

      expect(component.removeRow.emit).toHaveBeenCalledWith(mockIndex)
    })

    it('should emit removeRow event with undefined index', () => {
      component.index = undefined

      jest.spyOn(component.removeRow, 'emit').mockImplementation(() => { })

      component.removeItem()

      expect(component.removeRow.emit).toHaveBeenCalledWith(undefined)
    })
  })

  describe('createParameterName', () => {
    it('should convert to lowercase', () => {
      const result = component.createParameterName('TEST STRING')
      expect(result).toBe('test_string')
    })

    it('should remove special characters', () => {
      const result = component.createParameterName('test@#$%string!')
      expect(result).toBe('teststring')
    })

    it('should replace spaces with underscores', () => {
      const result = component.createParameterName('test string with spaces')
      expect(result).toBe('test_string_with_spaces')
    })

    it('should replace multiple spaces with single underscore', () => {
      const result = component.createParameterName('test   multiple   spaces')
      expect(result).toBe('test_multiple_spaces')
    })

    it('should remove leading underscores', () => {
      const result = component.createParameterName('   leading spaces')
      expect(result).toBe('leading_spaces')
    })

    it('should remove trailing underscores', () => {
      const result = component.createParameterName('trailing spaces   ')
      expect(result).toBe('trailing_spaces')
    })

    it('should remove both leading and trailing underscores', () => {
      const result = component.createParameterName('   both sides   ')
      expect(result).toBe('both_sides')
    })

    it('should handle empty string', () => {
      const result = component.createParameterName('')
      expect(result).toBe('')
    })

    it('should handle string with only special characters', () => {
      const result = component.createParameterName('@#$%^&*()')
      expect(result).toBe('')
    })

    it('should handle string with only spaces', () => {
      const result = component.createParameterName('   ')
      expect(result).toBe('')
    })

    it('should handle complex string with all transformations', () => {
      const result = component.createParameterName('  Test@String#With$Special%Characters  ')
      expect(result).toBe('teststringwithspecialcharacters')
    })

    it('should handle numbers in string', () => {
      const result = component.createParameterName('test123 string456')
      expect(result).toBe('test123_string456')
    })

    it('should handle mixed case with numbers and special chars', () => {
      const result = component.createParameterName('TestString123@#$ With Spaces')
      expect(result).toBe('teststring123_with_spaces')
    })
  })

  describe('onFieldValidationChange', () => {
    it('should emit customRegex event with selected value and index', () => {
      const mockEvent = { value: '^[0-9]+$' }
      const mockIndex = new UntypedFormGroup({})
      component.index = mockIndex

      jest.spyOn(component.customRegex, 'emit').mockImplementation(() => { })

      component.onFieldValidationChange(mockEvent)

      expect(component.customRegex.emit).toHaveBeenCalledWith({
        selected: '^[0-9]+$',
        index: mockIndex
      })
    })

    it('should emit customRegex event with undefined index', () => {
      const mockEvent = { value: 'regex' }
      component.index = undefined

      jest.spyOn(component.customRegex, 'emit').mockImplementation(() => { })

      component.onFieldValidationChange(mockEvent)

      expect(component.customRegex.emit).toHaveBeenCalledWith({
        selected: 'regex',
        index: undefined
      })
    })

    it('should handle event with null value', () => {
      const mockEvent = { value: null }
      const mockIndex = new UntypedFormGroup({})
      component.index = mockIndex

      jest.spyOn(component.customRegex, 'emit').mockImplementation(() => { })

      component.onFieldValidationChange(mockEvent)

      expect(component.customRegex.emit).toHaveBeenCalledWith({
        selected: null,
        index: mockIndex
      })
    })

    it('should handle event with undefined value', () => {
      const mockEvent = { value: undefined }
      const mockIndex = new UntypedFormGroup({})
      component.index = mockIndex

      jest.spyOn(component.customRegex, 'emit').mockImplementation(() => { })

      component.onFieldValidationChange(mockEvent)

      expect(component.customRegex.emit).toHaveBeenCalledWith({
        selected: undefined,
        index: mockIndex
      })
    })
  })

  describe('Input Properties', () => {
    it('should accept question input', () => {
      const mockQuestion = new UntypedFormGroup({})
      component.question = mockQuestion
      expect(component.question).toBe(mockQuestion)
    })

    it('should accept customForm input', () => {
      const mockCustomForm = new UntypedFormGroup({})
      component.customForm = mockCustomForm
      expect(component.customForm).toBe(mockCustomForm)
    })

    it('should accept index input', () => {
      const mockIndex = new UntypedFormGroup({})
      component.index = mockIndex
      expect(component.index).toBe(mockIndex)
    })
  })
})