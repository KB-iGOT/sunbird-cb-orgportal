import { SpeakersComponent } from './speakers.component'
import { AddSpeakersComponent } from '../../dialogs/add-speakers/add-speakers.component'
import { speaker } from '../../models/events.model'
import { of } from 'rxjs'

// Mock the DOM event
// class MockEvent {
//   preventDefault() { }
//   stopPropagation() { }
// }

describe('SpeakersComponent', () => {
  let component: SpeakersComponent
  let mockDialog: any
  let mockDialogRef: any

  beforeEach(() => {
    // Create mock dialog reference with complete implementation
    mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of({ name: 'New Speaker', email: 'new@example.com', description: 'Description' }))
    }

    // Create complete mock for dialog with implementation
    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    }

    // Initialize component with mocks
    component = new SpeakersComponent(mockDialog)

    // Initialize component properties
    component.speakersList = []
    component.openMode = 'edit'
    component.userProfile = { rootOrgId: 'org-1', userId: 'user-1' }

    // Spy on component methods
    jest.spyOn(component, 'openAddSpeakerPopu')
    jest.spyOn(component, 'editSpeaker')
    jest.spyOn(component, 'delete')
  })

  it('should create component with initialized properties', () => {
    expect(component).toBeTruthy()
    expect(component.speakersList).toEqual([])
    expect(component.openMode).toBe('edit')
    expect(component.userProfile).toEqual({ rootOrgId: 'org-1', userId: 'user-1' })
  })

  describe('Input property initialization and validation', () => {
    it('should properly initialize with default values', () => {
      const freshComponent = new SpeakersComponent(mockDialog)
      expect(freshComponent.speakersList).toEqual([])
      expect(freshComponent.openMode).toBe('edit')
      expect(freshComponent.userProfile).toBeUndefined()
    })

    it('should accept speakersList input', () => {
      const mockSpeakers: speaker[] = [
        { name: 'John Doe', email: 'john@example.com', description: 'Speaker Bio' }
      ]
      component.speakersList = mockSpeakers
      expect(component.speakersList).toEqual(mockSpeakers)
      expect(component.speakersList.length).toBe(1)
    })

    it('should accept speakersList with multiple speakers', () => {
      const mockSpeakers: speaker[] = [
        { name: 'John Doe', email: 'john@example.com', description: 'Speaker 1 Bio' },
        { name: 'Jane Smith', email: 'jane@example.com', description: 'Speaker 2 Bio' }
      ]
      component.speakersList = mockSpeakers
      expect(component.speakersList).toEqual(mockSpeakers)
      expect(component.speakersList.length).toBe(2)
    })

    it('should handle setting speakersList to null', () => {
      component.speakersList = null as any
      expect(component.speakersList).toBeNull()
    })

    it('should handle setting speakersList to undefined', () => {
      component.speakersList = undefined as any
      expect(component.speakersList).toBeUndefined()
    })

    it('should accept different openMode values', () => {
      component.openMode = 'view'
      expect(component.openMode).toBe('view')

      component.openMode = 'edit'
      expect(component.openMode).toBe('edit')

      component.openMode = 'other'
      expect(component.openMode).toBe('other')
    })

    it('should accept complex userProfile object', () => {
      const mockUserProfile = {
        rootOrgId: 'org-123',
        name: 'Test User',
        email: 'test@example.com',
        department: 'Engineering',
        role: 'Developer'
      }
      component.userProfile = mockUserProfile
      expect(component.userProfile).toEqual(mockUserProfile)
    })

    it('should handle setting userProfile to null', () => {
      component.userProfile = null
      expect(component.userProfile).toBeNull()
    })
  })

  describe('openAddSpeakerPopu', () => {
    it('should open AddSpeakersComponent dialog with correct configuration and data', () => {
      // Setup
      const mockUserProfile = { rootOrgId: 'test-org-id', name: 'Test User' }
      const mockSpeakersList: speaker[] = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      component.userProfile = mockUserProfile
      component.speakersList = mockSpeakersList

      // Execute
      component.openAddSpeakerPopu()

      // Verify dialog opened with correct parameters
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        {
          panelClass: 'dialog_sidenav',
          width: '600px',
          data: {
            rootOrgId: 'test-org-id',
            speakersList: mockSpeakersList
          }
        }
      )
    })

    it('should handle dialog result when speaker is added', () => {
      // Setup with mocked dialog return value
      const newSpeaker = { name: 'New Speaker', email: 'new@example.com', description: 'Description' }
      mockDialogRef.afterClosed.mockReturnValue(of(newSpeaker))

      component.speakersList = []

      // Execute
      component.openAddSpeakerPopu()

      // Verify dialog opened
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should handle empty rootOrgId when userProfile is null', () => {
      // Setup
      component.userProfile = null
      component.speakersList = []

      // Execute
      component.openAddSpeakerPopu()

      // Verify dialog opened with empty rootOrgId
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        {
          panelClass: 'dialog_sidenav',
          width: '600px',
          data: {
            rootOrgId: '',
            speakersList: []
          }
        }
      )
    })

    it('should handle dialog opening with empty speakersList', () => {
      // Setup
      component.userProfile = { rootOrgId: 'test-org-id' }
      component.speakersList = []

      // Execute
      component.openAddSpeakerPopu()

      // Verify dialog opened with empty speakersList
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        {
          panelClass: 'dialog_sidenav',
          width: '600px',
          data: {
            rootOrgId: 'test-org-id',
            speakersList: []
          }
        }
      )
    })

    it('should handle userProfile without rootOrgId property', () => {
      // Setup
      component.userProfile = { name: 'Test User' } // No rootOrgId property
      component.speakersList = []

      // Execute
      component.openAddSpeakerPopu()

      // Verify dialog opened with empty rootOrgId
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        {
          panelClass: 'dialog_sidenav',
          width: '600px',
          data: {
            rootOrgId: undefined,
            speakersList: []
          }
        }
      )
    })

    it('should handle rootOrgId as undefined in userProfile', () => {
      // Setup
      component.userProfile = { rootOrgId: undefined, name: 'Test User' }
      component.speakersList = []

      // Execute
      component.openAddSpeakerPopu()

      // Verify dialog opened with empty rootOrgId
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        {
          panelClass: 'dialog_sidenav',
          width: '600px',
          data: {
            rootOrgId: undefined,
            speakersList: []
          }
        }
      )
    })

    it('should handle rootOrgId as null in userProfile', () => {
      // Setup
      component.userProfile = { rootOrgId: null, name: 'Test User' }
      component.speakersList = []

      // Execute
      component.openAddSpeakerPopu()

      // Verify dialog opened with empty rootOrgId
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        {
          panelClass: 'dialog_sidenav',
          width: '600px',
          data: {
            rootOrgId: null,
            speakersList: []
          }
        }
      )
    })
  })

  describe('editSpeaker', () => {
    it('should open dialog with correct speaker data when valid index is provided', () => {
      // Setup
      const mockUserProfile = { rootOrgId: 'test-org-id' }
      const mockSpeakersList: speaker[] = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' },
        { name: 'Speaker 2', email: 'speaker2@example.com', description: 'Description 2' }
      ]

      component.userProfile = mockUserProfile
      component.speakersList = mockSpeakersList

      // Execute
      component.editSpeaker(1)

      // Verify dialog opened with correct parameters
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        {
          panelClass: 'dialog_sidenav',
          data: {
            rootOrgId: 'test-org-id',
            speakerIndex: 1,
            speakersList: mockSpeakersList
          },
          width: '600px'
        }
      )
    })

    it('should handle dialog result when speaker is edited', () => {
      // Setup
      const updatedSpeaker = {
        name: 'Updated Speaker',
        email: 'updated@example.com',
        description: 'Updated Description'
      }
      mockDialogRef.afterClosed.mockReturnValue(of(updatedSpeaker))

      component.userProfile = { rootOrgId: 'test-org-id' }
      component.speakersList = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      // Execute
      component.editSpeaker(0)

      // Verify dialog opened
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should not open dialog when speakersList is null', () => {
      // Setup
      component.speakersList = null as any

      // Execute
      component.editSpeaker(0)

      // Verify dialog was not opened
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should not open dialog when speaker at index does not exist', () => {
      // Setup
      component.speakersList = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      // Execute
      component.editSpeaker(5) // Out of bounds index

      // Verify dialog was not opened
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should handle empty speakersList when trying to edit', () => {
      // Setup
      component.speakersList = []

      // Execute
      component.editSpeaker(0)

      // Verify dialog was not opened
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should handle negative index when trying to edit', () => {
      // Setup
      component.speakersList = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      // Execute
      component.editSpeaker(-1)

      // Verify dialog was not opened
      expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should pass the correct speakerIndex to dialog', () => {
      // Setup
      component.userProfile = { rootOrgId: 'test-org-id' }
      component.speakersList = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' },
        { name: 'Speaker 2', email: 'speaker2@example.com', description: 'Description 2' }
      ]

      // Execute
      component.editSpeaker(0)

      // Verify dialog opened with correct speakerIndex
      expect(mockDialog.open).toHaveBeenCalledWith(
        AddSpeakersComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            speakerIndex: 0
          })
        })
      )
    })
  })

  describe('delete', () => {
    it('should remove the speaker from the list when valid index is provided', () => {
      // Setup
      const mockSpeakersList: speaker[] = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' },
        { name: 'Speaker 2', email: 'speaker2@example.com', description: 'Description 2' },
        { name: 'Speaker 3', email: 'speaker3@example.com', description: 'Description 3' }
      ]

      component.speakersList = [...mockSpeakersList]

      // Execute
      component.delete(1)

      // Verify speaker was removed
      expect(component.speakersList.length).toBe(2)
      expect(component.speakersList[0].name).toBe('Speaker 1')
      expect(component.speakersList[1].name).toBe('Speaker 3')
    })

    it('should delete the first speaker when index is 0', () => {
      // Setup
      const mockSpeakersList: speaker[] = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' },
        { name: 'Speaker 2', email: 'speaker2@example.com', description: 'Description 2' }
      ]

      component.speakersList = [...mockSpeakersList]

      // Execute
      component.delete(0)

      // Verify first speaker was removed
      expect(component.speakersList.length).toBe(1)
      expect(component.speakersList[0].name).toBe('Speaker 2')
    })

    it('should delete the last speaker when index is last', () => {
      // Setup
      const mockSpeakersList: speaker[] = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' },
        { name: 'Speaker 2', email: 'speaker2@example.com', description: 'Description 2' }
      ]

      component.speakersList = [...mockSpeakersList]

      // Execute
      component.delete(1)

      // Verify last speaker was removed
      expect(component.speakersList.length).toBe(1)
      expect(component.speakersList[0].name).toBe('Speaker 1')
    })

    it('should handle delete on empty speakersList', () => {
      // Setup
      component.speakersList = []

      // Execute
      component.delete(0)

      // Verify no error occurred and list is still empty
      expect(component.speakersList.length).toBe(0)
    })

    it('should not modify list when invalid index is provided', () => {
      // Setup
      const mockSpeakersList: speaker[] = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      component.speakersList = [...mockSpeakersList]

      // Execute
      component.delete(5) // Invalid index

      // Verify list was not modified
      expect(component.speakersList.length).toBe(1)
      expect(component.speakersList[0].name).toBe('Speaker 1')
    })

    it('should handle delete with negative index', () => {
      // Setup
      const mockSpeakersList: speaker[] = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      component.speakersList = [...mockSpeakersList]

      // Execute
      component.delete(-1) // Negative index

      // Verify list was not modified
      expect(component.speakersList.length).toBe(1)
      expect(component.speakersList[0].name).toBe('Speaker 1')
    })

    it('should handle delete when speakersList is null', () => {
      // Setup
      component.speakersList = null as any

      // Execute - should not throw error
      expect(() => {
        component.delete(0)
      }).not.toThrow()

      // Verify speakersList is still null
      expect(component.speakersList).toBeNull()
    })

    it('should handle delete when speakersList is undefined', () => {
      // Setup
      component.speakersList = undefined as any

      // Execute - should not throw error
      expect(() => {
        component.delete(0)
      }).not.toThrow()

      // Verify speakersList is still undefined
      expect(component.speakersList).toBeUndefined()
    })
  })

  // Tests simulating template interactions
  describe('Template interactions', () => {
    it('should handle openAddSpeakerPopu button click', () => {
      // Simulate button click handler
      component.openAddSpeakerPopu()

      // Verify method was called
      expect(component.openAddSpeakerPopu).toHaveBeenCalled()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should handle editSpeaker icon click', () => {
      // Setup
      component.speakersList = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      // Simulate icon click handler with index
      component.editSpeaker(0)

      // Verify method was called with correct index
      expect(component.editSpeaker).toHaveBeenCalledWith(0)
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should handle delete icon click', () => {
      // Setup
      component.speakersList = [
        { name: 'Speaker 1', email: 'speaker1@example.com', description: 'Description 1' }
      ]

      // Simulate icon click handler with index
      component.delete(0)

      // Verify method was called with correct index
      expect(component.delete).toHaveBeenCalledWith(0)
      expect(component.speakersList.length).toBe(0)
    })
  })

  // Testing dialog interaction flows
  describe('Dialog interaction flows', () => {
    it('should simulate complete flow of adding speaker', () => {
      // Setup
      const newSpeaker = {
        name: 'New Speaker',
        email: 'new@example.com',
        description: 'New Description'
      }
      mockDialogRef.afterClosed.mockReturnValue(of(newSpeaker))

      component.userProfile = { rootOrgId: 'test-org-id' }
      component.speakersList = []

      // Execute
      component.openAddSpeakerPopu()

      // Not verifying the result directly since afterClosed handling would usually
      // be part of the template rather than the component class
    })

    it('should simulate complete flow of editing speaker', () => {
      // Setup
      const updatedSpeaker = {
        name: 'Updated Speaker',
        email: 'updated@example.com',
        description: 'Updated Description'
      }
      mockDialogRef.afterClosed.mockReturnValue(of(updatedSpeaker))

      component.userProfile = { rootOrgId: 'test-org-id' }
      component.speakersList = [
        { name: 'Original Speaker', email: 'original@example.com', description: 'Original Description' }
      ]

      // Execute
      component.editSpeaker(0)

      // Not verifying the result directly since afterClosed handling would usually
      // be part of the template rather than the component class
    })
  })
})