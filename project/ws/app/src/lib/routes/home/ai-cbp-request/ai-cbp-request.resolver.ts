import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { environment } from '../../../../../../../../src/environments/environment'
@Injectable({ providedIn: 'root' })
export class AICBPConfigResolver implements Resolve<any> {


  constructor() { }

  resolve(): Observable<any> {
    console.log('✅ NEW RESOLVER RUNNING')
    console.log('environment--', environment)
    return of({
      configDetails: environment,
      baseUrl: "https://portal.dev.karmayogibharat.net/"
    })
  }
}
