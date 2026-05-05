import { RequestCancelDialogComponent } from './request-cancel-dialog.component'

describe('RequestCancelDialogComponent', () => {
  let component: RequestCancelDialogComponent
  let mockDialogRef: any
  const mockRequestType = 'certificationRequest' as any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    component = new RequestCancelDialogComponent(mockRequestType, mockDialogRef)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have requestType injected', () => {
    expect(component.requestType).toBe(mockRequestType)
  })

  it('ngOnInit should run without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  describe('cancelRequest', () => {
    it('should call dialogRef.close with confirmCancel: true', () => {
      component.cancelRequest()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ confirmCancel: true })
    })

    it('should call dialogRef.close exactly once', () => {
      component.cancelRequest()
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should pass confirmCancel true not false', () => {
      component.cancelRequest()
      const arg = mockDialogRef.close.mock.calls[0][0]
      expect(arg.confirmCancel).toBe(true)
    })
  })
})
