import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { CreateRequestRoutingModule } from './create-request-routing.module'
import { CreateRequestFormV2Component } from './components/create-request-form-v2/create-request-form-v2.component'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { MatLegacyCardModule } from '@angular/material/legacy-card'
import { CreateRequestModule as LibCreateRequestModule } from '@sunbird-cb/consumption'


@NgModule({
  declarations: [
    CreateRequestFormV2Component
  ],
  imports: [
    CommonModule,
    CreateRequestRoutingModule,
    RouterModule,
    MatIconModule,
    MatLegacyCardModule,
    LibCreateRequestModule
  ]
})
export class CreateRequestModule { }
