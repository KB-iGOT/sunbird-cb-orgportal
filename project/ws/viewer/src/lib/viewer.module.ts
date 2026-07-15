import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { ViewerRoutingModule } from './viewer-routing.module'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  DefaultThumbnailModule,
  PipePartialContentModule,
} from '@sunbird-cb/utils-v2'

import {
  ErrorResolverModule,
  BtnPageBackModule,
  BtnFullscreenModule,
  DisplayContentTypeModule,
  // BtnContentDownloadModule,
  BtnContentLikeModule,
  // BtnContentShareModule,
  // BtnGoalsModule,
  BtnPlaylistModule,
  // BtnContentFeedbackModule,
  DisplayContentTypeIconModule,
  BtnContentFeedbackV2Module,

  // PlayerBriefModule,
} from '@sunbird-cb/collection'

import { ContentTocModule } from '@sunbird-cb/toc'

import { ViewerComponent } from './viewer.component'
import { ViewerTocComponent } from './components/viewer-toc/viewer-toc.component'
import { ViewerTopBarModule } from './components/viewer-top-bar/viewer-top-bar.module'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'
import { PdfScormDataService } from './pdf-scorm-data-service'
import { ViewerSecondaryTopBarModule } from './components/viewer-secondary-top-bar/viewer-secondary-top-bar.module'
import { MatMenuModule } from '@angular/material/menu'
import { NgCircleProgressModule } from 'ng-circle-progress'
import { AppPreAssessmentContentResolverService } from '../../../app/src/lib/routes/app-toc/services/app-pre-assessment-content-read-resolver.service'
import { PendingFunctionService } from './services/pending-function.service'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'

// tslint:disable-next-line:function-name
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http)
}
@NgModule({
  declarations: [ViewerComponent, ViewerTocComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatListModule,
    MatTreeModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ViewerRoutingModule,
    ErrorResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    DefaultThumbnailModule,
    BtnPageBackModule,
    BtnFullscreenModule,
    SbUiResolverModule,
    DisplayContentTypeModule,
    // BtnContentDownloadModule,
    BtnContentLikeModule,
    // BtnContentShareModule,
    // BtnGoalsModule,
    BtnPlaylistModule,
    // BtnContentFeedbackModule,
    BtnContentFeedbackV2Module,
    DisplayContentTypeIconModule,
    PipePartialContentModule,
    MatTabsModule,
    // PlayerBriefModule,
    ViewerTopBarModule,
    ViewerSecondaryTopBarModule,
    ContentTocModule,
    MatMenuModule,
    NgCircleProgressModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    ViewerComponent, ViewerTocComponent, ContentTocModule,
  ],
  providers: [PdfScormDataService, AppPreAssessmentContentResolverService, PendingFunctionService

  ],
})
export class ViewerModule { }
