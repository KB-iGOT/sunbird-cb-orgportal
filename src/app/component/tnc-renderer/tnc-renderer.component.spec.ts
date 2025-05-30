import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core'
import { TncRendererComponent } from './tnc-renderer.component'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { NsTnc } from '../../models/tnc.model'

// Mock the ConfigurationsService
class MockConfigurationsService {
    restrictedFeatures: Set<string> | null = null;
}

describe('TncRendererComponent', () => {
    let component: TncRendererComponent
    let fixture: ComponentFixture<TncRendererComponent>
    let mockConfigService: MockConfigurationsService

    // Mock data
    const mockTncData: NsTnc.ITnc = {
        isAccepted: false,
        termsAndConditions: [
            {
                name: 'Generic T&C',
                isAccepted: false,
                content: "General terms content",
                acceptedDate: new Date(),
                acceptedLanguage: '',
                acceptedVersion: '',
                availableLanguages: [],
                language: '',
                version: ''
            },
            {
                name: 'Data Privacy',
                isAccepted: false,
                content: 'Data policy content',
                acceptedDate: new Date(),
                acceptedLanguage: '',
                acceptedVersion: '',
                availableLanguages: [],
                language: '',
                version: ''
            }
        ]
    }

    beforeEach(async () => {
        mockConfigService = new MockConfigurationsService()

        await TestBed.configureTestingModule({
            declarations: [TncRendererComponent],
            providers: [
                { provide: ConfigurationsService, useValue: mockConfigService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .overrideComponent(TncRendererComponent, {
                set: {
                    template: '<div>Mock Template for Testing</div>',
                    styleUrls: []
                }
            })
            .compileComponents()

        fixture = TestBed.createComponent(TncRendererComponent)
        component = fixture.componentInstance
    })

    afterEach(() => {
        if (fixture) {
            fixture.destroy()
        }
    })

    describe('Component Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.tncData).toBeNull()
            expect(component.generalTnc).toBeNull()
            expect(component.dpTnc).toBeNull()
            expect(component.termsOfUser).toBe(true)
            expect(component.currentPanel).toBe('tnc')
        })

        it('should initialize EventEmitters', () => {
            expect(component.tncChange).toBeInstanceOf(EventEmitter)
            expect(component.dpChange).toBeInstanceOf(EventEmitter)
        })
    })

    describe('Constructor', () => {
        it('should set termsOfUser to true when restrictedFeatures is null', () => {
            mockConfigService.restrictedFeatures = null
            const newComponent = new TncRendererComponent(mockConfigService as ConfigurationsService)
            expect(newComponent.termsOfUser).toBe(true)
        })

        it('should set termsOfUser to false when termsOfUser is in restrictedFeatures', () => {
            mockConfigService.restrictedFeatures = new Set(['termsOfUser'])
            const newComponent = new TncRendererComponent(mockConfigService as ConfigurationsService)
            expect(newComponent.termsOfUser).toBe(false)
        })

        it('should set termsOfUser to true when termsOfUser is not in restrictedFeatures', () => {
            mockConfigService.restrictedFeatures = new Set(['otherFeature'])
            const newComponent = new TncRendererComponent(mockConfigService as ConfigurationsService)
            expect(newComponent.termsOfUser).toBe(true)
        })
    })

    describe('ngOnInit', () => {
        it('should not process data when tncData is null', () => {
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

        it('should set currentPanel to "dp" when main tnc is not accepted and dp is not accepted', () => {
            const tncData = {
                ...mockTncData,
                isAccepted: false
            }
            component.tncData = tncData
            component.dpTnc = { ...mockTncData.termsAndConditions[1], isAccepted: false }

            component.ngOnInit()

            expect(component.currentPanel).toBe('dp')
        })

        it('should set currentPanel to "tnc" when main tnc is not accepted and general tnc is not accepted', () => {
            const tncData = {
                ...mockTncData,
                isAccepted: false
            }
            component.tncData = tncData
            component.generalTnc = { ...mockTncData.termsAndConditions[0], isAccepted: false }

            component.ngOnInit()

            expect(component.currentPanel).toBe('tnc')
        })

        it('should prioritize "tnc" panel when both general and dp are not accepted', () => {
            const tncData = {
                ...mockTncData,
                isAccepted: false
            }
            component.tncData = tncData
            component.dpTnc = { ...mockTncData.termsAndConditions[1], isAccepted: false }
            component.generalTnc = { ...mockTncData.termsAndConditions[0], isAccepted: false }

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
        it('should assign generalTnc for "Generic T&C" name', () => {
            component.tncData = mockTncData;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toEqual(mockTncData.termsAndConditions[0])
            expect(component.dpTnc).toEqual(mockTncData.termsAndConditions[1])
        })

        it('should assign dpTnc for non-"Generic T&C" names', () => {
            const tncDataWithDifferentNames: NsTnc.ITnc = {
                isAccepted: false,
                termsAndConditions: [
                    {
                        name: 'Data Privacy',
                        isAccepted: false,
                        content: 'Privacy content',
                        acceptedDate: new Date(),
                        acceptedLanguage: '',
                        acceptedVersion: '',
                        availableLanguages: [],
                        language: '',
                        version: ''
                    },
                    {
                        name: 'Generic T&C',
                        isAccepted: false,
                        content: 'General terms content',
                        acceptedDate: new Date(),
                        acceptedLanguage: '',
                        acceptedVersion: '',
                        availableLanguages: [],
                        language: '',
                        version: ''
                    }
                ]
            }
            component.tncData = tncDataWithDifferentNames;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toEqual(tncDataWithDifferentNames.termsAndConditions[1])
            expect(component.dpTnc).toEqual(tncDataWithDifferentNames.termsAndConditions[0])
        })

        it('should handle empty termsAndConditions array', () => {
            component.tncData = {
                isAccepted: false,
                termsAndConditions: []
            };

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toBeNull()
            expect(component.dpTnc).toBeNull()
        })

        it('should not process when tncData is null', () => {
            component.tncData = null
            component.generalTnc = null
            component.dpTnc = null;

            (component as any).assignGeneralAndDp()

            expect(component.generalTnc).toBeNull()
            expect(component.dpTnc).toBeNull()
        })
    })

    describe('reCenterPanel', () => {
        let mockElement: HTMLElement

        beforeEach(() => {
            mockElement = {
                scrollIntoView: jest.fn()
            } as any
        })

        it('should call scrollIntoView when tnc element exists', () => {
            const getElementSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockElement)

            component.reCenterPanel()

            expect(getElementSpy).toHaveBeenCalledWith('tnc')
            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start'
            })
        })

        it('should not throw error when tnc element does not exist', () => {
            const getElementSpy = jest.spyOn(document, 'getElementById').mockReturnValue(null)

            expect(() => component.reCenterPanel()).not.toThrow()
            expect(getElementSpy).toHaveBeenCalledWith('tnc')
        })
    })

    describe('changeTncLang', () => {
        it('should emit tncChange event with correct locale', () => {
            const emitSpy = jest.spyOn(component.tncChange, 'emit')
            const locale = 'hi'

            component.changeTncLang(locale)

            expect(emitSpy).toHaveBeenCalledWith(locale)
        })

        it('should emit tncChange event with empty string', () => {
            const emitSpy = jest.spyOn(component.tncChange, 'emit')
            const locale = ''

            component.changeTncLang(locale)

            expect(emitSpy).toHaveBeenCalledWith(locale)
        })
    })

    describe('changeDpLang', () => {
        it('should emit dpChange event with correct locale', () => {
            const emitSpy = jest.spyOn(component.dpChange, 'emit')
            const locale = 'hi'

            component.changeDpLang(locale)

            expect(emitSpy).toHaveBeenCalledWith(locale)
        })

        it('should emit dpChange event with empty string', () => {
            const emitSpy = jest.spyOn(component.dpChange, 'emit')
            const locale = ''

            component.changeDpLang(locale)

            expect(emitSpy).toHaveBeenCalledWith(locale)
        })
    })

    describe('Input and Output Properties', () => {
        it('should handle tncData input changes', () => {
            const newTncData = { ...mockTncData, isAccepted: true }

            component.tncData = newTncData

            expect(component.tncData).toEqual(newTncData)
        })

        it('should initialize outputs as EventEmitters', () => {
            expect(component.tncChange).toBeInstanceOf(EventEmitter)
            expect(component.dpChange).toBeInstanceOf(EventEmitter)
        })
    })

    describe('Integration Tests', () => {
        it('should properly initialize and process mock data through full lifecycle', () => {
            component.tncData = mockTncData

            component.ngOnInit()

            expect(component.generalTnc?.name).toBe('Generic T&C')
            expect(component.dpTnc?.name).toBe('Data Policy')
            expect(component.currentPanel).toBe('dp') // dp should be selected first when both are not accepted
        })

        it('should handle complete workflow with accepted terms', () => {
            const acceptedTncData = {
                ...mockTncData,
                isAccepted: true,
                termsAndConditions: mockTncData.termsAndConditions.map(tnc => ({
                    ...tnc,
                    isAccepted: true
                }))
            }
            component.tncData = acceptedTncData

            component.ngOnInit()

            expect(component.generalTnc?.isAccepted).toBe(true)
            expect(component.dpTnc?.isAccepted).toBe(true)
            expect(component.currentPanel).toBe('tnc') // Should remain default when all accepted
        })
    })
})