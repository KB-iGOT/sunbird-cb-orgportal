import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
@Component({
    selector: 'ws-app-preview-dialog-box',
    templateUrl: './preview-dialog-box.component.html',
    styleUrls: ['./preview-dialog-box.component.scss'],
    standalone: false
})
export class PreviewDialogBoxComponent implements OnInit {

  contentForm: any

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PreviewDialogBoxComponent>
  ) { }

  ngOnInit() {
    this.contentForm = this.data.from
  }

  closeModal() {
    this.dialogRef.close()
  }
}
