import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { WidgetContentService } from '@sunbird-cb/collection'
// import { AuthKeycloakService } from './auth-keycloak.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
@Injectable({
  providedIn: 'root',
})
export class SubapplicationRespondService {
  subAppname = ''
  continueLearningData: any = null
  contentWindowinfo: any
  loaded = false
  constructor(
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    // private keyCloakSvc: AuthKeycloakService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.changeContextrespond()
    this.configSvc.prefChangeNotifier.subscribe(() => {
      this.changeContextrespond()
    })
  }
  loadedRespond(contentWindow: any, applicationName: string, id?: string) {
    if (id && this.activatedRoute.snapshot.queryParams.viewMode && this.activatedRoute.snapshot.queryParams.viewMode === 'RESUME') {
      this.continueLearningData = null
      this.contentSvc.fetchContentHistory(id).subscribe(
        data => {
          this.continueLearningData = data.continueData
          if (this.configSvc && this.configSvc.userProfile) {
            const firstName = this.configSvc.userProfile.userName ?
              this.configSvc.userProfile.userName.split(' ', 2)[0] : ''
            // const lastName = this.configSvc.userProfile.userName ?
            //   this.configSvc.userProfile.userName.split(' ', 2)[1] : ''
            const viewMode: string = this.activatedRoute.snapshot.queryParams.viewMode ?
              this.activatedRoute.snapshot.queryParams.viewMode : ''
            // const token = this.keyCloakSvc.token
            const response = {
              subApplicationName: applicationName,
              requestId: 'LOADED',
              parentContext: {
                domainName: window.location.host,
                url: this.router.url,
                rootOrg: this.configSvc.rootOrg,
                theme: this.configSvc.activeThemeObject ? {
                  name: this.configSvc.activeThemeObject.themeName,
                  ...this.configSvc.activeThemeObject.color,
                } : '',
                fontSize: this.configSvc.activeFontObject ? this.configSvc.activeFontObject.baseFontSize : '14px',
                locale: (this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale) || 'en',
                darkMode: this.configSvc.isDarkMode,
                subApplicationStartMode: viewMode.toUpperCase(),
                user: {
                  firstName,
                  // lastName,
                  // token,
                  userId: this.configSvc.userProfile.userId ? this.configSvc.userProfile.userId : '',
                  roles: this.configSvc.userRoles ? Array.from(this.configSvc.userRoles) : [],
                },
                heartbeatFrequency: '200',
              },
              data: this.continueLearningData.data ? {
                continueLearning: this.continueLearningData.data,
              } : null,
            }
            contentWindow.postMessage(response, '*') // NOSONAR
            this.contentWindowinfo = contentWindow
            this.loaded = true
            this.subAppname = applicationName
          }
        })
    } else {
      if (this.configSvc && this.configSvc.userProfile) {
        const firstName = this.configSvc.userProfile.userName ?
          this.configSvc.userProfile.userName.split(' ', 2)[0] : ''
        // const lastName = this.configSvc.userProfile.userName ?
        //   this.configSvc.userProfile.userName.split(' ', 2)[1] : ''
        const viewMode: string = this.activatedRoute.snapshot.queryParams.viewMode ?
          this.activatedRoute.snapshot.queryParams.viewMode : ''
        // const token = this.keyCloakSvc.token
        const response: any = {
          subApplicationName: applicationName,
          requestId: 'LOADED',
          parentContext: {
            domainName: window.location.host,
            url: this.router.url,
            rootOrg: this.configSvc.rootOrg,
            theme: this.configSvc.activeThemeObject ? {
              name: this.configSvc.activeThemeObject.themeName,
              ...this.configSvc.activeThemeObject.color,
            } : '',
            fontSize: this.configSvc.activeFontObject ? this.configSvc.activeFontObject.baseFontSize : '14px',
            locale: (this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale) || 'en',
            darkMode: this.configSvc.isDarkMode,
            subApplicationStartMode: viewMode.toUpperCase(),
            user: {
              firstName,
              // lastName,
              // token,
              userId: this.configSvc.userProfile.userId ? this.configSvc.userProfile.userId : '',
              roles: this.configSvc.userRoles ? Array.from(this.configSvc.userRoles) : [],
            },
            heartbeatFrequency: '200',
          },
          data: null,
        }
        contentWindow.postMessage(response, '*') // NOSONAR
        this.contentWindowinfo = contentWindow
        this.loaded = true
        this.subAppname = applicationName
      }
    }
  }
  continueLearningRespond(id: string, continueLearning: any) {
    this.contentSvc.saveContinueLearning(
      {
        contextPathId: id,
        resourceId: id,
        data: JSON.stringify({ timestamp: Date.now(), data: continueLearning }),
        dateAccessed: Date.now(),
      },
    )
      .toPromise()
      .catch()
  }
  unsubscribeResponse() {
    this.subAppname = ''
    this.continueLearningData = null
    this.contentWindowinfo = null
    this.loaded = false
  }
  changeContextrespond() {
    if (this.loaded && this.contentWindowinfo && this.configSvc && this.configSvc.userProfile && this.subAppname) {
      const firstName = this.configSvc.userProfile.userName ?
        this.configSvc.userProfile.userName.split(' ', 2)[0] : ''
      // const lastName = this.configSvc.userProfile.userName ?
      //   this.configSvc.userProfile.userName.split(' ', 2)[1] : ''
      const viewMode: string = this.activatedRoute.snapshot.queryParams.viewMode ?
        this.activatedRoute.snapshot.queryParams.viewMode : ''
      // const token = this.keyCloakSvc.token
      const response = {
        subApplicationName: this.subAppname,
        requestId: 'CONTEXT_CHANGE',
        parentContext: {
          domainName: window.location.host,
          url: this.router.url,
          rootOrg: this.configSvc.rootOrg,
          theme: this.configSvc.activeThemeObject ? {
            name: this.configSvc.activeThemeObject.themeName,
            ...this.configSvc.activeThemeObject.color,
          } : '',
          fontSize: this.configSvc.activeFontObject ? this.configSvc.activeFontObject.baseFontSize : '14px',
          locale: (this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale) || 'en',
          darkMode: this.configSvc.isDarkMode,
          subApplicationStartMode: viewMode.toUpperCase(),
          user: {
            firstName,
            // lastName,
            // token,
            userId: this.configSvc.userProfile.userId ? this.configSvc.userProfile.userId : '',
            roles: this.configSvc.userRoles ? Array.from(this.configSvc.userRoles) : [],
          },
          heartbeatFrequency: '200',
        },
      }
      this.contentWindowinfo.postMessage(response, '*') // NOSONAR
    }
  }
}