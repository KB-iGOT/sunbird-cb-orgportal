
import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'

@Component({
    selector: 'ws-auth-selected-user-dialog',
    templateUrl: './selected-user-dialog.component.html',
    styleUrls: ['./selected-user-dialog.component.scss'],
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatTableModule],
})

export class SelectedUserDialogComponent implements OnInit {

  displayedColumns: string[] = ['fullName', 'email', 'ministry', 'status', 'mobile']
  dataSource = new MatTableDataSource<any>([])
  constructor(
    public dialogRef: MatDialogRef<SelectedUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>(this.data.userData)
  }
  applyTableFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

}
