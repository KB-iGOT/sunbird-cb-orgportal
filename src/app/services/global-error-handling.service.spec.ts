import { GlobalErrorHandlingService } from './global-error-handling.service'

describe('GlobalErrorHandlingService', () => {
    let service: GlobalErrorHandlingService
    let mockReload: jest.MockedFunction<() => void>

    beforeEach(() => {
        service = new GlobalErrorHandlingService()

        // Mock window.location.reload by replacing the entire location object
        mockReload = jest.fn()
        delete (window as any).location;
        (window as any).location = { reload: mockReload }
    })

    afterEach(() => {
        // Restore original location
        jest.restoreAllMocks()
    })

    describe('constructor', () => {
        it('should create an instance of GlobalErrorHandlingService', () => {
            expect(service).toBeDefined()
            expect(service).toBeInstanceOf(GlobalErrorHandlingService)
        })
    })

    describe('handleError', () => {
        describe('when error contains ChunkLoadError', () => {
            it('should reload the window for ChunkLoadError message', () => {
                const error = new Error('ChunkLoadError: Loading chunk 5 failed.')

                service.handleError(error)

                expect(mockReload).toHaveBeenCalledTimes(1)
            })

            it('should reload the window when ChunkLoadError is part of the message', () => {
                const error = new Error('Something went wrong: ChunkLoadError occurred')

                service.handleError(error)

                expect(mockReload).toHaveBeenCalledTimes(1)
            })

            it('should reload the window for error object with ChunkLoadError in message', () => {
                const error = {
                    message: 'ChunkLoadError: Failed to load module',
                    stack: 'some stack trace'
                }

                service.handleError(error)

                expect(mockReload).toHaveBeenCalledTimes(1)
            })
        })

        describe('when error does not contain ChunkLoadError', () => {
            it('should throw the error for regular Error objects', () => {
                const error = new Error('Regular error message')

                expect(() => service.handleError(error)).toThrow(error)
                expect(mockReload).not.toHaveBeenCalled()
            })

            it('should throw the error for different error types', () => {
                const error = new TypeError('Type error occurred')

                expect(() => service.handleError(error)).toThrow(error)
                expect(mockReload).not.toHaveBeenCalled()
            })

            it('should throw the error for string errors', () => {
                const error = 'String error message'

                expect(() => service.handleError(error)).toThrow(error)
                expect(mockReload).not.toHaveBeenCalled()
            })

            // it('should throw the error for object errors without ChunkLoadError', () => {
            //     const error = {
            //         message: 'Network error occurred',
            //         code: 500
            //     }

            //    // expect(() => service.handleError(error as any)).toThrow(error)
            //     expect(mockReload).not.toHaveBeenCalled()
            // })

            // it('should throw the error when message is null or undefined', () => {
            //     const errorWithNullMessage = { message: null }
            //     const errorWithUndefinedMessage = { message: undefined }

            //     // expect(() => service.handleError(errorWithNullMessage as any)).toThrow(errorWithNullMessage)
            //     // expect(() => service.handleError(errorWithUndefinedMessage as any)).toThrow(errorWithUndefinedMessage)
            //     expect(mockReload).not.toHaveBeenCalled()
            // })
        })

        describe('edge cases', () => {
            it('should handle case-sensitive ChunkLoadError matching', () => {
                const errorLowerCase = new Error('chunkloaderror: failed')
                const errorMixedCase = new Error('ChunkloadError: failed')

                expect(() => service.handleError(errorLowerCase)).toThrow(errorLowerCase)
                expect(() => service.handleError(errorMixedCase)).toThrow(errorMixedCase)
                expect(mockReload).not.toHaveBeenCalled()
            })

            // it('should handle errors without message property', () => {
            //   //  const errorWithoutMessage = { code: 404 }

            //    // expect(() => service.handleError(errorWithoutMessage as any)).toThrow(errorWithoutMessage)
            //     expect(mockReload).not.toHaveBeenCalled()
            // })

            it('should handle null and undefined errors', () => {
                expect(() => service.handleError(null)).toThrow('')
                expect(() => service.handleError(undefined)).toThrow(undefined)
                expect(mockReload).not.toHaveBeenCalled()
            })
        })
    })
})