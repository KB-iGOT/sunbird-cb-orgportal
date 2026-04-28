import { ActionService } from './action.service'

describe('ActionService', () => {
  let service: ActionService

  beforeEach(() => {
    service = new ActionService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getUpdateCompGroupO', () => {
    it('should return an observable', () => {
      const obs = service.getUpdateCompGroupO
      expect(typeof obs.subscribe).toBe('function')
    })

    it('should emit the initial empty string value', (done) => {
      service.getUpdateCompGroupO.subscribe(val => {
        expect(val).toBe('')
        done()
      })
    })
  })

  describe('setUpdateCompGroupO', () => {
    it('should emit the new value', (done) => {
      let count = 0
      const values: any[] = []
      const sub = service.getUpdateCompGroupO.subscribe(val => {
        values.push(val)
        count++
        if (count === 2) {
          expect(values[1]).toBe('new-value')
          sub.unsubscribe()
          done()
        }
      })
      service.setUpdateCompGroupO = 'new-value'
    })

    it('should emit an object value', (done) => {
      let count = 0
      const sub = service.getUpdateCompGroupO.subscribe((val: any) => {
        count++
        if (count === 2) {
          expect(val).toEqual({ key: 'test' })
          sub.unsubscribe()
          done()
        }
      })
      service.setUpdateCompGroupO = { key: 'test' }
    })

    it('should emit null value', (done) => {
      let count = 0
      const sub = service.getUpdateCompGroupO.subscribe((val: any) => {
        count++
        if (count === 2) {
          expect(val).toBeNull()
          sub.unsubscribe()
          done()
        }
      })
      service.setUpdateCompGroupO = null
    })

    it('should emit latest value for multiple sets', (done) => {
      let count = 0
      const results: any[] = []
      const sub = service.getUpdateCompGroupO.subscribe((val: any) => {
        results.push(val)
        count++
        if (count === 4) {
          expect(results[1]).toBe('first')
          expect(results[2]).toBe('second')
          expect(results[3]).toBe('third')
          sub.unsubscribe()
          done()
        }
      })
      service.setUpdateCompGroupO = 'first'
      service.setUpdateCompGroupO = 'second'
      service.setUpdateCompGroupO = 'third'
    })
  })
})
