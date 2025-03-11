import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

const API_END_POINTS = {

  COMMUNITY_SEARCH: `/apis/proxies/v8/community/v1/search`,
  TOPIC_DETAILS: `/apis/proxies/v8/catalog/v1/sector`
}
@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  constructor(private http: HttpClient) { }
  communitySearch(req: any) {
    return this.http.post<any>(`${API_END_POINTS.COMMUNITY_SEARCH}`, req)
  }
  getTopicDetails() {
    return this.http.get<any>(`${API_END_POINTS.TOPIC_DETAILS}`)
  }

}
