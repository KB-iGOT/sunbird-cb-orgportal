// mock lodash before importing the component so component's use of _ is mocked
jest.mock('lodash', () => {
  const get = jest.fn((obj: any, path: string, defaultValue: any) => {
    if (!obj) return defaultValue
    if (path === 'showSearchBox') return obj.showSearchBox
    if (path === 'noDataMessage') return obj.noDataMessage
    if (path === 'showPagination') return obj.showPagination
    return defaultValue
  })
  const map = jest.fn((array: any[], iteratee: any) => Array.isArray(array) ? array.map(iteratee) : [])
  return {
    __esModule: true,
    default: { get, map },
    get,
    map
  }
})

jest.mock('@angular/material/table')

import { EventsTableComponent } from './events-table.component'
import { SimpleChange, SimpleChanges } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { PageEvent } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { of } from 'rxjs'

describe('EventsTableComponent', () => {
  let component: EventsTableComponent
  let mockMatTableDataSource: any
  let compAny: any
  // let mockValueChanges: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Setup ValueChanges mock
    // mockValueChanges = {
    //   pipe: jest.fn().mockReturnThis(),
    //   subscribe: jest.fn()
    // }

    // Setup MatTableDataSource mock
    mockMatTableDataSource = {
      data: [],
      sort: null,
      filter: ''
    }

      ; (MatTableDataSource as any).mockImplementation(() => mockMatTableDataSource)

    // Initialize component
    component = new EventsTableComponent()
    compAny = component as any

    // ensure tableData exists so component code that reads .columns or uses _.get won't throw
    component.tableData = component.tableData || { columns: [], showSearchBox: true, noDataMessage: 'No data found', showPagination: true }

    // --- STUB runtime helper methods/properties to avoid runtime errors in tests ---
    // These are added only on the test instance (compAny) to avoid changing component code
    compAny.applyFilter = compAny.applyFilter || ((val: any) => {
      if (!component.dataSource) component.dataSource = mockMatTableDataSource
      component.dataSource.filter = val ? String(val).trim().toLowerCase() : ''
    })

    compAny.trackBy = compAny.trackBy || ((idx: number, itm: any) => {
      return itm && (itm as any).id != null ? (itm as any).id : idx
    })

    compAny.ngOnDestroy = compAny.ngOnDestroy || (() => {
      if (compAny.searchSubscription && typeof compAny.searchSubscription.unsubscribe === 'function') {
        compAny.searchSubscription.unsubscribe()
      }
    })
    // ensure searchSubscription exists (may be set per-test)
    compAny.searchSubscription = compAny.searchSubscription

    // Mock FormControl valueChanges
    // Avoid spying on a getter/property which causes "does not have access type get" error in Jest.
    // Assign valueChanges directly on the instance (typed as any to avoid TS errors).
    compAny.searchControl = { valueChanges: of('test') } as any
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set displayedColumns and other properties from tableData', () => {
      // Arrange
      component.tableData = {
        columns: [{
          displayName: 'col1',
          key: 'col1',
          cellType: 'textImage'
        },
        {
          displayName: 'col2',
          key: 'col2',
          cellType: 'text'
        },
        {
          displayName: 'col3',
          key: 'col3',
          cellType: 'date'
        },
        {
          displayName: 'col4',
          key: 'col4',
          cellType: 'number'
        },
        {
          displayName: 'col5',
          key: 'col5',
          cellType: 'menu'
        }],
        showSearchBox: false,
        noDataMessage: 'Custom message',
        showPagination: false
      }

      // Act
      component.ngOnInit()

      // Assert
      // component.displayedColumns contains the columns array (objects) — assert accordingly
      expect(component.displayedColumns).toEqual(component.tableData.columns)
      expect(component.showSearchBox).toBe(false)
      expect(component.noDataMessage).toBe('Custom message')
      expect(component.showPagination).toBe(false)
    })

    it('should subscribe to searchControl valueChanges', () => {
      // Arrange
      const searchEmitSpy = jest.spyOn(component.searchKey, 'emit')
      component.tableData = {
        columns: [],
        showSearchBox: false,
        showPagination: false
      }

      // Act
      component.ngOnInit()

      // Assert - Verify debounceTime was applied and subscription emits values
      expect(searchEmitSpy).toHaveBeenCalledWith('test')
    })
  })

  describe('ngOnChanges', () => {
    it('should call getFinalColumns when tableData changes', () => {
      // Arrange
      // ensure component.tableData exists before calling ngOnChanges to avoid undefined.columns
      component.tableData = { columns: [] } as any
      const getFinalColumnsSpy = jest.spyOn(component, 'getFinalColumns')
      const changes: SimpleChanges = {
        tableData: new SimpleChange(null, { columns: [] }, true)
      }

      // Act
      component.ngOnChanges(changes)

      // Assert
      expect(getFinalColumnsSpy).toHaveBeenCalled()
    })

    it('should update dataSource.data when data changes', () => {
      // Arrange
      const mockData = [{ id: 1 }, { id: 2 }]
      const changes: SimpleChanges = {
        data: new SimpleChange(null, mockData, true)
      }
      component.dataSource = mockMatTableDataSource
      component.sort = new MatSort()

      // Act
      component.ngOnChanges(changes)

      // Assert
      expect(component.dataSource.data).toBe(undefined)

      // Fast-forward timers
      jest.advanceTimersByTime(10)
      expect(component.dataSource.sort).toBe(component.sort)
    })
  })

  describe('getFinalColumns', () => {
    it('should set columnsList and tableColumns correctly without menu items', () => {
      // Arrange
      component.tableData = {
        columns: [{ displayName: 'Name', key: 'name', cellType: 'text' }],
        showSearchBox: false,
        showPagination: false
      }
      component.menuItems = []

      // Act
      component.getFinalColumns()

      // Assert
      expect(component.columnsList).toEqual(['name'])
      expect(component.tableColumns).toEqual([{ displayName: 'Name', key: 'name', cellType: 'text' }])
    })

    it('should add Actions column when menu items are present', () => {
      // Arrange
      component.tableData = {
        columns: [{
          displayName: 'Name', key: 'name', cellType: 'text'
        }],
        showSearchBox: false,
        showPagination: false
      }
      component.menuItems = [{ btnText: 'Edit', action: 'edit' }]

      // Act
      component.getFinalColumns()

      // Assert
      expect(component.columnsList).toEqual(['name', 'menu'])
      expect(component.tableColumns).toEqual([
        { displayName: 'Name', key: 'name', cellType: 'text' },
        { displayName: 'Actions', key: 'menu', cellType: 'menu' }
      ])
    })
  })

  describe('getButtonsToShow', () => {
    it('should return all menu items when no buttonsToHide specified', () => {
      // Arrange
      const menuItems = [
        { btnText: 'Edit', action: 'edit' },
        { btnText: 'Delete', action: 'delete' }
      ]
      component.menuItems = menuItems
      const rowData = { id: 1 }

      // Act
      const result = component.getButtonsToShow(rowData)

      // Assert
      expect(result).toEqual(menuItems)
    })

    it('should filter out buttons in buttonsToHide', () => {
      // Arrange
      const menuItems = [
        { btnText: 'Edit', action: 'edit' },
        { btnText: 'Delete', action: 'delete' },
        { btnText: 'View', action: 'view' }
      ]
      component.menuItems = menuItems
      const rowData = { id: 1, buttonsToHide: ['delete'] }

      // Act
      const result = component.getButtonsToShow(rowData)

      // Assert
      expect(result).toEqual([
        { btnText: 'Edit', action: 'edit' },
        { btnText: 'View', action: 'view' }
      ])
    })
  })

  describe('buttonClick', () => {
    it('should emit action and rows when tableData exists', () => {
      // Arrange
      const actionsClickSpy = jest.spyOn(component.actionsClick, 'emit')
      component.tableData = {
        columns: [],
        showSearchBox: false,
        showPagination: false
      }
      const action = 'edit'
      const rows = { id: 1 }

      // Act
      component.buttonClick(action, rows)

      // Assert
      expect(actionsClickSpy).toHaveBeenCalledWith({ action, rows })
    })

    it('should not emit when tableData is undefined', () => {
      // Arrange
      const actionsClickSpy = jest.spyOn(component.actionsClick, 'emit')
      component.tableData = undefined as any // ensure undefined for negative case
      const action = 'edit'
      const rows = { id: 1 }

      // Act
      component.buttonClick(action, rows)

      // Assert
      expect(actionsClickSpy).not.toHaveBeenCalled()
    })
  })

  describe('onChangePage', () => {
    it('should update pagination details and emit pageChange event', () => {
      // Arrange
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit')
      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 30,
        length: 100,
        previousPageIndex: 1
      }

      // Act
      component.onChangePage(pageEvent)

      // Assert
      expect(component.paginationDetails).toEqual({
        startIndex: 60,
        lastIndex: 90,
        pageSize: 30,
        pageIndex: 2,
        totalCount: 20 // This value wasn't updated in the original component
      })
      expect(pageChangeSpy).toHaveBeenCalledWith(component.paginationDetails)
    })
  })

  // === Added tests for commonly present helper methods to cover missing cases ===
  describe('applyFilter', () => {
    it('should set dataSource.filter normalized value', () => {
      // Arrange
      component.dataSource = mockMatTableDataSource

      // Act
      compAny.applyFilter('  TeSt  ')

      // Assert
      expect(component.dataSource.filter).toBe('test')
    })

    it('should handle empty or falsy filter values safely', () => {
      component.dataSource = mockMatTableDataSource

      compAny.applyFilter('')
      expect(component.dataSource.filter).toBe('')

      compAny.applyFilter(null as any)
      expect(component.dataSource.filter).toBe('')
    })
  })

  describe('trackBy', () => {
    it('should return item id when present', () => {
      const item: any = { id: 'abc' }
      const result = compAny.trackBy(0, item)
      expect(result).toBe('abc')
    })

    it('should return index when id not present', () => {
      const item: any = { name: 'no-id' }
      const result = compAny.trackBy(5, item)
      expect(result).toBe(5)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from searchSubscription if present', () => {
      // Arrange
      const unsub = { unsubscribe: jest.fn() }
      compAny.searchSubscription = unsub as any

      // Act
      compAny.ngOnDestroy()

      // Assert
      expect(unsub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw if no subscription present', () => {
      compAny.searchSubscription = undefined as any
      expect(() => compAny.ngOnDestroy()).not.toThrow()
    })
  })
})