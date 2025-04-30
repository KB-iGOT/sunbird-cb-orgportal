import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

const API_END_POINTS = {
  // COMMUNITY_SEARCH: `/apis/proxies/v8/community/v1/search`,
  COMMUNITY_SEARCH: `/apis/proxies/v8/community/v1/mdo/search`,
  TOPIC_DETAILS: `/apis/proxies/v8/community/v1/topic/search`,
  USER_SEARCH: `/apis/proxies/v8/user/v1/search`,
  COMMUNITY_CREATE: `/apis/proxies/v8/community/v1/create`,
  FILE_UPLOAD: `/apis/proxies/v8/community/v1/fileUpload`,
  COMMUNITY_UPDATE: `/apis/proxies/v8/community/v1/update`,
  COMMUNITY_READ: (id: string) => `/apis/proxies/v8/community/v1/read/${id}`,
  COMMUNITY_PUBLISH: `/apis/proxies/v8/community/v1/publish`,
  GET_ALL_REPORTED_DISCUSSION_ITEMS: `/apis/proxies/v8/feedDiscussion/search`,
  GET_HIDDEN_DISCUSSION_ITEMS: `/apis/proxies/v8/feedDiscussion/search`,
  GET_REPORTED_ISSUES_STATS: `/apis/proxies/v8/feedDiscussion/getReportStatistics`,
  HIDE_REPORTED_DISCUSSION_POST: `/apis/proxies/v8/feedDiscussion/admin/removePost`,
  ACTIVATE_REPORTED_DISCUSSION_POST: `apis/proxies/v8/feedDiscussion/admin/activatePost`
}

@Injectable({
  providedIn: 'root'
})

export class CommunityService {
  constructor(private http: HttpClient) { }

  communitySearch(req: any) {
    return this.http.post<any>(`${API_END_POINTS.COMMUNITY_SEARCH}`, req)
  }

  getTopicDetails(request: any) {
    return this.http.post<any>(`${API_END_POINTS.TOPIC_DETAILS}`, request)
  }

  getUserDetails(req: any) {
    return this.http.post<any>(`${API_END_POINTS.USER_SEARCH}`, req)
  }

  createCommunity(request: any) {
    return this.http.post<any>(`${API_END_POINTS.COMMUNITY_CREATE}`, request)
  }

  updateCommunity(request: any) {
    return this.http.put<any>(`${API_END_POINTS.COMMUNITY_UPDATE}`, request)
  }

  fileUpload(request: any, communityId: string) {
    return this.http.post<any>(`${API_END_POINTS.FILE_UPLOAD}/${communityId}`, request)
  }

  getCommunityDetailsById(id: string) {
    return this.http.get<any>(`${API_END_POINTS.COMMUNITY_READ(id)}`)
  }

  publishCommunity(request: any) {
    return this.http.post<any>(`${API_END_POINTS.COMMUNITY_PUBLISH}`, request)
  }

  getAllReportedDiscussion(request: any) {
    return this.http.post<any>(`${API_END_POINTS.GET_ALL_REPORTED_DISCUSSION_ITEMS}`, request)
  }

  getHiddenDiscussions(request: any) {
    return this.http.post<any>(`${API_END_POINTS.GET_HIDDEN_DISCUSSION_ITEMS}`, request)
  }

  getReportedIssuesStats(request: any) {
    return this.http.post<any>(`${API_END_POINTS.GET_REPORTED_ISSUES_STATS}`, request)
  }

  hideReportedPost(request: any) {
    return this.http.post<any>(`${API_END_POINTS.HIDE_REPORTED_DISCUSSION_POST}`, request)
  }

  displayReportedPost(request: any) {
    return this.http.post<any>(`${API_END_POINTS.ACTIVATE_REPORTED_DISCUSSION_POST}`, request)
  }


}
