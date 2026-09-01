import { Injectable } from '@angular/core'
import { Resolve, Router } from '@angular/router'
import { Observable, of } from 'rxjs'
import { environment } from '../../../../../../../../src/environments/environment'
@Injectable({ providedIn: 'root' })
export class AICBPConfigResolver implements Resolve<any> {


  constructor(private router: Router) { }

  resolve(): Observable<any> {
    console.log('✅ NEW RESOLVER RUNNING')
    console.log('environment--', environment)
    const navigation = this.router.getCurrentNavigation()

    const stateData = navigation?.extras?.state?.['configData']

    console.log('STATE DATA =>', stateData)

    return of({
      configDetails: environment,
      baseUrl: environment.mdoPath,
      parentAppData: stateData,
    })
  }
}
