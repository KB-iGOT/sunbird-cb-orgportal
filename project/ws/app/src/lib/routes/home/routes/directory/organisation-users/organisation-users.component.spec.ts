import { of, Subject } from 'rxjs'
import { OrganisationUsersComponent } from './organisation-users.component'

describe('OrganisationUsersComponent', () => {
  let component: OrganisationUsersComponent
  let mockActivatedRoute: any
  let mockRouter: any
  let mockLoaderService: any
  let mockOrgHieService: any
  let queryParamsSubject: Subject<any>

  function createComponent(snapshotQueryParams: any = { roleId: 'org-001', tab: 'users' }) {
    queryParamsSubject = new Subject<any>()
    mockActivatedRoute = {
      snapshot: { queryParams: snapshotQueryParams },
      queryParams: queryParamsSubject.asObservable(),
    }
    mockRouter = { navigate: jest.fn() }
    mockLoaderService = { changeLoaderState: jest.fn() }
    mockOrgHieService = {
      getOrgReadData: jest.fn().mockReturnValue(of({ result: { response: { name: 'Test Org' } } })),
      setOrgData: jest.fn(),
      setParentOrgData: jest.fn(),
    }
    component = new OrganisationUsersComponent(
      mockActivatedRoute,
      mockRouter,
      mockLoaderService,
      mockOrgHieService
    )
  }

  beforeEach(() => {
    createComponent()
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise defaults', () => {
    expect(component.selectedTabIndex).toBe(0)
    expect(component.tabs).toEqual([])
    expect(component.orgDataLoaded).toBe(false)
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should set orgData from snapshot queryParams', () => {
      component.ngOnInit()
      expect(component.orgData).toEqual({ roleId: 'org-001', tab: 'users' })
    })

    it('should not override orgData when queryParams is falsy', () => {
      createComponent(null)
      jest.spyOn(component, 'checkAndGetOrgData').mockResolvedValue(undefined)
      component.ngOnInit()
      expect(component.orgData).toBeUndefined()
    })

    it('should populate the 6 tabs', () => {
      component.ngOnInit()
      expect(component.tabs).toHaveLength(6)
      expect(component.tabs.map(t => t.value)).toEqual([
        'users',
        'rolesAndAccess',
        'mentorManagement',
        'designationMaster',
        'userOnboarding',
        'userTransfer',
      ])
    })

    it('should set selectedTabIndex from queryParams tab', () => {
      component.ngOnInit()
      queryParamsSubject.next({ tab: 'rolesAndAccess' })
      expect(component.selectedTabIndex).toBe(1)
    })

    it('should not change selectedTabIndex if tab value is not found', () => {
      component.ngOnInit()
      queryParamsSubject.next({ tab: 'nonExistentTab' })
      expect(component.selectedTabIndex).toBe(0)
    })

    it('should not change selectedTabIndex if params has no tab key', () => {
      component.ngOnInit()
      queryParamsSubject.next({})
      expect(component.selectedTabIndex).toBe(0)
    })

    it('should call checkAndGetOrgData', () => {
      const spy = jest.spyOn(component, 'checkAndGetOrgData')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── checkAndGetOrgData ────────────────────────────────────────────────────

  describe('checkAndGetOrgData', () => {
    it('should resolve after calling getOrgData', async () => {
      component.orgData = { roleId: 'org-001' }
      await expect(component.checkAndGetOrgData()).resolves.toBeUndefined()
    })
  })

  // ─── getCurrentTabDetails ──────────────────────────────────────────────────

  describe('getCurrentTabDetails', () => {
    it('should return the current tab when tabs are populated', () => {
      component.ngOnInit()
      component.selectedTabIndex = 2
      const tab = component.getCurrentTabDetails()
      expect(tab?.value).toBe('mentorManagement')
    })

    it('should return null when tabs is empty', () => {
      component.tabs = []
      component.selectedTabIndex = 0
      expect(component.getCurrentTabDetails()).toBeNull()
    })

    it('should return null when selectedTabIndex is out of range', () => {
      component.ngOnInit()
      component.selectedTabIndex = 99
      expect(component.getCurrentTabDetails()).toBeNull()
    })
  })

  // ─── onTabChange ───────────────────────────────────────────────────────────

  describe('onTabChange', () => {
    beforeEach(() => component.ngOnInit())

    it('should update selectedTabIndex', () => {
      component.onTabChange(3)
      expect(component.selectedTabIndex).toBe(3)
    })

    it('should navigate with the tab value as queryParam', () => {
      component.onTabChange(1)
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { tab: 'rolesAndAccess' },
        queryParamsHandling: 'merge',
      })
    })

    it('should not navigate if selectedTab has no value', () => {
      component.tabs = [{ name: 'No Value' }]
      component.onTabChange(0)
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  // ─── onCreateUser ──────────────────────────────────────────────────────────

  describe('onCreateUser', () => {
    beforeEach(() => component.ngOnInit())

    it('should switch to userOnboarding tab when event is truthy', () => {
      component.onCreateUser('clicked')
      const expectedIndex = component.tabs.findIndex(t => t.value === 'userOnboarding')
      expect(component.selectedTabIndex).toBe(expectedIndex)
    })

    it('should not change tab when event is falsy', () => {
      component.selectedTabIndex = 0
      component.onCreateUser(null)
      expect(component.selectedTabIndex).toBe(0)
    })
  })

  // ─── showDesTab ────────────────────────────────────────────────────────────

  describe('showDesTab', () => {
    beforeEach(() => component.ngOnInit())

    it('should switch to designationMaster tab when event is truthy', () => {
      component.showDesTab(true)
      const expectedIndex = component.tabs.findIndex(t => t.value === 'designationMaster')
      expect(component.selectedTabIndex).toBe(expectedIndex)
    })

    it('should not change tab when event is falsy', () => {
      component.selectedTabIndex = 0
      component.showDesTab(null)
      expect(component.selectedTabIndex).toBe(0)
    })
  })

  // ─── onUserCreated ─────────────────────────────────────────────────────────

  describe('onUserCreated', () => {
    beforeEach(() => component.ngOnInit())

    it('should switch to users tab when event is truthy', () => {
      component.selectedTabIndex = 3
      component.onUserCreated('created')
      expect(component.selectedTabIndex).toBe(0)
    })

    it('should not change tab when event is falsy', () => {
      component.selectedTabIndex = 3
      component.onUserCreated(null)
      expect(component.selectedTabIndex).toBe(3)
    })
  })

  // ─── getOrgData ────────────────────────────────────────────────────────────

  describe('getOrgData', () => {
    it('should call loaderService and getOrgReadData, then set orgDataLoaded=true', async () => {
      component.orgData = { roleId: 'org-001' }
      mockOrgHieService.getOrgReadData.mockReturnValue(
        of({ result: { response: { name: 'Test Org' } } })
      )
      await component.getOrgData()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockOrgHieService.getOrgReadData).toHaveBeenCalled()
      expect(component.orgDataLoaded).toBe(true)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should call setOrgData and setParentOrgData with null when response is not ministry', async () => {
      component.orgData = { roleId: 'org-001' }
      mockOrgHieService.getOrgReadData.mockReturnValue(
        of({ result: { response: { name: 'State Org' } } })
      )
      await component.getOrgData()
      expect(mockOrgHieService.setOrgData).toHaveBeenCalledWith(undefined)
      expect(mockOrgHieService.setParentOrgData).toHaveBeenCalledWith(undefined)
    })

    it('should fetch parent org data when ministryOrStateType is ministry', async () => {
      component.orgData = { roleId: 'org-001' }
      const orgResponse = {
        result: {
          response: {
            name: 'Ministry Org',
            ministryOrStateType: 'ministry',
            ministryOrStateId: 'parent-org-001',
          },
        },
      }
      const parentOrgResponse = {
        result: { response: { name: 'Parent Ministry' } },
      }
      mockOrgHieService.getOrgReadData
        .mockReturnValueOnce(of(orgResponse))
        .mockReturnValueOnce(of(parentOrgResponse))

      await component.getOrgData()

      expect(mockOrgHieService.getOrgReadData).toHaveBeenCalledTimes(2)
      expect(mockOrgHieService.setOrgData).toHaveBeenCalledWith(orgResponse.result.response)
      expect(mockOrgHieService.setParentOrgData).toHaveBeenCalledWith(parentOrgResponse.result.response)
      expect(component.orgDataLoaded).toBe(true)
    })
  })
})

