import { of } from 'rxjs'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { CertificationService } from './certification.service'
import { CertificationApiService } from '../apis/certification-api.service'

describe('CertificationService', () => {
  let service: CertificationService
  let mockCertificationApi: jest.Mocked<CertificationApiService>

  beforeEach(() => {
    mockCertificationApi = {
      bookAtDeskSlot: jest.fn().mockReturnValue(of({ res_code: 1 })),
      sendExternalProof: jest.fn().mockReturnValue(of({ res_code: 1 })),
      submitOrWithdrawVerificationRequest: jest.fn().mockReturnValue(of({ res_code: 1 })),
      cancelBudgetApprovalRequest: jest.fn().mockReturnValue(of({ res_code: 1 })),
    } as any

    service = new CertificationService(mockCertificationApi)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getCertificationMeta', () => {
    it('should return throwError when route is null', (done) => {
      service.getCertificationMeta(null).subscribe({
        error: err => { expect(err).toBeTruthy(); done() },
      })
    })

    it('should return throwError when route has no data', (done) => {
      service.getCertificationMeta(undefined).subscribe({
        error: err => { expect(err).toBeTruthy(); done() },
      })
    })

    it('should return certification meta when route has valid data', (done) => {
      const mockMeta = { id: 'cert-1' }
      const mockRoute: any = {
        data: of({ certificationMetaResolve: { data: mockMeta } }),
      }
      service.getCertificationMeta(mockRoute).subscribe(result => {
        expect(result).toBe(mockMeta)
        done()
      })
    })

    it('should throw error when certificationMetaResolve.data is null', (done) => {
      const mockRoute: any = {
        data: of({ certificationMetaResolve: { data: null } }),
      }
      service.getCertificationMeta(mockRoute).subscribe({
        error: err => { expect(err).toBeTruthy(); done() },
      })
    })
  })

  describe('getContentMeta', () => {
    it('should return throwError when route is null', (done) => {
      service.getContentMeta(null).subscribe({
        error: err => { expect(err).toBeTruthy(); done() },
      })
    })

    it('should return content meta when route has valid data', (done) => {
      const mockContent = { identifier: 'content-1' }
      const mockRoute: any = {
        data: of({ contentMetaResolve: { data: mockContent } }),
      }
      service.getContentMeta(mockRoute).subscribe(result => {
        expect(result).toBe(mockContent)
        done()
      })
    })

    it('should throw error when contentMetaResolve.data is null', (done) => {
      const mockRoute: any = {
        data: of({ contentMetaResolve: { data: null } }),
      }
      service.getContentMeta(mockRoute).subscribe({
        error: err => { expect(err).toBeTruthy(); done() },
      })
    })
  })

  describe('bookAtDeskSlot', () => {
    it('should call certificationApi.bookAtDeskSlot with correct data', () => {
      const mockForm = new UntypedFormGroup({
        country: new UntypedFormControl('IN'),
        location: new UntypedFormControl('LOC1'),
        date: new UntypedFormControl({ dateObj: { day: 1, month: 1, year: 2024 } }),
        slot: new UntypedFormControl('SLOT1'),
        userContact: new UntypedFormControl('9999999999'),
        proctorContact: new UntypedFormControl('8888888888'),
        proctorEmail: new UntypedFormControl('proctor@example.com'),
      })
      service.bookAtDeskSlot('cert-1', mockForm).subscribe()
      expect(mockCertificationApi.bookAtDeskSlot).toHaveBeenCalledWith('cert-1', {
        country_code: 'IN',
        location_code: 'LOC1',
        date: { day: 1, month: 1, year: 2024 },
        slot: 'SLOT1',
        user_contact: '9999999999',
        proctor_contact: '8888888888',
        proctor: 'proctor',
      })
    })
  })

  describe('sendExternalProof', () => {
    it('should call certificationApi.sendExternalProof with form data', () => {
      const mockForm = new UntypedFormGroup({
        examDate: new UntypedFormControl(new Date(2024, 0, 1)),
        grade: new UntypedFormControl('A'),
        result: new UntypedFormControl('Pass'),
        resultType: new UntypedFormControl('External'),
        verifierEmail: new UntypedFormControl('verifier@example.com'),
        fileName: new UntypedFormControl('cert.pdf'),
        file: new UntypedFormControl(null),
      })
      service.sendExternalProof('cert-1', mockForm).subscribe()
      expect(mockCertificationApi.sendExternalProof).toHaveBeenCalled()
    })
  })

  describe('submitVerificationRequest', () => {
    it('should call certificationApi.submitOrWithdrawVerificationRequest with submit', () => {
      const mockForm = new UntypedFormGroup({
        resultType: new UntypedFormControl('External'),
        result: new UntypedFormControl('Pass'),
        fileName: new UntypedFormControl('cert.pdf'),
        verifierEmail: new UntypedFormControl('verifier@example.com'),
        examDate: new UntypedFormControl(new Date(2024, 0, 1)),
      })
      service.submitVerificationRequest('cert-1', mockForm).subscribe()
      expect(mockCertificationApi.submitOrWithdrawVerificationRequest).toHaveBeenCalledWith(
        'cert-1', expect.any(Object), 'submit'
      )
    })
  })

  describe('withdrawVerificationRequest', () => {
    it('should call certificationApi with withdraw when examDate is a number', (done) => {
      service.withdrawVerificationRequest('cert-1', 'External', 'Pass', 'cert.pdf', 'v@e.com', 1234567890).subscribe(result => {
        expect(result).toEqual({ res_code: 1 })
        done()
      })
      expect(mockCertificationApi.submitOrWithdrawVerificationRequest).toHaveBeenCalledWith(
        'cert-1', expect.any(Object), 'withdraw'
      )
    })

    it('should convert date object to millis when examDate is an object', (done) => {
      const dateObj = { day: 1, month: 1, year: 2024 }
      service.withdrawVerificationRequest('cert-1', 'External', 'Pass', 'cert.pdf', 'v@e.com', dateObj as any).subscribe(result => {
        expect(result).toEqual({ res_code: 1 })
        done()
      })
      expect(mockCertificationApi.submitOrWithdrawVerificationRequest).toHaveBeenCalled()
    })
  })
})
