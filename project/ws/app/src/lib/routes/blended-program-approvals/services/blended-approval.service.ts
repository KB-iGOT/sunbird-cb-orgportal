import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
// tslint:disable-next-line:import-name
import _ from 'lodash'

const API_END_POINTS = {
  UPDATE_REQUEST: '/apis/proxies/v8/workflow/blendedprogram/update/mdo',
  // GET_PROGRAM_DETAILS: '/apis/proxies/v8/action/content/v3/hierarchy',
  GET_PROGRAM_DETAILS: '/apis/proxies/v8/action/content/v3/read',
  GET_LERANERS: '/apis/protected/v8/cohorts/course/getUsersForBatch',
  GET_REQUESTS: '/apis/proxies/v8/workflow/blendedprogram/search',
  GET_SEARCH_LIST: '/apis/proxies/v8/workflow/blendedprogram/searchV2/mdo',
  READ_USER: '/apis/proxies/v8/api/user/v2/read/',
  CERT_DOWNLOAD: `/apis/protected/v8/cohorts/course/batch/cert/download/`,
  SEARCH_FORM_WITH_USERID: 'apis/proxies/v8/forms/searchForms',
  SUBMISSION_SEARCH: '/apis/proxies/v8/forms/v2/submissions/search',
  NOMINATE_LEARNERS: '/apis/proxies/v8/workflow/blendedprogram/admin/enrol',
  REMOVE_LEARNER: '/apis/proxies/v8/workflow/blendedprogram/remove/approved/user',
  BLENDED_USER_COUNT: `apis/proxies/v8/workflow/blendedprogram/enrol/status/count`,
  BPREPORT_STATUS: 'apis/proxies/v8/bp/v1/bpreport/status',
  GENERATE_REPORT: `apis/proxies/v8/bp/v1/generate/report`,
  DOWNLOAD_REPORT: `apis/proxies/v8/bp/v1/bpreport/download/`,
  GET_FORM_BY_ID: `/apis/proxies/v8/forms/v2/getFormById`,
  INVITE_USERS: 'apis/proxies/v8/workflow/blendedprogram/nominate',
}

@Injectable({
  providedIn: 'root',
})
export class BlendedApporvalService {
  constructor(private http: HttpClient) { }
  getBlendedProgramsDetails(programID: any): Observable<any> {
    const url = `${API_END_POINTS.GET_PROGRAM_DETAILS}/${programID}`
    return this.http.get<any>(url)
  }

  getLearners(batchId: any, orgName: any): Observable<any> {
    const url = `${API_END_POINTS.GET_LERANERS}/${batchId}/${orgName}`
    return this.http.get<any>(url)
  }

  getLearnersWithoutOrg(batchId: any): Observable<any> {
    const url = `${API_END_POINTS.GET_LERANERS}/${batchId}`
    return this.http.get<any>(url)
  }

  getRequests(req: any) {
    return this.http.post<any>(`${API_END_POINTS.GET_REQUESTS}`, req)
  }

  getSerchRequests(req: any) {
    return this.http.post<any>(`${API_END_POINTS.GET_SEARCH_LIST}`, req)
  }

  updateBlendedRequests(req: any) {
    return this.http.post<any>(`${API_END_POINTS.UPDATE_REQUEST}`, req)
  }

  getUserById(userid: string): Observable<any> {
    if (userid) {
      return this.http.get<any>(API_END_POINTS.READ_USER + userid).pipe(map(resp => _.get(resp, 'result.response')))
    }
    return this.http.get<any>(API_END_POINTS.READ_USER).pipe(map(resp => _.get(resp, 'result.response')))
  }

  downloadCert(certId: any) {
    const url = `${API_END_POINTS.CERT_DOWNLOAD}/${certId}`
    return this.http.get<any>(url)
  }

  getSurveyByUserID(req: any) {
    return this.http.post<any>(`${API_END_POINTS.SEARCH_FORM_WITH_USERID}`, req)
  }

  getSubmissionsByUserId(req: any) {
    return this.http.post<any>(`${API_END_POINTS.SUBMISSION_SEARCH}`, req)
  }

  nominateLearners(req: any) {
    return this.http.post<any>(`${API_END_POINTS.NOMINATE_LEARNERS}`, req)
  }

  removeLearner(req: any) {
    const headers = new HttpHeaders({
      "isPc": "false"
    })
    return this.http.post<any>(`${API_END_POINTS.REMOVE_LEARNER}`, req, { headers: headers })
  }

  fetchBlendedUserCount(req: any) {
    return this.http
      .post(API_END_POINTS.BLENDED_USER_COUNT, req)
      .toPromise()
  }

  getBpReportStatusApi(reqBody: any) {
    return this.http.post<null>(API_END_POINTS.BPREPORT_STATUS, reqBody)
  }
  generateBpReport(reqBody: any) {
    return this.http.post<null>(API_END_POINTS.GENERATE_REPORT, reqBody)
  }
  downloadReport(fileUrl: string, fileName: string) {
    this.http.get(`${API_END_POINTS.DOWNLOAD_REPORT}${fileUrl}`, { responseType: 'blob' }).subscribe((response: Blob) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(link.href)
    })
  }

  getSurveyByFormId(formId: any) {
    return this.http.get<any>(`${API_END_POINTS.GET_FORM_BY_ID}?formId=${formId}`)
  }


  inviteUserToBatch(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.INVITE_USERS, data)
  }
}
