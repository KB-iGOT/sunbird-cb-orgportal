import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { QuickTourComponent } from './quick-tour.component'

@NgModule({
  declarations: [QuickTourComponent],
  imports: [
    CommonModule,
    SbUiResolverModule,
  ],
  exports: [QuickTourComponent],
})
export class QuickTourModule { }
