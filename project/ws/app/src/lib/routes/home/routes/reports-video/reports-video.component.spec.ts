import { ReportsVideoComponent } from './reports-video.component'

describe('ReportsVideoComponent', () => {
    let component: ReportsVideoComponent
    let mockDialogRef: any
    let mockDomSanitizer: any

    const dialogData = { videoLink: 'https://example.com/video.mp4' }

    beforeEach(() => {
        mockDialogRef = { close: jest.fn() }
        mockDomSanitizer = {
            bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url'),
        }
        component = new ReportsVideoComponent(mockDialogRef, dialogData, mockDomSanitizer)
    })

    afterEach(() => jest.clearAllMocks())

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should set videoLink from dialogData in constructor', () => {
        expect(component.videoLink).toBe('https://example.com/video.mp4')
    })

    describe('ngOnInit', () => {
        it('should not throw', () => {
            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('getVideoLink', () => {
        it('should return sanitized url from domSanitizer', () => {
            const result = component.getVideoLink
            expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://example.com/video.mp4')
            expect(result).toBe('safe-url')
        })

        it('should pass current videoLink to sanitizer', () => {
            component.videoLink = 'https://new.url/stream'
            component.getVideoLink
            expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('https://new.url/stream')
        })
    })
})