import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { ConfigurationsService, IResolveResponse } from '@sunbird-cb/utils-v2'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { FormExtService } from '../services/form-ext.service'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class FormDataResolverService {
  constructor(
    private http: HttpClient,
    public configSvc: ConfigurationsService,
    private formSvc: FormExtService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {
    const pageDataKey = _route.data.pageKey
    const pageType = _route.data.pageType || 'feature'
    const requestData: any = {
      request: {
        type: "MDO-channel",
        subType: "microsite-v2",
        action: "page-configuration",
        component: "portal",
        rootOrgId: this.configSvc?.orgReadData?.rootOrgId || ''
      }
    }
    requestData.request['subType'] = 'microsite-v2-preview'
    return this.formSvc.formReadData(requestData).pipe(
      map((rData: any) => {
        const finalData = rData && rData.result.form.data
        return ({ data: finalData, error: null })
      }),
      catchError((_error: any) => {
        requestData.request['subType'] = 'microsite-v2'
        return this.formSvc.formReadData(requestData).pipe(
          map((rData: any) => {
            const finalData = rData && rData.result.form.data
            return ({ data: finalData, error: null })
          }),
          catchError((_error: any) => {
            const baseUrl = this.configSvc.sitePath
            return this.http.get(`${baseUrl}/${pageType}/${pageDataKey}.json`, {
              headers: {
                'Content-Type': 'application/json',
              },
              observe: 'response',
            }).pipe(
              map((response: any) => {
                if (response.body) {
                  return { data: response?.body?.data, error: null }
                }
                return { data: null, error: 'Empty response' }
              }),
              catchError(err => {
                console.error('HTTP request failed:', err)
                return of({ data: null, error: err })
              }),
            )
          }),
        )
      }),
    )
  }
}
