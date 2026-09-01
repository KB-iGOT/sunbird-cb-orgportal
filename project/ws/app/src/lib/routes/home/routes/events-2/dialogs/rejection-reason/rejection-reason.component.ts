import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'ws-app-rejection-reason',
    templateUrl: './rejection-reason.component.html',
    styleUrls: ['./rejection-reason.component.scss'],
    standalone: false
})
export class RejectionReasonComponent {

  rejectReason: any

  constructor(
    private dialogRef: MatDialogRef<RejectionReasonComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.rejectReason = data
  }

  closeDialog() {
    this.dialogRef.close()
  }

}
