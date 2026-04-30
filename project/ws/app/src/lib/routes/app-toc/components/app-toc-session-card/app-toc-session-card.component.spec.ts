import { AppTocSessionCardComponent } from './app-toc-session-card.component'

describe('AppTocSessionCardComponent', () => {
  let component: AppTocSessionCardComponent

  beforeEach(() => {
    component = new AppTocSessionCardComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default initial values', () => {
    expect(component.session).toBeNull()
    expect(component.expandAll).toBe(false)
    expect(component.forPreview).toBe(false)
    expect(component.isEnabled).toBe(true)
    expect(component.isAllowed).toBe(true)
    expect(component.viewChildren).toBe(true)
    expect(component.resourceLink).toBeUndefined()
  })

  it('should accept session input', () => {
    const mockSession = { id: 'session1', name: 'Test Session' }
    component.session = mockSession
    expect(component.session).toEqual(mockSession)
  })

  it('should accept expandAll input', () => {
    component.expandAll = true
    expect(component.expandAll).toBe(true)
  })

  it('should accept rootId input', () => {
    component.rootId = 'root-123'
    expect(component.rootId).toBe('root-123')
  })

  it('should accept rootContentType input', () => {
    component.rootContentType = 'Course'
    expect(component.rootContentType).toBe('Course')
  })

  it('should accept forPreview input', () => {
    component.forPreview = true
    expect(component.forPreview).toBe(true)
  })

  it('should accept batchData input', () => {
    const mockBatch = { batchId: 'batch1', status: 'active' }
    component.batchData = mockBatch
    expect(component.batchData).toEqual(mockBatch)
  })

  it('should accept config input', () => {
    component.config = 'test-config'
    expect(component.config).toBe('test-config')
  })

  it('should call ngOnInit without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('should call raiseTelemetry without errors', () => {
    expect(() => component.raiseTelemetry()).not.toThrow()
  })

  it('progressColor should return correct color', () => {
    expect(component.progressColor()).toBe('#1D8923')
  })

  it('progressColor2 should return correct color', () => {
    expect(component.progressColor2()).toBe('#f27d00')
  })
})

