
import { of } from 'rxjs'
import { TopicService } from './topics.service'

describe('TopicService', () => {
  let service: TopicService
  let mockHttpClient: any

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
    }
    service = new TopicService(mockHttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('loadTopics', () => {
    it('should GET from catalog endpoint', (done) => {
      const mockResponse = { topics: ['t1'] }
      mockHttpClient.get.mockReturnValue(of(mockResponse))
      service.loadTopics().subscribe(res => {
        expect(res).toEqual(mockResponse)
        expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/protected/v8/catalog')
        done()
      })
    })
  })

  describe('addSystemTopics', () => {
    it('should add a topic to systemTopics', () => {
      const spy = jest.spyOn(service.systemTopics, 'next')
      const topic: any = { identifier: '1', name: 'Topic A' }
      service.addSystemTopics(topic)
      expect(spy).toHaveBeenCalledWith([topic])
    })
  })

  describe('addDesiredTopics', () => {
    it('should add a desired topic string', () => {
      const spy = jest.spyOn(service.desiredTopics, 'next')
      service.addDesiredTopics('topic1')
      expect(spy).toHaveBeenCalledWith(['topic1'])
    })
  })

  describe('addInitSystemTopics', () => {
    it('should initialize system topics', () => {
      const spy = jest.spyOn(service.systemTopics, 'next')
      const topics: any[] = [{ identifier: '1', name: 'T1' }]
      service.addInitSystemTopics(topics)
      expect(spy).toHaveBeenCalledWith(topics)
    })
  })

  describe('addInitDesiredTopics', () => {
    it('should initialize desired topics', () => {
      const spy = jest.spyOn(service.desiredTopics, 'next')
      const topics = ['t1', 't2']
      service.addInitDesiredTopics(topics)
      expect(spy).toHaveBeenCalledWith(topics)
    })
  })

  describe('removeSystemTopics', () => {
    it('should remove a system topic by identifier', () => {
      const topic: any = { identifier: '1', name: 'T1' }
      service.addSystemTopics(topic)
      const spy = jest.spyOn(service.systemTopics, 'next')
      service.removeSystemTopics(topic)
      expect(spy).toHaveBeenCalledWith([])
    })

    it('should not remove if identifier is missing', () => {
      const topic: any = { name: 'no-id' }
      service.addSystemTopics({ identifier: '1', name: 'keep' } as any)
      const spy = jest.spyOn(service.systemTopics, 'next')
      service.removeSystemTopics(topic)
      // next is called but with same array since no index match
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('removeDesiredTopics', () => {
    it('should remove a desired topic string', () => {
      service.addDesiredTopics('topic1')
      const spy = jest.spyOn(service.desiredTopics, 'next')
      service.removeDesiredTopics('topic1')
      expect(spy).toHaveBeenCalledWith([])
    })

    it('should do nothing if topic not found', () => {
      const spy = jest.spyOn(service.desiredTopics, 'next')
      service.removeDesiredTopics('nonexistent')
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('getCurrentSelectedDesTopics', () => {
    it('should return current desired topics', () => {
      service.addInitDesiredTopics(['t1', 't2'])
      expect(service.getCurrentSelectedDesTopics).toEqual(['t1', 't2'])
    })

    it('should return empty array when no desired topics', () => {
      expect(service.getCurrentSelectedDesTopics).toEqual([])
    })
  })

  describe('getCurrentSelectedSysTopics', () => {
    it('should return current system topics', () => {
      const topics: any[] = [{ identifier: '1', name: 'T1' }]
      service.addInitSystemTopics(topics)
      expect(service.getCurrentSelectedSysTopics).toEqual(topics)
    })

    it('should return empty array when no system topics', () => {
      expect(service.getCurrentSelectedSysTopics).toEqual([])
    })
  })

  describe('saveDesiredTopic', () => {
    it('should POST to addTopic endpoint', (done) => {
      const mockData: any = { request: { userId: 'u1', profileDetails: {} } }
      const mockResponse = { success: true }
      mockHttpClient.post.mockReturnValue(of(mockResponse))
      service.saveDesiredTopic(mockData).subscribe(res => {
        expect(res).toEqual(mockResponse)
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', mockData)
        done()
      })
    })
  })

  describe('saveSystemTopic', () => {
    it('should POST to addTopic endpoint', (done) => {
      const mockData: any = { request: { userId: 'u1', profileDetails: {} } }
      const mockResponse = { success: true }
      mockHttpClient.post.mockReturnValue(of(mockResponse))
      service.saveSystemTopic(mockData).subscribe(res => {
        expect(res).toEqual(mockResponse)
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', mockData)
        done()
      })
    })
  })
})
