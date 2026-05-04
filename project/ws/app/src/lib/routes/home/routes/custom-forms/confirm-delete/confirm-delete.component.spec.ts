import { MatDialogRef } from '@angular/material/dialog'
import { ConfirmDeleteComponent } from './confirm-delete.component'

describe('ConfirmDeleteComponent', () => {
  let component: ConfirmDeleteComponent
  let mockDialogRef: jest.Mocked<MatDialogRef<ConfirmDeleteComponent>>
  const mockDialogData = { formId: 'form-1', formName: 'Test Form' }

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() } as any
    component = new ConfirmDeleteComponent(mockDialogRef, mockDialogData)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have dialogData set from injected data', () => {
    expect(component.dialogData).toBe(mockDialogData)
  })

  describe('handleCloseModal()', () => {
    it('should close dialog with false', () => {
      component.handleCloseModal()
      expect(mockDialogRef.close).toHaveBeenCalledWith(false)
    })
  })

  describe('handleDeleteForm()', () => {
    it('should close dialog with true', () => {
      component.handleDeleteForm()
      expect(mockDialogRef.close).toHaveBeenCalledWith(true)
    })
  })
})
