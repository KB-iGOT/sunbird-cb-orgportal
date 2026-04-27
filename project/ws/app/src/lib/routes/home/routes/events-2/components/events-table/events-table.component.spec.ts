import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatTableDataSource } from '@angular/material/table'
import { PageEvent } from '@angular/material/paginator'
import { SimpleChanges } from '@angular/core'
import { EventsTableComponent } from './events-table.component'
import { events } from '../../models/events.model'

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn(),
  map: jest.fn()
}))

const _ = require('lodash')

describe('EventsTableComponent', () => {
  let component: EventsTableComponent
  let fixture: ComponentFixture<EventsTableComponent>
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventsTableComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents()

    fixture = TestBed.createComponent(EventsTableComponent)
    component = fixture.componentInstance
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize default values in constructor', () => {
      expect(component.searchControl).toBeInstanceOf(FormControl)
      expect(component.showSearchBox).toBe(true)
      expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
      expect(component.pageSizeOptions).toEqual([20, 50, 100])
      expect(component.columnsList).toEqual([])
      expect(component.tableColumns).toEqual([])
      expect(component.noDataMessage).toBe('No data found')
      expect(component.showPagination).toBe(true)
    })

    it('should initialize default pagination details', () => {
      expect(component.paginationDetails).toEqual({
        startIndex: 0,
        lastIndex: 20,
        pageSize: 20,
        pageIndex: 0,
        totalCount: 20
      })
    })

    it('should initialize empty menu items array', () => {
      expect(component.menuItems).toEqual([])
    })

    it('should initialize showLoader as false', () => {
      expect(component.showLoader).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should set displayedColumns when tableData exists', () => {
      const mockTableData: events.tableData = {
        columns: [
          { key: 'name', displayName: 'Name', cellType: 'text' },
          { key: 'age', displayName: 'Age', cellType: 'text' }
        ],
        showSearchBox: true,
        noDataMessage: 'Custom no data message',
        showPagination: false
      }
      component.tableData = mockTableData

      component.ngOnInit()

      expect(component.displayedColumns).toEqual(mockTableData.columns)
    })

    it('should set properties from tableData using lodash get with defaults', () => {
      const mockTableData: events.tableData = {
        columns: [],
        showSearchBox: false,
        showPagination: false
      }
      component.tableData = mockTableData

      _.get.mockReturnValueOnce(false) // showSearchBox
        .mockReturnValueOnce('Custom message') // noDataMessage
        .mockReturnValueOnce(false) // showPagination

      component.ngOnInit()

      expect(_.get).toHaveBeenCalledWith(mockTableData, 'showSearchBox', true)
      expect(_.get).toHaveBeenCalledWith(mockTableData, 'noDataMessage', 'No data found')
      expect(_.get).toHaveBeenCalledWith(mockTableData, 'showPagination', true)
      expect(component.showSearchBox).toBe(false)
      expect(component.noDataMessage).toBe('Custom message')
      expect(component.showPagination).toBe(false)
    })

    it('should setup search control valueChanges subscription', fakeAsync(() => {
      const searchKeySpy = jest.spyOn(component.searchKey, 'emit')

      component.ngOnInit()

      // Simulate search input
      component.searchControl.setValue('test search')
      tick(500) // Wait for debounce

      expect(searchKeySpy).toHaveBeenCalledWith('test search')
    }))

    it('should handle null searchControl gracefully', () => {
      component.searchControl = null as any

      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should not set properties when tableData is null', () => {
      component.tableData = null as any

      component.ngOnInit()

      expect(component.displayedColumns).toBeUndefined()
    })
  })

  describe('ngOnChanges', () => {
    it('should call getFinalColumns when tableData changes', () => {
      // Spy + mock-impl to avoid JSON.parse crash when tableData has no columns
      const getFinalColumnsSpy = jest.spyOn(component, 'getFinalColumns').mockImplementation(() => { })
      const changes: SimpleChanges = {
        tableData: {
          currentValue: { columns: [] },
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      component.ngOnChanges(changes)

      expect(getFinalColumnsSpy).toHaveBeenCalled()
    })

    it('should update dataSource data when data changes and dataSource exists', fakeAsync(() => {
      const mockData = [{ id: 1, name: 'Test' }]
      component.dataSource = new MatTableDataSource()
      // component uses this.data (@Input), not changes.data.currentValue
      component.data = mockData as any

      const changes: SimpleChanges = {
        data: {
          currentValue: mockData,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      component.ngOnChanges(changes)

      expect(component.dataSource.data).toEqual(mockData)
      tick(10) // consume the setTimeout
    }))

    it('should not update dataSource when dataSource is null', () => {
      component.dataSource = null
      const changes: SimpleChanges = {
        data: {
          currentValue: [],
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      expect(() => component.ngOnChanges(changes)).not.toThrow()
    })

    it('should handle both tableData and data changes', fakeAsync(() => {
      const getFinalColumnsSpy = jest.spyOn(component, 'getFinalColumns').mockImplementation(() => { })
      const mockData = [{ id: 1 }]
      component.dataSource = new MatTableDataSource()
      component.data = mockData as any

      const changes: SimpleChanges = {
        tableData: {
          currentValue: { columns: [] },
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        },
        data: {
          currentValue: mockData,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }

      component.ngOnChanges(changes)

      expect(getFinalColumnsSpy).toHaveBeenCalled()
      expect(component.dataSource.data).toEqual(mockData)

      tick(10)
    }))
  })

  describe('getFinalColumns', () => {
    beforeEach(() => {
      component.tableData = {
        columns: [
          { key: 'name', displayName: 'Name', cellType: 'text' },
          { key: 'age', displayName: 'Age', cellType: 'text' }
        ]
      } as any
    })

    it('should set tableColumns without menu when menuItems is empty', () => {
      _.map.mockReturnValue(['name', 'age'])
      component.menuItems = []

      component.getFinalColumns()

      expect(component.tableColumns).toEqual([
        { key: 'name', displayName: 'Name', cellType: 'text' },
        { key: 'age', displayName: 'Age', cellType: 'text' }
      ])
      expect(_.map).toHaveBeenCalledWith(component.tableColumns, expect.any(Function))
      expect(component.columnsList).toEqual(['name', 'age'])
    })

    it('should add menu column to tableColumns when menuItems is non-empty', () => {
      _.map.mockReturnValue(['name', 'age', 'menu'])
      component.menuItems = [{ action: 'edit', btnText: 'Edit' } as any]

      component.getFinalColumns()

      expect(component.tableColumns).toEqual([
        { key: 'name', displayName: 'Name', cellType: 'text' },
        { key: 'age', displayName: 'Age', cellType: 'text' },
        { displayName: 'Actions', key: 'menu', cellType: 'menu' }
      ])
      expect(component.columnsList).toEqual(['name', 'age', 'menu'])
    })

    it('should reset columnsList before processing', () => {
      _.map.mockReturnValue(['name', 'age'])
      component.columnsList = ['existing']
      component.menuItems = []

      component.getFinalColumns()

      expect(component.columnsList).toEqual(['name', 'age'])
    })

    it('should create deep copy of columns so original is not mutated', () => {
      _.map.mockReturnValue(['name', 'age'])
      const originalColumns = component.tableData.columns
      component.menuItems = []

      component.getFinalColumns()

      // Original columns array must be unchanged (no menu column appended)
      expect(originalColumns).toEqual([
        { key: 'name', displayName: 'Name', cellType: 'text' },
        { key: 'age', displayName: 'Age', cellType: 'text' }
      ])
      expect(originalColumns.length).toBe(2)
    })
  })

  describe('getButtonsToShow', () => {
    beforeEach(() => {
      component.menuItems = [
        { action: 'edit', btnText: 'Edit' } as any,
        { action: 'delete', btnText: 'Delete' } as any,
        { action: 'view', btnText: 'View' } as any,
      ]
    })

    it('should return all menu items when buttonsToHide is not present', () => {
      const rowData = { id: 1, name: 'Test' }

      const result = component.getButtonsToShow(rowData)

      expect(result).toEqual(component.menuItems)
    })

    it('should return filtered menu items when buttonsToHide is present', () => {
      const rowData = {
        id: 1,
        name: 'Test',
        buttonsToHide: ['delete']
      }

      const result = component.getButtonsToShow(rowData)

      expect(result).toEqual([
        { action: 'edit', btnText: 'Edit' },
        { action: 'view', btnText: 'View' }
      ])
    })

    it('should return empty array when all buttons are hidden', () => {
      const rowData = {
        id: 1,
        name: 'Test',
        buttonsToHide: ['edit', 'delete', 'view']
      }

      const result = component.getButtonsToShow(rowData)

      expect(result).toEqual([])
    })

    it('should return all menu items when buttonsToHide is empty array', () => {
      const rowData = {
        id: 1,
        name: 'Test',
        buttonsToHide: []
      }

      const result = component.getButtonsToShow(rowData)

      expect(result).toEqual(component.menuItems)
    })

    it('should handle case when menuItems is empty', () => {
      component.menuItems = []
      const rowData = { buttonsToHide: ['edit'] }

      const result = component.getButtonsToShow(rowData)

      expect(result).toEqual([])
    })
  })


  describe('buttonClick', () => {
    it('should emit actionsClick when tableData exists', () => {
      const actionsClickSpy = jest.spyOn(component.actionsClick, 'emit')
      component.tableData = { columns: [] } as any  // tableData must be truthy
      const action = 'edit'
      const rows = { id: 1, name: 'Test' }

      component.buttonClick(action, rows)

      expect(actionsClickSpy).toHaveBeenCalledWith({ action, rows })
    })

    it('should not emit actionsClick when tableData is null', () => {
      const actionsClickSpy = jest.spyOn(component.actionsClick, 'emit')
      component.tableData = null as any
      const action = 'edit'
      const rows = { id: 1, name: 'Test' }

      component.buttonClick(action, rows)

      expect(actionsClickSpy).not.toHaveBeenCalled()
    })

    it('should not emit actionsClick when tableData is undefined', () => {
      const actionsClickSpy = jest.spyOn(component.actionsClick, 'emit')
      component.tableData = undefined as any
      const action = 'delete'
      const rows = { id: 2, name: 'Test2' }

      component.buttonClick(action, rows)

      expect(actionsClickSpy).not.toHaveBeenCalled()
    })
  })

  describe('onChangePage', () => {
    it('should update pagination details and emit pageChange', () => {
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit')
      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 30,
        length: 100,
        previousPageIndex: 1
      }

      component.onChangePage(pageEvent)

      expect(component.paginationDetails.startIndex).toBe(60) // 2 * 30
      expect(component.paginationDetails.lastIndex).toBe(90) // (2 + 1) * 30
      expect(component.paginationDetails.pageSize).toBe(30)
      expect(component.paginationDetails.pageIndex).toBe(2)
      expect(pageChangeSpy).toHaveBeenCalledWith(component.paginationDetails)
    })

    it('should handle first page correctly', () => {
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit')
      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: 20,
        length: 100,
        previousPageIndex: undefined
      }

      component.onChangePage(pageEvent)

      expect(component.paginationDetails.startIndex).toBe(0)
      expect(component.paginationDetails.lastIndex).toBe(20)
      expect(component.paginationDetails.pageSize).toBe(20)
      expect(component.paginationDetails.pageIndex).toBe(0)
      expect(pageChangeSpy).toHaveBeenCalledWith(component.paginationDetails)
    })

    it('should handle different page sizes', () => {
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit')
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 40,
        length: 100,
        previousPageIndex: 0
      }

      component.onChangePage(pageEvent)

      expect(component.paginationDetails.startIndex).toBe(40) // 1 * 40
      expect(component.paginationDetails.lastIndex).toBe(80) // (1 + 1) * 40
      expect(component.paginationDetails.pageSize).toBe(40)
      expect(component.paginationDetails.pageIndex).toBe(1)
      expect(pageChangeSpy).toHaveBeenCalledWith(component.paginationDetails)
    })
  })

  describe('Input Properties', () => {
    it('should accept tableData input', () => {
      const tableData: events.tableData = {
        columns: [],
        showSearchBox: false,
        showPagination: false
      }
      component.tableData = tableData
      expect(component.tableData).toBe(tableData)
    })

    it('should accept data input', () => {
      const data = [{ id: 1 }] as any
      component.data = data
      expect(component.data).toBe(data)
    })

    it('should accept custom paginationDetails', () => {
      const customPagination: events.pagination = {
        startIndex: 10,
        lastIndex: 30,
        pageSize: 20,
        pageIndex: 1,
        totalCount: 100
      }
      component.paginationDetails = customPagination
      expect(component.paginationDetails).toBe(customPagination)
    })

    it('should accept menuItems input', () => {
      const menuItems: events.menuItems[] = []
      component.menuItems = menuItems
      expect(component.menuItems).toBe(menuItems)
    })

    it('should accept showLoader input', () => {
      component.showLoader = true
      expect(component.showLoader).toBe(true)
    })
  })

  describe('Output Events', () => {
    it('should have actionsClick EventEmitter', () => {
      expect(component.actionsClick).toBeDefined()
      expect(component.actionsClick.emit).toBeDefined()
    })

    it('should have searchKey EventEmitter', () => {
      expect(component.searchKey).toBeDefined()
      expect(component.searchKey.emit).toBeDefined()
    })

    it('should have pageChange EventEmitter', () => {
      expect(component.pageChange).toBeDefined()
      expect(component.pageChange.emit).toBeDefined()
    })
  })

})


// ─────────────────────────────────────────────────────────────────────────────
// No-TestBed suite covering parseDisplayDateToTimestamp and remaining branches
// ─────────────────────────────────────────────────────────────────────────────

describe('EventsTableComponent (no-TestBed)', () => {
  let component: EventsTableComponent

  beforeEach(() => {
    component = new EventsTableComponent()
    component.tableData = {
      columns: [
        { key: 'name', displayName: 'Name', cellType: 'text' },
        { key: 'date', displayName: 'Date', cellType: 'date' },
      ],
      showSearchBox: true,
      noDataMessage: 'No results',
      showPagination: true,
    }
    component.menuItems = []
    component.paginationDetails = {
      startIndex: 0,
      lastIndex: 20,
      pageSize: 20,
      pageIndex: 0,
      totalCount: 100,
    }
  })

  describe('parseDisplayDateToTimestamp', () => {
    it('should return null for falsy input', () => {
      expect(component.parseDisplayDateToTimestamp(null)).toBeNull()
      expect(component.parseDisplayDateToTimestamp(undefined)).toBeNull()
      expect(component.parseDisplayDateToTimestamp('')).toBeNull()
    })

    it('should parse "19 Jun 2025" format', () => {
      const ts = component.parseDisplayDateToTimestamp('19 Jun 2025')
      expect(ts).toBe(new Date(2025, 5, 19).getTime())
    })

    it('should parse "19 June 2025" full month name', () => {
      const ts = component.parseDisplayDateToTimestamp('19 June 2025')
      expect(ts).toBe(new Date(2025, 5, 19).getTime())
    })

    it('should parse all short month names', () => {
      const cases: [string, number][] = [
        ['1 Jan 2025', new Date(2025, 0, 1).getTime()],
        ['1 Feb 2025', new Date(2025, 1, 1).getTime()],
        ['1 Mar 2025', new Date(2025, 2, 1).getTime()],
        ['1 Apr 2025', new Date(2025, 3, 1).getTime()],
        ['1 May 2025', new Date(2025, 4, 1).getTime()],
        ['1 Jul 2025', new Date(2025, 6, 1).getTime()],
        ['1 Aug 2025', new Date(2025, 7, 1).getTime()],
        ['1 Sep 2025', new Date(2025, 8, 1).getTime()],
        ['1 Oct 2025', new Date(2025, 9, 1).getTime()],
        ['1 Nov 2025', new Date(2025, 10, 1).getTime()],
        ['1 Dec 2025', new Date(2025, 11, 1).getTime()],
      ]
      cases.forEach(([input, expected]) => {
        expect(component.parseDisplayDateToTimestamp(input)).toBe(expected)
      })
    })

    it('should strip trailing comma from "19 Jun, 2025"', () => {
      const ts = component.parseDisplayDateToTimestamp('19 Jun, 2025')
      expect(ts).toBe(new Date(2025, 5, 19).getTime())
    })

    it('should fallback to Date.parse for ISO format', () => {
      const ts = component.parseDisplayDateToTimestamp('2025-06-19')
      expect(ts).not.toBeNull()
      expect(typeof ts).toBe('number')
    })

    it('should return null for completely invalid string', () => {
      const ts = component.parseDisplayDateToTimestamp('not-a-date')
      expect(ts).toBeNull()
    })
  })

  describe('getFinalColumns (no-TestBed)', () => {
    it('should add menu column to tableColumns when menuItems is non-empty', () => {
      component.menuItems = [{ action: 'edit', label: 'Edit' } as any]
      component.getFinalColumns()
      // tableColumns is set without lodash, so it's reliable even with mock
      const menuCol = (component.tableColumns as any[]).find((c: any) => c.key === 'menu')
      expect(menuCol).toBeDefined()
      expect(menuCol.cellType).toBe('menu')
    })

    it('should not add menu column when menuItems is empty', () => {
      component.menuItems = []
      component.getFinalColumns()
      const menuCol = (component.tableColumns as any[]).find((c: any) => c.key === 'menu')
      expect(menuCol).toBeUndefined()
    })

    it('should include all original columns in tableColumns', () => {
      component.menuItems = []
      component.getFinalColumns()
      const cols = component.tableColumns as any[]
      expect(cols.find((c: any) => c.key === 'name')).toBeDefined()
      expect(cols.find((c: any) => c.key === 'date')).toBeDefined()
    })
  })

  describe('getButtonsToShow (no-TestBed)', () => {
    beforeEach(() => {
      component.menuItems = [
        { action: 'edit', label: 'Edit' } as any,
        { action: 'delete', label: 'Delete' } as any,
        { action: 'view', label: 'View' } as any,
      ]
    })

    it('should return all menuItems when buttonsToHide is absent', () => {
      expect(component.getButtonsToShow({ id: 1 })).toEqual(component.menuItems)
    })

    it('should filter out hidden buttons', () => {
      const result = component.getButtonsToShow({ buttonsToHide: ['delete'] })
      expect(result.map((m: any) => m.action)).toEqual(['edit', 'view'])
    })

    it('should return empty list when all buttons are hidden', () => {
      const result = component.getButtonsToShow({ buttonsToHide: ['edit', 'delete', 'view'] })
      expect(result).toHaveLength(0)
    })

    it('should return all items when buttonsToHide is empty', () => {
      const result = component.getButtonsToShow({ buttonsToHide: [] })
      expect(result).toEqual(component.menuItems)
    })
  })

  describe('buttonClick (no-TestBed)', () => {
    it('should emit actionsClick when tableData exists', () => {
      const spy = jest.spyOn(component.actionsClick, 'emit')
      component.buttonClick('edit', { id: 1 })
      expect(spy).toHaveBeenCalledWith({ action: 'edit', rows: { id: 1 } })
    })

    it('should not emit when tableData is null', () => {
      component.tableData = null as any
      const spy = jest.spyOn(component.actionsClick, 'emit')
      component.buttonClick('edit', { id: 1 })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('onChangePage (no-TestBed)', () => {
    it('should update pagination and emit pageChange', () => {
      const spy = jest.spyOn(component.pageChange, 'emit')
      const event: any = { pageIndex: 1, pageSize: 20, length: 100 }
      component.onChangePage(event)
      expect(component.paginationDetails.startIndex).toBe(20)
      expect(component.paginationDetails.lastIndex).toBe(40)
      expect(spy).toHaveBeenCalledWith(component.paginationDetails)
    })
  })

  describe('ngOnInit (no-TestBed)', () => {
    it('should set displayedColumns from tableData', () => {
      component.ngOnInit()
      expect(component.displayedColumns).toEqual(component.tableData.columns)
    })

    it('should call ngOnInit without throwing', () => {
      // showSearchBox/noDataMessage/showPagination set via _.get which is mocked
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })
})