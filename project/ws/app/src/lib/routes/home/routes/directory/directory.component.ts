//#region (imports)
import { Component, OnInit } from '@angular/core'
//#endregion (imports)

@Component({
  selector: 'ws-app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})

export class DirectoryComponent implements OnInit {

  //#region (global variables)
  selectedTabIndex: number = 0;
  //#endregion (global variables)

  constructor() { }

  ngOnInit(): void {
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index
  }

}
