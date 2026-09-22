import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationBoxComponent } from '../confirmation-box/confirmation.box.component'
import { TrainingPlanContent } from '../../models/training-plan.model'
import { TrainingPlanService } from '../../services/traininig-plan.service'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { NsAccessControlConfig } from '@sunbird-cb/access-settings'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
@Component({
  selector: 'ws-app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: false
})
export class BreadcrumbComponent implements OnInit {

  @Input() showBreadcrumbAction = true
  @Input() selectedTab = ''
  @Input() validationList: any
  @Output() changeToNextTab = new EventEmitter<any>()

  public dialogRef: any
  tabType = TrainingPlanContent.TTabLabelKey
  editState = false
  isLiveContent = false
  contentData: any
  /* tslint:disable */
  // What is at stake, then what to do about it: the box reads as two paragraphs
  noGatingCourseWarning = 'You haven\'t selected any mandatory contents yet. Contents marked as mandatory will need to be completed before the Comprehensive Assessment unlocks.'
  noGatingCourseHint = 'Please review your selected contents and mark the relevant ones as mandatory, or continue without setting.'
  /* tslint:enable */
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    public tpdsSvc: TrainingPlanDataSharingService,
    private tpSvc: TrainingPlanService,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService
  ) { }

  ngOnInit() {
    this.editState = this.activeRoute.snapshot.data['contentData'] ? true : false
    this.contentData = this.activeRoute.snapshot.data['contentData']
    if (this.contentData) {
      if (this.contentData.status.toLowerCase() === 'live') {
        this.isLiveContent = true
      }
    }
    this.checkIfDisabled()
  }

  cancel() {
    this.tpdsSvc.trainingPlanTitle = ''
    setTimeout(() => {
      this.router.navigateByUrl('app/home/training-plan-dashboard')
    }, 500)
  }

  nextStep() {
    switch (this.selectedTab) {
      case TrainingPlanContent.TTabLabelKey.CREATE_PLAN:
        this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_CONTENT)
        break
      case TrainingPlanContent.TTabLabelKey.ADD_CONTENT:
        this.leaveAddContent()
        break
      // case TrainingPlanContent.TTabLabelKey.ADD_ASSIGNEE:
      //   this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_TIMELINE)
      //   break
      case TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS:
        this.leaveAccessSettings()
        break
      case TrainingPlanContent.TTabLabelKey.ADD_TIMELINE:
        this.createPlanDraftView()
        break
    }

  }

  /**
   * The comprehensive assessment is gated by the mandatory courses of the plan, so an APAR plan
   * that marks none is one whose CA unlocks the moment it reaches a Karmayogi. That is rarely what
   * the author meant, so it is put to them before the step is left; they can still carry on.
   * A plan with APAR off has no gating to speak of and goes straight through.
   */
  private leaveAddContent() {
    const isApar = !!this.tpdsSvc.trainingPlanStepperData?.isApar
    if (!isApar || this.tpdsSvc.getMandatoryContentCount() > 0) {
      this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS)
      return
    }
    this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: {
        type: 'warning',
        icon: 'warning_amber',
        title: 'No mandatory course selected',
        subTitle: this.noGatingCourseWarning,
        subTitle2: this.noGatingCourseHint,
        primaryAction: 'Continue anyway',
        secondaryAction: 'Go back',
      },
      autoFocus: false,
    })
    this.dialogRef.afterClosed().subscribe((_res: any) => {
      if (_res === 'confirmed') {
        this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS)
      }
    })
  }

  private leaveAccessSettings() {
    this.tpdsSvc.saveAccessControlAndContinue.next()
  }

  changeTabFromBreadCrumb(_item: string) {
    switch (_item) {
      case TrainingPlanContent.TTabLabelKey.CREATE_PLAN:
        this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.CREATE_PLAN)
        break
    }
  }

  performRoute(route: any) {
    if (route === 'list') {
      if (this.editState) {
        this.router.navigate(['app', 'home', 'training-plan-dashboard'], {
          queryParams: {
            type: this.tpdsSvc.trainingPlanStepperData.status === 'Live' ? this.tpdsSvc.trainingPlanStepperData.status : this.tpdsSvc.trainingPlanStepperData.status.toLowerCase(),
            tabSelected: this.tpdsSvc.trainingPlanStepperData.assignmentType,
          },
        })
      } else {
        this.router.navigate(['app', 'home', 'training-plan-dashboard'])
      }
    } else {
      this.router.navigateByUrl(`app/training-plan/${route}`)
    }

  }

  showDialogBox(event: any) {
    const dialogData: any = {}
    switch (event) {
      case 'progress':
        dialogData['type'] = 'progress'
        dialogData['icon'] = 'vega'
        dialogData['title'] = 'Processing your request'
        dialogData['subTitle'] = `Wait a second , your request is processing………`
        break
      case 'progress-completed':
        dialogData['type'] = 'progress-completed'
        dialogData['icon'] = 'accept_icon'
        dialogData['title'] = 'Your processing has been done.'
        dialogData['subTitle'] = `Updated to Draft`
        dialogData['primaryAction'] = 'Redirecting....'
        break
    }

    this.openDialoagBox(dialogData)
  }

  openDialoagBox(dialogData: any) {
    this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: {
        type: dialogData.type,
        icon: dialogData.icon,
        title: dialogData.title,
        subTitle: dialogData.subTitle,
        primaryAction: dialogData.primaryAction,
        secondaryAction: dialogData.secondaryAction,
      },
      autoFocus: false,
    })

    this.dialogRef.afterClosed().subscribe(() => {
    })
  }

  hideConfirmationBox() {
    this.dialogRef.close()
  }

  /**
   * The api reports validation failures as a JSON encoded array on params.err, eg.
   * "[\"Validation Error: Multiple ROOT_ORG_IDs found in criteria but organization is not CCA\"]",
   * so it is unwrapped here instead of showing the raw brackets and escaped quotes to the user.
   */
  private extractApiErrorMessage(error: any, fallback: string): string {
    const params = error?.error?.params || error?.params || {}
    const rawMessage = params.errMsg || params.err || error?.error?.message

    if (!rawMessage) {
      return fallback
    }
    if (Array.isArray(rawMessage)) {
      return rawMessage.length ? rawMessage.join(', ') : fallback
    }
    if (typeof rawMessage === 'string' && rawMessage.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(rawMessage)
        if (Array.isArray(parsed)) {
          return parsed.length ? parsed.join(', ') : fallback
        }
        return rawMessage
      } catch (_parseError) {
        return rawMessage
      }
    }
    return rawMessage
  }

  /** Closes the blocking progress dialog first, then reports the failure. */
  private handleApiFailure(error: any, fallback: string): void {
    if (this.dialogRef) {
      this.dialogRef.close()
    }
    this.snackBar.open(this.extractApiErrorMessage(error, fallback), 'X', {
      duration: 10000,
    })
  }

  createPlanDraftView() {
    this.tpdsSvc.trainingPlanStepperData.name = this.tpdsSvc.trainingPlanTitle
    const transformedData = this.generateRequestPayload(this.tpdsSvc.trainingPlanStepperData, 'create')
    this.showDialogBox('progress')

    this.tpSvc.createPlanV4(transformedData).subscribe((_data: any) => {
      this.dialogRef.close()
      this.showDialogBox('progress-completed')
      setTimeout(() => {
        this.dialogRef.close()
        this.tpdsSvc.trainingPlanTitle = ''
        this.router.navigate(['app', 'home', 'training-plan-dashboard'], {
          queryParams: {
            type: 'draft',
            tabSelected: this.tpdsSvc.trainingPlanStepperData.assignmentType,
          },
        })
      }, 1000)
    }, (_err: any) => {
      this.handleApiFailure(_err, 'Something went wrong while saving the CBP plan. Try again later')
    })
  }

  generateRequestPayload(trainingPlanStepperData: any, type: string): any {
    const userRootOrgId = this.configSvc?.userProfile?.rootOrgId || this.configSvc?.unMappedUser?.rootOrgId || ''
    // The plan is saved against the id of each of its user groups, the conditions live on the
    // groups themselves. Only ids the server issued, never one the access control step minted
    const accessControl = {
      userGroups: (trainingPlanStepperData?.accessControl?.userGroups || [])
        .filter((group: any) => !!group?.userGroupId)
        .map((group: any) => ({ userGroupId: group.userGroupId })),
      version: trainingPlanStepperData?.accessControl?.version || 1,
    }

    // Set orgScope based on conditions
    // if (!hasRootOrgId) {
    //   orgScope = "All"
    // } else if (hasMultipleCriteriaValues) {
    //   orgScope = "Custom"
    // }
    if (type === 'create') {
      return {
        request: {
          orgIdList: [userRootOrgId],
          comment: trainingPlanStepperData?.comment ?? 'cbPlanId1 is created',
          contentList: this.tpdsSvc.buildContentListPayload(trainingPlanStepperData?.contentList),
          contentType: trainingPlanStepperData?.contentType || "Course",
          contextData: { accessControl },
          endDate: trainingPlanStepperData?.endDate,
          isApar: trainingPlanStepperData?.isApar,
          name: trainingPlanStepperData?.name,
          planYear: trainingPlanStepperData?.aparYear,
          // orgScope: isCCA ? orgScope : 'Single',
          status: trainingPlanStepperData?.status
        }
      }

    } else if (type === 'update') {
      return {
        request: {
          orgIdList: [userRootOrgId],
          contentList: this.tpdsSvc.buildContentListPayload(trainingPlanStepperData?.contentList),
          contentType: trainingPlanStepperData?.contentType || "Course",
          contextData: { accessControl },
          endDate: trainingPlanStepperData?.endDate,
          isApar: trainingPlanStepperData?.isApar,
          name: trainingPlanStepperData?.name,
          planYear: trainingPlanStepperData?.aparYear,
          // orgScope: orgScope,
          id: this.activeRoute.snapshot.data['contentData'].id,
          status: trainingPlanStepperData?.status
        }
      }
    }
    return null
  }

  checkIfDisabled() {
    if (this.tabType.CREATE_PLAN === this.selectedTab && this.validationList && !this.validationList.titleIsInvalid) {
      return this.validationList.titleIsInvalid
    }
    if (this.tabType.ADD_CONTENT === this.selectedTab && this.validationList && !this.validationList.addContentIsInvalid) {
      return this.validationList.addContentIsInvalid
    }
    if (this.tabType.ADD_ASSIGNEE === this.selectedTab && this.validationList && !this.validationList.addAssigneeIsInvalid) {
      return this.validationList.addAssigneeIsInvalid
    }
    if (this.tabType.ADD_ACCESS_SETTINGS === this.selectedTab && this.validationList && !this.validationList.addAccessSettingsIsInvalid) {
      return this.validationList.addAccessSettingsIsInvalid
    }
    return true
  }

  updatePlan_v2() {
    this.tpdsSvc.trainingPlanStepperData.name = this.tpdsSvc.trainingPlanTitle
    if (this.tpdsSvc.trainingPlanStepperData.assignmentType === 'AllUser') {
      this.tpdsSvc.trainingPlanStepperData.assignmentTypeInfo = [
        'AllUser',
      ]
    }
    const obj = this.generateRequestPayload(this.tpdsSvc.trainingPlanStepperData, 'update')
    if (obj.request.status && obj.request.status.toLowerCase() === 'live') {
      //delete obj.request.contentList
      //delete obj.request.contentType
      delete obj.request.assignmentType
      //delete obj.request.orgIdList
    }
    delete obj.request.status
    this.showDialogBox('progress')
    this.tpSvc.updatePlanV4(obj).subscribe((_data: any) => {
      this.dialogRef.close()
      if (this.isLiveContent) {
        this.publishPlan()
        localStorage.removeItem(`${NsAccessControlConfig.Application.MDO}_access_control_${this.activeRoute?.snapshot?.params?.planId}`)
      } else {
        this.showDialogBox('progress-completed')
        setTimeout(() => {
          this.dialogRef.close()
          this.tpdsSvc.trainingPlanTitle = ''
          this.router.navigate(['app', 'home', 'training-plan-dashboard'], {
            queryParams: {
              type: this.tpdsSvc.trainingPlanStepperData.status.toLowerCase(),
              tabSelected: this.tpdsSvc.trainingPlanStepperData.assignmentType,
            },
          })
        }, 1000)
      }
    }, (_err: any) => {
      this.handleApiFailure(_err, 'Something went wrong while publishing CBP plan. Try again later')
    })
  }

  publishPlan() {
    const obj = {
      request: {
        id: this.contentData.id,
        comment: 'CBP plan approved',
      },
    }
    this.tpSvc.publishPlanV4(obj).subscribe((data: any) => {
      if (data && data.params && data.params.status && data.params.status.toLowerCase() === 'success') {
        this.showDialogBox('progress-completed')
        setTimeout(() => {
          this.dialogRef.close()
          this.tpdsSvc.trainingPlanTitle = ''
          this.router.navigate(['app', 'home', 'training-plan-dashboard'], {
            queryParams: {
              type: this.tpdsSvc.trainingPlanStepperData.status,
              tabSelected: this.tpdsSvc.trainingPlanStepperData.assignmentType,
            },
          })
        }, 1000)
      } else {
        this.handleApiFailure(data, 'Something went wrong while publishing CBP plan. Try again later')
      }
    }, (_error: any) => {
      this.handleApiFailure(_error, 'Something went wrong while publishing CBP plan. Try again later')
    })
  }

  checkIfValid() {
    if (this.tpdsSvc.getContentList().length === 0 ||
      !this.tpdsSvc.getAccessControlUserGroupIds().length ||
      !this.tpdsSvc.trainingPlanStepperData.endDate
    ) {
      return true
    }
    return false
  }

  showConformationPopUp(_type: string) {
    switch (_type) {
      case 'saveToDraft':
        this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
          disableClose: true,
          data: {
            type: 'conformation',
            icon: 'radio_on',
            title: 'Are you sure you want to save the plan?',
            // subTitle: 'You wont be able to revert this',
            primaryAction: 'Confirm',
            secondaryAction: 'Cancel',
          },
          autoFocus: false,
        })
        break
      case 'update':
        this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
          disableClose: true,
          data: {
            type: 'conformation',
            icon: 'radio_on',
            title: 'Are you sure you want to update the plan?',
            // subTitle: 'You wont be able to revert this',
            primaryAction: 'Confirm',
            secondaryAction: 'Cancel',
          },
          autoFocus: false,
        })
        break
      case 'updateAndPublish': {
        let title: any = "Are you sure you want to update and publish the plan?"
        if (this.tpdsSvc.isContentChanged) {
          title = "Editing the course list may impact learners who have already accessed this training plan. Removing or modifying a course could change their learning experience. Please confirm before proceeding. Are you sure you want to update and publish the plan?"
        }
        this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
          disableClose: true,
          data: {
            type: 'conformation',
            icon: 'radio_on',
            title: title,
            // subTitle: 'You wont be able to revert this',
            primaryAction: 'Confirm',
            secondaryAction: 'Cancel',
          },
          autoFocus: false,
        })
        break
      }
    }
    this.dialogRef.afterClosed().subscribe((_res: any) => {
      if (_res === 'confirmed') {
        switch (_type) {
          case 'saveToDraft':
            this.createPlanDraftView()
            break
          case 'update':
          case 'updateAndPublish':
            this.updatePlan_v2()
            break
        }
      }
    })
  }
}