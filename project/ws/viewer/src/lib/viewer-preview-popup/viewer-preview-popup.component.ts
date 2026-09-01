import { Component, Inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { PracticeModule } from '../route-view-container/practice/practice.module'

@Component({
  selector: 'viewer-viewer-preview-popup',
  templateUrl: './viewer-preview-popup.component.html',
  styleUrls: ['./viewer-preview-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PracticeModule],
})
export class ViewerPreviewPopupComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  isFetchingDataComplete: any
  testData: any
  isErrorOccured: any
  quizJson: any
  forPreview: any
  ngOnInit() {
    if (this.data) {
      this.isFetchingDataComplete = this.data.isFetchingDataComplete
      this.testData = this.data.testData
      this.isErrorOccured = this.data.isErrorOccured
      this.quizJson = this.data.quizJson
      this.forPreview = this.data.forPreview

    }

  }
}
