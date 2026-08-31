import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import moment from 'moment'
/* tslint:disable*/
import _ from 'lodash'
/* tslint:enable*/

export interface IAparYear {
  label: string
  value: string
  // Whether a plan can be set to this year. Authored per year in the global config, and only the
  // current year is open when the config says nothing: a past year is closed. A closed year is
  // kept on the list, the dashboard has to be able to filter the plans of that year
  editable?: boolean
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

    // Only the current cycle is open, the same as a config that closes the years behind it. The
    // current one always is, a plan is never left with no year it can be saved against
    return Array.from({ length: count }, (_item, index) => {
      const value = this.formatAparYear(currentCycleStart - index)
      return { label: index === 0 ? `${value} (Current A.Y.)` : value, value, editable: index === 0 }
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

    const years = yearList.filter((year: any) => year && year.value)
    // A year the config says nothing about follows the current year of the config, so the years
    // behind it are closed even before the flag is authored on them
    const currentYear = _.get(this.configSvc.globalConfig, 'cbpPlanYear.currentYear')
      || _.get(years, '[0].value')

    return years.map((year: any) => ({
      label: year.label || year.value,
      value: year.value,
      editable: _.isNil(year.editable) ? year.value === currentYear : year.editable === true,
    }))
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
