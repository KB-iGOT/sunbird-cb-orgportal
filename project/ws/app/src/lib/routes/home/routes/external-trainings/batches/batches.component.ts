import { Component, OnInit } from '@angular/core'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { ActivatedRoute, Router } from '@angular/router'
import * as _ from 'lodash'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'
@Component({
  selector: 'ws-app-batches',
  templateUrl: './batches.component.html',
  styleUrls: ['./batches.component.scss'],
  standalone: false
})
export class BatchesComponent implements OnInit {
  batches: any[] = []
  training: any = {}
  isLoading = false
  durationInMinutes = 0
  constructor(private externalTrainingsSvc: ExternalTrainingsService,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.getRoutingDetails()
  }

  getRoutingDetails() {
    const id = this.route.parent?.snapshot.params['id']
    if (id) {
      this.getTrainingDetails(id)
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
        this.durationInMinutes = Math.round(durationInSeconds / 60)
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
        this.externalTrainingsSvc.setTrainingName(event.name || '')
        this.batches = event.batches || []
        this.loaderService.changeLoaderState(false)
        this.isLoading = false
      }, error => {
        this.loaderService.changeLoaderState(false)
        this.isLoading = false
        console.error('Error fetching training details:', error)
      }
    )
  }

  viewBatch(batch: any) {
    this.router.navigate([batch.batchId], { relativeTo: this.route })
  }
}
