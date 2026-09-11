import { MatDialogRef } from '@angular/material/dialog'
import { MatRadioChange } from '@angular/material/radio'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'
import { AparYearService } from '../../../../../../common/apar-year-select/apar-year.service'
import { aparPlan } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { PlanPickerComponent } from './plan-picker.component'

const row = (overrides: Partial<aparPlan.IPlanRow> = {}): aparPlan.IPlanRow => ({
  id: 'plan-1',
  name: 'APAR 2026-27 — Section Officer & Under Secretary',
  planYear: '2026-27',
  endDate: '2027-03-31T00:00:00.000Z',
  endDateDisplay: '31 Mar, 2027',
  orgName: 'Department of Personnel & Training',
  gatingCourseCount: 2,
  hasActiveAssessment: false,
  isYearClosed: false,
  ...overrides,
})

describe('PlanPickerComponent', () => {
  let component: PlanPickerComponent
  let dialogRef: any
  let assessmentSvc: any
  let aparYearSvc: any
  let snackBar: any

  const years = [
    { label: '2026-27 (Current A.Y.)', value: '2026-27', editable: true },
    { label: '2025-26', value: '2025-26', editable: false },
  ]

  /** Builds the component the way the dialog does, with the data the host hands it. */
  const build = (data: any = {}) => new PlanPickerComponent(
    dialogRef as MatDialogRef<PlanPickerComponent>,
    { userProfile: { rootOrgId: 'org-1' }, ...data },
    assessmentSvc as ComprehensiveAssessmentService,
    aparYearSvc as AparYearService,
    snackBar as MatSnackBar
  )

  beforeEach(() => {
    dialogRef = { close: jest.fn() }
    assessmentSvc = {
      searchAparPlans: jest.fn().mockReturnValue(of({ plans: [row()], count: 1 })),
      getPlanIdsWithLiveAssessment: jest.fn().mockReturnValue(of([])),
    }
    aparYearSvc = {
      getAparYears: jest.fn().mockReturnValue(years),
      getCurrentAparYear: jest.fn().mockReturnValue('2026-27'),
    }
    snackBar = { open: jest.fn() }
    component = build()
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should start on every reporting year with nothing picked', () => {
    expect(component.selectedYear).toBe(aparPlan.ALL_YEARS)
    expect(component.selectedPlan).toBeNull()
    expect(component.plans).toEqual([])
    expect(component.pageSize).toBe(aparPlan.PAGE_SIZE)
  })

  describe('ngOnInit', () => {
    it('should load the years, the current year and the first page of plans', () => {
      component.ngOnInit()

      expect(component.years).toEqual(years)
      expect(component.currentYear).toBe('2026-27')
      expect(component.plans.length).toBe(1)
      expect(component.totalCount).toBe(1)
      expect(component.showLoader).toBe(false)
    })

    it('should ask for the Live plans of the org before any filter is applied', () => {
      component.ngOnInit()

      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledWith({
        rootOrgId: 'org-1',
        planYear: aparPlan.ALL_YEARS,
        searchString: '',
        pageIndex: 0,
        pageSize: aparPlan.PAGE_SIZE,
      })
    })

    /**
     * The flag lookup runs first and the list is loaded from inside it, so a lookup that
     * resolves late or empty must still leave the picker with its plans.
     */
    it('should still list the plans when no assessment claims a plan yet', () => {
      assessmentSvc.getPlanIdsWithLiveAssessment.mockReturnValue(of([]))

      component.ngOnInit()

      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledTimes(1)
      expect(component.plans.length).toBe(1)
    })
  })

  describe('the closed reporting year', () => {
    /** An assessment for a cycle that has closed is meaningless, so the plan cannot be linked. */
    it('should flag and lock a plan whose reporting year is closed', () => {
      assessmentSvc.searchAparPlans.mockReturnValue(of({
        plans: [row({ id: 'plan-old', planYear: '2025-26' })],
        count: 1,
      }))

      component.ngOnInit()

      expect(component.plans[0].isYearClosed).toBe(true)
      expect(component.isPlanSelectable(component.plans[0])).toBe(false)
    })

    it('should refuse a plan on a closed year', () => {
      assessmentSvc.searchAparPlans.mockReturnValue(of({
        plans: [row({ id: 'plan-old', planYear: '2025-26' })],
        count: 1,
      }))
      component.ngOnInit()

      component.selectPlan('plan-old')

      expect(component.selectedPlan).toBeNull()
      expect(component.selectedPlanId).toBe('')
    })

    it('should leave a plan on the open year selectable', () => {
      component.ngOnInit()

      expect(component.plans[0].isYearClosed).toBe(false)
      expect(component.isPlanSelectable(component.plans[0])).toBe(true)
    })

    /** A year the config no longer lists is closed too, it is only kept for the plans on it. */
    it('should treat a year that is not on the list as closed', () => {
      assessmentSvc.searchAparPlans.mockReturnValue(of({
        plans: [row({ id: 'plan-ancient', planYear: '2019-20' })],
        count: 1,
      }))

      component.ngOnInit()

      expect(component.plans[0].isYearClosed).toBe(true)
    })

    it('should treat a plan carrying no year as closed', () => {
      assessmentSvc.searchAparPlans.mockReturnValue(of({
        plans: [row({ id: 'plan-no-year', planYear: '' })],
        count: 1,
      }))

      component.ngOnInit()

      expect(component.plans[0].isYearClosed).toBe(true)
    })

    /** Reopening an assessment already linked to a plan whose year has since closed. */
    it('should leave the plan this assessment is already on selectable', () => {
      assessmentSvc.searchAparPlans.mockReturnValue(of({
        plans: [row({ id: 'plan-old', planYear: '2025-26' })],
        count: 1,
      }))
      component = build({ selectedPlanId: 'plan-old' })

      component.ngOnInit()

      expect(component.plans[0].isYearClosed).toBe(false)
      expect(component.isPlanSelectable(component.plans[0])).toBe(true)
    })
  })

  describe('the already linked flag', () => {
    it('should flag and lock a plan a Live assessment already points at', () => {
      assessmentSvc.getPlanIdsWithLiveAssessment.mockReturnValue(of(['plan-1']))

      component.ngOnInit()

      expect(component.plans[0].hasActiveAssessment).toBe(true)
    })

    it('should leave the plan this assessment is already on selectable', () => {
      assessmentSvc.getPlanIdsWithLiveAssessment.mockReturnValue(of(['plan-1']))
      component = build({ selectedPlanId: 'plan-1' })

      component.ngOnInit()

      expect(component.plans[0].hasActiveAssessment).toBe(false)
    })

    it('should preselect the plan the assessment came in with', () => {
      component = build({ selectedPlanId: 'plan-1' })

      component.ngOnInit()

      expect(component.selectedPlan).toEqual(component.plans[0])
    })

    it('should leave nothing picked when the linked plan is off the current page', () => {
      component = build({ selectedPlanId: 'plan-off-page' })

      component.ngOnInit()

      expect(component.selectedPlan).toBeNull()
    })
  })

  describe('getPlans', () => {
    it('should empty the list and say so when the search fails', () => {
      assessmentSvc.searchAparPlans.mockReturnValue(throwError(() => ({ error: { message: 'plan service is down' } })))

      component.ngOnInit()

      expect(component.plans).toEqual([])
      expect(component.totalCount).toBe(0)
      expect(component.showLoader).toBe(false)
      expect(snackBar.open).toHaveBeenCalledWith('plan service is down')
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.searchAparPlans.mockReturnValue(throwError(() => ({})))

      component.ngOnInit()

      expect(snackBar.open).toHaveBeenCalledWith('Unable to load the APAR plans, please try again')
    })
  })

  describe('filters and paging', () => {
    beforeEach(() => {
      component.ngOnInit()
      assessmentSvc.searchAparPlans.mockClear()
    })

    it('should reload from the first page when the reporting year changes', () => {
      component.pageIndex = 3

      component.onYearChange('2025-26')

      expect(component.selectedYear).toBe('2025-26')
      expect(component.pageIndex).toBe(0)
      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledWith(
        expect.objectContaining({ planYear: '2025-26', pageIndex: 0 })
      )
    })

    it('should reload on the page the paginator moved to', () => {
      component.onPageChange({ pageIndex: 2, pageSize: 20 })

      expect(component.pageIndex).toBe(2)
      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledWith(
        expect.objectContaining({ pageIndex: 2 })
      )
    })

    it('should search on the trimmed title once the typing settles', () => {
      jest.useFakeTimers()
      const debounced = build()
      debounced.ngOnInit()
      assessmentSvc.searchAparPlans.mockClear()

      debounced.onSearch('  section  ')
      expect(assessmentSvc.searchAparPlans).not.toHaveBeenCalled()

      jest.advanceTimersByTime(500)

      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledTimes(1)
      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledWith(
        expect.objectContaining({ searchString: 'section', pageIndex: 0 })
      )
      jest.useRealTimers()
    })

    it('should clear the search when the field is emptied', () => {
      jest.useFakeTimers()
      const debounced = build()
      debounced.ngOnInit()
      assessmentSvc.searchAparPlans.mockClear()

      debounced.onSearch(null as any)
      jest.advanceTimersByTime(500)

      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledWith(
        expect.objectContaining({ searchString: '' })
      )
      jest.useRealTimers()
    })

    it('should issue one search for a title typed twice in a row', () => {
      jest.useFakeTimers()
      const debounced = build()
      debounced.ngOnInit()
      assessmentSvc.searchAparPlans.mockClear()

      debounced.onSearch('section')
      jest.advanceTimersByTime(500)
      debounced.onSearch('section')
      jest.advanceTimersByTime(500)

      expect(assessmentSvc.searchAparPlans).toHaveBeenCalledTimes(1)
      jest.useRealTimers()
    })
  })

  describe('picking a plan', () => {
    beforeEach(() => {
      assessmentSvc.searchAparPlans.mockReturnValue(of({
        plans: [row(), row({ id: 'plan-2' })],
        count: 2,
      }))
      // the flag is never sent by the search, the picker computes it off this lookup
      assessmentSvc.getPlanIdsWithLiveAssessment.mockReturnValue(of(['plan-2']))
      component.ngOnInit()
    })

    it('should pick the plan the row belongs to', () => {
      component.selectPlan('plan-1')

      expect(component.selectedPlanId).toBe('plan-1')
      expect(component.selectedPlan).toEqual(component.plans[0])
    })

    it('should pick the plan the radio carries', () => {
      component.onPlanSelected({ value: 'plan-1' } as MatRadioChange)

      expect(component.selectedPlanId).toBe('plan-1')
    })

    it('should refuse a plan that already carries a Live assessment', () => {
      component.selectPlan('plan-2')

      expect(component.selectedPlan).toBeNull()
      expect(component.selectedPlanId).toBe('')
    })

    it('should ignore a row that is no longer on the list', () => {
      component.selectPlan('plan-gone')

      expect(component.selectedPlan).toBeNull()
    })

    it('should refuse a plan blocked for either reason', () => {
      expect(component.isPlanSelectable(row({ hasActiveAssessment: true }))).toBe(false)
      expect(component.isPlanSelectable(row({ isYearClosed: true }))).toBe(false)
      expect(component.isPlanSelectable(row())).toBe(true)
      expect(component.isPlanSelectable({} as aparPlan.IPlanRow)).toBe(true)
    })
  })

  describe('linkPlan', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should hand the plan back so every derived value is read off it', () => {
      component.selectPlan('plan-1')

      component.linkPlan()

      expect(dialogRef.close).toHaveBeenCalledWith({
        id: 'plan-1',
        name: 'APAR 2026-27 — Section Officer & Under Secretary',
        planYear: '2026-27',
        endDate: '2027-03-31T00:00:00.000Z',
        orgName: 'Department of Personnel & Training',
        gatingCourseCount: 2,
      })
    })

    it('should do nothing while no plan is picked', () => {
      component.linkPlan()

      expect(dialogRef.close).not.toHaveBeenCalled()
    })
  })

  describe('helpers', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should tell the current reporting year from an older one', () => {
      expect(component.isCurrentYear('2026-27')).toBe(true)
      expect(component.isCurrentYear('2025-26')).toBe(false)
      expect(component.isCurrentYear('')).toBe(false)
    })

    it('should track the rows by their plan id', () => {
      expect(component.trackByPlanId(0, row())).toBe('plan-1')
      expect(component.trackByPlanId(0, {} as aparPlan.IPlanRow)).toBe('')
    })
  })

  describe('ngOnDestroy', () => {
    it('should drop the search and the list subscriptions', () => {
      component.ngOnInit()
      const searchSub = (component as any).searchSubscription
      const planSub = (component as any).planSubscription

      component.ngOnDestroy()

      expect(searchSub.closed).toBe(true)
      expect(planSub.closed).toBe(true)
    })

    it('should be safe on a picker that never loaded', () => {
      expect(() => build().ngOnDestroy()).not.toThrow()
    })
  })
})
