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
    // The plan read API returns contentList as { identifier, mandatory } entries. The complete
    // content is read once here, it is what the competency summary is built on and what the
    // selected items dialog shows, so neither of them is limited to the page of results shown.
    return this.tpSvc.adminReadV4(_route.paramMap.get('planId')).pipe(
      map((_res: any) => {
        return _res.result.content
      }),
      switchMap((content: any) => this.addContentDetails(content))
    )
  }

  /**
   * Replaces the content entries of the plan with the complete content, keeping the order of the
   * plan and the mandatory flag the plan was saved with.
   */
  private addContentDetails(content: any): Observable<any> {
    const contentList = _.get(content, 'contentList') || []
    // Plans saved before the CA gating was added hold plain content ids, they are read as not
    // gating the CA
    const contentEntries = contentList
      .map((item: any) => ({
        identifier: (typeof item === 'string') ? item : _.get(item, 'identifier'),
        mandatory: (typeof item === 'string') ? false : !!_.get(item, 'mandatory'),
      }))
      .filter((entry: any) => !!entry.identifier)

    // Nothing to read, contentList is empty or the API already returned the complete content.
    // An entry carrying a name is a complete content, an { identifier, mandatory } one is not
    const isAlreadyDetailed = contentList.length > 0 &&
      contentList.every((item: any) => item && typeof item !== 'string' && !!item.name)
    if (!contentEntries.length || isAlreadyDetailed) {
      return of(content)
    }

    const competencyKey = _.get(this.initService.configSvc,
                                `compentency.${environment.compentencyVersionKey}.vKey`)
    const isModeratedCourse = _.get(content, 'contentType') === 'Moderated Course'
    const contentIds = contentEntries.map((entry: any) => entry.identifier)

    return this.tpSvc.getContentByIds(contentIds, competencyKey, isModeratedCourse).pipe(
      map((contentDetails: any[]) => {
        content.contentList = this.mergeContentDetails(contentEntries, contentDetails)
        return content
      }),
      catchError(() => {
        content.contentList = this.mergeContentDetails(contentEntries, [])
        return of(content)
      })
    )
  }

  /**
   * Keeps the content in the order of the plan and carries the mandatory flag of the plan onto the
   * content read. A content whose details could not be read is kept with its id alone so it is
   * never dropped from the plan on the next save.
   */
  private mergeContentDetails(contentEntries: any[], contentDetails: any[]): any[] {
    const detailsById = _.keyBy(contentDetails || [], 'identifier')
    return contentEntries.map((entry: any) => ({
      ...(detailsById[entry.identifier] || {}),
      identifier: entry.identifier,
      mandatory: entry.mandatory,
    }))
  }
}
