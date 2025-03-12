import { PipeEmailPipe } from './pipe-email.pipe'

describe('PipeEmailPipe', () => {
  let pipe: PipeEmailPipe

  beforeEach(() => {
    // Create an instance of the pipe before each test
    pipe = new PipeEmailPipe()
  })

  it('create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should replace "." with "[dot]" and "@" with "[at]"', () => {
    const email = 'test.email@example.com'
    const transformedEmail = pipe.transform(email)
    expect(transformedEmail).toBe('test[dot]email[at]example[dot]com')
  })

  it('should handle email without "@" correctly', () => {
    const email = 'test.email.com'
    const transformedEmail = pipe.transform(email)
    expect(transformedEmail).toBe('test[dot]email[dot]com')
  })

  it('should handle email without "." correctly', () => {
    const email = 'test@emailcom'
    const transformedEmail = pipe.transform(email)
    expect(transformedEmail).toBe('test[at]emailcom')
  })

  it('should return the same value when no special characters are present', () => {
    const email = 'testemail'
    const transformedEmail = pipe.transform(email)
    expect(transformedEmail).toBe('testemail')
  })
})
