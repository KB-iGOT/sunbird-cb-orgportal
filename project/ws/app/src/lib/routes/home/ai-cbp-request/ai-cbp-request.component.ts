import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
/* tslint:disable */
import * as _ from 'lodash'
/* tslint:enable */
export enum statusValue {
  Assigned = 'Assigned',
  Unassigned = 'Unassigned',
  Inprogress = 'InProgress',
  invalid = 'Invalid',
  fullfill = 'Fulfill',
}
@Component({
  selector: 'ws-ai-cbp-request',
  templateUrl: './ai-cbp-request.component.html',
  styleUrls: ['./ai-cbp-request.component.scss'],
})
export class AICBPRequestComponent implements OnInit {
  constructor(private router: Router,) {

  }

  ngOnInit(): void {
    console.log(this.router)
  }

}
