import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { ViewerTopBarComponent } from './viewer-top-bar.component'
import { BtnFullscreenModule, BtnPageBackNavModule } from '@sunbird-cb/collection'
import { RouterModule } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
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
