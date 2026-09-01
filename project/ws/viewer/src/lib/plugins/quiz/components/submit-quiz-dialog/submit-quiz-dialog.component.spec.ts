import { SubmitQuizDialogComponent } from './submit-quiz-dialog.component'

describe('SubmitQuizDialogComponent (quiz)', () => {
  let component: SubmitQuizDialogComponent
  let mockDialogRef: any
  let mockSubmissionState: any

  beforeEach(() => {
    mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn(),
    }
    mockSubmissionState = 'initial' as any
    component = new SubmitQuizDialogComponent(mockDialogRef, mockSubmissionState)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should expose dialogRef', () => {
    expect(component.dialogRef).toBe(mockDialogRef)
  })

  it('should expose submissionState', () => {
    expect(component.submissionState).toBe(mockSubmissionState)
  })

  it('should create with different submission states', () => {
    const states = ['initial', 'pass', 'fail', 'partial']
    states.forEach(state => {
      const comp = new SubmitQuizDialogComponent(mockDialogRef, state as any)
      expect(comp.submissionState).toBe(state)
    })
  })

  it('ngOnInit should not throw', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
