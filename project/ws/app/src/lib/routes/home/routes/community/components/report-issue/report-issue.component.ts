import { Component, Inject } from '@angular/core'
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog'



export interface IDialogData {
  title: string
  sn: number
  reportCount: number
  percenageVal: number
}

@Component({
  selector: 'ws-app-report-issue',
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.scss'],

})
export class ReportIssueComponent {

  displayedColumns: string[] = ['title', 'reportCount', 'percenageVal']
  constructor(
    public dialogRef: MatDialogRef<ReportIssueComponent>,

    @Inject(MAT_DIALOG_DATA) public data: IDialogData[]) { }

  ngOnInit(): void {

    console.log(this.data, 'data========')
  }

  onCancelDialog(): void {
    console.log('btn clicked!')
    this.dialogRef.close()
  }

  // closeAllDialogs(): void {
  //   this.dialog.closeAll()
  // }



}
