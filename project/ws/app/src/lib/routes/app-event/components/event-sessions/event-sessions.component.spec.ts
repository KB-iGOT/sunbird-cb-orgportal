// event-sessions.component.spec.ts
import { EventSessionsComponent } from './event-sessions.component'
import { Subscription } from 'rxjs'

// Mock the interfaces and services
jest.mock('rxjs', () => {
    const original = jest.requireActual('rxjs')
    return {
        ...original,
        timer: jest.fn()
    }
})

describe('EventSessionsComponent', () => {
    let component: EventSessionsComponent
    let mockActivatedRoute: any
    let mockEventService: any
    let mockChangeDetectorRef: any
    let mockTimerSubscription: any
    let timerCallback: Function

    beforeEach(() => {
        // Mock the timer function to capture callback
        const mockTimer = require('rxjs').timer
        mockTimerSubscription = {
            subscribe: jest.fn((callback) => {
                timerCallback = callback
                return new Subscription()
            }),
            unsubscribe: jest.fn()
        }
        mockTimer.mockReturnValue(mockTimerSubscription)

        // Mock parent data
        mockActivatedRoute = {
            parent: {
                data: {
                    subscribe: jest.fn((callback) => {
                        callback(mockEventData)
                        return { unsubscribe: jest.fn() }
                    })
                }
            }
        }

        // Mock event service
        mockEventService = {
            bannerisEnabled: {
                next: jest.fn()
            }
        }

        // Mock change detector
        mockChangeDetectorRef = {
            detectChanges: jest.fn()
        }

        // Create component instance with mocked dependencies
        component = new EventSessionsComponent(
            mockActivatedRoute as any,
            mockEventService as any,
            mockChangeDetectorRef as any
        )

        // Spy on calculateTime
        jest.spyOn(component, 'calculateTime')

        // Mock Date methods
        const currentDate = new Date('2023-01-01T12:00:00')
        global.Date = jest.fn(() => currentDate) as any
        global.Date.parse = jest.fn().mockImplementation((dateString) => {
            if (dateString === 'Session1StartTime') {
                return currentDate.getTime() + 300000 // 5 minutes in future
            } else if (dateString === 'Session1EndTime') {
                return currentDate.getTime() + 3600000 // 1 hour in future
            } else if (dateString === 'Session2StartTime') {
                return currentDate.getTime() - 300000 // 5 minutes in past
            } else if (dateString === 'Session2EndTime') {
                return currentDate.getTime() + 1800000 // 30 minutes in future
            } else if (dateString === Date()) {
                return currentDate.getTime()
            }
            return new Date(dateString).getTime()
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    // Mock event data for tests
    const mockEventData = {
        eventdata: {
            data: {
                SessionCards: {
                    Sessions: {
                        session1: {
                            SessionType: 'Keynote',
                            SessionImage: 'image1.jpg',
                            SessionTitle: 'Opening Keynote',
                            SessionStartTime: 'Session1StartTime',
                            SessionEndTime: 'Session1EndTime',
                            Speaker: 'John Doe',
                            Attendees: 100
                        },
                        session2: {
                            SessionType: 'Workshop',
                            SessionImage: 'image2.jpg',
                            SessionTitle: 'Angular Workshop',
                            SessionStartTime: 'Session2StartTime',
                            SessionEndTime: 'Session2EndTime',
                            Speaker: 'Jane Smith',
                            Attendees: 50
                        }
                    }
                }
            }
        }
    }

    describe('ngOnInit', () => {
        it('should enable banner', () => {
            component.ngOnInit()
            expect(mockEventService.bannerisEnabled.next).toHaveBeenCalledWith(true)
        })

        it('should subscribe to parent route data and process session cards', () => {
            component.ngOnInit()

            // Check if subscription happened
            expect(mockActivatedRoute.parent.data.subscribe).toHaveBeenCalled()

            // Check if data was processed correctly
            expect(component.data.length).toBe(2)
            expect(component.data[0].sessionID).toBe('Session1')
            expect(component.data[0].speakerType).toBe('Keynote')
            expect(component.data[0].speakerName).toBe('John Doe')
            expect(component.data[1].sessionID).toBe('Session2')
            expect(component.data[1].speakerType).toBe('Workshop')
            expect(component.data[1].speakerName).toBe('Jane Smith')
        })

        it('should call calculateTime if data exists', () => {
            component.ngOnInit()
            expect(component.calculateTime).toHaveBeenCalled()
        })

        it('should setup timer subscription if data exists', () => {
            component.ngOnInit()
            // Check if timer subscription was set up
            expect(mockTimerSubscription.subscribe).toHaveBeenCalled()
        })
    })

    describe('calculateTime', () => {
        it('should calculate start and end times for all sessions', () => {
            // Setup some mock data
            component.data = [
                {
                    sessionID: 'Session1',
                    speakerType: 'Keynote',
                    speakerImage: 'image1.jpg',
                    speakerKeynote: 'Opening Keynote',
                    speakerDate: 'Session1StartTime',
                    speakerName: 'John Doe',
                    registeredUsers: '100',
                    startTime: 'Session1StartTime',
                    endTime: 'Session1EndTime'
                },
                {
                    sessionID: 'Session2',
                    speakerType: 'Workshop',
                    speakerImage: 'image2.jpg',
                    speakerKeynote: 'Angular Workshop',
                    speakerDate: 'Session2StartTime',
                    speakerName: 'Jane Smith',
                    registeredUsers: '50',
                    startTime: 'Session2StartTime',
                    endTime: 'Session2EndTime'
                }
            ]

            component.calculateTime()

            // Check if times are calculated and pushed to arrays
            expect(component.sessionStartTime.length).toBe(2)
            expect(component.sessionEndTime.length).toBe(2)
            expect(component.sessionStartTime[0]).toBe(300000) // 5 minutes in future
            expect(component.sessionEndTime[0]).toBe(3600000) // 1 hour in future
            expect(component.sessionStartTime[1]).toBe(-300000) // 5 minutes in past
            expect(component.sessionEndTime[1]).toBe(1800000) // 30 minutes in future
        })

        it('should do nothing if data is undefined', () => {
            // Set data to undefined
            component.data = undefined as any
            component.calculateTime()
            // Arrays should remain empty
            expect(component.sessionStartTime.length).toBe(0)
            expect(component.sessionEndTime.length).toBe(0)
        })
    })

    describe('timer callback functionality', () => {
        beforeEach(() => {
            // Initialize component and capture timer callback
            component.ngOnInit()

            // Prepare test data
            component.sessionStartTime = [300000, -300000] // First session starting in 5 minutes, second started 5 minutes ago
            component.sessionEndTime = [3600000, 1800000] // First session ending in 1 hour, second in 30 minutes
        })

        it('should update times and detect live speakers when timer fires', () => {
            // Call the timer callback
            timerCallback()

            // Check if times are updated (reduced by 60000 ms = 1 minute)
            expect(component.sessionStartTime[0]).toBe(240000) // 4 minutes
            expect(component.sessionEndTime[0]).toBe(3540000) // 59 minutes
            expect(component.sessionStartTime[1]).toBe(-360000) // -6 minutes
            expect(component.sessionEndTime[1]).toBe(1740000) // 29 minutes

            // Check if live speaker is detected (session 2 is live)
            expect(component.liveSpeaker.length).toBe(1)
            expect(component.liveSpeaker[0]).toBe(component.data[1])

            // Check if change detection was triggered
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })

        it('should update speaker remaining times', () => {
            // Call the timer callback
            timerCallback()

            // Check if remaining times are set on speaker objects
            expect(component.data[0].startRemainingTime).toBe(240000)
            expect(component.data[0].endRemaningTime).toBe(3540000)
            expect(component.data[1].startRemainingTime).toBe(-360000)
            expect(component.data[1].endRemaningTime).toBe(1740000)
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from current subscription if it exists', () => {
            // Setup a mock subscription
            const mockUnsubscribe = jest.fn()
            component['currentSubscription'] = { unsubscribe: mockUnsubscribe } as any

            // Call destroy
            component.ngOnDestroy()

            // Check if unsubscribe was called
            expect(mockUnsubscribe).toHaveBeenCalled()
        })

        it('should not attempt to unsubscribe if subscription is null', () => {
            // Set subscription to null
            component['currentSubscription'] = null

            // This should not throw an error
            expect(() => {
                component.ngOnDestroy()
            }).not.toThrow()
        })
    })
})