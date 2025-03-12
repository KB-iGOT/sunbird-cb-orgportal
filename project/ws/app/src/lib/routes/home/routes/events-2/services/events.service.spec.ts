import { EventsService } from './events.service'
import { HttpClient } from '@angular/common/http'
import { DatePipe } from '@angular/common'
import { of } from 'rxjs'
import * as _ from 'lodash'

jest.mock('@angular/common/http')
jest.mock('@angular/common')

describe('EventsService', () => {
  let service: EventsService
  let httpClientMock: jest.Mocked<HttpClient>
  let datePipeMock: jest.Mocked<DatePipe>

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
    } as any

    datePipeMock = {
      transform: jest.fn(),
    } as any

    service = new EventsService(httpClientMock, datePipeMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getEvents', () => {
    it('should transform event dates and return formatted data', (done) => {
      // Arrange
      const mockResponse = {
        result: {
          Event: [
            { startDate: '2021-09-01', createdOn: '2021-09-01' },
            { startDate: '2022-09-01', createdOn: '2022-09-01' },
          ],
          count: 2,
        },
      }

      const req = { request: { filters: { status: ['Live'] } } }

      httpClientMock.post.mockReturnValue(of(mockResponse))
      datePipeMock.transform.mockReturnValue('01 Sep, 2021') // Mocked date transformation

      // Act
      service.getEvents(req).subscribe((data) => {
        // Assert
        expect(data.Event.length).toBe(2)
        expect(data.Event[0].startDate).toBe('01 Sep, 2021')
        expect(data.Event[0].createdOn).toBe('01 Sep, 2021')
        expect(data.count).toBe(2)
        done()
      })
    })
  })

  describe('createContent', () => {
    it('should call httpClient.post with correct endpoint', () => {
      // Arrange
      const reqBody = { name: 'Test Content' }
      const response = { id: 1 }
      httpClientMock.post.mockReturnValue(of(response))

      // Act
      service.createContent(reqBody).subscribe((data) => {
        // Assert
        expect(httpClientMock.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/action/content/v3/create',
          reqBody
        )
        expect(data).toEqual(response)
      })
    })
  })

  describe('uploadContent', () => {
    it('should call httpClient.post with correct endpoint and form data', () => {
      // Arrange
      const val = 'someId'
      const formdata = { file: 'testfile' }
      const response = { success: true }
      httpClientMock.post.mockReturnValue(of(response))

      // Act
      service.uploadContent(val, formdata).subscribe((data) => {
        // Assert
        expect(httpClientMock.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/upload/action/content/v3/upload/someId',
          formdata,
          { headers: { 'content-type': 'application/json' } }
        )
        expect(data).toEqual(response)
      })
    })
  })

  describe('createEvent', () => {
    it('should call httpClient.post with correct endpoint', () => {
      // Arrange
      const reqBody = { name: 'New Event' }
      const response = { id: 1 }
      httpClientMock.post.mockReturnValue(of(response))

      // Act
      service.createEvent(reqBody).subscribe((data) => {
        // Assert
        expect(httpClientMock.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/event/v4/create',
          reqBody
        )
        expect(data).toEqual(response)
      })
    })
  })

  describe('convertToTreeView', () => {
    it('should correctly convert competencies to tree view', () => {
      // Arrange
      const competencies = [
        {
          competencyAreaName: 'Area 1',
          competencyThemeName: 'Theme 1',
          competencySubThemeName: 'SubTheme 1',
        },
      ]

      const expectedResult = [
        {
          competencyAreaName: 'Area 1',
          themes: [
            {
              competencyThemeName: 'Theme 1',
              subThems: [
                {
                  competencySubThemeName: 'SubTheme 1',
                },
              ],
            },
          ],
        },
      ]

      // Act
      const result = service.convertToTreeView(competencies)

      // Assert
      expect(result).toEqual(expectedResult)
    })
  })

  describe('searchUser', () => {
    it('should call httpClient.post with correct request body', () => {
      // Arrange
      const value = 'user1'
      const rootOrgId = 'org1'
      const response = { users: [] }
      httpClientMock.post.mockReturnValue(of(response))

      // Act
      service.searchUser(value, rootOrgId).subscribe((data) => {
        // Assert
        expect(httpClientMock.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/user/v1/search',
          {
            request: {
              query: value,
              filters: { rootOrgId },
            },
          }
        )
        expect(data).toEqual(response)
      })
    })
  })
})
