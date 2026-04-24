// Prevent transitive imports from being instrumented for coverage
jest.mock('../../bulk-upload-org/bulk-upload-org.component')
jest.mock('../../../../services/org-hierarchy.service')
jest.mock('../../../../../../../../../../../src/app/services/loader.service')

import { OrgHierarchyMappingComponent } from './org-hierarchy-mapping.component'
import { of, throwError } from 'rxjs'
import { FormControl } from '@angular/forms'

describe('OrgHierarchyMappingComponent', () => {
  let component: OrgHierarchyMappingComponent
  let mockSnackbar: any
  let mockOrgHieService: any
  let mockLoaderService: any
  let mockRouter: any
  let mockActiveRoute: any
  let mockDialog: any

  beforeEach(() => {
    mockSnackbar = { open: jest.fn() }
    mockLoaderService = { changeLoaderState: jest.fn() }
    mockRouter = { navigate: jest.fn() }
    mockActiveRoute = {
      snapshot: {
        parent: {
          data: {
            configService: {
              userRoles: new Set(['mdo_admin']),
              userProfile: { rootOrgId: 'org123' }
            }
          }
        }
      }
    }
    mockDialog = { open: jest.fn() }
    mockOrgHieService = {
      getCenterOrStateList: jest.fn(),
      createMasterFrameWork: jest.fn(),
      getOrgReadData: jest.fn(),
      getOrganizationDetails: jest.fn(),
      downloadSampleTemplate: jest.fn(),
      exportFramework: jest.fn(),
      uploadFreameworkTemplate: jest.fn(),
      getUserRoles: jest.fn().mockReturnValue(new Set<string>()),
    }

    component = new OrgHierarchyMappingComponent(
      mockSnackbar,
      mockOrgHieService,
      mockLoaderService,
      mockRouter,
      mockActiveRoute,
      mockDialog
    )
  })

  // ─── lifecycle ────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should initialise filteredOrganizations and call getOrgReadAndDetails', () => {
      jest.spyOn(component as any, 'getOrgReadAndDetails').mockImplementation(() => { })
      component.ngOnInit()
      expect(component.filteredOrganizations).toEqual([])
      expect((component as any).getOrgReadAndDetails).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn((component as any).destroy$, 'next')
      const completeSpy = jest.spyOn((component as any).destroy$, 'complete')
      component.ngOnDestroy()
      expect(nextSpy).toHaveBeenCalled()
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should subscribe to singleSelect openedChange when singleSelect exists', () => {
      const openedChangeCallbacks: any[] = []
      const mockSingleSelect: any = {
        openedChange: { subscribe: jest.fn((cb: any) => openedChangeCallbacks.push(cb)) },
        close: jest.fn(),
      }
      component.singleSelect = mockSingleSelect
      const mockSearchInput: any = { nativeElement: { focus: jest.fn() } }
      component.searchInput = mockSearchInput

      jest.useFakeTimers()
      component.ngAfterViewInit()

      // opened = true → focus search input after timeout
      openedChangeCallbacks[0](true)
      jest.runAllTimers()
      expect(mockSearchInput.nativeElement.focus).toHaveBeenCalled()

      // opened = false → reset searchControl
      openedChangeCallbacks[0](false)
      expect(component.searchControl.value).toBe('')

      jest.useRealTimers()
    })

    it('should not throw when singleSelect is undefined', () => {
      (component as any).singleSelect = undefined
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  // ─── filterOrganizations ──────────────────────────────────────────────────

  describe('filterOrganizations', () => {
    beforeEach(() => {
      component.allOrganizations = [
        { orgName: 'Alpha Org' },
        { orgName: 'Beta Org' },
        { orgName: 'Gamma Org' },
      ] as any
    })

    it('should reset filteredOrganizations when value is empty', () => {
      component.filterOrganizations('')
      expect(component.filteredOrganizations).toEqual(component.allOrganizations)
    })

    it('should filter organizations by name', () => {
      component.filterOrganizations('alpha')
      expect(component.filteredOrganizations).toEqual([{ orgName: 'Alpha Org' }])
    })
  })

  // ─── orgSelected ──────────────────────────────────────────────────────────

  describe('orgSelected', () => {
    it('should not call getCentenrOrStateList when same orgType selected', () => {
      jest.spyOn(component as any, 'getCentenrOrStateList').mockResolvedValue(undefined)
      component.selectedOrgType = 'state'
      component.orgSelected('state')
      expect((component as any).getCentenrOrStateList).not.toHaveBeenCalled()
    })

    it('should update selectedOrgType and call getCentenrOrStateList when different type', () => {
      jest.spyOn(component as any, 'getCentenrOrStateList').mockResolvedValue(undefined)
      component.selectedOrgType = 'state'
      component.orgSelected('ministry')
      expect(component.selectedOrgType).toBe('ministry')
      expect((component as any).getCentenrOrStateList).toHaveBeenCalledWith('ministry')
    })
  })

  // ─── getCentenrOrStateList ────────────────────────────────────────────────

  describe('getCentenrOrStateList', () => {
    it('should populate organizations on success', async () => {
      const content = [{ orgName: 'Org1' }, { orgName: 'Org2' }]
      mockOrgHieService.getCenterOrStateList.mockReturnValue(
        of({ result: { response: { content } } })
      )
      await (component as any).getCentenrOrStateList('state')
      expect(component.allOrganizations).toEqual(content)
      expect(component.filteredOrganizations).toEqual(content)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should empty organizations when no content in response', async () => {
      mockOrgHieService.getCenterOrStateList.mockReturnValue(
        of({ result: { response: { content: [] } } })
      )
      await (component as any).getCentenrOrStateList('ministry')
      expect(component.allOrganizations).toEqual([])
      expect(component.filteredOrganizations).toEqual([])
    })

    it('should handle API error gracefully', async () => {
      mockOrgHieService.getCenterOrStateList.mockReturnValue(
        throwError(() => new Error('error'))
      )
      await (component as any).getCentenrOrStateList('state')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should set sbOrgType to ministry when orgType is ministry', async () => {
      mockOrgHieService.getCenterOrStateList.mockReturnValue(
        of({ result: { response: { content: [] } } })
      )
      await (component as any).getCentenrOrStateList('ministry')
      const callArg = mockOrgHieService.getCenterOrStateList.mock.calls[0][0]
      expect(callArg.request.filters.sbOrgType).toBe('ministry')
    })

    it('should pass value param in query when provided', async () => {
      mockOrgHieService.getCenterOrStateList.mockReturnValue(
        of({ result: { response: { content: [] } } })
      )
      await (component as any).getCentenrOrStateList('state', 'test')
      const callArg = mockOrgHieService.getCenterOrStateList.mock.calls[0][0]
      expect(callArg.request.query).toBe('test')
    })
  })

  // ─── getOrgDetails ────────────────────────────────────────────────────────

  describe('getOrgDetails', () => {
    it('should return null when organizationCtrl has no value', () => {
      component.organizationCtrl = new FormControl(null)
      expect(component.getOrgDetails()).toBeNull()
    })

    it('should return orgReadData when checkIfMdoL0 is true', () => {
      component.organizationCtrl = new FormControl('x')
      component.orgReadData = { id: 'abc', sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.getOrgDetails()).toEqual(component.orgReadData)
    })

    it('should return orgReadData when checkIfMdoL0Admin is true', () => {
      component.organizationCtrl = new FormControl('x')
      component.orgReadData = { id: 'abc', sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_admin']))
      expect(component.getOrgDetails()).toEqual(component.orgReadData)
    })

    it('should return parentOrgReadData when checkIfParentIsMdoL0 is true', () => {
      component.organizationCtrl = new FormControl('x')
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      expect(component.getOrgDetails()).toEqual(component.parentOrgReadData)
    })

    it('should return matched org from filteredOrganizations', () => {
      const org = { identifier: 'id1', orgName: 'Org1' }
      component.organizationCtrl = new FormControl('id1')
      component.filteredOrganizations = [org]
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      expect(component.getOrgDetails()).toEqual(org)
    })

    it('should return null when no condition or no org matches', () => {
      component.organizationCtrl = new FormControl(null)
      component.filteredOrganizations = []
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      expect(component.getOrgDetails()).toBeNull()
    })
  })

  // ─── hasOrgHierarchyFrameworkId ───────────────────────────────────────────

  describe('hasOrgHierarchyFrameworkId', () => {
    it('should return false when organizationCtrl has no value', () => {
      component.organizationCtrl = new FormControl(null)
      expect(component.hasOrgHierarchyFrameworkId()).toBe(false)
    })

    it('should return true when org has orgHierarchyFrameworkId (MdoL0)', () => {
      component.organizationCtrl = new FormControl('x')
      component.orgReadData = { sbOrgType: 'ministry', orgHierarchyFrameworkId: 'fw1' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.hasOrgHierarchyFrameworkId()).toBe(true)
    })

    it('should return false when org has no orgHierarchyFrameworkId', () => {
      component.organizationCtrl = new FormControl('x')
      component.orgReadData = { sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.hasOrgHierarchyFrameworkId()).toBe(false)
    })

    it('should return true via MdoL0Admin branch', () => {
      component.organizationCtrl = new FormControl('x')
      component.orgReadData = { sbOrgType: 'state', orgHierarchyFrameworkId: 'fw2' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_admin']))
      expect(component.hasOrgHierarchyFrameworkId()).toBe(true)
    })

    it('should return true via parentOrgReadData branch', () => {
      component.organizationCtrl = new FormControl('x')
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'ministry', orgHierarchyFrameworkId: 'fw3' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      expect(component.hasOrgHierarchyFrameworkId()).toBe(true)
    })

    it('should return true when org from filteredOrganizations has framework id', () => {
      const org = { identifier: 'id1', orgHierarchyFrameworkId: 'fw4' }
      component.organizationCtrl = new FormControl('id1')
      component.filteredOrganizations = [org]
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      expect(component.hasOrgHierarchyFrameworkId()).toBe(true)
    })
  })

  // ─── cancelHierarchyCreation ──────────────────────────────────────────────

  describe('cancelHierarchyCreation', () => {
    it('should reset organizationCtrl and restore filteredOrganizations', () => {
      component.allOrganizations = [{ orgName: 'A' }] as any
      component.organizationCtrl = new FormControl('x')
      const mockSingleSelect: any = { close: jest.fn() }
      component.singleSelect = mockSingleSelect
      component.cancelHierarchyCreation()
      expect(component.organizationCtrl.value).toBeNull()
      expect(component.filteredOrganizations).toEqual(component.allOrganizations)
      expect(mockSingleSelect.close).toHaveBeenCalled()
    })

    it('should not throw when singleSelect is undefined', () => {
      (component as any).singleSelect = undefined
      expect(() => component.cancelHierarchyCreation()).not.toThrow()
    })
  })

  // ─── createNewHierarchy ───────────────────────────────────────────────────

  describe('createNewHierarchy', () => {
    it('should create framework and set snackbar on success (non-MdoL0)', async () => {
      const selectedOrg = { identifier: 'org1', orgName: 'Org1' }
      component.organizationCtrl = new FormControl('org1')
      component.filteredOrganizations = [selectedOrg]
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.createMasterFrameWork.mockReturnValue(
        of({ result: { framework: { id: 'fw1' } } })
      )
      jest.spyOn(component as any, 'getCentenrOrStateList').mockResolvedValue(undefined)
      jest.useFakeTimers()
      await component.createNewHierarchy()
      jest.runAllTimers()
      jest.useRealTimers()
      expect(mockOrgHieService.createMasterFrameWork).toHaveBeenCalled()
    })

    it('should show failure snackbar when createFramework result is missing', async () => {
      const selectedOrg = { identifier: 'org1', orgName: 'Org1' }
      component.organizationCtrl = new FormControl('org1')
      component.filteredOrganizations = [selectedOrg]
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.createMasterFrameWork.mockReturnValue(of({}))
      await component.createNewHierarchy()
      expect(mockSnackbar.open).toHaveBeenCalledWith(`Failed to create framework for Org1`)
    })

    it('should handle error in createMasterFrameWork and call snackbar', async () => {
      const selectedOrg = { identifier: 'org1', orgName: 'Org1' }
      component.organizationCtrl = new FormControl('org1')
      component.filteredOrganizations = [selectedOrg]
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.createMasterFrameWork.mockReturnValue(
        throwError({ error: { params: { errMsg: 'API error' } } })
      )
      await component.createNewHierarchy()
      expect(mockSnackbar.open).toHaveBeenCalledWith('API error')
    })

    it('should do nothing when selectedOrg is null', async () => {
      component.organizationCtrl = new FormControl(null)
      component.orgReadData = { sbOrgType: 'department' }
      component.parentOrgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      await component.createNewHierarchy()
      expect(mockOrgHieService.createMasterFrameWork).not.toHaveBeenCalled()
    })

    it('should use orgReadData.id when MdoL0 is true', async () => {
      component.orgReadData = { id: 'root1', sbOrgType: 'ministry', orgName: 'Ministry Org' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      mockOrgHieService.createMasterFrameWork.mockReturnValue(
        of({ result: { framework: { id: 'fw1' } } })
      )
      jest.spyOn(component as any, 'getCentenrOrStateList').mockResolvedValue(undefined)
      jest.useFakeTimers()
      await component.createNewHierarchy()
      jest.runAllTimers()
      jest.useRealTimers()
      const callArg = mockOrgHieService.createMasterFrameWork.mock.calls[0][0]
      expect(callArg.identifier).toBe('root1')
    })
  })

  // ─── checkloader ──────────────────────────────────────────────────────────

  describe('checkloader', () => {
    it('should forward event to loaderService', () => {
      component.checkloader(true)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      component.checkloader(false)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })
  })

  // ─── redirectOrg ──────────────────────────────────────────────────────────

  describe('redirectOrg', () => {
    it('should navigate with correct params (non-MdoL0)', () => {
      component.orgReadData = { sbOrgType: 'department' }
      component.selectedOrgType = 'state'
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      const event = { additionalProperties: { orgId: 'dept1' }, name: 'Dept' }
      component.redirectOrg(event)
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/roles/dept1/users'],
        expect.objectContaining({ queryParams: expect.objectContaining({ subOrgType: 'state' }) })
      )
    })

    it('should navigate with subOrgType state when MdoL0 is true', () => {
      component.orgReadData = { sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      const event = { additionalProperties: { orgId: 'min1' }, name: 'Ministry' }
      component.redirectOrg(event)
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/home/roles/min1/users'],
        expect.objectContaining({ queryParams: expect.objectContaining({ subOrgType: 'state' }) })
      )
    })
  })

  // ─── downloadTemplate ────────────────────────────────────────────────────

  describe('downloadTemplate', () => {
    it('should download and show snackbar on success', async () => {
      const org = { identifier: 'id1', orgHierarchyFrameworkId: 'fw1' }
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [org] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.downloadSampleTemplate.mockReturnValue(of({ data: 'blob' }))
      await component.downloadTemplate()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Download successfully')
    })

    it('should handle error and show snackbar', async () => {
      const org = { identifier: 'id1', orgHierarchyFrameworkId: 'fw1' }
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [org] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.downloadSampleTemplate.mockReturnValue(
        throwError({ error: { params: { errMsg: 'Download error' } } })
      )
      await component.downloadTemplate()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Download error')
    })

    it('should do nothing when frameworkData has no orgHierarchyFrameworkId', async () => {
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [{ identifier: 'id1' }] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      await component.downloadTemplate()
      expect(mockOrgHieService.downloadSampleTemplate).not.toHaveBeenCalled()
    })
  })

  // ─── exportData ───────────────────────────────────────────────────────────

  describe('exportData', () => {
    it('should export and show snackbar on success', async () => {
      const org = { identifier: 'id1', orgHierarchyFrameworkId: 'fw1', orgName: 'Org1' }
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [org] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.exportFramework.mockReturnValue(of({ data: 'blob' }))
      await component.exportData()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Exported successfully for Org1')
    })

    it('should handle error and show snackbar on export failure', async () => {
      const org = { identifier: 'id1', orgHierarchyFrameworkId: 'fw1', orgName: 'Org1' }
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [org] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.exportFramework.mockReturnValue(
        throwError({ error: { params: { errMsg: 'Export error' } } })
      )
      await component.exportData()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Export error')
    })

    it('should do nothing when frameworkData has no orgHierarchyFrameworkId', async () => {
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [{ identifier: 'id1' }] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      await component.exportData()
      expect(mockOrgHieService.exportFramework).not.toHaveBeenCalled()
    })
  })

  // ─── getselectedOrgData ───────────────────────────────────────────────────

  describe('getselectedOrgData', () => {
    it('should return orgReadData when MdoL0 is true', () => {
      component.orgReadData = { sbOrgType: 'ministry', id: 'root' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.getselectedOrgData()).toEqual(component.orgReadData)
    })

    it('should return matching org from allOrganizations', () => {
      const org = { identifier: 'id1', orgName: 'Org1' }
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [org] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      expect(component.getselectedOrgData()).toEqual(org)
    })

    it('should return null when no match', () => {
      component.organizationCtrl = new FormControl('unknown')
      component.allOrganizations = [{ identifier: 'id1' }] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      expect(component.getselectedOrgData()).toBeNull()
    })
  })

  // ─── onFileSelected ───────────────────────────────────────────────────────

  describe('onFileSelected', () => {
    it('should call uploadExcelFile for valid file', async () => {
      const mockFile = { name: 'test.xlsx', size: 1024, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      jest.spyOn(component as any, 'uploadExcelFile').mockResolvedValue(undefined)
      await component.onFileSelected({ target: { files: [mockFile] } })
      expect((component as any).uploadExcelFile).toHaveBeenCalledWith(mockFile)
    })

    it('should show message for invalid file type', async () => {
      const mockFile = { name: 'test.csv', size: 100, type: 'text/csv' }
      jest.spyOn(component as any, 'clearFileInput').mockImplementation(() => { })
      await component.onFileSelected({ target: { files: [mockFile] } })
      expect(mockSnackbar.open).toHaveBeenCalledWith('Please select a valid Excel file (.xlsx)', 'Close', expect.any(Object))
    })

    it('should show message when file size exceeds 5MB', async () => {
      const mockFile = {
        name: 'big.xlsx',
        size: 6 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
      jest.spyOn(component as any, 'clearFileInput').mockImplementation(() => { })
      await component.onFileSelected({ target: { files: [mockFile] } })
      expect(mockSnackbar.open).toHaveBeenCalledWith('File size should not exceed 5MB', 'Close', expect.any(Object))
    })

    it('should not do anything when no file is selected', async () => {
      await component.onFileSelected({ target: { files: [] } })
      expect(mockSnackbar.open).not.toHaveBeenCalled()
    })
  })

  // ─── isValidExcelFile ─────────────────────────────────────────────────────

  describe('isValidExcelFile', () => {
    it('should return true for xlsx', () => {
      const file = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } as File
      expect(component.isValidExcelFile(file)).toBe(true)
    })

    it('should return false for non-xlsx', () => {
      const file = { type: 'text/csv' } as File
      expect(component.isValidExcelFile(file)).toBe(false)
    })
  })

  // ─── uploadExcelFile ──────────────────────────────────────────────────────

  describe('uploadExcelFile', () => {
    it('should show success snackbar on successful upload', async () => {
      const org = { identifier: 'id1', orgHierarchyFrameworkId: 'fw1' }
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [org] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.uploadFreameworkTemplate.mockReturnValue(
        of({ result: { fileName: 'test.xlsx' } })
      )
      const mockFile = new File(['content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      await (component as any).uploadExcelFile(mockFile)
      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'File uploaded successfully. Please check after 5 minutes for the results.'
      )
    })

    it('should handle upload error and show snackbar', async () => {
      const org = { identifier: 'id1', orgHierarchyFrameworkId: 'fw1' }
      component.organizationCtrl = new FormControl('id1')
      component.allOrganizations = [org] as any
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      mockOrgHieService.uploadFreameworkTemplate.mockReturnValue(
        throwError({ error: { params: { errMsg: 'Upload failed' } } })
      )
      const mockFile = new File(['content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      await (component as any).uploadExcelFile(mockFile)
      expect(mockSnackbar.open).toHaveBeenCalledWith('Upload failed')
      expect(component.bulkUploadRefresh).toBe(false)
    })
  })

  // ─── clearFileInput ───────────────────────────────────────────────────────

  describe('clearFileInput', () => {
    it('should clear fileInput nativeElement value', () => {
      const mockFileInput: any = { nativeElement: { value: 'somefile.xlsx' } }
      component.fileInput = mockFileInput
      component.clearFileInput()
      expect(mockFileInput.nativeElement.value).toBe('')
    })

    it('should not throw when fileInput is undefined', () => {
      (component as any).fileInput = undefined
      expect(() => component.clearFileInput()).not.toThrow()
    })
  })

  // ─── showMessage ──────────────────────────────────────────────────────────

  describe('showMessage', () => {
    it('should call snackbar.open with message and duration', () => {
      component.showMessage('Test message')
      expect(mockSnackbar.open).toHaveBeenCalledWith('Test message', 'Close', { duration: 5000 })
    })
  })

  // ─── checkIfMdoL0 ────────────────────────────────────────────────────────

  describe('checkIfMdoL0', () => {
    it('should return true for ministry type with mdo_leader role', () => {
      component.orgReadData = { sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.checkIfMdoL0()).toBe(true)
    })

    it('should return true for state type with mdo_leader role', () => {
      component.orgReadData = { sbOrgType: 'state' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.checkIfMdoL0()).toBe(true)
    })

    it('should return false when role is not mdo_leader', () => {
      component.orgReadData = { sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_admin']))
      expect(component.checkIfMdoL0()).toBe(false)
    })

    it('should return false when orgReadData is undefined', () => {
      component.orgReadData = undefined
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.checkIfMdoL0()).toBe(false)
    })
  })

  // ─── checkIfMdoL0Admin ───────────────────────────────────────────────────

  describe('checkIfMdoL0Admin', () => {
    it('should return true for ministry type with mdo_admin role', () => {
      component.orgReadData = { sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_admin']))
      expect(component.checkIfMdoL0Admin()).toBe(true)
    })

    it('should return false when role is not mdo_admin', () => {
      component.orgReadData = { sbOrgType: 'state' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      expect(component.checkIfMdoL0Admin()).toBe(false)
    })
  })

  // ─── checkIfParentIsMdoL0 ────────────────────────────────────────────────

  describe('checkIfParentIsMdoL0', () => {
    it('should return true when parentOrgReadData is ministry', () => {
      component.parentOrgReadData = { sbOrgType: 'ministry' }
      expect(component.checkIfParentIsMdoL0()).toBe(true)
    })

    it('should return true when parentOrgReadData is state', () => {
      component.parentOrgReadData = { sbOrgType: 'state' }
      expect(component.checkIfParentIsMdoL0()).toBe(true)
    })

    it('should return false for other parent org types', () => {
      component.parentOrgReadData = { sbOrgType: 'department' }
      expect(component.checkIfParentIsMdoL0()).toBe(false)
    })

    it('should return false when parentOrgReadData is undefined', () => {
      component.parentOrgReadData = undefined
      expect(component.checkIfParentIsMdoL0()).toBe(false)
    })
  })

  // ─── getOrgReadAndDetails ────────────────────────────────────────────────

  describe('getOrgReadAndDetails', () => {
    it('should set orgSearchData on success (non-ministry/state first org read)', () => {
      const orgRes = {
        params: { status: 'success' },
        result: {
          response: {
            sbOrgType: 'department',
            rootOrgId: 'rootId',
            ministryOrStateType: 'department',
          }
        }
      }
      const detailsRes = { result: { content: [{ id: 'c1' }] } }
      mockOrgHieService.getOrgReadData.mockReturnValue(of(orgRes))
      mockOrgHieService.getOrganizationDetails.mockReturnValue(of(detailsRes))
      component.getOrgReadAndDetails()
      expect(component.orgSearchData).toEqual([{ id: 'c1' }])
    })

    it('should handle ministry/state type and call parent org read', () => {
      const orgRes = {
        params: { status: 'success' },
        result: {
          response: {
            sbOrgType: 'ministry',
            ministryOrStateType: 'ministry',
            ministryOrStateId: 'parentId',
          }
        }
      }
      const parentOrgRes = {
        result: {
          response: {
            sbOrgType: 'ministry',
            ministryOrStateId: 'parentId',
          }
        }
      }
      const detailsRes = { result: { content: [{ id: 'c2' }] } }
      mockOrgHieService.getOrgReadData
        .mockReturnValueOnce(of(orgRes))
        .mockReturnValueOnce(of(parentOrgRes))
      mockOrgHieService.getOrganizationDetails.mockReturnValue(of(detailsRes))
      component.getOrgReadAndDetails()
      expect(component.orgSearchData).toEqual([{ id: 'c2' }])
    })

    it('should handle when parentOrgReadData is null inside nested switchMap', () => {
      const orgRes = {
        params: { status: 'success' },
        result: {
          response: {
            sbOrgType: 'ministry',
            ministryOrStateType: 'ministry',
            ministryOrStateId: 'parentId',
          }
        }
      }
      const parentOrgRes = { result: { response: null } }
      mockOrgHieService.getOrgReadData
        .mockReturnValueOnce(of(orgRes))
        .mockReturnValueOnce(of(parentOrgRes))
      component.getOrgReadAndDetails()
      expect(component.orgSearchData).toBeUndefined()
    })

    it('should handle failed status and show snackbar for errMsg', () => {
      const errRes = {
        error: { params: { errMsg: 'Org error' } }
      }
      mockOrgHieService.getOrgReadData.mockReturnValue(of(errRes))
      component.getOrgReadAndDetails()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Org error')
    })

    it('should handle API error in subscribe error handler', () => {
      mockOrgHieService.getOrgReadData.mockReturnValue(
        throwError({ error: { params: { errMsg: 'Fetch error' } } })
      )
      component.getOrgReadAndDetails()
      expect(mockSnackbar.open).toHaveBeenCalledWith('Fetch error')
    })

    it('should handle non-null orgReadData in non-ministry branch', () => {
      const orgRes = {
        params: { status: 'success' },
        result: {
          response: {
            sbOrgType: 'department',
            rootOrgId: 'rootId',
            ministryOrStateType: 'other',
          }
        }
      }
      const detailsRes = { result: { content: [{ id: 'c3' }] } }
      mockOrgHieService.getOrgReadData.mockReturnValue(of(orgRes))
      mockOrgHieService.getOrganizationDetails.mockReturnValue(of(detailsRes))
      component.getOrgReadAndDetails()
      expect(component.orgSearchData).toEqual([{ id: 'c3' }])
    })
  })

  // ─── openBulkUploadDialog ────────────────────────────────────────────────

  describe('openBulkUploadDialog', () => {
    it('should open dialog and refresh on close (MdoL0)', async () => {
      component.orgReadData = { sbOrgType: 'ministry' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set(['mdo_leader']))
      const afterClosedCallbacks: any[] = []
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue({
          subscribe: jest.fn((cb: any) => afterClosedCallbacks.push(cb))
        })
      }
      mockDialog.open.mockReturnValue(mockDialogRef)
      jest.spyOn(component as any, 'getOrgReadAndDetails').mockResolvedValue(undefined)

      component.openBulkUploadDialog()
      expect(mockDialog.open).toHaveBeenCalled()

      await afterClosedCallbacks[0]('result')
      expect((component as any).getOrgReadAndDetails).toHaveBeenCalled()
      expect(component.bulkUploadRefresh).toBe(false)
    })

    it('should call getCentenrOrStateList on close when not MdoL0', async () => {
      component.orgReadData = { sbOrgType: 'department' }
      mockOrgHieService.getUserRoles.mockReturnValue(new Set<string>())
      const afterClosedCallbacks: any[] = []
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue({
          subscribe: jest.fn((cb: any) => afterClosedCallbacks.push(cb))
        })
      }
      mockDialog.open.mockReturnValue(mockDialogRef)
      jest.spyOn(component as any, 'getCentenrOrStateList').mockResolvedValue(undefined)

      component.openBulkUploadDialog()
      await afterClosedCallbacks[0]('result')
      expect((component as any).getCentenrOrStateList).toHaveBeenCalledWith(component.selectedOrgType)
    })
  })

  // ─── userRoles getter ────────────────────────────────────────────────────

  describe('userRoles getter', () => {
    it('should return userRoles from activeRoute snapshot', () => {
      expect(component.userRoles).toEqual(new Set(['mdo_admin']))
    })
  })

  // ─── orgId getter ────────────────────────────────────────────────────────

  describe('orgId getter', () => {
    it('should return rootOrgId from activeRoute snapshot', () => {
      expect(component.orgId).toBe('org123')
    })
  })
})
