import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  BtnContentDownloadModule,
  BtnContentFeedbackModule,
  BtnContentLikeModule,
  BtnContentShareModule,
  BtnGoalsModule,
  BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  UserContentRatingModule,
  BtnContentFeedbackV2Module,
  PlayerBriefModule,
} from '@sunbird-cb/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'
import { TranslateModule } from '@ngx-translate/core'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { PdfComponent } from './pdf.component'
import { RouterModule } from '@angular/router'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatSnackBarModule } from '@angular/material/snack-bar'
@NgModule({
  declarations: [PdfComponent],
  imports: [
    RouterModule,
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatSnackBarModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    SbUiResolverModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    PlayerBriefModule,
    TranslateModule,
  ],
  exports: [
    PdfComponent,
  ],
})
export class PdfModule { }
