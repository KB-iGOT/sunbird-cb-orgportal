
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { ProfileV2UtillService } from './home-utill.service'

describe('ProfileV2UtillService', () => {
    let service: ProfileV2UtillService
    let httpClientMock: jest.Mocked<HttpClient>

    beforeEach(() => {
        // Create a mock HttpClient
        httpClientMock = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
            head: jest.fn(),
            options: jest.fn(),
            request: jest.fn(),
        } as any

        // Create service instance with mocked HttpClient
        service = new ProfileV2UtillService(httpClientMock)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('fetchBadges', () => {
        it('should fetch badges for a given wid', (done) => {
            // Arrange
            const wid = 'test-wid-123'
            const mockResponse: any = {
                canEarn: [],
                closeToEarning: [],
                earned: [],
                lastUpdatedDate: '',
                recent: [],
                totalPoints: []
            }
            const expectedUrl = '/apis/protected/v8/user/badge/for/test-wid-123'

            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.fetchBadges(wid).subscribe((result: any) => {
                // Assert
                expect(result).toEqual(mockResponse)
                expect(httpClientMock.get).toHaveBeenCalledWith(expectedUrl)
                expect(httpClientMock.get).toHaveBeenCalledTimes(1)
                done()
            })
        })

        it('should handle different wid values', (done) => {
            // Arrange
            const wid = 'another-wid-456'
            const mockResponse: any = {
                badges: [{ id: '1', name: 'Test Badge' }],
                count: 1
            }
            const expectedUrl = '/apis/protected/v8/user/badge/for/another-wid-456'

            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.fetchBadges(wid).subscribe((result: any) => {
                // Assert
                expect(result).toEqual(mockResponse)
                expect(httpClientMock.get).toHaveBeenCalledWith(expectedUrl)
                done()
            })
        })

        it('should handle empty wid', (done) => {
            // Arrange
            const wid = ''
            const mockResponse: any = {
                canEarn: [],
                closeToEarning: [],
                earned: [],
                lastUpdatedDate: '',
                recent: [],
                totalPoints: []
            }
            const expectedUrl = '/apis/protected/v8/user/badge/for/'

            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.fetchBadges(wid).subscribe((result: any) => {
                // Assert
                expect(result).toEqual(mockResponse)
                expect(httpClientMock.get).toHaveBeenCalledWith(expectedUrl)
                done()
            })
        })
    })

    describe('reCalculateBadges', () => {
        it('should make POST request to recalculate badges', (done) => {
            // Arrange
            const mockResponse = { success: true, message: 'Badges recalculated' }
            const expectedUrl = '/apis/protected/v8/user/badge/update'

            httpClientMock.post.mockReturnValue(of(mockResponse))

            // Act
            service.reCalculateBadges().subscribe((result: any) => {
                // Assert
                expect(result).toEqual(mockResponse)
                expect(httpClientMock.post).toHaveBeenCalledWith(expectedUrl, {})
                expect(httpClientMock.post).toHaveBeenCalledTimes(1)
                done()
            })
        })

        it('should send empty object as request body', (done) => {
            // Arrange
            const mockResponse = { status: 'completed' }

            httpClientMock.post.mockReturnValue(of(mockResponse))

            // Act
            service.reCalculateBadges().subscribe(() => {
                // Assert
                expect(httpClientMock.post).toHaveBeenCalledWith(
                    '/apis/protected/v8/user/badge/update',
                    {}
                )
                done()
            })
        })
    })

    describe('fetchRecentBadge', () => {
        it('should fetch recent badge notifications', (done) => {
            // Arrange
            const mockResponse: any = {
                totalPoints: [],
                recent_badge: null
            }
            const expectedUrl = '/apis/protected/v8/user/badge/notification'

            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.fetchRecentBadge().subscribe((result: any) => {
                // Assert
                expect(result).toEqual(mockResponse)
                expect(httpClientMock.get).toHaveBeenCalledWith(expectedUrl)
                expect(httpClientMock.get).toHaveBeenCalledTimes(1)
                done()
            })
        })

        it('should apply map operator correctly', (done) => {
            // Arrange
            const mockResponse = {
                notifications: [],
                count: 0,
                timestamp: '2024-01-01'
            }

            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.fetchRecentBadge().subscribe((result: any) => {
                // Assert
                expect(result).toEqual(mockResponse)
                expect(result).toBe(mockResponse) // Ensures map operator returns the same object
                done()
            })
        })

        it('should handle empty notifications response', (done) => {
            // Arrange
            const mockResponse: any = {
                totalPoints: [],
                recent_badge: undefined
            }

            httpClientMock.get.mockReturnValue(of(mockResponse))

            // Act
            service.fetchRecentBadge().subscribe((result: any) => {
                // Assert
                expect(result).toEqual(mockResponse)
                done()
            })
        })
    })

    describe('emailTransform', () => {
        it('should transform email by replacing dots and @ symbol', () => {
            // Arrange
            const email = 'user@example.com'
            const expected = 'user[at]example[dot]com'

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })

        it('should handle email with multiple dots', () => {
            // Arrange
            const email = 'user.name@sub.domain.com'
            const expected = 'user[dot]name[at]sub[dot]domain[dot]com'

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })

        it('should handle email with only @ symbol', () => {
            // Arrange
            const email = 'user@domain'
            const expected = 'user[at]domain'

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })

        it('should handle email with only dots', () => {
            // Arrange
            const email = 'user.name.lastname'
            const expected = 'user[dot]name[dot]lastname'

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })

        it('should handle empty string', () => {
            // Arrange
            const email = ''
            const expected = ''

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })

        it('should return undefined when input is undefined', () => {
            // Arrange
            const email = undefined as any

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBeUndefined()
        })

        it('should handle string without dots or @ symbol', () => {
            // Arrange
            const email = 'plaintext'
            const expected = 'plaintext'

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })

        it('should handle consecutive dots', () => {
            // Arrange
            const email = 'user..name@domain.com'
            const expected = 'user[dot][dot]name[at]domain[dot]com'

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })

        it('should handle multiple @ symbols', () => {
            // Arrange
            const email = 'user@domain@com'
            // replace('@', ...) only replaces first @
            const expected = 'user[at]domain@com'

            // Act
            const result = service.emailTransform(email)

            // Assert
            expect(result).toBe(expected)
        })
    })

    describe('API_END_POINTS', () => {
        it('should generate correct USER_BADGE endpoint', () => {
            // This test ensures the endpoint generation works correctly
            const wid = 'test-wid'
            const expectedUrl = '/apis/protected/v8/user/badge/for/test-wid'

            // We can test this indirectly through fetchBadges
            const mockResponse: any = { badges: [], count: 0 }
            httpClientMock.get.mockReturnValue(of(mockResponse))

            service.fetchBadges(wid).subscribe(() => {
                expect(httpClientMock.get).toHaveBeenCalledWith(expectedUrl)
            })
        })
    })

    describe('Service Instance', () => {
        it('should be created', () => {
            expect(service).toBeTruthy()
        })

        it('should have HttpClient injected', () => {
            expect(service['http']).toBe(httpClientMock)
        })
    })
})