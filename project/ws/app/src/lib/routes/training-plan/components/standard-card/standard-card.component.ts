import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef, ViewChild, AfterViewChecked } from '@angular/core'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { SafeUrl } from '@angular/platform-browser'

@Component({
    selector: 'ws-app-standard-card',
    templateUrl: './standard-card.component.html',
    styleUrls: ['./standard-card.component.scss'],
    standalone: false
})
export class StandardCardComponent implements OnInit, AfterViewChecked {
  @Input() cardSize: any
  @Input() checkboxVisibility: any = true
  @Input() contentData: any[] = []
  @Input() showDeleteFlag = false
  @Input() showPagination = false
  @Input() count = 0
  @Output() handleSelectedChips = new EventEmitter()
  @Output() selectedContentRemoved = new EventEmitter<any>()
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | any
  dataSource: any
  selectedContent: any[] = []
  startIndex = 0
  lastIndex = 20
  pageSize = 20
  defaultPosterImage: SafeUrl | null = '/assets/instances/eagle/app_logos/default.png'
  defaultThumbnail: SafeUrl | null = 'assets/instances/eagle/app_logos/KarmayogiBharat_Logo.svg'
  multilingualCourses = 'Multilingual Course'
  constructor(
    private tpdsSvc: TrainingPlanDataSharingService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.tpdsSvc.clearFilter.subscribe(() => {
      this.resetPageIndex()
    })
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges()
  }

  onChangePage(pe: PageEvent) {
    this.startIndex = (pe.pageIndex) * pe.pageSize
    this.lastIndex = pe.pageSize
    this.tpdsSvc.handleContentPageChange.next({ pageIndex: this.startIndex, pageSize: pe.pageSize })
  }

  selectContentItem(event: any, item: any) {
    if (!this.tpdsSvc.trainingPlanContentData) {
      this.tpdsSvc.trainingPlanContentData = { data: { content: [] } }
    }
    if (!this.tpdsSvc.trainingPlanStepperData['contentList']) {
      this.tpdsSvc.trainingPlanStepperData['contentList'] = []
    }

    if (event.checked) {
      const contentItem = this.contentData.find(sitem => sitem.identifier === item.identifier)
      if (contentItem) {
        contentItem['selected'] = true
      }

      const serviceIndex = this.tpdsSvc.trainingPlanContentData.data.content
        .findIndex((sitem: any) => sitem.identifier === item.identifier)

      if (serviceIndex !== -1) {
        const sitem = this.tpdsSvc.trainingPlanContentData.data.content[serviceIndex]
        sitem['selected'] = true
        this.tpdsSvc.trainingPlanContentData.data.content.splice(serviceIndex, 1)
        this.tpdsSvc.trainingPlanContentData.data.content.unshift(sitem)
        this.tpdsSvc.trainingPlanStepperData['contentList'].push(item.identifier)
      }

    } else {
      // this.selectedContent = this.selectedContent.filter( sitem  => sitem.identifier !== item.identifier)
      this.tpdsSvc.trainingPlanContentData.data.content.map((sitem: any) => {
        if (sitem.identifier === item.identifier) {
          sitem['selected'] = false
        }
      })
      this.tpdsSvc.trainingPlanStepperData['contentList'].filter((identifier: any, index: any) => {
        if (identifier === item.identifier) {
          this.tpdsSvc.trainingPlanStepperData['contentList'].splice(index, 1)
        }
      })
    }
    this.handleSelectedChips.emit(true)
  }

  deleteItem(item: any) {
    this.tpdsSvc.trainingPlanContentData.data.content.map((sitem: any) => {
      if (sitem.identifier === item.identifier) {
        sitem['selected'] = false
      }
    })
    this.contentData.filter((sitem: any, index: any) => { //NOSONAR
      if (sitem.identifier === item.identifier) {
        this.contentData.splice(index, 1)
      }
    })
    this.tpdsSvc.trainingPlanStepperData['contentList'].filter((identifier: any, index: any) => {
      if (identifier === item.identifier) {
        this.tpdsSvc.trainingPlanStepperData['contentList'].splice(index, 1)
      }
    })
    this.selectedContentRemoved.emit(true)
  }

  resetPageIndex() {
    this.startIndex = 0
    this.lastIndex = 20
    this.pageSize = 20
    if (this.paginator) {
      this.paginator.pageIndex = 0
      this.paginator.pageSize = 20
    }

  }

}
