import { SimpleChange, SimpleChanges } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { PageEvent } from '@angular/material/paginator'
import { Subject } from 'rxjs'
import { comprehensiveAssessmentList } from '../../models/comprehensive-assessment.model'
import { AssessmentsTableComponent } from './assessments-table.component'

describe('AssessmentsTableComponent', () => {
  let component: AssessmentsTableComponent

  const columns: comprehensiveAssessmentList.columnData[] = [
    { displayName: 'Assessment Name', key: 'name', cellType: 'textImage', imageKey: 'appIcon' },
    { displayName: 'Created By', key: 'creator', cellType: 'text' },
    { displayName: 'Published On', key: 'lastPublishedOn', cellType: 'date' },
  ]

  const tableData: comprehensiveAssessmentList.tableData = {
    columns,
    showSearchBox: true,
    showPagination: true,
    noDataMessage: 'There are no live assessments.',
  }

  const menuItems: comprehensiveAssessmentList.menuItems[] = [
    { btnText: 'View', action: 'view', icon: 'visibility' },
    { btnText: 'Edit', action: 'edit', icon: 'edit' },
    { btnText: 'Delete', action: 'delete', icon: 'delete_outline' },
  ]

  /** ngOnChanges is only handed the inputs that actually changed. */
  const changes = (...keys: string[]): SimpleChanges =>
    keys.reduce((acc: SimpleChanges, key: string) => {
      acc[key] = new SimpleChange(undefined, 'set', true)
      return acc
    },          {} as SimpleChanges)

  /** MatTableDataSource listens to these two the moment a sort is attached. */
  const fakeSort = () => ({
    sortChange: new Subject<any>(),
    initialized: new Subject<any>(),
    active: '',
    direction: '',
  } as unknown as MatSort)

  beforeEach(() => {
    component = new AssessmentsTableComponent()
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should start with the defaults a caller does not have to describe', () => {
    expect(component.showSearchBox).toBe(true)
    expect(component.showPagination).toBe(true)
    expect(component.noDataMessage).toBe('No data found')
    expect(component.pageSizeOptions).toEqual([20, 50, 100])
    expect(component.paginationDetails.pageSize).toBe(comprehensiveAssessmentList.DEFAULT_PAGE_SIZE)
  })

  describe('the search box', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.ngOnInit()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should raise the typed text once the typing settles', () => {
      const searched = jest.spyOn(component.searchKey, 'emit')

      component.searchControl.setValue('apar')
      expect(searched).not.toHaveBeenCalled()

      jest.advanceTimersByTime(500)

      expect(searched).toHaveBeenCalledWith('apar')
    })

    it('should raise an empty search when the field is cleared', () => {
      const searched = jest.spyOn(component.searchKey, 'emit')

      component.searchControl.setValue(null)
      jest.advanceTimersByTime(500)

      expect(searched).toHaveBeenCalledWith('')
    })
  })

  describe('building the columns', () => {
    it('should read the table settings off the data it is handed', () => {
      component.tableData = tableData

      component.ngOnChanges(changes('tableData'))

      expect(component.showSearchBox).toBe(true)
      expect(component.showPagination).toBe(true)
      expect(component.noDataMessage).toBe('There are no live assessments.')
    })

    it('should fall back to its own settings for a table that describes none', () => {
      component.tableData = { columns } as comprehensiveAssessmentList.tableData

      component.ngOnChanges(changes('tableData'))

      expect(component.showSearchBox).toBe(true)
      expect(component.showPagination).toBe(true)
      expect(component.noDataMessage).toBe('No data found')
    })

    it('should append the actions column the caller never describes', () => {
      component.tableData = tableData
      component.menuItems = menuItems

      component.ngOnChanges(changes('tableData'))

      expect(component.columnsList).toEqual(['name', 'creator', 'lastPublishedOn', 'menu'])
      expect(component.tableColumns[3]).toEqual({ displayName: 'Actions', key: 'menu', cellType: 'menu' })
    })

    it('should leave the actions column off a table with no actions', () => {
      component.tableData = tableData

      component.ngOnChanges(changes('tableData'))

      expect(component.columnsList).toEqual(['name', 'creator', 'lastPublishedOn'])
    })

    it('should not alter the columns the caller handed in', () => {
      component.tableData = tableData
      component.menuItems = menuItems

      component.ngOnChanges(changes('tableData'))

      expect(tableData.columns.length).toBe(3)
    })

    it('should rebuild the columns when only the actions change', () => {
      component.tableData = tableData
      component.ngOnChanges(changes('tableData'))
      component.menuItems = menuItems

      component.ngOnChanges(changes('menuItems'))

      expect(component.columnsList).toContain('menu')
    })

    it('should do nothing until it has a table to describe', () => {
      component.menuItems = menuItems

      component.ngOnChanges(changes('menuItems'))

      expect(component.columnsList).toEqual([])
    })
  })

  describe('the rows', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should put the rows it is handed on the data source', () => {
      component.data = [{ name: 'APAR assessment' }]

      component.ngOnChanges(changes('data'))

      expect(component.dataSource.data).toEqual([{ name: 'APAR assessment' }])
    })

    it('should empty the table when the rows are taken away', () => {
      component.data = null as any

      component.ngOnChanges(changes('data'))

      expect(component.dataSource.data).toEqual([])
    })

    /** MatSort only exists once the table has rendered, a tick after the rows land. */
    it('should skip the sort while the table has not rendered yet', () => {
      component.data = [{ name: 'APAR assessment' }]

      component.ngOnChanges(changes('data'))
      jest.runAllTimers()

      expect(component.dataSource.sort).toBeFalsy()
      expect(component.dataSource.sortingDataAccessor).toBeDefined()
    })

    it('should attach the sort once the table has rendered', () => {
      component.sort = fakeSort()
      component.data = [{ name: 'APAR assessment' }]

      component.ngOnChanges(changes('data'))
      jest.runAllTimers()

      expect(component.dataSource.sort).toBe(component.sort)
    })
  })

  describe('sorting', () => {
    const sortOn = (row: any, key: string) => {
      component.sort = fakeSort()
      component.tableData = tableData
      component.data = [row]
      component.ngOnChanges(changes('tableData', 'data'))
      jest.runAllTimers()
      return (component.dataSource.sortingDataAccessor as any)(row, key)
    }

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should sort text without regard to case', () => {
      expect(sortOn({ creator: 'Krisp Hoegerh' }, 'creator')).toBe('krisp hoegerh')
    })

    /** The cell shows `09 Sep, 2026`, sorting it as text would order it alphabetically. */
    it('should sort a date column on the instant behind the displayed value', () => {
      expect(sortOn({ lastPublishedOn: '2026-09-09T00:00:00.000Z' }, 'lastPublishedOn'))
        .toBe(Date.parse('2026-09-09T00:00:00.000Z'))
    })

    it('should sort an unreadable date first rather than throwing', () => {
      expect(sortOn({ lastPublishedOn: 'not a date' }, 'lastPublishedOn')).toBe(0)
    })

    it('should leave a number as it is', () => {
      expect(sortOn({ creator: 42 }, 'creator')).toBe(42)
    })

    it('should sort a row that is missing the column last', () => {
      expect(sortOn({ name: 'APAR' }, 'creator')).toBe('')
    })
  })

  /**
   * The two tabs keep the image under different keys - a published assessment's appIcon is
   * copied somewhere unreadable - so a column names the key it prefers and the one to fall
   * back to, and the row is drawn from whichever actually answers.
   */
  describe('the row thumbnail', () => {
    /** The live column: poster first, icon behind it. */
    const liveColumn: comprehensiveAssessmentList.columnData = {
      displayName: 'Assessment Name', key: 'name', cellType: 'textImage',
      imageKey: 'posterImage', fallbackImageKey: 'appIcon',
    }
    /** The draft column, the other way round. */
    const draftColumn: comprehensiveAssessmentList.columnData = {
      displayName: 'Assessment Name', key: 'name', cellType: 'textImage',
      imageKey: 'appIcon', fallbackImageKey: 'posterImage',
    }

    it('should draw a live row from the poster it carries', () => {
      const row = { posterImage: 'poster.png', appIcon: 'icon.png' }

      expect(component.thumbnailUrl(row, liveColumn)).toBe('poster.png')
    })

    it('should draw a draft row from its icon', () => {
      const row = { posterImage: 'poster.png', appIcon: 'icon.png' }

      expect(component.thumbnailUrl(row, draftColumn)).toBe('icon.png')
    })

    /** An assessment saved before the poster was written carries only the icon. */
    it('should fall back to the other key when the preferred one is empty', () => {
      expect(component.thumbnailUrl({ appIcon: 'icon.png' }, liveColumn)).toBe('icon.png')
      expect(component.thumbnailUrl({ posterImage: 'poster.png' }, draftColumn)).toBe('poster.png')
    })

    it('should show the placeholder for a row carrying neither', () => {
      expect(component.thumbnailUrl({}, liveColumn)).toBe('')
      expect(component.thumbnailUrl({ posterImage: '', appIcon: '' }, liveColumn)).toBe('')
    })

    /** A url that 404s renders as a broken image, so the row moves on to its other key. */
    it('should move on to the fallback once the preferred image fails', () => {
      const row = { posterImage: 'gone.png', appIcon: 'icon.png' }

      component.onThumbnailError('gone.png')

      expect(component.thumbnailUrl(row, liveColumn)).toBe('icon.png')
    })

    it('should show the placeholder once both keys have failed', () => {
      const row = { posterImage: 'gone.png', appIcon: 'also-gone.png' }

      component.onThumbnailError('gone.png')
      component.onThumbnailError('also-gone.png')

      expect(component.thumbnailUrl(row, liveColumn)).toBe('')
    })

    it('should leave the rows that load alone', () => {
      component.onThumbnailError('gone.png')

      expect(component.thumbnailUrl({ posterImage: 'poster.png' }, liveColumn)).toBe('poster.png')
    })

    it('should give a thumbnail another chance when the rows are reloaded', () => {
      const row = { posterImage: 'gone.png' }
      component.onThumbnailError('gone.png')

      component.data = [row]
      component.ngOnChanges(changes('data'))

      expect(component.thumbnailUrl(row, liveColumn)).toBe('gone.png')
    })

    it('should ignore an error raised with no url', () => {
      component.onThumbnailError('')

      expect(component.thumbnailUrl({ posterImage: 'poster.png' }, liveColumn)).toBe('poster.png')
    })
  })

  /**
   * The tooltip repeats the cell, so it is only worth showing where the cell could not show
   * everything itself - a value that fits says the same thing twice.
   */
  describe('the cell tooltip', () => {
    /** Poses a cell by the four measurements the check reads off it. */
    const cell = (box: Partial<Record<'scrollHeight' | 'clientHeight' | 'scrollWidth' | 'clientWidth', number>>) =>
      ({ scrollHeight: 0, clientHeight: 0, scrollWidth: 0, clientWidth: 0, ...box }) as HTMLElement

    it('should stay off for a cell showing its text in full', () => {
      const shown = cell({ scrollHeight: 18, clientHeight: 18, scrollWidth: 120, clientWidth: 120 })

      expect(component.isTextTruncated(shown)).toBe(false)
    })

    /** The name and plan columns clamp to two lines, so they run out of room downwards. */
    it('should come on for a name clamped to two lines', () => {
      expect(component.isTextTruncated(cell({ scrollHeight: 54, clientHeight: 36 }))).toBe(true)
    })

    it('should come on for a value clipped sideways', () => {
      expect(component.isTextTruncated(cell({ scrollWidth: 180, clientWidth: 96 }))).toBe(true)
    })

    /** Sub-pixel layout puts these a fraction apart on a zoomed page, which is not a clip. */
    it('should ignore a sub-pixel difference', () => {
      expect(component.isTextTruncated(cell({ scrollHeight: 37, clientHeight: 36 }))).toBe(false)
      expect(component.isTextTruncated(cell({ scrollWidth: 97, clientWidth: 96 }))).toBe(false)
    })

    it('should stay off before the cell exists', () => {
      expect(component.isTextTruncated(undefined as unknown as HTMLElement)).toBe(false)
    })
  })

  describe('getButtonsToShow', () => {
    beforeEach(() => {
      component.menuItems = menuItems
    })

    it('should offer every action to a row that hides none', () => {
      expect(component.getButtonsToShow({})).toEqual(menuItems)
      expect(component.getButtonsToShow({ buttonsToHide: [] })).toEqual(menuItems)
    })

    it('should drop the actions the row asks to hide', () => {
      const shown = component.getButtonsToShow({ buttonsToHide: ['delete', 'edit'] })

      expect(shown.map((item: comprehensiveAssessmentList.menuItems) => item.action)).toEqual(['view'])
    })
  })

  describe('raising what the user did', () => {
    it('should raise the action along with the row it was used on', () => {
      const clicked = jest.spyOn(component.actionsClick, 'emit')
      const row = { identifier: 'do_123' }

      component.buttonClick('edit', row)

      expect(clicked).toHaveBeenCalledWith({ action: 'edit', rows: row })
    })

    it('should raise the window of rows the paginator moved to', () => {
      const paged = jest.spyOn(component.pageChange, 'emit')
      component.paginationDetails = { ...component.paginationDetails, totalCount: 57 }

      component.onChangePage({ pageIndex: 2, pageSize: 20, length: 57 } as PageEvent)

      expect(paged).toHaveBeenCalledWith({
        startIndex: 40,
        lastIndex: 60,
        pageSize: 20,
        pageIndex: 2,
        totalCount: 57,
      })
      expect(component.paginationDetails.pageIndex).toBe(2)
    })

    it('should keep the total count the search reported while paging', () => {
      component.paginationDetails = { ...component.paginationDetails, totalCount: 57 }

      component.onChangePage({ pageIndex: 0, pageSize: 50, length: 57 } as PageEvent)

      expect(component.paginationDetails.totalCount).toBe(57)
    })
  })
})
