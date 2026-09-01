import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'



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
    standalone: false
})
export class ReportIssueComponent {

  displayedColumns: string[] = ['title', 'reportCount', 'percenageVal']
  constructor(
    public dialogRef: MatDialogRef<ReportIssueComponent>,

    @Inject(MAT_DIALOG_DATA) public data: IDialogData[]) { }

  ngOnInit(): void {
  }

  onCancelDialog(): void {
    this.dialogRef.close()
  }

  // closeAllDialogs(): void {
  //   this.dialog.closeAll()
  // }

}
