import { FormBuilder, FormControl } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { SimpleChange } from '@angular/core'
import { EventDetailsComponent } from './event-details.component'

describe('EventDetailsComponent', () => {
  let component: EventDetailsComponent
  let mockSnackBar: any
  let mockLoaderService: any
  let mockEventSvc: any
  let mockActivatedRoute: any
  let mockDialog: any

  const defaultEventDetailsData: any = {
    status: 'draft',
    prevStatus: '',
    speakerDetails: '[]',
    preEventReads: [],
    registrationLink: 'https://example.com',
    meetingAgenda: 'Test Agenda',
    noOfAttendes: 10,
    eventDuration: 60,
    meetingSummary: 'Summary',
    postEventSummary: [],
    courseLinked: '',
    endDateTime: '2020-01-01T00:00:00',
    startDateTime: '2030-01-01T00:00:00',
    maxEnrolments: 100,
  }

  beforeEach(() => {
    const formBuilder = new FormBuilder()

    mockSnackBar = { open: jest.fn() }
    mockLoaderService = { changeLoaderState: jest.fn() }
    mockEventSvc = {
      getUserSearchList: jest.fn().mockReturnValue(of({ content: [] })),
      getCourseDetails: jest.fn().mockReturnValue(null),
      createContent: jest.fn().mockReturnValue(of({ result: { identifier: 'test-id' } })),
      uploadContent: jest.fn().mockReturnValue(of({ result: { artifactUrl: 'https://example.com/file.pdf' } })),
    }
    mockActivatedRoute = {
      snapshot: {
        data: {
          configService: {
            userProfile: {
              rootOrgId: 'org1',
              departmentName: 'IT Dept',
              userName: 'testuser',
              userId: 'user1',
            },
          },
        },
        queryParams: {},
      },
    }
    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(true)) }),
    }

    component = new EventDetailsComponent(
      formBuilder,
      mockSnackBar,
      mockLoaderService,
      mockEventSvc,
      mockActivatedRoute as any,
      mockDialog
    )

    component.eventDetailsData = { ...defaultEventDetailsData }
    component.openMode = 'edit'
    component.openTab = 'draft'
    component.eventStatus = ''
  })

  // ─── ngOnChanges ───────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should call disableLiveEventEditing when eventStatus changes to live and is not first change', () => {
      component.initializeForms()
      const spy = jest.spyOn(component, 'disableLiveEventEditing')
      component.ngOnChanges({ eventStatus: new SimpleChange('', 'live', false) })
      expect(spy).toHaveBeenCalled()
    })

    it('should not call disableLiveEventEditing on first change', () => {
      component.initializeForms()
      const spy = jest.spyOn(component, 'disableLiveEventEditing')
      component.ngOnChanges({ eventStatus: new SimpleChange(null, 'live', true) })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not call disableLiveEventEditing when value is not live', () => {
      component.initializeForms()
      const spy = jest.spyOn(component, 'disableLiveEventEditing')
      component.ngOnChanges({ eventStatus: new SimpleChange('', 'draft', false) })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not throw when eventStatus key is absent', () => {
      component.initializeForms()
      expect(() => component.ngOnChanges({})).not.toThrow()
    })
  })

  // ─── disableLiveEventEditing ───────────────────────────────────────────────

  describe('disableLiveEventEditing', () => {
    it('should disable agenda, selectedSpeaker, speakerType controls', () => {
      component.initializeForms()
      component.openMode = 'edit'
      component.openTab = 'other'
      component.eventStatus = 'draft'
      component.disableLiveEventEditing()
      expect(component.preEventForm.get('agenda')?.disabled).toBe(true)
      expect(component.preEventForm.get('selectedSpeaker')?.disabled).toBe(true)
      expect(component.preEventForm.get('speakerType')?.disabled).toBe(true)
    })

    it('should enable meetingLink when checkIfLiveEvent is true', () => {
      component.initializeForms()
      component.openMode = 'edit'
      component.openTab = 'draft'
      component.eventStatus = 'live'
      component.disableLiveEventEditing()
      expect(component.preEventForm.get('meetingLink')?.enabled).toBe(true)
    })

    it('should not throw when preEventForm is not yet initialized', () => {
      expect(() => component.disableLiveEventEditing()).not.toThrow()
    })
  })

  // ─── checkIfLiveEvent getter ───────────────────────────────────────────────

  describe('checkIfLiveEvent getter', () => {
    it('should return false when openMode is view', () => {
      component.openMode = 'view'
      component.openTab = 'draft'
      component.eventStatus = 'live'
      expect(component.checkIfLiveEvent).toBe(false)
    })

    it('should return true when openTab is draft and eventStatus is live', () => {
      component.openMode = 'edit'
      component.openTab = 'draft'
      component.eventStatus = 'live'
      expect(component.checkIfLiveEvent).toBe(true)
    })

    it('should return true when openTab is Rejected (case-insensitive) and eventStatus is live', () => {
      component.openMode = 'edit'
      component.openTab = 'Rejected'
      component.eventStatus = 'live'
      expect(component.checkIfLiveEvent).toBe(true)
    })

    it('should return true when openTab is Upcoming (case-insensitive) and eventStatus is live', () => {
      component.openMode = 'edit'
      component.openTab = 'Upcoming'
      component.eventStatus = 'live'
      expect(component.checkIfLiveEvent).toBe(true)
    })

    it('should return false when eventStatus is not live', () => {
      component.openMode = 'edit'
      component.openTab = 'draft'
      component.eventStatus = 'draft'
      expect(component.checkIfLiveEvent).toBe(false)
    })
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call initializeForms, applyFormRulesBasedOnStatus and patchFormValues', () => {
      const initSpy = jest.spyOn(component, 'initializeForms')
      const applySpy = jest.spyOn(component, 'applyFormRulesBasedOnStatus')
      const patchSpy = jest.spyOn(component, 'patchFormValues')
      component.ngOnInit()
      expect(initSpy).toHaveBeenCalled()
      expect(applySpy).toHaveBeenCalled()
      expect(patchSpy).toHaveBeenCalled()
    })

    it('should set isPreEventExpanded to false when pathUrl is past', () => {
      mockActivatedRoute.snapshot.queryParams = { pathUrl: 'past' }
      component.ngOnInit()
      expect(component.isPreEventExpanded).toBe(false)
    })

    it('should emit preEventFormReady and postEventFormReady', () => {
      const preSpy = jest.spyOn(component.preEventFormReady, 'emit')
      const postSpy = jest.spyOn(component.postEventFormReady, 'emit')
      component.ngOnInit()
      expect(preSpy).toHaveBeenCalled()
      expect(postSpy).toHaveBeenCalled()
    })

    it('should call onSpeakerSearch when speakerCtrl emits a string value', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      const spy = jest.spyOn(component, 'onSpeakerSearch')
      component.speakerCtrl.setValue('test')
      jest.advanceTimersByTime(600)
      expect(spy).toHaveBeenCalledWith('test')
      jest.useRealTimers()
    })

    it('should not call onSpeakerSearch when speakerCtrl emits a non-string value', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      const spy = jest.spyOn(component, 'onSpeakerSearch')
        ; (component.speakerCtrl as any).setValue({ id: 1 })
      jest.advanceTimersByTime(600)
      expect(spy).not.toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('should set userProfile from activatedRoute', () => {
      component.ngOnInit()
      expect(component.userProfile).toBeDefined()
    })
  })

  // ─── initializeForms ───────────────────────────────────────────────────────

  describe('initializeForms', () => {
    it('should define preEventForm and postEventForm', () => {
      component.initializeForms()
      expect(component.preEventForm).toBeDefined()
      expect(component.postEventForm).toBeDefined()
    })

    it('should create the expected controls in preEventForm', () => {
      component.initializeForms()
      expect(component.preEventForm.get('preEventReads')).not.toBeNull()
      expect(component.preEventForm.get('meetingLink')).not.toBeNull()
      expect(component.preEventForm.get('agenda')).not.toBeNull()
      expect(component.preEventForm.get('selectedSpeaker')).not.toBeNull()
      expect(component.preEventForm.get('speakerType')).not.toBeNull()
    })

    it('should create the expected controls in postEventForm', () => {
      component.initializeForms()
      expect(component.postEventForm.get('recordedMediaLink')).not.toBeNull()
      expect(component.postEventForm.get('noOfAttendes')).not.toBeNull()
      expect(component.postEventForm.get('eventDuration')).not.toBeNull()
      expect(component.postEventForm.get('meetingSummary')).not.toBeNull()
      expect(component.postEventForm.get('postEventSummary')).not.toBeNull()
    })
  })

  // ─── applyFormRulesBasedOnStatus ───────────────────────────────────────────

  describe('applyFormRulesBasedOnStatus', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should enable preEventForm and disable postEventForm for draft status', () => {
      component.eventDetailsData.status = 'draft'
      component.applyFormRulesBasedOnStatus()
      expect(component.isDraft).toBe(true)
      expect(component.preEventForm.enabled).toBe(true)
      expect(component.postEventForm.disabled).toBe(true)
    })

    it('should treat rejected with no prevStatus as draft', () => {
      component.eventDetailsData.status = 'rejected'
      component.eventDetailsData.prevStatus = ''
      component.applyFormRulesBasedOnStatus()
      expect(component.isDraft).toBe(true)
    })

    it('should enable postEventForm for a live event with past endDateTime', () => {
      component.eventDetailsData.status = 'live'
      component.eventDetailsData.endDateTime = '2020-01-01T00:00:00'
      component.eventDetailsData.startDateTime = '2020-01-01T00:00:00'
      component.applyFormRulesBasedOnStatus()
      expect(component.postEventForm.enabled).toBe(true)
      expect(component.preEventForm.disabled).toBe(true)
    })

    it('should enable only meetingLink for upcoming live event', () => {
      component.eventDetailsData.status = 'live'
      component.eventDetailsData.endDateTime = '2030-01-01T00:00:00'
      component.eventDetailsData.startDateTime = '2030-06-01T00:00:00'
      component.applyFormRulesBasedOnStatus()
      expect(component.preEventForm.get('meetingLink')?.enabled).toBe(true)
    })

    it('should disable both forms for view mode', () => {
      component.openMode = 'view'
      component.eventDetailsData.status = 'draft'
      component.applyFormRulesBasedOnStatus()
      expect(component.preEventForm.disabled).toBe(true)
      expect(component.postEventForm.disabled).toBe(true)
    })

    it('should disable both forms for published non-live status', () => {
      component.eventDetailsData.status = 'published'
      component.eventDetailsData.endDateTime = '2020-01-01T00:00:00'
      component.eventDetailsData.startDateTime = '2020-01-01T00:00:00'
      component.applyFormRulesBasedOnStatus()
      expect(component.preEventForm.disabled).toBe(true)
    })

    it('should call disableLiveEventEditing when eventStatus is live', () => {
      component.eventStatus = 'live'
      component.eventDetailsData.status = 'draft'
      const spy = jest.spyOn(component, 'disableLiveEventEditing')
      component.applyFormRulesBasedOnStatus()
      expect(spy).toHaveBeenCalled()
    })

    it('should set isDraft to false in view mode even when status is draft', () => {
      component.openMode = 'view'
      component.eventDetailsData.status = 'draft'
      component.applyFormRulesBasedOnStatus()
      expect(component.isDraft).toBe(false)
    })
  })

  // ─── patchFormValues ───────────────────────────────────────────────────────

  describe('patchFormValues', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should patch meetingLink from registrationLink', () => {
      component.patchFormValues()
      expect(component.preEventForm.get('meetingLink')?.value).toBe('https://example.com')
    })

    it('should handle string speakerDetails by parsing JSON (multiple speakers stay in list)', () => {
      // 2 speakers → getSpeakerType sets type to 'others' but does NOT clear selectedSpeaker
      component.eventDetailsData.speakerDetails = '[{"id":"1","name":"John"},{"id":"2","name":"Jane"}]'
      component.patchFormValues()
      const value = component.preEventForm.get('selectedSpeaker')?.value
      expect(Array.isArray(value)).toBe(true)
      expect(value.length).toBe(2)
    })

    it('should handle empty string speakerDetails (getSpeakerType resets selectedSpeaker to empty string)', () => {
      component.eventDetailsData.speakerDetails = ''
      component.patchFormValues()
      // getSpeakerType falls to else branch and calls setValue('') after patching
      expect(component.preEventForm.get('selectedSpeaker')?.value).toBe('')
    })

    it('should handle array speakerDetails and preserve value when multiple speakers', () => {
      component.eventDetailsData.speakerDetails = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }]
      component.patchFormValues()
      const value = component.preEventForm.get('selectedSpeaker')?.value
      expect(Array.isArray(value)).toBe(true)
      expect(value.length).toBe(2)
    })

    it('should fall back gracefully on invalid JSON speakerDetails (selectedSpeaker reset to string by getSpeakerType)', () => {
      component.eventDetailsData.speakerDetails = 'invalid json{'
      // Does not throw and form control has a defined value
      expect(() => component.patchFormValues()).not.toThrow()
      expect(component.preEventForm.get('selectedSpeaker')).not.toBeNull()
    })

    it('should show uploaded doc when preEventReads has a value', () => {
      component.eventDetailsData.preEventReads = ['https://example.com/doc.pdf']
      component.patchFormValues()
      expect(component.showUploadedDoc).toBe(true)
    })

    it('should show uploaded summary doc and set isSavedPostEvent when postEventSummary has value', () => {
      component.eventDetailsData.postEventSummary = ['https://example.com/summary.pdf']
      component.patchFormValues()
      expect(component.showUploadedSummaryDoc).toBe(true)
      expect(component.isSavedPostEvent).toBe(true)
    })

    it('should patch noOfAttendes and eventDuration into postEventForm', () => {
      component.patchFormValues()
      expect(component.postEventForm.get('noOfAttendes')?.value).toBe(10)
      expect(component.postEventForm.get('meetingSummary')?.value).toBe('Summary')
    })
  })

  // ─── getSpeakerType ────────────────────────────────────────────────────────

  describe('getSpeakerType', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should set speakerType to others when there are multiple speakers', () => {
      component.eventDetailsData.speakerDetails = JSON.stringify([{ id: '1' }, { id: '2' }])
      component.getSpeakerType()
      expect(component.preEventControls['speakerType'].value).toBe('others')
    })

    it('should set speakerType to courseCreator when one speaker with id and courseLinked', () => {
      component.eventDetailsData.speakerDetails = JSON.stringify([{ id: 'sp1' }])
      component.eventDetailsData.courseLinked = 'course123'
      component.getSpeakerType()
      expect(component.preEventControls['speakerType'].value).toBe('courseCreator')
      expect(component.isSpeakerDisabled).toBe(true)
    })

    it('should reset when one speaker has id but courseLinked is empty', () => {
      component.eventDetailsData.speakerDetails = JSON.stringify([{ id: 'sp1' }])
      component.eventDetailsData.courseLinked = ''
      component.getSpeakerType()
      expect(component.preEventControls['selectedSpeaker'].value).toBe('')
      expect(component.preEventControls['speakerType'].value).toBe('')
    })

    it('should set speakerType to others when one speaker has empty id', () => {
      component.eventDetailsData.speakerDetails = JSON.stringify([{ id: '' }])
      component.getSpeakerType()
      expect(component.preEventControls['speakerType'].value).toBe('others')
    })

    it('should reset when speakerData is empty', () => {
      component.eventDetailsData.speakerDetails = JSON.stringify([])
      component.getSpeakerType()
      expect(component.preEventControls['selectedSpeaker'].value).toBe('')
      expect(component.preEventControls['speakerType'].value).toBe('')
    })

    it('should fall back to empty array on invalid JSON in getSpeakerType', () => {
      component.eventDetailsData.speakerDetails = 'bad json'
      expect(() => component.getSpeakerType()).not.toThrow()
      expect(component.preEventControls['speakerType'].value).toBe('')
    })
  })

  // ─── preEventControls / postEventControls getters ─────────────────────────

  describe('preEventControls getter', () => {
    it('should return the controls of preEventForm', () => {
      component.initializeForms()
      const controls = component.preEventControls
      expect(controls['meetingLink']).toBeDefined()
    })
  })

  describe('postEventControls getter', () => {
    it('should return the controls of postEventForm', () => {
      component.initializeForms()
      const controls = component.postEventControls
      expect(controls['eventDuration']).toBeDefined()
    })
  })

  // ─── toggle methods ────────────────────────────────────────────────────────

  describe('togglePreEventSetup', () => {
    it('should toggle isPreEventExpanded', () => {
      component.isPreEventExpanded = true
      component.togglePreEventSetup()
      expect(component.isPreEventExpanded).toBe(false)
      component.togglePreEventSetup()
      expect(component.isPreEventExpanded).toBe(true)
    })
  })

  describe('togglePostEventSetup', () => {
    it('should toggle isPostEventExpanded', () => {
      component.isPostEventExpanded = true
      component.togglePostEventSetup()
      expect(component.isPostEventExpanded).toBe(false)
      component.togglePostEventSetup()
      expect(component.isPostEventExpanded).toBe(true)
    })
  })

  // ─── isDateTimePassed ──────────────────────────────────────────────────────

  describe('isDateTimePassed', () => {
    it('should return false for empty string', () => {
      expect(component.isDateTimePassed('')).toBe(false)
    })

    it('should return true for a past date', () => {
      expect(component.isDateTimePassed('2020-01-01T00:00:00')).toBe(true)
    })

    it('should return false for a future date', () => {
      expect(component.isDateTimePassed('2099-01-01T00:00:00')).toBe(false)
    })

    it('should return false when Date constructor throws', () => {
      const OriginalDate = Date
        ; (global as any).Date = jest.fn(() => { throw new Error('Date error') })
      expect(component.isDateTimePassed('bad-date')).toBe(false)
        ; (global as any).Date = OriginalDate
    })
  })

  // ─── isDateUpcoming ────────────────────────────────────────────────────────

  describe('isDateUpcoming', () => {
    it('should return false for empty string', () => {
      expect(component.isDateUpcoming('')).toBe(false)
    })

    it('should return true for a future date', () => {
      expect(component.isDateUpcoming('2099-01-01T00:00:00')).toBe(true)
    })

    it('should return false for a past date', () => {
      expect(component.isDateUpcoming('2020-01-01T00:00:00')).toBe(false)
    })

    it('should return false when Date constructor throws', () => {
      const OriginalDate = Date
        ; (global as any).Date = jest.fn(() => { throw new Error('Date error') })
      expect(component.isDateUpcoming('bad-date')).toBe(false)
        ; (global as any).Date = OriginalDate
    })
  })

  // ─── onSpeakerSearch ───────────────────────────────────────────────────────

  describe('onSpeakerSearch', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should clear speakersList when value is empty', () => {
      component.onSpeakerSearch('')
      expect(component.speakersList).toEqual([])
      expect(component.fetchSpeakersStatus).toBe('none')
    })

    it('should clear speakersList when value has fewer than 2 characters', () => {
      component.onSpeakerSearch('a')
      expect(component.speakersList).toEqual([])
    })

    it('should call getUserSearchList and populate speakersList for valid input', () => {
      mockEventSvc.getUserSearchList.mockReturnValue(of({ content: [{ id: '1', name: 'John' }] }))
      component.onSpeakerSearch('John Doe')
      expect(mockEventSvc.getUserSearchList).toHaveBeenCalledWith('John Doe')
      expect(component.speakersList).toEqual([{ id: '1', name: 'John' }])
      expect(component.fetchSpeakersStatus).toBe('done')
    })

    it('should handle a null response by setting speakersList to empty array', () => {
      mockEventSvc.getUserSearchList.mockReturnValue(of(null))
      component.onSpeakerSearch('test')
      expect(component.speakersList).toEqual([])
    })

    it('should set showSpeakerInvalidMsg on error', () => {
      mockEventSvc.getUserSearchList.mockReturnValue(throwError(() => new Error('Network error')))
      component.onSpeakerSearch('test')
      expect(component.fetchSpeakersStatus).toBe('none')
      expect(component.showSpeakerInvalidMsg).toBe(true)
    })
  })

  // ─── addSpeaker ────────────────────────────────────────────────────────────

  describe('addSpeaker', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should add a new speaker to the list', () => {
      const event = {
        option: {
          value: {
            userId: 'user1',
            profileDetails: { personalDetails: { firstname: 'John', primaryEmail: 'john@test.com' } },
          },
        },
      }
      component.addSpeaker(event)
      const speakers = component.preEventForm.get('selectedSpeaker')?.value
      expect(speakers.length).toBe(1)
      expect(speakers[0].id).toBe('user1')
    })

    it('should not add a duplicate speaker when raw user object has matching .id', () => {
      component.preEventForm.patchValue({ selectedSpeaker: [{ id: 'user1', name: 'John', email: '' }] })
      // The component checks speaker.id (not speaker.userId) for deduplication
      const event = {
        option: {
          value: {
            id: 'user1',   // .id field used in the duplicate check
            userId: 'user1',
            profileDetails: { personalDetails: { firstname: 'John', primaryEmail: 'john@test.com' } },
          },
        },
      }
      component.addSpeaker(event)
      expect(component.preEventForm.get('selectedSpeaker')?.value.length).toBe(1)
    })

    it('should reset speakerInput after adding', () => {
      component.speakerInput = { nativeElement: { value: 'John' } } as any
      const event = {
        option: {
          value: {
            userId: 'user2',
            profileDetails: { personalDetails: { firstname: 'Jane', primaryEmail: 'jane@test.com' } },
          },
        },
      }
      component.addSpeaker(event)
      expect(component.speakerInput.nativeElement.value).toBe('')
    })

    it('should not throw when speakerInput is not set', () => {
      const event = {
        option: {
          value: {
            userId: 'user3',
            profileDetails: { personalDetails: { firstname: 'Bob', primaryEmail: 'bob@test.com' } },
          },
        },
      }
      expect(() => component.addSpeaker(event)).not.toThrow()
    })
  })

  // ─── removeSpeaker ─────────────────────────────────────────────────────────

  describe('removeSpeaker', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should remove the matching speaker from the list', () => {
      component.preEventForm.patchValue({
        selectedSpeaker: [
          { id: 'user1', name: 'John', email: '' },
          { id: 'user2', name: 'Jane', email: '' },
        ],
      })
      component.removeSpeaker({ id: 'user1', name: 'John' })
      const speakers = component.preEventForm.get('selectedSpeaker')?.value
      expect(speakers.length).toBe(1)
      expect(speakers[0].id).toBe('user2')
    })

    it('should leave list unchanged if speaker not found', () => {
      component.preEventForm.patchValue({ selectedSpeaker: [{ id: 'user1', name: 'John', email: '' }] })
      component.removeSpeaker({ id: 'xyz', name: 'Nobody' })
      expect(component.preEventForm.get('selectedSpeaker')?.value.length).toBe(1)
    })
  })

  // ─── validateAndAddSpeaker ─────────────────────────────────────────────────

  describe('validateAndAddSpeaker', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should add a speaker with valid email', () => {
      const event = { value: 'test@example.com', chipInput: { clear: jest.fn() } }
      component.validateAndAddSpeaker(event)
      const speakers = component.preEventForm.get('selectedSpeaker')?.value
      expect(speakers.length).toBe(1)
      expect(speakers[0].name).toBe('test@example.com')
    })

    it('should add a speaker with valid name', () => {
      const event = { value: 'John Doe', chipInput: { clear: jest.fn() } }
      component.validateAndAddSpeaker(event)
      expect(component.preEventForm.get('selectedSpeaker')?.value.length).toBe(1)
    })

    it('should not add a speaker with invalid value', () => {
      const event = { value: '123###invalid', chipInput: { clear: jest.fn() } }
      component.validateAndAddSpeaker(event)
      expect(component.preEventForm.get('selectedSpeaker')?.value).toEqual([])
    })

    it('should not add a speaker when value is empty', () => {
      const event = { value: '', chipInput: { clear: jest.fn() } }
      component.validateAndAddSpeaker(event)
      expect(component.preEventForm.get('selectedSpeaker')?.value).toEqual([])
    })

    it('should not throw when chipInput is absent', () => {
      expect(() => component.validateAndAddSpeaker({ value: 'test@test.com' })).not.toThrow()
    })
  })

  // ─── onSpeakerTypeChange ───────────────────────────────────────────────────

  describe('onSpeakerTypeChange', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should set isSpeakerDisabled and patch speakers for courseCreator with valid course', () => {
      mockEventSvc.getCourseDetails.mockReturnValue({
        creatorContacts: '[{"id":"1","name":"Creator"}]',
      })
      component.onSpeakerTypeChange({ value: 'courseCreator' })
      expect(component.isSpeakerDisabled).toBe(true)
    })

    it('should show snackbar and reset speakerType when no course details', () => {
      mockEventSvc.getCourseDetails.mockReturnValue(null)
      component.onSpeakerTypeChange({ value: 'courseCreator' })
      expect(mockSnackBar.open).toHaveBeenCalledWith('Please select a course to fetch course creators')
    })

    it('should handle non-string creatorContacts', () => {
      mockEventSvc.getCourseDetails.mockReturnValue({ creatorContacts: [{ id: '1', name: 'Creator' }] })
      component.onSpeakerTypeChange({ value: 'courseCreator' })
      expect(component.isSpeakerDisabled).toBe(true)
    })

    it('should show snackbar when courseDetails is an empty object', () => {
      mockEventSvc.getCourseDetails.mockReturnValue({})
      component.onSpeakerTypeChange({ value: 'courseCreator' })
      expect(mockSnackBar.open).toHaveBeenCalledWith('Please select a course to fetch course creators')
    })

    it('should set isSpeakerDisabled to false for others type', () => {
      component.isSpeakerDisabled = true
      component.onSpeakerTypeChange({ value: 'others' })
      expect(component.isSpeakerDisabled).toBe(false)
    })
  })

  // ─── addSpeakerFromInput ───────────────────────────────────────────────────

  describe('addSpeakerFromInput', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should add a speaker from input', () => {
      const event = { value: 'John Doe', chipInput: { clear: jest.fn() } }
      component.addSpeakerFromInput(event)
      expect(component.preEventForm.get('selectedSpeaker')?.value.length).toBe(1)
    })

    it('should not add a speaker when value is empty', () => {
      const event = { value: '', chipInput: { clear: jest.fn() } }
      component.addSpeakerFromInput(event)
      expect(component.preEventForm.get('selectedSpeaker')?.value).toEqual([])
    })

    it('should not throw when chipInput is absent', () => {
      expect(() => component.addSpeakerFromInput({ value: 'John' })).not.toThrow()
    })
  })

  // ─── onVideoUpload ─────────────────────────────────────────────────────────

  describe('onVideoUpload', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should reject non-mp4 files with snackbar message', () => {
      const event = { target: { files: [{ type: 'image/png', name: 'pic.png' }] } }
      component.onVideoUpload(event)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid file type. Please upload only MP4 video files.')
    })

    it('should accept mp4 files, set videoFile and call FileReader', () => {
      const mockFile = { type: 'video/mp4', name: 'video.mp4' }
      const readerMock: any = { readAsDataURL: jest.fn(), onload: null }
      jest.spyOn(global as any, 'FileReader').mockImplementation(() => readerMock)
      component.onVideoUpload({ target: { files: [mockFile] } })
      expect(component.videoFile).toBe(mockFile as any)
      expect(readerMock.readAsDataURL).toHaveBeenCalledWith(mockFile)
    })

    it('should trigger loaderService.changeLoaderState(false) and saveFile inside reader.onload', () => {
      const mockFile = { type: 'video/mp4', name: 'video.mp4' }
      const readerMock: any = { readAsDataURL: jest.fn(), onload: null }
      jest.spyOn(global as any, 'FileReader').mockImplementation(() => readerMock)
      const saveSpy = jest.spyOn(component, 'saveFile').mockImplementation(() => { })
      component.onVideoUpload({ target: { files: [mockFile] } })
      // manually fire the onload callback – covers the two lines inside it
      readerMock.onload({})
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(saveSpy).toHaveBeenCalledWith(mockFile, 'post-event-video')
    })

    it('should not call snackBar when no file is selected', () => {
      component.onVideoUpload({ target: { files: [] } })
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ─── onSummaryDocUpload ────────────────────────────────────────────────────

  describe('onSummaryDocUpload', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should reject non-pdf files', () => {
      const event = { target: { files: [{ type: 'image/png', name: 'pic.png', size: 100 }] } }
      component.onSummaryDocUpload(event)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid file type. Please upload only PDF files.')
    })

    it('should reject files larger than 10MB', () => {
      const event = { target: { files: [{ type: 'application/pdf', name: 'big.pdf', size: 11 * 1024 * 1024 }] } }
      component.onSummaryDocUpload(event)
      expect(mockSnackBar.open).toHaveBeenCalledWith('File size exceeds 10MB. Please upload a smaller file.')
    })

    it('should accept valid pdf files and call FileReader', () => {
      const mockFile = { type: 'application/pdf', name: 'doc.pdf', size: 1024 }
      const readerMock: any = { readAsDataURL: jest.fn(), onload: null }
      jest.spyOn(global as any, 'FileReader').mockImplementation(() => readerMock)
      component.onSummaryDocUpload({ target: { files: [mockFile] } })
      expect(readerMock.readAsDataURL).toHaveBeenCalledWith(mockFile)
    })

    it('should trigger loaderService.changeLoaderState(false) and saveFile inside reader.onload', () => {
      const mockFile = { type: 'application/pdf', name: 'doc.pdf', size: 1024 }
      const readerMock: any = { readAsDataURL: jest.fn(), onload: null }
      jest.spyOn(global as any, 'FileReader').mockImplementation(() => readerMock)
      const saveSpy = jest.spyOn(component, 'saveFile').mockImplementation(() => { })
      component.onSummaryDocUpload({ target: { files: [mockFile] } })
      readerMock.onload({})
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(saveSpy).toHaveBeenCalledWith(mockFile, 'post-event-summary')
    })

    it('should not call snackBar when no file is selected', () => {
      component.onSummaryDocUpload({ target: { files: [] } })
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ─── preventDefaultCDK ────────────────────────────────────────────────────

  describe('preventDefaultCDK', () => {
    it('should call preventDefault and stopPropagation', () => {
      const event: any = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { style: { opacity: '' } } }
      component.preventDefaultCDK(event)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('should set opacity to 0.5 on enter', () => {
      const target = { style: { opacity: '' } }
      const event: any = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target }
      component.preventDefaultCDK(event, 'enter')
      expect(target.style.opacity).toBe('0.5')
    })

    it('should reset opacity to 1 on leave', () => {
      const target = { style: { opacity: '0.5' } }
      const event: any = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target }
      component.preventDefaultCDK(event, 'leave')
      expect(target.style.opacity).toBe('1')
    })
  })

  // ─── onDrop ────────────────────────────────────────────────────────────────

  describe('onDrop', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should call onPreReadDocUpload when files are dropped', () => {
      const spy = jest.spyOn(component, 'onPreReadDocUpload')
      const event: any = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: { style: { opacity: '' } },
        dataTransfer: { files: [{ type: 'application/pdf', size: 100 }] },
      }
      component.onDrop(event)
      expect(spy).toHaveBeenCalled()
    })

    it('should not call onPreReadDocUpload when dataTransfer has no files', () => {
      const spy = jest.spyOn(component, 'onPreReadDocUpload')
      const event: any = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: { style: { opacity: '' } },
        dataTransfer: { files: [] },
      }
      component.onDrop(event)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── onPreReadDocumentChange ───────────────────────────────────────────────

  describe('onPreReadDocumentChange', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should forward files to onPreReadDocUpload', () => {
      const spy = jest.spyOn(component, 'onPreReadDocUpload')
      component.onPreReadDocumentChange({ target: { files: [{ type: 'application/pdf', size: 10 }] } })
      expect(spy).toHaveBeenCalled()
    })

    it('should not call onPreReadDocUpload when files is empty', () => {
      const spy = jest.spyOn(component, 'onPreReadDocUpload')
      component.onPreReadDocumentChange({ target: { files: [] } })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── onPreReadDocUpload ────────────────────────────────────────────────────

  describe('onPreReadDocUpload', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should return early for empty FileList', () => {
      const files: any = { length: 0, 0: undefined }
      component.onPreReadDocUpload(files)
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })

    it('should reject non-pdf files', () => {
      const files: any = { length: 1, 0: { type: 'image/png', name: 'pic.png', size: 100 } }
      component.onPreReadDocUpload(files)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid file type. Please upload only PDF files.')
    })

    it('should reject files larger than 10MB', () => {
      const files: any = { length: 1, 0: { type: 'application/pdf', name: 'big.pdf', size: 11 * 1024 * 1024 } }
      component.onPreReadDocUpload(files)
      expect(mockSnackBar.open).toHaveBeenCalledWith('File size exceeds 10MB. Please upload a smaller file.')
    })

    it('should accept valid pdf files and call FileReader', () => {
      const mockFile = { type: 'application/pdf', name: 'doc.pdf', size: 1024 }
      const readerMock: any = { readAsDataURL: jest.fn(), onload: null }
      jest.spyOn(global as any, 'FileReader').mockImplementation(() => readerMock)
      const files: any = { length: 1, 0: mockFile }
      component.onPreReadDocUpload(files)
      expect(readerMock.readAsDataURL).toHaveBeenCalledWith(mockFile)
    })

    it('should trigger loaderService.changeLoaderState(false) and saveFile inside reader.onload', () => {
      const mockFile = { type: 'application/pdf', name: 'doc.pdf', size: 1024 }
      const readerMock: any = { readAsDataURL: jest.fn(), onload: null }
      jest.spyOn(global as any, 'FileReader').mockImplementation(() => readerMock)
      const saveSpy = jest.spyOn(component, 'saveFile').mockImplementation(() => { })
      const files: any = { length: 1, 0: mockFile }
      component.onPreReadDocUpload(files)
      readerMock.onload({})
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(saveSpy).toHaveBeenCalledWith(mockFile, 'pre-read')
    })
  })

  // ─── saveFile ──────────────────────────────────────────────────────────────

  describe('saveFile', () => {
    beforeEach(() => {
      component.initializeForms()
      component.userProfile = { rootOrgId: 'org1', departmentName: 'IT', userName: 'user', userId: 'u1' }
    })

    it('should not call createContent when filePath is falsy', () => {
      component.saveFile(null, 'pre-read')
      expect(mockEventSvc.createContent).not.toHaveBeenCalled()
    })

    it('should call createContent and uploadContent for pre-read type', () => {
      mockEventSvc.createContent.mockReturnValue(of({ result: { identifier: 'id1' } }))
      mockEventSvc.uploadContent.mockReturnValue(of({ result: { artifactUrl: 'https://example.com/doc.pdf' } }))
      component.saveFile({ type: 'application/pdf', name: 'doc.pdf' }, 'pre-read')
      expect(component.showUploadedDoc).toBe(true)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Document uploaded successfully')
    })

    it('should set showUploadedVideo for post-event-video type', () => {
      mockEventSvc.createContent.mockReturnValue(of({ result: { identifier: 'id1' } }))
      mockEventSvc.uploadContent.mockReturnValue(of({ result: { artifactUrl: 'https://example.com/video.mp4' } }))
      component.saveFile({ type: 'video/mp4', name: 'v.mp4' }, 'post-event-video')
      expect(component.showUploadedVideo).toBe(true)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Video uploaded successfully')
    })

    it('should set showUploadedSummaryDoc for post-event-summary type', () => {
      mockEventSvc.createContent.mockReturnValue(of({ result: { identifier: 'id1' } }))
      mockEventSvc.uploadContent.mockReturnValue(of({ result: { artifactUrl: 'https://example.com/summary.pdf' } }))
      component.saveFile({ type: 'application/pdf', name: 's.pdf' }, 'post-event-summary')
      expect(component.showUploadedSummaryDoc).toBe(true)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Summary document uploaded successfully')
    })

    it('should transform Google Storage URL and set showUploadedDoc', () => {
      mockEventSvc.createContent.mockReturnValue(of({ result: { identifier: 'id1' } }))
      mockEventSvc.uploadContent.mockReturnValue(of({
        result: { artifactUrl: 'https://storage.googleapis.com/igot/bucket/path/file.pdf' },
      }))
      component.saveFile({ type: 'application/pdf', name: 'f.pdf' }, 'pre-read')
      expect(component.showUploadedDoc).toBe(true)
    })

    it('should call snackBar on createContent error', () => {
      mockEventSvc.createContent.mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })))
      component.saveFile({ type: 'application/pdf', name: 'f.pdf' }, 'pre-read')
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should throw when identifier is missing from createContent response', () => {
      mockEventSvc.createContent.mockReturnValue(of({ result: {} }))
      component.saveFile({ type: 'application/pdf', name: 'f.pdf' }, 'pre-read')
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should use default error message when error has no message', () => {
      mockEventSvc.createContent.mockReturnValue(throwError(() => ({})))
      component.saveFile({ type: 'application/pdf', name: 'f.pdf' }, 'pre-read')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong please try again')
    })
  })

  // ─── generateUploadedDocTypeImg ────────────────────────────────────────────

  describe('generateUploadedDocTypeImg', () => {
    it('should set pdf icon and materialType for a pdf URL', () => {
      component.generateUploadedDocTypeImg('https://example.com/document.pdf')
      expect(component.uploadedDocTypeImg).toBe('/assets/icons/pdf.svg')
      expect(component.materialType).toBe('1 pdf')
    })

    it('should not set icon for non-pdf URL', () => {
      component.uploadedDocTypeImg = ''
      component.generateUploadedDocTypeImg('https://example.com/video.mp4')
      expect(component.uploadedDocTypeImg).toBe('')
    })
  })

  // ─── removeUploadedDoc ─────────────────────────────────────────────────────

  describe('removeUploadedDoc', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should remove uploaded doc when user confirms', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) })
      component.preReadDocument = 'some-doc' as any
      component.removeUploadedDoc()
      expect(component.preReadDocument).toBeNull()
      expect(component.showUploadedDoc).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Document removed successfully')
    })

    it('should not remove doc when user cancels', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) })
      component.preReadDocument = 'some-doc' as any
      component.removeUploadedDoc()
      expect(component.preReadDocument).toBe('some-doc' as any)
    })
  })

  // ─── removeUploadedVideo ───────────────────────────────────────────────────

  describe('removeUploadedVideo', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should remove video when user confirms', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) })
      component.showUploadedVideo = true
      component.removeUploadedVideo()
      expect(component.videoFile).toBeNull()
      expect(component.showUploadedVideo).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Video removed successfully')
    })

    it('should not remove video when user cancels', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) })
      component.showUploadedVideo = true
      component.removeUploadedVideo()
      expect(component.showUploadedVideo).toBe(true)
    })
  })

  // ─── removeUploadedSummaryDoc ──────────────────────────────────────────────

  describe('removeUploadedSummaryDoc', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should remove summary doc when user confirms', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) })
      component.showUploadedSummaryDoc = true
      component.removeUploadedSummaryDoc()
      expect(component.summaryDocument).toBeNull()
      expect(component.showUploadedSummaryDoc).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Document removed successfully')
    })

    it('should not remove summary doc when user cancels', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) })
      component.showUploadedSummaryDoc = true
      component.removeUploadedSummaryDoc()
      expect(component.showUploadedSummaryDoc).toBe(true)
    })
  })

  // ─── convertMinutesToDuration ──────────────────────────────────────────────

  describe('convertMinutesToDuration', () => {
    it('should return empty string for 0', () => {
      expect(component.convertMinutesToDuration(0)).toBe('')
    })

    it('should return empty string for negative values', () => {
      expect(component.convertMinutesToDuration(-1)).toBe('')
    })

    it('should convert 60 minutes to "1h"', () => {
      expect(component.convertMinutesToDuration(60)).toBe('1h')
    })

    it('should convert 90 minutes to "1h 30m"', () => {
      expect(component.convertMinutesToDuration(90)).toBe('1h 30m')
    })

    it('should convert 30 minutes to "30m"', () => {
      expect(component.convertMinutesToDuration(30)).toBe('30m')
    })

    it('should include seconds for fractional minutes', () => {
      expect(component.convertMinutesToDuration(30.5)).toBe('30m 30s')
    })

    it('should handle hours, minutes and seconds together', () => {
      const result = component.convertMinutesToDuration(90.5)
      expect(result).toContain('1h')
      expect(result).toContain('30m')
      expect(result).toContain('30s')
    })
  })

  // ─── onNumberKeyPress ──────────────────────────────────────────────────────

  describe('onNumberKeyPress', () => {
    const makeEvent = (key: string, keyCode: number, ctrlKey = false): any => ({
      which: keyCode,
      keyCode,
      key,
      ctrlKey,
      preventDefault: jest.fn(),
    })

    it('should block decimal point (keyCode 46)', () => {
      const event = makeEvent('.', 46)
      expect(component.onNumberKeyPress(event)).toBe(false)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should block period via charCode 190', () => {
      const event = makeEvent('.', 190)
      expect(component.onNumberKeyPress(event)).toBe(false)
    })

    it('should block decimal via charCode 110', () => {
      const event = makeEvent('.', 110)
      expect(component.onNumberKeyPress(event)).toBe(false)
    })

    it('should block minus sign via key', () => {
      const event = makeEvent('-', 189)
      expect(component.onNumberKeyPress(event)).toBe(false)
    })

    it('should block minus via charCode 109', () => {
      const event = makeEvent('-', 109)
      expect(component.onNumberKeyPress(event)).toBe(false)
    })

    it('should allow digit 0', () => {
      expect(component.onNumberKeyPress(makeEvent('0', 48))).toBe(true)
    })

    it('should allow digit 9', () => {
      expect(component.onNumberKeyPress(makeEvent('9', 57))).toBe(true)
    })

    it('should allow backspace (keyCode 8)', () => {
      expect(component.onNumberKeyPress(makeEvent('Backspace', 8))).toBe(true)
    })

    it('should allow tab (keyCode 9)', () => {
      expect(component.onNumberKeyPress(makeEvent('Tab', 9))).toBe(true)
    })

    it('should allow Ctrl+A', () => {
      expect(component.onNumberKeyPress(makeEvent('a', 65, true))).toBe(true)
    })

    it('should block alpha characters', () => {
      const event = makeEvent('a', 65)
      expect(component.onNumberKeyPress(event)).toBe(false)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  // ─── onAttendeesInput ──────────────────────────────────────────────────────

  describe('onAttendeesInput', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should floor a decimal value to integer', () => {
      component.onAttendeesInput({ target: { value: '10.7' } })
      expect(component.postEventForm.get('noOfAttendes')?.value).toBe(10)
    })

    it('should set null for negative decimal', () => {
      component.onAttendeesInput({ target: { value: '-1.5' } })
      expect(component.postEventForm.get('noOfAttendes')?.value).toBeNull()
    })

    it('should not change the value when no decimal present', () => {
      component.postEventForm.patchValue({ noOfAttendes: 5 })
      component.onAttendeesInput({ target: { value: '10' } })
      expect(component.postEventForm.get('noOfAttendes')?.value).toBe(5)
    })
  })

  // ─── onAttendeesPaste ──────────────────────────────────────────────────────

  describe('onAttendeesPaste', () => {
    beforeEach(() => {
      component.initializeForms()
    })

    it('should paste and floor decimal value', () => {
      const event: any = { preventDefault: jest.fn(), clipboardData: { getData: jest.fn().mockReturnValue('10.7') } }
      component.onAttendeesPaste(event)
      expect(component.postEventForm.get('noOfAttendes')?.value).toBe(10)
    })

    it('should set null for negative pasted value', () => {
      const event: any = { preventDefault: jest.fn(), clipboardData: { getData: jest.fn().mockReturnValue('-5') } }
      component.onAttendeesPaste(event)
      expect(component.postEventForm.get('noOfAttendes')?.value).toBeNull()
    })

    it('should not change value for non-numeric paste', () => {
      component.postEventForm.patchValue({ noOfAttendes: 5 })
      const event: any = { preventDefault: jest.fn(), clipboardData: { getData: jest.fn().mockReturnValue('abc') } }
      component.onAttendeesPaste(event)
      expect(component.postEventForm.get('noOfAttendes')?.value).toBe(5)
    })

    it('should not throw when clipboardData is null', () => {
      const event: any = { preventDefault: jest.fn(), clipboardData: null }
      expect(() => component.onAttendeesPaste(event)).not.toThrow()
    })
  })

  // ─── uploadedFileName ──────────────────────────────────────────────────────

  describe('uploadedFileName', () => {
    it('should return empty string for empty URL', () => {
      expect(component.uploadedFileName('')).toBe('')
    })

    it('should extract the filename after the last underscore', () => {
      expect(component.uploadedFileName('https://example.com/path/12345_document.pdf')).toBe('document.pdf')
    })

    it('should return the filename when no underscore present', () => {
      expect(component.uploadedFileName('https://example.com/path/document.pdf')).toBe('document.pdf')
    })

    it('should strip surrounding quotes before extracting', () => {
      expect(component.uploadedFileName('"https://example.com/file.pdf"')).toBe('file.pdf')
    })

    it('should return original url when an error is thrown during processing', () => {
      // Force an error by patching String.prototype.replace temporarily
      const originalReplace = String.prototype.replace
        ; (String.prototype as any).replace = jest.fn(() => { throw new Error('replace error') })
      const result = component.uploadedFileName('https://example.com/file.pdf')
      String.prototype.replace = originalReplace
      expect(result).toBe('https://example.com/file.pdf')
    })
  })

  // ─── durationValidator (private) ──────────────────────────────────────────

  describe('durationValidator', () => {
    let validator: (control: FormControl) => any

    beforeEach(() => {
      validator = (component as any).durationValidator.bind(component)
    })

    it('should return null for empty string', () => {
      expect(validator(new FormControl(''))).toBeNull()
    })

    it('should return null for null value', () => {
      expect(validator(new FormControl(null))).toBeNull()
    })

    it('should return pattern error for completely invalid format', () => {
      expect(validator(new FormControl('abc'))).toEqual({ pattern: true })
    })

    it('should return zeroDuration when all parts are zero', () => {
      expect(validator(new FormControl('0h0m0s'))).toEqual({ zeroDuration: true })
    })

    it('should return invalidMinutes when minutes > 59', () => {
      expect(validator(new FormControl('65m'))).toEqual({ invalidMinutes: true })
    })

    it('should return invalidSeconds when seconds > 59', () => {
      expect(validator(new FormControl('65s'))).toEqual({ invalidSeconds: true })
    })

    it('should return minDuration for less than 30 minutes', () => {
      expect(validator(new FormControl('15m'))).toEqual({ minDuration: true })
    })

    it('should return maxDuration for 24h (≥1440 minutes)', () => {
      expect(validator(new FormControl('24h'))).toEqual({ maxDuration: true })
    })

    it('should return null for exactly 30m', () => {
      expect(validator(new FormControl('30m'))).toBeNull()
    })

    it('should return null for 1h', () => {
      expect(validator(new FormControl('1h'))).toBeNull()
    })

    it('should return null for a valid composite duration', () => {
      expect(validator(new FormControl('1h 30m 30s'))).toBeNull()
    })

    it('should return null for only hours (2h)', () => {
      expect(validator(new FormControl('2h'))).toBeNull()
    })
  })
})
