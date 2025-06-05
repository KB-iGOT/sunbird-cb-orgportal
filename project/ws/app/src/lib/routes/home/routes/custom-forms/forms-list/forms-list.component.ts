import { Component } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatTableDataSource } from '@angular/material/table'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})

export class FormsListComponent {

  searchControl = new FormControl()
  dataSource!: any
  pageSizeOptions = [20, 30, 40]
  columnsList: any = []

  constructor(private router: Router) {
    this.dataSource = new MatTableDataSource<any>()
  }

  redirectToNewForm() {
    this.router.navigate(['/app/home/custom-forms/new'])
  }
}
