import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay'
import { APP_BASE_HREF, PlatformLocation } from '@angular/common'
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http'
// Injectable
import { APP_INITIALIZER, NgModule, ErrorHandler } from '@angular/core'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox'
// GestureConfig,
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar'
import { MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS as MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS, MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider'
import { MAT_LEGACY_SNACK_BAR_DEFAULT_OPTIONS as MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/legacy-snack-bar'
import { MatSortModule } from '@angular/material/sort'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
// HAMMER_GESTURE_CONFIG
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  TourModule,
  WIDGET_REGISTRATION_CONFIG, PipeContentRoutePipe, StickyHeaderModule,
  AtGlanceModule,
  AvatarPhotoModule,
  BtnAppsModule,
  BtnCallModule,
  BtnCatalogModule,
  BtnChannelAnalyticsModule,
  BtnContentDownloadModule,
  BtnContentFeedbackModule,
  BtnContentLikeModule,
  BtnContentMailMeModule,
  BtnContentShareModule,
  BtnFullscreenModule,
  BtnGoalsModule,
  BtnMailUserModule,
  BtnPageBackNavModule,
  BtnPageBackModule,
  BtnPageBackModuleAdmin,
  BtnPlaylistModule,
  BtnPreviewModule,
  BtnSettingsModule,
  CardBreadcrumbModule,
  CardChannelModule,
  CardContentModule,
  CardWelcomeModule,
  CardNetworkModule,
  CardHomeTopModule,
  CardBrowseCourseModule,
  ChannelHubModule,
  ContentStripMultipleModule,
  ContentStripSingleModule,
  DiscussionForumModule,
  ElementHtmlModule,
  EmbeddedPageModule,
  ErrorResolverModule,
  GalleryViewModule,
  GraphGeneralModule,
  GridLayoutModule,
  ImageMapResponsiveModule,
  IntranetSelectorModule,
  LayoutLinearModule,
  LayoutTabModule,
  PageModule,
  PickerContentModule,
  PlayerAmpModule,
  PlayerAudioModule,
  PlayerPdfModule,
  PlayerSlidesModule,
  PlayerVideoModule,
  PlayerWebPagesModule,
  PlayerYoutubeModule,
  ReleaseNotesModule,
  SelectorResponsiveModule,
  SlidersMobModule,
  SlidersModule,
  TreeCatalogModule,
  TreeModule,
  CardHubsListModule,
  CardNetworkHomeModule,
  CardTableModule,
  CardActivityModule,
  BtnFeatureModule,
  UIAdminTableModule,
  LeftMenuModule,
  UIORGTableModule,
  BreadcrumbsOrgModule,
  AuthorCardModule,
} from '@sunbird-cb/collection'
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2'
import { LoggerService, NPSGridService, PipeSafeSanitizerModule } from '@sunbird-cb/utils-v2'
import { SearchModule } from '@ws/app/src/public-api'
import 'hammerjs'
// import { KeycloakAngularModule } from 'keycloak-angular'
import { AppRoutingModule } from './app-routing.module'
import { InitService } from './services/init.service'
import { GlobalErrorHandlingService } from './services/global-error-handling.service'
// import { AppTocResolverService } from '@ws/app/src/lib/routes/app-toc/resolvers/app-toc-resolver.service'

import { RootComponent } from './component/root/root.component'
import { LoginComponent } from './component/login/login.component'
import { AppFooterComponent } from './component/app-footer/app-footer.component'
import { AppNavBarComponent } from './component/app-nav-bar/app-nav-bar.component'
import { AppPublicNavBarComponent } from './component/app-public-nav-bar/app-public-nav-bar.component'
import { DialogConfirmComponent } from './component/dialog-confirm/dialog-confirm.component'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { LoginRootDirective } from './component/login-root/login-root.directive'
import { TncRendererComponent } from './component/tnc-renderer/tnc-renderer.component'
import { MobileAppModule } from './routes/public/mobile-app/mobile-app.module'
import { PublicAboutModule } from './routes/public/public-about/public-about.module'
import { PublicContactModule } from './routes/public/public-contact/public-contact.module'
import { PublicFaqModule } from './routes/public/public-faq/public-faq.module'
import { TncComponent } from './routes/tnc/tnc.component'
import { AppInterceptorService } from './services/app-interceptor.service'
import { AppRetryInterceptorService } from './services/app-retry-interceptor.service'
import { TncAppResolverService } from './services/tnc-app-resolver.service'
import { TncPublicResolverService } from './services/tnc-public-resolver.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ServiceWorkerModule } from '@angular/service-worker'
import { environment } from '../environments/environment'
import { PublicLogoutModule } from './routes/public/public-logout/public-logout.module'
import { LoaderService } from './services/loader.service'
import { ConfirmationBoxComponent } from '../../project/ws/app/src/lib/routes/training-plan/components/confirmation-box/confirmation.box.component'
import { LibNotificationsService, NotificationDropdownModule } from '@sunbird-cb/notification'
import { NotificationsService } from './services/notifications.service'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { TranslateModule, TranslateLoader, } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import {
  WIDGET_REGISTRATION_LIB_CONFIG,
} from '@sunbird-cb/consumption'
/** Collection Library Modules */

import { SearchListingModule } from '@sunbird-cb/search-listing'

// @Injectable()
// export class HammerConfig extends GestureConfig {
//   buildHammer(element: HTMLElement) {
//     return new GestureConfig({ touchAction: 'pan-y' }).buildHammer(element)
//   }
// }

const appInitializer = (initSvc: InitService, logger: LoggerService) => async () => {
  try {
    await initSvc.init()
  } catch (error) {
    logger.error('ERROR DURING APP INITIALIZATION >', error)
  }
}

const getBaseHref = (platformLocation: PlatformLocation): string => {
  return platformLocation.getBaseHrefFromDOM()
}

export function HttpLoaderFactory(http: HttpClient) {
  // @ts-ignore - Version compatibility issue between core and http-loader
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

// tslint:disable-next-line: max-classes-per-file
@NgModule({
  declarations: [
    RootComponent,
    LoginComponent,
    AppNavBarComponent,
    AppPublicNavBarComponent,
    TncComponent,
    TncRendererComponent,
    AppFooterComponent,
    InvalidUserComponent,
    DialogConfirmComponent,
    LoginRootComponent,
    LoginRootDirective,
    ConfirmationBoxComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserAnimationsModule,
    // KeycloakAngularModule,
    AppRoutingModule,
    SbUiResolverModule.forRoot([...WIDGET_REGISTRATION_CONFIG, ...WIDGET_REGISTRATION_LIB_CONFIG]),
    StickyHeaderModule,
    ErrorResolverModule,
    // Material Imports
    MatSliderModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatRippleModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatSortModule,
    SearchModule,
    BtnFeatureModule,
    PublicAboutModule,
    PublicContactModule,
    PublicFaqModule,
    MobileAppModule,
    PipeSafeSanitizerModule,
    TourModule,
    PublicLogoutModule,
    MatProgressSpinnerModule,
    AtGlanceModule,
    AvatarPhotoModule,
    BtnAppsModule,
    BtnCallModule,
    BtnCatalogModule,
    BtnChannelAnalyticsModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentMailMeModule,
    BtnContentShareModule,
    BtnFullscreenModule,
    BtnGoalsModule,
    BtnMailUserModule,
    BtnPageBackNavModule,
    BtnPageBackModule,
    BtnPageBackModuleAdmin,
    BtnPlaylistModule,
    BtnPreviewModule,
    BtnSettingsModule,
    CardBreadcrumbModule,
    CardChannelModule,
    CardContentModule,
    CardWelcomeModule,
    CardNetworkModule,
    CardHomeTopModule,
    CardBrowseCourseModule,
    ChannelHubModule,
    ContentStripMultipleModule,
    ContentStripSingleModule,
    DiscussionForumModule,
    ElementHtmlModule,
    EmbeddedPageModule,
    ErrorResolverModule,
    GalleryViewModule,
    GraphGeneralModule,
    GridLayoutModule,
    ImageMapResponsiveModule,
    IntranetSelectorModule,
    LayoutLinearModule,
    LayoutTabModule,
    PageModule,
    PickerContentModule,
    PlayerAmpModule,
    PlayerAudioModule,
    PlayerPdfModule,
    PlayerSlidesModule,
    PlayerVideoModule,
    PlayerWebPagesModule,
    PlayerYoutubeModule,
    ReleaseNotesModule,
    SelectorResponsiveModule,
    SlidersMobModule,
    SlidersModule,
    TreeCatalogModule,
    TreeModule,
    CardHubsListModule,
    CardNetworkHomeModule,
    CardTableModule,
    CardActivityModule,
    UIAdminTableModule,
    LeftMenuModule,
    UIORGTableModule,
    BreadcrumbsOrgModule,
    AuthorCardModule,
    MatSnackBarModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NotificationDropdownModule,
    SearchListingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    TncComponent,
  ],
  bootstrap: [RootComponent],
  providers: [
    { provide: 'environment', useValue: environment },
    {
      deps: [InitService, LoggerService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 5000 },
    },
    {
      provide: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
      useValue: {
        diameter: 55,
        strokeWidth: 4,
      },
    },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AppRetryInterceptorService, multi: true },
    TncAppResolverService,
    TncPublicResolverService,
    PipeContentRoutePipe,
    // AppTocResolverService,
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },

    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    // { provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandlingService },
    MatDatepickerModule, MatNativeDateModule,
    { provide: 'environment', useValue: environment },
    LoaderService,
    LibNotificationsService,
    NotificationsService,
    NPSGridService,
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
  ]
})

export class AppModule { }
