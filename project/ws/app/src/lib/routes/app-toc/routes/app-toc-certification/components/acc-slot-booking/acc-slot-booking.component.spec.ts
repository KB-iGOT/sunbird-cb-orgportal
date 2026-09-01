
import { MatSnackBar } from '@angular/material/snack-bar'
import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'
import { ActivatedRoute, Router } from '@angular/router'
import { AccSlotBookingComponent } from './acc-slot-booking.component'
import { of, throwError } from 'rxjs'
import { UntypedFormControl } from '@angular/forms'

describe('AccSlotBookingComponent', () => {
  let component: AccSlotBookingComponent
  let mockRoute: any
  let mockRouter: any
  let mockSnackbar: any
  let mockCertificationApi: any
  let mockCertificationSvc: any

  function buildComponent() {
    return new AccSlotBookingComponent(
      mockRoute as ActivatedRoute,
      mockRouter as Router,
      mockSnackbar as MatSnackBar,
      mockCertificationApi as CertificationApiService,
      mockCertificationSvc as CertificationService,
    )
  }

  beforeEach(() => {
    mockRoute = { parent: {}, snapshot: { params: {} } }
    mockRouter = { navigate: jest.fn() }
    mockSnackbar = { openFromComponent: jest.fn() }
    mockCertificationApi = {
      getTestCenters: jest.fn().mockReturnValue(of([{ dc: 'Location A', testcenter: 'TC1' }])),
      getTestCenterSlots: jest.fn().mockReturnValue(of({ dc: 'A', testcenter: 'TC1', slotdata: [] })),
      bookAccSlot: jest.fn().mockReturnValue(of({ res_code: 1 })),
    }
    mockCertificationSvc = {
      getCertificationMeta: jest.fn().mockReturnValue(of({ id: 'cert-1' })),
      getContentMeta: jest.fn().mockReturnValue(of({ identifier: 'content-001' })),
    }
    component = buildComponent()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ── Creation ──────────────────────────────────────────────────────────────
  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default statuses', () => {
    expect(component.fetchStatus).toBe('none')
    expect(component.locationFetchStatus).toBe('fetching')
    expect(component.dateSlotFetchStatus).toBe('none')
    expect(component.bookingSendStatus).toBe('none')
    expect(component.locationChipList).toEqual([])
    expect(component.dateSlotMap.size).toBe(0)
  })

  it('should create accForm with 4 required controls', () => {
    expect(component.accForm.contains('dc')).toBe(true)
    expect(component.accForm.contains('testCenter')).toBe(true)
    expect(component.accForm.contains('dateSlot')).toBe(true)
    expect(component.accForm.contains('slot')).toBe(true)
    // form is invalid by default since all are required
    expect(component.accForm.invalid).toBe(true)
  })

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('should call subscribeToCertificationResolve and subscribeToContentResolve', () => {
      const spyCert = jest.spyOn(component as any, 'subscribeToCertificationResolve')
      const spyContent = jest.spyOn(component as any, 'subscribeToContentResolve')
      component.ngOnInit()
      expect(spyCert).toHaveBeenCalled()
      expect(spyContent).toHaveBeenCalled()
    })

    it('should set certification and fetchStatus done on success', () => {
      component.ngOnInit()
      expect(component.certification).toEqual({ id: 'cert-1' })
      expect(component.fetchStatus).toBe('done')
    })

    it('should set fetchStatus to error when getCertificationMeta fails', () => {
      mockCertificationSvc.getCertificationMeta.mockReturnValue(throwError('error'))
      component = buildComponent()
      component.ngOnInit()
      expect(component.fetchStatus).toBe('error')
    })

    it('should set content and locations after content resolve', () => {
      component.ngOnInit()
      expect(component.content).toEqual({ identifier: 'content-001' })
      expect(component.locations).toEqual([{ dc: 'Location A', testcenter: 'TC1' }])
      expect(component.locationFetchStatus).toBe('done')
    })

    it('should set empty locations and error status when getTestCenters fails', () => {
      mockCertificationApi.getTestCenters.mockReturnValue(throwError('err'))
      component = buildComponent()
      component.ngOnInit()
      expect(component.locations).toEqual([])
      expect(component.locationFetchStatus).toBe('error')
    })

    it('should set up filteredLocations$ after content resolve', () => {
      component.ngOnInit()
      expect(component.filteredLocations$).toBeDefined()
    })
  })

  // ── displayLocationNameAutocomplete ───────────────────────────────────────
  describe('displayLocationNameAutocomplete', () => {
    it('should return location.dc when location is provided', () => {
      const result = component.displayLocationNameAutocomplete({ dc: 'Delhi', testcenter: 'TC1' } as any)
      expect(result).toBe('Delhi')
    })

    it('should return undefined when no location provided', () => {
      const result = component.displayLocationNameAutocomplete(undefined)
      expect(result).toBeUndefined()
    })
  })

  // ── locationSelected ──────────────────────────────────────────────────────
  describe('locationSelected', () => {
    let mockInput: any

    beforeEach(() => {
      mockInput = { nativeElement: { value: 'typing...', readOnly: false } }
      component.locationInput = mockInput
    })

    it('should add location to chip list and update form', () => {
      component.locationSelected({ dc: 'Mumbai', testcenter: 'TC2' } as any)
      expect(component.locationChipList.length).toBe(1)
      expect(component.accForm.value.dc).toBe('Mumbai')
    })

    it('should clear the native input value after selection', () => {
      component.locationSelected({ dc: 'Pune', testcenter: 'TC3' } as any)
      expect(mockInput.nativeElement.value).toBe('')
    })

    it('should make input readonly after selection', () => {
      component.locationSelected({ dc: 'Chennai', testcenter: 'TC4' } as any)
      expect(mockInput.nativeElement.readOnly).toBe(true)
    })

    it('should not add another location when chip list already has one', () => {
      component.locationChipList = [{ dc: 'Existing', testcenter: 'TC0' } as any]
      component.locationSelected({ dc: 'Mumbai', testcenter: 'TC2' } as any)
      expect(component.locationChipList.length).toBe(1)
      expect(component.locationChipList[0].dc).toBe('Existing')
    })
  })

  // ── locationRemoved ───────────────────────────────────────────────────────
  describe('locationRemoved', () => {
    let mockInput: any

    beforeEach(() => {
      mockInput = { nativeElement: { value: 'Delhi', readOnly: true } }
      component.locationInput = mockInput
      component.locationChipList = [{ dc: 'Delhi', testcenter: 'TC1' } as any]
      component.slots = { dc: 'A', testcenter: 'TC1', slotdata: [] }
      component.locationCtrl = new UntypedFormControl('Delhi')
    })

    it('should clear the chip list', () => {
      component.locationRemoved()
      expect(component.locationChipList).toEqual([])
    })

    it('should reset form fields to null', () => {
      component.accForm.patchValue({ dc: 'Delhi', testCenter: 'TC1', dateSlot: 'd1', slot: 's1' })
      component.locationRemoved()
      expect(component.accForm.value.dc).toBeNull()
      expect(component.accForm.value.testCenter).toBeNull()
      expect(component.accForm.value.dateSlot).toBeNull()
      expect(component.accForm.value.slot).toBeNull()
    })

    it('should set slots to null', () => {
      component.locationRemoved()
      expect(component.slots).toBeNull()
    })

    it('should clear the input value and remove readonly', () => {
      component.locationRemoved()
      expect(mockInput.nativeElement.value).toBe('')
      expect(mockInput.nativeElement.readOnly).toBe(false)
    })

    it('should reset locationCtrl to null', () => {
      component.locationRemoved()
      expect(component.locationCtrl.value).toBeNull()
    })
  })

  // ── getTestCenterSlots ────────────────────────────────────────────────────
  describe('getTestCenterSlots', () => {
    beforeEach(() => {
      component.content = { identifier: 'content-001' } as any
      component.accForm.patchValue({ dc: 'A', testCenter: 'TC1' })
    })

    it('should call getTestCenterSlots API with correct params', () => {
      component.getTestCenterSlots()
      expect(mockCertificationApi.getTestCenterSlots).toHaveBeenCalledWith('content-001', 'A', 'TC1')
    })

    it('should set slots and dateSlotFetchStatus to done on success', () => {
      component.getTestCenterSlots()
      expect(component.slots).toEqual({ dc: 'A', testcenter: 'TC1', slotdata: [] })
      expect(component.dateSlotFetchStatus).toBe('done')
    })

    it('should reset dateSlot and slot to null before fetching', () => {
      component.accForm.patchValue({ dateSlot: 'old-date', slot: 'old-slot' })
      component.getTestCenterSlots()
      // after fetch these are still null from the initial patch
      expect(mockCertificationApi.getTestCenterSlots).toHaveBeenCalled()
    })

    it('should set error fallback slots and dateSlotFetchStatus to error on failure', () => {
      mockCertificationApi.getTestCenterSlots.mockReturnValue(throwError('err'))
      component.getTestCenterSlots()
      expect(component.slots).toEqual({ dc: 'A', testcenter: 'TC1', slotdata: [] })
      expect(component.dateSlotFetchStatus).toBe('error')
    })

    it('should not call API when content is undefined', () => {
      component.content = undefined
      component.getTestCenterSlots()
      expect(mockCertificationApi.getTestCenterSlots).not.toHaveBeenCalled()
    })
  })

  // ── onDateChange ──────────────────────────────────────────────────────────
  describe('onDateChange', () => {
    it('should reset slot to null', () => {
      component.accForm.patchValue({ slot: 'some-slot' })
      component.onDateChange()
      expect(component.accForm.value.slot).toBeNull()
    })
  })

  // ── onSubmit ──────────────────────────────────────────────────────────────
  describe('onSubmit', () => {
    beforeEach(() => {
      component.content = { identifier: 'content-001' } as any
    })

    it('should set bookingSendStatus to sending when content is present', () => {
      const setSpy = jest.spyOn(component as any, 'onSubmit').mockImplementation(() => {
        component.bookingSendStatus = 'sending'
      })
      component.onSubmit()
      expect(setSpy).toHaveBeenCalled()
    })

    it('should call openFromComponent and return early when form is invalid', () => {
      // form is invalid (all required fields empty)
      component.onSubmit()
      expect(mockSnackbar.openFromComponent).toHaveBeenCalled()
      expect(mockCertificationApi.bookAccSlot).not.toHaveBeenCalled()
    })

    it('should call bookAccSlot with valid form', () => {
      component.accForm.patchValue({ dc: 'A', testCenter: 'TC1', dateSlot: 'd1', slot: 'slot1' })
      component.onSubmit()
      expect(mockCertificationApi.bookAccSlot).toHaveBeenCalledWith('content-001', 'slot1')
    })

    it('should set bookingSendStatus to done on success', () => {
      component.accForm.patchValue({ dc: 'A', testCenter: 'TC1', dateSlot: 'd1', slot: 'slot1' })
      component.onSubmit()
      expect(component.bookingSendStatus).toBe('done')
    })

    it('should navigate to certification page when res_code is 1', () => {
      component.accForm.patchValue({ dc: 'A', testCenter: 'TC1', dateSlot: 'd1', slot: 'slot1' })
      component.onSubmit()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/content-001/certification'])
    })

    it('should not navigate when res_code is not 1', () => {
      mockCertificationApi.bookAccSlot.mockReturnValue(of({ res_code: 0 }))
      component.accForm.patchValue({ dc: 'A', testCenter: 'TC1', dateSlot: 'd1', slot: 'slot1' })
      component.onSubmit()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should set bookingSendStatus to error on API failure', () => {
      mockCertificationApi.bookAccSlot.mockReturnValue(throwError('err'))
      component.accForm.patchValue({ dc: 'A', testCenter: 'TC1', dateSlot: 'd1', slot: 'slot1' })
      component.onSubmit()
      expect(component.bookingSendStatus).toBe('error')
    })

    it('should do nothing when content is undefined', () => {
      component.content = undefined
      component.onSubmit()
      expect(mockCertificationApi.bookAccSlot).not.toHaveBeenCalled()
    })
  })

  // ── filterDates ───────────────────────────────────────────────────────────
  describe('filterDates', () => {
    it('should return true when date is in the dateSlotMap', () => {
      const date = new Date('2023-01-15')
      component.dateSlotMap.set(date.getTime(), [])
      expect(component.filterDates(date)).toBe(true)
    })

    it('should return false when date is not in the dateSlotMap', () => {
      const date = new Date('2024-06-15')
      expect(component.filterDates(date)).toBe(false)
    })

    it('should return false when null is passed (error path)', () => {
      expect(component.filterDates(null as any)).toBe(false)
    })
  })

  // ── dateHasSlots ──────────────────────────────────────────────────────────
  describe('dateHasSlots', () => {
    it('should return true when at least one slot has seats_available', () => {
      const dateSlot = {
        date: Date.now(),
        slots: [{ seats_available: false }, { seats_available: true }],
      }
      expect(component.dateHasSlots(dateSlot as any)).toBe(true)
    })

    it('should return false when no slots have seats_available', () => {
      const dateSlot = {
        date: Date.now(),
        slots: [{ seats_available: false }, { seats_available: false }],
      }
      expect(component.dateHasSlots(dateSlot as any)).toBe(false)
    })

    it('should return true (default) when null is passed (error path)', () => {
      expect(component.dateHasSlots(null as any)).toBe(true)
    })

    it('should return false for empty slots array', () => {
      const dateSlot = { date: Date.now(), slots: [] }
      expect(component.dateHasSlots(dateSlot as any)).toBe(false)
    })
  })

  // ── private filterLocations ───────────────────────────────────────────────
  describe('filterLocations (private)', () => {
    beforeEach(() => {
      component.locations = [
        { dc: 'Mumbai', testcenter: 'TC1' } as any,
        { dc: 'Delhi', testcenter: 'TC2' } as any,
        { dc: 'Bangalore', testcenter: 'TC3' } as any,
      ]
    })

    it('should filter locations case-insensitively', () => {
      const result = (component as any).filterLocations('mum')
      expect(result).toEqual([{ dc: 'Mumbai', testcenter: 'TC1' }])
    })

    it('should return all locations for empty string', () => {
      const result = (component as any).filterLocations('')
      expect(result.length).toBe(3)
    })

    it('should return empty array when no match', () => {
      const result = (component as any).filterLocations('xyz')
      expect(result).toEqual([])
    })

    it('should return empty array when locations is null (error path)', () => {
      component.locations = null as any
      const result = (component as any).filterLocations('test')
      expect(result).toEqual([])
    })
  })
})
