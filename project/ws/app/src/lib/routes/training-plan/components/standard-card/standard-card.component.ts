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

  /**
   * On the selection grid a content is selected when its id is on the plan content list, whatever
   * page it is shown on. A read only list (preview, selected items dialog) shows what it was given.
   */
  isSelected(item: any): boolean {
    if (!item || !item.identifier) {
      return false
    }
    if (!this.checkboxVisibility) {
      return !!item.selected
    }
    const contentList = this.tpdsSvc.trainingPlanStepperData?.['contentList'] || []
    return contentList.indexOf(item.identifier) > -1
  }

  selectContentItem(event: any, item: any) {
    if (!this.tpdsSvc.trainingPlanStepperData['contentList']) {
      this.tpdsSvc.trainingPlanStepperData['contentList'] = []
    }
    if (this.tpdsSvc.trainingPlanStepperData.status === 'Live') {
      this.tpdsSvc.isContentChanged = true
    }
    if (event.checked) {
      this.addToContentList(item)
    } else {
      this.removeFromContentList(item)
    }
    this.markItem(item, event.checked)
    this.handleSelectedChips.emit(true)
  }

  deleteItem(item: any) {
    if (this.tpdsSvc.trainingPlanStepperData.status === 'Live') {
      this.tpdsSvc.isContentChanged = true
    }
    this.removeFromContentList(item)
    this.markItem(item, false)
    this.contentData.filter((sitem: any, index: any) => { //NOSONAR
      if (sitem.identifier === item.identifier) {
        this.contentData.splice(index, 1)
      }
    })
    this.selectedContentRemoved.emit(true)
  }

  private addToContentList(item: any) {
    const contentList = this.tpdsSvc.trainingPlanStepperData['contentList']
    if (contentList.indexOf(item.identifier) === -1) {
      contentList.push(item.identifier)
    }
    this.tpdsSvc.addSelectedContent(item)
  }

  private removeFromContentList(item: any) {
    const contentList = this.tpdsSvc.trainingPlanStepperData['contentList'] || []
    const index = contentList.indexOf(item.identifier)
    if (index > -1) {
      contentList.splice(index, 1)
    }
    this.tpdsSvc.removeSelectedContent(item.identifier)
  }

  /** Keeps the shown content in step with the plan content list, used by the competency summary */
  private markItem(item: any, selected: boolean) {
    const shownItem = this.contentData.find((sitem: any) => sitem && sitem.identifier === item.identifier)
    if (shownItem) {
      shownItem['selected'] = selected
    }
    const pageContent = this.tpdsSvc.trainingPlanContentData?.data?.content || []
    pageContent.forEach((sitem: any) => {
      if (sitem && sitem.identifier === item.identifier) {
        sitem['selected'] = selected
      }
    })
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
