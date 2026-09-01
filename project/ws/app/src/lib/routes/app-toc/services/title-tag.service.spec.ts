import { TitleTagService } from './title-tag.service'

describe('TitleTagService', () => {
  let service: TitleTagService
  let titleServiceMock: any
  let metaServiceMock: any

  beforeEach(() => {
    titleServiceMock = {
      setTitle: jest.fn(),
    }
    metaServiceMock = {
      updateTag: jest.fn(),
    }
    service = new TitleTagService(titleServiceMock, metaServiceMock)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('setTitle', () => {
    it('should call titleService.setTitle with the given title', () => {
      service.setTitle('Test Title')
      expect(titleServiceMock.setTitle).toHaveBeenCalledWith('Test Title')
    })
  })

  describe('setSocialMediaTags', () => {
    it('should call metaService.updateTag for facebook og tags with property attribute', () => {
      service.setSocialMediaTags(
        'https://example.com',
        'Test Title',
        'Test Description',
        'https://example.com/image.png'
      )
      expect(metaServiceMock.updateTag).toHaveBeenCalledWith({
        property: 'og:url',
        content: 'https://example.com',
      })
      expect(metaServiceMock.updateTag).toHaveBeenCalledWith({
        property: 'og:title',
        content: 'Test Title',
      })
      expect(metaServiceMock.updateTag).toHaveBeenCalledWith({
        property: 'og:description',
        content: 'Test Description',
      })
      expect(metaServiceMock.updateTag).toHaveBeenCalledWith({
        property: 'og:image',
        content: 'https://example.com/image.png',
      })
      expect(metaServiceMock.updateTag).toHaveBeenCalledWith({
        property: 'og:image:secure_url',
        content: 'https://example.com/image.png',
      })
    })

    it('should call metaService.updateTag for twitter tags with name attribute', () => {
      service.setSocialMediaTags(
        'https://example.com',
        'Twitter Title',
        'Twitter Description',
        'https://example.com/twitter.png'
      )
      expect(metaServiceMock.updateTag).toHaveBeenCalledWith({
        name: 'twitter:text:title',
        content: 'Twitter Title',
      })
      expect(metaServiceMock.updateTag).toHaveBeenCalledWith({
        name: 'twitter:image',
        content: 'https://example.com/twitter.png',
      })
    })

    it('should call metaService.updateTag exactly 7 times', () => {
      service.setSocialMediaTags(
        'https://example.com',
        'Title',
        'Desc',
        'https://example.com/img.png'
      )
      expect(metaServiceMock.updateTag).toHaveBeenCalledTimes(7)
    })
  })

  describe('stringToColor', () => {
    it('should return a valid hsl color string', () => {
      const color = service.stringToColor('hello')
      expect(color).toMatch(/^hsl\(\d+,100%,30%\)$/)
    })

    it('should return a consistent color for the same string', () => {
      const color1 = service.stringToColor('consistent')
      const color2 = service.stringToColor('consistent')
      expect(color1).toBe(color2)
    })

    it('should return different colors for different strings', () => {
      const color1 = service.stringToColor('abc')
      const color2 = service.stringToColor('xyz')
      expect(color1).not.toBe(color2)
    })

    it('should handle an empty string', () => {
      const color = service.stringToColor('')
      expect(color).toBe('hsl(0,100%,30%)')
    })
  })

  describe('getContrast', () => {
    it('should return the rgba white contrast string', () => {
      const contrast = service.getContrast('#ffffff')
      expect(contrast).toBe('rgba(255, 255, 255, 80%)')
    })

    it('should return the same value regardless of the hex color passed', () => {
      expect(service.getContrast('#000000')).toBe('rgba(255, 255, 255, 80%)')
      expect(service.getContrast('#ff5733')).toBe('rgba(255, 255, 255, 80%)')
    })
  })
})
