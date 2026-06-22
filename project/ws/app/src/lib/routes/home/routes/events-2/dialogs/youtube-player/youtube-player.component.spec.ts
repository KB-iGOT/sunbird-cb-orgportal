import { YoutubePlayerComponent } from './youtube-player.component'
import { MatDialogRef } from '@angular/material/dialog'
import { DomSanitizer } from '@angular/platform-browser'

describe('YoutubePlayerComponent', () => {
  let component: YoutubePlayerComponent
  let mockDialogRef: jest.Mocked<MatDialogRef<YoutubePlayerComponent>>
  let mockDomSanitizer: jest.Mocked<DomSanitizer>
  let mockData: any

  beforeEach(() => {
    mockDialogRef = {
      close: jest.fn()
    } as any

    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn(url => `sanitized:${url}` as any)
    } as any

    // Ensure all required properties exist in mock data
    mockData = {
      event: {
        recordedLinks: ['https://www.youtube.com/watch?v=abc123'],
        registrationLink: 'https://www.youtube.com/watch?v=def456'
      }
    }

    component = new YoutubePlayerComponent(
      mockDialogRef,
      mockData,
      mockDomSanitizer
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set eventData and call getLink', () => {
      // Spy on getLink method
      const getLinkSpy = jest.spyOn(component, 'getLink')

      // Call ngOnInit
      component.ngOnInit()

      // Assertions
      expect(component.eventData).toBe(mockData.event)
      expect(getLinkSpy).toHaveBeenCalled()
    })
  })

  describe('getYouTubeVideoId', () => {
    it('should extract video ID from YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=abc123&t=10s'
      const result = component.getYouTubeVideoId(url)
      expect(result).toBe('abc123')
    })

    it('should return null for invalid URL', () => {
      // Mock implementation for URL
      global.URL = jest.fn(() => ({
        searchParams: {
          get: jest.fn(() => null)
        }
      })) as any

      const url = 'invalid-url'
      const result = component.getYouTubeVideoId(url)
      expect(result).toBeNull()
    })
  })

  describe('getLink', () => {
    it('should use recordedLinks if available', () => {
      // Setup - ensure eventData is initialized before calling getLink
      component.eventData = {
        recordedLinks: ['https://www.youtube.com/watch?v=abc123'],
        registrationLink: 'https://www.youtube.com/watch?v=def456'
      }

      const bypassSpy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl')

      // Mock getYouTubeVideoId to return a specific value
      jest.spyOn(component, 'getYouTubeVideoId').mockReturnValue('abc123')

      // Call the method
      component.getLink()

      // Check if videoId is set correctly
      expect(component.videoId).toBe('abc123')
      // Verify sanitizer was called
      expect(bypassSpy).toHaveBeenCalledTimes(2)
    })

    it('should use registrationLink if recordedLinks is empty', () => {
      // Setup - ensure eventData is initialized before calling getLink
      component.eventData = {
        recordedLinks: [],
        registrationLink: 'https://www.youtube.com/watch?v=def456'
      }

      const bypassSpy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl')

      // Mock getYouTubeVideoId to return a specific value
      jest.spyOn(component, 'getYouTubeVideoId').mockReturnValue('def456')

      // Call the method
      component.getLink()

      // Assertions
      expect(component.videoId).toBe('def456')
      expect(bypassSpy).toHaveBeenCalledTimes(2)
    })

    it('should handle YouTube embed URLs', () => {
      // Setup - ensure eventData is initialized before calling getLink
      component.eventData = {
        recordedLinks: ['https://www.youtube.com/embed/embed123'],
        registrationLink: 'https://www.youtube.com/watch?v=def456'
      }

      const bypassSpy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl')

      // Call the method
      component.getLink()

      // Assertions
      expect(component.videoId).toBe('embed123')
      expect(component.youtubeURL).toBe(true)
      expect(bypassSpy).toHaveBeenCalledTimes(2)
    })

    it('should handle non-YouTube URLs', () => {
      // Setup - ensure eventData is initialized before calling getLink
      component.eventData = {
        recordedLinks: ['https://example.com/video.mp4'],
        registrationLink: 'https://www.youtube.com/watch?v=def456'
      }

      const bypassSpy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl')

      // Call the method
      component.getLink()

      // Assertions
      expect(component.videoId).toBe('https://example.com/video.mp4')
      expect(component.youtubeURL).toBe(false)
      expect(bypassSpy).toHaveBeenCalledTimes(1)
    })

    // it('should handle case when eventData is null', () => {
    //   // Setup - explicitly set eventData to null
    //   component.eventData = null

    //   const bypassSpy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl')

    //   // Call the method
    //   component.getLink()

    //   // Assertions - verify it doesn't crash
    //   expect(component.videoId).toBeUndefined()
    //   expect(bypassSpy).not.toHaveBeenCalled()
    // })
  })

  describe('generateVideoLink', () => {
    it('should generate video link for YouTube URLs', () => {
      // Setup
      component.videoId = 'abc123'
      component.youtubeURL = true
      const bypassSpy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl')

      // Call the method
      component.generateVideoLink()

      // Assertions
      expect(bypassSpy).toHaveBeenCalledWith('abc123')
      expect(bypassSpy).toHaveBeenCalledWith('https://www.youtube.com/embed/abc123')
      expect(component.videoLink).toBe('sanitized:abc123')
      expect(component.iframeSrc).toBe('sanitized:https://www.youtube.com/embed/abc123')
    })

    it('should generate video link for non-YouTube URLs', () => {
      // Setup
      component.videoId = 'https://example.com/video.mp4'
      component.youtubeURL = false
      const bypassSpy = jest.spyOn(mockDomSanitizer, 'bypassSecurityTrustResourceUrl')

      // Call the method
      component.generateVideoLink()

      // Assertions
      expect(bypassSpy).toHaveBeenCalledWith('https://example.com/video.mp4')
      expect(component.videoLink).toBe('sanitized:https://example.com/video.mp4')
    })
  })

  describe('closeDialog', () => {
    it('should close the dialog', () => {
      // Call the method
      component.closeDialog()

      // Verify dialog was closed
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })
})