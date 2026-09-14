import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

/** One entry of the plan content list, as it is sent to the create / update plan API */
export interface ITrainingPlanContent {
  identifier: string
  /** Set when the content gates the CA, the Karmayogi has to complete it */
  mandatory: boolean
}

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
  // Position of every content of the plan by its id. The selection grid asks whether a content is
  // selected for every card it draws, on every change detection run, so that lookup is kept O(1)
  // instead of walking the content list each time
  private contentIndex = new Map<string, number>()
  private contentIndexSource: any = null
  trainingPlanStepperData: any = {
    name: '',
    contentType: '',
    // One { identifier, mandatory } entry per selected content, the shape the API expects
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

  /**
   * The plan content list holds a { identifier, mandatory } entry per selected content. Reading it
   * through these helpers keeps that shape in one place, older plans stored plain content ids and
   * are still read here.
   */
  getContentList(): ITrainingPlanContent[] {
    return this.trainingPlanStepperData['contentList'] || []
  }

  /** Ids of the content selected on the plan, in the order they are held on the plan */
  getContentIdentifiers(): string[] {
    return this.getContentList()
      .map((item: any) => this.readIdentifier(item))
      .filter((identifier: any) => !!identifier)
  }

  /**
   * The complete content selected on the plan, in the order it is held on the plan. Built from the
   * selection and not from a page of search results, so content picked on an earlier page, or
   * under a search that has since been changed, is still listed.
   */
  getSelectedContentInPlanOrder(): any[] {
    const selectedContent = new Map<string, any>()
    ;(this.trainingPlanSelectedContent || []).forEach((item: any) => {
      if (item && item.identifier) {
        selectedContent.set(item.identifier, item)
      }
    })
    return this.getContentIdentifiers()
      .map((identifier: string) => selectedContent.get(identifier))
      .filter((content: any) => !!content)
  }

  isContentSelected(identifier: string): boolean {
    return this.findContentIndex(identifier) > -1
  }

  addContentToPlan(identifier: string, mandatory = false) {
    if (!identifier) {
      return
    }
    if (!this.trainingPlanStepperData['contentList']) {
      this.trainingPlanStepperData['contentList'] = []
    }
    if (!this.isContentSelected(identifier)) {
      this.trainingPlanStepperData['contentList'].push({ identifier, mandatory: !!mandatory })
      this.invalidateContentIndex()
    }
  }

  /** Drops the content from the plan, the mandatory flag goes with it */
  removeContentFromPlan(identifier: string) {
    const index = this.findContentIndex(identifier)
    if (index > -1) {
      this.trainingPlanStepperData['contentList'].splice(index, 1)
      this.invalidateContentIndex()
    }
  }

  /** Marks the content as gating the CA, or drops that flag */
  setContentMandatory(identifier: string, mandatory: boolean) {
    const index = this.findContentIndex(identifier)
    if (index > -1) {
      const contentList = this.trainingPlanStepperData['contentList']
      contentList[index] = { ...this.normalizeContent(contentList[index]), mandatory: !!mandatory }
    }
  }

  isContentMandatory(identifier: string): boolean {
    const index = this.findContentIndex(identifier)
    if (index === -1) {
      return false
    }
    return !!this.normalizeContent(this.trainingPlanStepperData['contentList'][index]).mandatory
  }

  /**
   * Drops the gating flag from every content of the plan. The flag only means something on an
   * APAR plan — it is the set the comprehensive assessment unlock is derived from — so turning
   * APAR off has to clear it, otherwise the plan would be saved still carrying mandatory
   * content that nothing in the UI shows any more.
   * The entries are rewritten in place, the content list keeps its identity and its order.
   */
  clearMandatoryContent() {
    const contentList = this.trainingPlanStepperData['contentList'] || []
    contentList.forEach((item: any, index: number) => {
      contentList[index] = { ...this.normalizeContent(item), mandatory: false }
    })
  }

  getMandatoryContentCount(): number {
    return this.getContentList()
      .filter((item: any) => !!this.normalizeContent(item).mandatory).length
  }

  /** The content list as the create / update plan API expects it */
  buildContentListPayload(contentList: any[]): ITrainingPlanContent[] {
    return (contentList || [])
      .map((item: any) => this.normalizeContent(item))
      .filter((item: ITrainingPlanContent) => !!item.identifier)
  }

  /** A plan content entry, whichever of the two stored shapes it came in as */
  normalizeContent(item: any): ITrainingPlanContent {
    return {
      identifier: this.readIdentifier(item),
      mandatory: (typeof item === 'string') ? false : !!(item && item.mandatory),
    }
  }

  private readIdentifier(item: any): string {
    if (typeof item === 'string') {
      return item
    }
    return (item && item.identifier) ? item.identifier : ''
  }

  private findContentIndex(identifier: string): number {
    if (!identifier) {
      return -1
    }
    const index = this.buildContentIndex().get(identifier)
    return (index === undefined) ? -1 : index
  }

  /**
   * The index is rebuilt when the content list is replaced from the outside, when its length no
   * longer matches, or when one of the methods above changed it.
   */
  private buildContentIndex(): Map<string, number> {
    const contentList = this.getContentList()
    if (this.contentIndexSource === contentList && this.contentIndex.size === contentList.length) {
      return this.contentIndex
    }
    this.contentIndex = new Map<string, number>()
    contentList.forEach((item: any, index: number) => {
      const identifier = this.readIdentifier(item)
      if (identifier) {
        this.contentIndex.set(identifier, index)
      }
    })
    this.contentIndexSource = contentList
    return this.contentIndex
  }

  private invalidateContentIndex() {
    this.contentIndexSource = null
  }

  resetAllObjects() {
    this.invalidateContentIndex()
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
