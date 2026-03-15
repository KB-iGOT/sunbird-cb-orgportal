import { Component, OnInit } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { mergeMap } from 'rxjs/operators'
import * as _ from 'lodash'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'

export function endDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent
    if (!parent) return null
    const startDate = parent.get('startDate')?.value
    const endDate = control.value
    if (!startDate || !endDate) return null
    return new Date(endDate) < new Date(startDate) ? { endBeforeStart: true } : null
  }
}

@Component({
  selector: 'ws-app-create-batch',
  templateUrl: './create-batch.component.html',
  styleUrls: ['./create-batch.component.scss']
})
export class CreateBatchComponent implements OnInit {
  batchForm!: FormGroup
  uploadedFile: File | null = null;
  isDragOver = false;
  trainingId: string = ''
  batchId: string = ''
  configSvc: any
  isEditMode = false
  currentBatch: any = null
  eventDurationInMinutes = 0
  todayDate = new Date()

  get startDateAsDate(): Date | null {
    const val = this.batchForm?.get('startDate')?.value
    return val ? new Date(val) : null
  }

  get endDateAsDate(): Date | null {
    const val = this.batchForm?.get('endDate')?.value
    return val ? new Date(val) : null
  }

  get isSubmitDisabled(): boolean {
    if (this.isEditMode) {
      return !this.uploadedFile
    }
    return !this.batchForm?.valid || !this.uploadedFile
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private externalTrainingsSvc: ExternalTrainingsService,
    private matSnackBar: MatLegacySnackBar,
    private loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.trainingId = this.route.parent?.snapshot.params['id'] || ''
    this.configSvc = this.route.snapshot.data['configService']

    this.initializeForm()
    this.getBatchDetails()

    // Check for batchId in query parameters to determine edit mode
    this.route.queryParams.subscribe(params => {
      this.batchId = params['batchId'] || ''
      this.isEditMode = this.batchId !== ''

      if (this.isEditMode) {
        // Disable form and get batch details
        this.batchForm.disable()
      }
    })
  }

  initializeForm(): void {
    this.batchForm = this.fb.group({
      batchName: ['', Validators.required],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required, endDateValidator()]],
    })

    this.batchForm.get('startDate')?.valueChanges.subscribe(() => {
      this.batchForm.get('endDate')?.updateValueAndValidity()
    })
  }

  getBatchDetails(): void {
    this.loaderService.changeLoaderState(true)

    this.externalTrainingsSvc.getExternalTrainingDetails(this.trainingId).subscribe({
      next: (response: any) => {
        const event = _.get(response, 'result.event', {})
        const batches = event.batches || []
        this.eventDurationInMinutes = Math.round((event.duration || 0) / 60)

        // Find current batch by batchId
        this.currentBatch = batches.find((batch: any) => batch.batchId === this.batchId)

        if (this.currentBatch && this.isEditMode) {
          this.patchFormWithBatchData()
        }

        this.loaderService.changeLoaderState(false)
      },
      error: (error) => {
        const errorMessage = _.get(error, 'error.params.errmsg', 'Error fetching batch details')
        this.matSnackBar.open(errorMessage, 'Close', { duration: 3000 })
        this.loaderService.changeLoaderState(false)
      }
    })
  }

  patchFormWithBatchData(): void {
    if (this.currentBatch && this.batchForm) {
      this.batchForm.patchValue({
        batchName: this.currentBatch.name || '',
        startDate: this.currentBatch.startDate ? new Date(this.currentBatch.startDate) : null,
        endDate: this.currentBatch.endDate ? new Date(this.currentBatch.endDate) : null,
      })
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.validateAndSetFile(file)
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragOver = false

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0]
      this.validateAndSetFile(file)
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragOver = true
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragOver = false
  }

  validateAndSetFile(file: File): void {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Only CSV files are supported')
      return
    }

    // Check file size (100 MB = 100 * 1024 * 1024 bytes)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size exceeds 100 MB limit')
      return
    }

    this.uploadedFile = file
  }

  removeFile(): void {
    this.uploadedFile = null
  }

  downloadSampleFile(): void {
    this.externalTrainingsSvc.downloadSampleFile().subscribe({
      next: (blob: Blob) => {
        const url = globalThis.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'sample_participants.csv'
        link.click()
        globalThis.URL.revokeObjectURL(url)
      },
      error: (error) => {
        console.error('Error downloading sample file:', error)
        this.matSnackBar.open('Error downloading sample file', 'Close', { duration: 3000 })
      }
    })
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.handleEditSubmit()
    } else {
      this.handleCreateSubmit()
    }
  }

  handleCreateSubmit(): void {
    if (this.batchForm.valid && this.uploadedFile) {
      const form = this.batchForm.value
      const payload = {
        request: {
          eventId: this.trainingId,
          name: _.get(form, 'batchName'),
          enrollmentType: 'invite-only',
          startDate: this.formatDate(new Date(_.get(form, 'startDate'))),
          endDate: this.formatDate(new Date(_.get(form, 'endDate'))),
          createdBy: _.get(this.configSvc, 'userProfile.userId'),
          batchAttributes: {
            duration: this.eventDurationInMinutes
          }
        },
      }

      this.externalTrainingsSvc.createBatch(payload).pipe(
        mergeMap((createBatchRes: any) => {
          const batchId = _.get(createBatchRes, 'result.batchId')
          const formData = new FormData()
          formData.append(
            'file',
            this.uploadedFile as Blob,
            (this.uploadedFile as File).name.replace(/[^A-Za-z0-9_.]/g, ''),
          )
          return this.externalTrainingsSvc.bulkUsersUpload(formData, this.trainingId, batchId)
        })
      ).subscribe({
        next: () => {
          this.matSnackBar.open('Batch created and participants uploaded successfully.', 'Close', { duration: 3000 })
          this.goBack()
        },
        error: (err: any) => {
          const errorMessage = _.get(err, 'error.params.errmsg', 'An error occurred while creating the batch.')
          this.matSnackBar.open(errorMessage, 'Close', { duration: 3000 })
        },
      })
    }
  }

  handleEditSubmit(): void {
    if (this.uploadedFile) {
      const formData = new FormData()
      formData.append(
        'file',
        this.uploadedFile as Blob,
        (this.uploadedFile as File).name.replace(/[^A-Za-z0-9_.]/g, ''),
      )

      this.externalTrainingsSvc.bulkUsersUpload(formData, this.trainingId, this.batchId).subscribe({
        next: () => {
          this.matSnackBar.open('Participants uploaded successfully to the batch.', 'Close', { duration: 3000 })
          this.goBack()
        },
        error: (err: any) => {
          const errorMessage = _.get(err, 'error.params.errmsg', 'An error occurred while uploading participants.')
          this.matSnackBar.open(errorMessage, 'Close', { duration: 3000 })
        },
      })
    } else {
      this.matSnackBar.open('Please select a CSV file to upload participants.', 'Close', { duration: 3000 })
    }
  }

  onCancel(): void {
    this.goBack()
  }

  goBack(): void {
    this.router.navigate(['app', 'home', 'external-trainings', this.trainingId, 'batches'])
  }
}
