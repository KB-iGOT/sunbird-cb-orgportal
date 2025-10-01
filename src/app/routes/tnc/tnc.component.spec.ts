import '@angular/compiler'
import { ActivatedRoute, Router } from '@angular/router'
import { LoggerService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { HttpClient } from '@angular/common/http'
import { TncAppResolverService } from '../../services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { MatDialog } from '@angular/material/dialog'
import { TncComponent } from './tnc.component'

describe('TncComponent', () => {
    let component: TncComponent

    const activatedRoute: Partial<ActivatedRoute> = {}
    const router: Partial<Router> = {}
    const http: Partial<HttpClient> = {}
    const loggerSvc: Partial<LoggerService> = {}
    const configSvc: Partial<ConfigurationsService> = {}
    const tncProtectedSvc: Partial<TncAppResolverService> = {}
    const tncPublicSvc: Partial<TncPublicResolverService> = {}
    const matDialog: Partial<MatDialog> = {}

    beforeAll(() => {
        component = new TncComponent(
            activatedRoute as ActivatedRoute,
            router as Router,
            http as HttpClient,
            loggerSvc as LoggerService,
            configSvc as ConfigurationsService,
            tncProtectedSvc as TncAppResolverService,
            tncPublicSvc as TncPublicResolverService,
            matDialog as MatDialog
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
