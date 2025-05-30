import { CreateEventComponent } from './create-event.component'
import { FormBuilder } from '@angular/forms'
import { EventsService } from '../../services/events.service'
import { ActivatedRoute, Router } from '@angular/router'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { DatePipe } from '@angular/common'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { ChangeDetectorRef } from '@angular/core'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { StepperSelectionEvent } from '@angular/cdk/stepper'

describe('CreateEventComponent', () => {
  let component: CreateEventComponent
  let mockEventsService: jest.Mocked<EventsService>
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>
  let mockRouter: jest.Mocked<Router>
  let mockFormBuilder: FormBuilder
  let mockMatSnackBar: jest.Mocked<MatSnackBar>
  let mockDatePipe: jest.Mocked<DatePipe>
  let mockLoaderService: jest.Mocked<LoaderService>
  let mockChangeDetectorRef: jest.Mocked<ChangeDetectorRef>
  let mockDialog: jest.Mocked<MatLegacyDialog>

  beforeEach(() => {
    // Create mock services
    mockEventsService = {
      updateEvent: jest.fn(),
      publishEvent: jest.fn()
    } as any

    mockActivatedRoute = {
      queryParams: of({ mode: 'edit', pathUrl: 'upcoming' }),
      snapshot: {
        data: {
          configService: { userProfile: { id: 'user123' } },
          eventDetails: {
            data: {
              identifier: 'event123',
              name: 'Test Event',
              description: 'Test description',
              status: 'draft'
            }
          }
        }
      }
    } as any

    mockRouter = {
      navigate: jest.fn()
    } as any

    mockFormBuilder = new FormBuilder()

    mockMatSnackBar = {
      open: jest.fn()
    } as any

    mockDatePipe = {
      transform: jest.fn()
    } as any

    mockLoaderService = {
      changeLoaderState: jest.fn()
    } as any

    mockChangeDetectorRef = {
      detectChanges: jest.fn()
    } as any

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    } as any

    // Create component instance
    component = new CreateEventComponent(
      mockEventsService,
      mockActivatedRoute,
      mockFormBuilder,
      mockRouter,
      mockMatSnackBar,
      mockDatePipe,
      mockLoaderService,
      mockChangeDetectorRef,
      mockDialog
    )
  })

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize form with default values', () => {
      component.ngOnInit()

      expect(component.eventDetailsForm).toBeDefined()
      expect(component.eventDetailsForm.get('eventName')).toBeTruthy()
      expect(component.eventDetailsForm.get('description')).toBeTruthy()
      expect(component.eventDetailsForm.get('eventCategory')).toBeTruthy()
    })

    it('should set openMode and pathUrl from query params', () => {
      component.ngOnInit()

      expect(component.openMode).toBe('edit')
      expect(component.pathUrl).toBe('upcoming')
    })

    it('should disable form when openMode is view', () => {
      mockActivatedRoute.queryParams = of({ mode: 'view', pathUrl: 'upcoming' })

      component.ngOnInit()

      expect(component.eventDetailsForm.disabled).toBe(true)
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should validate required fields', () => {
      const eventNameControl = component.eventDetailsForm.get('eventName')
      const descriptionControl = component.eventDetailsForm.get('description')

      expect(eventNameControl?.hasError('required')).toBe(true)
      expect(descriptionControl?.hasError('required')).toBe(true)
    })

    it('should validate minimum length for event name', () => {
      const eventNameControl = component.eventDetailsForm.get('eventName')
      eventNameControl?.setValue('short')

      expect(eventNameControl?.hasError('minlength')).toBe(true)
    })

    it('should validate maximum length for event name', () => {
      const eventNameControl = component.eventDetailsForm.get('eventName')
      const longName = 'a'.repeat(71)
      eventNameControl?.setValue(longName)

      expect(eventNameControl?.hasError('maxlength')).toBe(true)
    })

    it('should validate description length', () => {
      const descriptionControl = component.eventDetailsForm.get('description')
      descriptionControl?.setValue('short')

      expect(descriptionControl?.hasError('minlength')).toBe(true)
    })
  })

  describe('Event Details Patching', () => {
    beforeEach(() => {
      component.eventDetails = {
        identifier: 'event123',
        name: 'Test Event',
        description: 'Test description for the event that is long enough to meet validation requirements. This description contains more than 250 characters to ensure it passes the minimum length validation that is set in the form.',
        resourceType: 'Webinar',
        startDate: '2024-12-01',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        registrationLink: 'https://example.com',
        status: 'draft',
        speakers: [{ name: 'John Doe', designation: 'Expert' }],
        eventHandouts: [{ title: 'Material 1', content: 'Content 1' }],
        competencies_v6: [{ name: 'Skill 1' }]
      }
      component.ngOnInit()
    })

    it('should patch form with event details', () => {
      component.patchEventDetails()

      expect(component.eventDetailsForm.get('eventName')?.value).toBe('Test Event')
      expect(component.eventDetailsForm.get('eventCategory')?.value).toBe('Webinar')
    })

    it('should set event ID and status', () => {
      component.patchEventDetails()

      expect(component.eventId).toBe('event123')
      expect(component.eventStatus).toBe('draft')
    })

    it('should populate speakers, materials and competencies', () => {
      component.patchEventDetails()

      expect(component.speakersList).toHaveLength(1)
      expect(component.materialsList).toHaveLength(1)
      expect(component.competencies).toHaveLength(1)
    })
  })

  describe('Stepper Navigation', () => {
    beforeEach(() => {
      component.ngOnInit()
      // Mock stepper
      component.stepper = {
        steps: {
          toArray: () => [
            { label: 'Basic Details' },
            { label: 'Add Speaker' },
            { label: 'Add Material' },
            { label: 'Preview' }
          ]
        },
        _getIndicatorType: jest.fn(),
        selectedIndex: 0
      } as any
    })

    it('should handle stepper selection change', () => {
      const event: StepperSelectionEvent = {
        selectedIndex: 1,
        previouslySelectedIndex: 0,
        selectedStep: null as any,
        previouslySelectedStep: null as any
      }

      component.onSelectionChange(event)

      expect(component.currentStepperIndex).toBe(1)
      expect(component.selectedStepperLable).toBe('Add Speaker')
    })

    it('should move to next form when validation passes', () => {
      // Set valid form data
      component.eventDetailsForm.patchValue({
        eventName: 'Valid Event Name That Is Long Enough',
        description: 'Valid description that is long enough to meet the minimum length requirement of 250 characters. This description contains more than the required characters to ensure it passes validation and allows the user to proceed to the next step.',
        eventCategory: 'Webinar',
        startDate: new Date(),
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        registrationLink: 'https://example.com',
        appIcon: 'icon.png',
        typeofEvent: 'Online'
      })

      const initialIndex = component.currentStepperIndex
      component.moveToNextForm()

      expect(component.currentStepperIndex).toBe(initialIndex + 1)
    })
  })

  describe('Validation Getters', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should validate canMoveToNext for Basic Details step', () => {
      component.selectedStepperLable = 'Basic Details'

      expect(component.canMoveToNext).toBe(false)

      // Set valid form
      component.eventDetailsForm.patchValue({
        eventName: 'Valid Event Name That Is Long Enough',
        description: 'Valid description that is long enough to meet the minimum length requirement of 250 characters. This description contains more than the required characters to ensure it passes validation.',
        eventCategory: 'Webinar',
        startDate: new Date(),
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        registrationLink: 'https://example.com',
        appIcon: 'icon.png',
        typeofEvent: 'Online'
      })

      expect(component.canMoveToNext).toBe(true)
    })

    it('should validate canMoveToNext for Add Speaker step', () => {
      component.selectedStepperLable = 'Add Speaker'
      component.speakersList = []

      expect(component.canMoveToNext).toBe(false)

      component.speakersList = [{ name: 'John Doe', email: 'Expert', description: '' }]
      expect(component.canMoveToNext).toBe(true)
    })

    it('should validate materials correctly', () => {
      component.materialsList = [
        { title: 'Material 1', content: 'Content 1' },
        { title: '', content: 'Content 2' }
      ]

      expect(component.isMaterialsValid).toBe(false)

      component.materialsList = [
        { title: 'Material 1', content: 'Content 1' },
        { title: 'Material 2', content: 'Content 2' }
      ]

      expect(component.isMaterialsValid).toBe(true)
    })
  })

  describe('Time Validation', () => {
    beforeEach(() => {
      component.ngOnInit()
      mockDatePipe.transform.mockImplementation((format) => {
        if (format === 'yyyy-MM-dd') {
          return '2024-12-01'
        }
        if (format === 'h:mm a') {
          return '10:00 AM'
        }
        return ''
      })
    })

    it('should validate future date and time', () => {
      // Mock current date to be in the past
      jest.spyOn(Date.prototype, 'getTime').mockReturnValue(new Date('2024-11-30').getTime())

      component.eventDetailsForm.patchValue({
        startDate: new Date('2024-12-01'),
        startTime: '10:00 AM'
      })

      expect(component.isValidTimeToStart).toBe(true)
    })

    it('should convert time to minutes correctly', () => {
      expect(component.timeToMinutes('10:30 AM')).toBe(630) // 10.5 * 60
      expect(component.timeToMinutes('2:15 PM')).toBe(855) // (14.25 * 60)
    })

    it('should check if time is less than now', () => {
      mockDatePipe.transform.mockReturnValue('2:00 PM')

      expect(component.isTimeLessThanNow('1:00 PM')).toBe(true)
      expect(component.isTimeLessThanNow('3:00 PM')).toBe(false)
    })
  })

  describe('Save and Update Operations', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.eventId = 'event123'
      component.eventDetails = {
        identifier: 'event123',
        status: 'draft',
        name: 'Test Event'
      }
    })

    it('should save and exit with draft status', () => {
      mockEventsService.updateEvent.mockReturnValue(of({ success: true }))

      component.saveAndExit('Draft')

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockEventsService.updateEvent).toHaveBeenCalled()
    })

    it('should handle save error', () => {
      const error = new HttpErrorResponse({
        error: { message: 'Save failed' },
        status: 500,
        statusText: 'Internal Server Error'
      })
      mockEventsService.updateEvent.mockReturnValue(throwError(() => error))

      component.saveAndExit('Draft')

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Save failed')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should publish event successfully', () => {
      mockEventsService.updateEvent.mockReturnValue(of({
        result: { versionKey: 'v1', identifier: 'event123' }
      }))
      mockEventsService.publishEvent.mockReturnValue(of({ success: true }))

      component.saveAndPublish()

      expect(mockEventsService.updateEvent).toHaveBeenCalled()
      expect(mockEventsService.publishEvent).toHaveBeenCalled()
    })
  })

  describe('Helper Methods', () => {
    it('should format YouTube URL correctly', () => {
      const watchUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      const shortUrl = 'https://youtu.be/dQw4w9WgXcQ'
      const expectedEmbed = 'https://www.youtube.com/embed/dQw4w9WgXcQ'

      expect(component.youTubeUrlChange(watchUrl)).toBe(expectedEmbed)
      expect(component.youTubeUrlChange(shortUrl)).toBe(expectedEmbed)
    })

    it('should return original URL if not YouTube', () => {
      const regularUrl = 'https://example.com/video'
      expect(component.youTubeUrlChange(regularUrl)).toBe(regularUrl)
    })

    it('should format time correctly', () => {
      expect(component.formatTime(9, 30)).toBe('09:30:00')
      expect(component.formatTime(14, 5)).toBe('14:05:00')
    })

    it('should get formatted time with timezone', () => {
      const time12Hour = '2:30 PM'
      const result = component.getFormatedTime(time12Hour)

      expect(result).toBe('14:30:00+05:30')
    })

    it('should calculate time difference in minutes', () => {
      const time1 = '10:00:00+05:30'
      const time2 = '11:30:00+05:30'

      expect(component.getTimeDifferenceInMinutes(time1, time2)).toBe(90)
    })

    it('should combine date and time correctly', () => {
      const date = '2024-12-01'
      const time = '10:30:00+05:30'
      const result = component.combineDateAndTime(date, time)

      expect(result).toContain('2024-12-01T10:30:00')
      expect(result).toContain('+0000')
    })
  })

  describe('UI Interactions', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should open confirmation popup', () => {
      component.openConforamtionPopup()

      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should navigate back', () => {
      component.pathUrl = 'upcoming'
      component.navigateBack()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/events/upcoming'])
    })

    it('should show preview', () => {
      component.eventDetails = { status: 'draft' }
      component.stepper = {
        steps: {
          toArray: () => [
            { label: 'Basic Details' },
            { label: 'Preview' }
          ]
        }
      } as any

      component.preview()

      expect(component.showPreview).toBe(true)
      expect(component.updatedEventDetails).toBeDefined()
    })

    it('should add competencies', () => {
      const competencies = [{ name: 'Skill 1' }, { name: 'Skill 2' }]

      component.addCompetencies(competencies)

      expect(component.competencies).toEqual(competencies)
    })

    it('should open snack bar with message', () => {
      const message = 'Test message';

      (component as any).openSnackBar(message)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(message)
    })
  })

  describe('Form Body Generation', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.eventDetails = {
        identifier: 'event123',
        name: 'Original Event',
        status: 'draft'
      }
      component.eventDetailsForm.patchValue({
        eventName: 'Updated Event Name That Is Long Enough For Validation',
        description: 'Updated description that meets the minimum length requirement of 250 characters. This description is sufficiently long to pass validation checks.',
        eventCategory: 'Workshop',
        startDate: new Date('2024-12-01'),
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        registrationLink: 'https://example.com'
      })
      mockDatePipe.transform.mockReturnValue('2024-12-01')
    })

    it('should generate form body with updated values', () => {
      const formBody = component.getFormBodyOfEvent('Draft')

      expect(formBody.name).toBe('Updated Event Name That Is Long Enough For Validation')
      expect(formBody.resourceType).toBe('Workshop')
      expect(formBody.status).toBe('Draft')
    })

    it('should include speakers, materials and competencies', () => {
      component.speakersList = [{ name: 'John Doe', email: '', description: '' }]
      component.materialsList = [{ title: 'Material 1', content: 'Content 1', isNew: true }]
      component.competencies = [{ name: 'Skill 1' }]

      const formBody = component.getFormBodyOfEvent('Draft')

      expect(formBody.speakers).toHaveLength(1)
      expect(formBody.eventHandouts).toHaveLength(1)
      expect(formBody.eventHandouts[0].isNew).toBeUndefined() // Should be removed
      expect(formBody.competencies_v6).toHaveLength(1)
    })

    it('should set submittedOn date for SentToPublish status', () => {
      const formBody = component.getFormBodyOfEvent('SentToPublish')

      expect(formBody.submitedOn).toBeDefined()
      expect(formBody.submitedOn).toContain('+0000')
    })
  })

  describe('ngAfterViewInit', () => {
    it('should configure stepper indicator type', () => {
      const mockStepper = {
        _getIndicatorType: jest.fn()
      } as any

      component.stepper = mockStepper
      component.ngAfterViewInit()

      expect(mockStepper._getIndicatorType()).toBe('number')
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
    })

    it('should handle undefined stepper', () => {
      component.stepper = undefined

      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })
})