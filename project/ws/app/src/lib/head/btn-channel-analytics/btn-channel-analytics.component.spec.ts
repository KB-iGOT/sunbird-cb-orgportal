import { BtnChannelAnalyticsComponent } from './btn-channel-analytics.component'
import { NsContent } from '../_services/widget-content.model'

describe('BtnChannelAnalyticsComponent', () => {
    let component: BtnChannelAnalyticsComponent

    beforeEach(() => {
        component = new BtnChannelAnalyticsComponent()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('showButton getter', () => {
        it('should return true when contentType is CHANNEL', () => {
            component.widgetData = {
                identifier: 'ch-001',
                contentType: NsContent.EContentTypes.CHANNEL,
            }
            expect(component.showButton).toBe(true)
        })

        it('should return false when contentType is COURSE', () => {
            component.widgetData = {
                identifier: 'c-001',
                contentType: NsContent.EContentTypes.COURSE,
            }
            expect(component.showButton).toBe(false)
        })

        it('should return false when contentType is PROGRAM', () => {
            component.widgetData = {
                identifier: 'p-001',
                contentType: NsContent.EContentTypes.PROGRAM,
            }
            expect(component.showButton).toBe(false)
        })

        it('should return false when contentType is RESOURCE', () => {
            component.widgetData = {
                identifier: 'r-001',
                contentType: NsContent.EContentTypes.RESOURCE,
            }
            expect(component.showButton).toBe(false)
        })
    })
})