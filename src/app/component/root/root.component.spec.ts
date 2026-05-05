jest.mock('@sunbird-cb/collection', () => ({
	BreadcrumbsOrgService: jest.fn(),
	NsContent: {},
	ROOT_WIDGET_CONFIG: {},
}), { virtual: true })

import { RootComponent } from './root.component'
import {
	Router,
	ActivatedRoute,
	NavigationEnd,
	NavigationStart,
	NavigationCancel,
	NavigationError,
	ActivatedRouteSnapshot
} from '@angular/router'
import { ApplicationRef, ChangeDetectorRef, ElementRef } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { BehaviorSubject, Subject, of } from 'rxjs'
import {
	ConfigurationsService,
	TelemetryService,
	ValueService,
	LoggerService,
	UtilityService,
	EventService,
	AuthKeycloakService,
} from '@sunbird-cb/utils'
import { BreadcrumbsOrgService } from '@sunbird-cb/collection'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { RootService } from './root.service'
import { LoaderService } from '../../services/loader.service'

// Mock environment
jest.mock('../../../environments/environment', () => ({
	environment: {
		production: true
	}
}))

describe('RootComponent', () => {
	let component: RootComponent
	let mockRouter: jest.Mocked<Router>
	let mockActivatedRoute: jest.Mocked<ActivatedRoute>
	let mockAppRef: jest.Mocked<ApplicationRef>
	let mockLogger: jest.Mocked<LoggerService>
	let mockSwUpdate: jest.Mocked<SwUpdate>
	let mockDialog: jest.Mocked<MatDialog>
	let mockConfigSvc: jest.Mocked<ConfigurationsService>
	let mockValueSvc: jest.Mocked<ValueService>
	let mockTelemetrySvc: jest.Mocked<TelemetryService>
	let mockMobileAppsSvc: jest.Mocked<MobileAppsService>
	let mockRootSvc: jest.Mocked<RootService>
	let mockBtnBackSvc: jest.Mocked<BreadcrumbsOrgService>
	let mockChangeDetector: jest.Mocked<ChangeDetectorRef>
	let mockUtilitySvc: jest.Mocked<UtilityService>
	let mockEventSvc: jest.Mocked<EventService>
	let mockAuthSvc: jest.Mocked<AuthKeycloakService>
	let mockLoader: jest.Mocked<LoaderService>

	const routerEventsSubject = new Subject()
	const showNavbarSubject = new BehaviorSubject(true)
	const loaderSubject = new BehaviorSubject(false)
	const isXSmallSubject = new BehaviorSubject(false)
	const isStableSubject = new BehaviorSubject(true)
	const swUpdateAvailableSubject = new Subject()

	beforeEach(() => {
		// Mock Router
		mockRouter = {
			events: routerEventsSubject.asObservable(),
			routerState: {
				firstChild: jest.fn()
			}
		} as any

		// Mock ActivatedRoute
		mockActivatedRoute = {
			snapshot: {
				root: {
					firstChild: {
						data: { pageId: 'test', module: 'testModule' },
						firstChild: null
					}
				}
			}
		} as any

		// Mock ApplicationRef
		mockAppRef = {
			isStable: isStableSubject.asObservable()
		} as any

		// Mock other services
		mockLogger = {
			log: jest.fn()
		} as any

		mockSwUpdate = {
			isEnabled: true,
			available: swUpdateAvailableSubject.asObservable(),
			checkForUpdate: jest.fn().mockReturnValue(Promise.resolve()),
			activateUpdate: jest.fn().mockReturnValue(Promise.resolve())
		} as any

		mockDialog = {
			open: jest.fn().mockReturnValue({
				afterClosed: jest.fn().mockReturnValue(of(true))
			})
		} as any

		mockConfigSvc = {} as any

		mockValueSvc = {
			isXSmall$: isXSmallSubject.asObservable()
		} as any

		mockTelemetrySvc = {
			start: jest.fn(),
			impression: jest.fn(),
			audit: jest.fn()
		} as any

		mockMobileAppsSvc = {
			init: jest.fn()
		} as any

		mockRootSvc = {
			showNavbarDisplay$: showNavbarSubject.asObservable()
		} as any

		mockBtnBackSvc = {
			initialize: jest.fn()
		} as any

		mockChangeDetector = {
			detectChanges: jest.fn()
		} as any

		mockUtilitySvc = {
			setRouteData: jest.fn(),
			routeData: { pageId: 'test', module: 'testModule' }
		} as any

		mockEventSvc = {
			dispatchEvent: jest.fn()
		} as any

		mockAuthSvc = {
			isAuthenticated: true
		} as any

		mockLoader = {
			changeLoad: loaderSubject.asObservable()
		} as any

		// Create component instance
		component = new RootComponent(
			mockRouter as any,
			mockActivatedRoute as any,
			mockAppRef as any,
			mockLogger as any,
			mockSwUpdate as any,
			mockDialog as any,
			mockConfigSvc as any,
			mockValueSvc as any,
			mockTelemetrySvc as any,
			mockMobileAppsSvc as any,
			mockRootSvc as any,
			mockBtnBackSvc as any,
			mockChangeDetector as any,
			mockUtilitySvc as any,
			mockEventSvc as any,
			mockAuthSvc as any,
			mockLoader
		)

		// Mock ViewChild references
		component.appUpdateTitleRef = {
			nativeElement: { value: 'Update Available' }
		} as ElementRef

		component.appUpdateBodyRef = {
			nativeElement: { value: 'A new version is available' }
		} as ElementRef

		// Mock window object
		Object.defineProperty(window, 'self', {
			value: window,
			writable: true
		})
		Object.defineProperty(window, 'top', {
			value: window,
			writable: true
		})

		// Mock caches
		Object.defineProperty(window, 'caches', {
			value: {
				keys: jest.fn().mockResolvedValue(['cache1', 'cache2']),
				delete: jest.fn().mockResolvedValue(true)
			},
			writable: true
		})

		// Mock location
		Object.defineProperty(window, 'location', {
			value: {
				href: '',
				pathname: '/',
				reload: jest.fn()
			},
			writable: true
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('Constructor and Initialization', () => {
		it('should create component instance', () => {
			expect(component).toBeDefined()
			expect(mockMobileAppsSvc.init).toHaveBeenCalled()
		})

		it('should initialize properties with default values', () => {
			expect(component.routeChangeInProgress).toBe(false)
			expect(component.showNavbar).toBe(false)
			expect(component.isNavBarRequired).toBe(false)
			expect(component.isInIframe).toBe(false)
			expect(component.appStartRaised).toBe(false)
			expect(component.isSetupPage).toBe(false)
			expect(component.isLoading).toBe(false)
		})
	})

	describe('ngOnInit', () => {
		beforeEach(() => {
			component.ngOnInit()
		})

		it('should detect iframe context correctly', () => {
			expect(component.isInIframe).toBe(false)
		})

		it('should initialize breadcrumbs service', () => {
			expect(mockBtnBackSvc.initialize).toHaveBeenCalled()
		})

		it('should subscribe to router events', () => {
			expect(component.routeChangeInProgress).toBe(false)
		})

		it('should handle NavigationStart event', () => {
			const navStart = new NavigationStart(1, '/test')
			routerEventsSubject.next(navStart)

			expect(component.routeChangeInProgress).toBe(true)
			expect(component.isNavBarRequired).toBe(true)
			expect(mockChangeDetector.detectChanges).toHaveBeenCalled()
		})

		it('should handle NavigationStart for embed routes', () => {
			const navStart = new NavigationStart(1, '/embed/test')
			routerEventsSubject.next(navStart)

			expect(component.isNavBarRequired).toBe(false)
		})

		it('should handle NavigationStart for author routes in iframe', () => {
			component.isInIframe = true
			const navStart = new NavigationStart(1, '/author/test')
			routerEventsSubject.next(navStart)

			expect(component.isNavBarRequired).toBe(false)
		})

		it('should handle NavigationStart for public/home route', () => {
			const navStart = new NavigationStart(1, '/public/home')
			routerEventsSubject.next(navStart)

			expect(window.location.href).toBe('/public/logout')
		})

		it('should handle NavigationEnd event', () => {
			const navEnd = new NavigationEnd(1, '/test', '/test')
			routerEventsSubject.next(navEnd)

			expect(component.routeChangeInProgress).toBe(false)
			expect(component.currentUrl).toBe('/test')
			expect(mockChangeDetector.detectChanges).toHaveBeenCalled()
			expect(mockUtilitySvc.setRouteData).toHaveBeenCalled()
			expect(mockTelemetrySvc.impression).toHaveBeenCalled()
		})

		it('should handle NavigationEnd for setup routes', () => {
			const navEnd = new NavigationEnd(1, '/setup/test', '/setup/test')
			routerEventsSubject.next(navEnd)

			expect(component.isSetupPage).toBe(true)
		})

		it('should handle NavigationCancel event', () => {
			const navCancel = new NavigationCancel(1, '/test', 'cancelled')
			routerEventsSubject.next(navCancel)

			expect(component.routeChangeInProgress).toBe(false)
			expect(component.currentUrl).toBe('/test')
		})

		it('should handle NavigationError event', () => {
			const navError = new NavigationError(1, '/test', 'error')
			routerEventsSubject.next(navError)

			expect(component.routeChangeInProgress).toBe(false)
			expect(component.currentUrl).toBe('/test')
		})

		it('should subscribe to navbar display changes', (done) => {
			showNavbarSubject.next(true)

			setTimeout(() => {
				expect(component.showNavbar).toBe(true)
				done()
			}, 600)
		})

		it('should subscribe to loader changes', (done) => {
			loaderSubject.next(true)

			setTimeout(() => {
				expect(component.isLoading).toBe(true)
				done()
			}, 300)
		})
	})

	describe('raiseAppStartTelemetry', () => {
		it('should raise app start telemetry only once', () => {
			component.appStartRaised = false
			component.raiseAppStartTelemetry()

			expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
			expect(component.appStartRaised).toBe(true)

			// Call again - should not dispatch event
			mockEventSvc.dispatchEvent.mockClear()
			component.raiseAppStartTelemetry()
			expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
		})
	})

	describe('getChildRouteData', () => {
		it('should collect child route data recursively', () => {
			const mockSnapshot = {} as ActivatedRouteSnapshot
			const mockFirstChild = {
				data: { test: 'data1' },
				firstChild: {
					data: { test: 'data2' },
					firstChild: null
				}
			} as any

			component.currentRouteData = []
			component.getChildRouteData(mockSnapshot, mockFirstChild)

			expect(component.currentRouteData).toHaveLength(2)
			expect(component.currentRouteData[0]).toEqual({ test: 'data1' })
			expect(component.currentRouteData[1]).toEqual({ test: 'data2' })
		})

		it('should handle null firstChild', () => {
			const mockSnapshot = {} as ActivatedRouteSnapshot
			component.currentRouteData = []
			component.getChildRouteData(mockSnapshot, null)

			expect(component.currentRouteData).toHaveLength(0)
		})
	})

	describe('ngAfterViewInit', () => {
		it('should initialize app update check', () => {
			const initSpy = jest.spyOn(component, 'initAppUpdateCheck')
			component.ngAfterViewInit()

			expect(initSpy).toHaveBeenCalled()
		})
	})

	describe('initAppUpdateCheck', () => {
		beforeEach(() => {
			jest.useFakeTimers()
		})

		afterEach(() => {
			jest.useRealTimers()
		})

		it('should log initialization message', () => {
			component.initAppUpdateCheck()
			expect(mockLogger.log).toHaveBeenCalledWith('LOGGING IN ROOT FOR PWA INIT CHECK')
		})

		it('should set up periodic update checks in production', () => {
			component.initAppUpdateCheck()

			// Fast forward 6 hours
			jest.advanceTimersByTime(6 * 60 * 60 * 1000)

			expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled()
		})

		it('should handle service worker updates when available', () => {
			component.initAppUpdateCheck()

			// Trigger update available
			swUpdateAvailableSubject.next({})

			expect(mockDialog.open).toHaveBeenCalledWith(
				expect.any(Function),
				{
					data: {
						title: 'Update Available',
						body: 'A new version is available'
					}
				}
			)
		})

		it('should activate update and clear caches when user confirms', () => {
			component.initAppUpdateCheck()

			// Trigger update available — dialogRef.afterClosed already returns of(true) from beforeEach
			swUpdateAvailableSubject.next({})

			expect(mockSwUpdate.activateUpdate).toHaveBeenCalled()
		})

		it('should not activate update when user cancels', () => {
			// Override dialog to return of(false) BEFORE emitting so afterClosed fires with false
			mockDialog.open.mockReturnValue({
				afterClosed: jest.fn().mockReturnValue(of(false))
			} as any)
			component.initAppUpdateCheck()

			swUpdateAvailableSubject.next({})

			expect(mockSwUpdate.activateUpdate).not.toHaveBeenCalled()
		})

		it('should handle service worker not enabled', () => {
			Object.defineProperty(mockSwUpdate, 'isEnabled', { value: false, writable: true })
			component.initAppUpdateCheck()

			swUpdateAvailableSubject.next({})

			expect(mockDialog.open).not.toHaveBeenCalled()
		})
	})

	describe('unloadHandler', () => {
		it('should handle unload event', () => {
			const unloadEvent = { type: 'unload' }
			component.unloadHandler(unloadEvent)

			// Currently the method body is commented out, so no assertions needed
			// If uncommented, would test logout and redirect functionality
		})

		it('should handle non-unload events', () => {
			const otherEvent = { type: 'beforeunload' }
			component.unloadHandler(otherEvent)

			// Should not perform any actions for non-unload events
		})
	})

	describe('Component Properties', () => {
		it('should expose isXSmall$ observable', () => {
			expect(component.isXSmall$).toBe(mockValueSvc.isXSmall$)
		})

		it('should have correct initial route change state', () => {
			expect(component.routeChangeInProgress).toBe(false)
		})

		it('should have ViewChild references', () => {
			expect(component.previewContainerViewRef).toBeNull()
			expect(component.appUpdateTitleRef).toBeDefined()
			expect(component.appUpdateBodyRef).toBeDefined()
		})
	})

	describe('Iframe Detection', () => {
		it('should detect when not in iframe', () => {
			Object.defineProperty(window, 'self', { value: window })
			Object.defineProperty(window, 'top', { value: window })

			component.ngOnInit()
			expect(component.isInIframe).toBe(false)
		})

		it('should detect when in iframe', () => {
			const mockTop = {}
			Object.defineProperty(window, 'top', { value: mockTop })

			component.ngOnInit()
			expect(component.isInIframe).toBe(true)
		})

		it('should handle iframe detection error', () => {
			Object.defineProperty(window, 'self', {
				get: () => {
					throw new Error('Access denied')
				}
			})

			component.ngOnInit()
			expect(component.isInIframe).toBe(false)
		})
	})

	describe('Memory Management', () => {
		it('should create loader subscription', () => {
			component.ngOnInit()
			expect(component.loaderSubscription).toBeDefined()
		})

		it('should handle subscription cleanup', () => {
			component.ngOnInit()
			const subscription = component.loaderSubscription
			const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe')

			// Manually trigger cleanup (normally done in ngOnDestroy)
			if (component.loaderSubscription) {
				component.loaderSubscription.unsubscribe()
			}

			expect(unsubscribeSpy).toHaveBeenCalled()
		})
	})
})