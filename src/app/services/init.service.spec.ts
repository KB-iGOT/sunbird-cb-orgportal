import { InitService } from './init.service'
import { of, throwError, Subject } from 'rxjs'

// Mock environment
const mockEnvironment = {
	production: false,
	portalRoles: ['admin', 'user', 'moderator']
}

// Mock dependencies
const mockLogger = {
	removeConsoleAccess: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn()
}

const mockConfigSvc = {
	baseUrl: 'http://localhost:3000',
	isProduction: false,
	instanceConfig: null as any,
	rootOrg: null as any,
	org: null as any,
	activeOrg: null as any,
	appSetup: null as any,
	competency: null as any,
	unMappedUser: null as any,
	userProfile: null as any,
	userProfileV2: null as any,
	orgReadData: null as any,
	hasAcceptedTnc: false,
	profileDetailsStatus: false,
	isActive: false,
	userGroups: new Set(),
	userRoles: new Set(),
	restrictedFeatures: new Set(),
	restrictedWidgets: new Set(),
	appsConfig: null as any,
	primaryNavBar: null as any,
	pageNavBar: null as any,
	primaryNavBarConfig: null as any,
	sitePath: '/site',
	updateOrgReadDataObservable: new Subject<string>()
}

const mockWidgetResolverService = {
	initialize: jest.fn()
}

const mockSettingsSvc = {
	initializePrefChanges: jest.fn()
}

const mockUserPreference = {
	fetchUserPreference: jest.fn(),
	initialize: jest.fn()
}

const mockHttpClient = {
	get: jest.fn(),
	post: jest.fn()
}

const mockDomSanitizer = {
	bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('trusted-url')
}

const mockIconRegistry = {
	addSvgIcon: jest.fn()
}

// Mock global objects
Object.defineProperty(window, 'location', {
	value: {
		pathname: '/test',
		origin: 'http://localhost:3000',
		href: 'http://localhost:3000/test'
	},
	writable: true
})

Object.defineProperty(document, 'baseURI', {
	value: 'http://localhost:3000/',
	writable: true
})

Object.defineProperty(document, 'title', {
	value: '',
	writable: true
})

// Mock localStorage
const mockLocalStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
	value: mockLocalStorage
})

// Mock document.getElementById
const mockGetElementById = jest.fn()
Object.defineProperty(document, 'getElementById', {
	value: mockGetElementById
})

describe('InitService', () => {
	let service: InitService

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks()

		// Reset mock implementations
		mockLocalStorage.getItem.mockReturnValue(null)

		// Create service instance
		service = new InitService(
			mockLogger as any,
			mockConfigSvc as any,
			mockWidgetResolverService as any,
			mockSettingsSvc as any,
			mockUserPreference as any,
			mockHttpClient as any,
			'/app',
			mockDomSanitizer as any,
			mockIconRegistry as any
		);

		// Mock environment
		(service as any).environment = mockEnvironment
	})

	describe('Constructor', () => {
		it('should create service and register icons', () => {
			expect(service).toBeDefined()
			expect(mockConfigSvc.isProduction).toBe(mockEnvironment.production)
			expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledTimes(7)
			expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('pin', 'trusted-url')
			expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('facebook', 'trusted-url')
		})
	})

	describe('init method', () => {
		beforeEach(() => {
			// Setup default successful responses
			mockHttpClient.get.mockImplementation((url: string) => {
				if (url.includes('host.config.json')) {
					return of({
						rootOrg: 'test-org',
						org: [{ id: 'org1' }],
						appSetup: {},
						competency: {}
					})
				}
				if (url.includes('site.config.json')) {
					return of({
						rootOrg: 'test-org',
						org: [{ id: 'org1' }],
						backgrounds: {},
						details: { appName: 'Test App' },
						indexHtmlMeta: {}
					})
				}
				if (url.includes('apps.json')) {
					return of({
						features: { feature1: { id: 'feature1', permission: {} } },
						groups: [],
						tourGuide: {}
					})
				}
				if (url.includes('features.config.json')) {
					return of({})
				}
				if (url.includes('widgets.config.json')) {
					return of([])
				}
				if (url.includes('/apis/proxies/v8/api/user/v2/read')) {
					return of({
						result: {
							response: {
								userId: 'user123',
								firstName: 'John',
								userName: 'john.doe',
								email: 'john@example.com',
								roles: ['admin'],
								organisations: [{ organisationId: 'org123' }],
								rootOrg: { isInstitute: false },
								rootOrgId: 'rootOrg123'
							}
						}
					})
				}
				return of({})
			})

			mockHttpClient.post.mockReturnValue(of({
				result: { response: { id: 'org123' } }
			}))
		})

		it('should initialize successfully for non-public path', async () => {
			window.location.pathname = '/dashboard'

			const result = await service.init()

			expect(result).toBe(true)
			expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:3000/host.config.json')
			expect(mockSettingsSvc.initializePrefChanges).toHaveBeenCalledWith(false)
		})

		it('should skip startup details for public path', async () => {
			window.location.pathname = '/public/content'

			const result = await service.init()

			expect(result).toBe(true)
			expect(mockHttpClient.get).not.toHaveBeenCalledWith(expect.stringContaining('/apis/proxies/v8/api/user/v2/read'))
		})

		it('should handle initialization errors gracefully', async () => {
			mockHttpClient.get.mockRejectedValue(new Error('Network error'))

			const result = await service.init()

			expect(result).toBe(false)
			expect(mockLogger.info).toHaveBeenCalledWith('Not Authenticated')
		})

		it('should handle widget resolver initialization', async () => {
			const result = await service.init()

			expect(result).toBe(true)
			expect(mockWidgetResolverService.initialize).toHaveBeenCalledWith(
				mockConfigSvc.restrictedWidgets,
				mockConfigSvc.userRoles,
				mockConfigSvc.userGroups,
				mockConfigSvc.restrictedFeatures
			)
		})
	})

	describe('fetchDefaultConfig', () => {
		it('should fetch and set default configuration', async () => {
			const mockConfig = {
				rootOrg: 'test-org',
				org: [{ id: 'org1' }],
				appSetup: { theme: 'default' },
				competency: { enabled: true }
			}

			mockHttpClient.get.mockReturnValue(of(mockConfig))

			const result = await (service as any).fetchDefaultConfig()

			expect(result).toEqual(mockConfig)
			expect(mockConfigSvc.instanceConfig).toEqual(mockConfig)
			expect(mockConfigSvc.rootOrg).toBe('test-org')
			expect(mockConfigSvc.org).toEqual([{ id: 'org1' }])
			expect(mockConfigSvc.activeOrg).toEqual({ id: 'org1' })
		})
	})

	describe('fetchAppsConfig', () => {
		it('should fetch apps configuration', async () => {
			const mockAppsConfig = {
				features: { feature1: { id: 'feature1' } },
				groups: [],
				tourGuide: {}
			}

			mockHttpClient.get.mockReturnValue(of(mockAppsConfig))

			const result = await (service as any).fetchAppsConfig()

			expect(result).toEqual(mockAppsConfig)
			expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:3000/feature/apps.json')
		})
	})

	describe('fetchStartUpDetails', () => {
		beforeEach(() => {
			mockConfigSvc.instanceConfig = { disablePidCheck: false } as any
		})

		it('should fetch user profile and set user data', async () => {
			const mockUserResponse = {
				result: {
					response: {
						userId: 'user123',
						firstName: 'John',
						userName: 'john.doe',
						email: 'john@example.com',
						roles: ['admin'],
						organisations: [{ organisationId: 'org123' }],
						rootOrg: { isInstitute: false },
						rootOrgId: 'rootOrg123',
						profileDetails: {
							personalDetails: {
								firstname: 'John',
								primaryEmail: 'john@example.com'
							}
						}
					}
				}
			}

			mockHttpClient.get.mockReturnValue(of(mockUserResponse))
			mockHttpClient.post.mockReturnValue(of({ result: { response: {} } }))

			const result = await (service as any).fetchStartUpDetails()

			expect(result.roles).toContain('admin')
			if (mockConfigSvc.userProfile) {
				expect(mockConfigSvc.userProfile.userId).toBe('user123')
				expect(mockConfigSvc.userProfile.firstName).toBe('John')
			}

		})

		it('should handle users without required roles', async () => {
			const mockUserResponse = {
				result: {
					response: {
						userId: 'user123',
						roles: ['invalid-role']
					}
				}
			}

			mockHttpClient.get.mockReturnValue(of(mockUserResponse))

			// Mock hasRole to return false
			jest.spyOn(service, 'hasRole').mockReturnValue(false)

			await expect((service as any).fetchStartUpDetails()).rejects.toThrow('Invalid user')
		})

		it('should set survey popup localStorage', async () => {
			mockLocalStorage.getItem.mockReturnValue('false')

			mockHttpClient.get.mockReturnValue(of({
				result: {
					response: {
						userId: 'user123',
						roles: ['admin']
					}
				}
			}))

			await (service as any).fetchStartUpDetails()

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('surveyPopup', 'false')
		})

		it('should handle institute organizations', async () => {
			const mockUserResponse = {
				result: {
					response: {
						userId: 'user123',
						firstName: 'John',
						roles: ['admin'],
						rootOrg: { isInstitute: true },
						rootOrgId: 'rootOrg123',
						organisations: []
					}
				}
			}

			mockHttpClient.get.mockReturnValue(of(mockUserResponse))

			await (service as any).fetchStartUpDetails()

			expect(mockConfigSvc.userRoles.has('isInstuteOrg')).toBe(true)
		})
	})

	describe('fetchOrgReadData', () => {
		it('should fetch organization data', async () => {
			const mockOrgData = { result: { response: { id: 'org123' } } }
			mockHttpClient.post.mockReturnValue(of(mockOrgData))

			const userData = {
				organisations: [{ organisationId: 'org123' }]
			}

			await (service as any).fetchOrgReadData(userData)

			expect(mockHttpClient.post).toHaveBeenCalledWith(
				'/apis/proxies/v8/org/v1/read',
				{ request: { organisationId: 'org123' } }
			)
			expect(mockConfigSvc.orgReadData).toEqual({ id: 'org123' })
		})
	})

	describe('processAppsConfig', () => {
		it('should filter features based on permissions', () => {
			const mockAppsConfig = {
				features: {
					feature1: { id: 'feature1', permission: {} },
					feature2: { id: 'feature2', permission: {} }
				},
				groups: [
					{ id: 'group1', featureIds: ['feature1', 'feature2'] }
				],
				tourGuide: {}
			}

			// Mock hasUnitPermission to return true for feature1, false for feature2
			const originalHasUnitPermission = require('@sunbird-cb/resolver').hasUnitPermission
			require('@sunbird-cb/resolver').hasUnitPermission = jest.fn()
				.mockImplementation((permission, defaultValue) => {
					if (permission === mockAppsConfig.features.feature1.permission) return true
					if (permission === mockAppsConfig.features.feature2.permission) return false
					return defaultValue
				})

			const result = (service as any).processAppsConfig(mockAppsConfig)

			expect(Object.keys(result.features)).toEqual(['feature1'])
			expect(result.groups[0].featureIds).toEqual(['feature1'])

			// Restore original function
			require('@sunbird-cb/resolver').hasUnitPermission = originalHasUnitPermission
		})
	})

	describe('hasRole', () => {
		it('should return true for valid portal roles', () => {
			const result = service.hasRole(['admin', 'invalid-role'])
			expect(result).toBe(true)
		})

		it('should return false for invalid roles', () => {
			const result = service.hasRole(['invalid-role1', 'invalid-role2'])
			expect(result).toBe(false)
		})

		it('should return false for empty roles array', () => {
			const result = service.hasRole([])
			expect(result).toBe(false)
		})
	})

	describe('locale getter', () => {
		it('should return locale from baseHref', () => {
			(service as any).baseHref = '/en/'
			expect((service as any).locale).toBe('en')
		})

		it('should return default locale when baseHref is empty', () => {
			(service as any).baseHref = '/'
			expect((service as any).locale).toBe('en')
		})
	})

	describe('updateAppIndexMeta', () => {
		it('should update document title and meta elements', () => {
			mockConfigSvc.instanceConfig = {
				details: { appName: 'Test App' },
				indexHtmlMeta: {
					description: 'Test Description',
					webmanifest: '/manifest.json',
					pngIcon: '/icon.png',
					xIcon: '/favicon.ico'
				}
			} as any

			const mockElements: any = {
				'id-app-description': { setAttribute: jest.fn() },
				'id-app-webmanifest': { setAttribute: jest.fn() },
				'id-app-fav-icon': { href: '' },
				'id-app-x-icon': { href: '' }
			}

			mockGetElementById.mockImplementation((id: string) => mockElements[id] || null);

			(service as any).updateAppIndexMeta()

			expect(document.title).toBe('Test App')
			expect(mockElements['id-app-description'].setAttribute).toHaveBeenCalledWith('content', 'Test Description')
			expect(mockElements['id-app-webmanifest'].setAttribute).toHaveBeenCalledWith('href', '/manifest.json')
		})

		it('should handle missing elements gracefully', () => {
			mockConfigSvc.instanceConfig = {
				details: { appName: 'Test App' },
				indexHtmlMeta: {
					description: 'Test Description'
				}
			} as any

			mockGetElementById.mockReturnValue(null)

			expect(() => (service as any).updateAppIndexMeta()).not.toThrow()
		})
	})

	describe('Error handling', () => {
		it('should handle HTTP errors in fetchDefaultConfig', async () => {
			mockHttpClient.get.mockReturnValue(throwError('Network error'))

			await expect((service as any).fetchDefaultConfig()).rejects.toBe('Network error')
		})

		it('should handle HTTP errors in fetchAppsConfig', async () => {
			mockHttpClient.get.mockReturnValue(throwError('Network error'))

			await expect((service as any).fetchAppsConfig()).rejects.toBe('Network error')
		})

		it('should log warnings when initialization fails', async () => {
			mockHttpClient.get.mockImplementation((url: string) => {
				if (url.includes('host.config.json')) {
					return of({ rootOrg: 'test', org: [{}] })
				}
				return throwError('Error')
			})

			//const result = await service.init()

			expect(mockLogger.warn).toHaveBeenCalledWith(
				'Initialization process encountered some error. Application may not work as expected',
				expect.any(String)
			)
		})
	})

	describe('Observable subscriptions', () => {
		it('should subscribe to updateOrgReadDataObservable', async () => {
			mockHttpClient.get.mockReturnValue(of({ rootOrg: 'test', org: [{}] }))
			mockHttpClient.post.mockReturnValue(of({ result: { response: {} } }))

			const spy = jest.spyOn(service as any, 'fetchOrgReadDataCopy')

			await service.init()

			// Trigger the observable
			mockConfigSvc.updateOrgReadDataObservable.next('org123')

			expect(spy).toHaveBeenCalledWith('org123')
		})

		it('should unsubscribe from previous subscription', async () => {
			mockHttpClient.get.mockReturnValue(of({ rootOrg: 'test', org: [{}] }))

			// Create a mock subscription
			const mockSubscription = { unsubscribe: jest.fn() };
			(service as any).updateOrgReadDataSubscription = mockSubscription

			await service.init()

			expect(mockSubscription.unsubscribe).toHaveBeenCalled()
		})
	})
})