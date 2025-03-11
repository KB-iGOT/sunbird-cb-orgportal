
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'
import { TopicService } from './topics.service'

// Mock HttpClient and BehaviorSubject
jest.mock('@angular/common/http')
jest.mock('rxjs')

describe('TopicService', () => {
  let topicService: TopicService
  let mockHttpClient: HttpClient
  let mockBehaviorSubject: jest.Mocked<BehaviorSubject<any>>

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
    } as any

    // Mock the BehaviorSubjects
    mockBehaviorSubject = {
      next: jest.fn(),
      value: [],
    } as any

    topicService = new TopicService(mockHttpClient)
    // Overriding BehaviorSubject for the tests
    topicService.systemTopics = mockBehaviorSubject
    topicService.desiredTopics = mockBehaviorSubject
  })

  it('should be created', () => {
    expect(topicService).toBeTruthy()
  })

  it('should load topics using the http client', () => {
    const mockResponse = { data: 'mockData' }
    // mockHttpClient.get.mockReturnValueOnce(mockResponse) // Mocking the HTTP request

    const result = topicService.loadTopics()

    expect(mockHttpClient.get).toHaveBeenCalledWith('/apis/protected/v8/catalog')
    expect(result).toEqual(mockResponse)
  })

  it('should add a system topic', () => {
    const newTopic: any = { identifier: '123', name: 'testTopic' }
    topicService.addSystemTopics(newTopic)

    expect(mockBehaviorSubject.next).toHaveBeenCalledWith([newTopic])
  })

  it('should add a desired topic', () => {
    const newTopic = 'testDesiredTopic'
    topicService.addDesiredTopics(newTopic)

    expect(mockBehaviorSubject.next).toHaveBeenCalledWith([newTopic])
  })

  it('should initialize system topics', () => {
    const initTopics: any = [{ identifier: '123', name: 'testTopic' }]
    topicService.addInitSystemTopics(initTopics)

    expect(mockBehaviorSubject.next).toHaveBeenCalledWith(initTopics)
  })

  it('should initialize desired topics', () => {
    const initTopics = ['testDesiredTopic']
    topicService.addInitDesiredTopics(initTopics)

    expect(mockBehaviorSubject.next).toHaveBeenCalledWith(initTopics)
  })

  it('should remove a system topic', () => {
    const existingTopic: any = { identifier: '123', name: 'testTopic' }
    topicService.addSystemTopics(existingTopic) // Add topic first

    topicService.removeSystemTopics(existingTopic)

    expect(mockBehaviorSubject.next).toHaveBeenCalledWith([])
  })

  it('should remove a desired topic', () => {
    const topicToRemove = 'testDesiredTopic'
    topicService.addDesiredTopics(topicToRemove) // Add topic first

    topicService.removeDesiredTopics(topicToRemove)

    expect(mockBehaviorSubject.next).toHaveBeenCalledWith([])
  })

  it('should return current selected desired topics', () => {
    const currentTopics = ['desiredTopic1', 'desiredTopic2']
    //mockBehaviorSubject.value = currentTopics

    const result = topicService.getCurrentSelectedDesTopics

    expect(result).toEqual(currentTopics)
  })

  it('should return current selected system topics', () => {
    const currentTopics = [{ identifier: '123', name: 'sysTopic1' }]
    //mockBehaviorSubject.value = currentTopics

    const result = topicService.getCurrentSelectedSysTopics

    expect(result).toEqual(currentTopics)
  })

  it('should save desired topic using http client', () => {
    const mockResponse = { data: 'mockResponse' }
    const desiredTopic: any = { identifier: '123', name: 'desiredTopic' }
    //mockHttpClient.post.mockReturnValueOnce(mockResponse)

    const result = topicService.saveDesiredTopic(desiredTopic)

    expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', desiredTopic)
    expect(result).toEqual(mockResponse)
  })

  it('should save system topic using http client', () => {
    const mockResponse = { data: 'mockResponse' }
    const systemTopic: any = { identifier: '123', name: 'sysTopic' }
    //mockHttpClient.post.mockReturnValueOnce(mockResponse)

    const result = topicService.saveSystemTopic(systemTopic)

    expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/extPatch', systemTopic)
    expect(result).toEqual(mockResponse)
  })
})
