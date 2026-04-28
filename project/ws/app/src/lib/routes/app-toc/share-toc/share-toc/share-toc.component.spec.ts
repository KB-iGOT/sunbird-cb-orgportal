import { of, throwError, Subject } from 'rxjs'
import { ShareTocComponent } from './share-toc.component'
import { WsEvents } from '@sunbird-cb/utils-v2'

describe('ShareTocComponent', () => {
  let component: ShareTocComponent
  let mockUserAutoComplete: any
  let mockLangTranslations: any
  let mockSnackBar: any
  let mockConfigSvc: any
  let mockTocSvc: any
  let mockEvents: any

  const mockContent = {
    identifier: 'content-123',
    name: 'Test Course',
    primaryCategory: 'Course',
    organisation: ['TestOrg'],
    posterImage: 'https://example.com/poster.png',
    source: 'TestSource',
  }

  beforeEach(() => {
    mockUserAutoComplete = {
      searchUser: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } })),
    }

    mockLangTranslations = {
      translateActualLabel: jest.fn().mockImplementation((label: string) => label),
    }

    mockSnackBar = {
      open: jest.fn(),
    }

    mockConfigSvc = {
      userProfile: { userId: 'user-001' },
    }

    mockTocSvc = {
      shareContent: jest.fn().mockReturnValue(of({ responseCode: 'OK' })),
    }

    mockEvents = {
      raiseInteractTelemetry: jest.fn(),
    }

    component = new ShareTocComponent(
      mockUserAutoComplete,
      mockLangTranslations,
      mockSnackBar,
      mockConfigSvc,
      mockTocSvc,
      mockEvents,
    )
    component.content = mockContent
    component.contentLink = 'https://example.com/course'
    component.rootOrgId = 'root-org-001'
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Constructor & initialization
  // ──────────────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize shareForm with review control', () => {
    expect(component.shareForm).toBeDefined()
    expect(component.shareForm?.get('review')).toBeDefined()
  })

  it('should initialize users as empty array', () => {
    expect(component.users).toEqual([])
  })

  it('ngOnInit should run without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getUsersToShare
  // ──────────────────────────────────────────────────────────────────────────
  describe('getUsersToShare', () => {
    it('should call searchUser with queryStr and rootOrgId', () => {
      component.getUsersToShare('john')
      expect(mockUserAutoComplete.searchUser).toHaveBeenCalledWith('john', 'root-org-001')
    })

    it('should set showLoader to true while searching', () => {
      mockUserAutoComplete.searchUser.mockReturnValue(new Subject())
      component.getUsersToShare('john')
      expect(component.showLoader).toBe(true)
    })

    it('should populate allUsers from api response with profileDetails', () => {
      const mockApiData = [{
        identifier: 'u1',
        firstName: 'John Doe',
        maskedEmail: 'j***@test.com',
        profileDetails: { personalDetails: { primaryEmail: 'john@test.com' } },
      }]
      mockUserAutoComplete.searchUser.mockReturnValue(of({
        result: { response: { content: mockApiData } },
      }))
      component.getUsersToShare('john')
      expect(component.allUsers.length).toBeGreaterThan(0)
      expect(component.allUsers[0].email).toBe('john@test.com')
    })

    it('should not add duplicate users by email', () => {
      const mockApiData = [{
        identifier: 'u1',
        firstName: 'John',
        maskedEmail: 'j***@test.com',
        profileDetails: { personalDetails: { primaryEmail: 'john@test.com' } },
      }]
      mockUserAutoComplete.searchUser.mockReturnValue(of({
        result: { response: { content: mockApiData } },
      }))
      component.getUsersToShare('john')
      component.getUsersToShare('john')
      const count = component.allUsers.filter((u: any) => u.email === 'john@test.com').length
      expect(count).toBe(1)
    })

    it('should skip user if no profileDetails', () => {
      const mockApiData = [{
        identifier: 'u2',
        firstName: 'Jane',
        maskedEmail: 'j***@test.com',
      }]
      mockUserAutoComplete.searchUser.mockReturnValue(of({
        result: { response: { content: mockApiData } },
      }))
      component.getUsersToShare('jane')
      expect(component.allUsers.length).toBe(0)
    })

    it('should set filteredUsers from filterSharedUsers result', () => {
      const mockApiData = [{
        identifier: 'u1',
        firstName: 'Alice Smith',
        maskedEmail: 'a***@test.com',
        profileDetails: { personalDetails: { primaryEmail: 'alice@test.com' } },
      }]
      mockUserAutoComplete.searchUser.mockReturnValue(of({
        result: { response: { content: mockApiData } },
      }))
      component.getUsersToShare('alice')
      expect(component.filteredUsers).toBeDefined()
    })

    it('should set showLoader false after response', () => {
      const mockApiData = [{
        identifier: 'u1',
        firstName: 'Bob',
        maskedEmail: 'b***@test.com',
        profileDetails: { personalDetails: { primaryEmail: 'bob@test.com' } },
      }]
      mockUserAutoComplete.searchUser.mockReturnValue(of({
        result: { response: { content: mockApiData } },
      }))
      component.getUsersToShare('bob')
      expect(component.showLoader).toBe(false)
    })

    it('should set filteredUsers to empty when allUsers is empty', () => {
      mockUserAutoComplete.searchUser.mockReturnValue(of({
        result: { response: { content: [] } },
      }))
      component.getUsersToShare('xyz')
      expect(component.filteredUsers).toEqual([])
    })

    it('should handle response with no result property', () => {
      mockUserAutoComplete.searchUser.mockReturnValue(of({}))
      expect(() => component.getUsersToShare('test')).not.toThrow()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // translateLabels
  // ──────────────────────────────────────────────────────────────────────────
  describe('translateLabels', () => {
    it('should call langtranslations.translateActualLabel', () => {
      component.translateLabels('maxLimit', 'contentSharing', '')
      expect(mockLangTranslations.translateActualLabel).toHaveBeenCalledWith('maxLimit', 'contentSharing', '')
    })

    it('should return translated label', () => {
      mockLangTranslations.translateActualLabel.mockReturnValue('Max limit reached')
      const result = component.translateLabels('maxLimit', 'contentSharing')
      expect(result).toBe('Max limit reached')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // add()
  // ──────────────────────────────────────────────────────────────────────────
  describe('add', () => {
    const getEvent = (value: string, input?: any) => ({
      value,
      input: input || { value: '' },
      chipInput: {} as any,
    })

    beforeEach(() => {
      component.matAutocomplete = { isOpen: false } as any
    })

    it('should add valid email to users', () => {
      jest.useFakeTimers()
      jest.spyOn(document, 'getElementsByClassName').mockReturnValue([{ scrollTop: 0, scrollHeight: 100 }] as any)
      component.add(getEvent('test@example.com') as any)
      expect(component.users).toContain('test@example.com')
    })

    it('should show snackbar for invalid email', () => {
      component.add(getEvent('invalid-email') as any)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should show snackbar when max emails limit reached', () => {
      component.users = Array(30).fill('test@a.com')
      component.add(getEvent('new@example.com') as any)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should show snackbar for duplicate email', () => {
      component.users = ['test@example.com']
      component.add(getEvent('test@example.com') as any)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should not add when autocomplete is open', () => {
      component.matAutocomplete = { isOpen: true } as any
      component.add(getEvent('test@example.com') as any)
      expect(component.users.length).toBe(0)
    })

    it('should not add when event value is empty', () => {
      component.add(getEvent('') as any)
      expect(component.users.length).toBe(0)
    })

    it('should clear input after adding valid email', () => {
      jest.useFakeTimers()
      jest.spyOn(document, 'getElementsByClassName').mockReturnValue([{ scrollTop: 0, scrollHeight: 100 }] as any)
      const inputEl = { value: 'test@example.com' }
      component.add(getEvent('test@example.com', inputEl) as any)
      expect(inputEl.value).toBe('')
    })

    it('should scroll chip list after adding', () => {
      jest.useFakeTimers()
      const el = [{ scrollTop: 0, scrollHeight: 200 }]
      jest.spyOn(document, 'getElementsByClassName').mockReturnValue(el as any)
      component.add(getEvent('valid@email.com') as any)
      jest.runAllTimers()
      expect(el[0].scrollTop).toBe(200)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // remove()
  // ──────────────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should remove user from users array', () => {
      component.users = ['alice@test.com', 'bob@test.com']
      component.remove('alice@test.com')
      expect(component.users).not.toContain('alice@test.com')
    })

    it('should not modify array when user not found', () => {
      component.users = ['alice@test.com']
      component.remove('notexist@test.com')
      expect(component.users.length).toBe(1)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // selected()
  // ──────────────────────────────────────────────────────────────────────────
  describe('selected', () => {
    const getSelectEvent = (value: string) => ({ option: { value } }) as any

    beforeEach(() => {
      jest.useFakeTimers()
      jest.spyOn(document, 'getElementsByClassName').mockReturnValue([{ scrollTop: 0, scrollHeight: 100 }] as any)
      component.userInput = { nativeElement: { value: 'typing' } } as any
    })

    it('should add selected user to users array', () => {
      component.selected(getSelectEvent('Alice'))
      expect(component.users).toContain('Alice')
    })

    it('should show snackbar when max limit reached', () => {
      component.users = Array(30).fill('user')
      component.selected(getSelectEvent('Bob'))
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should show snackbar for duplicate user', () => {
      component.users = ['Alice']
      component.selected(getSelectEvent('Alice'))
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should clear userInput value after selection', () => {
      component.selected(getSelectEvent('NewUser'))
      expect(component.userInput?.nativeElement.value).toBe('')
    })

    it('should reset userCtrl value after selection', () => {
      component.selected(getSelectEvent('NewUser'))
      expect(component.userCtrl.value).toBe('')
    })

    it('should scroll chip list after selection', () => {
      const el = [{ scrollTop: 0, scrollHeight: 300 }]
      jest.spyOn(document, 'getElementsByClassName').mockReturnValue(el as any)
      component.selected(getSelectEvent('NewUser'))
      jest.runAllTimers()
      expect(el[0].scrollTop).toBe(300)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // filterSharedUsers()
  // ──────────────────────────────────────────────────────────────────────────
  describe('filterSharedUsers', () => {
    beforeEach(() => {
      component.allUsers = [
        { name: 'Alice Smith', email: 'alice@test.com' },
        { name: 'Bob Jones', email: 'bob@test.com' },
      ]
    })

    it('should return users matching the filter value', () => {
      const result = component.filterSharedUsers('alice')
      expect(result.length).toBe(1)
      expect((result[0] as any).name).toBe('Alice Smith')
    })

    it('should return empty array when value is empty', () => {
      const result = component.filterSharedUsers('')
      expect(result).toEqual([])
    })

    it('should return empty array when no users match', () => {
      const result = component.filterSharedUsers('xyz')
      expect(result).toEqual([])
    })

    it('should be case-insensitive', () => {
      const result = component.filterSharedUsers('ALICE')
      expect(result.length).toBe(1)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // submitSharing()
  // ──────────────────────────────────────────────────────────────────────────
  describe('submitSharing', () => {
    beforeEach(() => {
      component.allUsers = [
        { id: 'u1', name: 'Alice', email: 'alice@test.com' },
      ]
    })

    it('should call tocSvc.shareContent with email recipient', () => {
      component.users = ['test@example.com']
      component.submitSharing()
      expect(mockTocSvc.shareContent).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({ courseId: 'content-123' }),
        }),
      )
    })

    it('should call tocSvc.shareContent with named user resolved from allUsers', () => {
      component.users = ['Alice']
      component.submitSharing()
      expect(mockTocSvc.shareContent).toHaveBeenCalled()
    })

    it('should show success snackbar on OK response', () => {
      component.users = ['test@example.com']
      mockTocSvc.shareContent.mockReturnValue(of({ responseCode: 'OK' }))
      component.submitSharing()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should reset users after successful share', () => {
      component.users = ['test@example.com']
      component.submitSharing()
      expect(component.users).toEqual([])
    })

    it('should reset allUsers and filteredUsers after share', () => {
      component.users = ['test@example.com']
      component.submitSharing()
      expect(component.allUsers).toEqual([])
      expect(component.filteredUsers).toEqual([])
    })

    it('should not call shareContent when no valid recipients', () => {
      component.users = []
      component.submitSharing()
      expect(mockTocSvc.shareContent).not.toHaveBeenCalled()
    })

    it('should not call shareContent for named user not found in allUsers', () => {
      component.users = ['UnknownUser']
      component.submitSharing()
      expect(mockTocSvc.shareContent).not.toHaveBeenCalled()
    })

    it('should call openSnackbar error on service error', () => {
      component.users = ['test@example.com']
      mockTocSvc.shareContent.mockReturnValue(throwError(() => new Error('fail')))
      component.submitSharing()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should use contentLink from input', () => {
      component.users = ['test@example.com']
      component.contentLink = 'https://course-link.com'
      component.submitSharing()
      expect(mockTocSvc.shareContent).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({ courseLink: 'https://course-link.com' }),
        }),
      )
    })

    it('should build courseProvider from content.organisation', () => {
      component.users = ['test@example.com']
      component.submitSharing()
      expect(mockTocSvc.shareContent).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({ courseProvider: 'TestOrg' }),
        }),
      )
    })

    it('should handle null content gracefully', () => {
      component.content = null
      component.users = ['test@example.com']
      expect(() => component.submitSharing()).not.toThrow()
    })

    it('should emit resetEnableShare after share', () => {
      const spy = jest.spyOn(component.resetEnableShare, 'emit')
      component.users = ['test@example.com']
      component.submitSharing()
      expect(spy).toHaveBeenCalledWith(false)
    })

    it('should use appIcon as posterImage when posterImage not available', () => {
      component.content = { ...mockContent, posterImage: undefined, appIcon: 'icon.png' }
      component.users = ['test@example.com']
      component.submitSharing()
      expect(mockTocSvc.shareContent).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({ coursePosterImageUrl: 'icon.png' }),
        }),
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // onClose()
  // ──────────────────────────────────────────────────────────────────────────
  describe('onClose', () => {
    it('should reset users on close', () => {
      component.users = ['a@b.com']
      component.onClose()
      expect(component.users).toEqual([])
    })

    it('should reset filteredUsers on close', () => {
      component.filteredUsers = ['a', 'b'] as any
      component.onClose()
      expect(component.filteredUsers).toEqual([])
    })

    it('should reset allUsers on close', () => {
      component.allUsers = ['x'] as any
      component.onClose()
      expect(component.allUsers).toEqual([])
    })

    it('should emit resetEnableShare on close', () => {
      const spy = jest.spyOn(component.resetEnableShare, 'emit')
      component.onClose()
      expect(spy).toHaveBeenCalledWith(false)
    })

    it('should raise telemetry on close', () => {
      component.onClose()
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // copyToClipboard()
  // ──────────────────────────────────────────────────────────────────────────
  describe('copyToClipboard', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'execCommand', {
        value: jest.fn().mockReturnValue(true),
        writable: true,
        configurable: true,
      })
    })

    it('should call openSnackbar with linkCopied message', () => {
      const textArea = {
        value: '',
        select: jest.fn(),
      }
      jest.spyOn(document, 'createElement').mockReturnValue(textArea as any)
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => textArea as any)
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => textArea as any)

      component.copyToClipboard()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should raise telemetry for copyToClipboard', () => {
      const textArea = { value: '', select: jest.fn() }
      jest.spyOn(document, 'createElement').mockReturnValue(textArea as any)
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => textArea as any)
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => textArea as any)

      component.copyToClipboard()
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({ subType: 'copyToClipboard' }),
        expect.anything(),
        expect.anything(),
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // raiseTelemetry()
  // ──────────────────────────────────────────────────────────────────────────
  describe('raiseTelemetry', () => {
    it('should call events.raiseInteractTelemetry with correct type', () => {
      component.raiseTelemetry('shareClose')
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click', subType: 'shareClose' }),
        expect.objectContaining({ id: 'content-123' }),
        expect.objectContaining({ module: WsEvents.EnumTelemetrymodules.CONTENT }),
      )
    })

    it('should handle null content gracefully', () => {
      component.content = null
      expect(() => component.raiseTelemetry('test')).not.toThrow()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // resetEnableShareFlag()
  // ──────────────────────────────────────────────────────────────────────────
  describe('resetEnableShareFlag', () => {
    it('should emit false via resetEnableShare', () => {
      const spy = jest.spyOn(component.resetEnableShare, 'emit')
      component.resetEnableShareFlag()
      expect(spy).toHaveBeenCalledWith(false)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // userCtrl valueChanges (debounced search)
  // ──────────────────────────────────────────────────────────────────────────
  describe('userCtrl valueChanges', () => {
    it('should trigger getUsersToShare when input changes', () => {
      jest.useFakeTimers()
      const spy = jest.spyOn(component, 'getUsersToShare')
      component.userCtrl.setValue('alice')
      jest.advanceTimersByTime(300)
      expect(spy).toHaveBeenCalledWith('alice')
    })

    it('should not trigger getUsersToShare for empty input', () => {
      jest.useFakeTimers()
      const spy = jest.spyOn(component, 'getUsersToShare')
      component.userCtrl.setValue('')
      jest.advanceTimersByTime(300)
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
