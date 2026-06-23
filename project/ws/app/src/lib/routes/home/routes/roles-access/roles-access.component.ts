import { AfterViewInit, Component, OnInit, OnDestroy, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { EventService } from '@sunbird-cb/utils-v2'
// tslint:disable-next-line
import _ from 'lodash'
import { TelemetryEvents } from '../../../../head/_services/telemetry.event.model'
import { RolesService } from '../../../users/services/roles.service'
import { UsersService } from '../../../users/services/users.service'
import { map } from 'rxjs/operators'
import { LoaderService } from '../../../../../../../../../src/app/services/loader.service'
@Component({
  selector: 'ws-app-roles-access',
  templateUrl: './roles-access.component.html',
  styleUrls: ['./roles-access.component.scss'],
  standalone: false
})
export class RolesAccessComponent implements OnInit, AfterViewInit, OnDestroy {
  tabledata!: any
  data: any = []
  roleCountSpinner = true
  parseRoledata: any = []
  rolesObject: any = []
  uniqueRoles: any = []
  showSelectedRoleUsers: boolean = false

  @Input() selectedOrgData: any
  selectedRole: any

  constructor(
    private activeRouter: ActivatedRoute,
    private usersService: UsersService,
    // private telemetrySvc: TelemetryService,
    private loaderService: LoaderService,
    private events: EventService,
    private roleservice: RolesService) { }

  ngOnInit() {
    this.tabledata = {
      // actions: [{ name: 'Details', label: 'Details', icon: 'remove_red_eye', type: 'link' }],
      columns: [
        { displayName: 'Role', key: 'role' },
        { displayName: 'Number of users', key: 'count' },
      ],
      actions: [{ icon: 'refresh', label: 'Refresh', name: 'ViewCount', type: 'link', disabled: false }],
      needCheckBox: false,
      needHash: false,
      sortColumn: '',
      sortState: 'asc',
      needUserMenus: false,
      actionColumnName: 'Refresh',
    }
    this.fetchRolesNew()
  }

  ngAfterViewInit() {
    // this.elementPosition = this.menuElement.nativeElement.parentElement.offsetTop
  }

  /* Click event to navigate to a particular role */
  onRoleClick(role: any) {
    this.showSelectedRoleUsers = true
    this.selectedRole = role.role
    // this.router.navigate([`/app/roles/${role.role}/users`])
    // this.router.navigate([`/app/home/roles-users`], { queryParams: { role: event.role, orgID: rootOrgId } })
    // this.telemetrySvc.impression()
    this.events.raiseInteractTelemetry(
      {
        type: TelemetryEvents.EnumInteractTypes.CLICK,
        subType: TelemetryEvents.EnumInteractSubTypes.CARD_CONTENT,
        id: TelemetryEvents.EnumIdtype.ROLES_ROW,
      },
      {
        id: role.role,
        type: TelemetryEvents.EnumIdtype.ROLES,
      }
    )

  }

  backToRoles() {
    this.showSelectedRoleUsers = false
    this.selectedRole = ''
  }
  fetchIndidualRoleData(rootOrgId: string, rolename: string) {
    this.usersService.getAllRoleUsers(rootOrgId, rolename).subscribe(data => {
      this.roleCountSpinner = true
      const individualCount = data.count
      for (let i = 0; i < this.data.length; i += 1) {
        if (this.data[i].role === rolename) {
          this.data[i].count = individualCount
        }
      }
    })
  }
  actionsClick(evt: any) {
    if (evt.action === 'ViewCount') {
      this.roleCountSpinner = false
      const individualRole = evt.row.role
      const rootOrgId = (this.selectedOrgData) ? this.selectedOrgData.roleId :
        _.get(this.activeRouter.snapshot.parent, 'data.configService.unMappedUser.rootOrg.rootOrgId')
      this.fetchIndidualRoleData(rootOrgId, individualRole)
    }
  }

  /* API call to get all roles*/
  fetchRolesNew() {
    this.roleservice.getAllRoles().subscribe(data => {
      this.parseRoledata = JSON.parse(data.result.response.value)
      for (let i = 0; i < this.parseRoledata.orgTypeList.length; i += 1) {
        if (this.parseRoledata.orgTypeList[i].name === 'MDO') {
          this.rolesObject.push(this.parseRoledata.orgTypeList[i].roles)
        }
      }
      const arrayConcat = _.uniq([].concat(...this.rolesObject))
      _.each(arrayConcat, rolesObject => {
        this.uniqueRoles.push({ role: rolesObject, count: '0' })
      })
      this.data = _.uniq(this.uniqueRoles)
      this.getRolesCount()
      this.loaderService.changeLoaderState(false)
    })
  }

  getRolesCount() {
    const rootOrgId = (this.selectedOrgData) ? this.selectedOrgData.roleId :
      _.get(this.activeRouter.snapshot.parent, 'data.configService.unMappedUser.rootOrg.rootOrgId')
    const reqBody = {
      request: {
        filters: {
          rootOrgId: rootOrgId,
          status: 1
        },
        limit: 1,
        fields: [
          'userId'
        ],
        facets: [
          "roles.role"
        ]
      }
    }
    this.usersService.getRolesCountsApi(reqBody).pipe(
      map((res: any) => {
        return res?.result?.response?.facets?.[0]?.values || []
      })
    ).subscribe((ele: any) => {
      this.data.forEach((roleEle: any) => {
        const matchingRole = ele.find((role: any) => role.name.toLowerCase() === roleEle.role.toLowerCase())
        if (matchingRole) {
          roleEle.count = matchingRole.count
        }
      })
    })
  }

  ngOnDestroy() { }
}
