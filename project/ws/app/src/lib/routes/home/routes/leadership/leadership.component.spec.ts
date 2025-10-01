import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { ActivatedRoute } from '@angular/router'
import { MdoInfoService } from '../../services/mdoinfo.service'
import { ProfileV2UtillService } from '../../services/home-utill.service'
import { LeadershipComponent } from './leadership.component'

describe('LeadershipComponent', () => {
    let component: LeadershipComponent

    const activeRoute: Partial<ActivatedRoute> = {}
    const configSvc: Partial<ConfigurationsService> = {}
    const mdoinfoSrvc: Partial<MdoInfoService> = {}
    const profileUtilSvc: Partial<ProfileV2UtillService> = {}

    beforeAll(() => {
        component = new LeadershipComponent(
            activeRoute as ActivatedRoute,
            configSvc as ConfigurationsService,
            mdoinfoSrvc as MdoInfoService,
            profileUtilSvc as ProfileV2UtillService
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