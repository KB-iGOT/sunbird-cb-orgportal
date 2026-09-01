import { TrainingRogramsComponent } from './training-rograms.component'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { Subject, of } from 'rxjs'
import { COMMA, ENTER } from '@angular/cdk/keycodes'

// Mock dependencies
const mockOrgProfileService = {
    updateLocalFormValue: jest.fn(),
    updateFormStatus: jest.fn(),
    formValues: {
        rolesAndFunctions: {}
    }
}

const mockConfigurationsService = {
    unMappedUser: null
}

const mockMatDialog = {
    open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({}))
    })
}

describe('TrainingRogramsComponent', () => {
    let component: TrainingRogramsComponent

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()
        mockConfigurationsService.unMappedUser = null
        mockOrgProfileService.formValues = { rolesAndFunctions: {} }

        // Create component instance
        component = new TrainingRogramsComponent(
            mockOrgProfileService as any,
            mockConfigurationsService as any,
            mockMatDialog as any
        )
    })

    describe('Constructor', () => {
        it('should initialize the component with default form values', () => {
            expect(component.trainingProgramForm).toBeInstanceOf(UntypedFormGroup)
            expect(component.selectedSubjects).toEqual([])
            expect(component.separatorKeysCodes).toEqual([ENTER, COMMA])
            expect(component.isTraining).toBe(false)
        })

        it('should create form with correct controls and validators', () => {
            const form = component.trainingProgramForm

            expect(form.get('subjectName')).toBeInstanceOf(UntypedFormControl)
            expect(form.get('conductDigitalPrograms')).toBeInstanceOf(UntypedFormControl)
            expect(form.get('prepareDigitalContent')).toBeInstanceOf(UntypedFormControl)
            expect(form.get('videoCount')).toBeInstanceOf(UntypedFormControl)
            expect(form.get('pptCount')).toBeInstanceOf(UntypedFormControl)
            expect(form.get('otherMaterialCount')).toBeInstanceOf(UntypedFormControl)
            expect(form.get('otherInfo')).toBeInstanceOf(UntypedFormControl)

            // Check default values
            expect(form.get('conductDigitalPrograms')?.value).toBe('Yes')
            expect(form.get('prepareDigitalContent')?.value).toBe('Yes')
            expect(form.get('subjectName')?.value).toBe('')
        })

        it('should setup form value changes subscription', (done) => {
            // Mock the async operation in switchMap
            jest.spyOn(component, 'ngOnInit').mockImplementation(() => { })

            const testFormValue = {
                subjectName: 'Test Subject',
                conductDigitalPrograms: 'Yes'
            }

            component.selectedSubjects = ['Math', 'Science']
            component.trainingProgramForm.patchValue(testFormValue)

            setTimeout(() => {
                expect(mockOrgProfileService.updateLocalFormValue).toHaveBeenCalledWith(
                    'trainingPrograms',
                    expect.objectContaining({
                        ...testFormValue,
                        selectedSubjects: ['Math', 'Science']
                    })
                )
                done()
            }, 600) // Wait for debounceTime
        })
    })

    describe('ngOnInit', () => {
        it('should not populate form when unMappedUser is null', () => {
            mockConfigurationsService.unMappedUser = null

            component.ngOnInit()

            expect(component.trainingProgramForm.get('subjectName')?.value).toBe('')
            expect(component.selectedSubjects).toEqual([])
        })

        it('should populate form when unMappedUser has orgProfile data', () => {
            // const mockTrainingData = {
            //     subjectName: 'Test Subject',
            //     conductDigitalPrograms: 'No',
            //     prepareDigitalContent: 'No',
            //     videoCount: '10',
            //     pptCount: '5',
            //     otherMaterialCount: '3',
            //     otherInfo: 'Test info',
            //     selectedSubjects: ['Math', 'Science']
            // }

            // mockConfigurationsService.unMappedUser = {
            //     orgProfile: {
            //         profileDetails: {
            //             trainingPrograms: mockTrainingData
            //         }
            //     }
            // }

            component.ngOnInit()

            expect(component.trainingProgramForm.get('subjectName')?.value).toBe('Test Subject')
            expect(component.trainingProgramForm.get('conductDigitalPrograms')?.value).toBe('No')
            expect(component.trainingProgramForm.get('prepareDigitalContent')?.value).toBe('No')
            expect(component.trainingProgramForm.get('videoCount')?.value).toBe('10')
            expect(component.trainingProgramForm.get('pptCount')?.value).toBe('5')
            expect(component.trainingProgramForm.get('otherMaterialCount')?.value).toBe('3')
            expect(component.trainingProgramForm.get('otherInfo')?.value).toBe('Test info')
            expect(component.selectedSubjects).toEqual(['Math', 'Science'])
        })

        it('should use default Yes values when conductDigitalPrograms and prepareDigitalContent are not provided', () => {
            // mockConfigurationsService.unMappedUser = {
            //     orgProfile: {
            //         profileDetails: {
            //             trainingPrograms: {
            //                 subjectName: 'Test'
            //             }
            //         }
            //     }
            // }

            component.ngOnInit()

            expect(component.trainingProgramForm.get('conductDigitalPrograms')?.value).toBe('Yes')
            expect(component.trainingProgramForm.get('prepareDigitalContent')?.value).toBe('Yes')
        })

        it('should handle empty rolesAndFunctions from formValues', () => {
            mockOrgProfileService.formValues = { rolesAndFunctions: {} }
            // mockConfigurationsService.unMappedUser = {
            //     orgProfile: {
            //         profileDetails: {
            //             rolesAndFunctions: { training: false }
            //         }
            //     }
            // }

            const removeValidatorsSpy = jest.spyOn(component, 'removeValidators')

            component.ngOnInit()

            expect(component.isTraining).toBe(true)
            expect(removeValidatorsSpy).toHaveBeenCalled()
            expect(mockOrgProfileService.updateFormStatus).toHaveBeenCalledWith('trainingPrograms', true)
        })

        it('should use rolesAndFunctions from formValues when available', () => {
            mockOrgProfileService.formValues = {
                rolesAndFunctions: { training: true }
            }

            component.ngOnInit()

            expect(component.isTraining).toBe(false)
        })

        it('should remove validators when training is not selected in rolesAndFunctions', () => {
            mockOrgProfileService.formValues = {
                rolesAndFunctions: { training: false }
            }

            const removeValidatorsSpy = jest.spyOn(component, 'removeValidators')

            component.ngOnInit()

            expect(component.isTraining).toBe(true)
            expect(removeValidatorsSpy).toHaveBeenCalled()
            expect(mockOrgProfileService.updateFormStatus).toHaveBeenCalledWith('trainingPrograms', true)
        })
    })

    describe('removeValidators', () => {
        it('should clear validators for all form controls', () => {
            const controls = component.trainingProgramForm.controls

            // Add some validators first
            Object.keys(controls).forEach(key => {
                controls[key].setValidators([Validators.required])
            })

            const clearValidatorsSpy = jest.spyOn(controls.subjectName, 'clearValidators')
            const updateValueAndValiditySpy = jest.spyOn(controls.subjectName, 'updateValueAndValidity')

            component.removeValidators()

            expect(clearValidatorsSpy).toHaveBeenCalled()
            expect(updateValueAndValiditySpy).toHaveBeenCalled()
        })
    })

    describe('addSubject', () => {
        it('should add subject to selectedSubjects when value is provided', () => {
            const mockEvent = {
                input: { value: 'Test Subject' },
                value: 'Test Subject'
            }

            component.addSubject(mockEvent as any)

            expect(component.selectedSubjects).toContain('Test Subject')
            expect(mockEvent.input.value).toBe('')
            expect(component.trainingProgramForm.get('subjectName')?.value).toBeNull()
        })

        it('should not add subject when value is empty', () => {
            const mockEvent = {
                input: { value: '' },
                value: ''
            }

            component.addSubject(mockEvent as any)

            expect(component.selectedSubjects).toEqual([])
        })

        it('should handle null input', () => {
            const mockEvent = {
                input: null,
                value: 'Test Subject'
            }

            component.addSubject(mockEvent as any)

            expect(component.selectedSubjects).toContain('Test Subject')
        })

        it('should handle case when subjectName control does not exist', () => {
            // Remove the control
            component.trainingProgramForm.removeControl('subjectName')

            const mockEvent = {
                input: { value: 'Test Subject' },
                value: 'Test Subject'
            }

            expect(() => component.addSubject(mockEvent as any)).not.toThrow()
            expect(component.selectedSubjects).toContain('Test Subject')
        })
    })

    describe('removeSubject', () => {
        it('should remove subject from selectedSubjects', () => {
            component.selectedSubjects = ['Math', 'Science', 'History']

            component.removeSubject('Science')

            expect(component.selectedSubjects).toEqual(['Math', 'History'])
            expect(component.trainingProgramForm.get('subjectName')?.value).toBeNull()
        })

        it('should not modify array when subject is not found', () => {
            component.selectedSubjects = ['Math', 'Science']

            component.removeSubject('History')

            expect(component.selectedSubjects).toEqual(['Math', 'Science'])
        })

        it('should handle case when subjectName control does not exist', () => {
            component.selectedSubjects = ['Math', 'Science']
            component.trainingProgramForm.removeControl('subjectName')

            expect(() => component.removeSubject('Science')).not.toThrow()
            expect(component.selectedSubjects).toEqual(['Math'])
        })
    })

    describe('openActivityDialog', () => {
        it('should open dialog with correct configuration', () => {
            component.openActivityDialog()

            expect(mockMatDialog.open).toHaveBeenCalledWith(
                expect.anything(), // DialogBoxComponent
                {
                    data: { view: 'training' },
                    hasBackdrop: false,
                    width: '550px'
                }
            )
        })

        it('should subscribe to afterClosed', () => {
            const afterClosedSpy = jest.fn().mockReturnValue(of({}))
            mockMatDialog.open.mockReturnValue({
                afterClosed: afterClosedSpy
            })

            component.openActivityDialog()

            expect(afterClosedSpy).toHaveBeenCalled()
        })
    })

    describe('hasRequiredField', () => {
        it('should return true when field has required validator', () => {
            const control = new UntypedFormControl('', [Validators.required])
            component.trainingProgramForm.setControl('testField', control)

            const result = component.hasRequiredField('testField')

            expect(result).toBe(true)
        })

        it('should return false when field does not have required validator', () => {
            const control = new UntypedFormControl('', [])
            component.trainingProgramForm.setControl('testField', control)

            const result = component.hasRequiredField('testField')

            expect(result).toBe(false)
        })

        it('should return false when field does not exist', () => {
            const result = component.hasRequiredField('nonExistentField')

            expect(result).toBe(false)
        })

        it('should return false when field has no validator', () => {
            const control = new UntypedFormControl('')
            control.clearValidators()
            component.trainingProgramForm.setControl('testField', control)

            const result = component.hasRequiredField('testField')

            expect(result).toBe(false)
        })

        it('should return false when validator returns null', () => {
            const control = new UntypedFormControl('', [Validators.minLength(5)])
            component.trainingProgramForm.setControl('testField', control)

            const result = component.hasRequiredField('testField')

            expect(result).toBe(false)
        })
    })

    describe('Form Value Changes Subscription', () => {
        it('should update form status based on form validity and selectedSubjects when isTraining is false', (done) => {
            component.isTraining = false
            component.selectedSubjects = ['Math']

            // Make form valid
            component.trainingProgramForm.patchValue({
                conductDigitalPrograms: 'Yes',
                prepareDigitalContent: 'Yes',
                videoCount: '10',
                pptCount: '5',
                otherMaterialCount: '3'
            })

            setTimeout(() => {
                expect(mockOrgProfileService.updateFormStatus).toHaveBeenCalledWith('trainingPrograms', true)
                done()
            }, 600)
        })

        it('should update form status to true when isTraining is true', (done) => {
            component.isTraining = true

            component.trainingProgramForm.patchValue({
                subjectName: 'Test'
            })

            setTimeout(() => {
                expect(mockOrgProfileService.updateFormStatus).toHaveBeenCalledWith('trainingPrograms', true)
                done()
            }, 600)
        })

        it('should update form status to false when form is invalid and selectedSubjects is empty', (done) => {
            component.isTraining = false
            component.selectedSubjects = []

            // Make form invalid by not providing required fields
            component.trainingProgramForm.patchValue({
                conductDigitalPrograms: '',
                prepareDigitalContent: '',
                videoCount: '',
                pptCount: '',
                otherMaterialCount: ''
            })

            setTimeout(() => {
                expect(mockOrgProfileService.updateFormStatus).toHaveBeenCalledWith('trainingPrograms', false)
                done()
            }, 600)
        })
    })

    describe('Component Cleanup', () => {
        it('should have unsubscribe subject for cleanup', () => {
            expect(component['unsubscribe']).toBeInstanceOf(Subject)
        })
    })

    // describe('Edge Cases', () => {
    //     it('should handle undefined values in lodash get operations during ngOnInit', () => {
    //         mockConfigurationsService.unMappedUser = {
    //             orgProfile: {
    //                 profileDetails: {}
    //             }
    //         }

    //         expect(() => component.ngOnInit()).not.toThrow()
    //     })

    //     it('should handle missing orgProfile in unMappedUser', () => {
    //         mockConfigurationsService.unMappedUser = {}

    //         expect(() => component.ngOnInit()).not.toThrow()
    //     })

    //     it('should handle missing profileDetails in orgProfile', () => {
    //         mockConfigurationsService.unMappedUser = {
    //             orgProfile: {}
    //         }

    //         expect(() => component.ngOnInit()).not.toThrow()
    //     })
    // })
})