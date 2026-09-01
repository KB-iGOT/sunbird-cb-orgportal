import { BreadcrumbComponent } from './breadcrumb.component'
import { TrainingPlanContent } from '../../models/training-plan.model'
import { of } from 'rxjs'

describe('BreadcrumbComponent', () => {
    let component: BreadcrumbComponent
    let mockRouter: any
    let mockActivatedRoute: any
    let mockDialog: any
    let mockTpdsSvc: any
    let mockTpSvc: any
    let mockSnackBar: any
    let mockConfigSvc: any
    let mockDialogRef: any

    beforeEach(() => {
        mockDialogRef = {
            afterClosed: jest.fn().mockReturnValue(of('confirmed')),
            close: jest.fn(),
        }
        mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() }
        mockActivatedRoute = {
            snapshot: { data: { contentData: null }, params: { planId: 'plan-1' } },
        }
        mockDialog = { open: jest.fn().mockReturnValue(mockDialogRef) }
        mockTpdsSvc = {
            trainingPlanTitle: 'Test Title',
            trainingPlanStepperData: {
                name: '', status: 'draft', assignmentType: 'AllUser',
                assignmentTypeInfo: [], contentList: [], contentType: 'Course',
                endDate: null, accessControl: { userGroups: [], version: 1 },
            },
        }
        mockTpSvc = {
            createPlanV2: jest.fn().mockReturnValue(of({ success: true })),
            updatePlan: jest.fn().mockReturnValue(of({ success: true })),
            updatePlanV2: jest.fn().mockReturnValue(of({ success: true })),
            publishPlan: jest.fn().mockReturnValue(of({ params: { status: 'success' } })),
        }
        mockSnackBar = { open: jest.fn() }
        mockConfigSvc = {
            userProfile: { rootOrgId: 'org-001' },
            unMappedUser: { rootOrgId: 'org-001' },
            orgReadData: { isCCA: false },
        }
        component = new BreadcrumbComponent(
            mockRouter, mockActivatedRoute, mockDialog,
            mockTpdsSvc, mockTpSvc, mockSnackBar, mockConfigSvc,
        )
    })

    it('should initialize with default values', () => {
        expect(component.showBreadcrumbAction).toBe(true)
        expect(component.selectedTab).toBe('')
        expect(component.editState).toBe(false)
        expect(component.isLiveContent).toBe(false)
    })

    describe('ngOnInit', () => {
        it('should set editState false when contentData is absent', () => {
            component.ngOnInit()
            expect(component.editState).toBe(false)
        })

        it('should set editState true when contentData is present', () => {
            mockActivatedRoute.snapshot.data.contentData = { status: 'draft' }
            component.ngOnInit()
            expect(component.editState).toBe(true)
        })

        it('should set isLiveContent true when status is live', () => {
            mockActivatedRoute.snapshot.data.contentData = { status: 'live' }
            component.ngOnInit()
            expect(component.isLiveContent).toBe(true)
        })

        it('should set isLiveContent false when status is draft', () => {
            mockActivatedRoute.snapshot.data.contentData = { status: 'draft' }
            component.ngOnInit()
            expect(component.isLiveContent).toBe(false)
        })
    })

    describe('cancel', () => {
        it('should reset title and navigate after timeout', () => {
            jest.useFakeTimers()
            component.cancel()
            expect(mockTpdsSvc.trainingPlanTitle).toBe('')
            jest.advanceTimersByTime(600)
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/home/training-plan-dashboard')
            jest.useRealTimers()
        })
    })

    describe('nextStep', () => {
        it('should emit ADD_CONTENT from CREATE_PLAN', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.CREATE_PLAN
            component.changeToNextTab = { emit: jest.fn() } as any
            component.nextStep()
            expect(component.changeToNextTab.emit).toHaveBeenCalledWith(TrainingPlanContent.TTabLabelKey.ADD_CONTENT)
        })

        it('should emit ADD_ACCESS_SETTINGS from ADD_CONTENT', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.ADD_CONTENT
            component.changeToNextTab = { emit: jest.fn() } as any
            component.nextStep()
            expect(component.changeToNextTab.emit).toHaveBeenCalledWith(TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS)
        })

        it('should emit ADD_TIMELINE from ADD_ACCESS_SETTINGS', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS
            component.changeToNextTab = { emit: jest.fn() } as any
            component.nextStep()
            expect(component.changeToNextTab.emit).toHaveBeenCalledWith(TrainingPlanContent.TTabLabelKey.ADD_TIMELINE)
        })

        it('should call createPlanDraftView from ADD_TIMELINE', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.ADD_TIMELINE
            component.createPlanDraftView = jest.fn()
            component.nextStep()
            expect(component.createPlanDraftView).toHaveBeenCalled()
        })
    })

    describe('changeTabFromBreadCrumb', () => {
        it('should emit CREATE_PLAN for CREATE_PLAN item', () => {
            component.changeToNextTab = { emit: jest.fn() } as any
            component.changeTabFromBreadCrumb(TrainingPlanContent.TTabLabelKey.CREATE_PLAN)
            expect(component.changeToNextTab.emit).toHaveBeenCalledWith(TrainingPlanContent.TTabLabelKey.CREATE_PLAN)
        })

        it('should not emit for unknown tab', () => {
            component.changeToNextTab = { emit: jest.fn() } as any
            component.changeTabFromBreadCrumb('other')
            expect(component.changeToNextTab.emit).not.toHaveBeenCalled()
        })
    })

    describe('performRoute', () => {
        it('should navigate with queryParams when editState true and list', () => {
            component.editState = true
            mockTpdsSvc.trainingPlanStepperData = { status: 'draft', assignmentType: 'AllUser' }
            component.performRoute('list')
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['app', 'home', 'training-plan-dashboard'],
                { queryParams: { type: 'draft', tabSelected: 'AllUser' } },
            )
        })

        it('should navigate to dashboard when editState false and list', () => {
            component.editState = false
            component.performRoute('list')
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'home', 'training-plan-dashboard'])
        })

        it('should navigate to route when not list', () => {
            component.performRoute('create')
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/training-plan/create')
        })
    })

    describe('showDialogBox', () => {
        it('should pass progress data to openDialoagBox', () => {
            component.openDialoagBox = jest.fn()
            component.showDialogBox('progress')
            expect(component.openDialoagBox).toHaveBeenCalledWith(expect.objectContaining({ type: 'progress' }))
        })

        it('should pass progress-completed data to openDialoagBox', () => {
            component.openDialoagBox = jest.fn()
            component.showDialogBox('progress-completed')
            expect(component.openDialoagBox).toHaveBeenCalledWith(expect.objectContaining({ type: 'progress-completed' }))
        })
    })

    describe('openDialoagBox', () => {
        it('should open dialog with data', () => {
            const data = { type: 'x', icon: 'y', title: 'T', subTitle: 'S' }
            component.openDialoagBox(data)
            expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
                disableClose: true, data, autoFocus: false,
            })
        })
    })

    describe('hideConfirmationBox', () => {
        it('should close dialog', () => {
            component.dialogRef = mockDialogRef
            component.hideConfirmationBox()
            expect(mockDialogRef.close).toHaveBeenCalled()
        })
    })

    describe('createPlanDraftView', () => {
        it('should call createPlanV2 and navigate after timeout', () => {
            jest.useFakeTimers()
            component.showDialogBox = jest.fn()
            component.dialogRef = mockDialogRef
            component.createPlanDraftView()
            expect(component.showDialogBox).toHaveBeenCalledWith('progress')
            expect(mockTpSvc.createPlanV2).toHaveBeenCalled()
            expect(mockDialogRef.close).toHaveBeenCalled()
            jest.advanceTimersByTime(1100)
            expect(mockTpdsSvc.trainingPlanTitle).toBe('')
            expect(mockRouter.navigate).toHaveBeenCalled()
            jest.useRealTimers()
        })
    })

    describe('checkIfDisabled', () => {
        it('should return false for CREATE_PLAN when titleIsInvalid is false', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.CREATE_PLAN
            component.validationList = { titleIsInvalid: false }
            expect(component.checkIfDisabled()).toBe(false)
        })

        it('should return false for ADD_CONTENT when addContentIsInvalid is false', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.ADD_CONTENT
            component.validationList = { addContentIsInvalid: false }
            expect(component.checkIfDisabled()).toBe(false)
        })

        it('should return false for ADD_ASSIGNEE when addAssigneeIsInvalid is false', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.ADD_ASSIGNEE
            component.validationList = { addAssigneeIsInvalid: false }
            expect(component.checkIfDisabled()).toBe(false)
        })

        it('should return false for ADD_ACCESS_SETTINGS when valid', () => {
            component.selectedTab = TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS
            component.validationList = { addAccessSettingsIsInvalid: false }
            expect(component.checkIfDisabled()).toBe(false)
        })

        it('should return true for unknown tab', () => {
            component.selectedTab = 'other'
            expect(component.checkIfDisabled()).toBe(true)
        })
    })

    describe('updatePlan', () => {
        beforeEach(() => {
            mockActivatedRoute.snapshot.data.contentData = { id: 'plan-123' }
            component.showDialogBox = jest.fn()
            component.dialogRef = mockDialogRef
            component.publishPlan = jest.fn()
        })

        it('should call updatePlan and navigate for non-live content', () => {
            jest.useFakeTimers()
            component.isLiveContent = false
            component.updatePlan()
            expect(mockTpSvc.updatePlan).toHaveBeenCalled()
            jest.advanceTimersByTime(1100)
            expect(mockRouter.navigate).toHaveBeenCalled()
            jest.useRealTimers()
        })

        it('should call publishPlan for live content', () => {
            component.isLiveContent = true
            component.updatePlan()
            expect(mockTpSvc.updatePlan).toHaveBeenCalled()
            expect(component.publishPlan).toHaveBeenCalled()
        })
    })

    describe('generateRequestPayload', () => {
        it('should generate create payload', () => {
            const data = {
                name: 'Plan', status: 'draft', contentList: [], contentType: 'Course',
                endDate: '2025-01-01', isApar: false,
                accessControl: { userGroups: [], version: 1 }, comment: 'test',
            }
            const result = component.generateRequestPayload(data, 'create')
            expect(result.request.name).toBe('Plan')
            expect(result.request.status).toBe('draft')
        })

        it('should generate update payload with id', () => {
            mockActivatedRoute.snapshot.data.contentData = { id: 'plan-1' }
            const data = {
                name: 'Plan', status: 'draft', contentList: [], contentType: 'Course',
                endDate: '2025-01-01', isApar: false,
                accessControl: { userGroups: [], version: 1 },
            }
            const result = component.generateRequestPayload(data, 'update')
            expect(result.request.id).toBe('plan-1')
        })

        it('should return null for unknown type', () => {
            expect(component.generateRequestPayload({}, 'delete')).toBeNull()
        })
    })
})
