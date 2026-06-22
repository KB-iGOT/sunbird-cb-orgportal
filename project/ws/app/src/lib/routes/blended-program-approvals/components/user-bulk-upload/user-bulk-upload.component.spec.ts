
import { MyContentService } from '../../services/content-detail.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { UserBulkUploadComponent } from './user-bulk-upload.component'

describe('UserBulkUploadComponent', () => {
    let component: UserBulkUploadComponent

    const contentSvc: Partial<MyContentService> = {}
    const dialog: Partial<MatDialog> = {}
    const snackBar: Partial<MatSnackBar> = {}

    beforeAll(() => {
        component = new UserBulkUploadComponent(
            contentSvc as MyContentService,
            dialog as MatDialog,
            snackBar as MatSnackBar
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
