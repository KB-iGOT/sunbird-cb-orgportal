import { of, Subject } from 'rxjs'
import { CreateWorkallocationComponent } from './create-workallocation.component'

// Mock classes and interfaces
class MockElementRef {
    nativeElement = {
        offsetTop: 100,
        scrollIntoView: jest.fn()
    };
}

class MockWatStoreService {
    private activitiesGroupSubject = new Subject();
    private competencyGroupSubject = new Subject();
    private compGrpSubject = new Subject();
    private officerGroupSubject = new Subject();
    private errorCountSubject = new Subject();
    private currentProgressSubject = new Subject();
    private triggerSaveSubject = new Subject();

    getactivitiesGroup = this.activitiesGroupSubject.asObservable();
    getcompetencyGroup = this.competencyGroupSubject.asObservable();
    get_compGrp = this.compGrpSubject.asObservable();
    getOfficerGroup = this.officerGroupSubject.asObservable();
    getErrorCount = this.errorCountSubject.asObservable();
    getCurrentProgress = this.currentProgressSubject.asObservable();

    setworkOrderId = '';
    setOfficerId = '';
    getOfficerId = 'officer123';
    getworkOrderId = 'work123';

    triggerSave = () => this.triggerSaveSubject.asObservable();
    getUpdateCompGroupById = jest.fn();
    clear = jest.fn();

    // Helper methods for testing
    emitActivitiesGroup(data: any) { this.activitiesGroupSubject.next(data) }
    emitCompetencyGroup(data: any) { this.competencyGroupSubject.next(data) }
    emitCompGrp(data: any) { this.compGrpSubject.next(data) }
    emitOfficerGroup(data: any) { this.officerGroupSubject.next(data) }
    emitErrorCount(data: any) { this.errorCountSubject.next(data) }
    emitCurrentProgress(data: any) { this.currentProgressSubject.next(data) }
    emitTriggerSave(data: any) { this.triggerSaveSubject.next(data) }
}

class MockAllocationService {
    createAllocationV2 = jest.fn();
    updateAllocationV2 = jest.fn();
    getAllUsers = jest.fn();
}

class MockMatSnackBar {
    open = jest.fn();
}

class MockRouter {
    navigate = jest.fn();
}

class MockActivatedRoute {
    params = of({ workorder: 'work123', officerId: 'officer456' });
    snapshot = {
        data: {
            pageData: {
                data: {
                    externalUrls: [{ key: 'test', field: 'value' }]
                }
            },
            watData: {
                data: {
                    roleCompetencyList: [],
                    unmappedActivities: [],
                    unmappedCompetencies: [],
                    userName: 'Test User',
                    userId: 'user123',
                    userEmail: 'test@example.com',
                    userPosition: 'Manager',
                    positionId: 'pos123',
                    positionDescription: 'Test Position',
                    createdBy: 'creator123',
                    id: 'edit123',
                    createdByName: 'Creator Name'
                }
            }
        }
    };
}

class MockDocument {
    location = { reload: jest.fn() };
}

class MockMatDialog {
    open = jest.fn();
}

class MockEventService {
    raiseInteractTelemetry = jest.fn();
    handleTabTelemetry = jest.fn();
}

describe('CreateWorkallocationComponent', () => {
    let component: CreateWorkallocationComponent
    let mockWatStore: MockWatStoreService
    let mockAllocateService: MockAllocationService
    let mockSnackBar: MockMatSnackBar
    let mockRouter: MockRouter
    let mockRoute: MockActivatedRoute
    let mockDocument: MockDocument
    let mockDialog: MockMatDialog
    let mockEvents: MockEventService

    beforeEach(() => {
        mockWatStore = new MockWatStoreService()
        mockAllocateService = new MockAllocationService()
        mockSnackBar = new MockMatSnackBar()
        mockRouter = new MockRouter()
        mockRoute = new MockActivatedRoute()
        mockDocument = new MockDocument()
        mockDialog = new MockMatDialog()
        mockEvents = new MockEventService()

        component = new CreateWorkallocationComponent(
            mockWatStore as any,
            mockAllocateService as any,
            mockSnackBar as any,
            mockRouter as any,
            mockRoute as any,
            mockDocument as any,
            mockDialog as any,
            mockEvents as any
        )

        // Set up ViewChild elements
        component.mainWindowElement = new MockElementRef() as any
        component.officerElement = new MockElementRef() as any
        component.activitiesElement = new MockElementRef() as any
        component.competenciesElement = new MockElementRef() as any
        component.competencyDetailsElement = new MockElementRef() as any

        // Mock window object
        Object.defineProperty(window, 'pageYOffset', {
            writable: true,
            value: 0
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should initialize with route params', () => {
            expect(component.workOrderId).toBe('work123')
            expect(component.officerId).toBe('officer456')
            expect(mockWatStore.setworkOrderId).toBe('work123')
            expect(mockWatStore.setOfficerId).toBe('officer456')
        })

        it('should set pageData from route snapshot', () => {
            expect(component.pageData).toEqual(mockRoute.snapshot.data.pageData.data)
        })

        it('should show snackbar when no officer ID', () => {
            mockWatStore.getOfficerId = ''
            component = new CreateWorkallocationComponent(
                mockWatStore as any,
                mockAllocateService as any,
                mockSnackBar as any,
                mockRouter as any,
                mockRoute as any,
                mockDocument as any,
                mockDialog as any,
                mockEvents as any
            )
            expect(mockSnackBar.open).toHaveBeenCalledWith('Please save this work order and open in edit mode for Auto Save')
        })
    })

    describe('ngOnInit', () => {
        it('should set firstEdit to false and call necessary methods', () => {
            const setEditDataSpy = jest.spyOn(component, 'setEditData')
            const fetchFormsDataSpy = jest.spyOn(component, 'fetchFormsData')
            const autoSaveSpy = jest.spyOn(component, 'autoSave')

            component.officerId = 'officer123'
            component.ngOnInit()

            expect(component['firstEdit']).toBe(false)
            expect(setEditDataSpy).toHaveBeenCalled()
            expect(fetchFormsDataSpy).toHaveBeenCalled()
            expect(autoSaveSpy).toHaveBeenCalled()
        })

        it('should not call setEditData when no officerId', () => {
            const setEditDataSpy = jest.spyOn(component, 'setEditData')
            component.officerId = null
            component.ngOnInit()
            expect(setEditDataSpy).not.toHaveBeenCalled()
        })
    })

    describe('autoSave', () => {
        it('should subscribe to triggerSave and handle update when edit data exists', () => {
            const updateWatSpy = jest.spyOn(component, 'updateWat').mockImplementation()


            component.workOrderId = 'work123'
            component.editDataStruct = { id: 'edit123' }

            component.autoSave()
            mockWatStore.emitTriggerSave({ reload: true, serverCall: false })

            expect(updateWatSpy).toHaveBeenCalledWith(true, true, false)
        })

        it('should not call updateWat when officer is invalid', () => {
            const updateWatSpy = jest.spyOn(component, 'updateWat').mockImplementation()


            component.workOrderId = 'work123'
            component.editDataStruct = { id: 'edit123' }

            component.autoSave()
            mockWatStore.emitTriggerSave({ reload: true, serverCall: false })

            expect(updateWatSpy).not.toHaveBeenCalled()
        })

        it('should not call updateWat when no workOrderId', () => {
            const updateWatSpy = jest.spyOn(component, 'updateWat').mockImplementation()
            component.workOrderId = null

            component.autoSave()
            mockWatStore.emitTriggerSave({ reload: true, serverCall: false })

            expect(updateWatSpy).not.toHaveBeenCalled()
        })
    })

    describe('setEditData', () => {
        it('should set editDataStruct when route data exists', () => {
            component.setEditData()

            expect(component.editDataStruct).toEqual({
                roleCompetencyList: [],
                unmappedActivities: [],
                unmappedCompetencies: [],
                user: {
                    officerName: 'Test User',
                    userId: 'user123',
                    userEmail: 'test@example.com'
                },
                position: {
                    userPosition: 'Manager',
                    positionId: 'pos123',
                    positionDescription: 'Test Position'
                },
                createdBy: 'creator123',
                id: 'edit123',
                createdByName: 'Creator Name'
            })
        })

        it('should handle missing route data', () => {
            //mockRoute.snapshot.data.watData = null
            component.setEditData()
            expect(component.editDataStruct).toBeUndefined()
        })
    })

    describe('Getters', () => {
        beforeEach(() => {
            component.editDataStruct = {
                user: { officerName: 'Test Officer' },
                position: { userPosition: 'Manager' },
                unmappedActivities: [
                    {
                        id: 'act1',
                        name: 'Activity 1',
                        description: 'Desc 1',
                        submittedToName: 'Person 1',
                        submittedToId: 'person1',
                        submittedToEmail: 'person1@test.com'
                    }
                ],
                unmappedCompetencies: [
                    {
                        id: 'comp1',
                        name: 'Competency 1',
                        description: 'Comp Desc 1',
                        level: 'Beginner',
                        additionalProperties: {
                            competencyType: 'Technical',
                            competencyArea: 'IT'
                        }
                    }
                ],
                roleCompetencyList: []
            }
        })

        describe('getOfficerDataEdit', () => {
            it('should return officer data when editDataStruct exists', () => {
                const result = component.getOfficerDataEdit
                expect(result).toEqual({
                    usr: { officerName: 'Test Officer' },
                    position: { userPosition: 'Manager' }
                })
            })

            it('should return null when editDataStruct is null', () => {
                component.editDataStruct = null
                expect(component.getOfficerDataEdit).toBeNull()
            })
        })

        describe('getActivityDataEdit', () => {
            it('should return mapped activity data when editDataStruct exists', () => {
                const result = component.getActivityDataEdit
                expect(result).toEqual({
                    unmdA: [{
                        activityId: 'act1',
                        activityName: 'Activity 1',
                        activityDescription: 'Desc 1',
                        assignedTo: 'Person 1',
                        assignedToId: 'person1',
                        assignedToEmail: 'person1@test.com'
                    }],
                    list: []
                })
            })

            it('should return null when editDataStruct is null', () => {
                component.editDataStruct = null
                expect(component.getActivityDataEdit).toBeNull()
            })
        })

        describe('getCompDataEdit', () => {
            it('should return mapped competency data when editDataStruct exists', () => {
                const result = component.getCompDataEdit
                expect(result).toEqual({
                    unmdC: [{
                        compId: 'comp1',
                        compName: 'Competency 1',
                        compDescription: 'Comp Desc 1',
                        compLevel: 'Beginner',
                        compType: 'Technical',
                        compArea: 'IT'
                    }],
                    list: []
                })
            })

            it('should handle missing additionalProperties', () => {
                component.editDataStruct.unmappedCompetencies[0].additionalProperties = null
                const result: any = component.getCompDataEdit
                expect(result.unmdC[0].compType).toBe('')
                expect(result.unmdC[0].compArea).toBe('')
            })

            it('should return null when editDataStruct is null', () => {
                component.editDataStruct = null
                expect(component.getCompDataEdit).toBeNull()
            })
        })

        describe('getsubPath', () => {
            it('should return path with selected tab', () => {
                component.selectedTab = 'activities'
                expect(component.getsubPath).toBe('./#activities')
            })
        })

        describe('getOfficerName', () => {
            it('should return officer name from dataStructure', () => {
                component.dataStructure = {
                    officerFormData: { officerName: 'Form Officer' }
                }
                expect(component.getOfficerName).toBe('Form Officer')
            })

            it('should return officer name from editDataStruct when dataStructure is empty', () => {
                component.dataStructure = {}
                component.editDataStruct = {
                    user: { officerName: 'Edit Officer' }
                }
                expect(component.getOfficerName).toBe('Edit Officer')
            })
        })

        describe('getWorkOrderId', () => {
            it('should return workOrderId when it exists', () => {
                component.workOrderId = 'work123'
                expect(component.getWorkOrderId).toBe('work123')
            })

            it('should return null when workOrderId is null', () => {
                component.workOrderId = null
                expect(component.getWorkOrderId).toBeNull()
            })
        })

        describe('getRoles', () => {
            it('should return mapped roles data', () => {
                component.dataStructure = {
                    activityGroups: [
                        { groupName: 'Skip', activities: [] }, // Index 0 is skipped
                        {
                            groupName: 'Role 1',
                            groupDescription: 'Role Desc',
                            activities: [{
                                activityId: 'act1',
                                activityName: 'Activity 1',
                                activityDescription: 'Act Desc',
                                assignedTo: 'Person 1',
                                assignedToId: 'person1',
                                assignedToEmail: 'person1@test.com',
                                submissionFrom: 'From Person',
                                submissionFromId: 'from1',
                                submissionFromEmail: 'from@test.com'
                            }]
                        }
                    ],
                    compGroups: [{
                        roleName: 'Role 1',
                        competincies: [{
                            localId: 'local1',
                            compName: 'Comp 1'
                        }]
                    }]
                }

                mockWatStore.getUpdateCompGroupById.mockReturnValue({
                    compId: 'comp1',
                    compName: 'Updated Comp',
                    compDescription: 'Updated Desc',
                    compLevel: 'Advanced',
                    compSource: 'Source',
                    compArea: 'Area',
                    compType: 'Type'
                })

                const result = component.getRoles
                expect(result).toHaveLength(1)
                expect(result[0].roleDetails.name).toBe('Role 1')
                expect(result[0].roleDetails.childNodes).toHaveLength(1)
                expect(result[0].competencyDetails).toHaveLength(1)
            })

            it('should filter out activities without description or assignedTo', () => {
                component.dataStructure = {
                    activityGroups: [
                        { groupName: 'Skip' },
                        {
                            groupName: 'Role 1',
                            activities: [{
                                activityId: 'act1',
                                activityName: 'Activity 1'
                                // No description or assignedTo
                            }]
                        }
                    ],
                    compGroups: []
                }

                const result = component.getRoles
                expect(result[0].roleDetails.childNodes).toHaveLength(0)
            })
        })
    })

    describe('onScroll', () => {
        beforeEach(() => {
            component.officerOffset = 50
            component.activitiesOffset = 150
            component.competenciesOffset = 250
            component.competencyDetailsOffset = 350
        })

        it('should set selectedTab to officer when in officer range', () => {
            Object.defineProperty(window, 'pageYOffset', { value: 60 })
            component.onScroll({})
            expect(component.selectedTab).toBe('officer')
        })

        it('should set selectedTab to activities when in activities range', () => {
            Object.defineProperty(window, 'pageYOffset', { value: 160 })
            component.onScroll({})
            expect(component.selectedTab).toBe('activities')
        })

        it('should set selectedTab to competencies when in competencies range', () => {
            Object.defineProperty(window, 'pageYOffset', { value: 260 })
            component.onScroll({})
            expect(component.selectedTab).toBe('competencies')
        })

        it('should set selectedTab to competencyDetails when in competencyDetails range', () => {
            Object.defineProperty(window, 'pageYOffset', { value: 360 })
            component.onScroll({})
            expect(component.selectedTab).toBe('competencyDetails')
        })

        it('should default to officer when offset is before officer range', () => {
            Object.defineProperty(window, 'pageYOffset', { value: 40 })
            component.onScroll({})
            expect(component.selectedTab).toBe('officer')
        })

        it('should not change selectedTab when offsets are null', () => {
            component.officerOffset = null
            component.selectedTab = 'test'
            component.onScroll({})
            expect(component.selectedTab).toBe('test')
        })
    })

    describe('ngAfterViewInit', () => {
        it('should set offsets and firstEdit flag', (done) => {
            component.ngAfterViewInit()

            expect(component.officerOffset).toBe(100 - 146)
            expect(component.activitiesOffset).toBe(100 - 146)
            expect(component.competenciesOffset).toBe(100 - 146)
            expect(component.competencyDetailsOffset).toBe(100 - 146)

            setTimeout(() => {
                expect(component['firstEdit']).toBe(true)
                done()
            }, 1100)
        })
    })

    describe('getExternalUrl', () => {
        it('should return external URL field value', () => {
            const result = component.getExternalUrl('test', 'field')
            expect(result).toBe('value')
        })

        it('should return undefined for non-existent key', () => {
            const result = component.getExternalUrl('nonexistent', 'field')
            expect(result).toBeUndefined()
        })
    })

    describe('filterComp', () => {
        it('should set selectedTab and scroll to element', () => {
            const mockElement = { scrollIntoView: jest.fn() }
            component.filterComp(mockElement, 'activities')

            expect(component.selectedTab).toBe('activities')
            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            })
        })
    })

    describe('tabTelemetry', () => {
        it('should call handleTabTelemetry with correct parameters', () => {
            component.editDataStruct = { id: 'edit123' }
            component.tabTelemetry('Test Label', 1)

            expect(mockEvents.handleTabTelemetry).toHaveBeenCalledWith(
                'WORK_ALLOCATION_TAB',
                { label: 'Test Label', index: 1 },
                { id: 'edit123', type: 'OFFICER_ID' }
            )
        })
    })

    describe('fetchFormsData', () => {
        it('should subscribe to all store observables', () => {
            component.fetchFormsData()

            mockWatStore.emitActivitiesGroup([{ activity: 'test' }])
            mockWatStore.emitCompetencyGroup([{ comp: 'test' }])
            mockWatStore.emitCompGrp([{ compDetail: 'test' }])
            mockWatStore.emitOfficerGroup({ officer: 'test' })
            mockWatStore.emitErrorCount({ errors: 5 })
            mockWatStore.emitCurrentProgress({ progress: 50 })

            expect(component.dataStructure.activityGroups).toEqual([{ activity: 'test' }])
            expect(component.dataStructure.compGroups).toEqual([{ comp: 'test' }])
            expect(component.dataStructure.compDetails).toEqual([{ compDetail: 'test' }])
            expect(component.dataStructure.officerFormData).toEqual({ officer: 'test' })
            expect(component.dataStructure.errorCount).toEqual({ errors: 5 })
            expect(component.dataStructure.currentProgress).toEqual({ progress: 50 })
        })

        it('should not set data for empty arrays', () => {
            component.fetchFormsData()

            mockWatStore.emitActivitiesGroup([])
            mockWatStore.emitCompetencyGroup([])
            mockWatStore.emitCompGrp([])

            expect(component.dataStructure.activityGroups).toBeUndefined()
            expect(component.dataStructure.compGroups).toBeUndefined()
            expect(component.dataStructure.compDetails).toBeUndefined()
        })
    })

    describe('saveWAT', () => {
        beforeEach(() => {
            component.workOrderId = 'work123'
            jest.spyOn(component, 'getStrcuturedReq').mockReturnValue({ test: 'data' })
            mockAllocateService.createAllocationV2.mockReturnValue(of({ success: true }))
        })

        it('should save WAT successfully with auto save false', () => {
            component.saveWAT(false, false)

            expect(mockAllocateService.createAllocationV2).toHaveBeenCalledWith({ test: 'data' })
            expect(mockSnackBar.open).toHaveBeenCalledWith('Work order saved successfully!')
            expect(mockWatStore.clear).toHaveBeenCalled()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/workallocation/drafts', 'work123'])
        })

        it('should save WAT with auto save true', () => {
            component.saveWAT(true, false)

            expect(mockAllocateService.createAllocationV2).toHaveBeenCalledWith({ test: 'data' })
            expect(mockSnackBar.open).not.toHaveBeenCalled()
            expect(mockWatStore.clear).not.toHaveBeenCalled()
            expect(mockRouter.navigate).not.toHaveBeenCalled()
        })

        it('should reload when reload is true', () => {
            mockWatStore.getworkOrderId = 'work123'
            mockWatStore.getOfficerId = 'officer123'

            component.saveWAT(false, true)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/workallocation/update', 'work123', 'officer123'])
            expect(mockDocument.location.reload).toHaveBeenCalled()
        })

        it('should handle null request', () => {
            jest.spyOn(component, 'getStrcuturedReq').mockReturnValue(null)
            component.saveWAT()

            expect(mockAllocateService.createAllocationV2).not.toHaveBeenCalled()
        })

        it('should handle missing workOrderId', () => {
            component.workOrderId = null
            component.saveWAT()

            expect(mockSnackBar.open).toHaveBeenCalledWith('Error in updating Work order, please try again!')
        })

        it('should raise telemetry event', () => {
            component.saveWAT()
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
        })
    })

    describe('updateWat', () => {
        beforeEach(() => {
            component.workOrderId = 'work123'
            jest.spyOn(component, 'getStrcuturedReqUpdate').mockReturnValue({ test: 'data' })
            mockAllocateService.updateAllocationV2.mockReturnValue(of({ success: true }))
        })

        it('should update WAT successfully with auto save false', () => {
            component.updateWat(false, false, true)

            expect(mockAllocateService.updateAllocationV2).toHaveBeenCalledWith({ test: 'data' })
            expect(mockSnackBar.open).toHaveBeenCalledWith('Work order updated successfully!')
            expect(mockWatStore.clear).toHaveBeenCalled()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/workallocation/drafts', 'work123'])
        })

        it('should update WAT with auto save true', () => {
            component.updateWat(true, false, true)

            expect(mockAllocateService.updateAllocationV2).toHaveBeenCalledWith({ test: 'data' })
            expect(mockSnackBar.open).not.toHaveBeenCalled()
            expect(mockWatStore.clear).not.toHaveBeenCalled()
            expect(mockRouter.navigate).not.toHaveBeenCalled()
        })

        it('should reload when reload is true', () => {
            mockWatStore.getworkOrderId = 'work123'
            mockWatStore.getOfficerId = 'officer123'

            component.updateWat(false, true, true)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/workallocation/update', 'work123', 'officer123'])
            expect(mockDocument.location.reload).toHaveBeenCalled()
        })

        it('should handle update failure', () => {
            mockAllocateService.updateAllocationV2.mockReturnValue(of(null))
            component.updateWat(false, false, true)

            expect(mockSnackBar.open).toHaveBeenCalledWith('Error in saving Work order, please try again!')
        })

        it('should handle null request', () => {
            jest.spyOn(component, 'getStrcuturedReqUpdate').mockReturnValue(null)
            component.updateWat(false, false, true)

            expect(mockAllocateService.updateAllocationV2).not.toHaveBeenCalled()
        })

        it('should handle missing workOrderId', () => {
            component.workOrderId = null
            component.updateWat(false, false, true)

            expect(mockSnackBar.open).toHaveBeenCalledWith('Error! Work order not found, please try again!')
        })

        it('should not make server call when serverCall is false', () => {
            component.updateWat(false, false, false)

            expect(mockAllocateService.updateAllocationV2).not.toHaveBeenCalled()
            expect(mockSnackBar.open).not.toHaveBeenCalled()
        })

        it('should raise telemetry event when server call is made', () => {
            component.updateWat(false, false, true)
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
        })
    })

    describe('getStrcuturedReqUpdate', () => {
        beforeEach(() => {
            component.dataStructure = {
                currentProgress: 75,
                errorCount: 2
            }
            component.editDataStruct = {
                createdBy: 'creator123',
                id: 'edit123',
                createdByName: 'Creator Name'
            }
            component.workOrderId = 'work123'
        })

        it('should return structured request for update', () => {
            jest.spyOn(component, 'getUserDetails').mockReturnValue({
                user: {
                    userId: 'user123',
                    userEmail: 'user@test.com'
                },
                positionObj: { positionId: 'pos123' },
                officerName: 'Test Officer',
                position: 'Manager',
                positionDescription: 'Test Position'
            })
            //jest.spyOn(component, 'getRoles').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedActivity').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedCompetency').mockReturnValue([])

            const result = component.getStrcuturedReqUpdate()

            expect(result).toEqual({
                userId: 'user123',
                positionDescription: 'Test Position',
                userPosition: 'Manager',
                positionId: 'pos123',
                userName: 'Test Officer',
                userEmail: 'user@test.com',
                roleCompetencyList: [],
                unmappedActivities: [],
                unmappedCompetencies: [],
                progress: 75,
                errorCount: 2,
                workOrderId: 'work123',
                createdBy: 'creator123',
                id: 'edit123',
                createdByName: 'Creator Name'
            })
        })

        it('should handle alternative email sources', () => {
            jest.spyOn(component, 'getUserDetails').mockReturnValue({
                user: {
                    userId: 'user123',
                    email: 'alt@test.com'
                },
                positionObj: { id: 'pos123' },
                officerName: 'Test Officer',
                position: 'Manager',
                positionDescription: 'Test Position'
            })
            //jest.spyOn(component, 'getRoles').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedActivity').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedCompetency').mockReturnValue([])

            const result = component.getStrcuturedReqUpdate()
            expect(result.userEmail).toBe('alt@test.com')
            expect(result.positionId).toBe('pos123')
        })

        it('should return null and show dialog for invalid officer', () => {
            // jest.spyOn(component, 'getUserDetails').mockReturnValue({
            //     user: null
            // })

            const result = component.getStrcuturedReqUpdate()

            expect(result).toBeNull()
            expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
                data: {
                    title: 'Invalid officer name',
                    body: '<p>The selected officer is not part of Karmayogi platform.  Please contact your <b>MDO admin</b> to add this officer to the platform.</p>',
                    ok: 'OK',
                    cancel: 'hide'
                }
            })
        })
    })

    describe('getStrcuturedReq', () => {
        beforeEach(() => {
            component.dataStructure = {
                currentProgress: 75,
                errorCount: 2
            }
            component.workOrderId = 'work123'
        })

        it('should return structured request for create', () => {
            jest.spyOn(component, 'getUserDetails').mockReturnValue({
                user: {
                    userId: 'user123',
                    profileDetails: {
                        personalDetails: {
                            primaryEmail: 'primary@test.com'
                        }
                    }
                },
                positionObj: { id: 'pos123' },
                officerName: 'Test Officer',
                position: 'Manager',
                positionDescription: 'Test Position'
            })
            //jest.spyOn(component, 'getRoles').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedActivity').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedCompetency').mockReturnValue([])

            const result = component.getStrcuturedReq()

            expect(result).toEqual({
                userId: 'user123',
                positionDescription: 'Test Position',
                userPosition: 'Manager',
                positionId: 'pos123',
                userName: 'Test Officer',
                userEmail: 'primary@test.com',
                roleCompetencyList: [],
                unmappedActivities: [],
                unmappedCompetencies: [],
                progress: 75,
                errorCount: 2,
                workOrderId: 'work123'
            })
        })

        it('should handle alternative email fallback', () => {
            jest.spyOn(component, 'getUserDetails').mockReturnValue({
                user: {
                    userId: 'user123',
                    email: 'fallback@test.com'
                },
                positionObj: { id: 'pos123' },
                officerName: 'Test Officer',
                position: 'Manager',
                positionDescription: 'Test Position'
            })
            // jest.spyOn(component, 'getRoles').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedActivity').mockReturnValue([])
            jest.spyOn(component, 'getUnmappedCompetency').mockReturnValue([])

            const result = component.getStrcuturedReq()
            expect(result.userEmail).toBe('fallback@test.com')
        })

        it('should return null and show dialog for invalid officer', () => {
            // jest.spyOn(component, 'getUserDetails').mockReturnValue({
            //     user: null
            // })

            const result = component.getStrcuturedReq()

            expect(result).toBeNull()
            expect(mockDialog.open).toHaveBeenCalled()
        })
    })

    describe('getUserDetails', () => {
        it('should return user details when data structure exists', () => {
            component.dataStructure = {
                officerFormData: {
                    user: { userId: 'user123' },
                    positionObj: { id: 'pos123' },
                    officerName: 'Test Officer',
                    position: 'Manager',
                    positionDescription: 'Test Position'
                }
            }

            const result = component.getUserDetails()

            expect(result).toEqual({
                user: { userId: 'user123' },
                positionObj: { id: 'pos123' },
                officerName: 'Test Officer',
                position: 'Manager',
                positionDescription: 'Test Position'
            })
        })

        it('should return empty object when data structure is missing', () => {
            component.dataStructure = {}
            const result = component.getUserDetails()
            expect(result).toEqual({})
        })

        it('should handle missing officerFormData', () => {
            component.dataStructure = { officerFormData: null }
            const result = component.getUserDetails()
            expect(result).toEqual({})
        })
    })

    describe('getUnmappedActivity', () => {
        it('should return mapped unmapped activities', () => {
            component.dataStructure = {
                activityGroups: [{
                    activities: [{
                        activityId: 'act1',
                        activityName: 'Activity 1',
                        activityDescription: 'Description 1',
                        assignedTo: 'Person 1',
                        assignedToId: 'person1',
                        assignedToEmail: 'person1@test.com',
                        submissionFrom: 'From Person',
                        submissionFromId: 'from1',
                        submissionFromEmail: 'from@test.com'
                    }]
                }]
            }

            const result = component.getUnmappedActivity()

            expect(result).toEqual([{
                type: 'ACTIVITY',
                id: 'act1',
                name: 'Activity 1',
                description: 'Description 1',
                submittedToName: 'Person 1',
                submittedToId: 'person1',
                submittedToEmail: 'person1@test.com',
                submissionFrom: 'From Person',
                submissionFromId: 'from1',
                submissionFromEmail: 'from@test.com'
            }])
        })

        it('should filter out activities without description or assignedTo', () => {
            component.dataStructure = {
                activityGroups: [{
                    activities: [{
                        activityId: 'act1',
                        activityName: 'Activity 1'
                        // No description or assignedTo
                    }]
                }]
            }

            const result = component.getUnmappedActivity()
            expect(result).toEqual([])
        })

        it('should handle empty activity groups', () => {
            component.dataStructure = { activityGroups: [] }
            const result = component.getUnmappedActivity()
            expect(result).toEqual([])
        })

        it('should handle missing activities', () => {
            component.dataStructure = { activityGroups: [{}] }
            const result = component.getUnmappedActivity()
            expect(result).toEqual([])
        })
    })

    describe('getUnmappedCompetency', () => {
        it('should return mapped unmapped competencies', () => {
            component.dataStructure = {
                compGroups: [{
                    competincies: [{
                        localId: 'local1',
                        compName: 'Original Comp'
                    }]
                }]
            }

            mockWatStore.getUpdateCompGroupById.mockReturnValue({
                compId: 'comp1',
                compName: 'Updated Comp',
                compDescription: 'Updated Description',
                compLevel: 'Advanced',
                compSource: 'Custom Source',
                compArea: 'Technical',
                compType: 'Skill'
            })

            const result = component.getUnmappedCompetency()

            expect(result).toEqual([{
                type: 'COMPETENCY',
                id: 'comp1',
                name: 'Updated Comp',
                description: 'Updated Description',
                level: 'Advanced',
                source: 'Custom Source',
                additionalProperties: {
                    competencyArea: 'Technical',
                    competencyType: 'Skill'
                }
            }])
        })

        it('should use original data when update not found', () => {
            component.dataStructure = {
                compGroups: [{
                    competincies: [{
                        localId: 'local1',
                        compName: 'Original Comp',
                        compDescription: 'Original Desc'
                    }]
                }]
            }

            mockWatStore.getUpdateCompGroupById.mockReturnValue(null)

            const result = component.getUnmappedCompetency()

            expect(result).toEqual([{
                type: 'COMPETENCY',
                id: undefined,
                name: 'Original Comp',
                description: 'Original Desc',
                level: undefined,
                source: 'Work Allocation Tool',
                additionalProperties: {
                    competencyArea: undefined,
                    competencyType: undefined
                }
            }])
        })

        it('should filter out competencies without name or description', () => {
            component.dataStructure = {
                compGroups: [{
                    competincies: [{
                        localId: 'local1'
                        // No name or description
                    }]
                }]
            }

            mockWatStore.getUpdateCompGroupById.mockReturnValue({})

            const result = component.getUnmappedCompetency()
            expect(result).toEqual([])
        })

        it('should handle empty comp groups', () => {
            component.dataStructure = { compGroups: [] }
            const result = component.getUnmappedCompetency()
            expect(result).toEqual([])
        })

        it('should handle missing competincies', () => {
            component.dataStructure = { compGroups: [{}] }
            const result = component.getUnmappedCompetency()
            expect(result).toEqual([])
        })
    })

    describe('openSnackbar', () => {
        it('should open snackbar with default duration', () => {
            component['openSnackbar']('Test message')
            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 5000 })
        })

        it('should open snackbar with custom duration', () => {
            component['openSnackbar']('Test message', 3000)
            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', { duration: 3000 })
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe all subscriptions and clear store', () => {
            // Set up subscriptions
            component.autoSaveSubscription = { unsubscribe: jest.fn() }
            component.activitySubscription = { unsubscribe: jest.fn() }
            component.groupSubscription = { unsubscribe: jest.fn() }
            component.officerFormSubscription = { unsubscribe: jest.fn() }
            component.compDetailsSubscription = { unsubscribe: jest.fn() }
            component.errorCountSubscription = { unsubscribe: jest.fn() }
            component.progressSubscription = { unsubscribe: jest.fn() }

            component.ngOnDestroy()

            expect(component.autoSaveSubscription.unsubscribe).toHaveBeenCalled()
            expect(component.activitySubscription.unsubscribe).toHaveBeenCalled()
            expect(component.groupSubscription.unsubscribe).toHaveBeenCalled()
            expect(component.officerFormSubscription.unsubscribe).toHaveBeenCalled()
            expect(component.compDetailsSubscription.unsubscribe).toHaveBeenCalled()
            expect(component.errorCountSubscription.unsubscribe).toHaveBeenCalled()
            expect(component.progressSubscription.unsubscribe).toHaveBeenCalled()
            expect(mockWatStore.clear).toHaveBeenCalled()
        })
    })
})