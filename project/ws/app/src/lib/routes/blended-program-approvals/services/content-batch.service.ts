import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { NSContent } from '../interface/content'
import { toNumber } from 'lodash'
const AUTH_API_SLUG = '/apis/authApi/'
const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  CONTENT__BATCH_CREATE: `${AUTH_API_SLUG}batch/create`,
  CONTENT_BATCH_UPDATE: `${AUTH_API_SLUG}batch/update`,
  CONTENT_BATCH_TEMPLATE_CREATE: `${AUTH_API_SLUG}batch/addCert`,
  CONTENT_LEARNERS_DETAILS: `${AUTH_API_SLUG}batch/getUserProgress`,
  CONTENT_LEARNERS_DETAILSV2: `${AUTH_API_SLUG}batch/getUserProgressV2`,
  UPDATE_REQUEST: '/v1/blendedprogram/workflow/update',
  INVITE_USERS: 'apis/proxies/v8/workflow/blendedprogram/nominate',
  DEFAULT_CERT_TEMP: '/apis/proxies/v8/data/v1/system/settings/get/defaultCertTemplate',
  DEFAULT_CERT: '/apis/proxies/v8/course/batch/cert/v1/template/add',
  BATCH_CUSTOM_ATTRIBUTES: '/apis/proxies/v8/data/v2/system/settings/get/bpEnrolMandatoryProfileFields',
  CREATE_SURVEY: 'apis/proxies/v8/forms/createForm',
  BPREPORT_STATUS: 'apis/proxies/v8/bp/v1/bpreport/status',
  GENERATE_REPORT: `apis/proxies/v8/bp/v1/generate/report`,
  DOWNLOAD_REPORT: `apis/proxies/v8/bp/v1/bpreport/download/`,
  CADRE_DETAILS: `apis/proxies/v8/data/v2/system/settings/get/cadreConfig`,
  CONTENT_READ: `${AUTH_API_SLUG}action/content/v3/hierarchy/`,
  DOWNLOAD_PENDING_USERS_REQUEST_CSV: `apis/proxies/v8/workflow/blendedprogram/getUserApprovalDataInCsv`,

  FETCH_USER_ENROLLMENT_LIST: (userId: string | undefined) =>
    // tslint:disable-next-line: max-line-length
    `/apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,primaryCategory,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,identifier,medium,pkgVersion,board,subject,trackable,posterImage,duration,creatorLogo,license,version,versionKey&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates`,
  // tslint:disable-next-line: max-line-length
  FETCH_USER_ENROLLMENT_LIST_V2: (userId: string | undefined, orgdetails: string, licenseDetails: string, fields: string, batchDetails: string) =>
    // tslint:disable-next-line: max-line-length
    `apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=${orgdetails}&licenseDetails=${licenseDetails}&fields=${fields}&batchDetails=${batchDetails}`,
  CERT_DOWNLOAD: (certId: any) => `${PROTECTED_SLAG_V8}/cohorts/course/batch/cert/download/${certId}`,
}
@Injectable({
  providedIn: 'root',
})
export class ContentBatchService {
  certificateConfig: any = null
  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }
  createABatch(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CONTENT__BATCH_CREATE, data)
  }
  updateABatch(data: any): Observable<any> {
    return this.http.patch<any>(API_END_POINTS.CONTENT_BATCH_UPDATE, data)
  }
  createABatchCertificate(data: any): Observable<any> {
    return this.http.patch<any>(API_END_POINTS.CONTENT_BATCH_TEMPLATE_CREATE, data)
  }
  fetchBatchLearners(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CONTENT_LEARNERS_DETAILS, data)
  }

  fetchBatchLearnersList(batch: any, pageLimit: number = 10, offsetNum: number = 0): Observable<any> {
    const reqBody = {
      request: {
        courseId: batch.courseId || batch.collectionId,
        batchId: batch.batchId,
        limit: pageLimit,
        offset: offsetNum,
      },
    }
    return this.http.post<any>(API_END_POINTS.CONTENT_LEARNERS_DETAILSV2, reqBody)
  }

  inviteUserToBatch(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.INVITE_USERS, data)
  }

  async getCertificateConfig(): Promise<any> {
    this.certificateConfig = {}
    const baseUrl = this.configSvc.sitePath
    this.certificateConfig = await this.http.get<any>(`${baseUrl}/feature/certificate.json`).toPromise()
    // return this.certificateConfig
    return of(this.certificateConfig).toPromise()
  }

  updateBlendedRequests(req: any) {
    return this.http.post<any>(`${API_END_POINTS.UPDATE_REQUEST}`, req)
  }

  // tslint:disable-next-line:max-line-length
  fetchUserBatchList(userId: string | undefined, queryParams?: { orgdetails: any, licenseDetails: any, fields: any, batchDetails: any }): Observable<any[]> {
    let path = ''
    if (queryParams) {
      // tslint:disable-next-line: max-line-length
      path = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_V2(userId, queryParams.orgdetails, queryParams.licenseDetails, queryParams.fields, queryParams.batchDetails)
    } else {
      path = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST(userId)
    }
    return this.http
      .get(path)
      .pipe(
        catchError(this.handleError),
        map((data: any) => {
          return data.result.courses
        })
      )
  }

  handleError(error: ErrorEvent) {
    let errorMessage = ''
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    }
    return throwError(errorMessage)
  }

  downloadCert(certId: any) {
    return this.http.get<any>(`${API_END_POINTS.CERT_DOWNLOAD(certId)}`)
  }

  defaultCertTemplate() {
    return this.http.get<any>(`${API_END_POINTS.DEFAULT_CERT_TEMP}`)
  }
  attachDefCert(reqdata: any) {
    return this.http.patch<any>(`${API_END_POINTS.DEFAULT_CERT}`, reqdata)
  }
  fetchCustomAttributes() {
    return this.http.get<any>(`${API_END_POINTS.BATCH_CUSTOM_ATTRIBUTES}`)
  }
  createSurvey(reqData: any) {
    return this.http.post<null>(API_END_POINTS.CREATE_SURVEY, reqData)
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

  fetchCadredetails() {
    return this.http.get<any>(`${API_END_POINTS.CADRE_DETAILS}`)
  }

  readContentLive(id: string): Observable<NSContent.IContentMeta> {
    return this.http.get<NSContent.IContentMeta>(
      `${API_END_POINTS.CONTENT_READ}${id}`,
    ).pipe(
      map((data: any) => {
        return data.result.content
      })
    )
  }

  validateUser(request: any): any {
    // return this.apiService.post<any>(`apis/proxies/v8/user/v1/search`, request).subscribe()
    return this.http.post(`apis/proxies/v8/user/v1/search`, request)
  }

  getDepartments(request: any) {
    return this.http.post('/apis/proxies/v8/masterData/v2/admin/deptPosition', request)
  }
  getOrgs() {
    return this.http.get('/apis/proxies/v8/portal/v1/admin/listDeptNames')
  }

  downloadFile(data: any, filename = 'data') {
    const csvData = this.convertToCSV(data, ['email', 'status', 'mobile', 'message'])
    const blob = new Blob([`\ufeff${csvData}`], { type: 'text/csv;charset=utf-8;' })
    const dwldLink = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank')
    }
    dwldLink.setAttribute('href', url)
    dwldLink.setAttribute('download', `${filename}.csv`)
    dwldLink.style.visibility = 'hidden'
    document.body.appendChild(dwldLink)
    dwldLink.click()
    document.body.removeChild(dwldLink)
  }

  convertToCSV(objArray: any, headerList: any) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
    let str = ''
    let row = 'S.No,'

    for (const index in headerList) {
      if (headerList[index]) {
        row += `${headerList[index]} ,`
      }
    }
    row = row.slice(0, -1)
    str += `${row}\r\n`
    // for (let i = 0; i < array.length; i += 1) {
    for (const iIndex in array) {
      if (array[iIndex]) {
        let line = `${toNumber(iIndex) + 1} `
        for (const index in headerList) {
          if (headerList[index]) {
            const head = headerList[index]

            line += `, ${array[iIndex][head]}`
          }
        }
        str += `${line}\r\n`
      }
    }
    return str
  }

  downloadPendingRequestCSV(request: any): Observable<any> {
    return this.http.post(`${API_END_POINTS.DOWNLOAD_PENDING_USERS_REQUEST_CSV}`, request, {
      responseType: 'text' as 'json',
      withCredentials: true // If you need to include cookies like connect.sid
    })
  }

  approveRejectUser(request: any, collectionId: any): any {
    // return this.apiService.post<any>(`apis/proxies/v8/user/v1/search`, request).subscribe()
    return this.http.post(`apis/proxies/v8/workflow/blendedprogram/bulkApprovalDataFromCsv/${collectionId}`, request, {
      responseType: 'text' as 'json',
      withCredentials: true // If you need to include cookies like connect.sid
    })
  }
}
