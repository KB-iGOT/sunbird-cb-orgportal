import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { NsAccessControlConfig } from '@sunbird-cb/access-settings'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { IUserGroupReadResult, IUserGroupsConfig } from '../../interface/reusable-user-groups.interface'
import { ReusableUserGroupsService } from '../../services/reusable-user-groups.service'
import { isGroupOwner, isOwnerOnly } from '../../utils/user-group-access'

@Component({
  selector: 'ws-app-create-user-groups',
  templateUrl: './create-user-groups.component.html',
  styleUrl: './create-user-groups.component.scss',
  standalone: false,
})
export class CreateUserGroupsComponent implements OnInit {

  private readonly route = inject(ActivatedRoute)
  private readonly configSvc = inject(ConfigurationsService)
  private readonly router = inject(Router)
  private readonly userGroupsSvc = inject(ReusableUserGroupsService)
  private readonly destroyRef = inject(DestroyRef)

  readonly accessSettingsParameters = signal<NsAccessControlConfig.IAccessControlConfig | undefined>(undefined)

  tempSavedAccessControl: any
  userGroupId: string | null = null

  private accessSettingsConfig: any
  private pageConfig: IUserGroupsConfig | undefined

  ngOnInit() {
    const pageData = this.route?.parent?.snapshot.data['pageData']?.data
    this.pageConfig = pageData
    this.accessSettingsConfig = pageData?.accessSettingsUserGroups
    if (!this.accessSettingsConfig) {
      return
    }

    this.userGroupId = this.route.snapshot.paramMap.get('id')
    if (this.userGroupId) {
      this.getUserGroup()
      return
    }

    this.setAccessSettingsParameters()
  }

  getAccessControlData(event: any) {
    if (event?.action === 'CREATED') {
      this.onGoBack()
    }
  }

  onGoBack(): void {
    this.router.navigate(['/app/home/reusable-user-groups/list'])
  }

  getUserGroup(): void {
    this.userGroupsSvc.fetchUserGroup(this.userGroupId as string)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (this.isEditBlocked(res?.result)) {
            this.onGoBack()
            return
          }
          this.tempSavedAccessControl = this.toAccessControl(res?.result)
          this.setAccessSettingsParameters()
        },
      })
  }

  /** A role limited to its own groups cannot open someone else's, a direct link to it included. */
  private isEditBlocked(result?: IUserGroupReadResult): boolean {
    const editAction = (this.pageConfig?.table?.rowActions ?? []).find(action => action.key === 'edit')
    return isOwnerOnly(editAction, this.configSvc.userRoles ?? new Set<string>())
      && !isGroupOwner(result?.createdby, this.configSvc.userProfile?.userId)
  }

  private setAccessSettingsParameters(): void {
    this.accessSettingsParameters.set({
      ...this.accessSettingsConfig,
      userConfig: {
        ...this.configSvc.userProfile,
        userRoles: this.configSvc.userRoles,
        org: this.configSvc.orgReadData,
      },
      mdoContent: {},
      context: {
        type: 'reusable-user-groups',
        userGroupId: this.userGroupId,
      },
    })
  }

  private toAccessControl(result?: IUserGroupReadResult): any {
    if (!result?.usergroupid) {
      return { version: 1, userGroups: [] }
    }
    return {
      version: 1,
      userGroups: [
        {
          userGroupId: result.usergroupid,
          userGroupName: result.usergroupname,
          userGroupCriteriaList: result.criteria ?? [],
        },
      ],
    }
  }
}
