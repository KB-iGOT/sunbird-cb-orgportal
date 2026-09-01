import { EventBasicDetailsComponent } from './event-basic-details.component'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EventsService } from '../../services/events.service'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { DatePipe } from '@angular/common'
import { of, throwError } from 'rxjs'
import { URL_PATRON } from '../../models/events.model'
import * as _ from 'lodash'
import { NgZone } from '@angular/core'

describe('EventBasicDetailsComponent', () => {
  let component: EventBasicDetailsComponent
  let mockMatSnackBar: jest.Mocked<MatSnackBar>
  let mockEventsService: jest.Mocked<EventsService>
  let mockLoaderService: jest.Mocked<LoaderService>
  let mockDatePipe: jest.Mocked<DatePipe>
  let mockNgZone: any

  const mockCreateContentResponse = {
    result: {
      identifier: 'mock-content-id'
    }
  }

  const mockUploadResponse = {
    result: {
      artifactUrl: 'https://storage.googleapis.com/igot/fakepath/video.mp4'
    }
  }


  beforeEach(() => {
    // Create mocks for all dependencies
    mockMatSnackBar = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>

    mockEventsService = {
      createContent: jest.fn().mockReturnValue(of(mockCreateContentResponse)),
      uploadContent: jest.fn().mockReturnValue(of(mockUploadResponse))
    } as unknown as jest.Mocked<EventsService>

    mockLoaderService = {
      changeLoaderState: jest.fn()
    } as unknown as jest.Mocked<LoaderService>

    mockDatePipe = {
      transform: jest.fn()
    } as unknown as jest.Mocked<DatePipe>

    mockNgZone = {
      run: jest.fn().mockImplementation((fn: () => any) => fn()),
    }

    // Initialize component with mocked dependencies
    component = new EventBasicDetailsComponent(
      mockMatSnackBar,
      mockEventsService,
      mockLoaderService,
      mockDatePipe,
      mockNgZone as NgZone
    )

    // Setup default form group
    component.eventDetails = new FormGroup({
      startDate: new FormControl(null),
      startTime: new FormControl(null),
      endTime: new FormControl(null),
      appIcon: new FormControl(''),
      recoredEventUrl: new FormControl(''),
      registrationLink: new FormControl('', [Validators.pattern(URL_PATRON)])
    })

    component.userProfile = {
      rootOrgId: 'testRootOrgId',
      departmentName: 'testDepartment',
      userName: 'testUser',
      userId: 'testUserId'
    }
  })

  describe('ngOnInit', () => {
    it('should initialize component correctly', () => {
      component.openMode = 'edit'
      component.openTab = 'draft'

      const startDateSpy = jest.spyOn(component.eventDetails.controls.startDate.valueChanges, 'subscribe')
      const startTimeSpy = jest.spyOn(component.eventDetails.controls.startTime.valueChanges, 'subscribe')
      const registrationLinkSpy = jest.spyOn(component.eventDetails.controls.registrationLink.valueChanges, 'subscribe')

      component.ngOnInit()

      expect(startDateSpy).toHaveBeenCalled()
      expect(startTimeSpy).toHaveBeenCalled()
      expect(registrationLinkSpy).toHaveBeenCalled()
    })

    it('should not subscribe to valueChanges if not in edit mode', () => {
      component.openMode = 'view'
      component.openTab = 'draft'

      const startDateSpy = jest.spyOn(component.eventDetails.controls.startDate.valueChanges, 'subscribe')

      component.ngOnInit()

      expect(startDateSpy).not.toHaveBeenCalled()
    })
  })

  describe('convertTo12HourFormat', () => {
    it('should convert 24-hour format to 12-hour format - AM', () => {
      const result = component.convertTo12HourFormat('09:30+05:30')
      expect(result).toBe('9:30 AM')
    })

    it('should convert 24-hour format to 12-hour format - PM', () => {
      const result = component.convertTo12HourFormat('14:45+05:30')
      expect(result).toBe('2:45 PM')
    })

    it('should handle midnight correctly', () => {
      const result = component.convertTo12HourFormat('00:15+05:30')
      expect(result).toBe('12:15 AM')
    })

    it('should handle noon correctly', () => {
      const result = component.convertTo12HourFormat('12:00+05:30')
      expect(result).toBe('12:00 PM')
    })
  })

  describe('ngOnChanges', () => {
    it('should handle changes when eventDetails is modified', () => {
      const changes = {
        eventDetails: {
          currentValue: component.eventDetails,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      const convertSpy = jest.spyOn(component, 'convertTo12HourFormat')
      // const generateSpy = jest.spyOn(component, 'generatMinTimeToEnd')

      component.eventDetails.controls.startTime.setValue('14:30+05:30')
      component.eventDetails.controls.endTime.setValue('16:30+05:30')

      component.ngOnChanges(changes)

      expect(convertSpy).toHaveBeenCalledWith('14:30+05:30')
      expect(convertSpy).toHaveBeenCalledWith('16:30+05:30')
    })

    it('should set disableUpload if registrationLink exists', () => {
      component.eventDetails.controls.registrationLink.setValue('https://example.com')

      const changes = {
        eventDetails: {
          currentValue: component.eventDetails,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      component.ngOnChanges(changes)

      expect(component.disableUpload).toBe(true)
    })

    it('should set disableUrl if recoredEventUrl exists', () => {
      component.eventDetails.controls.recoredEventUrl.setValue(['https://example.com/video'])

      const changes = {
        eventDetails: {
          currentValue: component.eventDetails,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      component.ngOnChanges(changes)

      expect(component.disableUrl).toBe(true)
    })
  })

  describe('checkMinTimeToStart', () => {
    it('should set minTimeToStart to current time when date is today', () => {
      const today = new Date()
      mockDatePipe.transform.mockImplementation((date, format) => {
        if (date instanceof Date && format === 'yyyy-MM-dd') {
          return '2025-05-20'
        }
        return null
      })

      const generateSpy = jest.spyOn(component, 'generatMinTimeToStart')

      component.checkMinTimeToStart(today)

      expect(generateSpy).toHaveBeenCalled()
    })

    it('should set minTimeToStart to 12:00 am when date is not today', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      mockDatePipe.transform.mockImplementation((date, format) => {
        if (format === 'yyyy-MM-dd') {
          if (date === tomorrow) return '2025-05-21'
          return '2025-05-20'
        }
        return null
      })

      component.checkMinTimeToStart(tomorrow)

      expect(component.minTimeToStart).toBe('12:00 am')
    })
  })

  describe('generatMinTimeToStart', () => {
    it('should set minTimeToStart to current time', () => {
      mockDatePipe.transform.mockReturnValue('10:30 am')

      component.generatMinTimeToStart()

      expect(component.minTimeToStart).toBe('10:30 am')
    })

    it('should reset start and end time if current startTime is less than now', () => {
      mockDatePipe.transform.mockReturnValue('10:30 am')
      component.eventDetails.controls.startTime.setValue('9:30 AM')

      // const isTimeLessSpy = jest.spyOn(component, 'isTimeLessThanNow').mockReturnValue(true)

      component.generatMinTimeToStart()

      expect(component.eventDetails.controls.startTime.value).toBe('')
      expect(component.eventDetails.controls.endTime.value).toBe('')
    })
  })

  describe('isTimeLessThanNow', () => {
    it('should return true if given time is less than current time', () => {
      jest.spyOn(DatePipe.prototype, 'transform').mockReturnValue('10:30 am')
      const timeToMinutesSpy = jest.spyOn(component, 'timeToMinutes')
        .mockImplementationOnce(() => 630) // 10:30 am -> 630 minutes
        .mockImplementationOnce(() => 540) // 9:00 am -> 540 minutes

      const result = component.isTimeLessThanNow('9:00 am')

      expect(result).toBe(true)
      expect(timeToMinutesSpy).toHaveBeenCalledWith('10:30 am')
      expect(timeToMinutesSpy).toHaveBeenCalledWith('9:00 am')
    })

    it('should return false if given time is greater than current time', () => {
      jest.spyOn(DatePipe.prototype, 'transform').mockReturnValue('10:30 am')
      const timeToMinutesSpy = jest.spyOn(component, 'timeToMinutes')
        .mockImplementationOnce(() => 630) // 10:30 am -> 630 minutes
        .mockImplementationOnce(() => 690) // 11:30 am -> 690 minutes

      const result = component.isTimeLessThanNow('11:30 am')

      expect(result).toBe(false)
      expect(timeToMinutesSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('timeToMinutes', () => {
    it('should convert AM time to minutes correctly', () => {
      const result = component.timeToMinutes('9:30 AM')
      expect(result).toBe(9 * 60 + 30)
    })

    it('should convert PM time to minutes correctly', () => {
      const result = component.timeToMinutes('2:45 PM')
      expect(result).toBe((2 + 12) * 60 + 45)
    })

    it('should handle 12 PM correctly', () => {
      const result = component.timeToMinutes('12:00 PM')
      expect(result).toBe(12 * 60)
    })

    it('should handle 12 AM correctly', () => {
      const result = component.timeToMinutes('12:00 AM')
      expect(result).toBe(0)
    })
  })

  describe('generatMinTimeToEnd', () => {
    it('should generate min end time with default time gap', () => {
      component.timeGap = 15
      component.uploadedVideoDuration = 0

      component.generatMinTimeToEnd('10:30 AM')

      expect(component.minTimeToEnd).toBe('10:45 AM')
    })

    it('should use uploaded video duration if greater than time gap', () => {
      component.timeGap = 15
      component.uploadedVideoDuration = 30

      component.generatMinTimeToEnd('10:30 AM')

      expect(component.minTimeToEnd).toBe('11:00 AM')
    })

    it('should handle hour rollover correctly', () => {
      component.timeGap = 15
      component.uploadedVideoDuration = 0

      component.generatMinTimeToEnd('10:50 AM')

      expect(component.minTimeToEnd).toBe('11:05 AM')
    })

    it('should handle noon transition correctly', () => {
      component.timeGap = 15
      component.uploadedVideoDuration = 0

      component.generatMinTimeToEnd('11:50 AM')

      expect(component.minTimeToEnd).toBe('12:05 AM')
    })

    it('should reset end time when resetEndTime is true', () => {
      jest.useFakeTimers()
      component.generatMinTimeToEnd('10:30 AM', true)

      jest.advanceTimersByTime(20)

      expect(component.eventDetails.controls.endTime.value).toBe('10:45 AM')
      jest.useRealTimers()
    })
  })

  describe('appIconName and uploadedVideoName getters', () => {
    it('should extract filename from appIcon URL', () => {
      component.eventDetails.controls.appIcon.setValue('https://example.com/assets/icon_filename.png')

      expect(component.appIconName).toBe('filename.png')
    })

    it('should extract filename from recorded event URL', () => {
      component.eventDetails.controls.recoredEventUrl.setValue('https://example.com/videos/video_myfile.mp4')

      expect(component.uploadedVideoName).toBe('myfile.mp4')
    })

    it('should return empty string if no URL is set', () => {
      component.eventDetails.controls.appIcon.setValue('')

      expect(component.appIconName).toBe('')
    })
  })

  describe('removeFile', () => {
    it('should remove app icon file', () => {
      component.eventDetails.controls.appIcon.setValue('https://example.com/icon.png')

      component.removeFile('appIcon')

      expect(component.eventDetails.controls.appIcon.value).toBe('')
    })

    it('should remove uploaded video file and reset related fields', () => {
      component.openTab = 'draft'
      component.eventDetails.controls.recoredEventUrl.setValue('https://example.com/video.mp4')
      component.eventDetails.controls.startTime.setValue('10:30 AM')
      component.eventDetails.controls.endTime.setValue('11:00 AM')
      component.uploadedVideoDuration = 30
      component.disableUrl = true

      component.removeFile('uploadedVideo')

      expect(component.eventDetails.controls.recoredEventUrl.value).toBe('')
      expect(component.eventDetails.controls.startTime.value).toBe('')
      expect(component.eventDetails.controls.endTime.value).toBe('')
      expect(component.uploadedVideoDuration).toBe(0)
      expect(component.disableUrl).toBe(false)
    })
  })

  describe('onFileSelected', () => {
    it('should handle empty file selection', () => {
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      component.onFileSelected([])

      expect(saveImageSpy).not.toHaveBeenCalled()
    })

    it('should reject non-image files', () => {
      const files = [{ type: 'application/pdf' }]
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      component.onFileSelected(files)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Only images are supported')
      expect(saveImageSpy).not.toHaveBeenCalled()
    })

    it('should reject oversized image files', () => {
      const files = [{
        type: 'image/jpeg',
        size: 600 * 1024 // 600KB, more than the 500KB limit
      }]
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      component.onFileSelected(files)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Selected image size is more than 500KB.')
      expect(saveImageSpy).not.toHaveBeenCalled()
    })

    it('should process valid image files', () => {
      // Mock FileReader and its methods
      const originalFileReader = global.FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null
      }
      global.FileReader = jest.fn(() => mockFileReader) as any

      const files = [{
        type: 'image/jpeg',
        size: 300 * 1024 // 300KB, under the limit
      }]
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      component.onFileSelected(files)

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(files[0])
      expect(saveImageSpy).toHaveBeenCalledWith(files[0])

      // Restore original FileReader
      global.FileReader = originalFileReader
    })
  })

  describe('saveImage', () => {
    it('should upload image and update appIcon', () => {
      const imagePath = { type: 'image/jpeg' }
      const contentResponse = { result: { identifier: 'test-content-id' } }
      const uploadResponse = { result: { artifactUrl: 'https://storage.googleapis.com/igot/test/image.jpg' } }

      mockEventsService.createContent.mockReturnValue(of(contentResponse))
      mockEventsService.uploadContent.mockReturnValue(of(uploadResponse))

      component.saveImage(imagePath)

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockEventsService.createContent).toHaveBeenCalled()
      expect(mockEventsService.uploadContent).toHaveBeenCalledWith('test-content-id', expect.any(FormData))
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(component.eventDetails.controls.appIcon.value).toContain('assets/public/test/image.jpg')
    })

    it('should upload video and update recordedEventUrl', () => {
      const videoPath = { type: 'video/mp4' }
      const contentResponse = { result: { identifier: 'test-content-id' } }
      const uploadResponse = { result: { artifactUrl: 'https://storage.googleapis.com/igot/test/video.mp4' } }

      mockEventsService.createContent.mockReturnValue(of(contentResponse))
      mockEventsService.uploadContent.mockReturnValue(of(uploadResponse))

      component.saveImage(videoPath, 'video')

      expect(component.eventDetails.controls.recoredEventUrl.value).toContain('assets/public/test/video.mp4')
      expect(component.disableUrl).toBe(true)
      expect(component.eventDetails.controls.registrationLink.disabled).toBe(true)
    })

    it('should handle API error', () => {
      const imagePath = { type: 'image/jpeg' }
      const error = { error: { message: 'Upload failed' } }

      mockEventsService.createContent.mockReturnValue(throwError(() => error))

      component.saveImage(imagePath)

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong please try again')
    })
  })

  describe('onVideoSelected', () => {
    it('should reject empty file selection', () => {
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      component.onVideoSelected([])

      expect(saveImageSpy).not.toHaveBeenCalled()
    })

    it('should reject non-video files', () => {
      const files = [{ type: 'image/jpeg' }]
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      component.onVideoSelected(files)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Only video files are supported')
      expect(saveImageSpy).not.toHaveBeenCalled()
    })

    it('should reject oversized video files', () => {
      const files = [{
        type: 'video/mp4',
        size: 1200 * 1024 * 1024 // 1200MB, more than the limit
      }]
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      component.onVideoSelected(files)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Selected video size exceeds the 400MB limit')
      expect(saveImageSpy).not.toHaveBeenCalled()
    })

    it('should process valid video files', () => {
      component.openTab = 'draft'
      const getVideoDurationSpy = jest.spyOn(component as any, 'getVideoDuration').mockImplementation()
      const saveImageSpy = jest.spyOn(component, 'saveImage')

      const files = [{
        type: 'video/mp4',
        size: 300 * 1024 * 1024 // 300MB, under the limit
      }]

      component.onVideoSelected(files)

      expect(getVideoDurationSpy).toHaveBeenCalledWith(files[0])
      expect(saveImageSpy).toHaveBeenCalledWith(files[0], 'video')
    })
  })

  describe('getMaxTimeToStart', () => {
    it('should calculate max time to start based on uploaded video duration', () => {
      component.uploadedVideoDuration = 30 // 30 minutes
      component.timeGap = 15

      component.getMaxTimeToStart()

      expect(component.maxTimeToStart).toBe('11:29 PM')
    })

    it('should use time gap if video duration is less than time gap', () => {
      component.uploadedVideoDuration = 10 // 10 minutes
      component.timeGap = 15

      component.getMaxTimeToStart()

      expect(component.maxTimeToStart).toBe('11:44 PM')
    })
  })

  describe('showValidationMsg', () => {
    it('should return true when control is touched, invalid and has specific error', () => {
      const control = component.eventDetails.controls.registrationLink
      control.setValidators([Validators.required, Validators.pattern(URL_PATRON)])
      control.setValue('invalid-url')
      control.markAsTouched()
      control.updateValueAndValidity()

      const result = component.showValidationMsg('registrationLink', 'pattern')

      expect(result).toBe(true)
    })

    it('should return false when control is valid', () => {
      const control = component.eventDetails.controls.registrationLink
      control.setValidators([Validators.required, Validators.pattern(URL_PATRON)])
      control.setValue('http://valid-url.com')
      control.markAsTouched()
      control.updateValueAndValidity()

      const result = component.showValidationMsg('registrationLink', 'pattern')

      expect(result).toBe(false)
    })

    it('should return false when control is not touched', () => {
      const control = component.eventDetails.controls.registrationLink
      control.setValidators([Validators.required, Validators.pattern(URL_PATRON)])
      control.setValue('')
      control.updateValueAndValidity()

      const result = component.showValidationMsg('registrationLink', 'required')

      expect(result).toBe(false)
    })
  })

  describe('allowNumbers', () => {
    it('should allow digit keys (0-9)', () => {
      const event = { key: '5', preventDefault: jest.fn() } as any
      component.allowNumbers(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should allow Backspace key', () => {
      const event = { key: 'Backspace', preventDefault: jest.fn() } as any
      component.allowNumbers(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should prevent non-digit keys like letters', () => {
      const event = { key: 'a', preventDefault: jest.fn() } as any
      component.allowNumbers(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should prevent special chars like @', () => {
      const event = { key: '@', preventDefault: jest.fn() } as any
      component.allowNumbers(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('onPasteNumber', () => {
    it('should allow paste of numeric text', () => {
      const event = {
        clipboardData: { getData: jest.fn().mockReturnValue('12345') },
        preventDefault: jest.fn(),
      } as any
      component.onPasteNumber(event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should prevent paste of non-numeric text', () => {
      const event = {
        clipboardData: { getData: jest.fn().mockReturnValue('abc') },
        preventDefault: jest.fn(),
      } as any
      component.onPasteNumber(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should prevent paste when clipboardData is null', () => {
      const event = {
        clipboardData: null,
        preventDefault: jest.fn(),
      } as any
      component.onPasteNumber(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('checkIfSCEvent', () => {
    it('should return true when typeofEvent is live', () => {
      component.eventDetails = new FormGroup({
        ...component.eventDetails.controls,
        typeofEvent: new FormControl('live'),
      })
      expect(component.checkIfSCEvent()).toBe(true)
    })

    it('should return false when typeofEvent is not live', () => {
      component.eventDetails = new FormGroup({
        ...component.eventDetails.controls,
        typeofEvent: new FormControl('record'),
      })
      expect(component.checkIfSCEvent()).toBe(false)
    })
  })

  describe('checkIfLiveEvent getter', () => {
    it('should return true when openTab is draft and eventStatus is live', () => {
      component.openTab = 'draft'
      component.eventStatus = 'live'
      expect(component.checkIfLiveEvent).toBe(true)
    })

    it('should return true when openTab is rejected and eventStatus is live', () => {
      component.openTab = 'rejected'
      component.eventStatus = 'live'
      expect(component.checkIfLiveEvent).toBe(true)
    })

    it('should return true when openTab is upcoming and eventStatus is live', () => {
      component.openTab = 'upcoming'
      component.eventStatus = 'live'
      expect(component.checkIfLiveEvent).toBe(true)
    })

    it('should return false when eventStatus is not live', () => {
      component.openTab = 'draft'
      component.eventStatus = 'draft'
      expect(component.checkIfLiveEvent).toBe(false)
    })
  })

  describe('disableSchedule getter', () => {
    it('should return true when openTab is past', () => {
      component.openTab = 'past'
      expect(component.disableSchedule).toBe(true)
    })

    it('should return true when openTab is upcoming', () => {
      component.openTab = 'upcoming'
      expect(component.disableSchedule).toBe(true)
    })

    it('should return true when eventStatus is live and openTab is draft', () => {
      component.eventStatus = 'live'
      component.openTab = 'draft'
      expect(component.disableSchedule).toBe(true)
    })

    it('should return false when in edit mode with draft status', () => {
      component.openTab = 'draft'
      component.eventStatus = 'draft'
      expect(component.disableSchedule).toBe(false)
    })
  })

  describe('preventDefaultCDK', () => {
    it('should call preventDefault and stopPropagation', () => {
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target: {} } as any
      component.preventDefaultCDK(event)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('should set opacity 0.5 on enter', () => {
      const target = { style: { opacity: '' } }
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target } as any
      component.preventDefaultCDK(event, 'enter')
      expect(target.style.opacity).toBe('0.5')
    })

    it('should set opacity 1 on leave', () => {
      const target = { style: { opacity: '' } }
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target } as any
      component.preventDefaultCDK(event, 'leave')
      expect(target.style.opacity).toBe('1')
    })
  })

  describe('onDrop', () => {
    it('should call onVideoSelected when files are dropped', () => {
      const spy = jest.spyOn(component, 'onVideoSelected').mockImplementation()
      const mockFiles = [{ type: 'video/mp4', size: 100 }]
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: { style: {} },
        dataTransfer: { files: mockFiles },
      } as any
      component.onDrop(event)
      expect(spy).toHaveBeenCalledWith(mockFiles)
    })

    it('should not throw when dataTransfer is null', () => {
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: { style: {} },
        dataTransfer: null,
      } as any
      expect(() => component.onDrop(event)).not.toThrow()
    })
  })

  describe('ngOnInit with live typeofEvent', () => {
    it('should set live event categories when typeofEvent is live', () => {
      component.openMode = 'edit'
      component.openTab = 'draft'
      component.eventDetails = new FormGroup({
        startDate: new FormControl(null),
        startTime: new FormControl(null),
        endTime: new FormControl(null),
        appIcon: new FormControl(''),
        recoredEventUrl: new FormControl(''),
        registrationLink: new FormControl(''),
        typeofEvent: new FormControl('live'),
        maxEnrolments: new FormControl(null),
      })
      component.ngOnInit()
      expect(component.eventCategoriesList).toEqual(['Samuhik Charcha'])
      expect(component.timeGap).toBe(30)
    })

    it('should set live event categories in view mode when typeofEvent is live', () => {
      component.openMode = 'view'
      component.eventDetails = new FormGroup({
        startDate: new FormControl(null),
        startTime: new FormControl(null),
        endTime: new FormControl(null),
        appIcon: new FormControl(''),
        recoredEventUrl: new FormControl(''),
        registrationLink: new FormControl(''),
        typeofEvent: new FormControl('live'),
      })
      component.ngOnInit()
      expect(component.eventCategoriesList).toEqual(['Samuhik Charcha'])
    })
  })

  describe('registrationLink valueChanges subscription', () => {
    it('should disable upload and clear recoredEventUrl when registrationLink gets value', () => {
      component.openMode = 'edit'
      component.openTab = 'draft'
      component.ngOnInit()

      component.eventDetails.controls.registrationLink.setValue('https://example.com')
      expect(component.disableUpload).toBe(true)
    })

    it('should re-enable upload when registrationLink is cleared', () => {
      component.openMode = 'edit'
      component.openTab = 'draft'
      component.disableUpload = true
      component.ngOnInit()

      component.eventDetails.controls.registrationLink.setValue('')
      expect(component.disableUpload).toBe(false)
    })
  })
})