
import { NSWatActivity } from '../models/activity-wot.model'
import { NSWatCompetency } from '../models/competency-wat.model'
import { NSWatOfficer } from '../models/officer-wat.model'
import { WatStoreService } from './wat.store.service'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, defaultValue) => {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      result = result?.[key]
    }
    return result !== undefined ? result : defaultValue
  }),
  each: jest.fn((collection, iteratee) => {
    if (Array.isArray(collection)) {
      collection.forEach(iteratee)
    } else if (collection && typeof collection === 'object') {
      Object.values(collection).forEach(iteratee)
    }
  }),
  first: jest.fn((array) => array?.[0]),
  filter: jest.fn((collection, predicate) => {
    if (!Array.isArray(collection)) return []
    if (typeof predicate === 'object') {
      return collection.filter(item => {
        return Object.keys(predicate).every(key => item[key] === predicate[key])
      })
    }
    return collection.filter(predicate)
  })
}))

describe('WatStoreService', () => {
  let service: WatStoreService

  beforeEach(() => {
    service = new WatStoreService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(WatStoreService)
    })
  })

  describe('Officer ID management', () => {
    it('should set and get officer ID', () => {
      const testOfficerId = 'test-officer-123'

      service.setOfficerId = testOfficerId
      expect(service.getOfficerId).toBe(testOfficerId)
    })

    it('should handle empty officer ID', () => {
      service.setOfficerId = ''
      expect(service.getOfficerId).toBe('')
    })
  })

  describe('Work Order ID management', () => {
    it('should set and get work order ID', () => {
      const testWorkOrderId = 'work-order-456'

      service.setworkOrderId = testWorkOrderId
      expect(service.getworkOrderId).toBe(testWorkOrderId)
    })

    it('should handle null work order ID', () => {
      service.setworkOrderId = null
      expect(service.getworkOrderId).toBe(null)
    })
  })

  describe('Activities Group management', () => {
    it('should return activities group as observable', (done) => {
      // const testData: NSWatActivity.IActivityGroup[] = [
      //   { id: 1, name: 'Activity Group 1' } as unknown as NSWatActivity.IActivityGroup
      // ]

      service.getactivitiesGroup.subscribe(data => {
        expect(data).toEqual([])
        done()
      })
    })

    it('should set activities group and trigger save', (done) => {
      const testData: NSWatActivity.IActivityGroup[] = [
        { id: 1, name: 'Activity Group 1' } as unknown as NSWatActivity.IActivityGroup
      ]

      let triggerCallCount = 0
      service.triggerSave().subscribe(trigger => {
        triggerCallCount++
        if (triggerCallCount === 1) {
          expect(trigger.reload).toBe(true)
          expect(trigger.serverCall).toBe(true)
          done()
        }
      })

      service.setgetactivitiesGroup(testData, true, true)
    })

    it('should set activities group with default parameters', (done) => {
      const testData: NSWatActivity.IActivityGroup[] = []

      service.triggerSave().subscribe(trigger => {
        expect(trigger.reload).toBe(false)
        expect(trigger.serverCall).toBe(false)
        done()
      })

      service.setgetactivitiesGroup(testData)
    })
  })

  describe('Competency Group management', () => {
    it('should return competency group as observable', (done) => {
      service.getcompetencyGroup.subscribe(data => {
        expect(data).toEqual([])
        done()
      })
    })

    it('should get competency group value', () => {
      const result = service.getcompetencyGroupValue
      expect(result).toEqual([])
    })

    it('should set competency group', (done) => {
      const testData: NSWatCompetency.ICompActivityGroup[] = [
        {
          id: 1,
          name: 'Comp Group 1',
          competincies: []
        } as unknown as NSWatCompetency.ICompActivityGroup
      ]

      let callCount = 0
      service.triggerSave().subscribe(trigger => {
        callCount++
        if (callCount === 1) {
          expect(trigger.reload).toBe(true)
          expect(trigger.serverCall).toBe(false)
          done()
        }
      })

      service.setgetcompetencyGroup(testData, true, false)
    })

    it('should update competency group', (done) => {
      const testData: NSWatCompetency.ICompActivity[] = [
        {
          localId: 1,
          compName: 'Test Competency'
        } as NSWatCompetency.ICompActivity
      ]

      service.triggerSave().subscribe(trigger => {
        expect(trigger.reload).toBe(false)
        expect(trigger.serverCall).toBe(true)
        done()
      })

      service.updateCompGroup(testData)
    })

    it('should get update competency group observable', (done) => {
      service.getUpdateCompGroupO.subscribe(data => {
        expect(data).toEqual([])
        done()
      })
    })

    it('should get update competency group by ID', () => {
      // First set some test data
      const testData: NSWatCompetency.ICompActivity[] = [
        { localId: 1, compName: 'Test Comp 1' } as NSWatCompetency.ICompActivity,
        { localId: 2, compName: 'Test Comp 2' } as NSWatCompetency.ICompActivity
      ]

      service.updateCompGroup(testData)

      const result = service.getUpdateCompGroupById(1)
      expect(result).toBeDefined()
    })

    it('should return undefined for non-existent competency ID', () => {
      const result = service.getUpdateCompGroupById(999)
      expect(result).toBeUndefined()
    })
  })

  describe('setCompGroup method', () => {
    it('should process competency groups and merge existing data', (done) => {
      const mockCompetencyGroup = [
        {
          competincies: [
            {
              localId: 1,
              compName: 'Test Comp',
              compLevel: 'Basic'
            } as NSWatCompetency.ICompActivity
          ]
        } as NSWatCompetency.ICompActivityGroup
      ]

      // Set up the competency group first
      service.setgetcompetencyGroup(mockCompetencyGroup)

      let callCount = 0
      service.get_compGrp.subscribe(data => {
        callCount++
        if (callCount === 2) { // Skip initial empty emission
          expect(data).toBeDefined()
          expect(Array.isArray(data)).toBe(true)
          done()
        }
      })
    })

    it('should handle empty competency groups', (done) => {
      service.get_compGrp.subscribe(data => {
        expect(data).toEqual([])
        done()
      })

      service.setCompGroup()
    })
  })

  describe('Officer Group management', () => {
    it('should return officer group as observable', (done) => {
      service.getOfficerGroup.subscribe(data => {
        expect(data).toEqual([])
        done()
      })
    })

    it('should set officer group', (done) => {
      const testData: NSWatOfficer.IOfficerGroup[] = [
        { id: 1, name: 'Officer Group 1' } as unknown as NSWatOfficer.IOfficerGroup
      ]

      service.triggerSave().subscribe(trigger => {
        expect(trigger.reload).toBe(false)
        expect(trigger.serverCall).toBe(true)
        done()
      })

      service.setOfficerGroup(testData)
    })
  })

  describe('Progress management', () => {
    it('should set and get current progress', (done) => {
      const testProgress = 75

      service.getCurrentProgress.subscribe(progress => {
        if (progress === testProgress) {
          expect(progress).toBe(testProgress)
          done()
        }
      })

      service.setCurrentProgress(testProgress)
    })

    it('should handle zero progress', (done) => {
      service.getCurrentProgress.subscribe(progress => {
        if (progress === 0) {
          expect(progress).toBe(0)
          done()
        }
      })

      service.setCurrentProgress(0)
    })
  })

  describe('Error Count management', () => {
    it('should set and get error count', (done) => {
      const testErrorCount = 5

      service.getErrorCount.subscribe(count => {
        if (count === testErrorCount) {
          expect(count).toBe(testErrorCount)
          done()
        }
      })

      service.setErrorCount(testErrorCount)
    })

    it('should handle negative error count', (done) => {
      const negativeCount = -1

      service.getErrorCount.subscribe(count => {
        if (count === negativeCount) {
          expect(count).toBe(negativeCount)
          done()
        }
      })

      service.setErrorCount(negativeCount)
    })
  })

  describe('ID generation', () => {
    it('should generate incremental IDs', () => {
      const firstId = service.getID
      const secondId = service.getID
      const thirdId = service.getID

      expect(secondId).toBe(firstId + 1)
      expect(thirdId).toBe(secondId + 1)
    })

    it('should start from 101', () => {
      const firstId = service.getID
      expect(firstId).toBe(101)
    })
  })

  describe('Trigger Save', () => {
    it('should return trigger save observable', (done) => {
      service.triggerSave().subscribe(trigger => {
        expect(trigger).toBeDefined()
        expect(typeof trigger).toBe('object')
        done()
      })
    })
  })

  describe('Clear method', () => {
    it('should reset all BehaviorSubjects to initial state', (done) => {
      // Set some data first
      service.setCurrentProgress(50)
      service.setErrorCount(3)

      // Clear the service
      service.clear()

      // Check that everything is reset
      let checkCount = 0
      const totalChecks = 7

      const checkCompletion = () => {
        checkCount++
        if (checkCount === totalChecks) {
          done()
        }
      }

      service.getactivitiesGroup.subscribe(data => {
        expect(data).toEqual([])
        checkCompletion()
      })

      service.getcompetencyGroup.subscribe(data => {
        expect(data).toEqual([])
        checkCompletion()
      })

      service.getOfficerGroup.subscribe(data => {
        expect(data).toEqual([])
        checkCompletion()
      })

      service.get_compGrp.subscribe(data => {
        expect(data).toEqual([])
        checkCompletion()
      })

      service.getUpdateCompGroupO.subscribe(data => {
        expect(data).toEqual([])
        checkCompletion()
      })

      service.getCurrentProgress.subscribe(progress => {
        expect(progress).toBe(0)
        checkCompletion()
      })

      service.getErrorCount.subscribe(count => {
        expect(count).toBe(0)
        checkCompletion()
      })
    })

    it('should reset trigger save state', (done) => {
      service.clear()

      service.triggerSave().subscribe(trigger => {
        expect(trigger.reload).toBe(false)
        expect(trigger.serverCall).toBe(false)
        done()
      })
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle undefined data in setgetactivitiesGroup', (done) => {
      service.triggerSave().subscribe(trigger => {
        expect(trigger.reload).toBe(false)
        expect(trigger.serverCall).toBe(false)
        done()
      })

      service.setgetactivitiesGroup(undefined as any)
    })

    it('should handle null data in competency group operations', () => {
      expect(() => {
        service.setgetcompetencyGroup(null as any)
      }).not.toThrow()
    })

    it('should handle large progress values', (done) => {
      const largeProgress = 99999

      service.getCurrentProgress.subscribe(progress => {
        if (progress === largeProgress) {
          expect(progress).toBe(largeProgress)
          done()
        }
      })

      service.setCurrentProgress(largeProgress)
    })
  })
})