import { YoutubePlayerComponent } from './youtube-player.component'
import { DomSanitizer } from '@angular/platform-browser'
import { MatLegacyDialogRef } from '@angular/material/legacy-dialog'

describe('YoutubePlayerComponent', () => {
  let component: YoutubePlayerComponent
  let mockDialogRef: MatLegacyDialogRef<YoutubePlayerComponent>
  let mockDomSanitizer: DomSanitizer

  beforeEach(() => {
    // Mocks for dependencies
    mockDialogRef = {
      close: jest.fn(),
    } as any

    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn(),
    } as any

    // Create the component instance
    component = new YoutubePlayerComponent(
      mockDialogRef,
      { event: { recordedLinks: ['https://www.youtube.com/watch?v=abcd1234'] } },
      mockDomSanitizer
    )
  })

  describe('ngOnInit', () => {
    it('should initialize event data and call getLink', () => {
      const getLinkSpy = jest.spyOn(component, 'getLink')
      component.ngOnInit()
      expect(component.eventData).toEqual({ recordedLinks: ['https://www.youtube.com/watch?v=abcd1234'] })
      expect(getLinkSpy).toHaveBeenCalled()
    })
  })

  describe('getLink', () => {
    it('should set videoId correctly from recordedLinks', () => {
      component.getLink()
      expect(component.videoId).toBe('https://www.youtube.com/watch?v=abcd1234')
    })

    it('should handle videoId for YouTube watch URLs', () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=abcd1234'
      component.eventData = { recordedLinks: [], registrationLink: youtubeUrl }
      component.getLink()
      expect(component.videoId).toBe('abcd1234')
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
    })

    it('should handle non-YouTube URL by setting youtubeURL to false', () => {
      const nonYoutubeUrl = 'https://example.com/video.mp4'
      component.eventData = { recordedLinks: [], registrationLink: nonYoutubeUrl }
      component.getLink()
      expect(component.youtubeURL).toBe(false)
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
    })
  })

  describe('generateVideoLink', () => {
    it('should generate a valid video link for YouTube URLs', () => {
      component.videoId = 'abcd1234'
      component.youtubeURL = true
      component.generateVideoLink()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledTimes(2) // Called twice for videoLink and iframeSrc
      expect(component.iframeSrc).toBe('bypass-security-trust-resource-url-called') // this is the mock behavior
    })

    it('should generate a valid video link for non-YouTube URLs', () => {
      component.videoId = 'https://example.com/video.mp4'
      component.youtubeURL = false
      component.generateVideoLink()
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledTimes(1) // Only called once for videoLink
    })
  })

  describe('getYouTubeVideoId', () => {
    it('should extract the video ID from a YouTube URL', () => {
      const videoId = component.getYouTubeVideoId('https://www.youtube.com/watch?v=abcd1234')
      expect(videoId).toBe('abcd1234')
    })
  })

  describe('closeDialog', () => {
    it('should close the dialog', () => {
      component.closeDialog()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })
})
