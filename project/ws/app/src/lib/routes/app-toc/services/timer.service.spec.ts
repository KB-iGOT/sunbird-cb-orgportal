import { TimerService } from './timer.service'

describe('TimerService', () => {
  let service: TimerService

  beforeEach(() => {
    service = new TimerService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getTimerData', () => {
    it('should return an observable', () => {
      const obs = service.getTimerData()
      expect(typeof obs.subscribe).toBe('function')
    })

    it('should emit initial empty object value', (done) => {
      service.getTimerData().subscribe(val => {
        expect(val).toEqual({})
        done()
      })
    })
  })

  describe('setTimerData', () => {
    it('should update the observable value', (done) => {
      const timerObj = { elapsed: 300, remaining: 700 }
      let count = 0
      const sub = service.getTimerData().subscribe(val => {
        count++
        if (count === 2) {
          expect(val).toEqual(timerObj)
          sub.unsubscribe()
          done()
        }
      })
      service.setTimerData(timerObj)
    })

    it('should emit null value when set to null', (done) => {
      let count = 0
      const sub = service.getTimerData().subscribe(val => {
        count++
        if (count === 2) {
          expect(val).toBeNull()
          sub.unsubscribe()
          done()
        }
      })
      service.setTimerData(null)
    })

    it('should emit successive values', (done) => {
      const values: any[] = []
      const sub = service.getTimerData().subscribe(val => {
        values.push(val)
        if (values.length === 3) {
          expect(values[1]).toEqual({ a: 1 })
          expect(values[2]).toEqual({ b: 2 })
          sub.unsubscribe()
          done()
        }
      })
      service.setTimerData({ a: 1 })
      service.setTimerData({ b: 2 })
    })

    it('should not throw when called', () => {
      expect(() => service.setTimerData({ time: 100 })).not.toThrow()
    })
  })
})
