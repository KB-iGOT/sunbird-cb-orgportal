import { LoadCheckService } from './load-check.service'

describe('LoadCheckService', () => {
  let service: LoadCheckService

  beforeEach(() => {
    service = new LoadCheckService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('childComponentLoaded$', () => {
    it('should expose an observable', () => {
      expect(typeof service.childComponentLoaded$.subscribe).toBe('function')
    })

    it('should emit true when componentLoaded(true) called', (done) => {
      service.childComponentLoaded$.subscribe(val => {
        expect(val).toBe(true)
        done()
      })
      service.componentLoaded(true)
    })

    it('should emit false when componentLoaded(false) called', (done) => {
      service.childComponentLoaded$.subscribe(val => {
        expect(val).toBe(false)
        done()
      })
      service.componentLoaded(false)
    })

    it('should emit multiple values in sequence', (done) => {
      const results: boolean[] = []
      const sub = service.childComponentLoaded$.subscribe(val => {
        results.push(val)
        if (results.length === 2) {
          expect(results).toEqual([true, false])
          sub.unsubscribe()
          done()
        }
      })
      service.componentLoaded(true)
      service.componentLoaded(false)
    })
  })

  describe('componentLoaded', () => {
    it('should not throw when called', () => {
      expect(() => service.componentLoaded(true)).not.toThrow()
    })
  })
})
