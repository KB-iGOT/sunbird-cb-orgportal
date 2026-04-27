import { DirectoryComponent } from './directory.component'

describe('DirectoryComponent', () => {
  let component: DirectoryComponent
  let mockConfigSvc: any
  let mockOrgHieService: any

  function createComponent() {
    component = new DirectoryComponent(mockConfigSvc, mockOrgHieService)
  }

  beforeEach(() => {
    mockConfigSvc = {
      orgReadData: { ministryOrStateType: '' },
      userRoles: new Set<string>(),
    }

    mockOrgHieService = {
      setUserRoles: jest.fn(),
      getUserRoles: jest.fn().mockReturnValue(new Set<string>()),
    }

    createComponent()
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise selectedTabIndex to 0', () => {
    expect(component.selectedTabIndex).toBe(0)
  })

  it('should have two default tabs', () => {
    expect(component.tabs.length).toBe(2)
    expect(component.tabs[0].value).toBe('organisation')
    expect(component.tabs[1].value).toBe('organisationHierarchies')
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call setOrganisationTabVisibility', () => {
      const spy = jest.spyOn(component, 'setOrganisationTabVisibility')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── ngAfterViewInit ──────────────────────────────────────────────────────────

  describe('ngAfterViewInit', () => {
    it('should assign temp to organisation tab when it matches', () => {
      const mockTemplate = { ref: 'orgTemplate' } as any
      component.organisationTabContent = mockTemplate
      component.organisationHierarchiesTabContent = { ref: 'hierTemplate' } as any
      component.ngAfterViewInit()
      const orgTab = component.tabs.find((t: any) => t.value === 'organisation')
      expect(orgTab.temp).toBe(mockTemplate)
    })

    it('should assign temp to organisationHierarchies tab', () => {
      const mockHierTemplate = { ref: 'hierTemplate' } as any
      component.organisationTabContent = { ref: 'orgTemplate' } as any
      component.organisationHierarchiesTabContent = mockHierTemplate
      component.ngAfterViewInit()
      const hierTab = component.tabs.find((t: any) => t.value === 'organisationHierarchies')
      expect(hierTab.temp).toBe(mockHierTemplate)
    })

    it('should handle null tabs gracefully', () => {
      component.tabs = null
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  // ─── setOrganisationTabVisibility ────────────────────────────────────────────

  describe('setOrganisationTabVisibility', () => {
    it('should call setUserRoles with configSvc userRoles', () => {
      component.setOrganisationTabVisibility()
      expect(mockOrgHieService.setUserRoles).toHaveBeenCalled()
    })

    it('should filter out organisation tab when ministryOrStateType is ministry', () => {
      mockConfigSvc.orgReadData = { ministryOrStateType: 'ministry' }
      component.setOrganisationTabVisibility()
      expect(component.tabs.some((t: any) => t.value === 'organisation')).toBe(false)
    })

    it('should filter out organisation tab when ministryOrStateType is Ministry (case-insensitive)', () => {
      mockConfigSvc.orgReadData = { ministryOrStateType: 'Ministry' }
      component.setOrganisationTabVisibility()
      expect(component.tabs.some((t: any) => t.value === 'organisation')).toBe(false)
    })

    it('should filter out organisation tab when ministryOrStateType is state', () => {
      mockConfigSvc.orgReadData = { ministryOrStateType: 'state' }
      component.setOrganisationTabVisibility()
      expect(component.tabs.some((t: any) => t.value === 'organisation')).toBe(false)
    })

    it('should keep all tabs when ministryOrStateType is empty', () => {
      mockConfigSvc.orgReadData = { ministryOrStateType: '' }
      component.setOrganisationTabVisibility()
      expect(component.tabs.length).toBe(2)
    })

    it('should keep all tabs when orgReadData is absent', () => {
      mockConfigSvc.orgReadData = undefined
      component.setOrganisationTabVisibility()
      expect(component.tabs.length).toBe(2)
    })

    it('should filter out organisation tab for spv when user has mdo_admin role', () => {
      mockConfigSvc.orgReadData = { ministryOrStateType: 'spv' }
      const roles = new Set<string>(['mdo_admin'])
      mockOrgHieService.getUserRoles.mockReturnValue(roles)
      component.setOrganisationTabVisibility()
      expect(component.tabs.some((t: any) => t.value === 'organisation')).toBe(false)
    })

    it('should keep organisation tab for spv when user does NOT have mdo_admin role', () => {
      mockConfigSvc.orgReadData = { ministryOrStateType: 'spv' }
      const roles = new Set<string>(['other_role'])
      mockOrgHieService.getUserRoles.mockReturnValue(roles)
      component.setOrganisationTabVisibility()
      expect(component.tabs.some((t: any) => t.value === 'organisation')).toBe(true)
    })

    it('should keep organisation tab for spv when getUserRoles returns null', () => {
      mockConfigSvc.orgReadData = { ministryOrStateType: 'spv' }
      mockOrgHieService.getUserRoles.mockReturnValue(null)
      component.setOrganisationTabVisibility()
      expect(component.tabs.some((t: any) => t.value === 'organisation')).toBe(true)
    })
  })

  // ─── onTabChange ──────────────────────────────────────────────────────────────

  describe('onTabChange', () => {
    it('should update selectedTabIndex from event', () => {
      component.onTabChange({ index: 1 })
      expect(component.selectedTabIndex).toBe(1)
    })

    it('should update selectedTabIndex to 0', () => {
      component.selectedTabIndex = 1
      component.onTabChange({ index: 0 })
      expect(component.selectedTabIndex).toBe(0)
    })
  })
})
