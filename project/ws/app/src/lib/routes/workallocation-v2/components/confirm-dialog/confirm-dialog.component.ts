import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'ws-app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    standalone: false
})
export class ConfirmDialogComponent {

  dialgData: any

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialgData = data
  }

  closeDialog(action: string | boolean) {
    this.dialogRef.close(action)
  }
}
