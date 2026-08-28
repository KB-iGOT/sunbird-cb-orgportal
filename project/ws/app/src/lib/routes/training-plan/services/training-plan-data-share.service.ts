import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanDataSharingService {
  clearFilter = new Subject()
  trainingPlanCategoryChangeEvent = new Subject()
  isContentChanged = false
  moderatedCourseSelectStatus = new Subject()
  handleContentPageChange = new Subject()
  filterToggle = new Subject()
  getFilterDataObject = new Subject()
  trainingPlanTitle = ''
  trainingPlanContentData: any
  // Complete content of every content selected on the plan, whichever page it was picked from.
  // Read once for the content already on the plan, then kept in step with what the user ticks.
  trainingPlanSelectedContent: any[] = []
  trainingPlanAssigneeData: any
  selectedTabType: any = ''
  currentUserDepartment = ''
  trainingPlanStepperData: any = {
    name: '',
    contentType: '',
    contentList: [
    ],
    assignmentType: '',
    assignmentTypeInfo: [
    ],
    endDate: '',
    accessControl: null
  }
  constructor() {

  }

  /** Adds the content to the selection, the complete content is kept for the summary and the dialog */
  addSelectedContent(content: any) {
    if (!content || !content.identifier) {
      return
    }
    const alreadySelected = this.trainingPlanSelectedContent
      .some((item: any) => item && item.identifier === content.identifier)
    if (!alreadySelected) {
      this.trainingPlanSelectedContent.push({ ...content, selected: true })
    }
  }

  /** Drops the content from the selection */
  removeSelectedContent(identifier: string) {
    this.trainingPlanSelectedContent = this.trainingPlanSelectedContent
      .filter((item: any) => item && item.identifier !== identifier)
  }

  resetAllObjects() {
    this.trainingPlanTitle = ''
    this.trainingPlanContentData = {}
    this.trainingPlanSelectedContent = []
    this.trainingPlanAssigneeData = {}
    this.selectedTabType = ''
    this.trainingPlanStepperData = {
      name: '',
      contentType: '',
      contentList: [
      ],
      assignmentType: '',
      assignmentTypeInfo: [
      ],
      endDate: '',
      accessControl: null
    }
  }
}
