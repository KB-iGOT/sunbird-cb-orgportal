import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'

const API_ENDPOINTS = {
  CREATE: `/apis/proxies/v8/customFields/create`,
  LIST_CUSTOM_FIELDS: `/apis/proxies/v8/customFields/search`,
  DELETE: `/apis/proxies/v8/customFields/delete`,
  READ: `/apis/proxies/v8/customFields/read`,
  UPDATE: `/apis/proxies/v8/customFields/update`

}

@Injectable()
export class CustomFieldsService {
  constructor(private http: HttpClient) { }

  createField(filter: object): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.CREATE}`, filter)
  }

  getCustomFields(payload: object): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.LIST_CUSTOM_FIELDS}`, payload)
  }

  deleteCustomField(id: string): Observable<any> {
    return this.http.delete<any>(`${API_ENDPOINTS.DELETE}/${id}`)
  }

  readCustomField(id: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.READ}/${id}`)
  }

  updateCustomField(id: string, payload: object): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.UPDATE}/${id}`, payload)
  }
}
