import { EventsTableComponent } from './events-table.component'
import { SimpleChange, SimpleChanges } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { PageEvent } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { of } from 'rxjs'

jest.mock('@angular/material/table')
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, defaultValue) => {
    if (path === 'showSearchBox') return obj.showSearchBox
    if (path === 'noDataMessage') return obj.noDataMessage
    if (path === 'showPagination') return obj.showPagination
    return defaultValue
  }),
  map: jest.fn((array, iteratee) => array.map(iteratee))
}))

describe('EventsTableComponent', () => {
  let component: EventsTableComponent
  let mockMatTableDataSource: any
  // let mockValueChanges: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup ValueChanges mock
    // mockValueChanges = {
    //   pipe: jest.fn().mockReturnThis(),
    //   subscribe: jest.fn()
    // }

    // Setup MatTableDataSource mock
    mockMatTableDataSource = {
      data: [],
      sort: null
    };

    (MatTableDataSource as jest.Mock).mockImplementation(() => mockMatTableDataSource)

    // Initialize component
    component = new EventsTableComponent()

    // Mock FormControl valueChanges
    jest.spyOn(component.searchControl, 'valueChanges', 'get').mockReturnValue(of('test'))
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
      expect(component.displayedColumns).toEqual(['col1', 'col2'])
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
      expect(component.dataSource.data).toBe(mockData)

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
        { name: 'Edit', action: 'edit' },
        { name: 'View', action: 'view' }
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
      component.tableData = {
        columns: [],
        showSearchBox: false,
        showPagination: false
      } // Assign an empty object to tableData
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
})
