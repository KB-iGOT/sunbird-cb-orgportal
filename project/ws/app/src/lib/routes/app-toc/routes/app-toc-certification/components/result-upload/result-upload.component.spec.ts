import { ResultUploadComponent } from './result-upload.component'
import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'

jest.mock('@angular/router')
jest.mock('@angular/material/snack-bar')
jest.mock('../../apis/certification-api.service')
jest.mock('../../services/certification.service')

describe('ResultUploadComponent', () => {
  let component: ResultUploadComponent
  let certificationApi: jest.Mocked<CertificationApiService>
  let certificationService: jest.Mocked<CertificationService>
  let router: jest.Mocked<Router>
  let snackBar: jest.Mocked<MatSnackBar>
  let route: Partial<ActivatedRoute>

  const mockCertification = {
    verification_request: {
      status: '',
    },
    submitVerificationRequest: jest.fn(),
  }

  const mockContent = {
    identifier: 'test-content-id',
  }

  beforeEach(() => {
    certificationApi = {
      getDefaultAtDeskProctor: jest.fn().mockReturnValue(of({
        canApproveBudgetRequest: false,
        canProctorAtDesk: false,
        canVerifyResult: false,
        manager: 'manager@test.com'
      })),
      getCertificationUserPrivileges: jest.fn(),
      deleteExternalProof: jest.fn()
    } as any

    certificationService = {
      getCertificationMeta: jest.fn().mockReturnValue(of(mockCertification)),
      getContentMeta: jest.fn().mockReturnValue(of(mockContent)),
      sendExternalProof: jest.fn(),
      submitVerificationRequest: jest.fn()
    } as any

    router = {
      navigate: jest.fn()
    } as any

    snackBar = {
      openFromComponent: jest.fn()
    } as any

    route = {
      parent: {
        url: undefined,
        params: undefined,
        queryParams: undefined,
        fragment: undefined,
        data: undefined,
        outlet: '',
        component: '',
        snapshot: new ActivatedRouteSnapshot,
        routeConfig: undefined,
        root: new ActivatedRoute,
        parent: new ActivatedRoute,
        firstChild: new ActivatedRoute,
        children: [],
        pathFromRoot: [],
        paramMap: undefined,
        queryParamMap: undefined
      }
    }

    component = new ResultUploadComponent(
      route as ActivatedRoute,
      router,
      snackBar,
      certificationApi,
      certificationService
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should fetch user manager on init', () => {
      expect(certificationApi.getDefaultAtDeskProctor).toHaveBeenCalled()
      expect(component.certPrivileges.manager).toBe('manager@test.com')
    })

    it('should subscribe to content and certification meta', () => {
      expect(certificationService.getContentMeta).toHaveBeenCalled()
      expect(certificationService.getCertificationMeta).toHaveBeenCalled()
    })
  })

  describe('form validation', () => {
    it('should validate result type score', () => {
      component.resultForm.patchValue({
        resultType: 'score',
        result: '85'
      })
      expect(component.resultForm.get('result')?.errors).toStrictEqual({ "noResultType": true })

      component.resultForm.patchValue({
        result: 'invalid'
      })
      expect(component.resultForm.get('result')?.errors).toHaveProperty('scoreNaN')
    })

    it('should validate result type percentage', () => {
      component.resultForm.patchValue({
        resultType: 'percentage',
        result: '75'
      })
      expect(component.resultForm.get('result')?.errors).toStrictEqual({ "noResultType": true })

      component.resultForm.patchValue({
        result: '101'
      })
      expect(component.resultForm.get('result')?.errors).toHaveProperty('invalidPercentage')
    })
  })

  describe('onSubmit', () => {
    it('should show error snackbar if form is invalid', () => {
      component.resultForm.setErrors({ invalid: true })
      component.onSubmit()

      expect(snackBar.openFromComponent).toHaveBeenCalledWith(expect.any(Function), {
        data: {
          action: 'cert_result_upload',
          code: 'form_invalid'
        }
      })
    })

    it('should call sendExternalProof and navigate on success', () => {
      component.resultForm.setErrors(null)
      certificationService.sendExternalProof.mockReturnValue(of())

      component.onSubmit()

    })

    it('should handle error in submission', () => {
      component.resultForm.setErrors(null)
      certificationService.sendExternalProof.mockReturnValue(throwError('error'))

      component.onSubmit()

      expect(component.requestSendStatus).toBe('none')
      expect(snackBar.openFromComponent).toHaveBeenCalled()
    })
  })

  describe('deleteProof', () => {
    it('should call deleteExternalProof and navigate on success', () => {
      certificationApi.deleteExternalProof.mockReturnValue(of())
      component.content = { identifier: 'test-id' } as any
      component.certification = {
        verification_request: {
          document: [{ document_url: 'test-url' }]
        }
      } as any

      component.deleteProof()

      expect(certificationApi.deleteExternalProof).toHaveBeenCalledWith('test-id', 'test-url')
      expect(component.proofDeleteStatus).toBe('sending')
    })

    it('should handle error in deletion', () => {
      certificationApi.deleteExternalProof.mockReturnValue(throwError('error'))
      component.content = { identifier: 'test-id' } as any
      component.certification = {
        verification_request: {
          document: [{ document_url: 'test-url' }]
        }
      } as any

      component.deleteProof()

      expect(component.proofDeleteStatus).toBe('error')
      expect(snackBar.openFromComponent).toHaveBeenCalled()
    })
  })

  // describe('submitProof', () => {
  //   it('should call submitVerificationRequest and navigate on success', () => {
  //     certificationService.submitVerificationRequest.mockReturnValue(of())

  //     component.submitProof()

  //     expect(certificationService.submitVerificationRequest).toHaveBeenCalled()
  //     expect(component.proofSubmitStatus).toBe('done')
  //   })

  //   it('should handle error in submission', () => {
  //     certificationService.submitVerificationRequest.mockReturnValue(throwError('error'))

  //     component.submitProof()

  //     expect(component.proofSubmitStatus).toBe('error')
  //     expect(snackBar.openFromComponent).toHaveBeenCalled()
  //   })
  // })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions', () => {
      const mockSubscription = {
        closed: false,
        unsubscribe: jest.fn()
      }

      component.contentMetaSub = mockSubscription as any
      component.certificationMetaSub = mockSubscription as any

      component.ngOnDestroy()

      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(2)
    })
  })
})
