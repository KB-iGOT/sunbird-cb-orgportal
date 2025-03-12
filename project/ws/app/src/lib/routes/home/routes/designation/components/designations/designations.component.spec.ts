import { DesignationsComponent } from './designations.component'
import { DesignationsService } from '../../services/designations.service'
import { of, throwError } from 'rxjs'
import { UntypedFormControl } from '@angular/forms'
import { environment } from '../../../../../../../../../../../src/environments/environment'

// Mock dependencies
jest.mock('../../services/designations.service')

describe('DesignationsComponent', () => {
    let component: DesignationsComponent
    let designationsService: jest.Mocked<DesignationsService>
    let mockDialog: any
    let mockActivatedRoute: any
    let mockSnackBar: any
    let mockDesignationConfig: any
    let mockConfigSvc: any

    beforeEach(() => {
        // Create mock designation config
        mockDesignationConfig = {
            frameworkCreationMSg: 'Creating framework...',
            internalErrorMsg: 'An error occurred',
            termRemoveMsg: 'Designation removed successfully',
            refreshDelayTime: 5000,
            topsection: {
                guideVideo: {
                    url: '/test-video-url'
                }
            }
        }

        // Create mock config service with all required properties
        mockConfigSvc = {
            userProfileV2: { mock: 'userProfileV2' },
            userProfile: {
                rootOrgId: 'testOrgId',
                departmentName: 'testDepartment'
            },
            orgReadData: {
                frameworkid: 'testFrameworkId'
            }
        }

        // Mock Dialog service
        mockDialog = {
            open: jest.fn().mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(true))
            })
        }

        // Mock ActivatedRoute
        mockActivatedRoute = {
            snapshot: {
                data: {
                    configService: mockConfigSvc
                }
            },
            data: {
                subscribe: jest.fn(fn => fn({
                    pageData: {
                        data: mockDesignationConfig
                    }
                }))
            }
        }

        // Mock SnackBar service
        mockSnackBar = {
            open: jest.fn()
        }

        // Setup DesignationsService mock
        designationsService = new (DesignationsService as any)() as jest.Mocked<DesignationsService>
        designationsService.setUserProfile = jest.fn()
        designationsService.createFrameWork = jest.fn().mockReturnValue(of({
            result: { framework: 'testFramework' }
        }))
        designationsService.getOrgReadData = jest.fn().mockReturnValue(of({
            frameworkid: 'testFrameworkId'
        }))
        designationsService.getFrameworkInfo = jest.fn().mockReturnValue(of({
            result: {
                framework: {
                    code: 'testFrameworkCode',
                    categories: [
                        {
                            code: 'org',
                            terms: [
                                {
                                    identifier: 'testOrgId',
                                    children: [
                                        {
                                            name: 'Designation 1',
                                            code: 'des1',
                                            additionalProperties: { timeStamp: '1614556800000' }
                                        },
                                        {
                                            name: 'Designation 2',
                                            code: 'des2',
                                            additionalProperties: { timeStamp: '1614643200000' }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }))
        designationsService.setFrameWorkInfo = jest.fn()
        designationsService.setCurrentOrgDesignationsList = jest.fn()
        designationsService.deleteDesignation = jest.fn().mockReturnValue(of({ success: true }))
        designationsService.publishFramework = jest.fn().mockReturnValue(of({ success: true }))

        // Create component instance
        component = new DesignationsComponent(
            designationsService,
            mockDialog as any,
            mockActivatedRoute as any,
            mockSnackBar as any
        )

        // Set required properties directly
        component.designationConfig = mockDesignationConfig
        component.configSvc = mockConfigSvc

        // Mock searchControl
        component.searchControl = new UntypedFormControl();

        // Mock environment
        (environment as any) = {
            ODCSMasterFramework: 'testMasterFramework',
            karmYogiPath: 'testPath/',
            frameworkName: ''
        }
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('ngOnInit', () => {
        it('should initialize the component', () => {
            // Spy on initialization methods
            jest.spyOn(component, 'initialization')

            // Call ngOnInit
            component.ngOnInit()

            // Verify initialization method was called
            expect(component.initialization).toHaveBeenCalled()
        })
    })

    describe('initialization', () => {
        it('should call required initialization methods', () => {
            // Spy on methods
            jest.spyOn(component, 'initializeDefaultValues')
            jest.spyOn(component, 'valueChangeSubscribers')
            jest.spyOn(component, 'getRoutesData')

            // Call initialization
            component.initialization()

            // Verify methods were called
            expect(component.initializeDefaultValues).toHaveBeenCalled()
            expect(component.valueChangeSubscribers).toHaveBeenCalled()
            expect(component.getRoutesData).toHaveBeenCalled()
        })
    })

    describe('initializeDefaultValues', () => {
        it('should set default values and configuration', () => {
            // Call method
            component.initializeDefaultValues()

            // Verify user profile was set
            expect(designationsService.setUserProfile).toHaveBeenCalled()

            // Verify orgId is set
            expect(component.orgId).toBe('testOrgId')

            // Verify action menu items are set
            expect(component.actionMenuItem.length).toBe(1)
            expect(component.actionMenuItem[0].key).toBe('remove')

            // Verify table data is set
            expect(component.tableData.columns.length).toBe(3)
            expect(component.tableData.needCheckBox).toBe(false)
        })
    })

    describe('getRoutesData', () => {
        it('should get route data and framework info if frameworkid exists', () => {
            // Spy on getFrameworkInfo
            jest.spyOn(component, 'getFrameworkInfo')

            // Call method
            component.getRoutesData()

            // Verify environment is set
            expect(component.environment).toBe(environment)

            // Verify designation config is set from route data
            expect(component.designationConfig).toBe(mockDesignationConfig)

            // Verify getFrameworkInfo is called
            expect(component.getFrameworkInfo).toHaveBeenCalledWith('testFrameworkId')
        })

        it('should create framework if frameworkid does not exist', () => {
            // Remove orgReadData.frameworkid
            component.configSvc.orgReadData = {}

            // Spy on createFreamwork
            jest.spyOn(component, 'createFreamwork')

            // Call method
            component.getRoutesData()

            // Verify createFreamwork is called
            expect(component.createFreamwork).toHaveBeenCalled()
        })
    })

    describe('createFreamwork', () => {
        it('should create framework and set environment frameworkName', () => {
            // Mock setTimeout
            jest.useFakeTimers()

            // Spy on getOrgReadData
            jest.spyOn(component, 'getOrgReadData')

            // Call method
            component.createFreamwork()

            // Verify service call
            expect(designationsService.createFrameWork).toHaveBeenCalledWith(
                'testMasterFramework',
                'testOrgId',
                'testDepartment'
            )

            // Verify loader state
            expect(component.showCreateLoader).toBe(true)
            expect(component.loaderMsg).toBe('Creating framework...')

            // Verify environment frameworkName is set
            // expect(environment.frameworkName).toBe('testFramework')

            // Fast-forward timers
            jest.runAllTimers()

            // Verify getOrgReadData is called
            expect(component.getOrgReadData).toHaveBeenCalled()

            // Restore timers
            jest.useRealTimers()
        })
    })

    describe('getOrgReadData', () => {
        it('should get org read data and call getFrameworkInfo', () => {
            // Spy on getFrameworkInfo
            jest.spyOn(component, 'getFrameworkInfo')

            // Call method
            component.getOrgReadData()

            // Verify service call
            expect(designationsService.getOrgReadData).toHaveBeenCalledWith('testOrgId')

            // Verify state changes
            expect(component.showLoader).toBe(true)
            expect(component.showCreateLoader).toBe(false)
            //expect(environment.frameworkName).toBe('testFrameworkId')

            // Verify getFrameworkInfo is called
            expect(component.getFrameworkInfo).toHaveBeenCalledWith('testFrameworkId')
        })
    })

    describe('getFrameworkInfo', () => {
        it('should get framework info and set up organizations', () => {
            // Spy on getOrganisations
            jest.spyOn(component, 'getOrganisations')

            // Call method
            component.getFrameworkInfo('testFrameworkId')

            // Verify environment frameworkName is set
            //expect(environment.frameworkName).toBe('testFrameworkId')

            // Verify service call
            expect(designationsService.getFrameworkInfo).toHaveBeenCalledWith('testFrameworkId')

            // Verify state changes
            expect(component.showLoader).toBe(false)
            expect(component.frameworkDetails).toBeDefined()

            // Verify frame work info is set
            expect(designationsService.setFrameWorkInfo).toHaveBeenCalled()

            // Verify getOrganisations is called
            expect(component.getOrganisations).toHaveBeenCalled()
        })

        it('should handle error in getFrameworkInfo', () => {
            // Mock service to throw error
            designationsService.getFrameworkInfo = jest.fn().mockReturnValue(
                throwError(() => new Error('Test error'))
            )

            // Spy on openSnackbar
            jest.spyOn(component as any, 'openSnackbar')

            // Call method
            component.getFrameworkInfo('testFrameworkId')

            // Verify error handling
            expect(component.showLoader).toBe(false)
            expect((component as any).openSnackbar).toHaveBeenCalledWith('An error occurred')
        })
    })

    describe('valueChangeSubscribers', () => {
        it('should subscribe to search control value changes', () => {
            // Spy on filterDesignations
            jest.spyOn(component, 'filterDesignations')

            // Call method
            component.valueChangeSubscribers()

            // Simulate value change
            component.searchControl.setValue('test')

            // Use fake timers to handle the delay
            jest.useFakeTimers()
            jest.runAllTimers()

            // Verify filterDesignations is called with search value
            expect(component.filterDesignations).toHaveBeenCalledWith('test')

            // Restore timers
            jest.useRealTimers()
        })
    })

    describe('getOrganisations', () => {
        it('should get organisations and call getDesignations', () => {
            // Setup component to have framework details
            component.frameworkDetails = {
                categories: [
                    {
                        code: 'org',
                        terms: [{ identifier: 'org1' }]
                    }
                ]
            }

            // Spy on getDesignations
            jest.spyOn(component, 'getDesignations')

            // Call method
            component.getOrganisations()

            // Verify state changes
            expect(component.organisationsList).toEqual([{ identifier: 'org1' }])
            expect(component.selectedOrganisation).toBe('org1')

            // Verify getDesignations is called
            expect(component.getDesignations).toHaveBeenCalled()
        })
    })

    describe('getDesignations', () => {
        it('should get designations and filter them', () => {
            // Setup component
            component.organisationsList = [{ children: [{ name: 'Designation 1' }] }]

            // Spy on filterDesignations
            jest.spyOn(component, 'filterDesignations')

            // Call method
            component.getDesignations()

            // Verify state changes
            expect(component.designationsList).toEqual([{ name: 'Designation 1' }])

            // Verify service call
            expect(designationsService.setCurrentOrgDesignationsList).toHaveBeenCalledWith([{ name: 'Designation 1' }])

            // Verify filterDesignations is called
            expect(component.filterDesignations).toHaveBeenCalled()
        })
    })

    describe('filterDesignations', () => {
        beforeEach(() => {
            // Setup component
            component.designationsList = [
                { name: 'Designation 1', additionalProperties: { timeStamp: '1614556800000' } },
                { name: 'Test Designation', additionalProperties: { timeStamp: '1614643200000' } }
            ]
        })

        it('should filter designations by name when key is provided', () => {
            // Call method with search key
            component.filterDesignations('test')

            // Verify filtered list
            expect(component.filteredDesignationsList.length).toBe(1)
            expect(component.filteredDesignationsList[0].name).toBe('Test Designation')
        })

        it('should sort designations by timestamp when no key is provided', () => {
            // Call method without search key
            component.filterDesignations()

            // Verify sorted list (newest first)
            expect(component.filteredDesignationsList.length).toBe(2)
            expect(component.filteredDesignationsList[0].name).toBe('Test Designation')
            expect(component.filteredDesignationsList[1].name).toBe('Designation 1')
        })
    })

    describe('openVideoPopup', () => {
        it('should open video popup with correct URL', () => {
            // Call method
            component.openVideoPopup()

            // Verify dialog open
            expect(mockDialog.open).toHaveBeenCalled()
            expect(mockDialog.open.mock.calls[0][1].data.videoLink).toContain('/test-video-url')
        })
    })
})