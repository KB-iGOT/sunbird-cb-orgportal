import { RejectionReasonComponent } from './rejection-reason.component'
import { MatDialogRef } from '@angular/material/dialog'

describe('RejectionReasonComponent', () => {
  let component: RejectionReasonComponent
  let mockDialogRef: jest.Mocked<MatDialogRef<RejectionReasonComponent>>
  let mockData: any

  beforeEach(() => {
    // Create a mock for the dialog reference
    mockDialogRef = {
      close: jest.fn()
    } as any

    // Sample mock data to inject
    mockData = {
      reason: 'Invalid submission',
      details: 'Missing required information'
    }

    // Initialize the component with mocks
    component = new RejectionReasonComponent(
      mockDialogRef,
      mockData
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('constructor', () => {
    it('should set rejectReason from injected data', () => {
      // Assertion
      expect(component.rejectReason).toBe(mockData)
    })
  })

  describe('closeDialog', () => {
    it('should close the dialog when called', () => {
      // Call the method
      component.closeDialog()

      // Verify dialog was closed
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })
})