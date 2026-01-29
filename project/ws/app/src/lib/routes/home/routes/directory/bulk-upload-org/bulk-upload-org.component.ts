import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { OrgHierarchyService } from '../../../services/org-hierarchy.service'
import { GlobalEventsService } from '../../../../../../../../../../src/app/services/global-events.service'

@Component({
    selector: 'ws-app-bulk-upload-org',
    templateUrl: './bulk-upload-org.component.html',
    styleUrls: ['./bulk-upload-org.component.scss'],
    standalone: false
})
export class BulkUploadOrgComponent implements OnInit {

  bulkUploadConfig!: any
  lastUploadList!: any[]

  constructor(
    public dialogRef: MatDialogRef<BulkUploadOrgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orgHieService: OrgHierarchyService,
    private loaderService: GlobalEventsService,
    private snackbar: MatSnackBar,
  ) {

  }

  ngOnInit() {
    this.bulkUploadConfig = this.data.bulkUploadConfig || {}
    if (this.bulkUploadConfig) {
      this.getBulkuploadPrgressData()
    }
  }

  async handleDownloadSampleFile() {
    const frameworkData: any = this.bulkUploadConfig.frameworkData || {}
    if (frameworkData && frameworkData.orgHierarchyFrameworkId) {
      this.loaderService.setLoaderState(true)
      const fileData: any = await this.orgHieService.downloadSampleTemplate(frameworkData.orgHierarchyFrameworkId).toPromise().catch(_err => {
        this.loaderService.setLoaderState(false)
        if (_err && _err.error && _err.error.params && _err.error.params.errMsg) {
          this.snackbar.open(`${_err.error.params.errMsg}`)
        }
      })
      if (fileData) {
        this.snackbar.open(`Download successfully`)
      }
    }
  }

  handleFileClick(event: any): void {
    event.target.value = ''
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!this.isValidExcelFile(file)) {
        this.showMessage('Please select a valid Excel file (.xlsx)')
        return
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('File size should not exceed 5MB')
        return
      }
      this.uploadExcelFile(file)
    }
  }

  async uploadExcelFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    this.loaderService.setLoaderState(true)
    const uploadFileRes = await this.orgHieService.uploadFreameworkTemplate(formData, this.bulkUploadConfig.frameworkData).toPromise().catch((_err: any) => {
      this.loaderService.setLoaderState(false)
      if (_err && _err.error && _err.error.params && _err.error.params.errMsg) {
        this.snackbar.open(`${_err.error.params.errMsg}`)
      }
    })

    if (uploadFileRes && uploadFileRes.result && uploadFileRes.result.fileName) {
      this.loaderService.setLoaderState(false)
      this.getBulkuploadPrgressData()
      this.snackbar.open(`File uploaded successfully. Please check after 5 minutes for the results.`)
    }
  }

  showMessage(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: 5000,
    })
  }

  isValidExcelFile(file: File): boolean {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    console.log('File type: ', allowedTypes)
    return allowedTypes.includes(file.type)
  }

  getBulkuploadPrgressData() {
    this.loaderService.setLoaderState(true)
    const orgId = this.bulkUploadConfig.frameworkData.orgHierarchyFrameworkId.split(`_`)[0]
    this.orgHieService.getBulkuploadProgress((orgId) ? orgId : '').subscribe(
      (res: any) => {
        this.loaderService.setLoaderState(false)
        if (res && res.params && res.params.status?.toLowerCase() === 'successful') {
          this.lastUploadList = res.result.content
        } else {
          this.lastUploadList = []
          this.snackbar.open('No progress data found')
        }
      },
      (_err: any) => {
        this.lastUploadList = []
        this.loaderService.setLoaderState(false)
        this.snackbar.open('Error fetching progress data')
      }
    )
  }

  handleDownloadFile(item: any) {
    if (item && item.fileName) {
      this.loaderService.setLoaderState(true)
      this.orgHieService.downloadFileLog(item.fileName).subscribe(
        (res: any) => {
          this.loaderService.setLoaderState(false)
          const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = item.fileName
          a.click()
          window.URL.revokeObjectURL(url)
        },
        (_err: any) => {
          this.loaderService.setLoaderState(false)
          this.snackbar.open('Error downloading file')
        }
      )
    } else {
      this.snackbar.open('No file name provided for download')
    }
  }

}
