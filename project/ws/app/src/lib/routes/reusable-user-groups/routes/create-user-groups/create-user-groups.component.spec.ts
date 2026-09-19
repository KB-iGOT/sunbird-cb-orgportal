import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'
import { ReusableUserGroupsService } from '../../services/reusable-user-groups.service'
import { CreateUserGroupsComponent } from './create-user-groups.component'

const accessSettingsUserGroups = {
  accessControlCriteriaSelection: {
    optionsEntity: [{ disabled: false, value: 'user', label: 'User' }],
    optionsConditions: [{ value: 'is', label: 'is' }],
    readOnly: false,
    allowCustomsField: false,
    paginationLimit: 100,
    canShowAccessTypeRadio: false,
    shouldShowVisibilityToggle: true,
  },
  usersTableConfig: { allLearners: {}, selectedUsers: {} },
  application: 'mdo_portal',
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

describe('CreateUserGroupsComponent', () => {
  let component: CreateUserGroupsComponent
  let fixture: ComponentFixture<CreateUserGroupsComponent>
  let fetchUserGroup: jest.Mock
  let navigate: jest.Mock

  const createComponent = (pageData: any, params: any = {}) => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      declarations: [CreateUserGroupsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(params) },
            parent: { snapshot: { data: { pageData } } },
          },
        },
        {
          provide: ConfigurationsService,
          useValue: {
            userProfile: { userId: 'user-1' },
            userRoles: new Set(['mdo_admin']),
            orgReadData: { isCCA: false },
          },
        },
        { provide: ReusableUserGroupsService, useValue: { fetchUserGroup } },
        { provide: Router, useValue: { navigate } },
      ],
    })
    fixture = TestBed.createComponent(CreateUserGroupsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }

  beforeEach(() => {
    fetchUserGroup = jest.fn(() => of(readResponse))
    navigate = jest.fn()
    createComponent({ data: { accessSettingsUserGroups } })
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should read the access control config from the page data', () => {
    expect(component.accessSettingsParameters()?.application).toBe('mdo_portal')
    expect(component.accessSettingsParameters()?.accessControlCriteriaSelection?.optionsConditions)
      .toEqual([{ value: 'is', label: 'is' }])
  })

  it('should attach the logged in user context onto the config', () => {
    const userConfig = component.accessSettingsParameters()?.userConfig
    expect(userConfig?.userId).toBe('user-1')
    expect(userConfig?.userRoles).toEqual(new Set(['mdo_admin']))
    expect(userConfig?.org).toEqual({ isCCA: false })
  })

  it('should not mutate the resolved page config', () => {
    expect(accessSettingsUserGroups).not.toHaveProperty('userConfig')
    expect(accessSettingsUserGroups).not.toHaveProperty('mdoContent')
  })

  it('should leave the config undefined when the page data has no access settings', () => {
    createComponent({ data: {} })
    expect(component.accessSettingsParameters()).toBeUndefined()
  })

  it('should go back to the list once the group has been created', () => {
    component.getAccessControlData({ action: 'CREATED' })
    expect(navigate).toHaveBeenCalledWith(['/app/home/reusable-user-groups/list'])
  })

  it('should stay on the page while the group has not been created', () => {
    const accessControl = { version: 1, userGroups: [{ userGroupId: 'g1', userGroupName: 'Group 1' }] }
    component.getAccessControlData({ userGroup: { accessControl, contentId: '' }, accessType: 'custom' })
    expect(navigate).not.toHaveBeenCalled()
  })

  describe('edit mode', () => {
    const editParams = { id: 'fb9ad925-355a-4349-8688-ce1720f6dfd5' }

    beforeEach(() => {
      createComponent({ data: { accessSettingsUserGroups } }, editParams)
    })

    it('should read the user group named in the route', () => {
      expect(fetchUserGroup).toHaveBeenCalledWith('fb9ad925-355a-4349-8688-ce1720f6dfd5')
    })

    it('should map the read response onto the access control shape', () => {
      expect(component.tempSavedAccessControl).toEqual({
        version: 1,
        userGroups: [
          {
            userGroupId: 'fb9ad925-355a-4349-8688-ce1720f6dfd5',
            userGroupName: 'User Group API testing 10th September - Updated',
            userGroupCriteriaList: [
              { criteriaKey: 'group', criteriaValue: ['Group A', 'Group B'] },
              { criteriaKey: 'rootOrgId', criteriaValue: ['01384674984551219213'] },
            ],
          },
        ],
      })
    })

    it('should only set the config once the saved group is in hand', () => {
      // The access control component reads tempAccessControl while initialising, and the config
      // gates its rendering, so the config must not be set before the group has loaded.
      expect(component.accessSettingsParameters()).toBeDefined()
    })

    it('should treat a group with no criteria as an empty condition list', () => {
      fetchUserGroup = jest.fn(() => of({ result: { ...readResponse.result, criteria: undefined } }))
      createComponent({ data: { accessSettingsUserGroups } }, editParams)
      expect(component.tempSavedAccessControl.userGroups[0].userGroupCriteriaList).toEqual([])
    })

    it('should hold no user group when the response carries no result', () => {
      fetchUserGroup = jest.fn(() => of({ responseCode: 'OK' }))
      createComponent({ data: { accessSettingsUserGroups } }, editParams)
      expect(component.tempSavedAccessControl).toEqual({ version: 1, userGroups: [] })
    })
  })

  describe('ownership of the group being edited', () => {
    const editParams = { id: 'fb9ad925-355a-4349-8688-ce1720f6dfd5' }
    const editAction = { key: 'edit', label: 'Edit', allowedRoles: ['mdo_leader', 'mdo_admin'] }
    const ownerOnly = {
      data: { accessSettingsUserGroups, table: { rowActions: [{ ...editAction, ownerOnlyRoles: ['mdo_admin'] }] } },
    }
    const unlimited = { data: { accessSettingsUserGroups, table: { rowActions: [editAction] } } }

    const readAs = (createdby: string) => {
      fetchUserGroup = jest.fn(() => of({ result: { ...readResponse.result, createdby } }))
    }

    it('should open the group the signed in admin created', () => {
      readAs('user-1')
      createComponent(ownerOnly, editParams)
      expect(navigate).not.toHaveBeenCalled()
      expect(component.accessSettingsParameters()).toBeDefined()
    })

    it('should send the admin back to the list from a group somebody else created', () => {
      readAs('user-2')
      createComponent(ownerOnly, editParams)
      expect(navigate).toHaveBeenCalledWith(['/app/home/reusable-user-groups/list'])
      expect(component.accessSettingsParameters()).toBeUndefined()
    })

    it('should leave an edit with no ownership limit open on any group', () => {
      readAs('user-2')
      createComponent(unlimited, editParams)
      expect(navigate).not.toHaveBeenCalled()
      expect(component.accessSettingsParameters()).toBeDefined()
    })
  })

  it('should not read a user group when there is no id in the route', () => {
    expect(fetchUserGroup).not.toHaveBeenCalled()
  })
})
