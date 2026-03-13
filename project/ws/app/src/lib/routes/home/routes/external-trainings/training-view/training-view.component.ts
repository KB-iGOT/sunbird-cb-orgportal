import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'

@Component({
  selector: 'ws-app-training-view',
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss']
})
export class TrainingViewComponent implements OnInit {
  trainingId: string = ''
  currentTab = 'details'
  trainingName: string = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private externalTrainingsSvc: ExternalTrainingsService,
  ) { }

  ngOnInit() {
    this.trainingId = this.route.snapshot.params['id'] || ''
    this.updateActiveTab()
    this.subscribeToTrainingName()
  }

  subscribeToTrainingName(): void {
    this.externalTrainingsSvc.trainingName$.subscribe((name: string) => {
      this.trainingName = name
    })
  }

  updateActiveTab() {
    const url = this.router.url
    if (url.endsWith('/batches')) {
      this.currentTab = 'batches'
    } else if (url.endsWith('/create-batch')) {
      this.createBatch()
      this.currentTab = 'create-batch'
    } else {
      this.currentTab = 'details'
    }
  }

  navigateToExternalTrainings() {
    this.router.navigate(['/app/home/external-trainings'])
  }

  onTabChange(tab: string) {
    this.currentTab = tab
    this.router.navigate([tab], { relativeTo: this.route })
  }

  createBatch() {
    this.currentTab = 'create-batch'
    this.router.navigate(['create-batch'], { relativeTo: this.route })
  }
}
