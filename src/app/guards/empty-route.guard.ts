import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { ConfigurationsService } from '@sunbird-cb/utils'
// import { ConfigurationsService, AuthKeycloakService } from '@sunbird-cb/utils'

@Injectable({
  providedIn: 'root',
})
export class EmptyRouteGuard {
  constructor(
    private router: Router,
    private configSvc: ConfigurationsService,
    // private authSvc: AuthKeycloakService,
    // private activateRoute: ActivatedRoute
  ) { }
  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // this.router.parseUrl('/app/home')
    if (this.configSvc.userProfile && this.configSvc.userProfile.userId) {
      const userRole = this.configSvc?.unMappedUser?.roles
      const isCommunityModeratorOnlyPresent = userRole?.some((role: any) => role?.includes('COMMUNITY_MODERATOR'))
      if (isCommunityModeratorOnlyPresent) {
        return this.router.parseUrl('/app/home/community')
      } else {
        return this.router.parseUrl('/app/home')
      }
      //   // logger.log('Redirecting to application home page');
      // const userRole = this.configSvc.userProfile.roles
      // debugger
      // if () {
      //   return this.router.parseUrl('/app/home/community')
      // } else {
      //   return this.router.parseUrl('/app/home')
      // }


    }
    // logger.log('redirecting to login page as the user is not loggedIn');
    // return this.router.parseUrl('/login')
    // const paramsMap = this.activateRoute.snapshot.queryParamMap
    // let redirectUrl
    // if (paramsMap.has('ref')) {
    //   redirectUrl = document.baseURI + paramsMap.get('ref')
    // } else {
    //   redirectUrl = document.baseURI
    // }
    // Promise.resolve(this.authSvc.login('S', redirectUrl))
    return false
  }
}
