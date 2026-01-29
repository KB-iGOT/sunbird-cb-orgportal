
import { MatDialogRef } from '@angular/material/dialog'
import { SelectedUserDialogComponent } from './selected-user-dialog.component'

describe('SelectedUserDialogComponent', () => {
    let component: SelectedUserDialogComponent

    const dialogRef: Partial<MatDialogRef<SelectedUserDialogComponent>> = {}
    const data: any = {}

    beforeAll(() => {
        component = new SelectedUserDialogComponent(
            dialogRef as MatDialogRef<SelectedUserDialogComponent>,
            data as undefined
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })
})
