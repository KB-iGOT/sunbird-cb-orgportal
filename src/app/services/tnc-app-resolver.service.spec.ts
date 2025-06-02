import { of, throwError } from 'rxjs'
import { TncAppResolverService } from './tnc-app-resolver.service'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { NsTnc } from '../models/tnc.model'

describe('TncAppResolverService', () => {
    let service: TncAppResolverService
    let httpClientMock: jest.Mocked<HttpClient>
    let configSvcMock: jest.Mocked<ConfigurationsService>

    beforeEach(() => {
        httpClientMock = {
            get: jest.fn()
        } as any

        configSvcMock = {
            userPreference: null
        } as any

        service = new TncAppResolverService(httpClientMock, configSvcMock)
    })

    describe('resolve', () => {
        it('should return success response when getTnc succeeds', async () => {
            // Arrange
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
            jest.spyOn(service, 'getTnc').mockReturnValue(of(mockTncData))

            // Act
            const result = await service.resolve().toPromise()

            // Assert
            expect(result.data).toEqual(mockTncData)
            expect(result.error).toBeNull()
        })

        it('should return error response when getTnc fails', async () => {
            // Arrange
            const mockError = new Error('HTTP Error')
            jest.spyOn(service, 'getTnc').mockReturnValue(throwError(() => mockError))

            // Act
            const result = await service.resolve().toPromise()

            // Assert
            expect(result.data).toBeNull()
            expect(result.error).toEqual(mockError)
        })

        it('should call getTnc with locale when userPreference exists', async () => {
            // Arrange
            const mockLocale = 'en-US'
            configSvcMock.userPreference = { selectedLocale: mockLocale } as any
            const mockTncData: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            const getTncSpy = jest.spyOn(service, 'getTnc').mockReturnValue(of(mockTncData))

            // Act
            await service.resolve().toPromise()

            // Assert
            expect(getTncSpy).toHaveBeenCalledWith(mockLocale)
        })

        it('should call getTnc with empty string when userPreference is null', async () => {
            // Arrange
            configSvcMock.userPreference = null
            const mockTncData: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            const getTncSpy = jest.spyOn(service, 'getTnc').mockReturnValue(of(mockTncData))

            // Act
            await service.resolve().toPromise()

            // Assert
            expect(getTncSpy).toHaveBeenCalledWith('')
        })

        it('should call getTnc with empty string when userPreference is undefined', async () => {
            // Arrange
            configSvcMock.userPreference = undefined as any
            const mockTncData: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            const getTncSpy = jest.spyOn(service, 'getTnc').mockReturnValue(of(mockTncData))

            // Act
            await service.resolve().toPromise()

            // Assert
            expect(getTncSpy).toHaveBeenCalledWith('')
        })
    })

    describe('getTnc', () => {
        it('should make GET request to correct URL without locale', () => {
            // Arrange
            const mockResponse: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.getTnc()

            // Assert
            expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/tnc')
        })

        it('should make GET request to correct URL with locale parameter', () => {
            // Arrange
            const locale = 'fr-FR'
            const mockResponse: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.getTnc(locale)

            // Assert
            expect(httpClientMock.get).toHaveBeenCalledWith(`/apis/protected/v8/user/tnc?locale=${locale}`)
        })

        it('should return observable of ITnc', async () => {
            // Arrange
            const mockResponse: NsTnc.ITnc = {
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                isAccepted: false,
                termsAndConditions: []
            }
            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            const result = await service.getTnc().toPromise()

            // Assert
            expect(result).toEqual(mockResponse)
            expect(result.id).toBe('test-id')
            expect(result.content).toBe('Terms and Conditions content')
        })

        it('should handle empty locale parameter', () => {
            // Arrange
            const mockResponse: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.getTnc('')

            // Assert
            expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/tnc')
        })

        it('should handle undefined locale parameter', () => {
            // Arrange
            const mockResponse: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.getTnc(undefined)

            // Assert
            expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/tnc')
        })

        it('should handle null locale parameter', () => {
            // Arrange
            const mockResponse: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [],
                id: function (): unknown {
                    throw new Error('Function not implemented.')
                },
                content: function (): unknown {
                    throw new Error('Function not implemented.')
                }
            }
            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.getTnc(null as any)

            // Assert
            expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/tnc')
        })

        it('should propagate HTTP errors', async () => {
            // Arrange
            const httpError = new Error('Network error')
            httpClientMock.get.mockReturnValue(throwError(() => httpError))

            // Act & Assert
            await expect(service.getTnc().toPromise()).rejects.toThrow('Network error')
        })
    })

    describe('constructor', () => {
        it('should create service instance', () => {
            expect(service).toBeTruthy()
            expect(service).toBeInstanceOf(TncAppResolverService)
        })

        it('should initialize with provided dependencies', () => {
            expect(service['http']).toBe(httpClientMock)
            expect(service['configSvc']).toBe(configSvcMock)
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })
})