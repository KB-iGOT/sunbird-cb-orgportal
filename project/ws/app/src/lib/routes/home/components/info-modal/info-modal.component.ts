import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { MAT_LEGACY_DIALOG_DATA, MatLegacyDialogRef } from '@angular/material/legacy-dialog'
import { Subject, Subscription } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { DownloadReportService } from '../../services/download-report.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SnackbarComponent } from '@sunbird-cb/consumption'


@Component({
  selector: 'ws-app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent implements OnInit, OnDestroy {
  isDownloading = false
  currentIndex = 0
  items: any[] = []
  results: any[] = []
  password = ''
  errorMessage = ''
  lastFailedItem: any = null
  isComplete = false
  hasErrors = false

  private destroy$ = new Subject<void>()
  private sub: Subscription | null = null

  constructor(
    public dialogRef: MatLegacyDialogRef<InfoModalComponent>,
    @Inject(MAT_LEGACY_DIALOG_DATA) public data: any,
    private downloadSvc: DownloadReportService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    if (this.data && this.data.type === 'download-file-with-progress') {
      this.items = this.data.items || (this.data.item ? [this.data.item] : [])
      // start downloads automatically
      if (this.items.length > 0) {
        this.startSequentialDownload()
      } else if (this.data.downloadUrl) {
        // single URL case
        this.items = [{ downloadUrl: this.data.downloadUrl, orgName: this.data.orgName }]
        this.startSequentialDownload()
      }
    }
  }


  confirmed() {
    let sendToParent: any = {}
    if (this.data.type === 'import-igot-master-create') {
      sendToParent.startImporting = true
    }
    else if (this.data.type === 'import-igot-master-review') {
      sendToParent.reviewImporting = false
    }
    else if (this.data.type === 'delete') {
      sendToParent.isDelete = true
    }
    this.dialogRef.close(sendToParent)
  }

  rejected() {
    let sendToParent: any = {}
    if (this.data.type === 'import-igot-master-create') {
      sendToParent.close = true
    }
    else if (this.data.type === 'import-igot-master-review') {
      sendToParent.reviewImporting = true

    }
    else if (this.data.type === 'delete') {
      sendToParent.isDelete = false
    }
    this.dialogRef.close(sendToParent)
  }

  cancelled() {
    this.dialogRef.close({ cancelled: true })
  }

  startSequentialDownload() {
    this.currentIndex = 0
    this.downloadNext()
  }

  private downloadNext() {
    if (this.currentIndex >= this.items.length) {
      // Check if there were any failures
      this.hasErrors = this.results.some(r => r.status === 'Failed')
      this.isComplete = true
      // Only auto-close if no errors occurred
      if (!this.hasErrors) {
        this.dialogRef.close({ completed: true, results: this.results, password: this.password })
      }
      this.cdr.detectChanges()
      return
    }

    const item = this.items[this.currentIndex]
    this.isDownloading = true
    this.errorMessage = ''
    this.lastFailedItem = null

    const rootOrgId = this.data.rootOrgId

    this.sub = this.downloadSvc.downloadReportForOrg(rootOrgId, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe((body: any) => {
        if (body && body.downloadUrl) {
          if (body.password && !this.password) {
            this.password = body.password
          }
          const filename = item.orgName ? item.orgName + '.zip' : (body.fileName || 'report.zip')

          const a = document.createElement('a')
          a.href = body.downloadUrl
          a.download = filename
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          this.results.push({ item, status: 'Success' })
          // this.snackBar.openFromComponent(SnackbarComponent, {
          //   data: {
          //     message: filename + ' Downloaded successfully', type: 'success',
          //   }, duration: 3000, panelClass: 'course-success-snackbar',
          // })
        }

        this.isDownloading = false
        this.currentIndex++
        setTimeout(() => this.downloadNext(), 200)
      }, (err: any) => {
        this.isDownloading = false
        const message = err?.status === 404 ? 'Report not found for the requested organization' : 'Download failed. Please try again.'
        this.errorMessage = message
        this.lastFailedItem = item
        this.results.push({ item, status: 'Failed', error: err, message })
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: item.orgName + '.zip' + ' failed to download.', type: 'error',
          }, duration: 3000, panelClass: 'course-error-snackbar',
        })

        this.currentIndex++
        setTimeout(() => this.downloadNext(), 200)
      })
  }

  cancel() {
    this.destroy$.next()
    this.destroy$.complete()
    if (this.sub) {
      this.sub.unsubscribe()
      this.sub = null
    }
    this.dialogRef.close({ cancelled: true, results: this.results })
  }

  closeDialog() {
    this.dialogRef.close({ completed: true, results: this.results, password: this.password })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }

}
