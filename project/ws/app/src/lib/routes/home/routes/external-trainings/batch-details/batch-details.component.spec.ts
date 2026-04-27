import { BatchDetailsComponent } from './batch-details.component'
import { FileLogsComponent } from '../file-logs/file-logs.component'
import { of, throwError, Subject } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'

describe('BatchDetailsComponent', () => {
  let component: BatchDetailsComponent
  let mockRoute: any
  let mockLoaderService: any
  let mockExternalTrainingsSvc: any
  let mockRouter: any
  let queryParamsSubject: Subject<any>

  beforeEach(() => {
    queryParamsSubject = new Subject<any>()
    mockRoute = {
      snapshot: { params: { id: 'training1', batchId: 'batch1' } },
      queryParams: queryParamsSubject.asObservable(),
    }
    mockLoaderService = new LoaderService()
    jest.spyOn(mockLoaderService, 'changeLoaderState')
    mockExternalTrainingsSvc = {
      getExternalTrainingDetails: jest.fn(),
      getParticipantsList: jest.fn(),
      getFileLogs: jest.fn(),
    }
    mockRouter = { navigate: jest.fn() }

    component = new BatchDetailsComponent(
      mockRoute,
      mockLoaderService,
      mockExternalTrainingsSvc,
      mockRouter,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getRoutingDetails and subscribe to queryParams', () => {
      jest.spyOn(component as any, 'getRoutingDetails').mockImplementation(() => { })
      component.ngOnInit()
      queryParamsSubject.next({ tab: 'fileLogs' })
      expect((component as any).getRoutingDetails).toHaveBeenCalled()
      expect(component.selectedTabIndex).toBe(1)
    })

    it('should set selectedTabIndex to 0 for non-fileLogs tab', () => {
      jest.spyOn(component as any, 'getRoutingDetails').mockImplementation(() => { })
      component.ngOnInit()
      queryParamsSubject.next({ tab: 'learners' })
      expect(component.selectedTabIndex).toBe(0)
    })
  })

  // ─── onSearchChange ───────────────────────────────────────────────────────

  describe('onSearchChange', () => {
    beforeEach(() => {
      component.enrolledUsers = [
        { first_name: 'Alice', designation: 'Dev', department: 'Tech' },
        { first_name: 'Bob', designation: 'PM', department: 'Mgmt' },
      ]
      component.filteredUsers = [...component.enrolledUsers]
    })

    it('should filter by first_name', () => {
      component.searchTerm = 'alice'
      component.onSearchChange()
      expect(component.filteredUsers.length).toBe(1)
      expect(component.filteredUsers[0].first_name).toBe('Alice')
    })

    it('should filter by designation', () => {
      component.searchTerm = 'pm'
      component.onSearchChange()
      expect(component.filteredUsers.length).toBe(1)
    })

    it('should reset to all users when searchTerm is empty', () => {
      component.searchTerm = ''
      component.onSearchChange()
      expect(component.filteredUsers).toEqual(component.enrolledUsers)
    })
  })

  // ─── getRoutingDetails ────────────────────────────────────────────────────

  describe('getRoutingDetails', () => {
    it('should set trainingId and batchId and call getTrainingDetails', () => {
      jest.spyOn(component as any, 'getTrainingDetails').mockImplementation(() => { })
      component.getRoutingDetails()
      expect(component.trainingId).toBe('training1')
      expect(component.batchId).toBe('batch1')
      expect((component as any).getTrainingDetails).toHaveBeenCalledWith('training1')
    })

    it('should not call getTrainingDetails when trainingId absent', () => {
      mockRoute.snapshot.params = { batchId: 'batch1' }
      jest.spyOn(component as any, 'getTrainingDetails').mockImplementation(() => { })
      component.getRoutingDetails()
      expect((component as any).getTrainingDetails).not.toHaveBeenCalled()
    })
  })

  // ─── getTrainingDetails ───────────────────────────────────────────────────

  describe('getTrainingDetails', () => {
    const makeResponse = (batches: any[] = [{ batchId: 'batch1' }]) => ({
      result: {
        event: {
          name: 'Training',
          eventType: 'offline',
          description: 'Desc',
          duration: 3600,
          batches,
        }
      }
    })

    beforeEach(() => {
      mockExternalTrainingsSvc.getParticipantsList.mockReturnValue(
        of({ userlist: [{ first_name: 'Alice' }], totalCount: 1 })
      )
    })

    it('should set training, batches, currentBatch and call getUsers (integer hours)', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(of(makeResponse()))
      component.batchId = 'batch1'
      component.getTrainingDetails('training1')
      expect(component.training.title).toBe('Training')
      expect(component.currentBatch).toEqual({ batchId: 'batch1' })
      expect(component.training.learningHours).toBe('1 Hour')
    })

    it('should handle non-integer hours with toFixed', () => {
      const resp = { result: { event: { name: 'T', duration: 5400, batches: [] } } }
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(of(resp))
      component.getTrainingDetails('training1')
      expect(component.training.learningHours).toBe('1.50 Hours')
    })

    it('should handle empty batches', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(of(makeResponse([])))
      component.getTrainingDetails('training1')
      expect(component.batches).toEqual([])
    })

    it('should handle API error', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        throwError(() => new Error('err'))
      )
      component.getTrainingDetails('training1')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(component.isLoading).toBe(false)
    })
  })

  // ─── onTabChange ──────────────────────────────────────────────────────────

  describe('onTabChange', () => {
    it('should call fileLogsComponent.getLogs when tab index is 1', () => {
      const mockFileLogs = { getLogs: jest.fn() }
      component.fileLogsComponent = mockFileLogs as any
      component.onTabChange({ index: 1 })
      expect(mockFileLogs.getLogs).toHaveBeenCalled()
    })

    it('should not call getLogs when fileLogsComponent is undefined and index is 1', () => {
      (component as any).fileLogsComponent = undefined
      expect(() => component.onTabChange({ index: 1 })).not.toThrow()
    })

    it('should reset filteredUsers when tab index is 0', () => {
      component.enrolledUsers = [{ first_name: 'Alice' }]
      component.filteredUsers = []
      component.searchTerm = 'something'
      component.onTabChange({ index: 0 })
      expect(component.filteredUsers).toEqual(component.enrolledUsers)
      expect(component.searchTerm).toBe('')
    })
  })

  // ─── getUsers ─────────────────────────────────────────────────────────────

  describe('getUsers', () => {
    beforeEach(() => {
      component.currentBatch = { batchId: 'batch1' }
    })

    it('should populate enrolledUsers and filteredUsers on success', () => {
      const users = [{ first_name: 'Alice' }, { first_name: 'Bob' }]
      mockExternalTrainingsSvc.getParticipantsList.mockReturnValue(
        of({ userlist: users, totalCount: 2 })
      )
      component.getUsers()
      expect(component.enrolledUsers).toEqual(users)
      expect(component.filteredUsers).toEqual(users)
      expect(component.learnersCount).toBe(2)
    })

    it('should handle missing userlist gracefully', () => {
      mockExternalTrainingsSvc.getParticipantsList.mockReturnValue(of({}))
      component.getUsers()
      expect(component.enrolledUsers).toEqual([])
    })

    it('should handle error', () => {
      mockExternalTrainingsSvc.getParticipantsList.mockReturnValue(
        throwError(() => new Error('err'))
      )
      expect(() => component.getUsers()).not.toThrow()
    })
  })

  // ─── navigation helpers ───────────────────────────────────────────────────

  describe('navigateToExternalTrainings', () => {
    it('should navigate to external-trainings', () => {
      component.navigateToExternalTrainings()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/external-trainings'])
    })
  })

  describe('navigateToBatches', () => {
    it('should navigate to batches with trainingId', () => {
      component.trainingId = 'training1'
      component.navigateToBatches()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/external-trainings/', 'training1', 'batches']
      )
    })
  })

  describe('uploadUsers', () => {
    it('should navigate to create-batch with batchId query param', () => {
      component.trainingId = 'training1'
      component.training = { identifier: 'training1' }
      component.currentBatch = { batchId: 'batch1' }
      component.uploadUsers()
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/external-trainings/training1/create-batch'],
        { queryParams: { batchId: 'batch1' } }
      )
    })
  })

  // ─── FileLogsComponent coverage (transitive import) ───────────────────────
  // BatchDetailsComponent imports FileLogsComponent for @ViewChild — we exercise
  // the real class here so its lines are covered in this spec run.

  describe('FileLogsComponent (transitive)', () => {
    let fileLogsComp: FileLogsComponent

    beforeEach(() => {
      mockExternalTrainingsSvc.getFileLogs.mockReturnValue(
        of({
          result: {
            content: [
              { dateCreatedOn: '2024-03-01T00:00:00.000Z', fileName: 'b.csv' },
              { dateCreatedOn: '2024-01-01T00:00:00.000Z', fileName: 'a.csv' },
            ]
          }
        })
      )
      fileLogsComp = new FileLogsComponent(mockExternalTrainingsSvc, mockLoaderService)
      fileLogsComp.trainingId = 'training1'
      fileLogsComp.batchId = 'batch1'
    })

    it('should create FileLogsComponent', () => {
      expect(fileLogsComp).toBeTruthy()
    })

    it('should call getLogs in ngOnInit', () => {
      jest.spyOn(fileLogsComp, 'getLogs').mockImplementation(() => { })
      fileLogsComp.ngOnInit()
      expect(fileLogsComp.getLogs).toHaveBeenCalled()
    })

    it('should populate and sort lastUploadList', () => {
      fileLogsComp.getLogs()
      expect(fileLogsComp.lastUploadList[0].fileName).toBe('b.csv')
      expect(fileLogsComp.isLoading).toBe(false)
    })

    it('should handle empty result in getLogs', () => {
      mockExternalTrainingsSvc.getFileLogs.mockReturnValue(of({ result: {} }))
      fileLogsComp.getLogs()
      expect(fileLogsComp.lastUploadList).toEqual([])
    })

    it('should handle getLogs error', () => {
      mockExternalTrainingsSvc.getFileLogs.mockReturnValue(
        throwError(() => new Error('err'))
      )
      fileLogsComp.getLogs()
      expect(fileLogsComp.isLoading).toBe(false)
    })

    it('should update startIndex and lastIndex on onChangePage', () => {
      fileLogsComp.onChangePage({ pageIndex: 2, pageSize: 10 } as any)
      expect(fileLogsComp.startIndex).toBe(20)
      expect(fileLogsComp.lastIndex).toBe(30)
    })

    it('should update pageSize on handleChangePage', () => {
      fileLogsComp.handleChangePage({ pageIndex: 1, pageSize: 20 } as any)
      expect(fileLogsComp.pageSize).toBe(20)
      expect(fileLogsComp.startIndex).toBe(20)
    })

    it('should open download url via handleDownloadFile', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null)
      fileLogsComp.handleDownloadFile({ fileName: 'test.csv' })
      expect(mockOpen).toHaveBeenCalledWith(
        '/apis/proxies/v8/externaltraining/v1/bulkupload/download/test.csv', '_blank'
      )
      mockOpen.mockRestore()
    })

    it('should emit via changeLoaderState', () => {
      let emitted: boolean | undefined
      mockLoaderService.$currentState.subscribe((v: boolean) => (emitted = v))
      mockLoaderService.changeLoaderState(true)
      expect(emitted).toBe(true)
    })
  })
})

