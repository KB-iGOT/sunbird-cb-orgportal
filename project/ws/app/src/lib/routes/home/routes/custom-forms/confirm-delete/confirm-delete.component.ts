import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'ws-app-confirm-delete',
    templateUrl: './confirm-delete.component.html',
    styleUrls: ['./confirm-delete.component.scss'],
    standalone: false
})
export class ConfirmDeleteComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteComponent>, @Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  handleCloseModal(): void {
    this.dialogRef.close(false)
  }
  handleDeleteForm(): void {
    this.dialogRef.close(true)
  }
}
