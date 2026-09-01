import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AboutVideoComponent } from './about-video.component'
import { MatButtonModule } from '@angular/material/button'
import { MatRadioModule } from '@angular/material/radio'
import { MatToolbarModule } from '@angular/material/toolbar'
import { LocaleTranslatorModule, BreadcrumbsOrgModule } from '@sunbird-cb/collection'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [AboutVideoComponent],
  imports: [
    CommonModule,
    MatRadioModule,
    RouterModule,
    SbUiResolverModule,
    LocaleTranslatorModule,
    MatButtonModule,
    BreadcrumbsOrgModule,
    MatToolbarModule,
  ],
  exports: [AboutVideoComponent],
})
export class AboutVideoModule { }
