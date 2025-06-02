import { SimpleChanges } from '@angular/core'
import { LearningCardComponent } from './learning-card.component'
import { SafeHtml } from '@angular/platform-browser'
import { NsContent } from '@sunbird-cb/collection'

// Mock interfaces and types
interface MockInstanceConfig {
    logos: {
        defaultContent: string
    }
}

interface MockConfigurationsService {
    instanceConfig: MockInstanceConfig | null
}

interface MockEventService {
    raiseInteractTelemetry: jest.Mock
}

interface MockDomSanitizer {
    bypassSecurityTrustHtml: jest.Mock
}

describe('LearningCardComponent', () => {
    let component: LearningCardComponent
    let mockEventService: MockEventService
    let mockConfigurationsService: MockConfigurationsService
    let mockDomSanitizer: MockDomSanitizer

    beforeEach(() => {
        // Create mocks
        mockEventService = {
            raiseInteractTelemetry: jest.fn(),
        }

        mockConfigurationsService = {
            instanceConfig: null,
        }

        mockDomSanitizer = {
            bypassSecurityTrustHtml: jest.fn(),
        }

        // Create component instance with mocked dependencies
        component = new LearningCardComponent(
            mockEventService as any,
            mockConfigurationsService as any,
            mockDomSanitizer as any
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeDefined()
            expect(component.displayType).toBe('basic')
            expect(component.content).toEqual({})
            expect(component.contentProgress).toBe(0)
            expect(component.isExpanded).toBe(false)
            expect(component.defaultThumbnail).toBe('')
            expect(component.description).toBe('')
        })

        it('should initialize with custom input values', () => {
            const mockContent: NsContent.IContent = {
                identifier: 'test-id',
                name: 'Test Content',
                description: 'Test description',
            } as NsContent.IContent

            component.displayType = 'advanced'
            component.content = mockContent

            expect(component.displayType).toBe('advanced')
            expect(component.content).toEqual(mockContent)
        })
    })

    describe('ngOnInit', () => {
        it('should set defaultThumbnail when instanceConfig has defaultContent logo', () => {
            const expectedThumbnail = 'https://example.com/default-thumbnail.jpg'
            mockConfigurationsService.instanceConfig = {
                logos: {
                    defaultContent: expectedThumbnail,
                },
            }

            component.ngOnInit()

            expect(component.defaultThumbnail).toBe(expectedThumbnail)
        })

        it('should set defaultThumbnail to empty string when instanceConfig defaultContent is falsy', () => {
            mockConfigurationsService.instanceConfig = {
                logos: {
                    defaultContent: '',
                },
            }

            component.ngOnInit()

            expect(component.defaultThumbnail).toBe('')
        })

        it('should handle null instanceConfig gracefully', () => {
            mockConfigurationsService.instanceConfig = null

            expect(() => component.ngOnInit()).not.toThrow()
            expect(component.defaultThumbnail).toBe('')
        })

        it('should handle undefined instanceConfig gracefully', () => {
            mockConfigurationsService.instanceConfig = undefined as any

            expect(() => component.ngOnInit()).not.toThrow()
            expect(component.defaultThumbnail).toBe('')
        })
    })

    describe('ngOnChanges', () => {
        it('should process content description when content changes', () => {
            const mockSafeHtml = 'safe-html-content' as any as SafeHtml
            const originalDescription = 'Test description<br>with line breaks<br>here'
            const expectedCleanDescription = 'Test descriptionwith line breakshere'

            mockDomSanitizer.bypassSecurityTrustHtml.mockReturnValue(mockSafeHtml)

            component.content = {
                identifier: 'test-id',
                description: originalDescription,
            } as NsContent.IContent

            const changes: SimpleChanges = {
                content: {
                    currentValue: component.content,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true,
                },
            }

            component.ngOnChanges(changes)

            expect(component.content.description).toBe(expectedCleanDescription)
            expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedCleanDescription)
            expect(component.description).toBe(mockSafeHtml)
        })

        it('should handle content change without description', () => {
            component.content = {
                identifier: 'test-id',
                name: 'Test Content',
            } as NsContent.IContent

            const changes: SimpleChanges = {
                content: {
                    currentValue: component.content,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true,
                },
            }

            expect(() => component.ngOnChanges(changes)).not.toThrow()
            expect(mockDomSanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
        })

        it('should handle multiple br tags in description', () => {
            const mockSafeHtml = 'safe-html-content' as any as SafeHtml
            const originalDescription = 'Line 1<br><br>Line 2<br><br><br>Line 3'
            const expectedCleanDescription = 'Line 1Line 2Line 3'

            mockDomSanitizer.bypassSecurityTrustHtml.mockReturnValue(mockSafeHtml)

            component.content = {
                identifier: 'test-id',
                description: originalDescription,
            } as NsContent.IContent

            const changes: SimpleChanges = {
                content: {
                    currentValue: component.content,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true,
                },
            }

            component.ngOnChanges(changes)

            expect(component.content.description).toBe(expectedCleanDescription)
            expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedCleanDescription)
        })

        it('should not process changes for non-content properties', () => {
            const changes: SimpleChanges = {
                displayType: {
                    currentValue: 'advanced',
                    previousValue: 'basic',
                    firstChange: false,
                    isFirstChange: () => false,
                },
            }

            component.ngOnChanges(changes)

            expect(mockDomSanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalled()
        })

        it('should handle multiple property changes but only process content', () => {
            const mockSafeHtml = 'safe-html-content' as any as SafeHtml
            mockDomSanitizer.bypassSecurityTrustHtml.mockReturnValue(mockSafeHtml)

            component.content = {
                identifier: 'test-id',
                description: 'Test<br>description',
            } as NsContent.IContent

            const changes: SimpleChanges = {
                displayType: {
                    currentValue: 'advanced',
                    previousValue: 'basic',
                    firstChange: false,
                    isFirstChange: () => false,
                },
                content: {
                    currentValue: component.content,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true,
                },
            }

            component.ngOnChanges(changes)

            expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(1)
            expect(component.content.description).toBe('Testdescription')
        })
    })

    describe('raiseTelemetry', () => {
        it('should call raiseInteractTelemetry with correct parameters', () => {
            const mockContent: NsContent.IContent = {
                identifier: 'test-content-id',
                name: 'Test Content',
            } as NsContent.IContent

            component.content = mockContent

            component.raiseTelemetry()

            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledTimes(1)
            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'click',
                    subType: 'cardSearch',
                },
                {
                    contentId: 'test-content-id',
                }
            )
        })

        it('should handle empty content object', () => {
            component.content = {} as NsContent.IContent

            component.raiseTelemetry()

            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'click',
                    subType: 'cardSearch',
                },
                {
                    contentId: undefined,
                }
            )
        })

        it('should handle null content', () => {
            component.content = null as any

            expect(() => component.raiseTelemetry()).toThrow()
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty string description in ngOnChanges', () => {
            const mockSafeHtml = 'safe-html-content' as any as SafeHtml
            mockDomSanitizer.bypassSecurityTrustHtml.mockReturnValue(mockSafeHtml)

            component.content = {
                identifier: 'test-id',
                description: '',
            } as NsContent.IContent

            const changes: SimpleChanges = {
                content: {
                    currentValue: component.content,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true,
                },
            }

            component.ngOnChanges(changes)

            expect(component.content.description).toBe('')
            expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('')
        })

        it('should handle description with only br tags', () => {
            const mockSafeHtml = 'safe-html-content' as any as SafeHtml
            mockDomSanitizer.bypassSecurityTrustHtml.mockReturnValue(mockSafeHtml)

            component.content = {
                identifier: 'test-id',
                description: '<br><br><br>',
            } as NsContent.IContent

            const changes: SimpleChanges = {
                content: {
                    currentValue: component.content,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true,
                },
            }

            component.ngOnChanges(changes)

            expect(component.content.description).toBe('')
            expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('')
        })
    })
})