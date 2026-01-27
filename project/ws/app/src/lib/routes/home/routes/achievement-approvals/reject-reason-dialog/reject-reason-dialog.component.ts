import { Component, Inject } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog'

export interface RejectReasonDialogData {
  title?: string
  message?: string
  maxLength?: number
}

@Component({
  selector: 'ws-app-reject-reason-dialog',
  templateUrl: './reject-reason-dialog.component.html',
  styleUrls: ['./reject-reason-dialog.component.scss'],
})
export class RejectReasonDialogComponent {
  form: FormGroup
  maxLength = 500

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RejectReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectReasonDialogData,
  ) {
    if (data && data.maxLength) {
      this.maxLength = data.maxLength
    }

    this.form = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(this.maxLength), Validators.minLength(100)]],
    })
  }

  onConfirm(): void {
    if (this.form.valid) {
      const reason = this.form.get('reason')?.value
      this.dialogRef.close(reason)
    } else {
      this.form.markAllAsTouched()
    }
  }

  onCancel(): void {
    this.dialogRef.close()
  }
}
