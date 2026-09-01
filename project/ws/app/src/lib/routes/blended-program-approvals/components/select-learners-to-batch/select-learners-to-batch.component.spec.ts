import { SelectLearnersToBatchComponent } from './select-learners-to-batch.component'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { SPACE, ENTER } from '@angular/cdk/keycodes'
import { of, throwError } from 'rxjs'
import * as _ from 'lodash'

// Mock dependencies
const mockOrgUserService = {
    getUserSearchList: jest.fn()
}

const mockContentBatchService = {
    getOrgs: jest.fn(),
    getDepartments: jest.fn(),
    validateUser: jest.fn()
}

const mockMatDialog = {
    open: jest.fn()
}

const mockEventEmitter = {
    emit: jest.fn()
}

// Mock ViewChild elements
const mockSelectElement = {
    _handleKeydown: jest.fn(),
    disabled: false,
    panelOpen: false,
    _handleOpenKeydown: jest.fn(),
    _handleClosedKeydown: jest.fn()
}

const mockSearchTextBox = {
    nativeElement: {
        focus: jest.fn(),
        value: ''
    }
}

const mockPaginator = {
    pageSize: 10,
    pageIndex: 0
}

describe('SelectLearnersToBatchComponent', () => {
    let component: SelectLearnersToBatchComponent

    beforeEach(() => {
        // Create component instance
        component = new SelectLearnersToBatchComponent(
            mockOrgUserService as any,
            mockMatDialog as any,
            mockContentBatchService as any
        )

        // Mock ViewChild properties
        component.selectOrgg = { ...mockSelectElement }
        component.selectDeptt = { ...mockSelectElement }
        component.searchTextBox = { ...mockSearchTextBox }
        component.searchDeptTextBox = { ...mockSearchTextBox }
        component.paginator = mockPaginator as any
        component.successUserData = mockEventEmitter as any

        // Initialize component properties
        component.organisationList = []
        component.departmentList = []
        component.filterOrgList = []
        component.filterDeptList = []
        component.selectedOrgData = []
        component.selectedDeptData = []
        component.globalSearchText = ''
        component.selectedLearnersList = []
        component.globalSearchData = []
        component.displayedColumns = ['select', 'fullName', 'email', 'ministry', 'mobile']
        component.dataSource = new MatTableDataSource<any>([])
        component.selection = new SelectionModel<any>(true, [])
        component.showTable = false
        component.contentMeta = {}

        // Reset all mocks
        jest.clearAllMocks()
    })

    describe('ngOnInit', () => {
        it('should initialize component correctly', () => {
            mockContentBatchService.getOrgs.mockReturnValue(of([]))

            component.ngOnInit()

            expect(component.successUserData.emit).toHaveBeenCalledWith([])
            expect(component.filterForm).toBeInstanceOf(UntypedFormGroup)
            expect(component.filterForm.get('selectedOrg')).toBeInstanceOf(UntypedFormControl)
            expect(component.filterForm.get('selectedDept')).toBeInstanceOf(UntypedFormControl)
            expect(component.filterForm.get('userType')).toBeInstanceOf(UntypedFormControl)
            expect(mockContentBatchService.getOrgs).toHaveBeenCalled()
        })

        it('should set up form validators correctly', () => {
            mockContentBatchService.getOrgs.mockReturnValue(of([]))

            component.ngOnInit()

            expect(component.filterForm.get('selectedOrg')?.hasError('required')).toBe(true)
            expect(component.filterForm.get('selectedDept')?.hasError('required')).toBe(true)
            expect(component.filterForm.get('userType')?.hasError('required')).toBe(true)
        })

        it('should configure keydown handlers for select elements', () => {
            mockContentBatchService.getOrgs.mockReturnValue(of([]))

            component.ngOnInit()

            // Test org select keydown handler
            const orgEvent = { keyCode: SPACE }
            component.selectOrgg._handleKeydown(orgEvent)
            expect(component.selectOrgg._handleOpenKeydown).not.toHaveBeenCalled()
            expect(component.selectOrgg._handleClosedKeydown).not.toHaveBeenCalled()

            // Test dept select keydown handler
            const deptEvent = { keyCode: ENTER }
            component.selectDeptt._handleKeydown(deptEvent)
            expect(component.selectDeptt._handleOpenKeydown).not.toHaveBeenCalled()
            expect(component.selectDeptt._handleClosedKeydown).not.toHaveBeenCalled()

            // Test with other key codes
            const otherEvent = { keyCode: 65 } // 'A' key
            component.selectOrgg.panelOpen = true
            component.selectOrgg._handleKeydown(otherEvent)
            expect(component.selectOrgg._handleOpenKeydown).toHaveBeenCalledWith(otherEvent)

            component.selectDeptt.panelOpen = false
            component.selectDeptt._handleKeydown(otherEvent)
            expect(component.selectDeptt._handleClosedKeydown).toHaveBeenCalledWith(otherEvent)
        })

        it('should not handle keydown when select elements are disabled', () => {
            mockContentBatchService.getOrgs.mockReturnValue(of([]))

            component.ngOnInit()

            component.selectOrgg.disabled = true
            component.selectDeptt.disabled = true

            const event = { keyCode: 65 }
            component.selectOrgg._handleKeydown(event)
            component.selectDeptt._handleKeydown(event)

            expect(component.selectOrgg._handleOpenKeydown).not.toHaveBeenCalled()
            expect(component.selectOrgg._handleClosedKeydown).not.toHaveBeenCalled()
            expect(component.selectDeptt._handleOpenKeydown).not.toHaveBeenCalled()
            expect(component.selectDeptt._handleClosedKeydown).not.toHaveBeenCalled()
        })
    })

    describe('onFilterOrg', () => {
        beforeEach(() => {
            component.organisationList = [
                { channel: 'Organization A' },
                { channel: 'Organization B' },
                { channel: 'Another Org' }
            ]
        })

        it('should filter organizations when key is not ENTER', () => {
            const event = { keyCode: 65, target: { value: 'org' } }

            component.onFilterOrg(event)

            expect(component.filterOrgList).toHaveLength(2)
            expect(component.filterOrgList[0].channel).toBe('Organization A')
            expect(component.filterOrgList[1].channel).toBe('Organization B')
        })

        it('should not filter organizations when key is ENTER', () => {
            const originalFilterList = [...component.filterOrgList]
            const event = { keyCode: ENTER, target: { value: 'org' } }

            component.onFilterOrg(event)

            expect(component.filterOrgList).toEqual(originalFilterList)
        })
    })

    describe('searchOrg', () => {
        beforeEach(() => {
            component.organisationList = [
                { channel: 'Organization A' },
                { channel: 'organization b' },
                { channel: 'Another Company' }
            ]
        })

        it('should return filtered organizations based on search value', () => {
            const result = component.searchOrg('org')

            expect(result).toHaveLength(2)
            expect(result[0].channel).toBe('Organization A')
            expect(result[1].channel).toBe('organization b')
        })

        it('should return empty array when no matches found', () => {
            const result = component.searchOrg('xyz')

            expect(result).toHaveLength(0)
        })

        it('should be case insensitive', () => {
            const result = component.searchOrg('ORG')

            expect(result).toHaveLength(2)
        })
    })

    describe('onFilterDept', () => {
        beforeEach(() => {
            component.departmentList = [
            ]
        })

        it('should filter departments when key is not ENTER', () => {
            const event: any = { keyCode: 65, target: { value: 'dept' } }

            component.onFilterDept(event)

            expect(component.filterDeptList).toHaveLength(2)
            // expect(component.filterDeptList[0].name).toBe('Department A')
            // expect(component.filterDeptList[1].name).toBe('Department B')
        })

        it('should not filter departments when key is ENTER', () => {
            const originalFilterList = [...component.filterDeptList]
            const event = { keyCode: ENTER, target: { value: 'dept' } }

            component.onFilterDept(event)

            expect(component.filterDeptList).toEqual(originalFilterList)
        })
    })

    describe('searchDept', () => {
        beforeEach(() => {
            component.departmentList = [
            ]
        })

        it('should return filtered departments based on search value', () => {
            const result = component.searchDept('dept')

            expect(result).toHaveLength(2)
            // expect(result[0].name).toBe('Department A')
            // expect(result[1].name).toBe('department b')
        })

        it('should return empty array when no matches found', () => {
            const result = component.searchDept('xyz')

            expect(result).toHaveLength(0)
        })

        it('should be case insensitive', () => {
            const result = component.searchDept('DEPT')

            expect(result).toHaveLength(2)
        })
    })

    describe('globalSearch', () => {
        beforeEach(() => {
            component.filterForm = new UntypedFormGroup({
                selectedOrg: new UntypedFormControl([]),
                selectedDept: new UntypedFormControl([]),
                userType: new UntypedFormControl(false)
            })
        })

        it('should reset form and search for users', () => {
            const mockResponse = { count: 2, content: [] }
            mockOrgUserService.getUserSearchList.mockReturnValue(of(mockResponse))
            const event = { target: { value: 'john' } }

            const resetSpy = jest.spyOn(component.filterForm, 'reset')
            const userDataToTableSpy = jest.spyOn(component, 'userDataToTable')

            component.globalSearch(event)

            expect(resetSpy).toHaveBeenCalled()
            expect(component.filterForm.get('userType')?.value).toBe(false)
            expect(component.globalSearchData).toEqual([])
            expect(mockOrgUserService.getUserSearchList).toHaveBeenCalledWith('john')
            expect(userDataToTableSpy).toHaveBeenCalledWith(mockResponse)
            expect(component.selectedDeptData).toEqual([])
            expect(component.selectedOrgData).toEqual([])
        })

        it('should not call userDataToTable when count is 0', () => {
            const mockResponse = { count: 0, content: [] }
            mockOrgUserService.getUserSearchList.mockReturnValue(of(mockResponse))
            const event = { target: { value: 'john' } }

            const userDataToTableSpy = jest.spyOn(component, 'userDataToTable')

            component.globalSearch(event)

            expect(userDataToTableSpy).not.toHaveBeenCalled()
        })
    })

    describe('userDataToTable', () => {
        it('should process user data and populate table', () => {
            const mockUserData = {
                count: 2,
                content: [
                    {
                        firstName: 'John',
                        profileDetails: {
                            personalDetails: {
                                primaryEmail: 'john@example.com',
                                mobile: '+1234567890'
                            }
                        },
                        rootOrgName: 'Test Ministry',
                        userId: 'user1'
                    },
                    {
                        firstname: 'Jane',
                        profileDetails: {
                            personalDetails: {
                                primaryEmail: 'jane@example.com'
                            }
                        },
                        rootOrgName: 'Another Ministry',
                        userId: 'user2'
                    }
                ]
            }

            component.userDataToTable(mockUserData)

            expect(component.globalSearchData).toHaveLength(2)
            expect(component.globalSearchData[0]).toEqual({
                fullName: 'John',
                email: 'john@example.com',
                mobile: '+1234567890',
                ministry: 'Test Ministry',
                status: 'Success',
                userId: 'user1'
            })
            expect(component.globalSearchData[1]).toEqual({
                fullName: 'Jane',
                email: 'jane@example.com',
                mobile: '-',
                ministry: 'Another Ministry',
                status: 'Success',
                userId: 'user2'
            })
            expect(component.dataSource.data).toEqual(component.globalSearchData)
            expect(component.showTable).toBe(true)
            expect(component.filterCount).toBe(2)
        })

        it('should handle missing mobile number', () => {
            const mockUserData = {
                count: 1,
                content: [
                    {
                        firstName: 'John',
                        profileDetails: {
                            personalDetails: {
                                primaryEmail: 'john@example.com'
                            }
                        },
                        rootOrgName: 'Test Ministry',
                        userId: 'user1'
                    }
                ]
            }

            component.userDataToTable(mockUserData)

            expect(component.globalSearchData[0].mobile).toBe('-')
        })
    })

    describe('applyTableFilter', () => {
        it('should apply filter to data source', () => {
            const event = { target: { value: '  John  ' } } as any

            component.applyTableFilter(event)

            expect(component.dataSource.filter).toBe('john')
        })
    })

    describe('getOrganisations', () => {
        it('should fetch and set organizations', () => {
            const mockOrgs = [{ orgId: '1', channel: 'Org 1' }]
            mockContentBatchService.getOrgs.mockReturnValue(of(mockOrgs))

            component.getOrganisations()

            expect(mockContentBatchService.getOrgs).toHaveBeenCalled()
            expect(component.organisationList).toEqual(mockOrgs)
            expect(component.filterOrgList).toEqual(mockOrgs)
        })
    })

    describe('getDepartments', () => {
        it('should fetch and set departments when response has content', () => {
            const mockDepts = [{ name: 'Dept 1' }]
            const mockResponse = {
                result: {
                    response: {
                        count: 1,
                        content: mockDepts
                    }
                }
            }
            mockContentBatchService.getDepartments.mockReturnValue(of(mockResponse))
            const orgId = ['org1']

            component.getDepartments(orgId)

            expect(mockContentBatchService.getDepartments).toHaveBeenCalledWith({
                request: { orgIdList: orgId }
            })
            expect(component.departmentList).toEqual(mockDepts)
            expect(component.filterDeptList).toEqual(mockDepts)
        })

        it('should set empty arrays when response has no content', () => {
            const mockResponse = {
                result: {
                    response: {
                        count: 0
                    }
                }
            }
            mockContentBatchService.getDepartments.mockReturnValue(of(mockResponse))

            component.getDepartments(['org1'])

            expect(component.departmentList).toEqual([])
            expect(component.filterDeptList).toEqual([])
        })

        it('should handle error and set empty arrays', () => {
            mockContentBatchService.getDepartments.mockReturnValue(throwError('Error'))

            component.getDepartments(['org1'])

            expect(component.departmentList).toEqual([])
            expect(component.filterDeptList).toEqual([])
        })
    })

    describe('selectOrg', () => {
        beforeEach(() => {
            component.filterForm = new UntypedFormGroup({
                selectedOrg: new UntypedFormControl([])
            })
            component.selectedOrgData = [{ orgId: 'org1' }]
        })

        it('should add organization when selected', () => {
            const event = {
                isUserInput: true,
                source: {
                    selected: true,
                    value: { orgId: 'org2', channel: 'Org 2' }
                }
            }

            component.selectOrg(event)

            expect(component.selectedOrgData).toHaveLength(2)
            expect(component.selectedOrgData[1]).toEqual({ orgId: 'org2', channel: 'Org 2' })
            expect(component.globalSearchText).toBe('')
        })

        it('should remove organization when deselected', () => {
            const event = {
                isUserInput: true,
                source: {
                    selected: false,
                    value: { orgId: 'org1' }
                }
            }

            component.selectOrg(event)

            expect(component.selectedOrgData).toHaveLength(0)
            expect(component.globalSearchText).toBe('')
        })

        it('should not process when not user input', () => {
            const originalLength = component.selectedOrgData.length
            const event = {
                isUserInput: false,
                source: {
                    selected: true,
                    value: { orgId: 'org2' }
                }
            }

            component.selectOrg(event)

            expect(component.selectedOrgData).toHaveLength(originalLength)
        })
    })

    describe('selectDepartment', () => {
        beforeEach(() => {
            component.filterForm = new UntypedFormGroup({
                selectedDept: new UntypedFormControl([])
            })
            component.selectedDeptData = [{ name: 'Dept 1' }]
        })

        it('should add department when selected', () => {
            const event = {
                isUserInput: true,
                source: {
                    selected: true,
                    value: { name: 'Dept 2' }
                }
            }

            component.selectDepartment(event)

            expect(component.selectedDeptData).toHaveLength(2)
            expect(component.selectedDeptData[1]).toEqual({ name: 'Dept 2' })
            expect(component.globalSearchText).toBe('')
        })

        it('should remove department when deselected', () => {
            const event = {
                isUserInput: true,
                source: {
                    selected: false,
                    value: { name: 'Dept 1' }
                }
            }

            component.selectDepartment(event)

            expect(component.selectedDeptData).toHaveLength(0)
            expect(component.globalSearchText).toBe('')
        })
    })

    describe('applyUserFilter', () => {
        beforeEach(() => {
            component.filterForm = new UntypedFormGroup({
                selectedOrg: new UntypedFormControl([{ orgId: 'org1' }]),
                selectedDept: new UntypedFormControl([{ name: 'Dept 1' }]),
                userType: new UntypedFormControl(true)
            })
        })

        it('should apply user filter with all parameters', () => {
            const mockResponse = {
                result: {
                    response: { count: 1, content: [] }
                }
            }
            mockContentBatchService.validateUser.mockReturnValue(of(mockResponse))
            const userDataToTableSpy = jest.spyOn(component, 'userDataToTable')

            component.applyUserFilter(5)

            const expectedRequest = {
                request: {
                    filters: {
                        rootOrgId: ['org1'],
                        status: 1,
                        'profileDetails.professionalDetails.designation': ['Dept 1'],
                        'profileDetails.verifiedKarmayogi': true
                    },
                    fields: [],
                    limit: 10,
                    offset: 5
                }
            }

            expect(mockContentBatchService.validateUser).toHaveBeenCalledWith(expectedRequest)
            expect(userDataToTableSpy).toHaveBeenCalledWith(mockResponse.result.response)
            expect(component.globalSearchText).toBe('')
        })

        it('should apply user filter without userType when false', () => {
            component.filterForm.get('userType')?.setValue(false)
            const mockResponse = {
                result: {
                    response: { count: 1, content: [] }
                }
            }
            mockContentBatchService.validateUser.mockReturnValue(of(mockResponse))

            component.applyUserFilter()

            const expectedRequest = {
                request: {
                    filters: {
                        rootOrgId: ['org1'],
                        status: 1,
                        'profileDetails.professionalDetails.designation': ['Dept 1']
                    },
                    fields: [],
                    limit: 10,
                    offset: 1
                }
            }

            expect(mockContentBatchService.validateUser).toHaveBeenCalledWith(expectedRequest)
        })
    })

    describe('checkData', () => {
        it('should open dialog with selected users data', () => {
            component.selectedLearnersList = [{ userId: 'user1', fullName: 'John' }]

            component.checkData()

            expect(mockMatDialog.open).toHaveBeenCalledWith(
                expect.anything(),
                {
                    width: '80vw',
                    height: '90vh',
                    data: {
                        userData: component.selectedLearnersList
                    }
                }
            )
        })
    })

    describe('getNext', () => {
        it('should call applyUserFilter with correct offset', () => {
            const applyUserFilterSpy = jest.spyOn(component, 'applyUserFilter')
            const event = { pageIndex: 2, pageSize: 10 }

            component.getNext(event)

            expect(applyUserFilterSpy).toHaveBeenCalledWith(20)
        })
    })

    describe('openedChange', () => {
        beforeEach(() => {
            component.departmentList = []
            component.selectedDeptData = [{ name: 'Dept A' }]
        })

        it('should focus search input and reorder list when opened', () => {
            const onFilterDeptSpy = jest.spyOn(component, 'onFilterDept')

            component.openedChange(true)

            expect(component.searchDeptTextBox.nativeElement.focus).toHaveBeenCalled()
            expect(component.searchDeptTextBox.nativeElement.value).toBe('')
            expect(onFilterDeptSpy).toHaveBeenCalledWith({
                target: { value: '' }
            })
            expect(component.departmentList[0]).toEqual({ name: 'Dept A' })
            expect(component.filterDeptList[0]).toEqual({ name: 'Dept A' })
        })

        it('should not do anything when closed', () => {
            const focusSpy = jest.spyOn(component.searchDeptTextBox.nativeElement, 'focus')

            component.openedChange(false)

            expect(focusSpy).not.toHaveBeenCalled()
        })
    })

    describe('openedChangeOrg', () => {
        beforeEach(() => {
            component.organisationList = [{ orgId: 'org1', channel: 'Org A' }, { orgId: 'org2', channel: 'Org B' }]
            component.selectedOrgData = [{ orgId: 'org1', channel: 'Org A' }]
            component.filterForm = new UntypedFormGroup({
                selectedOrg: new UntypedFormControl([{ orgId: 'org1' }])
            })
        })

        it('should focus search input and reorder list when opened', () => {
            const onFilterOrgSpy = jest.spyOn(component, 'onFilterOrg')

            component.openedChangeOrg(true)

            expect(component.searchTextBox.nativeElement.focus).toHaveBeenCalled()
            expect(component.searchTextBox.nativeElement.value).toBe('')
            expect(onFilterOrgSpy).toHaveBeenCalledWith({
                target: { value: '' }
            })
            expect(component.organisationList[0]).toEqual({ orgId: 'org1', channel: 'Org A' })
            expect(component.filterOrgList[0]).toEqual({ orgId: 'org1', channel: 'Org A' })
        })

        it('should get departments when closed', () => {
            const getDepartmentsSpy = jest.spyOn(component, 'getDepartments')

            component.openedChangeOrg(false)

            expect(component.selectedDeptData).toEqual([])
            expect(getDepartmentsSpy).toHaveBeenCalledWith(['org1'])
        })
    })

    describe('singleSelectUser', () => {
        it('should return selected users', () => {
            const mockSelected: any = [{ userId: 'user1' }]
            // component.selection.selected = mockSelected

            const result = component.singleSelectUser()

            expect(result).toEqual(mockSelected)
        })
    })

    describe('checkForSelectedUsers', () => {
        beforeEach(() => {
            component.selectedLearnersList = [
                { userId: 'user1', fullName: 'John' },
                { userId: 'user2', fullName: 'Jane' }
            ]
        })

        it('should return true when user is selected', () => {
            const rowData = { userId: 'user1', fullName: 'John' }

            const result = component.checkForSelectedUsers(rowData)

            expect(result).toBe(true)
        })

        it('should return false when user is not selected', () => {
            const rowData = { userId: 'user3', fullName: 'Bob' }

            const result = component.checkForSelectedUsers(rowData)

            expect(result).toBe(false)
        })

        it('should return false when selectedLearnersList is empty', () => {
            component.selectedLearnersList = []
            const rowData = { userId: 'user1', fullName: 'John' }

            const result = component.checkForSelectedUsers(rowData)

            expect(result).toBe(false)
        })
    })

    describe('changeFunc', () => {
        beforeEach(() => {
            component.selectedLearnersList = [{ userId: 'user1', fullName: 'John' }]
        })

        it('should add user when checked', () => {
            const event = { checked: true }
            const rowData = { userId: 'user2', fullName: 'Jane' }

            component.changeFunc(event, rowData)

            expect(component.selectedLearnersList).toHaveLength(2)
            expect(component.selectedLearnersList[1]).toEqual(rowData)
            expect(component.successUserData.emit).toHaveBeenCalledWith(component.selectedLearnersList)
        })

        it('should remove user when unchecked', () => {
            const event = { checked: false }
            const rowData = { userId: 'user1', fullName: 'John' }

            component.changeFunc(event, rowData)

            expect(component.selectedLearnersList).toHaveLength(0)
            expect(component.successUserData.emit).toHaveBeenCalledWith(component.selectedLearnersList)
        })
    })

    describe('toggleAllRows', () => {
        beforeEach(() => {
            component.dataSource.data = [
                { userId: 'user1', fullName: 'John' },
                { userId: 'user2', fullName: 'Jane' }
            ]
            component.selectedLearnersList = [{ userId: 'user3', fullName: 'Bob' }]
        })

        it('should add all visible users when checked', () => {
            const event = { checked: true }

            component.toggleAllRows(event)

            expect(component.selectedLearnersList).toHaveLength(3)
            expect(component.selectedLearnersList).toContainEqual({ userId: 'user1', fullName: 'John' })
            expect(component.selectedLearnersList).toContainEqual({ userId: 'user2', fullName: 'Jane' })
            expect(component.selectedLearnersList).toContainEqual({ userId: 'user3', fullName: 'Bob' })
            expect(component.successUserData.emit).toHaveBeenCalledWith(component.selectedLearnersList)
        })

        it('should remove all visible users when unchecked', () => {
            component.selectedLearnersList = [
                { userId: 'user1', fullName: 'John' },
                { userId: 'user3', fullName: 'Bob' }
            ]
            const event = { checked: false }

            component.toggleAllRows(event)

            expect(component.selectedLearnersList).toHaveLength(1)
            expect(component.selectedLearnersList[0]).toEqual({ userId: 'user3', fullName: 'Bob' })
            expect(component.successUserData.emit).toHaveBeenCalledWith(component.selectedLearnersList)
        })
    })

    describe('checkForSelectedUsersAll', () => {
        beforeEach(() => {
            component.dataSource.data = [
                { userId: 'user1', fullName: 'John' },
                { userId: 'user2', fullName: 'Jane' }
            ]
        })

        it('should return true when all visible users are selected', () => {
            component.selectedLearnersList = [
                { userId: 'user1', fullName: 'John' },
                { userId: 'user2', fullName: 'Jane' },
                { userId: 'user3', fullName: 'Bob' }
            ]

            const result = component.checkForSelectedUsersAll()

            expect(result).toBe(true)
        })

        it('should return false when not all visible users are selected', () => {
            component.selectedLearnersList = [
                { userId: 'user1', fullName: 'John' },
                { userId: 'user3', fullName: 'Bob' }
            ]

            const result = component.checkForSelectedUsersAll()

            expect(result).toBe(false)
        })

        it('should return false when selectedLearnersList is empty', () => {
            component.selectedLearnersList = []

            const result = component.checkForSelectedUsersAll()

            expect(result).toBe(false)
        })

        it('should return false when no visible users are selected', () => {
            component.selectedLearnersList = [
                { userId: 'user3', fullName: 'Bob' },
                { userId: 'user4', fullName: 'Alice' }
            ]

            const result = component.checkForSelectedUsersAll()

            expect(result).toBe(false)
        })
    })

    describe('Edge Cases and Integration Tests', () => {
        it('should handle empty organization list in searchOrg', () => {
            component.organisationList = []

            const result = component.searchOrg('test')

            expect(result).toEqual([])
        })

        it('should handle empty department list in searchDept', () => {
            component.departmentList = []

            const result = component.searchDept('test')

            expect(result).toEqual([])
        })

        it('should handle null/undefined values in userDataToTable', () => {
            const mockUserData = {
                count: 1,
                content: [
                    {
                        firstName: null,
                        profileDetails: {
                            personalDetails: {
                                primaryEmail: 'test@example.com',
                                mobile: null
                            }
                        },
                        rootOrgName: null,
                        userId: 'user1'
                    }
                ]
            }

            component.userDataToTable(mockUserData)

            expect(component.globalSearchData[0]).toEqual({
                fullName: null,
                email: 'test@example.com',
                mobile: '-',
                ministry: null,
                status: 'Success',
                userId: 'user1'
            })
        })

        it('should handle case when getDepartments response is malformed', () => {
            const mockResponse = {}
            mockContentBatchService.getDepartments.mockReturnValue(of(mockResponse))

            component.getDepartments(['org1'])

            expect(component.departmentList).toEqual([])
            expect(component.filterDeptList).toEqual([])
        })

        it('should handle case when form is null in globalSearch', () => {
            component.filterForm = null as any
            mockOrgUserService.getUserSearchList.mockReturnValue(of({ count: 0 }))
            const event = { target: { value: 'test' } }

            expect(() => component.globalSearch(event)).not.toThrow()
        })

        it('should handle selectOrg with duplicate selection', () => {
            component.filterForm = new UntypedFormGroup({
                selectedOrg: new UntypedFormControl([])
            })
            component.selectedOrgData = [{ orgId: 'org1', channel: 'Org 1' }]

            const event = {
                isUserInput: true,
                source: {
                    selected: true,
                    value: { orgId: 'org1', channel: 'Org 1' }
                }
            }

            component.selectOrg(event)

            expect(component.selectedOrgData).toHaveLength(2)
        })

        it('should handle selectDepartment with duplicate selection', () => {
            component.filterForm = new UntypedFormGroup({
                selectedDept: new UntypedFormControl([])
            })
            component.selectedDeptData = [{ name: 'Dept 1' }]

            const event = {
                isUserInput: true,
                source: {
                    selected: true,
                    value: { name: 'Dept 1' }
                }
            }

            component.selectDepartment(event)

            expect(component.selectedDeptData).toHaveLength(2)
        })

        it('should handle changeFunc with user not in list when unchecking', () => {
            component.selectedLearnersList = [{ userId: 'user1', fullName: 'John' }]
            const event = { checked: false }
            const rowData = { userId: 'user2', fullName: 'Jane' }

            expect(() => component.changeFunc(event, rowData)).not.toThrow()
            expect(component.selectedLearnersList).toHaveLength(1)
        })

        it('should handle openedChange with empty selectedDeptData', () => {
            component.selectedDeptData = []
            component.departmentList = []

            component.openedChange(true)

            expect(component.departmentList).toEqual([{ name: 'Dept A' }])
            expect(component.filterDeptList).toEqual([{ name: 'Dept A' }])
        })

        it('should handle openedChangeOrg with empty selectedOrgData', () => {
            component.selectedOrgData = []
            component.organisationList = [{ orgId: 'org1', channel: 'Org A' }]

            component.openedChangeOrg(true)

            expect(component.organisationList).toEqual([{ orgId: 'org1', channel: 'Org A' }])
            expect(component.filterOrgList).toEqual([{ orgId: 'org1', channel: 'Org A' }])
        })

        it('should handle toggleAllRows with empty dataSource', () => {
            component.dataSource.data = []
            component.selectedLearnersList = [{ userId: 'user1', fullName: 'John' }]
            const event = { checked: true }

            component.toggleAllRows(event)

            expect(component.selectedLearnersList).toHaveLength(1)
        })

        it('should handle multiple keydown events on select elements', () => {
            mockContentBatchService.getOrgs.mockReturnValue(of([]))
            component.ngOnInit()

            // Test multiple different key codes
            const events = [
                { keyCode: SPACE },
                { keyCode: ENTER },
                { keyCode: 37 }, // Arrow left
                { keyCode: 38 }, // Arrow up
                { keyCode: 39 }, // Arrow right
                { keyCode: 40 }  // Arrow down
            ]

            events.forEach(event => {
                component.selectOrgg.panelOpen = Math.random() > 0.5
                component.selectDeptt.panelOpen = Math.random() > 0.5

                expect(() => {
                    component.selectOrgg._handleKeydown(event)
                    component.selectDeptt._handleKeydown(event)
                }).not.toThrow()
            })
        })

        it('should maintain form state consistency during operations', () => {
            component.filterForm = new UntypedFormGroup({
                selectedOrg: new UntypedFormControl([]),
                selectedDept: new UntypedFormControl([]),
                userType: new UntypedFormControl(false)
            })

            // Simulate a complete workflow
            mockOrgUserService.getUserSearchList.mockReturnValue(of({ count: 0 }))

            const searchEvent = { target: { value: 'test' } }
            component.globalSearch(searchEvent)

            expect(component.filterForm.get('userType')?.value).toBe(false)
            expect(component.selectedOrgData).toEqual([])
            expect(component.selectedDeptData).toEqual([])
        })
    })

    describe('Property Initialization', () => {
        it('should have correct initial values for all properties', () => {
            expect(component.organisationList).toEqual([])
            expect(component.departmentList).toEqual([])
            expect(component.filterOrgList).toEqual([])
            expect(component.filterDeptList).toEqual([])
            expect(component.selectedOrgData).toEqual([])
            expect(component.selectedDeptData).toEqual([])
            expect(component.globalSearchText).toBe('')
            expect(component.selectedLearnersList).toEqual([])
            expect(component.globalSearchData).toEqual([])
            expect(component.displayedColumns).toEqual(['select', 'fullName', 'email', 'ministry', 'mobile'])
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
            expect(component.selection).toBeInstanceOf(SelectionModel)
            expect(component.showTable).toBe(false)
        })
    })
})