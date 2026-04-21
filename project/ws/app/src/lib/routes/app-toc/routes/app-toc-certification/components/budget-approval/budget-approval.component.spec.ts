import { UntypedFormGroup } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { of, throwError } from 'rxjs'
import { BudgetApprovalComponent } from './budget-approval.component'
import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'
import { SnackbarComponent } from '../snackbar/snackbar.component'

jest.mock('@angular/router')
jest.mock('@angular/material/snack-bar')
jest.mock('../../apis/certification-api.service')
jest.mock('../../services/certification.service')

describe('BudgetApprovalComponent', () => {
  let component: BudgetApprovalComponent
  let mockRouter: jest.Mocked<Router>
  let mockRoute: jest.Mocked<ActivatedRoute>
  let mockSnackBar: jest.Mocked<MatSnackBar>
  let mockCertificationApi: jest.Mocked<CertificationApiService>
  let mockCertificationService: jest.Mocked<CertificationService>

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
    } as any

    mockRoute = {
      parent: {},
    } as any

    mockSnackBar = {
      openFromComponent: jest.fn(),
    } as any

    mockCertificationApi = {
      getCurrencies: jest.fn(),
      getDefaultAtDeskProctor: jest.fn(),
      getCertificationUserPrivileges: jest.fn(),
      sendBudgetApprovalRequest: jest.fn(),
    } as any

    mockCertificationService = {
      getContentMeta: jest.fn(),
    } as any

    component = new BudgetApprovalComponent(
      mockRoute,
      mockRouter,
      mockSnackBar,
      mockCertificationApi,
      mockCertificationService
    )
  })

  describe('initialization', () => {
    it('should create with default values', () => {
      expect(component).toBeTruthy()
      expect(component.currencies).toEqual([])
      expect(component.currencyFetchStatus).toBe('fetching')
      expect(component.managerFetchStatus).toBe('none')
      expect(component.requestSendStatus).toBe('none')
      expect(component.budgetForm instanceof UntypedFormGroup).toBeTruthy()
    })

    it('should fetch currencies and user manager on init', () => {
      const mockPrivileges = {
        canApproveBudgetRequest: true,
        canProctorAtDesk: true,
        canVerifyResult: true,
        manager: 'manager@example.com',
      }

      mockCertificationApi.getCurrencies.mockReturnValue(of())
      mockCertificationApi.getDefaultAtDeskProctor.mockReturnValue(of(mockPrivileges))
      mockCertificationService.getContentMeta.mockReturnValue(of())

      component.ngOnInit()

      expect(mockCertificationApi.getCurrencies).toHaveBeenCalled()
      expect(mockCertificationApi.getDefaultAtDeskProctor).toHaveBeenCalled()
      expect(component.certPrivileges).toEqual(mockPrivileges)
    })
  })

  describe('form validation', () => {
    it('should validate required fields', () => {
      const form = component.budgetForm
      expect(form.valid).toBeFalsy()

      form.controls.currency.setValue('USD')
      form.controls.amount.setValue(100)
      form.controls.approverEmail.setValue('manager@example.com')

      expect(form.valid).toBeFalsy()
    })

    it('should validate amount constraints', () => {
      const amountControl = component.budgetForm.controls.amount

      amountControl.setValue(-1)
      expect(amountControl.errors?.['min']).toBeTruthy()

      amountControl.setValue(100000000)
      expect(amountControl.errors?.['max']).toBeTruthy()

      amountControl.setValue(1000)
      expect(amountControl.errors).toBeNull()
    })
  })

  describe('onSubmit', () => {
    it('should show error if form is invalid', () => {
      component.onSubmit()
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(SnackbarComponent, {
        data: {
          action: 'cert_budget_send',
          code: 'form_invalid',
        },
      })
    })

    it('should submit budget approval request successfully', () => {
      component.content = { identifier: 'test-123' } as any
      component.budgetForm.patchValue({
        currency: 'USD',
        amount: 1000,
        approverEmail: 'manager@example.com',
      })

      mockCertificationApi.sendBudgetApprovalRequest.mockReturnValue(
        of()
      )

      component.onSubmit()

      expect(mockCertificationApi.sendBudgetApprovalRequest).toHaveBeenCalledWith(
        'test-123',
        {
          amount: 1000,
          currency: 'USD',
          manager_id: 'manager',
        }
      )


    })

    it('should handle submission error', () => {
      component.content = { identifier: 'test-123' } as any
      component.budgetForm.patchValue({
        currency: 'USD',
        amount: 1000,
        approverEmail: 'manager@example.com',
      })

      mockCertificationApi.sendBudgetApprovalRequest.mockReturnValue(
        throwError('Error')
      )

      component.onSubmit()

      expect(component.requestSendStatus).toBe('error')
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(SnackbarComponent)
    })
  })

  describe('cleanup', () => {
    it('should unsubscribe from subscriptions on destroy', () => {
      const mockSubscription = {
        closed: false,
        unsubscribe: jest.fn(),
      }

      component.contentMetaSub = mockSubscription as any
      component.certificationMetaSub = mockSubscription as any

      component.ngOnDestroy()

      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(2)
    })
  })
})
