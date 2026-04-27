import { FileLogsComponent } from './file-logs.component'
import { of, throwError } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'

describe('FileLogsComponent', () => {
  let component: FileLogsComponent
  let mockExternalTrainingsSvc: any
  let loaderService: LoaderService

  beforeEach(() => {
    mockExternalTrainingsSvc = {
      getFileLogs: jest.fn(),
    }
    loaderService = new LoaderService()

    component = new FileLogsComponent(
      mockExternalTrainingsSvc,
      loaderService,
    )
    component.trainingId = 'training1'
    component.batchId = 'batch1'
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getLogs', () => {
      jest.spyOn(component, 'getLogs').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.getLogs).toHaveBeenCalled()
    })
  })

  // ─── getLogs ──────────────────────────────────────────────────────────────

  describe('getLogs', () => {
    it('should populate lastUploadList sorted by dateCreatedOn on success', () => {
      const content = [
        { dateCreatedOn: '2024-01-01T00:00:00.000Z', fileName: 'a.csv' },
        { dateCreatedOn: '2024-03-01T00:00:00.000Z', fileName: 'b.csv' },
        { dateCreatedOn: '2024-02-01T00:00:00.000Z', fileName: 'c.csv' },
      ]
      mockExternalTrainingsSvc.getFileLogs.mockReturnValue(of({ result: { content } }))
      component.getLogs()
      expect(component.lastUploadList[0].fileName).toBe('b.csv')
      expect(component.isLoading).toBe(false)
    })

    it('should not set lastUploadList when result has no content', () => {
      mockExternalTrainingsSvc.getFileLogs.mockReturnValue(of({ result: {} }))
      component.lastUploadList = []
      component.getLogs()
      expect(component.lastUploadList).toEqual([])
    })

    it('should handle error and set isLoading to false', () => {
      mockExternalTrainingsSvc.getFileLogs.mockReturnValue(throwError(() => new Error('err')))
      component.getLogs()
      expect(component.isLoading).toBe(false)
    })
  })

  // ─── onChangePage ─────────────────────────────────────────────────────────

  describe('onChangePage', () => {
    it('should update startIndex and lastIndex', () => {
      component.onChangePage({ pageIndex: 1, pageSize: 10 } as any)
      expect(component.startIndex).toBe(10)
      expect(component.lastIndex).toBe(20)
    })

    it('should set startIndex 0 for first page', () => {
      component.onChangePage({ pageIndex: 0, pageSize: 10 } as any)
      expect(component.startIndex).toBe(0)
      expect(component.lastIndex).toBe(10)
    })
  })

  // ─── handleChangePage ─────────────────────────────────────────────────────

  describe('handleChangePage', () => {
    it('should update pageSize, startIndex and lastIndex', () => {
      component.handleChangePage({ pageIndex: 2, pageSize: 20 } as any)
      expect(component.pageSize).toBe(20)
      expect(component.startIndex).toBe(40)
      expect(component.lastIndex).toBe(60)
    })
  })

  // ─── handleDownloadFile ───────────────────────────────────────────────────

  describe('handleDownloadFile', () => {
    it('should call window.open with correct file path', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null)
      component.handleDownloadFile({ fileName: 'report.csv' })
      expect(mockOpen).toHaveBeenCalledWith(
        '/apis/proxies/v8/externaltraining/v1/bulkupload/download/report.csv',
        '_blank'
      )
      mockOpen.mockRestore()
    })
  })

  // ─── LoaderService direct coverage ───────────────────────────────────────

  describe('LoaderService', () => {
    it('should emit value via changeLoaderState', () => {
      let emitted: boolean | undefined
      loaderService.$currentState.subscribe(v => (emitted = v))
      loaderService.changeLoaderState(true)
      expect(emitted).toBe(true)
    })
  })
})

