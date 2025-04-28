import { AddModeratorComponent, User } from './add-moderator.component'
import { FormControl, FormGroup } from '@angular/forms'
import { of } from 'rxjs'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'

describe('AddModeratorComponent', () => {
  let component: AddModeratorComponent
  let mockActivatedRoute: any
  let mockCommunityService: any
  let mockFormGroup: FormGroup

  // Sample user data
  const mockUsers = [
    {
      identifier: 'user1',
      firstName: 'John',
      profileDetails: {
        personalDetails: {
          primaryEmail: 'john@example.com'
        }
      }
    },
    {
      identifier: 'user2',
      firstName: 'Jane',
      profileDetails: {
        personalDetails: {
          primaryEmail: 'jane@example.com'
        }
      }
    }
  ]

  beforeEach(() => {
    // Setup mock Activated Route
    mockActivatedRoute = {
      parent: {
        snapshot: {
          data: {
            configService: {
              unMappedUser: {
                rootOrgId: 'test-org-id'
              }
            }
          }
        }
      }
    }

    // Setup mock Community Service
    mockCommunityService = {
      getUserDetails: jest.fn().mockReturnValue(
        of({
          result: {
            response: {
              content: mockUsers
            }
          }
        })
      )
    }

    // Create form group with moderators control
    mockFormGroup = new FormGroup({
      moderators: new FormControl([])
    })

    // Create component with mocks
    component = new AddModeratorComponent(mockActivatedRoute, mockCommunityService)
    component.communityDetailsForm = mockFormGroup
    component.openMode = 'create'
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should initialize with empty selectedUser array for create mode', () => {
      // Act
      component.ngOnInit()

      // Assert
      expect(component.selectedUser).toEqual([])
    })

    it('should load selectedUser from form for edit mode', () => {
      // Arrange
      const moderators = [
        { moderatorId: 'mod1', moderatorName: 'Moderator 1', moderatorEmail: 'mod1@example.com' }
      ]
      component.communityDetailsForm.patchValue({ moderators })
      component.openMode = 'edit'

      // Act
      component.ngOnInit()

      // Assert
      expect(component.selectedUser).toEqual(moderators)
    })

    it('should call getUserDetails on init', () => {
      // Act
      component.ngOnInit()

      // Assert
      expect(mockCommunityService.getUserDetails).toHaveBeenCalled()
    })

    it('should set up filteredOptions observable', () => {
      // Act
      component.ngOnInit()

      // Verify filteredOptions is initialized
      expect(component.filteredOptions).toBeDefined()

      // Subscribe to verify it emits values
      component.filteredOptions.subscribe(options => {
        expect(Array.isArray(options)).toBe(true)
      })
    })

    it('should filter options when control value changes', () => {
      // Arrange
      component.ngOnInit()

      // Act - simulate input change
      component.myControl.setValue('john')

      // Assert - should filter to just John
      component.filteredOptions.subscribe(filtered => {
        expect(filtered.length).toBe(1)
        expect(filtered[0].firstName).toBe('John')
      })
    })
  })

  describe('displayFn', () => {
    it('should return empty string for null input', () => {
      expect(component.displayFn(null as unknown as User)).toBe('')
    })

    it('should return email if available', () => {
      const user = {
        name: 'Test User',
        firstName: 'Test',
        profileDetails: {
          personalDetails: {
            primaryEmail: 'test@example.com'
          }
        }
      }
      expect(component.displayFn(user)).toBe('test@example.com')
    })

    it('should fallback to name if email not available', () => {
      const user = {
        name: 'Test User',
        firstName: 'Test'
      }
      expect(component.displayFn(user)).toBe('Test User')
    })


  })

  describe('_filter', () => {

    it('should filter by email', () => {
      const result = component['_filter']('john@example')
      expect(result.length).toBe(1)
      expect(result[0].firstName).toBe('John')
    })

    it('should filter by name', () => {
      const result = component['_filter']('jane')
      expect(result.length).toBe(1)
      expect(result[0].firstName).toBe('Jane')
    })

    it('should be case insensitive', () => {
      const result = component['_filter']('JOHN')
      expect(result.length).toBe(1)
      expect(result[0].firstName).toBe('John')
    })

    it('should return empty array when no matches', () => {
      const result = component['_filter']('nonexistent')
      expect(result.length).toBe(0)
    })
  })

  describe('getUserDetails', () => {
    it('should make API call with correct request body', () => {
      // Arrange
      const searchQuery = 'test'

      // Act
      component.getUserDetails(searchQuery)

      // Assert
      expect(mockCommunityService.getUserDetails).toHaveBeenCalledWith({
        request: {
          filters: {
            rootOrgId: 'test-org-id',
            'profileDetails.profileStatus': ['VERIFIED'],
            'roles.role': 'COMMUNITY_MODERATOR'
          },
          limit: 20,
          offset: 0,
          query: searchQuery,
          sort_by: {
            firstName: 'asc'
          }
        }
      })
    })

    it('should update options and filteredOptions on success', () => {
      // Act
      component.getUserDetails('')

      // Assert
      expect(component.options).toEqual(mockUsers)

      // Check filteredOptions was updated
      component.filteredOptions.subscribe(filtered => {
        expect(filtered).toEqual(mockUsers)
      })
    })
  })

  describe('onOptionSelected', () => {
    it('should add selected user to selectedUser array', () => {
      // Arrange
      const mockEvent = {
        option: {
          value: mockUsers[0]
        }
      } as MatAutocompleteSelectedEvent

      // Act
      component.onOptionSelected(mockEvent)

      // Assert
      expect(component.selectedUser.length).toBe(1)
      expect(component.selectedUser[0]).toEqual({
        moderatorId: 'user1',
        moderatorName: 'John',
        moderatorEmail: 'john@example.com'
      })
    })

    it('should reset the input control', () => {
      // Arrange
      const mockEvent = {
        option: {
          value: mockUsers[0]
        }
      } as MatAutocompleteSelectedEvent

      // Spy on control reset
      jest.spyOn(component.myControl, 'reset')

      // Act
      component.onOptionSelected(mockEvent)

      // Assert
      expect(component.myControl.reset).toHaveBeenCalledWith('')
    })

    it('should update the form with new moderators', () => {
      // Arrange
      const mockEvent = {
        option: {
          value: mockUsers[0]
        }
      } as MatAutocompleteSelectedEvent

      // Spy on patchValueToForm
      jest.spyOn(component, 'patchValueToForm')

      // Act
      component.onOptionSelected(mockEvent)

      // Assert
      expect(component.patchValueToForm).toHaveBeenCalled()
    })
  })

  describe('isUserSelected', () => {
    it('should return true if user is already selected', () => {
      // Arrange
      component.communityDetailsForm.patchValue({
        moderators: [
          { moderatorId: 'user1', moderatorName: 'John', moderatorEmail: 'john@example.com' }
        ]
      })

      // Act & Assert
      expect(component.isUserSelected({ identifier: 'user1' })).toBe(true)
    })

    it('should return false if user is not selected', () => {
      // Arrange
      component.communityDetailsForm.patchValue({
        moderators: [
          { moderatorId: 'user2', moderatorName: 'Jane', moderatorEmail: 'jane@example.com' }
        ]
      })

      // Act & Assert
      expect(component.isUserSelected({ identifier: 'user1' })).toBe(false)
    })
  })

  describe('removeUser', () => {
    beforeEach(() => {
      // Setup initial selectedUser array
      component.selectedUser = [
        { moderatorId: 'user1', moderatorName: 'John', moderatorEmail: 'john@example.com' },
        { moderatorId: 'user2', moderatorName: 'Jane', moderatorEmail: 'jane@example.com' }
      ]
    })

    it('should remove user by identifier', () => {
      // Act
      component.removeUser({ identifier: 'user1' })

      // Assert
      expect(component.selectedUser.length).toBe(1)
      expect(component.selectedUser[0].moderatorId).toBe('user2')
    })

    it('should remove user by moderatorId', () => {
      // Act
      component.removeUser({ moderatorId: 'user2' })

      // Assert
      expect(component.selectedUser.length).toBe(1)
      expect(component.selectedUser[0].moderatorId).toBe('user1')
    })

    it('should update form after removing user', () => {
      // Spy on patchValueToForm
      jest.spyOn(component, 'patchValueToForm')

      // Act
      component.removeUser({ moderatorId: 'user1' })

      // Assert
      expect(component.patchValueToForm).toHaveBeenCalled()
    })
  })

  describe('patchValueToForm', () => {
    it('should update moderators in form', () => {
      // Arrange
      component.selectedUser = [
        { moderatorId: 'user1', moderatorName: 'John', moderatorEmail: 'john@example.com' }
      ]

      // Spy on form patchValue
      jest.spyOn(component.communityDetailsForm, 'patchValue')

      // Act
      component.patchValueToForm()

      // Assert
      expect(component.communityDetailsForm.patchValue).toHaveBeenCalledWith({
        moderators: component.selectedUser
      })
    })
  })

  describe('clearAll', () => {
    it('should empty selectedUser array', () => {
      // Arrange
      component.selectedUser = [
        { moderatorId: 'user1', moderatorName: 'John', moderatorEmail: 'john@example.com' }
      ]

      // Act
      component.clearAll()

      // Assert
      expect(component.selectedUser).toEqual([])
    })

    it('should update form after clearing', () => {
      // Spy on patchValueToForm
      jest.spyOn(component, 'patchValueToForm')

      // Act
      component.clearAll()

      // Assert
      expect(component.patchValueToForm).toHaveBeenCalled()
    })
  })
})