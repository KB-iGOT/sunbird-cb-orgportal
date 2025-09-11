
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { TncRendererComponent } from './tnc-renderer.component'

describe('TncRendererComponent', () => {
    let component: TncRendererComponent

    const configSvc: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new TncRendererComponent(
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
