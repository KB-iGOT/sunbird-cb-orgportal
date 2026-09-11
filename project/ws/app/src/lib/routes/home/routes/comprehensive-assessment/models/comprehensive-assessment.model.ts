/**
 * Content categories used while creating the "Comprehensive assessment" collection.
 * The collection itself is created as a `Standalone Assessment` content, the
 * question set built in step 2 is created as a `Course Assessment` question set.
 */
export const CONTENT_PRIMARY_CATEGORY = 'Standalone Assessment'
export const CONTENT_COURSE_CATEGORY = 'Standalone Assessment'
export const COLLECTION_MIME_TYPE = 'application/vnd.ekstep.content-collection'
export const QUESTIONSET_MIME_TYPE = 'application/vnd.sunbird.questionset'
export const QUESTIONSET_PRIMARY_CATEGORY = 'Course Assessment'
export const DEFAULT_ACCESS_SETTING = 'allUsers'
export const DEFAULT_FRAMEWORK = 'igot'
export const DEFAULT_LICENSE = 'CC BY 4.0'

export const noSpecialCharAssessment = new RegExp(
  /^[ऀ-ॿঀ-৿ఀ-౿஀-௿ಀ-೿ഀ-ൿ઀-૿଀-୿਀-੿a-zA-Z0-9\(\)\$\[\]\.\-,:!'\" _\/]*$/ // NOSONAR
)

export namespace comprehensiveAssessment {
  /** Config contract expected by `sb-uic-assessment-main` of `@sunbird-cb/consumption` */
  export interface IAssessmentConfig {
    identifier: string
    primaryCategory: string
    contextCategory: string
    isReadOnly: boolean
  }

  export const IMAGE_MAX_SIZE = (500 * 1024)
  export const NAME_MIN_LENGTH = 10
  export const NAME_MAX_LENGTH = 70
  export const DESCRIPTION_MIN_LENGTH = 250
  export const DESCRIPTION_MAX_LENGTH = 500
  export const LEARNING_OUTCOME_MAX_LENGTH = 500
}

export namespace comprehensiveAssessmentList {
  /** Status values the listing tabs map onto, as indexed by the composite search. */
  export const STATUS_LIVE = 'Live'
  export const STATUS_DRAFT = 'Draft'
  export const DEFAULT_PAGE_SIZE = 20

  /** Where the window end sits on an assessment row, it is the linked plan's end date. */
  export const WINDOW_END_KEY = 'aparPlanEndDate'
  export const WINDOW_CLOSED_MESSAGE =
    'The assessment window of the linked APAR plan has ended, this assessment can no longer be published'

  export interface columnData {
    displayName: string
    key: string
    cellType: string
    imageKey?: string
    cellClass?: string
  }

  export interface tableData {
    columns: columnData[]
    showSearchBox: boolean
    showPagination: boolean
    noDataMessage?: string
  }

  export interface pagination {
    startIndex: number
    lastIndex: number
    pageSize: number
    pageIndex: number
    totalCount: number
  }

  export interface menuItems {
    icon?: string
    btnText: string
    action: string
  }

  /** Fields the listing needs back from the search, everything else is dropped by the api. */
  export const SEARCH_FIELDS = [
    'name',
    'appIcon',
    'posterImage',
    'status',
    'primaryCategory',
    'courseCategory',
    'contentType',
    'mimeType',
    'duration',
    'creator',
    'createdBy',
    'createdFor',
    'createdOn',
    'lastUpdatedOn',
    'lastPublishedOn',
    'versionKey',
    // the linked plan and everything derived from it, the dashboard lists all three
    'aparPlanName',
    'aparYear',
    'aparPlanEndDate',
  ]
}

export namespace aparPlan {
  /**
   * Keys the linked plan is written to on the assessment collection. Everything the
   * assessment derives (reporting year, window, owning MDO, access criteria, unlock rule)
   * is read back off these, so a rename only has to happen here.
   */
  export const METADATA = {
    planId: 'aparPlanId',
    planName: 'aparPlanName',
    reportingYear: 'aparYear',
    windowEndDate: 'aparPlanEndDate',
    owningOrg: 'aparPlanOrgName',
    gatingCourseCount: 'aparGatingCourseCount',
  }

  export const PAGE_SIZE = 20
  /** Value the reporting year filter carries while it is not narrowed to one year. */
  export const ALL_YEARS = 'all'

  /** A Live APAR plan, flattened off the cbplan search row for the picker table. */
  export interface IPlanRow {
    id: string
    name: string
    planYear: string
    endDate: string
    endDateDisplay: string
    orgName: string
    gatingCourseCount: number
    /** A Live assessment already points at this plan, so it cannot be linked again. */
    hasActiveAssessment: boolean
    /** The reporting year is closed, so no new assessment can be linked to this plan. */
    isYearClosed: boolean
  }

  /** What is kept on the assessment once a plan is linked, the source of every derived value. */
  export interface ILinkedPlan {
    id: string
    name: string
    planYear: string
    endDate: string
    orgName: string
    gatingCourseCount: number
  }
}
