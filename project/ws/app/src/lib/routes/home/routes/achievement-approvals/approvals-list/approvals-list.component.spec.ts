import { ApprovalsListComponent } from './approvals-list.component'
import { of, throwError } from 'rxjs'

// ─── helpers ──────────────────────────────────────────────────────────────────

const makeItem = (userId = 'u1', id = 'id1') => ({ userId, id })

const makeSearchResult = (data: any[] = [], totalCount = 0, userDetails: any = {}, facets: any = null) => ({
  result: {
    search_results: {
      data,
      totalCount,
      userDetails,
      ...(facets ? { facets } : {}),
    },
  },
})

// ─── suite ────────────────────────────────────────────────────────────────────

describe('ApprovalsListComponent', () => {
  let component: ApprovalsListComponent
  let mockDialog: any
  let mockDialogRef: any
  let mockAchievementsService: any
  let mockMatSnackBar: any
  let mockLoaderService: any

  beforeEach(() => {
    mockDialogRef = { afterClosed: jest.fn().mockReturnValue(of(null)) }
    mockDialog = { open: jest.fn().mockReturnValue(mockDialogRef) }
    mockAchievementsService = {
      getApprovalsList: jest.fn().mockReturnValue(of(makeSearchResult())),
      updateApprovalStatus: jest.fn().mockReturnValue(of({ responseCode: 'OK' })),
    }
    mockMatSnackBar = { open: jest.fn() }
    mockLoaderService = { changeLoad: { next: jest.fn() } }

    component = new ApprovalsListComponent(
      mockDialog,
      mockAchievementsService,
      mockMatSnackBar,
      mockLoaderService,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  // ─── create ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have correct initial properties', () => {
    expect(component.selectedTabIndex).toBe(0)
    expect(component.filterStatus).toBe('ALL')
    expect(component.pageSize).toBe(10)
    expect(component.currentPage).toBe(0)
    expect(component.sideNavBarOpened).toBe(false)
    expect(component.selectedAchievement).toBeNull()
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call setTabData(0) which triggers loadData', () => {
      component.ngOnInit()
      expect(mockAchievementsService.getApprovalsList).toHaveBeenCalled()
    })
  })

  // ─── findFilters ──────────────────────────────────────────────────────

  describe('findFilters', () => {
    it('should return ["PENDING"] when on tab 0', () => {
      component.selectedTabIndex = 0
      expect(component.findFilters()).toEqual(['PENDING'])
    })

    it('should return ["APPROVED", "REJECTED"] when tab 1 and status ALL', () => {
      component.selectedTabIndex = 1
      component.filterStatus = 'ALL'
      expect(component.findFilters()).toEqual(['APPROVED', 'REJECTED'])
    })

    it('should return ["APPROVED"] when tab 1 and status APPROVED', () => {
      component.selectedTabIndex = 1
      component.filterStatus = 'APPROVED'
      expect(component.findFilters()).toEqual(['APPROVED'])
    })

    it('should return ["REJECTED"] when tab 1 and status REJECTED', () => {
      component.selectedTabIndex = 1
      component.filterStatus = 'REJECTED'
      expect(component.findFilters()).toEqual(['REJECTED'])
    })
  })

  // ─── loadData ─────────────────────────────────────────────────────────

  describe('loadData', () => {
    it('should set dataSource.data and totalResults on success', () => {
      const items = [makeItem()]
      mockAchievementsService.getApprovalsList.mockReturnValue(
        of(makeSearchResult(items, 5)),
      )
      // call loadData directly to avoid setTabData overriding totalResults
      component.loadData()
      expect(component.dataSource.data).toHaveLength(1)
      expect(component.totalResults).toBe(5)
    })

    it('should set userDetails from response', () => {
      mockAchievementsService.getApprovalsList.mockReturnValue(
        of(makeSearchResult([], 0, { u1: 'Alice' })),
      )
      component.loadData()
      expect(component.userDetails).toEqual({ u1: 'Alice' })
    })

    it('should populate stats from facets', () => {
      const facets = {
        status: [
          { value: 'PENDING', count: 3 },
          { value: 'APPROVED', count: 7 },
          { value: 'REJECTED', count: 2 },
        ],
      }
      mockAchievementsService.getApprovalsList.mockReturnValue(
        of(makeSearchResult([], 0, {}, facets)),
      )
      component.loadData()
      expect(component.stats.totalPending).toBe(3)
      expect(component.stats.totalApproved).toBe(7)
      expect(component.stats.totalRejected).toBe(2)
    })

    it('should add avatar and avatarColor to each item (userDetails in response)', () => {
      const items = [makeItem('u1')]
      // userDetails must come from the response so it is set before avatar computation
      mockAchievementsService.getApprovalsList.mockReturnValue(
        of(makeSearchResult(items, 1, { u1: 'Alice Bob' })),
      )
      component.loadData()
      const row = component.dataSource.data[0]
      expect(row.avatar).toBeDefined()
      expect(row.avatar.initials).toBe('AB')
      expect(row.avatarColor).toBeDefined()
    })

    it('should not overwrite existing avatarColor', () => {
      const items = [{ userId: 'u1', id: 'id1', avatarColor: '#fixed' }]
      mockAchievementsService.getApprovalsList.mockReturnValue(
        of(makeSearchResult(items, 1)),
      )
      component.loadData()
      expect(component.dataSource.data[0].avatarColor).toBe('#fixed')
    })

    it('should emit loader true then false on success', () => {
      component.ngOnInit()
      expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(true)
      expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(false)
    })

    it('should reset dataSource and emit loader false on error', () => {
      mockAchievementsService.getApprovalsList.mockReturnValue(
        throwError(() => new Error('fail')),
      )
      component.loadData()
      expect(component.dataSource.data).toEqual([])
      expect(component.totalResults).toBe(0)
      expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(false)
    })

    it('should handle response with no search_results gracefully', () => {
      mockAchievementsService.getApprovalsList.mockReturnValue(of({ result: {} }))
      expect(() => component.loadData()).not.toThrow()
    })

    it('should set totalResults to 0 when totalCount is 0', () => {
      const items = [makeItem(), makeItem('u2', 'id2')]
      mockAchievementsService.getApprovalsList.mockReturnValue(
        of(makeSearchResult(items, 0)),
      )
      component.loadData()
      expect(component.totalResults).toBe(0)
    })
  })

  // ─── getUserName ──────────────────────────────────────────────────────

  describe('getUserName', () => {
    it('should return name when userId is in userDetails', () => {
      component.userDetails = { u1: 'Alice' }
      expect(component.getUserName('u1')).toBe('Alice')
    })

    it('should return "--" when userId is not in userDetails', () => {
      component.userDetails = {}
      expect(component.getUserName('u99')).toBe('--')
    })
  })

  // ─── getInitials ──────────────────────────────────────────────────────

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      component.userDetails = { u1: 'Alice Bob' }
      expect(component.getInitials('u1')).toBe('AB')
    })

    it('should return single initial for single-word name', () => {
      component.userDetails = { u1: 'Alice' }
      expect(component.getInitials('u1')).toBe('A')
    })

    it('should return empty string when getUserName returns "--"', () => {
      component.userDetails = {}
      expect(component.getInitials('u99')).toBe('')
    })

    it('should use first two parts only for long names', () => {
      component.userDetails = { u1: 'Alice Bob Charlie' }
      expect(component.getInitials('u1')).toBe('AB')
    })
  })

  // ─── onTabChange ──────────────────────────────────────────────────────

  describe('onTabChange', () => {
    it('should update selectedTabIndex and reset page then load data', () => {
      component.currentPage = 3
      component.onTabChange(1)
      expect(component.selectedTabIndex).toBe(1)
      expect(component.currentPage).toBe(0)
      expect(mockAchievementsService.getApprovalsList).toHaveBeenCalled()
    })

    it('should set pendingColumns for tab 0', () => {
      component.onTabChange(0)
      expect(component.displayedColumns).toEqual(component.pendingColumns)
    })

    it('should set reviewedColumns and clear selection for tab 1', () => {
      component.selection.select(makeItem())
      component.onTabChange(1)
      expect(component.displayedColumns).toEqual(component.reviewedColumns)
      expect(component.selection.selected.length).toBe(0)
      expect(component.filterStatus).toBe('ALL')
    })
  })

  // ─── isAllSelected / toggleAllRows ────────────────────────────────────

  describe('isAllSelected', () => {
    it('should return true when all rows are selected', () => {
      const items = [makeItem(), makeItem('u2', 'id2')]
      component.dataSource.data = items
      component.selection.select(...items)
      expect(component.isAllSelected()).toBe(true)
    })

    it('should return false when not all rows are selected', () => {
      component.dataSource.data = [makeItem(), makeItem('u2', 'id2')]
      component.selection.select(makeItem())
      expect(component.isAllSelected()).toBe(false)
    })
  })

  describe('toggleAllRows', () => {
    it('should clear selection when all are selected', () => {
      const items = [makeItem()]
      component.dataSource.data = items
      component.selection.select(...items)
      component.toggleAllRows()
      expect(component.selection.selected.length).toBe(0)
    })

    it('should select all rows when not all are selected', () => {
      const items = [makeItem(), makeItem('u2', 'id2')]
      component.dataSource.data = items
      component.toggleAllRows()
      expect(component.selection.selected.length).toBe(2)
    })
  })

  // ─── approve / reject ─────────────────────────────────────────────────

  describe('approve', () => {
    it('should call action("approve", element) when element is provided', () => {
      const spy = jest.spyOn(component, 'action')
      component.approve(makeItem())
      expect(spy).toHaveBeenCalledWith('approve', expect.any(Object))
    })

    it('should not call action when element is null', () => {
      const spy = jest.spyOn(component, 'action')
      component.approve(null)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('reject', () => {
    it('should call action("reject", element) when element is provided', () => {
      const spy = jest.spyOn(component, 'action')
      component.reject(makeItem())
      expect(spy).toHaveBeenCalledWith('reject', expect.any(Object))
    })

    it('should not call action when element is null', () => {
      const spy = jest.spyOn(component, 'action')
      component.reject(null)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── action ───────────────────────────────────────────────────────────

  describe('action', () => {
    describe('reject', () => {
      it('should open RejectReasonDialogComponent', () => {
        component.action('reject', makeItem())
        expect(mockDialog.open).toHaveBeenCalled()
      })

      it('should call triggerAPICall with REJECTED when reason is returned', () => {
        mockDialogRef.afterClosed.mockReturnValue(of('Bad data'))
        const spy = jest.spyOn(component, 'triggerAPICall')
        component.action('reject', makeItem())
        expect(spy).toHaveBeenCalledWith(expect.any(Object), 'Bad data', 'REJECTED')
      })

      it('should NOT call triggerAPICall when reason is falsy', () => {
        mockDialogRef.afterClosed.mockReturnValue(of(undefined))
        const spy = jest.spyOn(component, 'triggerAPICall')
        component.action('reject', makeItem())
        expect(spy).not.toHaveBeenCalled()
      })
    })

    describe('approve', () => {
      it('should open ConfirmationBoxComponent', () => {
        component.action('approve', makeItem())
        expect(mockDialog.open).toHaveBeenCalled()
      })

      it('should call triggerAPICall with APPROVED when confirmed', () => {
        mockDialogRef.afterClosed.mockReturnValue(of(true))
        const spy = jest.spyOn(component, 'triggerAPICall')
        component.action('approve', makeItem())
        expect(spy).toHaveBeenCalledWith(expect.any(Object), 'this is approved via API', 'APPROVED')
      })

      it('should NOT call triggerAPICall when cancelled', () => {
        mockDialogRef.afterClosed.mockReturnValue(of(false))
        const spy = jest.spyOn(component, 'triggerAPICall')
        component.action('approve', makeItem())
        expect(spy).not.toHaveBeenCalled()
      })
    })
  })

  // ─── triggerAPICall ───────────────────────────────────────────────────

  // Helper: returns a mock observable that immediately calls the error handler.
  // This is needed because throwError + zone.js two-arg subscribe can silently
  // swallow the error handler invocation in this test environment.
  const errorObs = (errorObj: any) => ({
    subscribe: (_nextFn: any, errorFn: any) => {
      errorFn(errorObj)
      return { unsubscribe: jest.fn() }
    },
  })

  describe('triggerAPICall', () => {
    it('should show success snackbar and reload data after 500ms for APPROVED', () => {
      jest.useFakeTimers()
      const loadSpy = jest.spyOn(component, 'loadData')
      component.triggerAPICall(makeItem(), 'approved', 'APPROVED')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Achievement approved successfully')
      jest.advanceTimersByTime(500)
      expect(loadSpy).toHaveBeenCalled()
    })

    it('should show "rejected" in snackbar message for REJECTED status', () => {
      jest.useFakeTimers()
      component.triggerAPICall(makeItem(), 'bad data', 'REJECTED')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Achievement rejected successfully')
    })

    it('should show errMsg from error response when present', () => {
      mockAchievementsService.updateApprovalStatus.mockReturnValue(
        errorObs({ error: { params: { errMsg: 'Custom error msg' } } }),
      )
      component.triggerAPICall(makeItem(), 'r', 'REJECTED')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Custom error msg')
    })

    it('should show fallback snackbar message for REJECTED when no errMsg', () => {
      mockAchievementsService.updateApprovalStatus.mockReturnValue(
        errorObs({ error: { params: {} } }),
      )
      component.triggerAPICall(makeItem(), 'r', 'REJECTED')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Something went wrong while rejecting achievement',
      )
    })

    it('should show fallback snackbar message for APPROVED when no errMsg', () => {
      mockAchievementsService.updateApprovalStatus.mockReturnValue(
        errorObs({ error: { params: {} } }),
      )
      component.triggerAPICall(makeItem(), 'r', 'APPROVED')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Something went wrong while approving achievement',
      )
    })

    it('should not show success snackbar when responseCode is not OK', () => {
      mockAchievementsService.updateApprovalStatus.mockReturnValue(
        of({ responseCode: 'ERROR' }),
      )
      component.triggerAPICall(makeItem(), 'r', 'APPROVED')
      expect(mockMatSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ─── bulkApprove ──────────────────────────────────────────────────────

  describe('bulkApprove', () => {
    it('should open ConfirmationBoxComponent dialog', () => {
      component.bulkApprove()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should not throw when dialog is confirmed', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(true))
      expect(() => component.bulkApprove()).not.toThrow()
    })

    it('should not throw when dialog is dismissed', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(false))
      expect(() => component.bulkApprove()).not.toThrow()
    })
  })

  // ─── onFilterChange ───────────────────────────────────────────────────

  describe('onFilterChange', () => {
    it('should update filterStatus and reset page', () => {
      component.selectedTabIndex = 1
      component.currentPage = 3
      component.onFilterChange('APPROVED')
      expect(component.filterStatus).toBe('APPROVED')
      expect(component.currentPage).toBe(0)
    })

    it('should call loadData when on tab 1 with APPROVED filter', () => {
      component.selectedTabIndex = 1
      component.onFilterChange('APPROVED')
      expect(mockAchievementsService.getApprovalsList).toHaveBeenCalled()
    })

    it('should call loadData when on tab 1 with REJECTED filter', () => {
      component.selectedTabIndex = 1
      component.onFilterChange('REJECTED')
      expect(mockAchievementsService.getApprovalsList).toHaveBeenCalled()
    })

    it('should call loadData when on tab 1 with ALL filter', () => {
      component.selectedTabIndex = 1
      component.onFilterChange('ALL')
      expect(mockAchievementsService.getApprovalsList).toHaveBeenCalled()
    })

    it('should not call loadData when on tab 0', () => {
      component.selectedTabIndex = 0
      mockAchievementsService.getApprovalsList.mockClear()
      component.onFilterChange('APPROVED')
      expect(mockAchievementsService.getApprovalsList).not.toHaveBeenCalled()
    })

    it('should update paginator.pageIndex when paginator is set', () => {
      component.selectedTabIndex = 1
      component.paginator = { pageIndex: 5 } as any
      component.onFilterChange('ALL')
      expect(component.paginator.pageIndex).toBe(0)
    })
  })

  // ─── onPageChange ─────────────────────────────────────────────────────

  describe('onPageChange', () => {
    it('should update pageSize, currentPage and trigger loadData', () => {
      component.onPageChange({ pageSize: 25, pageIndex: 2, length: 100 } as any)
      expect(component.pageSize).toBe(25)
      expect(component.currentPage).toBe(2)
      expect(mockAchievementsService.getApprovalsList).toHaveBeenCalled()
    })
  })

  // ─── handleCloseSidenav ───────────────────────────────────────────────

  describe('handleCloseSidenav', () => {
    it('should close sidenav and clear selectedAchievement', () => {
      component.sideNavBarOpened = true
      component.selectedAchievement = makeItem()
      component.handleCloseSidenav()
      expect(component.sideNavBarOpened).toBe(false)
      expect(component.selectedAchievement).toBeNull()
    })
  })

  // ─── view ─────────────────────────────────────────────────────────────

  describe('view', () => {
    it('should open sidenav and set selectedAchievement', () => {
      const row = makeItem()
      component.view(row)
      expect(component.sideNavBarOpened).toBe(true)
      expect(component.selectedAchievement).toBe(row)
    })
  })

  // ─── getRandomColor ───────────────────────────────────────────────────

  describe('getRandomColor', () => {
    it('should return a color string from the predefined list', () => {
      const validColors = ['#EB7181', '#006400', '#000000', '#3670B2', '#4E9E87', '#7E4C8D']
      const color = component.getRandomColor()
      expect(validColors).toContain(color)
    })
  })
})

