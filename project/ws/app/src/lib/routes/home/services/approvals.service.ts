import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

const API_END_POINTS = {
  APPROVALS: '/apis/protected/v8/workflowhandler/applicationsSearch',
  WORKFLOW_HANDLER: 'apis/protected/v8/workflowhandler/transition',
  PROFILEAPPROVALSLIST: '/apis/protected/v8/workflowhandler/profileApprovalSearch',
  WORKFLOW_HANDLER_V2: '/apis/protected/v8/workflowhandler/v2/transition'
}

@Injectable({
  providedIn: 'root',
})
export class ApprovalsService {
  constructor(private http: HttpClient, private configSrv: ConfigurationsService) { }
  getApprovals(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.APPROVALS, request)
  }

  getApprovalsList(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.PROFILEAPPROVALSLIST, request)
  }

  getProfileConfig(): Promise<any> {
    const baseUrl = this.configSrv.sitePath
    const config = this.http.get<any>(`${baseUrl}/feature/approvals.json`).toPromise()
    return of(config).toPromise()
  }

  handleWorkflow(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.WORKFLOW_HANDLER, request)
  }
  handleWorkflowV2(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.WORKFLOW_HANDLER_V2, request)
  }
}
