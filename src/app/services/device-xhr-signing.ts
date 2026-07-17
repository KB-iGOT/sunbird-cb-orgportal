import { DeviceKeyService } from './device-key.service'

/**
 * Global XMLHttpRequest shim that signs same-origin /apis/ requests made OUTSIDE
 * Angular's HttpClient — e.g. the telemetry SDK dispatches through jQuery.ajax,
 * which no Angular interceptor can reach. jQuery, the telemetry SDK and Angular
 * itself all sit on top of XHR, so this covers every transport in one place.
 *
 * Requests already carrying X-Device-Signature (set by the Angular interceptor via
 * setRequestHeader) are left untouched. Synchronous XHRs (async=false, e.g. unload
 * flushes) cannot defer send() for async crypto and go out unsigned — ui-proxy
 * treats those like any other unsigned request (419 in enforce mode, no session kill).
 */
export function installDeviceXhrSigning(deviceKeySvc: DeviceKeyService): void {
  const proto = XMLHttpRequest.prototype as any
  if (!deviceKeySvc.isSupported || proto.__deviceSigningInstalled) {
    return
  }
  proto.__deviceSigningInstalled = true

  const origOpen = proto.open
  const origSend = proto.send
  const origSetRequestHeader = proto.setRequestHeader

  proto.open = function (method: string, url: string | URL, isAsync?: boolean, username?: string | null, password?: string | null) {
    this.__dsMethod = String(method || 'GET')
    this.__dsUrl = String(url)
    this.__dsAsync = arguments.length < 3 || isAsync !== false
    return origOpen.call(this, method, url, this.__dsAsync, username || null, password || null)
  }

  proto.setRequestHeader = function (name: string, value: string) {
    if (String(name).toLowerCase() === 'x-device-signature') {
      this.__dsAlreadySigned = true
    }
    return origSetRequestHeader.call(this, name, value)
  }

  proto.send = function (body?: any) {
    const apiPath = this.__dsUrl ? deviceKeySvc.toApiPath(this.__dsUrl) : null
    if (!apiPath || this.__dsAlreadySigned || !this.__dsAsync) {
      return origSend.call(this, body)
    }
    const xhr = this
    deviceKeySvc.buildSignatureHeaders(this.__dsMethod, apiPath)
      .then(headers => {
        if (headers) {
          Object.keys(headers).forEach(h => origSetRequestHeader.call(xhr, h, headers[h]))
        }
      })
      .catch(() => undefined)
      // fail open: send unsigned rather than swallow the request; ui-proxy decides
      .then(() => origSend.call(xhr, body))
  }
}
