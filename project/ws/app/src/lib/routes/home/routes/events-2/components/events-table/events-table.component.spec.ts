import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatTableDataSource } from '@angular/material/table'
import { MatSort } from '@angular/material/sort'
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
      expect(component.pageSizeOptions).toEqual([20, 30, 40])
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
      const getFinalColumnsSpy = jest.spyOn(component, 'getFinalColumns')
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
      const mockSort = {} as MatSort
      component.dataSource = new MatTableDataSource()
      component.sort = mockSort

      const changes: SimpleChanges = {
        data: {
          currentValue: mockData,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      }
      //component.data = mockData

      component.ngOnChanges(changes)

      expect(component.dataSource.data).toEqual(mockData)

      tick(10) // Wait for setTimeout
      expect(component.dataSource.sort).toBe(mockSort)
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
      const getFinalColumnsSpy = jest.spyOn(component, 'getFinalColumns')
      const mockData = [{ id: 1 }]
      component.dataSource = new MatTableDataSource()
      //component.data = mockData

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
      // component.tableData = {
      //   columns: [
      //     { key: 'name', displayName: 'Name', cellType: 'text' },
      //     { key: 'age', displayName: 'Age', cellType: 'text' }
      //   ]
      // }
    })

    it('should set columns without menu when menuItems is empty', () => {
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

    it('should add menu column when menuItems has items', () => {
      _.map.mockReturnValue(['name', 'age', 'menu'])
      component.menuItems = []

      component.getFinalColumns()

      expect(component.tableColumns).toEqual([
        { key: 'name', displayName: 'Name', cellType: 'text' },
        { key: 'age', displayName: 'Age', cellType: 'text' },
        { displayName: 'Actions', key: 'menu', cellType: 'menu' }
      ])
      expect(component.columnsList).toEqual(['name', 'age', 'menu'])
    })

    it('should reset columnsList before processing', () => {
      _.map.mockReturnValue(['name'])
      component.columnsList = ['existing']
      component.menuItems = []

      component.getFinalColumns()

      expect(component.columnsList).toEqual(['name'])
    })

    it('should create deep copy of columns to avoid mutation', () => {
      _.map.mockReturnValue(['name', 'age'])
      const originalColumns = component.tableData.columns
      component.menuItems = []

      component.getFinalColumns()

      // Verify original columns are not modified
      expect(originalColumns).toEqual([
        { key: 'name', displayName: 'Name', cellType: 'text' },
        { key: 'age', displayName: 'Age', cellType: 'text' }
      ])
      expect(originalColumns.length).toBe(2) // Should not have menu column
    })
  })

  describe('getButtonsToShow', () => {
    beforeEach(() => {
      component.menuItems = [
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
        { action: 'edit', label: 'Edit' },
        { action: 'view', label: 'View' }
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
      //  component.tableData = { columns: [] }
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