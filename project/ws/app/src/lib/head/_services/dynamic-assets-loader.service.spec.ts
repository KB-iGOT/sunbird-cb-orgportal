import { DynamicAssetsLoaderService } from './dynamic-assets-loader.service'

describe('DynamicAssetsLoaderService', () => {
  let service: DynamicAssetsLoaderService

  beforeEach(() => {
    service = new DynamicAssetsLoaderService()
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'script') {
        return { src: '' } as any
      }
      if (tagName === 'link') {
        return { rel: '', href: '' } as any
      }
      return { tagName } as any
    })
    jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => node)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create the service', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with empty maps', () => {
    expect(service.urlLoadStatus.size).toBe(0)
    expect(service.urlElemMapping.size).toBe(0)
  })

  describe('loadScript', () => {
    it('should return true if script is already loaded', async () => {
      const url = 'http://example.com/script.js'
      service.urlLoadStatus.set(url, true)

      const result = await service.loadScript(url)

      expect(result).toBe(true)
      expect(document.createElement).not.toHaveBeenCalled()
    })

    it('should create script element and append to body when url is new', async () => {
      const url = 'http://example.com/new-script.js'
      jest.spyOn(service as any, 'loadEventPromise').mockResolvedValue(true)

      await service.loadScript(url)

      expect(document.createElement).toHaveBeenCalledWith('script')
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(service.urlElemMapping.has(url)).toBe(true)
    })

    it('should use existing urlElemMapping entry instead of creating new element', async () => {
      const url = 'http://example.com/script.js'
      const mockElem = { src: url } as HTMLScriptElement
      service.urlElemMapping.set(url, mockElem)
      jest.spyOn(service as any, 'loadEventPromise').mockResolvedValue(true)

      const result = await service.loadScript(url)

      expect(result).toBe(true)
      expect(document.createElement).not.toHaveBeenCalled()
    })

    it('should return false if createElement throws an error', async () => {
      const url = 'http://example.com/bad-script.js'
      jest.spyOn(document, 'createElement').mockImplementation(() => { throw new Error('DOM error') })

      const result = await service.loadScript(url)

      expect(result).toBe(false)
    })
  })

  describe('loadStyle', () => {
    it('should return true if style is already loaded', async () => {
      const url = 'http://example.com/style.css'
      service.urlLoadStatus.set(url, true)

      const result = await service.loadStyle(url)

      expect(result).toBe(true)
      expect(document.createElement).not.toHaveBeenCalled()
    })

    it('should create link element, append to body and set urlLoadStatus', async () => {
      const url = 'http://example.com/style.css'

      const result = await service.loadStyle(url)

      expect(document.createElement).toHaveBeenCalledWith('link')
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(result).toBe(true)
      expect(service.urlLoadStatus.get(url)).toBe(true)
    })

    it('should return false if createElement throws an error', async () => {
      const url = 'http://example.com/bad-style.css'
      jest.spyOn(document, 'createElement').mockImplementation(() => { throw new Error('DOM error') })

      const result = await service.loadStyle(url)

      expect(result).toBe(false)
    })
  })

  describe('loadEventPromise (private)', () => {
    it('should return true if url is not in urlElemMapping', async () => {
      const result = await (service as any).loadEventPromise('non-existent-url')

      expect(result).toBe(true)
    })
  })
})
