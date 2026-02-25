import { HandsOnService } from './hands-on.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

describe('HandsOnService', () => {
  let service: HandsOnService
  let httpClientSpy: jest.Mocked<HttpClient>

  beforeEach(() => {
    httpClientSpy = {
      post: jest.fn(),
      get: jest.fn(),
    } as any

    service = new HandsOnService(httpClientSpy)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('execute', () => {
    it('should make POST request to execute endpoint', () => {
      const mockExerciseData = { code: 'test code' }
      const expectedResponse = { result: 'success' }
      httpClientSpy.post.mockReturnValue(of(expectedResponse))

      service.execute(mockExerciseData).subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/execute',
        mockExerciseData
      )
    })
  })

  describe('verifyFp', () => {
    it('should make POST request to verify FP endpoint', () => {
      const mockLexId = 'test-lex-id'
      const mockExerciseData = { code: 'test code' }
      const expectedResponse = { result: 'success' }
      httpClientSpy.post.mockReturnValue(of(expectedResponse))

      service.verifyFp(mockLexId, mockExerciseData).subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/fp/verify/test-lex-id',
        mockExerciseData
      )
    })
  })

  describe('submitFp', () => {
    it('should make POST request to submit FP endpoint', () => {
      const mockLexId = 'test-lex-id'
      const mockExerciseData = { code: 'test code' }
      const expectedResponse = { result: 'success' }
      httpClientSpy.post.mockReturnValue(of(expectedResponse))

      service.submitFp(mockLexId, mockExerciseData).subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/fp/submit/test-lex-id',
        mockExerciseData
      )
    })
  })

  describe('verifyJavaFp', () => {
    it('should make POST request to verify Java FP endpoint', () => {
      const mockLexId = 'test-lex-id'
      const mockExerciseData = { code: 'test java code' }
      const expectedResponse = { result: 'success' }
      httpClientSpy.post.mockReturnValue(of(expectedResponse))

      service.verifyJavaFp(mockLexId, mockExerciseData).subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/fp/javaVerify/test-lex-id',
        mockExerciseData
      )
    })
  })

  describe('submitJavaFp', () => {
    it('should make POST request to submit Java FP endpoint', () => {
      const mockLexId = 'test-lex-id'
      const mockExerciseData = { code: 'test java code' }
      const expectedResponse = { result: 'success' }
      httpClientSpy.post.mockReturnValue(of(expectedResponse))

      service.submitJavaFp(mockLexId, mockExerciseData).subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/fp/javaSubmit/test-lex-id',
        mockExerciseData
      )
    })
  })

  describe('verifyCe', () => {
    it('should make POST request to verify CE endpoint', () => {
      const mockLexId = 'test-lex-id'
      const mockExerciseData = { code: 'test code' }
      const expectedResponse = { result: 'success' }
      httpClientSpy.post.mockReturnValue(of(expectedResponse))

      service.verifyCe(mockLexId, mockExerciseData).subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/ce/verify/test-lex-id',
        mockExerciseData
      )
    })
  })

  describe('submitCe', () => {
    it('should make POST request to submit CE endpoint', () => {
      const mockLexId = 'test-lex-id'
      const mockExerciseData = { code: 'test code' }
      const expectedResponse = { result: 'success' }
      httpClientSpy.post.mockReturnValue(of(expectedResponse))

      service.submitCe(mockLexId, mockExerciseData).subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/ce/submit/test-lex-id',
        mockExerciseData
      )
    })
  })

  describe('viewLastSubmission', () => {
    it('should handle submission found', () => {
      const mockLexId = 'test-lex-id'
      const mockSubmissionResponse = {
        response: [{ submission_url: 'http://test-url.com' }]
      }
      const mockSubmissionContent = 'test submission content'

      httpClientSpy.get
        .mockReturnValueOnce(of(mockSubmissionResponse))
        .mockReturnValueOnce(of(mockSubmissionContent))

      service.viewLastSubmission(mockLexId).subscribe(response => {
        expect(response).toBe(mockSubmissionContent)
      })

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/code/viewLastSubmission/test-lex-id'
      )
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'http://test-url.com',
        { responseType: 'text' }
      )
    })
  })
})