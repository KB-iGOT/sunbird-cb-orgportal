
import { ActivatedRoute } from '@angular/router'
import { HttpBackend } from '@angular/common/http'
import { ViewerUtilService } from '../../viewer-util.service'
import { ChannelComponent } from './channel.component'

describe('ChannelComponent', () => {
    let component: ChannelComponent

    const activatedRoute: Partial<ActivatedRoute> = {}
    const httpBackend: Partial<HttpBackend> = {}
    const viewerSvc: Partial<ViewerUtilService> = {}

    beforeAll(() => {
        component = new ChannelComponent(
            activatedRoute as ActivatedRoute,
            httpBackend as HttpBackend,
            viewerSvc as ViewerUtilService
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