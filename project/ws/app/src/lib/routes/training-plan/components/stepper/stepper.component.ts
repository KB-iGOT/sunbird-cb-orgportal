import {
  AfterViewInit, Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Observable, forkJoin } from 'rxjs'
import { TrainingPlanContent } from '../../models/training-plan.model'
import { ActivatedRoute } from '@angular/router'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
// eslint-disable-next-line max-len
import { ReusableUserGroupsService } from '../../../reusable-user-groups/services/reusable-user-groups.service'
import { AccessControlComponent, NsAccessControlConfig } from '@sunbird-cb/access-settings'
@Component({
  selector: 'ws-app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  standalone: false
})
export class StepperComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() changeTabOnNext!: string
  @Output() selectedTabType = new EventEmitter<any>()
  @Output() titleInvalid = new EventEmitter<any>()
  @Output() addContentIsInvalid = new EventEmitter<any>()
  @Output() addAssigneeIsInvalid = new EventEmitter<any>()
  @Output() addAccessSettingsIsInvalid = new EventEmitter<any>()

  tabType = TrainingPlanContent.TTabLabelKey
  tabIndexValue = 0
  addCotnentDisable!: boolean
  addAssigneeDisable!: boolean
  addTimelineDisable!: boolean
  addAccessSettingDisable!: boolean
  editState = false
  isContentLive = false
  accessSettingsParameters!: NsAccessControlConfig.IAccessControlConfig

  tempSavedAccessControl: any

  @ViewChild(AccessControlComponent) private accessControlRef?: AccessControlComponent
  private isMovingOnAfterSave = false

  constructor(
    private route: ActivatedRoute,
    private tpdsSvc: TrainingPlanDataSharingService,
    private userGroupsSvc: ReusableUserGroupsService,
    private destroyRef: DestroyRef,
  ) { }

  ngOnInit() {
    const configSvc = this.route.snapshot.data?.configService
    this.accessSettingsParameters = this.route.snapshot.data?.pageData?.data


    if (this.accessSettingsParameters) {
      this.accessSettingsParameters.userConfig = {
        ...configSvc?.userProfile, userRoles: configSvc?.userRoles, org: configSvc?.orgReadData
      }
      this.accessSettingsParameters.mdoContent = this.tpdsSvc.trainingPlanStepperData
    }

    this.editState = this.route.snapshot.data['contentData'] ? true : false
    if (this.tpdsSvc.trainingPlanStepperData['accessControl']) {
      this.tempSavedAccessControl = this.tpdsSvc.trainingPlanStepperData['accessControl']
    }
    if (this.tpdsSvc.trainingPlanStepperData.status && this.tpdsSvc.trainingPlanStepperData.status.toLowerCase() === 'live') {
      this.isContentLive = true
    }

    this.setUserGroupContext(this.tpdsSvc.getAccessControlUserGroupIds()[0])
    this.tpdsSvc.saveAccessControlAndContinue
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.saveAccessControlThenMoveOn())
  }

  private async saveAccessControlThenMoveOn() {
    debugger
    if (!this.accessControlRef) {
      return
    }

    const payload = await this.accessControlRef.processRequestCreation()
    // processRequestCreation drops a group that has no condition on it, so a shorter list than the
    // step is showing means one of them is still empty
    const groups = payload?.accessControl?.userGroups || []
    if (!groups.length || groups.length !== (this.accessControlRef.userGroup?.length || 0)) {
      this.accessControlRef.callSnackbar('Please add at least one condition with a selection.', 'error')
      return
    }

    this.isMovingOnAfterSave = true
    // One call per group, the api takes a single group at a time
    forkJoin(groups.map((group: any) => this.saveOneUserGroup(group)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (responses: any[]) => {
          const userGroups = responses
            .map((response: any) => ({ userGroupId: response?.result?.usergroupid as string }))
            .filter((group: any) => !!group.userGroupId)
          this.isMovingOnAfterSave = false
          this.keepSavedIdsOnForm(responses)

          if (userGroups.length !== groups.length) {
            this.accessControlRef?.callSnackbar('Could not save every user group, Please try again.', 'error')
            return
          }

          this.tempSavedAccessControl = {
            userGroups,
            version: this.tempSavedAccessControl?.version || 1,
          }
          this.tpdsSvc.trainingPlanStepperData.accessControl = this.tempSavedAccessControl
          this.checkForaddAccessSettings(false)
          this.addAccessSettingDisable = false
          this.tabChangeToTimeline(false)
        },
        error: () => {
          this.isMovingOnAfterSave = false
          this.accessControlRef?.callSnackbar('Could not save the user groups, Please try again.', 'error')
        },
      })
  }

  private keepSavedIdsOnForm(responses: any[]) {
    responses.forEach((response: any, index: number) => {
      const userGroupId = response?.result?.usergroupid
      if (userGroupId) {
        this.accessControlRef?.userGroup?.at(index)?.get('savedUserGroupId')
          ?.setValue(userGroupId, { emitEvent: false })
      }
    })
  }

  /** A group the api already knows is rewritten, one it does not is created. */
  private saveOneUserGroup(group: any): Observable<any> {
    const request = {
      criteria: group.userGroupCriteriaList,
      userGroupName: group.userGroupName,
    }
    return group.userGroupId
      ? this.userGroupsSvc.updateUserGroup({ ...request, userGroupId: group.userGroupId })
      : this.userGroupsSvc.createUserGroup(request)
  }

  private setUserGroupContext(userGroupId?: string) {
    if (!this.accessSettingsParameters) {
      return
    }
    this.accessSettingsParameters.context = {
      userGroupId,
      type: this.accessSettingsParameters.context?.type || 'training-plan',
    }
  }

  private readSavedUserGroupId(_event: any): string {
    if (_event?.userGroupId) {
      return _event.userGroupId
    }
    const saved = _event?.result || _event?.userGroup
    if (!saved) {
      return ''
    }
    if (Array.isArray(saved)) {
      return saved[0]?.userGroupId || saved[0]?.usergroupid || ''
    }
    return saved.usergroupid || saved.userGroupId ||
      saved.accessControl?.userGroups?.[0]?.userGroupId || ''
  }

  ngAfterViewInit() {
    this.addCotnentDisable = true
    this.addAssigneeDisable = true
    this.addTimelineDisable = true

    if (this.tempSavedAccessControl?.userGroups?.length) {
      this.checkForaddAccessSettings(false)
      this.addAccessSettingDisable = false
    } else {
      this.checkForaddAccessSettings(true)
      this.addAccessSettingDisable = true
    }

  }

  ngOnChanges() {
    if (this.changeTabOnNext) {
      switch (this.changeTabOnNext) {
        case TrainingPlanContent.TTabLabelKey.CREATE_PLAN:
          this.tabIndexValue = 0
          break
        case TrainingPlanContent.TTabLabelKey.ADD_CONTENT:
          this.tabIndexValue = 1
          break
        // case TrainingPlanContent.TTabLabelKey.ADD_ASSIGNEE:
        case TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS:
          this.tabIndexValue = 2
          break
        case TrainingPlanContent.TTabLabelKey.ADD_TIMELINE:
          this.tabIndexValue = 3
          break
      }
    }
  }

  tabSelected(_event: any) {
    this.isMovingOnAfterSave = false
    this.tabIndexValue = _event.index
    const tempData = _event.tab.textLabel
    this.selectedTabType.emit(tempData)
  }

  checkForPlanTitle(_event: any) {
    setTimeout(() => {
      this.addCotnentDisable = _event
      this.titleInvalid.emit(_event)
    }, 0)
  }

  checkForaddContent(_event: any) {
    setTimeout(() => {
      this.addAccessSettingDisable = _event
      this.addContentIsInvalid.emit(_event)
    }, 0)
  }

  // checkForaddAssignee(_event: any) {
  //   setTimeout(() => {
  //     this.addTimelineDisable = _event
  //     this.addAssigneeIsInvalid.emit(_event)
  //   },         0)
  // }

  checkForaddAccessSettings(_event: any) {
    setTimeout(() => {
      this.addTimelineDisable = _event
      this.addAccessSettingsIsInvalid.emit(_event)
    }, 0)
  }

  tabChangeToTimeline(_event: any) {
    setTimeout(() => {
      this.addTimelineDisable = _event
      this.addAccessSettingsIsInvalid.emit(_event)
    }, 0)
    this.tabIndexValue = 3
  }

  getAccessControlData(_event: any) {
    const action = _event?.action
    if (action === 'CREATED' || action === 'UPDATED') {
      this.handleUserGroupSaved(_event)
      return
    }

    this.isMovingOnAfterSave = false
    this.tempSavedAccessControl = {
      ..._event?.userGroup?.accessControl,
      userGroupId: this.tempSavedAccessControl?.userGroupId,
    }
    this.tpdsSvc.trainingPlanStepperData.accessControl = this.tempSavedAccessControl
    if (this.tempSavedAccessControl?.userGroups?.length) {
      this.checkForaddAccessSettings(false)
      this.addAccessSettingDisable = false
    } else {
      this.checkForaddAccessSettings(true)
      this.addAccessSettingDisable = true
    }

  }

  private handleUserGroupSaved(_event: any) {
    const userGroupId = this.readSavedUserGroupId(_event)
    if (userGroupId) {
      this.tempSavedAccessControl = { ...(this.tempSavedAccessControl || {}), userGroupId }
      this.tpdsSvc.trainingPlanStepperData.accessControl = this.tempSavedAccessControl
      // Any later save on this plan updates that group rather than creating another
      this.setUserGroupContext(userGroupId)
      this.checkForaddAccessSettings(false)
      this.addAccessSettingDisable = false
    }

    if (this.isMovingOnAfterSave) {
      this.isMovingOnAfterSave = false
      if (userGroupId) {
        this.tabChangeToTimeline(false)
      }
    }
  }
}
