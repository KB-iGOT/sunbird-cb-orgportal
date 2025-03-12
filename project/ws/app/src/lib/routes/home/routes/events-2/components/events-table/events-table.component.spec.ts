import { EventsTableComponent } from './events-table.component'
// import { of } from 'rxjs'
// import { MatSort } from '@angular/material/sort'
import { PageEvent } from '@angular/material/paginator'
import * as _ from 'lodash'

describe('EventsTableComponent', () => {
  let component: EventsTableComponent
  // let mockSort: MatSort

  beforeEach(() => {
    // mockSort = { sortChange: of(null) } as any // Mock MatSort

    component = new EventsTableComponent() // Instantiate the component directly

    // Mock input values
    component.tableData = {
      columns: [{
        key: 'name', displayName: 'Name',
        cellType: ''
      }],
      showSearchBox: true,
      noDataMessage: 'No data available',
      showPagination: true
    }
    component.menuItems = [{
      action: 'edit',
      btnText: ''
    }]
    component.data = []
    component.paginationDetails = {
      startIndex: 0,
      lastIndex: 20,
      pageSize: 20,
      pageIndex: 0,
      totalCount: 20
    }
  })

  it('should initialize correctly', () => {
    component.ngOnInit()
    expect(component.displayedColumns).toEqual([{ key: 'name', displayName: 'Name' }])
    expect(component.showSearchBox).toBe(true)
    expect(component.noDataMessage).toBe('No data available')
    expect(component.showPagination).toBe(true)
  })

  it('should handle changes in tableData and data correctly in ngOnChanges', () => {
    const changes = {
      tableData: {
        currentValue: {
          columns: [{ key: 'age', displayName: 'Age' }]
        },
        previousValue: null,
        firstChange: true,
        isFirstChange: jest.fn(() => true)
      },
      data: {
        currentValue: [{ name: 'New Item' }],
        previousValue: null,
        firstChange: true,
        isFirstChange: jest.fn(() => true)
      }
    }

    component.ngOnChanges(changes)

    expect(component.columnsList).toEqual(['age']) // After calling getFinalColumns
    expect(component.dataSource.data).toEqual([{ name: 'New Item' }])
  })

  it('should update columns when getFinalColumns is called', () => {
    component.menuItems = [{
      action: 'edit',
      btnText: ''
    }]
    component.getFinalColumns()
    expect(component.columnsList).toContain('menu')
    expect(component.tableColumns.length).toBe(2) // Columns + menu item
  })

  it('should filter buttons correctly with getButtonsToShow', () => {
    const rowData = { buttonsToHide: ['edit'] }
    const buttons = component.getButtonsToShow(rowData)
    expect(buttons.length).toBe(0) // Edit button should be filtered out
  })

  it('should emit actionClick when buttonClick is called', () => {
    const action = 'edit'
    const rows = [{ name: 'Test' }]
    const emitSpy = jest.spyOn(component.actionsClick, 'emit')
    component.buttonClick(action, rows)
    expect(emitSpy).toHaveBeenCalledWith({ action, rows })
  })

  it('should handle page change correctly', () => {
    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 20,
      length: 100
    }
    const emitSpy = jest.spyOn(component.pageChange, 'emit')
    component.onChangePage(pageEvent)
    expect(component.paginationDetails.startIndex).toBe(20)
    expect(component.paginationDetails.pageIndex).toBe(1)
    expect(emitSpy).toHaveBeenCalledWith(component.paginationDetails)
  })
})
