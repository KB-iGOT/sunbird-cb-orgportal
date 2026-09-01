jest.mock('@sunbird-cb/collection', () => ({
    IBtnAppsConfig: {},
    CustomTourService: class MockCustomTourService {
        createPopupTour = jest.fn()
        startTour = jest.fn()
        isTourComplete = new (require('rxjs').Subject)()
        startPopupTour = jest.fn()
        cancelPopupTour = jest.fn()
    },
}))

jest.mock('@sunbird-cb/notification', () => ({
    LibNotificationsService: class MockLibNotificationsService {
        unreadCount$ = new (require('rxjs').Subject)()
    },
}))

import { SimpleChanges } from '@angular/core'
import { NavigationEnd, NavigationStart } from '@angular/router'
import { of, Subject } from 'rxjs'
import { AppNavBarComponent } from './app-nav-bar.component'

describe('AppNavBarComponent', () => {
    let component: AppNavBarComponent
    let mockDomSanitizer: any
    let mockConfigSvc: any
    let mockTourService: any
    let mockRouter: any
    let mockLibNotificationsService: any
    let mockNotificationsService: any
    let mockEvents: any
    let mockSnackBar: any

    beforeEach(() => {
        // Mock DomSanitizer
        mockDomSanitizer = {
            bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url')
        }

        // Mock ConfigurationsService
        mockConfigSvc = {
            restrictedFeatures: new Set(['helpNavBarMenu']),
            unMappedUser: {
                identifier: 'test-user',
                roles: ['admin', 'user']
            },
            instanceConfig: {
                logos: {
                    app: 'app-logo-url',
                    appBottomNav: 'bottom-nav-logo-url'
                },
                showNavBarInSetup: false
            },
            rootOrg: 'test-org',
            primaryNavBar: { background: 'primary' },
            pageNavBar: { background: 'page' },
            primaryNavBarConfig: { config: 'test' },
            appsConfig: {
                features: {
                    feature1: {},
                    feature2: {}
                }
            },
            tourGuideNotifier: new Subject(),
            completedTour: false,
            prefChangeNotifier: new Subject()
        }

        // Mock CustomTourService
        mockTourService = {
            createPopupTour: jest.fn().mockReturnValue('popup-tour'),
            startTour: jest.fn(),
            isTourComplete: new Subject(),
            startPopupTour: jest.fn(),
            cancelPopupTour: jest.fn()
        }

        // Mock Router
        mockRouter = {
            events: new Subject(),
            navigateByUrl: jest.fn(),
            navigate: jest.fn()
        }

        // Mock LibNotificationsService
        mockLibNotificationsService = {
            unreadCount$: new Subject()
        }

        // Mock NotificationsService
        mockNotificationsService = {
            resetNotificationsCount: jest.fn().mockReturnValue(of({ responseCode: 'OK' })),
            handleRedirection: jest.fn(),
            getNotificationsData: jest.fn().mockReturnValue(of({ result: { unread: 5 } }))
        }

        // Mock EventService
        mockEvents = {
            raiseInteractTelemetry: jest.fn()
        }

        // Mock MatSnackBar
        mockSnackBar = {
            open: jest.fn()
        }

        // Mock Environment
        // mockEnvironment = {
        //     production: false
        // }

        // Create component instance
        component = new AppNavBarComponent(
            mockDomSanitizer,
            mockConfigSvc,
            mockTourService,
            mockRouter,
            mockLibNotificationsService,
            mockNotificationsService,
            mockEvents,
            mockSnackBar
        )
    })

    describe('Constructor', () => {
        it('should initialize with default values', () => {
            expect(component.mode).toBe('top')
            expect(component.notificationsCount).toBe(0)
            expect(component.showDropdown).toBe(false)
            expect(component.isHelpMenuRestricted).toBe(true)
            expect(component.roles).toEqual(['admin', 'user'])
        })

        it('should set up basic button apps config', () => {
            expect(component.btnAppsConfig).toEqual({
                widgetType: 'actionButton',
                widgetSubType: 'actionButtonApps',
                widgetData: { allListingUrl: '/app/features' }
            })
        })

        it('should handle missing restrictedFeatures', () => {
            mockConfigSvc.restrictedFeatures = null
            const newComponent = new AppNavBarComponent(
                mockDomSanitizer,
                mockConfigSvc,
                mockTourService,
                mockRouter,
                mockLibNotificationsService,
                mockNotificationsService,
                mockEvents,
                mockSnackBar
            )
            expect(newComponent.isHelpMenuRestricted).toBe(false)
        })

        it('should handle missing unMappedUser', () => {
            mockConfigSvc.unMappedUser = null
            const newComponent = new AppNavBarComponent(
                mockDomSanitizer,
                mockConfigSvc,
                mockTourService,
                mockRouter,
                mockLibNotificationsService,
                mockNotificationsService,
                mockEvents,
                mockSnackBar
            )
            expect(newComponent.roles).toEqual([])
        })

        it('should subscribe to router events', () => {
            const routerEventsSpy = jest.spyOn(mockRouter.events, 'subscribe')
            new AppNavBarComponent(
                mockDomSanitizer,
                mockConfigSvc,
                mockTourService,
                mockRouter,
                mockLibNotificationsService,
                mockNotificationsService,
                mockEvents,
                mockSnackBar
            )
            expect(routerEventsSpy).toHaveBeenCalled()
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            jest.spyOn(component, 'getMyCount').mockImplementation(() => { })
        })

        it('should initialize app configuration', () => {
            component.ngOnInit()

            expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-logo-url')
            expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('bottom-nav-logo-url')
            expect(component.instanceVal).toBe('test-org')
            expect(component.appIcon).toBe('safe-url')
            expect(component.appBottomIcon).toBe('safe-url')
        })

        it('should handle missing instanceConfig', () => {
            mockConfigSvc.instanceConfig = null
            component.ngOnInit()
            expect(component.appIcon).toBeNull()
        })

        it('should handle missing bottom nav logo', () => {
            mockConfigSvc.instanceConfig.logos.appBottomNav = null
            component.ngOnInit()
            expect(component.appBottomIcon).toBeUndefined()
        })

        it('should set feature apps from config', () => {
            component.ngOnInit()
            expect(component.featureApps).toEqual(['feature1', 'feature2'])
        })

        it('should handle missing appsConfig', () => {
            mockConfigSvc.appsConfig = null
            component.ngOnInit()
            expect(component.featureApps).toEqual([])
        })

        it('should subscribe to tour guide notifier', () => {
            component.ngOnInit()
            mockConfigSvc.tourGuideNotifier.next(true)
            expect(component.isTourGuideAvailable).toBe(true)
            expect(mockTourService.createPopupTour).toHaveBeenCalled()
        })

        it('should not show tour guide when restricted', () => {
            mockConfigSvc.restrictedFeatures.add('tourGuide')
            component.ngOnInit()
            mockConfigSvc.tourGuideNotifier.next(true)
            expect(component.isTourGuideAvailable).toBe(false)
        })

        it('should call getMyCount when user identifier exists', () => {
            const getMyCountSpy = jest.spyOn(component, 'getMyCount')
            component.ngOnInit()
            expect(getMyCountSpy).toHaveBeenCalled()
        })

        it('should not call getMyCount when user identifier missing', () => {
            mockConfigSvc.unMappedUser.identifier = null
            const getMyCountSpy = jest.spyOn(component, 'getMyCount')
            component.ngOnInit()
            expect(getMyCountSpy).not.toHaveBeenCalled()
        })

        it('should subscribe to notifications service and call getMyCount when count > 0', () => {
            const getMyCountSpy = jest.spyOn(component, 'getMyCount').mockImplementation(() => { })
            component.ngOnInit()
            mockLibNotificationsService.unreadCount$.next(5)
            expect(getMyCountSpy).toHaveBeenCalled()
        })

        it('should handle router navigation events', () => {
            component.ngOnInit()

            // Test logout route
            mockRouter.events.next(new NavigationEnd(1, '/public/logout', '/public/logout'))
            expect(component.showAppNavBar).toBe(false)

            // Test setup route with showNavBarInSetup false
            mockRouter.events.next(new NavigationEnd(2, '/app/setup', '/app/setup'))
            expect(component.showAppNavBar).toBe(false)

            // Test setup route with showNavBarInSetup true
            mockConfigSvc.instanceConfig.showNavBarInSetup = true
            mockRouter.events.next(new NavigationEnd(3, '/app/setup', '/app/setup'))
            expect(component.showAppNavBar).toBe(true)

            // Test other routes
            mockRouter.events.next(new NavigationEnd(4, '/app/home', '/app/home'))
            expect(component.showAppNavBar).toBe(true)
        })
    })

    describe('routeSubs', () => {
        it('should set isSetUpPage to true for setup route', () => {
            const navigationEnd = new NavigationEnd(1, '/app/setup', '/app/setup')
            component.routeSubs(navigationEnd)
            expect(component.isSetUpPage).toBe(true)
        })

        it('should set isSetUpPage to false for non-setup route', () => {
            const navigationEnd = new NavigationEnd(1, '/app/home', '/app/home')
            component.routeSubs(navigationEnd)
            expect(component.isSetUpPage).toBe(false)
        })
    })

    describe('ngOnChanges', () => {
        it('should update btnAppsConfig for bottom mode', () => {
            const changes: SimpleChanges = {
                mode: {
                    currentValue: 'bottom',
                    previousValue: 'top',
                    firstChange: false,
                    isFirstChange: () => false
                }
            }
            component.mode = 'bottom'
            component.ngOnChanges(changes)

            expect(component.btnAppsConfig.widgetData.showTitle).toBe(true)
        })

        it('should reset btnAppsConfig for top mode', () => {
            const changes: SimpleChanges = {
                mode: {
                    currentValue: 'top',
                    previousValue: 'bottom',
                    firstChange: false,
                    isFirstChange: () => false
                }
            }
            component.mode = 'top'
            component.ngOnChanges(changes)

            expect(component.btnAppsConfig).toEqual(component.basicBtnAppsConfig)
        })

        it('should handle other property changes', () => {
            const changes: SimpleChanges = {
                otherProperty: {
                    currentValue: 'new',
                    previousValue: 'old',
                    firstChange: false,
                    isFirstChange: () => false
                }
            }
            const originalConfig = { ...component.btnAppsConfig }
            component.ngOnChanges(changes)

            expect(component.btnAppsConfig).toEqual(originalConfig)
        })
    })

    describe('startTour', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should start tour and handle completion', () => {
            const prefChangeNotifierSpy = jest.spyOn(mockConfigSvc.prefChangeNotifier, 'next')
            component.startTour()

            expect(mockTourService.startTour).toHaveBeenCalled()

            // Simulate tour completion
            mockTourService.isTourComplete.next(true)

            expect(mockTourService.startPopupTour).toHaveBeenCalled()
            expect(mockConfigSvc.completedTour).toBe(true)
            expect(prefChangeNotifierSpy).toHaveBeenCalledWith({ completedTour: true })

            // Fast forward timer
            jest.advanceTimersByTime(3000)
            expect(mockTourService.cancelPopupTour).toHaveBeenCalled()
        })

        it('should not handle incomplete tour', () => {
            component.startTour()
            mockTourService.isTourComplete.next(false)

            expect(mockTourService.startPopupTour).not.toHaveBeenCalled()
        })
    })

    describe('cancelTour', () => {
        it('should cancel popup tour when it exists', () => {
            component.popupTour = 'test-tour'
            component.cancelTour()

            expect(mockTourService.cancelPopupTour).toHaveBeenCalled()
            expect(component.isTourGuideClosed).toBe(false)
        })

        it('should not cancel tour when popup tour does not exist', () => {
            component.popupTour = null
            component.cancelTour()

            expect(mockTourService.cancelPopupTour).not.toHaveBeenCalled()
        })
    })

    describe('showDashboard', () => {
        it('should navigate to dashboard', () => {
            component.showDashboard()
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/my-dashboard-temp/temp')
        })
    })

    describe('onBellClick', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should reset notifications count when count > 0', () => {
            component.notificationsCount = 5
            component.onBellClick()

            expect(mockNotificationsService.resetNotificationsCount).toHaveBeenCalled()
            expect(component.notificationsCount).toBe(0)
        })

        it('should handle error when resetting notifications', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const { throwError } = require('rxjs')
            mockNotificationsService.resetNotificationsCount.mockReturnValue(
                throwError(new Error('Test error'))
            )

            component.notificationsCount = 5
            component.onBellClick()

            expect(consoleSpy).toHaveBeenCalledWith('Error while fetching notifications count', expect.any(Error))
            consoleSpy.mockRestore()
        })

        it('should not reset notifications when count is 0', () => {
            component.notificationsCount = 0
            component.onBellClick()

            expect(mockNotificationsService.resetNotificationsCount).not.toHaveBeenCalled()
        })

        it('should handle dropdown visibility', () => {
            component.onBellClick()
            expect(component.showDropdown).toBe(false)

            jest.advanceTimersByTime(0)
            expect(component.showDropdown).toBe(true)
        })
    })

    describe('onMenuClosed', () => {
        it('should hide dropdown', () => {
            component.showDropdown = true
            component.onMenuClosed()
            expect(component.showDropdown).toBe(false)
        })
    })

    describe('viewAllClick', () => {
        it('should handle category event', () => {
            const event = { category: 'test-category', notification_id: 'test-id' }
            const raiseTelemetrySpy = jest.spyOn(component, 'raiseTelemetryEventForNotification')

            component.viewAllClick(event)

            expect(raiseTelemetrySpy).toHaveBeenCalledWith(event)
            expect(mockNotificationsService.handleRedirection).toHaveBeenCalledWith(
                event,
                component.environment,
                component.roles,
                mockSnackBar
            )
        })

        it('should navigate to notifications page for non-category event', () => {
            const event = 'test-tab'
            component.viewAllClick(event)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/app/home/notifications'],
                { queryParams: { tab: event } }
            )
        })
    })

    describe('getMyCount', () => {
        it('should get notifications count successfully', () => {
            component.getMyCount()

            expect(mockNotificationsService.getNotificationsData).toHaveBeenCalled()
            expect(component.notificationsCount).toBe(5)
        })

        it('should handle error when getting notifications count', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const { throwError } = require('rxjs')
            mockNotificationsService.getNotificationsData.mockReturnValue(
                throwError(new Error('Test error'))
            )

            component.getMyCount()

            expect(component.notificationsCount).toBe(0)
            expect(consoleSpy).toHaveBeenCalledWith('Error while fetching notifications count', expect.any(Error))
            consoleSpy.mockRestore()
        })

        it('should handle missing result in response', () => {
            mockNotificationsService.getNotificationsData.mockReturnValue(of({}))
            component.getMyCount()

            expect(component.notificationsCount).toBe(0)
        })
    })

    describe('raiseTelemetryEventForNotification', () => {
        it('should raise telemetry event', () => {
            const notification = { notification_id: 'test-id' }
            component.raiseTelemetryEventForNotification(notification)

            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'click',
                    subType: 'notification-engine',
                    id: 'test-id'
                },
                {},
                {
                    module: 'Home'
                }
            )
        })
    })

    describe('ngOnDestroy', () => {
        it('should not throw when ngOnDestroy is called before subscription', () => {
            expect(() => component.ngOnDestroy()).not.toThrow()
        })

        it('should unsubscribe after ngOnInit sets up subscription', () => {
            jest.spyOn(component, 'getMyCount').mockImplementation(() => { })
            component.ngOnInit()
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('routeToHome', () => {
        it('should navigate to community page for community_moderator without leader/admin roles', () => {
            mockConfigSvc.userRoles = new Set(['community_moderator'])
            component.routeToHome()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community'])
        })

        it('should navigate to home for community_moderator with mdo_leader role', () => {
            mockConfigSvc.userRoles = new Set(['community_moderator', 'mdo_leader'])
            component.routeToHome()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home'])
        })

        it('should navigate to home for user without community_moderator', () => {
            mockConfigSvc.userRoles = new Set(['mdo_admin'])
            component.routeToHome()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home'])
        })

        it('should navigate to home when userRoles is undefined', () => {
            mockConfigSvc.userRoles = undefined
            component.routeToHome()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home'])
        })
    })

    describe('Router Event Handling in Constructor', () => {
        it('should cancel tour on NavigationStart', () => {
            const cancelTourSpy = jest.spyOn(component, 'cancelTour')
            mockRouter.events.next(new NavigationStart(1, '/test'))
            expect(cancelTourSpy).toHaveBeenCalled()
        })

        it('should handle NavigationEnd in constructor', () => {
            const routeSubsSpy = jest.spyOn(component, 'routeSubs')
            const cancelTourSpy = jest.spyOn(component, 'cancelTour')

            const navigationEnd = new NavigationEnd(1, '/test', '/test')
            mockRouter.events.next(navigationEnd)

            expect(routeSubsSpy).toHaveBeenCalledWith(navigationEnd)
            expect(cancelTourSpy).toHaveBeenCalled()
        })
    })
})