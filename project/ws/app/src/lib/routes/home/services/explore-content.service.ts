import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

const API_END_POINTS = {
  ALL_CONTENT: '/apis/proxies/v8/sunbirdigot/v4/search',
}

@Injectable({
  providedIn: 'root'
})
export class ExploreContentService {

  constructor(readonly http: HttpClient) { }
  getAllContent(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.ALL_CONTENT, req)
  }
}
