import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  UserContentRatingModule,
  BtnContentFeedbackV2Module,
  BtnPageBackModule,
} from '@sunbird-cb/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

// import { QuizModule as QuizPluginModule } from '../../plugins/quiz/quiz.module'
import { PracticeModule as PracticeViewContainerModule } from '../../route-view-container/practice/practice.module'

import { PracticeTestComponent } from './practice-test.component'
import { PracticeRoutingModule } from './practice-routing.module'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatToolbarModule } from '@angular/material/toolbar'
// import { ViewerPreviewPopupComponent } from '../../viewer-preview-popup/viewer-preview-popup.component'
@NgModule({
  declarations: [PracticeTestComponent],
  imports: [
    CommonModule,
    PracticeRoutingModule,
    PracticeViewContainerModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    SbUiResolverModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    BtnPageBackModule,
  ]
})
export class PracticeTestModule { }
