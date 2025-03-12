import { HomeComponent } from './home.component'
import { Subject } from 'rxjs'
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router'
import { ConfigurationsService, EventService, ValueService } from '@sunbird-cb/utils'
import { LeftMenuService } from '@sunbird-cb/collection'
import * as _ from 'lodash'

describe('HomeComponent', () => {
    let component: HomeComponent
    let mockValueService: Partial<ValueService>
    let mockRouter: Partial<Router>
    let mockActivatedRoute: any
    let mockConfigService: Partial<ConfigurationsService>
    let mockLeftMenuService: Partial<LeftMenuService>
    let mockEventService: Partial<EventService>
    let routerEventsSubject: Subject<NavigationEnd>
    let isLtMediumSubject: Subject<boolean>
    let leftMenuSubject: Subject<any>

    beforeEach(() => {
        // Setup subjects for observables
        routerEventsSubject = new Subject<NavigationEnd>()
        isLtMediumSubject = new Subject<boolean>()
        leftMenuSubject = new Subject<any>()

        // Mock ValueService
        mockValueService = {
            isLtMedium$: isLtMediumSubject.asObservable(),
        }

        // Mock Router
        mockRouter = {
            events: routerEventsSubject.asObservable(),
        }

        // Mock ActivatedRoute with snapshot data
        mockActivatedRoute = {
            snapshot: {
                data: {
                    configService: {
                        userRoles: new Set(['content-creator', 'admin']),
                        unMappedUser: {
                            rootOrgId: 'org123',
                            rootOrg: {
                                orgName: 'Test Department'
                            }
                        }
                    },
                    pageData: {
                        data: {
                            menus: {
                                widgetData: {
                                    logo: false,
                                    name: '',
                                    userRoles: new Set()
                                }
                            }
                        }
                    },
                    _routerState: {
                        url: '/app/home/dashboard'
                    }
                }
            }
        }

        // Mock ConfigService
        mockConfigService = {
            userProfile: {
                departmentName: '',
                userId: ''
            }
        }

        // Mock LeftMenuService
        mockLeftMenuService = {
            onMessage: jest.fn().mockReturnValue(leftMenuSubject.asObservable())
        }

        // Mock EventService
        mockEventService = {
            raiseInteractTelemetry: jest.fn()
        }

        // Create component instance
        component = new HomeComponent(
            mockValueService as ValueService,
            mockRouter as Router,
            mockActivatedRoute as ActivatedRoute,
            mockConfigService as ConfigurationsService,
            mockLeftMenuService as LeftMenuService,
            mockEventService as EventService
        )

        // Spy on methods
        jest.spyOn(component, 'raiseTelemetry')
        jest.spyOn(component, 'bindUrl')

        // Initialize component
        component.ngOnInit()
    })

    afterEach(() => {
        component.ngOnDestroy()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize with correct default values', () => {
        expect(component.sideNavBarOpened).toBe(true)
        expect(component.panelOpenState).toBe(false)
        expect(component.sticky).toBe(false)
        expect(component.currentRoute).toBe('home')
        expect(component.titles).toEqual([{ title: 'NETWORK', url: '/app/network-v2', icon: 'group' }])
    })

    it('should toggle sideNavBarOpened based on screen size', () => {
        // Simulate medium screen size
        isLtMediumSubject.next(true)
        expect(component.sideNavBarOpened).toBe(false)
        expect(component.screenSizeIsLtMedium).toBe(true)

        // Simulate large screen size
        isLtMediumSubject.next(false)
        expect(component.sideNavBarOpened).toBe(true)
        expect(component.screenSizeIsLtMedium).toBe(false)
    })

    it('should handle navigation end events', () => {
        const navigationEndEvent = new NavigationEnd(1, '/app/home/dashboard', '/app/home/dashboard')
        routerEventsSubject.next(navigationEndEvent)

        expect(component.bindUrl).toHaveBeenCalledWith('dashboard')
        expect(component.currentRoute).toBe('dashboard')
        expect(component.departmentName).toBe('Test Department')
        expect(component.widgetData).toBeDefined()
        expect(component.widgetData.widgetData.name).toBe('Test Department')
    })

    it('should handle navigation end events with odcs-mapping in URL', () => {
        // Mock the document.getElementsByTagName
        const mockAddClassList = jest.fn()
        const mockRemoveClassList = jest.fn()
        const mockBodyElement = {
            classList: {
                add: mockAddClassList,
                remove: mockRemoveClassList
            }
        }
        document.getElementsByTagName = jest.fn().mockReturnValue([mockBodyElement])

        // Override the _routerState.url for this test
        _.set(mockActivatedRoute, 'snapshot._routerState.url', '/app/home/odcs-mapping')

        const navigationEndEvent = new NavigationEnd(1, '/app/home/odcs-mapping', '/app/home/odcs-mapping')
        routerEventsSubject.next(navigationEndEvent)

        expect(component.containerCustomCls).toBe(true)
        expect(mockAddClassList).toHaveBeenCalledWith('custom-height-odcs')
    })

    it('should handle scroll events', () => {
        // Mock elementPosition
        component.elementPosition = 100

        // Simulate scroll below elementPosition
        Object.defineProperty(window, 'pageYOffset', { value: 150, writable: true })
        component.handleScroll()
        expect(component.sticky).toBe(true)

        // Simulate scroll above elementPosition
        Object.defineProperty(window, 'pageYOffset', { value: 50, writable: true })
        component.handleScroll()
        expect(component.sticky).toBe(false)
    })

    it('should raise telemetry when menu item is clicked', () => {
        const menuItem = { text: { name: 'Dashboard' } }
        leftMenuSubject.next(menuItem)

        expect(component.raiseTelemetry).toHaveBeenCalledWith('Dashboard')
        expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
            {
                type: 'click',
                subType: 'side-nav',
                id: 'dashboard-menu',
            },
            {}
        )
    })

    it('should update department name in user profile', () => {
        const navigationEndEvent = new NavigationEnd(1, '/app/home/dashboard', '/app/home/dashboard')
        routerEventsSubject.next(navigationEndEvent)

        expect(mockConfigService.userProfile?.departmentName).toBe('Test Department')
    })

    it('should clean up subscriptions on destroy', () => {
        // Create spies for subscription unsubscribe methods
        const unsubscribeSpy = jest.fn()
        component['defaultSideNavBarOpenedSubscription'] = { unsubscribe: unsubscribeSpy }
        component['bannerSubscription'] = { unsubscribe: unsubscribeSpy }

        component.ngOnDestroy()

        expect(unsubscribeSpy).toHaveBeenCalledTimes(2)
    })

    it('should bind url correctly', () => {
        component.bindUrl('profile')
        expect(component.currentRoute).toBe('profile')

        component.bindUrl('')
        expect(component.currentRoute).toBe('profile') // Should remain unchanged for empty paths
    })
})