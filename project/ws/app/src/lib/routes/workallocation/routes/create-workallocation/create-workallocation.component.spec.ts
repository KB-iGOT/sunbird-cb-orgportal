jest.mock('ngx-export-as', () => ({
  ExportAsService: jest.fn(),
  ExportAsConfig: jest.fn(),
}))

import { CreateWorkallocationComponent } from './create-workallocation.component'
import { UntypedFormBuilder } from '@angular/forms'
import { of } from 'rxjs'
import { Router } from '@angular/router'

describe('CreateWorkallocationComponent', () => {
  let component: CreateWorkallocationComponent
  let mockAllocationService: any
  let mockExportAsService: any
  let mockSnackBar: any
  let mockDialog: any
  let mockEvents: any
  let mockConfigSvc: any
  let mockFormBuilder: UntypedFormBuilder
  let mockRouter: any

  beforeEach(() => {
    // Mock dependencies
    mockAllocationService = {
      getAllUsers: jest.fn().mockReturnValue(of({})),
      onSearchUser: jest.fn().mockReturnValue(of({ result: { data: [] } })),
      onSearchRole: jest.fn().mockReturnValue(of([])),
      onSearchPosition: jest.fn().mockReturnValue(of({ responseData: [] })),
      createAllocation: jest.fn().mockReturnValue(of({ success: true })),
      getAllocationDetails: jest.fn().mockReturnValue(of({ result: { data: [{ allocationDetails: { draftWAObject: { id: 'test-id' } } }] } })),
      updateAllocation: jest.fn().mockReturnValue(of({ success: true }))
    }

    mockExportAsService = {
      save: jest.fn().mockReturnValue(of({})),
      get: jest.fn().mockReturnValue(of({}))
    }

    mockSnackBar = {
      open: jest.fn()
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ data: { userId: 'test-user-id' } }))
      })
    }

    mockEvents = {
      raiseInteractTelemetry: jest.fn()
    }

    mockConfigSvc = {
      unMappedUser: {
        channel: 'Test Department',
        rootOrgId: 'dept-123'
      }
    }

    mockRouter = {
      navigate: jest.fn()
    }

    mockFormBuilder = new UntypedFormBuilder()

    // Initialize component with mocked dependencies
    component = new CreateWorkallocationComponent(
      mockExportAsService,
      mockSnackBar,
      mockFormBuilder,
      mockAllocationService,
      mockRouter as Router,
      mockDialog,
      mockEvents,
      mockConfigSvc
    )

    // Initialize the form
    component.ngOnInit()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.currentTab).toBe('officer')
    expect(component.sticky).toBe(false)
    expect(component.selectedIndex).toBe(0)
    expect(component.tabsData.length).toBe(2)
    expect(component.ralist).toEqual([])
    expect(component.activitieslist).toEqual([])
    expect(component.showPublishButton).toBe(false)
  })

  it('should initialize form with required validators', () => {
    expect(component.newAllocationForm.get('fname')?.validator).toBeTruthy()
    expect(component.newAllocationForm.get('email')?.validator).toBeTruthy()
    expect(component.newAllocationForm.get('position')?.validator).toBeTruthy()
  })

  it('should handle onSideNavTabClick', () => {
    // Mock the document.getElementById method
    document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: jest.fn()
    })

    component.onSideNavTabClick('roles')

    expect(component.currentTab).toBe('roles')
    expect(document.getElementById).toHaveBeenCalledWith('roles')
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('should handle onSearchUser', () => {
    const mockUsers = [{ userDetails: { first_name: 'John', email: 'john@example.com' } }]
    mockAllocationService.onSearchUser.mockReturnValue(of({ result: { data: mockUsers } }))

    // Mock displayLoader method
    component.displayLoader = jest.fn()

    const event = { target: { value: 'John' } }
    component.onSearchUser(event)

    expect(mockAllocationService.onSearchUser).toHaveBeenCalledWith('John')
    expect(component.displayLoader).toHaveBeenCalledWith('true')
    expect(component.displayLoader).toHaveBeenCalledWith('false')
    expect(component.userslist).toEqual(mockUsers)
    expect(component.similarUsers).toEqual(mockUsers)
    expect(component.nosimilarUsers).toBe(false)
  })

  it('should handle onSearchRole', () => {
    const mockRoles = [{ name: 'Admin', childNodes: [] }]
    mockAllocationService.onSearchRole.mockReturnValue(of(mockRoles))

    // Mock displayLoader method
    component.displayLoader = jest.fn()

    const event = { target: { value: 'Admin' } }
    component.onSearchRole(event)

    expect(mockAllocationService.onSearchRole).toHaveBeenCalledWith('Admin')
    expect(component.displayLoader).toHaveBeenCalledWith('true')
    expect(component.displayLoader).toHaveBeenCalledWith('false')
    expect(component.similarRoles).toEqual(mockRoles)
    expect(component.nosimilarRoles).toBe(false)
  })

  it('should handle onSearchPosition', () => {
    const mockPositions = [{ name: 'Manager', id: 'pos-123' }]
    mockAllocationService.onSearchPosition.mockReturnValue(of({ responseData: mockPositions }))

    // Mock displayLoader method
    component.displayLoader = jest.fn()

    const event = { target: { value: 'Manager' } }
    component.onSearchPosition(event)

    expect(mockAllocationService.onSearchPosition).toHaveBeenCalled()
    expect(component.displayLoader).toHaveBeenCalledWith('true')
    expect(component.displayLoader).toHaveBeenCalledWith('false')
    expect(component.similarPositions).toEqual(mockPositions)
    expect(component.nosimilarPositions).toBe(false)
  })

  it('should handle selectUser', () => {
    const mockUser = {
      userDetails: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        wid: 'user-123'
      },
      allocationDetails: {
        userPosition: 'Manager'
      }
    }

    component.selectUser(mockUser)

    expect(component.selectedUser).toEqual(mockUser)
    expect(component.similarUsers).toEqual([])
    expect(component.newAllocationForm.get('fname')?.value).toBe('John Doe')
    expect(component.newAllocationForm.get('email')?.value).toBe('john@example.com')
    expect(component.newAllocationForm.get('position')?.value).toBe('Manager')
  })

  it('should handle selectRole', () => {
    // Mock ElementRef
    component.inputvar = {
      nativeElement: {
        value: 'test'
      }
    } as any

    const mockRole = {
      name: 'Admin',
      childNodes: [{ name: 'Activity 1' }, { name: 'Activity 2' }]
    }

    component.selectRole(mockRole)

    expect(component.selectedRole).toEqual(mockRole)
    expect(component.activitieslist.length).toBe(2)
    expect(component.similarRoles).toEqual([])
    expect(component.selectedActivity).toBe('')
    expect(component.inputvar.nativeElement.value).toBe('')
  })

  it('should handle selectPosition', () => {
    const mockPosition = {
      name: 'Manager',
      id: 'pos-123'
    }

    component.selectedUser = {
      userDetails: {}
    }

    component.selectPosition(mockPosition)

    expect(component.selectedPosition).toEqual(mockPosition)
    expect(component.similarPositions).toEqual([])
    expect(component.newAllocationForm.get('position')?.value).toBe('Manager')
    expect(component.selectedUser.userDetails.position).toBe('Manager')
  })

  it('should handle export', () => {
    component.export()

    expect(mockExportAsService.save).toHaveBeenCalled()
  })

  it('should handle onSubmit', () => {
    component.selectedUser = {
      userDetails: {
        wid: 'user-123',
        email: 'john@example.com'
      },
      allocationDetails: {
        archivedList: []
      }
    }

    component.departmentID = 'dept-123'
    component.departmentName = 'Test Department'
    component.ralist = [{ name: 'Role 1', childNodes: [] }]

    component.newAllocationForm.patchValue({
      fname: 'John Doe',
      email: 'john@example.com',
      position: 'Manager'
    })

    component.onSubmit()

    expect(mockAllocationService.createAllocation).toHaveBeenCalled()
    expect(mockSnackBar.open).toHaveBeenCalledWith('Work Allocated Successfully', 'X', { duration: 5000 })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/workallocation'])
  })

  it('should handle publishWorkOrder', () => {
    component.publishWorkAllocationData = {
      userId: 'user-123'
    }
    component.waId = 'wa-123'

    component.publishWorkOrder()

    expect(component.publishWorkAllocationData.waId).toBe('wa-123')
    expect(component.publishWorkAllocationData.status).toBe('Published')
    expect(mockAllocationService.updateAllocation).toHaveBeenCalledWith(component.publishWorkAllocationData)
    expect(mockSnackBar.open).toHaveBeenCalledWith('Work Allocated Successfully', 'X', { duration: 5000 })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/workallocation'])
  })

  it('should handle removeSelectedUSer', () => {
    // Setup mock dialog to return result as true
    mockDialog.open.mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(true))
    })

    component.selectedUser = { userDetails: {} }
    component.ralist = [{ name: 'Role 1' }]
    component.activitieslist = [{ name: 'Activity 1' }]

    component.removeSelectedUSer()

    expect(mockDialog.open).toHaveBeenCalled()
    expect(component.selectedUser).toBe('')
    expect(component.ralist).toEqual([])
    expect(component.activitieslist).toEqual([])
  })

  it('should handle addRolesActivity with selected role', () => {
    // Mock ElementRef
    component.inputvar = {
      nativeElement: {
        value: ''
      }
    } as any

    component.selectedRole = {
      name: 'Admin',
      childNodes: []
    }

    component.activitieslist = [{ name: 'Activity 1' }]
    component.ralist = []

    component.addRolesActivity(0)

    expect(component.showRAerror).toBe(false)
    expect(component.ralist.length).toBe(1)
    expect(component.selectedRole).toBe('')
    expect(component.activitieslist).toEqual([])
  })

  it('should handle removeActivity', () => {
    component.activitieslist = [{ name: 'Activity 1' }, { name: 'Activity 2' }]

    component.removeActivity(0)

    expect(component.activitieslist.length).toBe(1)
    expect(component.activitieslist[0].name).toBe('Activity 2')
  })

  it('should handle buttonClick delete action', () => {
    component.ralist = [{ name: 'Role 1' }, { name: 'Role 2' }]

    component.buttonClick('Delete', component.ralist[0])

    expect(component.ralist.length).toBe(1)
    expect(component.ralist[0].name).toBe('Role 2')
  })

  it('should return newroleControls from rolelist FormArray', () => {
    const controls = component.newroleControls
    expect(controls).toBeDefined()
    expect(Array.isArray(controls)).toBe(true)
  })

  it('should create a new role FormGroup via newRole()', () => {
    const roleGroup = component.newRole()
    expect(roleGroup.get('name')).toBeDefined()
    expect(roleGroup.get('childNodes')).toBeDefined()
  })

  it('should set roles to FormArray from formdata via setRole()', () => {
    component.formdata.rolelist = [{ name: 'Dev', childNodes: 'node1' }]
    component.setRole()
    const control = (component.newAllocationForm.get('rolelist') as any).controls
    // setRole pushes to existing array which starts with 1 item
    expect(control.length).toBeGreaterThanOrEqual(2)
  })

  it('should add activity from form input via addActivity()', () => {
    component.inputvar = { nativeElement: { value: '' } } as any
    component.newAllocationForm.patchValue({ rolelist: [{ name: 'Role', childNodes: 'ActivityX' }] })
    component.newAllocationForm.value.rolelist[0].childNodes = 'ActivityX'
    component.selectedActivity = null
    component.addActivity()
    expect(component.activitieslist.some((a: any) => a.name === 'ActivityX')).toBe(true)
  })

  it('should not add activity when selectedActivity is already set', () => {
    component.selectedActivity = { name: 'Existing' }
    const initialLen = component.activitieslist.length
    component.addActivity()
    expect(component.activitieslist.length).toBe(initialLen)
  })

  it('should handle getWorkAllocationDetails', () => {
    component.getWorkAllocationDetails('user-123')
    expect(mockAllocationService.getAllocationDetails).toHaveBeenCalled()
    expect(component.waId).toBe('test-id')
  })

  it('should handle openDialog and set publishWorkAllocationData', () => {
    mockDialog.open.mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(
        require('rxjs').of({ data: { userId: 'u1', roleCompetencyList: [] } })
      )
    })
    mockAllocationService.getAllocationDetails.mockReturnValue(
      require('rxjs').of({ result: { data: [{ allocationDetails: { draftWAObject: { id: 'wa-new' } } }] } })
    )
    component.openDialog()
    expect(mockDialog.open).toHaveBeenCalled()
    expect(component.showPublishButton).toBe(true)
  })

  it('should handle pdfCallbackFn', () => {
    const mockPdf = {
      internal: {
        getNumberOfPages: jest.fn().mockReturnValue(2),
        pageSize: { getWidth: jest.fn().mockReturnValue(800), getHeight: jest.fn().mockReturnValue(600) },
      },
      setPage: jest.fn(),
      text: jest.fn(),
    }
    expect(() => component.pdfCallbackFn(mockPdf)).not.toThrow()
    expect(mockPdf.setPage).toHaveBeenCalledTimes(2)
    expect(mockPdf.text).toHaveBeenCalledTimes(2)
  })

  it('should set nosimilarUsers true when search returns empty list', () => {
    mockAllocationService.onSearchUser.mockReturnValue(require('rxjs').of({ result: { data: [] } }))
    component.displayLoader = jest.fn()
    component.onSearchUser({ target: { value: 'xyz' } })
    expect(component.nosimilarUsers).toBe(true)
  })

  it('should set nosimilarRoles true when search returns empty list', () => {
    mockAllocationService.onSearchRole.mockReturnValue(require('rxjs').of([]))
    component.displayLoader = jest.fn()
    component.onSearchRole({ target: { value: 'xyz' } })
    expect(component.nosimilarRoles).toBe(true)
  })

  it('should set nosimilarPositions true when search returns empty positions', () => {
    mockAllocationService.onSearchPosition.mockReturnValue(require('rxjs').of({ responseData: [] }))
    component.displayLoader = jest.fn()
    component.onSearchPosition({ target: { value: 'xyz' } })
    expect(component.nosimilarPositions).toBe(true)
  })

  it('should show error when addRolesActivity called with no selected role and empty formdata', () => {
    component.selectedRole = null
    component.activitieslist = []
    component.newAllocationForm.value.rolelist = [{ name: '', childNodes: '' }]
    component.addRolesActivity(0)
    expect(component.showRAerror).toBe(true)
  })

  it('should handle addRolesActivity with new unverified role (index != 0 path)', () => {
    component.selectedRole = null
    component.activitieslist = [{ name: 'Act1' }]
    component.ralist = []
    component.newAllocationForm.value.rolelist = [{ name: 'NewRole', childNodes: '' }]
    component.addRolesActivity(1)
    expect(component.showRAerror).toBe(false)
    expect(component.ralist.length).toBe(1)
    expect(component.ralist[0].name).toBe('NewRole')
  })

  it('should not navigate or reset if onSubmit service returns falsy', () => {
    mockAllocationService.createAllocation.mockReturnValue(require('rxjs').of(null))
    component.selectedUser = { userDetails: { wid: 'u1', email: 'e@e.com' } }
    component.departmentID = 'd1'
    component.departmentName = 'Dept'
    component.ralist = []
    component.newAllocationForm.patchValue({ fname: 'A', email: 'a@a.com', position: 'P' })
    component.onSubmit()
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })

  it('should set showAddNewRole when user has no allocationDetails position', () => {
    const mockUser = {
      userDetails: { first_name: 'A', last_name: 'B', email: 'a@b.com', wid: 'w1' },
      allocationDetails: undefined,
    }
    component.newAllocationForm.patchValue({ position: 'existing' })
    component.selectUser(mockUser)
    expect(component.showAddNewRole).toBe(true)
  })
})
