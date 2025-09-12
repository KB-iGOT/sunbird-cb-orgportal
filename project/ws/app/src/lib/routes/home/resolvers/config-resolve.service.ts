import { Injectable, SkipSelf } from '@angular/core'

import { Observable, of } from 'rxjs'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
@Injectable()
export class ConfigResolveService {
  constructor(
    @SkipSelf() private confService: ConfigurationsService,
  ) { }
  resolve(
  ): Observable<any> {
    return of({ ...this.confService })
  }
}
