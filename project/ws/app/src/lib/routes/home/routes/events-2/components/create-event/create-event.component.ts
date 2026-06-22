import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { EventsService } from '../../services/events.service'
import { ActivatedRoute, Router } from '@angular/router'
import * as _ from 'lodash'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { URL_PATRON, material, noSpecialCharEvent, speaker } from '../../models/events.model'
import { StepperSelectionEvent } from '@angular/cdk/stepper'
import { MatStepper } from '@angular/material/stepper'
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpErrorResponse } from '@angular/common/http'
import { DatePipe } from '@angular/common'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmDialogComponent } from '../../../../../workallocation-v2/components/confirm-dialog/confirm-dialog.component'
import { CourseListingComponent } from '../course-listing/course-listing.component'

@Component({
  selector: 'ws-app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
  standalone: false
})
export class CreateEventComponent implements OnInit, AfterViewInit {
  //#region (global varialbles)
  private readonly locationService = inject(Location);
  @ViewChild(MatStepper) stepper: MatStepper | undefined
  @ViewChild(CourseListingComponent) courseListingComponent: CourseListingComponent | undefined
  eventId = ''
  eventIconUrl = ''
  eventDetails: any
  updatedEventDetails: any
  eventDetailsForm!: FormGroup
  courseSelectionForm!: FormGroup
  preEventForm!: FormGroup
  postEventForm!: FormGroup
  speakersList: speaker[] = []
  materialsList: material[] = []
  competencies: any = []
  currentStepperIndex = 0
  openMode = 'edit'
  pathUrl = ''
  userProfile: any
  showPreview = false
  selectedStepperLable = 'Basic Details'
  eventStatus = 'draft'
  contentLoaded = false
  //#endregion

  constructor(
    private eventSvc: EventsService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private matSnackBar: MatSnackBar,
    private datePipe: DatePipe,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  //#region (onInit)
  ngOnInit(): void {
    this.initializeFormAndParams()
    this.getEventDetailsFromResolver()
  }

  initializeFormAndParams() {
    this.eventDetailsForm = this.formBuilder.group({
      eventName: new FormControl('', [Validators.required, Validators.minLength(10),
      Validators.maxLength(90), Validators.pattern(noSpecialCharEvent)]),
      description: new FormControl('', [Validators.required, Validators.minLength(250), Validators.maxLength(2000)]),
      eventCategory: new FormControl('', [Validators.required]),
      streamType: new FormControl(''),
      startDate: new FormControl('', [Validators.required]),
      startTime: new FormControl('', [Validators.required]),
      endTime: new FormControl('', [Validators.required]),
      registrationLink: new FormControl('', [Validators.required, Validators.pattern(URL_PATRON)]),
      recoredEventUrl: new FormControl(''),
      appIcon: new FormControl('', [Validators.required]),
      typeofEvent: new FormControl('', [Validators.required]),
      maxEnrolments: new FormControl('', [Validators.min(10), Validators.max(10000)]),
    })

    this.courseSelectionForm = this.formBuilder.group({
      selectedCourse: new FormControl(null, [])
    })
  }

  get edf() { return this.eventDetailsForm.controls }

  getEventDetailsFromResolver() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.openMode = params['mode']
      this.pathUrl = params['pathUrl']
      if (this.openMode === 'view') {
        this.eventDetailsForm.disable()
      }
    })
    this.userProfile = _.get(this.activatedRoute, 'snapshot.data.configService.userProfile')
    if (_.get(this.activatedRoute, 'snapshot.data.eventDetails')) {
      this.eventDetails = _.get(this.activatedRoute, 'snapshot.data.eventDetails.data')
      this.patchEventDetails()
    }
  }

  async patchEventDetails() {
    this.eventId = _.get(this.eventDetails, 'identifier')
    this.eventStatus = _.get(this.eventDetails, 'status', 'draft').toLowerCase()
    if (this.eventStatus.toLocaleLowerCase() === 'senttopublish' && this.pathUrl === 'upcoming' && this.openMode === 'edit') {
      this.openConforamtionPopup()
    }
    const startDate = _.get(this.eventDetails, 'startDate', '')
    let registrationLink: any
    let isYoutubeVideo: any
    const resourceType = _.get(this.eventDetails, 'resourceType', '')
    if (resourceType === 'Webinar' && this.pathUrl === 'past' && _.get(this.eventDetails, 'recordedLinks', '')[0]) {
      registrationLink = _.get(this.eventDetails, 'recordedLinks', '')[0]
      isYoutubeVideo = _.get(this.eventDetails, 'registrationLink', '').toLowerCase().includes('youtube')
    } else {
      registrationLink = _.get(this.eventDetails, 'registrationLink', '')
      isYoutubeVideo = registrationLink.toLowerCase().includes('youtube')
    }

    if (registrationLink && isYoutubeVideo === false) {
      this.eventDetailsForm.controls.registrationLink.clearValidators()
      this.eventDetailsForm.controls.recoredEventUrl.setValidators([Validators.required])
      this.eventDetailsForm.controls.recoredEventUrl.updateValueAndValidity()
      this.eventDetailsForm.controls.registrationLink.updateValueAndValidity()
    }

    const eventBaseDetails = {
      eventName: _.get(this.eventDetails, 'name', ''),
      description: _.get(this.eventDetails, 'description', ''),
      eventCategory: _.get(this.eventDetails, 'resourceType', ''),
      streamType: _.get(this.eventDetails, 'streamType', ''), // new key to add
      startDate: startDate ? new Date(startDate) : startDate,
      startTime: _.get(this.eventDetails, 'startTime', ''),
      endTime: _.get(this.eventDetails, 'endTime', ''),
      registrationLink: '',
      recoredEventUrl: '',
      appIcon: _.get(this.eventDetails, 'appIcon', ''),
      typeofEvent: _.get(this.eventDetails, 'typeofEvent', ''),
      maxEnrolments: _.get(this.eventDetails, 'maxEnrolments', ''),
    }

    if (registrationLink) {
      if (isYoutubeVideo) {
        eventBaseDetails.registrationLink = registrationLink
      } else {
        eventBaseDetails.recoredEventUrl = registrationLink
      }
    }

    this.eventDetailsForm.patchValue(eventBaseDetails)

    if (this.eventDetails?.typeofEvent?.toLowerCase() === 'live') {
      this.courseSelectionForm.controls.selectedCourse.setValidators([Validators.required])
      if (this.eventDetails?.courseLinked) {
        const contentData: any = await this.eventSvc.getContentRead(this.eventDetails?.courseLinked).toPromise().catch(_err => { })
        if (contentData?.result) {
          this.eventSvc.setCourseDetails(contentData?.result?.content || {})
          this.courseSelectionForm.controls.selectedCourse.setValue(contentData?.result?.content || {})
          this.competencies = this.getLatestCompetencies(contentData?.result?.content)
          this.contentLoaded = true
          setTimeout(() => {
            // Check if event is live and endDateTime has passed
            if (this.eventDetails?.status?.toLowerCase() === 'live' && this.eventDetails?.endDateTime && this.openMode === 'edit') {
              const endDateTime = new Date(this.eventDetails.endDateTime)
              const currentDateTime = new Date()
              if (endDateTime < currentDateTime && this.stepper) {
                const stepersList = this.stepper.steps.toArray()
                const eventSetupIndex = stepersList.findIndex((step) => step.label === 'Event Setup')
                if (eventSetupIndex !== -1) {
                  this.currentStepperIndex = eventSetupIndex
                  this.selectedStepperLable = 'Event Setup'
                }
              }
            }
          }, 300)
        }
      } else {
        this.courseSelectionForm.controls.selectedCourse.setValue({})
        this.contentLoaded = true
      }
      this.courseSelectionForm.controls.selectedCourse.updateValueAndValidity()
    }

    if (this.pathUrl === 'past' && this.openMode === 'edit') {
      this.eventDetailsForm.disable()
      if (isYoutubeVideo) {
        this.eventDetailsForm.controls.registrationLink.enable()
      } else {
        this.eventDetailsForm.controls.recoredEventUrl.enable()
      }
    } else if (this.eventStatus === 'live' || _.get(this.eventDetails, 'prevStatus', '') !== '') {
      this.eventDetailsForm.controls.eventName.disable()
      this.eventDetailsForm.controls.description.disable()
      this.eventDetailsForm.controls.typeofEvent.disable()
      this.eventDetailsForm.controls.streamType.disable()
      if (_.get(this.edf, 'typeofEvent.value', '').toString().toLowerCase() === 'live') {
        this.eventDetailsForm.controls.startDate.disable()
        this.eventDetailsForm.controls.startTime.disable()
        this.eventDetailsForm.controls.endTime.disable()
      }
      this.eventStatus = 'live' // this is to handle the case when user is trying to edit duplicate record of the event which is already live
    }

    this.eventDetailsForm.updateValueAndValidity()

    this.speakersList = _.get(this.eventDetails, 'speakers', [])
    this.materialsList = _.get(this.eventDetails, 'eventHandouts', [])
    if (this.competencies.length === 0) {
      this.competencies = _.get(this.eventDetails, 'competencies_v6', [])
    }

  }

  ngAfterViewInit() {
    if (this.stepper) {
      //this.stepper.indicatorType = 'number'
      this.cdr.detectChanges()
    }
  }

  getLatestCompetencies(obj: any): any[] {
    const competencyKeys = Object.keys(obj || {}).filter(key => key.startsWith('competencies_v'))
    if (competencyKeys.length === 0) {
      return []
    }
    // Extract version numbers and sort descending
    const sortedKeys = competencyKeys.sort((a, b) => {
      const versionA = parseInt(a.replace('competencies_v', ''), 10)
      const versionB = parseInt(b.replace('competencies_v', ''), 10)
      return versionB - versionA
    })
    return _.get(obj, sortedKeys[0], [])
  }
  //#endregion

  //#region (ui interactions)
  onSelectionChange(event: StepperSelectionEvent) {
    const selectedStep = this.stepper?.steps.toArray()[event.selectedIndex]
    const previousStep = this.stepper?.steps.toArray()[event.previouslySelectedIndex]
    const selectedLabel = selectedStep?.label
    const previousLabel = previousStep?.label
    if (previousLabel === 'Basic Details') {
      this.eventDetailsForm.markAllAsTouched()
      this.eventDetailsForm.updateValueAndValidity()
    }
    this.currentStepperIndex = event.selectedIndex
    if (this.stepper) {
      this.selectedStepperLable = selectedLabel || ''
      this.cdr.detectChanges()
    }
    if (this.selectedStepperLable === 'Preview') {
      this.updatedEventDetails = this.getFormBodyOfEvent(this.eventDetails['status'])
    }
  }

  onCourseSelected(course: any) {
    // Update the form control immediately when a course is selected
    this.courseSelectionForm.patchValue({
      selectedCourse: course
    })
    this.eventSvc.setCourseDetails(course)
    // Mark the form as touched and update validity
    this.courseSelectionForm.markAllAsTouched()
    this.courseSelectionForm.updateValueAndValidity()

    this.competencies = this.getLatestCompetencies(course)

    // Reset speaker type and speaker names when course changes
    if (this.preEventForm && this.preEventForm.get('speakerType')?.value === 'courseCreator') {
      this.preEventForm.patchValue({
        speakerType: '',
        selectedSpeaker: []
      })
    }

    this.cdr.detectChanges()
  }

  onPreEventFormReady(form: FormGroup) {
    this.preEventForm = form
    console.log('Pre-event form received in parent:', this.preEventForm)
  }

  onPostEventFormReady(form: FormGroup) {
    this.postEventForm = form
    console.log('Post-event form received in parent:', this.postEventForm)
  }


  openConforamtionPopup() {
    if (this.openMode === 'edit') {
      let dialgData = {}
      if (this.eventStatus.toLocaleLowerCase() === 'senttopublish') {
        dialgData = {
          dialogType: 'warning',
          icon: {
            iconName: 'error_outline',
            iconClass: 'warning-icon'
          },
          message: 'This event has already been sent to publisher. You can edit it once the Publisher approves the request.',
          buttonsList: [
            {
              btnAction: true,
              displayText: 'Go back',
              btnClass: 'successBtn'
            },
          ]
        }
      } else {
        dialgData = {
          dialogType: 'warning',
          icon: {
            iconName: 'error_outline',
            iconClass: 'warning-icon'
          },
          message: 'Are you sure you want to exit without saving?',
          buttonsList: [
            {
              btnAction: false,
              displayText: 'No',
              btnClass: 'btn-outline-primary'
            },
            {
              btnAction: true,
              displayText: 'Yes',
              btnClass: 'successBtn'
            },
          ]
        }
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        height: 'auto',
        data: dialgData,
        autoFocus: false,
        disableClose: true
      })

      dialogRef.afterClosed().subscribe((btnAction: any) => {
        if (btnAction) {
          this.navigateBack()
        }
      })
    } else {
      this.navigateBack()
    }
  }

  navigateBack() {
    if (this.pathUrl) {
      this.router.navigate([`/app/home/events/${this.pathUrl}`])
    } else {
      this.locationService.back()
    }
  }

  moveToNextForm() {
    // const currentStep = this.stepper?.steps.toArray()[this.currentStepperIndex]
    // const currentStepLabel = currentStep?.label || ''
    this.eventDetailsForm.markAllAsTouched()
    this.eventDetailsForm.updateValueAndValidity()
    // if (currentStepLabel === 'Basic Details' && this.eventDetailsForm.invalid) {
    //   this.matSnackBar.open('Please fill mandatory fields')
    //   return
    // }
    if (this.stepper && this.currentStepperIndex < this.stepper.steps.length - 1) {
      this.currentStepperIndex = this.currentStepperIndex + 1
    }
  }

  moveToPreviousForm() {
    this.eventDetailsForm.markAllAsTouched()
    this.eventDetailsForm.updateValueAndValidity()
    this.currentStepperIndex = this.currentStepperIndex - 1
  }

  preview() {
    if (this.eventDetails && this.eventDetails['status']) {
      this.showPreview = true
      this.updatedEventDetails = this.getFormBodyOfEvent(this.eventDetails['status'])
      setTimeout(() => {
        let foundIndex = -1
        if (this.stepper) {
          const stepersList = this.stepper.steps.toArray()
          if (stepersList) {
            foundIndex = stepersList.findIndex((steper) => steper.label === 'Preview')
          }

          if (foundIndex !== -1) {
            // this.stepper.selectedIndex = foundIndex
            this.currentStepperIndex = foundIndex
          }
        }
      }, 100)
    }
  }

  publish() {
    if (this.eventDetails?.typeofEvent?.toLowerCase() === 'live' && !(this.competencies && this.competencies.length)) {
      if (this.courseSelectionForm?.valid) {
        this.competencies = this.getLatestCompetencies(this.courseSelectionForm?.value?.selectedCourse)
      }
    }
    if (this.canPublish) {
      this.saveAndExit('SentToPublish')
    }
  }

  get canMoveToNext() {
    let currentFormIsValid = false
    if (this.selectedStepperLable === 'Basic Details') {
      if (!this.eventDetailsForm.invalid) {
        currentFormIsValid = true
      } else {
        this.openSnackBar('Please fill mandatory fields')
      }
    } else if (this.selectedStepperLable === 'Add Speaker') {
      if (this.speakersList && this.speakersList.length) {
        currentFormIsValid = true
      } else {
        this.openSnackBar('Please add atleast one speaker')
      }
    } else if (this.selectedStepperLable === 'Add Material') {
      if (this.isMaterialsValid) {
        currentFormIsValid = true
      } else {
        this.openSnackBar('Please provied valid name and matrial')
      }
    }
    return currentFormIsValid
  }

  get isMaterialsValid(): boolean {
    if (this.materialsList && this.materialsList.length > 0 &&
      this.materialsList.findIndex((material) => !material.title || material.title === '') > -1 ||
      this.materialsList.findIndex((material) => !material.content || material.content === '') > -1) {
      return false
    }
    return true
  }

  get canPublish(): boolean {
    if (this.selectedStepperLable === 'Add Competency' || this.selectedStepperLable === 'Preview' || this.selectedStepperLable === 'Event Setup') {
      if (this.eventDetailsForm.invalid) {
        this.openSnackBar('Please fill mandatory fields in Basic Details')
        return false
      }
      // if (!(this.speakersList && this.speakersList.length)) {
      //   this.openSnackBar('Please add atleast one speaker in add speakers')
      //   return false
      // }
      if (!this.isMaterialsValid) {
        this.openSnackBar('Please provied valid name and matrial in Add Material')
        return false
      }
      if (!(this.competencies && this.competencies.length)) {
        this.openSnackBar(this.eventDetails.typeofEvent === 'live' ? 'Select course from course linking' : 'Please add atleast one competency in Add Competency')
        return false
      }

      if (!this.isValidTimeToStart) {
        this.openSnackBar('Please select a future date and time to start the event.')
        return false
      }

      if (this.eventDetails?.status?.toLowerCase() === 'draft' && this.eventDetails?.typeofEvent?.toLowerCase() === 'live') {
        if (this.preEventForm?.invalid) {
          this.preEventForm.markAllAsTouched()
          this.preEventForm.updateValueAndValidity()
          this.openSnackBar('Please fill mandatory fields in Event Setup > Pre Event Setup')
          return false
        }
        if (this.courseSelectionForm?.invalid) {
          this.openSnackBar('Please select one course in course Linking')
          return false
        }
      }

      if (this.eventDetails?.status?.toLowerCase() === 'live' && this.eventDetails?.typeofEvent?.toLowerCase() === 'live') {
        if (this.preEventForm?.invalid) {
          this.preEventForm.markAllAsTouched()
          this.preEventForm.updateValueAndValidity()
          this.openSnackBar('Please fill mandatory fields in Event Setup > Pre Event Setup')
          return false
        }
      }

      if (this.eventDetails?.status?.toLowerCase() === 'live' && this.eventDetails?.typeofEvent?.toLowerCase() === 'live') {
        if (this.postEventForm?.invalid) {
          this.openSnackBar('Please fill mandatory fields in Event Setup > Post Event Setup')
          return false
        }
      }
      return true
    }
    return false
  }

  get isValidTimeToStart(): boolean {
    const selectedDate = _.get(this.eventDetailsForm, 'value.startDate')
    const todayFormatted = this.datePipe.transform(new Date(), 'yyyy-MM-dd') as string
    const inputDateFormatted = this.datePipe.transform(selectedDate, 'yyyy-MM-dd') as string
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const inputDate = new Date(selectedDate)
    inputDate.setHours(0, 0, 0, 0)
    if (todayFormatted === inputDateFormatted) {
      if (this.isTimeLessThanNow(_.get(this.eventDetailsForm, 'value.startTime'))) {
        return false
      }
    } else if (inputDate < today) {
      return false
    }
    return true
  }

  isTimeLessThanNow(givenTime: string): boolean {
    const datePipe = new DatePipe('en-US')
    const currentTime = datePipe.transform(new Date(), 'h:mm a') as string
    const currentMinutes = this.timeToMinutes(currentTime)
    const givenMinutes = this.timeToMinutes(givenTime)

    return givenMinutes <= currentMinutes
  }

  timeToMinutes(time: string): number {
    const [timePart, period] = time.split(' ')
    const [hours, minutes] = timePart.split(':').map(Number)

    let totalMinutes = hours % 12 * 60 + minutes
    if (period === 'PM') {
      totalMinutes += 12 * 60
    }
    return totalMinutes
  }

  addCompetencies(competencies: any) {
    this.competencies = competencies
  }

  saveAndExit(status = 'Draft') {
    const formBody = {
      request: {
        event: this.getFormBodyOfEvent(status)
      }
    }
    this.loaderService.changeLoaderState(true)
    this.eventSvc.updateEvent(formBody, this.eventId).subscribe({
      next: res => {
        if (res) {
          const successMessage = status === 'Draft' ? 'Event details saved successfully' :
            status === 'updatePostEvent' ? 'Post event details updated successfully' :
              'Event details sent for approval successfully'
          this.openSnackBar(successMessage)
          setTimeout(() => {
            this.navigateBack()
            this.loaderService.changeLoaderState(false)
          }, 1000)
        } else {
          this.loaderService.changeLoaderState(false)
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message', 'Something went wrong while updating event, please try again')
        this.openSnackBar(errorMessage)
      }
    })
  }

  saveAndPublish() {
    const formBody = {
      request: {
        event: this.getFormBodyOfEvent('Live')
      }
    }
    formBody.request.event.status = 'SentToPublish'
    this.loaderService.changeLoaderState(true)
    this.eventSvc.updateEvent(formBody, this.eventId).subscribe({
      next: res => {
        if (res) {
          const versionKey = _.get(res, 'result.versionKey')
          const identifier = _.get(res, 'result.identifier')
          const req: any = {
            request: {
              event: {
                versionKey: versionKey,
                status: 'Live',
                identifier: identifier,
                publishedOn: _.get(this.eventDetails, 'publishedOn'),
              },
            },
          }
          this.eventSvc.publishEvent(identifier, req).subscribe({
            next: res => {
              if (res) {
                const successMessage = 'Event details saved successfully'
                this.openSnackBar(successMessage)
                setTimeout(() => {
                  this.navigateBack()
                  this.loaderService.changeLoaderState(false)
                }, 2000)
              } else {
                this.loaderService.changeLoaderState(false)
              }
            },
            error: (error: HttpErrorResponse) => {
              this.loaderService.changeLoaderState(false)
              const errorMessage = _.get(error, 'error.message', 'Something went wrong while updating event, please try again')
              this.openSnackBar(errorMessage)
            }
          })
        } else {
          this.loaderService.changeLoaderState(false)
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loaderService.changeLoaderState(false)
        const errorMessage = _.get(error, 'error.message', 'Something went wrong while updating event, please try again')
        this.openSnackBar(errorMessage)
      }
    })
  }

  getFormBodyOfEvent(status: string) {
    const eventDetails: any = JSON.parse(JSON.stringify(this.eventDetails))
    const eventBaseDetails = this.eventDetailsForm.getRawValue()
    let startTime = ''
    let endTime = ''
    let startDateTime = ''
    let endDateTime = ''
    let startDate = eventBaseDetails.startDate ? this.datePipe.transform(eventBaseDetails.startDate, 'yyyy-MM-dd') : ''
    if (eventBaseDetails.startTime) {
      startTime = this.getFormatedTime(eventBaseDetails.startTime)
    }
    if (eventBaseDetails.endTime) {
      endTime = this.getFormatedTime(eventBaseDetails.endTime)
    }
    if (startDate) {
      if (startTime) {
        startDateTime = this.combineDateAndTime(startDate, startTime)
      }
      if (endTime) {
        endDateTime = this.combineDateAndTime(startDate, endTime)
      }
    }
    eventDetails['name'] = eventBaseDetails.eventName
    eventDetails['description'] = eventBaseDetails.description
    eventDetails['resourceType'] = eventBaseDetails.eventCategory
    eventDetails['streamType'] = eventBaseDetails.streamType
    eventDetails['startDate'] = startDate
    eventDetails['endDate'] = startDate
    eventDetails['startTime'] = startTime
    eventDetails['endTime'] = endTime
    const sourceLink = eventBaseDetails.registrationLink ?
      this.youTubeUrlChange(eventBaseDetails.registrationLink) : eventBaseDetails.recoredEventUrl
    if (eventBaseDetails.eventCategory === 'Webinar' && this.pathUrl === 'past') {
      eventDetails['recordedLinks'] = [sourceLink]
      eventDetails['registrationLink'] = ''
    } else {
      eventDetails['registrationLink'] = sourceLink
      delete eventDetails['recordedLinks']
    }
    eventDetails['appIcon'] = eventBaseDetails.appIcon
    eventDetails['typeofEvent'] = eventBaseDetails.typeofEvent

    if (status === 'SentToPublish') {
      const currentDate = new Date()
      let isoString = currentDate.toISOString()
      isoString = isoString.replace('Z', '+0000')
      eventDetails['submitedOn'] = isoString
    }

    if (this.speakersList) {
      eventDetails['speakers'] = this.speakersList
    }
    if (this.materialsList) {
      eventDetails['eventHandouts'] = this.materialsList.map(({ isNew, ...rest }) => rest)
    }
    if (this.competencies) {
      eventDetails['competencies_v6'] = this.competencies
    }
    if (startTime && endTime) {
      eventDetails['duration'] = this.getTimeDifferenceInMinutes(startTime, endTime)
    }
    if (startDateTime) {
      eventDetails['startDateTime'] = startDateTime
    }
    if (endDateTime) {
      eventDetails['endDateTime'] = endDateTime
    }

    eventDetails['status'] = (status === 'updatePostEvent') ? this.eventDetails['status'] : status

    if (eventBaseDetails?.typeofEvent?.toLowerCase() === 'live') {
      eventDetails['maxEnrolments'] = eventBaseDetails?.maxEnrolments || 0
      if (this.courseSelectionForm?.value?.selectedCourse) {
        eventDetails['courseLinked'] = this.courseSelectionForm?.value?.selectedCourse?.identifier || ''
      }
      eventDetails['registrationLink'] = this.preEventForm.controls['meetingLink'].value || ''
      eventDetails['meetingAgenda'] = this.preEventForm.controls['agenda'].value || ''
      eventDetails['preEventReads'] = [this.preEventForm.controls['preEventReads'].value || '']
      eventDetails['speakerDetails'] = JSON.stringify(this.preEventForm.controls['selectedSpeaker'].value) || []
      this.competencies = this.getLatestCompetencies(this.courseSelectionForm?.value?.selectedCourse)
      eventDetails['noOfAttendes'] = this.postEventForm?.controls['noOfAttendes'].value || 0
      eventDetails['eventDuration'] = this.convertDurationToMinutes(this.postEventForm?.controls['eventDuration'].value) || 0
      eventDetails['meetingSummary'] = this.postEventForm?.controls['meetingSummary'].value || ''
      eventDetails['postEventSummary'] = [this.postEventForm?.controls['postEventSummary'].value || '']
    }

    return eventDetails
  }

  youTubeUrlChange(url: string): string {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    const match = url.match(regExp)
    console.log(match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url)
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  getFormatedTime(selectedTime: string): string {
    const timeString = selectedTime.trim()
    const timeParts = timeString.split(' ')

    const time = timeParts[0]
    const amPm = timeParts[1]

    const [hours, minutes] = time.split(':').map(num => parseInt(num))

    let hours24 = hours
    if (amPm === 'PM' && hours !== 12) {
      hours24 += 12
    } else if (amPm === 'AM' && hours === 12) {
      hours24 = 0
    }

    const timeFormatted = this.formatTime(hours24, minutes)
    const fixedTimezone = '+05:30'


    return `${timeFormatted}${fixedTimezone}`
  }

  formatTime(hours: number, minutes: number): string {
    const hoursFormatted = hours.toString().padStart(2, '0')
    const minutesFormatted = minutes.toString().padStart(2, '0')
    const seconds = '00'
    return `${hoursFormatted}:${minutesFormatted}:${seconds}`
  }

  getTimeDifferenceInMinutes(time1: string, time2: string): number {
    const time1Date = new Date(`1970-01-01T${time1}`)
    const time2Date = new Date(`1970-01-01T${time2}`)

    const diffInMilliseconds = time2Date.getTime() - time1Date.getTime()

    return diffInMilliseconds / (1000 * 60)
  }

  combineDateAndTime(date: string, time: string): string {
    const combinedDateTime = `${date}T${time}`
    const dateObj = new Date(combinedDateTime)
    const isoString = dateObj.toISOString()
    return isoString.replace('Z', '+0000')
  }

  //#endregion

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  updatePostEvent() {
    if (this.postEventForm.invalid) {
      this.postEventForm.markAllAsTouched()
      this.postEventForm.updateValueAndValidity()
      this.openSnackBar('Please fill mandatory fields in Post Event Setup')
      return
    } else {
      this.saveAndPublish()
    }
  }

  convertDurationToMinutes(duration: string): number {
    if (!duration) {
      return 0
    }

    let totalMinutes = 0

    // Extract hours
    const hoursMatch = duration.match(/(\d+)h/)
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1], 10) * 60
    }

    // Extract minutes
    const minutesMatch = duration.match(/(\d+)m/)
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1], 10)
    }

    // Extract seconds and convert to minutes (rounded)
    const secondsMatch = duration.match(/(\d+)s/)
    if (secondsMatch) {
      totalMinutes += Math.round(parseInt(secondsMatch[1], 10) / 60)
    }

    return totalMinutes
  }

}
