import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { mergeMap } from 'rxjs/operators'
import * as _ from 'lodash'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'

@Component({
  selector: 'ws-app-new-external-training',
  templateUrl: './new-external-training.component.html',
  styleUrls: ['./new-external-training.component.scss']
})
export class NewExternalTrainingComponent implements OnInit {
  trainingForm!: FormGroup
  selectedFileName: string = '';
  uploadedFileUrl: string = '';
  selectedCompetencyList: any[] = []
  configSvc: any

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private activeRoute: ActivatedRoute,
    private externalTrainingsSvc: ExternalTrainingsService,
    private matSnackBar: MatLegacySnackBar,
  ) { }

  ngOnInit(): void {
    this.configSvc = this.activeRoute.snapshot.data['configService']
    console.log('Config Service Data:', this.configSvc)
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

  onSelectedCompetencyChange(selectedCompetency: any): void {
    console.log('Selected Competency:', selectedCompetency)
    this.selectedCompetencyList = selectedCompetency
  }

  get buildPayload(): any {
    const form = this.trainingForm.value
    const eventType = _.get(form, 'deliveryMode') || ''
    const learningHours = _.get(form, 'learningHours') || 0

    return {
      request: {
        event: {
          mimeType: 'application/html',
          locale: 'en',
          name: _.get(form, 'trainingTitle'),
          description: _.get(form, 'learningObjective'),
          category: 'externalTraining',
          duration: learningHours * 3600,
          createdBy: _.get(this.configSvc, 'userProfile.userId'),
          categoryType: _.get(form, 'trainingType'),
          sourceName: _.get(this.configSvc, 'unMappedUser.rootOrg.orgName'),
          orgLogo: _.get(form, 'partnerLogo') || '',
          cerTemplate: _.get(form, 'partnerLogo') || '',
          code: 'externalTraining',
          eventType,
          createdFor: [_.get(this.configSvc, 'userProfile.rootOrgId')],
          channel: _.get(this.configSvc, 'userProfile.rootOrgId'),
          competencies_v6: this.selectedCompetencyList,
          trackable: {
            enabled: 'Yes',
            autoBatch: 'No',
          },
          creatorName: _.get(this.configSvc, 'userProfile.firstName'),
          createrEmail: _.get(this.configSvc, 'userProfile.email'),
          partnerName: _.get(form, 'partnerName'),
        },
      },
    }
  }

  onSubmit(): void {
    if (this.trainingForm.valid && this.selectedCompetencyList.length > 0) {
      const formData = this.buildPayload
      this.externalTrainingsSvc.createExternalTraining(formData).pipe(
        mergeMap((createRes: any) => {
          const publishPayload = {
            request: {
              event: {
                identifier: _.get(createRes, 'result.identifier'),
                versionKey: _.get(createRes, 'result.versionKey'),
              },
            },
          }
          return this.externalTrainingsSvc.publishExternalTraining(publishPayload)
        })
      ).subscribe({
        next: () => {
          this.openSnackbar('Training created and published successfully.')
          this.goBackToExternalTrainings()
        },
        error: (err) => {
          const errorMessage = _.get(err, 'error.params.errmsg', 'An error occurred while creating the training.')
          this.openSnackbar(errorMessage)
        },
      })
    }
  }

  goBackToExternalTrainings(): void {
    this.router.navigate(['app', 'home', 'external-trainings'])
  }

  openSnackbar(message: string): void {
    this.matSnackBar.open(message, 'Close', {
      duration: 3000,
    })
  }
}
