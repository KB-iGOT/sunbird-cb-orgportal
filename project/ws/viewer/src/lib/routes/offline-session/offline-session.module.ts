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
} from '@sunbird-cb/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { OfflineSessionModule as OfflineSessionContainerModule } from '../../route-view-container/offline-session/offline-session.module'
import { OfflineSessionComponent } from './offline-session.component'
import { RouterModule, Routes } from '@angular/router'
import { ViewerResolve } from '../../viewer.resolve'
import { TranslateModule } from '@ngx-translate/core'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'

const routes: Routes = [
  {
    path: '',
    component: OfflineSessionComponent,
    resolve: {
      content: ViewerResolve,
    },
  },
]

@NgModule({
  declarations: [OfflineSessionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatDividerModule,
    MatIconModule,
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
    OfflineSessionContainerModule,
    TranslateModule.forChild(),
  ],
  providers: [ViewerResolve],
})
export class OfflineSessionModule { }
