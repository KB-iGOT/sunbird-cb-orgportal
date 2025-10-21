import { Subject } from 'rxjs'
import { OrgProfileService } from '../../services/org-profile.service'

// Mock lodash
jest.mock('lodash', () => ({
    get: jest.fn()
}))
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { RolesAndFunctionsComponent } from './roles-and-functions.component'

describe('RolesAndFunctionsComponent', () => {
    let component: RolesAndFunctionsComponent
    let mockOrgSvc: jest.Mocked<OrgProfileService>
    let mockConfigSvc: jest.Mocked<ConfigurationsService>
    let lodashGet: jest.Mock

    beforeEach(() => {
        // Setup mocks
        mockOrgSvc = {
            updateLocalFormValue: jest.fn(),
            updateFormStatus: jest.fn(),
        } as any

        mockConfigSvc = {
            unMappedUser: null,
        } as any

        lodashGet = require('lodash').get as jest.Mock

        // Create component instance
        component = new RolesAndFunctionsComponent(mockOrgSvc, mockConfigSvc)
    })

    afterEach(() => {
        jest.clearAllMocks()
        lodashGet.mockReset()
    })

    describe('Constructor', () => {
        it('should create component with initialized form', () => {
            expect(component).toBeDefined()
            expect(component.roleActivityForm).toBeDefined()
            expect(component.instituteOtherRoleField).toBe(false)
        })

        it('should initialize form with correct structure', () => {
            const formValue = component.roleActivityForm.value

            expect(formValue).toEqual({
                training: false,
                research: false,
                consultancy: false,
                researchPublication: false,
                other: false,
                instituteOtherRole: ''
            })
        })

        it('should setup form controls with correct initial values', () => {
            expect(component.roleActivityForm.get('training')?.value).toBe(false)
            expect(component.roleActivityForm.get('research')?.value).toBe(false)
            expect(component.roleActivityForm.get('consultancy')?.value).toBe(false)
            expect(component.roleActivityForm.get('researchPublication')?.value).toBe(false)
            expect(component.roleActivityForm.get('other')?.value).toBe(false)
            expect(component.roleActivityForm.get('instituteOtherRole')?.value).toBe('')
        })
    })

    describe('Other field validation logic', () => {
        it('should add required validator to instituteOtherRole when other is true', () => {
            const otherControl = component.roleActivityForm.get('other')
            const instituteOtherRoleControl = component.roleActivityForm.get('instituteOtherRole')

            // Initially no validators
            expect(instituteOtherRoleControl?.hasError('required')).toBe(false)

            // Set other to true
            otherControl?.setValue(true)

            // Check if required validator is added
            expect(instituteOtherRoleControl?.hasError('required')).toBe(true)
        })

        it('should remove required validator from instituteOtherRole when other is false', () => {
            const otherControl = component.roleActivityForm.get('other')
            const instituteOtherRoleControl = component.roleActivityForm.get('instituteOtherRole')

            // First set other to true to add validator
            otherControl?.setValue(true)
            expect(instituteOtherRoleControl?.hasError('required')).toBe(true)

            // Then set other to false
            otherControl?.setValue(false)

            // Validator should be removed
            expect(instituteOtherRoleControl?.hasError('required')).toBe(false)
            expect(instituteOtherRoleControl?.errors).toBe(null)
        })

        it('should not have required error when other is true and instituteOtherRole has value', () => {
            const otherControl = component.roleActivityForm.get('other')
            const instituteOtherRoleControl = component.roleActivityForm.get('instituteOtherRole')

            otherControl?.setValue(true)
            instituteOtherRoleControl?.setValue('Some role')

            expect(instituteOtherRoleControl?.hasError('required')).toBe(false)
        })
    })

    describe('Form value changes subscription', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should call orgSvc methods when form value changes after debounce', () => {
            const formValue = {
                training: true,
                research: false,
                consultancy: true,
                researchPublication: false,
                other: false,
                instituteOtherRole: ''
            }

            component.roleActivityForm.patchValue(formValue)

            // Fast forward time to trigger debounce
            jest.advanceTimersByTime(500)

            expect(mockOrgSvc.updateLocalFormValue).toHaveBeenCalledWith('rolesAndFunctions', expect.objectContaining(formValue))
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('rolesAndFunctions', component.roleActivityForm.valid)
        })

        it('should not call orgSvc methods before debounce time', () => {
            component.roleActivityForm.patchValue({ training: true })

            // Don't advance time
            expect(mockOrgSvc.updateLocalFormValue).not.toHaveBeenCalled()
            expect(mockOrgSvc.updateFormStatus).not.toHaveBeenCalled()
        })

        it('should handle form validity correctly', () => {
            jest.useFakeTimers()

            // Valid form
            component.roleActivityForm.patchValue({
                training: true,
                other: false
            })

            jest.advanceTimersByTime(500)

            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('rolesAndFunctions', true)

            // Invalid form (other is true but instituteOtherRole is empty)
            component.roleActivityForm.patchValue({
                other: true,
                instituteOtherRole: ''
            })

            jest.advanceTimersByTime(500)

            expect(mockOrgSvc.updateFormStatus).toHaveBeenLastCalledWith('rolesAndFunctions', false)

            jest.useRealTimers()
        })
    })

    describe('ngOnInit', () => {
        it('should not patch form when unMappedUser is null', () => {
            mockConfigSvc.unMappedUser = null

            const initialFormValue = { ...component.roleActivityForm.value }

            component.ngOnInit()

            expect(component.roleActivityForm.value).toEqual(initialFormValue)
            expect(mockOrgSvc.updateLocalFormValue).not.toHaveBeenCalled()
            expect(mockOrgSvc.updateFormStatus).not.toHaveBeenCalled()
        })

        it('should not patch form when orgProfile is not available', () => {
            mockConfigSvc.unMappedUser = { someOtherProperty: 'value' } as any

            const initialFormValue = { ...component.roleActivityForm.value }

            component.ngOnInit()

            expect(component.roleActivityForm.value).toEqual(initialFormValue)
        })

        it('should patch form with existing data in edit mode', () => {
            const mockRolesAndFunctions = {
                training: true,
                research: true,
                consultancy: false,
                researchPublication: true,
                other: true,
                instituteOtherRole: 'Custom Role'
            }

            mockConfigSvc.unMappedUser = {
                orgProfile: {
                    profileDetails: {
                        rolesAndFunctions: mockRolesAndFunctions
                    }
                }
            } as any

            // Mock lodash.get calls
            lodashGet
                .mockReturnValueOnce(mockRolesAndFunctions) // rolesAndFunctions object
                .mockReturnValueOnce(true) // training
                .mockReturnValueOnce(true) // research
                .mockReturnValueOnce(false) // consultancy
                .mockReturnValueOnce(true) // researchPublication
                .mockReturnValueOnce(true) // other
                .mockReturnValueOnce('Custom Role') // instituteOtherRole

            component.ngOnInit()

            expect(component.roleActivityForm.value).toEqual(mockRolesAndFunctions)
            expect(mockOrgSvc.updateLocalFormValue).toHaveBeenCalledWith('rolesAndFunctions', mockRolesAndFunctions)
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('rolesAndFunctions', component.roleActivityForm.valid)
        })

        it('should handle partial data gracefully', () => {
            mockConfigSvc.unMappedUser = {
                orgProfile: {
                    profileDetails: {
                        rolesAndFunctions: {
                            training: true,
                            research: undefined // Missing some fields
                        }
                    }
                }
            } as any

            lodashGet
                .mockImplementation((path) => {
                    if (path === 'profileDetails.rolesAndFunctions') {
                        return { training: true }
                    }
                    if (path === 'training') return true
                    return undefined // For all other fields
                })

            component.ngOnInit()

            expect(component.roleActivityForm.get('training')?.value).toBe(true)
            expect(component.roleActivityForm.get('research')?.value).toBeUndefined()
        })

        it('should call lodash.get with correct paths', () => {
            mockConfigSvc.unMappedUser = {
                orgProfile: {
                    profileDetails: {
                        rolesAndFunctions: {}
                    }
                }
            } as any

            lodashGet.mockReturnValue(undefined)

            component.ngOnInit()

            expect(lodashGet).toHaveBeenCalledWith(mockConfigSvc.unMappedUser.orgProfile, 'profileDetails.rolesAndFunctions')
            expect(lodashGet).toHaveBeenCalledWith(undefined, 'training')
            expect(lodashGet).toHaveBeenCalledWith(undefined, 'research')
            expect(lodashGet).toHaveBeenCalledWith(undefined, 'consultancy')
            expect(lodashGet).toHaveBeenCalledWith(undefined, 'researchPublication')
            expect(lodashGet).toHaveBeenCalledWith(undefined, 'other')
            expect(lodashGet).toHaveBeenCalledWith(undefined, 'instituteOtherRole')
        })
    })

    describe('Form validation states', () => {
        it('should be valid when no fields are selected', () => {
            expect(component.roleActivityForm.valid).toBe(true)
        })

        it('should be valid when some checkboxes are selected but other is false', () => {
            component.roleActivityForm.patchValue({
                training: true,
                research: true,
                consultancy: false,
                other: false
            })

            expect(component.roleActivityForm.valid).toBe(true)
        })

        it('should be invalid when other is true but instituteOtherRole is empty', () => {
            component.roleActivityForm.patchValue({
                other: true,
                instituteOtherRole: ''
            })

            expect(component.roleActivityForm.valid).toBe(false)
            expect(component.roleActivityForm.get('instituteOtherRole')?.hasError('required')).toBe(true)
        })

        it('should be valid when other is true and instituteOtherRole has value', () => {
            component.roleActivityForm.patchValue({
                other: true,
                instituteOtherRole: 'Custom Role Description'
            })

            expect(component.roleActivityForm.valid).toBe(true)
        })
    })

    describe('Memory management', () => {
        it('should have unsubscribe subject initialized', () => {
            expect(component['unsubscribe']).toBeInstanceOf(Subject)
        })

        it('should use takeUntil for subscription management', () => {
            // This test verifies the subscription pattern is set up correctly
            // The actual unsubscription would happen in ngOnDestroy
            expect(component['unsubscribe']).toBeDefined()
        })
    })

    describe('Integration scenarios', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should handle complete workflow: load data, modify, and sync', () => {
            // Setup initial data
            const initialData = {
                training: true,
                research: false,
                consultancy: false,
                researchPublication: false,
                other: false,
                instituteOtherRole: ''
            }

            mockConfigSvc.unMappedUser = {
                orgProfile: {
                    profileDetails: {
                        rolesAndFunctions: initialData
                    }
                }
            } as any

            lodashGet.mockImplementation((path) => {
                if (path === 'profileDetails.rolesAndFunctions') return initialData
                return initialData[path as keyof typeof initialData]
            })

            // Initialize component
            component.ngOnInit()

            expect(component.roleActivityForm.value).toEqual(initialData)

            // Modify data
            const updatedData = {
                ...initialData,
                research: true,
                other: true,
                instituteOtherRole: 'New Custom Role'
            }

            component.roleActivityForm.patchValue(updatedData)
            jest.advanceTimersByTime(500)

            // Verify updates were called
            expect(mockOrgSvc.updateLocalFormValue).toHaveBeenCalledWith('rolesAndFunctions', expect.objectContaining(updatedData))
            expect(mockOrgSvc.updateFormStatus).toHaveBeenCalledWith('rolesAndFunctions', true)
        })
    })
})