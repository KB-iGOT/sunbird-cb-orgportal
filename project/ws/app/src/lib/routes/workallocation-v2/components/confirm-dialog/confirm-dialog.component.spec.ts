import { ConfirmDialogComponent } from './confirm-dialog.component'
import { MatLegacyDialogRef } from '@angular/material/legacy-dialog'

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent
  let mockDialogRef: jest.Mocked<MatLegacyDialogRef<ConfirmDialogComponent>>
  let mockData: any

  beforeEach(() => {
    // Create Jest mock object for MatLegacyDialogRef
    mockDialogRef = {
      close: jest.fn()
    } as unknown as jest.Mocked<MatLegacyDialogRef<ConfirmDialogComponent>>

    // Mock data to be injected
    mockData = {
      title: 'Test Title',
      message: 'Test Message',
      confirmText: 'Yes',
      cancelText: 'No'
    }

    // Create component instance manually
    component = new ConfirmDialogComponent(mockDialogRef, mockData)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with injected data', () => {
    expect(component.data).toBe(mockData)
    expect(component.dialgData).toBe(mockData)
  })

  it('should assign data to dialgData in constructor', () => {
    const testData = { test: 'value' }
    const newComponent = new ConfirmDialogComponent(mockDialogRef, testData)

    expect(newComponent.dialgData).toBe(testData)
    expect(newComponent.data).toBe(testData)
  })

  describe('closeDialog', () => {
    it('should call dialogRef.close with string action', () => {
      const action = 'confirm'

      component.closeDialog(action)

      expect(mockDialogRef.close).toHaveBeenCalledWith(action)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should call dialogRef.close with boolean action (true)', () => {
      const action = true

      component.closeDialog(action)

      expect(mockDialogRef.close).toHaveBeenCalledWith(action)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should call dialogRef.close with boolean action (false)', () => {
      const action = false

      component.closeDialog(action)

      expect(mockDialogRef.close).toHaveBeenCalledWith(action)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple calls to closeDialog', () => {
      component.closeDialog('first')
      component.closeDialog(true)
      component.closeDialog('last')

      expect(mockDialogRef.close).toHaveBeenCalledTimes(3)
      expect(mockDialogRef.close).toHaveBeenNthCalledWith(1, 'first')
      expect(mockDialogRef.close).toHaveBeenNthCalledWith(2, true)
      expect(mockDialogRef.close).toHaveBeenNthCalledWith(3, 'last')
    })
  })

  describe('constructor', () => {
    it('should handle null data', () => {
      const nullComponent = new ConfirmDialogComponent(mockDialogRef, null)

      expect(nullComponent.data).toBeNull()
      expect(nullComponent.dialgData).toBeNull()
    })

    it('should handle undefined data', () => {
      const undefinedComponent = new ConfirmDialogComponent(mockDialogRef, undefined)

      expect(undefinedComponent.data).toBeUndefined()
      expect(undefinedComponent.dialgData).toBeUndefined()
    })

    it('should handle empty object data', () => {
      const emptyData = {}
      const emptyComponent = new ConfirmDialogComponent(mockDialogRef, emptyData)

      expect(emptyComponent.data).toBe(emptyData)
      expect(emptyComponent.dialgData).toBe(emptyData)
    })
  })
})