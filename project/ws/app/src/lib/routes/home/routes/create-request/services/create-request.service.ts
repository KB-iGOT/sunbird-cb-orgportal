import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

const API_END_POINTS = {
  CREATE_REQUEST_FORM: `/apis/proxies/v8/demand/content/create`,
}

@Injectable({
  providedIn: 'root'
})
export class CreateRequestService {

  constructor(
    private http: HttpClient,
  ) { }

  createRequestForm(req: any) {
    return this.http.post<any>(`${API_END_POINTS.CREATE_REQUEST_FORM}`, req)
  }
}
