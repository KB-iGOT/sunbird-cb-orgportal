import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog'
import { of, throwError } from 'rxjs'

import { StaffdetailspopupComponent } from './staffdetailspopup.component'
import { MdoInfoService } from '../../services/mdoinfo.service'

describe('StaffdetailspopupComponent', () => {
    let component: StaffdetailspopupComponent
    let fixture: ComponentFixture<StaffdetailspopupComponent>
    let mockDialogRef: jest.Mocked<MatDialogRef<StaffdetailspopupComponent>>
    let mockMdoInfoService: jest.Mocked<MdoInfoService>
    let mockDialogData: any

    const mockDesignationsResponse = {
        responseData: [
            { name: 'Manager', id: 1 },
            { name: 'Developer', id: 2 },
            { name: 'Analyst', id: 3 }
        ]
    }

    beforeEach(async () => {
        // Create Jest mocks for dependencies
        mockDialogRef = {
            close: jest.fn()
        } as any

        mockMdoInfoService = {
            getDesignations: jest.fn()
        } as any

        // Default dialog data
        mockDialogData = {}

        await TestBed.configureTestingModule({
            declarations: [StaffdetailspopupComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
                { provide: MdoInfoService, useValue: mockMdoInfoService }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(StaffdetailspopupComponent)
        component = fixture.componentInstance
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize staff form with required validators', () => {
            expect(component.staffform).toBeDefined()
            expect(component.staffform.get('designation')).toBeDefined()
            expect(component.staffform.get('posfilled')).toBeDefined()
            expect(component.staffform.get('posvacant')).toBeDefined()

            // Test required validators
            expect(component.staffform.get('designation')?.hasError('required')).toBeTruthy()
            expect(component.staffform.get('posfilled')?.hasError('required')).toBeTruthy()
            expect(component.staffform.get('posvacant')?.hasError('required')).toBeTruthy()
        })

        it('should initialize with empty form when no data provided', () => {
            expect(component.formInputData).toBeUndefined()
            expect(component.addedposititons).toBeUndefined()
            expect(component.selectedDesignation).toBeUndefined()
        })

        it('should populate form when data is provided in constructor', async () => {
            const testData = {
                data: {
                    position: 'Manager',
                    totalPositionsFilled: 5,
                    totalPositionsVacant: 3
                },
                addedposititons: [{ position: 'Developer' }]
            }

            TestBed.resetTestingModule()
            await TestBed.configureTestingModule({
                declarations: [StaffdetailspopupComponent],
                imports: [ReactiveFormsModule],
                providers: [
                    { provide: MatDialogRef, useValue: mockDialogRef },
                    { provide: MAT_DIALOG_DATA, useValue: testData },
                    { provide: MdoInfoService, useValue: mockMdoInfoService }
                ]
            }).compileComponents()

            const newFixture = TestBed.createComponent(StaffdetailspopupComponent)
            const newComponent = newFixture.componentInstance

            expect(newComponent.formInputData).toEqual(testData.data)
            expect(newComponent.addedposititons).toEqual(testData.addedposititons)
            expect(newComponent.selectedDesignation).toBe('Manager')
            expect(newComponent.staffform.get('designation')?.value).toBe('Manager')
            expect(newComponent.staffform.get('posfilled')?.value).toBe(5)
            expect(newComponent.staffform.get('posvacant')?.value).toBe(3)
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            mockMdoInfoService.getDesignations.mockReturnValue(of(mockDesignationsResponse))
        })

        it('should call getDesignations with correct parameters', () => {
            const expectedRequest = {
                searches: [
                    {
                        type: 'POSITION',
                        field: 'name',
                        keyword: '',
                    },
                    {
                        field: 'status',
                        keyword: 'VERIFIED',
                        type: 'POSITION',
                    },
                ],
            }

            component.ngOnInit()

            expect(mockMdoInfoService.getDesignations).toHaveBeenCalledWith(expectedRequest)
            expect(mockMdoInfoService.getDesignations).toHaveBeenCalledTimes(1)
        })

        it('should populate designationsMeta on successful API call', () => {
            component.ngOnInit()

            expect(component.designationsMeta).toEqual(mockDesignationsResponse.responseData)
        })

        it('should filter out already added positions', () => {
            component.addedposititons = [{ position: 'Manager' }, { position: 'Developer' }]

            component.ngOnInit()

            expect(component.designationsMeta).toEqual([{ name: 'Analyst', id: 3 }])
        })

        it('should handle API error gracefully', () => {
            mockMdoInfoService.getDesignations.mockReturnValue(throwError('API Error'))

            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should handle case when addedposititons is undefined', () => {
            component.addedposititons = undefined

            component.ngOnInit()

            expect(component.designationsMeta).toEqual(mockDesignationsResponse.responseData)
        })

        it('should handle case when addedposititons is empty array', () => {
            component.addedposititons = []

            component.ngOnInit()

            expect(component.designationsMeta).toEqual(mockDesignationsResponse.responseData)
        })

        it('should reset designationsMeta before populating new data', () => {
            component.designationsMeta = [{ name: 'OldData', id: 999 }]

            component.ngOnInit()

            expect(component.designationsMeta).toEqual(mockDesignationsResponse.responseData)
        })
    })

    describe('addstaffdetails', () => {
        beforeEach(() => {
            component.staffform.patchValue({
                designation: 'Manager',
                posfilled: '5',
                posvacant: '3'
            })
        })

        it('should update existing formInputData and close dialog when formInputData exists', () => {
            component.formInputData = {
                position: 'Developer',
                totalPositionsFilled: 2,
                totalPositionsVacant: 1
            }

            component.addstaffdetails(component.staffform)

            expect(component.formInputData.position).toBe('Manager')
            expect(component.formInputData.totalPositionsFilled).toBe('5')
            expect(component.formInputData.totalPositionsVacant).toBe('3')
            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: component.formInputData })
            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
        })

        it('should close dialog with form values when formInputData does not exist', () => {
            component.formInputData = undefined
            const mockForm = {
                value: {
                    designation: 'Manager',
                    posfilled: '5',
                    posvacant: '3'
                }
            }

            component.addstaffdetails(mockForm)

            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: mockForm.value })
            expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
        })

        it('should handle null formInputData', () => {
            component.formInputData = null
            const mockForm = {
                value: {
                    designation: 'Analyst',
                    posfilled: '2',
                    posvacant: '1'
                }
            }

            component.addstaffdetails(mockForm)

            expect(mockDialogRef.close).toHaveBeenCalledWith({ data: mockForm.value })
        })
    })

    describe('keyPressNumbers', () => {
        it('should allow numeric keys (0-9)', () => {
            for (let i = 48; i <= 57; i++) {
                const mockEvent = {
                    which: i,
                    keyCode: i,
                    preventDefault: jest.fn()
                }

                const result = component.keyPressNumbers(mockEvent)

                expect(result).toBeTruthy()
                expect(mockEvent.preventDefault).not.toHaveBeenCalled()
            }
        })

        it('should prevent non-numeric keys', () => {
            // Test various non-numeric key codes
            const nonNumericKeys = [32, 65, 97, 47, 58, 46, 45] // space, A, a, /, :, ., -

            nonNumericKeys.forEach(keyCode => {
                const mockEvent = {
                    which: keyCode,
                    keyCode: keyCode,
                    preventDefault: jest.fn()
                }

                const result = component.keyPressNumbers(mockEvent)

                expect(result).toBeFalsy()
                expect(mockEvent.preventDefault).toHaveBeenCalled()
                expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
            })
        })

        it('should use keyCode when which is not available', () => {
            const mockEvent = {
                which: null,
                keyCode: 50, // '2'
                preventDefault: jest.fn()
            }

            const result = component.keyPressNumbers(mockEvent)

            expect(result).toBeTruthy()
            expect(mockEvent.preventDefault).not.toHaveBeenCalled()
        })

        it('should prevent when both which and keyCode are non-numeric', () => {
            const mockEvent = {
                which: null,
                keyCode: 65, // 'A'
                preventDefault: jest.fn()
            }

            const result = component.keyPressNumbers(mockEvent)

            expect(result).toBeFalsy()
            expect(mockEvent.preventDefault).toHaveBeenCalled()
        })

        it('should handle edge case when which is 0', () => {
            const mockEvent = {
                which: 0,
                keyCode: 49, // '1'
                preventDefault: jest.fn()
            }

            const result = component.keyPressNumbers(mockEvent)

            expect(result).toBeTruthy()
            expect(mockEvent.preventDefault).not.toHaveBeenCalled()
        })

        it('should handle boundary values correctly', () => {
            // Test boundary values
            const boundaryTests = [
                { keyCode: 47, expected: false }, // just before '0'
                { keyCode: 48, expected: true },  // '0'
                { keyCode: 57, expected: true },  // '9'
                { keyCode: 58, expected: false }  // just after '9'
            ]

            boundaryTests.forEach(({ keyCode, expected }) => {
                const mockEvent = {
                    which: keyCode,
                    keyCode: keyCode,
                    preventDefault: jest.fn()
                }

                const result = component.keyPressNumbers(mockEvent)

                expect(result).toBe(expected)
                if (!expected) {
                    expect(mockEvent.preventDefault).toHaveBeenCalled()
                }
            })
        })
    })

    describe('Form Validation', () => {
        it('should validate required fields', () => {
            component.staffform.patchValue({
                designation: '',
                posfilled: '',
                posvacant: ''
            })

            expect(component.staffform.valid).toBeFalsy()
            expect(component.staffform.get('designation')?.hasError('required')).toBeTruthy()
            expect(component.staffform.get('posfilled')?.hasError('required')).toBeTruthy()
            expect(component.staffform.get('posvacant')?.hasError('required')).toBeTruthy()
        })

        it('should be valid when all required fields are filled', () => {
            component.staffform.patchValue({
                designation: 'Manager',
                posfilled: '5',
                posvacant: '3'
            })

            expect(component.staffform.valid).toBeTruthy()
        })

        it('should validate preventHtmlAndJs validator on posfilled', () => {
            component.staffform.patchValue({
                designation: 'Manager',
                posfilled: '<script>alert("test")</script>',
                posvacant: '3'
            })

            // Assuming preventHtmlAndJs validator works
            expect(component.staffform.get('posfilled')?.errors).toBeTruthy()
        })

        it('should validate preventHtmlAndJs validator on posvacant', () => {
            component.staffform.patchValue({
                designation: 'Manager',
                posfilled: '5',
                posvacant: '<div>test</div>'
            })

            // Assuming preventHtmlAndJs validator works
            expect(component.staffform.get('posvacant')?.errors).toBeTruthy()
        })
    })

    describe('Edge Cases', () => {
        it('should handle null or undefined values in form', () => {
            component.staffform.patchValue({
                designation: null,
                posfilled: undefined,
                posvacant: ''
            })

            expect(component.staffform.get('designation')?.value).toBeNull()
            expect(component.staffform.get('posfilled')?.value).toBeUndefined()
            expect(component.staffform.get('posvacant')?.value).toBe('')
        })

        it('should handle empty designationsMeta array', () => {
            mockMdoInfoService.getDesignations.mockReturnValue(of({ responseData: [] }))

            component.ngOnInit()

            expect(component.designationsMeta).toEqual([])
        })

        it('should handle malformed API response', () => {
            mockMdoInfoService.getDesignations.mockReturnValue(of({}))

            component.ngOnInit()

            expect(component.designationsMeta).toEqual([])
        })

        it('should handle API response without responseData property', () => {
            mockMdoInfoService.getDesignations.mockReturnValue(of({ otherProperty: 'test' }))

            component.ngOnInit()

            expect(component.designationsMeta).toEqual([])
        })

        it('should handle complex filtering scenario', () => {
            const complexDesignations = {
                responseData: [
                    { name: 'Manager', id: 1 },
                    { name: 'Developer', id: 2 },
                    { name: 'Analyst', id: 3 },
                    { name: 'Designer', id: 4 },
                    { name: 'Tester', id: 5 }
                ]
            }

            mockMdoInfoService.getDesignations.mockReturnValue(of(complexDesignations))
            component.addedposititons = [
                { position: 'Manager' },
                { position: 'Designer' },
                { position: 'NonExistent' } // This shouldn't affect filtering
            ]

            component.ngOnInit()

            expect(component.designationsMeta).toEqual([
                { name: 'Developer', id: 2 },
                { name: 'Analyst', id: 3 },
                { name: 'Tester', id: 5 }
            ])
        })
    })

    describe('Component State Management', () => {
        it('should maintain form state after ngOnInit', () => {
            component.staffform.patchValue({
                designation: 'TestDesignation',
                posfilled: '10',
                posvacant: '5'
            })

            mockMdoInfoService.getDesignations.mockReturnValue(of(mockDesignationsResponse))
            component.ngOnInit()

            expect(component.staffform.get('designation')?.value).toBe('TestDesignation')
            expect(component.staffform.get('posfilled')?.value).toBe('10')
            expect(component.staffform.get('posvacant')?.value).toBe('5')
        })

        it('should preserve selectedDesignation value', () => {
            component.selectedDesignation = 'InitialDesignation'

            mockMdoInfoService.getDesignations.mockReturnValue(of(mockDesignationsResponse))
            component.ngOnInit()

            expect(component.selectedDesignation).toBe('InitialDesignation')
        })
    })
})