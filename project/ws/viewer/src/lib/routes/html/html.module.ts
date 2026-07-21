import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import {
  // BtnContentDownloadModule,
  // BtnContentFeedbackModule,
  BtnContentLikeModule,
  // BtnContentShareModule,
  BtnFullscreenModule,
  // BtnGoalsModule,
  BtnPlaylistModule,
  DisplayContentTypeModule,
  UserContentRatingModule,
  UserImageModule,
  BtnContentFeedbackV2Module,
} from '@sunbird-cb/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { HtmlModule as HtmlViewContainerModule } from '../../route-view-container/html/html.module'

import { HtmlComponent } from './html.component'


import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { AccessControlService } from '@sunbird-cb/toc'
@NgModule({
  declarations: [HtmlComponent],
  imports: [
    CommonModule,
    HtmlViewContainerModule,
    RouterModule,
    SbUiResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    BtnContentLikeModule,
    // BtnContentShareModule,
    BtnFullscreenModule,
    // BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
  ],
  providers: [AccessControlService],
})
export class HtmlModule { }
