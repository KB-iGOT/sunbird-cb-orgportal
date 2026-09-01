import { Component, OnInit } from '@angular/core'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { MatDialog } from '@angular/material/dialog'
import { PreviewDialogBoxComponent } from '../../components/preview-dialog-box/preview-dialog-box.component'
/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */
@Component({
    selector: 'ws-app-create-timeline',
    templateUrl: './create-timeline.component.html',
    styleUrls: ['./create-timeline.component.scss'],
    standalone: false
})
export class CreateTimelineComponent implements OnInit {
  contentData: any[] = []
  assigneeData: any
  isContentLive = false
  dialogRef: any
  totalAssigneeCount: any = 0
  totalContentCount: any
  constructor(
    private tpdsSvc: TrainingPlanDataSharingService,
    public dialog: MatDialog) { }

  ngOnInit() {
    if (this.tpdsSvc.trainingPlanStepperData.status &&
      this.tpdsSvc.trainingPlanStepperData.status.toLowerCase() === 'live') {
      this.isContentLive = true
    }
    this.getContentData()
    switch (this.tpdsSvc.trainingPlanStepperData.assignmentType) {
      case 'Designation':
        this.getDesignationData()
        break
      case 'CustomUser':
        this.getCustomUserData()
        break
    }
  }

  /**
   * The content selected on the plan, read from the plan selection and not from the search results.
   * The search is never called when the user lands straight on this step, the selection is read
   * once when the plan is opened and kept in step with what the user ticks.
   */
  getContentData() {
    const contentIds = this.tpdsSvc.trainingPlanStepperData?.contentList || []
    const selectedContent = _.keyBy(this.tpdsSvc.trainingPlanSelectedContent || [], 'identifier')
    const contentDataSelected = contentIds
      .map((identifier: string) => selectedContent[identifier])
      .filter((content: any) => !!content)
    this.totalContentCount = contentDataSelected.length
    this.contentData = contentDataSelected.slice(0, 4)
  }

  getDesignationData() {
    if (this.tpdsSvc.trainingPlanAssigneeData &&
      this.tpdsSvc.trainingPlanAssigneeData.data &&
      this.tpdsSvc.trainingPlanAssigneeData.category === 'Designation'
    ) {
      const category = this.tpdsSvc.trainingPlanAssigneeData.category
      let assigneeDataSelected = this.tpdsSvc.trainingPlanAssigneeData.data.filter((item: any) => {
        return (item && item.selected) ? item.selected : false
      })
      this.totalAssigneeCount = assigneeDataSelected.length
      assigneeDataSelected = assigneeDataSelected.slice(0, 4)
      this.assigneeData = { category, data: assigneeDataSelected }
    }
  }

  getCustomUserData() {
    if (this.tpdsSvc.trainingPlanAssigneeData &&
      this.tpdsSvc.trainingPlanAssigneeData.data &&
      this.tpdsSvc.trainingPlanAssigneeData.category === 'CustomUser'
    ) {
      const category = this.tpdsSvc.trainingPlanAssigneeData.category
      let assigneeDataSelected = this.tpdsSvc.trainingPlanAssigneeData.data.filter((item: any) => {
        return (item && item.selected) ? item.selected : false
      })
      this.totalAssigneeCount = assigneeDataSelected.length
      assigneeDataSelected = assigneeDataSelected.slice(0, 4)
      this.assigneeData = { category, data: assigneeDataSelected }
    }
  }

  showAll(from: string) {
    this.dialogRef = this.dialog.open(PreviewDialogBoxComponent, {
      disableClose: true,
      data: {
        from,
      },
      autoFocus: false,
      width: '90%',
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.getContentData()
      switch (this.tpdsSvc.trainingPlanStepperData.assignmentType) {
        case 'Designation':
          this.getDesignationData()
          break
        case 'CustomUser':
          this.getCustomUserData()
          break
      }
    })
  }

  contentRemoved() {
    this.getContentData()
  }

  selectedUserRemoved() {
    switch (this.tpdsSvc.trainingPlanStepperData.assignmentType) {
      case 'Designation':
        this.getDesignationData()
        break
      case 'CustomUser':
        this.getCustomUserData()
        break
    }
  }

}
