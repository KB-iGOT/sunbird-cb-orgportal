import { WorkAllocationPopUpComponent } from './pop-up.component'
import { MatTableDataSource } from '@angular/material/table'
import { SelectionModel } from '@angular/cdk/collections'
import { of, throwError } from 'rxjs'

// Mock dependencies
const mockRouter = {
    navigate: jest.fn()
}

const mockRenderer2 = {
    removeClass: jest.fn()
}

const mockDialogRef = {
    close: jest.fn()
}

const mockWorkallocationService = {
    getAllUsers: jest.fn(),
    addWAT: jest.fn(),
    copyWAT: jest.fn(),
    fetchWAT: jest.fn(),
    getTime: jest.fn()
}

const mockPaginator = {
    // Mock paginator properties/methods as needed
}

const mockSort = {
    // Mock sort properties/methods as needed
}

describe('WorkAllocationPopUpComponent', () => {
    let component: WorkAllocationPopUpComponent
    let workallocationService: jest.Mocked<typeof mockWorkallocationService>
    let router: jest.Mocked<typeof mockRouter>
    let renderer: jest.Mocked<typeof mockRenderer2>
    let dialogRef: jest.Mocked<typeof mockDialogRef>

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create fresh mock instances
        workallocationService = { ...mockWorkallocationService }
        router = { ...mockRouter }
        renderer = { ...mockRenderer2 }
        dialogRef = { ...mockDialogRef }

        // Mock document.body.clientHeight
        Object.defineProperty(document.body, 'clientHeight', {
            writable: true,
            configurable: true,
            value: 1000
        })

        // Create component instance
        component = new WorkAllocationPopUpComponent(
            router as any,
            renderer as any,
            dialogRef as any,
            workallocationService as any,
            {} // dialogData
        )

        // Mock ViewChild properties
        component.paginator = mockPaginator as any
        component.sort = mockSort as any
    })

    describe('Constructor', () => {
        it('should initialize component with default values', () => {
            expect(component.bodyHeight).toBe(875) // 1000 - 125
            expect(component.pageSize).toBe(5)
            expect(component.pageSizeOptions).toEqual([5, 10, 20])
            expect(component.workOrder).toBe('Work Order')
            expect(component.isBlank).toBe(true)
            expect(component.chkBox).toBe(false)
            expect(component.isSearched).toBe(false)
            expect(component.viewPaginator).toBe(false)
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
            expect(component.selection).toBeInstanceOf(SelectionModel)
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            workallocationService.getAllUsers.mockReturnValue(of({
                result: {
                    response: {
                        channel: 'Test Department',
                        rootOrgId: 123
                    }
                }
            }))

            workallocationService.fetchWAT.mockReturnValue(of({
                result: {
                    data: [
                        {
                            id: '1',
                            name: 'Test Work Order',
                            userIds: ['user1', 'user2'],
                            updatedAt: '2023-01-01',
                            updatedByName: 'Test User',
                            errorCount: 0,
                            createdAt: '2023-01-01',
                            createdByName: 'Creator'
                        }
                    ]
                }
            }))

            workallocationService.getTime.mockReturnValue('2023-01-01 10:00:00')
        })

        it('should initialize table data and call required methods', () => {
            component.ngOnInit()

            expect(component.viewPaginator).toBe(true)
            expect(component.tableData).toBeDefined()
            expect(component.tableData?.columns).toHaveLength(4)
            expect(component.tableData?.columns[0]).toEqual({
                displayName: 'Work orders',
                key: 'workorders'
            })
            expect(workallocationService.getAllUsers).toHaveBeenCalled()
            expect(workallocationService.fetchWAT).toHaveBeenCalledWith('Published')
        })

        it('should set displayedColumns when tableData exists', () => {
            component.tableData = {
                columns: [{ displayName: 'Test', key: 'test' }],
                actions: [],
                needCheckBox: false,
                needHash: false,
                sortColumn: '',
                sortState: 'asc',
                needUserMenus: false
            }

            component.ngOnInit()

            expect(component.displayedColumns).toEqual([{ displayName: 'Test', key: 'test' }])
        })
    })

    describe('ngOnChanges', () => {
        it('should update dataSource data and length', () => {
            const mockData = [{ id: 1, name: 'test' }]
            const changes = {
                data: {
                    currentValue: mockData,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            }

            component.ngOnChanges(changes)

            expect(component.dataSource.data).toEqual(mockData)
            expect(component.length).toBe(1)
        })

        it('should handle undefined data', () => {
            const changes = {
                data: {
                    currentValue: undefined,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            }

            component.ngOnChanges(changes)

            expect(component.dataSource.data).toBeUndefined()
        })
    })

    describe('getdeptUsers', () => {
        it('should set department name and ID from service response', () => {
            const mockResponse = {
                result: {
                    response: {
                        channel: 'Engineering',
                        rootOrgId: 456
                    }
                }
            }

            workallocationService.getAllUsers.mockReturnValue(of(mockResponse))

            component.getdeptUsers()

            expect(workallocationService.getAllUsers).toHaveBeenCalled()
            expect(component.departmentName).toBe('Engineering')
            expect(component.departmentID).toBe(456)
        })

        it('should handle service error', () => {
            workallocationService.getAllUsers.mockReturnValue(throwError('Service error'))

            expect(() => component.getdeptUsers()).not.toThrow()
        })
    })

    describe('goToNewWat', () => {
        beforeEach(() => {
            component.currentCheckedValue = null
            component.departmentID = 123
        })

        it('should create new WAT and navigate to drafts', () => {
            const mockResponse = {
                result: {
                    data: {
                        id: 'new-wat-id'
                    }
                }
            }

            workallocationService.addWAT.mockReturnValue(of(mockResponse))

            component.goToNewWat()

            expect(workallocationService.addWAT).toHaveBeenCalledWith('test-value', 123)
            expect(dialogRef.close).toHaveBeenCalled()
            expect(router.navigate).toHaveBeenCalledWith(['app/workallocation/drafts/new-wat-id'])
        })

        it('should not navigate if no ID returned', () => {
            const mockResponse = {
                result: {
                    data: {}
                }
            }

            workallocationService.addWAT.mockReturnValue(of(mockResponse))

            component.goToNewWat()

            expect(dialogRef.close).not.toHaveBeenCalled()
            expect(router.navigate).not.toHaveBeenCalled()
        })
    })

    describe('goToCopyWat', () => {
        beforeEach(() => {
            component.currentCheckedValue = null
            component.currentCheckedValue2 = null
        })

        it('should copy WAT and navigate to drafts', () => {
            const mockResponse = {
                result: {
                    data: {
                        id: 'copied-wat-id'
                    }
                }
            }

            workallocationService.copyWAT.mockReturnValue(of(mockResponse))

            component.goToCopyWat()

            expect(workallocationService.copyWAT).toHaveBeenCalledWith('target-value', 'source-value')
            expect(dialogRef.close).toHaveBeenCalled()
            expect(router.navigate).toHaveBeenCalledWith(['app/workallocation/drafts/copied-wat-id'])
        })
    })

    describe('applyFilter', () => {
        it('should apply filter with trimmed lowercase value', () => {
            component.applyFilter('  TEST VALUE  ')

            expect(component.isSearched).toBe(true)
            expect(component.dataSource.filter).toBe('  test value  ')
        })

        it('should clear filter when empty value provided', () => {
            component.applyFilter('')

            expect(component.isSearched).toBe(true)
            expect(component.dataSource.filter).toBe('')
        })

        it('should clear filter when null value provided', () => {
            component.applyFilter(null)

            expect(component.isSearched).toBe(true)
            expect(component.dataSource.filter).toBe('')
        })
    })

    describe('buttonClick', () => {
        beforeEach(() => {
            component.tableData = {
                columns: [],
                actions: [
                ],
                needCheckBox: false,
                needHash: false,
                sortColumn: '',
                sortState: 'asc',
                needUserMenus: false
            }
            component.actionsClick = { emit: jest.fn() } as any
        })

        it('should emit action when not disabled', () => {
            const row = { id: 1 }
            component.buttonClick('edit', row)

            expect(component.actionsClick?.emit).toHaveBeenCalledWith({
                action: 'edit',
                row
            })
        })

        it('should not emit action when disabled', () => {
            const row = { id: 1 }
            component.buttonClick('delete', row)

            expect(component.actionsClick?.emit).not.toHaveBeenCalled()
        })

        it('should not emit when tableData is undefined', () => {
            component.tableData = undefined
            component.buttonClick('edit', {})

            expect(component.actionsClick?.emit).not.toHaveBeenCalled()
        })
    })

    describe('checkState', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should uncheck element if already checked', () => {
            const mockElement = {
                value: { id: 'test-id' },
                checked: true,
                _elementRef: { nativeElement: {} }
            }

            component.currentCheckedValue2 = null
            component.checkState(mockElement)

            jest.runAllTimers()

            expect(mockElement.checked).toBe(false)
            expect(component.currentCheckedValue2).toBeNull()
            expect(component.isBlank).toBe(true)
            expect(renderer.removeClass).toHaveBeenCalledTimes(2)
        })

        it('should check element if not checked', () => {
            const mockElement = {
                value: { id: 'new-id' },
                checked: false,
                _elementRef: { nativeElement: {} }
            }

            component.currentCheckedValue2 = null
            component.checkState(mockElement)

            jest.runAllTimers()

            expect(component.currentCheckedValue2).toBe('new-id')
            expect(component.isBlank).toBe(false)
        })
    })

    describe('getAllUserByKey', () => {
        it('should fetch and transform WAT data', () => {
            const mockResponse = {
                result: {
                    data: [
                        {
                            id: '1',
                            name: 'Test WAT',
                            userIds: ['user1', 'user2'],
                            updatedAt: '2023-01-01',
                            updatedByName: 'Updater',
                            errorCount: 2,
                            createdAt: '2023-01-01',
                            createdByName: 'Creator'
                        }
                    ]
                }
            }

            workallocationService.fetchWAT.mockReturnValue(of(mockResponse))
            workallocationService.getTime.mockReturnValue('formatted-time')

            component.getAllUserByKey()

            expect(workallocationService.fetchWAT).toHaveBeenCalledWith('Published')
            expect(component.dataSource.data).toHaveLength(1)
            expect(component.dataSource.data[0]).toEqual({
                id: '1',
                workorders: 'Test WAT',
                officers: 2,
                lastupdatedon: 'formatted-time',
                lastupdatedby: 'Updater',
                errors: 2,
                publishedon: 'formatted-time',
                publishedby: 'Creator',
                approval: 'Download',
                fromdata: 'Published'
            })
        })

        it('should handle empty response', () => {
            const mockResponse = {
                result: {
                    data: null
                }
            }

            workallocationService.fetchWAT.mockReturnValue(of(mockResponse))

            component.getAllUserByKey()

            expect(component.dataSource.data).toEqual([])
        })
    })

    describe('getFinalColumns', () => {
        it('should return columns with actions when actions exist', () => {
            component.tableData = {
                columns: [
                    { displayName: 'Name', key: 'name' },
                    { displayName: 'Email', key: 'email' }
                ],
                actions: [],
                needCheckBox: false,
                needHash: false,
                sortColumn: '',
                sortState: 'asc',
                needUserMenus: false
            }

            const result = component.getFinalColumns()
            expect(result).toEqual(['name', 'email', 'Actions'])
        })

        it('should return columns with checkbox when needCheckBox is true', () => {
            component.tableData = {
                columns: [{ displayName: 'Name', key: 'name' }],
                actions: [],
                needCheckBox: true,
                needHash: false,
                sortColumn: '',
                sortState: 'asc',
                needUserMenus: false
            }

            const result = component.getFinalColumns()
            expect(result).toEqual(['select', 'name'])
        })

        it('should return columns with hash when needHash is true', () => {
            component.tableData = {
                columns: [{ displayName: 'Name', key: 'name' }],
                actions: [],
                needCheckBox: false,
                needHash: true,
                sortColumn: '',
                sortState: 'asc',
                needUserMenus: false
            }

            const result = component.getFinalColumns()
            expect(result).toEqual(['SR', 'name'])
        })

        it('should return empty string when tableData is undefined', () => {
            component.tableData = undefined
            const result = component.getFinalColumns()
            expect(result).toBe('')
        })
    })

    describe('Selection methods', () => {
        beforeEach(() => {
            component.dataSource.data = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ]
            component.selection.clear()
        })

        describe('isAllSelected', () => {
            it('should return true when all items are selected', () => {
                component.selection.select(component.dataSource.data[0])
                component.selection.select(component.dataSource.data[1])

                expect(component.isAllSelected()).toBe(true)
            })

            it('should return false when not all items are selected', () => {
                component.selection.select(component.dataSource.data[0])

                expect(component.isAllSelected()).toBe(false)
            })
        })

        describe('masterToggle', () => {
            it('should select all when none selected', () => {
                component.masterToggle()

                expect(component.selection.selected.length).toBe(2)
            })

            it('should clear selection when all selected', () => {
                component.selection.select(component.dataSource.data[0])
                component.selection.select(component.dataSource.data[1])

                component.masterToggle()

                expect(component.selection.selected.length).toBe(0)
            })
        })

        describe('checkboxLabel', () => {
            it('should return master toggle label when no row provided', () => {
                const label = component.checkboxLabel()
                expect(label).toBe('deselect all')
            })

            it('should return select label for unselected row', () => {
                const row = { position: 0 }
                const label = component.checkboxLabel(row)
                expect(label).toBe('select row 1')
            })

            it('should return deselect label for selected row', () => {
                const row = { position: 0 }
                component.selection.select(row)
                const label = component.checkboxLabel(row)
                expect(label).toBe('deselect row 1')
            })
        })
    })

    describe('Utility methods', () => {
        describe('filterList', () => {
            it('should extract values by key from list', () => {
                const list = [
                    { name: 'John', age: 30 },
                    { name: 'Jane', age: 25 }
                ]

                const result = component.filterList(list, 'name')
                expect(result).toEqual(['John', 'Jane'])
            })
        })

        describe('clearSelection', () => {
            it('should clear selection and reset state', () => {
                component.tableElement = {
                    checked: true,
                    _elementRef: { nativeElement: {} }
                }
                component.currentCheckedValue2 = null
                component.isBlank = false

                component.clearSelection()

                expect(component.tableElement.checked).toBe(false)
                expect(component.currentCheckedValue2).toBeNull()
                expect(component.isBlank).toBe(true)
                expect(renderer.removeClass).toHaveBeenCalledTimes(2)
            })
        })

        describe('onRowClick', () => {
            it('should emit row click event', () => {
                component.eOnRowClick = { emit: jest.fn() } as any
                const eventData = { id: 1 }

                component.onRowClick(eventData)

                expect(component.eOnRowClick.emit).toHaveBeenCalledWith(eventData)
            })
        })
    })
})