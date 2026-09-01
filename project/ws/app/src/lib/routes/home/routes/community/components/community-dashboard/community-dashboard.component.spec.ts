import { CommunityDashboardComponent } from './community-dashboard.component'
import { of } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { PageEvent } from '@angular/material/paginator'

describe('CommunityDashboardComponent', () => {
  let component: CommunityDashboardComponent
  let mockRouter: any
  let mockCommunitySvc: any
  let mockActivatedRoute: any

  const mockSearchResult = {
    result: {
      search_results: {
        data: [{
          communityId: '123',
          communityName: 'Test Community',
          createdOn: '2025-01-01',
          createdBy: 'user1',
          updatedOn: '2025-01-02',
          countOfPeopleJoined: 10,
          countOfModerators: 2,
        }],
        totalCount: 1,
        additionalInfo: [{ user_id: 'user1', first_name: 'John' }],
      },
    },
  }

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }

    mockCommunitySvc = {
      communitySearch: jest.fn().mockReturnValue(of(mockSearchResult)),
    }

    mockActivatedRoute = {
      snapshot: {
        data: {
          configService: {
            unMappedUser: { id: 'user1', rootOrgId: 'org1', roles: ['MDO_LEADER'] },
          },
        },
      },
    }

    component = new CommunityDashboardComponent(mockRouter, mockCommunitySvc, mockActivatedRoute)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize dataSource as MatTableDataSource', () => {
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
  })

  it('should call fetchCommunityData on construction', () => {
    expect(mockCommunitySvc.communitySearch).toHaveBeenCalled()
  })

  describe('getRouteSubscription', () => {
    it('should set userProfile from route data', () => {
      component.getRouteSubscription()
      expect(component.userProfile).toEqual({ id: 'user1', rootOrgId: 'org1', roles: ['MDO_LEADER'] })
    })

    it('should not set userProfile when route data is absent', () => {
      mockActivatedRoute.snapshot.data = {}
      component.userProfile = undefined
      component.getRouteSubscription()
      expect(component.userProfile).toBeUndefined()
    })
  })

  describe('getOrgRolesList', () => {
    it('should set filteredTabs with all tabs for MDO_LEADER', () => {
      component.getOrgRolesList()
      expect(component.filteredTabs.length).toBeGreaterThan(0)
    })

    it('should filter tabs to Community only for COMMUNITY_MODERATOR without MDO_LEADER', () => {
      mockActivatedRoute.snapshot.data.configService.unMappedUser.roles = ['COMMUNITY_MODERATOR']
      component.getOrgRolesList()
      expect(component.filteredTabs.length).toBe(1)
    })

    it('should not crash if unMappedUser is absent', () => {
      mockActivatedRoute.snapshot.data = {}
      expect(() => component.getOrgRolesList()).not.toThrow()
    })
  })

  describe('ngOnInit', () => {
    it('should call getOrgRolesList', () => {
      const spy = jest.spyOn(component, 'getOrgRolesList')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set up search subscription', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('fetchCommunityData', () => {
    it('should update dataSource with search results', () => {
      component.fetchCommunityData('')
      expect(component.dataSource.data.length).toBe(1)
      expect(component.totalElements).toBe(1)
    })

    it('should add searchString to request when provided', () => {
      component.fetchCommunityData('test search')
      expect(mockCommunitySvc.communitySearch).toHaveBeenCalledWith(
        expect.objectContaining({ searchString: 'test search' }),
      )
    })

    it('should reset to page 0 when searchString is provided', () => {
      component.pageNumber = 5
      component.fetchCommunityData('test')
      expect(mockCommunitySvc.communitySearch).toHaveBeenCalledWith(
        expect.objectContaining({ pageNumber: 0 }),
      )
    })

    it('should handle empty results', () => {
      mockCommunitySvc.communitySearch.mockReturnValueOnce(of({
        result: { search_results: { data: [], totalCount: 0, additionalInfo: [] } },
      }))
      component.fetchCommunityData('')
      expect(component.dataSource.data).toEqual([])
      expect(component.totalElements).toBe(0)
    })

    it('should handle null result', () => {
      mockCommunitySvc.communitySearch.mockReturnValueOnce(of({ result: { search_results: { data: null } } }))
      component.fetchCommunityData('')
      expect(component.dataSource.data).toEqual([])
    })

    it('should populate additionalUserInfo', () => {
      component.fetchCommunityData('')
      expect(component.additionalUserInfo['user1']).toBeDefined()
      expect(component.additionalUserInfo['user1'].first_name).toBe('John')
    })
  })

  describe('onTabChange', () => {
    it('should update status for draft tab (index 1)', () => {
      component.onTabChange({ index: 1 })
      expect(component.currentStatus).toBe('draft')
      expect(component.pageNumber).toBe(0)
    })

    it('should update status for active tab (index 0)', () => {
      component.onTabChange({ index: 0 })
      expect(component.currentStatus).toBe('active')
    })

    it('should update displayedColumns based on tab', () => {
      component.onTabChange({ index: 1 })
      expect(component.displayedColumns).toContain('actions')
    })
  })

  describe('handlePageEvent', () => {
    it('should update page params and fetch data', () => {
      const spy = jest.spyOn(component, 'fetchCommunityData')
      const event: PageEvent = { pageIndex: 2, pageSize: 50, length: 200 }
      component.handlePageEvent(event)
      expect(component.pageNumber).toBe(2)
      expect(component.pageSize).toBe(50)
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('applyFilter', () => {
    it('should apply filter to dataSource', () => {
      const event = { target: { value: 'test filter' } } as any
      component.applyFilter(event)
      expect(component.dataSource.filter).toBe('test filter')
    })
  })

  describe('getDisplayColumns', () => {
    it('should set active columns when status is active', () => {
      component.currentStatus = 'active'
      component.getDisplayColumns()
      expect(component.displayedColumns).not.toContain('actions')
    })

    it('should set draft columns with actions when status is draft', () => {
      component.currentStatus = 'draft'
      component.getDisplayColumns()
      expect(component.displayedColumns).toContain('actions')
    })
  })

  describe('onActionClick', () => {
    it('should navigate to edit page', () => {
      component.onActionClick('edit', { communityId: 'c1' } as any)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community/edit', 'c1'])
    })

    it('should navigate to manage page', () => {
      component.onActionClick('manage', { communityId: 'c1' } as any)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community/manage', 'c1'])
    })
  })

  describe('permission methods', () => {
    beforeEach(() => {
      component.userProfile = { id: 'user1' }
    })

    it('canEdit returns true for own community', () => {
      expect(component.canEdit({ createdBy: 'user1' } as any)).toBe(true)
    })

    it('canEdit returns false for other community', () => {
      expect(component.canEdit({ createdBy: 'user2' } as any)).toBe(false)
    })

    it('canArchive returns true for own community', () => {
      expect(component.canArchive({ createdBy: 'user1' } as any)).toBe(true)
    })

    it('canDelete returns true for own community', () => {
      expect(component.canDelete({ createdBy: 'user1' } as any)).toBe(true)
    })
  })

  describe('onCreateCommunity', () => {
    it('should navigate to create page', () => {
      component.onCreateCommunity()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community/create'])
    })
  })

  describe('changeToDefaultImg', () => {
    it('should set default image src', () => {
      const event = { target: { src: '' } }
      component.changeToDefaultImg(event)
      expect(event.target.src).toBe('/assets/instances/eagle/app_logos/default.png')
    })
  })
})
