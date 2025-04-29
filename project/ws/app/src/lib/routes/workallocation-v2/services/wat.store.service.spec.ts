
import { WatStoreService } from './wat.store.service'

// Mock the models since we don't have access to them
jest.mock('../models/activity-wot.model', () => ({
  NSWatActivity: {
    IActivityGroup: {}
  }
}))

jest.mock('../models/competency-wat.model', () => ({
  NSWatCompetency: {
    ICompActivityGroup: {},
    ICompActivity: {}
  }
}))

jest.mock('../models/officer-wat.model', () => ({
  NSWatOfficer: {
    IOfficerGroup: {}
  }
}))

describe('WatStoreService', () => {
  let service: WatStoreService

  beforeEach(() => {
    service = new WatStoreService()
  })

  afterEach(() => {
    // Clean up after each test
    service.clear()
  })

  describe('Basic properties', () => {
    it('should be created', () => {
      expect(service).toBeTruthy()
    })

    it('should set and get officerId', () => {
      service.setOfficerId = '12345'
      expect(service.getOfficerId).toBe('12345')
    })

    it('should set and get workOrderId', () => {
      service.setworkOrderId = 'WO-789'
      expect(service.getworkOrderId).toBe('WO-789')
    })

    it('should generate incremental IDs', () => {
      const id1 = service.getID
      const id2 = service.getID
      expect(id2).toBe(id1 + 1)
    })
  })


})