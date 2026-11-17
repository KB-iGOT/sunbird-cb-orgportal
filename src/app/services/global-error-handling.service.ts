import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { DialogConfirmComponent } from '../component/dialog-confirm/dialog-confirm.component'

const RELOAD_FLAG = 'chunkReloadAttempted'
const RELOAD_PARAM = 'appReload'
/** Two chunk failures inside this window mean reloading is not fixing it, so the user is asked instead of reloaded again. */
const RELOAD_GUARD_WINDOW_MS = 2 * 60 * 1000

/** How each engine words a failed lazy `chunk-*.js` import; a chunk answered with index.html fails MIME checking rather than 404-ing. */
const CHUNK_ERROR_PATTERNS = [
  /ChunkLoadError/i, // webpack builds
  /Loading (?:chunk|CSS chunk) \S+ failed/i, // webpack builds
  /Failed to fetch dynamically imported module/i, // Chrome, Edge
  /error loading dynamically imported module/i, // Firefox
  /Importing a module script failed/i, // Safari
  /Failed to load module script/i, // chunk answered with the wrong MIME type
]

/** Module level so it is shared by every instance of the service, keeping to one notice however many chunks fail. */
let noticeOpen = false

/** The names and messages of the error plus everything it wraps, flattened into one string. */
function errorText(error: any): string {
  const parts: string[] = []
  let current: any = error
  for (let depth = 0; current && depth < 4; depth += 1) {
    if (typeof current === 'string') {
      parts.push(current)
      break
    }
    parts.push(current.name || '', current.message || '')
    // Angular wraps unhandled promise rejections; native errors chain through `cause`
    current = current.rejection || current.originalError || current.cause
  }
  return parts.filter(part => part).join(' ') || String(error)
}

/** Whether the error is a lazy chunk that could not be loaded. */
export function isChunkLoadError(error: any): boolean {
  if (!error) {
    return false
  }
  return CHUNK_ERROR_PATTERNS.some(pattern => pattern.test(errorText(error)))
}

/** Whether an automatic reload already happened inside the guard window. */
function reloadAttemptedRecently(): boolean {
  try {
    const stamp = Number(sessionStorage.getItem(RELOAD_FLAG))
    return !!stamp && Date.now() - stamp < RELOAD_GUARD_WINDOW_MS
  } catch (e) {
    // With storage blocked the attempt cannot be recorded and a reload would repeat for ever,
    // so treat it as already attempted and let the user decide
    return true
  }
}

/** Records the attempt and reloads the page with a one-off cache-buster, so a cached shell is not served again. */
function reloadPastCache(): void {
  try {
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
  } catch (e) {
    // Nothing to record the attempt in, reloadAttemptedRecently() already fails safe
  }
  try {
    const url = new URL(window.location.href)
    url.searchParams.set(RELOAD_PARAM, String(Date.now()))
    window.location.replace(url.toString())
  } catch (e) {
    window.location.reload()
  }
}

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlingService implements ErrorHandler {

  // Injector rather than MatDialog directly: ErrorHandler is built early, and asking for
  // Material eagerly here risks a DI cycle at bootstrap
  constructor(private injector: Injector) { }

  handleError(error: any): void {
    if (isChunkLoadError(error)) {
      this.handleChunkLoadError(error)
      return
    }
    // tslint:disable-next-line: no-console
    console.error(error)
  }

  /** Recovers once automatically from a missing chunk, and if that did not help, tells the user. */
  handleChunkLoadError(error: any): void {
    // tslint:disable-next-line: no-console
    console.error('CHUNK LOAD FAILED - this tab is running an outdated build >', error)
    if (reloadAttemptedRecently()) {
      this.askUserToReload()
      return
    }
    reloadPastCache()
  }

  private askUserToReload(): void {
    if (noticeOpen) {
      return
    }
    noticeOpen = true
    try {
      const zone = this.injector.get(NgZone)
      const dialog = this.injector.get(MatDialog)
      // The failure can surface from a rejected promise outside Angular's zone, where a
      // dialog would open without change detection running
      zone.run(() => {
        dialog.open(DialogConfirmComponent, {
          disableClose: true,
          data: {
            title: 'A new version is available',
            body: 'This page is running an older version of the portal, so some parts can no longer be '
              + 'loaded. Please save any work in progress and reload to continue.',
            ok: 'Reload',
            cancel: 'Not now',
          },
        })
          .afterClosed()
          .subscribe((confirmed: boolean) => {
            noticeOpen = false
            if (confirmed) {
              reloadPastCache()
            }
          })
      })
    } catch (e) {
      noticeOpen = false
      // tslint:disable-next-line: no-console
      console.error('Could not show the app update notice >', e)
      if (window.confirm('A new version of the portal is available. Reload now to continue?')) {
        reloadPastCache()
      }
    }
  }
}

/** Call once the app has booted: drops the cache-buster from the URL and forgets reload attempts older than the guard window. */
export function clearChunkReloadFlag(): void {
  // A recent attempt is kept on purpose: clearing it on every boot would re-arm the automatic
  // reload each time, which is an endless reload cycle rather than a guard
  try {
    const stamp = Number(sessionStorage.getItem(RELOAD_FLAG))
    if (!stamp || Date.now() - stamp >= RELOAD_GUARD_WINDOW_MS) {
      sessionStorage.removeItem(RELOAD_FLAG)
    }
  } catch (e) {
    // sessionStorage is unavailable
  }
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.has(RELOAD_PARAM)) {
      url.searchParams.delete(RELOAD_PARAM)
      window.history.replaceState(window.history.state, '', url.toString())
    }
  } catch (e) {
    // Leaving the param in the URL is harmless
  }
}
