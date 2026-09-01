
import { QuickTourComponent } from './quick-tour.component'
// import { ConfigurationsService } from '@sunbird-cb/utils'

// Mock the ConfigurationsService
class MockConfigurationsService {
    instanceConfig: any = null;
    activeLocale: any = null;
}

describe('QuickTourComponent', () => {
    let component: QuickTourComponent
    let mockConfigService: MockConfigurationsService

    beforeEach(() => {
        mockConfigService = new MockConfigurationsService()
        component = new QuickTourComponent(mockConfigService as any)
    })

    describe('Component Initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.appLanguage).toBe('en')
            expect(component.introVideos).toBeUndefined()
            expect(component.widgetResolverData).toEqual({
                widgetData: {
                    url: '',
                    autoplay: true,
                    identifier: '',
                },
                widgetHostClass: 'video-full block vertical-height-without-nav',
                widgetSubType: 'playerVideo',
                widgetType: 'player',
            })
        })

        it('should have configSvc injected', () => {
            expect((component as any).configSvc).toBe(mockConfigService)
        })
    })

    describe('ngOnInit - instanceConfig scenarios', () => {
        it('should handle when instanceConfig is null', () => {
            mockConfigService.instanceConfig = null

            component.ngOnInit()

            expect(component.introVideos).toBeUndefined()
            expect(component.widgetResolverData.widgetData.url).toBeUndefined()
        })

        it('should handle when instanceConfig is undefined', () => {
            mockConfigService.instanceConfig = undefined

            component.ngOnInit()

            expect(component.introVideos).toBeUndefined()
            expect(component.widgetResolverData.widgetData.url).toBeUndefined()
        })

        it('should set introVideos from instanceConfig.tourVideo', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            component.ngOnInit()

            expect(component.introVideos).toEqual(mockTourVideo)
        })

        it('should handle instanceConfig without tourVideo property', () => {
            mockConfigService.instanceConfig = { someOtherProperty: 'value' }

            component.ngOnInit()

            expect(component.introVideos).toBeUndefined()
        })
    })

    describe('ngOnInit - language detection scenarios', () => {
        it('should keep default language "en" when introVideos has only one key', () => {
            const mockTourVideo = { en: 'video-en.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'de' }

            component.ngOnInit()

            expect(component.appLanguage).toBe('en')
        })

        it('should set language to "de" when introVideos has multiple keys and activeLocale.path is "de"', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'de' }

            component.ngOnInit()

            expect(component.appLanguage).toBe('de')
        })

        it('should default to "en" when introVideos has multiple keys but activeLocale.path is not "de"', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4', fr: 'video-fr.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'fr' }

            component.ngOnInit()

            expect(component.appLanguage).toBe('en')
        })

        it('should default to "en" when introVideos has multiple keys but activeLocale is null', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = null

            component.ngOnInit()

            expect(component.appLanguage).toBe('en')
        })

        it('should default to "en" when introVideos has multiple keys but activeLocale is undefined', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = undefined

            component.ngOnInit()

            expect(component.appLanguage).toBe('en')
        })

        it('should default to "en" when introVideos has multiple keys but activeLocale.path is empty string', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: '' }

            component.ngOnInit()

            expect(component.appLanguage).toBe('en')
        })

        it('should handle activeLocale without path property', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { someOtherProp: 'value' }

            component.ngOnInit()

            expect(component.appLanguage).toBe('en')
        })
    })

    describe('ngOnInit - widgetResolverData update scenarios', () => {
        it('should update widgetResolverData with correct URL for English', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'fr' } // Will default to 'en'

            component.ngOnInit()

            expect(component.widgetResolverData.widgetData.url).toBe('video-en.mp4')
            expect(component.widgetResolverData.widgetData.autoplay).toBe(true)
            expect(component.widgetResolverData.widgetData.identifier).toBe('')
            expect(component.widgetResolverData.widgetHostClass).toBe('video-full block vertical-height-without-nav')
            expect(component.widgetResolverData.widgetSubType).toBe('playerVideo')
            expect(component.widgetResolverData.widgetType).toBe('player')
        })

        it('should update widgetResolverData with correct URL for German', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'de' }

            component.ngOnInit()

            expect(component.widgetResolverData.widgetData.url).toBe('video-de.mp4')
        })

        it('should preserve other widgetResolverData properties when updating', () => {
            const mockTourVideo = { en: 'video-en.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            const originalWidgetData = { ...component.widgetResolverData }

            component.ngOnInit()

            expect(component.widgetResolverData.widgetHostClass).toBe(originalWidgetData.widgetHostClass)
            expect(component.widgetResolverData.widgetSubType).toBe(originalWidgetData.widgetSubType)
            expect(component.widgetResolverData.widgetType).toBe(originalWidgetData.widgetType)
            expect(component.widgetResolverData.widgetData.autoplay).toBe(originalWidgetData.widgetData.autoplay)
            expect(component.widgetResolverData.widgetData.identifier).toBe(originalWidgetData.widgetData.identifier)
        })

        it('should handle when video URL is undefined for selected language', () => {
            const mockTourVideo = { en: undefined, de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'fr' } // Will use 'en'

            component.ngOnInit()

            expect(component.widgetResolverData.widgetData.url).toBeUndefined()
        })

        it('should handle when video URL is null for selected language', () => {
            const mockTourVideo = { en: null, de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            component.ngOnInit()

            expect(component.widgetResolverData.widgetData.url).toBeNull()
        })

        it('should handle when video URL is empty string for selected language', () => {
            const mockTourVideo = { en: '', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            component.ngOnInit()

            expect(component.widgetResolverData.widgetData.url).toBe('')
        })
    })

    describe('Edge Cases and Error Scenarios', () => {
        it('should handle empty introVideos object', () => {
            const mockTourVideo = {}
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            component.ngOnInit()

            expect(component.appLanguage).toBe('en')
            expect(component.widgetResolverData.widgetData.url).toBeUndefined()
        })

        it('should handle introVideos as null', () => {
            mockConfigService.instanceConfig = { tourVideo: null }

            component.ngOnInit()

            expect(component.introVideos).toBeNull()
            expect(component.widgetResolverData.widgetData.url).toBeUndefined()
        })

        it('should handle multiple properties in introVideos with various data types', () => {
            const mockTourVideo = {
                en: 'video-en.mp4',
                de: 'video-de.mp4',
                fr: 'video-fr.mp4',
                es: 'video-es.mp4',
                it: 'video-it.mp4'
            }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'de' }

            component.ngOnInit()

            expect(Object.keys(component.introVideos).length).toBe(5)
            expect(component.appLanguage).toBe('de')
            expect(component.widgetResolverData.widgetData.url).toBe('video-de.mp4')
        })

        it('should handle exactly 2 keys in introVideos (boundary test)', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }
            mockConfigService.activeLocale = { path: 'de' }

            component.ngOnInit()

            expect(Object.keys(component.introVideos).length).toBe(2)
            expect(component.appLanguage).toBe('de')
        })

        it('should preserve immutability of original widgetResolverData structure', () => {
            const mockTourVideo = { en: 'video-en.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            const originalStructure = JSON.parse(JSON.stringify(component.widgetResolverData))

            component.ngOnInit()

            // Only URL should change, everything else should remain the same
            expect(component.widgetResolverData.widgetHostClass).toBe(originalStructure.widgetHostClass)
            expect(component.widgetResolverData.widgetSubType).toBe(originalStructure.widgetSubType)
            expect(component.widgetResolverData.widgetType).toBe(originalStructure.widgetType)
            expect(component.widgetResolverData.widgetData.autoplay).toBe(originalStructure.widgetData.autoplay)
            expect(component.widgetResolverData.widgetData.identifier).toBe(originalStructure.widgetData.identifier)
            expect(component.widgetResolverData.widgetData.url).not.toBe(originalStructure.widgetData.url)
        })
    })

    describe('Object.keys behavior verification', () => {
        it('should correctly evaluate Object.keys length for single key', () => {
            const mockTourVideo = { en: 'video-en.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            component.ngOnInit()

            expect(Object.keys(component.introVideos).length).toBe(1)
            expect(Object.keys(component.introVideos).length > 1).toBe(false)
        })

        it('should correctly evaluate Object.keys length for multiple keys', () => {
            const mockTourVideo = { en: 'video-en.mp4', de: 'video-de.mp4' }
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            component.ngOnInit()

            expect(Object.keys(component.introVideos).length).toBe(2)
            expect(Object.keys(component.introVideos).length > 1).toBe(true)
        })

        it('should correctly evaluate Object.keys length for empty object', () => {
            const mockTourVideo = {}
            mockConfigService.instanceConfig = { tourVideo: mockTourVideo }

            component.ngOnInit()

            expect(Object.keys(component.introVideos).length).toBe(0)
            expect(Object.keys(component.introVideos).length > 1).toBe(false)
        })
    })
})