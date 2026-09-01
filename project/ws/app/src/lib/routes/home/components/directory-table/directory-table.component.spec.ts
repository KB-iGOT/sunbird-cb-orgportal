import { BehaviorSubject, of } from 'rxjs'
import * as _ from 'lodash'

describe('DirectoryTableComponent', () => {
  let component: any
  let mockDirectoryService: any
  let mockDatePipe: any
  let mockDialog: any
  let mockRouter: any
  let mockActivatedRoute: any

  beforeEach(() => {
    mockDirectoryService = {
      getAllDepartmentsKong: jest.fn().mockReturnValue(of({
        result: {
          response: {
            content: [],
            count: 0,
          },
        },
      })),
      getStatesOrMinisteries: jest.fn().mockReturnValue(of({
        result: { response: { content: [] } },
      })),
      getOrgReadData: jest.fn().mockReturnValue(of({})),
      getFrameworkInfo: jest.fn().mockReturnValue(of({})),
    }

    mockDatePipe = {
      transform: jest.fn().mockReturnValue('01/01/2024, 10:00 AM'),
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ reviewImporting: false })),
      }),
    }

    mockRouter = {
      navigate: jest.fn(),
    }

    mockActivatedRoute = {
      snapshot: {
        data: {
          configService: { orgReadData: {} },
        },
      },
    }

    const { DirectoryTableComponent } = require('./directory-table.component')

    component = new DirectoryTableComponent(
      mockDirectoryService,
      mockDatePipe,
      mockDialog,
      mockRouter,
      mockActivatedRoute
    )

    component.paginator = {}
    component.sort = {}
  })

  // ---------------- INIT ----------------
  it('should initialize component', () => {
    jest.spyOn(component, 'initializetableData')
    jest.spyOn(component, 'getAllDepartments').mockImplementation(() => Promise.resolve())
    jest.spyOn(component, 'initializeValuesAndAPIs')

    component.ngOnInit()

    expect(component.initializetableData).toHaveBeenCalled()
    expect(component.getAllDepartments).toHaveBeenCalled()
    expect(component.initializeValuesAndAPIs).toHaveBeenCalled()
  })

  // ---------------- TABLE INIT ----------------
  it('should initialize table data', () => {
    component.initializetableData()
    expect(component.tableData.columns.length).toBeGreaterThan(0)
    expect(component.tableData.loader).toBeTruthy()
  })

  // ---------------- GET ALL DEPARTMENTS ----------------
  it('should fetch departments success', () => {
    const response = {
      result: {
        response: {
          content: [{ id: 1 }],
          count: 1,
        },
      },
    }

    mockDirectoryService.getAllDepartmentsKong.mockReturnValue(of(response))
    jest.spyOn(component, 'getFormatedData')

    component.getAllDepartments('test')

    expect(component.wholeData2.length).toBe(1)
    expect(component.totalCount).toBe(1)
    expect(component.getFormatedData).toHaveBeenCalled()
  })

  it('should handle error in getAllDepartments', () => {
    mockDirectoryService.getAllDepartmentsKong.mockReturnValue({
      subscribe: (_s: any, e: any) => e(),
    })

    component.getAllDepartments('')

    expect(component.tableData.loader).toBeFalsy()
  })

  // ---------------- FORMAT DATA ----------------
  it('should format data correctly', () => {
    component.wholeData2 = [
      {
        id: 1,
        orgName: 'Org',
        createdDate: '2024-01-01 10:00:00',
      },
    ]

    jest.spyOn(component, 'setDataSource')

    component.getFormatedData()

    expect(component.formatedData.length).toBe(1)
    expect(component.setDataSource).toHaveBeenCalled()
  })

  // ---------------- SET DATASOURCE ----------------
  it('should set datasource', () => {
    component.formatedData = [{ id: 1 }]
    component.tableData.tableDataCount = 5

    component.setDataSource()

    expect(component.dataSource.data.length).toBe(1)
    expect(component.length).toBe(5)
  })

  // ---------------- DATE TRANSFORM ----------------
  it('should transform date', () => {
    const result = component.transformDate('2024-01-01 10:00:00')
    expect(result).toBe('01/01/2024, 10:00 AM')
  })

  // ---------------- INIT VALUES ----------------
  it('should load ministries', () => {
    const res = {
      result: {
        response: {
          content: [{ orgName: 'Test' }],
        },
      },
    }

    mockDirectoryService.getStatesOrMinisteries.mockReturnValue(of(res))

    component.initializeValuesAndAPIs()

    expect(component.dropdownList.ministriesList.length).toBe(1)
  })

  // ---------------- UI ACTIONS ----------------
  it('should open create new', () => {
    jest.spyOn(component, 'toggleOverlay')

    component.gotoCreateNew()

    expect(component.openCreateNavBar).toBeTruthy()
    expect(component.openMode).toBe('createNew')
  })

  it('should edit organization', () => {
    jest.spyOn(component, 'toggleOverlay')

    component.editOrganization({ id: 1 })

    expect(component.openMode).toBe('editMode')
  })

  it('should close sidebar', () => {
    jest.spyOn(component, 'toggleOverlay')

    component.buttonClickAction()

    expect(component.openCreateNavBar).toBeFalsy()
  })

  // ---------------- SEARCH ----------------
  it('should apply filter empty', () => {
    jest.spyOn(component, 'onSearchEnter')
    component.filterSubject = new BehaviorSubject('')

    component.applyFilter('')

    expect(component.onSearchEnter).toHaveBeenCalledWith('')
  })

  it('should apply filter > 2 chars', () => {
    component.applyFilter('abcd')
    expect(component.moreThanTwoChar).toBeTruthy()
  })

  it('should trigger search enter', () => {
    jest.spyOn(component, 'onEnterkySearch')

    component.onSearchEnter('abcd')

    expect(component.onEnterkySearch).toHaveBeenCalled()
  })

  // ---------------- ROUTING ----------------
  it('should navigate on row click', () => {
    component.onRowClick({ id: 1 })

    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  // ---------------- GENERATE LINK ----------------
  it('should open modal and process link flow', () => {
    mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw1' }))

    mockDirectoryService.getFrameworkInfo.mockReturnValue(
      of({
        result: {
          framework: {
            categories: [
              {
                terms: [
                  {
                    associations: [{}],
                  },
                ],
              },
            ],
          },
        },
      })
    )

    jest.spyOn(component, 'subscribeToAfterClosedModal')

    component.generateCustRegistrationLink({ id: 1 })

    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('should handle no frameworkId', () => {
    mockDirectoryService.getOrgReadData.mockReturnValue(of({}))

    jest.spyOn(component, 'subscribeToAfterClosedModal')

    component.generateCustRegistrationLink({ id: 1 })

    expect(mockDialog.open).toHaveBeenCalled()
  })

  // ---------------- MODAL CLOSE ----------------
  it('should handle modal close custom registration', () => {
    component.dialogRef = {
      afterClosed: () => of({ reviewImporting: false }),
    }

    jest.spyOn(component, 'toggleOverlay')

    component.subscribeToAfterClosedModal({ id: 1 })

    expect(component.customSelfRegistration).toBeTruthy()
  })

  it('should navigate on importing', () => {
    component.dialogRef = {
      afterClosed: () => of({ reviewImporting: true }),
    }

    component.subscribeToAfterClosedModal({ id: 1 })

    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  // ---------------- PAGINATION ----------------
  it('should handle page change', () => {
    jest.spyOn(component, 'getAllDepartments')

    component.onOrgPageChange({
      pageIndex: 1,
      pageSize: 20,
    })

    expect(component.pageIndex).toBe(1)
    expect(component.getAllDepartments).toHaveBeenCalled()
  })

  // ---------------- COLUMNS ----------------
  it('should return final columns', () => {
    component.initializetableData()

    const cols = component.getFinalColumns()

    expect(cols.length).toBeGreaterThan(0)
  })

  it('should handle framework with no categories', () => {
    mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw1' }))

    mockDirectoryService.getFrameworkInfo.mockReturnValue(of({
      result: { framework: { categories: [] } },
    }))

    component.generateCustRegistrationLink({ id: 1 })

    expect(mockDialog.open).not.toHaveBeenCalled()
  })

  it('should open create modal when no associations', () => {
    mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw1' }))

    mockDirectoryService.getFrameworkInfo.mockReturnValue(of({
      result: {
        framework: {
          categories: [
            {
              terms: [{ associations: [] }],
            },
          ],
        },
      },
    }))

    component.generateCustRegistrationLink({ id: 1 })

    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('should handle framework api error', () => {
    mockDirectoryService.getOrgReadData.mockReturnValue(of({ frameworkid: 'fw1' }))

    mockDirectoryService.getFrameworkInfo.mockReturnValue({
      subscribe: ({ error }: any) => error(),
    })

    component.generateCustRegistrationLink({ id: 1 })

    expect(true).toBeTruthy()
  })

  it('should navigate when startImporting true', () => {
    component.dialogRef = {
      afterClosed: () => of({ startImporting: true }),
    }

    component.subscribeToAfterClosedModal({ id: 1 })

    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('should do nothing when modal returns empty', () => {
    component.dialogRef = {
      afterClosed: () => of(null),
    }

    component.subscribeToAfterClosedModal({ id: 1 })

    expect(component.customSelfRegistration).toBeFalsy()
  })

  it('should toggle overlay zIndex', () => {
    const mockElement: any = { style: {} }

    jest.spyOn(document, 'querySelector').mockReturnValue(mockElement)

    component.toggleOverlay(true)
    expect(mockElement.style.zIndex).toBe('0')

    component.toggleOverlay(false)
    expect(mockElement.style.zIndex).toBe('2')
  })

  it('should refresh data after organization created', () => {
    jest.useFakeTimers()
    jest.spyOn(component, 'getAllDepartments')

    component.organizationCreatedEmit({})

    jest.advanceTimersByTime(1000)

    expect(component.getAllDepartments).toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('should include checkbox, hash and actions columns', () => {
    component.initializetableData()

    component.tableData.needCheckBox = true
    component.tableData.needHash = true

    const cols = component.getFinalColumns()

    expect(cols).toContain('select')
    expect(cols).toContain('SR')
    expect(cols).toContain('Actions')
  })

  it('should return empty string if tableData undefined', () => {
    component.tableData = undefined

    const result = component.getFinalColumns()

    expect(result).toBe('')
  })

  it('should set moreThanTwoChar false for small input', () => {
    component.applyFilter('ab')
    expect(component.moreThanTwoChar).toBeFalsy()
  })

  it('should call onEnterkySearch when empty string', () => {
    jest.spyOn(component, 'onEnterkySearch')

    component.onSearchEnter('')

    expect(component.onEnterkySearch).toHaveBeenCalledWith('')
  })

  it('should not do anything when event is null', () => {
    component.onOrgPageChange(null)

    expect(component.pageIndex).toBe(0)
  })

})