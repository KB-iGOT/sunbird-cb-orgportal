import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { ReusableUserGroupsService } from '../../reusable-user-groups/services/reusable-user-groups.service'

@Injectable()
export class ReuseUserGroupResolveService {
  constructor(private userGroupsSvc: ReusableUserGroupsService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const userGroupId = route.queryParamMap.get('userGroupId')
    if (!userGroupId) {
      return of(null)
    }

    return this.userGroupsSvc.fetchUserGroup(userGroupId).pipe(
      map((res: any) => {
        const result = res && res.result
        if (!result || !result.usergroupid) {
          return null
        }
        return {
          version: 1,
          userGroups: [
            {
              userGroupId: result.usergroupid,
              userGroupName: result.usergroupname,
              userGroupCriteriaList: result.criteria || [],
            },
          ],
        }
      }),
      catchError(() => of(null)),
    )
  }
}
