import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PeerValidationRoutingModule } from './peer-validation-routing.module'
import { PeerValidationLibModule, LOADER_SERVICE } from '@sunbird-cb/consumption'
import { LoaderService } from '../../../../../../../../../src/app/services/loader.service'



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    PeerValidationLibModule,
    PeerValidationRoutingModule,
  ],
  providers: [
    { provide: LOADER_SERVICE, useExisting: LoaderService }
  ]
})
export class PeerValidationModule { }
