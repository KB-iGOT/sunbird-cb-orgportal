import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'
import { IUserGroupsConfig } from '../../interface/reusable-user-groups.interface'
import { ReusableUserGroupsService } from '../../services/reusable-user-groups.service'
import { UserGroupsListComponent } from './user-groups-list.component'

const config = {
  mainHeading: 'Reusable User Groups',
  createButton: { label: 'Create user group', allowedRoles: ['mdo_admin', 'mdo_leader'] },
  roleBanner: {
    icon: 'check',
    roles: [{ role: 'mdo_leader', title: 'Acting as MDO Leader', description: 'leader desc' }],
    default: { title: 'Viewing user groups', description: 'default desc' },
  },
  search: { filters: {}, sortBy: 'updateddate', sortOrder: 'desc' },
  table: {
    columns: [
      { key: 'name', displayName: 'Group name', type: 'title', sortable: true, sortField: 'usergroupname' },
      { key: 'actions', displayName: 'Actions', type: 'actions' },
    ],
    reachAction: { key: 'reach', label: 'Check reach', icon: 'person_outline' },
    rowActions: [
      { key: 'edit', label: 'Edit', allowedRoles: ['mdo_leader'] },
      { key: 'restricted', label: 'Restricted', allowedRoles: ['spv_admin'] },
      { key: 'use', label: 'Use' },
    ],
    conditionLabel: { singular: 'condition', plural: 'conditions' },
    emptyStateText: 'No user groups created yet.',
    pageSize: 20,
    pageSizeOptions: [20, 50],
  },
} as IUserGroupsConfig

const searchResponse = {
  responseCode: 'OK',
  result: {
    count: 1,
    content: [
      {
        usergroupid: 'fb9ad925-355a-4349-8688-ce1720f6dfd5',
        usergroupname: 'User Group API testing 10th September - Updated',
        criteria: [{ group: ['Group A', 'Group B'] }, { rootOrgId: ['01384674984551219213'] }],
        orgid: '01384674984551219213',
        status: 'active',
        createdby: 'c0915cee-df98-4391-917e-02ed9b07d54f',
        updateddate: '2026-09-10T10:09:22.621872566Z',
      },
    ],
  },
}

const readResponse = {
  responseCode: 'OK',
  result: {
    criteria: [
      { criteriaKey: 'group', criteriaValue: ['Group A', 'Group B'] },
      { criteriaKey: 'rootOrgId', criteriaValue: ['01384674984551219213'] },
    ],
    usergroupid: 'fb9ad925-355a-4349-8688-ce1720f6dfd5',
    usergroupname: 'User Group API testing 10th September - Updated',
    orgid: '01384674984551219213',
    status: 'active',
  },
}

const createResponse = {
  responseCode: 'CREATED',
  result: {
    ...readResponse.result,
    usergroupid: 'a1b2c3d4-0000-0000-0000-000000000000',
    usergroupname: 'User Group API testing 10th September - Updated Copy',
  },
}

describe('UserGroupsListComponent', () => {
  let component: UserGroupsListComponent
  let fixture: ComponentFixture<UserGroupsListComponent>
  let searchUserGroups: jest.Mock
  let fetchUserGroup: jest.Mock
  let createUserGroup: jest.Mock
  let snackBarOpen: jest.Mock
  let snackBarFromComponent: jest.Mock
  let dialogOpen: jest.Mock

  const createComponent = () => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      declarations: [UserGroupsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { data: { pageData: { data: config } } } } },
        },
        {
          provide: ConfigurationsService,
          useValue: { userRoles: new Set(['mdo_leader']) },
        },
        { provide: ReusableUserGroupsService, useValue: { searchUserGroups, fetchUserGroup, createUserGroup } },
        { provide: MatSnackBar, useValue: { open: snackBarOpen, openFromComponent: snackBarFromComponent } },
        { provide: MatDialog, useValue: { open: dialogOpen } },
      ],
    })
    fixture = TestBed.createComponent(UserGroupsListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }

  beforeEach(() => {
    searchUserGroups = jest.fn(() => of(searchResponse))
    fetchUserGroup = jest.fn(() => of(readResponse))
    createUserGroup = jest.fn(() => of(createResponse))
    snackBarOpen = jest.fn()
    snackBarFromComponent = jest.fn()
    dialogOpen = jest.fn(() => ({ afterClosed: () => of(true) }))
    createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should derive displayed columns from config', () => {
    expect(component.displayedColumns()).toEqual(['name', 'actions'])
  })

  it('should allow create for a role listed in allowedRoles', () => {
    expect(component.canCreate()).toBe(true)
  })

  it('should treat an action without allowedRoles as visible to everyone', () => {
    expect(component.isAllowed(undefined)).toBe(true)
  })

  it('should hide row actions the user has no role for', () => {
    expect(component.visibleRowActions().map(action => action.key)).toEqual(['edit', 'use'])
  })

  it('should pick the banner matching the user role', () => {
    expect(component.banner()?.title).toBe('Acting as MDO Leader')
  })

  it('should search with the configured defaults on load', () => {
    expect(searchUserGroups).toHaveBeenCalledWith({
      filters: {},
      pageSize: 20,
      pageNumber: 0,
      sortBy: 'updateddate',
      sortOrder: 'desc',
    })
  })

  it('should map the search response onto table rows', () => {
    const [group] = component.groups()
    expect(group.id).toBe('fb9ad925-355a-4349-8688-ce1720f6dfd5')
    expect(group.name).toBe('User Group API testing 10th September - Updated')
    expect(group.conditionCount).toBe(2)
    expect(group.owner).toBe('c0915cee-df98-4391-917e-02ed9b07d54f')
    expect(component.totalCount()).toBe(1)
    expect(component.dataSource.data.length).toBe(1)
  })

  it('should pluralise the condition label from the criteria count', () => {
    expect(component.conditionText(component.groups()[0])).toBe('2 conditions')
  })

  it('should singularise the condition label', () => {
    expect(component.conditionText({ ...component.groups()[0], conditionCount: 1 })).toBe('1 condition')
  })

  it('should map a sorted column onto its api sort field and reset to the first page', () => {
    component.onPageChange({ pageIndex: 2, pageSize: 20, length: 1 })
    component.onSortChange({ active: 'name', direction: 'asc' })
    expect(component.sortBy()).toBe('usergroupname')
    expect(component.sortOrder()).toBe('asc')
    expect(component.pageIndex()).toBe(0)
    expect(searchUserGroups).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: 'usergroupname', sortOrder: 'asc', pageNumber: 0 }),
    )
  })

  it('should fall back to the configured sort when a column has no sortField', () => {
    component.onSortChange({ active: 'actions', direction: '' })
    expect(component.sortBy()).toBe('updateddate')
    expect(component.sortOrder()).toBe('desc')
  })

  it('should request the next page on paging', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 50, length: 1 })
    expect(searchUserGroups).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageNumber: 1, pageSize: 50 }),
    )
  })

  describe('copy', () => {
    it('should ask for confirmation before copying', () => {
      component.copyUserGroup(component.groups()[0])
      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: expect.objectContaining({
            message: 'Are you sure you want to copy "User Group API testing 10th September - Updated"?',
          }),
        }),
      )
    })

    it('should copy nothing when the confirmation is declined', () => {
      dialogOpen = jest.fn(() => ({ afterClosed: () => of(false) }))
      createComponent()
      component.copyUserGroup(component.groups()[0])
      expect(fetchUserGroup).not.toHaveBeenCalled()
      expect(createUserGroup).not.toHaveBeenCalled()
      expect(component.isLoading()).toBe(false)
    })

    it('should copy nothing when the dialog is dismissed without an answer', () => {
      dialogOpen = jest.fn(() => ({ afterClosed: () => of(undefined) }))
      createComponent()
      component.copyUserGroup(component.groups()[0])
      expect(fetchUserGroup).not.toHaveBeenCalled()
      expect(createUserGroup).not.toHaveBeenCalled()
    })

    it('should read the group before creating the copy', () => {
      component.copyUserGroup(component.groups()[0])
      expect(fetchUserGroup).toHaveBeenCalledWith('fb9ad925-355a-4349-8688-ce1720f6dfd5')
    })

    it('should create the copy from the read criteria with Copy appended to the name', () => {
      component.copyUserGroup(component.groups()[0])
      expect(createUserGroup).toHaveBeenCalledWith({
        userGroupName: 'User Group API testing 10th September - Updated Copy',
        criteria: [
          { criteriaKey: 'group', criteriaValue: ['Group A', 'Group B'] },
          { criteriaKey: 'rootOrgId', criteriaValue: ['01384674984551219213'] },
        ],
      })
    })

    it('should fall back to the row name when the read carries no name', () => {
      fetchUserGroup = jest.fn(() => of({ result: { usergroupid: 'x' } }))
      createComponent()
      component.copyUserGroup(component.groups()[0])
      expect(createUserGroup).toHaveBeenCalledWith({
        userGroupName: 'User Group API testing 10th September - Updated Copy',
        criteria: [],
      })
    })

    it('should refresh the list once the copy is created', () => {
      searchUserGroups.mockClear()
      component.copyUserGroup(component.groups()[0])
      expect(searchUserGroups).toHaveBeenCalledTimes(1)
      expect(component.isLoading()).toBe(false)
    })

    it('should not create anything when the read fails', () => {
      fetchUserGroup = jest.fn(() => throwError(() => ({ error: { params: { errMsg: 'boom' } } })))
      createComponent()
      component.copyUserGroup(component.groups()[0])
      expect(createUserGroup).not.toHaveBeenCalled()
      expect(component.isLoading()).toBe(false)
      expect(snackBarFromComponent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { message: 'boom', type: 'error' } }),
      )
    })

    it('should surface a failure to create the copy', () => {
      createUserGroup = jest.fn(() => throwError(() => ({ error: { params: { errMsg: 'nope' } } })))
      createComponent()
      component.copyUserGroup(component.groups()[0])
      expect(component.isLoading()).toBe(false)
      expect(snackBarFromComponent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { message: 'nope', type: 'error' } }),
      )
    })
  })

  describe('use in a plan', () => {
    const plan = { id: 'P-2603', title: 'APAR 2026-27 — Bihar Administrative Service' }

    it('should open the dialog with the group it was triggered for', () => {
      component.useInPlan(component.groups()[0])
      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: {
            groupId: 'fb9ad925-355a-4349-8688-ce1720f6dfd5',
            groupName: 'User Group API testing 10th September - Updated',
          },
        }),
      )
    })

    it('should confirm once a plan is picked', () => {
      dialogOpen = jest.fn(() => ({ afterClosed: () => of(plan) }))
      createComponent()
      component.useInPlan(component.groups()[0])
      expect(snackBarFromComponent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: {
            message: '"User Group API testing 10th September - Updated" added to APAR 2026-27 — Bihar Administrative Service',
            type: 'success',
          },
        }),
      )
    })

    it('should do nothing when the dialog is cancelled', () => {
      dialogOpen = jest.fn(() => ({ afterClosed: () => of(undefined) }))
      createComponent()
      snackBarFromComponent.mockClear()
      component.useInPlan(component.groups()[0])
      expect(snackBarFromComponent).not.toHaveBeenCalled()
    })

    it('should route the use row action through the dialog', () => {
      component.onRowAction({ key: 'use', label: 'Use' }, component.groups()[0])
      expect(dialogOpen).toHaveBeenCalled()
    })
  })

  it('should clear rows when the search fails', () => {
    searchUserGroups = jest.fn(() => throwError(() => ({ error: { params: { errMsg: 'boom' } } })))
    createComponent()
    expect(component.groups()).toEqual([])
    expect(component.totalCount()).toBe(0)
    expect(component.isLoading()).toBe(false)
  })
})
