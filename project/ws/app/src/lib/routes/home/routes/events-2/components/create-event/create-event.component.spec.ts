import { FormBuilder, Validators } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { StepperSelectionEvent } from '@angular/cdk/stepper'

/* ---------- mock inject() BEFORE importing the component ---------- */
jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  inject: jest.fn().mockReturnValue({ back: jest.fn() }),
}))
import * as angularCore from '@angular/core'
import { CreateEventComponent } from './create-event.component'

describe('CreateEventComponent', () => {
  let component: CreateEventComponent
  let mockEventsService: any
  let mockActivatedRoute: any
  let mockRouter: any
  let mockFormBuilder: FormBuilder
  let mockMatSnackBar: any
  let mockDatePipe: any
  let mockLoaderService: any
  let mockChangeDetectorRef: any
  let mockDialog: any

  const longDesc = 'A'.repeat(260)

  function buildComponent(routeOverrides?: any) {
    mockEventsService = {
      updateEvent: jest.fn(),
      publishEvent: jest.fn(),
      getContentRead: jest.fn(),
      setCourseDetails: jest.fn(),
    }

    mockActivatedRoute = {
      queryParams: of({ mode: 'edit', pathUrl: 'upcoming' }),
      snapshot: {
        data: {
          configService: { userProfile: { id: 'user123' } },
          eventDetails: {
            data: {
              identifier: 'event123',
              name: 'Test Event',
              description: longDesc,
              status: 'draft',
            },
          },
        },
      },
      ...routeOverrides,
    }

    mockRouter = { navigate: jest.fn() }
    mockFormBuilder = new FormBuilder()
    mockMatSnackBar = { open: jest.fn() }
    mockDatePipe = { transform: jest.fn().mockReturnValue('2024-12-01') }
    mockLoaderService = { changeLoaderState: jest.fn() }
    mockChangeDetectorRef = { detectChanges: jest.fn() }
    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
    }
    // Reset location mock
    const mockLoc = (angularCore.inject as jest.Mock).mock.results[0]?.value
    if (mockLoc) mockLoc.back.mockClear()

    component = new CreateEventComponent(
      mockEventsService,
      mockActivatedRoute,
      mockFormBuilder,
      mockRouter,
      mockMatSnackBar,
      mockDatePipe,
      mockLoaderService,
      mockChangeDetectorRef,
      mockDialog,
    )
  }

  function initWithDefaults() {
    buildComponent()
    component.ngOnInit()
  }

  function setValidForm() {
    component.eventDetailsForm.patchValue({
      eventName: 'Valid Event Name That Is Long Enough',
      description: longDesc,
      eventCategory: 'Webinar',
      startDate: new Date('2030-12-01'),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      registrationLink: 'https://example.com',
      appIcon: 'icon.png',
      typeofEvent: 'Online',
    })
  }

  function makeStepper(labels: string[]) {
    return {
      steps: {
        toArray: () => labels.map(l => ({ label: l })),
        length: labels.length,
      },
      _getIndicatorType: jest.fn(),
      selectedIndex: 0,
    } as any
  }

  beforeEach(() => {
    jest.restoreAllMocks()
    buildComponent()
  })

  // ──────────────────────────────────────────────
  // ngOnInit & initializeFormAndParams
  // ──────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialise all form controls', () => {
      component.ngOnInit()
      const names = ['eventName', 'description', 'eventCategory', 'streamType',
        'startDate', 'startTime', 'endTime', 'registrationLink', 'recoredEventUrl',
        'appIcon', 'typeofEvent', 'maxEnrolments']
      names.forEach(n => expect(component.eventDetailsForm.get(n)).toBeTruthy())
      expect(component.courseSelectionForm.get('selectedCourse')).toBeTruthy()
    })

    it('should set openMode and pathUrl from queryParams', () => {
      component.ngOnInit()
      expect(component.openMode).toBe('edit')
      expect(component.pathUrl).toBe('upcoming')
    })

    it('should disable form when openMode is view', () => {
      mockActivatedRoute.queryParams = of({ mode: 'view', pathUrl: 'upcoming' })
      component.ngOnInit()
      expect(component.eventDetailsForm.disabled).toBe(true)
    })

    it('should fetch eventDetails from resolver snapshot', () => {
      component.ngOnInit()
      expect(component.eventDetails).toBeDefined()
      expect(component.eventId).toBe('event123')
    })

    it('should not patch when eventDetails absent', () => {
      mockActivatedRoute.snapshot.data = { configService: { userProfile: {} } }
      component.ngOnInit()
      expect(component.eventId).toBe('')
    })
  })

  // ──────────────────────────────────────────────
  // edf getter
  // ──────────────────────────────────────────────
  it('edf should return form controls', () => {
    component.ngOnInit()
    expect(component.edf).toBe(component.eventDetailsForm.controls)
  })

  // ──────────────────────────────────────────────
  // Form Validation
  // ──────────────────────────────────────────────
  describe('Form Validation', () => {
    beforeEach(() => initWithDefaults())

    it('should require eventName', () => {
      component.eventDetailsForm.get('eventName')?.setValue('')
      component.eventDetailsForm.get('eventName')?.updateValueAndValidity()
      expect(component.eventDetailsForm.get('eventName')?.hasError('required')).toBe(true)
    })

    it('should enforce minlength on eventName', () => {
      component.eventDetailsForm.get('eventName')?.setValue('short')
      expect(component.eventDetailsForm.get('eventName')?.hasError('minlength')).toBe(true)
    })

    it('should enforce maxlength on eventName', () => {
      component.eventDetailsForm.get('eventName')?.setValue('a'.repeat(91))
      expect(component.eventDetailsForm.get('eventName')?.hasError('maxlength')).toBe(true)
    })

    it('should enforce minlength on description', () => {
      component.eventDetailsForm.get('description')?.setValue('short')
      expect(component.eventDetailsForm.get('description')?.hasError('minlength')).toBe(true)
    })

    it('should enforce min/max on maxEnrolments', () => {
      const ctrl = component.eventDetailsForm.get('maxEnrolments')
      ctrl?.setValue(5)
      expect(ctrl?.hasError('min')).toBe(true)
      ctrl?.setValue(20000)
      expect(ctrl?.hasError('max')).toBe(true)
    })
  })

  // ──────────────────────────────────────────────
  // patchEventDetails
  // ──────────────────────────────────────────────
  describe('patchEventDetails', () => {
    beforeEach(() => initWithDefaults())

    it('should patch eventId and eventStatus', async () => {
      component.eventDetails = { identifier: 'e1', status: 'Draft', name: 'E' }
      await component.patchEventDetails()
      expect(component.eventId).toBe('e1')
      expect(component.eventStatus).toBe('draft')
    })

    it('should call openConforamtionPopup when status is senttopublish and upcoming+edit', async () => {
      const spy = jest.spyOn(component, 'openConforamtionPopup').mockImplementation()
      component.pathUrl = 'upcoming'
      component.openMode = 'edit'
      component.eventDetails = { identifier: 'e1', status: 'SentToPublish', name: 'E' }
      await component.patchEventDetails()
      expect(spy).toHaveBeenCalled()
    })

    it('should use recordedLinks for Webinar + past with recordedLinks', async () => {
      component.pathUrl = 'past'
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        resourceType: 'Webinar',
        recordedLinks: ['https://example.com/recorded'],
        registrationLink: 'https://example.com',
      }
      await component.patchEventDetails()
      // registrationLink uses recordedLinks[0] → non-youtube → recoredEventUrl set
      expect(component.eventDetailsForm.get('recoredEventUrl')?.value).toBe('https://example.com/recorded')
    })

    it('should handle youtube registrationLink for Webinar + past + recordedLinks', async () => {
      component.pathUrl = 'past'
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        resourceType: 'Webinar',
        recordedLinks: ['https://youtube.com/watch?v=abc'],
        registrationLink: 'https://youtube.com/watch?v=abc',
      }
      await component.patchEventDetails()
      expect(component.eventDetailsForm.get('registrationLink')?.value).toBe('https://youtube.com/watch?v=abc')
    })

    it('should clear registrationLink validators when link is non-youtube', async () => {
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        registrationLink: 'https://zoom.us/meeting',
      }
      await component.patchEventDetails()
      // validators cleared, recoredEventUrl required
      const recoredCtrl = component.eventDetailsForm.get('recoredEventUrl')
      recoredCtrl?.setValue('')
      recoredCtrl?.updateValueAndValidity()
      expect(recoredCtrl?.hasError('required')).toBe(true)
    })

    it('should handle typeofEvent live with courseLinked', async () => {
      const contentResult = { result: { content: { identifier: 'c1', competencies_v6: [{ n: 1 }] } } }
      mockEventsService.getContentRead.mockReturnValue(of(contentResult))
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        typeofEvent: 'live', courseLinked: 'c1',
        registrationLink: 'https://youtube.com/watch?v=x',
      }
      await component.patchEventDetails()
      expect(mockEventsService.getContentRead).toHaveBeenCalledWith('c1')
      expect(mockEventsService.setCourseDetails).toHaveBeenCalled()
      expect(component.contentLoaded).toBe(true)
    })

    it('should handle typeofEvent live without courseLinked', async () => {
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        typeofEvent: 'live',
        registrationLink: 'https://youtube.com/watch?v=x',
      }
      await component.patchEventDetails()
      expect(component.courseSelectionForm.get('selectedCourse')?.value).toEqual({})
      expect(component.contentLoaded).toBe(true)
    })

    it('should handle typeofEvent live with courseLinked and getContentRead error', async () => {
      mockEventsService.getContentRead.mockReturnValue(throwError(() => new Error('fail')))
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        typeofEvent: 'live', courseLinked: 'c1',
        registrationLink: 'https://youtube.com/watch?v=x',
      }
      await component.patchEventDetails()
      // toPromise().catch handles error gracefully
    })

    it('should handle live event with endDateTime in past to jump to Event Setup stepper', async () => {
      jest.useFakeTimers()
      const pastDate = new Date('2020-01-01T00:00:00')
      const contentResult = { result: { content: { identifier: 'c1' } } }
      mockEventsService.getContentRead.mockReturnValue(of(contentResult))
      component.stepper = makeStepper(['Basic Details', 'Event Setup', 'Preview'])
      component.eventDetails = {
        identifier: 'e1', status: 'Live', name: 'E',
        typeofEvent: 'live', courseLinked: 'c1',
        endDateTime: pastDate.toISOString(),
        registrationLink: 'https://youtube.com/watch?v=x',
      }
      component.openMode = 'edit'
      await component.patchEventDetails()
      jest.advanceTimersByTime(400)
      expect(component.currentStepperIndex).toBe(1)
      expect(component.selectedStepperLable).toBe('Event Setup')
      jest.useRealTimers()
    })

    it('should not jump stepper when event is live but endDateTime in future', async () => {
      jest.useFakeTimers()
      const futureDate = new Date('2099-01-01T00:00:00')
      const contentResult = { result: { content: { identifier: 'c1' } } }
      mockEventsService.getContentRead.mockReturnValue(of(contentResult))
      component.stepper = makeStepper(['Basic Details', 'Event Setup', 'Preview'])
      component.eventDetails = {
        identifier: 'e1', status: 'Live', name: 'E',
        typeofEvent: 'live', courseLinked: 'c1',
        endDateTime: futureDate.toISOString(),
        registrationLink: 'https://youtube.com/watch?v=x',
      }
      component.openMode = 'edit'
      await component.patchEventDetails()
      jest.advanceTimersByTime(400)
      expect(component.currentStepperIndex).toBe(0)
      jest.useRealTimers()
    })

    it('should not jump stepper when Event Setup label not found', async () => {
      jest.useFakeTimers()
      const contentResult = { result: { content: { identifier: 'c1' } } }
      mockEventsService.getContentRead.mockReturnValue(of(contentResult))
      component.stepper = makeStepper(['Basic Details', 'Preview'])
      component.eventDetails = {
        identifier: 'e1', status: 'Live', name: 'E',
        typeofEvent: 'live', courseLinked: 'c1',
        endDateTime: new Date('2020-01-01').toISOString(),
        registrationLink: 'https://youtube.com/watch?v=x',
      }
      component.openMode = 'edit'
      await component.patchEventDetails()
      jest.advanceTimersByTime(400)
      expect(component.currentStepperIndex).toBe(0)
      jest.useRealTimers()
    })

    it('should disable form for past+edit and enable recoredEventUrl for non-youtube', async () => {
      component.pathUrl = 'past'
      component.openMode = 'edit'
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        registrationLink: 'https://zoom.us/meeting',
      }
      await component.patchEventDetails()
      expect(component.eventDetailsForm.get('eventName')?.disabled).toBe(true)
      expect(component.eventDetailsForm.get('recoredEventUrl')?.enabled).toBe(true)
    })

    it('should disable form for past+edit and enable registrationLink for youtube', async () => {
      component.pathUrl = 'past'
      component.openMode = 'edit'
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        registrationLink: 'https://youtube.com/watch?v=abc',
      }
      await component.patchEventDetails()
      expect(component.eventDetailsForm.get('eventName')?.disabled).toBe(true)
      expect(component.eventDetailsForm.get('registrationLink')?.enabled).toBe(true)
    })

    it('should disable name/description/typeofEvent/streamType when status is live', async () => {
      component.pathUrl = 'upcoming'
      component.eventDetails = {
        identifier: 'e1', status: 'Live', name: 'E',
        registrationLink: 'https://youtube.com/watch?v=abc',
      }
      await component.patchEventDetails()
      expect(component.eventDetailsForm.get('eventName')?.disabled).toBe(true)
      expect(component.eventDetailsForm.get('description')?.disabled).toBe(true)
      expect(component.eventDetailsForm.get('typeofEvent')?.disabled).toBe(true)
      expect(component.eventDetailsForm.get('streamType')?.disabled).toBe(true)
      expect(component.eventStatus).toBe('live')
    })

    it('should disable date/time fields when live + typeofEvent is live', async () => {
      component.pathUrl = 'upcoming'
      component.eventDetails = {
        identifier: 'e1', status: 'Live', name: 'E',
        typeofEvent: 'live',
        registrationLink: 'https://youtube.com/watch?v=abc',
      }
      await component.patchEventDetails()
      expect(component.eventDetailsForm.get('startDate')?.disabled).toBe(true)
      expect(component.eventDetailsForm.get('startTime')?.disabled).toBe(true)
      expect(component.eventDetailsForm.get('endTime')?.disabled).toBe(true)
    })

    it('should disable fields when prevStatus is set', async () => {
      component.pathUrl = 'upcoming'
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E', prevStatus: 'Live',
        registrationLink: 'https://youtube.com/watch?v=abc',
      }
      await component.patchEventDetails()
      expect(component.eventDetailsForm.get('eventName')?.disabled).toBe(true)
      expect(component.eventStatus).toBe('live')
    })

    it('should populate speakers, materials, competencies', async () => {
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        speakers: [{ name: 'S1', email: 'e', description: 'd' }],
        eventHandouts: [{ title: 'M1', content: 'C1' }],
        competencies_v6: [{ name: 'C1' }],
        registrationLink: 'https://youtube.com/watch?v=abc',
      }
      await component.patchEventDetails()
      expect(component.speakersList).toHaveLength(1)
      expect(component.materialsList).toHaveLength(1)
      expect(component.competencies).toHaveLength(1)
    })

    it('should skip competencies_v6 when competencies already set from course', async () => {
      const contentResult = { result: { content: { identifier: 'c1', competencies_v6: [{ n: 1 }] } } }
      mockEventsService.getContentRead.mockReturnValue(of(contentResult))
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        typeofEvent: 'live', courseLinked: 'c1',
        competencies_v6: [{ name: 'old' }],
        registrationLink: 'https://youtube.com/watch?v=abc',
      }
      await component.patchEventDetails()
      // competencies set from getLatestCompetencies, not from competencies_v6
      expect(component.competencies).toEqual([{ n: 1 }])
    })

    it('should handle registrationLink absent (falsy)', async () => {
      component.eventDetails = {
        identifier: 'e1', status: 'draft', name: 'E',
        registrationLink: '',
      }
      await component.patchEventDetails()
      expect(component.eventDetailsForm.get('registrationLink')?.value).toBe('')
      expect(component.eventDetailsForm.get('recoredEventUrl')?.value).toBe('')
    })
  })

  // ──────────────────────────────────────────────
  // ngAfterViewInit
  // ──────────────────────────────────────────────
  describe('ngAfterViewInit', () => {
    it('should configure stepper indicator type', () => {
      component.stepper = makeStepper(['Basic Details'])
      component.ngAfterViewInit()
      expect((component.stepper as any)._getIndicatorType()).toBe('number')
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
    })

    it('should handle undefined stepper', () => {
      component.stepper = undefined
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  // ──────────────────────────────────────────────
  // getLatestCompetencies
  // ──────────────────────────────────────────────
  describe('getLatestCompetencies', () => {
    it('should return empty array for null obj', () => {
      expect(component.getLatestCompetencies(null)).toEqual([])
    })

    it('should return empty array when no competency keys', () => {
      expect(component.getLatestCompetencies({ name: 'test' })).toEqual([])
    })

    it('should return latest version competencies', () => {
      const obj = {
        competencies_v3: [{ id: 3 }],
        competencies_v6: [{ id: 6 }],
        competencies_v1: [{ id: 1 }],
      }
      expect(component.getLatestCompetencies(obj)).toEqual([{ id: 6 }])
    })

    it('should handle single competency key', () => {
      expect(component.getLatestCompetencies({ competencies_v2: [{ a: 1 }] })).toEqual([{ a: 1 }])
    })
  })

  // ──────────────────────────────────────────────
  // onSelectionChange
  // ──────────────────────────────────────────────
  describe('onSelectionChange', () => {
    beforeEach(() => initWithDefaults())

    it('should update currentStepperIndex and selectedStepperLable', () => {
      component.stepper = makeStepper(['Basic Details', 'Add Speaker', 'Preview'])
      const evt: StepperSelectionEvent = {
        selectedIndex: 1, previouslySelectedIndex: 0,
        selectedStep: null as any, previouslySelectedStep: null as any,
      }
      component.onSelectionChange(evt)
      expect(component.currentStepperIndex).toBe(1)
      expect(component.selectedStepperLable).toBe('Add Speaker')
    })

    it('should mark form touched when leaving Basic Details', () => {
      component.stepper = makeStepper(['Basic Details', 'Add Speaker'])
      const spy = jest.spyOn(component.eventDetailsForm, 'markAllAsTouched')
      const evt: StepperSelectionEvent = {
        selectedIndex: 1, previouslySelectedIndex: 0,
        selectedStep: null as any, previouslySelectedStep: null as any,
      }
      component.onSelectionChange(evt)
      expect(spy).toHaveBeenCalled()
    })

    it('should set updatedEventDetails when moving to Preview', () => {
      component.stepper = makeStepper(['Add Material', 'Preview'])
      component.eventDetails = { status: 'draft' }
      const evt: StepperSelectionEvent = {
        selectedIndex: 1, previouslySelectedIndex: 0,
        selectedStep: null as any, previouslySelectedStep: null as any,
      }
      component.onSelectionChange(evt)
      expect(component.updatedEventDetails).toBeDefined()
    })

    it('should handle stepper undefined gracefully', () => {
      component.stepper = undefined
      const evt: StepperSelectionEvent = {
        selectedIndex: 0, previouslySelectedIndex: 0,
        selectedStep: null as any, previouslySelectedStep: null as any,
      }
      expect(() => component.onSelectionChange(evt)).not.toThrow()
    })
  })

  // ──────────────────────────────────────────────
  // onCourseSelected
  // ──────────────────────────────────────────────
  describe('onCourseSelected', () => {
    beforeEach(() => initWithDefaults())

    it('should patch courseSelectionForm and call setCourseDetails', () => {
      const course = { identifier: 'c1', competencies_v6: [{ id: 1 }] }
      component.onCourseSelected(course)
      expect(component.courseSelectionForm.get('selectedCourse')?.value).toBe(course)
      expect(mockEventsService.setCourseDetails).toHaveBeenCalledWith(course)
      expect(component.competencies).toEqual([{ id: 1 }])
    })

    it('should reset preEventForm speaker when speakerType is courseCreator', () => {
      component.preEventForm = new FormBuilder().group({
        speakerType: ['courseCreator'],
        selectedSpeaker: [['speaker1']],
      })
      component.onCourseSelected({ identifier: 'c2' })
      expect(component.preEventForm.get('speakerType')?.value).toBe('')
      expect(component.preEventForm.get('selectedSpeaker')?.value).toEqual([])
    })

    it('should not reset preEventForm when speakerType is not courseCreator', () => {
      component.preEventForm = new FormBuilder().group({
        speakerType: ['external'],
        selectedSpeaker: [['speaker1']],
      })
      component.onCourseSelected({ identifier: 'c2' })
      expect(component.preEventForm.get('speakerType')?.value).toBe('external')
    })

    it('should not throw if preEventForm is undefined', () => {
      component.preEventForm = undefined as any
      expect(() => component.onCourseSelected({ identifier: 'c2' })).not.toThrow()
    })
  })

  // ──────────────────────────────────────────────
  // onPreEventFormReady / onPostEventFormReady
  // ──────────────────────────────────────────────
  describe('form ready handlers', () => {
    it('onPreEventFormReady should set preEventForm', () => {
      const form = new FormBuilder().group({ test: [''] })
      component.onPreEventFormReady(form)
      expect(component.preEventForm).toBe(form)
    })

    it('onPostEventFormReady should set postEventForm', () => {
      const form = new FormBuilder().group({ test: [''] })
      component.onPostEventFormReady(form)
      expect(component.postEventForm).toBe(form)
    })
  })

  // ──────────────────────────────────────────────
  // openConforamtionPopup
  // ──────────────────────────────────────────────
  describe('openConforamtionPopup', () => {
    beforeEach(() => initWithDefaults())

    it('should open dialog when openMode is edit', () => {
      component.openMode = 'edit'
      component.eventStatus = 'draft'
      component.openConforamtionPopup()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should use senttopublish dialog data when status is senttopublish', () => {
      component.openMode = 'edit'
      component.eventStatus = 'senttopublish'
      component.openConforamtionPopup()
      const data = mockDialog.open.mock.calls[0][1].data
      expect(data.message).toContain('already been sent to publisher')
      expect(data.buttonsList).toHaveLength(1)
    })

    it('should use exit-warning dialog data when status is not senttopublish', () => {
      component.openMode = 'edit'
      component.eventStatus = 'draft'
      component.openConforamtionPopup()
      const data = mockDialog.open.mock.calls[0][1].data
      expect(data.message).toContain('exit without saving')
      expect(data.buttonsList).toHaveLength(2)
    })

    it('should navigate back when dialog afterClosed returns true', () => {
      component.openMode = 'edit'
      component.pathUrl = 'upcoming'
      component.openConforamtionPopup()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/events/upcoming'])
    })

    it('should not navigate when dialog afterClosed returns false', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) })
      component.openMode = 'edit'
      component.openConforamtionPopup()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should navigate back directly when openMode is not edit', () => {
      component.openMode = 'view'
      component.pathUrl = 'upcoming'
      component.openConforamtionPopup()
      expect(mockDialog.open).not.toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/events/upcoming'])
    })
  })

  // ──────────────────────────────────────────────
  // navigateBack
  // ──────────────────────────────────────────────
  describe('navigateBack', () => {
    it('should navigate to pathUrl when set', () => {
      component.pathUrl = 'past'
      component.navigateBack()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/events/past'])
    })

    it('should call locationService.back() when pathUrl is empty', () => {
      component.pathUrl = ''
      component.navigateBack()
      const mockLoc = (angularCore.inject as jest.Mock).mock.results[0]?.value
      expect(mockLoc.back).toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────
  // moveToNextForm / moveToPreviousForm
  // ──────────────────────────────────────────────
  describe('moveToNextForm', () => {
    beforeEach(() => initWithDefaults())

    it('should increment currentStepperIndex when stepper available', () => {
      component.stepper = makeStepper(['Basic Details', 'Add Speaker', 'Preview'])
      component.currentStepperIndex = 0
      component.moveToNextForm()
      expect(component.currentStepperIndex).toBe(1)
    })

    it('should not increment beyond last step', () => {
      component.stepper = makeStepper(['Basic Details', 'Preview'])
      component.currentStepperIndex = 1
      component.moveToNextForm()
      expect(component.currentStepperIndex).toBe(1)
    })

    it('should not increment when stepper is undefined', () => {
      component.stepper = undefined
      component.currentStepperIndex = 0
      component.moveToNextForm()
      expect(component.currentStepperIndex).toBe(0)
    })
  })

  describe('moveToPreviousForm', () => {
    beforeEach(() => initWithDefaults())

    it('should decrement currentStepperIndex', () => {
      component.currentStepperIndex = 2
      component.moveToPreviousForm()
      expect(component.currentStepperIndex).toBe(1)
    })
  })

  // ──────────────────────────────────────────────
  // preview
  // ──────────────────────────────────────────────
  describe('preview', () => {
    beforeEach(() => initWithDefaults())

    it('should set showPreview and updatedEventDetails', () => {
      component.eventDetails = { status: 'draft' }
      component.stepper = makeStepper(['Basic Details', 'Preview'])
      component.preview()
      expect(component.showPreview).toBe(true)
      expect(component.updatedEventDetails).toBeDefined()
    })

    it('should set stepper index to Preview step after timeout', () => {
      jest.useFakeTimers()
      component.eventDetails = { status: 'draft' }
      component.stepper = makeStepper(['Basic Details', 'Add Speaker', 'Preview'])
      component.preview()
      jest.advanceTimersByTime(200)
      expect(component.currentStepperIndex).toBe(2)
      jest.useRealTimers()
    })

    it('should not change index when Preview label not found', () => {
      jest.useFakeTimers()
      component.eventDetails = { status: 'draft' }
      component.stepper = makeStepper(['Basic Details', 'Add Speaker'])
      component.preview()
      jest.advanceTimersByTime(200)
      expect(component.currentStepperIndex).toBe(0)
      jest.useRealTimers()
    })

    it('should do nothing when eventDetails has no status', () => {
      component.eventDetails = {}
      component.preview()
      expect(component.showPreview).toBe(false)
    })

    it('should handle stepper undefined in setTimeout', () => {
      jest.useFakeTimers()
      component.eventDetails = { status: 'draft' }
      component.stepper = undefined
      component.preview()
      jest.advanceTimersByTime(200)
      expect(component.showPreview).toBe(true)
      jest.useRealTimers()
    })
  })

  // ──────────────────────────────────────────────
  // canMoveToNext getter
  // ──────────────────────────────────────────────
  describe('canMoveToNext', () => {
    beforeEach(() => initWithDefaults())

    it('should return false for invalid Basic Details', () => {
      component.selectedStepperLable = 'Basic Details'
      expect(component.canMoveToNext).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please fill mandatory fields')
    })

    it('should return true for valid Basic Details', () => {
      component.selectedStepperLable = 'Basic Details'
      setValidForm()
      expect(component.canMoveToNext).toBe(true)
    })

    it('should return false for Add Speaker with empty list', () => {
      component.selectedStepperLable = 'Add Speaker'
      component.speakersList = []
      expect(component.canMoveToNext).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please add atleast one speaker')
    })

    it('should return true for Add Speaker with speakers', () => {
      component.selectedStepperLable = 'Add Speaker'
      component.speakersList = [{ name: 'S', email: '', description: '' }]
      expect(component.canMoveToNext).toBe(true)
    })

    it('should return false for Add Material with invalid materials', () => {
      component.selectedStepperLable = 'Add Material'
      component.materialsList = [{ title: '', content: 'C' }]
      expect(component.canMoveToNext).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please provied valid name and matrial')
    })

    it('should return true for Add Material with valid materials', () => {
      component.selectedStepperLable = 'Add Material'
      component.materialsList = [{ title: 'T', content: 'C' }]
      expect(component.canMoveToNext).toBe(true)
    })

    it('should return false for unknown step label', () => {
      component.selectedStepperLable = 'Unknown'
      expect(component.canMoveToNext).toBe(false)
    })
  })

  // ──────────────────────────────────────────────
  // isMaterialsValid getter
  // ──────────────────────────────────────────────
  describe('isMaterialsValid', () => {
    beforeEach(() => initWithDefaults())

    it('should return true for empty materialsList', () => {
      component.materialsList = []
      expect(component.isMaterialsValid).toBe(true)
    })

    it('should return false when material has empty title', () => {
      component.materialsList = [{ title: '', content: 'C' }]
      expect(component.isMaterialsValid).toBe(false)
    })

    it('should return false when material has empty content', () => {
      component.materialsList = [{ title: 'T', content: '' }]
      expect(component.isMaterialsValid).toBe(false)
    })

    it('should return true when all materials are valid', () => {
      component.materialsList = [{ title: 'T', content: 'C' }, { title: 'T2', content: 'C2' }]
      expect(component.isMaterialsValid).toBe(true)
    })
  })

  // ──────────────────────────────────────────────
  // canPublish getter
  // ──────────────────────────────────────────────
  describe('canPublish', () => {
    beforeEach(() => {
      initWithDefaults()
      setValidForm()
      component.competencies = [{ name: 'C1' }]
      component.materialsList = [{ title: 'M', content: 'C' }]
      component.eventDetails = { status: 'draft', typeofEvent: 'Online' }
    })

    it('should return false when selectedStepperLable is not a publish step', () => {
      component.selectedStepperLable = 'Basic Details'
      expect(component.canPublish).toBe(false)
    })

    it('should return true when all conditions met on Add Competency', () => {
      component.selectedStepperLable = 'Add Competency'
      let callIdx = 0
      mockDatePipe.transform.mockImplementation(() => {
        callIdx++
        return callIdx === 1 ? '2025-04-22' : '2030-12-01'
      })
      expect(component.canPublish).toBe(true)
    })

    it('should return true on Preview step', () => {
      component.selectedStepperLable = 'Preview'
      let callIdx = 0
      mockDatePipe.transform.mockImplementation(() => {
        callIdx++
        return callIdx === 1 ? '2025-04-22' : '2030-12-01'
      })
      expect(component.canPublish).toBe(true)
    })

    it('should return true on Event Setup step', () => {
      component.selectedStepperLable = 'Event Setup'
      let callIdx = 0
      mockDatePipe.transform.mockImplementation(() => {
        callIdx++
        return callIdx === 1 ? '2025-04-22' : '2030-12-01'
      })
      expect(component.canPublish).toBe(true)
    })

    it('should return false when eventDetailsForm is invalid', () => {
      component.selectedStepperLable = 'Preview'
      component.eventDetailsForm.get('eventName')?.setValue('')
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please fill mandatory fields in Basic Details')
    })

    it('should return false when materials invalid', () => {
      component.selectedStepperLable = 'Preview'
      component.materialsList = [{ title: '', content: 'C' }]
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please provied valid name and matrial in Add Material')
    })

    it('should return false when no competencies and not live typeofEvent', () => {
      component.selectedStepperLable = 'Preview'
      component.competencies = []
      component.eventDetails = { status: 'draft', typeofEvent: 'Online' }
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please add atleast one competency in Add Competency')
    })

    it('should return false when no competencies and live typeofEvent', () => {
      component.selectedStepperLable = 'Preview'
      component.competencies = []
      component.eventDetails = { status: 'draft', typeofEvent: 'live' }
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Select course from course linking')
    })

    it('should return false when isValidTimeToStart is false', () => {
      component.selectedStepperLable = 'Preview'
      // Set a past date
      component.eventDetailsForm.patchValue({ startDate: new Date('2020-01-01') })
      mockDatePipe.transform.mockImplementation((_val: any, fmt: string) => {
        if (fmt === 'yyyy-MM-dd') return '2020-01-01'
        return ''
      })
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please select a future date and time to start the event.')
    })

    it('should return false when draft+live and preEventForm is invalid', () => {
      component.selectedStepperLable = 'Preview'
      component.eventDetails = { status: 'draft', typeofEvent: 'live' }
      component.preEventForm = new FormBuilder().group({
        test: ['', Validators.required],
      })
      let ci = 0
      mockDatePipe.transform.mockImplementation(() => { ci++; return ci === 1 ? '2025-04-22' : '2030-12-01' })
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please fill mandatory fields in Event Setup > Pre Event Setup')
    })

    it('should return false when draft+live and courseSelectionForm is invalid', () => {
      component.selectedStepperLable = 'Preview'
      component.eventDetails = { status: 'draft', typeofEvent: 'live' }
      component.preEventForm = new FormBuilder().group({ test: ['value'] })
      component.courseSelectionForm = new FormBuilder().group({
        selectedCourse: [null, Validators.required],
      })
      let ci = 0
      mockDatePipe.transform.mockImplementation(() => { ci++; return ci === 1 ? '2025-04-22' : '2030-12-01' })
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please select one course in course Linking')
    })

    it('should return false when live+live and preEventForm is invalid', () => {
      component.selectedStepperLable = 'Preview'
      component.eventDetails = { status: 'Live', typeofEvent: 'live' }
      component.preEventForm = new FormBuilder().group({
        test: ['', Validators.required],
      })
      let ci = 0
      mockDatePipe.transform.mockImplementation(() => { ci++; return ci === 1 ? '2025-04-22' : '2030-12-01' })
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please fill mandatory fields in Event Setup > Pre Event Setup')
    })

    it('should return false when live+live and postEventForm is invalid', () => {
      component.selectedStepperLable = 'Preview'
      component.eventDetails = { status: 'Live', typeofEvent: 'live' }
      component.preEventForm = new FormBuilder().group({ test: ['value'] })
      component.postEventForm = new FormBuilder().group({
        test: ['', Validators.required],
      })
      let ci = 0
      mockDatePipe.transform.mockImplementation(() => { ci++; return ci === 1 ? '2025-04-22' : '2030-12-01' })
      expect(component.canPublish).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please fill mandatory fields in Event Setup > Post Event Setup')
    })
  })

  // ──────────────────────────────────────────────
  // publish
  // ──────────────────────────────────────────────
  describe('publish', () => {
    beforeEach(() => {
      initWithDefaults()
      setValidForm()
      component.competencies = [{ name: 'C1' }]
      component.materialsList = [{ title: 'M', content: 'C' }]
      component.eventDetails = { status: 'draft', typeofEvent: 'Online' }
      component.eventId = 'e1'
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))
    })

    it('should call saveAndExit with SentToPublish when canPublish is true', () => {
      component.selectedStepperLable = 'Preview'
      let ci = 0
      mockDatePipe.transform.mockImplementation(() => { ci++; return ci === 1 ? '2025-04-22' : '2030-12-01' })
      const spy = jest.spyOn(component, 'saveAndExit')
      component.publish()
      expect(spy).toHaveBeenCalledWith('SentToPublish')
    })

    it('should not call saveAndExit when canPublish is false', () => {
      component.selectedStepperLable = 'Basic Details'
      const spy = jest.spyOn(component, 'saveAndExit')
      component.publish()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should fetch competencies from course for live event without competencies', () => {
      component.selectedStepperLable = 'Preview'
      component.eventDetails = { status: 'draft', typeofEvent: 'live' }
      component.competencies = []
      component.courseSelectionForm = new FormBuilder().group({
        selectedCourse: [{ identifier: 'c1', competencies_v6: [{ id: 1 }] }],
      })
      let ci = 0
      mockDatePipe.transform.mockImplementation(() => { ci++; return ci === 1 ? '2025-04-22' : '2030-12-01' })
      component.publish()
      expect(component.competencies).toEqual([{ id: 1 }])
    })

    it('should not fetch competencies when courseSelectionForm is invalid', () => {
      component.selectedStepperLable = 'Preview'
      component.eventDetails = { status: 'draft', typeofEvent: 'live' }
      component.competencies = []
      component.courseSelectionForm = new FormBuilder().group({
        selectedCourse: [null, Validators.required],
      })
      component.publish()
      expect(component.competencies).toEqual([])
    })
  })

  // ──────────────────────────────────────────────
  // isValidTimeToStart
  // ──────────────────────────────────────────────
  describe('isValidTimeToStart', () => {
    beforeEach(() => initWithDefaults())

    it('should return true for future date', () => {
      component.eventDetailsForm.patchValue({
        startDate: new Date('2030-12-01'),
        startTime: '10:00 AM',
      })
      let ci = 0
      mockDatePipe.transform.mockImplementation(() => {
        ci++
        return ci === 1 ? '2025-04-22' : '2030-12-01'
      })
      // today < input → true
      expect(component.isValidTimeToStart).toBe(true)
    })

    it('should return false for past date', () => {
      component.eventDetailsForm.patchValue({
        startDate: new Date('2020-01-01'),
        startTime: '10:00 AM',
      })
      mockDatePipe.transform.mockReturnValue('2020-01-01')
      // Force different dates for today vs input
      let callCount = 0
      mockDatePipe.transform.mockImplementation(() => {
        callCount++
        return callCount === 1 ? '2025-04-22' : '2020-01-01'
      })
      expect(component.isValidTimeToStart).toBe(false)
    })

    it('should return false when same date and time is in the past', () => {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      component.eventDetailsForm.patchValue({
        startDate: today,
        startTime: '12:00 AM', // midnight is always in the past
      })
      mockDatePipe.transform.mockReturnValue(todayStr)
      expect(component.isValidTimeToStart).toBe(false)
    })
  })

  // ──────────────────────────────────────────────
  // isTimeLessThanNow
  // ──────────────────────────────────────────────
  describe('isTimeLessThanNow', () => {
    it('should return true when given time is before current time', () => {
      expect(component.isTimeLessThanNow('12:00 AM')).toBe(true)
    })

    it('should return false when given time is far in the future', () => {
      expect(component.isTimeLessThanNow('11:59 PM')).toBe(false)
    })
  })

  // ──────────────────────────────────────────────
  // timeToMinutes
  // ──────────────────────────────────────────────
  describe('timeToMinutes', () => {
    it('should convert AM times', () => {
      expect(component.timeToMinutes('10:30 AM')).toBe(630)
      expect(component.timeToMinutes('12:00 AM')).toBe(0) // 12 AM = 0 hours
    })

    it('should convert PM times', () => {
      expect(component.timeToMinutes('2:15 PM')).toBe(855)
      expect(component.timeToMinutes('12:00 PM')).toBe(720) // 12 PM = 12 hours
    })
  })

  // ──────────────────────────────────────────────
  // addCompetencies
  // ──────────────────────────────────────────────
  it('addCompetencies should set competencies', () => {
    const c = [{ name: 'A' }]
    component.addCompetencies(c)
    expect(component.competencies).toBe(c)
  })

  // ──────────────────────────────────────────────
  // saveAndExit
  // ──────────────────────────────────────────────
  describe('saveAndExit', () => {
    beforeEach(() => {
      initWithDefaults()
      component.eventId = 'e1'
      component.eventDetails = { identifier: 'e1', status: 'draft', name: 'E' }
    })

    it('should call updateEvent with Draft status by default', () => {
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))
      component.saveAndExit()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockEventsService.updateEvent).toHaveBeenCalled()
      const body = mockEventsService.updateEvent.mock.calls[0][0]
      expect(body.request.event.status).toBe('Draft')
    })

    it('should show Draft success message', () => {
      jest.useFakeTimers()
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))
      component.saveAndExit('Draft')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Event details saved successfully')
      jest.advanceTimersByTime(1100)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      jest.useRealTimers()
    })

    it('should show updatePostEvent success message', () => {
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))
      component.saveAndExit('updatePostEvent')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Post event details updated successfully')
    })

    it('should show approval success message for SentToPublish', () => {
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))
      component.saveAndExit('SentToPublish')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Event details sent for approval successfully')
    })

    it('should handle falsy response', () => {
      mockEventsService.updateEvent.mockReturnValue(of(null))
      component.saveAndExit('Draft')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should handle error with message', () => {
      const error = { error: { message: 'Save failed' } }
      mockEventsService.updateEvent.mockReturnValue(throwError(() => error))
      component.saveAndExit('Draft')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong while updating event, please try again')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should handle error without message', () => {
      const error = new HttpErrorResponse({ error: {}, status: 500, statusText: 'Error' })
      mockEventsService.updateEvent.mockReturnValue(throwError(() => error))
      component.saveAndExit('Draft')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong while updating event, please try again')
    })
  })

  // ──────────────────────────────────────────────
  // saveAndPublish
  // ──────────────────────────────────────────────
  describe('saveAndPublish', () => {
    beforeEach(() => {
      initWithDefaults()
      component.eventId = 'e1'
      component.eventDetails = { identifier: 'e1', status: 'draft', name: 'E', publishedOn: '2024-01-01' }
    })

    it('should call updateEvent then publishEvent on success', () => {
      mockEventsService.updateEvent.mockReturnValue(of({
        result: { versionKey: 'v1', identifier: 'e1' },
      }))
      mockEventsService.publishEvent.mockReturnValue(of({ success: true }))
      component.saveAndPublish()
      expect(mockEventsService.updateEvent).toHaveBeenCalled()
      expect(mockEventsService.publishEvent).toHaveBeenCalledWith('e1', expect.objectContaining({
        request: { event: expect.objectContaining({ versionKey: 'v1', status: 'Live' }) },
      }))
    })

    it('should show success message and navigate back after publish', () => {
      jest.useFakeTimers()
      mockEventsService.updateEvent.mockReturnValue(of({
        result: { versionKey: 'v1', identifier: 'e1' },
      }))
      mockEventsService.publishEvent.mockReturnValue(of({ success: true }))
      component.pathUrl = 'upcoming'
      component.saveAndPublish()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Event details saved successfully')
      jest.advanceTimersByTime(2100)
      expect(mockRouter.navigate).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('should handle falsy publishEvent response', () => {
      mockEventsService.updateEvent.mockReturnValue(of({
        result: { versionKey: 'v1', identifier: 'e1' },
      }))
      mockEventsService.publishEvent.mockReturnValue(of(null))
      component.saveAndPublish()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should handle publishEvent error', () => {
      mockEventsService.updateEvent.mockReturnValue(of({
        result: { versionKey: 'v1', identifier: 'e1' },
      }))
      const error = { error: { message: 'Something went wrong while updating event, please try again' } }
      mockEventsService.publishEvent.mockReturnValue(throwError(() => error))
      component.saveAndPublish()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong while updating event, please try again')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should handle publishEvent error without message', () => {
      mockEventsService.updateEvent.mockReturnValue(of({
        result: { versionKey: 'v1', identifier: 'e1' },
      }))
      const error = new HttpErrorResponse({ error: {}, status: 500, statusText: 'Error' })
      mockEventsService.publishEvent.mockReturnValue(throwError(() => error))
      component.saveAndPublish()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong while updating event, please try again')
    })

    it('should handle falsy updateEvent response', () => {
      mockEventsService.updateEvent.mockReturnValue(of(null))
      component.saveAndPublish()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockEventsService.publishEvent).not.toHaveBeenCalled()
    })

    it('should handle updateEvent error', () => {
      const error = { error: { message: 'Update failed' } }
      mockEventsService.updateEvent.mockReturnValue(throwError(() => error))
      component.saveAndPublish()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong while updating event, please try again')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should handle updateEvent error without message', () => {
      const error = new HttpErrorResponse({ error: {}, status: 500, statusText: 'Error' })
      mockEventsService.updateEvent.mockReturnValue(throwError(() => error))
      component.saveAndPublish()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong while updating event, please try again')
    })
  })

  // ──────────────────────────────────────────────
  // getFormBodyOfEvent
  // ──────────────────────────────────────────────
  describe('getFormBodyOfEvent', () => {
    beforeEach(() => {
      initWithDefaults()
      component.eventDetails = { identifier: 'e1', status: 'draft', name: 'E' }
      component.eventDetailsForm.patchValue({
        eventName: 'Updated Event Name',
        description: longDesc,
        eventCategory: 'Workshop',
        startDate: new Date('2024-12-01'),
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        registrationLink: 'https://example.com',
      })
      mockDatePipe.transform.mockReturnValue('2024-12-01')
    })

    it('should set name, description, resourceType, status', () => {
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.name).toBe('Updated Event Name')
      expect(body.resourceType).toBe('Workshop')
      expect(body.status).toBe('Draft')
    })

    it('should set startDate, endDate, startTime, endTime, duration', () => {
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.startDate).toBe('2024-12-01')
      expect(body.endDate).toBe('2024-12-01')
      expect(body.startTime).toBeTruthy()
      expect(body.endTime).toBeTruthy()
      expect(body.duration).toBeDefined()
    })

    it('should set startDateTime and endDateTime', () => {
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.startDateTime).toContain('+0000')
      expect(body.endDateTime).toContain('+0000')
    })

    it('should include speakers, materials (without isNew), competencies', () => {
      component.speakersList = [{ name: 'S', email: '', description: '' }]
      component.materialsList = [{ title: 'M', content: 'C', isNew: true }]
      component.competencies = [{ name: 'C' }]
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.speakers).toHaveLength(1)
      expect(body.eventHandouts[0].isNew).toBeUndefined()
      expect(body.competencies_v6).toHaveLength(1)
    })

    it('should set submitedOn for SentToPublish status', () => {
      const body = component.getFormBodyOfEvent('SentToPublish')
      expect(body.submitedOn).toBeDefined()
      expect(body.submitedOn).toContain('+0000')
    })

    it('should use updatePostEvent status correctly', () => {
      component.eventDetails = { identifier: 'e1', status: 'Live', name: 'E' }
      const body = component.getFormBodyOfEvent('updatePostEvent')
      expect(body.status).toBe('Live') // uses eventDetails.status instead
    })

    it('should set recordedLinks for Webinar + past', () => {
      component.pathUrl = 'past'
      component.eventDetailsForm.patchValue({ eventCategory: 'Webinar' })
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.recordedLinks).toBeDefined()
      expect(body.registrationLink).toBe('')
    })

    it('should handle registrationLink with YouTube URL', () => {
      component.eventDetailsForm.patchValue({
        registrationLink: 'https://youtube.com/watch?v=abc123',
      })
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.registrationLink).toBe('https://www.youtube.com/embed/abc123')
    })

    it('should use recoredEventUrl when registrationLink is empty', () => {
      component.eventDetailsForm.patchValue({
        registrationLink: '',
        recoredEventUrl: 'https://zoom.us/rec',
      })
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.registrationLink).toBe('https://zoom.us/rec')
    })

    it('should handle no startTime/endTime', () => {
      component.eventDetailsForm.patchValue({ startTime: '', endTime: '' })
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.startTime).toBe('')
      expect(body.endTime).toBe('')
      expect(body.duration).toBeUndefined()
    })

    it('should handle no startDate', () => {
      component.eventDetailsForm.patchValue({ startDate: '' })
      mockDatePipe.transform.mockReturnValue('')
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.startDateTime).toBeUndefined()
      expect(body.endDateTime).toBeUndefined()
    })

    it('should include live event fields when typeofEvent is live', () => {
      component.eventDetailsForm.patchValue({ typeofEvent: 'live', maxEnrolments: 100 })
      component.courseSelectionForm = new FormBuilder().group({
        selectedCourse: [{ identifier: 'c1', competencies_v6: [{ n: 1 }] }],
      })
      component.preEventForm = new FormBuilder().group({
        meetingLink: ['https://meet.example.com'],
        agenda: ['Test agenda'],
        preEventReads: ['Read this'],
        selectedSpeaker: [['Speaker1']],
      })
      component.postEventForm = new FormBuilder().group({
        noOfAttendes: [50],
        eventDuration: ['2h 30m'],
        meetingSummary: ['Summary text'],
        postEventSummary: ['Post summary'],
      })
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.maxEnrolments).toBe(100)
      expect(body.courseLinked).toBe('c1')
      expect(body.registrationLink).toBe('https://meet.example.com')
      expect(body.meetingAgenda).toBe('Test agenda')
      expect(body.preEventReads).toEqual(['Read this'])
      expect(body.speakerDetails).toBeDefined()
      expect(body.noOfAttendes).toBe(50)
      expect(body.eventDuration).toBe(150)
      expect(body.meetingSummary).toBe('Summary text')
      expect(body.postEventSummary).toEqual(['Post summary'])
    })

    it('should default maxEnrolments to 0 when falsy for live', () => {
      component.eventDetailsForm.patchValue({ typeofEvent: 'live', maxEnrolments: '' })
      component.courseSelectionForm = new FormBuilder().group({ selectedCourse: [null] })
      component.preEventForm = new FormBuilder().group({
        meetingLink: [''], agenda: [''], preEventReads: [''], selectedSpeaker: [[]],
      })
      component.postEventForm = new FormBuilder().group({
        noOfAttendes: [0], eventDuration: [''], meetingSummary: [''], postEventSummary: [''],
      })
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.maxEnrolments).toBe(0)
      expect(body.courseLinked).toBeUndefined()
    })

    it('should handle startDate with startTime but no endTime for dateTime', () => {
      component.eventDetailsForm.patchValue({ endTime: '' })
      const body = component.getFormBodyOfEvent('Draft')
      expect(body.startDateTime).toBeDefined()
      expect(body.endDateTime).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────
  // youTubeUrlChange
  // ──────────────────────────────────────────────
  describe('youTubeUrlChange', () => {
    it('should convert youtube.com/watch URL', () => {
      expect(component.youTubeUrlChange('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube.com/embed/abc123')
    })

    it('should convert youtu.be short URL', () => {
      expect(component.youTubeUrlChange('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123')
    })

    it('should return non-YouTube URL as-is', () => {
      expect(component.youTubeUrlChange('https://example.com/video')).toBe('https://example.com/video')
    })
  })

  // ──────────────────────────────────────────────
  // getFormatedTime
  // ──────────────────────────────────────────────
  describe('getFormatedTime', () => {
    it('should convert PM time', () => {
      expect(component.getFormatedTime('2:30 PM')).toBe('14:30:00+05:30')
    })

    it('should convert AM time', () => {
      expect(component.getFormatedTime('9:15 AM')).toBe('09:15:00+05:30')
    })

    it('should convert 12 PM correctly', () => {
      expect(component.getFormatedTime('12:00 PM')).toBe('12:00:00+05:30')
    })

    it('should convert 12 AM to 00:00', () => {
      expect(component.getFormatedTime('12:00 AM')).toBe('00:00:00+05:30')
    })
  })

  // ──────────────────────────────────────────────
  // formatTime
  // ──────────────────────────────────────────────
  describe('formatTime', () => {
    it('should pad single-digit hours and minutes', () => {
      expect(component.formatTime(9, 5)).toBe('09:05:00')
    })

    it('should not pad double-digit values', () => {
      expect(component.formatTime(14, 30)).toBe('14:30:00')
    })
  })

  // ──────────────────────────────────────────────
  // getTimeDifferenceInMinutes
  // ──────────────────────────────────────────────
  describe('getTimeDifferenceInMinutes', () => {
    it('should calculate difference correctly', () => {
      expect(component.getTimeDifferenceInMinutes('10:00:00+05:30', '11:30:00+05:30')).toBe(90)
    })

    it('should return 0 for same times', () => {
      expect(component.getTimeDifferenceInMinutes('10:00:00+05:30', '10:00:00+05:30')).toBe(0)
    })
  })

  // ──────────────────────────────────────────────
  // combineDateAndTime
  // ──────────────────────────────────────────────
  describe('combineDateAndTime', () => {
    it('should combine and convert to ISO with +0000 suffix', () => {
      const result = component.combineDateAndTime('2024-12-01', '10:30:00+05:30')
      expect(result).toContain('+0000')
    })
  })

  // ──────────────────────────────────────────────
  // openSnackBar
  // ──────────────────────────────────────────────
  it('openSnackBar should call matSnackBar.open', () => {
    ; (component as any).openSnackBar('Hello')
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Hello')
  })

  // ──────────────────────────────────────────────
  // updatePostEvent
  // ──────────────────────────────────────────────
  describe('updatePostEvent', () => {
    beforeEach(() => {
      initWithDefaults()
      component.eventId = 'e1'
      component.eventDetails = { identifier: 'e1', status: 'Live', name: 'E', publishedOn: '2024-01-01' }
    })

    it('should show error and return when postEventForm is invalid', () => {
      component.postEventForm = new FormBuilder().group({
        test: ['', Validators.required],
      })
      component.updatePostEvent()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please fill mandatory fields in Post Event Setup')
    })

    it('should call saveAndPublish when postEventForm is valid', () => {
      component.postEventForm = new FormBuilder().group({ test: ['value'] })
      mockEventsService.updateEvent.mockReturnValue(of({ result: { versionKey: 'v1', identifier: 'e1' } }))
      mockEventsService.publishEvent.mockReturnValue(of({ success: true }))
      const spy = jest.spyOn(component, 'saveAndPublish')
      component.updatePostEvent()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────
  // convertDurationToMinutes
  // ──────────────────────────────────────────────
  describe('convertDurationToMinutes', () => {
    it('should return 0 for empty string', () => {
      expect(component.convertDurationToMinutes('')).toBe(0)
    })

    it('should return 0 for null/undefined', () => {
      expect(component.convertDurationToMinutes(null as any)).toBe(0)
    })

    it('should parse hours only', () => {
      expect(component.convertDurationToMinutes('2h')).toBe(120)
    })

    it('should parse minutes only', () => {
      expect(component.convertDurationToMinutes('45m')).toBe(45)
    })

    it('should parse seconds only (rounded)', () => {
      expect(component.convertDurationToMinutes('90s')).toBe(2) // 90/60 = 1.5 → round = 2
    })

    it('should parse combined duration', () => {
      expect(component.convertDurationToMinutes('2h 30m 45s')).toBe(151)
    })

    it('should handle duration without seconds', () => {
      expect(component.convertDurationToMinutes('1h 15m')).toBe(75)
    })
  })
})