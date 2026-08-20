import { AparYearSelectComponent } from './apar-year-select.component'
import { AparYearService } from './apar-year.service'

describe('AparYearSelectComponent', () => {
  let component: AparYearSelectComponent
  let aparYearSvcMock: jest.Mocked<AparYearService>

  const configuredYears = [
    { label: '2026-27 (Current A.Y.)', value: '2026-27' },
    { label: '2025-26', value: '2025-26' },
  ]

  beforeEach(() => {
    aparYearSvcMock = {
      getAparYears: jest.fn().mockReturnValue(configuredYears),
    } as any

    component = new AparYearSelectComponent(aparYearSvcMock)
  })

  it('should start with the documented defaults', () => {
    expect(component.layout).toBe('stacked')
    expect(component.required).toBe(true)
    expect(component.disabled).toBe(false)
    expect(component.years).toEqual([])
  })

  describe('ngOnInit', () => {
    it('should load the years from the service', () => {
      component.ngOnInit()

      expect(component.years).toEqual(configuredYears)
    })

    it('should pass the year count through for the fallback list', () => {
      component.yearCount = 3

      component.ngOnInit()

      expect(aparYearSvcMock.getAparYears).toHaveBeenCalledWith(3)
    })
  })

  describe('onSelectionChange', () => {
    it('should hold the picked year and emit it', () => {
      const emitted: string[] = []
      component.valueChange.subscribe((year: string) => emitted.push(year))

      component.onSelectionChange('2025-26')

      expect(component.value).toBe('2025-26')
      expect(emitted).toEqual(['2025-26'])
    })
  })

  it('should give every instance its own field id', () => {
    const other = new AparYearSelectComponent(aparYearSvcMock)

    expect(component.fieldId).not.toBe(other.fieldId)
    expect(component.fieldId).toMatch(/^apar-year-select-\d+$/)
  })
})
