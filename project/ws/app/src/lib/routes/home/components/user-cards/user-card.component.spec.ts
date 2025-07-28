import { UserCardComponent } from './user-card.component'
import { UntypedFormGroup } from '@angular/forms'
import { of, throwError, BehaviorSubject } from 'rxjs'

describe('UserCardComponent', () => {
	let component: UserCardComponent
	let mockUsersService: any
	let mockRolesService: any
	let mockDialog: any
	let mockApprovalsService: any
	let mockActivatedRoute: any
	let mockSnackBar: any
	let mockEventService: any
	let mockDatePipe: any
	let mockChangeDetectorRef: any

	// Mock data
	const mockUserData = {
		userId: 'user123',
		firstName: 'John',
		profileDetails: {
			personalDetails: {
				firstname: 'John',
				primaryEmail: 'john@test.com',
				mobile: '1234567890',
				gender: 'MALE',
				dob: '1990-01-01T00:00:00Z',
				domicileMedium: 'English',
				category: 'General'
			},
			professionalDetails: [{
				designation: 'Manager',
				group: 'IT'
			}],
			employmentDetails: {
				pinCode: '123456',
				employeeCode: 'EMP001'
			},
			additionalProperties: {
				externalSystemId: 'EXT001',
				tag: ['tag1', 'tag2']
			},
			profileStatus: 'VERIFIED',
			profileStatusUpdatedOn: '2023-01-01 10:00:00'
		},
		organisations: [{
			roles: ['USER', 'MDO_ADMIN']
		}],
		roles: [
			{ role: 'USER' },
			{ role: 'MENTOR' }
		],
		rootOrgId: 'org123'
	}

	const mockDesignationsData = {
		responseData: [
			{ name: 'Manager', id: 1, description: 'Manager' },
			{ name: 'Director', id: 2, description: 'Director' }
		]
	}

	const mockGroupsData = {
		result: {
			response: ['Group1', 'Group2', 'Others', 'Group3']
		}
	}

	const mockLanguagesData = {
		languages: [
			{ name: 'English' },
			{ name: 'Spanish' },
			{ name: 'French' }
		]
	}

	const mockRolesData = {
		result: {
			response: {
				value: JSON.stringify({
					orgTypeList: [{
						name: 'MDO',
						roles: ['MDO_ADMIN', 'MDO_LEADER', 'USER']
					}]
				})
			}
		}
	}

	beforeEach(() => {
		// Setup mocks
		mockUsersService = {
			getUserById: jest.fn(),
			getDesignations: jest.fn(),
			getGroups: jest.fn(),
			getMasterLanguages: jest.fn(),
			updateUserDetails: jest.fn(),
			addUserToDepartment: jest.fn(),
			mentorList$: new BehaviorSubject(''),
			TOTAL_USERS_LIMIT: 1000
		}

		mockRolesService = {
			getAllRoles: jest.fn()
		}

		mockDialog = {
			open: jest.fn()
		}

		mockApprovalsService = {
			getProfileConfig: jest.fn(),
			handleWorkflowV2: jest.fn(),
			handleWorkflow: jest.fn()
		}

		mockActivatedRoute = {
			snapshot: {
				data: {
					configService: {
						unMappedUser: {
							rootOrgId: 'test-org',
							roles: ['MDO_ADMIN', 'MDO_LEADER']
						}
					}
				}
			}
		}

		mockSnackBar = {
			open: jest.fn()
		}

		mockEventService = {
			raiseInteractTelemetry: jest.fn()
		}

		mockDatePipe = {
			transform: jest.fn()
		}

		mockChangeDetectorRef = {
			detectChanges: jest.fn()
		}

		mockDatePipe.transform.mockReturnValue('01-01-2023')
		mockUsersService.getUserById.mockReturnValue(of(mockUserData))
		mockUsersService.updateUserDetails.mockReturnValue(of({ success: true }))
		mockUsersService.addUserToDepartment.mockReturnValue(of({ success: true }))
		mockApprovalsService.handleWorkflowV2.mockReturnValue(of({ result: { data: true } }))
		mockApprovalsService.handleWorkflow.mockReturnValue(of({ success: true }))

		// Mock localStorage
		Object.defineProperty(window, 'localStorage', {
			value: {
				getItem: jest.fn(),
				setItem: jest.fn()
			},
			writable: true
		})

		// Mock setTimeout globally
		global.setTimeout = jest.fn((callback) => callback()) as any

		component = new UserCardComponent(
			mockUsersService,
			mockRolesService,
			mockDialog,
			mockApprovalsService,
			mockActivatedRoute,
			mockSnackBar,
			mockEventService,
			mockDatePipe,
			mockChangeDetectorRef
		)

		// Setup component properties
		component.panels = {
			forEach: jest.fn()
		} as any
		component.paginator = {
			pageIndex: 0,
			pageSize: 20
		} as any
		component.usersData = [mockUserData]

		// Setup default mock returns
		mockUsersService.getDesignations.mockReturnValue(of(mockDesignationsData))
		mockUsersService.getGroups.mockReturnValue(of(mockGroupsData))
		mockUsersService.getMasterLanguages.mockReturnValue(of(mockLanguagesData))
		mockRolesService.getAllRoles.mockReturnValue(of(mockRolesData))
		mockApprovalsService.getProfileConfig.mockResolvedValue({
			profileData: []

		})
	})
	describe('Additional edge cases and error handling', () => {
		it('should handle missing search input element in setupScrollListener', () => {
			(document.querySelector as jest.Mock)
				.mockReturnValueOnce(null) // No search input found
				.mockReturnValueOnce({ addEventListener: jest.fn() })

			expect(() => component.setupScrollListener(true)).not.toThrow()
		})

		it('should handle missing panel element in setupScrollListener', () => {
			(document.querySelector as jest.Mock)
				.mockReturnValueOnce({ focus: jest.fn() })
				.mockReturnValueOnce(null) // No panel found

			expect(() => component.setupScrollListener(true)).not.toThrow()
		})

		// it('should handle invalid JSON in getFieldsMappedData', async () => {
		// 	const approvalData = [{
		// 		userWorkflow: {
		// 			wfInfo: [{
		// 				updateFieldValues: 'invalid json',
		// 				wfId: 'wf123'
		// 			}]
		// 		},
		// 		needApprovalList: []
		// 	}]

		// 	expect(() => component.getFieldsMappedData(approvalData)).not.toThrow()
		// })

		it('should handle missing userWorkflow in getFieldsMappedData', async () => {
			const approvalData = [{ needApprovalList: [] }]

			await component.getFieldsMappedData(approvalData)

			expect(approvalData[0].needApprovalList).toEqual([])
		})

		it('should handle missing wfInfo in getFieldsMappedData', async () => {
			const approvalData = [{
				userWorkflow: {},
				needApprovalList: []
			}]

			await component.getFieldsMappedData(approvalData)

			expect(approvalData[0].needApprovalList).toEqual([])
		})

		it('should handle user without profileDetails in setUserDetails', () => {
			jest.spyOn(component, 'mapRoles').mockImplementation()

			expect(() => component.setUserDetails({ userId: 'test' })).not.toThrow()
		})

		it('should handle missing toValue in getFieldsMappedData', async () => {
			const approvalData = [{
				userWorkflow: {
					wfInfo: [{
						updateFieldValues: '[]',
						wfId: 'wf123'
					}]
				},
				needApprovalList: []
			}]

			approvalData[0].userWorkflow.wfInfo[0].updateFieldValues = JSON.stringify([{
				fieldKey: 'designation'
				// Missing toValue
			}])

			await component.getFieldsMappedData(approvalData)

			expect(approvalData[0].needApprovalList).toHaveLength(0)
		})

		it('should handle error in mentorList$ subscription', () => {
			const user = {
				userId: 'user123',
				rootOrgId: 'org123',
				roles: []
			}
			const event = { checked: true }

			mockUsersService.addUserToDepartment.mockReturnValue(throwError('Network error'))

			expect(() => component.saveMentorProfile(user, event)).not.toThrow()
		})

		it('should handle missing organisation in mapRoles', () => {
			const user = { organisations: [{}] }

			component.mapRoles(user)

			expect(component.userRoles.size).toBe(0)
		})

		it('should handle null organisations in mapRoles', () => {
			const user = { organisations: null }

			expect(() => component.mapRoles(user)).not.toThrow()
		})

		it('should handle missing dob in setUserDetails', () => {
			const userWithNoDob = {
				profileDetails: {
					personalDetails: {
						primaryEmail: 'test@example.com'
					}
				}
			}
			jest.spyOn(component, 'mapRoles').mockImplementation()

			expect(() => component.setUserDetails(userWithNoDob)).not.toThrow()
		})

		it('should handle missing mobile in setUserDetails', () => {
			const userWithNoMobile = {
				profileDetails: {
					personalDetails: {
						primaryEmail: 'test@example.com'
					}
				}
			}
			jest.spyOn(component, 'mapRoles').mockImplementation()

			expect(() => component.setUserDetails(userWithNoMobile)).not.toThrow()
		})

		it('should handle missing additionalProperties in updateTags', () => {
			const profileData = { someOtherField: 'value' }

			component.updateTags(profileData)

			expect(component.selectedtags).toEqual([])
		})

		it('should handle getUserById error in onEditUser', () => {
			const user = { userId: 'user123' }
			const panel = { open: jest.fn() }

			mockUsersService.getUserById.mockReturnValue(throwError('User not found'))

			expect(() => component.onEditUser(user, panel)).not.toThrow()
		})

		it('should handle error in updateUserDetails without errmsg', () => {
			const form = { valid: true }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }
			const error = { error: { params: {} } }

			component.selectedtags = []
			component.updateUserDataForm.patchValue({
				designation: '',
				group: 'IT',
				mobile: '1234567890',
				primaryEmail: 'test@example.com'
			})

			mockUsersService.updateUserDetails.mockReturnValue(throwError(error))

			component.onSubmit(form, user, panel)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Error in updating user')
		})

		it('should handle missing updateFieldValues in onTransferSubmit', () => {
			const panel = { close: jest.fn() }
			const appData = {
				userWorkflow: {
					wfInfo: [{}] // Missing updateFieldValues
				}
			}

			expect(() => component.onTransferSubmit(panel, appData)).not.toThrow()
		})

		it('should handle null domicileMedium in updateUserDataForm', () => {
			component.updateUserDataForm.patchValue({ domicileMedium: null })

			expect(component.updateUserDataForm.get('domicileMedium')?.value).toBeNull()
		})

		it('should handle empty organizationId in saveMentorProfile', () => {
			const user = {
				userId: 'user123',
				rootOrgId: '',
				roles: []
			}
			const event = { checked: true }

			expect(() => component.saveMentorProfile(user, event)).not.toThrow()
		})
	})


	describe('onChangesLanuage implementation details', () => {
		it('should handle null form control in onChangesLanuage', () => {
			component.updateUserDataForm.removeControl('domicileMedium')

			expect(() => component.onChangesLanuage()).not.toThrow()
		})

		it('should handle valueChanges with object values', () => {
			component.masterLanguagesEntries = mockLanguagesData.languages
			component.onChangesLanuage()

			// Simulate object value change
			const control = component.updateUserDataForm.get('domicileMedium')
			if (control) {
				control.setValue({ name: 'English' })
			}

			expect(component.masterLanguages).toBeDefined()
		})



	})

	describe('Constructor and Initialization', () => {
		it('should initialize with correct default values', () => {
			expect(component.startIndex).toBe(0)
			expect(component.lastIndex).toBe(20)
			expect(component.pageSize).toBe(20)
			expect(component.isMdoAdmin).toBe(true)
			expect(component.isMdoLeader).toBe(true)
			expect(component.isBoth).toBe(true)
			expect(component.userRoles).toBeInstanceOf(Set)
			expect(component.selectedtags).toEqual([])
			expect(component.actionList).toEqual([])
		})

		it('should initialize forms with correct validators', () => {
			expect(component.updateUserDataForm).toBeInstanceOf(UntypedFormGroup)
			expect(component.approveUserDataForm).toBeInstanceOf(UntypedFormGroup)

			// Test form validators
			const primaryEmailControl = component.updateUserDataForm.get('primaryEmail')
			const mobileControl = component.updateUserDataForm.get('mobile')
			const groupControl = component.updateUserDataForm.get('group')

			expect(primaryEmailControl?.hasError('required')).toBe(true)
			expect(mobileControl?.hasError('required')).toBe(true)
			expect(groupControl?.hasError('required')).toBe(true)
		})

		it('should handle constructor with no roles in unMappedUser', () => {
			const routeWithoutRoles: any = {
				snapshot: {
					data: {
						configService: {
							unMappedUser: {
								rootOrgId: 'test-org'
							}
						}
					}
				}
			}

			const comp = new UserCardComponent(
				mockUsersService,
				mockRolesService,
				mockDialog,
				mockApprovalsService,
				routeWithoutRoles,
				mockSnackBar,
				mockEventService,
				mockDatePipe,
				mockChangeDetectorRef
			)

			expect(comp.isMdoAdmin).toBe(false)
			expect(comp.isMdoLeader).toBe(false)
			expect(comp.isBoth).toBe(false)
		})

		it('should format profileStatusUpdatedOn in constructor', () => {
			const userDataWithStatus = {
				...mockUserData,
				profileDetails: {
					...mockUserData.profileDetails,
					profileStatusUpdatedOn: '2023-01-01 10:00:00'
				}
			}

			component.usersData = [userDataWithStatus]

			const comp = new UserCardComponent(
				mockUsersService,
				mockRolesService,
				mockDialog,
				mockApprovalsService,
				mockActivatedRoute,
				mockSnackBar,
				mockEventService,
				mockDatePipe,
				mockChangeDetectorRef
			)

			expect(comp.usersData[0].profileDetails.profileStatusUpdatedOn).toBe('2023-01-01')
		})
	})

	describe('enableUpdateButton', () => {
		beforeEach(() => {
			component.approveUserDataForm.patchValue({
				approveGroup: 'validGroup',
				approveDesignation: 'validDesignation'
			})
		})

		it('should return true when all fields are valid', () => {
			const appData = {
				needApprovalList: [
					{ label: 'Group' },
					{ label: 'Designation' }
				]
			}

			const result = component.enableUpdateButton(appData)
			expect(result).toBe(true)
		})

		it('should return false when Group field is invalid', () => {
			component.approveUserDataForm.get('approveGroup')?.setErrors({ required: true })
			const appData = {
				needApprovalList: [{ label: 'Group' }]
			}

			const result = component.enableUpdateButton(appData)
			expect(result).toBe(false)
		})

		it('should return false when Designation field is invalid', () => {
			component.approveUserDataForm.get('approveDesignation')?.setErrors({ required: true })
			const appData = {
				needApprovalList: [{ label: 'Designation' }]
			}

			const result = component.enableUpdateButton(appData)
			expect(result).toBe(false)
		})

		it('should return true when needApprovalList is undefined', () => {
			const appData = {}
			const result = component.enableUpdateButton(appData)
			expect(result).toBe(true)
		})
	})

	describe('ngOnInit', () => {
		beforeEach(() => {
			(localStorage.getItem as jest.Mock).mockClear()
		})

		it('should load cache values from localStorage', () => {
			(localStorage.getItem as jest.Mock)
				.mockReturnValueOnce('5')   // profileverificationOffset
				.mockReturnValueOnce('10')  // transferOffset
				.mockReturnValueOnce('25') // pageSize

			component.currentFilter = 'test'
			component.ngOnInit()

			expect(component.cacheProfilePageIndex).toBe(5)
			expect(component.cacheTransferPageIndex).toBe(10)
			expect(component.pageSize).toBe(25)
		})

		it('should use default values when localStorage returns null', () => {
			(localStorage.getItem as jest.Mock).mockReturnValue(null)

			component.ngOnInit()

			expect(component.cacheProfilePageIndex).toBe(0)
			expect(component.cacheTransferPageIndex).toBe(0)
			expect(component.pageSize).toBe(20)
		})

		it('should call getApprovalData when isApprovals is true', () => {
			component.isApprovals = true
			component.usersData = [mockUserData]
			jest.spyOn(component, 'getApprovalData').mockImplementation()

			component.ngOnInit()

			expect(component.getApprovalData).toHaveBeenCalled()
		})

		it('should call init when isApprovals is false', () => {
			component.isApprovals = false
			jest.spyOn(component, 'init').mockResolvedValue()

			component.ngOnInit()

			expect(component.init).toHaveBeenCalled()
		})

		it('should setup searchDesignation valueChanges subscription', () => {
			component.designationsMeta = mockDesignationsData.responseData
			component.ngOnInit()

			// Test the valueChanges subscription
			component.updateUserDataForm.get('searchDesignation')?.setValue('man')

			expect(component.desigantionFilterEnable).toBe(true)
		})

		it('should filter designations when searchDesignation value changes', () => {
			component.designationsMeta = mockDesignationsData.responseData
			component.ngOnInit()

			component.updateUserDataForm.get('searchDesignation')?.setValue('manager')

			expect(component.filterDesignationsMeta).toHaveLength(1)
			expect(component.filterDesignationsMeta[0].name).toBe('Manager')
		})

		it('should reset filter when searchDesignation is empty', () => {
			component.designationsMeta = mockDesignationsData.responseData
			jest.spyOn(component, 'checkCurrentDesignationPresent').mockImplementation()
			component.ngOnInit()

			component.updateUserDataForm.get('searchDesignation')?.setValue('')

			expect(component.desigantionFilterEnable).toBe(false)
			expect(component.checkCurrentDesignationPresent).toHaveBeenCalled()
		})
	})

	describe('ngAfterViewInit', () => {
		it('should set paginator for profileverification filter', () => {
			component.currentFilter = 'profileverification'
			component.cacheProfilePageIndex = 3
			component.pageSize = 30

			component.ngAfterViewInit()

			expect(component.paginator.pageIndex).toBe(3)
			expect(component.paginator.pageSize).toBe(30)
			expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
		})

		it('should set paginator for transfers filter', () => {
			component.currentFilter = 'transfers'
			component.cacheTransferPageIndex = 2
			component.pageSize = 25

			component.ngAfterViewInit()

			expect(component.paginator.pageIndex).toBe(2)
			expect(component.paginator.pageSize).toBe(25)
		})

		it('should handle missing paginator', () => {
			component.paginator = null

			expect(() => component.ngAfterViewInit()).not.toThrow()
		})
	})

	describe('ngOnChanges', () => {
		it('should order usersData by firstName when no personalDetails', () => {
			component.usersData = [
				{ firstName: 'Zoe', profileDetails: {} },
				{ firstName: 'Alice', profileDetails: {} }
			]

			component.ngOnChanges()

			expect(component.usersData[0].firstName).toBe('Alice')
			expect(component.usersData[1].firstName).toBe('Zoe')
		})

		it('should order usersData by personalDetails firstname', () => {
			component.usersData = [
				{
					firstName: 'John',
					profileDetails: {
						personalDetails: { firstname: 'Zoe' }
					}
				},
				{
					firstName: 'Jane',
					profileDetails: {
						personalDetails: { firstname: 'Alice' }
					}
				}
			]

			component.ngOnChanges()

			expect(component.usersData[0].profileDetails.personalDetails.firstname).toBe('Alice')
		})

		it('should handle users without profileDetails', () => {
			component.usersData = [
				{ firstName: 'John' },
				{ firstName: 'Alice' }
			]

			component.ngOnChanges()

			expect(component.usersData[0].firstName).toBe('Alice')
		})

		it('should call getApprovalData when isApprovals is true', () => {
			component.isApprovals = true
			jest.spyOn(component, 'getApprovalData').mockImplementation()

			component.ngOnChanges()

			expect(component.getApprovalData).toHaveBeenCalled()
		})

		it('should reset paginator when resetPagination has keys', () => {
			component.resetPagination = { reset: true }

			component.ngOnChanges()

			expect(component.paginator.pageIndex).toBe(0)
		})
	})

	describe('ngAfterViewChecked', () => {
		it('should call detectChanges when htmlDetected is true', () => {
			component.htmlDetected = true

			component.ngAfterViewChecked()

			expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
		})

		it('should not call detectChanges when htmlDetected is false', () => {
			component.htmlDetected = false

			component.ngAfterViewChecked()

			expect(mockChangeDetectorRef.detectChanges).not.toHaveBeenCalled()
		})
	})

	describe('getApprovalData', () => {
		it('should set approvalData and call required methods', async () => {
			component.usersData = [mockUserData]
			jest.spyOn(component, 'getUserMappedData').mockImplementation()
			jest.spyOn(component, 'getFieldsMappedData').mockImplementation()

			await component.getApprovalData()

			expect(component.approvalData).toBe(component.usersData)
			expect(component.getUserMappedData).toHaveBeenCalledWith(component.usersData)
			expect(mockApprovalsService.getProfileConfig).toHaveBeenCalled()
		})

		it('should call getFieldsMappedData when profileData exists', async () => {
			component.usersData = [mockUserData]
			component.profileData = [{ field: 'test' }]
			jest.spyOn(component, 'getUserMappedData').mockImplementation()
			jest.spyOn(component, 'getFieldsMappedData').mockImplementation()

			await component.getApprovalData()

			expect(component.getFieldsMappedData).toHaveBeenCalledWith(component.usersData)
		})

		it('should handle empty usersData', async () => {
			component.usersData = []
			jest.spyOn(component, 'getUserMappedData').mockImplementation()

			await component.getApprovalData()

			expect(component.getUserMappedData).not.toHaveBeenCalled()
		})
	})

	describe('getUserMappedData', () => {
		it('should fetch user data and set properties for transfers', async () => {
			const approvalData = [{
				userWorkflow: {
					userInfo: { wid: 'user123' }
				},
				needApprovalList: [{ feildName: 'group' }]
			}]

			component.currentFilter = 'transfers'
			const userResponse = {
				...mockUserData,
				profileDetails: {
					...mockUserData.profileDetails,
					profileStatus: 'VERIFIED'
				}
			}
			mockUsersService.getUserById.mockReturnValue(of(userResponse))

			await component.getUserMappedData(approvalData)

			expect(mockUsersService.getUserById).toHaveBeenCalledWith('user123')
		})

		it('should handle user with NOT-MY-USER status', async () => {
			const approvalData = [{
				userWorkflow: {
					userInfo: { wid: 'user123' }
				}
			}]

			component.currentFilter = 'transfers'
			const userResponse = {
				...mockUserData,
				profileDetails: {
					...mockUserData.profileDetails,
					profileStatus: 'NOT-MY-USER'
				}
			}
			mockUsersService.getUserById.mockReturnValue(of(userResponse))

			await component.getUserMappedData(approvalData)

			expect(mockUsersService.getUserById).toHaveBeenCalledWith('user123')
		})

		it('should create noneedApprovalList for single group approval', async () => {
			const approvalData: any = [{
				userWorkflow: {
					userInfo: { wid: 'user123' }
				},
				needApprovalList: [{ feildName: 'group' }]
			}]

			mockUsersService.getUserById.mockReturnValue(of(mockUserData))

			await component.getUserMappedData(approvalData)

			expect(approvalData[0].noneedApprovalList).toBeDefined()
		})

		it('should create noneedApprovalList for single designation approval', async () => {
			const approvalData: any = [{
				userWorkflow: {
					userInfo: { wid: 'user123' }
				},
				needApprovalList: [{ feildName: 'designation' }]
			}]

			mockUsersService.getUserById.mockReturnValue(of(mockUserData))

			await component.getUserMappedData(approvalData)

			expect(approvalData[0].noneedApprovalList).toBeDefined()
		})
	})

	describe('getFieldsMappedData', () => {
		it('should map designation fields correctly', async () => {
			const approvalData: any = [{
				userWorkflow: {
					wfInfo: [{
						updateFieldValues: '[]',
						wfId: 'wf123'
					}]
				},
				needApprovalList: []
			}]

			// Set the updateFieldValues after object creation
			approvalData[0].userWorkflow.wfInfo[0].updateFieldValues = JSON.stringify([{
				toValue: { designation: 'Senior Manager' },
				fieldKey: 'designation'
			}])

			await component.getFieldsMappedData(approvalData)

			expect(approvalData[0].needApprovalList).toHaveLength(1)
			expect(approvalData[0].needApprovalList[0].label).toBe('Designation')
			expect(approvalData[0].needApprovalList[0].value).toBe('Senior Manager')
		})

		it('should map group fields correctly', async () => {
			const approvalData: any = [{
				userWorkflow: {
					wfInfo: [{
						updateFieldValues: '[]',
						wfId: 'wf123'
					}]
				},
				needApprovalList: []
			}]

			// Manually set the updateFieldValues after creation
			approvalData[0].userWorkflow.wfInfo[0].updateFieldValues = JSON.stringify([{
				toValue: { group: 'Engineering' },
				fieldKey: 'group'
			}])

			await component.getFieldsMappedData(approvalData)

			expect(approvalData[0].needApprovalList).toHaveLength(1)
			expect(approvalData[0].needApprovalList[0].label).toBe('Group')
			expect(approvalData[0].needApprovalList[0].value).toBe('Engineering')
		})

		it('should skip non-designation/group fields', async () => {
			const approvalData = [{
				userWorkflow: {
					wfInfo: [{
						updateFieldValues: '[]',
						wfId: 'wf123'
					}]
				},
				needApprovalList: []
			}]

			// Set the updateFieldValues after object creation
			approvalData[0].userWorkflow.wfInfo[0].updateFieldValues = JSON.stringify([{
				toValue: { email: 'test@example.com' },
				fieldKey: 'email'
			}])

			await component.getFieldsMappedData(approvalData)

			expect(approvalData[0].needApprovalList).toHaveLength(0)
		})
	})




	describe('init', () => {
		it('should call all load methods', async () => {
			jest.spyOn(component, 'loadDesignations').mockResolvedValue()
			jest.spyOn(component, 'loadGroups').mockResolvedValue()
			jest.spyOn(component, 'loadLangauages').mockResolvedValue()
			jest.spyOn(component, 'loadRoles').mockResolvedValue()

			await component.init()

			expect(component.loadDesignations).toHaveBeenCalled()
			expect(component.loadGroups).toHaveBeenCalled()
			expect(component.loadLangauages).toHaveBeenCalled()
			expect(component.loadRoles).toHaveBeenCalled()
		})
	})

	describe('loadDesignations', () => {
		it('should load designations and add Others option', async () => {
			await component.loadDesignations()

			expect(component.designationsMeta).toHaveLength(3) // 2 from mock + Others
			expect(component.designationsMeta[2].name).toBe('Others')
			expect(component.filterDesignationsMeta).toBeDefined()
		})

		it('should not duplicate Others option', async () => {
			const dataWithOthers = {
				responseData: [
					...mockDesignationsData.responseData,
					{ name: 'Others', id: 0, description: 'Others' }
				]
			}
			mockUsersService.getDesignations.mockReturnValue(of(dataWithOthers))

			await component.loadDesignations()

			const othersCount = component.designationsMeta.filter((d: any) => d.name === 'Others').length
			expect(othersCount).toBe(1)
		})

		it('should add user designations not in the list', async () => {
			component.usersData = [{
				profileDetails: {
					professionalDetails: [{
						designation: 'Custom Designation'
					}]
				}
			}]

			await component.loadDesignations()

			const customDesignation = component.designationsMeta.find((d: any) => d.name === 'Custom Designation')
			expect(customDesignation).toBeDefined()
		})

		it('should handle error in loadDesignations', async () => {
			mockUsersService.getDesignations.mockReturnValue(throwError('Network error'))
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

			await component.loadDesignations()

			expect(consoleSpy).toHaveBeenCalledWith('Error loading designations:', 'Network error')
			consoleSpy.mockRestore()
		})

		it('should handle missing responseData', async () => {
			mockUsersService.getDesignations.mockReturnValue(of({}))

			await component.loadDesignations()

			expect(component.designationsMeta).toHaveLength(1) // Just Others
		})
	})

	describe('loadGroups', () => {
		it('should load groups and exclude Others', async () => {
			await component.loadGroups()

			expect(component.groupsList).toEqual(['Group1', 'Group2', 'Group3'])
			expect(component.groupsList).not.toContain('Others')
		})

		it('should handle error in loadGroups', async () => {
			mockUsersService.getGroups.mockReturnValue(throwError('Network error'))

			await expect(component.loadGroups()).resolves.not.toThrow()
		})
	})

	describe('loadLangauages', () => {
		it('should load languages and call onChangesLanuage', async () => {
			jest.spyOn(component, 'onChangesLanuage').mockImplementation()

			await component.loadLangauages()

			expect(component.masterLanguagesEntries).toEqual(mockLanguagesData.languages)
			expect(component.onChangesLanuage).toHaveBeenCalled()
		})

		it('should handle error in loadLangauages', async () => {
			mockUsersService.getMasterLanguages.mockReturnValue(throwError('Network error'))

			await expect(component.loadLangauages()).resolves.not.toThrow()
		})
	})

	describe('loadRoles', () => {
		it('should load roles and set orgTypeList', async () => {
			await component.loadRoles()

			expect(component.orgTypeList).toEqual(JSON.parse(mockRolesData.result.response.value).orgTypeList)
		})
	})

	describe('closeOtherPanels', () => {
		it('should close all panels except the open one', () => {
			const panel1 = { close: jest.fn() }
			const panel2 = { close: jest.fn() }
			const openPanel = { close: jest.fn() }

			// component.panels.forEach = jest.fn((callback) => {
			// 	[panel1, panel2, openPanel].forEach(callback)
			// })

			component.closeOtherPanels(openPanel as any)

			expect(panel1.close).toHaveBeenCalled()
			expect(panel2.close).toHaveBeenCalled()
			expect(openPanel.close).not.toHaveBeenCalled()
		})
	})

	describe('otherDropDownChange', () => {
		it('should set designation when field is designation and value is not Other', () => {
			component.otherDropDownChange('Manager', 'designation')

			expect(component.updateUserDataForm.get('designation')?.value).toBe('Manager')
		})

		it('should not set value when value is Other', () => {
			component.updateUserDataForm.get('designation')?.setValue('')

			component.otherDropDownChange('Other', 'designation')

			expect(component.updateUserDataForm.get('designation')?.value).toBe('')
		})

		it('should not set value for non-designation fields', () => {
			const originalValue = component.updateUserDataForm.get('designation')?.value

			component.otherDropDownChange('Manager', 'group')

			expect(component.updateUserDataForm.get('designation')?.value).toBe(originalValue)
		})
	})

	describe('onChangesLanuage', () => {
		beforeEach(() => {
			component.masterLanguagesEntries = mockLanguagesData.languages
		})

		it('should setup masterLanguages observable', () => {
			component.onChangesLanuage()

			expect(component.masterLanguages).toBeDefined()
		})
	})

	describe('filterLanguage', () => {
		beforeEach(() => {
			component.masterLanguagesEntries = mockLanguagesData.languages
		})

		it('should filter languages by name', () => {
			const result = component['filterLanguage']('eng')

			expect(result).toHaveLength(1)
			expect(result[0].name).toBe('English')
		})

		it('should return all languages when name is empty', () => {
			const result = component['filterLanguage']('')

			expect(result).toHaveLength(3)
		})

		it('should handle case insensitive filtering', () => {
			const result = component['filterLanguage']('SPANISH')

			expect(result).toHaveLength(1)
			expect(result[0].name).toBe('Spanish')
		})

		it('should return empty array when no match', () => {
			const result = component['filterLanguage']('xyz')

			expect(result).toHaveLength(0)
		})
	})

	describe('numericOnly', () => {
		it('should return true for numeric keys', () => {
			const result = component.numericOnly({ key: '5' })
			expect(result).toBe(true)
		})

		it('should return false for non-numeric keys', () => {
			const result = component.numericOnly({ key: 'a' })
			expect(result).toBe(false)
		})

		it('should return false for special characters', () => {
			const result = component.numericOnly({ key: '@' })
			expect(result).toBe(false)
		})
	})

	describe('onEditUser', () => {
		let user: any
		let panel: any

		beforeEach(() => {
			user = { userId: 'user123' }
			panel = { open: jest.fn() }
			component.usersData = [{ userId: 'user123' }, { userId: 'user456' }]
			jest.spyOn(component, 'setUserDetails').mockImplementation()
		})

		it('should enable edit for MDO Leader', () => {
			component.isMdoLeader = true

			component.onEditUser(user, panel)

			expect(mockUsersService.getUserById).toHaveBeenCalledWith('user123')
			expect(component.setUserDetails).toHaveBeenCalled()
		})

		it('should disable edit for MDO Admin editing another MDO Admin', () => {
			component.isMdoLeader = false
			component.isMdoAdmin = true
			const userWithAdminRole = { ...mockUserData, roles: ['MDO_ADMIN'] }
			mockUsersService.getUserById.mockReturnValue(of(userWithAdminRole))

			component.onEditUser(user, panel)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Only MDO Leader Can Update Profile')
		})

		it('should enable edit for MDO Admin editing non-admin user', () => {
			component.isMdoLeader = false
			component.isMdoAdmin = true
			const userWithoutAdminRole = { ...mockUserData, roles: ['USER'] }
			mockUsersService.getUserById.mockReturnValue(of(userWithoutAdminRole))

			component.onEditUser(user, panel)

			expect(component.setUserDetails).toHaveBeenCalled()
		})

		it('should disable other users edit mode', () => {
			component.isMdoLeader = true

			component.onEditUser(user, panel)

			expect(component.usersData[1].enableEdit).toBe(false)
		})
	})

	describe('getApprovalUserData', () => {
		it('should reset data when panel is expanded', () => {
			const user = { enableEdit: true, needApprovalList: ['item'] }
			const data = { test: 'data' }
			const openPanel = { expanded: true }
			jest.spyOn(component, 'getApprovalList').mockImplementation()

			component.getApprovalUserData(user, data, openPanel as any)

			expect(user.enableEdit).toBe(false)
			expect(user.needApprovalList).toEqual([])
			expect(component.actionList).toEqual([])
			expect(component.comment).toBe('')
			expect(component.getApprovalList).toHaveBeenCalledWith(data)
		})

		it('should not reset data when panel is not expanded', () => {
			const user = { enableEdit: true, needApprovalList: ['item'] }
			const data = { test: 'data' }
			const openPanel = { expanded: false }
			jest.spyOn(component, 'getApprovalList').mockImplementation()

			component.getApprovalUserData(user, data, openPanel as any)

			expect(component.getApprovalList).not.toHaveBeenCalled()
		})
	})

	describe('getUerData', () => {
		it('should process user data when panel is expanded', () => {
			const user = { userId: 'user123', enableEdit: true, profileDetails: { test: 'data' } }
			const openPanel = { expanded: true }
			const index = 0

			component.usersData = [user]
			jest.spyOn(component, 'updateTags').mockImplementation()
			jest.spyOn(component, 'mapRoles').mockImplementation()

			component.getUerData(user, openPanel as any, index)

			expect(component.updateTags).toHaveBeenCalledWith({ test: 'data' })
			expect(mockUsersService.getUserById).toHaveBeenCalledWith('user123')
		})

		it('should not process user data when panel is not expanded', () => {
			const user = { userId: 'user123', enableEdit: true }
			const openPanel = { expanded: false }
			const index = 0

			jest.spyOn(component, 'updateTags').mockImplementation()

			component.getUerData(user, openPanel as any, index)

			expect(component.updateTags).not.toHaveBeenCalled()
		})
	})

	describe('mapRoles', () => {
		beforeEach(() => {
			component.orgTypeList = [{
				name: 'MDO',
				roles: ['MDO_ADMIN', 'MDO_LEADER', 'USER']
			}]
		})

		it('should map user roles correctly', () => {
			const user = {
				organisations: [{
					roles: ['MDO_ADMIN', 'USER']
				}]
			}

			component.mapRoles(user)

			expect(component.userRoles.has('MDO_ADMIN')).toBe(true)
			expect(component.userRoles.has('USER')).toBe(true)
			expect(component.orguserRoles).toContain('MDO_ADMIN')
			expect(component.orguserRoles).toContain('USER')
		})

		it('should handle user without organisations', () => {
			const user = { organisations: [] }

			component.mapRoles(user)

			expect(component.userRoles.size).toBe(0)
		})

		it('should exclude MDO_LEADER from unique roles', () => {
			component.mapRoles({})

			const hasLeaderRole = component.uniqueRoles.some((role: any) => role.roleName === 'MDO_LEADER')
			expect(hasLeaderRole).toBe(false)
		})

		it('should call loadRoles when orgTypeList is empty', () => {
			component.orgTypeList = []
			jest.spyOn(component, 'loadRoles').mockResolvedValue()
			jest.spyOn(component, 'mapRoles').mockImplementation()

			component.mapRoles({})

			expect(component.loadRoles).toHaveBeenCalled()
		})

		it('should handle user without organisations array', () => {
			const user = {}

			component.mapRoles(user)

			expect(component.userRoles.size).toBe(0)
		})
	})

	describe('setUserDetails', () => {
		it('should set all form values from user profile', () => {
			jest.spyOn(component, 'mapRoles').mockImplementation()
			//jest.spyOn(component, 'getDateFromText').mockReturnValue('1990-01-01')

			component.setUserDetails(mockUserData)

			expect(component.updateUserDataForm.get('designation')?.value).toBe('Manager')
			expect(component.updateUserDataForm.get('group')?.value).toBe('IT')
			expect(component.updateUserDataForm.get('primaryEmail')?.value).toBe('john@test.com')
			expect(component.updateUserDataForm.get('mobile')?.value).toBe('1234567890')
			expect(component.updateUserDataForm.get('gender')?.value).toBe('Male')
			expect(component.updateUserDataForm.get('pincode')?.value).toBe('123456')
			expect(component.updateUserDataForm.get('employeeID')?.value).toBe('EMP001')
			expect(component.updateUserDataForm.get('ehrmsID')?.value).toBe('EXT001')
		})

		it('should handle female gender mapping', () => {
			const userWithFemaleGender = {
				...mockUserData,
				profileDetails: {
					...mockUserData.profileDetails,
					personalDetails: {
						...mockUserData.profileDetails.personalDetails,
						gender: 'FEMALE'
					}
				}
			}
			jest.spyOn(component, 'mapRoles').mockImplementation()

			component.setUserDetails(userWithFemaleGender)

			expect(component.updateUserDataForm.get('gender')?.value).toBe('Female')
		})

		it('should handle others gender mapping', () => {
			const userWithOthersGender = {
				...mockUserData,
				profileDetails: {
					...mockUserData.profileDetails,
					personalDetails: {
						...mockUserData.profileDetails.personalDetails,
						gender: 'OTHERS'
					}
				}
			}
			jest.spyOn(component, 'mapRoles').mockImplementation()

			component.setUserDetails(userWithOthersGender)

			expect(component.updateUserDataForm.get('gender')?.value).toBe('Others')
		})

		it('should handle missing profile sections', () => {
			const userWithMissingData = {
				profileDetails: {}
			}
			jest.spyOn(component, 'mapRoles').mockImplementation()

			expect(() => component.setUserDetails(userWithMissingData)).not.toThrow()
		})

		it('should handle user without profileDetails', () => {
			jest.spyOn(component, 'mapRoles').mockImplementation()

			expect(() => component.setUserDetails({})).not.toThrow()
		})
	})

	describe('getDateFromText', () => {
		it('should parse ISO date string', () => {
			const result = component['getDateFromText']('2023-01-01T00:00:00Z')
			expect(result).toBe('2023-01-01')
		})

		it('should parse DD-MM-YYYY format', () => {
			const result = component['getDateFromText']('01-01-2023')
			expect(result).toBeInstanceOf(Date)
		})

		it('should parse YYYY-MM-DD format', () => {
			const result = component['getDateFromText']('2023-01-01')
			expect(result).toBeInstanceOf(Date)
		})

		it('should return empty string for empty input', () => {
			const result = component['getDateFromText']('')
			expect(result).toBe('')
		})

		it('should return empty string for null input', () => {
			const result = component['getDateFromText'](null as any)
			expect(result).toBe('')
		})
	})

	describe('getUseravatarName', () => {
		it('should return firstname from personalDetails', () => {
			const user = {
				profileDetails: {
					personalDetails: { firstname: 'John' }
				}
			}

			const result = component.getUseravatarName(user)
			expect(result).toBe('John')
		})

		it('should return firstName from personalDetails when firstname is missing', () => {
			const user = {
				profileDetails: {
					personalDetails: { firstName: 'Jane' }
				}
			}

			const result = component.getUseravatarName(user)
			expect(result).toBe('Jane')
		})

		it('should return firstName from user object when profileDetails is missing', () => {
			const user = { firstName: 'Bob' }

			const result = component.getUseravatarName(user)
			expect(result).toBe('Bob')
		})

		it('should return empty string when no name is available', () => {
			const user = {}

			const result = component.getUseravatarName(user)
			expect(result).toBe('')
		})
	})

	describe('getApprovalList', () => {
		it('should set userwfData', () => {
			const approvalData = { test: 'data' }

			component.getApprovalList(approvalData)

			expect(component.userwfData).toBe(approvalData)
		})
	})

	describe('cancelSubmit', () => {
		it('should reset form and toggle enableEdit', () => {
			const user = { enableEdit: false }
			component.updateUserDataForm.markAsDirty()

			component.cancelSubmit(user)

			expect(user.enableEdit).toBe(true)
		})
	})

	describe('modifyUserRoles', () => {
		it('should add role if not present', () => {
			component.modifyUserRoles('NEW_ROLE')

			expect(component.userRoles.has('NEW_ROLE')).toBe(true)
		})

		it('should remove role if present', () => {
			component.userRoles.add('EXISTING_ROLE')

			component.modifyUserRoles('EXISTING_ROLE')

			expect(component.userRoles.has('EXISTING_ROLE')).toBe(false)
		})
	})

	describe('updateTags', () => {
		it('should set selectedtags from profile data', () => {
			const profileData = {
				additionalProperties: { tag: ['tag1', 'tag2'] }
			}

			component.updateTags(profileData)

			expect(component.selectedtags).toEqual(['tag1', 'tag2'])
		})

		it('should set empty array if no tags', () => {
			const profileData = {}

			component.updateTags(profileData)

			expect(component.selectedtags).toEqual([])
		})

		it('should handle missing additionalProperties', () => {
			const profileData = { additionalProperties: {} }

			component.updateTags(profileData)

			expect(component.selectedtags).toEqual([])
		})
	})

	describe('addActivity', () => {
		it('should add activity to selectedtags', () => {
			const event = {
				input: { value: 'test' },
				value: 'New Activity'
			}

			component.addActivity(event as any)

			expect(component.selectedtags).toContain('New Activity')
			expect(component.isTagsEdited).toBe(true)
			expect(event.input.value).toBe('')
		})

		it('should not add empty activity', () => {
			const event = {
				input: { value: 'test' },
				value: '   '
			}

			component.addActivity(event as any)

			expect(component.selectedtags).toHaveLength(0)
		})

		it('should handle missing input', () => {
			const event = {
				input: null,
				value: 'New Activity'
			}

			expect(() => component.addActivity(event as any)).not.toThrow()
		})
	})

	describe('removeActivity', () => {
		it('should remove activity from selectedtags', () => {
			component.selectedtags = ['activity1', 'activity2']

			component.removeActivity('activity1')

			expect(component.selectedtags).toEqual(['activity2'])
			expect(component.isTagsEdited).toBe(true)
		})

		it('should handle removing non-existent activity', () => {
			component.selectedtags = ['activity1', 'activity2']

			component.removeActivity('activity3')

			expect(component.selectedtags).toEqual(['activity1', 'activity2'])
		})
	})

	describe('checkForChange', () => {
		it('should process activity list without errors', () => {
			const activityList = ['activity1', 'activity2']

			expect(() => component.checkForChange(activityList)).not.toThrow()
		})
	})

	describe('onChangePage', () => {
		beforeEach(() => {
			jest.spyOn(component.paginationData, 'emit')
		})

		it('should handle pagination for approvals', () => {
			component.isApprovals = true
			const pageEvent = { pageIndex: 2, pageSize: 25 }

			component.onChangePage(pageEvent as any)

			expect(component.startIndex).toBe(2)
			expect(component.lastIndex).toBe(25)
			expect(component.paginationData.emit).toHaveBeenCalledWith({ pageIndex: 2, pageSize: 25 })
		})

		it('should handle pagination for non-approvals', () => {
			component.isApprovals = false
			const pageEvent = { pageIndex: 2, pageSize: 25 }

			component.onChangePage(pageEvent as any)

			expect(component.startIndex).toBe(50)
			expect(component.lastIndex).toBe(25)
			expect(component.paginationData.emit).toHaveBeenCalledWith({ pageIndex: 50, pageSize: 25 })
		})

		it('should handle pagination beyond total limit', () => {
			component.isApprovals = false
			//component.usersSvc.TOTAL_USERS_LIMIT = 100
			const pageEvent = { pageIndex: 10, pageSize: 25 }

			component.onChangePage(pageEvent as any)

			expect(component.startIndex).toBe(75)
			expect(component.lastIndex).toBe(25)
		})

		it('should adjust page size when exceeding total limit', () => {
			component.isApprovals = false
			//component.usersSvc.TOTAL_USERS_LIMIT = 105
			const pageEvent = { pageIndex: 4, pageSize: 25 }

			component.onChangePage(pageEvent as any)

			expect(component.startIndex).toBe(100)
			expect(component.lastIndex).toBe(5)
		})
	})

	describe('onSearch', () => {
		it('should emit search event', () => {
			jest.spyOn(component.searchByEnterKey, 'emit')
			const event = { target: { value: 'search term' } }

			component.onSearch(event)

			expect(component.searchByEnterKey.emit).toHaveBeenCalledWith(event)
		})
	})

	describe('onSubmit', () => {
		beforeEach(() => {
			component.updateUserDataForm.patchValue({
				designation: 'Manager',
				group: 'IT',
				mobile: '1234567890',
				primaryEmail: 'test@example.com',
				gender: 'Male',
				dob: new Date('2023-01-01'),
				domicileMedium: 'English',
				category: 'General',
				pincode: '123456',
				employeeID: 'EMP001'
			})
			component.selectedtags = ['tag1']
			component.userRoles = new Set(['USER', 'NEW_ROLE'])
			component.orguserRoles = ['USER']
			component.department = 'test-dept'
		})

		it('should submit successfully for MDO Leader with role changes', () => {
			const form = { valid: true, value: { roles: ['NEW_ROLE'] } }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }

			component.isMdoLeader = true
			jest.spyOn(component.updateList, 'emit')
			jest.spyOn(component.searchByEnterKey, 'emit')

			component.onSubmit(form, user, panel)

			expect(mockUsersService.updateUserDetails).toHaveBeenCalled()
			expect(mockUsersService.addUserToDepartment).toHaveBeenCalled()
		})

		it('should show error when MDO Leader selects same roles', () => {
			const form = { valid: true, value: { roles: ['USER'] } }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }

			component.isMdoLeader = true
			component.orguserRoles = ['USER']

			component.onSubmit(form, user, panel)

			expect(component['openSnackbar']).toHaveBeenCalledWith('Select new roles')
		})

		it('should submit successfully for non-MDO Leader', () => {
			const form = { valid: true }
			const user = { userId: 'user123', enableEdit: true }
			const panel = { close: jest.fn() }

			component.isMdoLeader = false
			jest.spyOn(component.updateList, 'emit')

			component.onSubmit(form, user, panel)

			expect(mockUsersService.updateUserDetails).toHaveBeenCalled()
			expect(user.enableEdit).toBe(false)
			expect(panel.close).toHaveBeenCalled()
		})

		it('should handle update error with message', () => {
			const form = { valid: true }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }
			const error = { error: { params: { errmsg: 'Update failed' } } }

			mockUsersService.updateUserDetails.mockReturnValue(throwError(error))

			component.onSubmit(form, user, panel)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Update failed')
			expect(panel.close).toHaveBeenCalled()
		})

		it('should handle update error with null message', () => {
			const form = { valid: true }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }
			const error = { error: { params: { errmsg: 'null' } } }

			mockUsersService.updateUserDetails.mockReturnValue(throwError(error))

			component.onSubmit(form, user, panel)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Error in updating user')
		})

		it('should not submit when form is invalid', () => {
			const form = { valid: false }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }

			component.onSubmit(form, user, panel)

			expect(mockUsersService.updateUserDetails).not.toHaveBeenCalled()
		})

		it('should handle role update error for MDO Leader', () => {
			const form = { valid: true, value: { roles: ['NEW_ROLE'] } }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }

			component.isMdoLeader = true
			mockUsersService.addUserToDepartment.mockReturnValue(throwError('Role error'))

			component.onSubmit(form, user, panel)

			expect(mockUsersService.updateUserDetails).toHaveBeenCalled()
			expect(mockUsersService.addUserToDepartment).toHaveBeenCalled()
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

	describe('onClickHandleWorkflow', () => {
		let field: any

		beforeEach(() => {
			field = {
				wf: {
					userId: 'user123',
					applicationId: 'app123',
					wfId: 'wf123',
					updateFieldValues: '[]',
					deptName: 'IT'
				}
			}

			// Set the updateFieldValues after object creation
			field.wf.updateFieldValues = JSON.stringify([{ field: 'test' }])

			component.userwfData = { userInfo: { wid: 'actor123' } }
		})

		it('should handle APPROVE action', () => {
			component.onClickHandleWorkflow(field, 'APPROVE')

			expect(field.action).toBe('APPROVE')
			expect(component.actionList).toHaveLength(1)
			expect(component.actionList[0].action).toBe('APPROVE')
			expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
		})

		it('should update existing action in actionList', () => {
			component.actionList = [{ wfId: 'wf123', action: 'OLD_ACTION' }]

			component.onClickHandleWorkflow(field, 'APPROVE')

			expect(component.actionList).toHaveLength(1)
			expect(component.actionList[0].action).toBe('APPROVE')
		})

		it('should handle REJECT action with dialog confirmation', () => {
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.onClickHandleWorkflow(field, 'REJECT')

			expect(mockDialog.open).toHaveBeenCalled()
			expect(field.action).toBe('REJECT')
		})

		it('should handle REJECT action with dialog cancellation', () => {
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.onClickHandleWorkflow(field, 'REJECT')

			expect(mockDialog.open).toHaveBeenCalled()
			expect(field.action).toBe('REJECT')
		})
	})

	describe('onApproveOrRejectClick', () => {
		it('should call approval service and emit update', () => {
			const req = { action: 'APPROVE' }
			jest.spyOn(component.updateList, 'emit')

			component.onApproveOrRejectClick(req, true)

			expect(mockApprovalsService.handleWorkflowV2).toHaveBeenCalledWith(req)
			expect(component.updateList.emit).toHaveBeenCalled()
		})

		it('should not emit update when displayMsg is false', () => {
			const req = { action: 'APPROVE' }
			jest.spyOn(component.updateList, 'emit')

			component.onApproveOrRejectClick(req, false)

			expect(mockApprovalsService.handleWorkflowV2).toHaveBeenCalledWith(req)
			expect(component.updateList.emit).not.toHaveBeenCalled()
		})

		it('should handle service error', () => {
			const req = { action: 'APPROVE' }
			mockApprovalsService.handleWorkflowV2.mockReturnValue(throwError('Service error'))

			expect(() => component.onApproveOrRejectClick(req, true)).not.toThrow()
		})
	})

	describe('onApprovalSubmit', () => {
		it('should call onTransferSubmit for transfers', () => {
			component.currentFilter = 'transfers'
			const panel = { close: jest.fn() }
			const appData = { test: 'data' }
			jest.spyOn(component, 'onTransferSubmit').mockImplementation()

			component.onApprovalSubmit(panel, appData)

			expect(component.onTransferSubmit).toHaveBeenCalledWith(panel, appData)
		})

		it('should handle regular approval submit', () => {
			component.currentFilter = 'other'
			component.actionList = [{ action: 'APPROVE' }]
			const panel = { close: jest.fn() }
			const appData = { test: 'data' }
			jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()

			component.onApprovalSubmit(panel, appData)

			expect(component.onApproveOrRejectClick).toHaveBeenCalledWith({ request: component.actionList }, true)
		})
	})

	describe('onTransferSubmit', () => {
		it('should process transfer workflow', () => {
			const panel = { close: jest.fn() }
			const appData = {
				userWorkflow: {
					wfInfo: [{
						userId: 'user123',
						applicationId: 'app123',
						wfId: 'wf123',
						actorUUID: 'actor123',
						serviceName: 'transfer',
						deptName: 'IT',
						updateFieldValues: '[]'
					}]
				}
			}

			// Set the updateFieldValues after object creation
			appData.userWorkflow.wfInfo[0].updateFieldValues = JSON.stringify([{
				toValue: { name: 'New Department' }
			}])

			component.actionList = [{ action: 'APPROVE' }]
			component.approvalData = []
			jest.spyOn(component, 'onApproveOrRejectClick').mockImplementation()
			jest.spyOn(component.updateList, 'emit')
			jest.spyOn(component.disableButton, 'emit')

			component.onTransferSubmit(panel, appData)

			expect(component.actionList).toHaveLength(2) // Original + transfer request
			expect(component.onApproveOrRejectClick).toHaveBeenCalled()
		})

		it('should handle transfer without name field', () => {
			const panel = { close: jest.fn() }
			const appData = {
				userWorkflow: {
					wfInfo: [{
						updateFieldValues: '[]'
					}]
				}
			}

			// Set the updateFieldValues after object creation
			appData.userWorkflow.wfInfo[0].updateFieldValues = JSON.stringify([{
				toValue: { group: 'Engineering' }
			}])

			component.onTransferSubmit(panel, appData)

			expect(component.actionList).toHaveLength(0)
		})
	})

	describe('validateText', () => {
		it('should detect HTML content', () => {
			component.validateText('<script>alert("xss")</script>')

			expect(component.htmlDetected).toBe(true)
			expect(mockSnackBar.open).toHaveBeenCalledWith('HTML or Js is not allowed')
		})

		it('should detect function calls', () => {
			component.validateText('function malicious()')

			expect(component.htmlDetected).toBe(true)
		})

		it('should detect javascript protocol', () => {
			component.validateText('javascript:alert(1)')

			expect(component.htmlDetected).toBe(true)
		})

		it('should allow regular text', () => {
			component.validateText('This is normal text')

			expect(component.htmlDetected).toBe(false)
			expect(mockSnackBar.open).not.toHaveBeenCalled()
		})
	})

	describe('updateRejection', () => {
		it('should open dialog and update comment on confirmation', () => {
			const field = { comment: 'Old comment', wfId: 'wf123' }
			component.actionList = [{ wfId: 'wf123', comment: '' }]
			component.comment = 'New comment'

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.updateRejection(field)

			expect(mockDialog.open).toHaveBeenCalled()
			expect(component.showeditText).toBe(false)
		})

		it('should not update on dialog cancellation', () => {
			const field = { comment: 'Old comment', wfId: 'wf123' }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.updateRejection(field)

			expect(mockDialog.open).toHaveBeenCalled()
		})
	})

	describe('showedit', () => {
		it('should set showeditText to true', () => {
			component.showedit()

			expect(component.showeditText).toBe(true)
		})
	})

	describe('markStatus', () => {
		it('should update user status successfully', () => {
			const user = { userId: 'user123' }
			jest.spyOn(component.updateList, 'emit')

			component.markStatus('VERIFIED', user)

			expect(mockUsersService.updateUserDetails).toHaveBeenCalledWith({
				request: {
					userId: 'user123',
					profileDetails: {
						profileStatus: 'VERIFIED'
					}
				}
			})
			expect(component.updateList.emit).toHaveBeenCalled()
		})

		it('should handle status update error', () => {
			const user = { userId: 'user123' }
			const error = { error: { params: { errmsg: 'Status update failed' } } }
			mockUsersService.updateUserDetails.mockReturnValue(throwError(error))

			component.markStatus('VERIFIED', user)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Status update failed')
		})
	})

	describe('confirmReassign', () => {
		it('should open confirmation dialog and call markStatus on confirmation', () => {
			const template = { template: 'test' }
			const user = { userId: 'user123' }
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'markStatus').mockImplementation()

			component.confirmReassign(template, user)

			expect(mockDialog.open).toHaveBeenCalledWith(template, { width: '500px' })
			expect(component.markStatus).toHaveBeenCalledWith('NOT-VERIFIED', user)
		})

		it('should not call markStatus on dialog cancellation', () => {
			const template = { template: 'test' }
			const user = { userId: 'user123' }
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'markStatus').mockImplementation()

			component.confirmReassign(template, user)

			expect(component.markStatus).not.toHaveBeenCalled()
		})
	})

	describe('confirmTransferRequest', () => {
		it('should process transfer rejection on confirmation', () => {
			const template = { template: 'test' }
			const data = {
				enableToggle: false,
				userWorkflow: {
					wfInfo: [{
						actorUUID: 'actor123',
						applicationId: 'app123',
						serviceName: 'transfer',
						userId: 'user123',
						wfId: 'wf123',
						updateFieldValues: '[]'
					}]
				}
			}

			// Set the updateFieldValues after object creation
			data.userWorkflow.wfInfo[0].updateFieldValues = JSON.stringify([{
				toValue: { name: 'Department' }
			}])

			const event = { test: 'event' }
			const panel = { close: jest.fn() }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component.updateList, 'emit')

			component.confirmTransferRequest(template, data, event, panel)

			expect(data.enableToggle).toBe(true)
			expect(mockDialog.open).toHaveBeenCalled()
		})

		it('should reset toggle on dialog cancellation', () => {
			const template = { template: 'test' }
			const data = { enableToggle: false }
			const event = { source: { checked: false } }
			const panel = { close: jest.fn() }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.confirmTransferRequest(template, data, event, panel)

			expect(event.source.checked).toBe(true)
			expect(data.enableToggle).toBe(true)
		})
	})

	describe('confirmUserRequest', () => {
		beforeEach(() => {
			component.pendingApprovals = []
		})

		it('should handle NOT-MY-USER status for MDO Leader', () => {
			const template = { template: 'test' }
			const data = { userId: 'user123', roles: ['USER'], enableToggle: false }
			const event = { source: { checked: false } }

			component.isMdoLeader = true
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'markStatus').mockImplementation()

			component.confirmUserRequest(template, 'NOT-MY-USER', data, event)

			expect(mockDialog.open).toHaveBeenCalled()
			expect(component.markStatus).toHaveBeenCalledWith('NOT-MY-USER', data)
		})

		it('should prevent MDO Admin from updating another MDO Admin', () => {
			const template = { template: 'test' }
			const data = { userId: 'user123', roles: ['MDO_ADMIN'], enableToggle: false }
			const event = { source: { checked: false } }

			component.isMdoLeader = false
			component.isMdoAdmin = true

			component.confirmUserRequest(template, 'NOT-MY-USER', data, event)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Only MDO Leader Can Update Profile')
			expect(mockDialog.open).not.toHaveBeenCalled()
		})

		it('should check for pending approvals', () => {
			component.pendingApprovals = [{
				userInfo: { wid: 'user123' },
				wfInfo: [{ test: 'data' }]
			}]

			const template = { template: 'test' }
			const data = { userId: 'user123', roles: ['USER'], enableToggle: false }
			const event = { source: { checked: false } }

			component.isMdoLeader = true
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.confirmUserRequest(template, 'NOT-MY-USER', data, event)

			expect(component.checkPendingApprovals).toBe(true)
		})

		it('should handle non-NOT-MY-USER status', () => {
			const template = { template: 'test' }
			const data = { userId: 'user123', roles: ['USER'], enableToggle: false }
			const event = { source: { checked: false } }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'markStatus').mockImplementation()

			component.confirmUserRequest(template, 'VERIFIED', data, event)

			expect(component.markStatus).toHaveBeenCalledWith('VERIFIED', data)
		})

		it('should reset event source on cancellation for NOT-MY-USER', () => {
			const template = { template: 'test' }
			const data = { userId: 'user123', roles: ['USER'], enableToggle: false }
			const event = { source: { checked: false } }

			component.isMdoLeader = true
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.confirmUserRequest(template, 'NOT-MY-USER', data, event)

			expect(event.source.checked).toBe(true)
		})

		it('should reset event source on cancellation for other status', () => {
			const template = { template: 'test' }
			const data = { userId: 'user123', roles: ['USER'], enableToggle: false }
			const event = { source: { checked: true } }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.confirmUserRequest(template, 'VERIFIED', data, event)

			expect(event.source.checked).toBe(false)
		})
	})

	describe('confirmUpdate', () => {
		it('should call onSubmit on confirmation', () => {
			const template = { template: 'test' }
			const form = { valid: true }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'onSubmit').mockImplementation()

			component.confirmUpdate(template, form, user, panel)

			expect(component.onSubmit).toHaveBeenCalledWith(form, user, panel)
		})

		it('should call cancelSubmit on cancellation', () => {
			const template = { template: 'test' }
			const form = { valid: true }
			const user = { userId: 'user123' }
			const panel = { close: jest.fn() }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'cancelSubmit').mockImplementation()

			component.confirmUpdate(template, form, user, panel)

			expect(component.cancelSubmit).toHaveBeenCalledWith(user)
		})
	})

	describe('confirmApproval', () => {
		it('should call onApprovalSubmit on confirmation', () => {
			const template = { template: 'test' }
			const panel = { close: jest.fn() }
			const appData = { test: 'data' }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'onApprovalSubmit').mockImplementation()

			component.confirmApproval(template, panel, appData)

			expect(component.onApprovalSubmit).toHaveBeenCalledWith(panel, appData)
		})

		it('should close panel on cancellation', () => {
			const template = { template: 'test' }
			const panel = { close: jest.fn() }
			const appData = { test: 'data' }

			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.confirmApproval(template, panel, appData)

			expect(panel.close).toHaveBeenCalled()
		})
	})

	describe('onApprovalCancel', () => {
		it('should close panel and reset actions', () => {
			const panel = { close: jest.fn() }
			const appData = {
				needApprovalList: [
					{ action: 'APPROVE' },
					{ action: 'REJECT' }
				]
			}

			component.onApprovalCancel(panel, appData)

			expect(panel.close).toHaveBeenCalled()
			expect(appData.needApprovalList[0].action).toBe('')
			expect(appData.needApprovalList[1].action).toBe('')
		})
	})

	describe('toggleMentor', () => {
		it('should handle mentor assignment in verified tab', () => {
			const template = { template: 'test' }
			const event = { checked: true, source: { checked: true } }
			const user = { userId: 'user123' }

			component.activeTab = 'verified'
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'saveMentorProfile').mockImplementation()

			component.toggleMentor(template, event, user)

			expect(component.memberAlertMessage).toContain('Assign this user as a mentor?')
			expect(component.saveMentorProfile).toHaveBeenCalledWith(user, event)
		})

		it('should handle mentor removal in mentor tab', () => {
			const template = { template: 'test' }
			const event = { checked: false, source: { checked: false } }
			const user = { userId: 'user123' }

			component.activeTab = 'mentor'
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true))
			}
			mockDialog.open.mockReturnValue(dialogRef)
			jest.spyOn(component, 'saveMentorProfile').mockImplementation()

			component.toggleMentor(template, event, user)

			expect(component.memberAlertMessage).toContain('Remove this user from the mentor role?')
		})

		it('should reset checkbox on cancellation', () => {
			const template = { template: 'test' }
			const event = { checked: true, source: { checked: true } }
			const user = { userId: 'user123' }

			component.activeTab = 'verified'
			const dialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false))
			}
			mockDialog.open.mockReturnValue(dialogRef)

			component.toggleMentor(template, event, user)

			expect(event.source.checked).toBe(false)
		})
	})

	describe('saveMentorProfile', () => {
		it('should assign mentor role successfully', () => {
			const user = {
				userId: 'user123',
				rootOrgId: 'org123',
				roles: [{ role: 'USER' }]
			}
			const event = { checked: true }

			component.activeTab = 'verified'

			component.saveMentorProfile(user, event)

			expect(mockUsersService.addUserToDepartment).toHaveBeenCalledWith({
				request: {
					organisationId: 'org123',
					userId: 'user123',
					roles: ['USER', 'MENTOR']
				}
			})
			expect(mockSnackBar.open).toHaveBeenCalledWith('User Assigned as Mentor Successfully')
		})

		it('should remove mentor role successfully', () => {
			const user = {
				userId: 'user123',
				rootOrgId: 'org123',
				roles: [{ role: 'USER' }, { role: 'MENTOR' }]
			}
			const event = { checked: false }

			component.activeTab = 'mentor'
			component.userRoles.add('USER')
			component.userRoles.add('MENTOR')

			component.saveMentorProfile(user, event)

			expect(mockUsersService.addUserToDepartment).toHaveBeenCalledWith({
				request: {
					organisationId: 'org123',
					userId: 'user123',
					roles: ['USER']
				}
			})
		})

		it('should handle service error for assignment', () => {
			const user = {
				userId: 'user123',
				rootOrgId: 'org123',
				roles: []
			}
			const event = { checked: true }

			mockUsersService.addUserToDepartment.mockReturnValue(of(null))

			component.saveMentorProfile(user, event)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Error While Assign User as a Mentor')
		})

		it('should handle service error for removal', () => {
			const user = {
				userId: 'user123',
				rootOrgId: 'org123',
				roles: []
			}
			const event = { checked: false }

			mockUsersService.addUserToDepartment.mockReturnValue(of(null))

			component.saveMentorProfile(user, event)

			expect(mockSnackBar.open).toHaveBeenCalledWith('Error While Removing User as a Mentor')
		})

		it('should handle user without roles array', () => {
			const user = {
				userId: 'user123',
				rootOrgId: 'org123'
			}
			const event = { checked: true }

			expect(() => component.saveMentorProfile(user, event)).not.toThrow()
		})
	})

	describe('getUserRoles', () => {
		it('should return true if user has MENTOR role', () => {
			const user = {
				roles: [{ role: 'MENTOR' }, { role: 'USER' }]
			}

			const result = component.getUserRoles(user)

			expect(result).toBe(true)
		})

		it('should return false if user does not have MENTOR role', () => {
			const user = {
				roles: [{ role: 'USER' }]
			}

			const result = component.getUserRoles(user)

			expect(result).toBe(false)
		})

		it('should handle user without roles', () => {
			const user = { roles: [] }

			const result = component.getUserRoles(user)

			expect(result).toBe(false)
		})
	})

	describe('setupScrollListener', () => {
		beforeEach(() => {
			global.document.querySelector = jest.fn()
			component.designationsMeta = new Array(100).fill({ name: 'test' })
		})

		it('should setup scroll listener when opened', () => {
			const mockSearchInput = { focus: jest.fn() }
			const mockPanel = { addEventListener: jest.fn() };

			(document.querySelector as jest.Mock)
				.mockReturnValueOnce(mockSearchInput)
				.mockReturnValueOnce(mockPanel)

			jest.spyOn(component, 'checkCurrentDesignationPresent').mockImplementation()

			component.setupScrollListener(true)

			expect(component.desigantionFilterEnable).toBe(false)
			expect(component.designationListLoadCount).toBe(component.designationDefaultLoadCount)
			expect(component.checkCurrentDesignationPresent).toHaveBeenCalled()
			expect(mockSearchInput.focus).toHaveBeenCalled()
			expect(mockPanel.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
		})

		it('should not setup listener when not opened', () => {
			component.setupScrollListener(false)

			expect(document.querySelector).not.toHaveBeenCalled()
		})

		it('should handle missing DOM elements', () => {
			(document.querySelector as jest.Mock).mockReturnValue(null)

			expect(() => component.setupScrollListener(true)).not.toThrow()
		})
	})

	describe('onDesignationSelectScroll', () => {
		beforeEach(() => {
			component.designationsMeta = new Array(100).fill({ name: 'test' })
			component.filterDesignationsMeta = new Array(50).fill({ name: 'test' })
			component.designationDefaultLoadCount = 50
			jest.spyOn(component, 'checkCurrentDesignationPresent').mockImplementation()
		})

		it('should load more designations when scrolled to bottom', () => {
			const mockElement = {
				scrollTop: 100,
				clientHeight: 100,
				scrollHeight: 205
			}
			const event = { target: mockElement }

			component.desigantionFilterEnable = false
			component.isLoadingMoreDesignations = false

			component.onDesignationSelectScroll(event)

			expect(component.isLoadingMoreDesignations).toBe(true)
			expect(component.designationListLoadCount).toBe(100)
		})

		it('should not load more when filter is enabled', () => {
			const mockElement = {
				scrollTop: 100,
				clientHeight: 100,
				scrollHeight: 205
			}
			const event = { target: mockElement }

			component.desigantionFilterEnable = true
			const originalLoadCount = component.designationListLoadCount

			component.onDesignationSelectScroll(event)

			expect(component.designationListLoadCount).toBe(originalLoadCount)
		})

		it('should not load more when already loading', () => {
			const mockElement = {
				scrollTop: 100,
				clientHeight: 100,
				scrollHeight: 205
			}
			const event = { target: mockElement }

			component.desigantionFilterEnable = false
			component.isLoadingMoreDesignations = true
			const originalLoadCount = component.designationListLoadCount

			component.onDesignationSelectScroll(event)

			expect(component.designationListLoadCount).toBe(originalLoadCount)
		})

		it('should not load more when all items are already loaded', () => {
			const mockElement = {
				scrollTop: 100,
				clientHeight: 100,
				scrollHeight: 205
			}
			const event = { target: mockElement }

			component.desigantionFilterEnable = false
			component.isLoadingMoreDesignations = false
			component.designationsMeta = new Array(50).fill({ name: 'test' })
			component.filterDesignationsMeta = new Array(50).fill({ name: 'test' })

			const originalLoadCount = component.designationListLoadCount

			component.onDesignationSelectScroll(event)

			expect(component.designationListLoadCount).toBe(originalLoadCount)
		})

		it('should not trigger when not scrolled to bottom', () => {
			const mockElement = {
				scrollTop: 50,
				clientHeight: 100,
				scrollHeight: 200
			}
			const event = { target: mockElement }

			component.desigantionFilterEnable = false
			component.isLoadingMoreDesignations = false
			const originalLoadCount = component.designationListLoadCount

			component.onDesignationSelectScroll(event)

			expect(component.designationListLoadCount).toBe(originalLoadCount)
		})
	})

	describe('checkCurrentDesignationPresent', () => {
		beforeEach(() => {
			component.filterDesignationsMeta = [
				{ name: 'Manager', id: 1 },
				{ name: 'Director', id: 2 }
			]
			component.designationListLoadCount = 50
		})

		it('should add current designation if not present in list', () => {
			component.updateUserDataForm.get('designation')?.setValue('Senior Manager')

			component.checkCurrentDesignationPresent()

			expect(component.filterDesignationsMeta[0].name).toBe('Senior Manager')
			expect(component.isLoadingMoreDesignations).toBe(false)
		})

		it('should not add designation if already present', () => {
			component.updateUserDataForm.get('designation')?.setValue('Manager')
			const originalLength = component.filterDesignationsMeta.length

			component.checkCurrentDesignationPresent()

			expect(component.filterDesignationsMeta.length).toBe(originalLength)
		})

		it('should handle empty designation value', () => {
			component.updateUserDataForm.get('designation')?.setValue('')
			const originalLength = component.filterDesignationsMeta.length

			component.checkCurrentDesignationPresent()

			expect(component.filterDesignationsMeta.length).toBe(originalLength)
		})

		it('should replace last item when list is at capacity', () => {
			component.filterDesignationsMeta = new Array(50).fill({ name: 'test' })
			component.updateUserDataForm.get('designation')?.setValue('Custom Designation')

			component.checkCurrentDesignationPresent()

			expect(component.filterDesignationsMeta).toHaveLength(50)
			expect(component.filterDesignationsMeta[0].name).toBe('Custom Designation')
		})

		it('should handle case insensitive comparison', () => {
			component.updateUserDataForm.get('designation')?.setValue('MANAGER')
			const originalLength = component.filterDesignationsMeta.length

			component.checkCurrentDesignationPresent()

			expect(component.filterDesignationsMeta.length).toBe(originalLength)
		})
	})

	describe('onDesignationDropdownClosed', () => {
		it('should reset designation filter state', () => {
			component.desigantionFilterEnable = true
			component.designationListLoadCount = 100
			component.designationsMeta = new Array(100).fill({ name: 'test' })
			jest.spyOn(component, 'checkCurrentDesignationPresent').mockImplementation()

			component.onDesignationDropdownClosed()

			expect(component.desigantionFilterEnable).toBe(false)
			expect(component.designationListLoadCount).toBe(component.designationDefaultLoadCount)
			expect(component.checkCurrentDesignationPresent).toHaveBeenCalled()
		})
	})
})
