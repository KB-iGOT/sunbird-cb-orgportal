import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

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

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.trainingId = this.route.parent?.snapshot.params['id'] || ''
    this.initializeForm()
  }

  initializeForm(): void {
    this.batchForm = this.fb.group({
      batchName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    })
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
      console.log('Form Data:', this.batchForm.value)
      console.log('Uploaded File:', this.uploadedFile)
      // Add your submission logic here
      // For example: this.batchService.createBatch(this.batchForm.value, this.uploadedFile);
    }
  }

  onCancel(): void {
    this.goBack()
  }

  goBack(): void {
    this.router.navigate(['app', 'home', 'external-trainings', this.trainingId, 'batches'])
  }
}
