import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicAboutComponent } from './public-about.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BreadcrumbsOrgModule } from '@sunbird-cb/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@sunbird-cb/utils-v2'

@NgModule({
  declarations: [PublicAboutComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    BreadcrumbsOrgModule,
    MatButtonModule,

    HorizontalScrollerModule,
    PipeSafeSanitizerModule,
  ],

  exports: [PublicAboutComponent],
})
export class PublicAboutModule { }
