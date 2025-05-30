import { UntypedFormBuilder, UntypedFormArray } from '@angular/forms'
import { WatCompPopupComponent, IWatCompPopupData, IChield } from './wat-comp-popup.component'

// Mock dependencies
const mockDialogRef = {
    close: jest.fn()
}

const mockFormBuilder = new UntypedFormBuilder()

describe('WatCompPopupComponent', () => {
    let component: WatCompPopupComponent
    let mockData: IWatCompPopupData
    let mockDefaultCompLevels: any

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()

        // Mock data setup
        mockData = {
            level: 'Level1',
            children: [
                {
                    isSelected: true,
                    description: 'Test Description 1',
                    id: '1',
                    name: 'Test Name 1',
                    level: 'Level1',
                    alias: ['alias1'],
                    source: 'TEST',
                    status: 'ACTIVE',
                    type: 'ACTIVITY'
                },
                {
                    isSelected: false,
                    description: 'Test Description 2',
                    id: '2',
                    name: 'Test Name 2',
                    level: 'Level2',
                    alias: ['alias2'],
                    source: 'TEST',
                    status: 'INACTIVE',
                    type: 'TASK'
                }
            ],
            description: 'Test Component Description',
            id: 'comp-1',
            name: 'Test Component',
            area: 'Test Area',
            source: 'TEST_SOURCE',
            status: 'ACTIVE',
            type: 'COMPONENT'
        }

        mockDefaultCompLevels = {
            data: {
                compTypes: ['TYPE1', 'TYPE2', 'TYPE3'],
                levels: [
                    {
                        description: 'Default Level 1',
                        id: 'def-1',
                        alias: ['def-alias1'],
                        level: 'DEF_LEVEL1',
                        name: 'Default Name 1',
                        source: 'DEFAULT',
                        status: 'ACTIVE',
                        type: 'DEFAULT_TYPE'
                    },
                    {
                        description: 'Default Level 2',
                        id: 'def-2',
                        alias: ['def-alias2'],
                        level: 'DEF_LEVEL2',
                        name: 'Default Name 2',
                        source: 'DEFAULT',
                        status: 'ACTIVE',
                        type: 'DEFAULT_TYPE'
                    }
                ]
            }
        }

        // Create component instance
        component = new WatCompPopupComponent(
            mockDialogRef as any,
            mockData,
            mockFormBuilder
        )
        component.defaultCompLevels = mockDefaultCompLevels
    })

    describe('Constructor', () => {
        it('should initialize component with provided data', () => {
            expect(component.data).toBe(mockData)
            expect(component.selectedLevel).toBe('Level1')
            expect(component.watForm).toBeDefined()
        })

        it('should initialize form with correct structure', () => {
            expect(component.watForm.get('compName')?.value).toBe(mockData.name)
            expect(component.watForm.get('compDescription')?.value).toBe(mockData.description)
            expect(component.watForm.get('compId')?.value).toBe(mockData.id)
            expect(component.watForm.get('compType')?.value).toBe(mockData.type)
            expect(component.watForm.get('compArea')?.value).toBe(mockData.area)
            expect(component.watForm.get('compSource')?.value).toBe(mockData.source)
        })

        it('should set selectedLevel to empty string when data.level is undefined', () => {
            const dataWithoutLevel = { ...mockData, level: undefined }
            const comp = new WatCompPopupComponent(
                mockDialogRef as any,
                dataWithoutLevel,
                mockFormBuilder
            )
            expect(comp.selectedLevel).toBe('')
        })
    })

    describe('ngOnInit', () => {
        it('should set compTypList when defaultCompLevels has compTypes', () => {
            component.ngOnInit()
            expect(component.compTypList).toEqual(['TYPE1', 'TYPE2', 'TYPE3'])
        })

        it('should set isNew to true when data.id is falsy', () => {
            component.data.id = ''
            component.ngOnInit()
            expect(component.isNew).toBe(true)
        })

        it('should set isNew to false when data.id exists', () => {
            component.data.id = 'existing-id'
            component.ngOnInit()
            expect(component.isNew).toBe(false)
        })

        it('should populate form array with children data when children exist', () => {
            component.ngOnInit()
            const formArray = component.getList
            expect(formArray.length).toBe(2)
            expect(formArray.at(0).get('name')?.value).toBe('Test Name 1')
            expect(formArray.at(1).get('name')?.value).toBe('Test Name 2')
        })

        it('should populate form array with default levels when no children exist', () => {
            component.data.children = []
            component.ngOnInit()
            const formArray = component.getList
            expect(formArray.length).toBe(2)
            expect(formArray.at(0).get('name')?.value).toBe('Default Name 1')
            expect(formArray.at(1).get('name')?.value).toBe('Default Name 2')
        })
    })

    describe('getList getter', () => {
        it('should return acDetail FormArray', () => {
            const result = component.getList
            expect(result).toBeInstanceOf(UntypedFormArray)
            expect(result).toBe(component.watForm.get('acDetail'))
        })
    })

    describe('setWatValues', () => {
        it('should patch form values', () => {
            const testValues = { compName: 'New Name', compDescription: 'New Description' }
            const patchSpy = jest.spyOn(component.watForm, 'patchValue')

            component.setWatValues(testValues)

            expect(patchSpy).toHaveBeenCalledWith(testValues)
        })
    })

    describe('createItem', () => {
        it('should create form group with correct structure', () => {
            const testItem: IChield = {
                isSelected: true,
                description: 'Test Item',
                id: 'test-id',
                name: 'Test Item Name',
                level: 'TEST_LEVEL',
                alias: ['test-alias'],
                source: 'TEST',
                status: 'ACTIVE',
                type: 'TEST_TYPE'
            }

            const result = component.createItem(testItem)

            expect(result.get('description')?.value).toBe(testItem.description)
            expect(result.get('id')?.value).toBe(testItem.id)
            expect(result.get('name')?.value).toBe(testItem.name)
            expect(result.get('level')?.value).toBe(testItem.level)
            expect(result.get('alias')?.value).toEqual(testItem.alias)
            expect(result.get('source')?.value).toBe(testItem.source)
            expect(result.get('status')?.value).toBe(testItem.status)
            expect(result.get('type')?.value).toBe(testItem.type)
        })
    })

    describe('radioChange', () => {
        it('should update selectedLevel when radio changes', () => {
            const mockEvent = { value: 'NewLevel' } as any

            component.radioChange(mockEvent)

            expect(component.selectedLevel).toBe('NewLevel')
        })
    })

    describe('onNoClick', () => {
        it('should close dialog with ok: false', () => {
            component.onNoClick()

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                ok: false,
                data: mockData
            })
        })
    })

    describe('getLocalPrint', () => {
        it('should convert newline-separated string to HTML list', () => {
            const input = 'Item 1\nItem 2\nItem 3'
            const expected = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'

            const result = component.getLocalPrint(input)

            expect(result).toBe(expected)
        })

        it('should handle empty lines', () => {
            const input = 'Item 1\n\nItem 3'
            const expected = '<ul><li>Item 1</li><li>Item 3</li></ul>'

            const result = component.getLocalPrint(input)

            expect(result).toBe(expected)
        })
    })

    describe('onChange', () => {
        it('should prevent default and set isChecked to true', () => {
            const mockEvent = { preventDefault: jest.fn() }

            component.onChange(mockEvent)

            expect(mockEvent.preventDefault).toHaveBeenCalled()
            expect(component.isChecked).toBe(true)
        })

        it('should handle null event', () => {
            expect(() => component.onChange(null)).not.toThrow()
        })
    })

    describe('onChangeAllAct', () => {
        beforeEach(() => {
            component.ngOnInit() // Initialize form array
        })

        it('should call checkAll when event is checked', () => {
            const checkAllSpy = jest.spyOn(component, 'checkAll')
            const mockEvent = { checked: true } as any

            component.onChangeAllAct(mockEvent)

            expect(checkAllSpy).toHaveBeenCalled()
        })

        it('should call deselectAll when event is unchecked', () => {
            const deselectAllSpy = jest.spyOn(component, 'deselectAll')
            const mockEvent = { checked: false } as any

            component.onChangeAllAct(mockEvent)

            expect(deselectAllSpy).toHaveBeenCalled()
        })
    })

    describe('checkAll', () => {
        beforeEach(() => {
            component.ngOnInit() // Initialize form array
        })

        it('should set all items as selected', () => {
            component.checkAll()

            const formArray = component.getList
            formArray.controls.forEach(control => {
                expect(control.get('isSelected')?.value).toBe(true)
            })
        })
    })

    describe('deselectAll', () => {
        beforeEach(() => {
            component.ngOnInit() // Initialize form array
        })

        it('should set all items as unselected', () => {
            component.deselectAll()

            const formArray = component.getList
            formArray.controls.forEach(control => {
                expect(control.get('isSelected')?.value).toBe(false)
            })
        })
    })

    describe('checkedAllActivities getter', () => {
        beforeEach(() => {
            component.ngOnInit() // Initialize form array
        })

        it('should return true when all activities are selected', () => {
            component.checkAll()
            expect(component.checkedAllActivities).toBe(true)
        })

        it('should return false when not all activities are selected', () => {
            component.deselectAll()
            expect(component.checkedAllActivities).toBe(false)
        })
    })

    describe('submitResult', () => {
        it('should close dialog with generated data when value is provided', () => {
            const testValue: any = {
                compId: 'test-id',
                compName: 'Test Name',
                compDescription: 'Test Description',
                compType: 'TEST_TYPE',
                compArea: 'TEST_AREA',
                compSource: 'TEST_SOURCE'
            }

            const generateDataSpy = jest.spyOn(component, 'generateData').mockReturnValue(testValue)

            component.submitResult(testValue)

            expect(generateDataSpy).toHaveBeenCalledWith(testValue)
            expect(mockDialogRef.close).toHaveBeenCalledWith({
                ok: true,
                data: testValue
            })
        })

        it('should not close dialog when value is falsy', () => {
            component.submitResult(null)

            expect(mockDialogRef.close).not.toHaveBeenCalled()
        })
    })

    describe('generateData', () => {
        it('should return correctly formatted data object', () => {
            const inputData = {
                compId: 'test-id',
                compName: 'Test Name',
                compDescription: 'Test Description',
                compType: 'TEST_TYPE',
                compArea: 'TEST_AREA',
                compSource: 'TEST_SOURCE'
            }

            component.selectedLevel = 'TEST_LEVEL'
            //  component.data.localId = 'local-123'

            const result = component.generateData(inputData)

            expect(result).toEqual({
                compId: 'test-id',
                compName: 'Test Name',
                compDescription: 'Test Description',
                compLevel: 'TEST_LEVEL',
                compType: 'TEST_TYPE',
                compArea: 'TEST_AREA',
                localId: 'local-123',
                levelList: mockData.children,
                compSource: 'TEST_SOURCE'
            })
        })

        it('should fallback to source when compSource is not available', () => {
            const inputData = {
                source: 'FALLBACK_SOURCE'
            }

            const result = component.generateData(inputData)

            expect(result.compSource).toBe('FALLBACK_SOURCE')
        })
    })

    describe('Edge Cases', () => {
        it('should handle missing defaultCompLevels gracefully', () => {
            component.defaultCompLevels = undefined

            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should handle empty defaultCompLevels.data', () => {
            component.defaultCompLevels = { data: null }

            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should handle missing children array', () => {
            component.data.children = undefined as any

            expect(() => component.ngOnInit()).not.toThrow()
        })
    })
})