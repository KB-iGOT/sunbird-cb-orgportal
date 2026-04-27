import { FormBuilder } from '@angular/forms'
import { RejectReasonDialogComponent } from './reject-reason-dialog.component'

describe('RejectReasonDialogComponent', () => {
  let component: RejectReasonDialogComponent
  let mockDialogRef: any

  const makeComponent = (data: any = {}) => {
    mockDialogRef = { close: jest.fn() }
    return new RejectReasonDialogComponent(new FormBuilder(), mockDialogRef, data)
  }

  beforeEach(() => {
    component = makeComponent({ title: 'Remarks', maxLength: 500 })
  })

  // ─── create ─────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set maxLength from data when provided', () => {
    const comp = makeComponent({ maxLength: 200 })
    expect(comp.maxLength).toBe(200)
  })

  it('should use default maxLength of 500 when data has no maxLength', () => {
    const comp = makeComponent({})
    expect(comp.maxLength).toBe(500)
  })

  it('should use default maxLength when data is null', () => {
    const comp = makeComponent(null)
    expect(comp.maxLength).toBe(500)
  })

  it('should create a form with a "reason" control', () => {
    expect(component.form.get('reason')).toBeTruthy()
  })

  // ─── onConfirm ──────────────────────────────────────────────────────

  describe('onConfirm', () => {
    it('should close dialog with reason value when form is valid', () => {
      // minLength=100, maxLength=500 — provide a value that satisfies these
      const longReason = 'a'.repeat(150)
      component.form.get('reason')!.setValue(longReason)
      component.onConfirm()
      expect(mockDialogRef.close).toHaveBeenCalledWith(longReason)
    })

    it('should markAllAsTouched and NOT close dialog when form is invalid', () => {
      component.form.get('reason')!.setValue('')
      const markSpy = jest.spyOn(component.form, 'markAllAsTouched')
      component.onConfirm()
      expect(markSpy).toHaveBeenCalled()
      expect(mockDialogRef.close).not.toHaveBeenCalled()
    })

    it('should NOT close dialog when reason is too short (< minLength 100)', () => {
      component.form.get('reason')!.setValue('short')
      const markSpy = jest.spyOn(component.form, 'markAllAsTouched')
      component.onConfirm()
      expect(markSpy).toHaveBeenCalled()
      expect(mockDialogRef.close).not.toHaveBeenCalled()
    })

    it('should NOT close dialog when reason exceeds maxLength', () => {
      component.form.get('reason')!.setValue('a'.repeat(600))
      const markSpy = jest.spyOn(component.form, 'markAllAsTouched')
      component.onConfirm()
      expect(markSpy).toHaveBeenCalled()
      expect(mockDialogRef.close).not.toHaveBeenCalled()
    })
  })

  // ─── onCancel ───────────────────────────────────────────────────────

  describe('onCancel', () => {
    it('should close the dialog without a value', () => {
      component.onCancel()
      expect(mockDialogRef.close).toHaveBeenCalledWith()
    })
  })
})
