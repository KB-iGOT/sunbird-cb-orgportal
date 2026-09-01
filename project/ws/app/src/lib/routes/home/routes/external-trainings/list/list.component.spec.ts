import { ListComponent } from './list.component'
import { of, throwError } from 'rxjs'

describe('ListComponent', () => {
  let component: ListComponent
  let mockRouter: any
  let mockActiveRoute: any
  let mockExternalTrainingsSvc: any
  let mockLoaderService: any
  let mockDatePipe: any

  const makeResponse = (items: any[] = [], count?: number) => ({
    result: {
      Event: items,
      count: count !== undefined ? count : items.length,
    },
  })

  beforeEach(() => {
    jest.useFakeTimers()

    mockRouter = { navigate: jest.fn() }

    mockActiveRoute = {
      snapshot: {
        data: {
          configService: {
            userProfile: { rootOrgId: 'org-001' },
          },
        },
      },
    }

    mockExternalTrainingsSvc = {
      getApprovalsList: jest.fn().mockReturnValue(of(makeResponse())),
    }

    mockLoaderService = {
      changeLoaderState: jest.fn(),
    }

    mockDatePipe = {
      transform: jest.fn().mockReturnValue('Jan 01, 2024'),
    }

    component = new ListComponent(
      mockRouter,
      mockActiveRoute,
      mockExternalTrainingsSvc,
      mockLoaderService,
      mockDatePipe,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default pageIndex to 0', () => {
    expect(component.pageIndex).toBe(0)
  })

  it('should default limit to 20', () => {
    expect(component.limit).toBe(20)
  })

  it('should default searchQuery to empty string', () => {
    expect(component.searchQuery).toBe('')
  })

  it('should default totalCount to 0', () => {
    expect(component.totalCount).toBe(0)
  })

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['name', 'deliveryMode', 'categoryType', 'duration', 'createdOn', 'actions'])
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set configSvc from route data', () => {
      component.ngOnInit()
      expect(component.configSvc).toEqual({ userProfile: { rootOrgId: 'org-001' } })
    })

    it('should call getExternalTrainings', () => {
      const spy = jest.spyOn(component, 'getExternalTrainings')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── ngAfterViewInit ─────────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('should assign sort to dataSource', () => {
      const mockSort = {} as any
      component.sort = mockSort
      component.ngAfterViewInit()
      expect(component.dataSource.sort).toBe(mockSort)
    })
  })

  // ─── onSearch ────────────────────────────────────────────────────────────────

  describe('onSearch', () => {
    it('should trim searchQuery and reset pageIndex to 0', () => {
      component.searchQuery = '  angular  '
      component.pageIndex = 2
      component.onSearch()
      expect(component.searchQuery).toBe('angular')
      expect(component.pageIndex).toBe(0)
    })

    it('should call getExternalTrainings', () => {
      const spy = jest.spyOn(component, 'getExternalTrainings')
      component.onSearch()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── getExternalTrainings ─────────────────────────────────────────────────────

  describe('getExternalTrainings', () => {
    it('should call loaderService.changeLoaderState(true) at start', () => {
      component.getExternalTrainings()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
    })

    it('should build payload with correct structure', () => {
      component.configSvc = { userProfile: { rootOrgId: 'org-001' } }
      component.searchQuery = 'training'
      component.pageIndex = 1
      component.limit = 10
      component.getExternalTrainings()
      const payload = mockExternalTrainingsSvc.getApprovalsList.mock.calls[0][0]
      expect(payload.request.query).toBe('training')
      expect(payload.request.limit).toBe(10)
      expect(payload.request.offset).toBe(10)
      expect(payload.request.filters.createdFor).toBe('org-001')
    })

    it('should populate externalTrainingsData on success', () => {
      const items = [
        { name: 'T1', duration: 3600, eventType: 'Online', createdOn: '2024-01-01' },
      ]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items, 1)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData.length).toBe(1)
      expect(component.totalCount).toBe(1)
    })

    it('should map deliveryMode via deliveryModeList for known eventType', () => {
      const items = [{ name: 'T1', duration: 0, eventType: 'OnlineAndOffline', createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].eventType).toBe('Hybrid')
    })

    it('should use eventType as-is when not in deliveryModeList', () => {
      const items = [{ name: 'T1', duration: 0, eventType: 'Unknown', createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].eventType).toBe('Unknown')
    })

    it('should format durationFormatted as "1 Hour" for 3600s', () => {
      const items = [{ name: 'T1', duration: 3600, eventType: 'Online', createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].durationFormatted).toBe('1 Hour')
    })

    it('should format durationFormatted as "2 Hours" for 7200s', () => {
      const items = [{ name: 'T1', duration: 7200, eventType: 'Online', createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].durationFormatted).toBe('2 Hours')
    })

    it('should set durationFormatted to empty string when duration is 0', () => {
      const items = [{ name: 'T1', duration: 0, eventType: 'Online', createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].durationFormatted).toBe('')
    })

    it('should set createdOnFormatted via datePipe when createdOn is present', () => {
      const items = [{ name: 'T1', duration: 0, eventType: 'Online', createdOn: '2024-01-01' }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].createdOnFormatted).toBe('Jan 01, 2024')
    })

    it('should set createdOnFormatted to empty string when createdOn is absent', () => {
      const items = [{ name: 'T1', duration: 0, eventType: 'Online', createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].createdOnFormatted).toBe('')
    })

    it('should set createdOnSort to 0 when createdOn is null', () => {
      const items = [{ name: 'T1', duration: 0, eventType: 'Online', createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].createdOnSort).toBe(0)
    })

    it('should use items.length as count when count is absent from response', () => {
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(
        of({ result: { Event: [{ name: 'T1', duration: 0, eventType: 'Online', createdOn: null }] } })
      )
      component.getExternalTrainings()
      expect(component.totalCount).toBe(1)
    })

    it('should default eventType to empty string when item.eventType is falsy', () => {
      const items = [{ name: 'T1', duration: 0, eventType: null, createdOn: null }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].eventType).toBe('')
    })

    it('should call loaderService.changeLoaderState(false) on error', () => {
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(throwError(() => new Error('fail')))
      component.getExternalTrainings()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should handle empty Event array gracefully', () => {
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of({ result: {} }))
      component.getExternalTrainings()
      expect(component.externalTrainingsData).toEqual([])
      expect(component.totalCount).toBe(0)
    })

    it('should handle null/undefined datePipe.transform by defaulting to empty string', () => {
      mockDatePipe.transform.mockReturnValue(null)
      const items = [{ name: 'T1', duration: 0, eventType: 'Online', createdOn: '2024-01-01' }]
      mockExternalTrainingsSvc.getApprovalsList.mockReturnValue(of(makeResponse(items)))
      component.getExternalTrainings()
      expect(component.externalTrainingsData[0].createdOnFormatted).toBe('')
    })
  })

  // ─── convertDataForTable ──────────────────────────────────────────────────────

  describe('convertDataForTable', () => {
    it('should rebuild dataSource from externalTrainingsData', () => {
      component.externalTrainingsData = [{ name: 'T1' }, { name: 'T2' }]
      component.convertDataForTable()
      expect(component.dataSource.data.length).toBe(2)
    })

    it('should call loaderService.changeLoaderState(false)', () => {
      component.externalTrainingsData = []
      component.convertDataForTable()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should set up sorting after timeout and configure sortingDataAccessor', () => {
      component.externalTrainingsData = []
      // Don't assign sort — let the timeout run without throwing
      component.sort = undefined as any
      component.convertDataForTable()
      // sortingDataAccessor is set inside the timeout
      jest.runAllTimers()
      // accessor is now assigned — verify it exists
      expect(typeof component.dataSource.sortingDataAccessor).toBe('function')
    })

    it('should apply sorting data accessor for createdOn', () => {
      component.externalTrainingsData = []
      component.convertDataForTable()
      jest.runAllTimers()
      const item = { createdOnSort: 12345 }
      expect(component.dataSource.sortingDataAccessor(item, 'createdOn')).toBe(12345)
    })

    it('should apply sorting data accessor for name', () => {
      component.externalTrainingsData = []
      component.convertDataForTable()
      jest.runAllTimers()
      const item = { name: 'Alpha' }
      expect(component.dataSource.sortingDataAccessor(item, 'name')).toBe('alpha')
    })

    it('should apply sorting data accessor for eventType', () => {
      component.externalTrainingsData = []
      component.convertDataForTable()
      jest.runAllTimers()
      const item = { eventType: 'Online' }
      expect(component.dataSource.sortingDataAccessor(item, 'eventType')).toBe('online')
    })

    it('should apply sorting data accessor for durationFormatted', () => {
      component.externalTrainingsData = []
      component.convertDataForTable()
      jest.runAllTimers()
      const item = { duration: 3600 }
      expect(component.dataSource.sortingDataAccessor(item, 'durationFormatted')).toBe(3600)
    })

    it('should apply sorting data accessor default case', () => {
      component.externalTrainingsData = []
      component.convertDataForTable()
      jest.runAllTimers()
      const item = { categoryType: 'Mandatory' }
      expect(component.dataSource.sortingDataAccessor(item, 'categoryType')).toBe('Mandatory')
    })

    it('should return empty string for default case when property is absent', () => {
      component.externalTrainingsData = []
      component.convertDataForTable()
      jest.runAllTimers()
      expect(component.dataSource.sortingDataAccessor({}, 'anyProp')).toBe('')
    })
  })

  // ─── prepareActions ───────────────────────────────────────────────────────────

  describe('prepareActions', () => {
    it('should populate currentRowActions with viewDetails and createBatch', () => {
      component.prepareActions()
      expect(component.currentRowActions.length).toBe(2)
      expect(component.currentRowActions[0].key).toBe('viewDetails')
      expect(component.currentRowActions[1].key).toBe('createBatch')
    })
  })

  // ─── menuSelected ─────────────────────────────────────────────────────────────

  describe('menuSelected', () => {
    it('should navigate to details page for viewDetails action', () => {
      component.menuSelected({ identifier: 'train-001' }, 'viewDetails')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['app', 'home', 'external-trainings', 'train-001', 'details']
      )
    })

    it('should navigate to batches page for createBatch action', () => {
      component.menuSelected({ identifier: 'train-001' }, 'createBatch')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['app', 'home', 'external-trainings', 'train-001', 'batches']
      )
    })

    it('should not navigate for unknown action key', () => {
      component.menuSelected({ identifier: 'train-001' }, 'unknown')
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should not navigate when row has no identifier', () => {
      component.menuSelected({}, 'viewDetails')
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should not navigate when row is null', () => {
      component.menuSelected(null, 'viewDetails')
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  // ─── onPaginateChange ─────────────────────────────────────────────────────────

  describe('onPaginateChange', () => {
    it('should update pageIndex and limit from pageData', () => {
      component.onPaginateChange({ pageIndex: 2, pageSize: 10 })
      expect(component.pageIndex).toBe(2)
      expect(component.limit).toBe(10)
    })

    it('should default pageIndex to 0 when pageData is null', () => {
      component.onPaginateChange(null)
      expect(component.pageIndex).toBe(0)
      expect(component.limit).toBe(20)
    })

    it('should call getExternalTrainings after pagination change', () => {
      const spy = jest.spyOn(component, 'getExternalTrainings')
      component.onPaginateChange({ pageIndex: 1, pageSize: 5 })
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── onSortChange ─────────────────────────────────────────────────────────────

  describe('onSortChange', () => {
    it('should not throw', () => {
      expect(() => component.onSortChange({ active: 'name', direction: 'asc' })).not.toThrow()
    })
  })

  // ─── trackByActionKey ─────────────────────────────────────────────────────────

  describe('trackByActionKey', () => {
    it('should return the action key', () => {
      expect(component.trackByActionKey(0, { key: 'viewDetails' })).toBe('viewDetails')
    })
  })

  // ─── createNewTraining ────────────────────────────────────────────────────────

  describe('createNewTraining', () => {
    it('should navigate to new training page', () => {
      component.createNewTraining()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'home', 'external-trainings', 'new'])
    })
  })
})
