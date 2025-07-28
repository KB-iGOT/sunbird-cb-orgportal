import { LocalDataService } from './local-data.service'
import { IBatch, IBatchUsersCount } from '../interface/content-batch.model'
import { IAuthorData } from '../interface/author-card.model'

describe('LocalDataService', () => {
  let service: LocalDataService

  beforeEach(() => {
    service = new LocalDataService()
  })

  afterEach(() => {
    // Clean up subscriptions if needed
    service.contentTitle.complete()
    service.content.complete()
    service.currentBatch.complete()
    service.batchUsers.complete()
    service.currentUser.complete()
    service.batchDefaults.complete()
    service.batchCreated.complete()
  })

  describe('Constructor and Initial State', () => {
    it('should create service instance', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize all BehaviorSubjects with correct default values', () => {
      expect(service.contentTitle.getValue()).toBe('')
      expect(service.content.getValue()).toBeNull()
      expect(service.currentBatch.getValue()).toBeNull()
      expect(service.batchUsers.getValue()).toEqual([])
      expect(service.currentUser.getValue()).toBeNull()
      expect(service.batchDefaults.getValue()).toBeNull()
      expect(service.batchCreated.getValue()).toBe(false)
    })
  })

  describe('initData', () => {
    it('should set contentTitle and content when data has name property', () => {
      const mockData = { name: 'Test Content', id: 1, description: 'Test Description' }

      service.initData(mockData)

      expect(service.contentTitle.getValue()).toBe('Test Content')
      expect(service.content.getValue()).toEqual(mockData)
    })

    it('should set empty string for contentTitle when data is null', () => {
      service.initData(null as any)

      expect(service.contentTitle.getValue()).toBe('')
      expect(service.content.getValue()).toBeNull()
    })

    it('should set empty string for contentTitle when data is undefined', () => {
      service.initData(null as any)

      expect(service.contentTitle.getValue()).toBe('')
      expect(service.content.getValue()).toBeUndefined()
    })

    it('should set empty string for contentTitle when data has no name property', () => {
      const mockData = { id: 1, description: 'Test Description' }

      service.initData(mockData)

      expect(service.contentTitle.getValue()).toBe('')
      expect(service.content.getValue()).toEqual(mockData)
    })
  })

  describe('initBatch', () => {
    it('should set currentBatch with provided IBatch data', () => {
      const mockBatch: IBatch = {
      } as IBatch

      service.initBatch(mockBatch)

      expect(service.currentBatch.getValue()).toEqual(mockBatch)
    })

    it('should handle null batch data', () => {
      service.initBatch(null as any)

      expect(service.currentBatch.getValue()).toBeNull()
    })
  })

  describe('batchUsersCount', () => {
    it('should add new batch user count when batchId does not exist', () => {
      const mockBatchUser: IBatchUsersCount = {
        batchId: 'batch-1',
        userCount: 10,
        activeUsers: 8
      } as IBatchUsersCount

      service.batchUsersCount(mockBatchUser)

      const result = service.batchUsers.getValue()
      expect(result.length).toBe(1)
      expect(result[0]).toEqual(mockBatchUser)
    })

    it('should update existing batch user count when batchId exists', () => {
      // Setup initial data
      const initialBatchUser: IBatchUsersCount = {
        batchId: 'batch-1',
        userCount: 5,
        activeUsers: 3
      } as IBatchUsersCount

      service.batchUsersCount(initialBatchUser)

      // Update with new data
      const updatedBatchUser: IBatchUsersCount = {
        batchId: 'batch-1',
        userCount: 15,
        activeUsers: 12
      } as IBatchUsersCount

      service.batchUsersCount(updatedBatchUser)

      const result = service.batchUsers.getValue()
      expect(result.length).toBe(1)
      expect(result[0]).toEqual(updatedBatchUser)
      // expect(result[0].userCount).toBe(15)
      // expect(result[0].activeUsers).toBe(12)
    })

    it('should handle multiple different batch users', () => {
      const batchUser1: IBatchUsersCount = {
        batchId: 'batch-1',
        userCount: 10,
        activeUsers: 8
      } as IBatchUsersCount

      const batchUser2: IBatchUsersCount = {
        batchId: 'batch-2',
        userCount: 20,
        activeUsers: 15
      } as IBatchUsersCount

      service.batchUsersCount(batchUser1)
      service.batchUsersCount(batchUser2)

      const result = service.batchUsers.getValue()
      expect(result.length).toBe(2)
      expect(result[0]).toEqual(batchUser1)
      expect(result[1]).toEqual(batchUser2)
    })

    it('should update correct batch when multiple batches exist', () => {
      // Setup multiple batches
      const batchUser1: IBatchUsersCount = {
        batchId: 'batch-1',
        userCount: 10,
        activeUsers: 8
      } as IBatchUsersCount

      const batchUser2: IBatchUsersCount = {
        batchId: 'batch-2',
        userCount: 20,
        activeUsers: 15
      } as IBatchUsersCount

      const batchUser3: IBatchUsersCount = {
        batchId: 'batch-3',
        userCount: 30,
        activeUsers: 25
      } as IBatchUsersCount

      service.batchUsersCount(batchUser1)
      service.batchUsersCount(batchUser2)
      service.batchUsersCount(batchUser3)

      // Update middle batch
      const updatedBatchUser2: IBatchUsersCount = {
        batchId: 'batch-2',
        userCount: 25,
        activeUsers: 20
      } as IBatchUsersCount

      service.batchUsersCount(updatedBatchUser2)

      const result = service.batchUsers.getValue()
      expect(result.length).toBe(3)
      expect(result[0]).toEqual(batchUser1) // unchanged
      expect(result[1]).toEqual(updatedBatchUser2) // updated
      expect(result[2]).toEqual(batchUser3) // unchanged
    })

    it('should handle existingIdx = 0 (first element update)', () => {
      const batchUser1: IBatchUsersCount = {
        batchId: 'batch-1',
        userCount: 10,
        activeUsers: 8
      } as IBatchUsersCount

      const batchUser2: IBatchUsersCount = {
        batchId: 'batch-2',
        userCount: 20,
        activeUsers: 15
      } as IBatchUsersCount

      service.batchUsersCount(batchUser1)
      service.batchUsersCount(batchUser2)

      // Update first batch (existingIdx = 0)
      const updatedBatchUser1: IBatchUsersCount = {
        batchId: 'batch-1',
        userCount: 12,
        activeUsers: 10
      } as IBatchUsersCount

      service.batchUsersCount(updatedBatchUser1)

      const result = service.batchUsers.getValue()
      expect(result.length).toBe(2)
      expect(result[0]).toEqual(updatedBatchUser1)
      expect(result[1]).toEqual(batchUser2)
    })
  })

  describe('setCurrentUser', () => {
    it('should set currentUser with IAuthorData object', () => {
      const mockUser: IAuthorData = {
      } as IAuthorData

      service.setCurrentUser(mockUser)

      expect(service.currentUser.getValue()).toEqual(mockUser)
    })

    it('should set currentUser with any object type', () => {
      const mockUser = {
        id: 123,
        username: 'testuser',
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      }

      service.setCurrentUser(mockUser)

      expect(service.currentUser.getValue()).toEqual(mockUser)
    })

    it('should handle null user object', () => {
      service.setCurrentUser(null)

      expect(service.currentUser.getValue()).toBeNull()
    })

    it('should handle undefined user object', () => {
      service.setCurrentUser(undefined)

      expect(service.currentUser.getValue()).toBeUndefined()
    })
  })

  describe('BehaviorSubject subscription behavior', () => {
    it('should emit values when subscribed to contentTitle', (done) => {
      const testValue = 'Test Title'

      service.contentTitle.asObservable().subscribe(value => {
        if (value === testValue) {
          expect(value).toBe(testValue)
          done()
        }
      })

      service.contentTitle.next(testValue)
    })

    it('should emit values when subscribed to currentBatch', (done) => {
      const mockBatch: IBatch = {
      } as IBatch

      service.currentBatch.asObservable().subscribe(value => {
        if (value) {
          expect(value).toEqual(mockBatch)
          done()
        }
      })

      service.initBatch(mockBatch)
    })
  })
})