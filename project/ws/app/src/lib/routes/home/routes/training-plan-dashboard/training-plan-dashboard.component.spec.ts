import { TrainingPlanDashboardComponent } from './training-plan-dashboard.component'
import { of, throwError } from 'rxjs'
import * as moment from 'moment'
import { fakeAsync } from '@angular/core/testing'
import _ from 'lodash'

describe('TrainingPlanDashboardComponent', () => {
    let component: TrainingPlanDashboardComponent
    let mockActivatedRoute: any
    let mockRouter: any
    let mockTrainingDashboardSvc: any
    let mockLoaderService: any
    let mockTrainingPlanService: any
    let mockSnackBar: any
    let mockDialog: any

    beforeEach(() => {
        // Mock dependencies
        mockActivatedRoute = {
            snapshot: {
                data: {
                    configService: {
                        userProfileV2: {
                            userId: 'test-user-id'
                        },
                        userRoles: new Set(['content_creator', 'mdo_admin'])
                    },
                    pageData: {
                        data: {
                            actionMenu: [
                                {
                                    enabledFor: ['content_creator', 'mdo_admin'],
                                    action: 'createCbpPlan'
                                }
                            ]
                        }
                    }
                },
            },
            queryParams: of({ type: 'live', tabSelected: 'Designation' })
        }

        mockRouter = {
            navigate: jest.fn()
        }

        mockTrainingDashboardSvc = {
            getUserList: jest.fn()
        }

        mockLoaderService = {
            changeLoaderState: jest.fn()
        }

        mockTrainingPlanService = {
            archivePlan: jest.fn(),
            publishPlan: jest.fn()
        }

        mockSnackBar = {
            open: jest.fn()
        }

        mockDialog = {
            open: jest.fn().mockReturnValue({
                afterClosed: () => of('confirmed')
            })
        }

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

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should set initial values and call filter', () => {
            const filterSpy = jest.spyOn(component, 'filter')
            const hasAccessSpy = jest.spyOn(component, 'hasAccess')

            component.ngOnInit()

            expect(component.configSvc).toBeDefined()
            expect(component.currentUser).toBe('test-user-id')
            expect(component.pageConfig).toBeDefined()
            expect(filterSpy).toHaveBeenCalledWith('live')
            expect(hasAccessSpy).toHaveBeenCalled()
            expect(component.tabledata).toBeDefined()
            expect(component.tabledata.columns.length).toBe(7)
        })
    })

    describe('filter', () => {
        it('should set fetchContentDone to false and call filterData', () => {
            const filterDataSpy = jest.spyOn(component, 'filterData')

            component.filter('live')

            expect(component.fetchContentDone).toBe(false)
            expect(component.currentFilter).toBe('live')
            expect(filterDataSpy).toHaveBeenCalled()
        })

        it('should update tagListData based on urlQueryParams', () => {
            component.urlQueryParams = { tabSelected: 'CustomUser' }
            component.filter('live')

            expect(component.tagListData.find((tag: any) => tag.value === 'CustomUser').selected).toBe(true)
            expect(component.tagListData.find((tag: any) => tag.value === 'Designation').selected).toBe(false)
        })
    })

    describe('filterData', () => {
        it('should call getLiveData when currentFilter is live', () => {
            const getLiveDataSpy = jest.spyOn(component, 'getLiveData')
            component.currentFilter = 'live'

            component.filterData()

            expect(getLiveDataSpy).toHaveBeenCalled()
        })

        it('should call getDraftData when currentFilter is draft', () => {
            const getDraftDataSpy = jest.spyOn(component, 'getDraftData')
            component.currentFilter = 'draft'

            component.filterData()

            expect(getDraftDataSpy).toHaveBeenCalled()
        })
    })

    describe('getLiveData', () => {
        it('should fetch live data and process it', async () => {
            const mockResponse = {
                params: { status: 'success' },
                result: {
                    content: [
                        {
                            id: '1',
                            name: 'Test Plan',
                            userType: 'Designation',
                            contentList: [{ id: 'c1' }, { id: 'c2' }],
                            userDetails: [{ firstName: 'User1' }, { firstName: 'User2' }],
                            endDate: '2023-12-31',
                            updatedAt: '2023-01-01',
                            createdBy: 'test-user-id'
                        }
                    ]
                }
            }

            mockTrainingDashboardSvc.getUserList.mockReturnValue(of(mockResponse))
            const convertDataSpy = jest.spyOn(component, 'convertDataAsPerTable')

            await component.getLiveData()

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockTrainingDashboardSvc.getUserList).toHaveBeenCalled()
            expect(component.completeDataRes).toEqual(mockResponse.result.content)
            expect(component.trainingPlanData.length).toBe(1)
            expect(convertDataSpy).toHaveBeenCalled()
        })

        it('should handle error when fetching live data', async () => {
            mockTrainingDashboardSvc.getUserList.mockReturnValue(throwError('Error'))

            await component.getLiveData()

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })
    })

    describe('getDraftData', () => {
        it('should fetch draft data and process it', async () => {
            const mockResponse = {
                params: { status: 'success' },
                result: {
                    content: [
                        {
                            id: '1',
                            name: 'Test Draft Plan',
                            userType: 'Designation',
                            contentList: [{ id: 'c1' }],
                            userDetails: [{ firstName: 'User1' }],
                            endDate: '2023-12-31',
                            updatedAt: '2023-01-01',
                            createdBy: 'other-user-id',
                            createdByName: 'Other User'
                        }
                    ]
                }
            }

            mockTrainingDashboardSvc.getUserList.mockReturnValue(of(mockResponse))
            const convertDataSpy = jest.spyOn(component, 'convertDataAsPerTable')

            await component.getDraftData()

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockTrainingDashboardSvc.getUserList).toHaveBeenCalled()
            expect(component.completeDataRes).toEqual(mockResponse.result.content)
            expect(component.trainingPlanData.length).toBe(1)
            expect(convertDataSpy).toHaveBeenCalled()
        })

        it('should handle error when fetching draft data', async () => {
            mockTrainingDashboardSvc.getUserList.mockReturnValue(throwError('Error'))

            await component.getDraftData()

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })
    })

    describe('convertDataAsPerTable', () => {
        it('should transform data for table display', () => {
            component.currentUser = 'test-user-id'
            component.completeDataRes = [
                {
                    id: '1',
                    contentList: [
                        {
                            competencies_v5: [
                                { competencyArea: 'Area1' },
                                { competencyArea: 'Area2' }
                            ]
                        }
                    ],
                    userType: 'CustomUser',
                    userDetails: [
                        { firstName: 'John', designation: 'Manager' },
                        { firstName: 'Jane', designation: 'Developer' }
                    ],
                    endDate: '2023-12-31',
                    updatedAt: '2023-01-01',
                    createdBy: 'test-user-id'
                }
            ]

            component.convertDataAsPerTable()

            const transformedData = component.completeDataRes[0]
            expect(transformedData.contentCount).toBe(1)
            expect(transformedData.assigneeCount).toBe(2)
            expect(transformedData.endDate).toBe(moment('2023-12-31').format('MMM DD[,] YYYY'))
            expect(transformedData.updatedAt).toBe(moment('2023-01-01').format('MMM DD[,] YYYY'))
            expect(transformedData.createdByName).toBe('You')
            expect(transformedData.competencies).toEqual(['Area1', 'Area2'])
            expect(transformedData.userNameList).toEqual(['John', 'Jane'])
            expect(transformedData.userDesignationList).toEqual(['Manager', 'Developer'])
            expect(component.fetchContentDone).toBe(true)
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })

        it('should handle AllUser type correctly', () => {
            component.completeDataRes = [
                {
                    userType: 'AllUser',
                    contentList: [],
                    endDate: null,
                    updatedAt: null,
                    createdBy: 'other-user-id',
                    createdByName: 'Other User'
                }
            ]

            component.convertDataAsPerTable()

            const transformedData = component.completeDataRes[0]
            expect(transformedData.contentCount).toBe(0)
            expect(transformedData.assigneeCount).toBe('All Users')
            expect(transformedData.endDate).toBe('')
            expect(transformedData.updatedAt).toBe('')
            expect(transformedData.createdByName).toBe('Other User')
        })
    })

    describe('createCbp', () => {
        it('should navigate to create plan page', () => {
            component.createCbp()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'training-plan', 'create-plan'])
        })
    })

    describe('menuSelected', () => {
        it('should call previewData for preivewContent action', () => {
            const previewSpy = jest.spyOn(component, 'previewData')
            const mockEvent = { action: 'preivewContent', row: { id: '1' } }

            component.menuSelected(mockEvent)

            expect(previewSpy).toHaveBeenCalledWith(mockEvent.row)
        })

        it('should call editContentData for editContent action', () => {
            const editSpy = jest.spyOn(component, 'editContentData')
            const mockEvent = { action: 'editContent', row: { id: '1' } }

            component.menuSelected(mockEvent)

            expect(editSpy).toHaveBeenCalledWith(mockEvent.row)
        })

        it('should call showConformationModal for deleteContent action', () => {
            const showModalSpy = jest.spyOn(component, 'showConformationModal')
            const mockEvent = { action: 'deleteContent', row: { id: '1' } }

            component.menuSelected(mockEvent)

            expect(showModalSpy).toHaveBeenCalledWith(mockEvent.row, mockEvent.action)
        })

        it('should call showConformationModal for publishContent action', () => {
            const showModalSpy = jest.spyOn(component, 'showConformationModal')
            const mockEvent = { action: 'publishContent', row: { id: '1' } }

            component.menuSelected(mockEvent)

            expect(showModalSpy).toHaveBeenCalledWith(mockEvent.row, mockEvent.action)
        })
    })

    describe('previewData', () => {
        it('should navigate to preview plan page', () => {
            const mockRow = { id: '123' }

            component.previewData(mockRow)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'training-plan', 'preview-plan-for-dashboard', '123'])
        })
    })

    describe('editContentData', () => {
        it('should navigate to update plan page', () => {
            const mockRow = { id: '123' }

            component.editContentData(mockRow)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'training-plan', 'update-plan', '123'])
        })
    })

    describe('showConformationModal', () => {
        it('should open dialog for delete action and call deleteContentData on confirmation', () => {
            const deleteContentSpy = jest.spyOn(component, 'deleteContentData')
            const mockRow = { id: '123' }

            component.showConformationModal(mockRow, 'deleteContent')

            expect(mockDialog.open).toHaveBeenCalled()
            expect(deleteContentSpy).toHaveBeenCalledWith(mockRow)
        })

        it('should open dialog for publish action and call publishContentData on confirmation', () => {
            const publishContentSpy = jest.spyOn(component, 'publishContentData')
            const mockRow = { id: '123' }

            component.showConformationModal(mockRow, 'publishContent')

            expect(mockDialog.open).toHaveBeenCalled()
            expect(publishContentSpy).toHaveBeenCalledWith(mockRow)
        })
    })

    describe('deleteContentData', () => {
        it('should call archivePlan service and handle success', fakeAsync(() => {
            const mockRow = { id: '123', status: 'DRAFT', userType: 'Designation' }
            mockTrainingPlanService.archivePlan.mockReturnValue(of({ success: true }))
            const tabNavigateSpy = jest.spyOn(component, 'tabNavigate')
            const filterSpy = jest.spyOn(component, 'filter')

            component.deleteContentData(mockRow)

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockTrainingPlanService.archivePlan).toHaveBeenCalledWith({
                request: {
                    id: '123',
                    comment: 'Content deleted'
                }
            })
            expect(mockSnackBar.open).toHaveBeenCalledWith('CBP plan deleted successfully.')
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
            expect(filterSpy).toHaveBeenCalledWith(component.currentFilter)
            expect(tabNavigateSpy).toHaveBeenCalledWith('draft', 'Designation')
        }))

        it('should handle error when archiving plan', () => {
            const mockRow = { id: '123' }
            mockTrainingPlanService.archivePlan.mockReturnValue(throwError('Error'))

            component.deleteContentData(mockRow)

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })
    })

    describe('publishContentData', () => {
        it('should call publishPlan service and handle success', () => {
            const mockRow = { id: '123', userType: 'Designation' }
            mockTrainingPlanService.publishPlan.mockReturnValue(of({
                params: { status: 'SUCCESS' }
            }))
            const tabNavigateSpy = jest.spyOn(component, 'tabNavigate')

            component.publishContentData(mockRow)

            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
            expect(mockTrainingPlanService.publishPlan).toHaveBeenCalledWith({
                request: {
                    id: '123',
                    comment: 'CBP plan approved'
                }
            })
            expect(mockSnackBar.open).toHaveBeenCalledWith('CBP plan published successfully.')
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
            expect(tabNavigateSpy).toHaveBeenCalledWith('live', 'Designation')
        })

        it('should handle response with unsuccessful status', () => {
            const mockRow = { id: '123' }
            mockTrainingPlanService.publishPlan.mockReturnValue(of({
                params: { status: 'error' }
            }))

            component.publishContentData(mockRow)

            expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong while publishing CBP plan. Try again later')
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })

        it('should handle error when publishing plan', () => {
            const mockRow = { id: '123' }
            mockTrainingPlanService.publishPlan.mockReturnValue(throwError('Error'))

            component.publishContentData(mockRow)

            expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong while publishing CBP plan. Try again later')
            expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
        })
    })

    describe('clickHandler', () => {
        it('should call createCbp for createCbpPlan type', () => {
            const createCbpSpy = jest.spyOn(component, 'createCbp')
            const mockEvent = { type: 'createCbpPlan' }

            component.clickHandler(mockEvent)

            expect(createCbpSpy).toHaveBeenCalled()
        })
    })

    describe('filterDataAsPerTab', () => {
        it('should update tagListData selection and filter trainingPlanData', () => {
            component.completeDataRes = [
                { userType: 'Designation', name: 'Plan 1' },
                { userType: 'CustomUser', name: 'Plan 2' },
                { userType: 'AllUser', name: 'Plan 3' }
            ]

            component.filterDataAsPerTab('CustomUser')

            expect(component.tagListData.find((tag: any) => tag.value === 'CustomUser').selected).toBe(true)
            expect(component.tagListData.find((tag: any) => tag.value === 'Designation').selected).toBe(false)
            expect(component.tagListData.find((tag: any) => tag.value === 'AllUser').selected).toBe(false)
            expect(component.trainingPlanData).toEqual([{ userType: 'CustomUser', name: 'Plan 2' }])
        })
    })

    describe('hasAccess', () => {
        it('should determine user access for action menu items', () => {
            component.configSvc = { userRoles: new Set(['mdo_leader', 'content_creator']) }
            component.pageConfig = {
                data: {
                    actionMenu: [
                        { enabledFor: ['mdo_leader'] },
                        { enabledFor: ['content_creator'] },
                        { enabledFor: ['other_role'] }
                    ]
                }
            }

            component.hasAccess()

            expect(component.pageConfig.data.actionMenu[0].userAccess).toBe(true)
            expect(component.pageConfig.data.actionMenu[0].isMdoLeader).toBe(true)
            expect(component.pageConfig.data.actionMenu[1].userAccess).toBe(true)
            expect(component.pageConfig.data.actionMenu[2].userAccess).toBe(false)
        })
    })

    describe('tabNavigate', () => {
        it('should navigate with correct query params', () => {
            component.tabNavigate('draft', 'CustomUser')

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['app', 'home', 'training-plan-dashboard'],
                { queryParams: { type: 'draft', tabSelected: 'CustomUser' } }
            )
        })
    })
})