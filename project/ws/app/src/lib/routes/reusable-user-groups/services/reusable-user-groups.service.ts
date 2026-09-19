import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import {
  IUserGroupCreateRequest,
  IUserGroupCreateResponse,
  IUserGroupDeleteResponse,
  IUserGroupReadResponse,
  IUserGroupSearchRequest,
  IUserGroupSearchResponse,
  IUserGroupUpdateRequest,
  IUserSearchCountResponse,
} from '../interface/reusable-user-groups.interface'

const API_ENDPOINTS = {
  SEARCH: '/apis/proxies/v8/usergroup/v1/search',
  READ: '/apis/proxies/v8/usergroup/v1/read',
  CREATE: '/apis/proxies/v8/usergroup/v1/create',
  UPDATE: '/apis/proxies/v8/usergroup/v1/update',
  DELETE: '/apis/proxies/v8/usergroup/v1/delete',
  USER_SEARCH: '/apis/proxies/v8/user/v1/search',
}

@Injectable({ providedIn: 'root' })
export class ReusableUserGroupsService {
  private readonly http = inject(HttpClient)

  searchUserGroups(request: IUserGroupSearchRequest): Observable<IUserGroupSearchResponse> {
    return this.http.post<IUserGroupSearchResponse>(API_ENDPOINTS.SEARCH, { request })
  }

  fetchUserGroup(userGroupId: string): Observable<IUserGroupReadResponse> {
    return this.http.get<IUserGroupReadResponse>(`${API_ENDPOINTS.READ}/${userGroupId}`)
  }

  createUserGroup(request: IUserGroupCreateRequest): Observable<IUserGroupCreateResponse> {
    return this.http.post<IUserGroupCreateResponse>(API_ENDPOINTS.CREATE, { request })
  }

  updateUserGroup(request: IUserGroupUpdateRequest): Observable<IUserGroupCreateResponse> {
    return this.http.patch<IUserGroupCreateResponse>(API_ENDPOINTS.UPDATE, { request })
  }

  deleteUserGroup(userGroupId: string): Observable<IUserGroupDeleteResponse> {
    return this.http.delete<IUserGroupDeleteResponse>(`${API_ENDPOINTS.DELETE}/${userGroupId}`)
  }

  fetchUserCount(filters: Record<string, any>): Observable<IUserSearchCountResponse> {
    return this.http.post<IUserSearchCountResponse>(API_ENDPOINTS.USER_SEARCH, {
      request: {
        filters,
        fields: ['identifier', 'rootOrgId', 'firstName'],
      },
    })
  }
}
