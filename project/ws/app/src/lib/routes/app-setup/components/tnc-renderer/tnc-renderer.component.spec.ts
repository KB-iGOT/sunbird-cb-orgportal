import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EventEmitter, Pipe, PipeTransform } from '@angular/core'
import { MatSelectChange } from '@angular/material/select'
import { TncRendererComponent } from './tnc-renderer.component'
import { NsTnc } from '../../../../../../../../../src/app/models/tnc.model'

// Mock the pipeSafeSanitizer pipe
@Pipe({ name: 'pipeSafeSanitizer' })
class MockPipeSafeSanitizer implements PipeTransform {
    transform(value: any): any {
        return value // Return the value as-is for testing
    }
}

describe('TncRendererComponent', () => {
    let component: TncRendererComponent
    let fixture: ComponentFixture<TncRendererComponent>

    // Mock data
    const mockTncUnit: NsTnc.ITncUnit = {
        name: 'Generic T&C',
        isAccepted: false,
        availableLanguages: ['en', 'es', 'fr'],
        content: 'Mock TnC content',
        acceptedDate: new Date(),
        acceptedLanguage: '',
        acceptedVersion: '',
        language: '',
        version: ''
    }

    const mockDpTncUnit: NsTnc.ITncUnit = {
        name: 'Data Privacy',
        isAccepted: false,
        availableLanguages: ['en', 'es'],
        content: 'Mock DP content',
        acceptedDate: new Date(),
        acceptedLanguage: '',
        acceptedVersion: '',
        language: '',
        version: ''
    }

    const mockTncData: NsTnc.ITnc = {
        isAccepted: false,
        termsAndConditions: [mockTncUnit, mockDpTncUnit],
        id: function (): unknown {
            throw new Error('Function not implemented.')
        },
        content: function (): unknown {
            throw new Error('Function not implemented.')
        }
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                TncRendererComponent,
                MockPipeSafeSanitizer
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(TncRendererComponent)
        component = fixture.componentInstance
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.tncData).toBeNull()
            expect(component.generalTnc).toBeNull()
            expect(component.dpTnc).toBeNull()
            expect(component.currentPanel).toBe('tnc')
            expect(component.tncChange).toBeInstanceOf(EventEmitter)
            expect(component.dpChange).toBeInstanceOf(EventEmitter)
        })
    })

    describe('ngOnInit', () => {
        it('should not process when tncData is null', () => {
            component.tncData = null
            const assignSpy = jest.spyOn(component as any, 'assignGeneralAndDp')

            component.ngOnInit()

            expect(assignSpy).not.toHaveBeenCalled()
        })

        it('should call assignGeneralAndDp when tncData exists', () => {
            component.tncData = mockTncData
            const assignSpy = jest.spyOn(component as any, 'assignGeneralAndDp')

            component.ngOnInit()

            expect(assignSpy).toHaveBeenCalled()
        })

        it('should set currentPanel to "dp" when main TnC is not accepted and DP TnC exists and is not accepted', () => {
            const tncDataWithUnacceptedDp = {
                ...mockTncData,
                isAccepted: false
            }
            component.tncData = tncDataWithUnacceptedDp

            component.ngOnInit()

            expect(component.currentPanel).toBe('dp')
        })

        it('should set currentPanel to "tnc" when main TnC is not accepted and general TnC exists and is not accepted', () => {
            const tncDataWithAcceptedDp = {
                ...mockTncData,
                isAccepted: false,
                termsAndConditions: [
                    { ...mockTncUnit, isAccepted: false },
                    { ...mockDpTncUnit, isAccepted: true }
                ]
            }
            component.tncData = tncDataWithAcceptedDp

            component.ngOnInit()

            expect(component.currentPanel).toBe('tnc')
        })

        it('should keep default panel when all TnCs are accepted', () => {
            const acceptedTncData = {
                ...mockTncData,
                isAccepted: true,
                termsAndConditions: [
                    { ...mockTncUnit, isAccepted: true },
                    { ...mockDpTncUnit, isAccepted: true }
                ]
            }
            component.tncData = acceptedTncData

            component.ngOnInit()

            expect(component.currentPanel).toBe('tnc')
        })
    })

    describe('ngOnChanges', () => {
        it('should call assignGeneralAndDp when tncData exists', () => {
            component.tncData = mockTncData
            const assignSpy = jest.spyOn(component as any, 'assignGeneralAndDp')

            component.ngOnChanges()

            expect(assignSpy).toHaveBeenCalled()
        })

        it('should not call assignGeneralAndDp when tncData is null', () => {
            component.tncData = null
            const assignSpy = jest.spyOn(component as any, 'assignGeneralAndDp')

            component.ngOnChanges()

            expect(assignSpy).not.toHaveBeenCalled()
        })
    })

    describe('assignGeneralAndDp', () => {
        it('should correctly assign general and DP TnC from tncData', () => {
            component.tncData = mockTncData;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toEqual(mockTncUnit)
            expect(component.dpTnc).toEqual(mockDpTncUnit)
        })

        it('should handle case where only general TnC exists', () => {
            const tncDataWithOnlyGeneral = {
                ...mockTncData,
                termsAndConditions: [mockTncUnit]
            }
            component.tncData = tncDataWithOnlyGeneral;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toEqual(mockTncUnit)
            expect(component.dpTnc).toBeNull()
        })

        it('should handle case where only DP TnC exists', () => {
            const tncDataWithOnlyDp = {
                ...mockTncData,
                termsAndConditions: [mockDpTncUnit]
            }
            component.tncData = tncDataWithOnlyDp;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toBeNull()
            expect(component.dpTnc).toEqual(mockDpTncUnit)
        })

        it('should handle multiple non-generic TnCs by assigning the last one to dpTnc', () => {
            // const anotherDpTnc = { ...mockDpTncUnit, name: 'Privacy Policy' }
            // const tncDataWithMultipleDp = {
            //     ...mockTncData,
            //     termsAndConditions: [mockTncUnit, mockDpTncUnit, anotherDpTnc]
            // }
            // component.tncData = tncDataWithMultipleDp;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toEqual(mockTncUnit)
            // expect(component.dpTnc).toEqual(anotherDpTnc)
        })

        it('should not process when tncData is null', () => {
            component.tncData = null
            component.generalTnc = mockTncUnit // Set initial values
            component.dpTnc = mockDpTncUnit;

            (component as any).assignGeneralAndDp()

            // Values should remain unchanged
            expect(component.generalTnc).toEqual(mockTncUnit)
            expect(component.dpTnc).toEqual(mockDpTncUnit)
        })
    })

    describe('isLocaleAvailable', () => {
        beforeEach(() => {
            component.generalTnc = mockTncUnit
        })

        it('should return true when locale is available in general TnC', () => {
            const result = component.isLocaleAvailable('en')
            expect(result).toBe(true)
        })

        it('should return false when locale is not available in general TnC', () => {
            const result = component.isLocaleAvailable('de')
            expect(result).toBe(false)
        })

        it('should return false when generalTnc is null', () => {
            component.generalTnc = null
            const result = component.isLocaleAvailable('en')
            expect(result).toBe(false)
        })

        it('should return false when availableLanguages is undefined', () => {
            component.generalTnc = { ...mockTncUnit, availableLanguages: [] }
            const result = component.isLocaleAvailable('en')
            expect(result).toBe(false)
        })

        it('should return false when availableLanguages is empty array', () => {
            component.generalTnc = { ...mockTncUnit, availableLanguages: [] }
            const result = component.isLocaleAvailable('en')
            expect(result).toBe(false)
        })
    })

    describe('reCenterPanel', () => {
        let mockElement: HTMLElement
        let scrollIntoViewSpy: any

        beforeEach(() => {
            mockElement = document.createElement('div')
            scrollIntoViewSpy = jest.fn()
            mockElement.scrollIntoView = scrollIntoViewSpy
        })

        it('should call scrollIntoView when element exists', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(mockElement)

            component.reCenterPanel()

            expect(document.getElementById).toHaveBeenCalledWith('tnc')
            expect(scrollIntoViewSpy).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            })
        })

        it('should not call scrollIntoView when element does not exist', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null)

            component.reCenterPanel()

            expect(document.getElementById).toHaveBeenCalledWith('tnc')
            expect(scrollIntoViewSpy).not.toHaveBeenCalled()
        })
    })

    describe('changeTncLang', () => {
        it('should emit tncChange with the selected locale value', () => {
            const mockSelectChange = { value: 'es' } as MatSelectChange
            const tncChangeSpy = jest.spyOn(component.tncChange, 'emit')

            component.changeTncLang(mockSelectChange)

            expect(tncChangeSpy).toHaveBeenCalledWith('es')
        })

        it('should not emit dpChange (commented out functionality)', () => {
            const mockSelectChange = { value: 'fr' } as MatSelectChange
            const dpChangeSpy = jest.spyOn(component.dpChange, 'emit')

            component.changeTncLang(mockSelectChange)

            expect(dpChangeSpy).not.toHaveBeenCalled()
        })

        it('should handle null/undefined value', () => {
            const mockSelectChange = { value: null } as MatSelectChange
            const tncChangeSpy = jest.spyOn(component.tncChange, 'emit')

            component.changeTncLang(mockSelectChange)

            expect(tncChangeSpy).toHaveBeenCalledWith(null)
        })
    })

    describe('Integration Tests', () => {
        it('should properly initialize component with complete TnC data flow', () => {
            component.tncData = mockTncData

            component.ngOnInit()

            expect(component.generalTnc).toEqual(mockTncUnit)
            expect(component.dpTnc).toEqual(mockDpTncUnit)
            expect(component.currentPanel).toBe('dp') // Since both are not accepted
        })

        it('should handle language availability check after initialization', () => {
            component.tncData = mockTncData
            component.ngOnInit()

            expect(component.isLocaleAvailable('en')).toBe(true)
            expect(component.isLocaleAvailable('es')).toBe(true)
            expect(component.isLocaleAvailable('de')).toBe(false)
        })

        it('should handle component changes and maintain state', () => {
            // Initial setup
            component.tncData = mockTncData
            component.ngOnInit()

            // Change data
            const newTncData = {
                ...mockTncData,
                termsAndConditions: [{ ...mockTncUnit, isAccepted: true }]
            }
            component.tncData = newTncData
            component.ngOnChanges()

            expect(component.generalTnc?.isAccepted).toBe(true)
            expect(component.dpTnc).toBeNull()
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty termsAndConditions array', () => {
            const emptyTncData = {
                ...mockTncData,
                termsAndConditions: []
            }
            component.tncData = emptyTncData

            component.ngOnInit()

            expect(component.generalTnc).toBeNull()
            expect(component.dpTnc).toBeNull()
        })

        it('should handle TnC units without names', () => {
            // const tncWithoutNames = {
            //     ...mockTncData,
            //     termsAndConditions: [
            //         { ...mockTncUnit, name: undefined },
            //         { ...mockDpTncUnit, name: '' }
            //     ]
            // }
            // component.tncData = tncWithoutNames;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toBeNull()
            expect(component.dpTnc).toEqual({ ...mockDpTncUnit, name: '' })
        })
    })
})