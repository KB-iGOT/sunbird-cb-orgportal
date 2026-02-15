

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NsContent } from '../models/constant'
import { map, retry } from 'rxjs/operators'

@Injectable()
export class PendingFunctionService {
  downloadRegex = new RegExp(`(https://.*?/content-store/.*?)(\\\)?\\\\?['"])`, 'gm')
  constructor(
    private http: HttpClient,
  ) { }

  getAssessmentHierarchy(id: string) {
    return this.http.get(`apis/proxy/v8/questionset/v1/${id}?mode=edit`)
  }

  getContentData(contentId: any): Observable<any> {
    return this.http.get<NsContent.IContent>(`/apis/proxies/v8/action/content/v3/read/${contentId}`).pipe(
      map((data: any) => {
        return data.result.content
      }),
      retry(1))
  }
}