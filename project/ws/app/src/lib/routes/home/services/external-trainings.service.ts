import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'


const API_END_POINTS = {
  APPROVALS_LIST: '/apis/proxies/v8/learner/achievement/search',
  STATUS_UPDATE: '/apis/proxies/v8/learner/achievement/status/update',
  GET_ACHIEVEMENT_DETAILS: (achievementId: string) => `/apis/proxies/v8/learner/achievement/${achievementId}`,
}
@Injectable({
  providedIn: 'root'
})
export class ExternalTrainingsService {

  constructor(private http: HttpClient,) { }

  getApprovalsList(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.APPROVALS_LIST, request)
  }

  updateApprovalStatus(request: any): Observable<any> {
    return this.http.put<any>(API_END_POINTS.STATUS_UPDATE, request)
  }

  getAchievementDetails(achievementId: string): Observable<any> {
    return this.http.get<any>(API_END_POINTS.GET_ACHIEVEMENT_DETAILS(achievementId))
  }

}
