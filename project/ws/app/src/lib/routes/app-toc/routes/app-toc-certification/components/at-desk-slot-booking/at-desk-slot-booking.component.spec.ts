import { AtDeskSlotBookingComponent } from './at-desk-slot-booking.component'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { NsContent } from '@ws-widget/collection'

describe('AtDeskSlotBookingComponent', () => {
  let component: AtDeskSlotBookingComponent
  let mockCertificationApi: any
  let mockCertificationSvc: any
  let mockRouter: any
  let mockRoute: any
  let mockSnackbar: any

  const mockCountryInput = {
    nativeElement: { value: '', readOnly: false },
  }

  beforeEach(() => {
    mockCertificationApi = {
      getAtDeskSlots: jest.fn().mockReturnValue(of([])),
      getCountries: jest.fn().mockReturnValue(of([])),
      getAtDeskLocations: jest.fn().mockReturnValue(of([])),
      getDefaultAtDeskProctor: jest.fn().mockReturnValue(of({ manager: 'test@example.com' })),
      getCertificationUserPrivileges: jest.fn().mockReturnValue(of({ canProctorAtDesk: true })),
    }

    mockCertificationSvc = {
      getCertificationMeta: jest.fn().mockReturnValue(of({})),
      getContentMeta: jest.fn().mockReturnValue(of({ identifier: 'test-id' })),
      bookAtDeskSlot: jest.fn().mockReturnValue(of({ res_code: 1 })),
    }

    mockRouter = { navigate: jest.fn() }
    mockRoute = { parent: {} }
    mockSnackbar = { openFromComponent: jest.fn() }

    component = new AtDeskSlotBookingComponent(
      mockRoute,
      mockRouter,
      mockSnackbar,
      mockCertificationApi,
      mockCertificationSvc,
    )
    component.countryInput = mockCountryInput as any
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize default values', () => {
    expect(component.managerFetchStatus).toBe('none')
    expect(component.requestSendStatus).toBe('none')
    expect(component.countriesChipList).toEqual([])
    expect(component.slotList).toEqual([])
  })

  it('should initialize the form with required controls', () => {
    expect(component.atDeskForm).toBeInstanceOf(UntypedFormGroup)
    expect(component.atDeskForm.get('date')).toBeInstanceOf(UntypedFormControl)
    expect(component.atDeskForm.get('country')).toBeInstanceOf(UntypedFormControl)
    expect(component.atDeskForm.get('location')).toBeInstanceOf(UntypedFormControl)
    expect(component.atDeskForm.get('slot')).toBeInstanceOf(UntypedFormControl)
    expect(component.atDeskForm.get('userContact')).toBeInstanceOf(UntypedFormControl)
    expect(component.atDeskForm.get('proctorContact')).toBeInstanceOf(UntypedFormControl)
    expect(component.atDeskForm.get('proctorEmail')).toBeInstanceOf(UntypedFormControl)
  })

  describe('ngOnInit', () => {
    it('should subscribe to content and certification meta', () => {
      component.ngOnInit()
      expect(mockCertificationSvc.getContentMeta).toHaveBeenCalled()
      expect(mockCertificationSvc.getCertificationMeta).toHaveBeenCalled()
    })

    it('should fetch at-desk slots on init', () => {
      const mockSlots = [{ date: { day: 1, month: 1, year: 2024, timeZone: 'UTC' }, slots: [] }]
      mockCertificationApi.getAtDeskSlots.mockReturnValue(of(mockSlots))
      component.ngOnInit()
      expect(mockCertificationApi.getAtDeskSlots).toHaveBeenCalled()
    })

    it('should fetch countries on init', () => {
      mockCertificationApi.getCountries.mockReturnValue(of([{ country_name: 'India', country_code: 'IN' }]))
      component.ngOnInit()
      expect(mockCertificationApi.getCountries).toHaveBeenCalled()
    })

    it('should handle country fetch error', () => {
      mockCertificationApi.getCountries.mockReturnValue(throwError('Network error'))
      component.ngOnInit()
      expect(component.countries).toEqual([])
    })

    it('should fetch user manager on init', () => {
      component.ngOnInit()
      expect(mockCertificationApi.getDefaultAtDeskProctor).toHaveBeenCalled()
      expect(component.managerFetchStatus).toBe('done')
      expect(component.atDeskForm.get('proctorEmail')?.value).toBe('test@example.com')
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe open subscriptions', () => {
      const mockSub = { closed: false, unsubscribe: jest.fn() }
      component.contentMetaSub = mockSub as any
      component.certificationMetaSub = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalledTimes(2)
    })

    it('should not unsubscribe already closed subscriptions', () => {
      const mockSub = { closed: true, unsubscribe: jest.fn() }
      component.contentMetaSub = mockSub as any
      component.certificationMetaSub = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).not.toHaveBeenCalled()
    })
  })

  describe('displayCountryNameAutocomplete', () => {
    it('should return country name when country provided', () => {
      const country = { country_name: 'India', country_code: 'IN' }
      const result = component.displayCountryNameAutocomplete(country as any)
      expect(result).toBe('India')
    })

    it('should return undefined when no country provided', () => {
      const result = component.displayCountryNameAutocomplete(undefined as any)
      expect(result).toBeUndefined()
    })
  })

  describe('countrySelected', () => {
    it('should add country to chip list when empty', () => {
      const country = { country_name: 'India', country_code: 'IN' }
      mockCertificationApi.getAtDeskLocations.mockReturnValue(of([{ location: 'Delhi' }]))
      component.countrySelected(country as any)
      expect(component.countriesChipList).toContain(country)
      expect(mockCountryInput.nativeElement.readOnly).toBe(true)
      expect(component.atDeskForm.get('country')?.value).toBe('IN')
    })

    it('should not add country when chip list is not empty', () => {
      component.countriesChipList = [{ country_name: 'US', country_code: 'US' } as any]
      const country = { country_name: 'India', country_code: 'IN' }
      component.countrySelected(country as any)
      expect(component.countriesChipList.length).toBe(1)
    })

    it('should fetch locations after country selection', () => {
      const country = { country_name: 'India', country_code: 'IN' }
      mockCertificationApi.getAtDeskLocations.mockReturnValue(of([{ location: 'Delhi' }]))
      component.countrySelected(country as any)
      expect(mockCertificationApi.getAtDeskLocations).toHaveBeenCalledWith('IN')
    })
  })

  describe('countryRemoved', () => {
    it('should clear chip list and reset form', () => {
      component.countriesChipList = [{ country_name: 'India', country_code: 'IN' } as any]
      component.countryRemoved()
      expect(component.countriesChipList).toEqual([])
      expect(component.atDeskForm.get('country')?.value).toBeNull()
      expect(component.atDeskForm.get('location')?.value).toBeNull()
      expect(mockCountryInput.nativeElement.value).toBe('')
      expect(mockCountryInput.nativeElement.readOnly).toBe(false)
      expect(component.locations).toEqual([])
    })
  })

  describe('filterDates', () => {
    it('should return true when date exists in dateSlotMap', () => {
      const date = new Date(2024, 0, 1)
      component.dateSlotMap.set(date.toString(), {} as any)
      expect(component.filterDates(date)).toBe(true)
    })

    it('should return false when date does not exist in dateSlotMap', () => {
      const date = new Date(2024, 0, 1)
      expect(component.filterDates(date)).toBe(false)
    })

    it('should return false when exception is thrown', () => {
      expect(component.filterDates(null as any)).toBe(false)
    })
  })

  describe('onDateChange', () => {
    it('should set selectedDateSlotItem from dateSlotMap', () => {
      const slotItem = { date: { day: 1, month: 1, year: 2024 }, slots: [] } as any
      const dateStr = '1/1/2024'
      component.dateSlotMap.set(dateStr, slotItem)
      component.onDateChange({ dateStr, dateObj: { day: 1, month: 1, year: 2024 } })
      expect(component.selectedDateSlotItem).toBe(slotItem)
    })
  })

  describe('onSubmit', () => {
    it('should show snackbar error when form is invalid', () => {
      component.content = { identifier: 'test-id' } as NsContent.IContent
      jest.spyOn(component.atDeskForm, 'invalid', 'get').mockReturnValue(true)
      component.onSubmit()
      expect(mockSnackbar.openFromComponent).toHaveBeenCalledWith(expect.any(Function), {
        data: { action: 'cert_at_desk_send', code: 'form_invalid' },
      })
    })

    it('should book slot when form is valid', () => {
      component.content = { identifier: 'test-id' } as NsContent.IContent
      component.atDeskForm.patchValue({
        date: { dateStr: '1/1/2024', dateObj: { day: 1, month: 1, year: 2024 } },
        country: 'IN',
        location: 'Delhi',
        slot: 'Slot A',
        userContact: '9999999999',
        proctorContact: '8888888888',
        proctorEmail: 'proctor@example.com',
      })
      component.onSubmit()
      expect(mockCertificationSvc.bookAtDeskSlot).toHaveBeenCalled()
      expect(component.requestSendStatus).toBe('done')
    })

    it('should navigate to certification after successful booking', () => {
      component.content = { identifier: 'test-id' } as NsContent.IContent
      component.atDeskForm.patchValue({
        date: { dateStr: '1/1/2024', dateObj: { day: 1, month: 1, year: 2024 } },
        country: 'IN', location: 'Delhi', slot: 'Slot A',
        userContact: '999', proctorContact: '888', proctorEmail: 'p@e.com',
      })
      component.onSubmit()
      expect(mockRouter.navigate).toHaveBeenCalled()
    })

    it('should handle submission error', () => {
      mockCertificationSvc.bookAtDeskSlot.mockReturnValue(throwError('Error'))
      component.content = { identifier: 'test-id' } as NsContent.IContent
      component.atDeskForm.patchValue({
        date: { dateStr: '1/1/2024', dateObj: { day: 1, month: 1, year: 2024 } },
        country: 'IN', location: 'Delhi', slot: 'Slot A',
        userContact: '999', proctorContact: '888', proctorEmail: 'p@e.com',
      })
      component.onSubmit()
      expect(component.requestSendStatus).toBe('error')
    })
  })

  describe('validateProctorEmail', () => {
    it('should return invalidEmail error when email is empty', (done) => {
      const control = new UntypedFormControl('')
      component.validateProctorEmail(control).subscribe(result => {
        expect(result).toEqual({ invalidEmail: true })
        done()
      })
    }, 2000)

    it('should return null when email matches manager', (done) => {
      component.userPrivileges = { manager: 'test', canProctorAtDesk: true } as any
      const control = new UntypedFormControl('test@example.com')
      component.validateProctorEmail(control).subscribe(result => {
        expect(result).toBeNull()
        done()
      })
    }, 2000)

    it('should call api when email does not match manager', (done) => {
      component.userPrivileges = { manager: 'other', canProctorAtDesk: true } as any
      mockCertificationApi.getCertificationUserPrivileges.mockReturnValue(of({ canProctorAtDesk: true }))
      const control = new UntypedFormControl('proctor@example.com')
      component.validateProctorEmail(control).subscribe(result => {
        expect(result).toBeNull()
        done()
      })
    }, 2000)
  })
})
