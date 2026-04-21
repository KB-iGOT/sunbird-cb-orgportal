import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificationComponent } from './certification.component'
import { CertificationModule as CertificationPluginModule } from '../../plugins/certification/certification.module'
import { CertificationRoutingModule } from './certification-routing.module'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

@NgModule({
  declarations: [CertificationComponent],
  imports: [
    CommonModule,
    CertificationPluginModule,
    CertificationRoutingModule,
    SbUiResolverModule,
  ],
  exports: [CertificationComponent],
})
export class CertificationModule { }
