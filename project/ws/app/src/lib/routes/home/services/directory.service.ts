import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { map, mergeMap, tap } from 'rxjs/operators'
import _ from 'lodash'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { v4 as uuidv4 } from 'uuid'

const API_END_POINTS = {
  // GET_ALL_DEPARTMENTS: '/apis/protected/v8/portal/spv/department',
  GET_ALL_DEPARTMENT_KONG: '/apis/proxies/v8/org/v1/search',
  ORG_READ: '/apis/proxies/v8/org/v1/read',
  ORGANISATION_FW: (frameworkName: string) =>
    `/apis/proxies/v8/framework/v1/read/${frameworkName}`,
  CREATE_STATE_OR_MINISTRY: '/apis/proxies/v8/org/ext/v1/create',
  UPDATE_ORGANIZATION_V2: '/apis/proxies/v8/org/ext/v2/update',
  SEARCH_ORG: '/apis/proxies/v8/org/v1/search',
  UPLOAD_ORGANIZATION_LOGO: '/apis/proxies/v8/customselfregistration/upload/logo/gcpcontainer',
  GET_ALL_STATES: '/apis/public/v8/org/v1/list',
  CREATE_FRAME_WORK: (frameworkName: string, orgId: string, termName: string) => {
    return `/apis/proxies/v8/org/framework/read?frameworkName=${frameworkName}&orgId=${orgId}&termName=${encodeURIComponent(termName)}`
  },
  PUBLISH_FRAMEWORK: (frameworkName: string) =>
    `apis/proxies/v8/framework/v1/publish/${frameworkName}`,
  DELETE_DESIGNATION: (frameworkName: string, category: string) =>
    `/apis/proxies/v8/framework/v1/term/retire?framework=${frameworkName}&category=${category}`,
  GET_IGOT_MASTER_DESIGNATIONS: 'apis/proxies/v8/designation/search',
  CREATE_TERM: `/apis/proxies/v8/designation/create/term`,
  UPDATE_TERM: (frameworkId: string, categoryId: string, categoryTermCode: string) =>
    `apis/proxies/v8/framework/v1/term/update/${categoryTermCode}?framework=${frameworkId}&category=${categoryId}`,
  USER_READ: '/apis/proxies/v8/api/user/v2/read/',
}

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  list = new Map<string, any>()
  userProfile: any
  orgDesignationList: any = []
  frameWorkInfo: any
  selectedDesignationList: any = []

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) {
    this.setUserProfile()
  }

  setUserProfile() {
    this.userProfile = _.get(this.configSvc, 'userProfile', {})
  }

  getStatesOrMinisteries(type: string): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.GET_ALL_STATES}/${type}`)
  }

  // getAllDepartments(): Observable<any> {
  //   return this.http.get<any>(`${API_END_POINTS.GET_ALL_DEPARTMENTS}`)
  // }

  getAllDepartmentsKong(queryText: any, pagination: { limit: number, offset: number }): Observable<any> {
    let filters = {
      isTenant: true,
      status: 1,
      isMdo: true
      // ...(state === 'organisation' ? { isMdo: true } : { isCbp: true }),
    }

    if (queryText) {
      const req1 = {
        request: {
          filters: {
            isTenant: true,
            status: 1,
            isMdo: true
            // ...(state === 'organisation' ? { isMdo: true } : { isCbp: true }),
          },
          query: queryText,
          limit: pagination.limit || 20,
          offset: pagination.offset || 0,
        },
      }
      return this.http.post<any>(`${API_END_POINTS.GET_ALL_DEPARTMENT_KONG}`, req1)
    }

    const req = {
      request: {
        filters,
        sort_by: {
          createdDate: "desc",
        },
        limit: pagination.limit,
        offset: pagination.offset,
      },
    }
    return this.http.post<any>(`${API_END_POINTS.GET_ALL_DEPARTMENT_KONG}`, req)
  }

  getOrgReadData(organisationId: string): Observable<any> {
    const request = {
      request: {
        organisationId,
      },
    }
    return this.http
      .post<any>(API_END_POINTS.ORG_READ, request)
      .pipe(map((res: any) => {
        return _.get(res, 'result.response')
      }))
  }

  getFrameworkInfo(frameWorkName: string): Observable<any> {
    return this.http.get(`${API_END_POINTS.ORGANISATION_FW(frameWorkName)}`, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.formateData(response)
      }),
    )
  }

  formateData(response: any) {
    _.get(response, 'result.framework.categories', []).forEach((a: any) => {
      this.list.set(a.code, {
        code: a.code,
        identifier: a.identifier,
        index: a.index,
        name: a.name,
        selected: a.selected,
        status: a.status,
        description: a.description,
        translations: a.translations,
        category: a.category,
        associations: a.associations,
        // config: this.getConfig(a.code),
        children: this.formateChildren(a.terms || []),
      })
    })

    const allCategories: any = []
    this.list.forEach((a: any) => {
      allCategories.push({
        code: a.code,
        identifier: a.identifier,
        index: a.index,
        name: a.name,
        status: a.status,
        description: a.description,
        translations: a.translations,
      })
    })
  }

  formateChildren(terms: any[]): any[] {
    return terms.map((c: any) => {
      const associations = c.associations || []
      if (associations.length > 0) {
        Object.assign(c, { children: associations })
        this.formateChildren(c.associations)
      } else {
        Object.assign(c, { children: [] })
      }
      const importedBy = _.get(c, 'additionalProperties.importedById', null) === _.get(this.userProfile, 'userId', '')
        ? 'You' : _.get(c, 'additionalProperties.importedByName', null)
      c['importedByName'] = importedBy,
        c['importedOn'] = _.get(c, 'additionalProperties.importedOn'),
        c['importedById'] = _.get(c, 'additionalProperties.importedById')
      return c
    })
  }

  createOrganization(request: any) {
    return this.http.post<any>(`${API_END_POINTS.CREATE_STATE_OR_MINISTRY}`, { request: request })
  }

  updateOrganizationV2(req: any): Observable<any> {
    return this.http.patch<any>(`${API_END_POINTS.UPDATE_ORGANIZATION_V2}`, req)
  }

  searchOrgs(orgName: any, type: any) {
    const req = {
      request: {
        filters: {
          orgName,
          parentType: type,
        },
        limit: 500,
      },
    }
    return this.http.post(API_END_POINTS.SEARCH_ORG, req)
  }

  uploadOrganizationLogo(payload: any) {
    return this.http.post<any>(`${API_END_POINTS.UPLOAD_ORGANIZATION_LOGO}`, payload)
  }

  createFrameWork(frameworkName: string, orgId: string, termName: string) {
    return this.http.get<any>(API_END_POINTS.CREATE_FRAME_WORK(frameworkName, orgId, termName))
  }

  publishFramework(frameworkName: string) {
    return this.http.post(`${API_END_POINTS.PUBLISH_FRAMEWORK(frameworkName)}`, {})
  }

  setCurrentOrgDesignationsList(orgDesignationList: any) {
    this.orgDesignationList = orgDesignationList
  }

  deleteDesignation(frameworkName: string, category: string, formBody: any) {
    return this.http.post<any>(`${API_END_POINTS.DELETE_DESIGNATION(frameworkName, category)}`, formBody)
  }

  setFrameWorkInfo(frameWorkInfo: any) {
    this.frameWorkInfo = frameWorkInfo
  }

  getIgotMasterDesignations(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.GET_IGOT_MASTER_DESIGNATIONS, req).pipe(
      mergeMap((res: any) => {
        if (res) {
          return this.formateMasterDesignationList(_.get(res, 'result.result', {}))
        }
        return res
      })
    )
  }

  updateSelectedDesignationList(selectedList: any) {
    this.selectedDesignationList = selectedList
  }

  formateMasterDesignationList(response: any): Observable<any> {
    const result: any = {
      formatedDesignationsLsit: [],
      facets: response.facets,
      totalCount: response.totalCount,
    }
    if (response.data) {
      response.data.forEach((masterDesignation: any) => {
        masterDesignation['isOrgDesignation'] = (this.orgDesignationList
          .findIndex((element: any) => element.refId === masterDesignation.id) > -1) ? true : false
        if (this.selectedDesignationList.findIndex((element: any) => element.id === masterDesignation.id) > -1) {
          masterDesignation['selected'] = true
          // result.formatedDesignationsLsit.unshift(masterDesignation)
          result.formatedDesignationsLsit.push(masterDesignation)
        } else {
          masterDesignation['selected'] = masterDesignation['isOrgDesignation']
          result.formatedDesignationsLsit.push(masterDesignation)
        }
      })
    }

    return of(result)
  }

  get getUuid() {
    return uuidv4()
  }

  createTerm(requestBody: any) {
    return this.http.post(`${API_END_POINTS.CREATE_TERM}`, requestBody)
  }

  updateTerms(frameworkId: string, categoryId: string, categoryTermCode: string, reguestBody: any) {
    return this.http.patch(`${API_END_POINTS.UPDATE_TERM(
      frameworkId,
      categoryId,
      categoryTermCode
    )}`, reguestBody)
  }

  getUserDetails(userID: string): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.USER_READ}${userID}`)
  }

}
