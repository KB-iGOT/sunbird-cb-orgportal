import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

const API_END_POINTS = {
  GET_USERS: `apis/proxies/v8/user/v1/search`,
  CREATE_REQUEST_FORM: `/apis/proxies/v8/demand/content/create`,
  GET_LANGUAGES: `apis/v1/form/read`
}

@Injectable({
  providedIn: 'root'
})
export class CreateRequestService {

  constructor(
    private http: HttpClient,
  ) { }

  getUsers(req: any) {
    return this.http.post<any>(`${API_END_POINTS.GET_USERS}`, req)
  }

  createRequestForm(req: any) {
    return this.http.post<any>(`${API_END_POINTS.CREATE_REQUEST_FORM}`, req)
  }

  getLanguages(req: any) {
    return this.http.post<any>(`${API_END_POINTS.GET_LANGUAGES}`, req)
  }

}
