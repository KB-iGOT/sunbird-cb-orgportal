import { CreateEventComponent } from './create-event.component'
import { UntypedFormGroup } from '@angular/forms'

// Mock moment.js with inline factory function - no external references
jest.mock('moment', () => {
	const mockMomentInstance = {
		set: jest.fn().mockReturnThis(),
		format: jest.fn().mockReturnValue('20230101T100000+0000'),
		valueOf: jest.fn().mockReturnValue(1672574400000),
		toDate: jest.fn().mockReturnValue(new Date('2023-01-01')),
		add: jest.fn().mockReturnThis(),
		subtract: jest.fn().mockReturnThis(),
		isSame: jest.fn().mockReturnValue(false),
		isAfter: jest.fn().mockReturnValue(false),
		isBefore: jest.fn().mockReturnValue(false)
	}

	const mockMoment: any = jest.fn(() => mockMomentInstance)

	// Add static methods
	mockMoment.utc = jest.fn(() => mockMomentInstance)
	mockMoment.unix = jest.fn(() => mockMomentInstance)
	mockMoment.duration = jest.fn(() => ({
		asMilliseconds: jest.fn().mockReturnValue(60000),
		asSeconds: jest.fn().mockReturnValue(60),
		asMinutes: jest.fn().mockReturnValue(1)
	}))

	return mockMoment
})

// Mock lodash with inline functions
jest.mock('lodash', () => ({
	get: jest.fn((obj, path, defaultValue) => {
		if (!obj || !path) return defaultValue
		const keys = path.split('.')
		let result = obj
		for (const key of keys) {
			if (result && typeof result === 'object' && key in result) {
				result = result[key]
			} else {
				return defaultValue
			}
		}
		return result
	}),
	camelCase: jest.fn((str) => {
		if (!str) return ''
		return str.replace(/-([a-z])/g, (g: any) => g[1].toUpperCase())
	})
}))

// Mock dependencies
const mockSnackBar = {
	open: jest.fn()
}

const mockEventsService = {
	createEvent: jest.fn(),
	publishEvent: jest.fn(),
	crreateAsset: jest.fn(),
	uploadFile: jest.fn(),
	uploadCoverImage: jest.fn(),
	updateEvent: jest.fn()
}

const mockMatDialog = {
	open: jest.fn().mockReturnValue({
		afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() })
	})
}

const mockRouter = {
	navigate: jest.fn()
}

const mockConfigService = {
	userProfile: {
		userId: 'test-user-id',
		userName: 'testUser',
		departmentName: 'Test Department'
	}
}

const mockChangeDetectorRef = {
	detectChanges: jest.fn()
}

const mockActivatedRoute = {
	snapshot: {
		data: {
			configService: {
				userProfile: {
					rootOrgId: 'test-org-id',
					departmentName: 'Test Department',
					userId: 'test-user-id',
					userName: 'testUser'
				}
			}
		}
	}
}

const mockEventService = {
	raiseInteractTelemetry: jest.fn()
}

const mockProfileUtilService = {
	emailTransform: jest.fn().mockReturnValue('test@example.com')
}

describe('CreateEventComponent', () => {
	let component: CreateEventComponent

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks()

		// Mock DOM methods
		Object.defineProperty(document, 'getElementById', {
			writable: true,
			value: jest.fn().mockReturnValue({
				click: jest.fn(),
				scrollIntoView: jest.fn()
			})
		})

		// Mock FileReader
		Object.defineProperty(window, 'FileReader', {
			writable: true,
			value: jest.fn().mockImplementation(() => ({
				onload: jest.fn(),
				onerror: jest.fn(),
				readAsDataURL: jest.fn(function () {
					this.result = 'data:image/jpeg;base64,test'
					if (this.onload) this.onload()
				}),
				readAsText: jest.fn(),
				result: null
			}))
		})

		// Mock FormData
		Object.defineProperty(window, 'FormData', {
			writable: true,
			value: jest.fn().mockImplementation(() => ({
				append: jest.fn(),
				delete: jest.fn(),
				get: jest.fn(),
				getAll: jest.fn(),
				has: jest.fn(),
				set: jest.fn()
			}))
		})

		// Mock btoa
		Object.defineProperty(window, 'btoa', {
			writable: true,
			value: jest.fn(() => 'base64encodedstring')
		})

		// Mock Uint16Array and Uint8Array for base64 encoding
		Object.defineProperty(window, 'Uint16Array', {
			writable: true,
			value: jest.fn().mockImplementation((length) => {
				const arr: any = new Array(length)
				arr.buffer = new ArrayBuffer(length * 2)
				return arr
			})
		})

		Object.defineProperty(window, 'Uint8Array', {
			writable: true,
			value: jest.fn().mockImplementation((buffer) => {
				return {
					buffer: buffer,
					reduce: jest.fn().mockReturnValue('mockReducedString')
				}
			})
		})

		// Mock String.fromCharCode
		Object.defineProperty(String, 'fromCharCode', {
			writable: true,
			value: jest.fn().mockReturnValue('mockChar')
		})

		// Create component instance
		component = new CreateEventComponent(
			mockSnackBar as any,
			mockEventsService as any,
			mockMatDialog as any,
			mockRouter as any,
			mockConfigService as any,
			mockChangeDetectorRef as any,
			mockActivatedRoute as any,
			mockEventService as any,
			mockProfileUtilService as any
		)
	})

	describe('Component Initialization', () => {
		it('should create component', () => {
			expect(component).toBeTruthy()
		})

		it('should initialize form with default values', () => {
			expect(component.createEventForm).toBeInstanceOf(UntypedFormGroup)
			expect(component.createEventForm.get('eventDurationHours')?.value).toBe(0)
			expect(component.createEventForm.get('eventDurationMinutes')?.value).toBe(30)
			expect(component.createEventForm.get('eventType')?.value).toBe('Webinar')
		})

		it('should set user profile data from config service', () => {
			expect(component.userId).toBe('test-user-id')
			expect(component.username).toBe('testUser')
			expect(component.department).toBe('Test Department')
		})

		it('should initialize date constraints', () => {
			expect(component.minDate).toBeInstanceOf(Date)
			expect(typeof component.maxDate).toBe('number')
		})

		it('should initialize arrays and objects', () => {
			expect(component.participantsArr).toEqual([])
			expect(component.presentersArr).toEqual([])
			expect(component.displayedColumns).toEqual(['fullname', 'email', 'type'])
			expect(component.pageSize).toBe(5)
			expect(component.pageSizeOptions).toEqual([5, 10, 20])
		})
	})

	describe('Form Validation', () => {
		it('should validate required fields', () => {
			const form = component.createEventForm

			expect(form.get('eventTitle')?.hasError('required')).toBeTruthy()
			expect(form.get('summary')?.hasError('required')).toBeTruthy()
			expect(form.get('description')?.hasError('required')).toBeTruthy()
			expect(form.get('agenda')?.hasError('required')).toBeTruthy()
			expect(form.get('conferenceLink')?.hasError('required')).toBeTruthy()
			expect(form.get('presenters')?.hasError('required')).toBeTruthy()
		})

		it('should validate conference link URL pattern', () => {
			const form = component.createEventForm

			form.get('conferenceLink')?.setValue('invalid-url')
			expect(form.get('conferenceLink')?.hasError('pattern')).toBeTruthy()

			form.get('conferenceLink')?.setValue('https://zoom.us/meeting/123')
			expect(form.get('conferenceLink')?.hasError('pattern')).toBeFalsy()
		})

		it('should have default values for required fields', () => {
			const form = component.createEventForm

			// These fields have default values so should not have required errors initially
			expect(form.get('eventType')?.hasError('required')).toBeFalsy()
			expect(form.get('eventDate')?.hasError('required')).toBeFalsy()
			expect(form.get('eventDurationHours')?.hasError('required')).toBeFalsy()
			expect(form.get('eventDurationMinutes')?.hasError('required')).toBeFalsy()
		})
	})

	describe('ngOnInit', () => {
		it('should initialize tabs data correctly', () => {
			component.ngOnInit()

			expect(component.tabsData).toHaveLength(4)
			expect(component.tabsData[0]).toEqual({
				name: 'Event details',
				key: 'eventInfo',
				render: true,
				enabled: true,
			})
			expect(component.tabsData[1]).toEqual({
				name: 'Date and time',
				key: 'datetime',
				render: true,
				enabled: true,
			})
			expect(component.tabsData[2]).toEqual({
				name: 'Video conferencing',
				key: 'videoinfo',
				render: true,
				enabled: true,
			})
			expect(component.tabsData[3]).toEqual({
				name: 'Presenters',
				key: 'presenter',
				render: true,
				enabled: true,
			})
		})

		it('should filter time array based on current time', () => {
			// Mock current time to be 10:30 AM
			jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10)
			jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(30)

			component.ngOnInit()

			expect(component.newtimearray).toBeDefined()
			expect(Array.isArray(component.newtimearray)).toBeTruthy()
			expect(component.orgtimeArr).toBe(component.timeArr)
		})
	})

	describe('Event Types', () => {
		it('should have correct default event types', () => {
			expect(component.eventTypes).toHaveLength(1)
			expect(component.eventTypes[0]).toEqual({
				title: 'Webinar',
				desc: 'General discussion involving',
				border: 'rgb(0, 116, 182)',
				disabled: false
			})
		})

		it('should change event type', () => {
			const mockEvent = { target: { value: 'Workshop' } }
			component.changeEventType(mockEvent)

			expect(component.createEventForm.get('eventType')?.value).toBe('Workshop')
		})
	})

	describe('Time Management', () => {
		it('should have correct time array structure', () => {
			expect(component.timeArr).toHaveLength(48)
			expect(component.timeArr[0]).toEqual({ value: '00:00' })
			expect(component.timeArr[47]).toEqual({ value: '23:30' })
		})

		it('should have correct hours and minutes lists', () => {
			expect(component.hoursList).toHaveLength(24)
			expect(component.hoursList[0]).toBe(0)
			expect(component.hoursList[23]).toBe(23)

			expect(component.minsList).toEqual([0, 15, 30, 45, 59])
		})

		it('should update time options based on selected date', () => {
			component.ngOnInit()

			const today = new Date()
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)

			// Test with today's date
			component.updateDate({ value: today })
			expect(component.timeArr).toBe(component.newtimearray)

			// Test with future date
			component.updateDate({ value: tomorrow })
			expect(component.timeArr).toBe(component.orgtimeArr)
		})
	})

	describe('Dialog Management', () => {
		it('should open participants dialog', () => {
			component.openDialog()

			expect(mockMatDialog.open).toHaveBeenCalledWith(
				expect.any(Function),
				{
					width: '850px',
					height: '600px',
				}
			)
			expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
		})

		it('should add presenters from dialog response', () => {
			const mockResponse = {
				data: {
					0: {
						id: 'user1',
						firstName: 'John',
						lastname: 'Doe',
						profileDetails: {
							personalDetails: {
								primaryEmail: 'john@example.com'
							}
						}
					}
				}
			}

			component.addPresenters(mockResponse)

			expect(component.presentersArr).toHaveLength(1)
			expect(component.participantsArr).toHaveLength(1)
			expect(component.presentersArr[0]).toEqual({
				id: 'user1',
				name: 'John'
			})
			expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
		})

		it('should handle multiple presenters', () => {
			const mockResponse = {
				data: {
					0: {
						id: 'user1',
						firstName: 'John',
						lastname: 'Doe',
						profileDetails: {
							personalDetails: {
								primaryEmail: 'john@example.com'
							}
						}
					},
					1: {
						id: 'user2',
						firstname: 'Jane', // Note: different case
						lastname: 'Smith',
						profileDetails: {
							personalDetails: {
								primaryEmail: 'jane@example.com'
							}
						}
					}
				}
			}

			component.addPresenters(mockResponse)

			expect(component.presentersArr).toHaveLength(2)
			expect(component.participantsArr).toHaveLength(2)
			expect(component.presentersArr[1]).toEqual({
				id: 'user2',
				name: 'Jane'
			})
		})
	})

	describe('File Operations', () => {
		it('should handle file selection', () => {
			const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
			const mockEvent = {
				target: {
					files: [mockFile]
				}
			}

			mockEventsService.crreateAsset.mockReturnValue({
				subscribe: jest.fn().mockImplementation((callback) => {
					callback({ result: { identifier: 'test-id' } })
					return { unsubscribe: jest.fn() }
				})
			})

			mockEventsService.uploadFile.mockReturnValue({
				subscribe: jest.fn().mockImplementation((callback) => {
					callback({ result: { artifactUrl: 'test-url' } })
					return { unsubscribe: jest.fn() }
				})
			})

			component.onFileSelect(mockEvent)

			expect(component.imageSrc).toBe(mockFile)
			expect(mockEventsService.crreateAsset).toHaveBeenCalled()
		})

		it('should handle empty file selection', () => {
			const mockEvent = {
				target: {
					files: []
				}
			}

			component.onFileSelect(mockEvent)

			expect(mockEventsService.crreateAsset).not.toHaveBeenCalled()
		})

		it('should remove selected file', () => {
			component.imageSrcURL = 'test-url'
			component.eventimageURL = 'test-event-url'

			component.removeSelectedFile()

			expect(component.imageSrcURL).toBe('')
			expect(component.eventimageURL).toBe('')
			expect(component.createEventForm.get('eventPicture')?.value).toBe('')
		})

		it('should trigger cover selection', () => {
			component.selectCover()

			expect(document.getElementById).toHaveBeenCalledWith('coverPicture')
			expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
		})
	})

	describe('Navigation', () => {
		it('should navigate to events list', () => {
			component.goToList()

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/events'])
			expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
		})

		it('should handle side nav tab clicks', () => {
			component.ngOnInit()
			component.onSideNavTabClick('eventInfo')

			expect(component.currentTab).toBe('eventInfo')
			expect(document.getElementById).toHaveBeenCalledWith('eventInfo')
			expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
		})

		it('should handle non-existent tab clicks', () => {
			component.ngOnInit()
			component.onSideNavTabClick('nonExistentTab')

			expect(component.currentTab).toBe('nonExistentTab')
			expect(document.getElementById).toHaveBeenCalledWith('nonExistentTab')
		})
	})

	describe('Utility Functions', () => {
		it('should calculate minutes correctly', () => {
			expect(component.addMinutes(2, 30)).toBe(150)
			expect(component.addMinutes(0, 45)).toBe(45)
			expect(component.addMinutes(1, 0)).toBe(60)
			expect(component.addMinutes(0, 0)).toBe(0)
		})

		it('should encode objects to base64', () => {
			const testObj = { test: 'value' }
			const result = component.encodeToBase64(testObj)

			expect(result).toHaveProperty('data')
			expect(typeof result.data).toBe('string')
			expect(window.btoa).toHaveBeenCalled()
		})

		it('should filter special characters correctly', () => {
			// Valid characters
			expect(component.omit_special_char({ charCode: 65 })).toBeTruthy() // A
			expect(component.omit_special_char({ charCode: 97 })).toBeTruthy() // a
			expect(component.omit_special_char({ charCode: 48 })).toBeTruthy() // 0
			expect(component.omit_special_char({ charCode: 57 })).toBeTruthy() // 9
			expect(component.omit_special_char({ charCode: 32 })).toBeTruthy() // space
			expect(component.omit_special_char({ charCode: 8 })).toBeTruthy()  // backspace

			// Invalid characters
			expect(component.omit_special_char({ charCode: 33 })).toBeFalsy() // !
			expect(component.omit_special_char({ charCode: 64 })).toBeFalsy() // @
			expect(component.omit_special_char({ charCode: 35 })).toBeFalsy() // #
		})

		it('should open snackbar with correct parameters', () => {
			const openSnackbar = component['openSnackbar'].bind(component)

			openSnackbar('Test message', 3000)
			expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', {
				duration: 3000
			})

			openSnackbar('Default duration')
			expect(mockSnackBar.open).toHaveBeenCalledWith('Default duration', 'X', {
				duration: 5000
			})
		})
	})

	describe('Event Creation Flow', () => {
		beforeEach(() => {
			// Setup valid form data
			component.createEventForm.patchValue({
				eventTitle: 'Test Event',
				summary: 'Test Summary',
				description: 'Test Description',
				agenda: 'Test Agenda',
				eventType: 'Webinar',
				eventDate: new Date('2023-01-01'),
				eventTime: '10:00',
				eventDurationHours: 1,
				eventDurationMinutes: 30,
				conferenceLink: 'https://zoom.us/meeting/123',
				presenters: [{ id: 'presenter1', name: 'Test Presenter' }]
			})
		})

		it('should prevent submission with zero duration', () => {
			component.createEventForm.patchValue({
				eventDurationHours: 0,
				eventDurationMinutes: 0
			})

			component.onSubmit()

			expect(component.displayLoader).toBeFalsy()
			expect(component.disableCreateButton).toBeFalsy()
			expect(mockSnackBar.open).toHaveBeenCalledWith('Duration cannot be zero', 'X', {
				duration: 5000
			})
		})

		it('should handle successful event creation', () => {
			mockEventsService.createEvent.mockReturnValue({
				subscribe: jest.fn().mockImplementation((successCallback) => {
					successCallback({
						result: {
							identifier: 'test-event-id',
							versionKey: 'test-version-key'
						}
					})
					return { unsubscribe: jest.fn() }
				})
			})

			mockEventsService.publishEvent.mockReturnValue({
				subscribe: jest.fn().mockImplementation((successCallback) => {
					successCallback({ result: 'success' })
					return { unsubscribe: jest.fn() }
				})
			})

			const showSuccessSpy = jest.spyOn(component, 'showSuccess').mockImplementation()

			component.onSubmit()

			expect(component.disableCreateButton).toBeTruthy()
			expect(component.displayLoader).toBeTruthy()
			expect(mockEventsService.createEvent).toHaveBeenCalled()
			expect(mockEventsService.publishEvent).toHaveBeenCalled()
			expect(showSuccessSpy).toHaveBeenCalled()
		})

		it('should handle event creation errors', () => {
			mockEventsService.createEvent.mockReturnValue({
				subscribe: jest.fn().mockImplementation((errorCallback) => {
					errorCallback({ error: 'Error: Creation failed' })
					return { unsubscribe: jest.fn() }
				})
			})

			component.onSubmit()

			expect(component.displayLoader).toBeFalsy()
			expect(component.disableCreateButton).toBeFalsy()
			expect(mockSnackBar.open).toHaveBeenCalledWith(' Creation failed', 'X', {
				duration: 5000
			})
		})

		it('should show success dialog', () => {
			const mockResponse = { result: 'success' }

			component.showSuccess(mockResponse)

			expect(mockMatDialog.open).toHaveBeenCalledWith(
				expect.any(Function),
				{
					width: '612px',
					height: '471px',
					data: mockResponse,
					panelClass: 'remove-overflow',
				}
			)
		})

		it('should validate form before submission', () => {
			// Clear required fields to make form invalid
			component.createEventForm.patchValue({
				eventTitle: '',
				summary: '',
				description: '',
				agenda: ''
			})

			expect(component.createEventForm.valid).toBeFalsy()
		})
	})

	describe('Publishing Events', () => {
		it('should publish event with correct parameters', () => {
			mockEventsService.publishEvent.mockReturnValue({
				subscribe: jest.fn().mockImplementation((successCallback) => {
					successCallback({ result: 'published' })
					return { unsubscribe: jest.fn() }
				})
			})

			const showSuccessSpy = jest.spyOn(component, 'showSuccess').mockImplementation()

			component.publishEvent('test-id', 'test-version')

			expect(mockEventsService.publishEvent).toHaveBeenCalledWith(
				'test-id',
				{
					request: {
						event: {
							versionKey: 'test-version',
							status: 'Live',
							identifier: 'test-id',
						},
					},
				}
			)
			expect(showSuccessSpy).toHaveBeenCalled()
		})

		it('should handle publish errors', () => {
			mockEventsService.publishEvent.mockReturnValue({
				subscribe: jest.fn().mockImplementation((errorCallback) => {
					errorCallback({ error: 'Error: Publish failed' })
					return { unsubscribe: jest.fn() }
				})
			})

			component.publishEvent('test-id', 'test-version')

			expect(mockSnackBar.open).toHaveBeenCalledWith(' Publish failed', 'X', {
				duration: 5000
			})
		})
	})

	describe('Component State Management', () => {
		it('should handle dialog close', () => {
			// Mock dialogRef
			component.dialogRef = {
				close: jest.fn()
			}

			component.close()

			expect(component.dialogRef.close).toHaveBeenCalled()
		})

		it('should handle disabled create button state', () => {
			expect(component.disableCreateButton).toBeFalsy()

			component.disableCreateButton = true
			expect(component.disableCreateButton).toBeTruthy()
		})

		it('should handle display loader state', () => {
			expect(component.displayLoader).toBeFalsy()

			component.displayLoader = true
			expect(component.displayLoader).toBeTruthy()
		})
	})

	describe('Alternative Route Configuration', () => {
		it('should handle missing config service profile', () => {
			// Create component with undefined userProfile
			const altConfigService = { userProfile: undefined }

			const altComponent = new CreateEventComponent(
				mockSnackBar as any,
				mockEventsService as any,
				mockMatDialog as any,
				mockRouter as any,
				altConfigService as any,
				mockChangeDetectorRef as any,
				mockActivatedRoute as any,
				mockEventService as any,
				mockProfileUtilService as any
			)

			expect(altComponent.departmentID).toBe('test-org-id')
			expect(altComponent.department).toBe('Test Department')
			expect(altComponent.userId).toBe('test-user-id')
			expect(altComponent.username).toBe('testUser')
		})
	})
})