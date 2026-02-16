import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificationComponent } from './certification.component'
import { CertificationModule as CertificationViewContainerModule } from '../../route-view-container/certification/certification.module'
import { CertificationRoutingModule } from './certification-routing.module'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

@NgModule({
  declarations: [CertificationComponent],
  imports: [
    CommonModule,
    CertificationViewContainerModule,
    CertificationRoutingModule,
    SbUiResolverModule,
  ],
})
export class CertificationModule { }
