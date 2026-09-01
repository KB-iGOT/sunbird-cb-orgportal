import { SelectedDesignationPopupComponent } from './selected-designation-popup.component'

const makeDesignation = (id: string) => ({ id, name: `Designation-${id}` })

describe('SelectedDesignationPopupComponent', () => {
    let component: SelectedDesignationPopupComponent
    let mockDialogRef: any

    beforeEach(() => {
        mockDialogRef = { close: jest.fn() }
        component = new SelectedDesignationPopupComponent(
            mockDialogRef,
            [makeDesignation('d1'), makeDesignation('d2')],
        )
    })

    afterEach(() => jest.clearAllMocks())

    it('should create and populate selectedDesignationsList from dialogData', () => {
        expect(component).toBeTruthy()
        expect(component.selectedDesignationsList).toHaveLength(2)
    })

    describe('ngOnInit', () => {
        it('should not throw', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('removeSelectedDesignation', () => {
        it('should move the item at the given index into removedDesignationsList', () => {
            component.removeSelectedDesignation(0)
            expect(component.removedDesignationsList).toHaveLength(1)
            expect(component.removedDesignationsList[0].id).toBe('d1')
        })

        it('should remove the item from selectedDesignationsList', () => {
            component.removeSelectedDesignation(0)
            expect(component.selectedDesignationsList).toHaveLength(1)
            expect(component.selectedDesignationsList[0].id).toBe('d2')
        })

        it('should handle removing the last item', () => {
            component.removeSelectedDesignation(1)
            component.removeSelectedDesignation(0)
            expect(component.selectedDesignationsList).toHaveLength(0)
            expect(component.removedDesignationsList).toHaveLength(2)
        })
    })

    describe('updateList', () => {
        it('should close dialog with removedDesignationsList', () => {
            component.removeSelectedDesignation(0)
            component.updateList()
            expect(mockDialogRef.close).toHaveBeenCalledWith([makeDesignation('d1')])
        })

        it('should close dialog with empty array when nothing was removed', () => {
            component.updateList()
            expect(mockDialogRef.close).toHaveBeenCalledWith([])
        })
    })
})
