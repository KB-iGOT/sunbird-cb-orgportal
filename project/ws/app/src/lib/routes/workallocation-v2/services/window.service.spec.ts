import { TestBed } from '@angular/core/testing'
import { PLATFORM_ID } from '@angular/core'
import {
  WINDOW,
  BrowserWindowRef,
  windowFactory,
  browserWindowProvider,
  windowProvider,
  WINDOW_PROVIDERS
} from './window.service'

describe('Window Service', () => {
  describe('BrowserWindowRef', () => {
    let browserWindowRef: BrowserWindowRef

    beforeEach(() => {
      browserWindowRef = new BrowserWindowRef()
    })

    it('should create an instance', () => {
      expect(browserWindowRef).toBeTruthy()
    })

    it('should return the native window object', () => {
      expect(browserWindowRef.nativeWindow).toBe(window)
    })
  })

  describe('WindowRef', () => {
    it('should throw an error when nativeWindow is accessed', () => {
      const windowRef = new WindowRef()
      expect(() => windowRef.nativeWindow).toThrow('Not implemented.')
    })
  })

  describe('windowFactory', () => {
    let browserWindowRef: BrowserWindowRef

    beforeEach(() => {
      browserWindowRef = new BrowserWindowRef()
    })

    it('should return the native window when platform is browser', () => {
      const platformId = 'browser'
      const result = windowFactory(browserWindowRef, platformId)
      expect(result).toBe(window)
    })

    it('should return an object when platform is not browser', () => {
      const platformId = 'server'
      const result = windowFactory(browserWindowRef, platformId)
      expect(result).toEqual({})
      expect(result).not.toBe(window)
    })
  })

  describe('Provider Configuration', () => {


    it('WINDOW_PROVIDERS should include both providers', () => {
      expect(WINDOW_PROVIDERS).toContain(browserWindowProvider)
      expect(WINDOW_PROVIDERS).toContain(windowProvider)
      expect(WINDOW_PROVIDERS.length).toBe(2)
    })
  })

  describe('Integration Test', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WINDOW_PROVIDERS,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      })
    })

    it('should provide window object when injected in browser platform', () => {
      const windowObject = TestBed.inject(WINDOW)
      expect(windowObject).toBe(window)
    })

  })

  describe('Integration Test (Server Platform)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WINDOW_PROVIDERS,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      })
    })

    it('should provide empty object when injected in server platform', () => {
      const windowObject = TestBed.inject(WINDOW)
      expect(windowObject).toEqual({})
      expect(windowObject).not.toBe(window)
    })
  })
})

// Mock for abstract class testing
class WindowRef {
  get nativeWindow(): Window | Object {
    throw new Error('Not implemented.')
  }
}