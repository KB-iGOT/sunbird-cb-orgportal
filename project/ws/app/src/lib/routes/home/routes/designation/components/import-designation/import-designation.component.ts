import { Component, OnDestroy, OnInit } from '@angular/core'
import { DesignationsService } from '../../services/designations.service'
import { MatDialog } from '@angular/material/dialog'
import { PageEvent } from '@angular/material/paginator'
import { MatSnackBar } from '@angular/material/snack-bar'
import { UntypedFormControl } from '@angular/forms'
import { catchError, delay, map } from 'rxjs/operators'
import { SelectedDesignationPopupComponent } from '../../dialog-boxes/selected-designation-popup/selected-designation-popup.component'
import { forkJoin, of, Subscription } from 'rxjs'
import * as _ from 'lodash'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationBoxComponent } from '../../../../../training-plan/components/confirmation-box/confirmation.box.component'
import { DatePipe } from '@angular/common'
import { ConformationPopupComponent } from '../../dialog-boxes/conformation-popup/conformation-popup.component'
import { OnboardingService } from '../../../../services/onboarding.service'
// import { environment } from '../../../../../../../../../../../src/environments/environment'
// import { ConformationPopupComponent } from '../../dialog-boxes/conformation-popup/conformation-popup.component'

@Component({
    selector: 'ws-app-import-designation',
    templateUrl: './import-designation.component.html',
    styleUrls: ['./import-designation.component.scss'],
    standalone: false
})
export class ImportDesignationComponent implements OnInit, OnDestroy {

  environmentVal: any
  designationConfig: any
  frameworkConfig: any
  configSvc: any
  loaderMsg = ''
  showCreateLoader = false
  searchControl = new UntypedFormControl()
  igotDesignationsList: any = []
  selectedDesignationsList: any = []
  orgDesignationsList: any = []
  pageSize = 30
  startIndex = 0
  lastIndex = 30
  deisgnationsCount = 0
  private apiSubscription: Subscription | undefined
  designationsImportSuccessResponses: any = []
  importedDesignationNames: any = []
  designationsImportFailed: any = []
  frameworkInfo: any = {}
  dialogRef: any
  progressDialogData: any

  constructor(
    private designationsService: DesignationsService,
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private route: Router,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private activateRoute: ActivatedRoute,
    private onboardingService: OnboardingService,
  ) {
    this.getFrameWorkDetails()
  }

  ngOnInit() {
    this.configSvc = this.activateRoute.snapshot.data['configService']
    this.loadDesignations()
    this.valueChangeSubscription()
    this.getRoutesData()
  }

  getFrameWorkDetails() {
    this.frameworkInfo = this.designationsService.frameWorkInfo
    if (this.frameworkInfo === undefined) {
      this.navigateToMyDesignations()
    }
  }

  loadDesignations(searchKey: string = '') {
    this.loaderService.changeLoaderState(true)
    const pageNumber = this.startIndex === 0 ? 0 : this.startIndex / this.pageSize
    const requestParams: any = {
      pageNumber,
      filterCriteriaMap: {
        status: 'Active',
      },
      requestedFields: [],
      pageSize: this.pageSize,
    }
    if (searchKey) {
      requestParams['searchString'] = searchKey
    }

    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe()
      this.apiSubscription = undefined
    }

    this.apiSubscription = this.designationsService.getIgotMasterDesignations(requestParams).subscribe(
      (result: any) => {
        this.igotDesignationsList = result.formatedDesignationsLsit
        this.deisgnationsCount = result.totalCount
        this.loaderService.changeLoaderState(false)
      },
      (_err: any) => {
        this.loaderService.changeLoaderState(false)
      })
  }

  get getFilteredSelectedList() {
    if (this.searchControl.value) {
      return this.selectedDesignationsList
        .filter((designation: any) =>
          designation.name.toLowerCase().includes(this.searchControl.value.toLowerCase()))
    }
    return this.selectedDesignationsList
  }

  valueChangeSubscription() {
    if (this.searchControl) {
      this.searchControl.valueChanges.pipe(delay(500)).subscribe((value: string) => {
        this.loadDesignations(value)
      })
    }
  }

  getRoutesData() {
    this.activateRoute.data.subscribe(data => {
      this.designationConfig = data.pageData.data
    })
  }

  selectDesignation(index: number) {
    const designation = this.igotDesignationsList[index]
    const maxSelectedDesignation = 1000
    const errorMessages = `You have exceeded more than ${maxSelectedDesignation} designation please talk to support team for support`
    if (designation && !designation.isOrgDesignation) {
      const checked = designation['selected'] !== true ? true : false
      if (checked) {
        designation['selected'] = true
        this.selectedDesignationsList.push(designation)
        if (this.totalSelectedCount > maxSelectedDesignation) {
          this.openSnackbar(errorMessages)
          designation.selected = false

        } else {
          this.designationsService.updateSelectedDesignationList(this.selectedDesignationsList)
        }

      } else {
        this.removeDesignation([designation])
      }
    }
  }

  get totalSelectedCount() {
    const designationCount = this.designationsService.selecteDesignationCount
    return designationCount
  }

  get selctedDesignationsCount() {
    return this.selectedDesignationsList.length
  }

  removeDesignation(designationToRemoveList: any[]) {
    designationToRemoveList.forEach((designationToRemove: any) => {
      this.selectedDesignationsList = this.selectedDesignationsList
        .filter((selectedDesignation: any) => selectedDesignation.id !== designationToRemove.id)
      this.designationsService.updateSelectedDesignationList(this.selectedDesignationsList)

      const igotListIndex = this.igotDesignationsList
        .findIndex((designation: any) => designation.id === designationToRemove.id)
      if (igotListIndex >= 0) {
        const designation = this.igotDesignationsList[igotListIndex]
        designation['selected'] = false
        // this.displayList.splice(igotListIndex, 1)
        // this.displayList.splice(this.selctedDesignationsCount, 0, designation)
      }
    })

  }

  openPreviewPoup() {
    const dialogData = JSON.parse(JSON.stringify(this.selectedDesignationsList))
    const dialogRef = this.dialog.open(SelectedDesignationPopupComponent, {
      disableClose: true,
      data: dialogData,
      autoFocus: false,
      maxHeight: '90vh',
      width: '90%',
    })
    dialogRef.afterClosed().subscribe((res: any[]) => {
      if (res && res.length > 0) {
        // this.selectedDesignationsList
        this.removeDesignation(res)
      }
    })
  }

  onChangePage(pe: PageEvent) {
    this.startIndex = pe.pageIndex * pe.pageSize
    this.lastIndex = (pe.pageIndex + 1) * pe.pageSize
    this.pageSize = pe.pageSize
    this.loadDesignations(this.searchControl.value)
  }

  importDesignations() {
    if (this.selctedDesignationsCount) {
      this.openProcessingBox()
      const currentDate = this.datePipe.transform(new Date(), 'dd MMM, yyyy')
      const orgCategorie = _.get(this.frameworkInfo, 'categories', [])
        .find((category: any) => category.code === 'org')
      const observables = this.selectedDesignationsList.map((selectedDesignation: any) => {
        const requestBody = {
          name: selectedDesignation.designation,
          code: this.designationsService.getUuid,
          description: selectedDesignation.description,
          refId: selectedDesignation.id,
          refType: 'designation',
          category: 'designation',
          status: 'Live',
          framework: _.get(this.frameworkInfo, 'code'),
          additionalProperties: {
            importedByName: _.get(this.configSvc, 'userProfileV2.firstName'),
            importedById: _.get(this.configSvc, 'userProfileV2.userId'),
            importedOn: currentDate,
            previousCategoryCode: _.get(orgCategorie, 'terms[0].category'),
            previousTermCode: _.get(orgCategorie, 'terms[0].code'),
            timeStamp: new Date().getTime() + 1,
          },
        }
        this.designationsImportSuccessResponses =
          _.get(this.frameworkInfo, 'categories[0].terms[0].associations', []).map((c: any) => {
            return c.identifier ? { identifier: c.identifier } : null
          })
        return this.designationsService.createTerm(requestBody).pipe(
          map(response => {
            this.designationsImportSuccessResponses.push({ identifier: _.get(response, 'result.node_id[0]') })
            this.importedDesignationNames.push(selectedDesignation.designation)
            return response
          }),
          catchError(error => {
            this.designationsImportFailed.push({ error, designation: selectedDesignation })
            return of(null)
          })
        )
      })

      forkJoin(observables).subscribe({
        next: response => {
          if (response) {
            this.updateTerms(orgCategorie)
          }
        },
        error: () => {
          this.dialogRef.close()
          const errorMessage = _.get(this.designationConfig, 'internalErrorMsg')
          this.openSnackbar(errorMessage)
        },
      })
    }
  }

  updateTerms(orgCategorie: any, retry = false) {
    if (this.selectedDesignationsList.length === this.designationsImportFailed.length) {
      this.dialogRef.close(false)
      const errorMessage = _.get(this.designationConfig, 'internalErrorMsg')
      this.openSnackbar(errorMessage)
      this.designationsImportFailed = []
    } else {
      if (!retry) {
        this.progressDialogData['subTitle'] = _.get(this.designationConfig, 'associationUpdateMsg')
      }
      const framework = _.get(this.frameworkInfo, 'code')
      const category = _.get(orgCategorie, 'terms[0].category')
      const categoryTermCode = _.get(orgCategorie, 'terms[0].code')
      const requestBody = {
        request: {
          term: {
            associations: this.designationsImportSuccessResponses,
          },
        },
      }
      this.designationsService.updateTerms(framework, category, categoryTermCode, requestBody).subscribe({
        next: response => {
          if (response) {
            this.publishFrameWork()
          }
        },
        error: () => {
          if (retry) {
            const errorMessage = _.get(this.designationConfig, 'internalErrorMsg')
            this.dialogRef.close()
            this.openSnackbar(errorMessage)
          } else {
            this.progressDialogData['subTitle'] = _.get(this.designationConfig, 'associationRetryMsg')
            const traiagain = true
            this.updateTerms(orgCategorie, traiagain)
          }
        },
      })
    }
  }

  publishFrameWork() {
    const frameworkName = _.get(this.frameworkInfo, 'code')
    this.progressDialogData['subTitle'] = _.get(this.designationConfig, 'publishingMsg')
    this.progressDialogData['subTitle2'] = _.get(this.designationConfig, 'subTitle2')
    this.designationsService.publishFramework(frameworkName).subscribe({
      next: response => {
        if (response) {
          // setTimeout(() => {
          //   this.dialogRef.close(true)
          // },         _.get(this.designationConfig, 'refreshDelayTime', 10000))

          // const refreshTime = ((this.designationsImportSuccessResponses.length / 2) * 1000) >= 10000 ?
          //   (this.designationsImportSuccessResponses.length / 2) * 1000 : 10000
          const refreshTime = 10000
          setTimeout(() => {
            this.dialogRef.close(true)
          }, refreshTime)

        }
      },
      error: () => {
        const errorMessage = _.get(this.designationConfig, 'internalErrorMsg')
        this.dialogRef.close()
        this.openSnackbar(errorMessage)
      },
    })
  }

  openProcessingBox() {
    this.progressDialogData = {
      type: 'progress',
      icon: 'vega',
      title: _.get(this.designationConfig, 'importingDesignation'),
      subTitle: _.get(this.designationConfig, 'termCreationMsg'),
      showLoader: true,
    }
    this.dialogRef = this.dialog.open(ConfirmationBoxComponent, {
      disableClose: true,
      data: this.progressDialogData,
      autoFocus: false,
    })

    this.dialogRef.afterClosed().subscribe((res: boolean = false) => {
      if (res) {
        this.openConforamtionPopup()
      }
    })
  }

  openConforamtionPopup() {
    if (this.designationsImportFailed.length > 0) {
      const descriptions = []
      const designationNames = this.designationsImportFailed.map((e: any) => e.designation.designation).join(', ')
      const description = {
        header: 'The following designations could not be imported at the moment. Please retry after some time.',
        headerClass: 'flex items-center justify-center text-blue',
        messages: [
          {
            msgClass: '',
            msg: `${designationNames}`,
          },
        ],
      }
      descriptions.push(description)
      const dialogData = {
        descriptions,
        dialogType: 'warning',
        footerClass: 'items-center justify-center',
        buttons: [
          {
            btnText: 'ok',
            btnClass: 'btn-full-success',
            response: true,
          },
        ],
      }

      const dialogRef = this.dialog.open(ConformationPopupComponent, {
        data: dialogData,
        autoFocus: false,
        width: '800px',
        maxWidth: '80vw',
        maxHeight: '90vh',
        disableClose: true,
      })
      dialogRef.afterClosed().subscribe(() => {
        if (this.onboardingService.routeFromSelfRegistration) {
          this.route.navigate(['/app/home/onboarding/self-registration'])
        } else {
          this.navigateToMyDesignations()
        }
      })
    } else {
      const successMessage = _.get(this.designationConfig, 'successMsg')
      this.openSnackbar(successMessage, 10000)
      if (this.onboardingService.routeFromSelfRegistration) {
        this.route.navigate(['/app/home/onboarding/self-registration'])
      } else {
        this.navigateToMyDesignations()
      }
    }
  }

  navigateToMyDesignations() {
    this.route.navigateByUrl('app/home/org-designations')
  }

  private openSnackbar(primaryMsg: any, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  ngOnDestroy(): void {
    this.designationsService.updateSelectedDesignationList([])
    this.loaderService.changeLoaderState(false)
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe()
    }
    this.onboardingService.setFlagToCheckRoute(false)
  }
}
