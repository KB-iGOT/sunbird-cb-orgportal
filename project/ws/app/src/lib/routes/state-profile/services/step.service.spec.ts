import { StepService } from './step.service'

describe('StepService', () => {
  let service: StepService

  beforeEach(() => {
    service = new StepService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('currentStep', () => {
    it('should initialize currentStep as BehaviorSubject with empty object', () => {
      expect(service.currentStep).toBeTruthy()
      expect(service.currentStep.value).toEqual({})
    })

    it('should emit new value when next is called', (done) => {
      const newStep = { step: 2, name: 'profile' }
      service.currentStep.subscribe(val => {
        if (val.step === 2) {
          expect(val).toEqual(newStep)
          done()
        }
      })
      service.currentStep.next(newStep)
    })
  })

  describe('allSteps', () => {
    it('should initialize allSteps with value 1', () => {
      expect(service.allSteps.value).toBe(1)
    })

    it('should emit new count when next is called', (done) => {
      service.allSteps.subscribe(val => {
        if (val === 5) {
          expect(val).toBe(5)
          done()
        }
      })
      service.allSteps.next(5)
    })
  })

  describe('skiped', () => {
    it('should initialize skiped as false', () => {
      expect(service.skiped.value).toBe(false)
    })

    it('should emit true when next is called with true', (done) => {
      service.skiped.subscribe(val => {
        if (val === true) {
          expect(val).toBe(true)
          done()
        }
      })
      service.skiped.next(true)
    })
  })
})
