
import { StepService } from '../../services/step.service'
import { EventService } from '@sunbird-cb/utils-v2'
import { SetupLeftMenuComponent } from './left-menu.component'

describe('SetupLeftMenuComponent', () => {
    let component: SetupLeftMenuComponent

    const events: Partial<EventService> = {}
    const stepService: Partial<StepService> = {}

    beforeAll(() => {
        component = new SetupLeftMenuComponent(
            events as EventService,
            stepService as StepService
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