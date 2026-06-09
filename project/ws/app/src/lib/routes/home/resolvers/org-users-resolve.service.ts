import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { OrgHierarchyService } from '../services/org-hierarchy.service'

export interface IOrgUsersResolveData {
  orgData: any
  parentOrgData: any | null
  error: any | null
}

@Injectable()
export class OrgUsersResolve {
  constructor(private orgHieService: OrgHierarchyService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IOrgUsersResolveData> {
    const organisationId = route.queryParams['roleId']

    if (!organisationId) {
      return of({ orgData: null, parentOrgData: null, error: 'No organisationId provided' })
    }

    const requestBody = {
      request: {
        organisationId,
      },
    }

    return this.orgHieService.getOrgReadData(requestBody).pipe(
      switchMap((data: any) => {
        const orgData = data?.result?.response
        if (orgData?.ministryOrStateType === 'ministry') {
          const parentReqBody = {
            request: {
              organisationId: orgData.ministryOrStateId,
            },
          }
          return this.orgHieService.getOrgReadData(parentReqBody).pipe(
            map((ministryData: any) => {
              const result: IOrgUsersResolveData = {
                orgData,
                parentOrgData: ministryData?.result?.response || null,
                error: null,
              }
              this.orgHieService.setOrgData(result.orgData)
              this.orgHieService.setParentOrgData(result.parentOrgData)
              return result
            }),
          )
        }
        const result: IOrgUsersResolveData = {
          orgData,
          parentOrgData: null,
          error: null,
        }
        this.orgHieService.setOrgData(result.orgData)
        this.orgHieService.setParentOrgData(null)
        return of(result)
      }),
      catchError(error => of({ orgData: null, parentOrgData: null, error })),
    )
  }
}
