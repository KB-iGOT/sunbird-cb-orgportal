import { ConformationPopupComponent } from './conformation-popup.component'

describe('ConformationPopupComponent', () => {
    let component: ConformationPopupComponent
    let mockDialogRef: any

    beforeEach(() => {
        mockDialogRef = { close: jest.fn() }
        component = new ConformationPopupComponent(mockDialogRef, { title: 'Test', buttons: [] })
    })

    afterEach(() => jest.clearAllMocks())

    it('should create and set dialogDetails from data', () => {
        expect(component).toBeTruthy()
        expect(component.dialogDetails).toEqual({ title: 'Test', buttons: [] })
    })

    describe('ngOnInit', () => {
        it('should not throw', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('closePopup', () => {
        it('should close the dialog with the given event value', () => {
            component.closePopup(true)
            expect(mockDialogRef.close).toHaveBeenCalledWith(true)
        })

        it('should close the dialog with the given string event', () => {
            component.closePopup('ok')
            expect(mockDialogRef.close).toHaveBeenCalledWith('ok')
        })

        it('should close the dialog with null', () => {
            component.closePopup(null)
            expect(mockDialogRef.close).toHaveBeenCalledWith(null)
        })
    })
})
