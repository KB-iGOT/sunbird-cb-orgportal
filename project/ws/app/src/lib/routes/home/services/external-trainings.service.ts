import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

const API_END_POINTS = {
  CREATE_EXTERNAL_TRAINING: '/apis/proxies/v8/externaltraining/v4/create',
  PUBLISH_EXTERNAL_TRAINING: (identifier: string) => `/apis/proxies/v8/externaltraining/v4/publish/${identifier}`,
  MERGE_LOGO: '/apis/proxies/v8/externaltraining/v4/merge-logo',
  APPROVALS_LIST: '/apis/proxies/v8/sunbirdigot/search',
  STATUS_UPDATE: '/apis/proxies/v8/learner/achievement/status/update',
  GET_ACHIEVEMENT_DETAILS: (achievementId: string) => `/apis/proxies/v8/learner/achievement/${achievementId}`,
  GET_EXTERNAL_TRAINING_DETAILS: (identifier: string) => `/apis/proxies/v8/externaltraining/v4/read/${identifier}`,
  CREATE_BARCH: '/apis/proxies/v8/externaltraining/batch/create',
  BULK_UPLOAD: '/apis/proxies/v8/externaltraining/v1/bulkUpload',
  UPLOAD_TEMPLATE: '/apis/proxies/v8/storage/v1/uploadCiosIcon',
  // TODO: Replace with real API endpoint when available
  GET_DEFAULT_TEMPLATE: 'assets/images/sample/CourseCertificate_Template.svg',
}
@Injectable({
  providedIn: 'root'
})
export class ExternalTrainingsService {

  private trainingNameSubject = new BehaviorSubject<string>('')
  trainingName$ = this.trainingNameSubject.asObservable()

  constructor(private http: HttpClient,) { }

  createExternalTraining(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CREATE_EXTERNAL_TRAINING, request)
  }

  uploadTemplate(template: any): Observable<any> {
    const file = template.get('content') as File
    const fileName = file.name
    const newFormData = new FormData()
    newFormData.append('file', file, fileName)
    return this.http.post<any>(API_END_POINTS.UPLOAD_TEMPLATE, newFormData)
  }

  setTrainingName(name: string): void {
    this.trainingNameSubject.next(name)
  }


  publishExternalTraining(formData: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.PUBLISH_EXTERNAL_TRAINING(formData.request.event.identifier), formData)
  }

  mergeLogo(formData: FormData): Observable<any> {
    return this.http.post<any>(API_END_POINTS.MERGE_LOGO, formData)
  }

  getApprovalsList(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.APPROVALS_LIST, request)
  }

  updateApprovalStatus(request: any): Observable<any> {
    return this.http.put<any>(API_END_POINTS.STATUS_UPDATE, request)
  }

  getAchievementDetails(achievementId: string): Observable<any> {
    return this.http.get<any>(API_END_POINTS.GET_ACHIEVEMENT_DETAILS(achievementId))
  }

  getExternalTrainingDetails(identifier: string): Observable<any> {
    return this.http.get<any>(API_END_POINTS.GET_EXTERNAL_TRAINING_DETAILS(identifier))
  }

  createBatch(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CREATE_BARCH, request)
  }

  getDefaultTemplate(): Observable<Blob> {
    return this.http.get(API_END_POINTS.GET_DEFAULT_TEMPLATE, { responseType: 'blob' })
  }

  bulkUsersUpload(formData: FormData): Observable<any> {
    return this.http.post<any>(API_END_POINTS.BULK_UPLOAD, formData)
  }

}
