import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { map } from 'rxjs/operators'
/* tslint:disable */
import * as _ from 'lodash'
import { of } from 'rxjs'
/* tslint:enable */

const API_END_POINTS = {
  LIST_ALL_USERS: '/apis/proxies/v8/user/v1/search',
  ADD_TO_BATCH: '/apis/authApi/batch/addUser',
  INVITE_USER_TO_BATCH: '/apis/proxies/v8/program/v1/admin/enrol',
  READ_OTHER_USER: (userId: string) => `/apis/proxies/v8/api/user/v2/read/${userId}`,
  REMOVE_USER_FROM_BATCH: '/apis/authApi/batch/removeUser',
  AUTO_USERSEARCH: (usertext: string) => `/apis/proxies/v8/user/v1/autocomplete/${usertext}`,
}
@Injectable({
  providedIn: 'root',
})
export class OrgUserService {
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }

  getUserSearchList(userText: string) {
    return this.http.get(API_END_POINTS.AUTO_USERSEARCH(userText)).pipe(map(res => _.get(res, 'result.response')))
  }

  getOrgUsersList() {
    const rootOrgId = this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId
    if (!rootOrgId) {
      return of([])
    }
    return this.http.post(API_END_POINTS.LIST_ALL_USERS, {
      request: {
        filters: {
          'organisations.organisationId': rootOrgId,
        },
      },
    }).pipe(map((res: any) => {
      if (res.responseCode === 'OK') {
        return res.result.response
      }
    }))
  }
  addToBatch(data: any) {
    return this.http.post(API_END_POINTS.ADD_TO_BATCH, data)
  }
  inviteUserToBatch(data: any) {
    return this.http.post(API_END_POINTS.INVITE_USER_TO_BATCH, data)
  }
  getUser(userId: string) {
    return this.http.get(API_END_POINTS.READ_OTHER_USER(userId)).pipe(map(res => _.get(res, 'result.response')))
  }
  removeUserFromBatch(data: { request: { courseId: any, batchId: any, userId: any } }) {
    return this.http.post(API_END_POINTS.REMOVE_USER_FROM_BATCH, data)
  }
}
