import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'ws-app-loading-popup',
    templateUrl: './loading-popup.component.html',
    styleUrls: ['./loading-popup.component.scss'],
    standalone: false
})
export class LoadingPopupComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<LoadingPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

  }


  confirmed() {
    let sendToParent: any = {}
    if (this.data?.type === 'import-igot-master-create') {
      sendToParent.startImporting = true
    }
    else if (this.data?.type === 'import-igot-master-review') {
      sendToParent.reviewImporting = false
    }
    else if (this.data?.type === 'delete') {
      sendToParent.isDelete = true
    }
    this.dialogRef.close(sendToParent)
  }

  rejected() {
    let sendToParent: any = {}
    if (this.data?.type === 'import-igot-master-create') {
      sendToParent.close = true
    }
    else if (this.data?.type === 'import-igot-master-review') {
      sendToParent.reviewImporting = true

    }
    else if (this.data?.type === 'delete') {
      sendToParent.isDelete = false
    }
    this.dialogRef.close(sendToParent)
  }
}
