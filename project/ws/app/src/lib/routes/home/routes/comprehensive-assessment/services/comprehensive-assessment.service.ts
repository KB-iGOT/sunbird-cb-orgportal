import { DatePipe } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of, throwError } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import * as _ from 'lodash'
import { environment } from '../../../../../../../../../../src/environments/environment'
import {
  COLLECTION_MIME_TYPE, CONTENT_COURSE_CATEGORY, CONTENT_PRIMARY_CATEGORY, DEFAULT_ACCESS_SETTING,
  DEFAULT_FRAMEWORK, DEFAULT_LICENSE, QUESTIONSET_MIME_TYPE, aparPlan, comprehensiveAssessmentList,
} from '../models/comprehensive-assessment.model'

const API_END_POINTS = {
  CREATE_CONTENT: 'apis/proxies/v8/action/content/v3/create',
  UPLOAD_CONTENT: 'apis/proxies/v8/upload/action/content/v3/upload',
  CONTENT_HIERARCHY_EDIT: (contentId: string) => `apis/proxies/v8/action/content/v3/hierarchy/${contentId}?mode=edit`,
  UPDATE_CONTENT: (contentId: string) => `apis/proxies/v8/action/content/v3/update/${contentId}`,
  CONTENT_HIERARCHY_UPDATE: 'apis/proxies/v8/action/content/v3/hierarchy/update',
  QUESTIONSET_HIERARCHY_EDIT: (questionSetId: string) => `apis/proxies/v8/questionset/v1/hierarchy/${questionSetId}?mode=edit`,
  CONTENT_SEARCH: 'apis/proxies/v8/sunbirdigot/v4/search',
  PUBLISH_CONTENT: (contentId: string) => `apis/proxies/v8/action/content/v3/publish/${contentId}`,
  RETIRE_CONTENT: (contentId: string) => `apis/proxies/v8/action/content/v3/retire/${contentId}`,
  APAR_PLAN_SEARCH: 'apis/proxies/v8/cbplan/v3/search',
}

const STORAGE_URL_TO_REPLACE = 'https://storage.googleapis.com/igot'

@Injectable()
export class ComprehensiveAssessmentService {

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  //#region (content apis)

  createContent(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CREATE_CONTENT, req)
  }

  uploadContent(contentId: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.UPLOAD_CONTENT}/${contentId}`, formData)
  }

  getContentHierarchy(contentId: string): Observable<any> {
    return this.http.get<any>(API_END_POINTS.CONTENT_HIERARCHY_EDIT(contentId))
  }

  updateContent(contentId: string, content: any): Observable<any> {
    return this.http.patch<any>(API_END_POINTS.UPDATE_CONTENT(contentId), { request: { content } })
  }

  /**
   * Links the question set built in step 2 as a child of the assessment collection so that
   * re-opening a draft (and the step 3 preview) can find it back from the content hierarchy.
   */
  linkAssessmentToCollection(collection: any, assessmentId: string): Observable<any> {
    const rootId = _.get(collection, 'identifier', '')
    const existingChildren: string[] = _.map(_.get(collection, 'children', []), (child: any) => child.identifier)
    const children = _.uniq([...existingChildren, assessmentId])
    const requestBody = {
      request: {
        data: {
          nodesModified: {
            [rootId]: {
              isNew: false,
              root: true,
              metadata: {},
            },
          },
          hierarchy: {
            [rootId]: {
              children,
              name: _.get(collection, 'name', ''),
              contentType: _.get(collection, 'contentType', 'Collection'),
              primaryCategory: _.get(collection, 'primaryCategory', CONTENT_PRIMARY_CATEGORY),
              root: true,
            },
          },
        },
      },
    }
    return this.http.patch<any>(API_END_POINTS.CONTENT_HIERARCHY_UPDATE, requestBody)
  }

  /**
   * Lists the org's comprehensive assessments for one status tab. The collection and the
   * question set built inside it are indexed separately, so the collection mimeType filter
   * is what keeps the linked question sets out of the listing.
   */
  searchAssessments(params: {
    status: string,
    rootOrgId: string,
    query: string,
    pageSize: number,
    pageIndex: number
  }): Observable<{ content: any[], count: number }> {
    const request = {
      locale: ['en'],
      request: {
        // a search always restarts at the first page, the offset belongs to the browsed list
        query: params.query || '',
        limit: params.pageSize,
        offset: params.query ? 0 : params.pageSize * params.pageIndex,
        fields: comprehensiveAssessmentList.SEARCH_FIELDS,
        filters: {
          status: [params.status],
          courseCategory: [CONTENT_COURSE_CATEGORY],
          mimeType: [COLLECTION_MIME_TYPE],
          createdFor: [params.rootOrgId],
        },
        sort_by: { lastUpdatedOn: 'desc' },
      },
    }

    return this.http.post<any>(API_END_POINTS.CONTENT_SEARCH, request).pipe(
      map((res: any) => ({
        content: _.map(_.get(res, 'result.content', []), (row: any) => this.toListRow(row)),
        count: _.get(res, 'result.count', 0),
      }))
    )
  }

  /** Moves a draft collection to Live. */
  publishAssessment(contentId: string, userId: string): Observable<any> {
    return this.http.post<any>(API_END_POINTS.PUBLISH_CONTENT(contentId), {
      request: { content: { lastPublishedBy: userId } },
    })
  }

  /** Retire is the delete the content api offers, the row leaves every status tab. */
  retireAssessment(contentId: string): Observable<any> {
    return this.http.delete<any>(API_END_POINTS.RETIRE_CONTENT(contentId))
  }

  //#endregion

  //#region (question set apis)

  getQuestionSetHierarchy(questionSetId: string): Observable<any> {
    return this.http.get<any>(API_END_POINTS.QUESTIONSET_HIERARCHY_EDIT(questionSetId)).pipe(
      map((response: any) => _.get(response, 'result.questionSet', {}))
    )
  }

  //#endregion

  //#region (apar plan apis)

  /**
   * Live APAR plans of the org, one page at a time. `isApar` is not a filter the search
   * accepts, so plans with APAR assignment off are dropped here instead: the count stays the
   * one the api reports, a page can therefore render fewer rows than the paginator counts.
   *
   * Only an explicit `false` drops a plan. A row carrying no `isApar` at all is a field the
   * search did not project, not a plan with the toggle off, and dropping those would empty
   * the picker against an api that is otherwise answering correctly.
   */
  searchAparPlans(params: {
    rootOrgId: string,
    planYear: string,
    searchString: string,
    pageIndex: number,
    pageSize: number
  }): Observable<{ plans: aparPlan.IPlanRow[], count: number }> {
    const filter: any = {
      status: [comprehensiveAssessmentList.STATUS_LIVE],
      orgIdList: [params.rootOrgId],
        "isApar": true
    }
    if (params.planYear && params.planYear !== aparPlan.ALL_YEARS) {
      filter.planYear = params.planYear
    }

    const request: any = {
      filter,
      pageNumber: params.pageIndex,
      pageSize: params.pageSize,
      searchString: params.searchString || '',
    }
    // the api orders by relevance while a search is on, the browsed list by newest first
    if (!params.searchString) {
      request.orderBy = 'createdAt'
      request.orderDirection = 'desc'
    }

    return this.http.post<any>(API_END_POINTS.APAR_PLAN_SEARCH, request).pipe(
      map((res: any) => ({
        plans: _.map(
          _.filter(_.get(res, 'result.result.data', []), (plan: any) => _.get(plan, 'isApar') !== false),
          (plan: any) => this.toPlanRow(plan)
        ),
        count: _.get(res, 'result.result.totalCount', 0),
      }))
    )
  }

  /**
   * Plans a Live assessment already points at. Two drafts may share a plan and only one of
   * them can be published, so only the Live tab is read. The plan id has to be indexed for
   * the search to return it: until it is, this resolves empty and no row is flagged, which
   * leaves the publish time guard as the only check.
   */
  getPlanIdsWithLiveAssessment(rootOrgId: string): Observable<string[]> {
    const request = {
      locale: ['en'],
      request: {
        query: '',
        limit: 200,
        offset: 0,
        fields: ['identifier', aparPlan.METADATA.planId],
        filters: {
          status: [comprehensiveAssessmentList.STATUS_LIVE],
          courseCategory: [CONTENT_COURSE_CATEGORY],
          mimeType: [COLLECTION_MIME_TYPE],
          createdFor: [rootOrgId],
        },
      },
    }

    return this.http.post<any>(API_END_POINTS.CONTENT_SEARCH, request).pipe(
      map((res: any) => _.compact(_.map(
        _.get(res, 'result.content', []),
        (row: any) => _.get(row, aparPlan.METADATA.planId, '')
      ))),
      catchError(() => of([]))
    )
  }

  /** Shapes a cbplan search row into the row the picker table renders. */
  private toPlanRow(plan: any): aparPlan.IPlanRow {
    const endDate = _.get(plan, 'endDate', '')
    return {
      endDate,
      id: _.get(plan, 'id', ''),
      name: _.get(plan, 'name', ''),
      planYear: _.get(plan, 'planYear', ''),
      endDateDisplay: this.toDisplayDate(endDate),
      orgName: _.get(plan, 'orgName', '') || _.get(plan, 'departmentName', ''),
      gatingCourseCount: this.countGatingCourses(plan),
      // both flags are the picker's to work out, the search knows neither
      hasActiveAssessment: false,
      isYearClosed: false,
    }
  }

  /** Courses the plan marks mandatory, the gating set the assessment unlock is derived from. */
  private countGatingCourses(plan: any): number {
    return _.filter(_.get(plan, 'contentList', []), (content: any) => !!_.get(content, 'mandatory')).length
  }

  /** The linked plan as it is written onto the assessment content. */
  buildPlanMetadata(plan: aparPlan.ILinkedPlan | null): any {
    return {
      [aparPlan.METADATA.planId]: _.get(plan, 'id', ''),
      [aparPlan.METADATA.planName]: _.get(plan, 'name', ''),
      [aparPlan.METADATA.reportingYear]: _.get(plan, 'planYear', ''),
      [aparPlan.METADATA.windowEndDate]: _.get(plan, 'endDate', ''),
      [aparPlan.METADATA.owningOrg]: _.get(plan, 'orgName', ''),
      // the content schema types the numeric extras as String, a number fails validation
      [aparPlan.METADATA.gatingCourseCount]: String(_.get(plan, 'gatingCourseCount', 0)),
    }
  }

  /** The linked plan read back off a saved assessment, null while none is linked. */
  readPlanMetadata(content: any): aparPlan.ILinkedPlan | null {
    const id = _.get(content, aparPlan.METADATA.planId, '')
    if (!id) {
      return null
    }
    return {
      id,
      name: _.get(content, aparPlan.METADATA.planName, ''),
      planYear: _.get(content, aparPlan.METADATA.reportingYear, ''),
      endDate: _.get(content, aparPlan.METADATA.windowEndDate, ''),
      orgName: _.get(content, aparPlan.METADATA.owningOrg, ''),
      gatingCourseCount: Number(_.get(content, aparPlan.METADATA.gatingCourseCount, 0)) || 0,
    }
  }

  //#endregion

  //#region (helpers)

  /** Shapes a search hit into the flat, display ready row the listing table renders. */
  private toListRow(row: any): any {
    return {
      ...row,
      createdOn: this.toDisplayDate(_.get(row, 'createdOn')),
      lastUpdatedOn: this.toDisplayDate(_.get(row, 'lastUpdatedOn')),
      lastPublishedOn: this.toDisplayDate(_.get(row, 'lastPublishedOn')),
      creator: _.get(row, 'creator', '') || '-',
      durationDisplay: this.toDisplayDuration(Number(_.get(row, 'duration', 0)) || 0),
      // The plan and everything derived from it are read off the assessment rather than
      // fetched again, they are written onto it when the plan is linked
      planName: _.get(row, aparPlan.METADATA.planName, '') || '-',
      reportingYear: _.get(row, aparPlan.METADATA.reportingYear, '') || '-',
      assessmentWindow: this.toDisplayDate(_.get(row, aparPlan.METADATA.windowEndDate)) || '-',
    }
  }

  /**
   * The assessment window is the linked plan's, and the plan is the only place it can be
   * corrected — so a window that has already ended blocks publishing rather than asking the
   * admin to change a date the assessment does not own.
   */
  isWindowOpen(endDate: any): boolean {
    if (!endDate) {
      return false
    }
    const windowEnd = new Date(endDate).getTime()
    if (Number.isNaN(windowEnd)) {
      return false
    }
    return windowEnd >= Date.now()
  }

  private toDisplayDate(value: any): string {
    return value ? (this.datePipe.transform(value, 'dd MMM, yyyy') || '') : ''
  }

  /** Same hr/min shape the basic details step shows, the api stores duration in seconds. */
  private toDisplayDuration(duration: number): string {
    if (!duration || duration <= 0) {
      return '-'
    }
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const parts: string[] = []
    if (hours > 0) {
      parts.push(`${hours} hr`)
    }
    if (minutes > 0) {
      parts.push(`${minutes} min`)
    }
    return parts.length ? parts.join(' ') : `${Math.floor(duration)} sec`
  }

  /**
   * Creates an `Asset` content for the picked image, uploads the file against it and
   * resolves with the public artifact url to be used as appIcon / posterImage.
   */
  uploadImageAsset(file: File, userProfile: any): Observable<string> {
    const request = {
      request: {
        content: {
          code: this.generateCode(),
          contentType: 'Asset',
          createdBy: _.get(userProfile, 'userId', ''),
          creator: _.get(userProfile, 'userName', ''),
          mimeType: file.type,
          mediaType: 'image',
          name: file.name,
          language: ['English'],
          license: DEFAULT_LICENSE,
          primaryCategory: 'Asset',
          organisation: [_.get(userProfile, 'departmentName', '')],
          createdFor: [_.get(userProfile, 'rootOrgId', '')],
        },
      },
    }

    return this.createContent(request).pipe(
      mergeMap((res: any) => {
        const contentId = _.get(res, 'result.identifier', '')
        if (!contentId) {
          return throwError(() => new Error('Something went wrong while creating the image asset'))
        }
        const formData: FormData = new FormData()
        formData.append('data', file)
        return this.uploadContent(contentId, formData).pipe(
          map((fdata: any) => this.toPublicUrl(_.get(fdata, 'result.artifactUrl', '')))
        )
      })
    )
  }

  /** Creates the assessment collection with the name and thumbnail captured in the dialog. */
  createAssessmentCollection(name: string, appIcon: string, userProfile: any, userEmail: string): Observable<any> {
    const userId = _.get(userProfile, 'userId', '')
    const creator = _.get(userProfile, 'userName', '')
    const request = {
      request: {
        content: {
          appIcon,
          creator,
          name,
          posterImage: appIcon,
          code: this.generateCode(),
          contentType: 'Collection',
          createdBy: userId,
          creatorContacts: [{
            id: userId,
            name: creator,
            email: userEmail || _.get(userProfile, 'email', ''),
          }],
          creatorIDs: [userId],
          createdFor: [_.get(userProfile, 'rootOrgId', '')],
          framework: DEFAULT_FRAMEWORK,
          mimeType: COLLECTION_MIME_TYPE,
          organisation: [_.get(userProfile, 'departmentName', '')],
          isExternal: false,
          primaryCategory: CONTENT_PRIMARY_CATEGORY,
          courseCategory: CONTENT_COURSE_CATEGORY,
          license: DEFAULT_LICENSE,
          ownershipType: ['createdFor'],
          language: ['English'],
          accessSetting: DEFAULT_ACCESS_SETTING,
          versionKey: '1',
        },
      },
    }
    return this.createContent(request)
  }

  /** Picks the question set linked to the collection, if any. */
  getLinkedAssessmentId(collection: any): string {
    const children = _.get(collection, 'children', [])
    const questionSet = _.find(children, (child: any) => _.get(child, 'mimeType', '') === QUESTIONSET_MIME_TYPE)
    return _.get(questionSet, 'identifier', '')
  }

  /** Sunbird expects a 16 digit numeric code on create. */
  generateCode(): string {
    let code = ''
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < 16; i++) {
      code += Math.floor(Math.random() * 10)
    }
    return code
  }

  /** Rewrites a raw storage url to the portal's public asset url. */
  toPublicUrl(createdUrl: string): string {
    if (createdUrl && createdUrl.startsWith(STORAGE_URL_TO_REPLACE)) {
      const urlSplice = createdUrl.slice(STORAGE_URL_TO_REPLACE.length).split('/')
      const domain = (environment.domainName || '').replace(/\/$/, '')
      return `${domain}/assets/public/${urlSplice.slice(1).join('/')}`
    }
    return createdUrl
  }

  //#endregion
}
