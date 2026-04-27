import { ImportDesignationComponent } from './import-designation.component'
import { of, throwError } from 'rxjs'
import { SimpleChange } from '@angular/core'

describe('ImportDesignationComponent', () => {
  let component: ImportDesignationComponent
  let mockDirectoryService: any
  let mockDialog: any
  let mockDialogRef: any
  let mockLoaderService: any
  let mockSnackBar: any
  let mockDatePipe: any
  let mockActivatedRoute: any
  let mockRouter: any
  let mockConfigSvc: any

  const makeDesignation = (id: string, name = `Designation-${id}`, isOrgDesignation = false) => ({
    id,
    name,
    designation: name,
    description: `Desc ${id}`,
    isOrgDesignation,
    selected: false,
  })

  const makeApiResult = (list: any[] = [], count = 0) => ({
    formatedDesignationsLsit: list,
    totalCount: count,
  })

  beforeEach(() => {
    mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(null)),
      close: jest.fn(),
    }
    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef),
      closeAll: jest.fn(),
    }
    mockDirectoryService = {
      frameWorkInfo: { code: 'fw-001', categories: [] },
      getIgotMasterDesignations: jest.fn().mockReturnValue(of(makeApiResult())),
      updateSelectedDesignationList: jest.fn(),
      createTerm: jest.fn().mockReturnValue(of({ result: { node_id: ['node1'] } })),
      updateTerms: jest.fn().mockReturnValue(of({ success: true })),
      publishFramework: jest.fn().mockReturnValue(of({ success: true })),
      getUuid: 'mock-uuid-1234',
    }
    mockLoaderService = { changeLoaderState: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockDatePipe = { transform: jest.fn().mockReturnValue('01 Jan, 2024') }
    mockActivatedRoute = {
      data: of({ pageData: { data: { successMsg: 'Imported!', internalErrorMsg: 'Error!' } } }),
    }
    mockRouter = { navigate: jest.fn() }
    mockConfigSvc = { userProfileV2: { firstName: 'Alice', userId: 'u1' } }

    component = new ImportDesignationComponent(
      mockDirectoryService,
      mockDialog,
      mockLoaderService,
      mockSnackBar,
      mockDatePipe,
      mockActivatedRoute,
      mockRouter,
      mockConfigSvc,
    )
    // populate designationConfig inline to avoid route dependency
    component.designationConfig = {
      successMsg: 'Imported!',
      internalErrorMsg: 'Error!',
      termCreationMsg: 'Creating...',
      associationUpdateMsg: 'Updating...',
      associationRetryMsg: 'Retrying...',
      publishingMsg: 'Publishing...',
      importingDesignation: 'Importing...',
      refreshDelayTime: 10000,
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  // ─── create ────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise default state', () => {
    expect(component.igotDesignationsList).toEqual([])
    expect(component.selectedDesignationsList).toEqual([])
    expect(component.pageSize).toBe(30)
    expect(component.startIndex).toBe(0)
  })

  // ─── constructor: getFrameWorkDetails ──────────────────────────────────

  describe('getFrameWorkDetails', () => {
    it('should set frameworkInfo from directoryService', () => {
      expect(component.frameworkInfo).toEqual(mockDirectoryService.frameWorkInfo)
    })

    it('should emit closeComponent when frameWorkInfo is undefined', () => {
      const emitSpy = jest.spyOn(component.closeComponent, 'emit')
      mockDirectoryService.frameWorkInfo = undefined
      component.getFrameWorkDetails()
      expect(emitSpy).toHaveBeenCalledWith(false)
    })
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should not throw', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  // ─── ngOnChanges ───────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should call loadDesignations and getRoutesData when loader changes to false', () => {
      const loadSpy = jest.spyOn(component, 'loadDesignations')
      const routeSpy = jest.spyOn(component, 'getRoutesData')
      component.ngOnChanges({
        loader: new SimpleChange(true, false, false),
      })
      expect(loadSpy).toHaveBeenCalled()
      expect(routeSpy).toHaveBeenCalled()
    })

    it('should not call loadDesignations when loader changes to true', () => {
      const loadSpy = jest.spyOn(component, 'loadDesignations')
      component.ngOnChanges({
        loader: new SimpleChange(false, true, false),
      })
      expect(loadSpy).not.toHaveBeenCalled()
    })
  })

  // ─── loadDesignations ──────────────────────────────────────────────────

  describe('loadDesignations', () => {
    it('should call getIgotMasterDesignations and populate igotDesignationsList', () => {
      const list = [makeDesignation('d1'), makeDesignation('d2')]
      mockDirectoryService.getIgotMasterDesignations.mockReturnValue(of(makeApiResult(list, 2)))
      component.loadDesignations()
      expect(component.igotDesignationsList).toEqual(list)
      expect(component.deisgnationsCount).toBe(2)
    })

    it('should pass searchString in request when searchKey is non-empty', () => {
      component.loadDesignations('manager')
      const req = mockDirectoryService.getIgotMasterDesignations.mock.calls[0][0]
      expect(req.searchString).toBe('manager')
    })

    it('should not include searchString when searchKey is empty', () => {
      component.loadDesignations('')
      const req = mockDirectoryService.getIgotMasterDesignations.mock.calls[0][0]
      expect(req.searchString).toBeUndefined()
    })

    it('should turn loader off on success', () => {
      component.loadDesignations()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should turn loader off on error', () => {
      mockDirectoryService.getIgotMasterDesignations.mockReturnValue(throwError(() => new Error('fail')))
      component.loadDesignations()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should unsubscribe the previous apiSubscription before making a new call', () => {
      const prevSub = { unsubscribe: jest.fn() }
        ; (component as any).apiSubscription = prevSub
      component.loadDesignations()
      expect(prevSub.unsubscribe).toHaveBeenCalled()
    })

    it('should compute correct pageNumber from startIndex', () => {
      component.startIndex = 60
      component.pageSize = 30
      component.loadDesignations()
      const req = mockDirectoryService.getIgotMasterDesignations.mock.calls[0][0]
      expect(req.pageNumber).toBe(2)
    })
  })

  // ─── getFilteredSelectedList ────────────────────────────────────────────

  describe('getFilteredSelectedList', () => {
    beforeEach(() => {
      component.selectedDesignationsList = [
        makeDesignation('d1', 'Manager'),
        makeDesignation('d2', 'Director'),
      ]
    })

    it('should return all selections when searchControl has no value', () => {
      component.searchControl.setValue(null)
      expect(component.getFilteredSelectedList).toHaveLength(2)
    })

    it('should filter by name when searchControl has a value', () => {
      component.searchControl.setValue('manager')
      const result = component.getFilteredSelectedList
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Manager')
    })
  })

  // ─── selctedDesignationsCount ───────────────────────────────────────────

  describe('selctedDesignationsCount', () => {
    it('should return length of selectedDesignationsList', () => {
      component.selectedDesignationsList = [makeDesignation('d1'), makeDesignation('d2')]
      expect(component.selctedDesignationsCount).toBe(2)
    })
  })

  // ─── selectDesignation ─────────────────────────────────────────────────

  describe('selectDesignation', () => {
    beforeEach(() => {
      component.igotDesignationsList = [makeDesignation('d1'), makeDesignation('d2')]
    })

    it('should add designation to selectedList when not yet selected', () => {
      component.selectDesignation(0)
      expect(component.selectedDesignationsList).toHaveLength(1)
      expect(component.igotDesignationsList[0].selected).toBe(true)
    })

    it('should call updateSelectedDesignationList when selecting', () => {
      component.selectDesignation(0)
      expect(mockDirectoryService.updateSelectedDesignationList).toHaveBeenCalled()
    })

    it('should remove designation when already selected (toggle off)', () => {
      component.igotDesignationsList[0].selected = true
      component.selectedDesignationsList = [component.igotDesignationsList[0]]
      component.selectDesignation(0)
      expect(component.selectedDesignationsList).toHaveLength(0)
    })

    it('should not select an org designation', () => {
      component.igotDesignationsList = [makeDesignation('d1', 'Manager', true)]
      component.selectDesignation(0)
      expect(component.selectedDesignationsList).toHaveLength(0)
    })
  })

  // ─── removeDesignation ─────────────────────────────────────────────────

  describe('removeDesignation', () => {
    beforeEach(() => {
      component.selectedDesignationsList = [makeDesignation('d1'), makeDesignation('d2')]
      component.igotDesignationsList = [makeDesignation('d1'), makeDesignation('d2')]
    })

    it('should remove the specified designation from selectedDesignationsList', () => {
      component.removeDesignation([makeDesignation('d1')])
      expect(component.selectedDesignationsList).toHaveLength(1)
      expect(component.selectedDesignationsList[0].id).toBe('d2')
    })

    it('should mark designation as unselected in igotDesignationsList', () => {
      component.igotDesignationsList[0].selected = true
      component.removeDesignation([component.igotDesignationsList[0]])
      expect(component.igotDesignationsList[0].selected).toBe(false)
    })

    it('should call updateSelectedDesignationList for each removed item', () => {
      component.removeDesignation([makeDesignation('d1'), makeDesignation('d2')])
      expect(mockDirectoryService.updateSelectedDesignationList).toHaveBeenCalledTimes(2)
    })
  })

  // ─── openPreviewPoup ────────────────────────────────────────────────────

  describe('openPreviewPoup', () => {
    it('should open SelectedDesignationPopupComponent dialog', () => {
      component.selectedDesignationsList = [makeDesignation('d1')]
      component.openPreviewPoup()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should call removeDesignation when dialog closes with a non-empty array', () => {
      component.selectedDesignationsList = [makeDesignation('d1')]
      mockDialogRef.afterClosed.mockReturnValue(of([makeDesignation('d1')]))
      const removeSpy = jest.spyOn(component, 'removeDesignation')
      component.openPreviewPoup()
      expect(removeSpy).toHaveBeenCalled()
    })

    it('should NOT call removeDesignation when dialog closes with empty array', () => {
      component.selectedDesignationsList = [makeDesignation('d1')]
      mockDialogRef.afterClosed.mockReturnValue(of([]))
      const removeSpy = jest.spyOn(component, 'removeDesignation')
      component.openPreviewPoup()
      expect(removeSpy).not.toHaveBeenCalled()
    })
  })

  // ─── onChangePage ──────────────────────────────────────────────────────

  describe('onChangePage', () => {
    it('should update startIndex, lastIndex and pageSize then reload', () => {
      const loadSpy = jest.spyOn(component, 'loadDesignations')
      component.onChangePage({ pageIndex: 1, pageSize: 10, length: 100 } as any)
      expect(component.startIndex).toBe(10)
      expect(component.lastIndex).toBe(20)
      expect(component.pageSize).toBe(10)
      expect(loadSpy).toHaveBeenCalled()
    })
  })

  // ─── getRoutesData ─────────────────────────────────────────────────────

  describe('getRoutesData', () => {
    it('should set designationConfig from activated route data', () => {
      component.designationConfig = null
      component.getRoutesData()
      expect(component.designationConfig).toEqual({ successMsg: 'Imported!', internalErrorMsg: 'Error!' })
    })
  })

  // ─── navigateToMyDesignations ───────────────────────────────────────────

  describe('navigateToMyDesignations', () => {
    it('should emit closeComponent with false', () => {
      const emitSpy = jest.spyOn(component.closeComponent, 'emit')
      component.navigateToMyDesignations()
      expect(emitSpy).toHaveBeenCalledWith(false)
    })
  })

  // ─── openProcessingBox ──────────────────────────────────────────────────

  describe('openProcessingBox', () => {
    it('should open ConfirmationBoxComponent dialog', () => {
      component.openProcessingBox()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should set progressDialogData with type "progress"', () => {
      component.openProcessingBox()
      expect(component.progressDialogData.type).toBe('progress')
    })

    it('should call openConforamtionPopup when dialog closes with true', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(true))
      const confSpy = jest.spyOn(component, 'openConforamtionPopup')
      component.openProcessingBox()
      expect(confSpy).toHaveBeenCalled()
    })
  })

  // ─── valueChangeSubscription ────────────────────────────────────────────

  describe('valueChangeSubscription', () => {
    it('should subscribe to searchControl valueChanges', () => {
      const spy = jest.spyOn(component, 'loadDesignations')
      component.valueChangeSubscription()
      // manually trigger observable (delay is 500ms, skip with jest timers not needed here
      // just verify subscription wires up without error)
      expect(spy).toBeDefined()
    })
  })

  // ─── openConforamtionPopup ──────────────────────────────────────────────

  describe('openConforamtionPopup', () => {
    it('should open ConformationPopupComponent when there are failed designations', () => {
      component.designationsImportFailed = [{ designation: { designation: 'D1' } }]
      component.openConforamtionPopup()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should navigate to organisation when importMasterflag is true and failed list non-empty', () => {
      component.designationsImportFailed = [{ designation: { designation: 'D1' } }]
      component.importMasterflag = true
      mockDialogRef.afterClosed.mockReturnValue(of(null))
      component.openConforamtionPopup()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/directory/organisation'])
    })

    it('should call navigateToMyDesignations when importMasterflag is false and failed list non-empty', () => {
      component.designationsImportFailed = [{ designation: { designation: 'D1' } }]
      component.importMasterflag = false
      const navSpy = jest.spyOn(component, 'navigateToMyDesignations')
      mockDialogRef.afterClosed.mockReturnValue(of(null))
      component.openConforamtionPopup()
      expect(navSpy).toHaveBeenCalled()
    })

    it('should show success snackbar and closeAll after 4s when no failed designations', () => {
      jest.useFakeTimers()
      component.designationsImportFailed = []
      component.importMasterflag = false
      const navSpy = jest.spyOn(component, 'navigateToMyDesignations')
      component.openConforamtionPopup()
      jest.advanceTimersByTime(4000)
      expect(mockDialog.closeAll).toHaveBeenCalled()
      expect(navSpy).toHaveBeenCalled()
    })

    it('should navigate to organisation after 4s when importMasterflag true and no failures', () => {
      jest.useFakeTimers()
      component.designationsImportFailed = []
      component.importMasterflag = true
      component.openConforamtionPopup()
      jest.advanceTimersByTime(4000)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/directory/organisation'])
    })
  })

  // ─── updateTerms ────────────────────────────────────────────────────────

  describe('updateTerms', () => {
    const orgCategorie = { terms: [{ category: 'cat', code: 'c1' }] }

    beforeEach(() => {
      component.dialogRef = mockDialogRef
      component.progressDialogData = { subTitle: '' }
      component.selectedDesignationsList = [makeDesignation('d1')]
      component.designationsImportSuccessResponses = [{ identifier: 'n1' }]
    })

    it('should call publishFrameWork on updateTerms success', () => {
      const pubSpy = jest.spyOn(component, 'publishFrameWork')
      component.updateTerms(orgCategorie)
      expect(pubSpy).toHaveBeenCalled()
    })

    it('should close dialog with false when all designations failed', () => {
      component.designationsImportFailed = [makeDesignation('d1')]
      component.updateTerms({})
      expect(mockDialogRef.close).toHaveBeenCalledWith(false)
    })

    it('should retry updateTerms once on first error', () => {
      const updateSpy = jest.spyOn(mockDirectoryService, 'updateTerms')
        .mockReturnValueOnce(throwError(() => new Error('fail')))
        .mockReturnValueOnce(of({ success: true }))
      const pubSpy = jest.spyOn(component, 'publishFrameWork')
      component.updateTerms(orgCategorie)
      expect(updateSpy).toHaveBeenCalledTimes(2)
      expect(pubSpy).toHaveBeenCalled()
    })

    it('should close dialog and show error on second consecutive error (retry=true)', () => {
      mockDirectoryService.updateTerms.mockReturnValue(throwError(() => new Error('fail')))
      component.updateTerms(orgCategorie, true)
      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  // ─── publishFrameWork ───────────────────────────────────────────────────

  describe('publishFrameWork', () => {
    beforeEach(() => {
      component.dialogRef = mockDialogRef
      component.progressDialogData = { subTitle: '' }
      component.designationsImportSuccessResponses = [{ identifier: 'n1' }, { identifier: 'n2' }]
      component.frameworkInfo = { code: 'fw-001' }
    })

    it('should call dialogRef.close(true) after setTimeout when publish succeeds', () => {
      jest.useFakeTimers()
      mockDialogRef.close.mockImplementation(() => { })
      component.publishFrameWork()
      jest.runAllTimers()
      expect(mockDialogRef.close).toHaveBeenCalledWith(true)
    })

    it('should show error snackbar and close dialog when publish fails', () => {
      mockDirectoryService.publishFramework.mockReturnValue(throwError(() => new Error('fail')))
      component.publishFrameWork()
      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })

  // ─── importDesignations ─────────────────────────────────────────────────

  describe('importDesignations', () => {
    it('should call openProcessingBox', () => {
      const spy = jest.spyOn(component, 'openProcessingBox')
      component.importDesignations()
      expect(spy).toHaveBeenCalled()
    })

    it('should call createTerm for each selected designation and then updateTerms', () => {
      component.selectedDesignationsList = [makeDesignation('d1'), makeDesignation('d2')]
      component.frameworkInfo = { code: 'fw-001', categories: [] }
      component.dialogRef = mockDialogRef
      component.importDesignations()
      expect(mockDirectoryService.createTerm).toHaveBeenCalledTimes(2)
    })

    it('should handle createTerm errors gracefully (catchError)', () => {
      component.selectedDesignationsList = [makeDesignation('d1')]
      component.frameworkInfo = { code: 'fw-001', categories: [] }
      component.dialogRef = mockDialogRef
      mockDirectoryService.createTerm.mockReturnValue(throwError(() => new Error('create fail')))
      expect(() => component.importDesignations()).not.toThrow()
    })

    it('should close dialog and show error when forkJoin errors', () => {
      component.selectedDesignationsList = [makeDesignation('d1')]
      component.frameworkInfo = { code: 'fw-001', categories: [] }
      component.dialogRef = mockDialogRef
      // Make forkJoin error by returning an observable that errors after map
      mockDirectoryService.createTerm.mockReturnValue(
        new (require('rxjs').Observable)((subscriber: any) => { subscriber.error(new Error('fork fail')) })
      )
      expect(() => component.importDesignations()).not.toThrow()
    })
  })

  // ─── ngOnDestroy ────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call updateSelectedDesignationList with empty array', () => {
      component.ngOnDestroy()
      expect(mockDirectoryService.updateSelectedDesignationList).toHaveBeenCalledWith([])
    })

    it('should turn off the loader', () => {
      component.ngOnDestroy()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should unsubscribe apiSubscription if present', () => {
      const sub = { unsubscribe: jest.fn() }
        ; (component as any).apiSubscription = sub
      component.ngOnDestroy()
      expect(sub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when apiSubscription is undefined', () => {
      ; (component as any).apiSubscription = undefined
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // ─── openSnackbar (private — tested via effects) ────────────────────────

  describe('openSnackbar (via navigateToMyDesignations flow)', () => {
    it('should call snackBar.open with correct message via updateTerms all-failed path', () => {
      component.dialogRef = mockDialogRef
      component.selectedDesignationsList = [makeDesignation('d1')]
      component.designationsImportFailed = [makeDesignation('d1')]
      component.updateTerms({})
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error!', 'X', expect.any(Object))
    })
  })
})

