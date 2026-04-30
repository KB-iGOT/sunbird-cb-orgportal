import { SignupAutoComponent } from './signup-auto.component'
import { of, throwError } from 'rxjs'

const mockSnackBar = {
    open: jest.fn()
}

const mockSignupAutoService = {
    signup: jest.fn()
}

const mockActivatedRoute = {
    paramMap: of({
        get: jest.fn().mockReturnValue('1234')
    })
}

describe('SignupAutoComponent', () => {
    let component: SignupAutoComponent

    beforeEach(() => {
        jest.clearAllMocks()
        component = new SignupAutoComponent(
            mockSnackBar as any,
            mockSignupAutoService as any,
            mockActivatedRoute as any
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should have default values on creation', () => {
        expect(component.fetching).toBe(false)
        expect(component.showResonse).toBe(false)
        expect(component.msg).toBe('')
    })

    it('should call signup method on ngOnInit with the correct id', () => {
        const spySignup = jest.spyOn(component, 'signup')
        mockSignupAutoService.signup.mockReturnValue(of({ msg: '1005:success', email: 'test@example.com' }))
        component.ngOnInit()
        expect(spySignup).toHaveBeenCalledWith('1234')
    })

    it('should handle successful signup response for code 1005', () => {
        const mockResponse = { msg: '1005:success', email: 'test@example.com' }
        mockSignupAutoService.signup.mockReturnValue(of(mockResponse))

        component.signup('1234')

        expect(component.fetching).toBe(false)
        expect(component.showResonse).toBe(true)
        expect(component.msg).toContain('You have been registered successfully on the platform with email test@example.com')
        expect(mockSnackBar.open).toHaveBeenCalledWith(component.msg, 'X', { duration: 5000 })
    })

    it('should handle response code 1001', () => {
        mockSignupAutoService.signup.mockReturnValue(of({ msg: '1001:error', email: '' }))
        component.signup('1234')
        expect(component.msg).toBe('Something went wrong, please contact administrator')
        expect(component.fetching).toBe(false)
    })

    it('should handle response code 1002', () => {
        mockSignupAutoService.signup.mockReturnValue(of({ msg: '1002:invalid', email: '' }))
        component.signup('1234')
        expect(component.msg).toBe('Registered email address is not valid, so please contact administrator')
        expect(component.showResonse).toBe(true)
    })

    it('should handle response code 1003', () => {
        mockSignupAutoService.signup.mockReturnValue(of({ msg: '1003:already', email: 'user@test.com' }))
        component.signup('1234')
        expect(component.msg).toContain('You have been already registered successfully on the platform with email user@test.com')
    })

    it('should handle response code 1004', () => {
        mockSignupAutoService.signup.mockReturnValue(of({ msg: '1004:already', email: '' }))
        component.signup('1234')
        expect(component.msg).toContain('You have been already registered successfully on the platform')
        expect(component.msg).toContain('If you have trouble logging in please contact administrator')
    })

    it('should handle unknown response code with default message', () => {
        const mockResponse = { msg: '9999:unknown error', email: 'test@example.com' }
        mockSignupAutoService.signup.mockReturnValue(of(mockResponse))

        component.signup('1234')

        expect(component.fetching).toBe(false)
        expect(component.msg).toBe('Something went wrong, please contact administrator')
        expect(component.showResonse).toBe(true)
        expect(mockSnackBar.open).toHaveBeenCalledWith(component.msg, 'X', { duration: 5000 })
    })

    it('should handle error response in signup method', () => {
        const mockError = { error: { msg: 'Some error occurred' } }
        mockSignupAutoService.signup.mockReturnValue(throwError(mockError))

        component.signup('1234')

        expect(component.fetching).toBe(false)
        expect(component.showResonse).toBe(true)
        expect(component.msg).toBe('Something went wrong please try again later!!')
        expect(mockSnackBar.open).toHaveBeenCalledWith('Some error occurred', 'X', { duration: 5000 })
    })
})
