import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSelect } from '@angular/material/select'
import { AparYearSelectComponent } from './apar-year-select.component'
import { AparYearSelectModule } from './apar-year-select.module'
import { AparYearService } from './apar-year.service'

describe('AparYearSelectComponent', () => {
  let component: AparYearSelectComponent
  let aparYearSvcMock: jest.Mocked<AparYearService>

  const configuredYears = [
    { label: '2026-27 (Current A.Y.)', value: '2026-27', editable: true },
    { label: '2025-26', value: '2025-26', editable: false },
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
    // Every year stays pickable unless a host asks for the editable ones only
    expect(component.editableOnly).toBe(false)
    expect(component.years).toEqual([])
  })

  describe('ngOnInit', () => {
    it('should load the years from the service', () => {
      component.ngOnInit()

      expect(component.years).toEqual(configuredYears)
    })

    it('should keep a year the config no longer lists on the list, unpickable', () => {
      component.value = '2019-20'

      component.ngOnInit()

      expect(component.years).toEqual([
        ...configuredYears,
        { label: '2019-20', value: '2019-20', editable: false },
      ])
    })

    it('should not repeat a year the config already lists', () => {
      component.value = '2025-26'

      component.ngOnInit()

      expect(component.years).toEqual(configuredYears)
    })

    it('should pass the year count through for the fallback list', () => {
      component.yearCount = 3

      component.ngOnInit()

      expect(aparYearSvcMock.getAparYears).toHaveBeenCalledWith(3)
    })
  })

  describe('ngOnChanges', () => {
    it('should hold on to a year handed over after the list was read', () => {
      component.ngOnInit()

      component.value = '2018-19'
      component.ngOnChanges({ value: {} as any })

      expect(component.years[component.years.length - 1])
        .toEqual({ label: '2018-19', value: '2018-19', editable: false })
    })

    it('should leave the list alone when the year did not change', () => {
      component.ngOnInit()

      component.ngOnChanges({ disabled: {} as any })

      expect(component.years).toEqual(configuredYears)
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

describe('AparYearSelectComponent rendering', () => {
  const configuredYears = [
    { label: '2026-27 (Current A.Y.)', value: '2026-27', editable: true },
    { label: '2025-26', value: '2025-26', editable: false },
  ]

  /** Renders the field, opens the panel and hands back the options it holds */
  const openOptions = async (inputs: Partial<AparYearSelectComponent>) => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AparYearSelectModule],
      providers: [
        { provide: AparYearService, useValue: { getAparYears: () => [...configuredYears] } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AparYearSelectComponent)
    Object.assign(fixture.componentInstance, inputs)
    fixture.detectChanges()

    const select = fixture.debugElement.query(By.directive(MatSelect)).componentInstance as MatSelect
    select.open()
    fixture.detectChanges()

    return select.options.toArray()
  }

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  it('should keep a closed year on the list but out of reach of a plan', async () => {
    const options = await openOptions({ editableOnly: true, value: '2026-27' })

    expect(options.map(option => option.value)).toEqual(['2026-27', '2025-26'])
    expect(options[0].disabled).toBe(false)
    expect(options[1].disabled).toBe(true)
  })

  it('should leave every year pickable where the plan is not being authored', async () => {
    const options = await openOptions({ value: '2025-26' })

    expect(options.every(option => !option.disabled)).toBe(true)
  })
})
