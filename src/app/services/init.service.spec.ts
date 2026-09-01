jest.mock('@sunbird-cb/collection', () => ({
	BtnSettingsService: jest.fn().mockImplementation(() => ({
		initializePrefChanges: jest.fn(),
	})),
}))

import { InitService } from './init.service'
import { of, throwError, Subject } from 'rxjs'

jest.mock('../../environments/environment', () => ({
	environment: {
		production: false,
		portalRoles: ['admin', 'user', 'moderator'],
	},
}))

const mockLogger = {
	removeConsoleAccess: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
}

const mockConfigSvc = {
	baseUrl: 'http://localhost:3000',
	isProduction: false,
	instanceConfig: null as any,
	rootOrg: null as any,
	org: null as any,
	activeOrg: null as any,
	appSetup: null as any,
	compentency: null as any,
	competency: null as any,
	unMappedUser: null as any,
	userProfile: null as any,
	userProfileV2: null as any,
	orgReadData: null as any,
	hasAcceptedTnc: false,
	profileDetailsStatus: false,
	isActive: false,
	userGroups: new Set<string>(),
	userRoles: new Set<string>(),
	restrictedFeatures: new Set<string>(),
	restrictedWidgets: new Set<string>(),
	appsConfig: null as any,
	primaryNavBar: null as any,
	pageNavBar: null as any,
	primaryNavBarConfig: null as any,
	sitePath: '/site',
	updateOrgReadDataObservable: new Subject<string>(),
}

const mockWidgetResolverService = { initialize: jest.fn() }
const mockSettingsSvc = { initializePrefChanges: jest.fn() }
const mockUserPreference = { fetchUserPreference: jest.fn(), initialize: jest.fn() }
const mockHttpClient = { get: jest.fn(), post: jest.fn() }
const mockTranslate = { use: jest.fn(), setDefaultLang: jest.fn() }
const mockMultilingualService = { getLanguage: jest.fn() }
const mockDomSanitizer = { bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('trusted-url') }
const mockIconRegistry = { addSvgIcon: jest.fn() }

const mockLocalStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
Object.defineProperty(window, 'location', {
	value: { pathname: '/test', origin: 'http://localhost:3000', href: 'http://localhost:3000/test' },
	writable: true,
})
Object.defineProperty(document, 'baseURI', { value: 'http://localhost:3000/', writable: true })
Object.defineProperty(document, 'title', { value: '', writable: true })

const mockGetElementById = jest.fn()
Object.defineProperty(document, 'getElementById', { value: mockGetElementById })

const hostConfig: any = {
	rootOrg: 'test-org', org: [{ id: 'org1' }], appSetup: {}, competency: {},
	disablePidCheck: true, featuredApps: [],
}
const siteConfig: any = {
	rootOrg: 'test-org', org: [{ id: 'org1' }], backgrounds: {},
	details: { appName: 'Test App' }, indexHtmlMeta: {}, featuredApps: [],
}
const appsConfig: any = { features: {}, groups: [], tourGuide: {} }

function setupSuccessHttpMocks() {
	mockHttpClient.get.mockImplementation((url: string) => {
		if (url.includes('host.config.json')) { return of(hostConfig) }
		if (url.includes('site.config.json')) { return of(siteConfig) }
		if (url.includes('apps.json')) { return of(appsConfig) }
		if (url.includes('features.config.json')) { return of({}) }
		if (url.includes('widgets.config.json')) { return of([]) }
		return of({})
	})
	mockHttpClient.post.mockReturnValue(of({ result: { response: { id: 'org123' } } }))
	mockGetElementById.mockReturnValue(null)
}

describe('InitService', () => {
	let service: InitService

	beforeEach(() => {
		jest.clearAllMocks()
		mockLocalStorage.getItem.mockReturnValue(null)
		mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('trusted-url')
		mockConfigSvc.userRoles = new Set<string>()
		mockConfigSvc.userGroups = new Set<string>()
		mockConfigSvc.restrictedFeatures = new Set<string>()
		mockConfigSvc.restrictedWidgets = new Set<string>()
		mockConfigSvc.instanceConfig = null
		mockConfigSvc.orgReadData = null
		mockConfigSvc.userProfile = null
		mockConfigSvc.unMappedUser = null
		mockConfigSvc.updateOrgReadDataObservable = new Subject<string>()

		service = new InitService(
			mockLogger as any,
			mockConfigSvc as any,
			mockWidgetResolverService as any,
			mockSettingsSvc as any,
			mockUserPreference as any,
			mockHttpClient as any,
			mockTranslate as any,
			mockMultilingualService as any,
			'/app',
			mockDomSanitizer as any,
			mockIconRegistry as any,
		)
	})

	describe('Constructor', () => {
		it('should create the service', () => { expect(service).toBeDefined() })

		it('should set isProduction from environment', () => {
			expect(mockConfigSvc.isProduction).toBe(false)
		})

		it('should register 22 svg icons', () => {
			expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledTimes(22)
		})

		it('should register pin icon with trusted url', () => {
			expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('pin', 'trusted-url')
		})

		it('should register facebook icon', () => {
			expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('facebook', 'trusted-url')
		})

		it('should register single-color-upload-file icon', () => {
			expect(mockIconRegistry.addSvgIcon).toHaveBeenCalledWith('single-color-upload-file', 'trusted-url')
		})

		it('should call bypassSecurityTrustResourceUrl 22 times', () => {
			expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledTimes(22)
		})
	})

	describe('hasRole', () => {
		it('should return true when at least one role matches portalRoles', () => {
			expect(service.hasRole(['admin'])).toBe(true)
		})

		it('should return true when multiple roles include a valid one', () => {
			expect(service.hasRole(['invalid-role', 'user'])).toBe(true)
		})

		it('should return false when no roles match portalRoles', () => {
			expect(service.hasRole(['invalid-role1', 'invalid-role2'])).toBe(false)
		})

		it('should return false for empty roles array', () => {
			expect(service.hasRole([])).toBe(false)
		})
	})

	describe('locale getter', () => {
		it('should return locale from baseHref', () => {
			; (service as any).baseHref = '/en/'
			expect((service as any).locale).toBe('en')
		})

		it('should return "en" when baseHref has no locale segment', () => {
			; (service as any).baseHref = '/'
			expect((service as any).locale).toBe('en')
		})

		it('should return "fr" for french locale baseHref', () => {
			; (service as any).baseHref = '/fr/'
			expect((service as any).locale).toBe('fr')
		})
	})

	describe('fetchDefaultConfig', () => {
		it('should GET host.config.json and populate configSvc fields', async () => {
			const config = {
				rootOrg: 'my-org', org: [{ id: 'o1' }, { id: 'o2' }],
				appSetup: { theme: 'dark' }, competency: { enabled: true },
			}
			mockHttpClient.get.mockReturnValue(of(config))
			const result = await (service as any).fetchDefaultConfig()
			expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:3000/host.config.json')
			expect(result).toEqual(config)
			expect(mockConfigSvc.instanceConfig).toEqual(config)
			expect(mockConfigSvc.rootOrg).toBe('my-org')
			expect(mockConfigSvc.org).toEqual([{ id: 'o1' }, { id: 'o2' }])
			expect(mockConfigSvc.activeOrg).toEqual({ id: 'o1' })
			expect(mockConfigSvc.appSetup).toEqual({ theme: 'dark' })
		})

		it('should set compentency from competency field', async () => {
			const config = { rootOrg: 'r', org: [{}], appSetup: {}, competency: { level: 3 } }
			mockHttpClient.get.mockReturnValue(of(config))
			await (service as any).fetchDefaultConfig()
			expect(mockConfigSvc.compentency).toEqual({ level: 3 })
		})

		it('should reject when HTTP call fails', async () => {
			mockHttpClient.get.mockReturnValue(throwError(new Error('Network error')))
			await expect((service as any).fetchDefaultConfig()).rejects.toThrow('Network error')
		})
	})

	describe('fetchAppsConfig', () => {
		it('should GET feature/apps.json and return config', async () => {
			const config = { features: { f1: { id: 'f1' } }, groups: [], tourGuide: {} }
			mockHttpClient.get.mockReturnValue(of(config))
			const result = await (service as any).fetchAppsConfig()
			expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:3000/feature/apps.json')
			expect(result).toEqual(config)
		})

		it('should reject when HTTP call fails', async () => {
			mockHttpClient.get.mockReturnValue(throwError(new Error('Apps config error')))
			await expect((service as any).fetchAppsConfig()).rejects.toThrow('Apps config error')
		})
	})

	describe('fetchOrgReadData', () => {
		it('should POST to org read endpoint and set orgReadData', async () => {
			const orgResponse = { id: 'org123', orgName: 'Test Org' }
			mockHttpClient.post.mockReturnValue(of({ result: { response: orgResponse } }))
			const userData = { organisations: [{ organisationId: 'org123' }] }
			await service.fetchOrgReadData(userData)
			expect(mockHttpClient.post).toHaveBeenCalledWith(
				'/apis/proxies/v8/org/v1/read',
				{ request: { organisationId: 'org123' } },
			)
			expect(mockConfigSvc.orgReadData).toEqual(orgResponse)
		})

		it('should not set orgReadData when response is null', async () => {
			mockHttpClient.post.mockReturnValue(of({ result: { response: null } }))
			await service.fetchOrgReadData({ organisations: [{ organisationId: 'org456' }] })
			expect(mockConfigSvc.orgReadData).toBeNull()
		})
	})

	describe('fetchOrgReadDataCopy', () => {
		it('should POST to org read endpoint with given id and set orgReadData', async () => {
			const orgResponse = { id: 'org789', orgName: 'Copy Org' }
			mockHttpClient.post.mockReturnValue(of({ result: { response: orgResponse } }))
			await service.fetchOrgReadDataCopy('org789')
			expect(mockHttpClient.post).toHaveBeenCalledWith(
				'/apis/proxies/v8/org/v1/read',
				{ request: { organisationId: 'org789' } },
			)
			expect(mockConfigSvc.orgReadData).toEqual(orgResponse)
		})

		it('should do nothing when id is empty string', async () => {
			await service.fetchOrgReadDataCopy('')
			expect(mockHttpClient.post).not.toHaveBeenCalled()
		})

		it('should not update orgReadData when response is null', async () => {
			mockHttpClient.post.mockReturnValue(of({ result: { response: null } }))
			await service.fetchOrgReadDataCopy('org999')
			expect(mockConfigSvc.orgReadData).toBeNull()
		})
	})

	describe('updateAppIndexMeta', () => {
		it('should update document title from instanceConfig', () => {
			mockConfigSvc.instanceConfig = { details: { appName: 'My Portal' }, indexHtmlMeta: {} } as any
				; (service as any).updateAppIndexMeta()
			expect(document.title).toBe('My Portal')
		})

		it('should set description meta content when element exists', () => {
			const descElem = { setAttribute: jest.fn() }
			mockGetElementById.mockImplementation((id: string) =>
				id === 'id-app-description' ? descElem : null,
			)
			mockConfigSvc.instanceConfig = {
				details: { appName: 'App' }, indexHtmlMeta: { description: 'My description' },
			} as any
				; (service as any).updateAppIndexMeta()
			expect(descElem.setAttribute).toHaveBeenCalledWith('content', 'My description')
		})

		it('should set webmanifest href when element exists', () => {
			const manifestElem = { setAttribute: jest.fn() }
			mockGetElementById.mockImplementation((id: string) =>
				id === 'id-app-webmanifest' ? manifestElem : null,
			)
			mockConfigSvc.instanceConfig = {
				details: { appName: 'App' }, indexHtmlMeta: { webmanifest: '/manifest.json' },
			} as any
				; (service as any).updateAppIndexMeta()
			expect(manifestElem.setAttribute).toHaveBeenCalledWith('href', '/manifest.json')
		})

		it('should set pngIcon href when element exists', () => {
			const pngElem: any = { href: '' }
			mockGetElementById.mockImplementation((id: string) =>
				id === 'id-app-fav-icon' ? pngElem : null,
			)
			mockConfigSvc.instanceConfig = {
				details: { appName: 'App' }, indexHtmlMeta: { pngIcon: '/icon.png' },
			} as any
				; (service as any).updateAppIndexMeta()
			expect(pngElem.href).toBe('/icon.png')
		})

		it('should set xIcon href when element exists', () => {
			const xElem: any = { href: '' }
			mockGetElementById.mockImplementation((id: string) =>
				id === 'id-app-x-icon' ? xElem : null,
			)
			mockConfigSvc.instanceConfig = {
				details: { appName: 'App' }, indexHtmlMeta: { xIcon: '/favicon.ico' },
			} as any
				; (service as any).updateAppIndexMeta()
			expect(xElem.href).toBe('/favicon.ico')
		})

		it('should not throw when elements are missing', () => {
			mockGetElementById.mockReturnValue(null)
			mockConfigSvc.instanceConfig = {
				details: { appName: 'App' },
				indexHtmlMeta: { description: 'Desc', webmanifest: '/m.json', pngIcon: '/i.png', xIcon: '/x.ico' },
			} as any
			expect(() => (service as any).updateAppIndexMeta()).not.toThrow()
		})

		it('should do nothing when instanceConfig is null', () => {
			mockConfigSvc.instanceConfig = null
			expect(() => (service as any).updateAppIndexMeta()).not.toThrow()
		})
	})

	describe('updateNavConfig', () => {
		it('should set primaryNavBar and pageNavBar from instanceConfig backgrounds', () => {
			mockConfigSvc.instanceConfig = {
				backgrounds: { primaryNavBar: { color: 'blue' }, pageNavBar: { color: 'red' } },
				primaryNavBarConfig: { items: [] },
			} as any
				; (service as any).updateNavConfig()
			expect(mockConfigSvc.primaryNavBar).toEqual({ color: 'blue' })
			expect(mockConfigSvc.pageNavBar).toEqual({ color: 'red' })
			expect(mockConfigSvc.primaryNavBarConfig).toEqual({ items: [] })
		})

		it('should do nothing when instanceConfig is null', () => {
			mockConfigSvc.instanceConfig = null
			expect(() => (service as any).updateNavConfig()).not.toThrow()
		})
	})

	describe('defaultRedirectUrl getter', () => {
		it('should return document.baseURI', () => {
			expect((service as any).defaultRedirectUrl).toBe('http://localhost:3000/')
		})
	})

	describe('init', () => {
		beforeEach(() => {
			setupSuccessHttpMocks()
		})

		it('should return true on successful initialization', async () => {
			window.location.pathname = '/dashboard'
			const result = await service.init()
			expect(result).toBe(true)
		})

		it('should call settingsSvc.initializePrefChanges after init', async () => {
			window.location.pathname = '/dashboard'
			await service.init()
			expect(mockSettingsSvc.initializePrefChanges).toHaveBeenCalledWith(false)
		})

		it('should call widgetResolverService.initialize after init', async () => {
			window.location.pathname = '/dashboard'
			await service.init()
			expect(mockWidgetResolverService.initialize).toHaveBeenCalledWith(
				mockConfigSvc.restrictedWidgets,
				mockConfigSvc.userRoles,
				mockConfigSvc.userGroups,
				mockConfigSvc.restrictedFeatures,
			)
		})

		it('should call userPreference.initialize after init', async () => {
			window.location.pathname = '/dashboard'
			await service.init()
			expect(mockUserPreference.initialize).toHaveBeenCalled()
		})

		it('should call multilingualService.getLanguage at end of init', async () => {
			window.location.pathname = '/dashboard'
			await service.init()
			expect(mockMultilingualService.getLanguage).toHaveBeenCalled()
		})

		it('should skip fetchStartUpDetails for public path', async () => {
			window.location.pathname = '/public/page'
			await service.init()
			expect(mockHttpClient.get).not.toHaveBeenCalledWith(
				expect.stringContaining('/apis/proxies/v8/api/user/v2/read'),
			)
		})

		it('should return false and log info when fetchStartUpDetails throws', async () => {
			window.location.pathname = '/dashboard'
			mockHttpClient.get.mockImplementation((url: string) => {
				if (url.includes('host.config.json')) {
					return of({ rootOrg: 'r', org: [{}], appSetup: {}, disablePidCheck: false })
				}
				return throwError(new Error('fail'))
			})
			const result = await service.init()
			expect(result).toBe(false)
			expect(mockLogger.info).toHaveBeenCalledWith('Not Authenticated')
		})

		it('should log warn when downstream init fails', async () => {
			window.location.pathname = '/public/page'
			mockHttpClient.get.mockImplementation((url: string) => {
				if (url.includes('host.config.json')) { return of(hostConfig) }
				if (url.includes('apps.json')) { return of(appsConfig) }
				if (url.includes('site.config.json')) { return of(siteConfig) }
				if (url.includes('widgets.config.json')) { return of([]) }
				if (url.includes('features.config.json')) { return throwError(new Error('features fail')) }
				return of({})
			})
			await service.init()
			expect(mockLogger.warn).toHaveBeenCalledWith(
				'Initialization process encountered some error. Application may not work as expected',
				expect.any(Error),
			)
		})

		it('should set default language to en when no localStorage and no locals', async () => {
			window.location.pathname = '/public/page'
			mockLocalStorage.getItem.mockReturnValue(null)
			await service.init()
			expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('websiteLanguage', 'en')
		})

		it('should use language from localStorage when websiteLanguage is set and locals exist', async () => {
			window.location.pathname = '/public/page'
			mockConfigSvc.unMappedUser = null
			mockLocalStorage.getItem.mockReturnValue('hi')
			mockHttpClient.get.mockImplementation((url: string) => {
				if (url.includes('host.config.json')) {
					return of({ ...hostConfig, locals: [{ path: 'en' }] })
				}
				if (url.includes('site.config.json')) {
					return of({ ...siteConfig, locals: [{ path: 'en' }] })
				}
				if (url.includes('apps.json')) { return of(appsConfig) }
				if (url.includes('features.config.json')) { return of({}) }
				if (url.includes('widgets.config.json')) { return of([]) }
				return of({})
			})
			await service.init()
			expect(mockTranslate.use).toHaveBeenCalled()
		})

		it('should unsubscribe previous updateOrgReadDataSubscription if exists', async () => {
			window.location.pathname = '/public/page'
			const mockSub = { unsubscribe: jest.fn() }
				; (service as any).updateOrgReadDataSubscription = mockSub
			await service.init()
			expect(mockSub.unsubscribe).toHaveBeenCalled()
		})

		it('should subscribe to updateOrgReadDataObservable and call fetchOrgReadDataCopy', async () => {
			window.location.pathname = '/public/page'
			const fetchSpy = jest.spyOn(service, 'fetchOrgReadDataCopy').mockResolvedValue(undefined)
			await service.init()
			mockConfigSvc.updateOrgReadDataObservable.next('org123')
			expect(fetchSpy).toHaveBeenCalledWith('org123')
		})

		it('should not call fetchOrgReadDataCopy when observable emits empty string', async () => {
			window.location.pathname = '/public/page'
			const fetchSpy = jest.spyOn(service, 'fetchOrgReadDataCopy').mockResolvedValue(undefined)
			await service.init()
			mockConfigSvc.updateOrgReadDataObservable.next('')
			expect(fetchSpy).not.toHaveBeenCalled()
		})
	})

	describe('fetchStartUpDetails', () => {
		beforeEach(() => {
			mockConfigSvc.instanceConfig = { disablePidCheck: false } as any
		})

		it('should return public roles when disablePidCheck is true', async () => {
			mockConfigSvc.instanceConfig = { disablePidCheck: true } as any
			const result = await (service as any).fetchStartUpDetails()
			expect(result.profileDetailsStatus).toBe(true)
			expect(result.tncStatus).toBe(true)
		})

		it('should set userProfile when valid user with valid roles is returned', async () => {
			const userRes = {
				result: {
					response: {
						userId: 'u1', firstName: 'Alice', userName: 'alice', email: 'alice@test.com',
						roles: ['admin'], organisations: [],
						rootOrg: { isInstitute: false }, rootOrgId: 'r1',
						profileDetails: {
							personalDetails: { firstname: 'Alice', primaryEmail: 'alice@test.com' },
							mandatoryFieldsExists: true,
						},
					},
				},
			}
			mockHttpClient.get.mockReturnValue(of(userRes))
			const result = await (service as any).fetchStartUpDetails()
			expect(mockConfigSvc.userProfile).not.toBeNull()
			expect(mockConfigSvc.userProfile.userId).toBe('u1')
			expect(result.roles).toContain('admin')
		})

		it('should add isInstuteOrg role when rootOrg.isInstitute is true', async () => {
			const userRes = {
				result: {
					response: {
						userId: 'u2', roles: ['moderator'], organisations: [],
						rootOrg: { isInstitute: true }, rootOrgId: 'r2',
					},
				},
			}
			mockHttpClient.get.mockImplementation((url: string) => {
				if (url.includes('orgProfile')) { return of({ result: { result: null } }) }
				return of(userRes)
			})
			await (service as any).fetchStartUpDetails()
			expect(mockConfigSvc.userRoles.has('isInstuteOrg')).toBe(true)
		})

		it('should set surveyPopup to false when already false in localStorage', async () => {
			mockLocalStorage.getItem.mockReturnValue('false')
			mockConfigSvc.instanceConfig = { disablePidCheck: true } as any
			await (service as any).fetchStartUpDetails()
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('surveyPopup', 'false')
		})

		it('should set surveyPopup to true when not set in localStorage', async () => {
			mockLocalStorage.getItem.mockReturnValue(null)
			mockConfigSvc.instanceConfig = { disablePidCheck: true } as any
			await (service as any).fetchStartUpDetails()
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('surveyPopup', 'true')
		})

		it('should throw Invalid user when HTTP call fails', async () => {
			mockHttpClient.get.mockReturnValue(throwError(new Error('HTTP fail')))
			await expect((service as any).fetchStartUpDetails()).rejects.toThrow('Invalid user')
		})

		it('should call fetchOrgReadData when user has organisations', async () => {
			const userRes = {
				result: {
					response: {
						userId: 'u3', roles: ['admin'],
						organisations: [{ organisationId: 'org99' }],
						rootOrg: { isInstitute: false }, rootOrgId: 'r3',
					},
				},
			}
			mockHttpClient.get.mockReturnValue(of(userRes))
			mockHttpClient.post.mockReturnValue(of({ result: { response: { id: 'org99' } } }))
			const spy = jest.spyOn(service, 'fetchOrgReadData')
			await (service as any).fetchStartUpDetails()
			expect(spy).toHaveBeenCalled()
		})

		it('should set userProfile to null when profile fetch throws', async () => {
			mockHttpClient.get.mockReturnValue(throwError(new Error('profile fail')))
			await expect((service as any).fetchStartUpDetails()).rejects.toThrow('Invalid user')
			expect(mockConfigSvc.userProfile).toBeNull()
		})
	})
})
