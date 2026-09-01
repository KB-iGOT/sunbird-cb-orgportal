import { TncComponent } from './tnc.component'
import { of, throwError } from 'rxjs'
import { NsTnc } from '../../../../../../../../../src/app/models/tnc.model'


describe('TncComponent', () => {
    let component: TncComponent
    let mockActivatedRoute: any
    let mockRouter: any
    let mockHttpClient: any
    let mockLoggerService: any
    let mockConfigurationsService: any
    let mockTncProtectedService: any
    let mockTncPublicService: any
    let mockGlobals: any

    const mockTncData: NsTnc.ITnc = {
        isAccepted: false,
        isNewUser: true,
        termsAndConditions: [
            {
                name: 'Generic T&C',
                language: 'en',
                version: '1.0',
                content: 'Terms content',
                acceptedDate: new Date(),
                acceptedLanguage: '',
                acceptedVersion: '',
                availableLanguages: [],
                isAccepted: false
            },
            {
                name: 'Data Privacy',
                language: 'en',
                version: '1.0',
                content: 'Privacy content',
                acceptedDate: new Date(),
                acceptedLanguage: '',
                acceptedVersion: '',
                availableLanguages: [],
                isAccepted: false
            }
        ],
        id: function (): unknown {
            throw new Error('Function not implemented.')
        },
        content: function (): unknown {
            throw new Error('Function not implemented.')
        }
    }

    beforeEach(() => {
        // Mock ActivatedRoute
        mockActivatedRoute = {
            data: of({
                tnc: { data: mockTncData },
                isPublic: false
            }),
            snapshot: {
                queryParamMap: {
                    has: jest.fn(),
                    get: jest.fn()
                }
            }
        }

        // Mock Router
        mockRouter = {
            navigate: jest.fn()
        }

        // Mock HttpClient
        mockHttpClient = {
            post: jest.fn(),
            patch: jest.fn()
        }

        // Mock LoggerService
        mockLoggerService = {
            error: jest.fn()
        }

        // Mock ConfigurationsService
        mockConfigurationsService = {
            isNewUser: false,
            userUrl: '',
            hasAcceptedTnc: false,
            pageNavBar: {},
            appSetup: true
        }

        // Mock TncAppResolverService
        mockTncProtectedService = {
            getTnc: jest.fn()
        }

        // Mock TncPublicResolverService
        mockTncPublicService = {
            getPublicTnc: jest.fn()
        }

        // Mock Globals
        mockGlobals = {
            firstTimeSetupDone: false
        }

        component = new TncComponent(
            mockActivatedRoute,
            mockRouter,
            mockHttpClient,
            mockLoggerService,
            mockConfigurationsService,
            mockTncProtectedService,
            mockTncPublicService,
            mockGlobals
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.tncData).toBeNull()
            expect(component.routeSubscription).toBeNull()
            expect(component.isAcceptInProgress).toBeFalsy()
            expect(component.errorInAccepting).toBeFalsy()
            expect(component.isPublic).toBeFalsy()
            expect(component.selectedLocale).toBe('')
            expect(component.checked).toBeFalsy()
            expect(component.expectedUrl).toBe('')
        })
    })

    describe('ngOnInit', () => {
        it('should subscribe to route data and set tncData when data is available', () => {
            component.ngOnInit()

            expect(component.tncData).toEqual(mockTncData)
            expect(mockConfigurationsService.isNewUser).toBe(true)
            expect(component.isPublic).toBe(false)
        })

        it('should navigate to error page when tnc data is not available', () => {
            mockActivatedRoute.data = of({
                tnc: { data: null },
                isPublic: false
            })

            component.ngOnInit()

            expect(mockRouter.navigate).toHaveBeenCalledWith(['error-service-unavailable'])
        })

        it('should set userUrl and expectedUrl when ref query param exists', () => {
            mockActivatedRoute.snapshot.queryParamMap.has.mockReturnValue(true)
            mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue('http://example.com')

            component.ngOnInit()

            expect(mockConfigurationsService.userUrl).toBe('http://example.com')
            expect(component.expectedUrl).toBe('http://example.com')
        })

        it('should set expectedUrl from configSvc.userUrl when available', () => {
            mockConfigurationsService.userUrl = 'http://existing-url.com'

            component.ngOnInit()

            expect(component.expectedUrl).toBe('http://existing-url.com')
        })

        it('should set isPublic from route data', () => {
            mockActivatedRoute.data = of({
                tnc: { data: mockTncData },
                isPublic: true
            })

            component.ngOnInit()

            expect(component.isPublic).toBe(true)
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from routeSubscription when it exists', () => {
            const mockSubscription = {
                unsubscribe: jest.fn()
            }
            //  component.routeSubscription = mockSubscription

            component.ngOnDestroy()

            expect(mockSubscription.unsubscribe).toHaveBeenCalled()
        })

        it('should not throw error when routeSubscription is null', () => {
            component.routeSubscription = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('getTnc', () => {
        beforeEach(() => {
            component.tncData = mockTncData
        })

        it('should call public service when isPublic is true', () => {
            component.isPublic = true
            const mockResponse = { ...mockTncData }
            mockTncPublicService.getPublicTnc.mockReturnValue(of(mockResponse))

            component.getTnc('es')

            expect(mockTncPublicService.getPublicTnc).toHaveBeenCalledWith('es')
        })

        it('should call protected service when isPublic is false', () => {
            component.isPublic = false
            const mockResponse = { ...mockTncData }
            mockTncProtectedService.getTnc.mockReturnValue(of(mockResponse))

            component.getTnc('es')

            expect(mockTncProtectedService.getTnc).toHaveBeenCalledWith('es')
        })

        it('should not make service call when tncData is null', () => {
            component.tncData = null

            component.getTnc('es')

            expect(mockTncPublicService.getPublicTnc).not.toHaveBeenCalled()
            expect(mockTncProtectedService.getTnc).not.toHaveBeenCalled()
        })
    })

    describe('assignTncData', () => {
        it('should assign new data to tncData when tncData exists', () => {
            component.tncData = mockTncData
            const newData = { ...mockTncData, isAccepted: true }

            component['assignTncData'](newData)

            expect(component.tncData).toEqual(newData)
        })

        it('should not assign data when tncData is null', () => {
            component.tncData = null
            const newData = { ...mockTncData, isAccepted: true }

            component['assignTncData'](newData)

            expect(component.tncData).toBeNull()
        })
    })

    describe('getDp', () => {
        beforeEach(() => {
            component.tncData = {
                ...mockTncData,
                termsAndConditions: [
                    {
                        name: 'Generic T&C', language: 'en', version: '1.0', content: 'Generic content',
                        acceptedDate: new Date(),
                        acceptedLanguage: '',
                        acceptedVersion: '',
                        availableLanguages: [],
                        isAccepted: false
                    },
                    {
                        name: 'Data Privacy', language: 'es', version: '1.0', content: 'Privacy content',
                        acceptedDate: new Date(),
                        acceptedLanguage: '',
                        acceptedVersion: '',
                        availableLanguages: [],
                        isAccepted: false
                    }
                ]
            }
        })

        it('should return early when locale matches Data Privacy language', () => {
            component.getDp('es')

            expect(mockTncPublicService.getPublicTnc).not.toHaveBeenCalled()
            expect(mockTncProtectedService.getTnc).not.toHaveBeenCalled()
        })

        it('should call public service when isPublic is true and locale differs', () => {
            component.isPublic = true
            mockTncPublicService.getPublicTnc.mockReturnValue(of(mockTncData))

            component.getDp('fr')

            expect(mockTncPublicService.getPublicTnc).toHaveBeenCalledWith('fr')
        })

        it('should call protected service when isPublic is false and locale differs', () => {
            component.isPublic = false
            mockTncProtectedService.getTnc.mockReturnValue(of(mockTncData))

            component.getDp('fr')

            expect(mockTncProtectedService.getTnc).toHaveBeenCalledWith('fr')
        })

        it('should not make service call when tncData is null', () => {
            component.tncData = null

            component.getDp('fr')

            expect(mockTncPublicService.getPublicTnc).not.toHaveBeenCalled()
            expect(mockTncProtectedService.getTnc).not.toHaveBeenCalled()
        })
    })

    describe('assignDp', () => {
        it('should assign merged data with preserved tncData', () => {
            const tncData: any = { name: 'Generic T&C', language: 'en', version: '1.0', content: 'Generic' }
            const newData: any = {
                ...mockTncData,
                termsAndConditions: [
                    { name: 'Data Privacy', language: 'fr', version: '1.0', content: 'Privacy FR' }
                ]
            }
            component.tncData = mockTncData

            component.assignDp(tncData, newData)

            expect(component.tncData.termsAndConditions[0]).toEqual(tncData)
        })

        it('should not assign data when tncData is null', () => {
            const tncData: any = { name: 'Generic T&C', language: 'en', version: '1.0', content: 'Generic' }
            const newData: any = { ...mockTncData }
            component.tncData = null

            component.assignDp(tncData, newData)

            expect(component.tncData).toBeNull()
        })
    })

    describe('acceptTnc', () => {
        beforeEach(() => {
            component.tncData = mockTncData
        })

        it('should successfully accept TnC with both Generic T&C and Data Privacy', () => {
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc()

            expect(component.isAcceptInProgress).toBe(true)
            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/user/tnc/accept',
                {
                    termsAccepted: [
                        {
                            acceptedLanguage: 'en',
                            docName: 'Generic T&C',
                            version: '1.0'
                        },
                        {
                            acceptedLanguage: 'en',
                            docName: 'Data Privacy',
                            version: '1.0'
                        }
                    ]
                }
            )
        })

        it('should handle successful TnC acceptance and navigate to home', () => {
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc()

            expect(component.tncData?.isAccepted).toBe(true)
            expect(mockConfigurationsService.hasAcceptedTnc).toBe(true)
            expect(mockHttpClient.patch).toHaveBeenCalledWith(
                '/apis/protected/v8/user/tnc/postprocessing',
                {}
            )
            expect(mockRouter.navigate).toHaveBeenCalledWith(['page', 'home'])
        })

        it('should not navigate to home for new users with incomplete setup', () => {
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))
            component.tncData = { ...mockTncData, isNewUser: true }
            mockConfigurationsService.appSetup = true
            mockGlobals.firstTimeSetupDone = false

            component.acceptTnc()

            expect(mockRouter.navigate).not.toHaveBeenCalled()
        })

        it('should handle TnC acceptance error', () => {
            const error = new Error('Network error')
            mockHttpClient.post.mockReturnValue(throwError(error))

            component.acceptTnc()

            expect(mockLoggerService.error).toHaveBeenCalledWith('ERROR ACCEPTING TNC:', error)
            expect(component.errorInAccepting).toBe(true)
            expect(component.isAcceptInProgress).toBe(false)
        })

        it('should handle missing Generic T&C gracefully', () => {
            component.tncData = {
                ...mockTncData,
                termsAndConditions: [
                    {
                        name: 'Data Privacy', language: 'en', version: '1.0', content: 'Privacy',
                        acceptedDate: new Date(),
                        acceptedLanguage: '',
                        acceptedVersion: '',
                        availableLanguages: [],
                        isAccepted: false
                    }
                ]
            }
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc()

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/user/tnc/accept',
                {
                    termsAccepted: [
                        {
                            acceptedLanguage: 'en',
                            docName: 'Data Privacy',
                            version: '1.0'
                        }
                    ]
                }
            )
        })

        it('should handle missing Data Privacy gracefully', () => {
            component.tncData = {
                ...mockTncData,
                termsAndConditions: [
                    {
                        name: 'Generic T&C', language: 'en', version: '1.0', content: 'Generic',
                        acceptedDate: new Date(),
                        acceptedLanguage: '',
                        acceptedVersion: '',
                        availableLanguages: [],
                        isAccepted: false
                    }
                ]
            }
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc()

            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/apis/protected/v8/user/tnc/accept',
                {
                    termsAccepted: [
                        {
                            acceptedLanguage: 'en',
                            docName: 'Generic T&C',
                            version: '1.0'
                        }
                    ]
                }
            )
        })

        it('should set errorInAccepting to false when tncData is null', () => {
            component.tncData = null
            component.errorInAccepting = true

            component.acceptTnc()

            expect(component.errorInAccepting).toBe(false)
            expect(mockHttpClient.post).not.toHaveBeenCalled()
        })
    })

    describe('postProcess', () => {
        it('should call patch endpoint for post processing', () => {
            mockHttpClient.patch.mockReturnValue(of({}))

            component.postProcess()

            expect(mockHttpClient.patch).toHaveBeenCalledWith(
                '/apis/protected/v8/user/tnc/postprocessing',
                {}
            )
        })
    })

    describe('Error Widget Configuration', () => {
        it('should have correct error widget configuration', () => {
            expect(component.errorWidget.widgetType).toBeDefined()
            expect(component.errorWidget.widgetSubType).toBeDefined()
            expect(component.errorWidget.widgetData.errorType).toBe('internalServer')
        })
    })

    describe('Page Navigation Configuration', () => {
        it('should set pageNavbar from configSvc', () => {
            const mockNavBar = { background: 'primary' }
            mockConfigurationsService.pageNavBar = mockNavBar

            const newComponent = new TncComponent(
                mockActivatedRoute,
                mockRouter,
                mockHttpClient,
                mockLoggerService,
                mockConfigurationsService,
                mockTncProtectedService,
                mockTncPublicService,
                mockGlobals
            )

            expect(newComponent.pageNavbar).toEqual(mockNavBar)
        })
    })
})