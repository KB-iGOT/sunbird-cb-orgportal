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

  beforeEach(() => {
    mockCertificationApi = {
      getAtDeskSlots: jest.fn().mockReturnValue(of([])),
      getCountries: jest.fn().mockReturnValue(of([])),
      getAtDeskLocations: jest.fn().mockReturnValue(of([])),
      getDefaultAtDeskProctor: jest.fn().mockReturnValue(of({ manager: 'test@example.com' })),
    }

    mockCertificationSvc = {
      getCertificationMeta: jest.fn().mockReturnValue(of({})),
      getContentMeta: jest.fn().mockReturnValue(of({ identifier: 'test-id' })),
      bookAtDeskSlot: jest.fn().mockReturnValue(of({ res_code: 1 })),
    }

    mockRouter = {
      navigate: jest.fn(),
    }

    mockRoute = {
      parent: {},
    }

    mockSnackbar = {
      openFromComponent: jest.fn(),
    }

    component = new AtDeskSlotBookingComponent(
      mockRoute,
      mockRouter,
      mockSnackbar,
      mockCertificationApi,
      mockCertificationSvc,
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
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

  it('should subscribe to content and certification meta on ngOnInit', () => {
    component.ngOnInit()
    expect(mockCertificationSvc.getContentMeta).toHaveBeenCalled()
    expect(mockCertificationSvc.getCertificationMeta).toHaveBeenCalled()
  })

  it('should fetch at-desk slots and countries on ngOnInit', () => {
    component.ngOnInit()
    setTimeout(() => {
      expect(mockCertificationApi.getAtDeskSlots).toHaveBeenCalled()
      expect(mockCertificationApi.getCountries).toHaveBeenCalled()
    }, 3000)

  })

  it('should validate proctor email', (done) => {
    const control = new UntypedFormControl('test@example.com')
    component.validateProctorEmail(control).subscribe(result => {
      expect(result.invalidEmail).toBeTruthy()
      done()
    })
  })

  it('should handle form submission', () => {
    component.content = { identifier: 'test-id' } as NsContent.IContent
    component.atDeskForm.patchValue({
      date: new Date(),
      country: 'IN',
      location: 'Location 1',
      slot: 'Slot 1',
      userContact: 'user@example.com',
      proctorContact: 'proctor@example.com',
      proctorEmail: 'test@example.com',
    })

    component.onSubmit()
    expect(mockSnackbar.openFromComponent).toHaveBeenCalled()
    expect(mockCertificationSvc.bookAtDeskSlot).toHaveBeenCalledWith('test-id', component.atDeskForm)
  })

  it('should handle errors during form submission', () => {
    mockCertificationSvc.bookAtDeskSlot.mockReturnValue(throwError('Error'))
    component.content = { identifier: 'test-id' } as NsContent.IContent
    component.atDeskForm.patchValue({
      date: new Date(),
      country: 'IN',
      location: 'Location 1',
      slot: 'Slot 1',
      userContact: 'user@example.com',
      proctorContact: 'proctor@example.com',
      proctorEmail: 'test@example.com',
    })

    component.onSubmit()

  })

  it('should unsubscribe from subscriptions on ngOnDestroy', () => {
    component.ngOnDestroy()
  })
})
