import { StaffComponent } from './staff.component'
import { of, throwError } from 'rxjs'
import { SelectionModel } from '@angular/cdk/collections'
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table'
import { SimpleChange, SimpleChanges } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'

describe('StaffComponent', () => {
    let component: StaffComponent
    let snackBarMock: any
    let dialogMock: any
    let activeRouteMock: any
    let configSvcMock: any
    let mdoinfoSrvcMock: any

    // Mock data
    const mockStaffDetails = [
        {
            id: 'pos1',
            srnumber: 1,
            position: 'Deputy Director',
            totalPositionsFilled: 2,
            totalPositionsVacant: 2
        },
        {
            id: 'pos2',
            srnumber: 2,
            position: 'Assistant Director',
            totalPositionsFilled: 3,
            totalPositionsVacant: 1
        },
        {
            id: 'total',
            srnumber: 3,
            position: 'all',
            totalPositionsFilled: 5,
            totalPositionsVacant: 3
        }
    ]

    // Setup before each test
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create mocks for all dependencies
        snackBarMock = {
            open: jest.fn()
        }

        dialogMock = {
            open: jest.fn().mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of({
                    data: {
                        id: 'pos1',
                        position: 'Deputy Director',
                        totalPositionsFilled: 3,
                        totalPositionsVacant: 1
                    }
                }))
            })
        }

        activeRouteMock = {
            snapshot: {
                data: {
                    configService: {
                        userProfile: {
                            rootOrgId: 'org123'
                        }
                    }
                }
            }
        }

        configSvcMock = {
            userProfile: {
                rootOrgId: 'org123'
            }
        }

        mdoinfoSrvcMock = {
            getStaffdetails: jest.fn(),
            addStaffdetails: jest.fn(),
            updateStaffdetails: jest.fn(),
            deleteStaffdetails: jest.fn()
        }

        // Setup default response for getStaffdetails
        mdoinfoSrvcMock.getStaffdetails.mockReturnValue(of({
            result: {
                response: [...mockStaffDetails]
            }
        }))

        // Setup default responses for other methods
        mdoinfoSrvcMock.addStaffdetails.mockReturnValue(of({ success: true }))
        mdoinfoSrvcMock.updateStaffdetails.mockReturnValue(of({ success: true }))
        mdoinfoSrvcMock.deleteStaffdetails.mockReturnValue(of({ success: true }))

        // Create component with mocked dependencies
        component = new StaffComponent(
            snackBarMock,
            dialogMock,
            activeRouteMock,
            configSvcMock,
            mdoinfoSrvcMock
        )

        // Mock paginator
        component.paginator = {
            firstPage: jest.fn()
        } as any
    })

    describe('initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize form controls', () => {
            expect(component.staffdata).toBeTruthy()
            expect(component.staffdata.get('totalpositions')).toBeTruthy()
            expect(component.staffdata.get('posfilled')).toBeTruthy()
            expect(component.staffdata.get('posvacant')).toBeTruthy()
            expect(component.staffdata.get('totalpositions')?.disabled).toBe(true)
        })

        it('should initialize tableData with correct columns', () => {
            expect(component.tableData).toBeTruthy()
            expect(component.tableData.columns.length).toBe(4)
            expect(component.tableData.columns[0].displayName).toBe('Sr. no.')
            expect(component.tableData.columns[1].displayName).toBe('Position')
        })

        it('should initialize dataSource', () => {
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
        })


    })

    describe('ngOnInit', () => {
        it('should set displayedColumns from tableData', () => {
            component.ngOnInit()

            expect(component.displayedColumns).toEqual(component.tableData.columns)
        })

        it('should set dataSource data if data exists', () => {
            component.data = [{ srnumber: 1, position: 'Test', positionfilled: 1, positionvacant: 2 }]

            component.ngOnInit()

            expect(component.dataSource.data).toEqual(component.data)
        })
    })

    describe('ngOnChanges', () => {
        it('should update dataSource.data with new data', () => {
            const mockChanges: SimpleChanges = {
                data: new SimpleChange(null, [{ id: 'new', position: 'New Position' }], true)
            }

            component.ngOnChanges(mockChanges)

            expect(component.paginator.firstPage).toHaveBeenCalled()
        })

        it('should handle empty data', () => {
            const mockChanges: SimpleChanges = {
                data: new SimpleChange(null, null, true)
            }

            component.ngOnChanges(mockChanges)

            expect(component.dataSource.data).toEqual([])
        })
    })

    describe('getFinalColumns', () => {
        it('should return columns from tableData', () => {
            const result = component.getFinalColumns()

            // The expected columns from tableData defined in component
            expect(result).toContain('srnumber')
            expect(result).toContain('position')
            expect(result).toContain('totalPositionsFilled')
            expect(result).toContain('totalPositionsVacant')

            // Should add Menu because needUserMenus is true
            expect(result).toContain('Menu')
        })

        it('should include checkbox column if needCheckBox is true', () => {
            component.tableData.needCheckBox = true

            const result = component.getFinalColumns()

            expect(result).toContain('select')
        })

        it('should include hash column if needHash is true', () => {
            component.tableData.needHash = true

            const result = component.getFinalColumns()

            expect(result).toContain('SR')
        })

        it('should return empty string if tableData is undefined', () => {
            component.tableData = undefined as any

            const result = component.getFinalColumns()

            expect(result).toBe('')
        })
    })

    describe('getStaffDetails', () => {

        it('should show error message if request fails with 400 status', () => {
            mdoinfoSrvcMock.getStaffdetails.mockReturnValue(
                throwError({ status: 400 })
            )

            component.getStaffDetails()

            expect(snackBarMock.open).toHaveBeenCalledWith('No staff positions found')
        })
    })

    describe('selection handling', () => {
        beforeEach(() => {
            // Setup test data
            component.dataSource.data = [
                { id: 1, position: 'Position 1' },
                { id: 2, position: 'Position 2' },
                { id: 3, position: 'Position 3' }
            ]

            // Create selection model
            component.selection = new SelectionModel<any>(true, [])
        })

        it('should detect if all rows are selected', () => {
            // Initially nothing selected
            expect(component.isAllSelected()).toBe(false)

            // Select all rows
            component.dataSource.data.forEach((row: any) => component.selection.select(row))

            expect(component.isAllSelected()).toBe(true)
        })

        it('should toggle all selections with masterToggle', () => {
            // Select all
            component.masterToggle()
            expect(component.selection.selected.length).toBe(3)

            // Deselect all
            component.masterToggle()
            expect(component.selection.selected.length).toBe(0)
        })

        it('should return correct checkbox label', () => {
            const row = component.dataSource.data[0]

            // Label for "select all" checkbox
            expect(component.checkboxLabel()).toContain('all')

            // Label for row checkbox when not selected
            expect(component.checkboxLabel(row)).toContain('select row')

            // Select the row
            component.selection.select(row)

            // Label for row checkbox when selected
            expect(component.checkboxLabel(row)).toContain('deselect row')
        })

        it('should filter list by key', () => {
            const list = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' }
            ]

            const result = component.filterList(list, 'name')

            expect(result).toEqual(['Item 1', 'Item 2', 'Item 3'])
        })
    })

    describe('dialog interactions', () => {
        it('should open dialog with correct config when adding new position', () => {
            component.onAddPosition(null)

            expect(dialogMock.open).toHaveBeenCalled()

            // Verify dialog config
            const dialogConfig = dialogMock.open.mock.calls[0][1]
            expect(dialogConfig.disableClose).toBe(true)
            expect(dialogConfig.width).toBe('50%')
            expect(dialogConfig.data.data).toEqual([])
        })

        it('should open dialog with row data when updating position', () => {
            const rowData = { id: 'pos1', position: 'Test Position' }

            component.onAddPosition(rowData)

            // Verify dialog config
            const dialogConfig = dialogMock.open.mock.calls[0][1]
            expect(dialogConfig.data.data).toEqual(rowData)
        })

        it('should call addStaffdetails when new position submitted from dialog', () => {
            // Setup dialog to return new position data (no id)
            dialogMock.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of({
                    data: {
                        designation: 'New Position',
                        posfilled: '4',
                        posvacant: '2'
                    }
                }))
            })

            component.onAddPosition(null)

            // Verify addStaffdetails called with correct request
            expect(mdoinfoSrvcMock.addStaffdetails).toHaveBeenCalledWith({
                orgId: 'org123',
                position: 'New Position',
                totalPositionsFilled: 4,
                totalPositionsVacant: 2
            })

            // Verify details refreshed after add
            expect(mdoinfoSrvcMock.getStaffdetails).toHaveBeenCalled()
        })



        it('should show error when adding duplicate position', () => {
            // Setup dialog to return new position
            dialogMock.open.mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of({
                    data: {
                        designation: 'Duplicate Position',
                        posfilled: '1',
                        posvacant: '1'
                    }
                }))
            })

            // Setup error for duplicate position
            mdoinfoSrvcMock.addStaffdetails.mockReturnValue(
                throwError({ status: 400 })
            )

            component.onAddPosition(null)

            expect(snackBarMock.open).toHaveBeenCalledWith('Position exists for given name')
        })
    })

    describe('form submission', () => {
        beforeEach(() => {
            // Set up mock form
            component.staffdata = new UntypedFormGroup({
                totalpositions: new UntypedFormControl({ value: '10', disabled: true }),
                posfilled: new UntypedFormControl('6'),
                posvacant: new UntypedFormControl('4')
            })
        })

        it('should call addStaffdetails when submitting new overall positions', () => {
            // Clear overallpos to simulate new submission
            component.overallpos = null

            component.onSubmit(component.staffdata)

            expect(mdoinfoSrvcMock.addStaffdetails).toHaveBeenCalledWith({
                orgId: 'org123',
                position: 'all',
                totalPositionsFilled: 6,
                totalPositionsVacant: 4
            })

            expect(snackBarMock.open).toHaveBeenCalledWith('Staff details updated successfully')
        })

        it('should call updateStaffdetails when updating overall positions', () => {
            // Set overallpos to simulate update
            component.overallpos = { id: 'total' }

            component.onSubmit(component.staffdata)

            expect(mdoinfoSrvcMock.updateStaffdetails).toHaveBeenCalledWith({
                id: 'total',
                orgId: 'org123',
                position: 'all',
                totalPositionsFilled: 6,
                totalPositionsVacant: 4
            })

            expect(snackBarMock.open).toHaveBeenCalledWith('Staff details updated successfully')
        })
    })

    describe('updateStaffDetails', () => {
        it('should call updateStaffdetails with correct parameters', () => {
            const formData = {
                id: 'pos1',
                position: 'Updated Position',
                totalPositionsFilled: 3,
                totalPositionsVacant: 2
            }

            component.updateStaffDetails(formData)

            expect(mdoinfoSrvcMock.updateStaffdetails).toHaveBeenCalledWith({
                id: 'pos1',
                orgId: 'org123',
                position: 'Updated Position',
                totalPositionsFilled: 3,
                totalPositionsVacant: 2
            })

            expect(snackBarMock.open).toHaveBeenCalledWith('Staff details updated successfully')
        })
    })

    describe('deleteStaffDetails', () => {
        it('should call deleteStaffdetails with correct ID', () => {
            const formData = {
                id: 'pos1',
                position: 'Position to Delete'
            }

            component.deleteStaffDetails(formData)

            expect(mdoinfoSrvcMock.deleteStaffdetails).toHaveBeenCalledWith('pos1', 'org123')
            expect(snackBarMock.open).toHaveBeenCalledWith('Staff details deleted successfully')
        })
    })

    describe('filtering and validation', () => {
        it('should apply filter to dataSource', () => {
            component.applyFilter('test')

            expect(component.dataSource.filter).toBe('test')
        })

        it('should clear filter when empty value provided', () => {
            // Set initial filter
            component.dataSource.filter = 'test'

            // Clear filter
            component.applyFilter('')

            expect(component.dataSource.filter).toBe('')
        })

        it('should only allow numbers in keyPressNumbers', () => {
            // Mock event with non-number key
            const letterEvent = {
                which: 65, // 'A' key
                preventDefault: jest.fn()
            }

            // Test letter key
            const letterResult = component.keyPressNumbers(letterEvent)
            expect(letterResult).toBe(false)
            expect(letterEvent.preventDefault).toHaveBeenCalled()

            // Mock event with number key
            const numberEvent = {
                which: 49, // '1' key
                preventDefault: jest.fn()
            }

            // Test number key
            const numberResult = component.keyPressNumbers(numberEvent)
            expect(numberResult).toBe(true)
            expect(numberEvent.preventDefault).not.toHaveBeenCalled()
        })
    })
})