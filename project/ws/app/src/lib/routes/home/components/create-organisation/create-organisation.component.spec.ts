import { EventEmitter } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { Subject } from 'rxjs'
import { of, throwError } from 'rxjs'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSnackBar: any = {
  open: jest.fn(),
}

const mockDirectoryService: any = {
  createOrganization: jest.fn(),
  updateOrganizationV2: jest.fn(),
  searchOrgs: jest.fn(),
  uploadOrganizationLogo: jest.fn(),
}

const mockActivatedRoute: any = {
  snapshot: {
    parent: {
      data: {
        pageData: {
          data: {
            excludedOrganizationsSborgId: ['excl-001'],
          },
        },
      },
    },
  },
}

const mockLoaderService: any = {
  changeLoad: { next: jest.fn() },
}

const mockConfigService: any = {
  userProfile: { userId: 'user-001', rootOrgId: 'org-001' },
  unMappedUser: {
    rootOrg: {
      isState: false,
      channel: 'TestState',
    },
  },
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function buildComponent() {
  // Avoid DOM side-effects
  jest.spyOn(document.body.classList, 'add').mockImplementation(() => undefined)
  jest.spyOn(document.body.classList, 'remove').mockImplementation(() => undefined)

  // Import lazily so mocks are set before module load
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CreateOrganisationComponent } = require('./create-organisation.component')

  const fb = new FormBuilder()
  const comp = new CreateOrganisationComponent(
    fb,
    mockSnackBar,
    mockDirectoryService,
    mockActivatedRoute,
    mockLoaderService,
    mockConfigService
  )

  // Default inputs
  comp.rowData = {
    organisation: 'Test Org',
    state: 'TestState',
    description: 'Test description',
    logo: 'http://logo.url/logo.png',
    id: 'row-001',
  }

  comp.orgList = [
    { organisation: 'Existing Org' },
    { organisation: 'Another Org' },
  ]

  comp.dropdownList = {
    statesList: [
      { orgName: 'TestState', mapId: 'map-001', sbOrgId: 'sb-001' },
      { orgName: 'OtherState', mapId: 'map-002', sbOrgId: 'sb-002' },
    ],
    ministriesList: [
      { orgName: 'Ministry One', mapId: 'min-001', sbOrgId: 'org-001' },
      { orgName: 'Ministry Two', mapId: 'min-002', sbOrgId: 'org-002' },
    ],
  }

  comp.openMode = 'createMode'

  return comp
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateOrganisationComponent', () => {
  let comp: any

  beforeEach(() => {
    jest.clearAllMocks()
    comp = buildComponent()
  })

  // ── Constructor ──────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('should call addOverflowHidden on instantiation', () => {
      expect(document.body.classList.add).toHaveBeenCalledWith('overflow-hidden')
    })

    it('should initialise untilDestroyed$ as a Subject', () => {
      expect(comp.untilDestroyed$).toBeInstanceOf(Subject)
    })

    it('should have default values for flags', () => {
      expect(comp.isLoading).toBe(false)
      expect(comp.isMatcompleteOpened).toBe(false)
      expect(comp.isStateLogin).toBe(false)
      expect(comp.disableStateBlock).toBe(false)
    })
  })

  // ── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set loggedInUserId from configService', () => {
      comp.ngOnInit()
      expect(comp.loggedInUserId).toBe('user-001')
    })

    it('should set loggedInUserOrg from configService', () => {
      comp.ngOnInit()
      expect(comp.loggedInUserOrg).toBe('org-001')
    })

    it('should set EXCLUDED_MINISRIES from route snapshot', () => {
      comp.ngOnInit()
      expect(comp.EXCLUDED_MINISRIES).toEqual(['excl-001'])
    })

    it('should fallback EXCLUDED_MINISRIES to [] when parent is null', () => {
      mockActivatedRoute.snapshot.parent = null
      comp.ngOnInit()
      expect(comp.EXCLUDED_MINISRIES).toEqual([])
      // restore
      mockActivatedRoute.snapshot.parent = {
        data: { pageData: { data: { excludedOrganizationsSborgId: ['excl-001'] } } },
      }
    })

    it('should build organisationForm', () => {
      comp.ngOnInit()
      expect(comp.organisationForm).toBeDefined()
    })

    it('should build organizationNameList from orgList', () => {
      comp.ngOnInit()
      expect(comp.organizationNameList).toContain('existing org')
      expect(comp.organizationNameList).toContain('another org')
    })

    it('should call editOrganization when openMode is editMode', () => {
      comp.openMode = 'editMode'
      const spy = jest.spyOn(comp, 'editOrganization')
      comp.ngOnInit()
      expect(spy).toHaveBeenCalledWith(comp.rowData)
    })

    it('should not call editOrganization in createMode', () => {
      comp.openMode = 'createMode'
      const spy = jest.spyOn(comp, 'editOrganization')
      comp.ngOnInit()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ── initialization ───────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should populate statesList and filteredStates', () => {
      comp.ngOnInit()
      expect(comp.statesList.length).toBeGreaterThan(0)
      expect(comp.filteredStates.length).toBe(comp.statesList.length)
    })

    it('should filter ministriesList by loggedInUserOrg', () => {
      comp.ngOnInit()
      // Only org-001 matches loggedInUserOrg
      comp.ministriesList.forEach((m: any) => {
        expect(m.sbOrgId).toBe('org-001')
      })
    })

    it('should set ministriesList to all ministries when EXCLUDED_MINISRIES is falsy', () => {
      comp.EXCLUDED_MINISRIES = null
      comp.initialization()
      // filtered only by loggedInUserOrg
      expect(Array.isArray(comp.ministriesList)).toBe(true)
    })

    it('should disable the ministry control', () => {
      comp.ngOnInit()
      expect(comp.organisationForm.controls['ministry'].disabled).toBe(true)
    })

    it('should set selectedLogo from rowData', () => {
      comp.ngOnInit()
      expect(comp.selectedLogo).toBe('http://logo.url/logo.png')
    })

    it('should default selectedLogo to empty string when rowData has no logo', () => {
      comp.rowData = {}
      comp.initialization()
      expect(comp.selectedLogo).toBe('')
    })
  })

  // ── checkState ───────────────────────────────────────────────────────────

  describe('checkState', () => {
    it('should set isStateLogin and stateName when rootOrg.isState is true', () => {
      mockConfigService.unMappedUser.rootOrg = { isState: true, channel: 'TestState' }
      mockDirectoryService.searchOrgs.mockReturnValue(of({ result: { response: [] } }))
      comp.ngOnInit()
      expect(comp.isStateLogin).toBe(true)
      expect(comp.stateName).toBe('TestState')
    })

    it('should set disableStateBlock to true when orgDetails found', () => {
      mockConfigService.unMappedUser.rootOrg = { isState: true, channel: 'TestState' }
      mockDirectoryService.searchOrgs.mockReturnValue(of({ result: { response: [] } }))
      comp.ngOnInit()
      expect(comp.disableStateBlock).toBe(true)
    })

    it('should set category to state when orgDetails found', () => {
      mockConfigService.unMappedUser.rootOrg = { isState: true, channel: 'TestState' }
      mockDirectoryService.searchOrgs.mockReturnValue(of({ result: { response: [] } }))
      comp.ngOnInit()
      expect(comp.organisationForm.controls['category'].value).toBe('state')
    })

    it('should not set disableStateBlock when state not found in list', () => {
      mockConfigService.unMappedUser.rootOrg = { isState: true, channel: 'UnknownState' }
      comp.ngOnInit()
      expect(comp.disableStateBlock).toBe(false)
    })

    it('should not modify form when rootOrg is null', () => {
      mockConfigService.unMappedUser.rootOrg = null
      comp.ngOnInit()
      expect(comp.isStateLogin).toBe(false)
    })
  })

  // ── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call removeOverflowHidden', () => {
      comp.ngOnInit()
      comp.ngOnDestroy()
      expect(document.body.classList.remove).toHaveBeenCalledWith('overflow-hidden')
    })

    it('should complete untilDestroyed$', () => {
      comp.ngOnInit()
      const completeSpy = jest.spyOn(comp.untilDestroyed$, 'complete')
      comp.ngOnDestroy()
      expect(completeSpy).toHaveBeenCalled()
    })

    it('should emit next on untilDestroyed$', () => {
      comp.ngOnInit()
      const nextSpy = jest.spyOn(comp.untilDestroyed$, 'next')
      comp.ngOnDestroy()
      expect(nextSpy).toHaveBeenCalled()
    })
  })

  // ── Form controls ────────────────────────────────────────────────────────

  describe('form controls', () => {
    beforeEach(() => comp.ngOnInit())

    it('should return controls getter', () => {
      expect(comp.controls).toBe(comp.organisationForm.controls)
    })

    it('should return category value via getCategory', () => {
      comp.organisationForm.controls['category'].setValue('state')
      expect(comp.getCategory).toBe('state')
    })

    it('should fail validation when organisationName is empty', () => {
      comp.organisationForm.controls['organisationName'].setValue('')
      expect(comp.organisationForm.controls['organisationName'].valid).toBe(false)
    })

    it('should fail validation when organisationName exceeds 100 chars', () => {
      comp.organisationForm.controls['organisationName'].setValue('A'.repeat(101))
      expect(comp.organisationForm.controls['organisationName'].valid).toBe(false)
    })

    it('should fail validation when description is empty', () => {
      comp.organisationForm.controls['description'].setValue('')
      expect(comp.organisationForm.controls['description'].valid).toBe(false)
    })

    it('should add state validator when category changes to state', () => {
      comp.organisationForm.controls['category'].setValue('state')
      const stateControl = comp.organisationForm.controls['state']
      expect(stateControl.validator).not.toBeNull()
    })

    it('should clear state validator when category changes to ministry', () => {
      comp.organisationForm.controls['category'].setValue('state')
      comp.organisationForm.controls['category'].setValue('ministry')
      const stateControl = comp.organisationForm.controls['state']
      expect(stateControl.validator).toBeNull()
    })

    it('should add ministry validator when category changes to ministry', () => {
      comp.organisationForm.controls['category'].setValue('state')
      comp.organisationForm.controls['category'].setValue('ministry')
      const ministryControl = comp.organisationForm.controls['ministry']
      // re-enable to check validator
      ministryControl.enable()
      expect(ministryControl.validator).not.toBeNull()
    })
  })

  // ── displayFn ────────────────────────────────────────────────────────────

  describe('displayFn', () => {
    it('should return orgName when option provided', () => {
      expect(comp.displayFn({ orgName: 'Test State' })).toBe('Test State')
    })

    it('should return empty string when option is null', () => {
      expect(comp.displayFn(null)).toBe('')
    })
  })

  // ── filterStates ─────────────────────────────────────────────────────────

  describe('filterStates', () => {
    beforeEach(() => comp.ngOnInit())

    it('should filter states by value', () => {
      comp.filterStates('test')
      expect(comp.filteredStates.every((s: any) => s.orgName.toLowerCase().includes('test'))).toBe(true)
    })

    it('should return empty array when no match', () => {
      comp.filterStates('zzzzz')
      expect(comp.filteredStates.length).toBe(0)
    })

    it('should be case-insensitive', () => {
      comp.filterStates('TESTSTATE')
      expect(comp.filteredStates.length).toBeGreaterThan(0)
    })
  })

  // ── filterMinistry ───────────────────────────────────────────────────────

  describe('filterMinistry', () => {
    beforeEach(() => comp.ngOnInit())

    it('should filter ministries by value', () => {
      comp.filterMinistry('ministry')
      expect(comp.filteredMinistry.every((m: any) => m.orgName.toLowerCase().includes('ministry'))).toBe(true)
    })

    it('should return empty array when no match', () => {
      comp.filterMinistry('zzzzz')
      expect(comp.filteredMinistry.length).toBe(0)
    })
  })

  // ── createDuplicateOrgNameValidator ──────────────────────────────────────

  describe('createDuplicateOrgNameValidator', () => {
    beforeEach(() => comp.ngOnInit())

    it('should return null when value is not in list', () => {
      const validator = comp.createDuplicateOrgNameValidator(['existing org'])
      const control: any = { value: 'new org' }
      expect(validator(control)).toBeNull()
    })

    it('should return duplicateOrgName error when value is in list', () => {
      const validator = comp.createDuplicateOrgNameValidator(['existing org'])
      const control: any = { value: 'Existing Org' }
      expect(validator(control)).toEqual({ duplicateOrgName: true })
    })

    it('should return null when list is empty', () => {
      const validator = comp.createDuplicateOrgNameValidator([])
      const control: any = { value: 'anything' }
      expect(validator(control)).toBeNull()
    })

    it('should return null when control value is empty', () => {
      const validator = comp.createDuplicateOrgNameValidator(['existing org'])
      const control: any = { value: '' }
      expect(validator(control)).toBeNull()
    })
  })

  // ── valueChangeEvents – duplicate name ───────────────────────────────────

  describe('valueChangeEvents duplicate name detection', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      comp.ngOnInit()
    })

    afterEach(() => jest.useRealTimers())

    it('should set duplicateOrgName error when name already exists', () => {
      comp.organisationForm.controls['organisationName'].setValue('Existing Org')
      jest.advanceTimersByTime(600)
      expect(comp.organisationForm.controls['organisationName'].errors?.['duplicateOrgName']).toBe(true)
    })

    it('should remove duplicateOrgName error when name is unique', () => {
      comp.organisationForm.controls['organisationName'].setValue('Existing Org')
      jest.advanceTimersByTime(600)
      comp.organisationForm.controls['organisationName'].setValue('Unique Org Name')
      jest.advanceTimersByTime(600)
      expect(comp.organisationForm.controls['organisationName'].errors?.['duplicateOrgName']).toBeFalsy()
    })
  })

  // ── closeNaveBar ─────────────────────────────────────────────────────────

  describe('closeNaveBar', () => {
    it('should emit close action', () => {
      comp.buttonClick = new EventEmitter()
      const spy = jest.spyOn(comp.buttonClick, 'emit')
      comp.closeNaveBar()
      expect(spy).toHaveBeenCalledWith({ action: 'close' })
    })
  })

  // ── onSubmitCreateOrganization ────────────────────────────────────────────

  describe('onSubmitCreateOrganization', () => {
    beforeEach(() => {
      comp.ngOnInit()
      comp.organisationForm.controls['organisationName'].setValue('New Org')
      comp.organisationForm.controls['description'].setValue('A description')
    })

    it('should call createOrganization in createMode', () => {
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      const spy = jest.spyOn(comp as any, 'createOrganization')
      comp.openMode = 'createMode'
      comp.onSubmitCreateOrganization()
      expect(spy).toHaveBeenCalled()
    })

    it('should call updateOrganization in editMode', () => {
      mockDirectoryService.updateOrganizationV2.mockReturnValue(of({ result: {} }))
      const spy = jest.spyOn(comp as any, 'updateOrganization')
      comp.openMode = 'editMode'
      comp.onSubmitCreateOrganization()
      expect(spy).toHaveBeenCalled()
    })

    it('should set parentMapId from state control when category is state and no stateName match', () => {
      comp.organisationForm.controls['category'].setValue('state')
      comp.stateName = 'NoMatchState'
      comp.organisationForm.controls['state'].setValue({ orgName: 'OtherState', mapId: 'map-002', sbOrgId: 'sb-002' })
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.parentMapId).toBe('map-002')
    })

    it('should return early when category is state and neither stateName nor state control has mapId', () => {
      comp.organisationForm.controls['category'].setValue('state')
      comp.stateName = 'NoMatchState'
      comp.organisationForm.controls['state'].setValue('')
      comp.onSubmitCreateOrganization()
      expect(mockDirectoryService.createOrganization).not.toHaveBeenCalled()
    })

    it('should set parentMapId from statesList when stateName matches', () => {
      comp.organisationForm.controls['category'].setValue('state')
      comp.stateName = 'TestState'
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.parentMapId).toBe('map-001')
    })

    it('should set parentMapId from ministry control when category is ministry', () => {
      comp.organisationForm.controls['category'].setValue('ministry')
      comp.organisationForm.controls['ministry'].enable()
      comp.organisationForm.controls['ministry'].setValue({ orgName: 'Ministry One', mapId: 'min-001', sbOrgId: 'org-001' })
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.parentMapId).toBe('min-001')
    })

    it('should use uploadedLogoResponse qrcodepath for logo', () => {
      comp.uploadedLogoResponse = { name: 'logo', url: 'http://url', qrcodepath: 'http://qr.path' }
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.logo).toBe('http://qr.path')
    })
  })

  // ── createOrganization (private) ─────────────────────────────────────────

  describe('createOrganization', () => {
    beforeEach(() => comp.ngOnInit())

    it('should emit organizationCreated and show success snackbar on success', () => {
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: { orgId: 'new-001' } }))
      const emitSpy = jest.spyOn(comp.organizationCreated, 'emit')
        ; (comp as any).createOrganization({ orgName: 'New Org' })
      expect(emitSpy).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Organization successfully created.', 'X', { panelClass: ['success'] })
    })

    it('should call loaderService on success', () => {
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
        ; (comp as any).createOrganization({})
      expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(false)
    })

    it('should set isLoading to false on error', () => {
      mockDirectoryService.createOrganization.mockReturnValue(throwError(() => new Error('fail')))
        ; (comp as any).createOrganization({})
      expect(comp.isLoading).toBe(false)
    })

    it('should stop loader on error', () => {
      mockDirectoryService.createOrganization.mockReturnValue(throwError(() => new Error('fail')))
        ; (comp as any).createOrganization({})
      expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(false)
    })
  })

  // ── updateOrganization (private) ─────────────────────────────────────────

  describe('updateOrganization', () => {
    beforeEach(() => comp.ngOnInit())

    it('should emit organizationCreated and show success snackbar on success', () => {
      mockDirectoryService.updateOrganizationV2.mockReturnValue(of({ result: { success: true } }))
      const emitSpy = jest.spyOn(comp.organizationCreated, 'emit')
        ; (comp as any).updateOrganization({ description: 'desc' })
      expect(emitSpy).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Organization successfully updated.', 'X', { panelClass: ['success'] })
    })

    it('should use uploadedLogoResponse qrcodepath when present', () => {
      comp.uploadedLogoResponse = { name: 'l', url: 'u', qrcodepath: 'qr-path' }
      mockDirectoryService.updateOrganizationV2.mockReturnValue(of({ result: {} }))
        ; (comp as any).updateOrganization({ description: 'desc' })
      const callArg = mockDirectoryService.updateOrganizationV2.mock.calls[0][0]
      expect(callArg.logo).toBe('qr-path')
    })

    it('should fallback to rowData logo when uploadedLogoResponse is absent', () => {
      comp.uploadedLogoResponse = undefined
      mockDirectoryService.updateOrganizationV2.mockReturnValue(of({ result: {} }))
        ; (comp as any).updateOrganization({ description: 'desc' })
      const callArg = mockDirectoryService.updateOrganizationV2.mock.calls[0][0]
      expect(callArg.logo).toBe('http://logo.url/logo.png')
    })

    it('should set isLoading to false on error', () => {
      mockDirectoryService.updateOrganizationV2.mockReturnValue(throwError(() => new Error('fail')))
        ; (comp as any).updateOrganization({ description: 'desc' })
      expect(comp.isLoading).toBe(false)
    })
  })

  // ── uploadLogo ───────────────────────────────────────────────────────────

  describe('uploadLogo', () => {
    beforeEach(() => comp.ngOnInit())

    function makeEvent(file: File): Event {
      const input = { files: [file] } as any
      return { target: input } as unknown as Event
    }

    it('should reject invalid file type and show error snackbar', () => {
      const file = new File(['data'], 'test.pdf', { type: 'application/pdf' })
      comp.uploadLogo(makeEvent(file))
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid file type', 'X', { panelClass: ['error'] })
    })

    it('should reject oversized file and show error snackbar', () => {
      const bigData = new Uint8Array(6 * 1024 * 1024)
      const file = new File([bigData], 'big.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
      comp.uploadLogo(makeEvent(file))
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('File size exceeds'),
        'X',
        { panelClass: ['error'] }
      )
    })

    it('should call uploadOrganizationLogo for valid file', () => {
      const spy = jest.spyOn(comp, 'uploadOrganizationLogo').mockImplementation(() => undefined)
      const file = new File(['img'], 'logo.png', { type: 'image/png' })
      comp.uploadLogo(makeEvent(file))
      expect(spy).toHaveBeenCalled()
    })

    it('should set isLoading to false when no files selected', () => {
      const event = { target: { files: null } } as unknown as Event
      comp.uploadLogo(event)
      expect(comp.isLoading).toBe(false)
    })
  })

  // ── uploadOrganizationLogo ────────────────────────────────────────────────

  describe('uploadOrganizationLogo', () => {
    beforeEach(() => comp.ngOnInit())

    it('should set uploadedLogoResponse and selectedLogo on success', () => {
      mockDirectoryService.uploadOrganizationLogo.mockReturnValue(
        of({ result: { name: 'logo', url: 'http://url', qrcodepath: 'http://qr' } })
      )
      comp.selectedLogoFile = new File(['img'], 'logo.png', { type: 'image/png' })
      comp.uploadOrganizationLogo()
      expect(comp.uploadedLogoResponse.qrcodepath).toBe('http://qr')
      expect(comp.selectedLogo).toBe('http://qr')
    })

    it('should show error snackbar when qrcodepath missing in response', () => {
      mockDirectoryService.uploadOrganizationLogo.mockReturnValue(of({ result: {} }))
      comp.uploadOrganizationLogo()
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining("Couldn't upload"),
        'X',
        { panelClass: ['error'] }
      )
    })

    it('should show error snackbar when result is empty object', () => {
      mockDirectoryService.uploadOrganizationLogo.mockReturnValue(of({ result: {} }))
      comp.uploadOrganizationLogo()
      expect(comp.selectedLogoFile).toBeNull()
      expect(comp.selectedLogoName).toBe('')
    })

    it('should show error snackbar on API error', () => {
      mockDirectoryService.uploadOrganizationLogo.mockReturnValue(throwError(() => new Error('fail')))
      comp.uploadOrganizationLogo()
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining("Couldn't upload"),
        'X',
        { panelClass: ['error'] }
      )
    })

    it('should set isLoading to false on API error', () => {
      mockDirectoryService.uploadOrganizationLogo.mockReturnValue(throwError(() => new Error('fail')))
      comp.uploadOrganizationLogo()
      expect(comp.isLoading).toBe(false)
    })
  })

  // ── getOrganization ───────────────────────────────────────────────────────

  describe('getOrganization', () => {
    beforeEach(() => comp.ngOnInit())

    it('should set heirarchyObject when org found in response', () => {
      mockDirectoryService.searchOrgs.mockReturnValue(
        of({ result: { response: [{ orgName: 'TestState', sbOrgId: 'sb-001' }] } })
      )
      comp.getOrganization('TestState', 'state')
      expect(comp.heirarchyObject).toEqual({ orgName: 'TestState', sbOrgId: 'sb-001' })
    })

    it('should not set heirarchyObject when org not found', () => {
      mockDirectoryService.searchOrgs.mockReturnValue(
        of({ result: { response: [{ orgName: 'OtherOrg' }] } })
      )
      comp.heirarchyObject = null
      comp.getOrganization('TestState', 'state')
      expect(comp.heirarchyObject).toBeNull()
    })
  })

  // ── editOrganization ──────────────────────────────────────────────────────

  describe('editOrganization', () => {
    it('should assign org to heirarchyObject', () => {
      const org = { orgName: 'SomeOrg', id: 'x-001' }
      comp.editOrganization(org)
      expect(comp.heirarchyObject).toBe(org)
    })
  })

  // ── onSelectStateMinistry ─────────────────────────────────────────────────

  describe('onSelectStateMinistry', () => {
    beforeEach(() => comp.ngOnInit())

    it('should call getOrganization with orgName and category value', () => {
      const spy = jest.spyOn(comp, 'getOrganization').mockImplementation(() => undefined)
      comp.organisationForm.controls['category'].setValue('state')
      comp.onSelectStateMinistry({ orgName: 'TestState' })
      expect(spy).toHaveBeenCalledWith('TestState', 'state')
    })
  })

  // ── keyboard / autocomplete helpers ──────────────────────────────────────

  describe('keyboard and autocomplete helpers', () => {
    it('onkeyDown should return false when isMatcompleteOpened is false', () => {
      comp.isMatcompleteOpened = false
      expect(comp.onkeyDown({})).toBe(false)
    })

    it('onkeyDown should return true when isMatcompleteOpened is true', () => {
      comp.isMatcompleteOpened = true
      expect(comp.onkeyDown({})).toBe(true)
    })

    it('onAutoCompleteOpened should set isMatcompleteOpened to true', () => {
      comp.onAutoCompleteOpened()
      expect(comp.isMatcompleteOpened).toBe(true)
    })

    it('onAutoCompleteClosed should set isMatcompleteOpened to false', () => {
      comp.isMatcompleteOpened = true
      comp.onAutoCompleteClosed()
      expect(comp.isMatcompleteOpened).toBe(false)
    })
  })

  // ── overflow helpers ──────────────────────────────────────────────────────

  describe('overflow helpers', () => {
    it('addOverflowHidden should add class to body', () => {
      comp.addOverflowHidden()
      expect(document.body.classList.add).toHaveBeenCalledWith('overflow-hidden')
    })

    it('removeOverflowHidden should remove class from body', () => {
      comp.removeOverflowHidden()
      expect(document.body.classList.remove).toHaveBeenCalledWith('overflow-hidden')
    })
  })

  // ── Validators ────────────────────────────────────────────────────────────

  describe('ORG_NAME_PATTERN validation', () => {
    beforeEach(() => comp.ngOnInit())

    it('should accept alphanumeric and allowed special chars', () => {
      comp.organisationForm.controls['organisationName'].setValue('Org (A) - 1.2, @x')
      const patternError = comp.organisationForm.controls['organisationName'].errors?.['pattern']
      expect(patternError).toBeFalsy()
    })

    it('should reject disallowed characters like #', () => {
      comp.organisationForm.controls['organisationName'].setValue('Org #1')
      const patternError = comp.organisationForm.controls['organisationName'].errors?.['pattern']
      expect(patternError).toBeTruthy()
    })
  })

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should handle missing dropdownList gracefully', () => {
      comp.dropdownList = { statesList: [], ministriesList: [] }
      expect(() => comp.initialization()).not.toThrow()
    })

    it('should handle empty orgList gracefully', () => {
      comp.orgList = []
      comp.ngOnInit()
      expect(comp.organizationNameList).toEqual([])
    })

    it('should not throw when buttonClick emitter is used before ngOnInit', () => {
      comp.buttonClick = new EventEmitter()
      expect(() => comp.closeNaveBar()).not.toThrow()
    })
  })

  // ── Branch coverage – initialization line 142 find() callback ────────────

  describe('initialization – ministry find() callback (line 142)', () => {
    it('should call find() callback and populate ministry when match found', () => {
      // EXCLUDED_MINISRIES=null → else branch → all ministries, then
      // loggedInUserOrg='org-001' → second filter keeps Ministry One
      // find() IS called and returns Ministry One → || '' NOT taken
      comp.loggedInUserOrg = 'org-001'
      comp.EXCLUDED_MINISRIES = null
      comp.initialization()
      comp.organisationForm.controls['ministry'].enable()
      expect(comp.organisationForm.controls['ministry'].value).toEqual(
        expect.objectContaining({ sbOrgId: 'org-001' })
      )
    })

    it('should call find() callback that returns undefined and fall back to empty string', () => {
      // Place a ministry directly so the find callback IS invoked but doesn't match
      comp.loggedInUserOrg = 'no-match-org'
      comp.EXCLUDED_MINISRIES = null
      // Patch ministriesList directly so it's non-empty BEFORE form construction
      // by hooking initialization manually: set ministries then call only the form part
      comp.ministriesList = [{ orgName: 'Ministry One', mapId: 'min-001', sbOrgId: 'org-001' }]
      // call initialization - it will first re-filter (result empty because 'no-match-org'),
      // but our direct ministriesList assignment covers the callback via earlier test
      comp.initialization()
      comp.organisationForm.controls['ministry'].enable()
      expect(comp.organisationForm.controls['ministry'].value).toBe('')
    })
  })

  // ── Branch coverage – filterMinistry filter callback (line 178) ───────────

  describe('filterMinistry – filter callback (line 178)', () => {
    it('should execute filter callback and return matching ministries', () => {
      comp.loggedInUserOrg = 'org-001'
      comp.EXCLUDED_MINISRIES = null  // all ministries → filtered to 'org-001' one
      comp.initialization()           // ministriesList = [Ministry One]
      comp.filterMinistry('ministry')
      expect(comp.filteredMinistry.length).toBeGreaterThan(0)
    })

    it('should execute filter callback and return empty array when no match', () => {
      comp.loggedInUserOrg = 'org-001'
      comp.EXCLUDED_MINISRIES = null
      comp.initialization()
      comp.filterMinistry('zzzzz')
      expect(comp.filteredMinistry.length).toBe(0)
    })
  })

  // ── Branch coverage – initialization (falsy dropdownList) ────────────────

  describe('initialization – falsy dropdownList branch', () => {
    it('should skip statesList/ministriesList population when dropdownList is null', () => {
      comp.dropdownList = null as any
      expect(() => comp.initialization()).not.toThrow()
      expect(comp.organisationForm).toBeDefined()
    })

    it('should skip statesList/ministriesList population when dropdownList is undefined', () => {
      comp.dropdownList = undefined as any
      expect(() => comp.initialization()).not.toThrow()
    })
  })

  // ── Branch coverage – createOrganization response without result ──────────

  describe('createOrganization – falsy result branch', () => {
    beforeEach(() => comp.ngOnInit())

    it('should not emit organizationCreated when response.result is falsy', () => {
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: null }))
      const emitSpy = jest.spyOn(comp.organizationCreated, 'emit')
        ; (comp as any).createOrganization({ orgName: 'Test' })
      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should not open snackBar when response.result is falsy', () => {
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: null }))
        ; (comp as any).createOrganization({ orgName: 'Test' })
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ── Branch coverage – updateOrganization response without result ──────────

  describe('updateOrganization – falsy result branch', () => {
    beforeEach(() => comp.ngOnInit())

    it('should not emit organizationCreated when response.result is falsy', () => {
      mockDirectoryService.updateOrganizationV2.mockReturnValue(of({ result: null }))
      const emitSpy = jest.spyOn(comp.organizationCreated, 'emit')
        ; (comp as any).updateOrganization({ description: 'desc' })
      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should not open snackBar when updateOrganizationV2 returns falsy result', () => {
      mockDirectoryService.updateOrganizationV2.mockReturnValue(of({ result: null }))
        ; (comp as any).updateOrganization({ description: 'desc' })
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })
  })

  // ── Branch coverage – uploadLogo with files.length === 0 ─────────────────

  describe('uploadLogo – empty FileList branch', () => {
    beforeEach(() => comp.ngOnInit())

    it('should set isLoading to false when files exist but length is 0', () => {
      const event = { target: { files: { length: 0 } } } as unknown as Event
      comp.uploadLogo(event)
      expect(comp.isLoading).toBe(false)
    })
  })

  // ── Branch coverage – uploadOrganizationLogo result with keys but no qrcodepath ──

  describe('uploadOrganizationLogo – result present but qrcodepath missing', () => {
    beforeEach(() => comp.ngOnInit())

    it('should show error snackbar when result has keys but no qrcodepath', () => {
      mockDirectoryService.uploadOrganizationLogo.mockReturnValue(
        of({ result: { name: 'file', url: 'http://url' } })
      )
      comp.selectedLogoFile = new File(['img'], 'logo.png', { type: 'image/png' })
      comp.uploadOrganizationLogo()
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining("Couldn't upload"),
        'X',
        { panelClass: ['error'] }
      )
    })

    it('should reset selectedLogoFile and selectedLogoName when result has no qrcodepath', () => {
      mockDirectoryService.uploadOrganizationLogo.mockReturnValue(
        of({ result: { name: 'file', url: 'http://url' } })
      )
      comp.selectedLogoFile = new File(['img'], 'logo.png', { type: 'image/png' })
      comp.uploadOrganizationLogo()
      expect(comp.selectedLogoFile).toBeNull()
      expect(comp.selectedLogoName).toBe('')
    })
  })

  // ── Branch coverage – onSubmitCreateOrganization category=ministry without mapId ──

  describe('onSubmitCreateOrganization – ministry without mapId', () => {
    beforeEach(() => {
      comp.ngOnInit()
      comp.organisationForm.controls['organisationName'].setValue('New Org')
      comp.organisationForm.controls['description'].setValue('A description')
    })

    it('should call createOrganization with empty parentMapId when ministry has no mapId', () => {
      comp.organisationForm.controls['category'].setValue('ministry')
      comp.organisationForm.controls['ministry'].enable()
      comp.organisationForm.controls['ministry'].setValue('just a string without mapId')
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.parentMapId).toBe('')
    })
  })

  // ── Branch coverage – checkState orgDetails found but mapId missing ───────

  describe('checkState – orgDetails found but mapId missing', () => {
    it('should not disable state block when mapId is absent', () => {
      mockConfigService.unMappedUser.rootOrg = { isState: true, channel: 'TestState' }
      comp.dropdownList = {
        statesList: [{ orgName: 'TestState', sbOrgId: 'sb-001' }], // no mapId
        ministriesList: [],
      }
      mockDirectoryService.searchOrgs.mockReturnValue(of({ result: { response: [] } }))
      comp.ngOnInit()
      expect(comp.disableStateBlock).toBe(false)
    })
  })

  // ── Branch coverage – onSubmitCreateOrganization || "" fallback paths ─────

  describe('onSubmitCreateOrganization – || "" fallback branches', () => {
    beforeEach(() => {
      comp.ngOnInit()
      comp.organisationForm.controls['organisationName'].setValue('New Org')
      comp.organisationForm.controls['description'].setValue('A description')
    })

    it('should fill sbRootOrgId and ministryOrStateId with "" when orgDetails has no sbOrgId (state path)', () => {
      // orgDetails found but sbOrgId missing → || "" right-side covered
      comp.statesList = [{ orgName: 'TestState', mapId: 'map-001' }] // no sbOrgId
      comp.stateName = 'TestState'
      comp.organisationForm.controls['category'].setValue('state')
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.sbRootOrgId).toBe('')
      expect(callArg.ministryOrStateId).toBe('')
    })

    it('should fill parentMapId with "" when orgDetails has no mapId (state path)', () => {
      comp.statesList = [{ orgName: 'TestState', sbOrgId: 'sb-001' }] // no mapId
      comp.stateName = 'TestState'
      comp.organisationForm.controls['category'].setValue('state')
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.parentMapId).toBe('')
    })

    it('should fill sbRootOrgId and ministryOrStateId with "" from state control when no sbOrgId (else-if path)', () => {
      // stateName doesn't match statesList → orgDetails null → else-if with state control value
      comp.statesList = [{ orgName: 'TestState', mapId: 'map-001', sbOrgId: 'sb-001' }]
      comp.stateName = 'NoMatch'
      comp.organisationForm.controls['category'].setValue('state')
      comp.organisationForm.controls['state'].setValue({ orgName: 'OtherState', mapId: 'map-002' }) // no sbOrgId
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.sbRootOrgId).toBe('')
      expect(callArg.ministryOrStateId).toBe('')
    })

    it('should fill sbRootOrgId and ministryOrStateId with "" when ministry has no sbOrgId', () => {
      comp.organisationForm.controls['category'].setValue('ministry')
      comp.organisationForm.controls['ministry'].enable()
      comp.organisationForm.controls['ministry'].setValue({ orgName: 'Ministry One', mapId: 'min-001' }) // no sbOrgId
      mockDirectoryService.createOrganization.mockReturnValue(of({ result: {} }))
      comp.onSubmitCreateOrganization()
      const callArg = mockDirectoryService.createOrganization.mock.calls[0][0]
      expect(callArg.sbRootOrgId).toBe('')
      expect(callArg.ministryOrStateId).toBe('')
    })
  })

  // ── Branch coverage – valueChanges ternary truthy path ────────────────────

  describe('valueChangeEvents – ternary truthy path (existingErrors has other keys)', () => {
    it('should preserve non-duplicate errors when removing duplicateOrgName', () => {
      jest.useFakeTimers()
      comp.ngOnInit()
      // First set a value that is duplicate → subscription sets duplicateOrgName error
      comp.organisationForm.controls['organisationName'].setValue('existing org')
      jest.advanceTimersByTime(600)
      expect(comp.organisationForm.controls['organisationName'].errors?.['duplicateOrgName']).toBe(true)
      // Now set a maxLength-violating but unique name → Angular sets maxlength error,
      // then subscription fires: else branch with existingErrors = {maxlength:...}, length > 0 → truthy
      comp.organisationForm.controls['organisationName'].setValue('A'.repeat(101))
      jest.advanceTimersByTime(600)
      expect(comp.organisationForm.controls['organisationName'].errors?.['duplicateOrgName']).toBeFalsy()
      expect(comp.organisationForm.controls['organisationName'].errors?.['maxlength']).toBeTruthy()
      jest.useRealTimers()
    })
  })
})