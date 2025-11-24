import { Component, Input, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { material } from '../../models/events.model'

@Component({
  selector: 'ws-app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {

  @Input() materialsList: material[] = []
  @Input() openMode = 'edit'
  @Input() openTab = 'draft'

  // Toggle states
  isPreEventExpanded = true
  isPostEventExpanded = true

  // Forms
  preEventForm!: FormGroup
  postEventForm!: FormGroup

  // File references
  preReadDocument: File | null = null
  videoFile: File | null = null
  summaryDocument: File | null = null

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initializeForms()
  }

  initializeForms() {
    // Pre Event Setup Form
    this.preEventForm = this.formBuilder.group({
      preReadDocument: new FormControl(null),
      meetingLink: new FormControl('', [Validators.required]),
      agenda: new FormControl('', [Validators.required, Validators.minLength(150), Validators.maxLength(3000)]),
      selectedSpeaker: new FormControl('others'),
      speakerName: new FormControl('')
    })

    // Post Event Setup Form
    this.postEventForm = this.formBuilder.group({
      videoFile: new FormControl(null),
      videoUrl: new FormControl('', [Validators.required]),
      summaryDocument: new FormControl(null),
      numberOfAttendees: new FormControl(null, [Validators.required, Validators.min(0)]),
      eventDuration: new FormControl('', [Validators.required]),
      keyTakeaways: new FormControl('', [Validators.minLength(150), Validators.maxLength(3000)])
    })
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

  onPreReadDocUpload(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.preReadDocument = file
      this.preEventForm.patchValue({ preReadDocument: file })
      console.log('Pre-read document uploaded:', file.name)
    }
  }

  onVideoUpload(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.videoFile = file
      this.postEventForm.patchValue({ videoFile: file })
      console.log('Video uploaded:', file.name)
    }
  }

  onSummaryDocUpload(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.summaryDocument = file
      this.postEventForm.patchValue({ summaryDocument: file })
      console.log('Summary document uploaded:', file.name)
    }
  }

}
