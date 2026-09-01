import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { ViewReportDialogComponent } from './view-report-dialog.component'

// Mock dependencies
const mockDialogRef = {
    close: jest.fn()
}

const mockBlendedApprovalService = {
    getSurveyByUserID: jest.fn()
}

const mockData = {
    formId: 'test-form-id',
    userId: 'test-user-id'
}

describe('ViewReportDialogComponent', () => {
    let component: ViewReportDialogComponent

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()

        // Create component instance with mocked dependencies
        component = new ViewReportDialogComponent(
            mockDialogRef as any,
            mockData,
            mockBlendedApprovalService as any
        )
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    it('should create component', () => {
        expect(component).toBeDefined()
        expect(component).toBeInstanceOf(ViewReportDialogComponent)
    })

    describe('Constructor', () => {
        it('should initialize reasonForm with proper structure', () => {
            expect(component.reasonForm).toBeInstanceOf(UntypedFormGroup)
            expect(component.reasonForm.get('reason')).toBeInstanceOf(UntypedFormControl)
        })

        it('should set reason control with required validator', () => {
            const reasonControl = component.reasonForm.get('reason')
            expect(reasonControl?.hasError('required')).toBe(true)

            reasonControl?.setValue('test reason')
            expect(reasonControl?.hasError('required')).toBe(false)
        })

        it('should set reason control with maxLength validator', () => {
            const reasonControl = component.reasonForm.get('reason')

            // Test with exactly 500 characters
            reasonControl?.setValue('a'.repeat(500))
            expect(reasonControl?.hasError('maxlength')).toBe(false)

            // Test with more than 500 characters
            reasonControl?.setValue('a'.repeat(501))
            expect(reasonControl?.hasError('maxlength')).toBe(true)
        })

        it('should initialize component properties', () => {
            expect(component.isReadOnly).toBe(true)
            expect(component.showSpinner).toBe(true)
            expect(component.data).toEqual(mockData)
        })
    })

    describe('ngOnInit', () => {
        it('should call getSurveyReport', () => {
            const getSurveyReportSpy = jest.spyOn(component, 'getSurveyReport').mockImplementation()

            component.ngOnInit()

            expect(getSurveyReportSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('getSurveyReport', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should build correct request object', async () => {
            const mockResponse = {
                statusInfo: { statusCode: 200 },
                responseData: [{ formId: 'test', timestamp: 1000 }]
            }

            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(mockResponse))

            await component.getSurveyReport()

            const expectedRequest = {
                searchObjects: [
                    {
                        key: 'formId',
                        values: 'test-form-id',
                    },
                    {
                        key: 'updatedBy',
                        values: 'test-user-id',
                    },
                ],
            }

            expect(mockBlendedApprovalService.getSurveyByUserID).toHaveBeenCalledWith(expectedRequest)
        })

        it('should handle successful response with status code 200', async () => {
            const mockResponse = {
                statusInfo: { statusCode: 200 },
                responseData: [
                    { formId: 'form1', timestamp: 1000 },
                    { formId: 'form2', timestamp: 3000 },
                    { formId: 'form3', timestamp: 2000 }
                ]
            }

            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(mockResponse))

            await component.getSurveyReport()

            // Should get the item with highest timestamp (latest)
            expect(component.latestData).toEqual({ formId: 'form2', timestamp: 3000 })
        })

        it('should set apiData after successful response', async () => {
            const mockResponse = {
                statusInfo: { statusCode: 200 },
                responseData: [
                    { formId: 'test-form-id', timestamp: 1000 }
                ]
            }

            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(mockResponse))

            await component.getSurveyReport()

            expect(component.apiData).toEqual({
                getAPI: '/apis/proxies/v8/forms/getFormById?id=test-form-id',
                postAPI: '/apis/proxies/v8/forms/v1/saveFormSubmit',
                getAllApplications: '/apis/proxies/v8/forms/getAllApplications',
                customizedHeader: {},
            })
        })

        it('should set showSpinner to false after timeout on successful response', async () => {
            const mockResponse = {
                statusInfo: { statusCode: 200 },
                responseData: [{ formId: 'test', timestamp: 1000 }]
            }

            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(mockResponse))

            await component.getSurveyReport()

            expect(component.showSpinner).toBe(true)

            // Fast-forward time by 1000ms
            jest.advanceTimersByTime(1000)

            expect(component.showSpinner).toBe(false)
        })

        it('should handle API error gracefully', async () => {
            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(throwError('API Error'))

            await expect(component.getSurveyReport()).resolves.not.toThrow()

            expect(component.latestData).toBeUndefined()
        })

        it('should handle response with non-200 status code', async () => {
            const mockResponse = {
                statusInfo: { statusCode: 404 },
                responseData: []
            }

            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(mockResponse))

            await component.getSurveyReport()

            expect(component.latestData).toBeUndefined()
            expect(component.showSpinner).toBe(true) // Should remain true as timeout won't be set
        })

        it('should handle null/undefined response', async () => {
            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(null))

            await component.getSurveyReport()

            expect(component.latestData).toBeUndefined()
        })

        it('should handle empty responseData array', async () => {
            const mockResponse = {
                statusInfo: { statusCode: 200 },
                responseData: []
            }

            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(mockResponse))

            await component.getSurveyReport()

            expect(component.latestData).toBeUndefined()
        })

        it('should sort responseData by timestamp correctly', async () => {
            const mockResponse = {
                statusInfo: { statusCode: 200 },
                responseData: [
                    { formId: 'form1', timestamp: 5000 },
                    { formId: 'form2', timestamp: 1000 },
                    { formId: 'form3', timestamp: 3000 },
                    { formId: 'form4', timestamp: 2000 }
                ]
            }

            mockBlendedApprovalService.getSurveyByUserID.mockReturnValue(of(mockResponse))

            await component.getSurveyReport()

            // Should get the last item after sorting (highest timestamp)
            expect(component.latestData).toEqual({ formId: 'form1', timestamp: 5000 })
        })
    })

    describe('onClose', () => {
        it('should close dialog with true value', () => {
            component.onClose()

            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
            expect(mockDialogRef.close).toHaveBeenCalledWith(true)
        })
    })

    describe('Form Validation', () => {
        it('should validate empty reason as invalid', () => {
            const reasonControl = component.reasonForm.get('reason')

            reasonControl?.setValue('')
            expect(reasonControl?.invalid).toBe(true)
            expect(reasonControl?.hasError('required')).toBe(true)
        })

        it('should validate non-empty reason as valid', () => {
            const reasonControl = component.reasonForm.get('reason')

            reasonControl?.setValue('Valid reason')
            expect(reasonControl?.valid).toBe(true)
            expect(reasonControl?.hasError('required')).toBe(false)
        })

        it('should validate reason with exactly 500 characters as valid', () => {
            const reasonControl = component.reasonForm.get('reason')

            reasonControl?.setValue('a'.repeat(500))
            expect(reasonControl?.valid).toBe(true)
            expect(reasonControl?.hasError('maxlength')).toBe(false)
        })

        it('should validate reason with more than 500 characters as invalid', () => {
            const reasonControl = component.reasonForm.get('reason')

            reasonControl?.setValue('a'.repeat(501))
            expect(reasonControl?.invalid).toBe(true)
            expect(reasonControl?.hasError('maxlength')).toBe(true)
        })

        it('should have correct maxlength error details', () => {
            const reasonControl = component.reasonForm.get('reason')

            reasonControl?.setValue('a'.repeat(501))
            const maxlengthError = reasonControl?.getError('maxlength')

            expect(maxlengthError).toBeDefined()
            expect(maxlengthError.requiredLength).toBe(500)
            expect(maxlengthError.actualLength).toBe(501)
        })
    })

    describe('Component Properties', () => {
        it('should have correct initial property values', () => {
            expect(component.isReadOnly).toBe(true)
            expect(component.showSpinner).toBe(true)
            expect(component.apiData).toBeUndefined()
            expect(component.latestData).toBeUndefined()
        })

        it('should have access to injected data', () => {
            expect(component.data).toEqual(mockData)
            expect(component.data.formId).toBe('test-form-id')
            expect(component.data.userId).toBe('test-user-id')
        })
    })
})