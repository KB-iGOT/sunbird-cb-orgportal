import { ConfirmationBoxComponent } from "./confirmation.box.component"


describe('ConfirmationBoxComponent', () => {
    let component: ConfirmationBoxComponent
    let mockDialogRef: any
    let mockTpdsSvc: any
    let mockData: any

    beforeEach(() => {
        // Mock MAT_DIALOG_DATA
        mockData = { message: 'Test message', type: 'test' }

        // Mock MatDialogRef
        mockDialogRef = {
            close: jest.fn()
        }

        // Mock TrainingPlanDataSharingService
        mockTpdsSvc = {
            trainingPlanCategoryChangeEvent: {
                next: jest.fn()
            }
        }

        // Create component instance manually
        component = new ConfirmationBoxComponent(
            mockData,
            mockDialogRef,
            mockTpdsSvc
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize with injected data', () => {
        expect(component.data).toBe(mockData)
    })

    describe('ngOnInit', () => {
        it('should be called without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('closeModal', () => {
        it('should close the dialog', () => {
            component.closeModal()

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith()
        })
    })

    describe('performAction', () => {
        it('should close dialog with "confirmed" when data type is "conformation"', () => {
            const testData = { type: 'conformation', message: 'Test' }

            component.performAction(testData)

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith('confirmed')
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).not.toHaveBeenCalled()
        })

        it('should close dialog and emit event when data type is not "conformation"', () => {
            const testData = { type: 'other', message: 'Test' }

            component.performAction(testData)

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith()
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledTimes(1)
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledWith(testData)
        })

        it('should close dialog and emit event when data is null', () => {
            component.performAction(null)

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith()
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledTimes(1)
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledWith(null)
        })

        it('should close dialog and emit event when data is undefined', () => {
            component.performAction(undefined)

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith()
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledTimes(1)
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledWith(undefined)
        })

        it('should handle data with type field but not "conformation"', () => {
            const testData = { type: 'delete', id: 123 }

            component.performAction(testData)

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith()
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledTimes(1)
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledWith(testData)
        })

        it('should handle empty object', () => {
            const testData = {}

            component.performAction(testData)

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith()
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledTimes(1)
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledWith(testData)
        })
    })

    describe('Integration tests', () => {
        it('should properly handle the confirmation flow', () => {
            const confirmationData = { type: 'conformation', action: 'delete' }

            component.performAction(confirmationData)

            expect(mockDialogRef.close).toHaveBeenCalledWith('confirmed')
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).not.toHaveBeenCalled()
        })

        it('should properly handle the action flow', () => {
            const actionData = { type: 'action', payload: { id: 1 } }

            component.performAction(actionData)

            expect(mockDialogRef.close).toHaveBeenCalledWith()
            expect(mockTpdsSvc.trainingPlanCategoryChangeEvent.next).toHaveBeenCalledWith(actionData)
        })
    })

    describe('Constructor dependencies', () => {
        it('should have access to injected data', () => {
            expect(component.data).toBeDefined()
            expect(component.data).toBe(mockData)
        })

        it('should have access to dialog reference', () => {
            expect(component['dialogRef']).toBeDefined()
            expect(component['dialogRef']).toBe(mockDialogRef)
        })

        it('should have access to training plan data sharing service', () => {
            expect(component['tpdsSvc']).toBeDefined()
            expect(component['tpdsSvc']).toBe(mockTpdsSvc)
        })
    })
})