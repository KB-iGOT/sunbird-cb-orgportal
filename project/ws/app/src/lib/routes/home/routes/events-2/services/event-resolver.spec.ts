import { of, throwError } from 'rxjs'
import { EventResolverService } from './event-resolver'
import type { EventsService } from './events.service'

jest.mock('./events.service')

describe('EventResolverService', () => {
  let service: EventResolverService
  let mockEventsService: jest.Mocked<EventsService>

  beforeEach(() => {
    mockEventsService = {
      getEventDetailsByid: jest.fn(),
      getEvents: jest.fn(),
      createContent: jest.fn(),
      uploadContent: jest.fn(),
      createEvent: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn(),
      searchEvent: jest.fn(),
      getEventParticipants: jest.fn(),
      searchUser: jest.fn(),
    } as unknown as jest.Mocked<EventsService>
    service = new EventResolverService(mockEventsService)
  })

  describe('rejected or draft pathUrl', () => {
    it('should remove prevStatus when status is NOT live', (done) => {
      const activatedRoute: any = {
        params: { eventId: ':123' },
        queryParams: { pathUrl: 'rejected' },
      }

      const responseFalse = {
        result: {
          event: { id: '123', prevStatus: 'draft', name: 'Test Event' }
        }
      }
      const responseTrue = {
        result: {
          event: { status: 'draft' }
        }
      }

      mockEventsService.getEventDetailsByid
        .mockReturnValueOnce(of(responseFalse))
        .mockReturnValueOnce(of(responseTrue))

      service.resolve(activatedRoute).subscribe((result) => {
        expect(mockEventsService.getEventDetailsByid).toHaveBeenNthCalledWith(1, '123', false)
        expect(mockEventsService.getEventDetailsByid).toHaveBeenNthCalledWith(2, '123', true)
        expect(result.data).toEqual({ id: '123', name: 'Test Event' })
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should keep prevStatus when status is live', (done) => {
      const activatedRoute: any = {
        params: { eventId: ':123' },
        queryParams: { pathUrl: 'draft' },
      }

      const responseFalse = {
        result: {
          event: { id: '123', prevStatus: 'draft', name: 'Test Event' }
        }
      }
      const responseTrue = {
        result: {
          event: { status: 'live' }
        }
      }

      mockEventsService.getEventDetailsByid
        .mockReturnValueOnce(of(responseFalse))
        .mockReturnValueOnce(of(responseTrue))

      service.resolve(activatedRoute).subscribe((result) => {
        expect(result.data).toEqual({
          id: '123',
          prevStatus: 'draft',
          name: 'Test Event'
        })
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should handle first API call error', () => {
      const activatedRoute: any = {
        params: { eventId: ':123' },
        queryParams: { pathUrl: 'rejected' },
      }

      mockEventsService.getEventDetailsByid
        .mockReturnValueOnce(throwError(() => new Error('API Error')))

      service.resolve(activatedRoute).subscribe((result) => {
        expect(result.data).toBeNull()
        expect(result.error).toBeTruthy()
        // done()
      })
    })
  })

  describe('other pathUrls', () => {
    it('should handle upcoming view mode', (done) => {
      const activatedRoute: any = {
        params: { eventId: ':123' },
        queryParams: { pathUrl: 'upcoming', mode: 'view' },
      }

      const response = {
        result: {
          event: { id: '123', status: 'upcoming' }
        }
      }

      mockEventsService.getEventDetailsByid
        .mockReturnValueOnce(of(response))

      service.resolve(activatedRoute).subscribe((result) => {
        expect(mockEventsService.getEventDetailsByid)
          .toHaveBeenCalledWith('123', true)
        expect(result.data).toEqual({ id: '123', status: 'upcoming' })
        expect(result.error).toBeNull()
        done()
      })
    })

    it('should handle API error for other pathUrls', (done) => {
      const activatedRoute: any = {
        params: { eventId: ':123' },
        queryParams: { pathUrl: 'upcoming' },
      }

      mockEventsService.getEventDetailsByid
        .mockReturnValueOnce(throwError(() => new Error('API Error')))

      service.resolve(activatedRoute).subscribe((result) => {
        expect(result.data).toBeNull()
        expect(result.error).toBeTruthy()
        done()
      })
    })
  })
})
