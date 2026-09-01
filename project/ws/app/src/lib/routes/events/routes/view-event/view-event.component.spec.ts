
import { NavigationEnd } from '@angular/router'
import { ViewEventComponent } from './view-event.component'
import { ElementRef } from '@angular/core'
import { of, Subject } from 'rxjs'

// Mock dependencies
const mockActivatedRoute = {
    snapshot: {
        data: {
            profileData: {
                data: {
                    result: {
                        UserProfile: [{
                            personalDetails: {
                                firstname: 'John',
                                surname: 'Doe'
                            },
                            academics: [{ degree: 'Bachelor' }],
                            professionalDetails: [{ company: 'Test Corp' }],
                            employmentDetails: [{ position: 'Developer' }],
                            skills: [{ name: 'JavaScript' }],
                            interests: [{ name: 'Coding' }]
                        }]
                    }
                }
            },
            workflowHistoryData: {
                data: {
                    result: {
                        data: {
                            history1: [
                                {
                                    inWorkflow: false,
                                    createdOn: '2023-01-01T10:30:00Z',
                                    updateFieldValues: JSON.stringify([{
                                        fieldKey: 'firstname',
                                        toValue: { firstname: 'John Updated' },
                                        fromValue: { firstname: 'John' }
                                    }]),
                                    comment: 'Updated firstname',
                                    action: 'UPDATE'
                                }
                            ]
                        }
                    }
                }
            }
        }
    },
    data: of({
        pageData: {
            data: {
                profileData: [{ key: 'firstname', name: 'First Name' }],
                profileDataKey: [{ key: 'firstname', name: 'First Name Field' }]
            }
        }
    })
}

const mockRouter = {
    events: new Subject()
}

const mockEventService = {
    raiseInteractTelemetry: jest.fn()
}

const mockElementRef = {
    nativeElement: {
        parentElement: {
            offsetTop: 100
        }
    }
}

describe('ViewEventComponent', () => {
    let component: ViewEventComponent
    let router: any
    let eventService: any

    beforeEach(() => {
        router = mockRouter
        eventService = mockEventService

        component = new ViewEventComponent(
            mockActivatedRoute as any,
            router,
            eventService
        )

        component.menuElement = mockElementRef as ElementRef

        // Mock window and document
        Object.defineProperty(window, 'pageYOffset', {
            writable: true,
            value: 0
        })

        global.document.getElementById = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should create component instance', () => {
            expect(component).toBeDefined()
        })

        it('should initialize default values', () => {
            expect(component.currentTab).toBe('personalInfo')
            expect(component.sticky).toBe(false)
            expect(component.fullname).toBe('')
            expect(component.profileData).toEqual([])
            expect(component.profileDataKeys).toEqual([])
            expect(component.wfHistory).toEqual([])
        })

        it('should subscribe to router events and process profile data on NavigationEnd', () => {
            const navigationEndEvent = new NavigationEnd(1, '/', '/')

            router.events.next(navigationEndEvent)

            expect(component.basicInfo).toEqual({
                firstname: 'John',
                surname: 'Doe'
            })
            expect(component.fullname).toBe('John')
            expect(component.academicDetails).toEqual([{ degree: 'Bachelor' }])
            expect(component.professionalDetails).toEqual({ company: 'Test Corp' })
            expect(component.employmentDetails).toEqual([{ position: 'Developer' }])
            expect(component.skillDetails).toEqual([{ name: 'JavaScript' }])
            expect(component.interests).toEqual([{ name: 'Coding' }])
        })

        it('should process workflow history data correctly', () => {
            const navigationEndEvent = new NavigationEnd(1, '/', '/')

            router.events.next(navigationEndEvent)

            expect(component.wfHistory).toHaveLength(1)
            expect(component.wfHistory[0]).toEqual({
                fieldKey: 'First Name Field',
                requestedon: expect.stringContaining('Jan'),
                toValue: 'John Updated',
                fromValue: 'John',
                fieldName: 'First Name',
                comment: 'Updated firstname',
                action: 'UPDATE'
            })
        })

        it('should handle missing profile data gracefully', () => {
            const mockActivatedRouteEmpty = {
                ...mockActivatedRoute,
                snapshot: {
                    data: {
                        profileData: { data: { result: { UserProfile: [{}] } } },
                        workflowHistoryData: { data: { result: { data: {} } } }
                    }
                }
            }

            const componentEmpty = new ViewEventComponent(
                mockActivatedRouteEmpty as any,
                router,
                eventService
            )

            const navigationEndEvent = new NavigationEnd(1, '/', '/')
            router.events.next(navigationEndEvent)

            expect(componentEmpty.basicInfo).toBeUndefined()
            expect(componentEmpty.fullname).toBe('undefined')
        })
    })

    describe('ngOnInit', () => {
        it('should initialize tabs data', () => {
            component.ngOnInit()

            expect(component.tabsData).toHaveLength(4)
            expect(component.tabsData).toEqual([
                {
                    name: 'Personal details',
                    key: 'personalInfo',
                    render: true,
                    enabled: true,
                },
                {
                    name: 'Academics',
                    key: 'academics',
                    render: true,
                    enabled: true,
                },
                {
                    name: 'Professional details',
                    key: 'profdetails',
                    render: true,
                    enabled: true,
                },
                {
                    name: 'Certification and skills',
                    key: 'skills',
                    render: true,
                    enabled: true,
                }
            ])
        })
    })

    describe('ngAfterViewInit', () => {
        it('should set element position from menu element', () => {
            component.ngAfterViewInit()

            expect(component.elementPosition).toBe(100)
        })
    })

    describe('handleScroll', () => {
        it('should set sticky to true when window scroll is greater than element position', () => {
            component.elementPosition = 50
            Object.defineProperty(window, 'pageYOffset', { value: 100 })

            component.handleScroll()

            expect(component.sticky).toBe(true)
        })

        it('should set sticky to false when window scroll is less than element position', () => {
            component.elementPosition = 150
            Object.defineProperty(window, 'pageYOffset', { value: 100 })

            component.handleScroll()

            expect(component.sticky).toBe(false)
        })

        it('should set sticky to false when window scroll equals element position', () => {
            component.elementPosition = 100
            Object.defineProperty(window, 'pageYOffset', { value: 100 })

            component.handleScroll()

            expect(component.sticky).toBe(false)
        })
    })

    describe('onSideNavTabClick', () => {
        beforeEach(() => {
            component.ngOnInit() // Initialize tabsData
        })

        it('should set current tab and scroll to element', () => {
            const mockElement = {
                scrollIntoView: jest.fn()
            };
            (document.getElementById as jest.Mock).mockReturnValue(mockElement)

            component.onSideNavTabClick('academics')

            expect(component.currentTab).toBe('academics')
            expect(document.getElementById).toHaveBeenCalledWith('academics')
            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
                inline: 'start'
            })
        })

        it('should raise telemetry event with correct parameters', () => {
            const mockElement = {
                scrollIntoView: jest.fn()
            };
            (document.getElementById as jest.Mock).mockReturnValue(mockElement)

            component.onSideNavTabClick('personalInfo')

            expect(eventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: expect.any(String),
                    subType: expect.any(String),
                    id: 'personalDetails-scrolly-menu '
                },
                {}
            )
        })

        it('should handle case when element is not found', () => {
            (document.getElementById as jest.Mock).mockReturnValue(null)

            expect(() => component.onSideNavTabClick('nonexistent')).not.toThrow()
            expect(component.currentTab).toBe('nonexistent')
        })

        it('should handle tab key that does not exist in tabsData', () => {
            const mockElement = {
                scrollIntoView: jest.fn()
            };
            (document.getElementById as jest.Mock).mockReturnValue(mockElement)

            component.onSideNavTabClick('unknownTab')

            expect(component.currentTab).toBe('unknownTab')
            expect(eventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: expect.any(String),
                    subType: expect.any(String),
                    id: '-scrolly-menu '
                },
                {}
            )
        })
    })

    describe('changeToDefaultImg', () => {
        it('should change image source to default when called', () => {
            const mockEvent = {
                target: {
                    src: ''
                }
            }

            component.changeToDefaultImg(mockEvent)

            expect(mockEvent.target.src).toBe('/assets/instances/eagle/app_logos/default.png')
        })
    })

    describe('Workflow History Processing', () => {
        it('should handle workflow history with invalid JSON', () => {
            const mockActivatedRouteInvalidJson = {
                ...mockActivatedRoute,
                snapshot: {
                    ...mockActivatedRoute.snapshot,
                    data: {
                        ...mockActivatedRoute.snapshot.data,
                        workflowHistoryData: {
                            data: {
                                result: {
                                    data: {
                                        history1: [{
                                            inWorkflow: false,
                                            createdOn: '2023-01-01T10:30:00Z',
                                            updateFieldValues: 'invalid json',
                                            comment: 'Test',
                                            action: 'UPDATE'
                                        }]
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const componentInvalidJson = new ViewEventComponent(
                mockActivatedRouteInvalidJson as any,
                router,
                eventService
            )

            const navigationEndEvent = new NavigationEnd(1, '/', '/')

            // Should not throw error and wfHistory should remain empty
            expect(() => router.events.next(navigationEndEvent)).not.toThrow()
            expect(componentInvalidJson.wfHistory).toHaveLength(0)
        })

        it('should filter out workflow items with inWorkflow: true', () => {
            const mockActivatedRouteWithInWorkflow = {
                ...mockActivatedRoute,
                snapshot: {
                    ...mockActivatedRoute.snapshot,
                    data: {
                        ...mockActivatedRoute.snapshot.data,
                        workflowHistoryData: {
                            data: {
                                result: {
                                    data: {
                                        history1: [
                                            {
                                                inWorkflow: true,
                                                createdOn: '2023-01-01T10:30:00Z',
                                                updateFieldValues: JSON.stringify([{
                                                    fieldKey: 'firstname',
                                                    toValue: { firstname: 'Should be filtered' },
                                                    fromValue: { firstname: 'Original' }
                                                }])
                                            },
                                            {
                                                inWorkflow: false,
                                                createdOn: '2023-01-01T10:30:00Z',
                                                updateFieldValues: JSON.stringify([{
                                                    fieldKey: 'firstname',
                                                    toValue: { firstname: 'Should be included' },
                                                    fromValue: { firstname: 'Original' }
                                                }])
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const componentWithInWorkflow = new ViewEventComponent(
                mockActivatedRouteWithInWorkflow as any,
                router,
                eventService
            )

            const navigationEndEvent = new NavigationEnd(1, '/', '/')
            router.events.next(navigationEndEvent)

            expect(componentWithInWorkflow.wfHistory).toHaveLength(1)
            expect(componentWithInWorkflow.wfHistory[0].toValue).toBe('Should be included')
        })
    })
})