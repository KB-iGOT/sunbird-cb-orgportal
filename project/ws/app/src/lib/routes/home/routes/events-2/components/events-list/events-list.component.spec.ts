import { EventsListComponent } from './events-list.component'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'

// Mock dependencies
const mockEventsService = {
  getEvents: jest.fn(),
  updateEvent: jest.fn()
}

const mockMatSnackBar = {
  open: jest.fn()
}

const mockActivatedRoute = {
  snapshot: {
    url: [{ path: 'pending-approval' }],
    data: {
      configService: {
        userProfile: {
          rootOrgId: 'test-org-id',
          givenName: 'John',
          firstName: 'John',
          userId: 'user-123'
        }
      }
    }
  }
}

const mockRouter = {
  navigate: jest.fn()
}

const mockDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of(true))
  })
}

describe('EventsListComponent', () => {
  let component: EventsListComponent

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create component instance
    component = new EventsListComponent(
      mockEventsService as any,
      mockMatSnackBar as any,
      mockActivatedRoute as any,
      mockRouter as any,
      mockDialog as any
    )
  })

  describe('Constructor', () => {
    it('should create component with injected dependencies', () => {
      expect(component).toBeDefined()
      expect(component['eventSvc']).toBe(mockEventsService)
      expect(component['matSnackBar']).toBe(mockMatSnackBar)
      expect(component['activatedRoute']).toBe(mockActivatedRoute)
      expect(component['route']).toBe(mockRouter)
      expect(component['dialog']).toBe(mockDialog)
    })
  })

  describe('ngOnInit', () => {
    it('should call initialization method', () => {
      const initSpy = jest.spyOn(component, 'initialization')
      component.ngOnInit()
      expect(initSpy).toHaveBeenCalled()
    })
  })

  describe('initialization', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getEvents').mockImplementation(() => { })
    })

    it('should initialize with upcoming path configuration', () => {
      mockActivatedRoute.snapshot.url[0].path = 'upcoming'
      component.initialization()

      expect(component.pathUrl).toBe('upcoming')
      expect(component.tableData.columns).toHaveLength(4)
      expect(component.menuItems).toHaveLength(3)
      expect(component.tableData.noDataMessage).toBe('There are no upcoming events.')
    })

    it('should initialize with draft path configuration', () => {
      mockActivatedRoute.snapshot.url[0].path = 'draft'
      component.initialization()

      expect(component.pathUrl).toBe('draft')
      expect(component.tableData.columns).toHaveLength(4)
      expect(component.menuItems).toHaveLength(3)
      expect(component.tableData.noDataMessage).toBe('There are no draft events.')
    })

    it('should initialize with pending-approval path configuration', () => {
      mockActivatedRoute.snapshot.url[0].path = 'pending-approval'
      component.initialization()

      expect(component.pathUrl).toBe('pending-approval')
      expect(component.tableData.columns).toHaveLength(5)
      expect(component.menuItems).toHaveLength(2)
      expect(component.tableData.noDataMessage).toBe('There are no pending events.')
    })

    it('should initialize with past path configuration', () => {
      mockActivatedRoute.snapshot.url[0].path = 'past'
      component.initialization()

      expect(component.pathUrl).toBe('past')
      expect(component.tableData.columns).toHaveLength(4)
      expect(component.menuItems).toHaveLength(2)
      expect(component.tableData.noDataMessage).toBe('There are no past events.')
    })

    it('should initialize with canceled path configuration', () => {
      mockActivatedRoute.snapshot.url[0].path = 'canceled'
      component.initialization()

      expect(component.pathUrl).toBe('canceled')
      expect(component.tableData.columns).toHaveLength(6)
      expect(component.menuItems).toHaveLength(1)
      expect(component.tableData.noDataMessage).toBe('There are no cancelled events.')
    })

    it('should initialize with rejected path configuration', () => {
      mockActivatedRoute.snapshot.url[0].path = 'rejected'
      component.initialization()

      expect(component.pathUrl).toBe('rejected')
      expect(component.tableData.columns).toHaveLength(5)
      expect(component.menuItems).toHaveLength(2)
      expect(component.tableData.noDataMessage).toBe('There are no rejected events.')
    })

    it('should default to pending-approval when path is undefined', () => {
      mockActivatedRoute.snapshot.url = []
      component.initialization()

      expect(component.pathUrl).toBe('pending-approval')
    })

    it('should set pagination details and call getEvents', () => {
      component.initialization()

      expect(component.paginationDetails).toEqual({
        startIndex: 0,
        lastIndex: 20,
        pageSize: 20,
        pageIndex: 0,
        totalCount: 20,
      })
      expect(component.getEvents).toHaveBeenCalled()
    })

    it('should set userProfile from activated route', () => {
      component.initialization()
      expect(component.userProfile).toEqual(mockActivatedRoute.snapshot.data.configService.userProfile)
    })
  })

  describe('getEvents', () => {
    beforeEach(() => {
      component.pathUrl = 'upcoming'
      component.searchKey = 'test'
      component.paginationDetails = {
        startIndex: 0,
        lastIndex: 20,
        pageSize: 10,
        pageIndex: 1,
        totalCount: 20,
      }
      component.userProfile = { rootOrgId: 'test-org' }
      mockEventsService.getEvents.mockReturnValue(of({ Event: [{ id: 1 }], count: 5 }))
    })

    it('should build correct request object for upcoming events', () => {
      jest.spyOn(component, 'getCurrentTimeInUTC', 'get').mockReturnValue('2023-01-01T00:00:00+0000')

      component.getEvents()

      const expectedRequest = {
        locale: ['en'],
        request: {
          query: 'test',
          limit: 10,
          offset: 10,
          filters: {
            status: ['Live'],
            contentType: 'Event',
            createdFor: 'test-org',
            endDateTime: {
              '>=': '2023-01-01T00:00:00+0000'
            }
          },
          sort_by: {
            lastUpdatedOn: 'desc',
          },
        },
      }

      expect(mockEventsService.getEvents).toHaveBeenCalledWith(expectedRequest, 'upcoming')
    })

    it('should build correct request object for draft events', () => {
      component.pathUrl = 'draft'

      component.getEvents()

      expect(mockEventsService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({
              status: ['Draft']
            })
          })
        }),
        'draft'
      )
    })

    it('should build correct request object for pending-approval events', () => {
      component.pathUrl = 'pending-approval'

      component.getEvents()

      expect(mockEventsService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({
              status: ['SentToPublish']
            })
          })
        }),
        'pending-approval'
      )
    })

    it('should build correct request object for past events', () => {
      component.pathUrl = 'past'
      jest.spyOn(component, 'getCurrentTimeInUTC', 'get').mockReturnValue('2023-01-01T00:00:00+0000')

      component.getEvents()

      expect(mockEventsService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({
              status: ['Live'],
              endDateTime: {
                '<': '2023-01-01T00:00:00+0000'
              }
            })
          })
        }),
        'past'
      )
    })

    it('should build correct request object for canceled events', () => {
      component.pathUrl = 'canceled'

      component.getEvents()

      expect(mockEventsService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({
              status: ['Cancelled']
            })
          })
        }),
        'canceled'
      )
    })

    it('should build correct request object for rejected events', () => {
      component.pathUrl = 'rejected'

      component.getEvents()

      expect(mockEventsService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: expect.objectContaining({
              status: ['Rejected']
            })
          })
        }),
        'rejected'
      )
    })

    it('should handle successful response', () => {
      const mockResponse = { Event: [{ id: 1, name: 'Test Event' }], count: 10 }
      mockEventsService.getEvents.mockReturnValue(of(mockResponse))

      component.getEvents()

      expect(component.showEventsLoader).toBe(false)
      expect(component.eventsList).toEqual([{ id: 1, name: 'Test Event' }])
      expect(component.paginationDetails.totalCount).toBe(10)
    })

    it('should handle error response', () => {
      const mockError = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: 500
      })
      mockEventsService.getEvents.mockReturnValue(throwError(() => mockError))
      jest.spyOn(component, 'openSnackBar' as any)

      component.getEvents()

      expect(component.showEventsLoader).toBe(false)
      // expect(component.openSnackBar).toHaveBeenCalledWith('Server error')
    })

    // it('should handle error response with default message', () => {
    //   const mockError = new HttpErrorResponse({ status: 500 })
    //   mockEventsService.getEvents.mockReturnValue(throwError(() => mockError))
    //   jest.spyOn(component, 'openSnackBar' as any)

    //   component.getEvents()

    //   expect(component.openSnackBar).toHaveBeenCalledWith('Some thing went wrong')
    // })

    it('should unsubscribe existing subscription before making new request', () => {
      const mockSubscription = { unsubscribe: jest.fn() } as any
      component.getEventSubscription = mockSubscription

      component.getEvents()

      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })

    it('should set showEventsLoader to true before making request', () => {
      component.getEvents()
      expect(component.showEventsLoader).toBe(true)
    })
  })

  describe('getCurrentTimeInUTC getter', () => {
    it('should return current time in UTC format', () => {
      const mockDate = new Date('2023-01-01T12:00:00.000Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      const result = component.getCurrentTimeInUTC

      expect(result).toBe('2023-01-01T12:00:00.000+0000')
    })
  })

  describe('searchEvents', () => {
    it('should set searchKey and call getEvents', () => {
      jest.spyOn(component, 'getEvents').mockImplementation(() => { })

      component.searchEvents('test query')

      expect(component.searchKey).toBe('test query')
      expect(component.getEvents).toHaveBeenCalled()
    })
  })

  describe('onPageChange', () => {
    it('should update pagination details and call getEvents', () => {
      const newPaginationDetails = {
        startIndex: 20,
        lastIndex: 40,
        pageSize: 20,
        pageIndex: 1,
        totalCount: 100,
      }
      jest.spyOn(component, 'getEvents').mockImplementation(() => { })

      component.onPageChange(newPaginationDetails)

      expect(component.paginationDetails).toBe(newPaginationDetails)
      expect(component.getEvents).toHaveBeenCalled()
    })
  })

  describe('contentEvents', () => {
    const mockEventData = {
      action: 'view',
      rows: { identifier: 'event-123' }
    }

    it('should handle view action', () => {
      jest.spyOn(component, 'navigateToEditEvent').mockImplementation(() => { })

      component.contentEvents({ ...mockEventData, action: 'view' })

      expect(component.navigateToEditEvent).toHaveBeenCalledWith('event-123', 'view')
    })

    it('should handle edit action', () => {
      jest.spyOn(component, 'navigateToEditEvent').mockImplementation(() => { })

      component.contentEvents({ ...mockEventData, action: 'edit' })

      expect(component.navigateToEditEvent).toHaveBeenCalledWith('event-123', 'edit')
    })

    it('should handle cancel action', () => {
      jest.spyOn(component, 'openConforamtionPopup').mockImplementation(() => { })

      component.contentEvents({ ...mockEventData, action: 'cancel' })

      expect(component.openConforamtionPopup).toHaveBeenCalledWith(mockEventData.rows)
    })

    it('should handle remarks action', () => {
      jest.spyOn(component, 'openRejectionPopup').mockImplementation(() => { })

      component.contentEvents({ ...mockEventData, action: 'remarks' })

      expect(component.openRejectionPopup).toHaveBeenCalledWith(mockEventData.rows)
    })

    it('should handle broadcast action (no implementation)', () => {
      component.contentEvents({ ...mockEventData, action: 'broadcast' })
      // Should not throw error and do nothing
    })

    it('should do nothing when events is null', () => {
      jest.spyOn(component, 'navigateToEditEvent').mockImplementation(() => { })

      component.contentEvents(null)

      expect(component.navigateToEditEvent).not.toHaveBeenCalled()
    })

    it('should do nothing when action is missing', () => {
      jest.spyOn(component, 'navigateToEditEvent').mockImplementation(() => { })

      component.contentEvents({ rows: mockEventData.rows })

      expect(component.navigateToEditEvent).not.toHaveBeenCalled()
    })

    it('should do nothing when rows is missing', () => {
      jest.spyOn(component, 'navigateToEditEvent').mockImplementation(() => { })

      component.contentEvents({ action: 'view' })

      expect(component.navigateToEditEvent).not.toHaveBeenCalled()
    })
  })

  describe('navigateToEditEvent', () => {
    beforeEach(() => {
      component.pathUrl = 'upcoming'
    })

    it('should navigate to edit event with correct parameters', () => {
      component.navigateToEditEvent('event-123', 'edit')

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/events/edit-event', 'event-123'],
        {
          queryParams: {
            mode: 'edit',
            pathUrl: 'upcoming'
          }
        }
      )
    })

    it('should navigate to view event with correct parameters', () => {
      component.navigateToEditEvent('event-456', 'view')

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/events/edit-event', 'event-456'],
        {
          queryParams: {
            mode: 'view',
            pathUrl: 'upcoming'
          }
        }
      )
    })
  })

  describe('openConforamtionPopup', () => {
    const mockRowData = { identifier: 'event-123', name: 'Test Event' }

    it('should open confirmation dialog with correct configuration', () => {
      component.openConforamtionPopup(mockRowData)

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        {
          width: '500px',
          height: '210px',
          data: {
            dialogType: 'warning',
            icon: {
              iconName: 'error_outline',
              iconClass: 'warning-icon'
            },
            message: 'Are you sure that you want to cancel this event?',
            buttonsList: [
              {
                btnAction: false,
                displayText: 'No',
                btnClass: 'btn-outline-primary'
              },
              {
                btnAction: true,
                displayText: 'Yes',
                btnClass: 'successBtn'
              },
            ]
          },
          autoFocus: false
        }
      )
    })

    it('should call cancelEvent when dialog returns true', () => {
      jest.spyOn(component, 'cancelEvent').mockImplementation(() => { })

      component.openConforamtionPopup(mockRowData)

      expect(component.cancelEvent).toHaveBeenCalledWith(mockRowData)
    })

    it('should not call cancelEvent when dialog returns false', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false))
      })
      jest.spyOn(component, 'cancelEvent').mockImplementation(() => { })

      component.openConforamtionPopup(mockRowData)

      expect(component.cancelEvent).not.toHaveBeenCalled()
    })
  })

  describe('cancelEvent', () => {
    const mockRowData = {
      identifier: 'event-123',
      versionKey: 'version-1',
      name: 'Test Event'
    }

    beforeEach(() => {
      component.userProfile = {
        givenName: 'John',
        firstName: 'John',
        userId: 'user-123'
      }
      jest.spyOn(component, 'openSnackBar' as any).mockImplementation(() => { })
      jest.spyOn(component, 'getEvents').mockImplementation(() => { })
    })

    it('should call updateEvent with correct parameters', () => {
      const mockDate = new Date('2023-01-01T12:00:00.000Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))

      component.cancelEvent(mockRowData)

      expect(mockEventsService.updateEvent).toHaveBeenCalledWith(
        {
          request: {
            event: {
              identifier: 'event-123',
              versionKey: 'version-1',
              status: 'Cancelled',
              cancelledOn: '2023-01-01T12:00:00.000+0000',
              cancelledByName: 'John',
              cancelledBy: 'user-123'
            }
          }
        },
        'event-123'
      )
    })

    it('should use firstName when givenName is not available', () => {
      component.userProfile = {
        firstName: 'Jane',
        userId: 'user-456'
      }
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))

      component.cancelEvent(mockRowData)

      expect(mockEventsService.updateEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          request: {
            event: expect.objectContaining({
              cancelledByName: 'Jane'
            })
          }
        }),
        'event-123'
      )
    })

    it('should handle successful cancellation', () => {
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))

      component.cancelEvent(mockRowData)

      // expect(component.openSnackBar).toHaveBeenCalledWith('event is cancelled successfully')
      expect(component.getEvents).toHaveBeenCalled()
    })

    it('should handle error during cancellation', () => {
      const mockError = new HttpErrorResponse({
        error: { message: 'Cancellation failed' },
        status: 500
      })
      mockEventsService.updateEvent.mockReturnValue(throwError(() => mockError))

      component.cancelEvent(mockRowData)

      // expect(component.openSnackBar).toHaveBeenCalledWith('Cancellation failed')
      expect(component.getEvents).not.toHaveBeenCalled()
    })

    // it('should handle error with default message', () => {
    //   const mockError = new HttpErrorResponse({ status: 500 })
    //   mockEventsService.updateEvent.mockReturnValue(throwError(() => mockError))

    //   component.cancelEvent(mockRowData)

    //   expect(component.openSnackBar).toHaveBeenCalledWith('Something went wrong please try again')
    // })
  })

  describe('openRejectionPopup', () => {
    it('should open rejection dialog when remarks exist', () => {
      const mockRowData = {
        rejectComment: 'Event was rejected due to incomplete information'
      }

      component.openRejectionPopup(mockRowData)

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        {
          minWidth: '400px',
          data: 'Event was rejected due to incomplete information',
          autoFocus: false
        }
      )
    })

    it('should not open dialog when remarks do not exist', () => {
      const mockRowData = {}

      component.openRejectionPopup(mockRowData)

      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should not open dialog when rejectComment is empty', () => {
      const mockRowData = { rejectComment: '' }

      component.openRejectionPopup(mockRowData)

      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('openSnackBar', () => {
    it('should call matSnackBar.open with message', () => {
      component['openSnackBar']('Test message')

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test message')
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from getEventSubscription if it exists', () => {
      const mockSubscription = { unsubscribe: jest.fn() } as any
      component.getEventSubscription = mockSubscription

      component.ngOnDestroy()

      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw error if getEventSubscription does not exist', () => {
      component.getEventSubscription = undefined as any

      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('Property initialization', () => {
    it('should initialize all properties correctly', () => {
      expect(component.eventsList).toEqual([])
      expect(component.showEventsLoader).toBe(false)
      expect(component.searchKey).toBe('')
      expect(component.pathUrl).toBe('')
    })
  })
})