
import { DialogConfirmComponent, IPopData } from './dialog-confirm.component'

describe('DialogConfirmComponent', () => {
    let component: DialogConfirmComponent
    let mockDialogRef: any

    beforeEach(() => {
        jest.clearAllMocks()
        mockDialogRef = { close: jest.fn() }
    })

    describe('constructor defaults', () => {
        it('should create a instance of component', () => {
            const data: Partial<IPopData> = {}
            component = new DialogConfirmComponent(data as IPopData, mockDialogRef)
            expect(component).toBeTruthy()
        })

        it('should set ok to "Yes" when not provided', () => {
            const data: Partial<IPopData> = { title: 'Test' }
            component = new DialogConfirmComponent(data as IPopData, mockDialogRef)
            expect(data.ok).toBe('Yes')
        })

        it('should set cancel to "No" when not provided', () => {
            const data: Partial<IPopData> = { title: 'Test' }
            component = new DialogConfirmComponent(data as IPopData, mockDialogRef)
            expect(data.cancel).toBe('No')
        })

        it('should not override ok when already provided', () => {
            const data: IPopData = { title: 'Test', body: 'Body', ok: 'Confirm' }
            component = new DialogConfirmComponent(data, mockDialogRef)
            expect(data.ok).toBe('Confirm')
        })

        it('should not override cancel when already provided', () => {
            const data: IPopData = { title: 'Test', body: 'Body', cancel: 'Dismiss' }
            component = new DialogConfirmComponent(data, mockDialogRef)
            expect(data.cancel).toBe('Dismiss')
        })
    })

    describe('confirmed()', () => {
        it('should call dialogRef.close with true', () => {
            const data: Partial<IPopData> = {}
            component = new DialogConfirmComponent(data as IPopData, mockDialogRef)
            component.confirmed()
            expect(mockDialogRef.close).toHaveBeenCalledWith(true)
        })
    })
})
