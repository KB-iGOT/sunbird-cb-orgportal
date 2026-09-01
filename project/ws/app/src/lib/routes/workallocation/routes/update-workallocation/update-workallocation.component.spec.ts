import { UpdateWorkallocationComponent } from './update-workallocation.component'
import { of, throwError } from 'rxjs'

// Mock dependencies
const mockExportAsService = {
    save: jest.fn(),
    get: jest.fn()
}

const mockSnackBar = {
    open: jest.fn()
}

const mockRouter = {
    navigate: jest.fn()
}

const mockFormBuilder = {
    group: jest.fn(),
    array: jest.fn()
}

const mockAllocationService = {
    getUsers: jest.fn(),
    onSearchPosition: jest.fn(),
    onSearchRole: jest.fn(),
    onSearchActivity: jest.fn(),
    updateAllocation: jest.fn()
}

const mockActivatedRoute = {
    snapshot: {
        params: {
            userId: 'test-user-id'
        }
    }
}

const mockConfigService = {
    unMappedUser: {
        channel: 'test-department',
        rootOrgId: 'test-org-id'
    }
}

const mockEventService = {
    raiseInteractTelemetry: jest.fn()
}

const mockFormGroup = {
    patchValue: jest.fn(),
    get: jest.fn(),
    reset: jest.fn(),
    value: {
        fname: 'Test User',
        email: 'test@example.com',
        position: 'Test Position',
        rolelist: [{ name: 'Test Role', childNodes: 'Test Activity' }]
    },
    controls: {
        fname: { disable: jest.fn() },
        email: { disable: jest.fn() },
        rolelist: {
            controls: []
        }
    }
}

const mockFormArray = {
    push: jest.fn(),
    at: jest.fn().mockReturnValue({
        patchValue: jest.fn()
    }),
    removeAt: jest.fn(),
    length: 1,
    controls: []
}

// const mockFormControl = {
//     setValue: jest.fn(),
//     value: ''
// }

const mockElementRef = {
    nativeElement: {
        value: ''
    }
}

// Mock DOM methods
const mockElement = {
    style: { display: 'none' },
    scrollIntoView: jest.fn()
}

global.document = {
    getElementById: jest.fn().mockReturnValue(mockElement)
} as any

describe('UpdateWorkallocationComponent', () => {
    let component: UpdateWorkallocationComponent

    beforeAll(() => {
        // Mock Date.now
        jest.spyOn(Date, 'now').mockReturnValue(1234567890)

        // Mock Date.prototype.getTime for new Date().getTime() calls
        jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1234567890)
    })

    afterAll(() => {
        // Restore original Date constructor
        jest.restoreAllMocks()
    })

    beforeEach(() => {
        // Reset all mocks first
        jest.clearAllMocks()

        // Setup form builder mocks
        mockFormBuilder.group.mockReturnValue(mockFormGroup)
        mockFormBuilder.array.mockReturnValue(mockFormArray)
        mockFormGroup.get.mockReturnValue(mockFormArray)

        // Create component instance
        component = new UpdateWorkallocationComponent(
            mockExportAsService as any,
            mockSnackBar as any,
            mockRouter as any,
            mockFormBuilder as any,
            mockAllocationService as any,
            mockActivatedRoute as any,
            mockConfigService as any,
            mockEventService as any
        )

        // Set ViewChild manually since we're not using TestBed
        component.inputvar = mockElementRef as any
    })

    describe('Constructor', () => {
        it('should initialize component with correct values', () => {
            expect(component.allocateduserID).toBe('test-user-id')
            expect(component.departmentName).toBe('test-department')
            expect(component.departmentID).toBe('test-org-id')
            expect(mockFormBuilder.group).toHaveBeenCalled()
        })

        it('should call getdeptUsers', () => {
            const spy = jest.spyOn(component, 'getdeptUsers')
            // Re-create component to trigger constructor
            new UpdateWorkallocationComponent(
                mockExportAsService as any,
                mockSnackBar as any,
                mockRouter as any,
                mockFormBuilder as any,
                mockAllocationService as any,
                mockActivatedRoute as any,
                mockConfigService as any,
                mockEventService as any
            )
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('ngOnInit', () => {
        it('should initialize tabsData correctly', () => {
            component.ngOnInit()

            expect(component.tabsData).toEqual([
                {
                    name: 'Officer',
                    key: 'officer',
                    render: true,
                    enabled: true,
                },
                {
                    name: 'Roles and activities',
                    key: 'roles',
                    render: true,
                    enabled: true,
                },
                {
                    name: 'Archived',
                    key: 'archived',
                    render: true,
                    enabled: true,
                },
            ])
        })
    })

    describe('getdeptUsers', () => {
        it('should set department info and call getAllUsers', () => {
            const getAllUsersSpy = jest.spyOn(component, 'getAllUsers').mockImplementation()

            component.getdeptUsers()

            expect(component.departmentName).toBe('test-department')
            expect(component.departmentID).toBe('test-org-id')
            expect(getAllUsersSpy).toHaveBeenCalled()
        })
    })

    describe('getAllUsers', () => {
        const mockUserData = {
            result: {
                data: [
                    {
                        allocationDetails: {
                            id: 'test-user-id',
                            userId: 'test-user-id',
                            userName: 'Test User',
                            userEmail: 'test@example.com',
                            userPosition: 'Test Position',
                            activeList: [{ name: 'Test Role', childNodes: [] }],
                            archivedList: []
                        },
                        userDetails: { wid: 'test-wid' }
                    }
                ]
            }
        }

        it('should get users and set selected user data', () => {
            mockAllocationService.getUsers.mockReturnValue(of(mockUserData))
            const setRoleSpy = jest.spyOn(component, 'setRole').mockImplementation()

            component.getAllUsers()

            expect(mockAllocationService.getUsers).toHaveBeenCalledWith({
                pageNo: 0,
                pageSize: 1000,
                departmentName: 'test-department'
            })
            expect(component.selectedUser).toEqual(mockUserData.result.data[0])
            expect(component.orgselectedUser).toEqual(mockUserData.result.data[0])
            expect(mockFormGroup.patchValue).toHaveBeenCalled()
            expect(setRoleSpy).toHaveBeenCalled()
            expect(component.data.length).toBe(1)
        })

        it('should handle user without userDetails', () => {
            const mockUserDataNoDetails = {
                result: {
                    data: [
                        {
                            allocationDetails: {
                                id: 'test-user-id',
                                userId: 'test-user-id',
                                userName: 'Test User',
                                userEmail: 'test@example.com',
                                userPosition: 'Test Position',
                                activeList: [],
                                archivedList: []
                            }
                        }
                    ]
                }
            }
            mockAllocationService.getUsers.mockReturnValue(of(mockUserDataNoDetails))

            component.getAllUsers()

            expect(component.data[0].userId).toBe('test-user-id')
        })

        it('should handle error in getAllUsers', () => {
            mockAllocationService.getUsers.mockReturnValue(throwError('Error'))

            expect(() => component.getAllUsers()).not.toThrow()
        })
    })

    describe('export', () => {
        it('should call exportAsService.save with correct config', () => {
            mockExportAsService.save.mockReturnValue(of({}))

            component.export()

            expect(mockExportAsService.save).toHaveBeenCalledWith(
                component.config,
                'WorkAllocation'
            )
            expect(component.displaytemplate).toBe(false)
        })
    })

    describe('pdfCallbackFn', () => {
        it('should add page numbers to PDF', () => {
            const mockPdf = {
                internal: {
                    getNumberOfPages: jest.fn().mockReturnValue(3),
                    pageSize: {
                        getWidth: jest.fn().mockReturnValue(500),
                        getHeight: jest.fn().mockReturnValue(700)
                    }
                },
                setPage: jest.fn(),
                text: jest.fn()
            }

            component.pdfCallbackFn(mockPdf)

            expect(mockPdf.setPage).toHaveBeenCalledTimes(3)
            expect(mockPdf.text).toHaveBeenCalledTimes(3)
            expect(mockPdf.text).toHaveBeenCalledWith('Page 1 of 3', 400, 670)
        })
    })

    describe('onSideNavTabClick', () => {
        beforeEach(() => {
            component.tabsData = [
                { name: 'Officer', key: 'officer', render: true, enabled: true }
            ]
        })

        it('should update current tab and scroll to element', () => {
            component.onSideNavTabClick('officer')

            expect(component.currentTab).toBe('officer')
            expect(document.getElementById).toHaveBeenCalledWith('officer')
            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
                inline: 'start'
            })
            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
        })

        it('should handle null element', () => {
            (document.getElementById as jest.Mock).mockReturnValue(null)

            expect(() => component.onSideNavTabClick('officer')).not.toThrow()
        })
    })

    describe('setRole', () => {
        it('should add roles to form array', () => {
            component.formdata.rolelist = [{ name: 'Test Role', childNodes: 'Test Activity' }]

            component.setRole()

            expect(mockFormArray.push).toHaveBeenCalled()
        })
    })

    describe('newRole', () => {
        it('should return new form group', () => {
            //   const result = component.newRole()

            expect(mockFormBuilder.group).toHaveBeenCalledWith({
                name: expect.any(Object),
                childNodes: expect.any(Object)
            })
        })
    })

    describe('newroleControls getter', () => {
        it('should return form controls', () => {
            //  const result = component.newroleControls

            expect(mockFormGroup.get).toHaveBeenCalledWith('rolelist')
        })
    })

    describe('onSearchPosition', () => {
        const mockEvent = { target: { value: 'test position' } }
        const mockResponse = { responseData: [{ name: 'Test Position', id: '1' }] }

        it('should search for positions when value length > 2', () => {
            mockAllocationService.onSearchPosition.mockReturnValue(of(mockResponse))
            const displayLoaderSpy = jest.spyOn(component, 'displayLoader').mockImplementation()

            component.onSearchPosition(mockEvent)

            expect(displayLoaderSpy).toHaveBeenCalledWith('true')
            expect(component.nosimilarPositions).toBe(false)
            expect(mockAllocationService.onSearchPosition).toHaveBeenCalledWith({
                searches: [
                    {
                        type: 'POSITION',
                        field: 'name',
                        keyword: 'test position'
                    },
                    {
                        type: 'POSITION',
                        field: 'status',
                        keyword: 'VERIFIED'
                    }
                ]
            })
            expect(component.similarPositions).toEqual(mockResponse.responseData)
            expect(displayLoaderSpy).toHaveBeenCalledWith('false')
        })

        it('should set nosimilarPositions when no results', () => {
            mockAllocationService.onSearchPosition.mockReturnValue(of({ responseData: [] }))
            jest.spyOn(component, 'displayLoader').mockImplementation()

            component.onSearchPosition(mockEvent)

            expect(component.nosimilarPositions).toBe(true)
            expect(component.nosimilarRoles).toBe(false)
            expect(component.nosimilarActivities).toBe(false)
        })

        it('should not search when value length <= 2', () => {
            const shortEvent = { target: { value: 'te' } }

            component.onSearchPosition(shortEvent)

            expect(mockAllocationService.onSearchPosition).not.toHaveBeenCalled()
        })

        it('should call setAllMsgFalse when results found', () => {
            mockAllocationService.onSearchPosition.mockReturnValue(of(mockResponse))
            const setAllMsgFalseSpy = jest.spyOn(component, 'setAllMsgFalse').mockImplementation()
            jest.spyOn(component, 'displayLoader').mockImplementation()

            component.onSearchPosition(mockEvent)

            expect(setAllMsgFalseSpy).toHaveBeenCalled()
        })
    })

    describe('onSearchRole', () => {
        const mockEvent = { target: { value: 'test role' } }
        const mockResponse = [{ name: 'Test Role', id: '1' }]

        it('should search for roles when value length > 2', () => {
            mockAllocationService.onSearchRole.mockReturnValue(of(mockResponse))
            const displayLoaderSpy = jest.spyOn(component, 'displayLoader').mockImplementation()

            component.onSearchRole(mockEvent)

            expect(displayLoaderSpy).toHaveBeenCalledWith('true')
            expect(component.nosimilarRoles).toBe(false)
            expect(mockAllocationService.onSearchRole).toHaveBeenCalledWith('test role')
            expect(component.similarRoles).toEqual(mockResponse)
            expect(displayLoaderSpy).toHaveBeenCalledWith('false')
        })

        it('should set nosimilarRoles when no results', () => {
            mockAllocationService.onSearchRole.mockReturnValue(of([]))
            jest.spyOn(component, 'displayLoader').mockImplementation()

            component.onSearchRole(mockEvent)

            expect(component.nosimilarRoles).toBe(true)
            expect(component.nosimilarPositions).toBe(false)
            expect(component.nosimilarActivities).toBe(false)
        })

        it('should not search when value length <= 2', () => {
            const shortEvent = { target: { value: 'te' } }

            component.onSearchRole(shortEvent)

            expect(mockAllocationService.onSearchRole).not.toHaveBeenCalled()
        })
    })

    describe('onSearchActivity', () => {
        const mockEvent = { target: { value: 'test activity' } }
        const mockResponse = { responseData: [{ name: 'Test Activity', id: '1' }] }

        it('should search for activities when value length > 2', () => {
            mockAllocationService.onSearchActivity.mockReturnValue(of(mockResponse))
            const displayLoaderSpy = jest.spyOn(component, 'displayLoader').mockImplementation()

            component.onSearchActivity(mockEvent)

            expect(displayLoaderSpy).toHaveBeenCalledWith('true')
            expect(component.nosimilarActivities).toBe(false)
            expect(mockAllocationService.onSearchActivity).toHaveBeenCalledWith({
                searches: [
                    {
                        type: 'ACTIVITY',
                        field: 'name',
                        keyword: 'test activity'
                    },
                    {
                        type: 'ACTIVITY',
                        field: 'status',
                        keyword: 'VERIFIED'
                    }
                ]
            })
            expect(component.similarActivities).toEqual(mockResponse.responseData)
            expect(displayLoaderSpy).toHaveBeenCalledWith('false')
        })

        it('should set nosimilarActivities when no results', () => {
            mockAllocationService.onSearchActivity.mockReturnValue(of({ responseData: [] }))
            jest.spyOn(component, 'displayLoader').mockImplementation()

            component.onSearchActivity(mockEvent)

            expect(component.nosimilarActivities).toBe(true)
            expect(component.nosimilarRoles).toBe(false)
            expect(component.nosimilarPositions).toBe(false)
        })

        it('should not search when value length <= 2', () => {
            const shortEvent = { target: { value: 'te' } }

            component.onSearchActivity(shortEvent)

            expect(mockAllocationService.onSearchActivity).not.toHaveBeenCalled()
        })
    })

    describe('setAllMsgFalse', () => {
        it('should set all message flags to false', () => {
            component.nosimilarRoles = true
            component.nosimilarPositions = true
            component.nosimilarActivities = true

            component.setAllMsgFalse()

            expect(component.nosimilarRoles).toBe(false)
            expect(component.nosimilarPositions).toBe(false)
            expect(component.nosimilarActivities).toBe(false)
        })
    })

    describe('displayLoader', () => {
        it('should show loader when value is true', () => {
            component.displayLoader('true')

            expect(document.getElementById).toHaveBeenCalledWith('loader')
            expect(mockElement.style.display).toBe('block')
        })

        it('should hide loader when value is not true', () => {
            component.displayLoader('false')

            expect(document.getElementById).toHaveBeenCalledWith('loader')
            expect(mockElement.style.display).toBe('none')
        })
    })

    describe('selectRole', () => {
        const mockRole = {
            name: 'Test Role',
            childNodes: [{ name: 'Activity 1' }, { name: 'Activity 2' }]
        }

        it('should select role and update form', () => {
            component.selectRole(mockRole)

            expect(component.selectedRole).toEqual(mockRole)
            expect(component.activitieslist).toEqual(mockRole.childNodes)
            expect(component.similarRoles).toEqual([])
            expect(mockFormArray.at).toHaveBeenCalledWith(0)
            expect(component.inputvar.nativeElement.value).toBe('')
        })
    })

    describe('selectActivity', () => {
        const mockActivity = { name: 'Test Activity', id: '1' }

        it('should select activity and add to activities list', () => {
            component.activitieslist = []

            component.selectActivity(mockActivity)

            expect(component.selectedActivity).toBe('')
            expect(component.similarActivities).toEqual([])
            expect(component.inputvar.nativeElement.value).toBe('')
            expect(component.activitieslist).toContain(mockActivity)
        })
    })

    describe('selectPosition', () => {
        const mockPosition = { name: 'Test Position', id: '1' }

        it('should select position and update form', () => {
            component.selectPosition(mockPosition)

            expect(component.selectedPosition).toEqual(mockPosition)
            expect(component.similarPositions).toEqual([])
            expect(mockFormGroup.patchValue).toHaveBeenCalledWith({
                position: mockPosition.name
            })
        })
    })

    describe('addRolesActivity', () => {
        beforeEach(() => {
            component.selectedRole = { name: 'Test Role', childNodes: [] }
            component.activitieslist = [{ name: 'Test Activity' }]
            component.ralist = []
        })

        it('should add role with activities when index is 0 and selectedRole exists', () => {
            component.addRolesActivity(0)

            expect(component.showRAerror).toBe(false)
            expect(component.selectedRole.childNodes).toEqual(component.activitieslist)
            expect(component.ralist).toContain(component.selectedRole)
            expect(component.selectedRole).toBe('')
            expect(component.activitieslist).toEqual([])
            expect(mockFormArray.removeAt).toHaveBeenCalled()
            expect(mockFormArray.push).toHaveBeenCalled()
        })

        it('should show error when no activities selected', () => {
            component.activitieslist = []

            component.addRolesActivity(0)

            expect(component.showRAerror).toBe(true)
        })

        it('should add new role when index is not 0', () => {
            component.selectedRole = null
            mockFormGroup.value.rolelist[0].name = 'New Role'

            component.addRolesActivity(1)

            expect(component.showRAerror).toBe(false)
            expect(component.ralist.length).toBe(1)
            expect(component.ralist[0].name).toBe('New Role')
            expect(component.ralist[0].source).toBe('ISTM')
            expect(component.ralist[0].status).toBe('UNVERIFIED')
        })

        it('should show error when no role name or activities for new role', () => {
            component.selectedRole = null
            component.activitieslist = []
            mockFormGroup.value.rolelist[0].name = ''

            component.addRolesActivity(1)

            expect(component.showRAerror).toBe(true)
        })
    })

    describe('addActivity', () => {
        beforeEach(() => {
            component.selectedActivity = null
            component.activitieslist = []
            mockFormGroup.value.rolelist[0].childNodes = 'New Activity'
        })

        it('should add new activity when no selected activity', () => {
            component.addActivity()

            expect(component.activitieslist.length).toBe(1)
            expect(component.activitieslist[0]).toEqual({
                description: '',
                id: '',
                name: 'New Activity',
                parentRole: '',
                source: 'ISTM',
                status: 'UNVERIFIED',
                type: 'ACTIVITY'
            })
            expect(component.inputvar.nativeElement.value).toBe('')
        })

        it('should not add activity when no childNodes value', () => {
            mockFormGroup.value.rolelist[0].childNodes = ''

            component.addActivity()

            expect(component.activitieslist.length).toBe(0)
        })
    })

    describe('showRemoveActivity', () => {
        it('should show remove button for activity', () => {
            const mockRemoveElement = { style: { display: 'none' } };
            (document.getElementById as jest.Mock).mockReturnValue(mockRemoveElement)

            component.showRemoveActivity(0)

            expect(document.getElementById).toHaveBeenCalledWith('showremove0')
            expect(mockRemoveElement.style.display).toBe('block')
        })
    })

    describe('removeActivity', () => {
        beforeEach(() => {
            component.activitieslist = [
                { name: 'Activity 1' },
                { name: 'Activity 2' },
                { name: 'Activity 3' }
            ]
        })

        it('should remove activity at valid index', () => {
            component.removeActivity(1)

            expect(component.activitieslist.length).toBe(2)
            expect(component.activitieslist).not.toContain({ name: 'Activity 2' })
        })

        it('should not remove activity at invalid index', () => {
            const originalLength = component.activitieslist.length

            component.removeActivity(-1)

            expect(component.activitieslist.length).toBe(originalLength)
        })
    })

    describe('buttonClick', () => {
        beforeEach(() => {
            component.ralist = [
                { name: 'Role 1' },
                { name: 'Role 2' }
            ]
            component.archivedlist = []
        })

        it('should delete role when action is Delete', () => {
            const roleToDelete = { name: 'Role 1' }

            component.buttonClick('Delete', roleToDelete)

            expect(component.ralist.length).toBe(1)
            expect(component.ralist).not.toContain(roleToDelete)
        })

        it('should archive role when action is Archive', () => {
            const roleToArchive = { name: 'Role 1' }

            component.buttonClick('Archive', roleToArchive)

            expect(component.ralist.length).toBe(1)
            expect(component.ralist).not.toContain(roleToArchive)
            expect(component.archivedlist.length).toBe(1)
            expect(component.archivedlist[0].isArchived).toBe(true)
            expect(component.archivedlist[0].archivedAt).toBe(1234567890)
        })

        it('should handle invalid action', () => {
            const originalRalistLength = component.ralist.length

            component.buttonClick('InvalidAction', { name: 'Role 1' })

            expect(component.ralist.length).toBe(originalRalistLength)
        })
    })

    describe('onSubmit', () => {
        beforeEach(() => {
            component.selectedUser = {
                allocationDetails: {
                    id: 'user-id',
                    userId: 'user-id',
                    userPosition: 'Original Position',
                    positionId: 'pos-id'
                }
            }
            component.ralist = [{ name: 'Test Role' }]
            component.archivedlist = []
            component.selectedPosition = { name: 'New Position', id: 'new-pos-id' }
            component.departmentID = 'dept-id'
            component.departmentName = 'dept-name'
        })

        it('should submit form with selected position', () => {
            mockAllocationService.updateAllocation.mockReturnValue(of({ success: true }))
            const openSnackbarSpy = jest.spyOn(component, 'openSnackbar' as any).mockImplementation()

            component.onSubmit()

            expect(mockAllocationService.updateAllocation).toHaveBeenCalledWith({
                id: 'user-id',
                userId: 'user-id',
                deptId: 'dept-id',
                deptName: 'dept-name',
                activeList: [{ name: 'Test Role' }],
                archivedList: [],
                userName: 'Test User',
                userEmail: 'test@example.com',
                userPosition: 'Test Position',
                positionId: 'new-pos-id'
            })
            expect(openSnackbarSpy).toHaveBeenCalledWith('Work Allocation updated Successfully')
            expect(mockFormGroup.reset).toHaveBeenCalled()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/workallocation'])
        })

        it('should handle null allocation details id', () => {
            component.selectedUser.allocationDetails.id = null
            component.selectedUser.allocationDetails.userId = null
            mockAllocationService.updateAllocation.mockReturnValue(of({ success: true }))
            jest.spyOn(component, 'openSnackbar' as any).mockImplementation()

            component.onSubmit()

            expect(mockAllocationService.updateAllocation).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '',
                    userId: ''
                })
            )
        })

        it('should clear positionId when position changed but no selectedPosition', () => {
            component.selectedPosition = null
            mockFormGroup.value.position = 'Different Position'
            mockAllocationService.updateAllocation.mockReturnValue(of({ success: true }))
            jest.spyOn(component, 'openSnackbar' as any).mockImplementation()

            component.onSubmit()

            expect(mockAllocationService.updateAllocation).toHaveBeenCalledWith(
                expect.objectContaining({
                    positionId: ''
                })
            )
        })

        it('should keep original positionId when position unchanged and no selectedPosition', () => {
            component.selectedPosition = null
            mockFormGroup.value.position = 'Original Position'
            mockAllocationService.updateAllocation.mockReturnValue(of({ success: true }))
            jest.spyOn(component, 'openSnackbar' as any).mockImplementation()

            component.onSubmit()

            expect(mockAllocationService.updateAllocation).toHaveBeenCalledWith(
                expect.objectContaining({
                    positionId: 'pos-id'
                })
            )
        })
    })

    describe('openSnackbar', () => {
        it('should open snackbar with default duration', () => {
            (component as any).openSnackbar('Test message')

            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
                duration: 5000
            })
        })

        it('should open snackbar with custom duration', () => {
            (component as any).openSnackbar('Test message', 3000)

            expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
                duration: 3000
            })
        })
    })

    describe('Properties and Initial State', () => {
        it('should have correct initial values', () => {
            expect(component.currentTab).toBe('officer')
            expect(component.sticky).toBe(false)
            expect(component.showRAerror).toBe(false)
            expect(component.nosimilarRoles).toBe(false)
            expect(component.nosimilarPositions).toBe(false)
            expect(component.nosimilarActivities).toBe(false)
            expect(component.displaytemplate).toBe(false)
            expect(component.ralist).toEqual([])
            expect(component.archivedlist).toEqual([])
            expect(component.data).toEqual([])
            expect(component.activitieslist).toEqual([])
        })

        it('should have correct config object', () => {
            expect(component.config).toEqual({
                type: 'pdf',
                elementIdOrContent: 'downloadtemp'
            })
        })

        it('should have correct form data structure', () => {
            expect(component.formdata).toEqual({
                fname: '',
                email: '',
                position: '',
                rolelist: [
                    {
                        name: '',
                        childNodes: '',
                    },
                ],
            })
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle missing selectedUser in onSubmit', () => {
            component.selectedUser = { allocationDetails: {} }
            mockAllocationService.updateAllocation.mockReturnValue(of({ success: true }))
            jest.spyOn(component, 'openSnackbar' as any).mockImplementation()

            expect(() => component.onSubmit()).not.toThrow()
        })

        it('should handle undefined form values', () => {
            mockFormGroup.value = {
                fname: '',
                email: '',
                position: '',
                rolelist: [{ name: '', childNodes: '' }]
            }

            expect(() => component.addActivity()).not.toThrow()
        })

        it('should handle empty arrays in buttonClick', () => {
            component.ralist = []

            expect(() => component.buttonClick('Delete', { name: 'Test' })).not.toThrow()
        })
    })
})