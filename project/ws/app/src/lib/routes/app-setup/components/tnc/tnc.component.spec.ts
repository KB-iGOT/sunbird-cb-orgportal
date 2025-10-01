// tslint:disable
import '@angular/compiler'
import { ActivatedRoute, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { LoggerService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { TncAppResolverService } from '../../../../../../../../../src/app/services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../../../../../../../../src/app/services/tnc-public-resolver.service'
import { Globals } from '../../globals'
import { TncComponent } from './tnc.component'

describe('TncComponent', () => {
    let component: TncComponent

    const mockActivatedRoute = {
        data: of({ tnc: { data: { isNewUser: true } }, isPublic: false }),
        snapshot: { queryParamMap: { has: jest.fn().mockReturnValue(false), get: jest.fn() } },
    } as unknown as ActivatedRoute

    const mockRouter = { navigate: jest.fn() } as unknown as Router
    const mockHttpClient = { post: jest.fn(), patch: jest.fn() } as unknown as HttpClient
    const mockLoggerSvc = { error: jest.fn() } as unknown as LoggerService
    const mockConfigSvc = { pageNavBar: {}, userUrl: '', isNewUser: false, hasAcceptedTnc: false } as unknown as ConfigurationsService
    const mockTncProtectedSvc = { getTnc: jest.fn() } as unknown as TncAppResolverService
    const mockTncPublicSvc = { getPublicTnc: jest.fn() } as unknown as TncPublicResolverService
    const mockGlobals = { firstTimeSetupDone: false } as unknown as Globals

    beforeAll(() => {
        component = new TncComponent(
            mockActivatedRoute,
            mockRouter,
            mockHttpClient,
            mockLoggerSvc,
            mockConfigSvc,
            mockTncProtectedSvc,
            mockTncPublicSvc,
            mockGlobals
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        component.ngOnInit()
    })

    it('should create an instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should set tncData on ngOnInit if tnc data is available', () => {
        expect(component.tncData).toEqual({ isNewUser: true })
        expect(mockConfigSvc.isNewUser).toBe(true)
        expect(component.isPublic).toBe(false)
    })

    it('should navigate to error page if tnc data is unavailable on ngOnInit', () => {
        component.tncData = null
        mockActivatedRoute.data = of({ tnc: { data: null }, isPublic: false })
        component.ngOnInit()
        expect(mockRouter.navigate).toHaveBeenCalledWith(['error-service-unavailable'])
    })

    it('should update userUrl if query parameter "ref" exists', () => {
        mockActivatedRoute.snapshot.queryParamMap.has = jest.fn().mockReturnValue(true)
        mockActivatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue('test-url')
        component.ngOnInit()
        expect(mockConfigSvc.userUrl).toBe('test-url')
    })

})
