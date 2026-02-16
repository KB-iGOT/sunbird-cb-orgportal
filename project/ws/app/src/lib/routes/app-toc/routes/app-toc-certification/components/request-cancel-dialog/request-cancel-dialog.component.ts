import { Component, OnInit, Inject } from '@angular/core'

import { TCertificationRequestType } from '../../models/certification.model'
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'

@Component({
  selector: 'ws-app-request-cancel-dialog',
  templateUrl: './request-cancel-dialog.component.html',
  styleUrls: ['./request-cancel-dialog.component.scss'],
})
export class RequestCancelDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public requestType: TCertificationRequestType,
    private dialogRef: MatDialogRef<RequestCancelDialogComponent, { confirmCancel: boolean }>,
  ) { }

  ngOnInit() { }

  cancelRequest() {
    this.dialogRef.close({
      confirmCancel: true,
    })
  }
}
