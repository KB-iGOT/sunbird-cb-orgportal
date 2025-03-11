import { TncComponent } from './tnc.component'
import { Router } from '@angular/router'
import { LoggerService, ConfigurationsService } from '@sunbird-cb/utils'
import { HttpClient } from '@angular/common/http'
import { TncAppResolverService } from '../../services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { of } from 'rxjs'

jest.mock('@angular/router', () => ({
    Router: jest.fn().mockImplementation(() => ({
        navigate: jest.fn(),
        navigateByUrl: jest.fn(),
    })),
    ActivatedRoute: jest.fn().mockImplementation(() => ({
        data: of({ tnc: { data: null }, isPublic: false }),
    })),
}))

jest.mock('@sunbird-cb/utils', () => ({
    LoggerService: jest.fn().mockImplementation(() => ({
        error: jest.fn(),
    })),
    ConfigurationsService: jest.fn().mockImplementation(() => ({
        isNewUser: false,
        hasAcceptedTnc: false,
        appSetup: false,
        userUrl: '',
    })),
}))

jest.mock('@angular/common/http', () => ({
    HttpClient: jest.fn().mockImplementation(() => ({
        post: jest.fn(),
        patch: jest.fn(),
    })),
}))

jest.mock('../../services/tnc-app-resolver.service', () => ({
    TncAppResolverService: jest.fn().mockImplementation(() => ({
        getTnc: jest.fn(),
    })),
}))

jest.mock('../../services/tnc-public-resolver.service', () => ({
    TncPublicResolverService: jest.fn().mockImplementation(() => ({
        getPublicTnc: jest.fn(),
    })),
}))

jest.mock('@angular/material/legacy-dialog', () => ({
    MatLegacyDialog: jest.fn().mockImplementation(() => ({
        open: jest.fn().mockReturnValue({
            afterClosed: jest.fn().mockReturnValue(of(true)), // Mocking the afterClosed observable
        }),
    })),
}))

describe('TncComponent', () => {
    let component: any
    let router: Router
    let loggerSvc: LoggerService
    let configSvc: ConfigurationsService
    let http: HttpClient
    let tncAppResolverService: TncAppResolverService
    let tncPublicResolverService: TncPublicResolverService
    let matDialog: MatDialog

    beforeEach(() => {
        router = new Router()
        loggerSvc = new LoggerService(null as any)
        configSvc = new ConfigurationsService()
        http = new HttpClient(null as any)
        tncAppResolverService = new TncAppResolverService(null as any, null as any)
        tncPublicResolverService = new TncPublicResolverService(null as any)
        matDialog = new MatDialog(null as any, null as any, null as any, null as any, null as any, null as any, null as any)

        component = new TncComponent(
            {
                data: of({ tnc: { data: null }, isPublic: false }),
            } as any,
            router,
            http,
            loggerSvc,
            configSvc,
            tncAppResolverService,
            tncPublicResolverService,
            matDialog
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should call acceptTnc and handle success', () => {
        const mockResponse = { status: 200 }
        const postSpy = jest.spyOn(http, 'post').mockReturnValue(of(mockResponse))
        // const dialogOpenSpy = jest.spyOn(matDialog, 'open')

        component.tncData = {
            termsAndConditions: [
                {
                    name: 'Generic T&C',
                    language: 'en',
                    version: '1.0',
                    acceptedDate: new Date(),
                    acceptedLanguage: 'en',
                    acceptedVersion: '1.0',
                    availableLanguages: [],
                    content: 'Terms and Conditions content',
                    isAccepted: false,  // Ensure this is included
                },
                {
                    name: 'Data Privacy',
                    language: 'en',
                    version: '1.0',
                    acceptedDate: new Date(),
                    acceptedLanguage: 'en',
                    acceptedVersion: '1.0',
                    availableLanguages: [],
                    content: 'Data Privacy content',
                    isAccepted: false,  // Ensure this is included
                },
            ],
        }

        component.acceptTnc({} as any)
        expect(postSpy).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', expect.any(Object))
        expect(router.navigate).toHaveBeenCalledWith(['page', 'home'])
    })
})
