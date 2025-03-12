import { PipeCertificateImageURL } from "./pipe-certimage-URL.pipe"

// Mocking environment
jest.mock('src/environments/environment', () => ({
  environment: {
    contentHost: 'http://localhost:4200'
  }
}))

describe('PipeCertificateImageURL', () => {
  let pipe: PipeCertificateImageURL

  beforeEach(() => {
    pipe = new PipeCertificateImageURL()
  })

  it('should be created', () => {
    expect(pipe).toBeTruthy()
  })

  it('should transform the URL for /public/content case', () => {
    const value = '/public/content/some/path'
    const expected = 'http://localhost:4200/assets/public/content/some/path'
    expect(pipe.transform(value)).toBe(expected)
  })

  it('should transform the URL for /content/content case', () => {
    const value = '/content/content/some/other/path'
    const expected = 'http://localhost:4200/assets/public/content/some/other/path'
    expect(pipe.transform(value)).toBe(expected)
  })

  it('should transform the URL for /content/collection case', () => {
    const value = '/content/collection/another/path'
    const expected = 'http://localhost:4200/assets/public/content/another/path'
    expect(pipe.transform(value)).toBe(expected)
  })

  it('should transform the URL for /igotprod/collection case', () => {
    const value = '/igotprod/collection/xyz'
    const expected = 'http://localhost:4200/assets/public/collection/xyz'
    expect(pipe.transform(value)).toBe(expected)
  })

  it('should handle when value is empty', () => {
    const value = ''
    expect(pipe.transform(value)).toBe('')
  })

  it('should handle case where "/content" is missing but "/igot" is present', () => {
    const value = '/igot/content/some/path'
    const expected = 'http://localhost:4200/assets/public/some/path'
    expect(pipe.transform(value)).toBe(expected)
  })

  it('should return empty string if value does not match any case', () => {
    const value = '/unknown/path'
    expect(pipe.transform(value)).toBe('')
  })
})
