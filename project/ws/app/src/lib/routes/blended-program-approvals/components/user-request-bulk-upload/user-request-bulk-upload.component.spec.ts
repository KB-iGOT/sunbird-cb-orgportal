import { UserRequestBulkUploadComponent } from './user-request-bulk-upload.component'
import { ContentBatchService } from '../../services/content-batch.service'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { DialogConfirmComponent } from './../dialog-confirm/dialog-confirm.component'
import { SnackbarComponent } from '../snackbar/snackbar.component'
import { of } from 'rxjs'

describe('UserRequestBulkUploadComponent', () => {
  let component: UserRequestBulkUploadComponent
  let mockContentService: jest.Mocked<ContentBatchService>
  let mockDialog: jest.Mocked<MatDialog>
  let mockSnackBar: jest.Mocked<MatSnackBar>
  let mockActivatedRoute: any

  beforeEach(() => {
    // Create mocks
    mockContentService = {
      downloadPendingRequestCSV: jest.fn(),
      approveRejectUser: jest.fn(),
      downloadFile: jest.fn()
    } as any

    mockDialog = {
      open: jest.fn()
    } as any

    mockSnackBar = {
      openFromComponent: jest.fn()
    } as any

    mockActivatedRoute = {
      parent: {
        snapshot: {
          data: {
            configService: {
              unMappedUser: { channel: 'test-channel' }
            }
          }
        }
      }
    }

    // Create component instance
    component = new UserRequestBulkUploadComponent(
      mockActivatedRoute,
      mockContentService,
      mockDialog,
      mockSnackBar
    )

    // Mock the successUserData EventEmitter
    component.successUserData = {
      emit: jest.fn()
    } as any
  })

  describe('ngOnInit', () => {
    it('should initialize user profile from route data', () => {
      component.ngOnInit()

      expect(component.userProfile).toEqual({ channel: 'test-channel' })
      expect(component.successUserData.emit).toHaveBeenCalledWith([])
    })

    it('should set collectionId when programData is provided', () => {
      component.programData = { identifier: 'test-id' }

      component.ngOnInit()

      expect(component.collectionId).toBe('test-id')
    })

    it('should handle missing route parent', () => {
      component = new UserRequestBulkUploadComponent(
        { parent: null } as any,
        mockContentService,
        mockDialog,
        mockSnackBar
      )

      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('getPendingRequests', () => {
    beforeEach(() => {
      component.batchData = { batchId: 'test-batch-id' }
      component.userProfile = { channel: 'test-channel' }
    })

    it('should download CSV file on successful response', () => {
      const mockCsvContent = 'email,userName,wfId\ntest@email.com,Test User,123'
      mockContentService.downloadPendingRequestCSV.mockReturnValue(of(mockCsvContent))

      // Mock DOM methods
      const mockBlob = {} as Blob
      const mockURL = 'blob:mock-url'
      const mockAnchor = {
        href: '',
        download: '',
        style: { display: '' },
        click: jest.fn(),
        remove: jest.fn()
      }

      global.Blob = jest.fn(() => mockBlob) as any
      global.URL.createObjectURL = jest.fn(() => mockURL)
      global.URL.revokeObjectURL = jest.fn()
      document.createElement = jest.fn(() => mockAnchor) as any
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()

      component.getPendingRequests()

      expect(mockContentService.downloadPendingRequestCSV).toHaveBeenCalledWith({
        serviceName: 'blendedprogram',
        applicationStatus: 'SEND_FOR_MDO_APPROVAL',
        applicationIds: ['test-batch-id'],
        deptName: 'test-channel'
      })
      expect(global.Blob).toHaveBeenCalledWith([mockCsvContent], { type: 'text/csv;charset=utf-8;' })
      expect(mockAnchor.click).toHaveBeenCalled()
    })
  })

  describe('onDrop', () => {
    let mockFile: File
    let mockFileReader: any

    beforeEach(() => {
      mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' })
      mockFileReader = {
        onload: null,
        readAsText: jest.fn(),
        result: 'email,userName\ntest@email.com,Test User'
      }

      global.FileReader = jest.fn(() => mockFileReader) as any
    })

    it('should process valid CSV file', () => {
      const mockInput = mockFile as any
      mockInput.name = 'test.csv'

      component.onDrop(mockInput)

      expect(component.fileUploading).toBe(true)
      expect(component.selectedFile).toBe(mockInput)
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockInput, 'UTF-8')
    })

    it('should show error for invalid file type', () => {
      const mockInput = { name: 'test.txt' } as any

      component.onDrop(mockInput)

      expect(component.fileUploading).toBe(false)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(SnackbarComponent, {
        data: {
          message: 'Unsupported File Format. Please upload a CSV file.',
          type: 'error'
        },
        duration: 3000,
        panelClass: 'course-error-snackbar'
      })
    })

    it('should handle missing file', () => {
      component.onDrop(null as any)

      expect(component.fileUploading).toBe(false)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalled()
    })
  })

  describe('onFileLoad', () => {
    let mockEvent: any

    beforeEach(() => {
      component.collectionId = 'test-collection'
      component.selectedFile = new File([''], 'test.csv')
      mockEvent = {
        target: {
          result: 'email,userName,wfId,userId,action\ntest@email.com,Test User,wf123,user123,approve'
        }
      }
    })

    it('should process valid CSV content', async () => {
      const mockFormData = new FormData()
      global.FormData = jest.fn(() => mockFormData) as any
      mockFormData.append = jest.fn()

      const mockResponse = 'email,userName,status\ntest@email.com,Test User,success'
      mockContentService.approveRejectUser.mockReturnValue({
        toPromise: () => Promise.resolve(mockResponse)
      } as any)

      await component.onFileLoad(mockEvent)

      expect(component.csvContent).toBe('email,userName,wfId,userId,action\ntest@email.com,Test User,wf123,user123,approve')
      expect(component.contacts).toHaveLength(1)
      expect(component.fileUploading).toBe(false)
    })

    it('should handle field mismatch error - wrong number of fields', async () => {
      mockEvent.target.result = 'field1,field2,field3,field4,field5,field6,field7\nvalue1,value2,value3,value4,value5,value6,value7'

      await component.onFileLoad(mockEvent)

      expect(component.fileUploading).toBe(false)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(SnackbarComponent, {
        data: {
          message: 'Field Mismatch. Please ensure your uploaded file matches the sample template provided.',
          type: 'error'
        },
        duration: 3000,
        panelClass: 'course-error-snackbar'
      })
    })

    it('should handle missing required fields', async () => {
      mockEvent.target.result = 'email,userName\ntest@email.com,Test User'

      await component.onFileLoad(mockEvent)

      expect(component.fileUploading).toBe(false)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(SnackbarComponent, {
        data: {
          message: 'Field Mismatch. Please ensure your uploaded file matches the sample template provided.',
          type: 'error'
        },
        duration: 3000,
        panelClass: 'course-error-snackbar'
      })
    })

    it('should handle more than 30 users', async () => {
      let csvContent = 'email,userName,wfId,userId,action\n'
      for (let i = 0; i < 31; i++) {
        csvContent += `user${i}@email.com,User${i},wf${i},user${i},approve\n`
      }
      mockEvent.target.result = csvContent

      await component.onFileLoad(mockEvent)

      expect(mockDialog.open).toHaveBeenCalledWith(DialogConfirmComponent, {
        data: {
          body: 'More than 30 users are not allowed',
          yes: 'Okay',
          no: 'Cancel'
        }
      })
      expect(component.fileUploading).toBe(false)
    })

    it('should validate email addresses', async () => {
      mockEvent.target.result = 'email,userName,wfId,userId,action\ninvalid-email,Test User,wf123,user123,approve'

      const mockFormData = new FormData()
      global.FormData = jest.fn(() => mockFormData) as any

      const mockResponse = 'email,status\ninvalid-email,error'
      mockContentService.approveRejectUser.mockReturnValue({
        toPromise: () => Promise.resolve(mockResponse)
      } as any)

      await component.onFileLoad(mockEvent)

      expect(component.contacts[0].status).toBe('Error')
      expect(component.contacts[0].userStatus).toBe(false)
    })
  })

  describe('callUserCheckApi', () => {
    it('should call service with email filter', async () => {
      const mockResponse = {
        result: {
          response: {
            count: 1,
            content: [{ userId: 'test-user', email: 'test@email.com' }]
          }
        }
      }

      mockContentService.approveRejectUser.mockReturnValue({
        toPromise: () => Promise.resolve(mockResponse)
      } as any)

      const result = await component.callUserCheckApi(['test@email.com'], 'primaryEmail')

      expect(mockContentService.approveRejectUser).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: { email: ['test@email.com'] }
          })
        }),
        component.collectionId
      )
      expect(result).toEqual(mockResponse.result.response)
    })

    it('should call service with phone filter', async () => {
      const mockResponse = {
        result: {
          response: {
            count: 1,
            content: [{ userId: 'test-user', phone: '1234567890' }]
          }
        }
      }

      mockContentService.approveRejectUser.mockReturnValue({
        toPromise: () => Promise.resolve(mockResponse)
      } as any)

      await component.callUserCheckApi(['1234567890'], 'phone')

      expect(mockContentService.approveRejectUser).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            filters: { phone: ['1234567890'] }
          })
        }),
        component.collectionId
      )
    })

    it('should handle API errors', async () => {
      mockContentService.approveRejectUser.mockReturnValue({
        toPromise: () => Promise.reject(new Error('API Error'))
      } as any)

      const result = await component.callUserCheckApi(['test@email.com'], 'primaryEmail')

      expect(result).toBeUndefined()
    })
  })

  describe('manageData', () => {
    beforeEach(() => {
      component.contacts = [
        {
          email: 'test@email.com',
          mobile: '1234567890',
          userStatus: true
        },
        {
          email: 'invalid@email.com',
          mobile: '9876543210',
          userStatus: false,
          status: 'Error',
          message: 'Invalid Email id'
        }
      ]
    })

    it('should process user data and match credentials', () => {
      const mockUserData = {
        count: 1,
        content: [{
          userId: 'user123',
          firstName: 'Test',
          rootOrgName: 'Test Ministry',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'test@email.com',
              mobile: '1234567890'
            }
          }
        }]
      }

      component.manageData(mockUserData)

      expect(component.isSuccessUserlist).toHaveLength(1)
      expect(component.isErrorUserlist).toHaveLength(1)
      expect(component.contacts[0].userId).toBe('user123')
      expect(component.contacts[0].fullName).toBe('Test')
      expect(component.contacts[0].ministry).toBe('Test Ministry')
    })

    it('should handle mismatched mobile numbers', () => {
      const mockUserData = {
        count: 1,
        content: [{
          userId: 'user123',
          firstName: 'Test',
          rootOrgName: 'Test Ministry',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'test@email.com',
              mobile: '0000000000' // Different mobile
            }
          }
        }]
      }

      component.manageData(mockUserData)

      expect(component.contacts[0].status).toBe('Error')
      expect(component.contacts[0].message).toBe('Given credentials are not matching')
    })

    it('should set selected tab to success when success users exist', () => {
      const mockUserData = {
        count: 1,
        content: [{
          userId: 'user123',
          firstName: 'Test',
          rootOrgName: 'Test Ministry',
          profileDetails: {
            personalDetails: {
              primaryEmail: 'test@email.com',
              mobile: '1234567890'
            }
          }
        }]
      }

      component.manageData(mockUserData)

      expect(component.isSeletedTab).toBe('success')
      expect(component.displayedColumns).toEqual(['fullName', 'email', 'ministry', 'status', 'mobile'])
    })

    it('should set selected tab to error when no success users exist', () => {
      component.contacts = [{
        email: 'invalid@email.com',
        userStatus: false,
        status: 'Error'
      }]

      component.manageData({ count: 0, content: [] })

      expect(component.isSeletedTab).toBe('error')
      expect(component.displayedColumns).toEqual(['email', 'status', 'mobile', 'message'])
    })
  })

  describe('Selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = [
      ]
    })

    it('should return true when all rows are selected', () => {
      component.selection.select(...component.dataSource.data)

      expect(component.isAllSelected()).toBe(true)
    })

    it('should return false when not all rows are selected', () => {
      component.selection.select(component.dataSource.data[0])

      expect(component.isAllSelected()).toBe(false)
    })

    it('should toggle all rows - select all when none selected', () => {
      component.toggleAllRows()

      expect(component.selection.selected.length).toBe(2)
    })

    it('should toggle all rows - clear selection when all selected', () => {
      component.selection.select(...component.dataSource.data)

      component.toggleAllRows()

      expect(component.selection.selected.length).toBe(0)
    })

    it('should return correct checkbox label for header', () => {
      const label = component.checkboxLabel()

      expect(label).toBe('select all')
    })

    it('should return correct checkbox label for selected row', () => {
      const row = { position: 0 }
      component.selection.select(row as any)

      const label = component.checkboxLabel(row)

      expect(label).toBe('deselect row 1')
    })

    it('should return correct checkbox label for unselected row', () => {
      const row = { position: 0 }

      const label = component.checkboxLabel(row)

      expect(label).toBe('select row 1')
    })
  })

  describe('changeFilterType', () => {
    beforeEach(() => {
      component.isSuccessUserlist = [{ fullName: 'Success User', email: 'success@email.com', status: 'Success', ministry: 'Ministry', mobile: '1111111111' }]
      component.isErrorUserlist = [{ email: 'error@email.com', status: 'Error', mobile: '2222222222', message: 'Error message' }]
    })

    it('should set error filter type', () => {
      component.changeFilterType('error')

      expect(component.displayedColumns).toEqual(['email', 'status', 'mobile', 'message'])
      expect(component.dataSource.data).toEqual(component.isErrorUserlist)
      expect(component.isSeletedTab).toBe('error')
    })

    it('should set success filter type', () => {
      component.changeFilterType('success')

      expect(component.displayedColumns).toEqual(['fullName', 'email', 'ministry', 'status', 'mobile'])
      expect(component.dataSource.data).toEqual(component.isSuccessUserlist)
      expect(component.isSeletedTab).toBe('success')
    })
  })

  describe('applyFilter', () => {
    it('should apply filter to data source', () => {
      const mockEvent = {
        target: { value: '  Test Filter  ' }
      } as any

      component.applyFilter(mockEvent)

      expect(component.dataSource.filter).toBe('test filter')
    })
  })

  describe('utility methods', () => {
    it('should download error file', () => {
      component.isErrorUserlist = [{ email: 'error@email.com', status: 'Error' }]

      component.downloadErrorFile()

      expect(mockContentService.downloadFile).toHaveBeenCalledWith(component.isErrorUserlist, 'userErrordata')
    })

    it('should clean header by removing parentheses', () => {
      const result = component.cleanHeader('  Header (with parentheses)  ')

      expect(result).toBe('Header with parentheses')
    })

    it('should download file (placeholder method)', () => {
      expect(() => component.downloadFile()).not.toThrow()
    })
  })

  describe('parseCSVRow', () => {
    it('should parse simple CSV row', () => {
      const result = component.parseCSVRow('col1,col2,col3', 3)

      expect(result).toEqual(['col1', 'col2', 'col3'])
    })

    it('should handle quoted values with commas', () => {
      const result = component.parseCSVRow('col1,"col2,with,commas",col3', 3)

      expect(result).toEqual(['col1', 'col2,with,commas', 'col3'])
    })

    it('should handle escaped quotes', () => {
      const result = component.parseCSVRow('col1,"col2""with""quotes",col3', 3)

      expect(result).toEqual(['col1', 'col2"with"quotes', 'col3'])
    })

    it('should handle rows with more columns than expected', () => {
      const result = component.parseCSVRow('col1,col2,col3,extra1,extra2', 3)

      expect(result).toEqual(['col1', 'col2', 'col3,extra1,extra2'])
    })

    it('should trim whitespace from values', () => {
      const result = component.parseCSVRow('  col1  ,  col2  ,  col3  ', 3)

      expect(result).toEqual(['col1', 'col2', 'col3'])
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty CSV content', async () => {
      const mockEvent = {
        target: { result: '   \n\r\n   ' }
      }

      await component.onFileLoad(mockEvent)

      expect(component.contacts).toEqual([])
    })

    it('should handle CSV with only headers', async () => {
      const mockEvent = {
        target: { result: 'email,userName,wfId,userId,action' }
      }

      await component.onFileLoad(mockEvent)

      expect(component.contacts).toEqual([])
    })

    it('should handle contacts with missing email and mobile', async () => {
      component.contacts = [{ userName: 'Test User' }]

      const mockFormData = new FormData()
      global.FormData = jest.fn(() => mockFormData) as any

      const mockResponse = 'email,status\n,success'
      mockContentService.approveRejectUser.mockReturnValue({
        toPromise: () => Promise.resolve(mockResponse)
      } as any)

      const mockEvent = {
        target: { result: 'email,userName,wfId,userId,action\n,Test User,wf123,user123,approve' }
      }

      await component.onFileLoad(mockEvent)

      expect(component.contacts).toHaveLength(0) // Filtered out
    })
  })
})