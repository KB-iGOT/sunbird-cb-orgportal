
import { Router } from '@angular/router'
import { MatDialogRef } from '@angular/material/dialog'
import { UploadFileService } from '../../services/uploadfile.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { PublishPopupComponent } from './publish-popup.component'
import { of } from 'rxjs'

describe('PublishPopupComponent', () => {
    let component: PublishPopupComponent

    const uploadService: Partial<UploadFileService> = {
        getProfile: jest.fn(() => of())
    }
    const router: Partial<Router> = {}
    const dialogRef: Partial<MatDialogRef<PublishPopupComponent>> = {}
    const configSvc: Partial<ConfigurationsService> = {}
    const data: any = {}

    beforeAll(() => {
        component = new PublishPopupComponent(
            uploadService as UploadFileService,
            router as Router,
            dialogRef as MatDialogRef<PublishPopupComponent>,
            configSvc as ConfigurationsService,
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