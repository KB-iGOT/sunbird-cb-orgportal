import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http'
import { of, throwError, timer } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { AppRetryInterceptorService } from './app-retry-interceptor.service'

// Mock timer to avoid actual delays in tests
jest.mock('rxjs', () => ({
    ...jest.requireActual('rxjs'),
    timer: jest.fn()
}))

const mockedTimer = timer as jest.MockedFunction<typeof timer>

describe('AppRetryInterceptorService', () => {
    let service: AppRetryInterceptorService
    let mockHttpHandler: jest.Mocked<HttpHandler>
    let testScheduler: TestScheduler

    beforeEach(() => {
        service = new AppRetryInterceptorService()

        // Create a mocked HttpHandler
        mockHttpHandler = {
            handle: jest.fn()
        } as jest.Mocked<HttpHandler>

        // Setup test scheduler for RxJS testing
        testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected)
        })

        // Reset timer mock
        mockedTimer.mockClear()
    })

    describe('intercept', () => {
        it('should pass through request without retry when excludeRetry is true', (done) => {
            // Arrange
            const mockRequest = new HttpRequest('GET', '/test', { excludeRetry: true })
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })
            mockHttpHandler.handle.mockReturnValue(of(mockResponse))

            // Act
            const result = service.intercept(mockRequest, mockHttpHandler)

            // Assert
            result.subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1)
                    expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest)
                    done()
                }
            })
        })

        it('should pass through request without retry when body is null', (done) => {
            // Arrange
            const mockRequest = new HttpRequest('GET', '/test', null)
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })
            mockHttpHandler.handle.mockReturnValue(of(mockResponse))

            // Act
            const result = service.intercept(mockRequest, mockHttpHandler)

            // Assert
            result.subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1)
                    done()
                }
            })
        })

        it('should pass through request without retry when body exists but excludeRetry is false', (done) => {
            // Arrange
            const mockRequest = new HttpRequest('POST', '/test', { data: 'test', excludeRetry: false })
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })
            mockHttpHandler.handle.mockReturnValue(of(mockResponse))

            // Act
            const result = service.intercept(mockRequest, mockHttpHandler)

            // Assert
            result.subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1)
                    done()
                }
            })
        })

        it('should apply retry strategy when request succeeds after retry', () => {
            testScheduler.run(({ cold, expectObservable }) => {
                // Arrange
                const mockRequest = new HttpRequest('GET', '/test', { data: 'test' })
                const mockError = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })
                const mockResponse = new HttpResponse({ status: 200, body: 'success' })

                // First call fails, second call succeeds
                mockHttpHandler.handle
                    .mockReturnValueOnce(throwError(() => mockError))
                    .mockReturnValueOnce(of(mockResponse))

                // Mock timer to return immediately for testing
                mockedTimer.mockReturnValue(cold('--|', {}, of(0)))

                // Act
                const result = service.intercept(mockRequest, mockHttpHandler)

                // Assert
                expectObservable(result).toBe('---(r|)', { r: mockResponse })
                expect(mockHttpHandler.handle).toHaveBeenCalledTimes(2)
            })
        })
    })

    describe('shouldRetry', () => {
        it('should return true for server errors (status > 499)', () => {
            // Arrange
            const error500 = new HttpErrorResponse({ status: 500 })
            const error502 = new HttpErrorResponse({ status: 502 })
            const error503 = new HttpErrorResponse({ status: 503 })

            // Act & Assert
            expect((service as any).shouldRetry(error500)).toBe(true)
            expect((service as any).shouldRetry(error502)).toBe(true)
            expect((service as any).shouldRetry(error503)).toBe(true)
        })

        it('should return false for client errors (status <= 499)', () => {
            // Arrange
            const error400 = new HttpErrorResponse({ status: 400 })
            const error404 = new HttpErrorResponse({ status: 404 })
            const error499 = new HttpErrorResponse({ status: 499 })

            // Act & Assert
            expect((service as any).shouldRetry(error400)).toBe(false)
            expect((service as any).shouldRetry(error404)).toBe(false)
            expect((service as any).shouldRetry(error499)).toBe(false)
        })
    })

    describe('genericRetryStrategy', () => {
        it('should retry when attempt is within maxAttempts and error should be retried', () => {
            testScheduler.run(({ cold, expectObservable }) => {
                // Arrange
                const mockError = new HttpErrorResponse({ status: 500 })
                const retryStrategy = (service as any).genericRetryStrategy()

                // Mock timer to emit after delay
                mockedTimer.mockReturnValue(cold('--x|', { x: 0 }))

                // Create attempts observable that emits the error
                const attempts = cold('a|', { a: mockError })

                // Act
                const result = retryStrategy(attempts)

                // Assert
                expectObservable(result).toBe('--x|', { x: 0 })
                expect(mockedTimer).toHaveBeenCalledWith(5000) // 1 * 5000
            })
        })

        it('should throw error when maxAttempts exceeded', () => {
            testScheduler.run(({ cold, expectObservable }) => {
                // Arrange
                const mockError = new HttpErrorResponse({ status: 500 })
                const retryStrategy = (service as any).genericRetryStrategy()

                // Create attempts observable that emits error twice (exceeding maxAttempts of 1)
                const attempts = cold('ab|', { a: mockError, b: mockError })

                // Act
                const result = retryStrategy(attempts)

                // Assert - second attempt should throw error
                expectObservable(result).toBe('a#', { a: 0 }, mockError)
            })
        })

        it('should throw error immediately when error should not be retried', () => {
            testScheduler.run(({ cold, expectObservable }) => {
                // Arrange
                const mockError = new HttpErrorResponse({ status: 400 }) // Client error
                const retryStrategy = (service as any).genericRetryStrategy()

                // Create attempts observable
                const attempts = cold('a|', { a: mockError })

                // Act
                const result = retryStrategy(attempts)

                // Assert
                expectObservable(result).toBe('#', {}, mockError)
                expect(mockedTimer).not.toHaveBeenCalled()
            })
        })

        it('should use correct scaling duration for multiple attempts', () => {
            testScheduler.run(({ cold, expectObservable }) => {
                // Arrange
                const mockError = new HttpErrorResponse({ status: 500 })

                    // Temporarily increase maxAttempts to test scaling
                    ; (service as any).maxAttempts = 2

                const retryStrategy = (service as any).genericRetryStrategy()

                // Mock timer to return observables for different attempts
                mockedTimer
                    .mockReturnValueOnce(cold('--x|', { x: 0 })) // First retry: 1 * 5000
                    .mockReturnValueOnce(cold('----x|', { x: 0 })) // Second retry: 2 * 5000

                // Create attempts observable with two errors
                const attempts = cold('ab|', { a: mockError, b: mockError })

                // Act
                const result = retryStrategy(attempts)

                // Assert
                expectObservable(result).toBe('--(a----b)|', { a: 0, b: 0 })
                expect(mockedTimer).toHaveBeenNthCalledWith(1, 5000) // 1 * 5000
                expect(mockedTimer).toHaveBeenNthCalledWith(2, 10000) // 2 * 5000
            })
        })
    })

    describe('integration tests', () => {
        it('should complete full retry cycle and succeed', (done) => {
            // Arrange
            const mockRequest = new HttpRequest('POST', '/test', { data: 'test' })
            const mockError = new HttpErrorResponse({ status: 500 })
            const mockResponse = new HttpResponse({ status: 200, body: 'success' })

            // Mock handler to fail first, succeed second
            mockHttpHandler.handle
                .mockReturnValueOnce(throwError(() => mockError))
                .mockReturnValueOnce(of(mockResponse))

            // Mock timer to resolve immediately for testing
            mockedTimer.mockReturnValue(of(0))

            // Act
            const result = service.intercept(mockRequest, mockHttpHandler)

            // Assert
            result.subscribe({
                next: (response) => {
                    expect(response).toBe(mockResponse)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(2)
                    expect(mockedTimer).toHaveBeenCalledWith(5000)
                    done()
                },
                error: () => {
                    fail('Should not have errored')
                    done()
                }
            })
        })

        it('should fail after exceeding maxAttempts', (done) => {
            // Arrange
            const mockRequest = new HttpRequest('POST', '/test', { data: 'test' })
            const mockError = new HttpErrorResponse({ status: 500 })

            // Mock handler to always fail
            mockHttpHandler.handle.mockReturnValue(throwError(() => mockError))

            // Mock timer to resolve immediately
            mockedTimer.mockReturnValue(of(0))

            // Act
            const result = service.intercept(mockRequest, mockHttpHandler)

            // Assert
            result.subscribe({
                next: () => {
                    fail('Should not have succeeded')
                    done()
                },
                error: (error) => {
                    expect(error).toBe(mockError)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(2) // Original + 1 retry
                    done()
                }
            })
        })

        it('should fail immediately for client errors without retry', (done) => {
            // Arrange
            const mockRequest = new HttpRequest('POST', '/test', { data: 'test' })
            const mockError = new HttpErrorResponse({ status: 404 })

            mockHttpHandler.handle.mockReturnValue(throwError(() => mockError))

            // Act
            const result = service.intercept(mockRequest, mockHttpHandler)

            // Assert
            result.subscribe({
                next: () => {
                    fail('Should not have succeeded')
                    done()
                },
                error: (error) => {
                    expect(error).toBe(mockError)
                    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1) // No retry
                    expect(mockedTimer).not.toHaveBeenCalled()
                    done()
                }
            })
        })
    })
})