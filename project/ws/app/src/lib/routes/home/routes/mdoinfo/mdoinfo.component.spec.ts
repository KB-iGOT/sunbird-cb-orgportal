// import { ComponentFixture } from '@angular/core/testing'
import { NavigationEnd } from '@angular/router'
import { ElementRef } from '@angular/core'
import { of, Subject } from 'rxjs'
import { MdoinfoComponent } from './mdoinfo.component'

// Mock services
const mockValueService = {
    isLtMedium$: of(false)
}

const mockConfigurationsService = {
    sitePath: '/test-site'
}

const mockWidgetContentService = {
    fetchConfig: jest.fn()
}

const mockActivatedRoute = {
    parent: {
        snapshot: {
            data: {
                pageData: {
                    data: {
                        tabs: [
                            { id: 'leadership', title: 'Leadership' },
                            { id: 'about', title: 'About' }
                        ]
                    }
                }
            }
        }
    }
}

const mockRouter = {
    events: new Subject()
}

describe('MdoinfoComponent', () => {
    let component: MdoinfoComponent
    // let fixture: ComponentFixture<MdoinfoComponent>
    let mockElementRef: ElementRef

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()
        mockWidgetContentService.fetchConfig.mockReturnValue(of({ tabs: [] }))

        // Mock ElementRef
        mockElementRef = {
            nativeElement: {
                offsetTop: 100
            }
        } as ElementRef

        // Create component instance manually
        component = new MdoinfoComponent(
            mockActivatedRoute as any,
            mockRouter as any,
            mockValueService as any,
            mockConfigurationsService as any,
            mockWidgetContentService as any
        )

        // Set ViewChild manually since we're not using TestBed
        component.menuElement = mockElementRef

        // Mock window properties
        Object.defineProperty(window, 'pageYOffset', {
            writable: true,
            value: 0
        })
    })

    afterEach(() => {
        if (component.defaultSideNavBarOpenedSubscription) {
            component.defaultSideNavBarOpenedSubscription.unsubscribe()
        }
    })

    describe('Component Initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.sticky).toBe(false)
            expect(component.sideNavBarOpened).toBe(true)
            expect(component.panelOpenState).toBe(false)
            expect(component.unread).toBe(0)
            expect(component.currentRoute).toBe('leadership')
            expect(component.wfHistory).toEqual([])
            expect(component.screenSizeIsLtMedium).toBe(false)
        })

        it('should have proper observables defined', () => {
            expect(component.isLtMedium$).toBeDefined()
            expect(component.mode$).toBeDefined()
        })
    })

    describe('ngOnInit', () => {
        it('should initialize tabsData from route parent snapshot', () => {
            component.ngOnInit()

            expect(component.tabsData).toEqual([
                { id: 'leadership', title: 'Leadership' },
                { id: 'about', title: 'About' }
            ])
        })

        it('should call getMDOInfoConfig', () => {
            const spy = jest.spyOn(component, 'getMDOInfoConfig').mockImplementation()

            component.ngOnInit()

            expect(spy).toHaveBeenCalled()
        })

        it('should subscribe to isLtMedium$ and set sideNavBarOpened to true when isLtMedium is false', () => {
            mockValueService.isLtMedium$ = of(false)

            component.ngOnInit()

            expect(component.sideNavBarOpened).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)
        })

        it('should subscribe to isLtMedium$ and set sideNavBarOpened to false when isLtMedium is true', () => {
            mockValueService.isLtMedium$ = of(true)
            component = new MdoinfoComponent(
                mockActivatedRoute as any,
                mockRouter as any,
                mockValueService as any,
                mockConfigurationsService as any,
                mockWidgetContentService as any
            )

            component.ngOnInit()

            expect(component.sideNavBarOpened).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(true)
        })

        it('should handle case when route parent is null', () => {
            const mockActivatedRouteWithoutParent = {
                parent: null
            }

            component = new MdoinfoComponent(
                mockActivatedRouteWithoutParent as any,
                mockRouter as any,
                mockValueService as any,
                mockConfigurationsService as any,
                mockWidgetContentService as any
            )

            component.ngOnInit()

            expect(component.tabsData).toEqual([])
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from defaultSideNavBarOpenedSubscription', () => {
            const mockSubscription = {
                unsubscribe: jest.fn()
            }

            component.defaultSideNavBarOpenedSubscription = mockSubscription
            component.ngOnDestroy()

            expect(mockSubscription.unsubscribe).toHaveBeenCalled()
        })

        it('should not throw error when subscription is null', () => {
            component.defaultSideNavBarOpenedSubscription = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('getMDOInfoConfig', () => {
        it('should fetch config and set tabsData on success', () => {
            const mockConfig = {
                tabs: [
                    { id: 'test1', title: 'Test 1' },
                    { id: 'test2', title: 'Test 2' }
                ]
            }

            mockWidgetContentService.fetchConfig.mockReturnValue(of(mockConfig))

            component.getMDOInfoConfig()

            expect(mockWidgetContentService.fetchConfig).toHaveBeenCalledWith('/test-site/feature/mdoinfo.json')
            expect(component.tabsData).toEqual(mockConfig.tabs)
        })

        it('should handle error gracefully', () => {
            mockWidgetContentService.fetchConfig.mockReturnValue(
                new Subject().pipe(() => {
                    throw new Error('Network error')
                })
            )

            expect(() => component.getMDOInfoConfig()).not.toThrow()
        })
    })

    describe('bindUrl', () => {
        it('should set currentRoute when path is provided', () => {
            const testPath = '/app/home/mdoinfo/about'

            component.bindUrl(testPath)

            expect(component.currentRoute).toBe(testPath)
        })

        it('should not change currentRoute when path is empty', () => {
            const originalRoute = component.currentRoute

            component.bindUrl('')

            expect(component.currentRoute).toBe(originalRoute)
        })

        it('should not change currentRoute when path is null', () => {
            const originalRoute = component.currentRoute

            component.bindUrl(null as any)

            expect(component.currentRoute).toBe(originalRoute)
        })
    })

    describe('handleScroll', () => {
        beforeEach(() => {
            component.elementPosition = 100
        })

        it('should set sticky to true when window scroll is greater than element position', () => {
            Object.defineProperty(window, 'pageYOffset', {
                writable: true,
                value: 150
            })

            component.handleScroll()

            expect(component.sticky).toBe(true)
        })

        it('should set sticky to true when window scroll equals element position', () => {
            Object.defineProperty(window, 'pageYOffset', {
                writable: true,
                value: 100
            })

            component.handleScroll()

            expect(component.sticky).toBe(true)
        })

        it('should set sticky to false when window scroll is less than element position', () => {
            Object.defineProperty(window, 'pageYOffset', {
                writable: true,
                value: 50
            })

            component.handleScroll()

            expect(component.sticky).toBe(false)
        })
    })

    describe('Router Events Subscription', () => {
        it('should call bindUrl when NavigationEnd event occurs', () => {
            const bindUrlSpy = jest.spyOn(component, 'bindUrl')
            const navigationEndEvent = new NavigationEnd(
                1,
                '/app/home/mdoinfo/about',
                '/app/home/mdoinfo/about'
            )

            // Trigger the navigation event
            mockRouter.events.next(navigationEndEvent)

            expect(bindUrlSpy).toHaveBeenCalledWith('/app/home/mdoinfo/leadership')
        })

        it('should replace mdoinfo path correctly in NavigationEnd event', () => {
            const bindUrlSpy = jest.spyOn(component, 'bindUrl')
            const navigationEndEvent = new NavigationEnd(
                1,
                '/app/home/mdoinfo/team',
                '/app/home/mdoinfo/team'
            )

            mockRouter.events.next(navigationEndEvent)

            expect(bindUrlSpy).toHaveBeenCalledWith('/app/home/mdoinfo/leadership')
        })

        it('should not call bindUrl for non-NavigationEnd events', () => {
            const bindUrlSpy = jest.spyOn(component, 'bindUrl')

            // Simulate a different router event
            mockRouter.events.next({ id: 1 } as any)

            expect(bindUrlSpy).not.toHaveBeenCalled()
        })
    })

    describe('Observable Streams', () => {
        it('should map isLtMedium$ to correct mode values', (done) => {
            // Test when isLtMedium is false
            mockValueService.isLtMedium$ = of(false)
            component = new MdoinfoComponent(
                mockActivatedRoute as any,
                mockRouter as any,
                mockValueService as any,
                mockConfigurationsService as any,
                mockWidgetContentService as any
            )

            component.mode$.subscribe(mode => {
                expect(mode).toBe('side')
                done()
            })
        })

        it('should map isLtMedium$ to over mode when screen is medium', (done) => {
            mockValueService.isLtMedium$ = of(true)
            component = new MdoinfoComponent(
                mockActivatedRoute as any,
                mockRouter as any,
                mockValueService as any,
                mockConfigurationsService as any,
                mockWidgetContentService as any
            )

            component.mode$.subscribe(mode => {
                expect(mode).toBe('over')
                done()
            })
        })
    })
})