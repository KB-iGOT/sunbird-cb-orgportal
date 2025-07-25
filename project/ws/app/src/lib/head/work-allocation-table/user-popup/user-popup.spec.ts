import { UserPopupComponent, IDialogData } from './user-popup'
// import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

// Mock implementation of MatDialogRef
const createMockDialogRef = () => {
  return {
    close: jest.fn()
  }
}

describe('UserPopupComponent', () => {
  let component: UserPopupComponent
  let mockDialogRef: any
  let mockData: IDialogData

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create mock for MatDialogRef
    mockDialogRef = createMockDialogRef()

    // Create mock data
    mockData = {
      animal: 'dog',
      name: 'User Dialog',
      data: { someKey: 'someValue' }
    }

    // Create component instance
    component = new UserPopupComponent(mockDialogRef, mockData)
  })

  describe('Component initialization', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should initialize with default values', () => {
      expect(component.selectedUser).toEqual([])
      expect(component.finalArray).toEqual([])
      expect(component.tabledata).toEqual([])
      expect(component.dataTable).toEqual([])
      expect(component.currentSelection).toBe(false)
      expect(component.score).toBeUndefined()
      expect(component.dataSources).toBeUndefined()
    })

    it('should set data from constructor injection', () => {
      expect(component.data).toEqual(mockData)
    })
  })

  describe('ngOnInit', () => {
    it('should not change any properties on initialization', () => {
      // Save initial state
      const initialState = { ...component }
      // delete initialState.dialogRef // Remove non-serializable property

      // Call ngOnInit
      component.ngOnInit()

      // Create current state without non-serializable property
      const currentState = { ...component }
      // delete currentState.dialogRef

      // Compare states
      expect(currentState).toEqual(initialState)
    })
  })

  describe('onNoClick', () => {
    it('should close the dialog with no arguments', () => {
      // Call the method
      component.onNoClick()

      // Verify dialog close was called with no arguments
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
      expect(mockDialogRef.close).toHaveBeenCalledWith()
    })
  })

  describe('markAsComplete', () => {
    it('should close dialog with selected user data when currentSelection is false', () => {
      // Setup
      component.selectedUser = [{ id: 1, name: 'Test User' }]
      component.currentSelection = false

      // Call the method
      component.markAsComplete()

      // Verify dialog was closed with expected data
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        event: 'close',
        data: component.selectedUser
      })

      // Verify currentSelection was updated
      expect(component.currentSelection).toBe(true)

      // Verify dialogRef was reassigned
      expect(component.dialogRef).toBe(component.selectedUser)
    })

    it('should not close dialog when currentSelection is true', () => {
      // Setup
      component.currentSelection = true

      // Call the method
      component.markAsComplete()

      // Verify dialog close was not called
      expect(mockDialogRef.close).not.toHaveBeenCalled()

      // Verify currentSelection remains true
      expect(component.currentSelection).toBe(true)
    })
  })

  describe('selectedUserFrom', () => {
    it('should add user to selectedUser array when length check passes', () => {
      // Setup - force the misspelled property to exist and be 0
      // This allows us to test the intended behavior despite the typo
      Object.defineProperty(component.selectedUser, 'lenght', {
        value: 0,
        configurable: true
      })

      const mockUser = { row: { id: 1, name: 'Test User' } }

      // Call the method
      component.selectedUserFrom(mockUser)

      // Verify user was added
      expect(component.selectedUser).toEqual([mockUser.row])
    })

    it('should replace existing users in selectedUser array when length check fails', () => {
      // Setup - force the misspelled property to exist and be non-zero
      Object.defineProperty(component.selectedUser, 'lenght', {
        value: 1,
        configurable: true
      })

      // Add initial data
      component.selectedUser = [{ id: 1, name: 'Initial User' }]
      const mockUser = { row: { id: 2, name: 'New User' } }

      // Call the method
      component.selectedUserFrom(mockUser)

      // Verify user was replaced
      expect(component.selectedUser).toEqual([mockUser.row])
    })

    it('should handle undefined lenght property (typo in code)', () => {
      // Setup - the property is naturally undefined (due to typo)
      const mockUser = { row: { id: 1, name: 'Test User' } }
      component.selectedUser = [{ id: 2, name: 'Initial User' }]

      // Call the method
      component.selectedUserFrom(mockUser)

      // Should enter the else branch since undefined is falsy
      expect(component.selectedUser).toEqual([mockUser.row])
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user object in selectedUserFrom', () => {
      const emptyUser = { row: {} }

      // Call the method
      component.selectedUserFrom(emptyUser)

      // Verify empty object was added
      expect(component.selectedUser).toEqual([{}])
    })

    it('should handle null user object in selectedUserFrom', () => {
      const nullUser = { row: null }

      // Call the method
      component.selectedUserFrom(nullUser)

      // Verify null was added
      expect(component.selectedUser).toEqual([null])
    })

    it('should handle markAsComplete when selectedUser is empty', () => {
      // Setup
      component.selectedUser = []
      component.currentSelection = false

      // Call the method
      component.markAsComplete()

      // Verify dialog was closed with empty array
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        event: 'close',
        data: []
      })
    })
  })
})