import { ListEventComponent } from './list-event.component'
import { Router } from '@angular/router'
import { EventsService } from '../../services/events.service'
import { ConfigurationsService, EventService } from '@sunbird-cb/utils-v2'
import { DatePipe } from '@angular/common'
import { of, throwError } from 'rxjs'
import moment from 'moment'

// Mock moment
jest.mock('moment', () => {
    const actualMoment = jest.requireActual('moment')
    return {
        __esModule: true,
        default: jest.fn((date) => actualMoment(date)),
    }
})

describe('ListEventComponent', () => {
    let component: ListEventComponent
    let mockRouter: jest.Mocked<Router>
    let mockEventsService: jest.Mocked<EventsService>
    let mockConfigService: jest.Mocked<ConfigurationsService>
    let mockActivatedRoute: any
    let mockEventService: jest.Mocked<EventService>
    let mockDatePipe: jest.Mocked<DatePipe>

    const mockUserProfile = {
        userId: 'user123',
        departmentName: 'IT Department',
        rootOrgId: 'org123'
    }

    const mockEventData = {
        result: {
            Event: {
                '1': {
                    id: 'event1',
                    name: 'Test Event 1',
                    startDate: '2024-06-15',
                    startTime: '1000+0530',
                    endDate: '2024-06-15',
                    endTime: '1200+0530',
                    duration: 120,
                    createdOn: '2024-06-01T10:00:00Z',
                    createdFor: ['org123'],
                    appIcon: 'test-icon.png',
                    creatorDetails: '[{"name": "John Doe"}, {"name": "Jane Smith"}]'
                },
                '2': {
                    id: 'event2',
                    name: 'Past Event',
                    startDate: '2024-01-15',
                    startTime: '0900+0530',
                    endDate: '2024-01-15',
                    endTime: '1100+0530',
                    duration: 60,
                    createdOn: '2024-01-01T10:00:00Z',
                    createdFor: ['org123'],
                    appIcon: null,
                    creatorDetails: undefined
                }
            }
        }
    }

    beforeEach(() => {
        // Mock Router
        mockRouter = {
            navigate: jest.fn()
        } as any

        // Mock EventsService
        mockEventsService = {
            getEventsList: jest.fn(),
            getPublicUrl: jest.fn()
        } as any

        // Mock ConfigurationsService
        mockConfigService = {
            userProfile: mockUserProfile
        } as any

        // Mock ActivatedRoute
        mockActivatedRoute = {
            snapshot: {
                data: {
                    configService: {
                        userProfile: mockUserProfile
                    }
                }
            }
        }

        // Mock EventService
        mockEventService = {
            handleTabTelemetry: jest.fn()
        } as any

        // Mock DatePipe
        mockDatePipe = {
            transform: jest.fn()
        } as any

        // Create component instance
        component = new ListEventComponent(
            mockRouter,
            mockEventsService,
            mockConfigService,
            mockActivatedRoute,
            mockEventService,
            mockDatePipe
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should initialize with user profile from configSvc', () => {
            expect(component.currentUser).toBe('user123')
            expect(component.department).toBe('IT Department')
            expect(component.departmentID).toBe('org123')
        })

        it('should fallback to activeRoute data when configSvc.userProfile is null', () => {
            mockConfigService.userProfile = null

            component = new ListEventComponent(
                mockRouter,
                mockEventsService,
                mockConfigService,
                mockActivatedRoute,
                mockEventService,
                mockDatePipe
            )

            expect(component.departmentID).toBe('org123')
            expect(component.department).toBe('IT Department')
            expect(component.currentUser).toBe('user123')
        })

        it('should handle missing user profile data gracefully', () => {
            mockConfigService.userProfile = null
            mockActivatedRoute.snapshot.data.configService.userProfile = {}

            component = new ListEventComponent(
                mockRouter,
                mockEventsService,
                mockConfigService,
                mockActivatedRoute,
                mockEventService,
                mockDatePipe
            )

            expect(component.departmentID).toBeUndefined()
            expect(component.department).toBeUndefined()
            expect(component.currentUser).toBeUndefined()
        })
    })

    describe('ngOnInit', () => {
        it('should initialize table data and fetch events', () => {
            const fetchEventsSpy = jest.spyOn(component, 'fetchEvents').mockImplementation()

            component.ngOnInit()

            expect(component.tabledata).toEqual({
                columns: [
                    { displayName: 'Cover picture', key: 'eventThumbnail' },
                    { displayName: 'Title', key: 'eventName' },
                    { displayName: 'Date and time', key: 'eventStartDate' },
                    { displayName: 'Created on', key: 'eventCreatedOn' },
                    { displayName: 'Duration', key: 'eventDuration' },
                    { displayName: 'Joined', key: 'eventjoined' },
                ],
                needCheckBox: false,
                needHash: false,
                sortColumn: 'eventCreatedOn',
                sortState: 'desc',
            })
            expect(fetchEventsSpy).toHaveBeenCalled()
        })
    })

    describe('onEventClick', () => {
        it('should navigate to event details page', () => {
            const event = { id: 'event123' }

            component.onEventClick(event)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/events/event123'])
        })
    })

    describe('fetchEvents', () => {
        it('should fetch events and set event list data', () => {
            mockEventsService.getEventsList.mockReturnValue(of(mockEventData))
            const setEventListDataSpy = jest.spyOn(component, 'setEventListData').mockImplementation()

            component.fetchEvents()

            expect(mockEventsService.getEventsList).toHaveBeenCalledWith({
                locale: ['en'],
                query: '',
                request: {
                    query: '',
                    filters: {
                        status: ['Live'],
                        contentType: 'Event',
                    },
                    sort_by: {
                        startDate: 'desc',
                    },
                },
            })
            expect(setEventListDataSpy).toHaveBeenCalledWith(mockEventData)
        })

        it('should handle fetch events error', () => {
            mockEventsService.getEventsList.mockReturnValue(throwError('Error'))
            const setEventListDataSpy = jest.spyOn(component, 'setEventListData')

            component.fetchEvents()

            expect(setEventListDataSpy).not.toHaveBeenCalled()
        })
    })

    describe('setEventListData', () => {
        beforeEach(() => {
            mockDatePipe.transform.mockReturnValue('Jun 15, 2024')
            mockEventsService.getPublicUrl.mockReturnValue('https://example.com/test-icon.png')
            jest.spyOn(component, 'customDateFormat').mockReturnValue('Jun 15, 2024 10:00')
            jest.spyOn(component, 'allEventDateFormat').mockReturnValue('Jun 01, 2024')
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            jest.spyOn(component, 'filter').mockImplementation()
        })

        it('should process event data and categorize into past and upcoming events', () => {
            component.departmentID = 'org123'
            component.eventData = { pastEvents: [], upcomingEvents: [] }

            component.setEventListData(mockEventData)

            expect(component.eventData.upcomingEvents).toHaveLength(2)
            expect(component.filter).toHaveBeenCalledWith('upcoming')
        })

        it('should handle events with different creator details formats', () => {
            component.departmentID = 'org123'
            component.eventData = { pastEvents: [], upcomingEvents: [] }

            component.setEventListData(mockEventData)

            // Check that events with creator details are processed correctly
            const eventWithCreators = component.eventData.upcomingEvents.find(
                (event: any) => event.eventjoined === '2 people'
            )
            const eventWithoutCreators = component.eventData.upcomingEvents.find(
                (event: any) => event.eventjoined === ' --- '
            )

            expect(eventWithCreators).toBeDefined()
            expect(eventWithoutCreators).toBeDefined()
        })

        it('should calculate duration correctly', () => {
            component.departmentID = 'org123'
            component.eventData = { pastEvents: [], upcomingEvents: [] }

            component.setEventListData(mockEventData)

            const event120Min = component.eventData.upcomingEvents.find(
                (event: any) => event.eventDuration === '2 hours'
            )
            const event60Min = component.eventData.upcomingEvents.find(
                (event: any) => event.eventDuration === '1 hour'
            )

            expect(event120Min).toBeDefined()
            expect(event60Min).toBeDefined()
        })

        it('should handle undefined event data', () => {
            const filterSpy = jest.spyOn(component, 'filter')

            component.setEventListData(undefined)

            expect(filterSpy).not.toHaveBeenCalled()
        })

        it('should filter events by department ID', () => {
            component.departmentID = 'different-org'
            component.eventData = { pastEvents: [], upcomingEvents: [] }

            component.setEventListData(mockEventData)

            expect(component.eventData.upcomingEvents).toHaveLength(0)
            expect(component.eventData.pastEvents).toHaveLength(0)
        })
    })

    describe('customDateFormat', () => {
        it('should format date and time correctly', () => {
            const result = component.customDateFormat('Jun 15, 2024', '1030+0530')

            expect(result).toBe('Jun 15, 2024 10:30')
        })

        it('should handle different time formats', () => {
            const result = component.customDateFormat('Dec 25, 2024', '0900+0530')

            expect(result).toBe('Dec 25, 2024 09:00')
        })
    })

    describe('filter', () => {
        beforeEach(() => {
            component.eventData = {
                pastEvents: [
                    { eventName: 'Past Event 1' },
                    { eventName: 'Past Event 2' }
                ],
                upcomingEvents: [
                    { eventName: 'Upcoming Event 1' },
                    { eventName: 'Upcoming Event 2' }
                ]
            }
        })

        it('should filter upcoming events', () => {
            component.filter('upcoming')

            expect(component.currentFilter).toBe('upcoming')
            expect(component.data).toHaveLength(2)
            expect(component.data[0].eventName).toBe('Upcoming Event 1')
        })

        it('should filter past events', () => {
            component.filter('past')

            expect(component.currentFilter).toBe('past')
            expect(component.data).toHaveLength(2)
            expect(component.data[0].eventName).toBe('Past Event 1')
        })

        it('should default to upcoming events for unknown filter', () => {
            component.filter('unknown')

            expect(component.currentFilter).toBe('unknown')
            expect(component.data).toHaveLength(2)
            expect(component.data[0].eventName).toBe('Upcoming Event 1')
        })

        it('should handle empty event arrays', () => {
            component.eventData = { pastEvents: [], upcomingEvents: [] }

            component.filter('upcoming')

            expect(component.data).toHaveLength(0)
        })
    })

    describe('onCreateClick', () => {
        it('should navigate to create user page', () => {
            component.onCreateClick()

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/create-user'])
        })
    })

    describe('onRoleClick', () => {
        it('should navigate to user details page', () => {
            const user = { userId: 'user123' }

            component.onRoleClick(user)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/user123/details'])
        })
    })

    describe('compareDate', () => {
        beforeEach(() => {
            // Mock moment to return a consistent "today" value
            (moment as any).mockImplementation(() => ({
                format: jest.fn().mockReturnValue('2024-06-10 12:00')
            }))
        })

        it('should return true for past dates', () => {
            const pastDate = '2024-06-09 10:00'

            const result = component.compareDate(pastDate)

            expect(result).toBe(true)
        })

        it('should return false for future dates', () => {
            const futureDate = '2024-06-11 10:00'

            const result = component.compareDate(futureDate)

            expect(result).toBe(false)
        })
    })

    describe('allEventDateFormat', () => {
        beforeEach(() => {
            // Mock moment format
            (moment as any).mockImplementation(() => ({
                format: jest.fn().mockReturnValue('Jun 15, 2024')
            }))
        })

        it('should format datetime to readable format', () => {
            const datetime = '2024-06-15T10:30:00Z'

            const result = component.allEventDateFormat(datetime)

            expect(result).toBe('Jun 15, 2024')
        })
    })

    describe('formatTimeAmPm', () => {
        it('should format time to AM/PM format', () => {
            const date = new Date('2024-06-15T14:30:00')

            const result = component.formatTimeAmPm(date)

            expect(result).toBe('2:30 pm')
        })

        it('should handle midnight correctly', () => {
            const date = new Date('2024-06-15T00:00:00')

            const result = component.formatTimeAmPm(date)

            expect(result).toBe('12:00 am')
        })

        it('should handle noon correctly', () => {
            const date = new Date('2024-06-15T12:00:00')

            const result = component.formatTimeAmPm(date)

            expect(result).toBe('12:00 pm')
        })

        it('should pad minutes with zero', () => {
            const date = new Date('2024-06-15T09:05:00')

            const result = component.formatTimeAmPm(date)

            expect(result).toBe('9:05 am')
        })
    })

    describe('tabTelemetry', () => {
        it('should handle tab telemetry', () => {
            const label = 'test-tab'
            const index = 1

            component.tabTelemetry(label, index)

            expect(mockEventService.handleTabTelemetry).toHaveBeenCalledWith(
                expect.any(String), // TelemetryEvents.EnumInteractSubTypes.APPROVAL_TAB
                { label, index }
            )
        })
    })

    describe('ngOnDestroy', () => {
        it('should execute without errors', () => {
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('Edge Cases', () => {
        it('should handle events with very long names', () => {
            const longNameEvent = {
                result: {
                    Event: {
                        '1': {
                            ...mockEventData.result.Event['1'],
                            name: 'A'.repeat(200) // Very long name
                        }
                    }
                }
            }

            component.departmentID = 'org123'
            component.eventData = { pastEvents: [], upcomingEvents: [] }
            mockDatePipe.transform.mockReturnValue('Jun 15, 2024')
            jest.spyOn(component, 'customDateFormat').mockReturnValue('Jun 15, 2024 10:00')
            jest.spyOn(component, 'allEventDateFormat').mockReturnValue('Jun 01, 2024')
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            jest.spyOn(component, 'filter').mockImplementation()

            component.setEventListData(longNameEvent)

            const processedEvent = component.eventData.upcomingEvents[0]
            expect(processedEvent.eventName).toHaveLength(100) // Should be truncated
        })

        it('should handle zero duration events', () => {
            const zeroDurationEvent = {
                result: {
                    Event: {
                        '1': {
                            ...mockEventData.result.Event['1'],
                            duration: 0
                        }
                    }
                }
            }

            component.departmentID = 'org123'
            component.eventData = { pastEvents: [], upcomingEvents: [] }
            mockDatePipe.transform.mockReturnValue('Jun 15, 2024')
            jest.spyOn(component, 'customDateFormat').mockReturnValue('Jun 15, 2024 10:00')
            jest.spyOn(component, 'allEventDateFormat').mockReturnValue('Jun 01, 2024')
            jest.spyOn(component, 'compareDate').mockReturnValue(false)
            jest.spyOn(component, 'filter').mockImplementation()

            component.setEventListData(zeroDurationEvent)

            const processedEvent = component.eventData.upcomingEvents[0]
            expect(processedEvent.eventDuration).toBe('---')
        })
    })
})