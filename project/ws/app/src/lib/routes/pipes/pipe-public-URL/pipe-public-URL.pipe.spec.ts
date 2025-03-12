import { PipePublicURL } from "./pipe-public-URL.pipe"


// Mock the environment variables to avoid issues with undefined
jest.mock('src/environments/environment', () => ({
  environment: {
    contentHost: 'https://example.com',
    contentBucket: 'bucket123'
  }
}))

describe('PipePublicURL', () => {
  let pipe: PipePublicURL

  beforeEach(() => {
    pipe = new PipePublicURL()
  })

  it('should be defined', () => {
    expect(pipe).toBeDefined()
  })

  it('should transform the value correctly with the content URL', () => {
    const inputValue = 'https://oldurl.com/content/somepath'
    const expectedOutput = 'https://example.com/bucket123/content/somepath'
    const result = pipe.transform(inputValue)
    expect(result).toBe(expectedOutput)
  })

  it('should return an empty string when the input value is empty', () => {
    const inputValue = ''
    const result = pipe.transform(inputValue)
    expect(result).toBe('')
  })

  it('should return an empty string when the input value is null', () => {
    const inputValue: any = null
    const result = pipe.transform(inputValue)
    expect(result).toBe('')
  })

  it('should handle undefined input gracefully', () => {
    const inputValue: any = undefined
    const result = pipe.transform(inputValue)
    expect(result).toBe('')
  })

  it('should handle URLs without "/content" and return only the content path', () => {
    const inputValue = 'https://example.com/otherpath'
    const expectedOutput = 'https://example.com/bucket123/content/otherpath'
    const result = pipe.transform(inputValue)
    expect(result).toBe(expectedOutput)
  })
})
