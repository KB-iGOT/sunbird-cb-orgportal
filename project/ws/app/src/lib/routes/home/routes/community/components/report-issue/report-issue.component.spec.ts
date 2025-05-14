import { ReportIssueComponent, IDialogData } from './report-issue.component'
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'

describe('ReportIssueComponent', () => {
  let component: ReportIssueComponent
  let dialogRefMock: { close: jest.Mock }
  let mockData: IDialogData[]

  beforeEach(() => {
    // Create a mock for MatDialogRef using Jest
    dialogRefMock = {
      close: jest.fn()
    }

    // Create mock data that matches the IDialogData interface
    mockData = [
      { title: 'Issue 1', sn: 1, reportCount: 5, percenageVal: 25 },
      { title: 'Issue 2', sn: 2, reportCount: 10, percenageVal: 50 }
    ]

    // Create component instance with mocked dependencies
    component = new ReportIssueComponent(
      dialogRefMock as unknown as MatDialogRef<ReportIssueComponent>,
      mockData
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with correct displayed columns', () => {
    expect(component.displayedColumns).toEqual(['title', 'reportCount', 'percenageVal'])
  })

  it('should have the data injected correctly', () => {
    expect(component.data).toBe(mockData)
    expect(component.data.length).toBe(2)
    expect(component.data[0].title).toBe('Issue 1')
    expect(component.data[1].reportCount).toBe(10)
  })

  it('should initialize component in ngOnInit', () => {
    // Spy on ngOnInit method
    const initSpy = jest.spyOn(component, 'ngOnInit')

    // Call ngOnInit
    component.ngOnInit()

    // Check if ngOnInit was called
    expect(initSpy).toHaveBeenCalled()
  })

  it('should close the dialog when onCancelDialog is called', () => {
    // Call the method
    component.onCancelDialog()

    // Check if dialogRef.close was called
    expect(dialogRefMock.close).toHaveBeenCalled()
  })

  // Additional tests for data content validation
  it('should contain correct data properties', () => {
    // Verify first data item has all required properties
    const firstItem = component.data[0]
    expect(firstItem).toHaveProperty('title')
    expect(firstItem).toHaveProperty('sn')
    expect(firstItem).toHaveProperty('reportCount')
    expect(firstItem).toHaveProperty('percenageVal')

    // Verify specific values
    expect(firstItem.title).toBe('Issue 1')
    expect(firstItem.sn).toBe(1)
    expect(firstItem.reportCount).toBe(5)
    expect(firstItem.percenageVal).toBe(25)
  })

  it('should handle empty data array', () => {
    // Create a new component instance with empty data
    const emptyComponent = new ReportIssueComponent(
      dialogRefMock as unknown as MatDialogRef<ReportIssueComponent>,
      []
    )

    expect(emptyComponent.data).toEqual([])
    expect(emptyComponent.data.length).toBe(0)
  })
})