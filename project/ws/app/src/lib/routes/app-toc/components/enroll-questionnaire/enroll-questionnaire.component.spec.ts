import { EnrollQuestionnaireComponent } from './enroll-questionnaire.component'

describe('EnrollQuestionnaireComponent', () => {
  let component: EnrollQuestionnaireComponent
  let snackBarMock: any
  let dialogRefMock: any
  let dialogDataMock: any

  beforeEach(() => {
    snackBarMock = {
      open: jest.fn(),
    }
    dialogRefMock = {
      close: jest.fn(),
    }
    dialogDataMock = { title: 'Test', questions: [] }

    component = new EnrollQuestionnaireComponent(snackBarMock, dialogRefMock, dialogDataMock)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize isReadOnly as false', () => {
    expect(component.isReadOnly).toBe(false)
  })

  it('should expose afterSubmitAction as a bound function', () => {
    expect(typeof component.afterSubmitAction).toBe('function')
  })

  it('should inject dialog data correctly', () => {
    expect(component.data).toEqual(dialogDataMock)
  })

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('checkAfterSubmit', () => {
    it('should open snackbar with success message', () => {
      component.checkAfterSubmit({})
      expect(snackBarMock.open).toHaveBeenCalledWith('Form is submitted successfully', 'X', { duration: 5000 })
    })

    it('should close dialog with true', () => {
      component.checkAfterSubmit({})
      expect(dialogRefMock.close).toHaveBeenCalledWith(true)
    })

    it('should call both snackBar and dialogRef.close when invoked via afterSubmitAction', () => {
      component.afterSubmitAction({})
      expect(snackBarMock.open).toHaveBeenCalledWith('Form is submitted successfully', 'X', { duration: 5000 })
      expect(dialogRefMock.close).toHaveBeenCalledWith(true)
    })
  })
})
