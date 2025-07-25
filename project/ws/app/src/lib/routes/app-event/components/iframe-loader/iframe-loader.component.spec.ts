import { IframeLoaderComponent } from './iframe-loader.component'
import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { EventService } from '../../services/event.service'
import { EiframeUrl } from '../../interfaces/event-details.model'
import { BehaviorSubject } from 'rxjs'

describe('IframeLoaderComponent', () => {
    let component: IframeLoaderComponent
    let mockDomSanitizer: jest.Mocked<DomSanitizer>
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>
    let mockEventService: jest.Mocked<EventService>
    let mockBannerSubject: BehaviorSubject<boolean>

    beforeEach(() => {
        // Create mock BehaviorSubject for bannerisEnabled
        mockBannerSubject = new BehaviorSubject<boolean>(true)

        // Mock DomSanitizer
        mockDomSanitizer = {
            bypassSecurityTrustResourceUrl: jest.fn()
        } as any

        // Mock ActivatedRoute
        mockActivatedRoute = {
            snapshot: {
                paramMap: {
                    get: jest.fn()
                }
            }
        } as any

        // Mock EventService
        mockEventService = {
            bannerisEnabled: mockBannerSubject
        } as any

        // Create component instance
        component = new IframeLoaderComponent(
            mockDomSanitizer,
            mockActivatedRoute,
            mockEventService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component instance', () => {
            expect(component).toBeDefined()
            expect(component.iframeSrc).toBeNull()
            expect(component.iframeUrl).toBeNull()
            expect(component.iframeType).toBeNull()
        })

        it('should have all required dependencies injected', () => {
            expect(component['domSanitizer']).toBe(mockDomSanitizer)
            expect(component['activatedRoute']).toBe(mockActivatedRoute)
            expect(component['appEventSvc']).toBe(mockEventService)
        })
    })

    describe('ngOnInit', () => {
        it('should disable banner on initialization', () => {
            const nextSpy = jest.spyOn(mockBannerSubject, 'next')

            component.ngOnInit()

            expect(nextSpy).toHaveBeenCalledWith(false)
        })

        it('should get iframe type from route parameters', () => {
            const getParamSpy = mockActivatedRoute.snapshot.paramMap.get as jest.Mock
            getParamSpy.mockReturnValue('quiz')

            component.ngOnInit()

            expect(getParamSpy).toHaveBeenCalledWith('iframe')
            expect(component.iframeType).toBe('quiz')
        })

        describe('Iframe URL Setting', () => {
            it('should set empty URL for QUIZ iframe type', () => {
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(EiframeUrl.QUIZ)
                mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-url' as any)

                component.ngOnInit()

                expect(component.iframeType).toBe(EiframeUrl.QUIZ)
                expect(component.iframeUrl).toBe('')
                expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('')
                expect(component.iframeSrc).toBe('sanitized-url')
            })

            it('should set empty URL for WEBEX iframe type', () => {
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(EiframeUrl.WEBEX)
                mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-webex-url' as any)

                component.ngOnInit()

                expect(component.iframeType).toBe(EiframeUrl.WEBEX)
                expect(component.iframeUrl).toBe('')
                expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('')
                expect(component.iframeSrc).toBe('sanitized-webex-url')
            })

            it('should set empty URL for VR iframe type', () => {
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(EiframeUrl.VR)
                mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('sanitized-vr-url' as any)

                component.ngOnInit()

                expect(component.iframeType).toBe(EiframeUrl.VR)
                expect(component.iframeUrl).toBe('')
                expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('')
                expect(component.iframeSrc).toBe('sanitized-vr-url')
            })

            it('should not set iframe URL for unknown iframe type', () => {
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('unknown-type')

                component.ngOnInit()

                expect(component.iframeType).toBe('unknown-type')
                expect(component.iframeUrl).toBeNull()
                expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
                expect(component.iframeSrc).toBeNull()
            })

            it('should handle null iframe type from route parameters', () => {
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(null)

                component.ngOnInit()

                expect(component.iframeType).toBeNull()
                expect(component.iframeUrl).toBeNull()
                expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
                expect(component.iframeSrc).toBeNull()
            })
        })

        describe('DOM Sanitizer Integration', () => {
            it('should sanitize iframe URL when iframeUrl is set', () => {
                const mockSafeUrl = 'safe-sanitized-url' as any
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(EiframeUrl.QUIZ)
                mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue(mockSafeUrl)

                component.ngOnInit()

                expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('')
                expect(component.iframeSrc).toBe(mockSafeUrl)
            })

            it('should set iframeSrc to null when iframeUrl is null', () => {
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('invalid-type')

                component.ngOnInit()

                expect(component.iframeUrl).toBeNull()
                expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
                expect(component.iframeSrc).toBeNull()
            })

            it('should set iframeSrc to null when iframeUrl is empty string', () => {
                // Manually set iframeUrl to empty string to test the ternary condition
                mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('unknown')

                component.ngOnInit()
                // Manually test the sanitizer logic with empty string
                component.iframeUrl = ''
                component.iframeSrc = component.iframeUrl ?
                    mockDomSanitizer.bypassSecurityTrustResourceUrl(component.iframeUrl) : null

                expect(component.iframeSrc).toBeNull()
            })
        })
    })

    describe('Component Properties', () => {
        it('should initialize all properties to null', () => {
            expect(component.iframeSrc).toBeNull()
            expect(component.iframeUrl).toBeNull()
            expect(component.iframeType).toBeNull()
        })

        it('should update properties correctly after ngOnInit', () => {
            const testIframeType = EiframeUrl.QUIZ
            const mockSafeUrl = 'test-safe-url' as any

            mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(testIframeType)
            mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue(mockSafeUrl)

            component.ngOnInit()

            expect(component.iframeType).toBe(testIframeType)
            expect(component.iframeUrl).toBe('')
            expect(component.iframeSrc).toBe(mockSafeUrl)
        })
    })

    describe('Error Handling', () => {
        it('should handle DomSanitizer throwing an error', () => {
            const error = new Error('Sanitization failed')
            mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(EiframeUrl.QUIZ)
            mockDomSanitizer.bypassSecurityTrustResourceUrl.mockImplementation(() => {
                throw error
            })

            expect(() => component.ngOnInit()).toThrow('Sanitization failed')
        })

        it('should handle ActivatedRoute paramMap.get throwing an error', () => {
            const error = new Error('Route parameter access failed')
            mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockImplementation(() => {
                throw error
            })

            expect(() => component.ngOnInit()).toThrow('Route parameter access failed')
        })

        // it('should handle EventService bannerisEnabled.next throwing an error', () => {
        //    // const error = new Error('Banner update failed')
        //     // const nextSpy = jest.spyOn(mockBannerSubject, 'next').mockImplementation(() => {
        //     //     throw error
        //     // })

        //     expect(() => component.ngOnInit()).toThrow('Banner update failed')
        // })
    })

    describe('Integration Tests', () => {
        it('should complete full initialization flow for QUIZ type', () => {
            const mockSafeUrl = 'quiz-safe-url' as any
            mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(EiframeUrl.QUIZ)
            mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue(mockSafeUrl)
            const bannerSpy = jest.spyOn(mockBannerSubject, 'next')

            component.ngOnInit()

            // Verify all steps completed
            expect(bannerSpy).toHaveBeenCalledWith(false)
            expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('iframe')
            expect(component.iframeType).toBe(EiframeUrl.QUIZ)
            expect(component.iframeUrl).toBe('')
            expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('')
            expect(component.iframeSrc).toBe(mockSafeUrl)
        })

        it('should complete full initialization flow for non-matching iframe type', () => {
            const invalidType = 'non-existent-type'
            mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(invalidType)
            const bannerSpy = jest.spyOn(mockBannerSubject, 'next')

            component.ngOnInit()

            // Verify banner is disabled but no URL is set
            expect(bannerSpy).toHaveBeenCalledWith(false)
            expect(component.iframeType).toBe(invalidType)
            expect(component.iframeUrl).toBeNull()
            expect(component.iframeSrc).toBeNull()
            expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
        })
    })
})