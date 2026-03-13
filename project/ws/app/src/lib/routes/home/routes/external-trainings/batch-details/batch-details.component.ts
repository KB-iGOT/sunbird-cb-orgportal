import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import * as _ from 'lodash'

@Component({
  selector: 'ws-app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.scss']
})
export class BatchDetailsComponent {

  batches: any[] = []
  training: any = {}
  isLoading = false
  currentBatch: any
  batchId: string = ''
  trainingId: string = ''

  constructor(
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private externalTrainingsSvc: ExternalTrainingsService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.getRoutingDetails()
  }

  getRoutingDetails() {
    this.trainingId = this.route.snapshot.params['id']
    this.batchId = this.route.snapshot.params['batchId']
    if (this.trainingId) {
      this.getTrainingDetails(this.trainingId)
    }
  }

  getTrainingDetails(id: string) {
    this.loaderService.changeLoaderState(true)
    this.isLoading = true
    this.externalTrainingsSvc.getExternalTrainingDetails(id).subscribe(
      (response: any) => {
        const event = _.get(response, 'result.event', {})
        const durationInSeconds = event.duration || 0
        const hours = durationInSeconds / 3600
        const learningHours = Number.isInteger(hours)
          ? `${hours} Hour${hours !== 1 ? 's' : ''}`
          : `${hours.toFixed(2)} Hours`

        this.training = {
          ...event,
          title: event.name,
          deliveryMode: event.eventType,
          learningHours,
          learningObjective: event.description,
          competency_v6: event.competencies_v6 || [],
        }
        this.batches = event.batches || []
        this.loaderService.changeLoaderState(false)
        this.isLoading = false
        if (this.batches.length > 0) {
          this.currentBatch = this.batches.find((batch: any) => batch.batchId === this.batchId)
        }
      }, error => {
        this.loaderService.changeLoaderState(false)
        this.isLoading = false
        console.error('Error fetching training details:', error)
      }
    )
  }

  navigateToExternalTrainings() {
    this.router.navigate(['/app/home/external-trainings'])
  }

  navigateToBatches() {
    this.router.navigate(['/app/home/external-trainings/', this.trainingId, 'batches'])
  }
}
