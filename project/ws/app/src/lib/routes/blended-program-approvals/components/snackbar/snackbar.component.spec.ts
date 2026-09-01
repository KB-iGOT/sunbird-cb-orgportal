import { SnackbarComponent } from './snackbar.component'

describe('SnackbarComponent (blended-program-approvals)', () => {
  let component: SnackbarComponent
  let mockSnackBarRef: any

  beforeEach(() => {
    mockSnackBarRef = {
      dismissWithAction: jest.fn(),
      dismiss: jest.fn(),
    }
  })

  it('should create with success message', () => {
    const data = { message: 'Approved successfully', type: 'success | error' as const }
    component = new SnackbarComponent(data, mockSnackBarRef)
    expect(component).toBeTruthy()
  })

  it('should expose injected data', () => {
    const data = { message: 'Request rejected', type: 'success | error' as const }
    component = new SnackbarComponent(data, mockSnackBarRef)
    expect(component.data).toBe(data)
    expect(component.data.message).toBe('Request rejected')
    expect(component.data.type).toBe('success | error')
  })

  it('should expose snackBarRef', () => {
    const data = { message: 'Test', type: 'success | error' as const }
    component = new SnackbarComponent(data, mockSnackBarRef)
    expect(component.snackBarRef).toBe(mockSnackBarRef)
  })

  it('should create with empty message', () => {
    const data = { message: '', type: 'success | error' as const }
    component = new SnackbarComponent(data, mockSnackBarRef)
    expect(component.data.message).toBe('')
  })
})
