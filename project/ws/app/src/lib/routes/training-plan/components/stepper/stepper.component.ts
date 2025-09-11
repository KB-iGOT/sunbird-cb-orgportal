import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core'
import { TrainingPlanContent } from '../../models/training-plan.model'
import { ActivatedRoute } from '@angular/router'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { NsAccessControlConfig } from '@sunbird-cb/access-settings'
@Component({
  selector: 'ws-app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
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
  constructor(private route: ActivatedRoute,
    private tpdsSvc: TrainingPlanDataSharingService
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
    this.tempSavedAccessControl = _event?.userGroup?.accessControl
    this.tpdsSvc.trainingPlanStepperData.accessControl = this.tempSavedAccessControl
    if (this.tempSavedAccessControl?.userGroups?.length) {
      this.checkForaddAccessSettings(false)
      this.addAccessSettingDisable = false
    } else {
      this.checkForaddAccessSettings(true)
      this.addAccessSettingDisable = true
    }

  }
}
