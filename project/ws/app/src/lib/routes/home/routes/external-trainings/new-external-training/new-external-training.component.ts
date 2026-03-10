import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Location } from '@angular/common'

@Component({
  selector: 'ws-app-new-external-training',
  templateUrl: './new-external-training.component.html',
  styleUrls: ['./new-external-training.component.scss']
})
export class NewExternalTrainingComponent implements OnInit {
  trainingForm!: FormGroup
  selectedFileName: string = '';
  uploadedFileUrl: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly location: Location
  ) { }

  ngOnInit(): void {
    this.initializeForm()
  }

  initializeForm(): void {
    this.trainingForm = this.fb.group({
      trainingTitle: ['', Validators.required],
      learningObjective: [''],
      deliveryMode: [''],
      learningHours: [''],
      trainingType: ['', Validators.required],
      partnerName: [''],
      partnerLogo: ['']
    })
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]

      // Validate SVG file
      if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
        alert('Only SVG files are allowed')
        input.value = '' // Clear the input
        return
      }

      this.selectedFileName = file.name
      this.uploadedFileUrl = URL.createObjectURL(file)
      this.trainingForm.patchValue({
        partnerLogo: file
      })
    }
  }

  removeUploadedFile(): void {
    if (this.uploadedFileUrl) {
      URL.revokeObjectURL(this.uploadedFileUrl)
    }
    this.selectedFileName = ''
    this.uploadedFileUrl = ''
    this.trainingForm.patchValue({
      partnerLogo: ''
    })
  }

  onSubmit(): void {
    if (this.trainingForm.valid) {
      console.log('Form Data:', this.trainingForm.value)
      // Add your submission logic here
      // For example: this.trainingService.createTraining(this.trainingForm.value)
    }
  }

  onCancel(): void {
    this.goBack()
  }

  goBack(): void {
    this.location.back()
  }
}
