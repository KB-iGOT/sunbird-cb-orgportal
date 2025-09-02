import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import _ from 'lodash'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

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
}

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  list = new Map<string, any>()
  userProfile: any

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

}
