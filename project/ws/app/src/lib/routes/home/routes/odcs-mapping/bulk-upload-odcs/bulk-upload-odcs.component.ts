import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
// tslint:disable-next-line
import * as _ from 'lodash'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { IBulkUploadDesignationList } from '../../designation/interface/interface'
import { FileService } from '../../../../users/services/upload.service'
import { UsersService } from '../../../../users/services/users.service'
import { FileProgressComponent } from '../../users-view/file-progress/file-progress.component'
import { VerifyOtpComponent } from '../../users-view/verify-otp/verify-otp.component'
import { MatDialog } from '@angular/material/dialog'
import { PageEvent } from '@angular/material/paginator'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'ws-app-bulk-upload-odcs',
  templateUrl: './bulk-upload-odcs.component.html',
  styleUrls: ['./bulk-upload-odcs.component.scss'],
})
export class BulkUploadOdcsComponent implements OnInit, OnDestroy, AfterViewInit {

  lastUploadList: IBulkUploadDesignationList[] = []
  private destroySubject$ = new Subject()
  rootOrgId: any
  bulkUploadFrameworkId = ''
  configSvc: any
  timeLeft = 10 // In Seconds
  interval: any

  showFileError = false
  public fileName: any
  fileSelected!: any
  userProfile: any
  fileUploadDialogInstance: any

  sizeOptions: number[] = []
  startIndex = 0
  lastIndex: any
  pageSize = 0
  bulkUploadConfig: any

  constructor(
    private fileService: FileService,
    private matSnackBar: MatSnackBar,
    public dialog: MatDialog,
    private usersService: UsersService,
    private activateRoute: ActivatedRoute,
  ) {
    this.configSvc = this.activateRoute.snapshot.data['configService']
    this.rootOrgId = _.get(this.configSvc, 'userProfile.rootOrgId')
    this.userProfile = _.get(this.configSvc, 'userProfileV2')
    this.bulkUploadFrameworkId = _.get(this.configSvc, 'orgReadData.frameworkid')

  }

  ngOnInit() {
    this.getBulkStatusList()
    this.activateRoute.data.subscribe(data => {
      this.bulkUploadConfig = data.pageData.data.bulkUploadConfig
      this.pageSize = this.bulkUploadConfig.pageSize
      this.sizeOptions = this.bulkUploadConfig.pageSizeOptions
    })
  }

  ngAfterViewInit(): void {
    this.lastIndex = this.sizeOptions[0]
  }

  onChangePage(pe: PageEvent) {
    this.startIndex = pe.pageIndex * pe.pageSize
    this.lastIndex = (pe.pageIndex + 1) * pe.pageSize

    // this.startIndex = this.pageIndex
  }

  getBulkStatusList(): void {
    this.fileService.getBulkCompetencyUploadData(this.rootOrgId)
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((res: any) => {
        this.lastUploadList = res.result.content.sort((a: IBulkUploadDesignationList, b: IBulkUploadDesignationList) =>
          new Date(b.dateCreatedOn).getTime() - new Date(a.dateCreatedOn).getTime())
        // tslint:disable-next-line
      }, (error: HttpErrorResponse) => {
        if (!error.ok) {
          this.matSnackBar.open('Unable to get Bulk status list')
        }
      })
  }

  showFileUploadProgress(): void {
    this.fileUploadDialogInstance = this.dialog.open(FileProgressComponent, {
      data: {},
      disableClose: true,
      panelClass: 'progress-modal',
    })
  }

  handleDownloadFile(listObj: IBulkUploadDesignationList): void {
    const filePath = this.fileService.getBulkCompetencyStatus(listObj.fileName)
    this.fileService.downloadWithDispositionName(filePath)
  }

  handleDownloadSampleFile(): void {
    const filePath = this.fileService.downloadBulkUploadCompetencySampleFile(this.bulkUploadFrameworkId)
    this.fileService.downloadWithDispositionName(filePath)
  }

  handleFileClick(event: any): void {
    event.target.value = ''
  }

  sendOTP(): void {
    this.generateAndVerifyOTP(this.userProfile.email ? 'email' : 'phone')
  }

  generateAndVerifyOTP(contactType: string, resendFlag?: string): void {
    const postValue = contactType === 'email' ? this.userProfile.email : this.userProfile.mobile
    this.usersService.sendOtp(postValue, contactType)
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((_res: any) => {
        this.matSnackBar.open(`An OTP has been sent to your ${contactType === 'phone' ? 'Mobile number'
          : 'Email address'}, (Valid for 15 min's)`)
        if (!resendFlag) {
          this.verifyOTP(contactType)
        }
        // tslint:disable-next-line
      }, (error: HttpErrorResponse) => {
        if (!error.ok) {
          this.matSnackBar.open(_.get(error, 'error.params.errmsg') || `Unable to send OTP to your ${contactType}, please try again later!`)
        }
      })
  }

  handleOnFileChange(event: any): void {
    this.showFileError = false
    const fileList = (<HTMLInputElement>event.target).files
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0]
      this.fileName = file.name
      this.fileSelected = file
      if (this.fileService.validateFile(this.fileName)) {
        this.verifyOTP(this.userProfile.email ? 'email' : 'phone')
        // this.showFileUploadProgress()
        // this.uploadCSVFile()
      } else {
        this.showFileError = true
      }
    }
  }

  verifyOTP(contactType: string): void {
    const dialogRef = this.dialog.open(VerifyOtpComponent, {
      data: { type: contactType, email: this.userProfile.email, mobile: this.userProfile.mobile },
      disableClose: true,
      panelClass: 'common-modal',
    })

    dialogRef.componentInstance.resendOTP.subscribe((_cType: any) => {
      this.generateAndVerifyOTP(_cType, 'resend')
    })

    dialogRef.componentInstance.otpVerified.subscribe((_data: boolean) => {
      this.showFileUploadProgress()
      this.uploadCSVFile()
    })
  }

  uploadCSVFile(): void {
    if (this.fileService.validateFile(this.fileName)) {
      if (this.fileSelected) {
        const formData: FormData = new FormData()
        formData.append('file', this.fileSelected)
        this.fileService.bulkUploadCompetency(this.fileName, formData, this.bulkUploadFrameworkId)
          .pipe(takeUntil(this.destroySubject$))
          .subscribe((_res: any) => {
            this.fileUploadDialogInstance.close()
            this.matSnackBar.open('File uploaded successfully!')
            this.fileName = ''
            this.fileSelected = ''
            this.getBulkStatusList()
            this.startTimer()
            // tslint:disable-next-line
          }, (_err: HttpErrorResponse) => {
            if (!_err.ok) {
              this.matSnackBar.open('Uploading CSV file failed due to some error, please try again later!')
            }
          })
      }
    } else {
      this.showFileError = true
    }
  }

  handleChangePage(_event: PageEvent): void {
    this.pageSize = _event.pageSize
    this.startIndex = (_event.pageIndex) * _event.pageSize
    this.lastIndex = this.startIndex + _event.pageSize
  }

  ngOnDestroy(): void {
    this.destroySubject$.unsubscribe()
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  startTimer() {
    let timeLeft = this.timeLeft
    this.interval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft = timeLeft - 1
      } else {
        clearInterval(this.interval)
        this.getBulkStatusList()
      }
    }, 1000)
  }
}
