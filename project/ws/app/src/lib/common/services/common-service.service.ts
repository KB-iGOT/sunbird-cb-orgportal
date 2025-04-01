import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
// import { NSProfileDataV2 } from '../models/profile-v2.model'
import { map } from 'rxjs/operators'
// tslint:disable
import _ from 'lodash'
/* tslint:enable */

// const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const PROXIES_SLAG_V8 = '/apis/proxies/v8'

const API_END_POINTS = {
  GET_FILTER_ENTITY_V2: `${PROXIES_SLAG_V8}/framework/v1/read/kcmfinal_fw`

}

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) { }

  getFilterEntityV2(): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.GET_FILTER_ENTITY_V2}`).pipe(map(res => _.get(res, 'result.framework.categories')))
  }


}
