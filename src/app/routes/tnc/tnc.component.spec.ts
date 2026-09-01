import { TncComponent } from './tnc.component'
import { of, throwError } from 'rxjs'

// Mock interfaces and types
interface MockTncData {
    isNewUser: boolean
    termsAndConditions: Array<{
        name: string
        language: string
        version: string
    }>
}

interface MockActivatedRoute {
    data: {
        subscribe: jest.Mock
    }
}

interface MockRouter {
    navigate: jest.Mock
    navigateByUrl: jest.Mock
}

interface MockHttpClient {
    post: jest.Mock
    patch: jest.Mock
}

interface MockLoggerService {
    error: jest.Mock
}

interface MockConfigurationsService {
    isNewUser: boolean
    hasAcceptedTnc: boolean
    userUrl: string
    appSetup: boolean
}

interface MockTncAppResolverService {
    getTnc: jest.Mock
}

interface MockTncPublicResolverService {
    getPublicTnc: jest.Mock
}

interface MockMatDialog {
    open: jest.Mock
}

interface MockDialogRef {
    afterClosed: jest.Mock
}

describe('TncComponent', () => {
    let component: TncComponent
    let mockActivatedRoute: MockActivatedRoute
    let mockRouter: MockRouter
    let mockHttpClient: MockHttpClient
    let mockLoggerSvc: MockLoggerService
    let mockConfigSvc: MockConfigurationsService
    let mockTncProtectedSvc: MockTncAppResolverService
    let mockTncPublicSvc: MockTncPublicResolverService
    let mockMatDialog: MockMatDialog

    const mockTncData: MockTncData = {
        isNewUser: true,
        termsAndConditions: [
            {
                name: 'Generic T&C',
                language: 'en',
                version: '1.0'
            },
            {
                name: 'Data Privacy',
                language: 'en',
                version: '1.0'
            }
        ]
    }

    beforeEach(() => {
        // Create mocks
        mockActivatedRoute = {
            data: {
                subscribe: jest.fn()
            }
        }

        mockRouter = {
            navigate: jest.fn(),
            navigateByUrl: jest.fn()
        }

        mockHttpClient = {
            post: jest.fn(),
            patch: jest.fn()
        }

        mockLoggerSvc = {
            error: jest.fn()
        }

        mockConfigSvc = {
            isNewUser: false,
            hasAcceptedTnc: false,
            userUrl: '',
            appSetup: true
        }

        mockTncProtectedSvc = {
            getTnc: jest.fn()
        }

        mockTncPublicSvc = {
            getPublicTnc: jest.fn()
        }

        mockMatDialog = {
            open: jest.fn()
        }

        // Create component instance
        component = new TncComponent(
            mockActivatedRoute as any,
            mockRouter as any,
            mockHttpClient as any,
            mockLoggerSvc as any,
            mockConfigSvc as any,
            mockTncProtectedSvc as any,
            mockTncPublicSvc as any,
            mockMatDialog as any
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('ngOnInit', () => {
        it('should subscribe to route data and set tncData when data is available', () => {
            const mockResponse = {
                tnc: { data: mockTncData },
                isPublic: false
            }

            mockActivatedRoute.data.subscribe.mockImplementation((callback: Function) => {
                callback(mockResponse)
                return { unsubscribe: jest.fn() }
            })

            component.ngOnInit()

            expect(mockActivatedRoute.data.subscribe).toHaveBeenCalled()
            expect(component.tncData).toEqual(mockTncData)
            expect(mockConfigSvc.isNewUser).toBe(true)
            expect(component.isPublic).toBe(false)
        })

        it('should set isPublic to true when response.isPublic is true', () => {
            const mockResponse = {
                tnc: { data: mockTncData },
                isPublic: true
            }

            mockActivatedRoute.data.subscribe.mockImplementation((callback: Function) => {
                callback(mockResponse)
                return { unsubscribe: jest.fn() }
            })

            component.ngOnInit()

            expect(component.isPublic).toBe(true)
        })

        it('should navigate to error page when no data is available', () => {
            const mockResponse = {
                tnc: {},
                isPublic: false
            }

            mockActivatedRoute.data.subscribe.mockImplementation((callback: Function) => {
                callback(mockResponse)
                return { unsubscribe: jest.fn() }
            })

            component.ngOnInit()

            expect(mockRouter.navigate).toHaveBeenCalledWith(['error-service-unavailable'])
        })

        it('should set configSvc.isNewUser to false when tncData.isNewUser is false', () => {
            const mockResponse = {
                tnc: { data: { ...mockTncData, isNewUser: false } },
                isPublic: false
            }

            mockActivatedRoute.data.subscribe.mockImplementation((callback: Function) => {
                callback(mockResponse)
                return { unsubscribe: jest.fn() }
            })

            component.ngOnInit()

            expect(mockConfigSvc.isNewUser).toBe(false)
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from routeSubscription if it exists', () => {
            const mockUnsubscribe = jest.fn()
            component.routeSubscription = { unsubscribe: mockUnsubscribe } as any

            component.ngOnDestroy()

            expect(mockUnsubscribe).toHaveBeenCalled()
        })

        it('should not throw error if routeSubscription is null', () => {
            component.routeSubscription = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('getTnc', () => {
        beforeEach(() => {
            component.tncData = mockTncData as any
        })

        it('should return early if locale matches current Generic T&C language', () => {
            component.getTnc('en')

            expect(mockTncProtectedSvc.getTnc).not.toHaveBeenCalled()
            expect(mockTncPublicSvc.getPublicTnc).not.toHaveBeenCalled()
        })

        it('should call tncPublicSvc when isPublic is true and locale is different', () => {
            component.isPublic = true
            const mockNewTncData = { termsAndConditions: [{}, {}] }
            mockTncPublicSvc.getPublicTnc.mockReturnValue(of(mockNewTncData))

            component.getTnc('fr')

            expect(mockTncPublicSvc.getPublicTnc).toHaveBeenCalledWith('fr')
        })

        it('should call tncProtectedSvc when isPublic is false and locale is different', () => {
            component.isPublic = false
            const mockNewTncData = { termsAndConditions: [{}, {}] }
            mockTncProtectedSvc.getTnc.mockReturnValue(of(mockNewTncData))

            component.getTnc('fr')

            expect(mockTncProtectedSvc.getTnc).toHaveBeenCalledWith('fr')
        })

        it('should not make any calls if tncData is null', () => {
            component.tncData = null

            component.getTnc('fr')

            expect(mockTncProtectedSvc.getTnc).not.toHaveBeenCalled()
            expect(mockTncPublicSvc.getPublicTnc).not.toHaveBeenCalled()
        })
    })

    describe('assignTncData', () => {
        it('should assign data correctly when tncData exists', () => {
            const dpData = { name: 'Data Privacy', language: 'en', version: '1.0' }
            const newData = {
                termsAndConditions: [
                    { name: 'Generic T&C', language: 'fr', version: '1.1' },
                    {}
                ]
            }
            component.tncData = mockTncData as any

            component['assignTncData'](dpData as any, newData as any)

            expect(newData.termsAndConditions[1]).toEqual(dpData)
            expect(component.tncData).toEqual(newData)
        })

        it('should not assign data when tncData is null', () => {
            const dpData = { name: 'Data Privacy', language: 'en', version: '1.0' }
            const newData = { termsAndConditions: [{}, {}] }
            component.tncData = null

            component['assignTncData'](dpData as any, newData as any)

            expect(component.tncData).toBeNull()
        })
    })

    describe('getDp', () => {
        beforeEach(() => {
            component.tncData = mockTncData as any
        })

        it('should return early if locale matches current Data Privacy language', () => {
            component.getDp('en')

            expect(mockTncProtectedSvc.getTnc).not.toHaveBeenCalled()
            expect(mockTncPublicSvc.getPublicTnc).not.toHaveBeenCalled()
        })

        it('should call tncPublicSvc when isPublic is true and locale is different', () => {
            component.isPublic = true
            const mockNewTncData = { termsAndConditions: [{}, {}] }
            mockTncPublicSvc.getPublicTnc.mockReturnValue(of(mockNewTncData))

            component.getDp('fr')

            expect(mockTncPublicSvc.getPublicTnc).toHaveBeenCalledWith('fr')
        })

        it('should call tncProtectedSvc when isPublic is false and locale is different', () => {
            component.isPublic = false
            const mockNewTncData = { termsAndConditions: [{}, {}] }
            mockTncProtectedSvc.getTnc.mockReturnValue(of(mockNewTncData))

            component.getDp('fr')

            expect(mockTncProtectedSvc.getTnc).toHaveBeenCalledWith('fr')
        })

        it('should not make any calls if tncData is null', () => {
            component.tncData = null

            component.getDp('fr')

            expect(mockTncProtectedSvc.getTnc).not.toHaveBeenCalled()
            expect(mockTncPublicSvc.getPublicTnc).not.toHaveBeenCalled()
        })
    })

    describe('assignDp', () => {
        it('should assign data correctly when tncData exists', () => {
            const tncData = { name: 'Generic T&C', language: 'en', version: '1.0' }
            const newData = {
                termsAndConditions: [
                    {},
                    { name: 'Data Privacy', language: 'fr', version: '1.1' }
                ]
            }
            component.tncData = mockTncData as any

            component.assignDp(tncData as any, newData as any)

            expect(newData.termsAndConditions[0]).toEqual(tncData)
            expect(component.tncData).toEqual(newData)
        })

        it('should not assign data when tncData is null', () => {
            const tncData = { name: 'Generic T&C', language: 'en', version: '1.0' }
            const newData = { termsAndConditions: [{}, {}] }
            component.tncData = null

            component.assignDp(tncData as any, newData as any)

            expect(component.tncData).toBeNull()
        })
    })

    describe('acceptTnc', () => {
        const mockTemplate = {}

        beforeEach(() => {
            component.tncData = mockTncData as any
        })

        it('should successfully accept TNC and navigate to setup for new user', () => {
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))
            mockConfigSvc.appSetup = true

            component.acceptTnc(mockTemplate)

            expect(component.isAcceptInProgress).toBe(true)
            expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', {
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
            })
            expect(mockConfigSvc.hasAcceptedTnc).toBe(true)
            expect(mockHttpClient.patch).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/postprocessing', {})
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'setup'])
        })

        it('should successfully accept TNC and show dialog when userUrl exists', () => {
            const mockDialogRef: MockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of(true))
            }
            mockConfigSvc.isNewUser = false
            mockConfigSvc.userUrl = '/some-url'
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))
            mockMatDialog.open.mockReturnValue(mockDialogRef)

            component.acceptTnc(mockTemplate)

            expect(mockMatDialog.open).toHaveBeenCalledWith(mockTemplate, {
                width: '400px',
                backdropClass: 'backdropBackground'
            })
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/some-url')
            expect(mockConfigSvc.userUrl).toBe('')
        })

        it('should navigate to home when dialog is closed with false value', () => {
            const mockDialogRef: MockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of(false))
            }
            mockConfigSvc.isNewUser = false
            mockConfigSvc.userUrl = '/some-url'
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))
            mockMatDialog.open.mockReturnValue(mockDialogRef)

            component.acceptTnc(mockTemplate)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['page', 'home'])
            expect(mockConfigSvc.userUrl).toBe('')
        })

        it('should navigate to home directly when no userUrl and not new user', () => {
            mockConfigSvc.isNewUser = false
            mockConfigSvc.userUrl = ''
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc(mockTemplate)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['page', 'home'])
            expect(mockMatDialog.open).not.toHaveBeenCalled()
        })

        it('should handle error when accepting TNC fails', () => {
            const mockError = new Error('Accept failed')
            mockHttpClient.post.mockReturnValue(throwError(mockError))

            component.acceptTnc(mockTemplate)

            expect(component.errorInAccepting).toBe(true)
            expect(component.isAcceptInProgress).toBe(false)
            expect(mockLoggerSvc.error).toHaveBeenCalledWith('ERROR ACCEPTING TNC:', mockError)
        })

        it('should accept TNC with only Generic T&C when Data Privacy is not available', () => {
            component.tncData = {
                isNewUser: false,
                termsAndConditions: [
                    {
                        name: 'Generic T&C',
                        language: 'en',
                        version: '1.0'
                    }
                ]
            } as any
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc(mockTemplate)

            expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', {
                termsAccepted: [
                    {
                        acceptedLanguage: 'en',
                        docName: 'Generic T&C',
                        version: '1.0'
                    }
                ]
            })
        })

        it('should accept TNC with only Data Privacy when Generic T&C is not available', () => {
            component.tncData = {
                isNewUser: false,
                termsAndConditions: [
                    {
                        name: 'Data Privacy',
                        language: 'en',
                        version: '1.0'
                    }
                ]
            } as any
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc(mockTemplate)

            expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', {
                termsAccepted: [
                    {
                        acceptedLanguage: 'en',
                        docName: 'Data Privacy',
                        version: '1.0'
                    }
                ]
            })
        })

        it('should set errorInAccepting to false when tncData is null', () => {
            component.tncData = null

            component.acceptTnc(mockTemplate)

            expect(component.errorInAccepting).toBe(false)
            expect(mockHttpClient.post).not.toHaveBeenCalled()
        })

        it('should not navigate to setup when appSetup is false even for new user', () => {
            mockConfigSvc.appSetup = false
            mockConfigSvc.userUrl = ''
            mockHttpClient.post.mockReturnValue(of({}))
            mockHttpClient.patch.mockReturnValue(of({}))

            component.acceptTnc(mockTemplate)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['page', 'home'])
        })
    })

    describe('postProcess', () => {
        it('should call patch endpoint for post processing', () => {
            mockHttpClient.patch.mockReturnValue(of({}))

            component.postProcess()

            expect(mockHttpClient.patch).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/postprocessing', {})
        })
    })

    describe('Component initialization', () => {
        it('should initialize with correct default values', () => {
            const newComponent = new TncComponent(
                mockActivatedRoute as any,
                mockRouter as any,
                mockHttpClient as any,
                mockLoggerSvc as any,
                mockConfigSvc as any,
                mockTncProtectedSvc as any,
                mockTncPublicSvc as any,
                mockMatDialog as any
            )

            expect(newComponent.tncData).toBeNull()
            expect(newComponent.routeSubscription).toBeNull()
            expect(newComponent.isAcceptInProgress).toBe(false)
            expect(newComponent.errorInAccepting).toBe(false)
            expect(newComponent.isPublic).toBe(false)
            expect(newComponent.errorWidget).toBeDefined()
            expect(newComponent.errorWidget.widgetData.errorType).toBe('internalServer')
        })
    })
})