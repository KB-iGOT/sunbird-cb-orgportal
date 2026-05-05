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

  // First block: has /public/content → returns certimage path
  it('should transform /public/content URL to certimage path', () => {
    const value = '/public/content/some/path'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/certimage/content/some/path')
  })

  // Second block, first inner: has /content/content → public/content path
  it('should transform /content/content URL to public/content path', () => {
    const value = '/content/content/some/other/path'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public/content/some/other/path')
  })

  // Second block, first inner: has /igot/content
  it('should transform /igot/content URL to public/content path', () => {
    const value = '/igot/content/some/path'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public/content/some/path')
  })

  // Second block, first inner: has /content-store/content
  it('should transform /content-store/content URL to public/content path', () => {
    const value = '/content-store/content/abc'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public/content/abc')
  })

  // Second block: /igotprod/collection
  it('should transform /igotprod/collection URL', () => {
    const value = '/igotprod/collection/xyz'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public//collection/xyz')
  })

  // Second block: /igotprod/content
  it('should transform /igotprod/content URL', () => {
    const value = '/igotprod/content/xyz'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public//content/xyz')
  })

  // Second block: /igotbm/collection
  it('should transform /igotbm/collection URL', () => {
    const value = '/igotbm/collection/xyz'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public//collection/xyz')
  })

  // Second block: /igotbm/content
  it('should transform /igotbm/content URL', () => {
    const value = '/igotbm/content/xyz'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public//content/xyz')
  })

  // Second block: /igot/collection
  it('should transform /igot/collection URL', () => {
    const value = '/igot/collection/abc'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public//collection/abc')
  })

  // Second block: /content/collection (no /public/content, not caught by earlier conditions)
  it('should transform /content/collection URL', () => {
    const value = '/content/collection/another/path'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public//collection/another/path')
  })

  // Second block last: no match → falls into catch-all (content/content === -1 || content/collection === -1)
  it('should transform unknown path through catch-all condition', () => {
    const value = '/unknown/path'
    const result = pipe.transform(value)
    expect(result).toBe('http://localhost:4200/assets/public//unknown/path')
  })

  it('should return empty string for empty value', () => {
    expect(pipe.transform('')).toBe('')
  })
})
