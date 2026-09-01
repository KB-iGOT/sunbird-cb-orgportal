import { UserWorkService } from './user-work.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'

// Mocking HttpClient
jest.mock('@angular/common/http', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}))

describe('UserWorkService', () => {
  let service: UserWorkService
  let httpClientMock: jest.Mocked<HttpClient>

  beforeEach(() => {
    httpClientMock = new HttpClient(null as any) as jest.Mocked<HttpClient>
    service = new UserWorkService(httpClientMock)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should fetch user work allocation by user id', (done) => {
    const usersId = '123'
    const mockResponse = { work: 'test' } // mock response data
    httpClientMock.get.mockReturnValue(of(mockResponse)) // mock the get method

    service.fetchUserWorkAllocation(usersId).subscribe(response => {
      expect(response).toEqual(mockResponse)
      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/workallocation/getWorkAllocationById/123')
      done()
    })
  })
})
