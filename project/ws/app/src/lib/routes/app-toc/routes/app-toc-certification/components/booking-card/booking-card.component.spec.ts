import { Subject, of, throwError } from 'rxjs'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { CertificationApiService } from '../../apis/certification-api.service'
import { BookingCardComponent } from './booking-card.component'

describe('BookingCardComponent', () => {
    let component: BookingCardComponent
    let mockDialog: jest.Mocked<MatDialog>
    let mockSnackbar: jest.Mocked<MatSnackBar>
    let mockCertificationApi: jest.Mocked<CertificationApiService>

    beforeEach(() => {
        // Create mock services
        mockDialog = {
            open: jest.fn(),
        } as any

        mockSnackbar = {
            openFromComponent: jest.fn(),
        } as any

        mockCertificationApi = {
            cancelSlot: jest.fn(),
        } as any

        // Initialize component with mock services
        component = new BookingCardComponent(
            mockDialog,
            mockSnackbar,
            mockCertificationApi,
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
        expect(component.bookingCancelStatus).toBe('none')
        expect(component.fetchStatus).toBe('none')
        expect(component.slotCancel).toBeTruthy()
        expect(component.subscriptionSubject$).toBeInstanceOf(Subject)
    })

    describe('ngOnDestroy', () => {
        it('should complete the subscription subject', () => {
            const nextSpy = jest.spyOn(component.subscriptionSubject$, 'next')
            const completeSpy = jest.spyOn(component.subscriptionSubject$, 'complete')

            component.ngOnDestroy()

            expect(nextSpy).toHaveBeenCalled()
            expect(completeSpy).toHaveBeenCalled()
        })
    })

    describe('openCancelDialog', () => {
        const mockDialogRef = {
            afterClosed: jest.fn(),
        }

        const mockContent = {
            identifier: 'test-id',
        }

        const mockCertification = {
            booking: {
                slotno: 123,
                icfdId: 'icfd-123',
            },
        }

        beforeEach(() => {
            component.content = mockContent as any
            component.certification = mockCertification as any
        })


        it('should handle API error', () => {
            const dialogResult = { confirmCancel: true }

            mockDialog.open.mockReturnValue(mockDialogRef as any)
            mockDialogRef.afterClosed.mockReturnValue(of(dialogResult))
            mockCertificationApi.cancelSlot.mockReturnValue(throwError('Error'))

            component.openCancelDialog()

            expect(mockSnackbar.openFromComponent).toHaveBeenCalled()
            expect(component.bookingCancelStatus).toBe('error')
        })

        it('should not proceed if dialog is cancelled', () => {
            const dialogResult = { confirmCancel: false }

            mockDialog.open.mockReturnValue(mockDialogRef as any)
            mockDialogRef.afterClosed.mockReturnValue(of(dialogResult))

            component.openCancelDialog()

            expect(mockCertificationApi.cancelSlot).not.toHaveBeenCalled()
            expect(component.bookingCancelStatus).toBe('none')
        })

        it('should handle missing content or certification data', () => {
            component.content = undefined as any
            component.certification = undefined as any
            const dialogResult = { confirmCancel: true }

            mockDialog.open.mockReturnValue(mockDialogRef as any)
            mockDialogRef.afterClosed.mockReturnValue(of(dialogResult))

            component.openCancelDialog()

            expect(mockCertificationApi.cancelSlot).not.toHaveBeenCalled()
            expect(mockSnackbar.openFromComponent).toHaveBeenCalled()
            expect(component.bookingCancelStatus).toBe('error')
        })
    })
})
