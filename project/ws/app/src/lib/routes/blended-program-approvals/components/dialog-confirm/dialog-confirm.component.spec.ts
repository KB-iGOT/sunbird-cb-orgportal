import { DialogConfirmComponent } from './dialog-confirm.component'
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'

describe('DialogConfirmComponent', () => {
  let component: DialogConfirmComponent
  let mockDialogRef: jest.Mocked<MatDialogRef<DialogConfirmComponent>>
  let mockData: { title: string, body: string, yes: string, no: string }

  beforeEach(() => {
    // Create mock object for MatDialogRef
    mockDialogRef = {
      close: jest.fn()
    } as any

    // Mock data
    mockData = {
      title: 'Test Title',
      body: 'Test Body',
      yes: 'Yes',
      no: 'No'
    }

    // Create component instance manually (without TestBed)
    component = new DialogConfirmComponent(mockData, mockDialogRef)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with injected data', () => {
      expect(component.data).toBe(mockData)
      expect(component.data.title).toBe('Test Title')
      expect(component.data.body).toBe('Test Body')
      expect(component.data.yes).toBe('Yes')
      expect(component.data.no).toBe('No')
    })

    it('should have dialogRef injected', () => {
      expect(component['dialogRef']).toBe(mockDialogRef)
    })
  })

  describe('confirmed method', () => {
    it('should call dialogRef.close with true when confirmed is called', () => {
      // Act
      component.confirmed()

      // Assert
      expect(mockDialogRef.close).toHaveBeenCalledWith(true)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })
  })

  describe('Data Properties', () => {
    it('should have public data property accessible', () => {
      expect(component.data).toBeDefined()
      expect(typeof component.data).toBe('object')
    })

    it('should contain all required data properties', () => {
      expect(component.data).toHaveProperty('title')
      expect(component.data).toHaveProperty('body')
      expect(component.data).toHaveProperty('yes')
      expect(component.data).toHaveProperty('no')
    })

    it('should handle different data values', () => {
      const differentData = {
        title: 'Different Title',
        body: 'Different Body',
        yes: 'Confirm',
        no: 'Cancel'
      }

      const newComponent = new DialogConfirmComponent(differentData, mockDialogRef)

      expect(newComponent.data.title).toBe('Different Title')
      expect(newComponent.data.body).toBe('Different Body')
      expect(newComponent.data.yes).toBe('Confirm')
      expect(newComponent.data.no).toBe('Cancel')
    })
  })

  describe('Constructor', () => {
    it('should accept MAT_DIALOG_DATA injection', () => {
      const testData = {
        title: 'Constructor Test',
        body: 'Constructor Body',
        yes: 'OK',
        no: 'Cancel'
      }

      const newComponent = new DialogConfirmComponent(testData, mockDialogRef)

      expect(newComponent.data).toEqual(testData)
    })

    it('should accept MatDialogRef injection', () => {
      const newMockDialogRef = {
        close: jest.fn()
      } as any
      const newComponent = new DialogConfirmComponent(mockData, newMockDialogRef)

      newComponent.confirmed()

      expect(newMockDialogRef.close).toHaveBeenCalledWith(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string values in data', () => {
      const emptyData = {
        title: '',
        body: '',
        yes: '',
        no: ''
      }

      const newComponent = new DialogConfirmComponent(emptyData, mockDialogRef)

      expect(newComponent.data.title).toBe('')
      expect(newComponent.data.body).toBe('')
      expect(newComponent.data.yes).toBe('')
      expect(newComponent.data.no).toBe('')
    })

    it('should handle null/undefined values in data properties', () => {
      const nullData = {
        title: null as any,
        body: undefined as any,
        yes: 'Yes',
        no: 'No'
      }

      const newComponent = new DialogConfirmComponent(nullData, mockDialogRef)

      expect(newComponent.data.title).toBeNull()
      expect(newComponent.data.body).toBeUndefined()
      expect(newComponent.data.yes).toBe('Yes')
      expect(newComponent.data.no).toBe('No')
    })

    it('should call confirmed method multiple times', () => {
      component.confirmed()
      component.confirmed()
      component.confirmed()

      expect(mockDialogRef.close).toHaveBeenCalledWith(true)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(3)
    })
  })
})