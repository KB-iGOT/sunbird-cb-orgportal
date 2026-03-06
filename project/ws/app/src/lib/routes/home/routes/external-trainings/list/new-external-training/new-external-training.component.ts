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
      this.selectedFileName = file.name
      this.trainingForm.patchValue({
        partnerLogo: file
      })
    }
  }

  goBack(): void {
    this.location.back()
  }
}
