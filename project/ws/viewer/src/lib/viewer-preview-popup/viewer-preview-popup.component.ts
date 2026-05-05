import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  selector: 'viewer-viewer-preview-popup',
  templateUrl: './viewer-preview-popup.component.html',
  styleUrls: ['./viewer-preview-popup.component.scss'],
})
export class ViewerPreviewPopupComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  isFetchingDataComplete: any
  testData: any
  isErrorOccured: any
  quizJson: any
  ngOnInit() {
    if (this.data) {
      this.isFetchingDataComplete = this.data.isFetchingDataComplete
      this.testData = this.data.testData
      this.isErrorOccured = this.data.isErrorOccured
      this.quizJson = this.data.quizJson

    }

  }
}
