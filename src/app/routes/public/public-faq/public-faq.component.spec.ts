
import { ActivatedRoute, ParamMap } from '@angular/router'
import { ValueService, ConfigurationsService, EFeatures } from '@sunbird-cb/utils-v2'
import { PublicFaqComponent } from './public-faq.component'
import { Subject, BehaviorSubject } from 'rxjs'

describe('PublicFaqComponent', () => {
    let component: PublicFaqComponent
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>
    let mockValueService: jest.Mocked<ValueService>
    let mockConfigurationsService: jest.Mocked<ConfigurationsService>
    let mockParamMap: jest.Mocked<ParamMap>
    let isLtMediumSubject: BehaviorSubject<boolean>
    let paramMapSubject: Subject<ParamMap>

    beforeEach(() => {
        // Create mock ParamMap
        mockParamMap = {
            get: jest.fn(),
            getAll: jest.fn(),
            has: jest.fn(),
            keys: []
        } as jest.Mocked<ParamMap>

        // Create subjects for observables
        isLtMediumSubject = new BehaviorSubject<boolean>(false)
        paramMapSubject = new Subject<ParamMap>()

        // Create mock services
        mockActivatedRoute = {
            paramMap: paramMapSubject.asObservable()
        } as jest.Mocked<ActivatedRoute>

        mockValueService = {
            isLtMedium$: isLtMediumSubject.asObservable()
        } as jest.Mocked<ValueService>

        mockConfigurationsService = {
            pageNavBar: { background: 'primary' },
            restrictedFeatures: null
        } as unknown as jest.Mocked<ConfigurationsService>

        // Create component instance
        component = new PublicFaqComponent(
            mockActivatedRoute,
            mockValueService,
            mockConfigurationsService
        )
    })

    afterEach(() => {
        // Clean up subscriptions
        if (component.ngOnDestroy) {
            component.ngOnDestroy()
        }
        isLtMediumSubject.complete()
        paramMapSubject.complete()
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeTruthy()
            expect(component.errorMessageCode).toBe('NONE')
            expect(component.sideNavBarOpened).toBe(true)
            expect(component.isFaqFeature).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)
            expect(component.currentTab).toBe('')
            expect(component.tabs).toEqual([
                'login',
                'odcAccess',
                'compatibility',
                'installation',
                'progressCompletion',
                'video',
                'post-learn',
                'authoring',
            ])
        })

        it('should set pageNavbar from configSvc', () => {
            expect(component.pageNavbar).toEqual({ background: 'primary' })
        })

        it('should create mode$ observable that maps isLtMedium to mode', (done) => {
            // Test when isLtMedium is false
            component.mode$.subscribe(mode => {
                expect(mode).toBe('side')

                // Test when isLtMedium is true
                isLtMediumSubject.next(true)
                component.mode$.subscribe(mode2 => {
                    expect(mode2).toBe('over')
                    done()
                })
            })
        })
    })

    describe('ngOnInit', () => {
        it('should set isFaqFeature to true when restrictedFeatures is null', () => {
            mockConfigurationsService.restrictedFeatures = null

            component.ngOnInit()

            expect(component.isFaqFeature).toBe(true)
        })

        it('should set isFaqFeature to true when FAQ feature is not restricted', () => {
            const mockRestrictedFeatures: any = new Set()
            mockConfigurationsService.restrictedFeatures = mockRestrictedFeatures

            component.ngOnInit()

            expect(component.isFaqFeature).toBe(true)
        })

        it('should set isFaqFeature to false when FAQ feature is restricted', () => {
            const mockRestrictedFeatures = new Set([EFeatures.FAQ])
            mockConfigurationsService.restrictedFeatures = mockRestrictedFeatures

            component.ngOnInit()

            expect(component.isFaqFeature).toBe(false)
        })

        it('should subscribe to isLtMedium$ and set sideNavBarOpened and screenSizeIsLtMedium', () => {
            component.ngOnInit()

            // Test with large screen
            isLtMediumSubject.next(false)
            expect(component.sideNavBarOpened).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)

            // Test with small screen
            isLtMediumSubject.next(true)
            expect(component.sideNavBarOpened).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(true)
        })

        it('should subscribe to route paramMap and set currentTab', () => {
            mockParamMap.get.mockReturnValue('login')

            component.ngOnInit()
            paramMapSubject.next(mockParamMap)

            expect(mockParamMap.get).toHaveBeenCalledWith('tab')
            expect(component.currentTab).toBe('login')
        })

        it('should set currentTab to "login" when tab parameter is invalid', () => {
            mockParamMap.get.mockReturnValue('invalidTab')

            component.ngOnInit()
            paramMapSubject.next(mockParamMap)

            expect(component.currentTab).toBe('login')
        })

        it('should not set currentTab when tab parameter is null', () => {
            mockParamMap.get.mockReturnValue(null)

            component.ngOnInit()
            paramMapSubject.next(mockParamMap)

            expect(component.currentTab).toBe('')
        })

        it('should handle valid tab parameters', () => {
            const validTabs = ['login', 'odcAccess', 'compatibility', 'installation', 'progressCompletion', 'video', 'post-learn', 'authoring']

            component.ngOnInit()

            validTabs.forEach(tab => {
                mockParamMap.get.mockReturnValue(tab)
                paramMapSubject.next(mockParamMap)
                expect(component.currentTab).toBe(tab)
            })
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from defaultSideNavBarOpenedSubscription when it exists', () => {
            component.ngOnInit()

            const subscription = component['defaultSideNavBarOpenedSubscription']
            const unsubscribeSpy = jest.spyOn(subscription!, 'unsubscribe')

            component.ngOnDestroy()

            expect(unsubscribeSpy).toHaveBeenCalled()
        })

        it('should not throw error when defaultSideNavBarOpenedSubscription is null', () => {
            component['defaultSideNavBarOpenedSubscription'] = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })

        it('should unsubscribe from paramSubscription when it exists', () => {
            component.ngOnInit()

            const subscription = component['paramSubscription']
            const unsubscribeSpy = jest.spyOn(subscription!, 'unsubscribe')

            component.ngOnDestroy()

            expect(unsubscribeSpy).toHaveBeenCalled()
        })
    })

    describe('sideNavOnClick', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should toggle sideNavBarOpened when screenSizeIsLtMedium is true', () => {
            component.screenSizeIsLtMedium = true
            component.sideNavBarOpened = true

            component.sideNavOnClick()

            expect(component.sideNavBarOpened).toBe(false)

            component.sideNavOnClick()

            expect(component.sideNavBarOpened).toBe(true)
        })

        it('should not toggle sideNavBarOpened when screenSizeIsLtMedium is false', () => {
            component.screenSizeIsLtMedium = false
            component.sideNavBarOpened = true

            component.sideNavOnClick()

            expect(component.sideNavBarOpened).toBe(true)
        })
    })

    describe('Observable Properties', () => {
        it('should have isLtMedium$ observable from ValueService', () => {
            expect(component.isLtMedium$).toBe(mockValueService.isLtMedium$)
        })

        it('should create mode$ observable that emits correct values', (done) => {
            let emissionCount = 0
            const expectedValues = ['side', 'over']

            component.mode$.subscribe(mode => {
                expect(mode).toBe(expectedValues[emissionCount])
                emissionCount++

                if (emissionCount === 1) {
                    // Trigger second emission
                    isLtMediumSubject.next(true)
                } else if (emissionCount === 2) {
                    done()
                }
            })

            // Trigger first emission
            isLtMediumSubject.next(false)
        })
    })

    describe('Component Properties', () => {
        it('should have correct tabs array', () => {
            const expectedTabs = [
                'login',
                'odcAccess',
                'compatibility',
                'installation',
                'progressCompletion',
                'video',
                'post-learn',
                'authoring',
            ]

            expect(component.tabs).toEqual(expectedTabs)
            expect(component.tabs).toHaveLength(8)
        })

        it('should have correct error message code type', () => {
            const validErrorCodes: Array<'API_FAILURE' | 'NO_DATA' | 'INVALID_DATA' | 'NONE'> = [
                'API_FAILURE',
                'NO_DATA',
                'INVALID_DATA',
                'NONE'
            ]

            validErrorCodes.forEach(code => {
                component.errorMessageCode = code
                expect(component.errorMessageCode).toBe(code)
            })
        })
    })

    describe('Integration Tests', () => {
        it('should handle complete lifecycle with screen size changes and route changes', () => {
            // Initialize component
            component.ngOnInit()

            // Simulate small screen
            isLtMediumSubject.next(true)
            expect(component.sideNavBarOpened).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(true)

            // Simulate route change to valid tab
            mockParamMap.get.mockReturnValue('video')
            paramMapSubject.next(mockParamMap)
            expect(component.currentTab).toBe('video')

            // Simulate side nav click on small screen
            component.sideNavOnClick()
            expect(component.sideNavBarOpened).toBe(true)

            // Simulate large screen
            isLtMediumSubject.next(false)
            expect(component.sideNavBarOpened).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)

            // Simulate side nav click on large screen (should not toggle)
            const previousState = component.sideNavBarOpened
            component.sideNavOnClick()
            expect(component.sideNavBarOpened).toBe(previousState)

            // Clean up
            component.ngOnDestroy()
        })
    })
})