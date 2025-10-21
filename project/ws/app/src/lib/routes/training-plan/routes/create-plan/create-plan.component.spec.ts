import { CreatePlanComponent } from './create-plan.component'
import { ActivatedRoute } from '@angular/router'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { Subject } from 'rxjs'

describe('CreatePlanComponent', () => {
    let component: CreatePlanComponent
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>
    let mockTpdsSvc: jest.Mocked<TrainingPlanDataSharingService>
    let filterToggleSubject: Subject<any>

    beforeEach(() => {
        // Create filter toggle subject
        filterToggleSubject = new Subject<any>()

        // Create mock objects for dependencies
        mockActivatedRoute = {
            snapshot: {
                data: {}
            }
        } as any

        mockTpdsSvc = {
            trainingPlanTitle: '',
            trainingPlanAssigneeData: {},
            trainingPlanContentData: {},
            trainingPlanStepperData: {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            },
            filterToggle: filterToggleSubject
        } as any

        // Create component instance with mocked dependencies
        component = new CreatePlanComponent(mockActivatedRoute, mockTpdsSvc)
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeDefined()
            expect(component.selectedTabData).toBe('createPlan')
            expect(component.nextTab).toBe('')
            expect(component.planId).toBe('')
            expect(component.filterVisibilityFlag).toBe(false)
            expect(component.from).toBe('')
        })
    })

    describe('ngOnInit', () => {
        it('should handle empty contentData', () => {
            mockActivatedRoute.snapshot.data = {}

            component.ngOnInit()

            expect(component).toBeDefined()
        })

        it('should process contentData with CustomUser assignment type', () => {
            const mockContentData = {
                name: 'Test Plan',
                assignmentType: 'CustomUser',
                userDetails: [
                    { userId: 'user1' },
                    { userId: 'user2' },
                    { userId: null } // should be filtered out
                ],
                contentList: [
                    { identifier: 'content1' },
                    { identifier: 'content2' }
                ],
                contentType: 'video',
                assignmentTypeInfo: 'info',
                endDate: '2024-12-31',
                status: 'active'
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            component.ngOnInit()

            expect(mockTpdsSvc.trainingPlanTitle).toBe('Test Plan')
            expect(mockTpdsSvc.trainingPlanAssigneeData).toEqual({
                data: mockContentData.userDetails
            })
            expect(mockTpdsSvc.trainingPlanContentData).toEqual({
                data: { content: mockContentData.contentList }
            })
            expect(mockTpdsSvc.trainingPlanStepperData.contentList).toEqual(['content1', 'content2'])
            expect(mockTpdsSvc.trainingPlanStepperData.contentType).toBe('video')
            expect(mockTpdsSvc.trainingPlanStepperData.assignmentType).toBe('CustomUser')
            expect(mockTpdsSvc.trainingPlanStepperData.endDate).toBe('2024-12-31')
            expect(mockTpdsSvc.trainingPlanStepperData.status).toBe('active')
        })

        it('should process contentData with non-CustomUser assignment type', () => {
            const mockContentData = {
                name: 'Test Plan',
                assignmentType: 'Department',
                assignmentTypeInfo: 'IT Department',
                contentList: [],
                contentType: 'document',
                endDate: '2024-12-31',
                status: 'draft'
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            component.ngOnInit()

            expect(mockTpdsSvc.trainingPlanAssigneeData).toEqual({
                category: 'Department',
                data: ['IT Department']
            })
        })

        it('should handle contentData without contentList', () => {
            const mockContentData = {
                name: 'Test Plan',
                assignmentType: 'Department',
                assignmentTypeInfo: 'IT Department',
                contentType: 'document',
                endDate: '2024-12-31',
                status: 'draft'
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            component.ngOnInit()

            expect(mockTpdsSvc.trainingPlanStepperData.contentList).toEqual([])
        })

        it('should subscribe to filterToggle observable', () => {
            const mockFilterData = { status: true, from: 'testSource' }

            component.ngOnInit()

            // Emit data after subscription
            filterToggleSubject.next(mockFilterData)

            expect(component.filterVisibilityFlag).toBe(true)
            expect(component.from).toBe('testSource')
        })

        it('should handle falsy data in filterToggle subscription', () => {
            component.ngOnInit()

            // Emit falsy data
            filterToggleSubject.next(null)

            // Should not update properties if data is falsy
            expect(component.filterVisibilityFlag).toBe(false)
            expect(component.from).toBe('')
        })

        it('should set selected property to true for each content item', () => {
            const mockContentData = {
                name: 'Test Plan',
                assignmentType: 'Department',
                assignmentTypeInfo: 'IT Department',
                contentList: [
                    { identifier: 'content1', selected: '1' },
                    { identifier: 'content2', selected: '2' }
                ],
                contentType: 'video',
                endDate: '2024-12-31',
                status: 'active'
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            component.ngOnInit()
            expect(mockContentData.contentList[0].selected).toBe(true)
            expect(mockContentData.contentList[1].selected).toBe(true)
        })
    })

    describe('selectedTabAction', () => {
        it('should update selectedTabData and nextTab', () => {
            const testEvent = 'assignees'

            component.selectedTabAction(testEvent)

            expect(component.selectedTabData).toBe('assignees')
            expect(component.nextTab).toBe('assignees')
        })

        it('should handle null event', () => {
            component.selectedTabAction(null)

            expect(component.selectedTabData).toBe(null)
            expect(component.nextTab).toBe(null)
        })
    })

    describe('changeTab', () => {
        it('should update nextTab', () => {
            const testEvent = 'content'

            component.changeTab(testEvent)

            expect(component.nextTab).toBe('content')
        })

        it('should handle empty string event', () => {
            component.changeTab('')

            expect(component.nextTab).toBe('')
        })
    })

    describe('isPlanTitleInvalid', () => {
        it('should update createCheck with titleIsInvalid', () => {
            component.createCheck = { someExistingProp: 'value' }

            component.isPlanTitleInvalid(true)

            expect(component.createCheck).toEqual({
                someExistingProp: 'value',
                titleIsInvalid: true
            })
        })

        it('should handle undefined createCheck', () => {
            component.createCheck = undefined

            component.isPlanTitleInvalid(false)

            expect(component.createCheck).toEqual({
                titleIsInvalid: false
            })
        })

        it('should handle boolean false event', () => {
            component.createCheck = { titleIsInvalid: true }

            component.isPlanTitleInvalid(false)

            expect(component.createCheck.titleIsInvalid).toBe(false)
        })
    })

    describe('isAddContentInvalid', () => {
        it('should update createCheck with addContentIsInvalid', () => {
            component.createCheck = { titleIsInvalid: false }

            component.isAddContentInvalid(true)

            expect(component.createCheck).toEqual({
                titleIsInvalid: false,
                addContentIsInvalid: true
            })
        })

        it('should handle null createCheck', () => {
            component.createCheck = null

            component.isAddContentInvalid(true)

            expect(component.createCheck).toEqual({
                addContentIsInvalid: true
            })
        })
    })

    describe('isAddAssigneeInvalid', () => {
        it('should update createCheck with addAssigneeInvalid', () => {
            component.createCheck = { titleIsInvalid: false }

            component.isAddAssigneeInvalid(true)

            expect(component.createCheck).toEqual({
                titleIsInvalid: false,
                addAssigneeIsInvalid: true
            })
        })

        it('should preserve existing properties', () => {
            component.createCheck = {
                titleIsInvalid: false,
                addContentIsInvalid: true
            }

            component.isAddAssigneeInvalid(false)

            expect(component.createCheck).toEqual({
                titleIsInvalid: false,
                addContentIsInvalid: true,
                addAssigneeIsInvalid: false
            })
        })
    })

    describe('ngOnDestroy', () => {
        it('should exist and be callable', () => {
            expect(() => component.ngOnDestroy()).not.toThrow()
        })

        it('should not throw when called multiple times', () => {
            expect(() => {
                component.ngOnDestroy()
                component.ngOnDestroy()
            }).not.toThrow()
        })
    })

    describe('Edge Cases', () => {
        it('should handle CustomUser assignment type with empty userDetails', () => {
            const mockContentData = {
                name: 'Test Plan',
                assignmentType: 'CustomUser',
                userDetails: [],
                contentList: [],
                contentType: 'video',
                assignmentTypeInfo: 'info',
                endDate: '2024-12-31',
                status: 'active'
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            component.ngOnInit()

            expect(mockContentData.assignmentTypeInfo).toEqual([])
        })

        it('should handle CustomUser assignment type with userDetails containing objects without userId', () => {
            const mockContentData = {
                name: 'Test Plan',
                assignmentType: 'CustomUser',
                userDetails: [
                    { name: 'User 1' }, // no userId
                    { userId: 'user2' },
                    null,
                    undefined
                ],
                contentList: [],
                contentType: 'video',
                assignmentTypeInfo: 'info',
                endDate: '2024-12-31',
                status: 'active'
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            component.ngOnInit()

            expect(mockContentData.assignmentTypeInfo).toEqual(['user2'])
        })

        it('should handle empty contentList array', () => {
            const mockContentData = {
                name: 'Test Plan',
                assignmentType: 'Department',
                assignmentTypeInfo: 'IT Department',
                contentList: [],
                contentType: 'document',
                endDate: '2024-12-31',
                status: 'draft'
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            component.ngOnInit()

            expect(mockTpdsSvc.trainingPlanStepperData.contentList).toEqual([])
            expect(mockTpdsSvc.trainingPlanContentData).toEqual({
                data: { content: [] }
            })
        })

        it('should handle missing properties in contentData', () => {
            const mockContentData = {
                name: 'Test Plan'
                // Missing other properties
            }

            mockActivatedRoute.snapshot.data = { contentData: mockContentData }
            mockTpdsSvc.trainingPlanStepperData = {
                contentList: [],
                contentType: '',
                assignmentType: '',
                assignmentTypeInfo: '',
                endDate: '',
                status: ''
            }

            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('Observable Subscriptions', () => {
        it('should handle observable emission after component initialization', () => {
            const mockFilterData = { status: false, from: 'newSource' }

            component.ngOnInit()

            // Emit data after subscription
            filterToggleSubject.next(mockFilterData)

            expect(component.filterVisibilityFlag).toBe(false)
            expect(component.from).toBe('newSource')
        })

        it('should handle multiple observable emissions', () => {
            component.ngOnInit()

            // First emission
            const mockFilterData1 = { status: true, from: 'source1' }
            filterToggleSubject.next(mockFilterData1)

            expect(component.filterVisibilityFlag).toBe(true)
            expect(component.from).toBe('source1')

            // Second emission
            const mockFilterData2 = { status: false, from: 'source2' }
            filterToggleSubject.next(mockFilterData2)

            expect(component.filterVisibilityFlag).toBe(false)
            expect(component.from).toBe('source2')
        })

        it('should handle undefined data in filterToggle subscription', () => {
            component.ngOnInit()

            // Emit undefined data
            filterToggleSubject.next(undefined)

            // Should not update properties if data is undefined
            expect(component.filterVisibilityFlag).toBe(false)
            expect(component.from).toBe('')
        })

        it('should handle object without expected properties', () => {
            component.ngOnInit()

            // Emit object without status and from properties
            filterToggleSubject.next({ someOtherProp: 'value' })

            // Should not update properties if expected properties are missing
            expect(component.filterVisibilityFlag).toBe(false)
            expect(component.from).toBe('')
        })
    })

    it('should set plan title and assignee data on ngOnInit with CustomUser', () => {
        const mockContentData = {
            name: 'Test Plan',
            assignmentType: 'CustomUser',
            userDetails: [{ userId: 'u1' }, { userId: 'u2' }],
            contentList: [{ identifier: 'c1' }, { identifier: 'c2' }],
            contentType: 'Course',
            assignmentTypeInfo: 'info',
            endDate: '2025-12-31',
            status: 'Draft',
            isApar: true
        }
        const route: any = { snapshot: { data: { contentData: mockContentData } } }
        const tpdsSvc: any = {
            trainingPlanStepperData: { contentList: [] },
            filterToggle: { subscribe: jest.fn() }
        }
        const comp = new CreatePlanComponent(route, tpdsSvc)
        comp.ngOnInit()
        expect(tpdsSvc.trainingPlanTitle).toBe('Test Plan')
        expect(tpdsSvc.trainingPlanAssigneeData.data).toEqual(mockContentData.userDetails)
        expect(tpdsSvc.trainingPlanContentData.data.content.length).toBe(2)
        expect(tpdsSvc.trainingPlanStepperData.contentType).toBe('Course')
        expect(tpdsSvc.trainingPlanStepperData.isApar).toBe(true)
    })

    it('should set plan title and assignee data on ngOnInit with non-CustomUser', () => {
        const mockContentData = {
            name: 'Test Plan',
            assignmentType: 'Department',
            assignmentTypeInfo: 'deptInfo',
            contentList: [],
            contentType: 'Course',
            endDate: '2025-12-31',
            status: 'Draft',
            isApar: false
        }
        const route: any = { snapshot: { data: { contentData: mockContentData } } }
        const tpdsSvc: any = {
            trainingPlanStepperData: { contentList: [] },
            filterToggle: { subscribe: jest.fn() }
        }
        const comp = new CreatePlanComponent(route, tpdsSvc)
        comp.ngOnInit()
        expect(tpdsSvc.trainingPlanTitle).toBe('Test Plan')
        expect(tpdsSvc.trainingPlanAssigneeData.category).toBe('Department')
        expect(tpdsSvc.trainingPlanAssigneeData.data).toEqual(['deptInfo'])
        expect(tpdsSvc.trainingPlanStepperData.isApar).toBe(false)
    })

    it('should update selectedTabData and nextTab on selectedTabAction', () => {
        component.selectedTabAction('tab2')
        expect(component.selectedTabData).toBe('tab2')
        expect(component.nextTab).toBe('tab2')
    })

    it('should update nextTab on changeTab', () => {
        component.changeTab('tab3')
        expect(component.nextTab).toBe('tab3')
    })

    it('should update createCheck.titleIsInvalid on isPlanTitleInvalid', () => {
        component.createCheck = {}
        component.isPlanTitleInvalid(true)
        expect(component.createCheck.titleIsInvalid).toBe(true)
    })

    it('should update createCheck.addContentIsInvalid on isAddContentInvalid', () => {
        component.createCheck = {}
        component.isAddContentInvalid(true)
        expect(component.createCheck.addContentIsInvalid).toBe(true)
    })

    it('should update createCheck.addAssigneeIsInvalid on isAddAssigneeInvalid', () => {
        component.createCheck = {}
        component.isAddAssigneeInvalid(true)
        expect(component.createCheck.addAssigneeIsInvalid).toBe(true)
    })
})