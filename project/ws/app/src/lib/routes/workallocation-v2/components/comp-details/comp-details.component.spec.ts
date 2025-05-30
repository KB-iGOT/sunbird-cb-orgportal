import { CompDetailsComponent } from './comp-details.component'
import { UntypedFormBuilder, UntypedFormArray, UntypedFormGroup } from '@angular/forms'
import { WatStoreService } from '../../services/wat.store.service'
import { Subject } from 'rxjs'
import * as _ from 'lodash'

// Mock lodash functions
jest.mock('lodash', () => ({
    get: jest.fn(),
    map: jest.fn(),
    compact: jest.fn()
}))

describe('CompDetailsComponent', () => {
    let component: CompDetailsComponent
    let mockWatStore: jest.Mocked<WatStoreService>
    let mockActivatedRoute: any
    let formBuilder: UntypedFormBuilder
    let mockCompGrpSubject: Subject<any>

    beforeEach(() => {
        // Mock WatStoreService
        mockCompGrpSubject = new Subject()
        mockWatStore = {
            get_compGrp: mockCompGrpSubject.asObservable(),
            updateCompGroup: jest.fn()
        } as any

        // Mock ActivatedRoute
        mockActivatedRoute = {
            snapshot: {
                data: {
                    pageData: {
                        data: {
                            levels: ['Basic', 'Proficient', 'Advanced', 'Expert', 'Master'],
                            compTypes: ['Technical', 'Behavioral', 'Leadership']
                        }
                    }
                }
            }
        }

        // Real FormBuilder
        formBuilder = new UntypedFormBuilder()

        // Create component instance
        component = new CompDetailsComponent(mockWatStore, formBuilder, mockActivatedRoute)
    })

    afterEach(() => {
        jest.clearAllMocks()
        mockCompGrpSubject.complete()
    })

    describe('Constructor', () => {
        it('should create component instance', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize levelLest from route data', () => {
            expect(component.levelLest).toEqual(['Basic', 'Proficient', 'Advanced', 'Expert', 'Master'])
        })

        it('should initialize compTypList from route data', () => {
            expect(component.compTypList).toEqual(['Technical', 'Behavioral', 'Leadership'])
        })

        it('should call generateForm during construction', () => {
            expect(component.compDetailForm).toBeDefined()
            expect(component.compDetailForm.get('competencyList')).toBeDefined()
        })
    })

    describe('ngOnInit', () => {
        it('should call fetchData and subscribe to form changes', () => {
            const fetchDataSpy = jest.spyOn(component, 'fetchData')

            component.ngOnInit()

            expect(fetchDataSpy).toHaveBeenCalled()
            expect(component.subscribeForm).toBeDefined()
        })

        it('should update watStore when form values change', () => {
            const mockFormValue = {
                competencyList: [{ compName: 'Test Competency' }]
            };

            (_.get as jest.Mock).mockReturnValue(mockFormValue.competencyList)

            component.ngOnInit()

            // Trigger form value change
            component.compDetailForm.patchValue(mockFormValue)

            expect(mockWatStore.updateCompGroup).toHaveBeenCalledWith(
                mockFormValue.competencyList,
                false,
                true
            )
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe from all subscriptions', () => {
            const mockGroupSubscription = { unsubscribe: jest.fn() }
            const mockSubscribeForm = { unsubscribe: jest.fn() }

            component.groupSubscription = mockGroupSubscription
            component.subscribeForm = mockSubscribeForm

            component.ngOnDestroy()

            expect(mockGroupSubscription.unsubscribe).toHaveBeenCalled()
            expect(mockSubscribeForm.unsubscribe).toHaveBeenCalled()
        })
    })

    describe('fetchData', () => {
        it('should subscribe to watStore.get_compGrp and update dataStructure', () => {
            const mockCompData = [
                {
                    localId: '1',
                    compId: 'comp1',
                    compName: 'Test Competency',
                    compDescription: 'Test Description',
                    compLevel: 'Basic',
                    compType: 'Technical',
                    compArea: 'Software',
                    compSource: 'Internal',
                    levelList: [{ alias: 'B', level: 'Basic' }]
                }
            ]

            const updateFormSpy = jest.spyOn(component, 'updateForm').mockImplementation()

            component.fetchData()

            // Emit data through the subject
            mockCompGrpSubject.next(mockCompData)

            expect(component.dataStructure).toEqual(mockCompData)
            expect(updateFormSpy).toHaveBeenCalled()
        })

        it('should not update form when comp data is empty', () => {
            const updateFormSpy = jest.spyOn(component, 'updateForm').mockImplementation()

            component.fetchData()
            mockCompGrpSubject.next([])

            expect(updateFormSpy).not.toHaveBeenCalled()
        })
    })

    describe('compList getter', () => {
        it('should return competencyList FormArray', () => {
            const result = component.compList

            expect(result).toBeInstanceOf(UntypedFormArray)
        })
    })

    describe('setCompValues', () => {
        it('should patch values to competencyList FormArray', () => {
            const mockValues = [{ compName: 'Test' }]
            const patchValueSpy = jest.spyOn(component.compList, 'patchValue')

            component.setCompValues(mockValues)

            expect(patchValueSpy).toHaveBeenCalledWith(mockValues)
        })
    })

    describe('generateForm', () => {
        it('should create form with competencyList FormArray', () => {
            component.generateForm()

            expect(component.compDetailForm).toBeInstanceOf(UntypedFormGroup)
            expect(component.compDetailForm.get('competencyList')).toBeInstanceOf(UntypedFormArray)
        })
    })

    describe('updateForm', () => {
        beforeEach(() => {
            component.dataStructure = [
                {
                    localId: 1,
                    compId: 'comp1',
                    compName: 'Test Competency',
                    compDescription: 'Test Description',
                    compLevel: 'Basic',
                    compType: 'Technical',
                    compArea: 'Software',
                    compSource: 'Internal',
                    levelList: [{ alias: 'B', level: 'Basic' }]
                }
            ]
        })

        it('should clear existing form array and rebuild it', () => {
            const clearSpy = jest.spyOn(component.compList, 'clear')
            const setCompValuesSpy = jest.spyOn(component, 'setCompValues').mockImplementation();

            // Mock lodash functions
            (_.get as jest.Mock).mockReturnValue([{ alias: 'B', level: 'Basic' }]);
            (_.map as jest.Mock).mockReturnValue([{ alias: 'B', level: 'Basic' }])

            component.updateForm()

            expect(clearSpy).toHaveBeenCalled()
            expect(setCompValuesSpy).toHaveBeenCalled()
        })

        it('should create form groups for each competency in dataStructure', () => {
            (_.get as jest.Mock).mockReturnValue([{ alias: 'B', level: 'Basic' }]);
            (_.map as jest.Mock).mockReturnValue([{ alias: 'B', level: 'Basic' }])

            const setCompValuesSpy = jest.spyOn(component, 'setCompValues').mockImplementation()

            component.updateForm()

            expect(setCompValuesSpy).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        localId: '1',
                        compId: 'comp1',
                        compDescription: 'Test Description'
                    })
                ])
            )
        })

        it('should skip items without compName', () => {
            component.dataStructure = [
                {
                    localId: 1,
                    compId: 'comp1',
                    compName: '', // Empty compName
                    compDescription: 'Test Description',
                    compLevel: 'Basic',
                    compType: 'Technical',
                    compArea: 'Software',
                    compSource: 'Internal',
                    levelList: []
                }
            ]

            const setCompValuesSpy = jest.spyOn(component, 'setCompValues').mockImplementation()

            component.updateForm()

            expect(setCompValuesSpy).toHaveBeenCalledWith([])
        })

        it('should use default levelLest when levelList is empty', () => {
            component.dataStructure[0].levelList = [];

            (_.get as jest.Mock).mockReturnValue([]);
            (_.map as jest.Mock).mockReturnValue([])

            const setCompValuesSpy = jest.spyOn(component, 'setCompValues').mockImplementation()

            component.updateForm()

            expect(setCompValuesSpy).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        levelList: component.levelLest
                    })
                ])
            )
        })
    })

    describe('getLocalPrint', () => {
        it('should convert bullet points to HTML list', () => {
            const input = '• Item 1• Item 2• Item 3';

            (_.compact as jest.Mock).mockReturnValue(['Item 1', 'Item 2', 'Item 3'])

            const result = component.getLocalPrint(input)

            expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>')
        })

        it('should handle empty items in bullet list', () => {
            const input = '• Item 1• • Item 3';

            (_.compact as jest.Mock).mockReturnValue(['Item 1', 'Item 3'])

            const result = component.getLocalPrint(input)

            expect(result).toBe('<ul><li>Item 1</li><li>Item 3</li></ul>')
        })

        it('should handle empty input', () => {
            const input = '';

            (_.compact as jest.Mock).mockReturnValue([])

            const result = component.getLocalPrint(input)

            expect(result).toBe('<ul></ul>')
        })
    })

    describe('log method', () => {
        it('should exist and be callable', () => {
            expect(typeof component.log).toBe('function')
            expect(() => component.log('test')).not.toThrow()
        })
    })

    describe('Form Integration Tests', () => {
        it('should properly initialize form structure', () => {
            expect(component.compDetailForm.get('competencyList')).toBeInstanceOf(UntypedFormArray)
            expect((component.compDetailForm.get('competencyList') as UntypedFormArray).length).toBe(0)
        })

        it('should handle form value changes subscription', () => {
            const mockValue = { competencyList: [{ compName: 'Test' }] }

            component.ngOnInit();

            // Mock lodash.get to return the competencyList
            (_.get as jest.Mock).mockReturnValue(mockValue.competencyList)

            // Trigger form change
            component.compDetailForm.patchValue(mockValue)

            expect(mockWatStore.updateCompGroup).toHaveBeenCalledWith(
                mockValue.competencyList,
                false,
                true
            )
        })
    })

    describe('Error Handling', () => {
        it('should handle undefined dataStructure gracefully', () => {
            component.dataStructure = undefined as any

            expect(() => component.updateForm()).not.toThrow()
        })

        it('should handle missing levelList in dataStructure items', () => {
            component.dataStructure = [
                {
                    localId: '1',
                    compId: 'comp1',
                    compName: 'Test Competency',
                    compDescription: 'Test Description',
                    compLevel: 'Basic',
                    compType: 'Technical',
                    compArea: 'Software',
                    compSource: 'Internal'
                    // levelList is missing
                } as any
            ];

            (_.get as jest.Mock).mockReturnValue(undefined);
            (_.map as jest.Mock).mockReturnValue([])

            expect(() => component.updateForm()).not.toThrow()
        })
    })
})