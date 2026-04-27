import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { OtpService } from './otp.service'

describe('OtpService', () => {
    let service: OtpService
    let httpMock: HttpTestingController

    const API_ENDPOINTS = {
        sendOtp: '/apis/proxies/v8/otp/v1/generate',
        ReSendOtp: '/apis/proxies/v8/otp/v1/generate',
        VerifyOtp: '/apis/proxies/v8/otp/v1/verify',
        sendEmailOtp: '/apis/proxies/v8/otp/v3/generate',
        VerifyEmailOtp: '/apis/proxies/v8/otp/v3/verify',
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [OtpService]
        })
        service = TestBed.inject(OtpService)
        httpMock = TestBed.inject(HttpTestingController)
    })

    afterEach(() => {
        httpMock.verify()
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })

    describe('sendOtp', () => {
        it('should send OTP with correct request payload', () => {
            const mockMobile = 9876543210
            const mockResponse = { success: true, message: 'OTP sent successfully' }

            service.sendOtp(mockMobile).subscribe(response => {
                expect(response).toEqual(mockResponse)
            })

            const req = httpMock.expectOne(API_ENDPOINTS.sendOtp)
            expect(req.request.method).toBe('POST')
            expect(req.request.body).toEqual({
                request: {
                    type: 'phone',
                    key: '9876543210'
                }
            })
            req.flush(mockResponse)
        })

        it('should return observable', () => {
            const mockMobile = 9876543210
            const result = service.sendOtp(mockMobile)
            expect(result.subscribe).toBeDefined()
            result.subscribe()

            const req = httpMock.expectOne(API_ENDPOINTS.sendOtp)
            req.flush({})
        })
    })

    describe('resendOtp', () => {
        it('should resend OTP with correct request payload', () => {
            const mockMobile = 9876543210
            const mockResponse = { success: true, message: 'OTP resent successfully' }

            service.resendOtp(mockMobile).subscribe(response => {
                expect(response).toEqual(mockResponse)
            })

            const req = httpMock.expectOne(API_ENDPOINTS.ReSendOtp)
            expect(req.request.method).toBe('POST')
            expect(req.request.body).toEqual({
                request: {
                    type: 'phone',
                    key: '9876543210'
                }
            })
            req.flush(mockResponse)
        })
    })

    describe('verifyOTP', () => {
        it('should verify OTP with correct request payload', () => {
            const mockOtp = 123456
            const mockMobile = 9876543210
            const mockResponse = { success: true, verified: true }

            service.verifyOTP(mockOtp, mockMobile).subscribe(response => {
                expect(response).toEqual(mockResponse)
            })

            const req = httpMock.expectOne(API_ENDPOINTS.VerifyOtp)
            expect(req.request.method).toBe('POST')
            expect(req.request.body).toEqual({
                request: {
                    otp: '123456',
                    type: 'phone',
                    key: '9876543210'
                }
            })
            req.flush(mockResponse)
        })

        it('should convert OTP number to string', () => {
            const mockOtp = 123456
            const mockMobile = 9876543210

            service.verifyOTP(mockOtp, mockMobile).subscribe()

            const req = httpMock.expectOne(API_ENDPOINTS.VerifyOtp)
            expect(req.request.body.request.otp).toBe('123456')
            expect(typeof req.request.body.request.otp).toBe('string')
            req.flush({})
        })
    })

    describe('sendEmailOtp', () => {
        it('should send email OTP with correct request payload', () => {
            const mockEmail = 'test@example.com'
            const mockResponse = { success: true, message: 'Email OTP sent successfully' }

            service.sendEmailOtp(mockEmail).subscribe(response => {
                expect(response).toEqual(mockResponse)
            })

            const req = httpMock.expectOne(API_ENDPOINTS.sendEmailOtp)
            expect(req.request.method).toBe('POST')
            expect(req.request.body).toEqual({
                request: {
                    type: 'email',
                    key: 'test@example.com',
                    contextType: 'extPatch',
                    context: ['profileDetails.personalDetails.primaryEmail']
                }
            })
            req.flush(mockResponse)
        })

        it('should return observable', () => {
            const mockEmail = 'test@example.com'
            const result = service.sendEmailOtp(mockEmail)
            expect(result.subscribe).toBeDefined()
            result.subscribe()

            const req = httpMock.expectOne(API_ENDPOINTS.sendEmailOtp)
            req.flush({})
        })
    })

    describe('reSendEmailOtp', () => {
        it('should resend email OTP with correct request payload', () => {
            const mockEmail = 'test@example.com'
            const mockResponse = { success: true, message: 'Email OTP resent successfully' }

            service.reSendEmailOtp(mockEmail).subscribe(response => {
                expect(response).toEqual(mockResponse)
            })

            const req = httpMock.expectOne(API_ENDPOINTS.sendEmailOtp)
            expect(req.request.method).toBe('POST')
            expect(req.request.body).toEqual({
                request: {
                    type: 'email',
                    key: 'test@example.com',
                    contextType: 'extPatch',
                    context: ['profileDetails.personalDetails.primaryEmail']
                }
            })
            req.flush(mockResponse)
        })

        it('should return observable', () => {
            const mockEmail = 'test@example.com'
            const result = service.reSendEmailOtp(mockEmail)
            expect(result.subscribe).toBeDefined()
            result.subscribe()

            const req = httpMock.expectOne(API_ENDPOINTS.sendEmailOtp)
            req.flush({})
        })
    })

    describe('verifyEmailOTP', () => {
        it('should verify email OTP with correct request payload', () => {
            const mockOtp = 123456
            const mockEmail = 'test@example.com'
            const mockResponse = { success: true, verified: true }

            service.verifyEmailOTP(mockOtp, mockEmail).subscribe(response => {
                expect(response).toEqual(mockResponse)
            })

            const req = httpMock.expectOne(API_ENDPOINTS.VerifyEmailOtp)
            expect(req.request.method).toBe('POST')
            expect(req.request.body).toEqual({
                request: {
                    otp: '123456',
                    type: 'email',
                    key: 'test@example.com'
                }
            })
            req.flush(mockResponse)
        })

        it('should convert OTP to string', () => {
            const mockOtp = 123456
            const mockEmail = 'test@example.com'

            service.verifyEmailOTP(mockOtp, mockEmail).subscribe()

            const req = httpMock.expectOne(API_ENDPOINTS.VerifyEmailOtp)
            expect(req.request.body.request.otp).toBe('123456')
            expect(typeof req.request.body.request.otp).toBe('string')
            req.flush({})
        })

        it('should handle string OTP input', () => {
            const mockOtp = '123456'
            const mockEmail = 'test@example.com'

            service.verifyEmailOTP(mockOtp, mockEmail).subscribe()

            const req = httpMock.expectOne(API_ENDPOINTS.VerifyEmailOtp)
            expect(req.request.body.request.otp).toBe('123456')
            req.flush({})
        })
    })

    describe('Error handling', () => {
        it('should handle HTTP error in sendOtp', () => {
            const mockMobile = 9876543210
            const errorResponse = { status: 500, statusText: 'Internal Server Error' }

            service.sendOtp(mockMobile).subscribe({
                next: () => fail('should have failed with 500 error'),
                error: (error) => {
                    expect(error.status).toBe(500)
                }
            })

            const req = httpMock.expectOne(API_ENDPOINTS.sendOtp)
            req.flush('Something went wrong', errorResponse)
        })

        it('should handle HTTP error in verifyOTP', () => {
            const mockOtp = 123456
            const mockMobile = 9876543210
            const errorResponse = { status: 400, statusText: 'Bad Request' }

            service.verifyOTP(mockOtp, mockMobile).subscribe({
                next: () => fail('should have failed with 400 error'),
                error: (error) => {
                    expect(error.status).toBe(400)
                }
            })

            const req = httpMock.expectOne(API_ENDPOINTS.VerifyOtp)
            req.flush('Invalid OTP', errorResponse)
        })

        it('should handle HTTP error in sendEmailOtp', () => {
            const mockEmail = 'test@example.com'
            const errorResponse = { status: 422, statusText: 'Unprocessable Entity' }

            service.sendEmailOtp(mockEmail).subscribe({
                next: () => fail('should have failed with 422 error'),
                error: (error) => {
                    expect(error.status).toBe(422)
                }
            })

            const req = httpMock.expectOne(API_ENDPOINTS.sendEmailOtp)
            req.flush('Invalid email', errorResponse)
        })
    })
})