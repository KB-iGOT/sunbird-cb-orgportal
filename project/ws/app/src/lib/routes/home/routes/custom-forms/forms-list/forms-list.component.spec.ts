import { FormControl } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { of, throwError } from 'rxjs'
import { FormsListComponent } from './forms-list.component'
import { CustomFieldsService } from '../../../../users/custom-fields.service'
import { ReportsVideoComponent } from '../../reports-video/reports-video.component'
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component'

// Mock environment
jest.mock('../../../../../../../../../../src/environments/environment', () => ({
  environment: {
    karmYogiPath: 'http://test.com'
  }
}))

describe('FormsListComponent', () => {
  let component: FormsListComponent
  let mockCustomFieldsService: jest.Mocked<CustomFieldsService>
  let mockActivatedRoute: any
  let mockMatSnackBar: jest.Mocked<MatSnackBar>
  let mockMatDialog: jest.Mocked<MatDialog>

  const mockSearchResults = [
    {
      name: 'Test Field 1',
      attributeName: 'testAttr1',
      createdOn: '2023-01-01',
      isMandatory: true,
      customFieldId: 'field1',
      customFieldData: [
        {
          fieldAttribute: 'state',
          fieldValue: 'California',
          fieldValues: [
            {
              fieldAttribute: 'city',
              fieldValue: 'Los Angeles',
              fieldValues: []
            }
          ]
        }
      ],
      isEnabled: true,
      validation: '^[a-zA-Z]+$',
      attributeMaxLength: '50',
      type: 'masterList'
    },
    {
      name: 'Test Field 2',
      attributeName: 'testAttr2',
      createdOn: '2023-01-02',
      isMandatory: false,
      customFieldId: 'field2',
      customFieldData: [],
      isEnabled: false,
      validation: null,
      attributeMaxLength: null,
      type: 'text'
    }
  ]

  beforeEach(() => {
    // Mock services
    mockCustomFieldsService = {
      getCustomFields: jest.fn(),
      readOrgData: jest.fn(),
      updateCustomFieldStatus: jest.fn(),
      deleteCustomField: jest.fn(),
      updatePopup: jest.fn()
    } as any

    mockActivatedRoute = {
      snapshot: {
        data: {
          configService: {
            userProfile: {
              rootOrgId: 'org123'
            }
          }
        }
      }
    }

    mockMatSnackBar = {
      open: jest.fn()
    } as any

    mockMatDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    } as any

    component = new FormsListComponent(
      mockCustomFieldsService,
      mockActivatedRoute,
      mockMatSnackBar,
      mockMatDialog
    )

    // Mock MatTableDataSource
    component.dataSource = {
      data: [],
      paginator: null,
      sort: null
    }

    // Mock ViewChild elements
    component.paginator = {
      firstPage: jest.fn()
    } as any

    component.sort = {} as any
  })

  describe('Constructor', () => {
    it('should initialize component with correct values', () => {
      expect(component.rootOrgId).toBe('org123')
      expect(component.dataSource).toBeDefined()
      expect(component.searchControl).toBeInstanceOf(FormControl)
      expect(component.pageSizeOptions).toEqual([10, 30, 40])
      expect(component.pageSize).toBe(10)
      expect(component.pageNumber).toBe(0)
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => { })
      jest.spyOn(component, 'getOrgDetails').mockImplementation(() => { })
    })

    it('should initialize tableData with correct structure', () => {
      component.ngOnInit()

      expect(component.tableData).toEqual({
        columns: [
          { displayName: 'Field Name', key: 'fieldName' },
          { displayName: 'Field Attribute', key: 'fieldAttribute' },
          { displayName: 'Created on', key: 'createdOn' },
          { displayName: 'Mandatory', key: 'isMandatory' },
          { displayName: 'Enabled', key: 'isEnabled' },
          { displayName: 'Actions', key: 'actions' },
          { displayName: 'Preview', key: 'preview' }
        ],
        needCheckBox: false,
        needHash: false,
        needUserMenus: false,
        sortColumn: '',
        sortState: 'asc'
      })
    })

    it('should call loadData and getOrgDetails', () => {
      component.ngOnInit()

      expect(component.loadData).toHaveBeenCalled()
      expect(component.getOrgDetails).toHaveBeenCalled()
    })
  })

  describe('getOrgDetails', () => {
    it('should set canEnable to true when popup is enabled', () => {
      const mockResponse = {
        result: {
          response: {
            customfieldsdata: {
              isPopupEnabled: true
            }
          }
        }
      }
      mockCustomFieldsService.readOrgData.mockReturnValue(of(mockResponse))

      component.getOrgDetails()

      expect(mockCustomFieldsService.readOrgData).toHaveBeenCalledWith({
        request: { organisationId: 'org123' }
      })
      expect(component.canEnable).toBe(true)
    })

    it('should set canEnable to false when popup is disabled', () => {
      const mockResponse = {
        result: {
          response: {
            customfieldsdata: {
              isPopupEnabled: false
            }
          }
        }
      }
      mockCustomFieldsService.readOrgData.mockReturnValue(of(mockResponse))

      component.getOrgDetails()

      expect(component.canEnable).toBe(false)
    })

    it('should handle error and log it', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCustomFieldsService.readOrgData.mockReturnValue(throwError('API Error'))

      component.getOrgDetails()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching organization details', 'API Error')
      consoleSpy.mockRestore()
    })
  })

  describe('loadData', () => {
    beforeEach(() => {
      jest.spyOn(component, 'initializeDropdowns').mockImplementation(() => { })
    })

    it('should load data successfully and process search results', () => {
      const mockResponse = {
        result: {
          searchResults: {
            data: mockSearchResults,
            totalCount: 2
          }
        }
      }
      mockCustomFieldsService.getCustomFields.mockReturnValue(of(mockResponse))

      component.loadData()

      expect(component.isLoading).toBe(false)
      expect(component.data).toHaveLength(2)
      expect(component.length).toBe(2)
      expect(component.enabledFileds).toEqual(['field1'])
      expect(component.initializeDropdowns).toHaveBeenCalled()
    })

    it('should handle empty search results', () => {
      const mockResponse = {
        result: {
          searchResults: {
            data: [],
            totalCount: 0
          }
        }
      }
      mockCustomFieldsService.getCustomFields.mockReturnValue(of(mockResponse))

      component.loadData()

      expect(component.data).toEqual([])
      expect(component.length).toBe(0)
      expect(component.enabledFileds).toEqual([])
    })

    it('should handle API error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCustomFieldsService.getCustomFields.mockReturnValue(throwError('API Error'))

      component.loadData()

      expect(component.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('API Error')
      consoleSpy.mockRestore()
    })

    it('should call with correct payload', () => {
      component.pageNumber = 1
      component.pageSize = 20
      mockCustomFieldsService.getCustomFields.mockReturnValue(of({ result: { searchResults: { data: [], totalCount: 0 } } }))

      component.loadData()

      expect(mockCustomFieldsService.getCustomFields).toHaveBeenCalledWith({
        filterCriteriaMap: { organisationId: 'org123' },
        requestedFields: [],
        pageNumber: 1,
        pageSize: 20,
        orderDirection: "DESC",
        orderBy: 'createdOn',
        facets: []
      })
    })
  })

  describe('ngOnChanges', () => {
    it('should update dataSource and call paginator.firstPage', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockChanges = {
        data: {
          currentValue: [{ test: 'data' }]
        }
      }

      component.ngOnChanges(mockChanges as any)

      expect(consoleSpy).toHaveBeenCalledWith('data', mockChanges)
      expect(component.dataSource.data).toEqual([{ test: 'data' }])
      expect(component.length).toBe(1)
      expect(component.paginator.firstPage).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle when paginator is null', () => {
      component.paginator = null as any
      const mockChanges = {
        data: {
          currentValue: [{ test: 'data' }]
        }
      }

      expect(() => component.ngOnChanges(mockChanges as any)).not.toThrow()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should set up dataSource with data, paginator and sort', () => {
      component.data = [{ test: 'data' }]

      component.ngAfterViewInit()

      expect(component.dataSource.data).toEqual([{ test: 'data' }])
      expect(component.length).toBe(1)
      expect(component.dataSource.paginator).toBe(component.paginator)
      expect(component.dataSource.sort).toBe(component.sort)
    })

    it('should handle when data is empty', () => {
      component.data = []

      component.ngAfterViewInit()

      expect(component.dataSource.data).toEqual([])
      expect(component.length).toBe(0)
    })
  })

  describe('openVideoPopup', () => {
    it('should open video popup with correct configuration', () => {
      component.openVideoPopup()

      expect(mockMatDialog.open).toHaveBeenCalledWith(ReportsVideoComponent, {
        data: {
          videoLink: 'http://test.com/content-store/Karmayogi_Bharat_MDO.mp4'
        },
        disableClose: true,
        width: '50%',
        height: '55%',
        panelClass: 'overflow-visable'
      })
    })
  })

  describe('onToggleChange', () => {
    beforeEach(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => { })
    })

    it('should successfully update field status to enabled', () => {
      const mockEvent = { checked: true }
      const mockElement = { customFieldId: 'field1' }
      const mockResponse = { result: true, responseCode: 'OK' }
      mockCustomFieldsService.updateCustomFieldStatus.mockReturnValue(of(mockResponse))

      component.onToggleChange(mockEvent, mockElement)

      expect(mockCustomFieldsService.updateCustomFieldStatus).toHaveBeenCalledWith({
        customFieldId: 'field1',
        isEnabled: true
      })
      expect(component.loadData).toHaveBeenCalled()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Field is enabled successfully!')
    })

    it('should successfully update field status to disabled', () => {
      const mockEvent = { checked: false }
      const mockElement = { customFieldId: 'field1' }
      const mockResponse = { result: true, responseCode: 'OK' }
      mockCustomFieldsService.updateCustomFieldStatus.mockReturnValue(of(mockResponse))

      component.onToggleChange(mockEvent, mockElement)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Field is disabled successfully!')
    })

    it('should handle API error response', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockEvent = { checked: true }
      const mockElement = { customFieldId: 'field1' }
      const mockResponse = { result: false, responseCode: 'ERROR' }
      mockCustomFieldsService.updateCustomFieldStatus.mockReturnValue(of(mockResponse))

      component.onToggleChange(mockEvent, mockElement)

      expect(component.loadData).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Error while updating custom field status')
      consoleSpy.mockRestore()
    })

    it('should handle network error', () => {
      const mockEvent = { checked: true }
      const mockElement = { customFieldId: 'field1' }
      const mockError = {
        error: {
          params: {
            err: 'Network error'
          }
        }
      }
      mockCustomFieldsService.updateCustomFieldStatus.mockReturnValue(throwError(mockError))

      component.onToggleChange(mockEvent, mockElement)

      expect(component.loadData).toHaveBeenCalled()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Network error')
    })
  })

  describe('getFinalColumns', () => {
    beforeEach(() => {
      component.tableData = {
        columns: [
          { key: 'col1' },
          { key: 'col2' }
        ],
        needCheckBox: false,
        needHash: false,
        needUserMenus: false,
        actions: []
      }
    })

    it('should return basic columns', () => {
      const result = component.getFinalColumns()
      expect(result).toEqual(['col1', 'col2'])
    })

    it('should add select column when needCheckBox is true', () => {
      component.tableData.needCheckBox = true
      const result = component.getFinalColumns()
      expect(result).toEqual(['select', 'col1', 'col2'])
    })

    it('should add SR column when needHash is true', () => {
      component.tableData.needHash = true
      const result = component.getFinalColumns()
      expect(result).toEqual(['SR', 'col1', 'col2'])
    })

    it('should add Actions column when actions exist', () => {
      component.tableData.actions = ['edit', 'delete']
      const result = component.getFinalColumns()
      expect(result).toEqual(['col1', 'col2', 'Actions'])
    })

    it('should add Menu column when needUserMenus is true', () => {
      component.tableData.needUserMenus = true
      const result = component.getFinalColumns()
      expect(result).toEqual(['col1', 'col2', 'Menu'])
    })

    it('should return empty string when tableData is undefined', () => {
      component.tableData = undefined
      const result = component.getFinalColumns()
      expect(result).toBe('')
    })

    it('should handle all options together', () => {
      component.tableData.needCheckBox = true
      component.tableData.needHash = true
      component.tableData.actions = ['edit']
      component.tableData.needUserMenus = true
      const result = component.getFinalColumns()
      expect(result).toEqual(['select', 'SR', 'col1', 'col2', 'Actions', 'Menu'])
    })
  })

  describe('redirectToNewForm', () => {
    it('should set showCreateForm to true and clear customFieldObject', () => {
      component.redirectToNewForm()

      expect(component.showCreateForm).toBe(true)
      expect(component.customFieldObject).toBe('')
    })
  })

  describe('closeForm', () => {
    beforeEach(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => { })
    })

    it('should close form and reload data when event is truthy', () => {
      component.closeForm(true)

      expect(component.customFieldObject).toBe('')
      expect(component.loadData).toHaveBeenCalled()
      expect(component.showCreateForm).toBe(false)
    })

    it('should only close form when event is falsy', () => {
      component.closeForm(false)

      expect(component.loadData).not.toHaveBeenCalled()
      expect(component.showCreateForm).toBe(false)
    })
  })

  describe('deleteHandler', () => {
    beforeEach(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => { })
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should successfully delete field when confirmed', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockRowData = { customFieldId: 'field1' }
      const mockResponse = { result: { status: 'deleted' } }
      mockCustomFieldsService.deleteCustomField.mockReturnValue(of(mockResponse))

      component.deleteHandler(mockRowData)

      expect(consoleSpy).toHaveBeenCalledWith(mockRowData)
      expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmDeleteComponent, {
        width: '400px',
        backdropClass: 'backdropBackground'
      })
      expect(mockCustomFieldsService.deleteCustomField).toHaveBeenCalledWith('field1')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Field is deleted successfully!')

      jest.advanceTimersByTime(500)
      expect(component.loadData).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle delete error response', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockRowData = { customFieldId: 'field1' }
      const mockResponse = { result: { status: 'error' } }
      mockCustomFieldsService.deleteCustomField.mockReturnValue(of(mockResponse))

      component.deleteHandler(mockRowData)

      expect(consoleSpy).toHaveBeenCalledWith('Error while deleting custom field')
      consoleSpy.mockRestore()
    })

    it('should handle delete network error', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockRowData = { customFieldId: 'field1' }
      mockCustomFieldsService.deleteCustomField.mockReturnValue(throwError('Network error'))

      component.deleteHandler(mockRowData)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('Network error')
      consoleSpy.mockRestore()
    })

    it('should not delete when dialog is cancelled', () => {
      mockMatDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false))
      } as any)

      const mockRowData = { customFieldId: 'field1' }
      component.deleteHandler(mockRowData)

      expect(mockCustomFieldsService.deleteCustomField).not.toHaveBeenCalled()
    })
  })

  describe('editHandler', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should prepare form for editing', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockRowData = { customFieldId: 'field1', name: 'Test Field' }

      component.editHandler(mockRowData)

      expect(consoleSpy).toHaveBeenCalledWith(mockRowData)
      expect(component.showCreateForm).toBe(false)

      jest.advanceTimersByTime(500)

      expect(component.showCreateForm).toBe(true)
      expect(component.customFieldObject).toBe(mockRowData)
      consoleSpy.mockRestore()
    })
  })

  describe('onPageChange', () => {
    beforeEach(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => { })
    })

    it('should update pagination parameters and reload data', () => {
      const mockEvent = {
        pageIndex: 2,
        pageSize: 30
      }

      component.onPageChange(mockEvent)

      expect(component.pageNumber).toBe(2)
      expect(component.pageSize).toBe(30)
      expect(component.loadData).toHaveBeenCalled()
    })
  })

  describe('getSelectedOptions', () => {
    it('should return existing options for rowKey', () => {
      component.selectedOptionsMap['row1'] = ['option1', 'option2']

      const result = component.getSelectedOptions('row1')

      expect(result).toEqual(['option1', 'option2'])
    })

    it('should create and return empty array for new rowKey', () => {
      const result = component.getSelectedOptions('newRow')

      expect(result).toEqual([])
      expect(component.selectedOptionsMap['newRow']).toEqual([])
    })
  })

  describe('getSelectedOptionsRef', () => {
    it('should return existing options reference for rowKey', () => {
      component.selectedOptionsMap['row1'] = ['option1']

      const result = component.getSelectedOptionsRef('row1')

      expect(result).toEqual(['option1'])
      expect(result).toBe(component.selectedOptionsMap['row1'])
    })

    it('should create and return empty array reference for new rowKey', () => {
      const result = component.getSelectedOptionsRef('newRow')

      expect(result).toEqual([])
      expect(component.selectedOptionsMap['newRow']).toEqual([])
    })
  })

  describe('onDropdownChange', () => {
    beforeEach(() => {
      component.dropdownLevels['row1'] = ['state', 'city', 'area']
      component.selectedOptionsMap['row1'] = [null, null, null]
      jest.spyOn(component, 'populateParentFields').mockImplementation(() => { })
      jest.spyOn(component, 'populateChildFields').mockImplementation(() => { })
    })

    it('should update selection and call populate methods when value is not null', () => {
      component.onDropdownChange(1, 'row1', 'Los Angeles')

      expect(component.selectedOptionsMap['row1'][1]).toBe('Los Angeles')
      expect(component.populateParentFields).toHaveBeenCalledWith('row1', 1, 'Los Angeles', component.selectedOptionsMap['row1'])
      expect(component.populateChildFields).toHaveBeenCalledWith('row1', 1, 'Los Angeles', component.selectedOptionsMap['row1'])
    })

    it('should clear child selections when value is null', () => {
      component.selectedOptionsMap['row1'] = ['California', 'Los Angeles', 'Hollywood']

      component.onDropdownChange(1, 'row1', null)

      expect(component.selectedOptionsMap['row1'][1]).toBeNull()
      expect(component.selectedOptionsMap['row1'][2]).toBeNull()
    })
  })

  describe('populateParentFields', () => {
    beforeEach(() => {
      component.dropdownLevels['row1'] = ['state', 'city', 'area']
      component.dropdownRelations['row1'] = {
        childToParent: {
          city: {
            'Los Angeles': {
              state: 'California'
            }
          }
        },
        parentToChildren: {}
      }
      jest.spyOn(component, 'populateParentFields').mockImplementation((rowKey, level, value, selections) => {
        // Call the real implementation for testing
        FormsListComponent.prototype.populateParentFields.call(component, rowKey, level, value, selections)
      })
    })

    it('should populate parent fields based on child selection', () => {
      const selections = [null, 'Los Angeles', null]

      component.populateParentFields('row1', 1, 'Los Angeles', selections)

      expect(selections[0]).toBe('California')
    })

    it('should return early when fieldType is not found', () => {
      component.dropdownLevels['row1'] = []
      const selections = [null, null, null]

      component.populateParentFields('row1', 1, 'Los Angeles', selections)

      expect(selections[0]).toBeNull()
    })
  })

  describe('populateChildFields', () => {
    beforeEach(() => {
      component.dropdownLevels['row1'] = ['state', 'city', 'area']
      component.dropdownRelations['row1'] = {
        childToParent: {},
        parentToChildren: {
          state: {
            'California': {
              city: ['Los Angeles', 'San Francisco']
            }
          }
        }
      }
    })

    it('should clear invalid child selections', () => {
      const selections = ['California', 'New York', 'Manhattan'] // New York is not valid for California

      component.populateChildFields('row1', 0, 'California', selections)

      expect(selections[1]).toBeNull()
      expect(selections[2]).toBeNull()
    })

    it('should keep valid child selections', () => {
      const selections = ['California', 'Los Angeles', null]

      component.populateChildFields('row1', 0, 'California', selections)

      expect(selections[1]).toBe('Los Angeles') // Should remain as it's valid
    })
  })

  describe('getFilteredOptions', () => {
    beforeEach(() => {
      component.dropdownLevels['row1'] = ['state', 'city']
      component.dynamicDropdownMap['row1'] = {
        state: ['California', 'New York'],
        city: ['Los Angeles', 'San Francisco', 'NYC', 'Albany']
      }
      component.dropdownRelations['row1'] = {
        parentToChildren: {
          state: {
            'California': {
              city: ['Los Angeles', 'San Francisco']
            },
            'New York': {
              city: ['NYC', 'Albany']
            }
          }
        },
        childToParent: {}
      }
      component.selectedOptionsMap['row1'] = ['California', null]
    })

    it('should return filtered options based on parent selection', () => {
      const result = component.getFilteredOptions('row1', 1)

      expect(result).toEqual(['Los Angeles', 'San Francisco'])
    })

    it('should return all options when no parent is selected', () => {
      component.selectedOptionsMap['row1'] = [null, null]

      const result = component.getFilteredOptions('row1', 1)

      expect(result).toEqual(['Los Angeles', 'San Francisco', 'NYC', 'Albany'])
    })

    it('should return empty array for invalid level', () => {
      const result = component.getFilteredOptions('row1', -1)

      expect(result).toEqual([])
    })

    it('should return empty array for invalid fieldType', () => {
      const result = component.getFilteredOptions('row1', 5)

      expect(result).toEqual([])
    })
  })

  describe('preSelectDropdownValues', () => {
    it('should create and set initial selections', () => {
      const selections = ['California', 'Los Angeles']

      component.preSelectDropdownValues('row1', selections)

      expect(component.selectedOptionsMap['row1']).toEqual(['California', 'Los Angeles'])
    })

    it('should overwrite existing selections', () => {
      component.selectedOptionsMap['row1'] = ['Old Value']
      const selections = ['New Value', 'Another Value']

      component.preSelectDropdownValues('row1', selections)

      expect(component.selectedOptionsMap['row1']).toEqual(['New Value', 'Another Value'])
    })
  })

  describe('initializeDropdowns', () => {
    beforeEach(() => {
      jest.spyOn(component, 'processHierarchicalData').mockImplementation(() => { })
    })

    it('should initialize dropdown structures', () => {
      component.dataSource = {
        data: [
          {
            customFieldData: [{ fieldAttribute: 'state', fieldValue: 'California' }],
            type: 'masterList'
          }
        ]
      }

      component.initializeDropdowns()

      expect(component.selectedOptionsMap).toEqual({})
      expect(component.dynamicDropdownMap).toEqual({})
      expect(component.dropdownRelations).toEqual({})
      expect(component.dropdownLevels).toEqual({})
    })

    it('should skip rows without customFieldData', () => {
      component.dataSource = {
        data: [
          { customFieldData: null, type: 'masterList' },
          { customFieldData: [], type: 'masterList' },
          { customFieldData: [{}], type: 'text' }
        ]
      }

      component.initializeDropdowns()

      expect(component.processHierarchicalData).not.toHaveBeenCalled()
    })

    it('should return early when dataSource is empty', () => {
      component.dataSource = { data: [] }

      component.initializeDropdowns()

      expect(component.processHierarchicalData).not.toHaveBeenCalled()
    })
  })

  describe('processHierarchicalData', () => {
    it('should process hierarchical data correctly', () => {
      const data = [
        {
          fieldAttribute: 'state',
          fieldValue: 'California',
          fieldValues: [
            {
              fieldAttribute: 'city',
              fieldValue: 'Los Angeles',
              fieldValues: []
            },
            {
              fieldAttribute: 'city',
              fieldValue: 'San Francisco',
              fieldValues: []
            }
          ]
        }
      ]

      component.processHierarchicalData(data, 'row1')

      expect(component.dynamicDropdownMap['row1']).toEqual({
        state: ['California'],
        city: ['Los Angeles', 'San Francisco']
      })
      expect(component.dropdownLevels['row1']).toEqual(['state', 'city'])
      expect(component.dropdownRelations['row1'].parentToChildren.state.California.city)
        .toEqual(['Los Angeles', 'San Francisco'])
    })

    it('should handle empty or invalid data', () => {
      component.processHierarchicalData([], 'row1')
      expect(component.dynamicDropdownMap['row1']).toBeUndefined()

      component.processHierarchicalData(null as any, 'row1')
      expect(component.dynamicDropdownMap['row1']).toBeUndefined()
    })

    it('should skip items without fieldAttribute', () => {
      const data = [
        {
          fieldAttribute: null,
          fieldValue: 'California',
          fieldValues: []
        },
        {
          fieldAttribute: 'state',
          fieldValue: 'California',
          fieldValues: []
        }
      ]

      component.processHierarchicalData(data, 'row1')

      expect(component.dynamicDropdownMap['row1']).toEqual({
        state: ['California']
      })
    })
  })

  describe('getAllOptions', () => {
    beforeEach(() => {
      component.dropdownLevels['row1'] = ['state', 'city']
      component.dynamicDropdownMap['row1'] = {
        state: ['California', 'New York'],
        city: ['Los Angeles', 'San Francisco', 'NYC']
      }
    })

    it('should return all options for valid level', () => {
      const result = component.getAllOptions('row1', 0)
      expect(result).toEqual(['California', 'New York'])
    })

    it('should return empty array for invalid level', () => {
      const result = component.getAllOptions('row1', -1)
      expect(result).toEqual([])

      const result2 = component.getAllOptions('row1', 5)
      expect(result2).toEqual([])
    })

    it('should return empty array when fieldType not found', () => {
      component.dynamicDropdownMap['row1'] = {}
      const result = component.getAllOptions('row1', 0)
      expect(result).toEqual([])
    })
  })

  describe('getFormControl', () => {
    it('should create FormControl with required validator', () => {
      const element = {
        customFieldId: 'field1',
        isMandatory: true,
        validation: null,
        attributeMaxLength: null
      }

      const control = component.getFormControl(element)

      expect(control).toBeInstanceOf(FormControl)
      expect(control.hasError('required')).toBe(true)
    })

    it('should create FormControl with pattern validator', () => {
      const element = {
        customFieldId: 'field2',
        isMandatory: false,
        validation: '^[a-zA-Z]+',
        attributeMaxLength: null
      }

      const control = component.getFormControl(element)
      control.setValue('123')

      expect(control.hasError('pattern')).toBe(true)
    })

    it('should create FormControl with maxLength validator', () => {
      const element = {
        customFieldId: 'field3',
        isMandatory: false,
        validation: null,
        attributeMaxLength: '5'
      }

      const control = component.getFormControl(element)
      control.setValue('123456')

      expect(control.hasError('maxlength')).toBe(true)
    })

    it('should return existing FormControl for same element', () => {
      const element = {
        customFieldId: 'field1',
        isMandatory: false,
        validation: null,
        attributeMaxLength: null
      }

      const control1 = component.getFormControl(element)
      const control2 = component.getFormControl(element)

      expect(control1).toBe(control2)
    })

    it('should handle invalid maxLength', () => {
      const element = {
        customFieldId: 'field4',
        isMandatory: false,
        validation: null,
        attributeMaxLength: 'invalid'
      }

      const control = component.getFormControl(element)
      control.setValue('long text')

      expect(control.hasError('maxlength')).toBe(false)
    })

    it('should handle zero maxLength', () => {
      const element = {
        customFieldId: 'field5',
        isMandatory: false,
        validation: null,
        attributeMaxLength: '0'
      }

      const control = component.getFormControl(element)
      control.setValue('text')

      expect(control.hasError('maxlength')).toBe(false)
    })

    it('should use attributeName as key when customFieldId is missing', () => {
      const element = {
        attributeName: 'testAttr',
        isMandatory: false,
        validation: null,
        attributeMaxLength: null
      }

      const control = component.getFormControl(element)

      expect(component.inputFormControls['testAttr']).toBe(control)
    })
  })

  describe('onToggle', () => {
    beforeEach(() => {
      jest.spyOn(component, 'sendCall').mockImplementation(() => { })
    })

    it('should call sendCall when enabled and fields are available', () => {
      component.data = [
        { isEnabled: true, customFieldId: 'field1' },
        { isEnabled: false, customFieldId: 'field2' }
      ]
      const mockEvent = { checked: true }

      component.onToggle(mockEvent)

      expect(component.sendCall).toHaveBeenCalledWith(mockEvent)
    })

    it('should show error and prevent toggle when no enabled fields', () => {
      component.data = [
        { isEnabled: false, customFieldId: 'field1' },
        { isEnabled: false, customFieldId: 'field2' }
      ]
      const mockEvent = {
        checked: true,
        source: { checked: false }
      }

      component.onToggle(mockEvent)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please enable at least one field to enable popup')
      expect(mockEvent.source.checked).toBe(false)
      expect(component.canEnable).toBe(false)
      expect(component.sendCall).not.toHaveBeenCalled()
    })

    it('should call sendCall when disabling', () => {
      const mockEvent = { checked: false }

      component.onToggle(mockEvent)

      expect(component.sendCall).toHaveBeenCalledWith(mockEvent)
    })
  })

  describe('sendCall', () => {
    it('should successfully update popup status to enabled', () => {
      const mockEvent = { checked: true }
      const mockResponse = { result: true, responseCode: 'OK' }
      mockCustomFieldsService.updatePopup.mockReturnValue(of(mockResponse))

      component.sendCall(mockEvent)

      expect(mockCustomFieldsService.updatePopup).toHaveBeenCalledWith({
        isPopupEnabled: true,
        organisationId: 'org123'
      })
      expect(component.canEnable).toBe(true)
      expect(component.isLoading).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Popup is enabled successfully!')
    })

    it('should successfully update popup status to disabled', () => {
      const mockEvent = { checked: false }
      const mockResponse = { result: true, responseCode: 'OK' }
      mockCustomFieldsService.updatePopup.mockReturnValue(of(mockResponse))

      component.sendCall(mockEvent)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Popup is disabled successfully!')
      expect(component.canEnable).toBe(false)
    })

    it('should handle API error response', () => {
      const mockEvent = { checked: true }
      const mockResponse = { result: false, responseCode: 'ERROR' }
      mockCustomFieldsService.updatePopup.mockReturnValue(of(mockResponse))

      component.sendCall(mockEvent)

      expect(component.canEnable).toBe(false)
      expect(component.isLoading).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error while updating popup status')
    })

    it('should handle network error', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockEvent = { checked: true }
      const mockError = {
        error: {
          params: {
            err: 'Network error occurred'
          }
        }
      }
      mockCustomFieldsService.updatePopup.mockReturnValue(throwError(mockError))

      component.sendCall(mockEvent)

      expect(component.canEnable).toBe(false)
      expect(component.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('error', mockError)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Network error occurred')
      consoleSpy.mockRestore()
    })

    it('should handle error without specific message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockEvent = { checked: false }
      const mockError = { error: {} }
      mockCustomFieldsService.updatePopup.mockReturnValue(throwError(mockError))

      component.sendCall(mockEvent)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error while updating popup status')
      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases and Integration', () => {
    it('should handle complex dropdown hierarchy with multiple levels', () => {
      const complexData = [
        {
          fieldAttribute: 'country',
          fieldValue: 'USA',
          fieldValues: [
            {
              fieldAttribute: 'state',
              fieldValue: 'California',
              fieldValues: [
                {
                  fieldAttribute: 'city',
                  fieldValue: 'Los Angeles',
                  fieldValues: [
                    {
                      fieldAttribute: 'area',
                      fieldValue: 'Hollywood',
                      fieldValues: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]

      component.processHierarchicalData(complexData, 'row1')

      expect(component.dropdownLevels['row1']).toEqual(['country', 'state', 'city', 'area'])
      expect(component.dynamicDropdownMap['row1'].country).toEqual(['USA'])
      expect(component.dynamicDropdownMap['row1'].area).toEqual(['Hollywood'])
    })

    it('should handle dataSource without data property', () => {
      component.dataSource = null as any

      expect(() => component.initializeDropdowns()).not.toThrow()
    })

    it('should handle missing lodash get paths gracefully', () => {
      const mockResponse = {
        result: {
          searchResults: {}
        }
      }
      mockCustomFieldsService.getCustomFields.mockReturnValue(of(mockResponse))

      component.loadData()

      expect(component.searchResults).toBeUndefined()
      expect(component.length).toBeUndefined()
    })

    it('should handle multiple validator combinations', () => {
      const element = {
        customFieldId: 'complexField',
        isMandatory: true,
        validation: '^[A-Z][a-z]+',
        attributeMaxLength: '10'
      }

      const control = component.getFormControl(element)
      control.setValue('')

      expect(control.hasError('required')).toBe(true)

      control.setValue('invalidpattern123')
      expect(control.hasError('pattern')).toBe(true)
      expect(control.hasError('maxlength')).toBe(true)

      control.setValue('Valid')
      expect(control.valid).toBe(true)
    })
  })

  describe('Component State Management', () => {
    it('should maintain consistent state during multiple operations', () => {
      // Initial state
      expect(component.isLoading).toBe(false)
      expect(component.showCreateForm).toBe(false)
      expect(component.data).toEqual([])

      // Simulate form creation
      component.redirectToNewForm()
      expect(component.showCreateForm).toBe(true)
      expect(component.customFieldObject).toBe('')

      // Simulate form closing with save
      jest.spyOn(component, 'loadData').mockImplementation(() => { })
      component.closeForm(true)
      expect(component.showCreateForm).toBe(false)
      expect(component.customFieldObject).toBe('')
      expect(component.loadData).toHaveBeenCalled()
    })

    it('should handle pagination state correctly', () => {
      component.pageNumber = 0
      component.pageSize = 10

      const mockEvent = { pageIndex: 3, pageSize: 30 }
      jest.spyOn(component, 'loadData').mockImplementation(() => { })

      component.onPageChange(mockEvent)

      expect(component.pageNumber).toBe(3)
      expect(component.pageSize).toBe(30)
    })
  })
})