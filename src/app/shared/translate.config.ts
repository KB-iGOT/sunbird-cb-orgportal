import { HttpClient } from '@angular/common/http'
import { TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

// Removed @Injectable decorator as it is not valid here
// tslint:disable-next-line:function-name
export function HttpLoaderFactory(http: HttpClient) {
  // @ts-ignore - Version compatibility issue between core and http-loader
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}
export const translateModuleConfig = {
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
}