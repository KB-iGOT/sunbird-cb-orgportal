import { ActivatedRoute } from '@angular/router'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { CreatePlanComponent } from './create-plan.component'

describe('CreatePlanComponent', () => {
    let component: CreatePlanComponent

    const route: Partial<ActivatedRoute> = {}
    const tpdsSvc: Partial<TrainingPlanDataSharingService> = {}

    beforeAll(() => {
        component = new CreatePlanComponent(
            route as ActivatedRoute,
            tpdsSvc as TrainingPlanDataSharingService
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
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