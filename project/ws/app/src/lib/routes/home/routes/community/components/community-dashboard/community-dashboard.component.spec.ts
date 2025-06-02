// CommunityDashboardComponent.spec.ts
import { CommunityDashboardComponent } from './community-dashboard.component'
import { of } from 'rxjs'
import { MatTableDataSource } from '@angular/material/table'
import { PageEvent } from '@angular/material/paginator'

// Mock dependencies
jest.mock('@angular/router')
jest.mock('../../services/community.service')
jest.mock('../../../../../users/services/roles.service')

describe('CommunityDashboardComponent', () => {
  let component: CommunityDashboardComponent
  let mockRouter: any
  let mockCommunitySvc: any
  let mockActivatedRoute: any
  let mockRolesService: any

  beforeEach(() => {
    // Setup mocks
    mockRouter = {
      navigate: jest.fn()
    }

    mockCommunitySvc = {
      communitySearch: jest.fn().mockReturnValue(of({
        result: {
          search_results: {
            data: [
              {
                communityId: '123',
                communityName: 'Test Community',
                createdOn: '2025-01-01',
                createdBy: 'user1',
                updatedOn: '2025-01-02',
                countOfPeopleJoined: 10,
                countOfModerators: 2
              }
            ],
            totalCount: 1,
            additionalInfo: [
              { user_id: 'user1', first_name: 'John', last_name: 'Doe' }
            ]
          }
        }
      }))
    }

    mockActivatedRoute = {
      snapshot: {
        data: {
          configService: {
            unMappedUser: {
              id: 'user1',
              rootOrgId: 'org1'
            }
          }
        }
      }
    }

    mockRolesService = {
      getAllRoles: jest.fn().mockReturnValue(of({
        result: {
          response: {
            value: JSON.stringify({
              orgTypeList: [
                {
                  name: 'MDO',
                  roles: ['COMMUNITY_MODERATOR', 'OTHER_ROLE']
                }
              ]
            })
          }
        }
      }))
    }

    // Create component with mocks
    component = new CommunityDashboardComponent(
      mockRouter,
      mockCommunitySvc,
      mockActivatedRoute,
      // mockRolesService
    )

    // Spy on component methods
    jest.spyOn(component, 'fetchCommunityData')
    jest.spyOn(component, 'getRouteSubscription')

    // Setup search control value changes mock
    jest.spyOn(component.searchControl.valueChanges, 'pipe').mockReturnValue(of('test search'))
  })

  // Test constructor initialization
  test('should initialize the component correctly', () => {
    expect(component).toBeDefined()
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
    // expect(component.getRouteSubscription).toHaveBeenCalled()
    expect(component.fetchCommunityData).toHaveBeenCalledWith('')
  })

  // Test getRouteSubscription
  // test('should set userProfile from route data', () => {
  //   component.getRouteSubscription()
  //   expect(component.userProfile).toEqual({
  //     id: 'user1',
  //     rootOrgId: 'org1'
  //   })
  // })

  // Test ngOnInit
  test('should setup search subscription and get roles on ngOnInit', () => {
    const spyGetOrgRolesList = jest.spyOn(component, 'getOrgRolesList')

    component.ngOnInit()

    expect(spyGetOrgRolesList).toHaveBeenCalled()
    // Since we've mocked pipe(), we can't easily verify the subscription behavior
    // but we can verify that pipe was called
    expect(component.searchControl.valueChanges.pipe).toHaveBeenCalled()
  })

  // Test getOrgRolesList
  test('should fetch roles and set community moderator flag', () => {
    component.getOrgRolesList()

    expect(mockRolesService.getAllRoles).toHaveBeenCalled()
    expect(component.masterData.rolesList).toBeDefined()
    expect(component.masterData.mdoRoles).toEqual(['COMMUNITY_MODERATOR', 'OTHER_ROLE'])
    expect(component.isCommunityModeratorRole).toBe(true)
  })

  // Test fetchCommunityData
  test('should fetch community data and update datasource', () => {
    component.fetchCommunityData('test')

    expect(mockCommunitySvc.communitySearch).toHaveBeenCalledWith(expect.objectContaining({
      filterCriteriaMap: {
        status: 'active',
        orgId: 'org1'
      },
      searchString: 'test'
    }))

    expect(component.dataSource.data.length).toBe(1)
    expect(component.dataSource.data[0].communityName).toBe('Test Community')
    expect(component.totalElements).toBe(1)
    expect(component.additionalUserInfo).toHaveProperty('user1')
  })

  // Test empty result
  test('should handle empty search results', () => {
    mockCommunitySvc.communitySearch.mockReturnValueOnce(of({
      result: {
        search_results: {
          data: [],
          totalCount: 0,
          additionalInfo: []
        }
      }
    }))

    component.fetchCommunityData('')

    expect(component.dataSource.data).toEqual([])
    expect(component.totalElements).toBe(0)
  })

  // Test tab change
  test('should update status and columns on tab change', () => {
    component.onTabChange({ index: 1 })

    expect(component.currentStatus).toBe('draft')
    expect(component.pageNumber).toBe(0)
    expect(component.displayedColumns).toEqual(['name', 'startDate', 'createdBy', 'members', 'mods', 'actions'])
    expect(component.fetchCommunityData).toHaveBeenCalledWith(component.currentSearchString)
  })

  // Test page event handling
  test('should update page parameters and fetch data on page event', () => {
    const pageEvent: PageEvent = {
      pageIndex: 2,
      pageSize: 25,
      length: 100
    }

    component.handlePageEvent(pageEvent)

    expect(component.pageNumber).toBe(2)
    expect(component.pageSize).toBe(25)
    expect(component.fetchCommunityData).toHaveBeenCalledWith(component.currentSearchString)
  })

  // Test navigation methods
  test('should navigate to create community page', () => {
    component.onCreateCommunity()

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community/create'])
  })

  test('should navigate to edit community page', () => {
    const testCommunity = { communityId: '123' } as any
    component.onActionClick('edit', testCommunity)

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community/edit', '123'])
  })

  test('should navigate to manage community page', () => {
    const testCommunity = { communityId: '123' } as any
    component.onActionClick('manage', testCommunity)

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community/manage', '123'])
  })

  // Test permission methods
  test('should determine if user can edit a community', () => {
    component.userProfile = { id: 'user1' }

    const ownedCommunity = { createdBy: 'user1' } as any
    const otherCommunity = { createdBy: 'user2' } as any

    expect(component.canEdit(ownedCommunity)).toBe(true)
    expect(component.canEdit(otherCommunity)).toBe(false)
  })

  test('should determine if user can archive a community', () => {
    component.userProfile = { id: 'user1' }

    const ownedCommunity = { createdBy: 'user1' } as any
    const otherCommunity = { createdBy: 'user2' } as any

    expect(component.canArchive(ownedCommunity)).toBe(true)
    expect(component.canArchive(otherCommunity)).toBe(false)
  })

  test('should determine if user can delete a community', () => {
    component.userProfile = { id: 'user1' }

    const ownedCommunity = { createdBy: 'user1' } as any
    const otherCommunity = { createdBy: 'user2' } as any

    expect(component.canDelete(ownedCommunity)).toBe(true)
    expect(component.canDelete(otherCommunity)).toBe(false)
  })

  // Test sorting accessor
  test('should have proper sorting accessors', () => {
    component.additionalUserInfo = {
      'user1': { first_name: 'John' }
    }

    component.ngAfterViewInit()

    const testItem = {
      communityName: 'Test Community',
      startDate: new Date('2023-01-01'),
      createdBy: 'test-user-id',
      publishedOn: new Date('2023-01-015'),
      members: 10,
      mods: 2,
      createdByUserId: 'user-001'
    }

    expect(component.dataSource.sortingDataAccessor(testItem, 'communityName')).toBe('Test Community')
    expect(component.dataSource.sortingDataAccessor(testItem, 'startDate')).toBe(new Date('2025-01-01').getTime())
    expect(component.dataSource.sortingDataAccessor(testItem, 'createdBy')).toBe('john')
    expect(component.dataSource.sortingDataAccessor(testItem, 'publishedOn')).toBe(new Date('2025-01-02').getTime())
    expect(component.dataSource.sortingDataAccessor(testItem, 'members')).toBe(10)
    expect(component.dataSource.sortingDataAccessor(testItem, 'mods')).toBe(2)
    expect(component.dataSource.sortingDataAccessor(testItem, 'createdByUserId')).toBe('user001')
  })

  // Test cleanup
  // test('should complete subject on destroy', () => {
  //   const spyComplete = jest.spyOn(component['destroySubject$'], 'complete')

  //   // Manually call ngOnDestroy since our component doesn't have it
  //   // This is to demonstrate how you'd test it if it existed
  //   if (component['ngOnDestroy']) {
  //     component['ngOnDestroy']()
  //     expect(spyComplete).toHaveBeenCalled()
  //   }
  // })
})