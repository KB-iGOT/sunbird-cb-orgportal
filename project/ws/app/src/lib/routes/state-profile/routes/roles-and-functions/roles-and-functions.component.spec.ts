
import { OrgProfileService } from '../../services/org-profile.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { RolesAndFunctionsComponent } from './roles-and-functions.component'

describe('RolesAndFunctionsComponent', () => {
    let component: RolesAndFunctionsComponent

    const orgSvc: Partial<OrgProfileService> = {}
    const configSvc: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new RolesAndFunctionsComponent(
            orgSvc as OrgProfileService,
            configSvc as ConfigurationsService
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