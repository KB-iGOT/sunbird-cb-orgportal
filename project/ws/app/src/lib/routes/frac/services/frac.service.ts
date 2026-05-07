import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { IFrac } from '../interfaces/frac.model'

@Injectable({
  providedIn: 'root',
})
export class FracService {

  constructor(
    private configSvc: ConfigurationsService,
    private http: HttpClient) { }

  async fetchFrac() {
    const frac: any = await this.http
      .get<IFrac | any>(`${this.configSvc.baseUrl}/feature/frac.json`)
      .toPromise()
    return frac as IFrac
  }
}
