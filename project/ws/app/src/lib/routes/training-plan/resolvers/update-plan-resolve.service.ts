import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { TrainingPlanService } from '../services/traininig-plan.service'
import { map, switchMap, catchError } from 'rxjs/operators'
/* tslint:disable */
import _ from 'lodash'
/* tslint:enable */
import { InitService } from '../../../../../../../../src/app/services/init.service'
import { environment } from '../../../../../../../../src/environments/environment'
@Injectable()
export class UpdatePlanResolveService {
  constructor(
    private tpSvc: TrainingPlanService,
    private initService: InitService,
  ) { }
  resolve(
    _route: ActivatedRouteSnapshot
  ): Observable<any> {
    // The plan read API returns contentList as a plain list of content ids. The complete content is
    // read once here, it is what the competency summary is built on and what the selected items
    // dialog shows, so neither of them is limited to the page of results being displayed.
    return this.tpSvc.readPlanV3(_route.paramMap.get('planId')).pipe(
      map((_res: any) => {
        return _res.result.content
      }),
      switchMap((content: any) => this.addContentDetails(content))
    )
  }

  /**
   * Replaces the content ids of the plan with the complete content, keeping the order of the plan.
   */
  private addContentDetails(content: any): Observable<any> {
    const contentList = _.get(content, 'contentList') || []
    const contentIds = contentList
      .map((item: any) => (typeof item === 'string' ? item : _.get(item, 'identifier')))
      .filter((identifier: any) => !!identifier)

    // Nothing to read, contentList is empty or the API already returned the complete content
    const isAlreadyDetailed = contentList.every((item: any) => item && typeof item !== 'string')
    if (!contentIds.length || isAlreadyDetailed) {
      return of(content)
    }

    const competencyKey = _.get(this.initService.configSvc,
                                `compentency.${environment.compentencyVersionKey}.vKey`)
    const isModeratedCourse = _.get(content, 'contentType') === 'Moderated Course'

    return this.tpSvc.getContentByIds(contentIds, competencyKey, isModeratedCourse).pipe(
      map((contentDetails: any[]) => {
        content.contentList = this.mergeContentDetails(contentIds, contentDetails)
        return content
      }),
      catchError(() => {
        content.contentList = this.mergeContentDetails(contentIds, [])
        return of(content)
      })
    )
  }

  /**
   * Keeps the content in the order of the plan. A content whose details could not be read is kept
   * with its id alone so it is never dropped from the plan on the next save.
   */
  private mergeContentDetails(contentIds: string[], contentDetails: any[]): any[] {
    const detailsById = _.keyBy(contentDetails || [], 'identifier')
    return contentIds.map((identifier: string) => detailsById[identifier] || { identifier })
  }
}
