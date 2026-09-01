import { InfoModalComponent } from './info-modal.component'

describe('InfoModalComponent', () => {
  let component: InfoModalComponent
  let mockDialogRef: any

  function createComponent(data: any) {
    mockDialogRef = { close: jest.fn() }
    component = new InfoModalComponent(mockDialogRef, data)
  }

  afterEach(() => jest.clearAllMocks())

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    createComponent({ type: 'delete', title: 'Test' })
    expect(component).toBeTruthy()
  })

  it('should expose injected data', () => {
    const data = { type: 'delete', title: 'Confirm Delete' }
    createComponent(data)
    expect(component.data).toBe(data)
  })

  it('should expose dialogRef', () => {
    createComponent({ type: 'delete' })
    expect(component.dialogRef).toBe(mockDialogRef)
  })

  // ─── confirmed ───────────────────────────────────────────────────────────────

  describe('confirmed', () => {
    it('should close with startImporting=true for import-igot-master-create', () => {
      createComponent({ type: 'import-igot-master-create' })
      component.confirmed()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ startImporting: true })
    })

    it('should close with reviewImporting=false for import-igot-master-review', () => {
      createComponent({ type: 'import-igot-master-review' })
      component.confirmed()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ reviewImporting: false })
    })

    it('should close with isDelete=true for delete type', () => {
      createComponent({ type: 'delete' })
      component.confirmed()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ isDelete: true })
    })

    it('should close with empty object for unknown type', () => {
      createComponent({ type: 'unknown' })
      component.confirmed()
      expect(mockDialogRef.close).toHaveBeenCalledWith({})
    })
  })

  // ─── rejected ────────────────────────────────────────────────────────────────

  describe('rejected', () => {
    it('should close with close=true for import-igot-master-create', () => {
      createComponent({ type: 'import-igot-master-create' })
      component.rejected()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ close: true })
    })

    it('should close with reviewImporting=true for import-igot-master-review', () => {
      createComponent({ type: 'import-igot-master-review' })
      component.rejected()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ reviewImporting: true })
    })

    it('should close with isDelete=false for delete type', () => {
      createComponent({ type: 'delete' })
      component.rejected()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ isDelete: false })
    })

    it('should close with empty object for unknown type', () => {
      createComponent({ type: 'other' })
      component.rejected()
      expect(mockDialogRef.close).toHaveBeenCalledWith({})
    })
  })
})
