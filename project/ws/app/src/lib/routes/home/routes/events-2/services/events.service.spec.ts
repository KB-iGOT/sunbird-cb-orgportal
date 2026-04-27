import { EventsService } from './events.service'
import { of } from 'rxjs'

const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
}

const mockDatePipe = {
  transform: jest.fn(),
}

describe('EventsService', () => {
  let service: EventsService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new EventsService(mockHttpClient as any, mockDatePipe as any)
  })

  // ─── getEvents ─────────────────────────────────────────────────────────────

  describe('getEvents', () => {
    it('should fetch and format events data correctly', done => {
      const mockRequest = { request: { filters: { status: ['Live'] } } }
      const mockResponse = {
        result: {
          Event: [{ id: '1', startDate: '2024-01-15', createdOn: '2024-01-10' }],
          count: 1,
        },
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockReturnValue('15 Jan, 2024')

      service.getEvents(mockRequest, 'current').subscribe(result => {
        expect(mockHttpClient.post).toHaveBeenCalledWith('apis/proxies/v8/sunbirdigot/search', mockRequest)
        expect(result.Event).toHaveLength(1)
        expect(result.count).toBe(1)
        expect(result.Event[0].startDate).toBe('15 Jan, 2024')
        done()
      })
    })

    it('should handle empty events array', done => {
      const mockRequest = { request: { filters: { status: ['Draft'] } } }
      mockHttpClient.post.mockReturnValue(of({ result: { Event: [], count: 0 } }))

      service.getEvents(mockRequest, 'draft').subscribe(result => {
        expect(result.Event).toEqual([])
        expect(result.count).toBe(0)
        done()
      })
    })

    it('should set buttonsToHide for past live events when tab is not past', done => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const mockRequest = { request: { filters: { status: ['Live'] } } }
      const mockResponse = {
        result: {
          Event: [{ id: '1', startDateTime: pastDate.toISOString() }],
          count: 1,
        },
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockReturnValue('')

      service.getEvents(mockRequest, 'current').subscribe(result => {
        expect(result.Event[0]['buttonsToHide']).toEqual(['edit', 'cancel'])
        done()
      })
    })

    it('should NOT set buttonsToHide for past live events when tab is past', done => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const mockRequest = { request: { filters: { status: ['Live'] } } }
      const mockResponse = {
        result: {
          Event: [{ id: '1', startDateTime: pastDate.toISOString() }],
          count: 1,
        },
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockReturnValue('')

      service.getEvents(mockRequest, 'past').subscribe(result => {
        expect(result.Event[0]['buttonsToHide']).toBeUndefined()
        done()
      })
    })

    it('should NOT set buttonsToHide for future live events', done => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      const mockRequest = { request: { filters: { status: ['Live'] } } }
      const mockResponse = {
        result: {
          Event: [{ id: '1', startDateTime: futureDate.toISOString() }],
          count: 1,
        },
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockReturnValue('')

      service.getEvents(mockRequest, 'current').subscribe(result => {
        expect(result.Event[0]['buttonsToHide']).toBeUndefined()
        done()
      })
    })

    it('should format all date fields correctly', done => {
      const mockRequest = { request: { filters: { status: ['Published'] } } }
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
              rejectedOn: null,
            },
          ],
          count: 1,
        },
      }
      mockHttpClient.post.mockReturnValue(of(mockResponse))
      mockDatePipe.transform.mockImplementation(date => (date ? '15 Jan, 2024' : ''))

      service.getEvents(mockRequest, 'published').subscribe(result => {
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

  // ─── createContent ─────────────────────────────────────────────────────────

  describe('createContent', () => {
    it('should post to create content endpoint', done => {
      const mockRequest = { name: 'Test Content' }
      const mockResponse = { result: { identifier: 'content123' } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.createContent(mockRequest).subscribe(result => {
        expect(mockHttpClient.post).toHaveBeenCalledWith('apis/proxies/v8/action/content/v3/create', mockRequest)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  // ─── uploadContent ─────────────────────────────────────────────────────────

  describe('uploadContent', () => {
    it('should upload content to the upload endpoint', done => {
      const mockVal = 'content123'
      const mockFormData = new FormData()
      const mockResponse = { result: { url: 'uploaded-url' } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.uploadContent(mockVal, mockFormData).subscribe(result => {
        expect(mockHttpClient.post).toHaveBeenCalledWith(
          `apis/proxies/v8/upload/action/content/v3/upload/${mockVal}`,
          mockFormData
        )
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  // ─── createEvent ───────────────────────────────────────────────────────────

  describe('createEvent', () => {
    it('should post to create event endpoint', done => {
      const mockRequest = { name: 'Test Event' }
      const mockResponse = { result: { identifier: 'event123' } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.createEvent(mockRequest).subscribe(result => {
        expect(mockHttpClient.post).toHaveBeenCalledWith('apis/proxies/v8/event/v4/create', mockRequest)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  // ─── getEventDetailsByid ───────────────────────────────────────────────────

  describe('getEventDetailsByid', () => {
    it('should get live event details when getLiveData is true', done => {
      const eventId = 'event123'
      const mockResponse = { result: { event: { id: eventId } } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getEventDetailsByid(eventId, true).subscribe(result => {
        expect(mockHttpClient.get).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/read/${eventId}`)
        expect(result).toEqual(mockResponse)
        done()
      })
    })

    it('should get edit event details when getLiveData is false', done => {
      const eventId = 'event123'
      const mockResponse = { result: { event: { id: eventId } } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getEventDetailsByid(eventId, false).subscribe(() => {
        expect(mockHttpClient.get).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/read/${eventId}?mode=edit`)
        done()
      })
    })
  })

  // ─── updateEvent ───────────────────────────────────────────────────────────

  describe('updateEvent', () => {
    it('should patch the update event endpoint', done => {
      const eventId = 'event123'
      const formBody = { name: 'Updated Event' }
      mockHttpClient.patch.mockReturnValue(of({ result: { identifier: eventId } }))

      service.updateEvent(formBody, eventId).subscribe(() => {
        expect(mockHttpClient.patch).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/update/${eventId}`, formBody)
        done()
      })
    })
  })

  // ─── publishEvent ──────────────────────────────────────────────────────────

  describe('publishEvent', () => {
    it('should post to the publish event endpoint', done => {
      const eventId = 'event123'
      const formBody = { status: 'Live' }
      mockHttpClient.post.mockReturnValue(of({ result: { status: 'Published' } }))

      service.publishEvent(eventId, formBody).subscribe(() => {
        expect(mockHttpClient.post).toHaveBeenCalledWith(`apis/proxies/v8/event/v4/publish/${eventId}`, formBody)
        done()
      })
    })
  })

  // ─── cancelEvent ───────────────────────────────────────────────────────────

  describe('cancelEvent', () => {
    it('should patch the cancel event endpoint', done => {
      const eventId = 'event-cancel-001'
      const formBody = { reason: 'Cancelled by admin' }
      mockHttpClient.patch.mockReturnValue(of({ result: { status: 'Cancelled' } }))

      service.cancelEvent(eventId, formBody).subscribe(() => {
        expect(mockHttpClient.patch).toHaveBeenCalledWith(`apis/proxies/v8/event/v1/cancel/${eventId}`, formBody)
        done()
      })
    })
  })

  // ─── getContentSearch ──────────────────────────────────────────────────────

  describe('getContentSearch', () => {
    it('should post to the content search endpoint', done => {
      const request = { filters: { category: 'Event' } }
      const mockResponse = { result: { content: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.getContentSearch(request).subscribe(result => {
        expect(mockHttpClient.post).toHaveBeenCalledWith('apis/proxies/v8/sunbirdigot/v4/search', request)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  // ─── getContentRead ────────────────────────────────────────────────────────

  describe('getContentRead', () => {
    it('should get content by ID', done => {
      const contentId = 'do_12345'
      const mockResponse = { result: { content: { identifier: contentId } } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getContentRead(contentId).subscribe(result => {
        expect(mockHttpClient.get).toHaveBeenCalledWith(`apis/proxies/v8/action/content/v3/read/${contentId}`)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  // ─── getUserSearchList ─────────────────────────────────────────────────────

  describe('getUserSearchList', () => {
    it('should get autocomplete user list', done => {
      const userText = 'john'
      const mockResponse = { result: { response: [{ id: 'user1', name: 'John' }] } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      service.getUserSearchList(userText).subscribe(result => {
        expect(mockHttpClient.get).toHaveBeenCalledWith(`apis/proxies/v8/user/v1/autocomplete/${userText}`)
        expect(result).toEqual([{ id: 'user1', name: 'John' }])
        done()
      })
    })
  })

  // ─── searchUser ────────────────────────────────────────────────────────────

  describe('searchUser', () => {
    it('should post with correct request body', done => {
      const value = 'test user'
      const rootOrgId = 'org123'
      const mockResponse = { result: { response: { content: [] } } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      service.searchUser(value, rootOrgId).subscribe(result => {
        expect(mockHttpClient.post).toHaveBeenCalledWith('apis/proxies/v8/user/v1/search', {
          request: { query: value, filters: { rootOrgId } },
        })
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  // ─── getCourseDetails / setCourseDetails ───────────────────────────────────

  describe('getCourseDetails / setCourseDetails', () => {
    it('should return empty object by default', () => {
      expect(service.getCourseDetails()).toEqual({})
    })

    it('should return the value set by setCourseDetails', () => {
      const details = { id: 'course-001', name: 'Test Course' }
      service.setCourseDetails(details)
      expect(service.getCourseDetails()).toEqual(details)
    })
  })

  // ─── convertToTreeView ─────────────────────────────────────────────────────

  const baseCompetency = {
    competencyAreaName: 'Area 1',
    competencyAreaDescription: 'Area 1 Desc',
    competencyAreaIdentifier: 'area1',
    competencyAreaRefId: 'areaRef1',
    competencyThemeName: 'Theme 1',
    competencyThemeDescription: 'Theme 1 Desc',
    competencyThemeIdentifier: 'theme1',
    competencyThemeRefId: 'themeRef1',
    competencyThemeType: 'Type1',
    competencyThemeAdditionalProperties: { displayName: 'Theme Display', timeStamp: '2024-01-01' },
    competencySubThemeName: 'SubTheme 1',
    competencySubThemeDescription: 'SubTheme 1 Desc',
    competencySubThemeIdentifier: 'subtheme1',
    competencySubThemeRefId: 'subthemeRef1',
    competencySubThemeAdditionalProperties: { displayName: 'SubTheme Display', timeStamp: '2024-01-01' },
  }

  describe('convertToTreeView', () => {
    it('should build tree from a single competency entry (new area)', () => {
      const result = service.convertToTreeView([baseCompetency])
      expect(result).toHaveLength(1)
      expect(result[0].competencyAreaName).toBe('Area 1')
      expect(result[0].themes).toHaveLength(1)
      expect(result[0].themes[0].subThems).toHaveLength(1)
      expect(result[0].collapsed).toBe(true)
    })

    it('should add subTheme to existing theme when same area and same theme', () => {
      const second = {
        ...baseCompetency,
        competencySubThemeName: 'SubTheme 2',
        competencySubThemeIdentifier: 'subtheme2',
        competencySubThemeRefId: 'subthemeRef2',
        competencySubThemeAdditionalProperties: { displayName: 'SubTheme 2', timeStamp: '2024-01-02' },
      }
      const result = service.convertToTreeView([baseCompetency, second])
      expect(result).toHaveLength(1)
      expect(result[0].themes).toHaveLength(1)
      expect(result[0].themes[0].subThems).toHaveLength(2)
    })

    it('should add new theme when same area but different theme', () => {
      const differentTheme = {
        ...baseCompetency,
        competencyThemeName: 'Theme 2',
        competencyThemeIdentifier: 'theme2',
        competencyThemeRefId: 'themeRef2',
        competencySubThemeName: 'SubTheme X',
        competencySubThemeIdentifier: 'subthemeX',
        competencySubThemeRefId: 'subthemeRefX',
      }
      const result = service.convertToTreeView([baseCompetency, differentTheme])
      expect(result).toHaveLength(1)
      expect(result[0].themes).toHaveLength(2)
    })

    it('should add new area when different competency area', () => {
      const differentArea = {
        ...baseCompetency,
        competencyAreaName: 'Area 2',
        competencyAreaIdentifier: 'area2',
        competencyAreaRefId: 'areaRef2',
      }
      const result = service.convertToTreeView([baseCompetency, differentArea])
      expect(result).toHaveLength(2)
    })
  })

  // ─── convertToTabularView ──────────────────────────────────────────────────

  describe('convertToTabularView', () => {
    it('should flatten tree view to tabular rows', () => {
      const treeView = [
        {
          competencyAreaName: 'Area 1',
          themes: [
            {
              competencyThemeName: 'Theme 1',
              subThems: [
                { competencySubThemeName: 'SubTheme 1' },
                { competencySubThemeName: 'SubTheme 2' },
              ],
            },
          ],
        },
      ]
      const result = service.convertToTabularView(treeView)
      expect(result).toHaveLength(2)
      expect(result[0].competencyAreaName).toBe('Area 1')
      expect(result[0].competencyThemeName).toBe('Theme 1')
      expect(result[0].themes).toBeUndefined()
      expect(result[0].subThems).toBeUndefined()
    })
  })

  // ─── generateThemeObj ──────────────────────────────────────────────────────

  describe('generateThemeObj', () => {
    it('should generate theme object with subTheme and collapsed flag', () => {
      const result = service.generateThemeObj(baseCompetency)
      expect(result.competencyThemeName).toBe('Theme 1')
      expect(result.collapsed).toBe(true)
      expect(result.subThems).toHaveLength(1)
      expect(result.subThems[0].competencySubThemeName).toBe('SubTheme 1')
      expect(result.competencyThemeAdditionalProperties.displayName).toBe('Theme Display')
    })
  })
})

