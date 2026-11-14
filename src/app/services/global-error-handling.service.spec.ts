jest.mock('../component/dialog-confirm/dialog-confirm.component', () => ({ DialogConfirmComponent: class {} }))

import { NgZone } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { of, Subject } from 'rxjs'
import { clearChunkReloadFlag, GlobalErrorHandlingService, isChunkLoadError } from './global-error-handling.service'

describe('GlobalErrorHandlingService', () => {
    let service: GlobalErrorHandlingService
    let dialog: { open: jest.Mock }
    let zone: { run: jest.Mock }
    let replaceSpy: jest.Mock
    const originalLocation = window.location

    const chunkError = new TypeError('Failed to fetch dynamically imported module: https://mdo.example/chunk-ABC.js')

    beforeEach(() => {
        jest.clearAllMocks()
        sessionStorage.clear()
        jest.spyOn(console, 'error').mockImplementation(() => undefined)

        replaceSpy = jest.fn()
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { href: 'https://mdo.example/app/home?tab=1', replace: replaceSpy, reload: jest.fn() },
        })

        dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => of(false) }) }
        zone = { run: jest.fn((fn: () => void) => fn()) }
        const injector: any = {
            get: jest.fn((token: any) => (token === MatDialog ? dialog : token === NgZone ? zone : undefined)),
        }
        service = new GlobalErrorHandlingService(injector)
    })

    afterAll(() => {
        Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
    })

    it('should create an instance of the service', () => {
        expect(service).toBeTruthy()
    })

    describe('isChunkLoadError', () => {
        it.each([
            ['ChunkLoadError: Loading chunk 12 failed'],
            ['Loading CSS chunk 7 failed'],
            ['Failed to fetch dynamically imported module: /chunk-A.js'],
            ['error loading dynamically imported module'],
            ['Importing a module script failed.'],
            ['Failed to load module script: Expected a JavaScript-or-Wasm module script'],
        ])('should detect "%s"', message => {
            expect(isChunkLoadError(new Error(message))).toBe(true)
        })

        it('should detect a chunk error wrapped in an unhandled promise rejection', () => {
            expect(isChunkLoadError({ message: 'Uncaught (in promise)', rejection: chunkError })).toBe(true)
        })

        it('should detect a chunk error passed as a plain string', () => {
            expect(isChunkLoadError('Importing a module script failed.')).toBe(true)
        })

        it('should not treat other errors as chunk errors', () => {
            expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
            expect(isChunkLoadError(null)).toBe(false)
        })
    })

    describe('handleError', () => {
        it('should log other errors without reloading or rethrowing', () => {
            const error = new Error('something else')

            expect(() => service.handleError(error)).not.toThrow()

            // tslint:disable-next-line: no-console
            expect(console.error).toHaveBeenCalledWith(error)
            expect(replaceSpy).not.toHaveBeenCalled()
            expect(dialog.open).not.toHaveBeenCalled()
        })

        it('should reload once with a cache-buster on the first chunk failure', () => {
            service.handleError(chunkError)

            expect(replaceSpy).toHaveBeenCalledTimes(1)
            const url = new URL(replaceSpy.mock.calls[0][0])
            expect(url.pathname).toBe('/app/home')
            expect(url.searchParams.get('tab')).toBe('1')
            expect(url.searchParams.get('appReload')).toBeTruthy()
            expect(Number(sessionStorage.getItem('chunkReloadAttempted'))).toBeGreaterThan(0)
            expect(dialog.open).not.toHaveBeenCalled()
        })

        it('should ask the user instead of reloading again inside the guard window', () => {
            sessionStorage.setItem('chunkReloadAttempted', String(Date.now()))

            service.handleError(chunkError)

            expect(replaceSpy).not.toHaveBeenCalled()
            expect(zone.run).toHaveBeenCalled()
            expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                disableClose: true,
                data: expect.objectContaining({ ok: 'Reload', cancel: 'Not now' }),
            }))
        })

        it('should reload automatically again once the guard window has passed', () => {
            sessionStorage.setItem('chunkReloadAttempted', String(Date.now() - 3 * 60 * 1000))

            service.handleError(chunkError)

            expect(replaceSpy).toHaveBeenCalledTimes(1)
            expect(dialog.open).not.toHaveBeenCalled()
        })

        it('should reload when the user confirms the notice', () => {
            sessionStorage.setItem('chunkReloadAttempted', String(Date.now()))
            dialog.open.mockReturnValue({ afterClosed: () => of(true) })

            service.handleError(chunkError)

            expect(replaceSpy).toHaveBeenCalledTimes(1)
        })

        it('should open only one notice while it is still showing', () => {
            sessionStorage.setItem('chunkReloadAttempted', String(Date.now()))
            const closed = new Subject<boolean>()
            dialog.open.mockReturnValue({ afterClosed: () => closed })

            service.handleError(chunkError)
            service.handleError(chunkError)

            expect(dialog.open).toHaveBeenCalledTimes(1)

            // Closing the notice lets a later failure show it again
            closed.next(false)
            service.handleError(chunkError)
            expect(dialog.open).toHaveBeenCalledTimes(2)
            closed.next(false)
        })

        it('should fall back to window.confirm when the dialog cannot be opened', () => {
            sessionStorage.setItem('chunkReloadAttempted', String(Date.now()))
            zone.run.mockImplementation(() => { throw new Error('no dialog') })
            const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

            service.handleError(chunkError)

            expect(confirmSpy).toHaveBeenCalled()
            expect(replaceSpy).toHaveBeenCalledTimes(1)
        })

        it('should not reload automatically when sessionStorage is blocked', () => {
            jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })

            service.handleError(chunkError)

            expect(replaceSpy).not.toHaveBeenCalled()
            jest.restoreAllMocks()
        })
    })

    describe('clearChunkReloadFlag', () => {
        let replaceStateSpy: jest.SpyInstance

        beforeEach(() => {
            replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined)
        })

        it('should forget a reload attempt older than the guard window', () => {
            sessionStorage.setItem('chunkReloadAttempted', String(Date.now() - 3 * 60 * 1000))

            clearChunkReloadFlag()

            expect(sessionStorage.getItem('chunkReloadAttempted')).toBeNull()
        })

        it('should keep a recent reload attempt so the guard stays armed', () => {
            const stamp = String(Date.now())
            sessionStorage.setItem('chunkReloadAttempted', stamp)

            clearChunkReloadFlag()

            expect(sessionStorage.getItem('chunkReloadAttempted')).toBe(stamp)
        })

        it('should drop the cache-buster from the address bar', () => {
            window.location.href = 'https://mdo.example/app/home?tab=1&appReload=123'

            clearChunkReloadFlag()

            expect(replaceStateSpy).toHaveBeenCalledWith(window.history.state, '', 'https://mdo.example/app/home?tab=1')
        })

        it('should leave the URL alone when there is no cache-buster', () => {
            clearChunkReloadFlag()

            expect(replaceStateSpy).not.toHaveBeenCalled()
        })
    })
})
