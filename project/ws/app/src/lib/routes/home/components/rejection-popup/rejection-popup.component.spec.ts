import { RejectionPopupComponent } from './rejection-popup.component'
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
import { UntypedFormControl } from '@angular/forms'
import * as _ from 'lodash'

// Mock lodash
jest.mock('lodash', () => ({
    get: jest.fn()
}))

describe('RejectionPopupComponent', () => {
    let component: RejectionPopupComponent
    let mockDialogRef: jest.Mocked<MatDialogRef<RejectionPopupComponent>>
    let mockData: any

    beforeEach(() => {
        // Create mock dialog ref
        mockDialogRef = {
            close: jest.fn()
        } as any

        // Create mock data
        mockData = {
            header: { showEditButton: true },
            body: { reason: 'Test reason', showTextArea: false },
            footer: { showFooter: false }
        }

        // Create component instance
        component = new RejectionPopupComponent(mockDialogRef, mockData)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should create component with injected dependencies', () => {
            expect(component).toBeTruthy()
            expect(component.rejectionsDetails).toEqual(mockData)
        })

        it('should initialize reason FormControl with validators', () => {
            expect(component.reason).toBeInstanceOf(UntypedFormControl)
            expect(component.reason.hasError('required')).toBe(true)
        })

        it('should set maxLength validator to 100', () => {
            const longString = 'a'.repeat(101)
            component.reason.setValue(longString)
            expect(component.reason.hasError('maxlength')).toBe(true)
        })
    })

    describe('ngOnInit', () => {
        it('should call initialisation method', () => {
            const initialisationSpy = jest.spyOn(component, 'intialisation')

            component.ngOnInit()

            expect(initialisationSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('intialisation', () => {
        it('should set reason value from rejectionsDetails using lodash get', () => {
            const mockReason = 'Initial reason';
            (_.get as jest.Mock).mockReturnValue(mockReason)

            component.intialisation()

            expect(_.get).toHaveBeenCalledWith(mockData, 'body.reason')
            expect(component.reason.value).toBe(mockReason)
        })

        it('should handle undefined value from lodash get', () => {
            (_.get as jest.Mock).mockReturnValue(undefined)

            component.intialisation()

            expect(component.reason.value).toBe(undefined)
        })

        it('should handle null value from lodash get', () => {
            (_.get as jest.Mock).mockReturnValue(null)

            component.intialisation()

            expect(component.reason.value).toBe(null)
        })
    })

    describe('editReason', () => {
        it('should update rejectionsDetails properties correctly', () => {
            component.editReason()

            expect(component.rejectionsDetails.header.showEditButton).toBe(false)
            expect(component.rejectionsDetails.body.showTextArea).toBe(true)
            expect(component.rejectionsDetails.footer.showFooter).toBe(true)
        })

        it('should modify the original object reference', () => {
            const originalObject = component.rejectionsDetails

            component.editReason()

            expect(component.rejectionsDetails).toBe(originalObject)
        })
    })

    describe('onButtonClick', () => {
        beforeEach(() => {
            component.reason.setValue('Valid reason')
        })

        describe('when btnType is cancel', () => {
            it('should close dialog regardless of form validity', () => {
                const btnDetails = { btnType: 'cancel', response: 'cancelled' }
                component.reason.setValue('') // Make form invalid

                component.onButtonClick(btnDetails)

                expect(mockDialogRef.close).toHaveBeenCalledWith({
                    btnResponse: 'cancelled',
                    reason: ''
                })
            })
        })

        describe('when btnType is not cancel', () => {
            it('should close dialog when form is valid', () => {
                const btnDetails = { btnType: 'submit', response: 'confirmed' }
                component.reason.setValue('Valid reason')

                component.onButtonClick(btnDetails)

                expect(mockDialogRef.close).toHaveBeenCalledWith({
                    btnResponse: 'confirmed',
                    reason: 'Valid reason'
                })
            })

            it('should not close dialog when form is invalid', () => {
                const btnDetails = { btnType: 'submit', response: 'confirmed' }
                component.reason.setValue('') // Make form invalid

                component.onButtonClick(btnDetails)

                expect(mockDialogRef.close).not.toHaveBeenCalled()
            })

            it('should not close dialog when reason exceeds maxLength', () => {
                const btnDetails = { btnType: 'submit', response: 'confirmed' }
                component.reason.setValue('a'.repeat(101)) // Exceeds maxLength

                component.onButtonClick(btnDetails)

                expect(mockDialogRef.close).not.toHaveBeenCalled()
            })
        })

        describe('response object structure', () => {
            it('should create correct response object with btnResponse and reason', () => {
                const btnDetails = { btnType: 'submit', response: 'approved' }
                const reasonValue = 'Test reason'
                component.reason.setValue(reasonValue)

                component.onButtonClick(btnDetails)

                expect(mockDialogRef.close).toHaveBeenCalledWith({
                    btnResponse: 'approved',
                    reason: reasonValue
                })
            })

            it('should include current reason value even if form is invalid for cancel', () => {
                const btnDetails = { btnType: 'cancel', response: 'cancelled' }
                const reasonValue = '' // Invalid but should still be included
                component.reason.setValue(reasonValue)

                component.onButtonClick(btnDetails)

                expect(mockDialogRef.close).toHaveBeenCalledWith({
                    btnResponse: 'cancelled',
                    reason: reasonValue
                })
            })
        })
    })

    describe('Form Validation', () => {
        it('should be invalid when reason is empty', () => {
            component.reason.setValue('')
            expect(component.reason.valid).toBe(false)
            expect(component.reason.hasError('required')).toBe(true)
        })

        it('should be invalid when reason is null', () => {
            component.reason.setValue(null)
            expect(component.reason.valid).toBe(false)
            expect(component.reason.hasError('required')).toBe(true)
        })

        it('should be valid when reason has valid content', () => {
            component.reason.setValue('Valid reason')
            expect(component.reason.valid).toBe(true)
        })

        it('should be valid when reason is exactly 100 characters', () => {
            const exactLength = 'a'.repeat(100)
            component.reason.setValue(exactLength)
            expect(component.reason.valid).toBe(true)
        })

        it('should be invalid when reason exceeds 100 characters', () => {
            const tooLong = 'a'.repeat(101)
            component.reason.setValue(tooLong)
            expect(component.reason.valid).toBe(false)
            expect(component.reason.hasError('maxlength')).toBe(true)
        })
    })

    describe('Integration scenarios', () => {
        it('should handle complete workflow from initialization to submission', () => {
            const mockReason = 'Initial reason';
            (_.get as jest.Mock).mockReturnValue(mockReason)

            // Initialize
            component.ngOnInit()
            expect(component.reason.value).toBe(mockReason)

            // Edit reason
            component.editReason()
            expect(component.rejectionsDetails.header.showEditButton).toBe(false)

            // Update reason
            component.reason.setValue('Updated reason')

            // Submit
            const btnDetails = { btnType: 'submit', response: 'confirmed' }
            component.onButtonClick(btnDetails)

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                btnResponse: 'confirmed',
                reason: 'Updated reason'
            })
        })

        it('should handle data without body.reason property', () => {
            const dataWithoutReason = { header: {}, body: {}, footer: {} }
            component = new RejectionPopupComponent(mockDialogRef, dataWithoutReason);
            (_.get as jest.Mock).mockReturnValue(undefined)

            component.intialisation()

            expect(component.reason.value).toBe(undefined)
            expect(component.reason.valid).toBe(false)
        })
    })
})