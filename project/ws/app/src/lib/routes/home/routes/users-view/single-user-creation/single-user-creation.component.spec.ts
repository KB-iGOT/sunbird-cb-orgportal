import { SingleUserCreationComponent } from './single-user-creation.component'
import { UntypedFormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'

// Mock dependencies
const mockUsersService = {
    getDesignations: jest.fn(),
    getMasterLanguages: jest.fn(),
    getGroups: jest.fn(),
    createUser: jest.fn(),
    searchIgotDesignation: jest.fn().mockReturnValue(of({ result: { count: 0 } })),
    searchDesignation: jest.fn().mockReturnValue(of({ result: { result: { data: [], totalcount: 0 } } })),
}

const mockMatSnackBar = {
    open: jest.fn()
}

const mockRolesService = {
    getAllRoles: jest.fn()
}

const mockActivatedRoute = {
    snapshot: {
        data: {
            configService: {
                unMappedUser: {
                    channel: 'test-channel'
                }
            }
        }
    }
}

const mockDialog = {
    open: jest.fn().mockReturnValue({ afterClosed: () => ({ subscribe: jest.fn() }) }),
    closeAll: jest.fn(),
}

const mockElementRef = {
    nativeElement: {
        checked: false,
        value: 'PUBLIC'
    },
    value: 'PUBLIC',
    checked: false
}

const mockQueryList = {
    forEach: jest.fn((callback) => {
        callback(mockElementRef)
    })
}

describe('SingleUserCreationComponent', () => {
    let component: SingleUserCreationComponent
    let formBuilder: UntypedFormBuilder

    beforeEach(() => {
        formBuilder = new UntypedFormBuilder()
        component = new SingleUserCreationComponent(
            formBuilder,
            mockUsersService as any,
            mockMatSnackBar as any,
            mockRolesService as any,
            mockActivatedRoute as any,
            mockDialog as any
        )

        // Mock ViewChildren
        component.checkboxes = mockQueryList as any

        // Reset all mocks
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should initialize component with default values', () => {
            expect(component.defaultRole).toEqual(['PUBLIC'])
            expect(component.rolesArr).toEqual([])
            expect(component.designationListLoadCount).toBe(50)
            expect(component.designationDefaultLoadCount).toBe(50)
            expect(component.isLoadingMoreDesignations).toBe(false)
            expect(component.desigantionFilterEnable).toBe(false)
            expect(component.displayLoader).toBe(false)
        })

        it('should initialize form with proper validators', () => {
            expect(component.userCreationForm.get('email')?.hasError('required')).toBeTruthy()
            expect(component.userCreationForm.get('firstName')?.hasError('required')).toBeTruthy()
            expect(component.userCreationForm.get('phone')?.hasError('required')).toBeTruthy()
            expect(component.userCreationForm.get('designation')?.hasError('required')).toBeTruthy()
            expect(component.userCreationForm.get('group')?.hasError('required')).toBeTruthy()
            expect(component.userCreationForm.get('roles')?.hasError('required')).toBeTruthy()
        })

        it('should set up searchDesignation valueChanges subscription', () => {
            jest.useFakeTimers()
            const newComponent = new SingleUserCreationComponent(
                formBuilder,
                mockUsersService as any,
                mockMatSnackBar as any,
                mockRolesService as any,
                mockActivatedRoute as any,
                mockDialog as any
            )

            newComponent.masterData = {
                designation: [{ name: 'Developer' }, { name: 'Manager' }],
                designationBackup: [{ name: 'Developer' }, { name: 'Manager' }, { name: 'Tester' }]
            }

            // Test with search value
            newComponent.userCreationForm.get('searchDesignation')?.setValue('dev')
            jest.advanceTimersByTime(200)
            expect(newComponent.desigantionFilterEnable).toBe(true)

            // Test with empty search value
            newComponent.userCreationForm.get('searchDesignation')?.setValue('')
            jest.advanceTimersByTime(200)
            expect(newComponent.desigantionFilterEnable).toBe(false)
            jest.useRealTimers()
        })

        it('should set up domicileMedium valueChanges subscription', () => {
            const newComponent = new SingleUserCreationComponent(
                formBuilder,
                mockUsersService as any,
                mockMatSnackBar as any,
                mockRolesService as any,
                mockActivatedRoute as any,
                mockDialog as any
            )

            newComponent.masterData = {
                language: [{ name: 'English' }],
                languageBackup: [{ name: 'English' }, { name: 'Hindi' }]
            }

            newComponent.userCreationForm.get('domicileMedium')?.setValue('eng')
            // Subscription should filter languages
        })
    })

    describe('ngOnInit', () => {
        it('should call all initialization methods', () => {
            const checkOrgDesignationsSpy = jest.spyOn(component, 'checkOrgHasDesignations').mockImplementation(() => { })
            const getMasterLanguagesSpy = jest.spyOn(component, 'getMasterLanguages').mockImplementation(() => { })
            const getGroupsSpy = jest.spyOn(component, 'getGroups').mockImplementation(() => { })
            const getOrgRolesListSpy = jest.spyOn(component, 'getOrgRolesList').mockImplementation(() => { })

            component.ngOnInit()

            expect(checkOrgDesignationsSpy).toHaveBeenCalled()
            expect(getMasterLanguagesSpy).toHaveBeenCalled()
            expect(getGroupsSpy).toHaveBeenCalled()
            expect(getOrgRolesListSpy).toHaveBeenCalled()
        })
    })

    describe('ngAfterViewInit', () => {
        it('should call setDefaultValue', () => {
            const setDefaultValueSpy = jest.spyOn(component, 'setDefaultValue')
            component.ngAfterViewInit()
            expect(setDefaultValueSpy).toHaveBeenCalled()
        })
    })

    describe('setDefaultValue', () => {
        it('should set default role and channel values', () => {
            component.setDefaultValue()

            expect(component.userCreationForm.get('roles')?.value).toEqual(['PUBLIC'])
            expect(component.userCreationForm.get('channel')?.value).toBe('test-channel')
        })

        it('should handle missing fullProfile', () => {
            component.fullProfile = null
            component.setDefaultValue()

            expect(component.userCreationForm.get('channel')?.value).toBe('')
        })
    })

    describe('getDesignation', () => {
        it('should fetch designations successfully', () => {
            const mockResponse = {
                result: { result: { data: [{ designation: 'Developer', status: 'Active' }, { designation: 'Manager', status: 'Active' }], totalcount: 2 } }
            }
            mockUsersService.searchDesignation.mockReturnValue(of(mockResponse))

            component.getDesignation()

            expect(mockUsersService.searchDesignation).toHaveBeenCalled()
            expect(component.masterData.designationBackup).toHaveLength(2)
            expect(component.masterData.designationBackup[0].name).toBe('Developer')
        })

        it('should handle designation fetch error', () => {
            const mockError: any = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            mockError.ok = false
            mockUsersService.searchDesignation.mockReturnValue(throwError(mockError))

            component.getDesignation()

            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch designation details, please try again later!')
        })
    })

    describe('getMasterLanguages', () => {
        it('should fetch master languages successfully', () => {
            const mockResponse = {
                languages: [{ name: 'English' }, { name: 'Hindi' }]
            }
            mockUsersService.getMasterLanguages.mockReturnValue(of(mockResponse))

            component.getMasterLanguages()

            expect(mockUsersService.getMasterLanguages).toHaveBeenCalled()
            expect(component.masterData.language).toEqual(mockResponse.languages)
            expect(component.masterData.languageBackup).toEqual(mockResponse.languages)
        })

        it('should handle master languages fetch error', () => {
            const mockError: any = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            mockError.ok = false
            mockUsersService.getMasterLanguages.mockReturnValue(throwError(mockError))

            component.getMasterLanguages()

            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch master language details, please try again later!')
        })
    })

    describe('getGroups', () => {
        it('should fetch groups successfully and filter out Others', () => {
            const mockResponse = {
                result: {
                    response: ['Group1', 'Group2', 'Others', 'Group3']
                }
            }
            mockUsersService.getGroups.mockReturnValue(of(mockResponse))

            component.getGroups()

            expect(mockUsersService.getGroups).toHaveBeenCalled()
            expect(component.masterData.group).toEqual(['Group1', 'Group2', 'Group3'])
        })

        it('should handle groups fetch error', () => {
            const mockError: any = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            mockError.ok = false
            mockUsersService.getGroups.mockReturnValue(throwError(mockError))

            component.getGroups()

            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch group data, please try again later!')
        })
    })

    describe('getOrgRolesList', () => {
        it('should fetch roles list successfully', () => {
            const mockResponse = {
                result: {
                    response: {
                        value: JSON.stringify({
                            orgTypeList: [
                                { name: 'MDO', roles: ['admin', 'user'] },
                                { name: 'OTHER', roles: ['viewer'] }
                            ]
                        })
                    }
                }
            }
            mockRolesService.getAllRoles.mockReturnValue(of(mockResponse))

            component.getOrgRolesList()

            expect(mockRolesService.getAllRoles).toHaveBeenCalled()
            expect(component.masterData.mdoRoles).toEqual(['admin', 'user'])
        })

        it('should handle roles list fetch error', () => {
            const mockError: any = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            mockError.ok = false
            mockRolesService.getAllRoles.mockReturnValue(throwError(mockError))

            component.getOrgRolesList()

            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to fetch roles list, please try again later!')
        })

        it('should handle response without orgTypeList array', () => {
            const mockResponse = {
                result: {
                    response: {
                        value: JSON.stringify({
                            orgTypeList: 'not an array'
                        })
                    }
                }
            }
            mockRolesService.getAllRoles.mockReturnValue(of(mockResponse))

            component.getOrgRolesList()

            expect(component.masterData.mdoRoles).toBeUndefined()
        })
    })

    describe('handleRolesCheck', () => {
        it('should add role when checked', () => {
            const mockEvent = { checked: true } as any
            const role = 'ADMIN'

            component.handleRolesCheck(mockEvent, role)

            expect(component.rolesArr).toContain(role)
            expect(component.userCreationForm.get('roles')?.value).toEqual(['PUBLIC', 'ADMIN'])
        })

        it('should remove role when unchecked', () => {
            component.rolesArr = ['ADMIN', 'USER']
            const mockEvent = { checked: false } as any
            const role = 'ADMIN'

            component.handleRolesCheck(mockEvent, role)

            expect(component.rolesArr).not.toContain(role)
            expect(component.userCreationForm.get('roles')?.value).toEqual(['PUBLIC', 'USER'])
        })

        it('should handle unchecking role that is not in array', () => {
            component.rolesArr = ['USER']
            const mockEvent = { checked: false } as any
            const role = 'ADMIN'

            component.handleRolesCheck(mockEvent, role)

            expect(component.rolesArr).toEqual(['USER'])
        })
    })

    describe('handleAddTags', () => {
        it('should add tag to form control', () => {
            const mockEvent = {
                value: 'new-tag',
                input: { value: 'new-tag' }
            } as any

            component.userCreationForm.get('tags')?.setValue([])
            component.handleAddTags(mockEvent)

            expect(component.userCreationForm.get('tags')?.value).toContain('new-tag')
            expect(mockEvent.input.value).toBe('')
        })

        it('should initialize tags array if null', () => {
            const mockEvent = {
                value: 'new-tag',
                input: { value: 'new-tag' }
            } as any

            component.userCreationForm.get('tags')?.setValue(null)
            component.handleAddTags(mockEvent)

            expect(component.userCreationForm.get('tags')?.value).toEqual(['new-tag'])
        })

        it('should not add empty or whitespace-only tags', () => {
            const mockEvent = {
                value: '   ',
                input: { value: '   ' }
            } as any

            component.userCreationForm.get('tags')?.setValue([])
            component.handleAddTags(mockEvent)

            expect(component.userCreationForm.get('tags')?.value).toEqual([])
        })

        it('should handle event without input property', () => {
            const mockEvent = {
                value: 'new-tag'
            } as any

            component.userCreationForm.get('tags')?.setValue([])
            component.handleAddTags(mockEvent)

            expect(component.userCreationForm.get('tags')?.value).toContain('new-tag')
        })
    })

    describe('handleValidTags', () => {
        it('should allow valid characters', () => {
            expect(component.handleValidTags({ charCode: 65 })).toBe(true) // A
            expect(component.handleValidTags({ charCode: 97 })).toBe(true) // a
            expect(component.handleValidTags({ charCode: 32 })).toBe(true) // space
            expect(component.handleValidTags({ charCode: 8 })).toBe(true)  // backspace
        })

        it('should reject invalid characters', () => {
            expect(component.handleValidTags({ charCode: 64 })).toBe(false) // @
            expect(component.handleValidTags({ charCode: 33 })).toBe(false) // !
            expect(component.handleValidTags({ charCode: 48 })).toBe(false) // 0
        })
    })

    describe('handleRemoveTag', () => {
        it('should remove tag from array', () => {
            component.userCreationForm.get('tags')?.setValue(['tag1', 'tag2', 'tag3'])

            component.handleRemoveTag('tag2')

            expect(component.userCreationForm.get('tags')?.value).toEqual(['tag1', 'tag3'])
        })

        it('should handle removing non-existent tag', () => {
            component.userCreationForm.get('tags')?.setValue(['tag1', 'tag2'])

            component.handleRemoveTag('tag3')

            expect(component.userCreationForm.get('tags')?.value).toEqual(['tag1', 'tag2'])
        })
    })

    describe('handleFormClear', () => {
        it('should reset form and checkboxes', () => {
            const resetSpy = jest.spyOn(component.userCreationForm, 'reset')
            const setDefaultValueSpy = jest.spyOn(component, 'setDefaultValue')

            component.rolesArr = ['ADMIN', 'USER']
            component.handleFormClear()

            expect(resetSpy).toHaveBeenCalled()
            expect(component.checkboxes.forEach).toHaveBeenCalled()
            expect(component.rolesArr).toEqual([])
            expect(setDefaultValueSpy).toHaveBeenCalled()
        })
    })

    describe('handleUserCreation', () => {
        beforeEach(() => {
            component.userCreationForm.patchValue({
                email: 'test@example.com',
                firstName: 'John',
                phone: '9876543210',
                channel: 'web',
                designation: 'Developer',
                group: 'Engineering',
                roles: ['PUBLIC']
            })
        })

        it('should create user successfully', () => {
            const mockResponse = { success: true }
            mockUsersService.createUser.mockReturnValue(of(mockResponse))
            const handleFormClearSpy = jest.spyOn(component, 'handleFormClear')

            component.handleUserCreation()

            expect(mockUsersService.createUser).toHaveBeenCalled()
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('User created successfully!')
            expect(handleFormClearSpy).toHaveBeenCalled()
            expect(component.displayLoader).toBe(false)
        })

        it('should format date of birth correctly', () => {
            const testDate = new Date('2023-01-15')
            component.userCreationForm.patchValue({ dob: testDate })
            mockUsersService.createUser.mockReturnValue(of({ success: true }))

            component.handleUserCreation()

            const expectedData = expect.objectContaining({
                personalDetails: expect.objectContaining({
                    dob: '15-1-2023'
                })
            })
            expect(mockUsersService.createUser).toHaveBeenCalledWith(expectedData)
        })

        it('should show error when channel is empty', () => {
            component.userCreationForm.patchValue({ channel: '' })

            component.handleUserCreation()

            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Channel info is empty! So unable to create user')
            expect(mockUsersService.createUser).not.toHaveBeenCalled()
        })

        it('should handle user creation error', () => {
            const mockError: any = new HttpErrorResponse({
                status: 400,
                statusText: 'Bad Request',
                error: { params: { errmsg: 'Custom error message' } }
            })
            mockError.ok = false
            mockUsersService.createUser.mockReturnValue(throwError(mockError))

            component.handleUserCreation()

            expect(component.displayLoader).toBe(false)
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Custom error message')
        })

        it('should handle user creation error without custom message', () => {
            const mockError: any = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
            mockError.ok = false
            mockUsersService.createUser.mockReturnValue(throwError(mockError))

            component.handleUserCreation()

            expect(component.displayLoader).toBe(false)
            expect(mockMatSnackBar.open).toHaveBeenCalledWith('Unable to create user, please try again later!')
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from destroy subject', () => {
            const unsubscribeSpy = jest.spyOn(component['destroySubject$'], 'unsubscribe')

            component.ngOnDestroy()

            expect(unsubscribeSpy).toHaveBeenCalled()
        })
    })

    describe('setupScrollListener', () => {
        beforeEach(() => {
            // Mock DOM methods
            global.document.querySelector = jest.fn()
            global.setTimeout = jest.fn((fn) => fn()) as any
        })

        it('should setup scroll listener when opened', () => {
            const mockSearchInput = { focus: jest.fn() }
            const mockPanel = { addEventListener: jest.fn() };

            (document.querySelector as jest.Mock)
                .mockReturnValueOnce(mockSearchInput)
                .mockReturnValueOnce(mockPanel)

            component.masterData = {
                designationBackup: [{ name: 'Dev' }, { name: 'Manager' }]
            }

            component.setupScrollListener(true)

            expect(component.desigantionFilterEnable).toBe(false)
            expect(component.designationListLoadCount).toBe(50)
            expect(mockSearchInput.focus).toHaveBeenCalled()
            expect(mockPanel.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
        })

        it('should not setup when not opened', () => {
            component.setupScrollListener(false)
            expect(document.querySelector).not.toHaveBeenCalled()
        })
    })

    describe('onDesignationSelectScroll', () => {
        it('should load more designations when scrolled to bottom', (done) => {
            const mockElement = {
                scrollTop: 100,
                clientHeight: 50,
                scrollHeight: 155
            }
            const mockEvent = { target: mockElement }

            component.masterData = {
                designationBackup: new Array(100).fill(0).map((_, i) => ({ name: `Item${i}` })),
                designation: new Array(50).fill(0).map((_, i) => ({ name: `Item${i}` }))
            }
            component.desigantionFilterEnable = false
            component.isLoadingMoreDesignations = false

            // Mock setTimeout
            global.setTimeout = jest.fn((callback) => {
                callback()
                done()
            }) as any

            const checkCurrentDesignationPresentSpy = jest.spyOn(component, 'checkCurrentDesignationPresent')

            component.onDesignationSelectScroll(mockEvent)

            expect(component.designationListLoadCount).toBe(100)
            expect(checkCurrentDesignationPresentSpy).toHaveBeenCalled()
        })

        it('should not load more when filter is enabled', () => {
            const mockEvent = { target: { scrollTop: 100, clientHeight: 50, scrollHeight: 155 } }
            component.desigantionFilterEnable = true

            component.onDesignationSelectScroll(mockEvent)

            expect(component.isLoadingMoreDesignations).toBe(false)
        })

        it('should not load more when already loading', () => {
            const mockEvent = { target: { scrollTop: 100, clientHeight: 50, scrollHeight: 155 } }
            component.desigantionFilterEnable = false
            component.isLoadingMoreDesignations = true

            component.onDesignationSelectScroll(mockEvent)

            expect(component.designationListLoadCount).toBe(50)
        })

        it('should not load more when no more items available', () => {
            const mockEvent = { target: { scrollTop: 100, clientHeight: 50, scrollHeight: 155 } }
            component.masterData = {
                designationBackup: [{ name: 'Item1' }],
                designation: [{ name: 'Item1' }]
            }
            component.desigantionFilterEnable = false
            component.isLoadingMoreDesignations = false

            component.onDesignationSelectScroll(mockEvent)

            expect(component.designationListLoadCount).toBe(50)
        })
    })

    describe('checkCurrentDesignationPresent', () => {
        beforeEach(() => {
            component.masterData = {
                designation: [
                    { name: 'Developer', id: '1' },
                    { name: 'Manager', id: '2' }
                ]
            }
            component.designationListLoadCount = 50
        })

        it('should add custom designation when not present', () => {
            component.userCreationForm.get('designation')?.setValue('Custom Role')

            component.checkCurrentDesignationPresent()

            expect(component.masterData.designation[0].name).toBe('Custom Role')
            expect(component.masterData.designation[0].id).toContain('custom-')
            expect(component.isLoadingMoreDesignations).toBe(false)
        })

        it('should not add designation when it already exists', () => {
            component.userCreationForm.get('designation')?.setValue('Developer')

            component.checkCurrentDesignationPresent()

            expect(component.masterData.designation.length).toBe(2)
            expect(component.masterData.designation[0].name).toBe('Developer')
        })

        it('should replace last item when list is at capacity', () => {
            component.masterData.designation = new Array(50).fill(0).map((_, i) => ({ name: `Item${i}`, id: i }))
            component.userCreationForm.get('designation')?.setValue('Custom Role')

            component.checkCurrentDesignationPresent()

            expect(component.masterData.designation.length).toBe(50)
            expect(component.masterData.designation[0].name).toBe('Custom Role')
        })

        it('should handle null designation value', () => {
            component.userCreationForm.get('designation')?.setValue(null)

            component.checkCurrentDesignationPresent()

            expect(component.masterData.designation.length).toBe(2)
        })

        it('should handle empty designation value', () => {
            component.userCreationForm.get('designation')?.setValue('')

            component.checkCurrentDesignationPresent()

            expect(component.masterData.designation.length).toBe(2)
        })
    })

    describe('onDesignationDropdownClosed', () => {
        it('should clear search input and maintain designation value', (done) => {
            const currentDesignation = 'Developer'
            component.userCreationForm.get('designation')?.setValue(currentDesignation)

            // Mock setTimeout
            global.setTimeout = jest.fn((callback) => {
                callback()
                expect(component.userCreationForm.get('searchDesignation')?.value).toBe('')
                expect(component.userCreationForm.get('designation')?.value).toBe(currentDesignation)
                done()
            }) as any

            component.onDesignationDropdownClosed()
        })

        it('should handle null designation value', (done) => {
            component.userCreationForm.get('designation')?.setValue(null)

            global.setTimeout = jest.fn((callback) => {
                callback()
                expect(component.userCreationForm.get('searchDesignation')?.value).toBe('')
                done()
            }) as any

            component.onDesignationDropdownClosed()
        })
    })

    describe('Form Validation Patterns', () => {
        it('should validate email pattern correctly', () => {
            const emailControl = component.userCreationForm.get('email')

            emailControl?.setValue('invalid-email')
            expect(emailControl?.hasError('pattern')).toBeTruthy()

            emailControl?.setValue('valid@example.com')
            expect(emailControl?.hasError('pattern')).toBeFalsy()
        })

        it('should validate mobile pattern correctly', () => {
            const phoneControl = component.userCreationForm.get('phone')

            phoneControl?.setValue('123')
            expect(phoneControl?.hasError('pattern')).toBeTruthy()

            phoneControl?.setValue('9876543210')
            expect(phoneControl?.hasError('pattern')).toBeFalsy()
        })

        it('should validate pincode pattern correctly', () => {
            const pincodeControl = component.userCreationForm.get('pincode')

            pincodeControl?.setValue('12345')
            expect(pincodeControl?.hasError('pattern')).toBeTruthy()

            pincodeControl?.setValue('123456')
            expect(pincodeControl?.hasError('pattern')).toBeFalsy()
        })

        it('should validate name pattern correctly', () => {
            const firstNameControl = component.userCreationForm.get('firstName')

            firstNameControl?.setValue('John123')
            expect(firstNameControl?.hasError('pattern')).toBeTruthy()

            firstNameControl?.setValue('John Doe')
            expect(firstNameControl?.hasError('pattern')).toBeFalsy()
        })
    })
})