import { of, throwError } from 'rxjs'
import { DesignationsMasterComponent } from './designations-master.component'
import { FormControl } from '@angular/forms'

describe('DesignationsMasterComponent', () => {
  let component: DesignationsMasterComponent
  let mockDirectoryService: any
  let mockDialog: any
  let mockActivatedRoute: any
  let mockSnackBar: any
  let mockConfigSvc: any

  const mockDesignationConfig = {
    frameworkCreationMSg: 'Creating framework...',
    internalErrorMsg: 'Internal Error',
    termRemoveMsg: 'Term Removed',
    topsection: { guideVideo: { url: '/video/guide' } },
  }

  function createComponent() {
    component = new DesignationsMasterComponent(
      mockDirectoryService,
      mockDialog,
      mockActivatedRoute,
      mockSnackBar,
      mockConfigSvc
    )
  }

  beforeEach(() => {
    mockDirectoryService = {
      getOrgReadData: jest.fn().mockReturnValue(of({ frameworkid: 'fw-001' })),
      getFrameworkInfo: jest.fn().mockReturnValue(of({
        result: { framework: { code: 'fw-001', categories: [] } },
      })),
      createFrameWork: jest.fn().mockReturnValue(of({ result: { framework: 'new-fw' } })),
      setFrameWorkInfo: jest.fn(),
      setCurrentOrgDesignationsList: jest.fn(),
      deleteDesignation: jest.fn().mockReturnValue(of({ success: true })),
      publishFramework: jest.fn().mockReturnValue(of({ success: true })),
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(false)) }),
    }

    mockActivatedRoute = {
      snapshot: {
        params: { department: 'test-org-id' },
        queryParams: { orgName: 'Test Org' },
        data: { pageData: { data: mockDesignationConfig } },
      },
    }

    mockSnackBar = { open: jest.fn() }

    mockConfigSvc = {
      userProfile: { departmentName: 'Test Department' },
    }

    createComponent()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call initialization', () => {
      const spy = jest.spyOn(component as any, 'initialization')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── initializeDefaultValues ─────────────────────────────────────────────────

  describe('initializeDefaultValues', () => {
    it('should set orgId from route params', () => {
      ; (component as any).initializeDefaultValues()
      expect(component.orgId).toBe('test-org-id')
    })

    it('should set orgName from queryParams', () => {
      ; (component as any).initializeDefaultValues()
      expect(component.orgName).toBe('Test Org')
    })

    it('should set designationConfig from pageData', () => {
      ; (component as any).initializeDefaultValues()
      expect(component.designationConfig).toEqual(mockDesignationConfig)
    })

    it('should set actionMenuItem with remove action', () => {
      ; (component as any).initializeDefaultValues()
      expect(component.actionMenuItem.length).toBe(1)
      expect(component.actionMenuItem[0].key).toBe('remove')
    })

    it('should set tableData with three columns', () => {
      ; (component as any).initializeDefaultValues()
      expect(component.tableData.columns.length).toBe(3)
      expect(component.tableData.columns[0].key).toBe('name')
    })

    it('should handle missing snapshot gracefully', () => {
      mockActivatedRoute.snapshot = null as any
      createComponent()
      expect(() => (component as any).initializeDefaultValues()).not.toThrow()
    })
  })

  // ─── getRoutesData ───────────────────────────────────────────────────────────

  describe('getRoutesData', () => {
    beforeEach(() => {
      component.designationConfig = mockDesignationConfig
      component.orgId = 'test-org-id'
    })

    it('should call getOrgReadData with orgId', () => {
      component.getRoutesData()
      expect(mockDirectoryService.getOrgReadData).toHaveBeenCalledWith('test-org-id')
    })

    it('should call getFrameworkInfo when data has frameworkid', () => {
      mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw-001' }))
      component.getRoutesData()
      expect(mockDirectoryService.getFrameworkInfo).toHaveBeenCalledWith('fw-001')
    })

    it('should call createFreamwork when data has no frameworkid', () => {
      mockDirectoryService.getOrgReadData.mockReturnValue(of({}))
      const spy = jest.spyOn(component as any, 'createFreamwork')
      component.getRoutesData()
      expect(spy).toHaveBeenCalled()
    })

    it('should set designationMaster to import when goToImportMaster is true', () => {
      component.goToImportMaster = true
      mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw-001' }))
      component.getRoutesData()
      expect(component.designationMaster).toBe('import designations')
    })

    it('should not change designationMaster when goToImportMaster is false', () => {
      component.goToImportMaster = false
      mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw-001' }))
      component.getRoutesData()
      expect(component.designationMaster).not.toBe('import designations')
    })
  })

  // ─── createFreamwork ─────────────────────────────────────────────────────────

  describe('createFreamwork', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.designationConfig = mockDesignationConfig
      component.orgName = 'Test Org'
      component.orgId = 'test-org-id'
      component['environment'] = { ODCSMasterFramework: 'master-fw', frameworkName: '' }
    })

    it('should set showCreateLoader to true', () => {
      ; (component as any).createFreamwork()
      expect(component.showCreateLoader).toBe(true)
    })

    it('should set loaderMsg from designationConfig', () => {
      ; (component as any).createFreamwork()
      expect(component.loaderMsg).toBe('Creating framework...')
    })

    it('should use orgName as departmentName when set', () => {
      ; (component as any).createFreamwork()
      expect(mockDirectoryService.createFrameWork).toHaveBeenCalledWith(
        'master-fw', 'test-org-id', 'Test Org'
      )
    })

    it('should use configSvc departmentName when orgName is empty', () => {
      component.orgName = ''
        ; (component as any).createFreamwork()
      expect(mockDirectoryService.createFrameWork).toHaveBeenCalledWith(
        'master-fw', 'test-org-id', 'Test Department'
      )
    })

    it('should set frameworkName from response and call getRoutesData after timeout', () => {
      mockDirectoryService.createFrameWork.mockReturnValue(of({ result: { framework: 'new-fw' } }))
      const spy = jest.spyOn(component, 'getRoutesData')
        ; (component as any).createFreamwork()
      // frameworkName is set synchronously before the setTimeout fires
      expect(component['environment'].frameworkName).toBe('new-fw')
      jest.runAllTimers()
      expect(spy).toHaveBeenCalled()
    })

    it('should not call getRoutesData when framework result is absent', () => {
      mockDirectoryService.createFrameWork.mockReturnValue(of({}))
      const spy = jest.spyOn(component, 'getRoutesData')
        ; (component as any).createFreamwork()
      jest.runAllTimers()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── getOrgReadData ──────────────────────────────────────────────────────────

  describe('getOrgReadData', () => {
    beforeEach(() => {
      component['environment'] = { frameworkName: '' }
    })

    it('should set showCreateLoader to false on success', () => {
      mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw-123' }))
        ; (component as any).getOrgReadData()
      expect(component.showCreateLoader).toBe(false)
    })

    it('should update environment frameworkName from response', () => {
      mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw-123' }))
        ; (component as any).getOrgReadData()
      expect(component['environment'].frameworkName).toBe('fw-123')
    })
  })

  // ─── getFrameworkInfo ────────────────────────────────────────────────────────

  describe('getFrameworkInfo', () => {
    beforeEach(() => {
      component.designationConfig = mockDesignationConfig
      component['environment'] = { frameworkName: '' }
    })

    it('should set showLoader to false on success', () => {
      ; (component as any).getFrameworkInfo('fw-001')
      expect(component.showLoader).toBe(false)
    })

    it('should set frameworkDetails from response', () => {
      ; (component as any).getFrameworkInfo('fw-001')
      expect(component.frameworkDetails).toEqual({ code: 'fw-001', categories: [] })
    })

    it('should call setFrameWorkInfo', () => {
      ; (component as any).getFrameworkInfo('fw-001')
      expect(mockDirectoryService.setFrameWorkInfo).toHaveBeenCalledWith({ code: 'fw-001', categories: [] })
    })

    it('should set showCreateLoader to false on success', () => {
      ; (component as any).getFrameworkInfo('fw-001')
      expect(component.showCreateLoader).toBe(false)
    })

    it('should call openSnackbar on error', () => {
      mockDirectoryService.getFrameworkInfo.mockReturnValue(throwError('error'))
      const spy = jest.spyOn(component as any, 'openSnackbar')
        ; (component as any).getFrameworkInfo('fw-bad')
      expect(spy).toHaveBeenCalledWith('Internal Error', 5000, 'error')
    })

    it('should set showLoader to false on error', () => {
      mockDirectoryService.getFrameworkInfo.mockReturnValue(throwError('error'))
        ; (component as any).getFrameworkInfo('fw-bad')
      expect(component.showLoader).toBe(false)
    })
  })

  // ─── valueChangeSubscribers ──────────────────────────────────────────────────

  describe('valueChangeSubscribers', () => {
    it('should subscribe to searchControl valueChanges and call filterDesignations', (done) => {
      component.designationsList = []
      component.searchControl = new FormControl()
      const spy = jest.spyOn(component as any, 'filterDesignations')
        ; (component as any).valueChangeSubscribers()
      component.searchControl.setValue('test')
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('test')
        done()
      }, 600)
    })
  })

  // ─── getOrganisations ────────────────────────────────────────────────────────

  describe('getOrganisations', () => {
    it('should set organisationsList from getTermsByCode', () => {
      component.frameworkDetails = {
        categories: [{ code: 'org', terms: [{ identifier: 'org-1', children: [] }] }],
      }
      component.getOrganisations()
      expect(component.organisationsList).toEqual([{ identifier: 'org-1', children: [] }])
    })

    it('should set selectedOrganisation to first identifier', () => {
      component.frameworkDetails = {
        categories: [{ code: 'org', terms: [{ identifier: 'org-1', children: [] }] }],
      }
      component.getOrganisations()
      expect(component.selectedOrganisation).toBe('org-1')
    })

    it('should set selectedOrganisation to empty when no orgs', () => {
      component.frameworkDetails = { categories: [] }
      component.getOrganisations()
      expect(component.selectedOrganisation).toBe('')
    })
  })

  // ─── getDesignations ─────────────────────────────────────────────────────────

  describe('getDesignations', () => {
    it('should set designationsList from first organisation children', () => {
      component.organisationsList = [
        { identifier: 'org-1', children: [{ name: 'Manager' }] },
      ]
      component.getDesignations()
      expect(component.designationsList).toEqual([{ name: 'Manager' }])
    })

    it('should call setCurrentOrgDesignationsList', () => {
      component.organisationsList = [{ children: [{ name: 'Engineer' }] }]
      component.getDesignations()
      expect(mockDirectoryService.setCurrentOrgDesignationsList).toHaveBeenCalledWith([{ name: 'Engineer' }])
    })
  })

  // ─── getTermsByCode ──────────────────────────────────────────────────────────

  describe('getTermsByCode', () => {
    beforeEach(() => {
      component.frameworkDetails = {
        categories: [
          { code: 'org', terms: [{ name: 'Ministry' }] },
          { code: 'dept', terms: [{ name: 'Finance' }] },
        ],
      }
    })

    it('should return terms for matching code', () => {
      const result = (component as any).getTermsByCode('org')
      expect(result).toEqual([{ name: 'Ministry' }])
    })

    it('should return empty array when code not found', () => {
      const result = (component as any).getTermsByCode('unknown')
      expect(result).toEqual([])
    })
  })

  // ─── categoriesOfFramework getter ─────────────────────────────────────────

  describe('categoriesOfFramework', () => {
    it('should return categories from frameworkDetails', () => {
      component.frameworkDetails = { categories: [{ code: 'org' }] }
      expect((component as any).categoriesOfFramework).toEqual([{ code: 'org' }])
    })

    it('should return empty array when frameworkDetails is empty', () => {
      component.frameworkDetails = {}
      expect((component as any).categoriesOfFramework).toEqual([])
    })
  })

  // ─── filterDesignations ──────────────────────────────────────────────────────

  describe('filterDesignations', () => {
    beforeEach(() => {
      component.designationsList = [
        { name: 'Manager', additionalProperties: { timeStamp: '1000' } },
        { name: 'Engineer', additionalProperties: { timeStamp: '2000' } },
        { name: 'Admin' },
      ]
    })

    it('should filter by key (case-insensitive)', () => {
      ; (component as any).filterDesignations('man')
      expect(component.filteredDesignationsList.length).toBe(1)
      expect(component.filteredDesignationsList[0].name).toBe('Manager')
    })

    it('should return all when key does not match any', () => {
      ; (component as any).filterDesignations('xyz')
      expect(component.filteredDesignationsList.length).toBe(0)
    })

    it('should sort descending by timeStamp when no key provided', () => {
      ; (component as any).filterDesignations()
      expect(component.filteredDesignationsList[0].additionalProperties.timeStamp).toBe('2000')
    })

    it('should default to 0 timestamp when additionalProperties is absent', () => {
      component.designationsList = [
        { name: 'Admin' },
        { name: 'Engineer', additionalProperties: { timeStamp: '500' } },
      ]
        ; (component as any).filterDesignations()
      // Engineer (500) > Admin (0), so Engineer is first
      expect(component.filteredDesignationsList[0].name).toBe('Engineer')
    })

    it('should handle empty designationsList', () => {
      component.designationsList = []
        ; (component as any).filterDesignations()
      expect(component.filteredDesignationsList).toEqual([])
    })

    it('should handle null designationsList when key is provided', () => {
      component.designationsList = null as any
        ; (component as any).filterDesignations('test')
      expect(component.filteredDesignationsList).toEqual([])
    })
  })

  // ─── openVideoPopup ──────────────────────────────────────────────────────────

  describe('openVideoPopup', () => {
    it('should open dialog with video link', () => {
      component.designationConfig = mockDesignationConfig
      component['environment'] = { karmYogiPath: 'https://karma.gov.in' }
      component.openVideoPopup()
      expect(mockDialog.open).toHaveBeenCalled()
      const callArgs = mockDialog.open.mock.calls[0][1]
      expect(callArgs.data.videoLink).toContain('/video/guide')
    })
  })

  // ─── menuSelected ────────────────────────────────────────────────────────────

  describe('menuSelected', () => {
    it('should call openConformationPopup when action is remove', () => {
      const spy = jest.spyOn(component as any, 'openConformationPopup')
      component.menuSelected({ action: 'remove', row: { code: 'des-1' } })
      expect(spy).toHaveBeenCalled()
    })

    it('should not crash for unknown actions', () => {
      expect(() => component.menuSelected({ action: 'other' })).not.toThrow()
    })
  })

  // ─── openConformationPopup ───────────────────────────────────────────────────

  describe('openConformationPopup', () => {
    it('should open dialog', () => {
      ; (component as any).openConformationPopup({ row: { code: 'des-1' } })
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should call removeDesignation when dialog closes with true', () => {
      mockDialog.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(true)) })
      const spy = jest.spyOn(component as any, 'removeDesignation')
        ; (component as any).openConformationPopup({ row: { code: 'des-1' } })
      expect(spy).toHaveBeenCalledWith({ code: 'des-1' })
    })

    it('should not call removeDesignation when dialog closes with false', () => {
      mockDialog.open.mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(false)) })
      const spy = jest.spyOn(component as any, 'removeDesignation')
        ; (component as any).openConformationPopup({ row: { code: 'des-1' } })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── removeDesignation ───────────────────────────────────────────────────────

  describe('removeDesignation', () => {
    beforeEach(() => {
      component.designationConfig = mockDesignationConfig
      component.frameworkDetails = { code: 'fw-001' }
    })

    it('should do nothing when designation is null', () => {
      ; (component as any).removeDesignation(null)
      expect(mockDirectoryService.deleteDesignation).not.toHaveBeenCalled()
    })

    it('should call deleteDesignation with correct args', () => {
      ; (component as any).removeDesignation({ code: 'des-1' })
      expect(mockDirectoryService.deleteDesignation).toHaveBeenCalledWith(
        'fw-001', 'designation', { request: { contentIds: ['des-1'] } }
      )
    })

    it('should call publishFrameWork on successful delete with truthy response', () => {
      mockDirectoryService.deleteDesignation.mockReturnValue(of({ success: true }))
      const spy = jest.spyOn(component as any, 'publishFrameWork')
        ; (component as any).removeDesignation({ code: 'des-1' })
      expect(spy).toHaveBeenCalledWith('delete')
    })

    it('should set showLoader to false when delete returns falsy response', () => {
      mockDirectoryService.deleteDesignation.mockReturnValue(of(null))
        ; (component as any).removeDesignation({ code: 'des-1' })
      expect(component.showLoader).toBe(false)
    })

    it('should call openSnackbar on delete error', () => {
      mockDirectoryService.deleteDesignation.mockReturnValue(throwError('err'))
      const spy = jest.spyOn(component as any, 'openSnackbar')
        ; (component as any).removeDesignation({ code: 'des-1' })
      expect(spy).toHaveBeenCalledWith('Internal Error', 5000, 'error')
    })

    it('should set showLoader to false on delete error', () => {
      mockDirectoryService.deleteDesignation.mockReturnValue(throwError('err'))
        ; (component as any).removeDesignation({ code: 'des-1' })
      expect(component.showLoader).toBe(false)
    })
  })

  // ─── publishFrameWork ────────────────────────────────────────────────────────

  describe('publishFrameWork', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.designationConfig = mockDesignationConfig
      component.frameworkDetails = { code: 'fw-001' }
      component['environment'] = { frameworkName: 'fw-001' }
      component.designationsList = []
      mockDirectoryService.publishFramework.mockReturnValue(of({ success: true }))
      mockDirectoryService.getFrameworkInfo.mockReturnValue(of({
        result: { framework: { code: 'fw-001', categories: [] } },
      }))
    })

    it('should call publishFramework with frameworkDetails code', () => {
      ; (component as any).publishFrameWork()
      expect(mockDirectoryService.publishFramework).toHaveBeenCalledWith('fw-001')
    })

    it('should call getFrameworkInfo after timeout on success', () => {
      ; (component as any).publishFrameWork()
      jest.runAllTimers()
      expect(mockDirectoryService.getFrameworkInfo).toHaveBeenCalledWith('fw-001')
    })

    it('should call openSnackbar with termRemoveMsg when action is delete', () => {
      const spy = jest.spyOn(component as any, 'openSnackbar')
        ; (component as any).publishFrameWork('delete')
      jest.runAllTimers()
      expect(spy).toHaveBeenCalledWith('Term Removed')
    })

    it('should not call openSnackbar when action is not delete', () => {
      const spy = jest.spyOn(component as any, 'openSnackbar')
        ; (component as any).publishFrameWork()
      jest.runAllTimers()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should use longer refreshTime when designationsList is large', () => {
      component.designationsList = new Array(30).fill({})
        ; (component as any).publishFrameWork()
      jest.advanceTimersByTime(15001)
      expect(mockDirectoryService.getFrameworkInfo).toHaveBeenCalled()
    })

    it('should not call getFrameworkInfo when response is falsy', () => {
      mockDirectoryService.publishFramework.mockReturnValue(of(null))
        ; (component as any).publishFrameWork()
      jest.runAllTimers()
      expect(mockDirectoryService.getFrameworkInfo).not.toHaveBeenCalled()
    })

    it('should call openSnackbar on publish error', () => {
      mockDirectoryService.publishFramework.mockReturnValue(throwError('err'))
      const spy = jest.spyOn(component as any, 'openSnackbar')
        ; (component as any).publishFrameWork()
      expect(spy).toHaveBeenCalledWith('Internal Error', 5000, 'error')
    })

    it('should set showLoader to false on publish error', () => {
      mockDirectoryService.publishFramework.mockReturnValue(throwError('err'))
        ; (component as any).publishFrameWork()
      expect(component.showLoader).toBe(false)
    })
  })

  // ─── openSnackbar ────────────────────────────────────────────────────────────

  describe('openSnackbar', () => {
    it('should call snackBar.open with message and duration', () => {
      ; (component as any).openSnackbar('Hello', 3000)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Hello', 'X', {
        duration: 3000,
        panelClass: [''],
      })
    })

    it('should use default duration of 5000 when not provided', () => {
      ; (component as any).openSnackbar('Msg')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Msg', 'X', expect.objectContaining({ duration: 5000 }))
    })

    it('should include type in panelClass when provided', () => {
      ; (component as any).openSnackbar('Err', 5000, 'error')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Err', 'X', {
        duration: 5000,
        panelClass: ['error'],
      })
    })
  })

  // ─── removeImportDesignationComp ─────────────────────────────────────────────

  describe('removeImportDesignationComp', () => {
    beforeEach(() => {
      component.designationConfig = mockDesignationConfig
      component.orgId = 'test-org-id'
      component['environment'] = { frameworkName: '' }
    })

    it('should set designationMaster to import designations when flag is true', () => {
      component.removeImportDesignationComp(true)
      expect(component.designationMaster).toBe('import designations')
    })

    it('should set designationMaster to desigantion master when flag is false', () => {
      component.removeImportDesignationComp(false)
      expect(component.designationMaster).toBe('desigantion master')
    })

    it('should set goToImportMaster to false', () => {
      component.goToImportMaster = true
      component.removeImportDesignationComp(false)
      expect(component.goToImportMaster).toBe(false)
    })

    it('should call getRoutesData', () => {
      const spy = jest.spyOn(component, 'getRoutesData')
      component.removeImportDesignationComp(false)
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── showDesignationMaster ────────────────────────────────────────────────────

  describe('showDesignationMaster', () => {
    beforeEach(() => {
      component.designationConfig = mockDesignationConfig
      component.orgId = 'test-org-id'
      component['environment'] = { frameworkName: '' }
    })

    it('should set designationMaster to desigantion master when flag is true', () => {
      component.showDesignationMaster(true)
      expect(component.designationMaster).toBe('desigantion master')
    })

    it('should set designationMaster to bulk upload when flag is false', () => {
      component.showDesignationMaster(false)
      expect(component.designationMaster).toBe('bulk upload')
    })

    it('should call getRoutesData', () => {
      const spy = jest.spyOn(component, 'getRoutesData')
      component.showDesignationMaster(true)
      expect(spy).toHaveBeenCalled()
    })
  })
})
