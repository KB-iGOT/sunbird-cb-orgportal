import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, forkJoin, of } from 'rxjs'
import { map } from 'rxjs/operators'
// tslint:disable
import _ from 'lodash'
// tslint:enable

// The content search is called in batches when a plan carries a long content list
const CONTENT_READ_BATCH_SIZE = 100

const API_END_POINTS = {
  CREATE_PLAN: 'apis/proxies/v8/cbplan/v1/create',
  READ_PLAN: 'apis/proxies/v8/cbplan/v1/read',
  UPDATE_PLAN: 'apis/proxies/v8/cbplan/v1/update',
  ARCHIVE_PLAN: 'apis/proxies/v8/cbplan/v1/archive',
  PUBLISH_PLAN: 'apis/proxies/v8/cbplan/v1/publish',
  GET_ALL_CONTENT: 'apis/proxies/v8/sunbirdigot/search',
  GET_ALL_USERS: 'apis/proxies/v8/user/v1/search',
  GET_ALL_DESIGNATIONS: 'apis/proxies/v8/masterData/v2/deptPosition',
  GET_PROVIDERS: 'apis/proxies/v8/searchBy/provider',
  GET_FILTER_ENTITY: 'apis/proxies/v8/competency/v4/search',
  CREATE_NEWCONTENT: 'apis/proxies/v8/cbplan/v1/admin/requestcontent',

  CREATE_PLAN_V2: 'apis/proxies/v8/cbplan/v2/create',
  UPDATE_PLAN_V2: 'apis/proxies/v8/cbplan/v2/update',
  PUBLISH_PLAN_V2: 'apis/proxies/v8/cbplan/v2/publish',
  READ_PLAN_V2: 'apis/proxies/v8/cbplan/v2/read',
  ARCHIVE_PLAN_V2: 'apis/proxies/v8/cbplan/v2/archive',


  CREATE_PLAN_V3: 'apis/proxies/v8/cbplan/v3/create',
  UPDATE_PLAN_V3: 'apis/proxies/v8/cbplan/v3/update',
  PUBLISH_PLAN_V3: 'apis/proxies/v8/cbplan/v3/publish',
  READ_PLAN_V3: 'apis/proxies/v8/cbplan/v3/read',
  ARCHIVE_PLAN_V3: 'apis/proxies/v8/cbplan/v3/archive',

}
@Injectable({
  providedIn: 'root',
})
export class TrainingPlanService {
  constructor(private http: HttpClient) {

  }
  // reqObj:object
  createPlan(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.CREATE_PLAN}`, obj).pipe(map(res => _.get(res, 'result')))
  }

  readPlan(planId: any) {
    return this.http.get<any>(`${API_END_POINTS.READ_PLAN}/${planId}`)
  }

  updatePlan(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.UPDATE_PLAN}`, obj).pipe(map(res => _.get(res, 'result')))
  }

  archivePlan(obj: any) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: obj,
    }
    return this.http.delete<any>(`${API_END_POINTS.ARCHIVE_PLAN}`, options)
  }

  publishPlan(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.PUBLISH_PLAN}`, obj)
  }

  getAllContent(filter: object): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.GET_ALL_CONTENT}`, filter).pipe(map(res => _.get(res, 'result')))
  }

  getCustomUsers(filter: object): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.GET_ALL_USERS}`, filter).pipe(map(res => _.get(res, 'result.response')))
  }

  getDesignations() {
    return this.http.get<any>(API_END_POINTS.GET_ALL_DESIGNATIONS)
  }

  getFilterEntity(filter: object): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.GET_FILTER_ENTITY}`, filter).pipe(map(res => _.get(res, 'result.competency')))
  }

  getProviders() {
    return this.http.get<any>(API_END_POINTS.GET_PROVIDERS)
  }

  createNewContentrequest(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.CREATE_NEWCONTENT}`, obj)
  }

  createPlanV2(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.CREATE_PLAN_V2}`, obj).pipe(map(res => _.get(res, 'result')))
  }

  updatePlanV2(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.UPDATE_PLAN_V2}`, obj).pipe(map(res => _.get(res, 'result')))
  }

  publishPlanV2(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.PUBLISH_PLAN_V2}`, obj)
  }

  readPlanV2(planId: any) {
    return this.http.get<any>(`${API_END_POINTS.READ_PLAN_V2}/${planId}`)
  }

  archivePlanV2(obj: any) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: obj,
    }
    return this.http.delete<any>(`${API_END_POINTS.ARCHIVE_PLAN_V2}`, options)
  }
  createPlanV3(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.CREATE_PLAN_V3}`, obj).pipe(map(res => _.get(res, 'result')))
  }
  updatePlanV3(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.UPDATE_PLAN_V3}`, obj).pipe(map(res => _.get(res, 'result')))
  }

  publishPlanV3(obj: any) {
    return this.http.post<any>(`${API_END_POINTS.PUBLISH_PLAN_V3}`, obj)
  }

  readPlanV3(planId: any) {
    return this.http.get<any>(`${API_END_POINTS.READ_PLAN_V3}/${planId}`)
  }

  /**
   * Content details of the given content ids. The plan read API returns contentList as a plain list
   * of ids, while the stepper screens (cards, chips, competency summary, preview) work with the
   * complete content, so the details are read with a search on those ids.
   */
  getContentByIds(identifiers: string[], competencyKey?: string, secureSettings = false): Observable<any> {
    if (!identifiers || !identifiers.length) {
      return of([])
    }
    const batches = _.chunk(identifiers, CONTENT_READ_BATCH_SIZE)
      .map((batch: string[]) => this.searchContentByIds(batch, competencyKey, secureSettings))
    return forkJoin(batches).pipe(map((responses: any[]) => _.flatten(responses)))
  }

  private searchContentByIds(identifiers: string[], competencyKey?: string, secureSettings = false): Observable<any> {
    const fields = ['name', 'appIcon', 'instructions', 'description', 'purpose', 'mimeType',
      'gradeLevel', 'identifier', 'medium', 'resourceType',
      'primaryCategory', 'contentType', 'channel', 'organisation', 'trackable', 'posterImage',
      'idealScreenSize', 'learningMode', 'creatorLogo', 'duration', 'programDuration',
      'version', 'avgRating', 'secureSettings', 'courseCategory']
    if (competencyKey) {
      fields.push(competencyKey)
    }
    const obj = {
      request: {
        secureSettings,
        filters: {
          identifier: identifiers,
        },
        offset: 0,
        limit: identifiers.length,
        fields,
      },
    }
    return this.http.post<any>(`${API_END_POINTS.GET_ALL_CONTENT}`, obj).pipe(map(res => _.get(res, 'result.content', [])))
  }
  archivePlanV3(obj: any) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: obj,
    }
    return this.http.delete<any>(`${API_END_POINTS.ARCHIVE_PLAN_V3}`, options)
  }


}
