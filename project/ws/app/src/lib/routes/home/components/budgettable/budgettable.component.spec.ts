import { BudgettableComponent } from './budgettable.component'
import { SelectionModel } from '@angular/cdk/collections'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'
import { SimpleChanges } from '@angular/core'
import * as _ from 'lodash'

// Mock dependencies
jest.mock('@angular/cdk/collections')
jest.mock('@angular/material/legacy-table')
jest.mock('lodash')

describe('BudgettableComponent', () => {
    let component: BudgettableComponent
    let mockDataSource: jest.Mocked<MatTableDataSource<any>>
    let mockSelection: jest.Mocked<SelectionModel<any>>
    let mockPaginator: any

    beforeEach(() => {
        // Create mocks
        mockDataSource = {
            data: [],
            paginator: null,
            sort: null
        } as any

        mockSelection = {
            selected: [],
            clear: jest.fn(),
            select: jest.fn(),
            isSelected: jest.fn()
        } as any

        mockPaginator = {
            firstPage: jest.fn()
        };

        // Mock constructors
        (MatTableDataSource as jest.Mock).mockImplementation(() => mockDataSource);
        (SelectionModel as jest.Mock).mockImplementation(() => mockSelection)

        // Create component instance
        component = new BudgettableComponent()
        component.paginator = mockPaginator
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should initialize dataSource and paginator', () => {
            expect(MatTableDataSource).toHaveBeenCalled()
            expect(SelectionModel).toHaveBeenCalledWith(true, [])
            expect(component.dataSource).toBe(mockDataSource)
            expect(component.selection).toBe(mockSelection)
            expect(component.pageSize).toBe(20)
            expect(component.pageSizeOptions).toEqual([20, 40, 60])
        })

        it('should set paginator on dataSource', () => {
            expect(component.dataSource.paginator).toBe(mockPaginator)
        })
    })

    describe('ngOnInit', () => {
        it('should set displayedColumns when tableData exists', () => {
            const mockColumns = [
                { key: 'col1', name: 'Column 1' },
                { key: 'col2', name: 'Column 2' }
            ]
            component.tableData = { columns: mockColumns }

            component.ngOnInit()

            expect(component.displayedColumns).toBe(mockColumns)
        })

        it('should set dataSource data and paginator when data exists', () => {
            const mockData = [
                { srnumber: 1, filename: 'file1.txt', filesize: '1KB', uploadedon: '2023-01-01' },
                { srnumber: 2, filename: 'file2.txt', filesize: '2KB', uploadedon: '2023-01-02' }
            ]
            component.data = mockData

            component.ngOnInit()

            expect(component.dataSource.data).toBe(mockData)
            expect(component.dataSource.paginator).toBe(mockPaginator)
        })

        it('should handle undefined tableData', () => {
            component.tableData = undefined
            // component.data = { }

            expect(() => component.ngOnInit()).not.toThrow()
            expect(component.displayedColumns).toBeUndefined()
        })
    })

    describe('ngOnChanges', () => {
        it('should update dataSource data with current value', () => {
            const mockData = [{ id: 1, name: 'test' }]
            const changes: SimpleChanges = {
                data: {
                    currentValue: mockData,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            };

            (_.get as jest.Mock).mockReturnValue(mockData)
            mockDataSource.data = mockData

            component.ngOnChanges(changes)

            expect(_.get).toHaveBeenCalledWith(changes, 'data.currentValue')
            expect(component.dataSource.data).toBe(mockData)
            expect(component.length).toBe(mockData.length)
            expect(mockPaginator.firstPage).toHaveBeenCalled()
        })

        it('should set empty array when no current value', () => {
            const changes: SimpleChanges = {
                data: {
                    currentValue: null,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            };

            (_.get as jest.Mock).mockReturnValue([])
            mockDataSource.data = []

            component.ngOnChanges(changes)

            expect(component.dataSource.data).toEqual([])
            expect(component.length).toBe(0)
            expect(mockPaginator.firstPage).toHaveBeenCalled()
        })
    })

    describe('getFinalColumns', () => {
        beforeEach(() => {
            (_.map as jest.Mock).mockImplementation((arr, fn) => arr.map(fn))
        })

        it('should return columns with checkbox when needCheckBox is true', () => {
            const mockColumns = [
                { key: 'col1' },
                { key: 'col2' }
            ]
            component.tableData = {
                columns: mockColumns,
                needCheckBox: true,
                needHash: false,
                needUserMenus: false
            }

            const result = component.getFinalColumns()

            expect(_.map).toHaveBeenCalledWith(mockColumns, expect.any(Function))
            expect(result).toEqual(['select', 'col1', 'col2'])
        })

        it('should return columns with hash when needHash is true', () => {
            const mockColumns = [
                { key: 'col1' },
                { key: 'col2' }
            ]
            component.tableData = {
                columns: mockColumns,
                needCheckBox: false,
                needHash: true,
                needUserMenus: false
            }

            const result = component.getFinalColumns()

            expect(result).toEqual(['SR', 'col1', 'col2'])
        })

        it('should return columns with menu when needUserMenus is true', () => {
            const mockColumns = [
                { key: 'col1' },
                { key: 'col2' }
            ]
            component.tableData = {
                columns: mockColumns,
                needCheckBox: false,
                needHash: false,
                needUserMenus: true
            }

            const result = component.getFinalColumns()

            expect(result).toEqual(['col1', 'col2', 'Menu'])
        })

        it('should return columns with all options enabled', () => {
            const mockColumns = [
                { key: 'col1' },
                { key: 'col2' }
            ]
            component.tableData = {
                columns: mockColumns,
                needCheckBox: true,
                needHash: true,
                needUserMenus: true
            }

            const result = component.getFinalColumns()

            expect(result).toEqual(['select', 'SR', 'col1', 'col2', 'Menu'])
        })

        it('should return empty string when tableData is undefined', () => {
            component.tableData = undefined

            const result = component.getFinalColumns()

            expect(result).toBe('')
        })
    })

    describe('isAllSelected', () => {
        it('should return true when all rows are selected', () => {
            //   mockSelection.selected = [{ id: 1 }, { id: 2 }]
            mockDataSource.data = [{ id: 1 }, { id: 2 }]

            const result = component.isAllSelected()

            expect(result).toBe(true)
        })

        it('should return false when not all rows are selected', () => {
            //mockSelection.selected = [{ id: 1 }]
            mockDataSource.data = [{ id: 1 }, { id: 2 }]

            const result = component.isAllSelected()

            expect(result).toBe(false)
        })

        it('should return true when no rows exist', () => {
            // mockSelection.selected = []
            mockDataSource.data = []

            const result = component.isAllSelected()

            expect(result).toBe(true)
        })
    })

    describe('filterList', () => {
        it('should return array of values for specified key', () => {
            const list = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 25 },
                { name: 'Bob', age: 35 }
            ]

            const result = component.filterList(list, 'name')

            expect(result).toEqual(['John', 'Jane', 'Bob'])
        })

        it('should handle empty list', () => {
            const result = component.filterList([], 'name')

            expect(result).toEqual([])
        })
    })

    describe('masterToggle', () => {
        it('should clear selection when all are selected', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(true)

            component.masterToggle()

            expect(mockSelection.clear).toHaveBeenCalled()
            expect(mockSelection.select).not.toHaveBeenCalled()
        })

        it('should select all rows when not all are selected', () => {
            const mockData = [{ id: 1 }, { id: 2 }]
            jest.spyOn(component, 'isAllSelected').mockReturnValue(false)
            mockDataSource.data = mockData

            component.masterToggle()

            expect(mockSelection.clear).not.toHaveBeenCalled()
            expect(mockSelection.select).toHaveBeenCalledTimes(2)
            expect(mockSelection.select).toHaveBeenCalledWith({ id: 1 })
            expect(mockSelection.select).toHaveBeenCalledWith({ id: 2 })
        })
    })

    describe('checkboxLabel', () => {
        it('should return select all label when no row provided and not all selected', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(false)

            const result = component.checkboxLabel()

            expect(result).toBe('deselect all')
        })

        it('should return deselect all label when no row provided and all selected', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(true)

            const result = component.checkboxLabel()

            expect(result).toBe('select all')
        })

        it('should return select row label when row is not selected', () => {
            const row = { position: 0 }
            mockSelection.isSelected.mockReturnValue(false)

            const result = component.checkboxLabel(row)

            expect(result).toBe('select row 1')
            expect(mockSelection.isSelected).toHaveBeenCalledWith(row)
        })

        it('should return deselect row label when row is selected', () => {
            const row = { position: 1 }
            mockSelection.isSelected.mockReturnValue(true)

            const result = component.checkboxLabel(row)

            expect(result).toBe('deselect row 2')
            expect(mockSelection.isSelected).toHaveBeenCalledWith(row)
        })
    })

    describe('uploadFilesClick', () => {
        it('should emit onUploadFilesClick event with provided data', () => {
            const eventData = { files: ['file1.txt'] }
            jest.spyOn(component.onUploadFilesClick, 'emit')

            component.uploadFilesClick(eventData)

            expect(component.onUploadFilesClick.emit).toHaveBeenCalledWith(eventData)
        })
    })

    describe('matSort setter', () => {
        it('should set sort on dataSource when dataSource.sort is falsy', () => {
            const mockSort = { active: 'name', direction: 'asc' } as any
            mockDataSource.sort = null

            component.matSort = mockSort

            expect(mockDataSource.sort).toBe(mockSort)
        })

        it('should not set sort on dataSource when dataSource.sort already exists', () => {
            const existingSort = { active: 'existing', direction: 'desc' } as any
            const newSort = { active: 'new', direction: 'asc' } as any
            mockDataSource.sort = existingSort

            component.matSort = newSort

            expect(mockDataSource.sort).toBe(existingSort)
        })
    })

    describe('Input Properties', () => {
        it('should accept type input', () => {
            const testType = 'budget'
            component.type = testType

            expect(component.type).toBe(testType)
        })

        it('should accept data input', () => {
            const testData = [
                { srnumber: 1, filename: 'test.txt', filesize: '1KB', uploadedon: '2023-01-01' }
            ]
            component.data = testData

            expect(component.data).toBe(testData)
        })

        it('should have default tableData as empty array', () => {
            expect(component.tableData).toEqual([])
        })
    })
})