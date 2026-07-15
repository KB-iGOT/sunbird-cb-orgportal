import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

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
} from '@sunbird-cb/utils-v2'

import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

import { ResourceCollectionRoutingModule } from './resource-collection-routing.module'

import { ResourceCollectionComponent } from './resource-collection.component'

import {
  ResourceCollectionModule as ResourceCollectionViewContainerModule,
} from '../../route-view-container/resource-collection/resource-collection.module'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { PlayerSurveyModule } from '../../components/player-survey/player-survey.module'

@NgModule({
  declarations: [ResourceCollectionComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    ResourceCollectionRoutingModule,
    SbUiResolverModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    BtnContentLikeModule,
    // BtnContentShareModule,
    // BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    ResourceCollectionViewContainerModule,
    PlayerSurveyModule,
  ],
})
export class ResourceCollectionModule { }
