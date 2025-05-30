import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox'
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
import { WatRolePopupComponent, IWatRolePopupData, IChield } from './wat-role-popup.component'

// Mock lodash
jest.mock('lodash', () => ({
    each: jest.fn((collection, iteratee) => {
        if (Array.isArray(collection)) {
            collection.forEach(iteratee)
        }
    }),
    filter: jest.fn((collection, predicate) => {
        return collection.filter(predicate)
    }),
    map: jest.fn((collection, iteratee) => {
        return collection.map(iteratee)
    }),
    get: jest.fn((object, path) => {
        return object && object[path]
    })
}))

describe('WatRolePopupComponent', () => {
    let component: WatRolePopupComponent
    let mockDialogRef: jest.Mocked<MatDialogRef<WatRolePopupComponent>>
    let mockFormBuilder: jest.Mocked<UntypedFormBuilder>
    let mockData: IWatRolePopupData

    const mockChildNodes: IChield[] = [
        {
            isSelected: true,
            description: 'Test Activity 1',
            id: 'ACT001',
            name: 'Activity 1',
            parentRole: 'ROLE001',
            source: 'ISTM',
            status: 'VERIFIED',
            type: 'ACTIVITY'
        },
        {
            isSelected: false,
            description: 'Test Activity 2',
            id: 'ACT002',
            name: 'Activity 2',
            parentRole: 'ROLE001',
            source: 'ISTM',
            status: 'UNVERIFIED',
            type: 'ACTIVITY'
        }
    ]

    beforeEach(() => {
        // Mock MatDialogRef
        mockDialogRef = {
            close: jest.fn()
        } as any

        // Mock FormBuilder
        mockFormBuilder = {
            group: jest.fn(),
            array: jest.fn()
        } as any

        // Mock data
        mockData = {
            childNodes: mockChildNodes,
            description: 'Test Role',
            id: 'ROLE001',
            name: 'Test Role Name',
            source: 'ISTM',
            status: 'ACTIVE',
            type: 'ROLE'
        }

        // Setup FormBuilder mocks
        const mockFormGroup = new UntypedFormGroup({
            acDetail: new UntypedFormArray([]),
            IsRoleSelected: new UntypedFormControl(true)
        })

        // const mockItemFormGroup = new UntypedFormGroup({
        //     isSelected: new UntypedFormControl(true),
        //     description: new UntypedFormControl('Test Activity 1'),
        //     id: new UntypedFormControl('ACT001'),
        //     name: new UntypedFormControl('Activity 1'),
        //     parentRole: new UntypedFormControl('ROLE001'),
        //     source: new UntypedFormControl('ISTM'),
        //     status: new UntypedFormControl('VERIFIED'),
        //     type: new UntypedFormControl('ACTIVITY')
        // })

        mockFormBuilder.group.mockReturnValue(mockFormGroup)
        mockFormBuilder.array.mockReturnValue(new UntypedFormArray([]))

        // Create component instance
        component = new WatRolePopupComponent(mockDialogRef, mockData, mockFormBuilder)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should create component with initial form setup', () => {
            expect(component).toBeTruthy()
            expect(component.data).toBe(mockData)
            expect(component.dialogRef).toBe(mockDialogRef)
            expect(component.watForm).toBeDefined()
            expect(component.isChecked).toBe(true)
            expect(component.isCheckedAllA).toBe(true)
        })

        it('should initialize form with correct structure', () => {
            expect(mockFormBuilder.group).toHaveBeenCalledWith({
                acDetail: expect.any(UntypedFormArray),
                IsRoleSelected: expect.any(UntypedFormControl)
            })
        })
    })

    describe('getList getter', () => {
        it('should return acDetail FormArray', () => {
            const result = component.getList
            expect(result).toBeInstanceOf(UntypedFormArray)
        })
    })

    describe('setWatValues', () => {
        it('should patch form with provided values', () => {
            const testValue = { test: 'value' }
            const patchValueSpy = jest.spyOn(component.watForm, 'patchValue')

            component.setWatValues(testValue)

            expect(patchValueSpy).toHaveBeenCalledWith(testValue)
        })
    })

    describe('ngOnInit', () => {
        // it('should populate form array with child nodes when data exists', () => {
        //     const pushSpy = jest.spyOn(component.getList, 'push')
        //     const createItemSpy = jest.spyOn(component, 'createItem')

        //     component.ngOnInit()

        //     expect(createItemSpy).toHaveBeenCalledTimes(mockData.childNodes.length)
        //     expect(pushSpy).toHaveBeenCalledTimes(mockData.childNodes.length)
        // })

        it('should handle case when childNodes is empty', () => {
            component.data.childNodes = []
            const pushSpy = jest.spyOn(component.getList, 'push')

            component.ngOnInit()

            expect(pushSpy).not.toHaveBeenCalled()
        })

        it('should handle case when childNodes is null/undefined', () => {
            component.data.childNodes = null as any
            const pushSpy = jest.spyOn(component.getList, 'push')

            expect(() => component.ngOnInit()).not.toThrow()
            expect(pushSpy).not.toHaveBeenCalled()
        })
    })

    describe('createItem', () => {
        it('should create form group with correct structure for item with description', () => {
            const mockItem: IChield = mockChildNodes[0]
            const mockFormGroup = new UntypedFormGroup({})
            mockFormBuilder.group.mockReturnValue(mockFormGroup)

            const result = component.createItem(mockItem)

            expect(mockFormBuilder.group).toHaveBeenCalledWith({
                isSelected: true, // should be true when description exists
                description: mockItem.description,
                id: mockItem.id,
                name: mockItem.name,
                parentRole: mockItem.parentRole,
                source: mockItem.source,
                status: mockItem.status,
                type: mockItem.type
            })
            expect(result).toBe(mockFormGroup)
        })

        it('should create form group with isSelected false when no description', () => {
            const mockItem: IChield = { ...mockChildNodes[0], description: '' }
            const mockFormGroup = new UntypedFormGroup({})
            mockFormBuilder.group.mockReturnValue(mockFormGroup)

            component.createItem(mockItem)

            expect(mockFormBuilder.group).toHaveBeenCalledWith({
                isSelected: false, // should be false when no description
                description: '',
                id: mockItem.id,
                name: mockItem.name,
                parentRole: mockItem.parentRole,
                source: mockItem.source,
                status: mockItem.status,
                type: mockItem.type
            })
        })
    })

    describe('onNoClick', () => {
        it('should close dialog with ok: false', () => {
            component.onNoClick()

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                ok: false
            })
        })
    })

    describe('onChange', () => {
        it('should prevent default and set isChecked to true when event exists', () => {
            const mockEvent = {
                preventDefault: jest.fn()
            }

            component.onChange(mockEvent)

            expect(mockEvent.preventDefault).toHaveBeenCalled()
            expect(component.isChecked).toBe(true)
        })

        it('should handle null/undefined event', () => {
            expect(() => component.onChange(null)).not.toThrow()
            expect(() => component.onChange(undefined)).not.toThrow()
        })
    })

    describe('onChangeAllAct', () => {
        it('should call checkAll when event.checked is true', () => {
            const mockEvent: MatCheckboxChange = {
                checked: true
            } as MatCheckboxChange
            const checkAllSpy = jest.spyOn(component, 'checkAll')

            component.onChangeAllAct(mockEvent)

            expect(checkAllSpy).toHaveBeenCalled()
        })

        it('should call deselectAll when event.checked is false', () => {
            const mockEvent: MatCheckboxChange = {
                checked: false
            } as MatCheckboxChange
            const deselectAllSpy = jest.spyOn(component, 'deselectAll')

            component.onChangeAllAct(mockEvent)

            expect(deselectAllSpy).toHaveBeenCalled()
        })

        it('should handle null/undefined event', () => {
            expect(() => component.onChangeAllAct(null as any)).not.toThrow()
            expect(() => component.onChangeAllAct(undefined as any)).not.toThrow()
        })
    })

    describe('checkAll', () => {
        it('should set isSelected to true for all form controls', () => {
            // Setup mock controls
            const mockControl1 = {
                value: { id: '1', isSelected: false },
                setValue: jest.fn()
            }
            const mockControl2 = {
                value: { id: '2', isSelected: false },
                setValue: jest.fn()
            }

            jest.spyOn(component, 'getList', 'get').mockReturnValue({
                controls: [mockControl1, mockControl2]
            } as any)

            component.checkAll()

            expect(mockControl1.setValue).toHaveBeenCalledWith({
                ...mockControl1.value,
                isSelected: true
            })
            expect(mockControl2.setValue).toHaveBeenCalledWith({
                ...mockControl2.value,
                isSelected: true
            })
        })
    })

    describe('deselectAll', () => {
        it('should set isSelected to false for all form controls', () => {
            // Setup mock controls
            const mockControl1 = {
                value: { id: '1', isSelected: true },
                setValue: jest.fn()
            }
            const mockControl2 = {
                value: { id: '2', isSelected: true },
                setValue: jest.fn()
            }

            jest.spyOn(component, 'getList', 'get').mockReturnValue({
                controls: [mockControl1, mockControl2]
            } as any)

            component.deselectAll()

            expect(mockControl1.setValue).toHaveBeenCalledWith({
                ...mockControl1.value,
                isSelected: false
            })
            expect(mockControl2.setValue).toHaveBeenCalledWith({
                ...mockControl2.value,
                isSelected: false
            })
        })
    })

    describe('checkedAllActivities getter', () => {
        it('should return true when all activities are selected', () => {
            const mockFormArrayValue = [
                { isSelected: true },
                { isSelected: true }
            ]

            jest.spyOn(component, 'getList', 'get').mockReturnValue({
                value: mockFormArrayValue
            } as any)

            // Mock lodash filter to return empty array (no unselected items)
            const _ = require('lodash')
            _.filter.mockReturnValue([])

            const result = component.checkedAllActivities

            expect(result).toBe(true)
        })

        it('should return false when some activities are not selected', () => {
            const mockFormArrayValue = [
                { isSelected: true },
                { isSelected: false }
            ]

            jest.spyOn(component, 'getList', 'get').mockReturnValue({
                value: mockFormArrayValue
            } as any)

            // Mock lodash filter to return array with unselected items
            const _ = require('lodash')
            _.filter.mockReturnValue([{ isSelected: false }])

            const result = component.checkedAllActivities

            expect(result).toBe(false)
        })
    })

    describe('submitResult', () => {
        it('should close dialog with ok: true and generated data when val is truthy', () => {
            const mockVal = { acDetail: mockChildNodes }
            const mockGeneratedData: any = [{ activityId: 'ACT001' }]
            const generateDataSpy = jest.spyOn(component, 'generateData').mockReturnValue(mockGeneratedData)

            component.submitResult(mockVal)

            expect(generateDataSpy).toHaveBeenCalledWith(mockVal)
            expect(mockDialogRef.close).toHaveBeenCalledWith({
                ok: true,
                data: mockGeneratedData
            })
        })

        it('should not close dialog when val is falsy', () => {
            component.submitResult(null)
            component.submitResult(undefined)
            component.submitResult(false)

            expect(mockDialogRef.close).not.toHaveBeenCalled()
        })
    })

    describe('generateData', () => {
        it('should generate correct data structure from selected activities', () => {
            const mockVal = {
                acDetail: [
                    { id: 'ACT001', name: 'Activity 1', description: 'Desc 1', isSelected: true },
                    { id: 'ACT002', name: 'Activity 2', description: 'Desc 2', isSelected: false }
                ]
            }

            const _ = require('lodash')
            // Mock lodash functions
            _.filter.mockReturnValue([mockVal.acDetail[0]]) // Only selected items
            _.map.mockReturnValue([{
                activityId: 'ACT001',
                activityName: 'Activity 1',
                activityDescription: 'Desc 1',
                assignedTo: ''
            }])
            _.get.mockImplementation((obj: any, path: any) => obj[path])

            const result = component.generateData(mockVal)

            expect(_.filter).toHaveBeenCalledWith(mockVal.acDetail, expect.any(Function))
            expect(_.map).toHaveBeenCalled()
            expect(result).toEqual([{
                activityId: 'ACT001',
                activityName: 'Activity 1',
                activityDescription: 'Desc 1',
                assignedTo: ''
            }])
        })
    })
})