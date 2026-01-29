
import { OrgUserService } from '../../services/org-user.service'
import { MyContentService } from '../../services/content-detail.service'
import { MatDialog } from '@angular/material/dialog'
import { SelectLearnersToBatchComponent } from './select-learners-to-batch.component'

describe('SelectLearnersToBatchComponent', () => {
    let component: SelectLearnersToBatchComponent

    const orgSvc: Partial<OrgUserService> = {}
    const dialog: Partial<MatDialog> = {}
    const contentSvc: Partial<MyContentService> = {}

    beforeAll(() => {
        component = new SelectLearnersToBatchComponent(
            orgSvc as OrgUserService,
            dialog as MatDialog,
            contentSvc as MyContentService
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
