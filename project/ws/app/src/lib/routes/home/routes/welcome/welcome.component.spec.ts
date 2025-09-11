(window as any)['env'] = {
    name: 'test-environment',
    sitePath: '/test-site-path',
    karmYogiPath: '/test-karm-yogi-path',
    cbpPath: '/test-cbp-path'
}

import { ProfileV2Service } from '../../services/home.servive'
import { Router } from '@angular/router'
import { EventService } from '@sunbird-cb/utils-v2'
import { WelcomeComponent } from './welcome.component'

describe('WelcomeComponent', () => {
    let component: WelcomeComponent

    const document: Partial<Document> = {}
    const homeResolver: Partial<ProfileV2Service> = {}
    const router: Partial<Router> = {}
    const events: Partial<EventService> = {}

    beforeAll(() => {
        component = new WelcomeComponent(
            document as Document,
            homeResolver as ProfileV2Service,
            router as Router,
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