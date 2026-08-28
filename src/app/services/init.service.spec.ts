/* tslint:disable:indent */
(window as any)['env'] = {
	name: 'test-environment',
	sitePath: '/test-site-path',
	karmYogiPath: '/test-karm-yogi-path',
	cbpPath: '/test-cbp-path',
}
import '@angular/compiler'
import { HttpClient } from '@angular/common/http'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'
import { BtnSettingsService } from '@sunbird-cb/collection'
import { SbUiResolverService } from '@sunbird-cb/resolver-v2'
import {
	ConfigurationsService,
	LoggerService,
	MultilingualTranslationsService,
	UserPreferenceService,
} from '@sunbird-cb/utils-v2'
import { TranslateService } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'
import { InitService } from './init.service'

describe('InitService', () => {
	let service: InitService
	let logger: any
	let configSvc: any
	let http: any

	const buildService = () => {
		logger = { warn: jest.fn(), info: jest.fn(), error: jest.fn() }
		configSvc = { baseUrl: '/test-base-url', globalConfig: undefined }
		http = { get: jest.fn(), post: jest.fn() }

		const widgetResolverService: any = { initialize: jest.fn() }
		const settingsSvc: any = { initializePrefChanges: jest.fn() }
		const userPreference: any = { initialize: jest.fn() }
		const translate: any = { use: jest.fn(), setDefaultLang: jest.fn() }
		const multilingualService: any = { getLanguage: jest.fn() }
		const domSanitizer: any = { bypassSecurityTrustResourceUrl: jest.fn((url: string) => url) }
		const iconRegistry: any = { addSvgIcon: jest.fn() }

		return new InitService(
			logger as LoggerService,
			configSvc as ConfigurationsService,
			widgetResolverService as SbUiResolverService,
			settingsSvc as BtnSettingsService,
			userPreference as UserPreferenceService,
			http as HttpClient,
			translate as TranslateService,
			multilingualService as MultilingualTranslationsService,
			'/' as any,
			domSanitizer as DomSanitizer,
			iconRegistry as MatIconRegistry
		)
	}

	beforeEach(() => {
		service = buildService()
	})

	it('should create a instance of component', () => {
		expect(service).toBeTruthy()
	})

	describe('fetchGlobalConfig', () => {
		const formData = {
			cbpPlanYear: {
				currentYear: '2026-27',
				yearList: [
					{ label: '2026-27 (Current A.Y.)', value: '2026-27' },
					{ label: '2025-26', value: '2025-26' },
				],
			},
		}

		it('should post the mdo global page-configuration request to the form read api', async () => {
			http.post.mockReturnValue(of({ result: { form: { data: formData } } }))

			await (service as any).fetchGlobalConfig()

			expect(http.post).toHaveBeenCalledWith('/apis/v1/form/read', {
				request: {
					type: 'mdo',
					subType: 'global',
					action: 'page-configuration',
					component: 'portal',
					rootOrgId: '*',
				},
			})
		})

		it('should store the form data on the config service', async () => {
			http.post.mockReturnValue(of({ result: { form: { data: formData } } }))

			const returned = await (service as any).fetchGlobalConfig()

			expect(configSvc.globalConfig).toEqual(formData)
			expect(returned).toEqual(formData)
		})

		it('should store null when the response carries no form data', async () => {
			http.post.mockReturnValue(of({ result: { form: {} } }))

			await (service as any).fetchGlobalConfig()

			expect(configSvc.globalConfig).toBeNull()
		})

		it('should store null and warn when the form read api fails', async () => {
			http.post.mockReturnValue(throwError(() => new Error('form read down')))

			const returned = await (service as any).fetchGlobalConfig()

			expect(configSvc.globalConfig).toBeNull()
			expect(returned).toBeNull()
			expect(logger.warn).toHaveBeenCalledWith('Unable to fetch the global config', expect.any(Error))
		})

		it('should not reject when the form read api fails, so app init can continue', async () => {
			http.post.mockReturnValue(throwError(() => new Error('form read down')))

			await expect((service as any).fetchGlobalConfig()).resolves.toBeNull()
		})
	})
})
