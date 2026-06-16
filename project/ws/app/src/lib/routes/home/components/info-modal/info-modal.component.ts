import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { Subject, Subscription } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { DownloadReportService } from '../../services/download-report.service'


@Component({
  selector: 'ws-app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
  standalone: false
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
  private isCancelled = false
  private timerId: any = null

  constructor(
    public dialogRef: MatDialogRef<InfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private downloadSvc: DownloadReportService,
    private cdr: ChangeDetectorRef,
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
    this.isCancelled = false
    this.isDownloading = true
    this.downloadNext()
  }

  private downloadNext() {
    if (this.isCancelled) {
      return
    }
    if (this.currentIndex >= this.items.length) {
      this.completeDownload()
      return
    }

    const item = this.items[this.currentIndex]
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
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()

          // Delay removal to ensure browser registers the download
          setTimeout(() => {
            document.body.removeChild(a)
          }, 100)

          this.results.push({ item, status: 'Success' })
        } else {
          // API successful but no downloadUrl returned
          const message = 'Download URL not available. Please try again.'
          this.errorMessage = message
          this.lastFailedItem = item
          this.results.push({ item, status: 'Failed', error: null, message })
        }

        const isLastItem = this.currentIndex + 1 >= this.items?.length
        if (isLastItem) {
          this.completeDownload()
          return
        }
        this.currentIndex++
        this.timerId = setTimeout(() => this.downloadNext(), 300)
      }, (err: any) => {
        const message = err?.status === 404 ? err?.error?.message : 'Download failed. Please try again.'
        this.errorMessage = message
        this.lastFailedItem = item
        this.results.push({ item, status: 'Failed', error: err, message })

        const isLastItem = this.currentIndex + 1 >= this.items?.length
        if (isLastItem) {
          this.completeDownload()
          return
        }
        this.currentIndex++
        this.timerId = setTimeout(() => this.downloadNext(), 300)
      })
  }

  private completeDownload() {
    this.hasErrors = this.results.some(r => r.status === 'Failed')
    this.isDownloading = false
    this.isComplete = true
    if (!this.hasErrors) {
      this.dialogRef.close({ completed: true, results: this.results, password: this.password })
    }
    this.cdr.detectChanges()
  }

  cancel() {
    this.isCancelled = true
    this.isDownloading = false
    clearTimeout(this.timerId)
    this.timerId = null
    this.destroy$.next()
    this.destroy$.complete()
    if (this.sub) {
      this.sub.unsubscribe()
      this.sub = null
    }
    this.closeDialog()
  }

  closeDialog() {
    this.dialogRef.close({ completed: true, results: this.results, password: this.password })
  }

  ngOnDestroy() {
    this.isCancelled = true
    clearTimeout(this.timerId)
    this.timerId = null
    this.destroy$.next()
    this.destroy$.complete()
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }

}
