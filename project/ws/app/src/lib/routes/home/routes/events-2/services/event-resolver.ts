import { Injectable } from '@angular/core'
import { catchError, map, switchMap } from 'rxjs/operators'
import { of, Observable } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { EventsService } from './events.service'
import * as _ from 'lodash'

@Injectable()
export class EventResolverService {

  constructor(private eventSvc: EventsService) { }

  resolve(activatedRoute: ActivatedRoute): Observable<any> {
    const id = _.get(activatedRoute, 'params.eventId', '').replace(':', '')
    const queryParams: any = _.get(activatedRoute, 'queryParams', {})
    let getLiveData = false
    if (queryParams['mode'] === 'view' && queryParams['pathUrl'] === 'upcoming') {
      getLiveData = true
    }

    if (queryParams['pathUrl'] === 'rejected' || queryParams['pathUrl'] === 'draft') {
      const callWithMode = this.eventSvc.getEventDetailsByid(id, false)
      const callWithOutMode = this.eventSvc.getEventDetailsByid(id, true)

      return callWithMode.pipe(
        map((responseFalse: any) => {
          const requiredData = _.get(responseFalse, 'result.event')
          return callWithOutMode.pipe(
            map((responseTrue: any) => {
              const liveStatus = _.get(responseTrue, 'result.event.status')
              if (liveStatus.toLowerCase() !== 'live') {
                delete requiredData['prevStatus']
              }
              return { data: requiredData, error: null }
            }),
            catchError((err: any) => {
              return of({ data: null, error: err })
            })
          )
        }),
        catchError((err: any) => {
          return of({ data: null, error: err })
        }),
        switchMap((result: any) => result)
      )
    } else {
      return this.eventSvc.getEventDetailsByid(id, getLiveData).pipe(
        map((data: any) => {
          const requiredData = _.get(data, 'result.event')
          return { data: requiredData, error: null }
        }),
        catchError((err: any) => {
          return of({ data: null, error: err })
        })
      )
    }
  }
}
