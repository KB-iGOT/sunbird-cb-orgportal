import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import * as _ from 'lodash'
import { FormExtService } from '../../../services/form-ext.service'

@Injectable()
export class EventCategoryResolverService {

  constructor(private formSvc: FormExtService) { }

  resolve(): Observable<string[]> {
    const requestData = { "request": { "type": "page", "subType": "slwResourceTypeDetails", "action": "page-configuration", "component": "spv", "rootOrgId": "*" } }
    return this.formSvc.formReadData(requestData).pipe(
      map((res: any) => {
        return _.get(res, 'result.form.data', [])
      }),
      catchError(() => of([])),
    )
  }
}
