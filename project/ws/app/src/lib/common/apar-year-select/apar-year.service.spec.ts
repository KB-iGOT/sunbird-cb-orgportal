import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { AparYearService } from './apar-year.service'

describe('AparYearService', () => {
  let service: AparYearService
  let configSvc: Partial<ConfigurationsService>

  const globalConfig = {
    cbpPlanYear: {
      currentYear: '2026-27',
      yearList: [
        { label: '2026-27 (Current A.Y.)', value: '2026-27' },
        { label: '2025-26', value: '2025-26' },
      ],
    },
  }

  beforeEach(() => {
    configSvc = { globalConfig: null }
    service = new AparYearService(configSvc as ConfigurationsService)
  })

  describe('with the global config available', () => {
    beforeEach(() => {
      configSvc.globalConfig = globalConfig
    })

    it('should list the years configured in the global config', () => {
      const years = service.getAparYears()

      expect(years).toEqual(globalConfig.cbpPlanYear.yearList)
    })

    it('should ignore the year count when the global config drives the list', () => {
      expect(service.getAparYears(5).length).toBe(2)
    })

    it('should take the current year from the global config', () => {
      expect(service.getCurrentAparYear()).toBe('2026-27')
    })

    it('should skip entries without a value and label the rest', () => {
      configSvc.globalConfig = {
        cbpPlanYear: { yearList: [{ value: '2024-25' }, { label: 'no value' }, null] },
      }

      expect(service.getAparYears()).toEqual([{ label: '2024-25', value: '2024-25' }])
    })

    it('should fall back to the first configured year when no current year is set', () => {
      configSvc.globalConfig = { cbpPlanYear: { yearList: globalConfig.cbpPlanYear.yearList } }

      expect(service.getCurrentAparYear()).toBe('2026-27')
    })
  })

  describe('without the global config', () => {
    it('should list the requested number of years, newest first', () => {
      const years = service.getAparYears(5)

      expect(years.length).toBe(5)
      expect(years[0].label).toContain('(Current A.Y.)')
      expect(years[0].value).toBe(service.getCurrentAparYear())
    })

    it('should format years as YYYY-YY and step back one cycle at a time', () => {
      const years = service.getAparYears(3)

      years.forEach(year => {
        expect(year.value).toMatch(/^\d{4}-\d{2}$/)
      })

      const startYears = years.map(year => Number(year.value.split('-')[0]))
      expect(startYears[1]).toBe(startYears[0] - 1)
      expect(startYears[2]).toBe(startYears[0] - 2)
    })

    it('should only mark the first entry as the current cycle', () => {
      const years = service.getAparYears(4)

      expect(years.filter(year => year.label.includes('(Current A.Y.)')).length).toBe(1)
      expect(years[1].label).toBe(years[1].value)
    })
  })
})
