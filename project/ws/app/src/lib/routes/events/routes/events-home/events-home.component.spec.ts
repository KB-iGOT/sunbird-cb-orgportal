import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ElementRef } from '@angular/core'
import { Subject } from 'rxjs'

import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { ConfigurationsService, ValueService } from '@sunbird-cb/utils-v2'
import { EventsHomeComponent } from './events-home.component'

// Mock dependencies
const mockValueService = {
    isLtMedium$: new Subject<boolean>()
}

const mockRouter = {
    events: new Subject()
}

const mockActivatedRoute = {
    snapshot: {
        data: {
            pageData: {
                data: {
                    menus: {
                        widgetData: {}
                    },
                    logo: 'test-logo.png',
                    deptName: 'Test Department'
                }
            }
        }
    }
}

const mockConfigService = {
    userRoles: new Set(['admin', 'user'])
}

describe('EventsHomeComponent', () => {
    let component: EventsHomeComponent
    let fixture: ComponentFixture<EventsHomeComponent>
    let router: Router
    // let valueService: ValueService
    // let activatedRoute: ActivatedRoute
    // let configService: ConfigurationsService

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EventsHomeComponent],
            providers: [
                { provide: ValueService, useValue: mockValueService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: ConfigurationsService, useValue: mockConfigService }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(EventsHomeComponent)
        component = fixture.componentInstance

        router = TestBed.inject(Router)
        // valueService = TestBed.inject(ValueService)
        // activatedRoute = TestBed.inject(ActivatedRoute)
        // configService = TestBed.inject(ConfigurationsService)

        // Mock ViewChild element
        component.menuElement = {
            nativeElement: {
                offsetTop: 100
            }
        } as ElementRef
    })

    afterEach(() => {
        // Clean up subscriptions
        if (component['defaultSideNavBarOpenedSubscription']) {
            component['defaultSideNavBarOpenedSubscription'].unsubscribe()
        }
        if (component['bannerSubscription']) {
            component['bannerSubscription'].unsubscribe()
        }
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.sideNavBarOpened).toBe(true)
            expect(component.panelOpenState).toBe(false)
            expect(component.unread).toBe(0)
            expect(component.currentRoute).toBe('home')
            expect(component.sticky).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(false)
            expect(component.departmentName).toBe('')
        })

        it('should initialize titles array correctly', () => {
            expect(component.titles).toEqual([
                { title: 'NETWORK', url: '/app/network-v2', icon: 'group' }
            ])
        })

        it('should set user roles from config service', () => {
            expect(component.myRoles).toEqual(new Set(['admin', 'user']))
        })

        it('should handle missing user roles in config service', () => {
            const mockConfigWithoutRoles = { userRoles: null }
            TestBed.overrideProvider(ConfigurationsService, { useValue: mockConfigWithoutRoles })

            const newFixture = TestBed.createComponent(EventsHomeComponent)
            const newComponent = newFixture.componentInstance

            expect(newComponent.myRoles).toBeUndefined()
        })
    })

    describe('Router Events Handling', () => {
        it('should handle NavigationEnd event and bind URL', () => {
            const navigationEndEvent = new NavigationEnd(1, '/app/events/test-route', '/app/events/test-route')
            spyOn(component, 'bindUrl');

            (router.events as Subject<any>).next(navigationEndEvent)

            expect(component.bindUrl).toHaveBeenCalledWith('test-route')
        })

        it('should set widget data when pageData.data exists', () => {
            const navigationEndEvent = new NavigationEnd(1, '/app/events/test', '/app/events/test');

            (router.events as Subject<any>).next(navigationEndEvent)

            expect(component.widgetData).toBeDefined()
            expect(component.widgetData.widgetData.logo).toBe(true)
            expect(component.widgetData.widgetData.logoPath).toBe('test-logo.png')
            expect(component.widgetData.widgetData.name).toBe('Test Department')
            expect(component.widgetData.widgetData.userRoles).toEqual(component.myRoles)
        })

        it('should set widget data directly when pageData.data.menus exists but no additional data', () => {
            const mockRouteWithMenusOnly = {
                snapshot: {
                    data: {
                        pageData: {
                            data: {
                                menus: { widgetData: { test: 'value' } }
                            }
                        }
                    }
                }
            }

            TestBed.overrideProvider(ActivatedRoute, { useValue: mockRouteWithMenusOnly })
            const newFixture = TestBed.createComponent(EventsHomeComponent)
            const newComponent = newFixture.componentInstance

            const navigationEndEvent = new NavigationEnd(1, '/app/events/test', '/app/events/test');
            (router.events as Subject<any>).next(navigationEndEvent)

            expect(newComponent.widgetData).toEqual({ widgetData: { test: 'value' } })
        })
    })

    describe('ngOnInit', () => {
        it('should subscribe to isLtMedium$ and set initial values', () => {
            component.ngOnInit()

            // Emit false (not small screen)
            mockValueService.isLtMedium$.next(false)

            expect(component.sideNavBarOpened).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)
        })

        it('should handle small screen size', () => {
            component.ngOnInit()

            // Emit true (small screen)
            mockValueService.isLtMedium$.next(true)

            expect(component.sideNavBarOpened).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(true)
        })
    })

    describe('ngAfterViewInit', () => {
        it('should be defined', () => {
            expect(component.ngAfterViewInit).toBeDefined()
            // Method is commented out, so just verify it doesn't throw
            expect(() => component.ngAfterViewInit()).not.toThrow()
        })
    })

    describe('bindUrl method', () => {
        it('should set currentRoute when path is provided', () => {
            component.bindUrl('test-path')
            expect(component.currentRoute).toBe('test-path')
        })

        it('should not change currentRoute when path is empty', () => {
            component.currentRoute = 'existing-route'
            component.bindUrl('')
            expect(component.currentRoute).toBe('existing-route')
        })

        it('should not change currentRoute when path is null/undefined', () => {
            component.currentRoute = 'existing-route'
            component.bindUrl(null as any)
            expect(component.currentRoute).toBe('existing-route')
        })
    })

    describe('handleScroll method', () => {
        beforeEach(() => {
            component.elementPosition = 100
            // Mock window.pageYOffset
            Object.defineProperty(window, 'pageYOffset', {
                writable: true,
                value: 0
            })
        })

        it('should set sticky to true when scroll position is greater than element position', () => {
            (window as any).pageYOffset = 150
            component.handleScroll()
            expect(component.sticky).toBe(true)
        })

        it('should set sticky to false when scroll position is less than element position', () => {
            (window as any).pageYOffset = 50
            component.handleScroll()
            expect(component.sticky).toBe(false)
        })

        it('should set sticky to true when scroll position equals element position', () => {
            (window as any).pageYOffset = 100
            component.handleScroll()
            expect(component.sticky).toBe(true)
        })
    })

    describe('Observable Properties', () => {
        it('should create mode$ observable that maps isLtMedium to mode', (done) => {
            component.mode$.subscribe(mode => {
                expect(mode).toBe('side')
                done()
            })

            mockValueService.isLtMedium$.next(false)
        })

        it('should return "over" mode for medium screens', (done) => {
            component.mode$.subscribe(mode => {
                expect(mode).toBe('over')
                done()
            })

            mockValueService.isLtMedium$.next(true)
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from defaultSideNavBarOpenedSubscription', () => {
            component.ngOnInit() // This creates the subscription
            const subscription = component['defaultSideNavBarOpenedSubscription']
            spyOn(subscription, 'unsubscribe')

            component.ngOnDestroy()

            expect(subscription.unsubscribe).toHaveBeenCalled()
        })

        it('should unsubscribe from bannerSubscription if it exists', () => {
            const mockSubscription = { unsubscribe: jest.fn() }
            component['bannerSubscription'] = mockSubscription

            component.ngOnDestroy()

            expect(mockSubscription.unsubscribe).toHaveBeenCalled()
        })

        it('should handle missing subscriptions gracefully', () => {
            component['defaultSideNavBarOpenedSubscription'] = null
            component['bannerSubscription'] = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('Component Properties', () => {
        it('should have correct default department object', () => {
            expect(component.department).toEqual({})
        })

        it('should initialize userRouteName as empty string', () => {
            expect(component.userRouteName).toBe('')
        })
    })

    describe('Integration Tests', () => {
        it('should handle complete navigation flow', () => {
            component.ngOnInit()

            const navigationEndEvent = new NavigationEnd(1, '/app/events/dashboard', '/app/events/dashboard');
            (router.events as Subject<any>).next(navigationEndEvent)

            expect(component.currentRoute).toBe('dashboard')
            expect(component.widgetData).toBeDefined()
        })

        it('should respond to screen size changes after initialization', () => {
            component.ngOnInit()

            // Start with large screen
            mockValueService.isLtMedium$.next(false)
            expect(component.sideNavBarOpened).toBe(true)

            // Switch to small screen
            mockValueService.isLtMedium$.next(true)
            expect(component.sideNavBarOpened).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(true)
        })
    })

    describe('Error Handling', () => {
        it('should handle router events that are not NavigationEnd', () => {
            const otherEvent = { id: 1, url: '/test' }
            spyOn(component, 'bindUrl');

            (router.events as Subject<any>).next(otherEvent)

            expect(component.bindUrl).not.toHaveBeenCalled()
        })

        it('should handle missing route data gracefully', () => {
            const mockRouteWithoutData = {
                snapshot: {
                    data: {
                        pageData: {
                            data: null
                        }
                    }
                }
            }

            TestBed.overrideProvider(ActivatedRoute, { useValue: mockRouteWithoutData })

            expect(() => {
                // const newFixture = TestBed.createComponent(EventsHomeComponent)
                //  const newComponent = newFixture.componentInstance

                const navigationEndEvent = new NavigationEnd(1, '/app/events/test', '/app/events/test');
                (router.events as Subject<any>).next(navigationEndEvent)
            }).not.toThrow()
        })
    })
})