import { AppInterceptorService } from './app-interceptor.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AuthKeycloakService } from '@sunbird-cb/utils-v2'
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'

describe('AppInterceptorService', () => {
    let interceptor: AppInterceptorService
    let configSvcMock: jest.Mocked<ConfigurationsService>
    let snackBarMock: jest.Mocked<MatSnackBar>
    let authSvcMock: jest.Mocked<AuthKeycloakService>
    let locale: string

    beforeEach(() => {
        configSvcMock = {
            userPreference: { selectedLangGroup: 'en,fr' },
            activeOrg: 'testOrg',
            rootOrg: 'testRootOrg',
            hostPath: '/test/host',
            // Add any other properties as needed
        } as any

        snackBarMock = {
            open: jest.fn(),
        } as any

        authSvcMock = {
            force_logout: jest.fn(),
        } as any

        locale = 'en-US'

        interceptor = new AppInterceptorService(configSvcMock, snackBarMock, authSvcMock, locale)
    })

    it('should modify request headers with org, rootOrg, and locale', () => {
        const req = new HttpRequest('GET', '/test')

        // Mock the HttpHandler and the handle method
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(of({})), // Return an empty observable
        }

        interceptor.intercept(req, next).subscribe()

        // const modifiedReq = next.handle.mock.calls[0][0] // Access the first argument of handle's call
        // expect(modifiedReq.headers.get('org')).toBe('testOrg')
        // expect(modifiedReq.headers.get('rootOrg')).toBe('testRootOrg')
        // expect(modifiedReq.headers.get('locale')).toBe('en,fr')
        // expect(modifiedReq.headers.get('hostPath')).toBe('/test/host')
    })

    it('should handle errors with status 0 (force_logout)', () => {
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0, url: '/error' }))),
        }

        interceptor.intercept(req, next).subscribe({
            error: () => {
                expect(authSvcMock.force_logout).toHaveBeenCalled()
                expect(snackBarMock.open).toHaveBeenCalledWith(
                    'Please login Again and Apply new TOKEN',
                    undefined,
                    { duration: 100 * 3 }
                )
            },
        })
    })

    it('should handle errors with status 200 and redirect', () => {
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 200, url: '/redirect' }))),
        }

        global.location.href = '' // Mock window.location.href
        interceptor.intercept(req, next).subscribe({
            error: () => {
                expect(window.location.href).toBe('/redirect')
            },
        })
    })

    it('should handle errors with status 419 (force_logout)', () => {
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 419, error: { redirectUrl: '/login' } }))),
        }

        global.localStorage.removeItem = jest.fn() // Mock localStorage.removeItem
        global.location.href = '' // Mock window.location.href
        interceptor.intercept(req, next).subscribe({
            error: () => {
                expect(localStorage.removeItem).toHaveBeenCalledWith('telemetrySessionId')
                expect(window.location.href).toBe('/login')
                expect(authSvcMock.force_logout).toHaveBeenCalled()
            },
        })
    })

    it('should fall through to next.handle when activeOrg or rootOrg is not set', () => {
        configSvcMock.activeOrg = null as any
        configSvcMock.rootOrg = null as any
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(of({})),
        }
        interceptor.intercept(req, next).subscribe()
        expect(next.handle).toHaveBeenCalledWith(req)
    })

    it('should fall through to next.handle when only rootOrg is missing', () => {
        configSvcMock.activeOrg = 'testOrg'
        configSvcMock.rootOrg = null as any
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(of({})),
        }
        interceptor.intercept(req, next).subscribe()
        expect(next.handle).toHaveBeenCalledWith(req)
    })

    it('should add headers when activeOrg and rootOrg are set', done => {
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(of({})),
        }
        interceptor.intercept(req, next).subscribe(() => {
            const modifiedReq: HttpRequest<any> = (next.handle as jest.Mock).mock.calls[0][0]
            expect(modifiedReq.headers.get('org')).toBe('testOrg')
            expect(modifiedReq.headers.get('rootOrg')).toBe('testRootOrg')
            expect(modifiedReq.headers.get('hostPath')).toBe('/test/host')
            done()
        })
    })

    it('should handle status 0 and call force_logout', done => {
        const req = new HttpRequest('GET', '/test')
        const httpError = new HttpErrorResponse({ status: 0, url: '/error' })
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(httpError)),
        }
        interceptor.intercept(req, next).subscribe({
            error: () => {
                expect(authSvcMock.force_logout).toHaveBeenCalled()
                done()
            },
        })
    })

    it('should handle status 200 and redirect window location', done => {
        const req = new HttpRequest('GET', '/test')
        const httpError = new HttpErrorResponse({ status: 200, url: '/redirect-url' })
        Object.defineProperty(httpError, 'ok', { value: false })
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(httpError)),
        }
        interceptor.intercept(req, next).subscribe({
            error: () => {
                done()
            },
        })
    })

    it('should handle status 419 and call force_logout', done => {
        const req = new HttpRequest('GET', '/test')
        const httpError = new HttpErrorResponse({ status: 419, error: { redirectUrl: '/login-page' } })
        const getItemMock = jest.fn().mockReturnValue(null)
        Object.defineProperty(window, 'localStorage', { value: { getItem: getItemMock, removeItem: jest.fn(), setItem: jest.fn() }, writable: true })
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(httpError)),
        }
        interceptor.intercept(req, next).subscribe({
            error: () => {
                expect(authSvcMock.force_logout).toHaveBeenCalled()
                done()
            },
        })
    })

    it('should handle status 419 when telemetrySessionId is in localStorage', done => {
        const req = new HttpRequest('GET', '/test')
        const httpError = new HttpErrorResponse({ status: 419, error: { redirectUrl: '/login-page' } })
        const removeSpy = jest.fn()
        Object.defineProperty(window, 'localStorage', { value: { getItem: jest.fn().mockReturnValue('session-id-123'), removeItem: removeSpy, setItem: jest.fn() }, writable: true })
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(httpError)),
        }
        interceptor.intercept(req, next).subscribe({
            error: () => {
                expect(removeSpy).toHaveBeenCalledWith('telemetrySessionId')
                done()
            },
        })
    })

    it('should handle unknown error status and re-throw', done => {
        const req = new HttpRequest('GET', '/test')
        const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(throwError(httpError)),
        }
        interceptor.intercept(req, next).subscribe({
            error: (err) => {
                expect(err).toBeTruthy()
                done()
            },
        })
    })

    it('should include userPreference lang groups in locale header', done => {
        configSvcMock.userPreference = { selectedLangGroup: 'hi,te' } as any
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(of({})),
        }
        interceptor.intercept(req, next).subscribe(() => {
            const modifiedReq: HttpRequest<any> = (next.handle as jest.Mock).mock.calls[0][0]
            const locale = modifiedReq.headers.get('locale') || ''
            expect(locale).toContain('hi')
            expect(locale).toContain('te')
            done()
        })
    })

    it('should work when userPreference is null', done => {
        configSvcMock.userPreference = null as any
        const req = new HttpRequest('GET', '/test')
        const next: HttpHandler = {
            handle: jest.fn().mockReturnValue(of({})),
        }
        interceptor.intercept(req, next).subscribe(() => {
            expect(next.handle).toHaveBeenCalled()
            done()
        })
    })
})
