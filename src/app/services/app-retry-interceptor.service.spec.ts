import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { AppRetryInterceptorService } from './app-retry-interceptor.service'

// Mock timer to resolve immediately in tests
jest.mock('rxjs', () => {
    const actual = jest.requireActual('rxjs')
    return {
        ...actual,
        timer: jest.fn()
    }
})

// Import timer after the mock is set up
// tslint:disable-next-line
const { timer } = require('rxjs')

describe('AppRetryInterceptorService', () => {
    let service: AppRetryInterceptorService
    let mockHttpHandler: jest.Mocked<HttpHandler>

    beforeEach(() => {
        service = new AppRetryInterceptorService()
        mockHttpHandler = {
            handle: jest.fn()
        } as jest.Mocked<HttpHandler>
        // Make timer return an immediately-resolving observable
        timer.mockReturnValue(of(0))
    })

    afterEach(() => {
        timer.mockReturnValue(of(0))
    })

    describe('intercept', () => {
        it('should pass through request without retry when excludeRetry is true', (done) => {
            const mockRequest = new HttpRequest('GET', '/test', { excludeRetry: true })
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })
            mockHttpHandler.handle.mockReturnValue(of(mockResponse))

            service.intercept(mockRequest, mockHttpHandler).subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1)
                    done()
                }
            })
        })

        it('should handle request without body', (done) => {
            const mockRequest = new HttpRequest('GET', '/test')
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })
            mockHttpHandler.handle.mockReturnValue(of(mockResponse))

            service.intercept(mockRequest, mockHttpHandler).subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    done()
                }
            })
        })

        it('should succeed without retry on first attempt', (done) => {
            const mockRequest = new HttpRequest('POST', '/test', { data: 'test' })
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })
            mockHttpHandler.handle.mockReturnValue(of(mockResponse))

            service.intercept(mockRequest, mockHttpHandler).subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1)
                    done()
                }
            })
        })

        it('should retry once on server error and succeed', (done) => {
            const mockRequest = new HttpRequest('POST', '/test', { data: 'test' })
            const mockError = new HttpErrorResponse({ status: 500 })
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })

            mockHttpHandler.handle
                .mockReturnValueOnce(throwError(mockError))
                .mockReturnValueOnce(of(mockResponse))

            service.intercept(mockRequest, mockHttpHandler).subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(2)
                    done()
                },
                error: () => { done(); fail('Should not error') }
            })
        })

        it('should fail after exceeding maxAttempts', (done) => {
            const mockRequest = new HttpRequest('POST', '/test', { data: 'test' })
            const mockError = new HttpErrorResponse({ status: 500 })

            mockHttpHandler.handle.mockReturnValue(throwError(mockError))

            service.intercept(mockRequest, mockHttpHandler).subscribe({
                next: () => { done(); fail('Should not succeed') },
                error: (error) => {
                    expect(error).toBe(mockError)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1)
                    done()
                }
            })
        })
    })

    describe('shouldRetry', () => {
        it('should return true for server errors (status > 499)', () => {
            expect((service as any).shouldRetry(new HttpErrorResponse({ status: 500 }))).toBe(true)
            expect((service as any).shouldRetry(new HttpErrorResponse({ status: 502 }))).toBe(true)
            expect((service as any).shouldRetry(new HttpErrorResponse({ status: 503 }))).toBe(true)
        })

        it('should return false for client errors (status <= 499)', () => {
            expect((service as any).shouldRetry(new HttpErrorResponse({ status: 400 }))).toBe(false)
            expect((service as any).shouldRetry(new HttpErrorResponse({ status: 404 }))).toBe(false)
            expect((service as any).shouldRetry(new HttpErrorResponse({ status: 499 }))).toBe(false)
        })
    })

    describe('genericRetryStrategy', () => {
        it('should be a function', () => {
            expect(typeof (service as any).genericRetryStrategy).toBe('function')
        })

        it('should return a function when called', () => {
            const strategy = (service as any).genericRetryStrategy()
            expect(typeof strategy).toBe('function')
        })

        it('should throw error for non-retryable status code', (done) => {
            const mockError = new HttpErrorResponse({ status: 400 })
            const retryStrategy = (service as any).genericRetryStrategy()
            const attempts = of(mockError)

            retryStrategy(attempts).subscribe({
                error: (err: any) => {
                    expect(err).toBe(mockError)
                    done()
                }
            })
        })
    })
})
