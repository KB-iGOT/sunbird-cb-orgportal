import { UserOnboardingComponent } from './user-onboarding.component'

describe('UserOnboardingComponent', () => {
  let component: UserOnboardingComponent
  let mockActivatedRoute: any
  let mockOrgHieService: any

  const mockQueryParams = {
    orgId: 'org123',
    orgName: 'Test Org'
  }

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        queryParams: mockQueryParams
      }
    }

    mockOrgHieService = {
      getOrgData: jest.fn().mockReturnValue({ id: 'org123', name: 'Test Org' })
    }

    component = new UserOnboardingComponent(mockActivatedRoute, mockOrgHieService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize createUserTabs as empty array', () => {
      expect(component.createUserTabs).toEqual([])
    })

    it('should initialize selectedTab as undefined', () => {
      expect(component.selectedTab).toBeUndefined()
    })

    it('should have EventEmitter outputs', () => {
      expect(component.userCreated).toBeDefined()
      expect(component.showDesignationTab).toBeDefined()
    })
  })

  describe('ngOnInit', () => {
    it('should set orgData from queryParams', () => {
      component.ngOnInit()

      expect(component.orgData).toEqual(mockQueryParams)
    })

    it('should initialize createUserTabs with three tabs', () => {
      component.ngOnInit()

      expect(component.createUserTabs).toHaveLength(3)
      expect(component.createUserTabs[0]).toEqual({ name: 'Bulk Creation', value: 'bulkCreation' })
      expect(component.createUserTabs[1]).toEqual({ name: 'Custom Registration Link', value: 'customRegLink' })
      expect(component.createUserTabs[2]).toEqual({ name: 'Individual Creation', value: 'individualCreation' })
    })

    it('should set selectedTab to individualCreation by default', () => {
      component.ngOnInit()

      expect(component.selectedTab).toEqual({ name: 'Individual Creation', value: 'individualCreation' })
    })

    it('should handle missing queryParams gracefully', () => {
      mockActivatedRoute.snapshot.queryParams = null

      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should set orgData when queryParams exist', () => {
      const params = { orgId: 'org456', mdoInfo: 'mdo' }
      mockActivatedRoute.snapshot.queryParams = params

      component.ngOnInit()

      expect(component.orgData).toEqual(params)
    })
  })

  describe('onTabChange', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should update selectedTab when tab changes', async () => {
      const newTab = { name: 'Bulk Creation', value: 'bulkCreation' }

      await component.onTabChange(newTab)

      expect(component.selectedTab).toEqual(newTab)
    })

    it('should call orgHieService.getOrgData when tab is customRegLink', async () => {
      const customRegLinkTab = { name: 'Custom Registration Link', value: 'customRegLink' }

      await component.onTabChange(customRegLinkTab)

      expect(mockOrgHieService.getOrgData).toHaveBeenCalled()
    })

    it('should set frameworkOrgData when tab is customRegLink', async () => {
      const customRegLinkTab = { name: 'Custom Registration Link', value: 'customRegLink' }
      const mockOrgData = { id: 'org123', name: 'Test Org' }
      mockOrgHieService.getOrgData.mockReturnValue(mockOrgData)

      await component.onTabChange(customRegLinkTab)

      expect(component.frameworkOrgData).toEqual(mockOrgData)
    })

    it('should not call getOrgData for non-customRegLink tabs', async () => {
      const bulkCreationTab = { name: 'Bulk Creation', value: 'bulkCreation' }

      await component.onTabChange(bulkCreationTab)

      expect(mockOrgHieService.getOrgData).not.toHaveBeenCalled()
    })

    it('should not call getOrgData for individualCreation tab', async () => {
      const individualTab = { name: 'Individual Creation', value: 'individualCreation' }

      await component.onTabChange(individualTab)

      expect(mockOrgHieService.getOrgData).not.toHaveBeenCalled()
    })
  })

  describe('navigateToDesignation', () => {
    it('should emit showDesignationTab event with the given event value', () => {
      const emittedValues: any[] = []
      component.showDesignationTab.subscribe((val: any) => emittedValues.push(val))

      component.navigateToDesignation({ tab: 'designation' })

      expect(emittedValues).toHaveLength(1)
      expect(emittedValues[0]).toEqual({ tab: 'designation' })
    })

    it('should emit boolean true value', () => {
      const emittedValues: any[] = []
      component.showDesignationTab.subscribe((val: any) => emittedValues.push(val))

      component.navigateToDesignation(true)

      expect(emittedValues[0]).toBe(true)
    })
  })

  describe('onUserCreated', () => {
    it('should emit userCreated event with true', () => {
      const emittedValues: boolean[] = []
      component.userCreated.subscribe((val: boolean) => emittedValues.push(val))

      component.onUserCreated(true)

      expect(emittedValues).toHaveLength(1)
      expect(emittedValues[0]).toBe(true)
    })

    it('should emit userCreated event with false', () => {
      const emittedValues: boolean[] = []
      component.userCreated.subscribe((val: boolean) => emittedValues.push(val))

      component.onUserCreated(false)

      expect(emittedValues[0]).toBe(false)
    })
  })
})

