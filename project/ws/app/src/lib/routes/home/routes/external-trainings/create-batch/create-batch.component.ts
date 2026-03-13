import { Component, OnInit } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { mergeMap } from 'rxjs/operators'
import * as _ from 'lodash'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'

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
  configSvc: any

  get startDateValue(): string {
    return this.batchForm?.get('startDate')?.value || ''
  }

  get endDateValue(): string {
    return this.batchForm?.get('endDate')?.value || ''
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private externalTrainingsSvc: ExternalTrainingsService,
    private matSnackBar: MatLegacySnackBar,
  ) { }

  ngOnInit(): void {
    this.trainingId = this.route.parent?.snapshot.params['id'] || ''
    this.configSvc = this.route.snapshot.data['configService']
    this.initializeForm()
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
    // Create sample CSV content
    const csvContent = 'Participant Name,Email,Phone,Department\nJohn Doe,john@example.com,1234567890,IT\nJane Smith,jane@example.com,0987654321,HR\n'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample_participants.csv'
    link.click()
    globalThis.URL.revokeObjectURL(url)
  }

  onSubmit(): void {
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
        },
      }

      this.externalTrainingsSvc.createBatch(payload).pipe(
        mergeMap((createBatchRes: any) => {
          const batchId = _.get(createBatchRes, 'result.batchId')
          const formData = new FormData()
          formData.append('batchId', batchId)
          if (this.uploadedFile) {
            formData.append('file', this.uploadedFile)
          }
          return this.externalTrainingsSvc.bulkUsersUpload(formData)
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

  onCancel(): void {
    this.goBack()
  }

  goBack(): void {
    this.router.navigate(['app', 'home', 'external-trainings', this.trainingId, 'batches'])
  }
}
