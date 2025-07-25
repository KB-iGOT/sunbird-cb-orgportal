import { Component, Inject } from '@angular/core'
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
// @dynamic
@Component({
  selector: 'ws-app-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss'],
})
export class DialogConfirmComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, body: string, yes: string, no: string },
    private dialogRef: MatDialogRef<DialogConfirmComponent>,
  ) { }

  confirmed() {
    this.dialogRef.close(true)
  }
}
