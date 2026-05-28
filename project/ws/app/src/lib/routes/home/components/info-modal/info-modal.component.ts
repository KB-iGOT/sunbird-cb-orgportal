import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { HttpEventType, HttpResponse } from '@angular/common/http'
import { Subject, Subscription } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { DownloadReportService } from '../../services/download-report.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { SnackbarComponent } from '@sunbird-cb/consumption'


@Component({
  selector: 'ws-app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
  standalone: false
})
export class InfoModalComponent implements OnInit, OnDestroy {
  progress = 0
  downloaded = 0
  total = 0
  remaining = 0
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
    public dialogRef: MatDialogRef<InfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
    this.progress = 0
    this.downloaded = 0
    this.total = 0
    this.remaining = 0
    this.isDownloading = true
    this.errorMessage = ''
    this.lastFailedItem = null

    const rootOrgId = this.data.rootOrgId

    this.sub = this.downloadSvc.downloadReportForOrgWithProgress(rootOrgId, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event.type === HttpEventType.DownloadProgress) {
          this.downloaded = event.loaded
          this.total = event.total || this.total
          this.progress = this.total ? Math.round(100 * this.downloaded / this.total) : 0
          this.remaining = this.total ? this.total - this.downloaded : 0
          this.cdr.detectChanges()
        } else if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<Blob>
          if (response && response.body) {
            const passwordHeader = response.headers?.getAll ? response.headers?.getAll('Password') : null
            if (passwordHeader && passwordHeader.length > 0) {
              if (!this.password) {
                this.password = passwordHeader[0]
              }
            } else if (response.headers?.get) {
              const passwordValue = response.headers.get('Password')
              if (passwordValue && !this.password) {
                this.password = passwordValue
              }
            }
            let filename = item.orgName || 'report'

            const contentType = response.headers ? response.headers.get('content-type') : null
            const blob = new Blob([response.body], { type: contentType || 'application/octet-stream' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename + '.zip'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            this.results.push({ item, status: 'Success' })
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: {
                message: filename + '.zip' + ' Downloaded successfully', type: 'success',
              }, duration: 3000, panelClass: 'course-success-snackbar',
            })
          }

          this.isDownloading = false
          this.currentIndex++
          setTimeout(() => this.downloadNext(), 200)
        }
      }, (err: any) => {
        this.isDownloading = false
        // Extract error message from response or use generic message
        const message = err?.status === 500 ? 'Report not found for the requested organization' : 'Download failed. Please try again.'
        this.errorMessage = message
        this.lastFailedItem = item
        this.results.push({ item, status: 'Failed', error: err, message })
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: item.orgName + '.zip' + ' failed to download.', type: 'error',
          }, duration: 3000, panelClass: 'course-error-snackbar',
        })

        // continue to next item instead of closing immediately
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

  formatBytes(bytes: number) {
    if (!bytes) { return '0 B' }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }
}
