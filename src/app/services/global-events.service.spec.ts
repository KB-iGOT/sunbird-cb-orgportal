import { GlobalEventsService } from './global-events.service'

describe('GlobalEventsService', () => {
  let service: GlobalEventsService

  beforeEach(() => {
    service = new GlobalEventsService()
  })

  it('should create an instance', () => {
    expect(service).toBeTruthy()
  })

  it('should expose loaderState$ observable', () => {
    expect(service.loaderState$).toBeDefined()
  })

  describe('setLoaderState', () => {
    it('should emit true on loaderState$', (done) => {
      service.loaderState$.subscribe(value => {
        expect(value).toBe(true)
        done()
      })
      service.setLoaderState(true)
    })

    it('should emit false on loaderState$', (done) => {
      service.loaderState$.subscribe(value => {
        expect(value).toBe(false)
        done()
      })
      service.setLoaderState(false)
    })
  })
})
