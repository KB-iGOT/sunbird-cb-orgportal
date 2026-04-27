import { HandsOnDialogComponent } from './hands-on-dialog.component'

describe('HandsOnDialogComponent', () => {
  let component: HandsOnDialogComponent
  let mockDialogRef: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    component = new HandsOnDialogComponent(mockDialogRef, 'submit')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should expose injected data', () => {
    expect(component.data).toBe('submit')
  })

  it('ngOnInit should not throw', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  describe('submit', () => {
    it('should close dialog with "submit"', () => {
      component.submit()
      expect(mockDialogRef.close).toHaveBeenCalledWith('submit')
    })
  })

  describe('close', () => {
    it('should close dialog with no argument', () => {
      component.close()
      expect(mockDialogRef.close).toHaveBeenCalledWith()
    })
  })
})
