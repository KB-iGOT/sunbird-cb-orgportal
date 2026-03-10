// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: IEnvironment = {
  production: false,
  name: (window as { [key: string]: any })['env']['name'] || '',
  sitePath: (window as { [key: string]: any })['env']['sitePath'] || '',
  karmYogiPath: (window as { [key: string]: any })['env']['karmYogiPath'] || '',
  cbpPath: (window as { [key: string]: any })['env']['cbpPath'] || '',
  portalRoles: (((window as { [key: string]: any })['env']['portalRoles'] || '').split(',')) || [],
  contentHost: (window as { [key: string]: any })['env']['contentHost'] || '',
  contentBucket: (window as { [key: string]: any })['env']['azureBucket'] || '',
  userBucket: (window as { [key: string]: any })['env']['userBucket'] || '',
  domainName: (window as { [key: string]: any })['env']['domainName'] || '',
  mdoPath: (window as { [key: string]: any })['env']['mdoPath'] || '',
  resendOTPTIme: (window as { [key: string]: any })['env']['resendOTPTIme'] || 120,
  teamsUrl: (window as { [key: string]: any })['env']['teamsUrl'] || '',
  connectionType: (window as { [key: string]: any })['env']['connectionType'] || '',
  KCMframeworkName: (window as { [key: string]: any })['env']['KCMframeworkName'] || '',
  ODCSMasterFramework: (window as { [key: string]: any })['env']['ODCSMasterFramework'] || '',
  compentencyVersionKey: (window as { [key: string]: any })['env']['compentencyVersionKey'] || '',
  doptOrg: (window as { [key: string]: any })['env']['doptOrg'] || '',
  dicussV2Bucket: (window as { [key: string]: any })['env']['dicussV2Bucket'] || '',
  portalsForNotifications: (((window as { [key: string]: any })['env']['portalsForNotifications'] || {})) || {},
  debug: (window as { [key: string]: any })['env']['debug'] || false,  // Add this missing property,
  googleStorageUrl: (window as { [key: string]: any })['env']['googleStorageUrl'] || '',
  mdoChannelsBookmarkId: (window as { [key: string]: any })['env']['mdoChannelsBookmarkId'] || '',
  spvorgID: (window as { [key: string]: any })['env']['spvorgID'] || '',
  azureHost: (window as { [key: string]: any })['env']['azureHost'] || '',
  azureBucket: (window as { [key: string]: any })['env']['azureBucket'] || '',
  azureOldHost: (window as { [key: string]: any })['env']['azureOldHost'] || '',
  azureOldBuket: (window as { [key: string]: any })['env']['azureOldBuket'] || '',
  assessmentBuffer: (window as { [key: string]: any })['env']['assessmentBuffer'] || 0,
  quizResultTimeout: (window as { [key: string]: any })['env']['quizResultTimeout'] || 0,
}
interface IEnvironment {
  name: null | string
  production: boolean
  sitePath: null | string
  karmYogiPath: string
  cbpPath: string
  portalRoles: string[]
  contentHost: string
  contentBucket?: string
  userBucket?: string
  domainName?: string
  mdoPath: string,
  resendOTPTIme: number,
  teamsUrl?: string,
  connectionType?: string,
  KCMframeworkName?: string,
  ODCSMasterFramework?: string
  compentencyVersionKey: string
  doptOrg?: string
  dicussV2Bucket: string
  portalsForNotifications: any
  debug?: boolean  // Add this missing property
  googleStorageUrl: string,
  mdoChannelsBookmarkId: string,
  spvorgID?: string,
  azureHost: string
  azureBucket: string
  azureOldHost: string
  azureOldBuket: string,
  assessmentBuffer: number,
  quizResultTimeout: number
}

/*
 * For easier debugging in development mode, you can import the    file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error' // Included with Angular CLI.x
