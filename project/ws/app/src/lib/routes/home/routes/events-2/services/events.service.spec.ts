import { EventsService } from './events.service'
import { of } from 'rxjs'

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
  patch: jest.fn()
}

// Mock DatePipe
const mockDatePipe = {
  transform: jest.fn()
}

describe('EventsService', () => {
  let service: EventsService

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Create service instance with mocked dependencies
    service = new EventsService(
      mockHttpClient as any,
      mockDatePipe as any
    )
  })

  describe('getEvents', () => {
    it('should fetch and format events data correctly', (done) => {
      // Arrange
      const mockRequest = { request: { filters: { status: ['Live'] } } }
      const mockTab = 'current'
      const mockResponse = {
        result: {
          Event: [
            {
              id: '1',
              name: 'Test Event',
              startDate: '2024-01-15',
              createdOn: '2024-01-10',
              startDateTime: '2024-01-15T10:00:00Z'
            }
          ],
          count: 1
        }
      }

      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockReturnValue('15 Jan, 2024')

      // Act
      service.getEvents(mockRequest, mockTab).subscribe(result => {
        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/sunbirdigot/search', mockRequest)
        expect(result.Event).toHaveLength(1)
        expect(result.count).toBe(1)
        expect(result.Event[0].startDate).toBe('15 Jan, 2024')
        expect(result.Event[0].createdOn).toBe('15 Jan, 2024')
        expect(mockDatePipe.transform).toHaveBeenCalledWith('2024-01-15', 'dd MMM, yyyy')
        done()
      })
    })

    it('should handle empty events array', (done) => {
      // Arrange
      const mockRequest = { request: { filters: { status: ['Draft'] } } }
      const mockTab = 'draft'
      const mockResponse = {
        result: {
          Event: [],
          count: 0
        }
      }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.getEvents(mockRequest, mockTab).subscribe(result => {
        // Assert
        expect(result.Event).toEqual([])
        expect(result.count).toBe(0)
        done()
      })
    })

    it('should hide buttons for past live events', (done) => {
      // Arrange
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      const mockRequest = { request: { filters: { status: ['Live'] } } }
      const mockTab = 'current'
      const mockResponse = {
        result: {
          Event: [
            {
              id: '1',
              name: 'Past Event',
              startDateTime: pastDate.toISOString()
            }
          ],
          count: 1
        }
      }

      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockReturnValue('')

      // Act
      service.getEvents(mockRequest, mockTab).subscribe(result => {
        // Assert
        expect(result.Event[0].buttonsToHide).toEqual(['edit', 'cancel'])
        done()
      })
    })

    it('should format all date fields correctly', (done) => {
      // Arrange
      const mockRequest = { request: { filters: { status: ['Published'] } } }
      const mockTab = 'published'
      const mockResponse = {
        result: {
          Event: [
            {
              id: '1',
              startDate: '2024-01-15',
              createdOn: '2024-01-10',
              cancelledOn: '2024-01-20',
              submitedOn: '2024-01-12',
              publishedOn: '2024-01-14',
              rejectedOn: null
            }
          ],
          count: 1
        }
      }

      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockImplementation((date) => {
        return date ? '15 Jan, 2024' : ''
      })

      // Act
      service.getEvents(mockRequest, mockTab).subscribe(result => {
        // Assert
        expect(result.Event[0].startDate).toBe('15 Jan, 2024')
        expect(result.Event[0].createdOn).toBe('15 Jan, 2024')
        expect(result.Event[0].cancelledOn).toBe('15 Jan, 2024')
        expect(result.Event[0].submitedOn).toBe('15 Jan, 2024')
        expect(result.Event[0].publishedOn).toBe('15 Jan, 2024')
        expect(result.Event[0].rejectedOn).toBe('')
        done()
      })
    })
  })

  describe('createContent', () => {
    it('should create content with correct request', (done) => {
      // Arrange
      const mockRequest = { name: 'Test Content', type: 'Resource' }
      const mockResponse = { result: { identifier: 'content123' } }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.createContent(mockRequest).subscribe(result => {
        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledWith('apis/proxies/v8/action/content/v3/create', mockRequest)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('uploadContent', () => {
    it('should upload content with correct parameters', (done) => {
      // Arrange
      const mockVal = 'content123'
      const mockFormData = new FormData()
      const mockResponse = { result: { url: 'uploaded-url' } }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.uploadContent(mockVal, mockFormData).subscribe(result => {
        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          `apis/proxies/v8/upload/action/content/v3/upload/${mockVal}`,
          mockFormData
        )
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('createEvent', () => {
    it('should create event with correct request', (done) => {
      // Arrange
      const mockRequest = { name: 'Test Event', description: 'Test Description' }
      const mockResponse = { result: { identifier: 'event123' } }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.createEvent(mockRequest).subscribe(result => {
        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/event/v4/create', mockRequest)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('getEventDetailsByid', () => {
    it('should get live event details when getLiveData is true', (done) => {
      // Arrange
      const eventId = 'event123'
      const getLiveData = true
      const mockResponse = { result: { event: { id: eventId } } }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      service.getEventDetailsByid(eventId, getLiveData).subscribe(result => {
        // Assert
        expect(mockHttpClient.get).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/read/${eventId}`)
        expect(result).toEqual(mockResponse)
        done()
      })
    })

    it('should get edit event details when getLiveData is false', (done) => {
      // Arrange
      const eventId = 'event123'
      const getLiveData = false
      const mockResponse = { result: { event: { id: eventId } } }

      mockHttpClient.get.mockReturnValue(of(mockResponse))

      // Act
      service.getEventDetailsByid(eventId, getLiveData).subscribe(result => {
        // Assert
        expect(mockHttpClient.get).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/read/${eventId}?mode=edit`)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('updateEvent', () => {
    it('should update event with correct parameters', (done) => {
      // Arrange
      const eventId = 'event123'
      const formBody = { name: 'Updated Event' }
      const mockResponse = { result: { identifier: eventId } }

      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      // Act
      service.updateEvent(formBody, eventId).subscribe(result => {
        // Assert
        expect(mockHttpClient.patch).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/update/${eventId}`, formBody)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('publishEvent', () => {
    it('should publish event with correct parameters', (done) => {
      // Arrange
      const eventId = 'event123'
      const formBody = { status: 'Live' }
      const mockResponse = { result: { status: 'Published' } }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.publishEvent(eventId, formBody).subscribe(result => {
        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/publish/${eventId}`, formBody)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('convertToTreeView', () => {
    it('should convert competencies to tree view structure', () => {
      // Arrange
      const mockCompetencies = [
        {
          competencyAreaName: 'Area 1',
          competencyAreaDescription: 'Area 1 Description',
          competencyAreaIdentifier: 'area1',
          competencyAreaRefId: 'areaRef1',
          competencyThemeName: 'Theme 1',
          competencyThemeDescription: 'Theme 1 Description',
          competencyThemeIdentifier: 'theme1',
          competencyThemeRefId: 'themeRef1',
          competencyThemeType: 'Type1',
          competencyThemeAdditionalProperties: {
            displayName: 'Theme Display',
            timeStamp: '2024-01-01'
          },
          competencySubThemeName: 'SubTheme 1',
          competencySubThemeDescription: 'SubTheme 1 Description',
          competencySubThemeIdentifier: 'subtheme1',
          competencySubThemeRefId: 'subthemeRef1',
          competencySubThemeAdditionalProperties: {
            displayName: 'SubTheme Display',
            timeStamp: '2024-01-01'
          }
        }
      ]

      // Act
      const result = service.convertToTreeView(mockCompetencies)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].competencyAreaName).toBe('Area 1')
      expect(result[0].themes).toHaveLength(1)
      expect(result[0].themes[0].competencyThemeName).toBe('Theme 1')
      expect(result[0].themes[0].subThems).toHaveLength(1)
      expect(result[0].themes[0].subThems[0].competencySubThemeName).toBe('SubTheme 1')
      expect(result[0].collapsed).toBe(true)
    })

    it('should group competencies by area and theme correctly', () => {
      // Arrange
      const mockCompetencies = [
        {
          competencyAreaName: 'Area 1',
          competencyAreaDescription: 'Area 1 Description',
          competencyAreaIdentifier: 'area1',
          competencyAreaRefId: 'areaRef1',
          competencyThemeName: 'Theme 1',
          competencyThemeDescription: 'Theme 1 Description',
          competencyThemeIdentifier: 'theme1',
          competencyThemeRefId: 'themeRef1',
          competencyThemeType: 'Type1',
          competencyThemeAdditionalProperties: {
            displayName: 'Theme Display',
            timeStamp: '2024-01-01'
          },
          competencySubThemeName: 'SubTheme 1',
          competencySubThemeDescription: 'SubTheme 1 Description',
          competencySubThemeIdentifier: 'subtheme1',
          competencySubThemeRefId: 'subthemeRef1',
          competencySubThemeAdditionalProperties: {
            displayName: 'SubTheme Display',
            timeStamp: '2024-01-01'
          }
        },
        {
          competencyAreaName: 'Area 1',
          competencyAreaDescription: 'Area 1 Description',
          competencyAreaIdentifier: 'area1',
          competencyAreaRefId: 'areaRef1',
          competencyThemeName: 'Theme 1',
          competencyThemeDescription: 'Theme 1 Description',
          competencyThemeIdentifier: 'theme1',
          competencyThemeRefId: 'themeRef1',
          competencyThemeType: 'Type1',
          competencyThemeAdditionalProperties: {
            displayName: 'Theme Display',
            timeStamp: '2024-01-01'
          },
          competencySubThemeName: 'SubTheme 2',
          competencySubThemeDescription: 'SubTheme 2 Description',
          competencySubThemeIdentifier: 'subtheme2',
          competencySubThemeRefId: 'subthemeRef2',
          competencySubThemeAdditionalProperties: {
            displayName: 'SubTheme Display 2',
            timeStamp: '2024-01-02'
          }
        }
      ]

      // Act
      const result = service.convertToTreeView(mockCompetencies)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].themes).toHaveLength(1)
      expect(result[0].themes[0].subThems).toHaveLength(2)
    })
  })

  describe('convertToTabularView', () => {
    it('should convert tree view to tabular format', () => {
      // Arrange
      const mockTreeView = [
        {
          competencyAreaName: 'Area 1',
          competencyAreaDescription: 'Area 1 Description',
          themes: [
            {
              competencyThemeName: 'Theme 1',
              competencyThemeDescription: 'Theme 1 Description',
              subThems: [
                {
                  competencySubThemeName: 'SubTheme 1',
                  competencySubThemeDescription: 'SubTheme 1 Description'
                },
                {
                  competencySubThemeName: 'SubTheme 2',
                  competencySubThemeDescription: 'SubTheme 2 Description'
                }
              ]
            }
          ]
        }
      ]

      // Act
      const result = service.convertToTabularView(mockTreeView)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].competencyAreaName).toBe('Area 1')
      expect(result[0].competencyThemeName).toBe('Theme 1')
      expect(result[0].competencySubThemeName).toBe('SubTheme 1')
      expect(result[1].competencySubThemeName).toBe('SubTheme 2')
      expect(result[0].themes).toBeUndefined()
      expect(result[0].subThems).toBeUndefined()
    })
  })

  describe('generateThemeObj', () => {
    it('should generate theme object with correct structure', () => {
      // Arrange
      const mockObj = {
        competencyThemeName: 'Theme 1',
        competencyThemeDescription: 'Theme 1 Description',
        competencyThemeIdentifier: 'theme1',
        competencyThemeRefId: 'themeRef1',
        competencyThemeType: 'Type1',
        competencyThemeAdditionalProperties: {
          displayName: 'Theme Display',
          timeStamp: '2024-01-01'
        },
        competencySubThemeName: 'SubTheme 1',
        competencySubThemeDescription: 'SubTheme 1 Description',
        competencySubThemeIdentifier: 'subtheme1',
        competencySubThemeRefId: 'subthemeRef1',
        competencySubThemeAdditionalProperties: {
          displayName: 'SubTheme Display',
          timeStamp: '2024-01-01'
        }
      }

      // Act
      const result = service.generateThemeObj(mockObj)

      // Assert
      expect(result.competencyThemeName).toBe('Theme 1')
      expect(result.collapsed).toBe(true)
      expect(result.subThems).toHaveLength(1)
      expect(result.subThems[0].competencySubThemeName).toBe('SubTheme 1')
      expect(result.competencyThemeAdditionalProperties.displayName).toBe('Theme Display')
    })
  })

  describe('searchUser', () => {
    it('should search users with correct request body', (done) => {
      // Arrange
      const value = 'test user'
      const rootOrgId = 'org123'
      const expectedReqBody = {
        request: {
          query: value,
          filters: {
            rootOrgId
          }
        }
      }
      const mockResponse = { result: { response: { content: [] } } }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      // Act
      service.searchUser(value, rootOrgId).subscribe(result => {
        // Assert
        expect(mockHttpClient.post).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/search', expectedReqBody)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })
})