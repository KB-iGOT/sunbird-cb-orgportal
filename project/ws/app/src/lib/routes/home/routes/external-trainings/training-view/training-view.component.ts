import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { ExternalTrainingsService } from '../../../services/external-trainings.service'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'

@Component({
  selector: 'ws-app-training-view',
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss']
})
export class TrainingViewComponent implements OnInit, OnDestroy {
  trainingId: string = ''
  currentTab = 'details'
  trainingName: string = ''
  private routerSubscription: Subscription = new Subscription()
  private trainingNameSubscription: Subscription = new Subscription()

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private externalTrainingsSvc: ExternalTrainingsService,
  ) { }

  ngOnInit() {
    this.trainingId = this.route.snapshot.params['id'] || ''
    this.subscribeToTrainingName()
    this.subscribeToRouteChanges()
    this.updateActiveTab()
  }

  ngOnDestroy() {
    if (this.routerSubscription)
      this.routerSubscription.unsubscribe()
    if (this.trainingNameSubscription)
      this.trainingNameSubscription.unsubscribe()

  }

  subscribeToTrainingName(): void {
    this.trainingNameSubscription = this.externalTrainingsSvc.trainingName$.subscribe((name: string) => {
      this.trainingName = name
    })
  }

  subscribeToRouteChanges(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveTab()
    })
  }

  updateActiveTab() {
    const url = this.router.url
    if (url.endsWith('/batches')) {
      this.currentTab = 'batches'
    } else if (url.endsWith('/create-batch')) {
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
