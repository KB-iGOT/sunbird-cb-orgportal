import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

const API_END_POINTS = {
  CBP_PLAN_LIST: '/apis/proxies/v8/cbplan/v1/list',
  CBP_PLAN_LIST_V2: '/apis/proxies/v8/cbplan/v2/search',
}

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanDashboardService {
  constructor(private http: HttpClient) { }

  getUserList(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CBP_PLAN_LIST, req)
  }

  getTrainingPlansV2(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CBP_PLAN_LIST_V2, req)
  }
}
