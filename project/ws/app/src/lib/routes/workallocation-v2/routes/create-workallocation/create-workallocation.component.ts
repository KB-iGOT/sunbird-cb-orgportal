// import { untilDestroyed } from 'ngx-take-until-destroy'
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
// tslint:disable
import _ from 'lodash'
import { NSWatActivity } from '../../models/activity-wot.model'
import { NSWatCompetency } from '../../models/competency-wat.model'
// tslint:enable
// import { NSWatActivity } from '../../models/activity-wot.model'
import { AllocationService } from '../../services/allocation.service'
import { WatStoreService } from '../../services/wat.store.service'

@Component({
  selector: 'ws-app-create-workallocation',
  templateUrl: './create-workallocation.component.html',
  styleUrls: ['./create-workallocation.component.scss'],
})
export class CreateWorkallocationComponent implements OnInit, AfterViewInit, OnDestroy {
  canPublish = false
  /**
   * this is for selecting tabs dynamically
   */
  selectedTab = 'officer'
  public officerOffset!: number | null
  public activitiesOffset!: number | null
  public competenciesOffset!: number | null
  public competencyDetailsOffset!: number | null

  @ViewChild('mainWindow', { static: true }) mainWindowElement!: ElementRef
  @ViewChild('officer', { static: true }) officerElement!: ElementRef
  @ViewChild('activities', { static: true }) activitiesElement!: ElementRef
  // @ViewChild('roles', { static: true }) rolesElement!: ElementRef
  @ViewChild('competencies', { static: true }) competenciesElement!: ElementRef
  @ViewChild('competencyDetails', { static: true }) competencyDetailsElement!: ElementRef
  /**
   * this is for selecting tabs dynamically
   */
  private activitySubscription: any
  private groupSubscription: any
  private compDetailsSubscription: any
  officerFormSubscription: any
  private errorCountSubscription: any
  private progressSubscription: any
  dataStructure: any = {}
  departmentName: any
  departmentID: any
  workOrderId: any
  officerId: any
  pageData: any
  editDataStruct: any
  // tslinr=t
  constructor(
    private watStore: WatStoreService,
    private allocateSrvc: AllocationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe(params => {
      this.workOrderId = params['workorder']
      this.officerId = params['officerId']
    })
    this.pageData = _.get(this.route.snapshot, 'data.pageData.data')
  }
  ngOnInit(): void {
    if (this.officerId) {
      this.setEditData()
    }
    this.fetchFormsData()
    this.getdeptUsers()
  }
  setEditData() {
    const data = _.get(this.route.snapshot, 'data.watData.data')
    if (data) {
      const roleCompetencyList = _.get(data, 'roleCompetencyList')
      const unmappedActivities = _.get(data, 'unmappedActivities')
      const unmappedCompetencies = _.get(data, 'unmappedCompetencies')
      const user = {
        officerName: _.get(data, 'userName'),
        userId: _.get(data, 'userId'),
        userEmail: _.get(data, 'userEmail'),
      }
      const position = {
        userPosition: _.get(data, 'userPosition'),
        positionId: _.get(data, 'positionId'),
        positionDescription: _.get(data, 'positionDescription'),
      }
      this.editDataStruct = {
        roleCompetencyList,
        unmappedActivities,
        unmappedCompetencies,
        user,
        position,
        createdBy: _.get(data, 'createdBy'),
        id: _.get(data, 'id'),
        createdByName: _.get(data, 'createdByName'),
      }
    }
  }
  get getOfficerDataEdit() {
    if (this.editDataStruct) {
      return { usr: this.editDataStruct.user, position: this.editDataStruct.position }
    } return null
  }
  get getActivityDataEdit() {
    if (this.editDataStruct) {
      return {
        unmdA: _.map(_.get(this.editDataStruct, 'unmappedActivities'), (numa: NSWatActivity.IActivity) => {
          return {
            activityId: _.get(numa, 'id'),
            activityName: _.get(numa, 'name'),
            activityDescription: _.get(numa, 'description'),
            assignedTo: _.get(numa, 'submittedToName'),
            assignedToId: _.get(numa, 'submittedToId'),
            assignedToEmail: _.get(numa, 'submittedToEmail'),
          }
        }),
        list: _.get(this.editDataStruct, 'roleCompetencyList'),
      }
    }
    return null
  }
  get getCompDataEdit() {
    if (this.editDataStruct) {
      return {
        unmdC: _.map(_.get(this.editDataStruct, 'unmappedCompetencies'), (numa: NSWatCompetency.ICompActivity) => {
          return {
            compId: _.get(numa, 'id'),
            compName: _.get(numa, 'name'),
            compDescription: _.get(numa, 'description'),
            compLevel: _.get(numa, 'level') || '', // still not found
            compType: _.get(numa, 'additionalProperties.competencyType') || '',
            compArea: _.get(numa, 'additionalProperties.competencyArea') || '',
          }
        }),
        list: _.get(this.editDataStruct, 'roleCompetencyList'),
      }
    }
    return null
  }
  getdeptUsers() {
    this.allocateSrvc.getAllUsers().subscribe(res => {
      this.departmentName = res.deptName
      this.departmentID = res.id
    })
  }

  @HostListener('window:scroll', ['$event'])
  /**
    * this is for selecting tabs dynamically
    */
  onScroll(_$event: any) {
    // const offset = $event.srcElement.scrollTop || this.document.body.scrollTop || 0
    const offset = window.pageYOffset || 0
    if (this.officerOffset != null &&
      this.activitiesOffset &&
      this.competenciesOffset &&
      this.competencyDetailsOffset
    ) {
      if (offset >= this.officerOffset && offset < this.activitiesOffset) {
        this.selectedTab = 'officer'
      } else if (offset >= this.activitiesOffset && offset < this.competenciesOffset) {
        this.selectedTab = 'activities'
      } else if (offset >= this.competenciesOffset && offset < this.competencyDetailsOffset) {
        this.selectedTab = 'competencies'
      } else if (offset >= this.competencyDetailsOffset) {
        this.selectedTab = 'competencyDetails'
      } else {
        this.selectedTab = 'officer'
      }
    }
  }
  /**
  * this is for selecting tabs dynamically
  */
  ngAfterViewInit() {
    /**
  * this is for selecting tabs dynamically
  */
    const defaultOffsetToMinus = 146
    this.officerOffset = this.officerElement.nativeElement.offsetTop - defaultOffsetToMinus
    this.activitiesOffset = this.activitiesElement.nativeElement.offsetTop - defaultOffsetToMinus
    this.competenciesOffset = this.competenciesElement.nativeElement.offsetTop - defaultOffsetToMinus
    this.competencyDetailsOffset = this.competencyDetailsElement.nativeElement.offsetTop - defaultOffsetToMinus
    /**
  * this is for selecting tabs dynamically
  */
  }

  filterComp($element: any, filterType: string) {
    this.selectedTab = filterType
    $element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
  }

  get getsubPath(): string {
    return `./#${this.selectedTab}`
  }
  get getOfficerName(): string {
    return _.get(this.dataStructure, 'officerFormData.officerName') ||
      _.get(this.editDataStruct, 'user.officerName')
  }
  // This method is used to fetch the form data from all children components
  fetchFormsData() {
    this.activitySubscription = this.watStore.getactivitiesGroup.subscribe(activities => {
      if (activities.length > 0) {
        this.dataStructure.activityGroups = activities
      }
    })
    this.groupSubscription = this.watStore.getcompetencyGroup.subscribe(comp => {
      if (comp.length > 0) {
        this.dataStructure.compGroups = comp
      }
    })

    this.compDetailsSubscription = this.watStore.get_compGrp.subscribe(comp => {
      if (comp.length > 0) {
        this.dataStructure.compDetails = comp
      }
    })

    this.officerFormSubscription = this.watStore.getOfficerGroup.subscribe(officerFormData => {
      this.dataStructure.officerFormData = officerFormData
    })

    this.errorCountSubscription = this.watStore.getErrorCount.subscribe(data => {
      this.dataStructure.errorCount = data
    })

    this.progressSubscription = this.watStore.getCurrentProgress.subscribe(data => {
      this.dataStructure.currentProgress = data
    })
  }

  saveWAT() {
    if (this.getWorkOrderId) {
      const req = this.getStrcuturedReq()
      // console.log(req)
      this.allocateSrvc.createAllocationV2(req).subscribe(res => {
        if (res) {
          this.openSnackbar('Work order update successfully!')
          this.router.navigate(['/app/workallocation/drafts', this.getWorkOrderId])
        }
        this.watStore.clear()
      })
    } else {
      this.openSnackbar('Error in updating Work order, please try again!')
    }
  }
  updateWat() {
    if (this.getWorkOrderId) {
      const req = this.getStrcuturedReqUpdate()
      // console.log(req)
      this.allocateSrvc.updateAllocationV2(req).subscribe(res => {
        if (res) {
          this.openSnackbar('Work order saved!')
          this.router.navigate(['/app/workallocation/drafts', this.getWorkOrderId])
        }
        this.watStore.clear()
      })
    } else {
      this.openSnackbar('Error in saving Work order, please try again!')
    }
  }

  getStrcuturedReqUpdate(): any {
    let req = {}
    const officer = this.getUserDetails()
    const roles = this.getRoles
    const unmappedActivity = this.getUnmappedActivity()
    const unmappedCompetency = this.getUnmappedCompetency()
    req = {
      userId: officer.user ? officer.user.userId : '',
      positionDescription: officer.positionDescription,
      userPosition: officer.position,
      positionId: officer.positionObj && officer.positionObj.positionId ? officer.positionObj.positionId : '',
      userName: officer.officerName,
      userEmail: officer.user ? officer.user.userEmail : '',
      roleCompetencyList: roles,
      unmappedActivities: unmappedActivity,
      unmappedCompetencies: unmappedCompetency,
      progress: this.dataStructure.currentProgress,
      errorCount: this.dataStructure.errorCount,
      workOrderId: this.getWorkOrderId,
      createdBy: _.get(this.editDataStruct, 'createdBy'),
      id: _.get(this.editDataStruct, 'id'),
      createdByName: _.get(this.editDataStruct, 'createdByName'),
    }
    return req
  }
  getStrcuturedReq(): any {
    let req = {}
    const officer = this.getUserDetails()
    const roles = this.getRoles
    const unmappedActivity = this.getUnmappedActivity()
    const unmappedCompetency = this.getUnmappedCompetency()
    req = {
      userId: officer.user ? officer.user.userDetails.wid : '',
      positionDescription: officer.positionDescription,
      userPosition: officer.position,
      positionId: officer.positionObj && officer.positionObj.id ? officer.positionObj.id : '',
      userName: officer.officerName,
      userEmail: officer.user ? officer.user.userDetails.email : '',

      // deptId: this.departmentID,
      // deptName: this.departmentName,
      // status: 'DRAFT',
      // activeList: this.ralist,

      roleCompetencyList: roles,
      unmappedActivities: unmappedActivity,
      unmappedCompetencies: unmappedCompetency,
      progress: this.dataStructure.currentProgress,
      errorCount: this.dataStructure.errorCount,
      workOrderId: this.getWorkOrderId,
    }
    return req
  }

  get getWorkOrderId() {
    if (this.workOrderId) { return this.workOrderId }
    return null

  }

  getUserDetails() {
    if (this.dataStructure && this.dataStructure.officerFormData && this.dataStructure.officerFormData.user) {
      return {
        user: this.dataStructure.officerFormData.user,
        positionObj: this.dataStructure.officerFormData.positionObj,
        officerName: this.dataStructure.officerFormData.officerName || '',
        position: this.dataStructure.officerFormData.position || '',
        positionDescription: this.dataStructure.officerFormData.positionDescription || '',
      }
    }
    return {}
  }

  get getRoles() {
    return _.compact(_.map(this.dataStructure.activityGroups, (ag: NSWatActivity.IActivityGroup, index: number) => {
      if (index !== 0) {
        return {
          roleDetails: {
            type: 'ROLE',
            name: ag.groupName,
            description: ag.groupDescription,
            // status: 'VERIFIED',
            // source: 'ISTM',
            childNodes: _.compact(_.map(ag.activities, (a: NSWatActivity.IActivity) => {
              if (a.activityDescription || a.assignedTo) {
                return {
                  type: 'ACTIVITY',
                  id: a.activityId,
                  name: a.activityName,
                  description: a.activityDescription,
                  submittedToName: a.assignedTo,
                  submittedToId: a.assignedToId,
                  submittedToEmail: a.assignedToEmail,
                  submissionFrom: a.submissionFrom,
                  submissionFromId: a.submissionFromId,
                  submissionFromEmail: a.submissionFromEmail,
                  // status: 'UNVERIFIED',
                  // source: 'WAT',
                  // parentRole: null,
                }
              }
              return null
            })),
          },
          competencyDetails: _.compact(_.map(
            // tslint:disable-next-line: max-line-length
            _.get(_.first(_.flatten(_.filter(this.dataStructure.compGroups, i => i.roleName === ag.groupName))), 'competincies'), (c: NSWatCompetency.ICompActivity) => {
              const compp = this.watStore.getUpdateCompGroupById(c.localId)
              if (compp && (compp.compName || c.compName || compp.compDescription)) {
                return {
                  type: 'COMPETENCY',
                  id: compp.compId,
                  name: compp.compName || c.compName,
                  description: compp.compDescription,
                  // id='123',
                  level: compp.compLevel,
                  // source: 'ISTM',
                  // status: 'UNVERIFIED',
                  additionalProperties: {
                    competencyArea: compp.compArea,
                    competencyType: compp.compType,
                  },
                  // children: [],
                }
              }
              return null
            })),
        }
      }
      return undefined
    }))
    // _.chain(this.dataStructure.compGroups).filter(i => i.roleName === ag.groupName)
    // .flatten().map('competincies').map((c: NSWatCompetency.ICompActivity) => {
    // }).flatten().compact().value()
  }

  getUnmappedActivity() {
    const unmapedActivities = _.get(_.first(this.dataStructure.activityGroups), 'activities')
    const unmapedActivitiesReq = _.compact(unmapedActivities.map((ua: any) => {
      if (ua.activityDescription || ua.assignedTo) {
        return {
          type: 'ACTIVITY',
          id: ua.activityId,
          name: ua.activityName,
          description: ua.activityDescription,
          submittedToName: ua.assignedTo,
          submittedToId: ua.assignedToId,
          submittedToEmail: ua.assignedToEmail,
          submissionFrom: ua.submissionFrom,
          submissionFromId: ua.submissionFromId,
          submissionFromEmail: ua.submissionFromEmail,
          // status: 'UNVERIFIED',
          // source: 'WAT',
          // parentRole: null,
        }
      }
      return null
    }))
    return unmapedActivitiesReq
  }

  getUnmappedCompetency() {
    const unmapedComps = _.get(_.first(this.dataStructure.compGroups), 'competincies')
    const unmapedCompsReq = _.compact(unmapedComps.map((uc: any) => {
      const compp = this.watStore.getUpdateCompGroupById(uc.localId)
      if (compp && (compp.compName || uc.compName || compp.compDescription)) {
        return {
          type: 'COMPETENCY',
          id: compp.compId,
          name: compp.compName || uc.compName,
          description: compp.compDescription,
          // id='123',
          level: compp.compLevel,
          // source: 'ISTM',
          // status: 'UNVERIFIED',
          additionalProperties: {
            competencyArea: compp.compArea,
            competencyType: compp.compType,
          },
        }
      }
      return null
    }))
    return unmapedCompsReq
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
  ngOnDestroy() {
    this.activitySubscription.unsubscribe()
    this.groupSubscription.unsubscribe()
    this.officerFormSubscription.unsubscribe()
    this.compDetailsSubscription.unsubscribe()
    this.errorCountSubscription.unsubscribe()
    this.progressSubscription.unsubscribe()
  }
}
