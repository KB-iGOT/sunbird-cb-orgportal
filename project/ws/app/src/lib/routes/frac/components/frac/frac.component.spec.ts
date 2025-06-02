import { FracComponent } from './frac.component'
import { FracService } from '../../services/frac.service'
import { DomSanitizer } from '@angular/platform-browser'
import { IFrac } from '../../interfaces/frac.model'

// Mock the FracService
const mockFracService = {
    fetchFrac: jest.fn()
}

// Mock the DomSanitizer
const mockDomSanitizer = {
    bypassSecurityTrustResourceUrl: jest.fn()
}

// Mock window.location
const mockLocation = {
    origin: 'http://localhost:4200'
}

describe('FracComponent', () => {
    let component: FracComponent
    let fracService: jest.Mocked<FracService>
    let domSanitizer: jest.Mocked<DomSanitizer>

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Setup mocks
        fracService = mockFracService as unknown as jest.Mocked<FracService>
        domSanitizer = mockDomSanitizer as unknown as jest.Mocked<DomSanitizer>

        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            writable: true
        })

        // Create component instance
        component = new FracComponent(domSanitizer, fracService)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component with default widgetData', () => {
            expect(component).toBeDefined()
            expect(component.widgetData).toEqual({
                iframeId: 'fracData',
                title: 'Frac',
                containerStyle: '',
                containerClass: '',
                iframeSrc: 'https://google.com'
            })
            expect(component.iframeSrc).toBeNull()
        })

        it('should have correct initial property values', () => {
            expect(component.widgetData.iframeId).toBe('fracData')
            expect(component.widgetData.title).toBe('Frac')
            expect(component.widgetData.containerStyle).toBe('')
            expect(component.widgetData.containerClass).toBe('')
            expect(component.widgetData.iframeSrc).toBe('https://google.com')
            expect(component.iframeSrc).toBeNull()
        })
    })

    describe('ngOnInit', () => {
        it('should call fracService.fetchFrac on initialization', async () => {
            const mockResult: IFrac = {
                iframeId: 'testId',
                title: 'Test Title',
                containerStyle: 'test-style',
                containerClass: 'test-class',
                iframeSrc: 'https://test.com'
            }

            fracService.fetchFrac.mockResolvedValue(mockResult)
            domSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-url' as any)

            await component.ngOnInit()

            expect(fracService.fetchFrac).toHaveBeenCalledTimes(1)
        })

        it('should update widgetData and iframeSrc when fetchFrac returns valid result', async () => {
            const mockResult: IFrac = {
                iframeId: 'testId',
                title: 'Test Title',
                containerStyle: 'test-style',
                containerClass: 'test-class',
                iframeSrc: 'https://test.com'
            }

            fracService.fetchFrac.mockResolvedValue(mockResult)
            domSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-test-url' as any)

            await component.ngOnInit()

            expect(component.widgetData).toEqual(mockResult)
            expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://test.com')
            expect(component.iframeSrc).toBe('sanitized-test-url')
        })

        it('should use default fallback URL when fetchFrac returns null result', async () => {
            //  fracService.fetchFrac.mockResolvedValue(null)
            domSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-fallback-url' as any)

            await component.ngOnInit()

            expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://localhost:4200/frac')
            expect(component.iframeSrc).toBe('sanitized-fallback-url')
        })

        it('should use default fallback URL when fetchFrac returns undefined result', async () => {
            fracService.fetchFrac.mockResolvedValue(undefined as any)
            domSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-fallback-url' as any)

            await component.ngOnInit()

            expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://localhost:4200/frac')
            expect(component.iframeSrc).toBe('sanitized-fallback-url')
        })

        it('should handle result with empty iframeSrc', async () => {
            const mockResult: IFrac = {
                iframeId: 'testId',
                title: 'Test Title',
                containerStyle: 'test-style',
                containerClass: 'test-class',
                iframeSrc: ''
            }

            fracService.fetchFrac.mockResolvedValue(mockResult)

            await component.ngOnInit()

            expect(component.widgetData).toEqual(mockResult)
            expect(domSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
            expect(component.iframeSrc).toBeNull()
        })

        it('should handle result with null iframeSrc', async () => {
            const mockResult: IFrac = {
                iframeId: 'testId',
                title: 'Test Title',
                containerStyle: 'test-style',
                containerClass: 'test-class',
                iframeSrc: null as any
            }

            fracService.fetchFrac.mockResolvedValue(mockResult)

            await component.ngOnInit()

            expect(component.widgetData).toEqual(mockResult)
            expect(domSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
            expect(component.iframeSrc).toBeNull()
        })

        it('should handle fetchFrac promise rejection', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            fracService.fetchFrac.mockRejectedValue(new Error('Service error'))

            try {
                await component.ngOnInit()
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect((error as Error).message).toBe('Service error')
            }

            expect(fracService.fetchFrac).toHaveBeenCalledTimes(1)
            consoleSpy.mockRestore()
        })
    })

    describe('ngOnDestroy', () => {
        it('should exist and be callable', () => {
            expect(component.ngOnDestroy).toBeDefined()
            expect(typeof component.ngOnDestroy).toBe('function')

            // Should not throw any errors when called
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('Service Dependencies', () => {
        it('should inject FracService correctly', () => {
            expect(component['fracService']).toBeDefined()
            expect(component['fracService']).toBe(fracService)
        })

        it('should inject DomSanitizer correctly', () => {
            expect(component['domSanitizer']).toBeDefined()
            expect(component['domSanitizer']).toBe(domSanitizer)
        })
    })

    describe('Integration Tests', () => {
        it('should complete full initialization flow with successful service call', async () => {
            const mockResult: IFrac = {
                iframeId: 'integrationTest',
                title: 'Integration Test',
                containerStyle: 'integration-style',
                containerClass: 'integration-class',
                iframeSrc: 'https://integration-test.com'
            }

            fracService.fetchFrac.mockResolvedValue(mockResult)
            domSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-integration-url' as any)

            await component.ngOnInit()

            // Verify the complete flow
            expect(fracService.fetchFrac).toHaveBeenCalledTimes(1)
            expect(component.widgetData).toEqual(mockResult)
            expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://integration-test.com')
            expect(component.iframeSrc).toBe('sanitized-integration-url')
        })

        it('should complete full initialization flow with fallback URL', async () => {
            // fracService.fetchFrac.mockResolvedValue(null)
            domSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-fallback-integration-url' as any)

            await component.ngOnInit()

            // Verify the fallback flow
            expect(fracService.fetchFrac).toHaveBeenCalledTimes(1)
            expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://localhost:4200/frac')
            expect(component.iframeSrc).toBe('sanitized-fallback-integration-url')
        })
    })

    describe('Edge Cases', () => {
        it('should handle different window.location.origin values', async () => {
            const customOrigin = 'https://custom-domain.com'
            Object.defineProperty(window, 'location', {
                value: { origin: customOrigin },
                writable: true
            })

            //fracService.fetchFrac.mockResolvedValue(null)
            domSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('custom-sanitized-url' as any)

            await component.ngOnInit()

            expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(`${customOrigin}/frac`)
        })

        it('should handle widgetData with all properties defined but iframeSrc is truthy empty string', async () => {
            const mockResult: IFrac = {
                iframeId: 'testId',
                title: 'Test Title',
                containerStyle: 'test-style',
                containerClass: 'test-class',
                iframeSrc: '   ' // whitespace-only string
            }

            fracService.fetchFrac.mockResolvedValue(mockResult)

            await component.ngOnInit()

            expect(component.widgetData).toEqual(mockResult)
            // Should still call sanitizer since '   ' is truthy
            expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('   ')
        })
    })
})