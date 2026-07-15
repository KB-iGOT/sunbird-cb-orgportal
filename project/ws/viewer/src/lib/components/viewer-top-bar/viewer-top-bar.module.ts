import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { ViewerTopBarComponent } from './viewer-top-bar.component'
import { BtnFullscreenModule, BtnPageBackNavModule } from '@sunbird-cb/collection'
import { RouterModule } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
@NgModule({
  declarations: [ViewerTopBarComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    BtnFullscreenModule,
    BtnPageBackNavModule,
    MatTooltipModule,
    RouterModule,
  ],
  exports: [ViewerTopBarComponent],
  providers: [ValueService],
})
export class ViewerTopBarModule {
  isXSmall = false

  constructor() {

  }

}
