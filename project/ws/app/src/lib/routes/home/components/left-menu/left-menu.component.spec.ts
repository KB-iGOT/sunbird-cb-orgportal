import { EventService } from '@sunbird-cb/utils-v2'
import { LeftMenuComponent } from './left-menu.component'

describe('LeftMenuComponent', () => {
    let component: LeftMenuComponent

    const events: Partial<EventService> = {}

    beforeAll(() => {
        component = new LeftMenuComponent(
            events as EventService
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
