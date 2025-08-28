import { Component } from '@angular/core'

@Component({
  selector: 'ws-app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent {

  departmentHearders: string[] = ['CBC', 'CBP Providers', 'Organisation'];

  onTabChange(event: any) {
    console.log(event)
  }

}
