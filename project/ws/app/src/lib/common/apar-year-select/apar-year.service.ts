import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import moment from 'moment'
/* tslint:disable*/
import _ from 'lodash'
/* tslint:enable*/

export interface IAparYear {
  label: string
  value: string
}

@Injectable({
  providedIn: 'root',
})
export class AparYearService {
  private readonly defaultYearCount = 5

  constructor(private configSvc: ConfigurationsService) { }

  // The year list is authored in the MDO global config (form read) and fetched on app init.
  // The count only applies to the financial year fallback used when that config is unavailable
  getAparYears(count: number = this.defaultYearCount): IAparYear[] {
    const configuredYears = this.getConfiguredAparYears()
    if (configuredYears.length) {
      return configuredYears
    }

    const currentCycleStart = this.getCurrentCycleStart()

    return Array.from({ length: count }, (_item, index) => {
      const value = this.formatAparYear(currentCycleStart - index)
      return { label: index === 0 ? `${value} (Current A.Y.)` : value, value }
    })
  }

  getCurrentAparYear(): string {
    const currentYear = _.get(this.configSvc.globalConfig, 'cbpPlanYear.currentYear')
    if (currentYear) {
      return currentYear
    }

    const configuredYears = this.getConfiguredAparYears()
    if (configuredYears.length) {
      return configuredYears[0].value
    }

    return this.formatAparYear(this.getCurrentCycleStart())
  }

  private getConfiguredAparYears(): IAparYear[] {
    const yearList = _.get(this.configSvc.globalConfig, 'cbpPlanYear.yearList')
    if (!Array.isArray(yearList)) {
      return []
    }

    return yearList
      .filter((year: any) => year && year.value)
      .map((year: any) => ({ label: year.label || year.value, value: year.value }))
  }

  // The APAR cycle follows the financial year, so a new one starts every April
  private getCurrentCycleStart(): number {
    const today = moment()
    return today.month() >= 3 ? today.year() : today.year() - 1
  }

  private formatAparYear(startYear: number): string {
    return `${startYear}-${`${startYear + 1}`.slice(-2)}`
  }
}
