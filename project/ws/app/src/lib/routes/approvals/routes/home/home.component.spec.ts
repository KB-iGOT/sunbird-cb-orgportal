import { HomeComponent } from './home.component'
import { of, Subject } from 'rxjs'
import { NavigationEnd } from '@angular/router'
import moment from 'moment'

// Mock dependencies
const mockActivatedRoute = {
    parent: {
        snapshot: {
            data: {
                configService: {
                    userProfile: {
                        departmentName: 'Test Department'
                    }
                }
            }
        }
    },
    snapshot: {
        data: {
            workflowData: {
                data: {
                    result: {
                        data: [{
                            userInfo: {
                                first_name: 'John',
                                last_name: 'Doe'
                            }
                        }]
                    }
                }
            },
            workflowHistoryData: {
                data: {
                    result: {
                        data: {
                            group1: [
                                {
                                    inWorkflow: false,
                                    createdOn: 1640995200000, // 2022-01-01
                                    updateFieldValues: JSON.stringify([{
                                        fieldKey: 'email',
                                        toValue: { email: 'new@example.com' },
                                        fromValue: { email: 'old@example.com' }
                                    }]),
                                    comment: 'Updated email',
                                    action: 'UPDATE'
                                }
                            ],
                            group2: [
                                {
                                    inWorkflow: true,
                                    createdOn: 1640995300000,
                                    updateFieldValues: '[]',
                                    comment: 'Pending approval',
                                    action: 'PENDING'
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
                profileData: [
                    { key: 'email', name: 'Email Address' }
                ],
                profileDataKey: [
                    { key: 'email', name: 'Email Field' }
                ]
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

describe('HomeComponent', () => {
    let component: HomeComponent

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()

        // Mock DOM methods
        Object.defineProperty(window, 'pageYOffset', {
            value: 0,
            writable: true
        })

        // Mock document.getElementById
        global.document.getElementById = jest.fn().mockReturnValue({
            scrollIntoView: jest.fn()
        })

        // Create component instance
        component = new HomeComponent(
            mockActivatedRoute as any,
            mockRouter as any,
            mockEventService as any
        )

        // Mock ViewChild element
        component.menuElement = {
            nativeElement: {
                parentElement: {
                    offsetTop: 100
                }
            }
        } as any
    })

    describe('Constructor', () => {
        it('should initialize component', () => {
            expect(component).toBeDefined()
            expect(component.currentTab).toBe('needsapproval')
            expect(component.sticky).toBe(false)
            expect(component.isChangeLog).toBe(false)
        })

        it('should subscribe to router events and process workflow data', () => {
            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')

            // Trigger router event
            mockRouter.events.next(navigationEndEvent)

            expect(component.fullname).toBe('John Doe')
            expect(component.wfHistory.length).toBe(1)
            expect(component.wfHistory[0].fieldKey).toBe('Email Field')
            expect(component.wfHistory[0].toValue).toBe('new@example.com')
            expect(component.wfHistory[0].fromValue).toBe('old@example.com')
            expect(component.wfHistory[0].comment).toBe('Updated email')
            expect(component.wfHistory[0].action).toBe('UPDATE')
        })

        it('should handle empty workflow data', () => {
            const mockEmptyRoute = {
                ...mockActivatedRoute,
                snapshot: {
                    data: {
                        workflowData: { data: { result: { data: [] } } },
                        workflowHistoryData: { data: { result: { data: {} } } }
                    }
                }
            }

            const emptyComponent = new HomeComponent(
                mockEmptyRoute as any,
                mockRouter as any,
                mockEventService as any
            )

            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')
            mockRouter.events.next(navigationEndEvent)

            expect(emptyComponent.fullname).toBe(' ')
            expect(emptyComponent.wfHistory.length).toBe(0)
        })

        it('should handle workflow history with string updateFieldValues', () => {
            const mockRouteWithStringFields = {
                ...mockActivatedRoute,
                snapshot: {
                    ...mockActivatedRoute.snapshot,
                    data: {
                        ...mockActivatedRoute.snapshot.data,
                        workflowHistoryData: {
                            data: {
                                result: {
                                    data: {
                                        group1: [{
                                            inWorkflow: false,
                                            createdOn: 1640995200000,
                                            updateFieldValues: JSON.stringify([{
                                                fieldKey: 'name',
                                                toValue: { name: 'New Name' },
                                                fromValue: { name: 'Old Name' }
                                            }]),
                                            comment: 'Name updated',
                                            action: 'MODIFY'
                                        }]
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const testComponent = new HomeComponent(
                mockRouteWithStringFields as any,
                mockRouter as any,
                mockEventService as any
            )

            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')
            mockRouter.events.next(navigationEndEvent)

            expect(testComponent.wfHistory.length).toBe(1)
        })
    })

    describe('ngOnInit', () => {
        it('should initialize tabsData with correct structure', () => {
            component.ngOnInit()

            expect(component.tabsData).toHaveLength(5)
            expect(component.tabsData[0]).toEqual({
                name: 'Needs approval',
                key: 'needsapproval',
                render: true,
                enabled: true
            })
            expect(component.tabsData[1]).toEqual({
                name: 'Personal details',
                key: 'personalInfo',
                render: true,
                enabled: true
            })
            expect(component.tabsData[2]).toEqual({
                name: 'Academics',
                key: 'academics',
                render: true,
                enabled: true
            })
            expect(component.tabsData[3]).toEqual({
                name: 'Professional details',
                key: 'profdetails',
                render: true,
                enabled: true
            })
            expect(component.tabsData[4]).toEqual({
                name: 'Certification and skills',
                key: 'skills',
                render: true,
                enabled: true
            })
        })
    })

    describe('ngAfterViewInit', () => {
        it('should set elementPosition from menuElement', () => {
            component.ngAfterViewInit()
            expect(component.elementPosition).toBe(100)
        })
    })

    describe('handleScroll', () => {
        it('should set sticky to true when window scroll is >= elementPosition', () => {
            component.elementPosition = 50
            Object.defineProperty(window, 'pageYOffset', { value: 100 })

            component.handleScroll()

            expect(component.sticky).toBe(true)
        })

        it('should set sticky to false when window scroll is < elementPosition', () => {
            component.elementPosition = 150
            Object.defineProperty(window, 'pageYOffset', { value: 100 })

            component.handleScroll()

            expect(component.sticky).toBe(false)
        })

        it('should set sticky to true when window scroll equals elementPosition', () => {
            component.elementPosition = 100
            Object.defineProperty(window, 'pageYOffset', { value: 100 })

            component.handleScroll()

            expect(component.sticky).toBe(true)
        })
    })

    describe('onSideNavTabClick', () => {
        beforeEach(() => {
            component.ngOnInit() // Initialize tabsData
        })

        it('should set currentTab and scroll to element', () => {
            const mockElement = {
                scrollIntoView: jest.fn()
            }
            document.getElementById = jest.fn().mockReturnValue(mockElement)

            component.onSideNavTabClick('personalInfo')

            expect(component.currentTab).toBe('personalInfo')
            expect(document.getElementById).toHaveBeenCalledWith('personalInfo')
            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
                inline: 'start'
            })
        })

        it('should handle case when element is not found', () => {
            document.getElementById = jest.fn().mockReturnValue(null)

            component.onSideNavTabClick('nonexistent')

            expect(component.currentTab).toBe('nonexistent')
            expect(document.getElementById).toHaveBeenCalledWith('nonexistent')
        })

        it('should raise telemetry event with correct parameters', () => {
            const mockElement = {
                scrollIntoView: jest.fn()
            }
            document.getElementById = jest.fn().mockReturnValue(mockElement)

            component.onSideNavTabClick('academics')

            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK', // TelemetryEvents.EnumInteractTypes.CLICK
                    subType: 'scrolly-menu', // TelemetryEvents.EnumInteractSubTypes.SCROLLY_MENU
                    id: 'academics-scrolly-menu '
                },
                {}
            )
        })

        it('should find correct menu name for telemetry', () => {
            const mockElement = {
                scrollIntoView: jest.fn()
            }
            document.getElementById = jest.fn().mockReturnValue(mockElement)

            component.onSideNavTabClick('skills')

            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'certificationAndSkills-scrolly-menu '
                }),
                {}
            )
        })
    })

    describe('Workflow History Processing', () => {
        it('should sort workflow history by createdOn in descending order', () => {
            const mockRouteWithMultipleHistory = {
                ...mockActivatedRoute,
                snapshot: {
                    ...mockActivatedRoute.snapshot,
                    data: {
                        ...mockActivatedRoute.snapshot.data,
                        workflowHistoryData: {
                            data: {
                                result: {
                                    data: {
                                        group1: [
                                            {
                                                inWorkflow: false,
                                                createdOn: 1640995200000, // Earlier date
                                                updateFieldValues: JSON.stringify([{
                                                    fieldKey: 'email',
                                                    toValue: { email: 'first@example.com' },
                                                    fromValue: { email: 'old@example.com' }
                                                }]),
                                                comment: 'First update',
                                                action: 'UPDATE'
                                            },
                                            {
                                                inWorkflow: false,
                                                createdOn: 1640995300000, // Later date
                                                updateFieldValues: JSON.stringify([{
                                                    fieldKey: 'email',
                                                    toValue: { email: 'second@example.com' },
                                                    fromValue: { email: 'first@example.com' }
                                                }]),
                                                comment: 'Second update',
                                                action: 'UPDATE'
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const testComponent = new HomeComponent(
                mockRouteWithMultipleHistory as any,
                mockRouter as any,
                mockEventService as any
            )

            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')
            mockRouter.events.next(navigationEndEvent)

            expect(testComponent.wfHistory.length).toBe(2)
            expect(testComponent.wfHistory[0].comment).toBe('Second update')
            expect(testComponent.wfHistory[1].comment).toBe('First update')
        })

        it('should format date correctly in workflow history', () => {
            const testDate = new Date(1640995200000) // 2022-01-01 00:00:00 UTC
            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')
            mockRouter.events.next(navigationEndEvent)

            expect(component.wfHistory[0].requestedon).toContain(testDate.getDate().toString())
            expect(component.wfHistory[0].requestedon).toContain(moment(testDate.getMonth() + 1, 'MM').format('MMM'))
            expect(component.wfHistory[0].requestedon).toContain(testDate.getFullYear().toString())
        })

        it('should handle workflow history with empty fields array', () => {
            const mockRouteWithEmptyFields = {
                ...mockActivatedRoute,
                snapshot: {
                    ...mockActivatedRoute.snapshot,
                    data: {
                        ...mockActivatedRoute.snapshot.data,
                        workflowHistoryData: {
                            data: {
                                result: {
                                    data: {
                                        group1: [{
                                            inWorkflow: false,
                                            createdOn: 1640995200000,
                                            updateFieldValues: JSON.stringify([]),
                                            comment: 'Empty fields',
                                            action: 'EMPTY'
                                        }]
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const testComponent = new HomeComponent(
                mockRouteWithEmptyFields as any,
                mockRouter as any,
                mockEventService as any
            )

            const navigationEndEvent = new NavigationEnd(1, '/test', '/test')
            mockRouter.events.next(navigationEndEvent)

            expect(testComponent.wfHistory.length).toBe(0)
        })
    })

    describe('ngOnDestroy', () => {
        it('should be defined', () => {
            expect(component.ngOnDestroy).toBeDefined()
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })
})