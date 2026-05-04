import { EventListViewComponent } from './event-list-view.component'
import { SelectionModel } from '@angular/cdk/collections'

describe('EventListViewComponent', () => {
    let component: EventListViewComponent
    let mockRouter: any
    let mockMatDialog: any
    let mockEvents: any
    let mockRoute: any
    let mockCd: any

    beforeEach(() => {
        mockRouter = { navigate: jest.fn() }
        mockMatDialog = { open: jest.fn().mockReturnValue({ close: jest.fn() }) }
        mockEvents = { raiseInteractTelemetry: jest.fn() }
        mockRoute = { parent: { snapshot: { data: { configService: { name: 'cfg' } } } } }
        mockCd = { detectChanges: jest.fn() }

        component = new EventListViewComponent(
            mockRouter, mockMatDialog, mockEvents, mockRoute, mockCd, {} as any
        )
        component.selection = new SelectionModel<any>(true, [])
        // mock paginator
        component.paginator = { firstPage: jest.fn() } as any
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should set configSvc from route parent snapshot', () => {
        expect(component.configSvc).toEqual({ name: 'cfg' })
    })

    describe('ngOnInit()', () => {
        it('should set displayedColumns from tableData.columns', () => {
            const cols = [{ key: 'eventName', label: 'Event Name' }]
            component.tableData = { columns: cols } as any
            component.ngOnInit()
            expect(component.displayedColumns).toEqual(cols)
        })

        it('should set dataSource.data from input data', () => {
            const data = [{ id: 1 }, { id: 2 }]
            component.tableData = { columns: [] } as any
            component.data = data as any
            component.ngOnInit()
            expect(component.dataSource.data).toEqual(data)
        })

        it('should not set displayedColumns when tableData is undefined', () => {
            component.tableData = undefined
            component.ngOnInit()
            expect(component.displayedColumns).toEqual([])
        })
    })

    describe('ngOnChanges()', () => {
        it('should update dataSource.data from currentValue', () => {
            const newData = [{ id: 10 }]
            component.ngOnChanges({ data: { currentValue: newData } } as any)
            expect(component.dataSource.data).toEqual(newData)
        })

        it('should set length from dataSource.data.length', () => {
            component.ngOnChanges({ data: { currentValue: [{ id: 1 }, { id: 2 }] } } as any)
            expect(component.length).toBe(2)
        })

        it('should call paginator.firstPage', () => {
            component.ngOnChanges({ data: { currentValue: [] } } as any)
            expect(component.paginator.firstPage).toHaveBeenCalled()
        })
    })

    describe('ngAfterViewChecked()', () => {
        it('should call cd.detectChanges()', () => {
            component.ngAfterViewChecked()
            expect(mockCd.detectChanges).toHaveBeenCalled()
        })
    })

    describe('ngAfterViewInit()', () => {
        it('should set dataSource.paginator', () => {
            component.ngAfterViewInit()
            expect(component.dataSource.paginator).toBe(component.paginator)
        })
    })

    describe('applyFilter()', () => {
        it('should set lower-cased filter', () => {
            component.applyFilter('  Test  ')
            expect(component.dataSource.filter).toBe('  test  ')
        })

        it('should clear filter when falsy value passed', () => {
            component.dataSource.filter = 'previous'
            component.applyFilter('')
            expect(component.dataSource.filter).toBe('')
        })
    })

    describe('buttonClick()', () => {
        it('should emit actionsClick when action is not disabled', () => {
            component.tableData = {
                columns: [],
                actions: [{ name: 'edit', disabled: false }]
            } as any
            component.actionsClick = { emit: jest.fn() } as any
            component.buttonClick('edit', { id: 1 })
            expect(component.actionsClick!.emit).toHaveBeenCalledWith({ action: 'edit', row: { id: 1 } })
        })

        it('should NOT emit actionsClick when action is disabled', () => {
            component.tableData = {
                columns: [],
                actions: [{ name: 'delete', disabled: true }]
            } as any
            component.actionsClick = { emit: jest.fn() } as any
            component.buttonClick('delete', { id: 1 })
            expect(component.actionsClick!.emit).not.toHaveBeenCalled()
        })

        it('should do nothing when tableData is undefined', () => {
            component.tableData = undefined
            component.actionsClick = { emit: jest.fn() } as any
            expect(() => component.buttonClick('edit', {})).not.toThrow()
        })
    })

    describe('getFinalColumns()', () => {
        it('should return empty string when tableData is undefined', () => {
            component.tableData = undefined
            expect(component.getFinalColumns()).toBe('')
        })

        it('should return array of column keys', () => {
            component.tableData = {
                columns: [{ key: 'name' }, { key: 'date' }],
                needCheckBox: false,
                needHash: false,
                actions: [],
                needUserMenus: false,
            } as any
            const cols = component.getFinalColumns()
            expect(cols).toEqual(['name', 'date'])
        })

        it('should prepend select column when needCheckBox=true', () => {
            component.tableData = {
                columns: [{ key: 'name' }],
                needCheckBox: true,
                needHash: false,
                actions: [],
            } as any
            const cols = component.getFinalColumns() as string[]
            expect(cols[0]).toBe('select')
        })

        it('should prepend SR column when needHash=true', () => {
            component.tableData = {
                columns: [{ key: 'name' }],
                needCheckBox: false,
                needHash: true,
                actions: [],
            } as any
            const cols = component.getFinalColumns() as string[]
            expect(cols[0]).toBe('SR')
        })

        it('should append Actions column when actions are present', () => {
            component.tableData = {
                columns: [{ key: 'name' }],
                needCheckBox: false,
                needHash: false,
                actions: [{ name: 'edit' }],
            } as any
            const cols = component.getFinalColumns() as string[]
            expect(cols[cols.length - 1]).toBe('Actions')
        })

        it('should append Menu column when needUserMenus=true', () => {
            component.tableData = {
                columns: [{ key: 'name' }],
                needCheckBox: false,
                needHash: false,
                actions: [],
                needUserMenus: true,
            } as any
            const cols = component.getFinalColumns() as string[]
            expect(cols[cols.length - 1]).toBe('Menu')
        })
    })

    describe('isAllSelected()', () => {
        it('should return true when all rows selected', () => {
            component.dataSource.data = [{ id: 1 }, { id: 2 }]
            component.selection.select(...component.dataSource.data)
            expect(component.isAllSelected()).toBe(true)
        })

        it('should return false when not all selected', () => {
            component.dataSource.data = [{ id: 1 }, { id: 2 }]
            component.selection.select(component.dataSource.data[0])
            expect(component.isAllSelected()).toBe(false)
        })
    })

    describe('masterToggle()', () => {
        it('should select all rows when not all selected', () => {
            component.dataSource.data = [{ id: 1 }, { id: 2 }]
            component.masterToggle()
            expect(component.selection.selected.length).toBe(2)
        })

        it('should clear selection when all are selected', () => {
            component.dataSource.data = [{ id: 1 }]
            component.selection.select(component.dataSource.data[0])
            component.masterToggle()
            expect(component.selection.selected.length).toBe(0)
        })
    })

    describe('checkboxLabel()', () => {
        it('should return "select all" when all selected (source label is inverted)', () => {
            component.dataSource.data = [{ id: 1 }]
            component.selection.select(component.dataSource.data[0])
            expect(component.checkboxLabel()).toBe('select all')
        })

        it('should return "deselect all" when not all selected (source label is inverted)', () => {
            component.dataSource.data = [{ id: 1 }, { id: 2 }]
            expect(component.checkboxLabel()).toBe('deselect all')
        })

        it('should return row label for specific row', () => {
            const row = { position: 2 }
            expect(component.checkboxLabel(row)).toBe('select row 3')
        })

        it('should return deselect for a selected row', () => {
            const row = { position: 0 }
            component.selection.select(row)
            expect(component.checkboxLabel(row)).toBe('deselect row 1')
        })
    })

    describe('filterList()', () => {
        it('should extract field from each item', () => {
            const list = [{ name: 'Alice' }, { name: 'Bob' }]
            expect(component.filterList(list, 'name')).toEqual(['Alice', 'Bob'])
        })
    })

    describe('onRowClick()', () => {
        it('should emit the event', () => {
            component.eOnRowClick = { emit: jest.fn() } as any
            component.onRowClick({ id: 1 })
            expect(component.eOnRowClick.emit).toHaveBeenCalledWith({ id: 1 })
        })
    })

    describe('onCreateClick()', () => {
        it('should navigate to create-event page', () => {
            component.onCreateClick()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/events/create-event'])
        })

        it('should call raiseInteractTelemetry', () => {
            component.onCreateClick()
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
        })
    })

    describe('showImageDialog()', () => {
        it('should open MatDialog with image data', () => {
            const img = { width: 400, height: 300 }
            component.showImageDialog(img)
            expect(mockMatDialog.open).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ width: 400, height: 300, data: img })
            )
        })
    })
})
