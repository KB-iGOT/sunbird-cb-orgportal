
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
import { PreviewDialogBoxComponent } from './preview-dialog-box.component'

describe('PreviewDialogBoxComponent', () => {
    let component: PreviewDialogBoxComponent
    let mockDialogRef: jest.Mocked<MatDialogRef<PreviewDialogBoxComponent>>
    let mockData: any

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()

        mockDialogRef = {
            close: jest.fn(),
        } as any

        mockData = { from: 'content' }

        component = new PreviewDialogBoxComponent(
            mockData,
            mockDialogRef
        )
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should set contentForm from data.from on ngOnInit', () => {
        component.ngOnInit()
        expect(component.contentForm).toBe('content')
    })

    it('should set contentForm to undefined when data.from is not set', () => {
        component = new PreviewDialogBoxComponent({}, mockDialogRef)
        component.ngOnInit()
        expect(component.contentForm).toBeUndefined()
    })

    it('should call dialogRef.close() when closeModal is called', () => {
        component.closeModal()
        expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should expose data as public property', () => {
        expect(component.data).toEqual(mockData)
    })
})