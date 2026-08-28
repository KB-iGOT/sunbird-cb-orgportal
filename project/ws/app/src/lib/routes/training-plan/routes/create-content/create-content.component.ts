import { Component, EventEmitter, OnInit, Output, Input, OnChanges, SimpleChanges } from '@angular/core'
import { TrainingPlanDataSharingService } from './../../services/training-plan-data-share.service'
import { MatDialog } from '@angular/material/dialog'
// import { AddContentDialogComponent } from '../../components/add-content-dialog/add-content-dialog.component'
import { Router } from '@angular/router'
import { ConfirmationBoxComponent } from '../../components/confirmation-box/confirmation.box.component'
@Component({
    selector: 'ws-app-create-content',
    templateUrl: './create-content.component.html',
    styleUrls: ['./create-content.component.scss'],
    standalone: false
})
export class CreateContentComponent implements OnInit, OnChanges {
  @Output() addContentInvalid = new EventEmitter<any>()
  @Input() tabSelected: string = ''
  @Input() isLiveContent!: boolean

  categoryData: any[] = []
  contentData: any[] = []
  // Every content selected on the plan, the competency summary is built on the whole selection
  // and not only on the content of the page being shown
  selectedContentData: any[] = []
  from = 'content'
  selectedContentChips: any[] = []
  selectContentCount = 0
  pageIndex: any
  pageSize: any
  count = 0
  queryParams: any
  dialogRef: any
  /* tslint:disable */
  confirmationText: string = 'You have unsaved progress on your CBP plan. Clicking "Yes" will discard it and take you to request new content screen. Would you like to continue?'
  /* tslint:enable */
  isAparEnabled = false
  aparCheckboxDisabled = false
  constructor(private tpdsSvc: TrainingPlanDataSharingService, public dialog: MatDialog,
    //  private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.categoryData = [
      {
        id: 1,
        name: 'Courses',
        value: 'Course',
      },
      {
        id: 4,
        name: 'Curated Programs',
        value: 'Curated program',
      },
      // {
      //   id: 6,
      //   name: 'Programs',
      //   value: 'Program',
      // },
      {
        id: 3,
        name: 'Blended Programs',
        value: 'Blended program',
      },
      {
        id: 2,
        name: 'Standalone Assessments',
        value: 'Standalone Assessment',
      },
      {
        id: 5,
        name: 'Moderated Courses',
        value: 'Moderated Course',
      },
    ]
    // this.handleApiData(true)
    if (this.tpdsSvc.trainingPlanStepperData?.isApar) {
      this.isAparEnabled = this.tpdsSvc.trainingPlanStepperData.isApar
      this.aparCheckboxDisabled = this.tpdsSvc.trainingPlanStepperData.isApar
    } else {
      this.tpdsSvc.trainingPlanStepperData.isApar = this.isAparEnabled
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tabSelected'] && this.tabSelected === 'addContent') {
      if (this.tpdsSvc.trainingPlanContentData?.data?.content) {
        this.contentData = [...this.tpdsSvc.trainingPlanContentData.data.content]
      }
      this.handleSelectedChips(true)
    }
  }

  handleApiData(event: any) {
    if (event && this.tpdsSvc.trainingPlanContentData) {
      this.markSelectedContent()
      this.contentData = [...(this.tpdsSvc.trainingPlanContentData.data.content || [])]
      this.count = this.tpdsSvc.trainingPlanContentData.data.count
      this.handleSelectedChips(true)
    }
  }

  /**
   * The plan content list holds the ids of every selected content, whichever page they are on.
   * The content of the page currently shown is ticked from that list, so a content selected on
   * one page stays ticked when the user comes back to it.
   */
  private markSelectedContent() {
    const contentList = this.tpdsSvc.trainingPlanStepperData?.contentList || []
    const pageContent = this.tpdsSvc.trainingPlanContentData?.data?.content || []
    pageContent.forEach((sitem: any) => {
      if (sitem) {
        sitem['selected'] = contentList.indexOf(sitem.identifier) > -1
      }
    })
  }

  handleSelectedChips(event: any) {
    if (event) {
      this.markSelectedContent()
      this.selectedContentChips = [...(this.tpdsSvc.trainingPlanContentData?.data?.content || [])]
    }
    this.selectedContentData = [...(this.tpdsSvc.trainingPlanSelectedContent || [])]
    // Counted from the plan content list, the selection is not limited to the page being shown
    this.selectContentCount = (this.tpdsSvc.trainingPlanStepperData?.contentList || []).length
    if (this.selectContentCount <= 0) {
      this.addContentInvalid.emit(true)
    } else {
      this.addContentInvalid.emit(false)
    }
  }

  itemsRemovedFromChip() {
    this.handleSelectedChips(true)
    if (this.tpdsSvc.trainingPlanStepperData.status === 'Live') {
      this.tpdsSvc.isContentChanged = true
    }
  }

  // showAddContentDialog() {
  //   this.queryParams = {
  //     name: 'trainingPlan',
  //   }
  //   this.router.navigate(['/app/home/create-request-form'],{ queryParams: this.queryParams })
  //   // const dialogRef = this.dialog.open(AddContentDialogComponent, {
  //   //   maxHeight: 'auto',
  //   //   height: '60%',
  //   //   width: '60%',
  //   // })
  //   // dialogRef.afterClosed().subscribe((response: any) => {
  //   //   if (response) {
  //   //     if (response.data.responseCode === 'OK') {
  //   //       this.snackbar.open('Request shared successfully')
  //   //     } else {
  //   //       this.snackbar.open('Something went wrong please try again later!!')
  //   //     }
  //   //   }
  //   // })
  // }

  showAddContentDialog() {
    this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: {
        type: 'conformation',
        icon: 'radio_on',
        title: this.confirmationText,
        subTitle: '',
        primaryAction: 'Yes',
        secondaryAction: 'No',
      },
      autoFocus: false,
    })
    this.dialogRef.afterClosed().subscribe((_res: any) => {
      if (_res === 'confirmed') {
        this.router.navigate(['/app/home/create-request-form'])
      }
    })
  }

  onAparCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement
    this.isAparEnabled = target.checked
    this.tpdsSvc.trainingPlanStepperData.isApar = this.isAparEnabled
  }
}
