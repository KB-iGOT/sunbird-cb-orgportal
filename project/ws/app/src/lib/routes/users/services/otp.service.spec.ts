import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { OtpService } from './otp.service'

describe('OtpService', () => {
    let service: OtpService
    let mockHttp: jest.Mocked<HttpClient>

    const API_ENDPOINTS = {
        sendOtp: '/apis/proxies/v8/otp/v1/generate',
        ReSendOtp: '/apis/proxies/v8/otp/v1/generate',
        VerifyOtp: '/apis/proxies/v8/otp/v1/verify',
        sendEmailOtp: '/apis/proxies/v8/otp/v3/generate',
        VerifyEmailOtp: '/apis/proxies/v8/otp/v3/verify',
    }

    beforeEach(() => {
        mockHttp = {
            post: jest.fn()
        } as any

        service = new OtpService(mockHttp)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should create the service', () => {
        expect(service).toBeTruthy()
    })

    describe('sendOtp', () => {
        it('should call POST to correct endpoint with correct payload', () => {
            const mockResponse = { success: true }
            mockHttp.post.mockReturnValue(of(mockResponse))

            service.sendOtp(9876543210).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.sendOtp, {
                request: { type: 'phone', key: '9876543210' }
            })
        })

        it('should convert mobile number to string in key', () => {
            mockHttp.post.mockReturnValue(of({}))

            service.sendOtp(1234567890).subscribe()

            expect(mockHttp.post).toHaveBeenCalledWith(
                API_ENDPOINTS.sendOtp,
                expect.objectContaining({ request: expect.objectContaining({ key: '1234567890' }) })
            )
        })

        it('should return an observable', () => {
            mockHttp.post.mockReturnValue(of({ success: true }))

            const result = service.sendOtp(9876543210)

            expect(result.subscribe).toBeDefined()
        })
    })

    describe('resendOtp', () => {
        it('should call POST to correct endpoint with correct payload', () => {
            const mockResponse = { success: true }
            mockHttp.post.mockReturnValue(of(mockResponse))

            service.resendOtp(9876543210).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.ReSendOtp, {
                request: { type: 'phone', key: '9876543210' }
            })
        })

        it('should use same endpoint as sendOtp', () => {
            mockHttp.post.mockReturnValue(of({}))

            service.resendOtp(9876543210).subscribe()

            expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.sendOtp, expect.anything())
        })
    })

    describe('verifyOTP', () => {
        it('should call POST to correct endpoint with correct payload', () => {
            const mockResponse = { success: true, verified: true }
            mockHttp.post.mockReturnValue(of(mockResponse))

            service.verifyOTP(123456, 9876543210).subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.VerifyOtp, {
                request: { otp: '123456', type: 'phone', key: '9876543210' }
            })
        })

        it('should convert OTP number to string', () => {
            mockHttp.post.mockReturnValue(of({}))

            service.verifyOTP(123456, 9876543210).subscribe()

            const callArgs = mockHttp.post.mock.calls[0][1]
            expect(callArgs.request.otp).toBe('123456')
            expect(typeof callArgs.request.otp).toBe('string')
        })
    })

    describe('sendEmailOtp', () => {
        it('should call POST to correct endpoint with correct payload', () => {
            const mockResponse = { success: true }
            mockHttp.post.mockReturnValue(of(mockResponse))

            service.sendEmailOtp('test@example.com').subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.sendEmailOtp, {
                request: {
                    type: 'email',
                    key: 'test@example.com',
                    contextType: 'extPatch',
                    context: ['profileDetails.personalDetails.primaryEmail']
                }
            })
        })

        it('should return an observable', () => {
            mockHttp.post.mockReturnValue(of({}))

            const result = service.sendEmailOtp('test@example.com')

            expect(result.subscribe).toBeDefined()
        })
    })

    describe('reSendEmailOtp', () => {
        it('should call POST to correct endpoint with correct payload', () => {
            mockHttp.post.mockReturnValue(of({ success: true }))

            service.reSendEmailOtp('test@example.com').subscribe()

            expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.sendEmailOtp, {
                request: {
                    type: 'email',
                    key: 'test@example.com',
                    contextType: 'extPatch',
                    context: ['profileDetails.personalDetails.primaryEmail']
                }
            })
        })

        it('should return an observable', () => {
            mockHttp.post.mockReturnValue(of({}))

            const result = service.reSendEmailOtp('test@example.com')

            expect(result.subscribe).toBeDefined()
        })
    })

    describe('verifyEmailOTP', () => {
        it('should call POST to correct endpoint with correct payload', () => {
            const mockResponse = { success: true, verified: true }
            mockHttp.post.mockReturnValue(of(mockResponse))

            service.verifyEmailOTP(654321, 'test@example.com').subscribe(result => {
                expect(result).toEqual(mockResponse)
            })

            expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.VerifyEmailOtp, {
                request: { otp: '654321', type: 'email', key: 'test@example.com' }
            })
        })

        it('should convert OTP to string', () => {
            mockHttp.post.mockReturnValue(of({}))

            service.verifyEmailOTP(654321, 'test@example.com').subscribe()

            const callArgs = mockHttp.post.mock.calls[0][1]
            expect(callArgs.request.otp).toBe('654321')
            expect(typeof callArgs.request.otp).toBe('string')
        })
    })
})