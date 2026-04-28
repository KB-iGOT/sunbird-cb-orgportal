import { ResetRatingsService } from './reset-ratings.service'

describe('ResetRatingsService', () => {
  let service: ResetRatingsService

  beforeEach(() => {
    service = new ResetRatingsService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('resetRatings$', () => {
    it('should expose an observable', () => {
      expect(typeof service.resetRatings$.subscribe).toBe('function')
    })

    it('should emit true when setRatingServiceUpdate(true) called', (done) => {
      service.resetRatings$.subscribe(val => {
        expect(val).toBe(true)
        done()
      })
      service.setRatingServiceUpdate(true)
    })

    it('should emit false when setRatingServiceUpdate(false) called', (done) => {
      service.resetRatings$.subscribe(val => {
        expect(val).toBe(false)
        done()
      })
      service.setRatingServiceUpdate(false)
    })

    it('should emit multiple values in sequence', (done) => {
      const results: boolean[] = []
      const sub = service.resetRatings$.subscribe(val => {
        results.push(val)
        if (results.length === 3) {
          expect(results).toEqual([true, false, true])
          sub.unsubscribe()
          done()
        }
      })
      service.setRatingServiceUpdate(true)
      service.setRatingServiceUpdate(false)
      service.setRatingServiceUpdate(true)
    })
  })

  describe('setRatingServiceUpdate', () => {
    it('should not throw when called', () => {
      expect(() => service.setRatingServiceUpdate(true)).not.toThrow()
    })
  })
})
