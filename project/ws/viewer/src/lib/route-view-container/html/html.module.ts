import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import {
  BtnContentDownloadModule,
  BtnContentFeedbackModule,
  BtnContentLikeModule,
  BtnContentShareModule,
  BtnFullscreenModule,
  BtnGoalsModule,
  BtnPlaylistModule,
  DisplayContentTypeModule,
  UserContentRatingModule,
  UserImageModule,
  BtnContentFeedbackV2Module,
  PlayerBriefModule,
} from '@sunbird-cb/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
  PipeLimitToPipe,
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

// import { HtmlRoutingModule } from './html-routing.module'

import { HtmlModule as HtmlPluginModule } from '../../plugins/html/html.module'

import { HtmlComponent } from './html.component'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatSnackBarModule } from '@angular/material/snack-bar'

// import { ViewerCourseInfoModule } from '../../plugins/viewer-course-info/viewer-course-info.module'

@NgModule({
  declarations: [HtmlComponent],
  imports: [
    CommonModule,
    HtmlPluginModule,
    RouterModule,
    // HtmlRoutingModule,
    SbUiResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnFullscreenModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    PlayerBriefModule,
    // ViewerCourseInfoModule,
  ],
  providers: [PipeLimitToPipe],
  exports: [HtmlComponent],
})
export class HtmlModule { }
