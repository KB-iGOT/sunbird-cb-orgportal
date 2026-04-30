
import { MatDialogRef } from '@angular/material/dialog'
import { RejectReasonDialogComponent } from './reject-reason-dialog.component'

describe('RejectReasonDialogComponent', () => {
    let component: RejectReasonDialogComponent
    let mockDialogRef: any

    beforeEach(() => {
        jest.clearAllMocks()
        mockDialogRef = { close: jest.fn() }
        component = new RejectReasonDialogComponent(
            mockDialogRef as MatDialogRef<RejectReasonDialogComponent>,
            {}
        )
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    describe('reasonForm', () => {
        it('should initialize reasonForm with a reason control', () => {
            expect(component.reasonForm).toBeTruthy()
            expect(component.reasonForm.get('reason')).toBeTruthy()
        })

        it('should be invalid when reason is empty', () => {
            component.reasonForm.get('reason')!.setValue('')
            expect(component.reasonForm.invalid).toBe(true)
        })

        it('should be valid when reason has a value', () => {
            component.reasonForm.get('reason')!.setValue('Valid reason text')
            expect(component.reasonForm.valid).toBe(true)
        })

        it('should be invalid when reason exceeds 500 chars', () => {
            const longText = 'a'.repeat(501)
            component.reasonForm.get('reason')!.setValue(longText)
            expect(component.reasonForm.invalid).toBe(true)
        })
    })

    describe('ngOnInit()', () => {
        it('should run without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('onSubmit()', () => {
        it('should call dialogRef.close with form value', () => {
            component.reasonForm.get('reason')!.setValue('Test reason')
            component.onSubmit()
            expect(mockDialogRef.close).toHaveBeenCalledWith({ reason: 'Test reason' })
        })

        it('should close dialog with current form values', () => {
            const reason = 'Some rejection reason'
            component.reasonForm.get('reason')!.setValue(reason)
            component.onSubmit()
            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
        })
    })
})
