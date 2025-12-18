import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { MatLegacyDialog } from '@angular/material/legacy-dialog'
import { MatLegacyAutocomplete } from '@angular/material/legacy-autocomplete'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { EventsService } from '../../services/events.service'
import { map, mergeMap, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { environment } from '../../../../../../../../../../../src/environments/environment'
import { HttpErrorResponse } from '@angular/common/http'
import * as _ from 'lodash'
import { ActivatedRoute } from '@angular/router'
import { ConfirmDialogComponent } from '../../../../../workallocation-v2/components/confirm-dialog/confirm-dialog.component'

@Component({
  selector: 'ws-app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit, OnChanges {

  private URL_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

  // Custom validator for event duration
  private durationValidator(control: FormControl): { [key: string]: any } | null {
    const value = control.value?.trim()
    if (!value) {
      return null
    }

    const pattern = /^((\d+)h\s*)?((\d+)m\s*)?((\d+)s)?$/
    if (!pattern.test(value)) {
      return { pattern: true }
    }

    const hoursMatch = value.match(/(\d+)h/)
    const minutesMatch = value.match(/(\d+)m/)
    const secondsMatch = value.match(/(\d+)s/)

    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
    const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0

    // Check if all values are zero
    if (hours === 0 && minutes === 0 && seconds === 0) {
      return { zeroDuration: true }
    }

    // Validate minutes (0-59)
    if (minutes > 59) {
      return { invalidMinutes: true }
    }

    // Validate seconds (0-59)
    if (seconds > 59) {
      return { invalidSeconds: true }
    }

    // Calculate total duration in minutes
    const totalMinutes = (hours * 60) + minutes + (seconds / 60)

    // Check minimum duration of 30 minutes
    if (totalMinutes < 30) {
      return { minDuration: true }
    }

    // Check maximum duration of 23 hours 59 minutes 59 seconds (1439.98 minutes)
    if (totalMinutes >= 1440) {
      return { maxDuration: true }
    }

    return null
  }

  @Input() eventDetailsData: any
  @Input() openMode = 'edit'
  @Input() openTab = 'draft'
  @Input() eventStatus = ''
  @Output() preEventFormReady = new EventEmitter<FormGroup>()
  @Output() postEventFormReady = new EventEmitter<FormGroup>()
  @ViewChild('speakerAuto') speakerAutocomplete!: MatLegacyAutocomplete
  @ViewChild('speakerInput') speakerInput!: ElementRef<HTMLInputElement>

  // Toggle states
  isPreEventExpanded = true
  isPostEventExpanded = true

  // Forms
  preEventForm!: FormGroup
  postEventForm!: FormGroup

  // File references
  preReadDocument: any = null
  videoFile: File | null = null
  summaryDocument: File | null = null

  //User profile
  userProfile: any
  uploadedDocTypeImg: string = ''
  materialType: string = ''
  showUploadedDoc: boolean = false
  showUploadedVideo: boolean = false
  showUploadedSummaryDoc: boolean = false
  uploadedVideoName: string = ''
  uploadedSummaryDocName: string = ''
  isDraft: boolean = false

  // Speaker autocomplete properties
  speakerCtrl = new FormControl('')
  speakersList: any[] = []
  fetchSpeakersStatus: 'none' | 'fetching' | 'done' = 'none'
  separatorKeysCodes: number[] = [13, 188] // Enter and comma
  selectable = true
  removable = true
  showSpeakerInvalidMsg = false
  isSavedPostEvent: boolean = false
  isSpeakerDisabled: boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private matSnackBar: MatLegacySnackBar,
    private loaderService: LoaderService,
    private eventSvc: EventsService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatLegacyDialog
  ) { }

  ngOnChanges(data: SimpleChanges) {
    if (data['eventStatus'] && !data['eventStatus'].firstChange) {
      if (data['eventStatus'].currentValue === 'live') {
        this.disableLiveEventEditing()
      }
    }
  }

  disableLiveEventEditing() {
    if (this.preEventForm) {
      this.preEventForm.get('agenda')?.disable()
      this.preEventForm.get('selectedSpeaker')?.disable()
      this.preEventForm.get('speakerType')?.disable()
      this.preEventForm.get('agenda')?.updateValueAndValidity()
      this.preEventForm.get('selectedSpeaker')?.updateValueAndValidity()
      this.preEventForm.get('speakerType')?.updateValueAndValidity()
    }
  }


  ngOnInit() {
    this.userProfile = _.get(this.activatedRoute, 'snapshot.data.configService.userProfile')
    const queryParams = this.activatedRoute.snapshot.queryParams
    if (queryParams && queryParams['pathUrl'] === 'past') {
      this.isPreEventExpanded = false
    }
    this.initializeForms()
    this.applyFormRulesBasedOnStatus()
    this.patchFormValues()

    // Setup speaker search with debounce
    this.speakerCtrl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.onSpeakerSearch(value)
      }
    })

    // Emit forms to parent component
    this.preEventFormReady.emit(this.preEventForm)
    this.postEventFormReady.emit(this.postEventForm)
  }

  initializeForms() {
    // Pre Event Setup Form
    this.preEventForm = this.formBuilder.group({
      preEventReads: new FormControl(null),
      meetingLink: new FormControl(''),
      agenda: new FormControl(''),
      selectedSpeaker: new FormControl([]),
      speakerType: new FormControl('')
    })

    // Post Event Setup Form
    this.postEventForm = this.formBuilder.group({
      recordedMediaLink: new FormControl(''),
      noOfAttendes: new FormControl(null),
      eventDuration: new FormControl(''),
      meetingSummary: new FormControl(''),
      postEventSummary: new FormControl('')
    })
  }

  applyFormRulesBasedOnStatus() {
    const status = _.get(this.eventDetailsData, 'status', '').toLowerCase()
    this.isDraft = status?.toLowerCase() === 'draft' ||
      (this.eventDetailsData?.status?.toLowerCase() === 'rejected' && (!this.eventDetailsData?.prevStatus ||
        this.eventDetailsData?.prevStatus?.toLowerCase() === 'sentToPublish'))
    if (this.openMode === 'view') {
      this.isDraft = false
    }
    if (this.isDraft) {
      this.preEventForm.get('meetingLink')?.setValidators([Validators.required, Validators.pattern(this.URL_PATTERN)])
      this.preEventForm.get('agenda')?.setValidators([Validators.required, Validators.minLength(100), Validators.maxLength(1000)])
      this.preEventForm.get('meetingLink')?.updateValueAndValidity()
      this.preEventForm.get('agenda')?.updateValueAndValidity()
      this.preEventForm.enable()
      this.postEventForm.disable()
    } else if (this.isDateTimePassed(this.eventDetailsData.endDateTime) && this.eventDetailsData.status.toLowerCase() === 'live') {
      this.preEventForm.disable()
      this.postEventForm.enable()
      this.postEventForm.get('postEventSummary')?.setValidators([Validators.required])
      this.postEventForm.get('noOfAttendes')?.setValidators([Validators.required, Validators.min(1), Validators.max(this.eventDetailsData.maxEnrolments || 200)])
      this.postEventForm.get('eventDuration')?.setValidators([Validators.required, this.durationValidator.bind(this)])
      this.postEventForm.get('meetingSummary')?.setValidators([Validators.minLength(100), Validators.maxLength(1000)])
      this.postEventForm.get('postEventSummary')?.updateValueAndValidity()
      this.postEventForm.get('noOfAttendes')?.updateValueAndValidity()
      this.postEventForm.get('eventDuration')?.updateValueAndValidity()
      this.postEventForm.get('meetingSummary')?.updateValueAndValidity()
    } else if (this.isDateUpcoming(this.eventDetailsData.startDateTime) && this.eventDetailsData.status.toLowerCase() === 'live') {
      this.preEventForm.disable()
      this.postEventForm.disable()
      this.preEventForm.get('meetingLink')?.setValidators([Validators.required, Validators.pattern(this.URL_PATTERN)])
      this.preEventForm.get('meetingLink')?.enable()
      this.preEventForm.get('meetingLink')?.updateValueAndValidity()
    } else {
      this.preEventForm.disable()
      this.postEventForm.disable()
    }
    if (this.openMode === 'view') {
      this.preEventForm.disable()
      this.postEventForm.disable()
    }
    if (this.eventStatus === 'live') {
      this.disableLiveEventEditing()
    }
  }

  patchFormValues() {
    let speakerDetails = []
    try {
      speakerDetails = (_.isString(this.eventDetailsData.speakerDetails) && this.eventDetailsData.speakerDetails.trim() !== '')
        ? JSON.parse(this.eventDetailsData.speakerDetails)
        : this.eventDetailsData.speakerDetails || []
    } catch (error) {
      console.error('Error parsing speaker details:', error)
      speakerDetails = []
    }

    this.preEventForm.patchValue({
      preEventReads: this.eventDetailsData.preEventReads?.[0] || '',
      meetingLink: this.eventDetailsData.registrationLink || '',
      agenda: this.eventDetailsData.meetingAgenda || '',
      selectedSpeaker: speakerDetails,
      speakerType: ''
    })
    this.postEventForm.patchValue({
      noOfAttendes: this.eventDetailsData.noOfAttendes || null,
      eventDuration: this.convertMinutesToDuration(this.eventDetailsData.eventDuration) || '',
      meetingSummary: this.eventDetailsData.meetingSummary || '',
      postEventSummary: this.eventDetailsData.postEventSummary?.[0] || ''
    })
    this.getSpeakerType()
    if (this.preEventControls['preEventReads'].value) {
      this.generateUploadedDocTypeImg(this.preEventControls['preEventReads'].value)
      this.showUploadedDoc = true
    }
    if (this.postEventControls['postEventSummary'].value) {
      this.generateUploadedDocTypeImg(this.postEventControls['postEventSummary'].value)
      this.showUploadedSummaryDoc = true
      this.isSavedPostEvent = true
      this.postEventForm.disable()
    }
  }

  getSpeakerType() {
    let speakerData = []
    try {
      speakerData = (_.isString(this.eventDetailsData.speakerDetails) && this.eventDetailsData.speakerDetails.trim() !== '')
        ? JSON.parse(this.eventDetailsData.speakerDetails)
        : this.eventDetailsData.speakerDetails || []
    } catch (error) {
      console.error('Error parsing speaker details in getSpeakerType:', error)
      speakerData = []
    }
    if (speakerData.length > 1) {
      this.preEventControls['speakerType'].setValue('others')
    } else if (speakerData.length === 1) {
      if (speakerData[0].id !== '') {
        if (this.eventDetailsData.courseLinked === '') {
          this.preEventControls['selectedSpeaker'].setValue('')
          this.preEventControls['speakerType'].setValue('')
        } else {
          this.preEventControls['speakerType'].setValue('courseCreator')
          this.isSpeakerDisabled = true
        }
      } else {
        this.preEventControls['speakerType'].setValue('others')
      }
    } else {
      this.preEventControls['selectedSpeaker'].setValue('')
      this.preEventControls['speakerType'].setValue('')
    }
    this.preEventForm.get('speakerType')?.updateValueAndValidity()
    this.preEventForm.get('selectedSpeaker')?.updateValueAndValidity()
  }

  get preEventControls() {
    return this.preEventForm.controls
  }

  get postEventControls() {
    return this.postEventForm.controls
  }

  togglePreEventSetup() {
    this.isPreEventExpanded = !this.isPreEventExpanded
  }

  togglePostEventSetup() {
    this.isPostEventExpanded = !this.isPostEventExpanded
  }

  isDateTimePassed(dateTimeString: string): boolean {
    if (!dateTimeString) {
      return false
    }
    try {
      const inputDate = new Date(dateTimeString)
      const currentDate = new Date()
      return inputDate < currentDate
    } catch (error) {
      return false
    }
  }

  isDateUpcoming(dateTimeString: string): boolean {
    if (!dateTimeString) {
      return false
    }
    try {
      const inputDate = new Date(dateTimeString)
      const currentDate = new Date()
      return inputDate > currentDate
    } catch (error) {
      return false
    }
  }

  onSpeakerSearch(value: string) {
    if (!value || value.length < 2) {
      this.speakersList = []
      this.fetchSpeakersStatus = 'none'
      this.showSpeakerInvalidMsg = false
      return
    }

    this.fetchSpeakersStatus = 'fetching'
    this.showSpeakerInvalidMsg = false
    // Mock speaker search - replace with actual API call
    this.eventSvc.getUserSearchList(value).subscribe(
      (res) => {
        this.speakersList = res?.content || []
        this.fetchSpeakersStatus = 'done'
      },
      (_error) => {
        this.fetchSpeakersStatus = 'none'
        this.showSpeakerInvalidMsg = true
      }
    )
  }

  addSpeaker(event: any) {
    const speaker = event.option.value
    const currentSpeakers = this.preEventForm.get('selectedSpeaker')?.value || []

    // Check if speaker already exists
    if (speaker && !currentSpeakers.find((s: any) => s.id === speaker.id)) {
      const tempData = {
        name: speaker?.profileDetails?.personalDetails?.firstname,
        email: speaker?.profileDetails?.personalDetails?.primaryEmail,
        id: speaker?.userId
      }
      this.preEventForm.patchValue({
        selectedSpeaker: [...currentSpeakers, tempData]
      })
    }

    // Clear the input and reset autocomplete
    this.speakerCtrl.setValue('', { emitEvent: false })
    if (this.speakerInput) {
      this.speakerInput.nativeElement.value = ''
    }
    this.speakersList = []
    this.fetchSpeakersStatus = 'none'
  }

  removeSpeaker(speaker: any) {
    const currentSpeakers = this.preEventForm.get('selectedSpeaker')?.value || []
    const updatedSpeakers = currentSpeakers.filter((s: any) => s.id !== speaker.id || s.name !== speaker.name)
    this.preEventForm.patchValue({ selectedSpeaker: updatedSpeakers })
  }

  validateAndAddSpeaker(event: any) {
    const value = (event.value || '').trim()

    // Clear the input and reset autocomplete first
    if (event.chipInput) {
      event.chipInput.clear()
    }
    this.speakerCtrl.reset()
    this.speakerCtrl.updateValueAndValidity()
    this.speakersList = []
    this.fetchSpeakersStatus = 'none'
    this.showSpeakerInvalidMsg = false

    if (value) {
      // Validate email or name format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const namePattern = /^[a-zA-Z\s.]+$/

      if (emailPattern.test(value) || namePattern.test(value)) {
        const currentSpeakers = this.preEventForm.get('selectedSpeaker')?.value || []
        this.preEventForm.patchValue({
          selectedSpeaker: [...currentSpeakers, { name: value, email: '', id: '' }]
        })
      }
    }
  }

  onSpeakerTypeChange(event: any) {
    const speakerType = event.value
    this.preEventForm.patchValue({ selectedSpeaker: [] })
    if (speakerType === 'courseCreator') {
      this.isSpeakerDisabled = true
      const courseDetails = this.eventSvc.getCourseDetails()
      if (courseDetails && Object.keys(courseDetails)?.length) {
        this.preEventForm.patchValue({ selectedSpeaker: _.isString(courseDetails.creatorContacts) ? JSON.parse(courseDetails.creatorContacts) : [] })
        this.preEventControls['selectedSpeaker'].updateValueAndValidity()
      } else {
        this.preEventControls['speakerType'].setValue('')
        this.matSnackBar.open('Please select a course to fetch course creators')
      }
    } else if (speakerType === 'others') {
      this.isSpeakerDisabled = false
      // Allow manual entry
    }
  }

  addSpeakerFromInput(event: any): void {
    const value = (event.value || '').trim()

    // Add speaker name
    if (value) {
      const currentSpeakers = this.preEventForm.get('selectedSpeaker')?.value || []
      this.preEventForm.patchValue({
        selectedSpeaker: [...currentSpeakers, { name: value, email: '', id: '' }]
      })
    }

    // Clear the input value
    if (event.chipInput) {
      event.chipInput.clear()
    }
  }

  onVideoUpload(event: any) {
    const file = event.target.files[0]
    if (file) {
      const mimeType = file.type
      if (mimeType !== 'video/mp4') {
        this.matSnackBar.open('Invalid file type. Please upload only MP4 video files.')
        return
      }
      this.videoFile = file
      const reader = new FileReader()
      reader.readAsDataURL(file)
      this.loaderService.changeLoaderState(true)
      reader.onload = _event => {
        this.loaderService.changeLoaderState(false)
        this.saveFile(file, 'post-event-video')
      }
    }
  }

  onSummaryDocUpload(event: any) {
    const file = event.target.files[0]
    if (file) {
      const mimeType = file.type
      if (mimeType !== 'application/pdf') {
        this.matSnackBar.open('Invalid file type. Please upload only PDF files.')
        return
      }
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        this.matSnackBar.open('File size exceeds 10MB. Please upload a smaller file.')
        return
      }
      this.summaryDocument = file
      const reader = new FileReader()
      reader.readAsDataURL(file)
      this.loaderService.changeLoaderState(true)
      reader.onload = _event => {
        this.loaderService.changeLoaderState(false)
        this.saveFile(file, 'post-event-summary')
      }
    }
  }

  preventDefaultCDK(event: DragEvent, isEneter = ''): void {
    event.preventDefault()
    event.stopPropagation()
    if (isEneter) {
      const dropArea = event.target as HTMLElement
      dropArea.style.opacity = isEneter === 'enter' ? '0.5' : '1'
    }
  }

  onDrop(event: DragEvent): void {
    this.preventDefaultCDK(event, 'leave')

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      this.onPreReadDocUpload(files)
    }
  }

  onPreReadDocumentChange(event: any) {
    const files = event.target.files
    if (files && files.length > 0) {
      this.onPreReadDocUpload(files)
    }
  }

  onPreReadDocUpload(files: FileList) {
    if (files.length === 0) {
      return
    }
    const file = files[0]
    const mimeType = file.type
    if (mimeType !== 'application/pdf') {
      this.matSnackBar.open('Invalid file type. Please upload only PDF files.')
      return
    }
    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      this.matSnackBar.open('File size exceeds 10MB. Please upload a smaller file.')
      return
    }
    this.preReadDocument = file
    const reader = new FileReader()
    reader.readAsDataURL(file)
    this.loaderService.changeLoaderState(true)
    reader.onload = _event => {
      this.loaderService.changeLoaderState(false)
      this.saveFile(file, 'pre-read')
    }
  }

  saveFile(filePath: any, type: string) {
    if (filePath) {
      const org = []
      const createdforarray: any[] = []
      createdforarray.push(_.get(this.userProfile, 'rootOrgId', ''))
      org.push(_.get(this.userProfile, 'departmentName', ''))

      const request = {
        request: {
          content: {
            name: 'image asset',
            creator: _.get(this.userProfile, 'userName', ''),
            createdBy: _.get(this.userProfile, 'userId', ''),
            code: 'image asset',
            mimeType: filePath.type,
            mediaType: 'image',
            contentType: 'Asset',
            primaryCategory: 'Asset',
            organisation: org,
            createdFor: createdforarray,
          },
        },
      }
      this.loaderService.changeLoaderState(true)
      this.eventSvc.createContent(request).pipe(mergeMap((res: any) => {
        const contentID = _.get(res, 'result.identifier')
        const formData: FormData = new FormData()
        formData.append('data', filePath)
        if (contentID) {
          return this.eventSvc.uploadContent(contentID, formData).pipe(map((fdata: any) => {
            return _.get(fdata, 'result.artifactUrl', '')
          }))
        } else {
          throw new Error('Something went wrong please try again')
        }
      })).subscribe({
        next: (res: any) => {
          this.loaderService.changeLoaderState(false)
          if (res) {
            const createdUrl = res
            const urlToReplace = 'https://storage.googleapis.com/igot'
            let fileUrl = createdUrl
            if (createdUrl.startsWith(urlToReplace)) {
              const urlSplice = createdUrl.slice(urlToReplace.length).split('/')
              fileUrl = `${environment.domainName}assets/public/${urlSplice.slice(1).join('/')}`
            }
            switch (type) {
              case 'pre-read':
                this.preEventForm.patchValue({ preEventReads: fileUrl })
                this.generateUploadedDocTypeImg(fileUrl)
                this.showUploadedDoc = true
                this.matSnackBar.open('Document uploaded successfully')
                break
              case 'post-event-video':
                this.postEventForm.patchValue({ recordedMediaLink: fileUrl })
                this.showUploadedVideo = true
                this.matSnackBar.open('Video uploaded successfully')
                break
              case 'post-event-summary':
                this.postEventForm.patchValue({ postEventSummary: fileUrl })
                this.showUploadedSummaryDoc = true
                this.matSnackBar.open('Summary document uploaded successfully')
                break
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loaderService.changeLoaderState(false)
          const errorMessage = _.get(error, 'error.message', 'Something went wrong please try again')
          this.matSnackBar.open(errorMessage)
        }
      })
    }
  }

  generateUploadedDocTypeImg(url: any) {
    const materialName = url
    if (materialName.includes('.pdf')) {
      this.uploadedDocTypeImg = '/assets/icons/pdf.svg'
      this.materialType = '1 pdf'
    }
  }

  removeUploadedDoc() {
    const dialogData = {
      dialogType: 'warning',
      icon: {
        iconName: 'error_outline',
        iconClass: 'warning-icon'
      },
      message: 'Are you sure you want to remove this document?',
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

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: 'auto',
      data: dialogData,
      autoFocus: false,
      disableClose: true
    })

    dialogRef.afterClosed().subscribe((confirmed: any) => {
      if (confirmed) {
        this.preReadDocument = null
        this.preEventForm.patchValue({ preEventReads: null })
        this.showUploadedDoc = false
        this.uploadedDocTypeImg = ''
        this.materialType = ''
        this.matSnackBar.open('Document removed successfully')
      }
    })
  }

  removeUploadedVideo() {
    const dialogData = {
      dialogType: 'warning',
      icon: {
        iconName: 'error_outline',
        iconClass: 'warning-icon'
      },
      message: 'Are you sure you want to remove this video?',
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

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: 'auto',
      data: dialogData,
      autoFocus: false,
      disableClose: true
    })

    dialogRef.afterClosed().subscribe((confirmed: any) => {
      if (confirmed) {
        this.videoFile = null
        this.showUploadedVideo = false
        this.postEventForm.patchValue({ recordedMediaLink: null })
        this.matSnackBar.open('Video removed successfully')
      }
    })
  }

  removeUploadedSummaryDoc() {
    const dialogData = {
      dialogType: 'warning',
      icon: {
        iconName: 'error_outline',
        iconClass: 'warning-icon'
      },
      message: 'Are you sure you want to remove this document?',
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

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: 'auto',
      data: dialogData,
      autoFocus: false,
      disableClose: true
    })

    dialogRef.afterClosed().subscribe((confirmed: any) => {
      if (confirmed) {
        this.summaryDocument = null
        this.postEventForm.patchValue({ postEventSummary: null })
        this.showUploadedSummaryDoc = false
        this.matSnackBar.open('Document removed successfully')
      }
    })
  }

  convertMinutesToDuration(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes < 0) {
      return ''
    }

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)
    const seconds = Math.round((totalMinutes % 1) * 60)

    let duration = ''
    if (hours > 0) {
      duration += `${hours}h `
    }
    if (minutes > 0) {
      duration += `${minutes}m `
    }
    if (seconds > 0) {
      duration += `${seconds}s`
    }

    return duration.trim()
  }

  onNumberKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode
    const key = event.key

    // Block decimal point/period in all forms
    if (key === '.' || charCode === 46 || charCode === 190 || charCode === 110) {
      event.preventDefault()
      return false
    }

    // Block minus sign
    if (key === '-' || charCode === 189 || charCode === 109) {
      event.preventDefault()
      return false
    }

    // Allow: backspace, delete, tab, escape, enter, arrows
    if ([8, 9, 27, 13, 37, 38, 39, 40].indexOf(charCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.ctrlKey && [65, 67, 86, 88].indexOf(charCode) !== -1)) {
      return true
    }

    // Ensure that it is a number (0-9)
    if (key && (key >= '0' && key <= '9')) {
      return true
    }

    // Block everything else
    event.preventDefault()
    return false
  }

  onAttendeesInput(event: any): void {
    // This is kept for paste handling via keyboard
    const value = event.target.value
    if (value && value.includes('.')) {
      const intValue = Math.floor(parseFloat(value))
      this.postEventForm.patchValue({ noOfAttendes: intValue >= 0 ? intValue : null }, { emitEvent: false })
    }
  }

  onAttendeesPaste(event: ClipboardEvent): void {
    event.preventDefault()
    const pastedText = event.clipboardData?.getData('text')
    if (pastedText) {
      const numValue = parseFloat(pastedText)
      if (!isNaN(numValue)) {
        const intValue = Math.floor(numValue)
        this.postEventForm.patchValue({ noOfAttendes: intValue >= 0 ? intValue : null })
      }
    }
  }

  uploadedFileName(url: string): string {
    if (!url) {
      return ''
    }
    try {
      // Remove quotes if present
      const cleanUrl = url.replace(/['"]/g, '')
      // Split by '/' and get the last part
      const parts = cleanUrl.split('/')
      const lastPart = parts[parts.length - 1]
      // Extract filename after the last underscore (removing timestamp)
      const filenameParts = lastPart.split('_')
      return filenameParts[filenameParts.length - 1] || lastPart
    } catch (error) {
      console.error('Error extracting filename:', error)
      return url
    }
  }

}
