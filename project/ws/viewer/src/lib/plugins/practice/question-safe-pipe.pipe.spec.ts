import { QuestionSafeUrlPipe } from './question-safe-pipe.pipe'
import { DomSanitizer } from '@angular/platform-browser'

describe('QuestionSafeUrlPipe', () => {
  let pipe: QuestionSafeUrlPipe
  let mockDomSanitizer: jest.Mocked<DomSanitizer>

  beforeEach(() => {
    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((v: any) => `trusted:${v}`),
    } as any
    pipe = new QuestionSafeUrlPipe(mockDomSanitizer)
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should call bypassSecurityTrustHtml with the provided url', () => {
    const html = '<b>Test Question</b>'
    pipe.transform(html)
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(html)
  })

  it('should return the result of bypassSecurityTrustHtml', () => {
    const html = '<i>Option A</i>'
    const result = pipe.transform(html)
    expect(result).toBe('trusted:<i>Option A</i>')
  })

  it('should handle null input', () => {
    pipe.transform(null)
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(null)
  })

  it('should handle empty string', () => {
    pipe.transform('')
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('')
  })

  it('should handle undefined input', () => {
    pipe.transform(undefined)
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(undefined)
  })

  it('should handle complex HTML strings', () => {
    const html = '<div class="question"><p>What is 2+2?</p><img src="img.png"/></div>'
    pipe.transform(html)
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(html)
  })

  it('should pass through exactly once per call', () => {
    pipe.transform('<span>Q</span>')
    pipe.transform('<span>R</span>')
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(2)
  })
})
