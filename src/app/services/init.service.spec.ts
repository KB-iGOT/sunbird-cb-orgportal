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
import { WidgetResolverService } from '@sunbird-cb/resolver'
import { ConfigurationsService, LoggerService, UserPreferenceService } from '@sunbird-cb/utils-v2'
import { InitService } from './init.service'

describe('InitService', () => {
	let component: InitService

	const logger: Partial<LoggerService> = {}
	const configSvc: Partial<ConfigurationsService> = {}
	const widgetResolverService: Partial<WidgetResolverService> = {}
	const settingsSvc: Partial<BtnSettingsService> = {}
	const userPreference: Partial<UserPreferenceService> = {}
	const http: Partial<HttpClient> = {}
	const baseHref: any = {}
	const domSanitizer: Partial<DomSanitizer> = {}
	const iconRegistry: Partial<MatIconRegistry> = {}

	beforeAll(() => {
		component = new InitService(
			logger as LoggerService,
			configSvc as ConfigurationsService,
			widgetResolverService as WidgetResolverService,
			settingsSvc as BtnSettingsService,
			userPreference as UserPreferenceService,
			http as HttpClient,
			baseHref as any,
			domSanitizer as DomSanitizer,
			iconRegistry as MatIconRegistry
		)
	})

	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetAllMocks()
	})

	it('should create a instance of component', () => {
		expect(component).toBeTruthy()
	})
})
