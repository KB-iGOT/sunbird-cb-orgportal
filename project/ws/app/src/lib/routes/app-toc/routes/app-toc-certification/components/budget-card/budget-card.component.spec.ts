import { of, Subject, throwError } from 'rxjs'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { BudgetCardComponent } from './budget-card.component'
import { CertificationApiService } from '../../apis/certification-api.service'
import { RequestCancelDialogComponent } from '../request-cancel-dialog/request-cancel-dialog.component'
import { SnackbarComponent } from '../snackbar/snackbar.component'

describe('BudgetCardComponent', () => {
  let component: BudgetCardComponent
  let mockDialog: jest.Mocked<MatDialog>
  let mockSnackbar: jest.Mocked<MatSnackBar>
  let mockCertificationApi: jest.Mocked<CertificationApiService>

  beforeEach(() => {
    mockDialog = {
      open: jest.fn(),
    } as any

    mockSnackbar = {
      openFromComponent: jest.fn(),
    } as any

    mockCertificationApi = {
      cancelBudgetApprovalRequest: jest.fn(),
    } as any

    component = new BudgetCardComponent(
      mockDialog,
      mockSnackbar,
      mockCertificationApi,
    )

    component.certificationFetchSubject = new Subject()
    component.content = { identifier: 'test-id' } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.budgetCancelStatus).toBe('none')
  })

  describe('cancelBudgetApproval', () => {
    beforeEach(() => {
      mockDialog.open.mockReturnValue({
        afterClosed: () => of({ confirmCancel: true }),
      } as any)
    })

    it('should successfully cancel budget approval', () => {
      mockCertificationApi.cancelBudgetApprovalRequest.mockReturnValue(of())

      component.cancelBudgetApproval()

      expect(mockDialog.open).toHaveBeenCalledWith(
        RequestCancelDialogComponent,
        { data: 'budget_approval' }
      )
      expect(mockCertificationApi.cancelBudgetApprovalRequest).toHaveBeenCalledWith('test-id')
      expect(component.budgetCancelStatus).toBe('sending')
    })

    it('should handle API error', () => {
      mockCertificationApi.cancelBudgetApprovalRequest.mockReturnValue(throwError('Error'))

      component.cancelBudgetApproval()

      expect(mockSnackbar.openFromComponent).toHaveBeenCalledWith(SnackbarComponent)
      expect(component.budgetCancelStatus).toBe('error')
    })

    it('should not proceed if dialog is cancelled', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: () => of({ confirmCancel: false }),
      } as any)

      component.cancelBudgetApproval()

      expect(mockCertificationApi.cancelBudgetApprovalRequest).not.toHaveBeenCalled()
      expect(component.budgetCancelStatus).toBe('none')
    })

    it('should handle missing content', () => {
      component.content = undefined as any
      mockDialog.open.mockReturnValue({
        afterClosed: () => of({ confirmCancel: true }),
      } as any)

      component.cancelBudgetApproval()

      expect(mockSnackbar.openFromComponent).toHaveBeenCalledWith(SnackbarComponent)
      expect(component.budgetCancelStatus).toBe('error')
    })

    it('should set status to sending when process starts', () => {
      mockCertificationApi.cancelBudgetApprovalRequest.mockReturnValue(of())

      component.cancelBudgetApproval()

      expect(component.budgetCancelStatus).toBe('sending')
    })
  })
})
