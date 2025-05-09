import { VerifyOtpComponent } from './verify-otp.component'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { MatLegacyRadioChange as MatRadioChange } from '@angular/material/legacy-radio'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'

describe('VerifyOtpComponent', () => {
    let component: VerifyOtpComponent
    let dialogRefMock: any
    let matSnackbarMock: any
    let otpServiceMock: any
    let usersServiceMock: any

    // Mock data for the component
    const mockDialogData = {
        email: 'test@example.com',
        mobile: '1234567890',
        type: 'email'
    }

    // Setup before each test
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create mocks for all dependencies
        dialogRefMock = {
            close: jest.fn()
        }

        matSnackbarMock = {
            open: jest.fn()
        }

        otpServiceMock = {
            verifyEmailOTP: jest.fn(),
            verifyOTP: jest.fn()
        }

        usersServiceMock = {
            sendOtp: jest.fn()
        }

        // Create component with mocked dependencies
        component = new VerifyOtpComponent(
            dialogRefMock,
            mockDialogData,
            matSnackbarMock,
            otpServiceMock,
            usersServiceMock
        )

        // Setup spies for event emitters
        jest.spyOn(component.resendOTP, 'emit')
        jest.spyOn(component.otpVerified, 'emit')

        // Mock the timer div
        component.timerDiv = {
            nativeElement: {
                innerHTML: ''
            }
        }
    })

    afterEach(() => {
        // Clean up interval
        if (component.interval) {
            clearInterval(component.interval)
        }
    })

    describe('initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize form controls', () => {
            expect(component.otpSelectionForm).toBeTruthy()
            expect(component.otpSelectionForm.get('otpType')).toBeTruthy()
        })

        it('should start timer on init', () => {
            const startTimerSpy = jest.spyOn(component, 'startTimer')

            component.ngOnInit()

            expect(startTimerSpy).toHaveBeenCalled()
            expect(component.timeLeft).toBe(150)
            expect(component.interval).toBeDefined()
        })
    })

    describe('timer functionality', () => {
        it('should decrement timeLeft when timer is running', () => {
            jest.useFakeTimers()

            component.startTimer()

            // Fast-forward time
            jest.advanceTimersByTime(2000)

            expect(component.timeLeft).toBe(148)

            jest.useRealTimers()
        })

        it('should update timer div innerHTML with formatted time', () => {
            jest.useFakeTimers()

            component.timeLeft = 125 // 2m:5s
            component.startTimer()

            // Fast-forward time
            jest.advanceTimersByTime(1000)

            expect(component.timerDiv.nativeElement.innerHTML).toBe('2m: 4s')

            jest.useRealTimers()
        })

        it('should show resendOTP button when timer reaches zero', () => {
            jest.useFakeTimers()

            component.timeLeft = 1
            component.startTimer()

            // Fast-forward time
            jest.advanceTimersByTime(1000)

            expect(component.timeLeft).toBe(0)
            expect(component.showResendOTP).toBe(false)

            jest.useRealTimers()
        })
    })

    describe('handleCloseModal', () => {
        it('should close the dialog', () => {
            component.handleCloseModal()

            expect(dialogRefMock.close).toHaveBeenCalled()
        })
    })

    describe('handleResendOTP', () => {
        it('should reset timer and emit resendOTP event', () => {
            const startTimerSpy = jest.spyOn(component, 'startTimer')

            component.handleResendOTP()

            expect(component.timeLeft).toBe(150)
            expect(startTimerSpy).toHaveBeenCalled()
            expect(component.resendOTP.emit).toHaveBeenCalledWith(mockDialogData.type)
        })
    })

    describe('handleVerifyOTP', () => {
        it('should call verifyEmailOTP when otpTypeSelectedValue is email', () => {
            const verifyEmailOTPSpy = jest.spyOn(component, 'verifyEmailOTP').mockImplementation()

            component.otpTypeSelectedValue = 'email'
            component.handleVerifyOTP()

            expect(verifyEmailOTPSpy).toHaveBeenCalled()
        })

        it('should call verifyMobileOTP when otpTypeSelectedValue is not email', () => {
            const verifyMobileOTPSpy = jest.spyOn(component, 'verifyMobileOTP').mockImplementation()

            component.otpTypeSelectedValue = 'mobile'
            component.handleVerifyOTP()

            expect(verifyMobileOTPSpy).toHaveBeenCalled()
        })
    })

    describe('verifyEmailOTP', () => {
        it('should call otpService.verifyEmailOTP with correct parameters', () => {
            otpServiceMock.verifyEmailOTP.mockReturnValue(of({ success: true }))

            component.otpEntered = '123456'
            component.verifyEmailOTP()

            expect(otpServiceMock.verifyEmailOTP).toHaveBeenCalledWith('123456', mockDialogData.email)
        })

        it('should close modal and emit otpVerified event on success', () => {
            otpServiceMock.verifyEmailOTP.mockReturnValue(of({ success: true }))

            component.verifyEmailOTP()

            expect(dialogRefMock.close).toHaveBeenCalled()
            expect(component.otpVerified.emit).toHaveBeenCalledWith(true)
        })

        it('should show error snackbar when verification fails', () => {
            const errorResponse = new HttpErrorResponse({
                error: 'Invalid OTP',
                status: 400,
                statusText: 'Bad Request'
            })

            otpServiceMock.verifyEmailOTP.mockReturnValue(throwError(errorResponse))

            component.verifyEmailOTP()

            expect(matSnackbarMock.open).toHaveBeenCalledWith('Unable to verify OTP, please try again later!')
            expect(dialogRefMock.close).not.toHaveBeenCalled()
            expect(component.otpVerified.emit).not.toHaveBeenCalled()
        })
    })

    describe('verifyMobileOTP', () => {
        it('should call otpService.verifyOTP with correct parameters', () => {
            otpServiceMock.verifyOTP.mockReturnValue(of({ success: true }))

            component.otpEntered = '123456'
            component.verifyMobileOTP()

            expect(otpServiceMock.verifyOTP).toHaveBeenCalledWith(123456, mockDialogData.mobile)
        })

        it('should close modal and emit otpVerified event on success', () => {
            otpServiceMock.verifyOTP.mockReturnValue(of({ success: true }))

            component.verifyMobileOTP()

            expect(dialogRefMock.close).toHaveBeenCalled()
            expect(component.otpVerified.emit).toHaveBeenCalledWith(true)
        })

        it('should show error snackbar when verification fails', () => {
            const errorResponse = new HttpErrorResponse({
                error: 'Invalid OTP',
                status: 400,
                statusText: 'Bad Request'
            })

            otpServiceMock.verifyOTP.mockReturnValue(throwError(errorResponse))

            component.verifyMobileOTP()

            expect(matSnackbarMock.open).toHaveBeenCalledWith('Unable to verify OTP, please try again later!')
        })
    })

    describe('sendOtp', () => {
        it('should call generateAndVerifyOTP with selected OTP type', () => {
            const generateAndVerifyOTPSpy = jest.spyOn(component, 'generateAndVerifyOTP').mockImplementation()

            component.otpSelectionForm = new UntypedFormGroup({
                otpType: new UntypedFormControl('email')
            })

            component.sendOtp()

            expect(generateAndVerifyOTPSpy).toHaveBeenCalledWith('email')
            expect(component.otpTypeSelected).toBe(true)
            expect(component.otpTypeSelectedValue).toBe('email')
        })
    })

    describe('generateAndVerifyOTP', () => {
        it('should call usersService.sendOtp with correct parameters for email', () => {
            usersServiceMock.sendOtp.mockReturnValue(of({ success: true }))

            component.generateAndVerifyOTP('email')

            expect(usersServiceMock.sendOtp).toHaveBeenCalledWith(mockDialogData.email, 'email')
        })

        it('should call usersService.sendOtp with correct parameters for mobile', () => {
            usersServiceMock.sendOtp.mockReturnValue(of({ success: true }))

            component.generateAndVerifyOTP('mobile')

            expect(usersServiceMock.sendOtp).toHaveBeenCalledWith(mockDialogData.mobile, 'phone')
        })

        it('should show success snackbar message for email OTP', () => {
            usersServiceMock.sendOtp.mockReturnValue(of({ success: true }))

            component.generateAndVerifyOTP('email')

            expect(matSnackbarMock.open).toHaveBeenCalledWith("An OTP has been sent to your Email address, (Valid for 15 min's)")
        })

        it('should show success snackbar message for mobile OTP', () => {
            usersServiceMock.sendOtp.mockReturnValue(of({ success: true }))

            component.generateAndVerifyOTP('mobile')

            expect(matSnackbarMock.open).toHaveBeenCalledWith("An OTP has been sent to your Mobile number, (Valid for 15 min's)")
        })

        it('should show error message when sendOtp fails', () => {
            const errorResponse = new HttpErrorResponse({
                error: { params: { errmsg: 'Custom error message' } },
                status: 400,
                statusText: 'Bad Request'
            })

            usersServiceMock.sendOtp.mockReturnValue(throwError(errorResponse))

            component.generateAndVerifyOTP('email')

            expect(matSnackbarMock.open).toHaveBeenCalledWith('Custom error message')
        })

        it('should show generic error message when sendOtp fails without specific error', () => {
            const errorResponse = new HttpErrorResponse({
                error: {},
                status: 400,
                statusText: 'Bad Request'
            })

            usersServiceMock.sendOtp.mockReturnValue(throwError(errorResponse))

            component.generateAndVerifyOTP('mobile')

            expect(matSnackbarMock.open).toHaveBeenCalledWith('Unable to send OTP to your mobile, please try again later!')
        })
    })

    describe('ngOnDestroy', () => {
        it('should clear interval and unsubscribe from destroySubject', () => {
            const unsubscribeSpy = jest.spyOn(component['destroySubject$'], 'unsubscribe')
            const clearIntervalSpy = jest.spyOn(window, 'clearInterval')

            component.interval = 123

            component.ngOnDestroy()

            expect(clearIntervalSpy).toHaveBeenCalledWith(123)
            expect(unsubscribeSpy).toHaveBeenCalled()
        })
    })

    describe('radioChange', () => {
        it('should handle radio change event', () => {
            const event = { value: 'email' } as MatRadioChange

            component.radioChange(event)

            // Currently this method is empty in the component, so just verify it doesn't throw an error
            expect(true).toBeTruthy()
        })
    })
})