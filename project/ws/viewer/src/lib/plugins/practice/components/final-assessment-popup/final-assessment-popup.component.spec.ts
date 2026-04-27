import { FinalAssessmentPopupComponent } from './final-assessment-popup.component'

describe('FinalAssessmentPopupComponent', () => {
  let component: FinalAssessmentPopupComponent
  let mockDialogRef: any

  function createComponent(data: any = {}) {
    mockDialogRef = { close: jest.fn() }
    component = new FinalAssessmentPopupComponent(mockDialogRef, data)
  }

  beforeEach(() => {
    createComponent()
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set assessmentData from data', () => {
    createComponent({ headerText: 'Test Header' })
    expect(component.assessmentData).toEqual({ headerText: 'Test Header' })
  })

  it('should call setTableDataSource when data has tableDetails.tableData', () => {
    const tableData = [{ col1: 'val1' }]
    createComponent({ tableDetails: { tableData } })
    expect(component.dataSource.data).toEqual(tableData)
  })

  it('should not throw when data has no tableDetails', () => {
    expect(() => createComponent({ title: 'Test' })).not.toThrow()
  })

  // ─── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call setTableColumns when tableColumns present in assessmentData', () => {
      createComponent({ tableDetails: { tableColumns: ['col1', 'col2'], tableData: [] } })
      const spy = jest.spyOn(component, 'setTableColumns')
      component.ngOnInit()
      expect(spy).toHaveBeenCalledWith(['col1', 'col2'])
    })

    it('should not throw when assessmentData has no tableDetails', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should not throw when assessmentData.tableDetails has no tableColumns', () => {
      createComponent({ tableDetails: {} })
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  // ─── setTableColumns ───────────────────────────────────────────────────────

  describe('setTableColumns', () => {
    it('should set displayedColumns', () => {
      component.setTableColumns(['a', 'b', 'c'])
      expect(component.displayedColumns).toEqual(['a', 'b', 'c'])
    })

    it('should set displayedColumns to empty array', () => {
      component.setTableColumns([])
      expect(component.displayedColumns).toEqual([])
    })
  })

  // ─── setTableDataSource ─────────────────────────────────────────────────────

  describe('setTableDataSource', () => {
    it('should set dataSource.data', () => {
      const data = [{ id: 1 }, { id: 2 }]
      component.setTableDataSource(data)
      expect(component.dataSource.data).toEqual(data)
    })
  })

  // ─── closePopup ────────────────────────────────────────────────────────────

  describe('closePopup', () => {
    it('should close dialogRef with given response', () => {
      component.closePopup('ok')
      expect(mockDialogRef.close).toHaveBeenCalledWith('ok')
    })

    it('should close dialogRef with false', () => {
      component.closePopup(false)
      expect(mockDialogRef.close).toHaveBeenCalledWith(false)
    })

    it('should close dialogRef with null', () => {
      component.closePopup(null)
      expect(mockDialogRef.close).toHaveBeenCalledWith(null)
    })
  })

  // ─── getFinalColumns ───────────────────────────────────────────────────────

  describe('getFinalColumns', () => {
    it('should return array of column keys', () => {
      component.displayedColumns = [{ key: 'colA' }, { key: 'colB' }]
      expect(component.getFinalColumns).toEqual(['colA', 'colB'])
    })

    it('should return empty array when displayedColumns is empty', () => {
      component.displayedColumns = []
      expect(component.getFinalColumns).toEqual([])
    })
  })
})
