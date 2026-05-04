import { WindowRef } from './WindowRef'
import { BrowserWindowRef } from './BrowserWindowRef'

describe('WindowRef', () => {
  it('should throw error when nativeWindow getter is called on abstract base', () => {
    // Create a subclass that doesn't override nativeWindow to test base behavior
    class TestWindowRef extends WindowRef { }
    const ref = new TestWindowRef()
    expect(() => ref.nativeWindow).toThrowError('Window not available.')
  })
})

describe('BrowserWindowRef', () => {
  let browserWindowRef: BrowserWindowRef

  beforeEach(() => {
    browserWindowRef = new BrowserWindowRef()
  })

  it('should be created', () => {
    expect(browserWindowRef).toBeTruthy()
  })

  it('should return the global window object', () => {
    expect(browserWindowRef.nativeWindow).toBe(window)
  })

  it('should be an instance of WindowRef', () => {
    expect(browserWindowRef).toBeInstanceOf(WindowRef)
  })
})
