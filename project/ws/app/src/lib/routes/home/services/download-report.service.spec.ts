
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { DownloadReportService } from './download-report.service'

describe('DownloadReportService', () => {
    let component: DownloadReportService

    const http: Partial<HttpClient> = {}
    const configSvc: Partial<ConfigurationsService> = {}

    beforeAll(() => {
        component = new DownloadReportService(
            http as HttpClient,
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