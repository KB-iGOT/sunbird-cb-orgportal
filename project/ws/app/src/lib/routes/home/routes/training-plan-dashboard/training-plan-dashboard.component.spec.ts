import { TrainingPlanDashboardComponent } from './training-plan-dashboard.component'
import { Router } from '@angular/router'
import { TrainingPlanDashboardService } from '../../services/training-plan-dashboard.service'
import { LoaderService } from '../../../../../../../../../src/app/services/loader.service'
import { TrainingPlanService } from '../../../training-plan/services/traininig-plan.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'

describe('TrainingPlanDashboardComponent', () => {
    let component: TrainingPlanDashboardComponent
    let mockRouter: jest.Mocked<Router>
    let mockActivatedRoute: any
    let mockTrainingDashboardSvc: jest.Mocked<TrainingPlanDashboardService>
    let mockLoaderService: jest.Mocked<LoaderService>
    let mockTrainingPlanService: jest.Mocked<TrainingPlanService>
    let mockDialog: jest.Mocked<MatDialog>
    let mockSnackBar: jest.Mocked<MatSnackBar>

    const mockConfigService = {
        userProfileV2: { userId: 'test-user-id' },
        userRoles: new Set(['mdo_admin', 'mdo_leader'])
    }

    const mockPageData = {
        data: {
            actionMenu: [
                {
                    enabledFor: ['mdo_admin'],
                    userAccess: false,
                    isMdoAdmin: false,
                    isMdoLeader: false
                },
                {
                    enabledFor: ['mdo_leader'],
                    userAccess: false,
                    isMdoAdmin: false,
                    isMdoLeader: false
                }
            ]
        }
    }

    const mockTrainingPlanData = [
        {
            id: '1',
            name: 'Test Plan 1',
            status: 'Live',
            userType: 'Designation',
            contentList: [
                {
                    competencies_v5: [
                        { competencyArea: 'Leadership' },
                        { competencyArea: 'Management' }
                    ]
                }
            ],
            userDetails: [
                { firstName: 'John', designation: 'Manager' },
                { firstName: 'Jane', designation: 'Developer' }
            ],
            endDate: '2024-12-31',
            updatedAt: '2024-01-15',
            createdBy: 'test-user-id',
            createdByName: 'Test User'
        },
        {
            id: '2',
            name: 'Test Plan 2',
            status: 'DRAFT',
            userType: 'AllUser',
            contentList: [],
            userDetails: [],
            endDate: null,
            updatedAt: '2024-01-10',
            createdBy: 'other-user',
            createdByName: 'Other User'
        }
    ]

    beforeEach(() => {
        // Create mocks
        mockRouter = {
            navigate: jest.fn()
        } as any

        mockActivatedRoute = {
            snapshot: {
                data: {
                    configService: mockConfigService,
                    pageData: mockPageData
                }
            },
            queryParams: of({ type: 'live', tabSelected: 'Designation' })
        }

        mockTrainingDashboardSvc = {
            getUserList: jest.fn()
        } as any

        mockLoaderService = {
            changeLoaderState: jest.fn()
        } as any

        mockTrainingPlanService = {
            archivePlan: jest.fn(),
            publishPlan: jest.fn()
        } as any

        mockDialog = {
            open: jest.fn()
        } as any

        mockSnackBar = {
            open: jest.fn()
        } as any

        // Create component instance
        component = new TrainingPlanDashboardComponent(
            mockRouter,
            mockActivatedRoute,
            mockTrainingDashboardSvc,
            mockLoaderService,
            mockTrainingPlanService,
            mockSnackBar,
            mockDialog
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('ngOnInit', () => {
        it('should initialize component properties correctly', () => {
            component.ngOnInit()

            expect(component.configSvc).toBe(mockConfigService)
            expect(component.currentUser).toBe('test-user-id')
            expect(component.pageConfig).toBe(mockPageData)
            expect(component.tabledata).toBeDefined()
            expect(component.tabledata.columns).toHaveLength(7)
        })

        it('should set up table data with correct columns', () => {
            component.ngOnInit()

            const expectedColumns = [
                'Plan name', 'Assignee', 'Total content', 'Content type',
                'Timeline', 'Created by', 'Created on'
            ]

            component.tabledata.columns.forEach((column, index) => {
                expect(column.displayName).toBe(expectedColumns[index])
            })
        })

        it('should handle query params and set current filter', () => {
            jest.spyOn(component, 'filter')

            component.ngOnInit()

            expect(component.currentFilter).toBe('live')
            expect(component.filter).toHaveBeenCalledWith('live')
        })
    })

    describe('tabSelected', () => {
        it('should set current filter', () => {
            component.tabSelected('draft')
            expect(component.currentFilter).toBe('draft')
        })
    })

    describe('filter', () => {
        beforeEach(() => {
            jest.spyOn(component, 'filterData')
        })

        it('should set fetchContentDone to false and call filterData', () => {
            component.urlQueryParams = {}
            component.filter('live')

            expect(component.fetchContentDone).toBe(false)
            expect(component.currentFilter).toBe('live')
            expect(component.filterData).toHaveBeenCalled()
        })

        it('should handle URL query params and set selected tab', () => {
            component.urlQueryParams = { tabSelected: 'AllUser' }
            component.filter('draft')

            const selectedTag = component.tagListData.find((tag: any) => tag.value === 'AllUser')
            expect(selectedTag?.selected).toBe(true)
            expect(component.currentTab).toBe('AllUser')
        })

        it('should set current tab selection when no URL params', () => {
            component.urlQueryParams = {}
            component.currentTab = 'Designation'
            component.filter('live')

            const selectedTag = component.tagListData.find((tag: any) => tag.value === 'Designation')
            expect(selectedTag?.selected).toBe(true)
        })
    })

    describe('filterData', () => {
        it('should call getLiveData when filter is live', () => {
            jest.spyOn(component, 'getLiveData')
            component.currentFilter = 'live'

            component.filterData()

            expect(component.getLiveData).toHaveBeenCalled()
        })

        it('should call getDraftData when filter is draft', () => {
            jest.spyOn(component, 'getDraftData')
            component.currentFilter = 'draft'

            component.filterData()

            expect(component.getDraftData).toHaveBeenCalled()
        })
    })

    describe('getLiveData', () => {
        it('should fetch live data successfully', async () => {
            const mockResponse = {
                params: { status: 'success' },
                result: { content: mockTrainingPlanData }
            }

            mockTrainingDashboardSvc.getUserList.mockReturnValue({
                toPromise: () => Promise.resolve(mockResponse)
            } as any)

            jest.spyOn(component, 'convertDataAsPerTable')
            component.currentTab = 'Designation'

            await component.getLiveData()

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockTrainingDashboardSvc.getUserList).toHaveBeenCalledWith({
                request: { filters: { status: 'Live' } }
            })
            expect(component.completeDataRes).toBe(mockTrainingPlanData)
            expect(component.convertDataAsPerTable).toHaveBeenCalled()
        })

        it('should handle error when fetching live data', async () => {
            mockTrainingDashboardSvc.getUserList.mockReturnValue({
                toPromise: () => Promise.reject('Error')
            } as any)

            await component.getLiveData()

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
        })

        it('should handle unsuccessful response', async () => {
            const mockResponse = {
                params: { status: 'failure' }
            }

            mockTrainingDashboardSvc.getUserList.mockReturnValue({
                toPromise: () => Promise.resolve(mockResponse)
            } as any)

            await component.getLiveData()

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })
    })

    describe('getDraftData', () => {
        it('should fetch draft data successfully', async () => {
            const mockResponse = {
                params: { status: 'success' },
                result: { content: mockTrainingPlanData }
            }

            mockTrainingDashboardSvc.getUserList.mockReturnValue({
                toPromise: () => Promise.resolve(mockResponse)
            } as any)

            jest.spyOn(component, 'convertDataAsPerTable')
            component.currentTab = 'Designation'

            await component.getDraftData()

            expect(mockTrainingDashboardSvc.getUserList).toHaveBeenCalledWith({
                request: { filters: { status: 'DRAFT' } }
            })
            expect(component.convertDataAsPerTable).toHaveBeenCalled()
        })
    })

    describe('convertDataAsPerTable', () => {
        it('should transform data correctly', () => {
            component.completeDataRes = [...mockTrainingPlanData]
            component.currentUser = 'test-user-id'

            component.convertDataAsPerTable()

            expect(component.fetchContentDone).toBe(true)
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)

            // Check data transformation
            const firstPlan = component.completeDataRes[0]
            expect(firstPlan.contentCount).toBe(1)
            expect(firstPlan.assigneeCount).toBe(2)
            expect(firstPlan.createdByName).toBe('You')
            expect(firstPlan.competencies).toEqual(['Leadership', 'Management'])
            expect(firstPlan.userNameList).toEqual(['John', 'Jane'])
            expect(firstPlan.userDesignationList).toEqual(['Manager', 'Developer'])

            const secondPlan = component.completeDataRes[1]
            expect(secondPlan.assigneeCount).toBe('All Users')
        })

        it('should handle missing data gracefully', () => {
            component.completeDataRes = [{
                id: '1',
                contentList: null,
                userDetails: null,
                endDate: null,
                updatedAt: null,
                createdBy: 'other-user',
                createdByName: 'Other User',
                userType: 'CustomUser'
            }]

            component.convertDataAsPerTable()

            const plan = component.completeDataRes[0]
            expect(plan.contentCount).toBe(0)
            expect(plan.assigneeCount).toBe(0)
            expect(plan.endDate).toBe('')
            expect(plan.updatedAt).toBe('')
        })
    })

    describe('createCbp', () => {
        it('should navigate to create plan page', () => {
            component.createCbp()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'training-plan', 'create-plan'])
        })
    })

    describe('menuSelected', () => {
        const mockRow = { id: '1', name: 'Test Plan' }

        it('should handle preview action', () => {
            jest.spyOn(component, 'previewData')
            component.menuSelected({ action: 'preivewContent', row: mockRow })
            expect(component.previewData).toHaveBeenCalledWith(mockRow)
        })

        it('should handle edit action', () => {
            jest.spyOn(component, 'editContentData')
            component.menuSelected({ action: 'editContent', row: mockRow })
            expect(component.editContentData).toHaveBeenCalledWith(mockRow)
        })

        it('should handle delete action', () => {
            jest.spyOn(component, 'showConformationModal')
            component.menuSelected({ action: 'deleteContent', row: mockRow })
            expect(component.showConformationModal).toHaveBeenCalledWith(mockRow, 'deleteContent')
        })

        it('should handle publish action', () => {
            jest.spyOn(component, 'showConformationModal')
            component.menuSelected({ action: 'publishContent', row: mockRow })
            expect(component.showConformationModal).toHaveBeenCalledWith(mockRow, 'publishContent')
        })
    })

    describe('previewData', () => {
        it('should navigate to preview page', () => {
            const mockRow = { id: '1' }
            component.previewData(mockRow)
            expect(mockRouter.navigate).toHaveBeenCalledWith([
                'app', 'training-plan', 'preview-plan-for-dashboard', '1'
            ])
        })
    })

    describe('editContentData', () => {
        it('should navigate to update page', () => {
            const mockRow = { id: '1' }
            component.editContentData(mockRow)
            expect(mockRouter.navigate).toHaveBeenCalledWith([
                'app', 'training-plan', 'update-plan', '1'
            ])
        })
    })

    describe('showConformationModal', () => {
        const mockRow = { id: '1', status: 'Live', userType: 'Designation' }

        it('should open confirmation dialog for delete', () => {
            const mockDialogRef = {
                afterClosed: () => of('confirmed')
            }
            mockDialog.open.mockReturnValue(mockDialogRef as any)
            jest.spyOn(component, 'deleteContentData')

            component.showConformationModal(mockRow, 'deleteContent')

            expect(mockDialog.open).toHaveBeenCalled()
            expect(component.deleteContentData).toHaveBeenCalledWith(mockRow)
        })

        it('should open confirmation dialog for publish', () => {
            const mockDialogRef = {
                afterClosed: () => of('confirmed')
            }
            mockDialog.open.mockReturnValue(mockDialogRef as any)
            jest.spyOn(component, 'publishContentData')

            component.showConformationModal(mockRow, 'publishContent')

            expect(component.publishContentData).toHaveBeenCalledWith(mockRow)
        })

        it('should not perform action when dialog is cancelled', () => {
            const mockDialogRef = {
                afterClosed: () => of('cancelled')
            }
            mockDialog.open.mockReturnValue(mockDialogRef as any)
            jest.spyOn(component, 'deleteContentData')

            component.showConformationModal(mockRow, 'deleteContent')

            expect(component.deleteContentData).not.toHaveBeenCalled()
        })
    })

    describe('deleteContentData', () => {
        const mockRow = { id: '1', status: 'Live', userType: 'Designation' }

        it('should delete content successfully', () => {
            mockTrainingPlanService.archivePlan.mockReturnValue(of({ success: true }))
            jest.spyOn(component, 'filter')
            jest.spyOn(component, 'tabNavigate')

            component.deleteContentData(mockRow)

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockTrainingPlanService.archivePlan).toHaveBeenCalledWith({
                request: { id: '1', comment: 'Content deleted' }
            })
            expect(mockSnackBar.open).toHaveBeenCalledWith('CBP plan deleted successfully.')
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
            expect(component.tabNavigate).toHaveBeenCalledWith('live', 'Designation')
        })

        it('should handle delete error', () => {
            mockTrainingPlanService.archivePlan.mockReturnValue(throwError('Error'))

            component.deleteContentData(mockRow)

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })
    })

    describe('publishContentData', () => {
        const mockRow = { id: '1', status: 'DRAFT', userType: 'Designation' }

        it('should publish content successfully', () => {
            const mockResponse = { params: { status: 'success' } }
            mockTrainingPlanService.publishPlan.mockReturnValue(of(mockResponse))
            jest.spyOn(component, 'tabNavigate')

            component.publishContentData(mockRow)

            expect(mockTrainingPlanService.publishPlan).toHaveBeenCalledWith({
                request: { id: '1', comment: 'CBP plan approved' }
            })
            expect(mockSnackBar.open).toHaveBeenCalledWith('CBP plan published successfully.')
            expect(component.tabNavigate).toHaveBeenCalledWith('live', 'Designation')
        })

        it('should handle unsuccessful publish response', () => {
            const mockResponse = { params: { status: 'failure' } }
            mockTrainingPlanService.publishPlan.mockReturnValue(of(mockResponse))

            component.publishContentData(mockRow)

            expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Something went wrong while publishing CBP plan. Try again later'
            )
        })

        it('should handle publish error', () => {
            mockTrainingPlanService.publishPlan.mockReturnValue(throwError('Error'))

            component.publishContentData(mockRow)

            expect(mockSnackBar.open).toHaveBeenCalledWith(
                'Something went wrong while publishing CBP plan. Try again later'
            )
        })
    })

    describe('clickHandler', () => {
        it('should call createCbp when type is createCbpPlan', () => {
            jest.spyOn(component, 'createCbp')
            component.clickHandler({ type: 'createCbpPlan' })
            expect(component.createCbp).toHaveBeenCalled()
        })
    })

    describe('filterDataAsPerTab', () => {
        it('should filter data based on selected tab', () => {
            component.completeDataRes = mockTrainingPlanData
            component.filterDataAsPerTab('Designation')

            const selectedTag = component.tagListData.find((tag: any) => tag.value === 'Designation')
            expect(selectedTag?.selected).toBe(true)

            const designationPlans = mockTrainingPlanData.filter(plan => plan.userType === 'Designation')
            expect(component.trainingPlanData).toEqual(designationPlans)
        })
    })

    describe('hasAccess', () => {
        it('should set user access flags correctly', () => {
            component.pageConfig = mockPageData
            component.configSvc = mockConfigService

            component.hasAccess()

            const adminMenu = component.pageConfig.data.actionMenu[0]
            const leaderMenu = component.pageConfig.data.actionMenu[1]

            expect(adminMenu.userAccess).toBe(true)
            expect(adminMenu.isMdoAdmin).toBe(true)
            expect(leaderMenu.userAccess).toBe(true)
            expect(leaderMenu.isMdoLeader).toBe(true)
        })

        it('should handle missing page config', () => {
            component.pageConfig = null
            expect(() => component.hasAccess()).not.toThrow()
        })
    })

    describe('tabNavigate', () => {
        it('should navigate with query params', () => {
            component.tabNavigate('live', 'Designation')

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['app', 'home', 'training-plan-dashboard'],
                {
                    queryParams: {
                        type: 'live',
                        tabSelected: 'Designation'
                    }
                }
            )
        })

        it('should navigate without tabSelected param', () => {
            component.tabNavigate('draft')

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['app', 'home', 'training-plan-dashboard'],
                {
                    queryParams: {
                        type: 'draft',
                        tabSelected: undefined
                    }
                }
            )
        })
    })

    describe('Component initialization', () => {
        it('should initialize with default values', () => {
            expect(component.currentFilter).toBe('live')
            expect(component.pageIndex).toBe(0)
            expect(component.currentOffset).toBe(0)
            expect(component.limit).toBe(20)
            expect(component.searchQuery).toBe('')
            expect(component.trainingPlanData).toEqual([])
            expect(component.currentTab).toBe('Designation')
            expect(component.tagListData).toHaveLength(3)
        })
    })
})