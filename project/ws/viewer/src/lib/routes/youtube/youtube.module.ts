import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import {
  // BtnContentDownloadModule,
  // BtnContentFeedbackModule,
  BtnContentLikeModule,
  // BtnContentShareModule,
  // BtnGoalsModule,
  BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  UserContentRatingModule,
  BtnContentFeedbackV2Module,
} from '@sunbird-cb/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { YoutubeComponent } from './youtube.component'

import { YoutubeModule as YoutubeViewContainerModule } from '../../route-view-container/youtube/youtube.module'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'

@NgModule({
  declarations: [YoutubeComponent],
  imports: [
    RouterModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    BtnContentLikeModule,
    // BtnContentShareModule,
    // BtnGoalsModule,
    BtnPlaylistModule,
    CommonModule,
    DisplayContentTypeModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    UserImageModule,
    SbUiResolverModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    YoutubeViewContainerModule,
  ],
})
export class YoutubeModule { }
