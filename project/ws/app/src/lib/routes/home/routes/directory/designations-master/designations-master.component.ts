import { Component, Input } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { DirectoryService } from '../../../services/directory.service'
import * as _ from 'lodash'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { environment } from '../../../../../../../../../../src/environments/environment'
import { delay } from 'rxjs/operators'
import { ReportsVideoComponent } from '../../reports-video/reports-video.component'
import { ConformationPopupComponent } from '../../designation/dialog-boxes/conformation-popup/conformation-popup.component'
import { MatDialog } from '@angular/material/dialog'

@Component({
    selector: 'ws-app-designations-master',
    templateUrl: './designations-master.component.html',
    styleUrls: ['./designations-master.component.scss'],
    standalone: false
})
export class DesignationsMasterComponent {
  @Input() goToImportMaster: boolean = false

  environment: any
  designationConfig: any
  loaderMsg = ''
  showCreateLoader = false
  searchControl = new FormControl()
  frameworkDetails: any = {}
  organisationsList: any = []
  selectedOrganisation = ''
  designationsList: any = []
  filteredDesignationsList: any = []
  tableData: any
  showLoader = true
  actionMenuItem: {
    name: string,
    icon: string,
    key: string,
    isMdoLeader: boolean
  }[] = []
  orgId = ''
  orgName = ''
  showTopSection = false
  designationMaster = 'desigantion master'
  constructor(
    private directoryService: DirectoryService,
    private dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService
  ) { }

  ngOnInit() {
    this.initialization()
  }

  //#region (intial actions)
  initialization() {

    this.initializeDefaultValues()
    this.valueChangeSubscribers()
    this.getRoutesData()
  }

  initializeDefaultValues() {
    if (this.activateRoute.snapshot) {
      // this.configSvc = this.activateRoute.snapshot.data['configService']
      // this.directoryService.setUserProfile(_.get(this.configSvc, 'userProfileV2'))
      this.orgId = this.activateRoute.snapshot.params.department
      this.designationConfig = this.activateRoute.snapshot.data['pageData'].data
      this.orgName = _.get(this.activateRoute, 'snapshot.queryParams.orgName')
    }

    this.actionMenuItem = [
      {
        name: 'Remove',
        icon: 'delete',
        key: 'remove',
        isMdoLeader: true,
      },
    ]

    this.tableData = {
      columns: [
        { displayName: 'Designation', key: 'name' },
        { displayName: 'Imported by', key: 'importedByName' },
        { displayName: 'Imported on', key: 'importedOn' },
      ],
      needCheckBox: false,
      needHash: false,
      needUserMenus: false,
      actions: [],
      actionColumnName: 'Action',
      cbpPlanMenu: true,
    }
  }

  getRoutesData() {
    this.environment = environment
    this.directoryService.getOrgReadData(this.orgId).subscribe(res => {
      const data = res
      this.environment.frameworkName = _.get(data, 'frameworkid')
      if (data && data.frameworkid) {
        this.getFrameworkInfo(data.frameworkid)

      } else {
        this.createFreamwork()
      }
      if (this.goToImportMaster) {
        this.designationMaster = 'import designations'
      }

    })
  }

  createFreamwork() {
    this.showCreateLoader = true
    this.loaderMsg = this.designationConfig.frameworkCreationMSg
    const departmentName = this.orgName ? this.orgName : _.get(this.configSvc, 'userProfile.departmentName')
    const masterFrameWorkName = this.environment.ODCSMasterFramework
    this.directoryService.createFrameWork(masterFrameWorkName, this.orgId, departmentName).subscribe((res: any) => {
      if (_.get(res, 'result.framework')) {
        this.environment.frameworkName = _.get(res, 'result.framework')
        setTimeout(() => {
          // this.getOrgReadData()
          this.getRoutesData()
        }, 5000)
      }
    })
  }

  getOrgReadData() {
    this.directoryService.getOrgReadData(this.orgId).subscribe((res: any) => {
      this.showCreateLoader = false
      this.environment.frameworkName = _.get(res, 'frameworkid')
    })
  }

  getFrameworkInfo(frameworkid: string) {
    this.showLoader = true
    this.environment.frameworkName = frameworkid
    this.directoryService.getFrameworkInfo(frameworkid).subscribe(
      {
        next: res => {
          this.showLoader = false
          this.showCreateLoader = false
          this.frameworkDetails = _.get(res, 'result.framework')
          this.directoryService.setFrameWorkInfo(this.frameworkDetails)
          this.getOrganisations()
        },
        error: () => {
          this.showLoader = false
          const errorMessage = _.get(this.designationConfig, 'internalErrorMsg')
          this.openSnackbar(errorMessage, 5000, 'error')
        },

      })
  }

  valueChangeSubscribers() {
    if (this.searchControl) {
      this.searchControl.valueChanges.pipe(delay(500)).subscribe({
        next: (response: any) => {
          this.filterDesignations(response)
        },
      })
    }
  }

  getOrganisations() {
    this.organisationsList = this.getTermsByCode('org')
    this.selectedOrganisation = _.get(this.organisationsList, '[0].identifier', '')
    this.getDesignations()
  }

  getDesignations() {
    this.designationsList = _.get(this.organisationsList, '[0].children', [])
    this.directoryService.setCurrentOrgDesignationsList(this.designationsList)
    this.filterDesignations()
  }

  getTermsByCode(code: string) {
    const selectedCatagori = this.categoriesOfFramework.filter((catagori: any) => catagori.code === code)
    return _.get(selectedCatagori, '[0].terms', [])
  }

  get categoriesOfFramework() {
    return _.get(this.frameworkDetails, 'categories', [])
  }

  //#endregion

  filterDesignations(key?: string) {
    if (key) {
      this.filteredDesignationsList = (this.designationsList || [])
        .filter((designation: any) => designation.name.toLowerCase().includes(key.toLowerCase()))
    } else {
      const filteredData: any = (this.designationsList || []).sort((a: any, b: any) => {
        const timestampA = a.additionalProperties && a.additionalProperties.timeStamp ?
          new Date(Number(a.additionalProperties.timeStamp)).getTime() : 0
        const timestampB = b.additionalProperties && b.additionalProperties.timeStamp ?
          new Date(Number(b.additionalProperties.timeStamp)).getTime() : 0

        return timestampB - timestampA

      })
      this.filteredDesignationsList = filteredData ? filteredData : []
    }
  }

  //#region (ui interactions like click)

  openVideoPopup() {
    const url = `${environment.karmYogiPath}${_.get(this.designationConfig, 'topsection.guideVideo.url')}`
    this.dialog.open(ReportsVideoComponent, {
      data: {
        videoLink: url,
      },
      disableClose: true,
      width: "675px",
      height: "400px"
    })
  }

  menuSelected(event: any) {
    if (event.action === 'remove') {
      this.openConformationPopup(event)
    }
    // switch (event.action) {
    //   case 'remove':
    //     this.openConformationPopup(event)
    //     break
    // }
  }

  openConformationPopup(event: any) {
    const dialogData = {
      dialogType: 'warning',
      descriptions: [
        {
          header: 'Are you sure you want to remove this designation from My designation master?',
          headerClass: 'flex items-center justify-center text-blue',
          messages: [
            {
              msgClass: '',
              msg: `Please note that doing so will result in the loss of role mapping.`,
            },
          ],
        },
      ],
      footerClass: 'items-center justify-center',
      buttons: [
        {
          btnText: 'No',
          btnClass: 'btn-outline',
          response: false,
        },
        {
          btnText: 'Yes',
          btnClass: 'btn-full-success',
          response: true,
        },
      ],
    }
    const dialogRef = this.dialog.open(ConformationPopupComponent, {
      data: dialogData,
      autoFocus: false,
      width: '615px',
      maxWidth: '80vw',
      maxHeight: '90vh',
      disableClose: true,
    })
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        this.removeDesignation(event.row)
      }
    })
  }

  removeDesignation(designation: any) {
    if (designation) {
      const requestBody = {
        request: {
          contentIds: [
            _.get(designation, 'code'),
          ],
        },
      }
      this.showLoader = true
      this.directoryService.deleteDesignation(this.frameworkDetails.code, 'designation', requestBody).subscribe({
        next: res => {
          if (res) {
            this.publishFrameWork('delete')
          } else {
            this.showLoader = false
          }
        },
        error: () => {
          this.showLoader = false
          const errorMessage = _.get(this.designationConfig, 'internalErrorMsg')
          this.openSnackbar(errorMessage, 5000, 'error')
        },
      })
    }
  }

  publishFrameWork(action?: string) {
    const frameworkName = _.get(this.frameworkDetails, 'code', _.get(this.environment, 'frameworkName'))
    this.directoryService.publishFramework(frameworkName).subscribe({
      next: response => {
        if (response) {
          const refreshTime = ((this.designationsList.length / 2) * 1000) >= 10000 ?
            (this.designationsList.length / 2) * 1000 : 10000
          setTimeout(() => {
            this.getFrameworkInfo(this.frameworkDetails.code)
            if (action && action === 'delete') {
              this.openSnackbar(_.get(this.designationConfig, 'termRemoveMsg'))
            }
          }, refreshTime)
        }
      },
      error: () => {
        this.showLoader = false
        const errorMessage = _.get(this.designationConfig, 'internalErrorMsg')
        this.openSnackbar(errorMessage, 5000, 'error')
      },
    })
  }

  private openSnackbar(primaryMsg: any, duration: number = 5000, type?: string) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
      panelClass: [type ? type : '']

    })
  }

  //#endregion
  removeImportDesignationComp(flag: boolean): void {
    this.designationMaster = flag ? 'import designations' : 'desigantion master'
    this.goToImportMaster = false
    this.getRoutesData()
  }

  showDesignationMaster(flag: boolean): void {
    this.designationMaster = flag ? 'desigantion master' : 'bulk upload'
    this.getRoutesData()
  }
}
