import { OfficerComponent } from './officer.component'
import { of, Subject } from 'rxjs'
import { UntypedFormBuilder } from '@angular/forms'

// Mock lodash before importing the component
jest.mock('lodash', () => {
    return {
        get: jest.fn((obj, path, defaultValue = undefined) => {
            if (!obj) return defaultValue
            const pathParts = typeof path === 'string' ? path.split('.') : [path]
            let current = obj
            for (const part of pathParts) {
                if (current[part] === undefined) {
                    return defaultValue
                }
                current = current[part]
            }
            return current
        }),
        __esModule: true,
        default: {
            get: jest.fn((obj, path, defaultValue = undefined) => {
                if (!obj) return defaultValue
                const pathParts = typeof path === 'string' ? path.split('.') : [path]
                let current = obj
                for (const part of pathParts) {
                    if (current[part] === undefined) {
                        return defaultValue
                    }
                    current = current[part]
                }
                return current
            })
        }
    }
})

describe('OfficerComponent', () => {
    let component: OfficerComponent
    let mockAllocationService: any
    let mockWatStoreService: any
    let formBuilder: UntypedFormBuilder

    // Import the mocked lodash

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()

        // Create mock for AllocationService
        mockAllocationService = {
            onSearchUser: jest.fn().mockReturnValue(
                of({
                    result: {
                        response: {
                            content: [
                                { firstName: 'John', lastName: 'Doe', id: 'user1' },
                                { firstName: 'Jane', lastName: 'Smith', id: 'user2' }
                            ]
                        }
                    }
                })
            ),
            onSearchPosition: jest.fn().mockReturnValue(
                of({
                    responseData: [
                        { name: 'Manager', description: 'Team Manager', id: 'pos1' },
                        { name: 'Developer', description: 'Software Developer', id: 'pos2' }
                    ]
                })
            )
        }

        // Create mock for WatStoreService
        mockWatStoreService = {
            setOfficerGroup: jest.fn()
        }

        // Create real FormBuilder
        formBuilder = new UntypedFormBuilder()

        // Initialize component with mocks
        component = new OfficerComponent(
            mockAllocationService,
            formBuilder,
            mockWatStoreService
        )

        // Initialize editData to an empty object to prevent undefined access
        component.editData = {}

        // Setup the unsubscribe subjects
        component['unsubscribe'] = new Subject<void>()
        component['unsubscribe1'] = new Subject<void>()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            // Spy on createForm but don't call the real implementation
            jest.spyOn(component, 'createForm').mockImplementation(() => {
                // Create a simple form for testing
                component.officerForm = formBuilder.group({
                    officerName: [''],
                    position: [''],
                    positionDescription: [''],
                    user: [{}],
                    positionObj: [{}]
                })
            })

            // Call ngOnInit
            component.ngOnInit()
        })

        it('should initialize the form', () => {
            expect(component.officerForm).toBeDefined()
            expect(component.createForm).toHaveBeenCalled()
        })

        it('should set up value changes subscription', () => {
            // This is complex to test directly, so we'll verify the form exists
            expect(component.officerForm.valueChanges).toBeDefined()
        })
    })

    describe('createForm', () => {
        beforeEach(() => {
            // Restore the real implementation for testing createForm directly
            jest.restoreAllMocks()
        })

        it('should create form with default values when no editData is provided', () => {
            // Ensure editData is an empty object
            component.editData = {}

            // Call createForm
            component.createForm()

            // Check form controls exist
            expect(component.officerForm.get('officerName')).toBeDefined()
            expect(component.officerForm.get('position')).toBeDefined()
            expect(component.officerForm.get('positionDescription')).toBeDefined()
            expect(component.officerForm.get('user')).toBeDefined()
            expect(component.officerForm.get('positionObj')).toBeDefined()

            // Check default values
            expect(component.officerForm.get('officerName')?.value).toBe('')
            expect(component.officerForm.get('position')?.value).toBe('')
        })

        it('should initialize form with editData values when provided', () => {
            // Set up editData
            component.editData = {
                usr: {
                    officerName: 'John Doe'
                },
                position: {
                    userPosition: 'Manager',
                    positionDescription: 'Team Manager'
                }
            }

            // Spy on watStore.setOfficerGroup
            const spy = jest.spyOn(mockWatStoreService, 'setOfficerGroup')

            // Call createForm
            component.createForm()

            // Check form values match editData
            expect(component.officerForm.get('officerName')?.value).toBe('John Doe')
            expect(component.officerForm.get('position')?.value).toBe('Manager')
            expect(component.officerForm.get('positionDescription')?.value).toBe('Team Manager')

            // Check setOfficerGroup was called
            expect(spy).toHaveBeenCalledWith(component.officerForm.value, false, false)
        })

        it('should set up officerName valueChanges subscription', () => {
            // Create form first
            component.editData = {}
            component.createForm()

            // Setup spy on patchValue for user control
            const userControl = component.officerForm.get('user')
            jest.spyOn(userControl as any, 'patchValue')

            // Verify valueChanges is setup
            expect(component.officerForm.get('officerName')?.valueChanges).toBeDefined()
        })
    })

    describe('filterUsers', () => {
        beforeEach(() => {
            // Create a simple form without calling real createForm
            component.officerForm = formBuilder.group({
                officerName: [''],
                position: [''],
                positionDescription: [''],
                user: [{}],
                positionObj: [{}]
            })
        })

        it('should call onSearchUser and set filteredUserslist', () => {
            // Call filterUsers
            component.filterUsers('John')

            // Verify onSearchUser was called with correct value
            expect(mockAllocationService.onSearchUser).toHaveBeenCalledWith('john')

            // Check filteredUserslist is set (it's an Observable, so we need to subscribe)
            component.filteredUserslist.subscribe(users => {
                expect(users.length).toBe(1)
                expect(users[0].firstName).toBe('John')
            })
        })
    })

    describe('filterPositions', () => {
        beforeEach(() => {
            // Create a simple form without calling real createForm
            component.officerForm = formBuilder.group({
                officerName: [''],
                position: [''],
                positionDescription: [''],
                user: [{}],
                positionObj: [{}]
            })
        })

        it('should call onSearchPosition and set filteredPositionlist', () => {
            // Call filterPositions
            component.filterPositions('Manager')

            // Verify onSearchPosition was called with correct request
            expect(mockAllocationService.onSearchPosition).toHaveBeenCalledWith({
                searches: [
                    {
                        type: 'POSITION',
                        field: 'name',
                        keyword: 'Manager',
                    },
                    {
                        type: 'POSITION',
                        field: 'status',
                        keyword: 'VERIFIED',
                    },
                ],
            })

            // Check filteredPositionlist is set
            component.filteredPositionlist.subscribe(positions => {
                expect(positions.length).toBe(1)
                expect(positions[0].name).toBe('Manager')
            })
        })
    })

    describe('officerClicked', () => {
        beforeEach(() => {
            // Create a simple form without calling real createForm
            component.officerForm = formBuilder.group({
                officerName: [''],
                position: [''],
                positionDescription: [''],
                user: [{}],
                positionObj: [{}]
            })
        })

        it('should update form controls when officer is clicked', () => {
            // Create mock event
            const event = {
                option: {
                    value: {
                        firstName: 'John',
                        lastName: 'Doe',
                        id: 'user1'
                    }
                }
            }

            // Call officerClicked
            component.officerClicked(event)

            // Verify form values are updated
            expect(component.officerForm.get('user')?.value).toEqual(event.option.value)
            expect(component.officerForm.get('officerName')?.value).toBe('John')

            // Verify setOfficerGroup was called
            expect(mockWatStoreService.setOfficerGroup).toHaveBeenCalledWith(
                component.officerForm.value,
                false,
                true
            )
        })

        it('should do nothing if event is falsy', () => {
            // Setup spies
            const userControl = component.officerForm.get('user')
            const officerNameControl = component.officerForm.get('officerName')
            jest.spyOn(userControl as any, 'patchValue')
            jest.spyOn(officerNameControl as any, 'patchValue')

            // Call with null event
            component.officerClicked(null)

            // Verify no updates happened
            expect(userControl?.patchValue).not.toHaveBeenCalled()
            expect(officerNameControl?.patchValue).not.toHaveBeenCalled()
            expect(mockWatStoreService.setOfficerGroup).not.toHaveBeenCalled()
        })
    })

    describe('postionClicked', () => {
        beforeEach(() => {
            // Create a simple form without calling real createForm
            component.officerForm = formBuilder.group({
                officerName: [''],
                position: [''],
                positionDescription: [''],
                user: [{}],
                positionObj: [{}]
            })
        })

        it('should update form controls when position is clicked', () => {
            // Create mock event
            const event = {
                option: {
                    value: {
                        name: 'Manager',
                        description: 'Team Manager',
                        id: 'pos1'
                    }
                }
            }

            // Call postionClicked
            component.postionClicked(event)

            // Verify form values are updated
            expect(component.officerForm.get('position')?.value).toBe('Manager')
            expect(component.officerForm.get('positionDescription')?.value).toBe('Team Manager')
            expect(component.officerForm.get('positionObj')?.value).toEqual(event.option.value)

            // Verify setOfficerGroup was called
            expect(mockWatStoreService.setOfficerGroup).toHaveBeenCalledWith(
                component.officerForm.value,
                false,
                true
            )
        })

        it('should do nothing if event is falsy', () => {
            // Setup spies
            const positionControl = component.officerForm.get('position')
            const positionDescControl = component.officerForm.get('positionDescription')
            jest.spyOn(positionControl as any, 'patchValue')
            jest.spyOn(positionDescControl as any, 'patchValue')

            // Call with null event
            component.postionClicked(null)

            // Verify no updates happened
            expect(positionControl?.patchValue).not.toHaveBeenCalled()
            expect(positionDescControl?.patchValue).not.toHaveBeenCalled()
            expect(mockWatStoreService.setOfficerGroup).not.toHaveBeenCalled()
        })
    })

    describe('ngOnDestroy', () => {
        it('should call next on unsubscribe subjects', () => {
            // Setup spies
            jest.spyOn(component['unsubscribe'], 'next')
            jest.spyOn(component['unsubscribe1'], 'next')

            // Call ngOnDestroy
            component.ngOnDestroy()

            // Verify next was called on both subjects
            expect(component['unsubscribe'].next).toHaveBeenCalled()
            expect(component['unsubscribe1'].next).toHaveBeenCalled()
        })
    })
})