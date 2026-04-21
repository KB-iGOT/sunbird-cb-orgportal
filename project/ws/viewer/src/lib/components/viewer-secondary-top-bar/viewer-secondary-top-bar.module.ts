import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnFullscreenModule, BtnPageBackNavModule, ContentProgressModule } from '@sunbird-cb/collection'
import { RouterModule } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { ViewerSecondaryTopBarComponent } from './viewer-secondary-top-bar.component'
import { TranslateModule } from '@ngx-translate/core'
import { ShareTocModule } from '@ws/app/src/lib/routes/app-toc/share-toc/share-toc.module'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { AppTocService } from '@ws/app/src/lib/routes/app-toc/services/app-toc.service'
@NgModule({
  declarations: [ViewerSecondaryTopBarComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    BtnFullscreenModule,
    BtnPageBackNavModule,
    MatTooltipModule,
    RouterModule,
    MatProgressBarModule,
    ContentProgressModule,
    TranslateModule,
    ShareTocModule,
  ],
  exports: [ViewerSecondaryTopBarComponent, ShareTocModule],
  providers: [ValueService, AppTocService],
})
export class ViewerSecondaryTopBarModule {
  isXSmall = false

  constructor() {

  }
}
