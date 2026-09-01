import { AddSpeakersComponent } from './add-speakers.component'
import { FormBuilder } from '@angular/forms'
import { of } from 'rxjs'

describe('AddSpeakersComponent', () => {
  let component: AddSpeakersComponent
  let mockDialogRef: any
  let mockEventsService: any
  let mockMatSnackBar: any
  const formBuilder = new FormBuilder()

  function createComponent(data: any = {}) {
    const defaultData = {
      speakersList: [],
      speakerIndex: -1,
      rootOrgId: 'org-001',
      ...data,
    }
    component = new AddSpeakersComponent(
      mockDialogRef,
      defaultData,
      formBuilder,
      mockEventsService,
      mockMatSnackBar
    )
  }

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockEventsService = { searchUser: jest.fn() }
    mockMatSnackBar = { open: jest.fn() }
    createComponent()
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise with empty speakersList when data has no speakersList', () => {
    createComponent({ speakersList: undefined })
    expect(component.speakersList).toEqual([])
  })

  it('should set speakerDetails when speakerIndex and speakersList are provided', () => {
    const existingSpeaker = { email: 'a@a.com', name: 'A' }
    createComponent({ speakersList: [existingSpeaker], speakerIndex: 0 })
    expect(component.speakerDetails).toEqual(existingSpeaker)
  })

  it('should set speakerDetails to null when speakerIndex is -1', () => {
    expect(component.speakerDetails).toBeNull()
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should initialise speakerForm with controls', () => {
      component.ngOnInit()
      expect(component.speakerForm).toBeDefined()
      expect(component.speakerForm!.controls['email']).toBeDefined()
      expect(component.speakerForm!.controls['name']).toBeDefined()
      expect(component.speakerForm!.controls['description']).toBeDefined()
    })

    it('should populate form controls from speakerDetails when editing', () => {
      const speaker = { email: 'edit@test.com', name: 'Edit User', description: 'Desc' }
      createComponent({ speakersList: [speaker], speakerIndex: 0 })
      component.ngOnInit()
      expect(component.speakerForm!.controls['email'].value).toBe('edit@test.com')
      expect(component.speakerForm!.controls['name'].value).toBe('Edit User')
    })
  })

  // ─── getUsersToShare ───────────────────────────────────────────────────────

  describe('getUsersToShare', () => {
    it('should populate filteredUsers with users from API response', () => {
      const mockResponse = {
        result: {
          response: {
            content: [
              {
                firstName: 'John',
                maskedEmail: 'j***@example.com',
                identifier: 'user-1',
                profileDetails: { personalDetails: { primaryEmail: 'john@example.com' } },
              },
            ],
          },
        },
      }
      mockEventsService.searchUser.mockReturnValue(of(mockResponse))
      component.ngOnInit()
      component.getUsersToShare('john')
      expect(mockEventsService.searchUser).toHaveBeenCalledWith('john', 'org-001')
      expect(component.filteredUsers.length).toBeGreaterThan(0)
      expect(component.filteredUsers[0].name).toBe('John')
    })

    it('should not add duplicate user to allUsers', () => {
      const mockResponse = {
        result: {
          response: {
            content: [
              {
                firstName: 'Jane',
                maskedEmail: 'j***@test.com',
                identifier: 'user-2',
                profileDetails: { personalDetails: { primaryEmail: 'jane@test.com' } },
              },
            ],
          },
        },
      }
      component.allUsers = [{ email: 'jane@test.com', name: 'Jane' }]
      mockEventsService.searchUser.mockReturnValue(of(mockResponse))
      component.ngOnInit()
      component.getUsersToShare('jane')
      expect(component.allUsers.length).toBe(1)
    })

    it('should set filteredUsers to empty when allUsers is empty after API call', () => {
      const mockResponse = {
        result: { response: { content: [] } },
      }
      mockEventsService.searchUser.mockReturnValue(of(mockResponse))
      component.ngOnInit()
      component.allUsers = []
      component.getUsersToShare('nobody')
      expect(component.filteredUsers).toEqual([])
    })

    it('should handle response without profileDetails gracefully', () => {
      const mockResponse = {
        result: {
          response: {
            content: [{ firstName: 'NoProfile' }],
          },
        },
      }
      mockEventsService.searchUser.mockReturnValue(of(mockResponse))
      component.ngOnInit()
      expect(() => component.getUsersToShare('test')).not.toThrow()
    })
  })

  // ─── selected ──────────────────────────────────────────────────────────────

  describe('selected', () => {
    it('should patch the name field when a user is selected', () => {
      component.ngOnInit()
      component.selected({ name: 'Jane Doe' })
      expect(component.speakerForm!.controls['name'].value).toBe('Jane Doe')
    })

    it('should not throw when user is null', () => {
      component.ngOnInit()
      expect(() => component.selected(null)).not.toThrow()
    })
  })

  // ─── filterSharedUsers ─────────────────────────────────────────────────────

  describe('filterSharedUsers', () => {
    beforeEach(() => {
      component.allUsers = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' },
      ]
    })

    it('should return users matching the search string', () => {
      const result = component.filterSharedUsers('john')
      expect(result.length).toBe(1)
    })

    it('should return empty array when no users match', () => {
      const result = component.filterSharedUsers('xyz')
      expect(result.length).toBe(0)
    })

    it('should return empty array when value is empty string', () => {
      const result = component.filterSharedUsers('')
      expect(result).toEqual([])
    })

    it('should return empty array when value is falsy', () => {
      const result = component.filterSharedUsers(null as any)
      expect(result).toEqual([])
    })
  })

  // ─── addSpeaker (new speaker mode) ─────────────────────────────────────────

  describe('addSpeaker — new speaker mode (speakerDetails = null)', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.speakerDetails = null
    })

    it('should add speaker and close dialog when email is unique', () => {
      component.speakerForm!.setValue({ email: 'new@test.com', name: 'New User', description: '' })
      component.speakersList = []
      component.addSpeaker()
      expect(component.speakersList.length).toBe(1)
      expect(mockDialogRef.close).toHaveBeenCalledWith({ email: 'new@test.com', name: 'New User', description: '' })
    })

    it('should show snackbar when email already exists in speakersList', () => {
      component.speakerForm!.setValue({ email: 'dup@test.com', name: 'Dup User', description: '' })
      component.speakersList = [{ email: 'dup@test.com', name: 'Existing' } as any]
      component.addSpeaker()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'There is already a speaker with the same email. Please add the speaker with a different email.'
      )
      expect(mockDialogRef.close).not.toHaveBeenCalled()
    })
  })

  // ─── addSpeaker (edit speaker mode) ────────────────────────────────────────

  describe('addSpeaker — edit speaker mode (speakerDetails set)', () => {
    const existingSpeaker = { email: 'old@test.com', name: 'Old Name' }

    beforeEach(() => {
      createComponent({ speakersList: [existingSpeaker], speakerIndex: 0 })
      component.ngOnInit()
    })

    it('should update speaker and close dialog when no email conflict', () => {
      component.speakerForm!.setValue({ email: 'old@test.com', name: 'Updated Name', description: '' })
      component.addSpeaker()
      expect(component.speakersList[0].name).toBe('Updated Name')
      expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should update speaker and close dialog when edited email is not used by another speaker', () => {
      component.speakersList = [existingSpeaker as any, { email: 'other@test.com', name: 'Other' } as any]
      component.speakerForm!.setValue({ email: 'brand-new@test.com', name: 'Updated', description: '' })
      component.addSpeaker()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })

    it('should show snackbar when edited email matches another speaker', () => {
      component.speakersList = [existingSpeaker as any, { email: 'taken@test.com', name: 'Taken' } as any]
      component.speakerForm!.setValue({ email: 'taken@test.com', name: 'Try', description: '' })
      component.addSpeaker()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'There is already a speaker with the same email. Please update speaker with a different email.'
      )
      expect(mockDialogRef.close).not.toHaveBeenCalled()
    })
  })
})
