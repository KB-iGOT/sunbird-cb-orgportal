import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PeerValidationRoutingModule } from './peer-validation-routing.module'
import { PeerValidationLibModule } from '@sunbird-cb/consumption'



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    PeerValidationLibModule,
    PeerValidationRoutingModule,
  ]
})
export class PeerValidationModule { }
