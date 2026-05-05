
import { MatSnackBar } from '@angular/material/snack-bar'
import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'
import { ActivatedRoute, Router } from '@angular/router'
import { AccSlotBookingComponent } from './acc-slot-booking.component'

describe('AccSlotBookingComponent', () => {
  let component: AccSlotBookingComponent

  const route: Partial<ActivatedRoute> = {}
  const router: Partial<Router> = {}
  const snackbar: Partial<MatSnackBar> = {}
  const certificationApi: Partial<CertificationApiService> = {}
  const certificationSvc: Partial<CertificationService> = {}

  beforeAll(() => {
    component = new AccSlotBookingComponent(
      route as ActivatedRoute,
      router as Router,
      snackbar as MatSnackBar,
      certificationApi as CertificationApiService,
      certificationSvc as CertificationService
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })
})
