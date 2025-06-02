import { of, throwError } from 'rxjs'
import { TncPublicResolverService } from './tnc-public-resolver.service'
import { HttpClient } from '@angular/common/http'
import { NsTnc } from '../models/tnc.model'

// Mock HttpClient
const mockHttpClient = {
    get: jest.fn()
}

describe('TncPublicResolverService', () => {
    let service: TncPublicResolverService
    let httpClient: jest.Mocked<HttpClient>

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks()

        // Create service instance with mocked dependencies
        httpClient = mockHttpClient as unknown as jest.Mocked<HttpClient>
        service = new TncPublicResolverService(httpClient)
    })

    describe('constructor', () => {
        it('should create service instance', () => {
            expect(service).toBeDefined()
            expect(service).toBeInstanceOf(TncPublicResolverService)
        })
    })

    describe('getPublicTnc', () => {
        const mockTncData: NsTnc.ITnc = {
            id: function (): unknown {
                throw new Error('Function not implemented.')
            },
            content: function (): unknown {
                throw new Error('Function not implemented.')
            },
            isAccepted: false,
            termsAndConditions: []
        }

        it('should call http.get with correct URL when no locale is provided', () => {
            // Arrange
            httpClient.get.mockReturnValue(of(mockTncData))

            // Act
            service.getPublicTnc()

            // Assert
            expect(httpClient.get).toHaveBeenCalledWith('/apis/public/v8/tnc')
            expect(httpClient.get).toHaveBeenCalledTimes(1)
        })

        it('should call http.get with locale parameter when locale is provided', () => {
            // Arrange
            const locale = 'en-US'
            httpClient.get.mockReturnValue(of(mockTncData))

            // Act
            service.getPublicTnc(locale)

            // Assert
            expect(httpClient.get).toHaveBeenCalledWith(`/apis/public/v8/tnc?locale=${locale}`)
            expect(httpClient.get).toHaveBeenCalledTimes(1)
        })

        it('should return observable with TnC data on successful API call', (done) => {
            // Arrange
            httpClient.get.mockReturnValue(of(mockTncData))

            // Act
            service.getPublicTnc().subscribe({
                next: (result) => {
                    // Assert
                    expect(result).toEqual(mockTncData)
                    done()
                }
            })
        })

        it('should propagate error when API call fails', (done) => {
            // Arrange
            const error = new Error('API Error')
            httpClient.get.mockReturnValue(throwError(() => error))

            // Act
            service.getPublicTnc().subscribe({
                error: (err) => {
                    // Assert
                    expect(err).toBe(error)
                    done()
                }
            })
        })
    })

    describe('resolve', () => {
        const mockTncData: NsTnc.ITnc = {
            id: function (): unknown {
                throw new Error('Function not implemented.')
            },
            content: function (): unknown {
                throw new Error('Function not implemented.')
            },
            isAccepted: false,
            termsAndConditions: []
        }

        it('should return resolve response with data and null error on successful API call', (done) => {
            // Arrange
            httpClient.get.mockReturnValue(of(mockTncData))

            // Act
            service.resolve().subscribe({
                next: (result) => {
                    // Assert
                    expect(result.data).toEqual(mockTncData)
                    expect(result.error).toBeNull()
                    done()
                }
            })
        })

        it('should return resolve response with null data and error on failed API call', (done) => {
            // Arrange
            const error = new Error('API Error')
            httpClient.get.mockReturnValue(throwError(() => error))

            // Act
            service.resolve().subscribe({
                next: (result) => {
                    // Assert
                    expect(result.data).toBeNull()
                    expect(result.error).toBe(error)
                    done()
                }
            })
        })

        it('should call getPublicTnc method', () => {
            // Arrange
            httpClient.get.mockReturnValue(of(mockTncData))
            const getPublicTncSpy = jest.spyOn(service, 'getPublicTnc')

            // Act
            service.resolve().subscribe()

            // Assert
            expect(getPublicTncSpy).toHaveBeenCalled()
            expect(getPublicTncSpy).toHaveBeenCalledTimes(1)
        })

        it('should handle empty response data', (done) => {
            // Arrange
            httpClient.get.mockReturnValue(of(null))

            // Act
            service.resolve().subscribe({
                next: (result) => {
                    // Assert
                    expect(result.data).toBeNull()
                    expect(result.error).toBeNull()
                    done()
                }
            })
        })
    })

    describe('error handling', () => {
        it('should handle HTTP errors gracefully in resolve method', (done) => {
            // Arrange
            const httpError = {
                status: 404,
                message: 'Not Found',
                error: 'TnC not found'
            }
            httpClient.get.mockReturnValue(throwError(() => httpError))

            // Act
            service.resolve().subscribe({
                next: (result) => {
                    // Assert
                    expect(result.data).toBeNull()
                    expect(result.error).toEqual(httpError)
                    done()
                }
            })
        })

        it('should handle network errors in resolve method', (done) => {
            // Arrange
            const networkError = new Error('Network connection failed')
            httpClient.get.mockReturnValue(throwError(() => networkError))

            // Act
            service.resolve().subscribe({
                next: (result) => {
                    // Assert
                    expect(result.data).toBeNull()
                    expect(result.error).toBe(networkError)
                    done()
                }
            })
        })
    })

    describe('integration scenarios', () => {
        it('should work with different locale formats', () => {
            // Arrange
            const locales = ['en-US', 'hi-IN', 'es-ES', 'fr-FR']
            httpClient.get.mockReturnValue(of({}))

            // Act & Assert
            locales.forEach(locale => {
                service.getPublicTnc(locale)
                expect(httpClient.get).toHaveBeenCalledWith(`/apis/public/v8/tnc?locale=${locale}`)
            })
        })

        it('should handle special characters in locale parameter', () => {
            // Arrange
            const specialLocale = 'zh-CN@traditional'
            httpClient.get.mockReturnValue(of({}))

            // Act
            service.getPublicTnc(specialLocale)

            // Assert
            expect(httpClient.get).toHaveBeenCalledWith(`/apis/public/v8/tnc?locale=${specialLocale}`)
        })
    })
})