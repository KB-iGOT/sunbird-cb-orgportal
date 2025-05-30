import { UIDirectoryTableComponent } from './directory-table.component'
import { SelectionModel } from '@angular/cdk/collections'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'
import { Router } from '@angular/router'
import * as _ from 'lodash'

// Mock dependencies
jest.mock('@angular/cdk/collections')
jest.mock('@angular/material/legacy-table')
jest.mock('@angular/router')
jest.mock('lodash')

describe('UIDirectoryTableComponent', () => {
    let component: UIDirectoryTableComponent
    let mockRouter: jest.Mocked<Router>
    let mockDataSource: jest.Mocked<MatTableDataSource<any>>
    let mockSelection: jest.Mocked<SelectionModel<any>>
    let mockPaginator: any

    beforeEach(() => {
        // Mock Router
        mockRouter = {
            navigate: jest.fn()
        } as any

        // Mock MatTableDataSource
        mockDataSource = {
            data: [],
            paginator: null,
            sort: null,
            filter: ''
        } as any

        // Mock SelectionModel
        mockSelection = {
            selected: [],
            clear: jest.fn(),
            select: jest.fn(),
            isSelected: jest.fn()
        } as any

        // Mock Paginator
        mockPaginator = {
            firstPage: jest.fn()
        };

        // Mock constructors
        (MatTableDataSource as jest.Mock).mockImplementation(() => mockDataSource);
        (SelectionModel as jest.Mock).mockImplementation(() => mockSelection)

        // Create component instance
        component = new UIDirectoryTableComponent(mockRouter)
        component.paginator = mockPaginator
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should create component with default values', () => {
            expect(component).toBeDefined()
            expect(component.needCreate).toBe(true)
            expect(component.pageSize).toBe(5)
            expect(component.pageSizeOptions).toEqual([5, 10, 20])
            expect(component.bodyHeight).toBe(document.body.clientHeight - 125)
        })

        it('should initialize dataSource, actionsClick, and clicked EventEmitters', () => {
            expect(component.dataSource).toBeDefined()
            expect(component.actionsClick).toBeDefined()
            expect(component.clicked).toBeDefined()
        })
    })

    describe('ngOnInit', () => {
        it('should set dataSource properties when tableData exists', () => {
            const mockData = [{ id: 1, name: 'Test' }]
            const mockSort = { sort: 'test' }

            component.tableData = { columns: [] }
            component.data = mockData as any
            component.sort = mockSort as any

            component.ngOnInit()

            expect(component.dataSource.data).toBe(mockData)
            expect(component.dataSource.paginator).toBe(component.paginator)
            expect(component.dataSource.sort).toBe(mockSort)
        })

        it('should handle when tableData is undefined', () => {
            component.tableData = undefined
            component.data = []

            expect(() => component.ngOnInit()).not.toThrow()
        })
    })

    describe('ngOnChanges', () => {
        it('should update tableData and dataSource when changes occur', () => {
            const mockTableData = { columns: [], actions: [] }
            const mockNewData = [{ id: 1 }, { id: 2 }]

            const changes = {
                tableData: { currentValue: mockTableData },
                data: { currentValue: mockNewData }
            } as any;

            // Mock lodash get function
            (_.get as jest.Mock)
                .mockReturnValueOnce(mockTableData) // First call for tableData
                .mockReturnValueOnce(mockNewData)  // Second call for data

            component.ngOnChanges(changes)

            expect(component.tableData).toBe(mockTableData)
            expect(component.dataSource.data).toBe(mockNewData)
            expect(component.length).toBe(2)
            expect(mockPaginator.firstPage).toHaveBeenCalled()
        })

        it('should set tableData to null initially', () => {
            const changes = {} as any;
            (_.get as jest.Mock).mockReturnValue(undefined)

            component.ngOnChanges(changes)

            expect(component.tableData).toBeUndefined()
        })
    })

    describe('applyFilter', () => {
        it('should apply filter when filterValue is provided', () => {
            const filterValue = '  Test Filter  '

            component.applyFilter(filterValue)

            expect(component.dataSource.filter).toBe('test filter')
        })

        it('should clear filter when filterValue is empty', () => {
            component.applyFilter('')

            expect(component.dataSource.filter).toBe('')
        })

        it('should clear filter when filterValue is null', () => {
            component.applyFilter(null)

            expect(component.dataSource.filter).toBe('')
        })
    })

    describe('buttonClick', () => {
        it('should emit actionsClick when action is not disabled', () => {
            const mockAction = 'edit'
            const mockRow = { id: 1, name: 'Test' }
            const mockTableData = {
                actions: [{ name: 'edit', disabled: false }]
            }

            component.tableData = mockTableData
            component.actionsClick = { emit: jest.fn() } as any;

            (_.find as jest.Mock).mockReturnValue({ name: 'edit', disabled: false });
            (_.get as jest.Mock).mockReturnValue(false)

            component.buttonClick(mockAction, mockRow)
            if (component.actionsClick) {
                expect(component.actionsClick.emit).toHaveBeenCalledWith({
                    action: mockAction,
                    row: mockRow
                })
            }

        })

        it('should not emit actionsClick when action is disabled', () => {
            const mockAction = 'delete'
            const mockRow = { id: 1, name: 'Test' }
            const mockTableData = {
                actions: [{ name: 'delete', disabled: true }]
            }

            component.tableData = mockTableData
            component.actionsClick = { emit: jest.fn() } as any;

            (_.find as jest.Mock).mockReturnValue({ name: 'delete', disabled: true });
            (_.get as jest.Mock).mockReturnValue(true)

            component.buttonClick(mockAction, mockRow)
            if (component.actionsClick) {
                expect(component.actionsClick.emit).not.toHaveBeenCalled()
            }

        })

        it('should not emit when tableData is undefined', () => {
            component.tableData = undefined
            component.actionsClick = { emit: jest.fn() } as any

            component.buttonClick('edit', {})
            if (component.actionsClick) {
                expect(component.actionsClick.emit).not.toHaveBeenCalled()
            }

        })
    })

    describe('getFinalColumns', () => {
        it('should return columns with checkbox and hash when needed', () => {
            const mockTableData = {
                columns: [{ key: 'name' }, { key: 'email' }],
                needCheckBox: true,
                needHash: true,
                actions: [{ name: 'edit' }]
            }

            component.tableData = mockTableData;

            (_.map as jest.Mock).mockReturnValue(['name', 'email'])

            const result = component.getFinalColumns()

            expect(result).toEqual(['SR', 'select', 'name', 'email', 'Actions'])
        })

        it('should return columns without checkbox and hash', () => {
            const mockTableData = {
                columns: [{ key: 'name' }, { key: 'email' }],
                needCheckBox: false,
                needHash: false,
                actions: []
            }

            component.tableData = mockTableData;

            (_.map as jest.Mock).mockReturnValue(['name', 'email'])

            const result = component.getFinalColumns()

            expect(result).toEqual(['name', 'email'])
        })

        it('should return empty string when tableData is undefined', () => {
            component.tableData = undefined

            const result = component.getFinalColumns()

            expect(result).toBe('')
        })
    })

    describe('isAllSelected', () => {
        it('should return true when all rows are selected', () => {
            // mockSelection.selected = [1, 2, 3]
            mockDataSource.data = [1, 2, 3]

            const result = component.isAllSelected()

            expect(result).toBe(true)
        })

        it('should return false when not all rows are selected', () => {
            //mockSelection.selected = [1, 2]
            mockDataSource.data = [1, 2, 3]

            const result = component.isAllSelected()

            expect(result).toBe(false)
        })
    })

    describe('filterList', () => {
        it('should return array of values for specified key', () => {
            const list = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 25 }
            ]

            const result = component.filterList(list, 'name')

            expect(result).toEqual(['John', 'Jane'])
        })
    })

    describe('masterToggle', () => {
        it('should clear selection when all are selected', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(true)

            component.masterToggle()

            expect(mockSelection.clear).toHaveBeenCalled()
        })

        it('should select all rows when not all are selected', () => {
            const mockData = [{ id: 1 }, { id: 2 }]
            mockDataSource.data = mockData
            jest.spyOn(component, 'isAllSelected').mockReturnValue(false)

            component.masterToggle()

            expect(mockSelection.select).toHaveBeenCalledTimes(2)
            expect(mockSelection.select).toHaveBeenCalledWith({ id: 1 })
            expect(mockSelection.select).toHaveBeenCalledWith({ id: 2 })
        })
    })

    describe('checkboxLabel', () => {
        it('should return master toggle label when no row provided', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(true)

            const result = component.checkboxLabel()

            expect(result).toBe('select all')
        })

        it('should return deselect label when not all selected', () => {
            jest.spyOn(component, 'isAllSelected').mockReturnValue(false)

            const result = component.checkboxLabel()

            expect(result).toBe('deselect all')
        })

        it('should return row-specific label for selected row', () => {
            const mockRow = { position: 0 }
            mockSelection.isSelected.mockReturnValue(true)

            const result = component.checkboxLabel(mockRow)

            expect(result).toBe('deselect row 1')
        })

        it('should return row-specific label for unselected row', () => {
            const mockRow = { position: 1 }
            mockSelection.isSelected.mockReturnValue(false)

            const result = component.checkboxLabel(mockRow)

            expect(result).toBe('select row 2')
        })
    })

    describe('onRowClick', () => {
        it('should emit eOnRowClick event', () => {
            const mockEvent = { row: { id: 1 } }
            component.eOnRowClick = { emit: jest.fn() } as any

            component.onRowClick(mockEvent)

            expect(component.eOnRowClick.emit).toHaveBeenCalledWith(mockEvent)
        })
    })

    describe('gotoCreateNew', () => {
        it('should navigate to create department route', () => {
            component.selectedDepartment = 'IT'

            component.gotoCreateNew()

            expect(mockRouter.navigate).toHaveBeenCalledWith([
                '/app/home/IT/create-department',
                { needAddAdmin: true }
            ])
        })
    })

    describe('Edge Cases', () => {
        it('should handle undefined data gracefully', () => {
            component.data = undefined

            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should handle empty actions array', () => {
            component.tableData = { actions: [] }

            const result = component.getFinalColumns()

            expect(result).not.toContain('Actions')
        })

        it('should handle null tableData in buttonClick', () => {
            component.tableData = null

            expect(() => component.buttonClick('test', {})).not.toThrow()
        })
    })
})