import { ReplaceNbspPipe } from './replace-nbsp.pipe'

describe('ReplaceNbspPipe', () => {
  let pipe: ReplaceNbspPipe

  beforeEach(() => {
    pipe = new ReplaceNbspPipe()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should replace a single &nbsp; with a space', () => {
    expect(pipe.transform('hello&nbsp;world')).toBe('hello world')
  })

  it('should replace multiple &nbsp; occurrences', () => {
    expect(pipe.transform('a&nbsp;b&nbsp;c')).toBe('a b c')
  })

  it('should return the value unchanged when no &nbsp; is present', () => {
    expect(pipe.transform('hello world')).toBe('hello world')
  })

  it('should return null as-is', () => {
    expect(pipe.transform(null)).toBeNull()
  })

  it('should return undefined as-is', () => {
    expect(pipe.transform(undefined)).toBeUndefined()
  })

  it('should return an empty string as-is', () => {
    expect(pipe.transform('')).toBe('')
  })

  it('should handle a string consisting solely of &nbsp;', () => {
    expect(pipe.transform('&nbsp;')).toBe(' ')
  })

  it('should handle &nbsp; at the start', () => {
    expect(pipe.transform('&nbsp;start')).toBe(' start')
  })

  it('should handle &nbsp; at the end', () => {
    expect(pipe.transform('end&nbsp;')).toBe('end ')
  })

  it('should handle adjacent &nbsp; entities', () => {
    expect(pipe.transform('a&nbsp;&nbsp;b')).toBe('a  b')
  })

  it('should not modify non-&nbsp; HTML entities', () => {
    expect(pipe.transform('a &amp; b')).toBe('a &amp; b')
  })
})
