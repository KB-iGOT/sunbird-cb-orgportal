import { Component, Inject } from '@angular/core'
import { MAT_LEGACY_DIALOG_DATA, MatLegacyDialogRef } from '@angular/material/legacy-dialog'

@Component({
  selector: 'ws-app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent {
  constructor(
    public dialogRef: MatLegacyDialogRef<InfoModalComponent>,
    @Inject(MAT_LEGACY_DIALOG_DATA) public data: any) { }


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
}
