import { Component, Input, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */
@Component({
    selector: 'ws-app-preview-plan',
    templateUrl: './preview-plan.component.html',
    styleUrls: ['./preview-plan.component.scss'],
    standalone: false
})
export class PreviewPlanComponent implements OnInit {
  @Input() form?: string

  contentList: any = []
  assigneeData: any = []
  tab: any = ''
  allContentChips: any = []
  selectedTab = ''
  showBackBtn = false
  navUrl: any
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tpdsSvc: TrainingPlanDataSharingService) { }

  ngOnInit() {
    // this.from = this.route.snapshot.queryParams['from']
    const contentData = this.route.snapshot.data['contentData']
    // Opened as a dialog from the stepper, the form asked for wins over the plan of the route
    if (this.form === 'content' || this.form === 'assignee') {
      this.showSelectionOfPlanBeingEdited()
      return
    }
    if (contentData) {
      this.showBackBtn = true
      this.navUrl = {
        url: ['app', 'home', 'training-plan-dashboard'],
        queryParams: {
          type: contentData.status,
          tabSelected: contentData.assignmentType,
        },
      }
      const category = contentData.assignmentType
      this.form = 'all'
      const arr = []
      this.tab = this.selectedTab = 'content'

      if (category && category === 'CustomUser') {
        const assignmentDataArr: any = []
        if (contentData && contentData.userDetails) {
          contentData.userDetails.map((item: any) => {
            const obj: any = {
              firstName: '',
              userId: '',
              profileDetails: {
                professionalDetails: [{ designation: '' }],
              },
            }
            obj.firstName = (item) ? item.firstName : ''
            obj.profileDetails.professionalDetails[0]['designation'] = (item) ? item.designation : ''
            assignmentDataArr.push(obj)
          })
          // const assigneeData = contentData.userDetails;
          this.assigneeData = { category, data: assignmentDataArr }
        }
      }
      if (category && category === 'Designation') {
        const assignmentDataArr: any = []
        contentData.assignmentTypeInfo.map((item: any) => {
          assignmentDataArr.push({ name: item })
        })
        this.assigneeData = { category, data: assignmentDataArr }
      }
      if (contentData &&
        contentData.contentList) {
        this.contentList = contentData.contentList
      }
      if (category && category?.toLowerCase() !== 'alluser') {
        arr.push({
          name: contentData.contentType,
          tab: 'content',
          selected: (this.tab === 'content' ? true : false),
          count: this.contentList.length,
        })
        arr.push({
          /* tslint:disable */
          name: contentData.assignmentType && contentData.assignmentType.toLowerCase() === 'customuser' ? 'Custom User' : contentData.assignmentType,
          /* tslint:enable */
          tab: 'assignee',
          selected: (this.tab === 'assignee' ? true : false),
          count: this.assigneeData.data ? this.assigneeData.data.length : 0,
        })
        this.allContentChips = arr
      } else {
        arr.push({
          name: contentData.contentType,
          tab: 'content',
          selected: (this.tab === 'content' ? true : false),
          count: this.contentList.length,
        })
        this.allContentChips = arr
      }
    }
  }

  /**
   * The content or the assignees picked so far on the plan being edited, shown in the dialog the
   * stepper opens from the selected items link.
   */
  private showSelectionOfPlanBeingEdited() {
    if (this.form === 'content') {
      this.getSelectedContent()
      return
    }
    if (this.tpdsSvc.trainingPlanAssigneeData) {
      const category = this.tpdsSvc.trainingPlanAssigneeData.category
      if (category === 'Designation' || category === 'CustomUser') {
        const assigneeData = this.tpdsSvc.trainingPlanAssigneeData.data.filter((item: any) => {
          return item.selected
        })
        this.assigneeData = { category, data: assigneeData }
      }
    }
  }

  /**
   * Content selected on the plan. It is read once when the plan is opened and kept in step with
   * what the user ticks, so opening the selected items does not call the search again.
   */
  getSelectedContent() {
    const contentIds = this.tpdsSvc.trainingPlanStepperData?.contentList || []
    const selectedContent = _.keyBy(this.tpdsSvc.trainingPlanSelectedContent || [], 'identifier')
    this.contentList = contentIds
      .map((identifier: string) => selectedContent[identifier])
      .filter((content: any) => !!content)
  }

  goBack() {
    this.router.navigate(this.navUrl.url, { queryParams: this.navUrl.queryParams })
  }

}
