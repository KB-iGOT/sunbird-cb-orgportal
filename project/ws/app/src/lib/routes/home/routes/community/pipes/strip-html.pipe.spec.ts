import { StripHtmlPipe } from './strip-html.pipe'

describe('StripHtmlPipe', () => {
  let pipe: StripHtmlPipe
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    pipe = new StripHtmlPipe()
    // Spy on console.log to verify it's called and prevent console output during tests
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    // Restore console.log after each test
    consoleSpy.mockRestore()
  })

  describe('transform', () => {
    it('should return empty string when value is null', () => {
      const result = pipe.transform(null as any)

      expect(result).toBe('')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should return empty string when value is undefined', () => {
      const result = pipe.transform(undefined as any)

      expect(result).toBe('')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should return empty string when value is empty string', () => {
      const result = pipe.transform('')

      expect(result).toBe('')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should strip HTML tags from string and log the input', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const expectedOutput = 'Hello World'

      const result = pipe.transform(input)

      expect(result).toBe(expectedOutput)
      expect(consoleSpy).toHaveBeenCalledWith(input, 'string vallll-')
    })

    it('should return same string when no HTML tags present and log the input', () => {
      const input = 'Hello World'

      const result = pipe.transform(input)

      expect(result).toBe(input)
      expect(consoleSpy).toHaveBeenCalledWith(input, 'string vallll-')
    })

    it('should strip multiple nested HTML tags and log the input', () => {
      const input = '<div><p>Hello <span><strong>Beautiful</strong></span> World</p></div>'
      const expectedOutput = 'Hello Beautiful World'

      const result = pipe.transform(input)

      expect(result).toBe(expectedOutput)
      expect(consoleSpy).toHaveBeenCalledWith(input, 'string vallll-')
    })

    it('should strip self-closing HTML tags and log the input', () => {
      const input = 'Hello<br/>World<img src="test.jpg"/>!'
      const expectedOutput = 'HelloWorld!'

      const result = pipe.transform(input)

      expect(result).toBe(expectedOutput)
      expect(consoleSpy).toHaveBeenCalledWith(input, 'string vallll-')
    })

    it('should strip HTML tags with attributes and log the input', () => {
      const input = '<a href="https://example.com" class="link">Click here</a>'
      const expectedOutput = 'Click here'

      const result = pipe.transform(input)

      expect(result).toBe(expectedOutput)
      expect(consoleSpy).toHaveBeenCalledWith(input, 'string vallll-')
    })

    it('should handle malformed HTML tags and log the input', () => {
      const input = '<p>Hello <strong>World</p>'
      const expectedOutput = 'Hello World'

      const result = pipe.transform(input)

      expect(result).toBe(expectedOutput)
      expect(consoleSpy).toHaveBeenCalledWith(input, 'string vallll-')
    })

    it('should handle strings with only HTML tags and log the input', () => {
      const input = '<div></div><p></p><span></span>'
      const expectedOutput = ''

      const result = pipe.transform(input)

      expect(result).toBe(expectedOutput)
      expect(consoleSpy).toHaveBeenCalledWith(input, 'string vallll-')
    })
  })
})