import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http'
import { Observable, from } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { DeviceKeyService } from './device-key.service'

/**
 * Signs every backend API call made through Angular's HttpClient with this browser's
 * non-extractable device key so ui-proxy can reject a session cookie replayed from a
 * different browser. Public endpoints and non-API requests are left untouched.
 * Non-Angular transports (e.g. the telemetry SDK's jQuery.ajax) are covered by the
 * XMLHttpRequest shim in device-xhr-signing.ts.
 */
@Injectable({ providedIn: 'root' })
export class DeviceSigningInterceptorService implements HttpInterceptor {
  constructor(private deviceKeySvc: DeviceKeyService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiPath = this.deviceKeySvc.toApiPath(req.urlWithParams)
    if (!apiPath || !this.deviceKeySvc.isSupported) {
      return next.handle(req)
    }
    return from(this.deviceKeySvc.buildSignatureHeaders(req.method, apiPath)).pipe(
      switchMap(headers => next.handle(headers ? req.clone({ setHeaders: headers }) : req)),
    )
  }
}
