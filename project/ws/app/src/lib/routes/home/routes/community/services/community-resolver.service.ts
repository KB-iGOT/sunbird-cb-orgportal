import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'
import { of, Observable } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { CommunityService } from './community.service'
import * as _ from 'lodash'

@Injectable({
  providedIn: 'root'
})
export class CommunityResolverService {

  constructor(private communitySvc: CommunityService) { }

  resolve(activatedRoute: ActivatedRoute): Observable<any> {
    const id = _.get(activatedRoute, 'params.communityId', '').replace(':', '')
    return this.communitySvc.getCommunityDetailsById(id)
      .pipe(
        map((data: any) => {
          const requiredData = _.get(data, 'result.communityDetails')
          return { data: requiredData, error: null }
        }),
        catchError((err: any) => {
          return of({ data: null, error: err })
        })
      )
  }
}