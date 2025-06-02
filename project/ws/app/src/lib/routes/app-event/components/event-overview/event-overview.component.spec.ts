import { EventOverviewComponent } from './event-overview.component'
import { ActivatedRoute } from '@angular/router'
import { EventService } from '../../services/event.service'
import { BehaviorSubject } from 'rxjs'

describe('EventOverviewComponent', () => {
    let component: EventOverviewComponent
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>
    let mockEventService: jest.Mocked<EventService>
    let mockBannerSubject: BehaviorSubject<boolean>

    beforeEach(() => {
        // Create mock BehaviorSubject for bannerisEnabled
        mockBannerSubject = new BehaviorSubject<boolean>(false)

        // Mock EventService
        mockEventService = {
            bannerisEnabled: mockBannerSubject
        } as jest.Mocked<EventService>

        // Mock ActivatedRoute
        mockActivatedRoute = {
            parent: null
        } as jest.Mocked<ActivatedRoute>

        // Create component instance
        component = new EventOverviewComponent(mockActivatedRoute, mockEventService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component instance', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with empty data array', () => {
            expect(component.data).toEqual([])
        })

        it('should initialize eventFooter as undefined', () => {
            expect(component.eventFooter).toBeUndefined()
        })
    })

    describe('ngOnInit', () => {
        it('should enable banner on initialization', () => {
            const nextSpy = jest.spyOn(mockEventService.bannerisEnabled, 'next')

            component.ngOnInit()

            expect(nextSpy).toHaveBeenCalledWith(true)
        })

        it('should not process data when activatedRoute.parent is null', () => {
            // mockActivatedRoute.parent = null

            component.ngOnInit()

            expect(component.data).toEqual([])
            expect(component.eventFooter).toBeUndefined()
        })

        it('should not process data when activatedRoute.parent is undefined', () => {
            // mockActivatedRoute.parent = undefined

            component.ngOnInit()

            expect(component.data).toEqual([])
            expect(component.eventFooter).toBeUndefined()
        })
    })

    describe('Data Processing', () => {
        const mockEventData = {
            eventdata: {
                data: {
                    Home: {
                        SessionTypes: {
                            'session1': {
                                SessionTypeImage: 'image1.jpg',
                                SessionTypeTitle: 'Session 1 Title',
                                SessionTypeBody: 'Session 1 Description'
                            },
                            'session2': {
                                SessionTypeImage: 'image2.jpg',
                                SessionTypeTitle: 'Session 2 Title',
                                SessionTypeBody: 'Session 2 Description'
                            }
                        }
                    }
                }
            }
        }

        beforeEach(() => {
            // mockActivatedRoute.parent = {
            //     data: of(mockEventData)
            // } as any
        })

        it('should process event data when parent route data is available', () => {
            component.ngOnInit()

            expect(component.eventFooter).toBe(mockEventData.eventdata.data.Home)
            expect(component.data).toHaveLength(2)
        })

        it('should correctly map session data to component data structure', () => {
            component.ngOnInit()

            const expectedData = [
                {
                    plannedImage: 'image1.jpg',
                    plannedName: 'Session 1 Title',
                    plannedDetails: 'Session 1 Description'
                },
                {
                    plannedImage: 'image2.jpg',
                    plannedName: 'Session 2 Title',
                    plannedDetails: 'Session 2 Description'
                }
            ]

            expect(component.data).toEqual(expectedData)
        })

        it('should reset data array before processing new data', () => {
            // Set initial data
            component.data = [{ plannedImage: 'old.jpg', plannedName: 'Old', plannedDetails: 'Old data' }]

            component.ngOnInit()

            expect(component.data).toHaveLength(2)
            expect(component.data[0].plannedName).toBe('Session 1 Title')
        })

        it('should handle empty SessionTypes object', () => {
            const emptySessionData = {
                eventdata: {
                    data: {
                        Home: {
                            SessionTypes: {}
                        }
                    }
                }
            }

            // mockActivatedRoute.parent = {
            //     data: of(emptySessionData)
            // } as any

            component.ngOnInit()

            expect(component.data).toEqual([])
            expect(component.eventFooter).toBe(emptySessionData.eventdata.data.Home)
        })

        it('should handle single session type', () => {
            // const singleSessionData = {
            //     eventdata: {
            //         data: {
            //             Home: {
            //                 SessionTypes: {
            //                     'onlySession': {
            //                         SessionTypeImage: 'single.jpg',
            //                         SessionTypeTitle: 'Only Session',
            //                         SessionTypeBody: 'Single session description'
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

            // mockActivatedRoute.parent = {
            //     data: of(singleSessionData)
            // } as any

            component.ngOnInit()

            expect(component.data).toHaveLength(1)
            expect(component.data[0]).toEqual({
                plannedImage: 'single.jpg',
                plannedName: 'Only Session',
                plannedDetails: 'Single session description'
            })
        })
    })

    describe('Observable Subscription', () => {
        it('should subscribe to parent route data when parent exists', () => {
            const mockSubscribe = jest.fn()
            // mockActivatedRoute.parent = {
            //     data: {
            //         subscribe: mockSubscribe
            //     }
            // } as any

            component.ngOnInit()

            expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function))
        })

        it('should handle subscription callback correctly', () => {
            const testData = {
                eventdata: {
                    data: {
                        Home: {
                            SessionTypes: {
                                'test': {
                                    SessionTypeImage: 'test.jpg',
                                    SessionTypeTitle: 'Test Title',
                                    SessionTypeBody: 'Test Body'
                                }
                            }
                        }
                    }
                }
            }

            // let subscriptionCallback: (data: any) => void
            // mockActivatedRoute.parent = {
            //     data: {
            //         subscribe: jest.fn((callback) => {
            //             subscriptionCallback = callback
            //             callback(testData)
            //         })
            //     }
            // } as any

            component.ngOnInit()

            expect(component.eventFooter).toBe(testData.eventdata.data.Home)
            expect(component.data).toHaveLength(1)
        })
    })

    describe('Error Handling', () => {
        it('should handle missing SessionTypes property gracefully', () => {
            const malformedData = {
                eventdata: {
                    data: {
                        Home: {}
                    }
                }
            }

            // mockActivatedRoute.parent = {
            //     data: of(malformedData)
            // } as any

            expect(() => component.ngOnInit()).not.toThrow()
            expect(component.eventFooter).toBe(malformedData.eventdata.data.Home)
            expect(component.data).toEqual([])
        })

        // it('should handle missing Home property gracefully', () => {
        //     const malformedData = {
        //         eventdata: {
        //             data: {}
        //         }
        //     }

        //     // mockActivatedRoute.parent = {
        //     //     data: of(malformedData)
        //     // } as any

        //     expect(() => component.ngOnInit()).toThrow()
        // })
    })

    describe('Integration Tests', () => {
        it('should perform complete initialization flow', () => {
            const bannerSpy = jest.spyOn(mockEventService.bannerisEnabled, 'next')
            const testData = {
                eventdata: {
                    data: {
                        Home: {
                            SessionTypes: {
                                'integration': {
                                    SessionTypeImage: 'integration.jpg',
                                    SessionTypeTitle: 'Integration Test',
                                    SessionTypeBody: 'Integration test description'
                                }
                            }
                        }
                    }
                }
            }

            // mockActivatedRoute.parent = {
            //     data: of(testData)
            // } as any

            component.ngOnInit()

            expect(bannerSpy).toHaveBeenCalledWith(true)
            expect(component.eventFooter).toBe(testData.eventdata.data.Home)
            expect(component.data).toHaveLength(1)
            expect(component.data[0].plannedName).toBe('Integration Test')
        })
    })
})