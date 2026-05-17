import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
// import { Observable } from 'rxjs'

const API_END_POINTS = {
  GET_APPROVAL_REQUESTS: '/apis/proxies/v8/ai/cbp/v1/mdo/approval-requests/list',
  GET_APPROVAL_REQUEST_DETAILS: '/apis/proxies/v8/ai/cbp/v1/mdo/approval-requests/read/',
  PUBLISH_APPROVAL_REQUEST: '/apis/proxies/v8/ai/cbp/v1/mdo/approval-requests/publish',
  REJECT_APPROVAL_REQUEST: '/apis/proxies/v8/ai/cbp/v1/mdo/approval-requests/reject',
  REJECT_SINGLE_ITEM_APPROVAL_REQUEST: '/apis/proxies/v8/ai/cbp/v1/mdo/approval-requests/items/reject',
  DESIGNATION_APPROVAL_REQUESTS: `/apis/proxies/v8/ai/cbp/v1/designation/approval-requests/list`,


}

@Injectable({
  providedIn: 'root',
})
export class AICBPRequestService {
  constructor(private http: HttpClient) { }
  // getBlendedPrograms(request: any): Observable<any> {
  //   return this.http.post<any>(API_END_POINTS.GET_BLENDED_PROGRAMS, request)
  // }

  getApprovalRequests() {
    return this.http.get<any>(`${API_END_POINTS.GET_APPROVAL_REQUESTS}`)
  }

  getApprovalRequestDetails(req: any) {
    return this.http.get<any>(`${API_END_POINTS.GET_APPROVAL_REQUEST_DETAILS}${req}`)
  }

  publishApprovalRequest(req: any) {
    return this.http.post<any>(`${API_END_POINTS.PUBLISH_APPROVAL_REQUEST}`, req)
  }

  rejectApprovalRequest(req: any) {
    return this.http.post<any>(`${API_END_POINTS.REJECT_APPROVAL_REQUEST}`, req)
  }

  rejectSingleItemApprovalRequest(req: any) {
    return this.http.post<any>(`${API_END_POINTS.REJECT_SINGLE_ITEM_APPROVAL_REQUEST}`, req)
  }

  getNonMappingDesignationList() {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0',
    })

    return this.http.get<any>(`${API_END_POINTS.DESIGNATION_APPROVAL_REQUESTS}`, { headers })
  }
}
