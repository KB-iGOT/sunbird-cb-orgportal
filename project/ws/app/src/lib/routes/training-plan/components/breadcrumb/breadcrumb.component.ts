import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
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
    this.router.navigateByUrl('app/home/training-plan-dashboard')
  }

  nextStep() {
    switch (this.selectedTab) {
      case TrainingPlanContent.TTabLabelKey.CREATE_PLAN:
        this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_CONTENT)
        break
      case TrainingPlanContent.TTabLabelKey.ADD_CONTENT:
        this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS)
        break
      // case TrainingPlanContent.TTabLabelKey.ADD_ASSIGNEE:
      //   this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_TIMELINE)
      //   break
      case TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS:
        this.changeToNextTab.emit(TrainingPlanContent.TTabLabelKey.ADD_TIMELINE)
        break
      case TrainingPlanContent.TTabLabelKey.ADD_TIMELINE:
        this.createPlanDraftView()
        break
    }

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
            type: this.tpdsSvc.trainingPlanStepperData.status.toLowerCase(),
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

  createPlanDraftView() {
    this.tpdsSvc.trainingPlanStepperData.name = this.tpdsSvc.trainingPlanTitle
    const transformedData = this.generateRequestPayload(this.tpdsSvc.trainingPlanStepperData, 'create')
    this.showDialogBox('progress')

    this.tpSvc.createPlanV2(transformedData).subscribe((_data: any) => {
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
    })
  }

  generateRequestPayload(trainingPlanStepperData: any, type: string): any {
    // let orgScope = "Single" // Default value
    const userGroups = trainingPlanStepperData.accessControl?.userGroups || []

    // let hasMultipleCriteriaValues = false
    // let hasRootOrgId = false
    let userRootOrgId = this.configSvc?.userProfile?.rootOrgId || this.configSvc?.unMappedUser?.rootOrgId || ''
    let isCCA = this.configSvc?.orgReadData?.isCCA || false
    for (const group of userGroups) {
      const criteriaList = group.userGroupCriteriaList || []
      // Check if rootOrgId criteria exists
      let rootOrgIdCriteria = criteriaList.find((criteria: any) => criteria.criteriaKey === "rootOrgId")

      if (!rootOrgIdCriteria && !isCCA) {
        // If rootOrgId criteria doesn't exist, add it
        criteriaList.push({
          criteriaKey: "rootOrgId",
          criteriaValue: [userRootOrgId]
        })
      }

      // Check for multiple criteria values
      // for (const criteria of criteriaList) {
      //   if (criteria.criteriaValue && criteria.criteriaValue.length > 1) {
      //     // hasMultipleCriteriaValues = true
      //   }
      // }
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
          contentList: trainingPlanStepperData?.contentList || [],
          contentType: trainingPlanStepperData?.contentType || "Course",
          contextData: {
            accessControl: {
              userGroups: userGroups,
              version: trainingPlanStepperData?.accessControl?.version || 1
            }
          },
          endDate: trainingPlanStepperData?.endDate,
          isApar: trainingPlanStepperData?.isApar,
          name: trainingPlanStepperData?.name,
          // orgScope: isCCA ? orgScope : 'Single',
          status: trainingPlanStepperData?.status
        }
      }

    } else if (type === 'update') {
      return {
        request: {
          orgIdList: [userRootOrgId],
          contentList: trainingPlanStepperData?.contentList || [],
          contentType: trainingPlanStepperData?.contentType || "Course",
          contextData: {
            accessControl: {
              userGroups: userGroups,
              version: trainingPlanStepperData?.accessControl?.version || 1
            }
          },
          endDate: trainingPlanStepperData?.endDate,
          isApar: trainingPlanStepperData?.isApar,
          name: trainingPlanStepperData?.name,
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

  updatePlan() {
    this.tpdsSvc.trainingPlanStepperData.name = this.tpdsSvc.trainingPlanTitle
    if (this.tpdsSvc.trainingPlanStepperData.assignmentType === 'AllUser') {
      this.tpdsSvc.trainingPlanStepperData.assignmentTypeInfo = [
        'AllUser',
      ]
    }
    const obj: any = { request: { ...this.tpdsSvc.trainingPlanStepperData, id: this.activeRoute.snapshot.data['contentData'].id } }
    if (obj.request.status && obj.request.status.toLowerCase() === 'live') {
      delete obj.request.contentList
      delete obj.request.contentType
      delete obj.request.assignmentType
    }
    delete obj.request.status
    // if (this.isLiveContent) {
    //   delete obj.request.isApar
    // }
    this.showDialogBox('progress')
    this.tpSvc.updatePlan(obj).subscribe((_data: any) => {
      this.dialogRef.close()
      if (this.isLiveContent) {
        this.publishPlan()
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
    })
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
      delete obj.request.contentList
      delete obj.request.contentType
      delete obj.request.assignmentType
      delete obj.request.orgIdList
    }
    delete obj.request.status
    this.showDialogBox('progress')
    this.tpSvc.updatePlanV2(obj).subscribe((_data: any) => {
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
      let errorMessage = _err?.error?.params?.err || 'Something went wrong while publishing CBP plan. Try again later'
      this.snackBar.open(errorMessage, 'X', {
        duration: 10000,
      })
      this.dialogRef.close()
    })
  }

  publishPlan() {
    const obj = {
      request: {
        id: this.contentData.id,
        comment: 'CBP plan approved',
      },
    }
    this.tpSvc.publishPlanV2(obj).subscribe((data: any) => {
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
        this.snackBar.open('Something went wrong while publishing CBP plan. Try again later')
        this.dialogRef.close()
      }
    }, (_error: any) => {
      this.snackBar.open('Something went wrong while publishing CBP plan. Try again later')
      this.dialogRef.close()
    })
  }

  checkIfValid() {
    if (this.tpdsSvc.trainingPlanStepperData.contentList.length === 0 ||
      !this.tpdsSvc.trainingPlanStepperData.accessControl ||
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
      case 'updateAndPublish':
        this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
          disableClose: true,
          data: {
            type: 'conformation',
            icon: 'radio_on',
            title: 'Are you sure you want to update and publish the plan?',
            // subTitle: 'You wont be able to revert this',
            primaryAction: 'Confirm',
            secondaryAction: 'Cancel',
          },
          autoFocus: false,
        })
        break
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