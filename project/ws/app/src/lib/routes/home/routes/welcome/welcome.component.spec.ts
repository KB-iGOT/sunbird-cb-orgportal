import { WelcomeComponent } from './welcome.component'
import { of, throwError } from 'rxjs'

// Mock the environment import - must be done before any variables that use it
jest.mock('../../../../../../../../../src/environments/environment', () => ({
    environment: {
        karmYogiPath: 'https://karmayogi.example.com',
        cbpPath: 'https://cbp.example.com'
    }
}))

// Mock telemetry events
jest.mock('../../../../head/_services/telemetry.event.model', () => ({
    TelemetryEvents: {
        EnumInteractTypes: {
            CLICK: 'CLICK'
        },
        EnumInteractSubTypes: {
            BTN_CONTENT: 'BTN_CONTENT'
        }
    }
}))

// Mock dashboard empty data
jest.mock('../../../../../../../../../src/mdo-assets/data/data', () => ({
    dashboardEmptyData: { id: 'empty', name: 'Empty Dashboard' }
}))

// Mock dependencies
const mockDocument = {
    createElement: jest.fn().mockReturnValue({
        target: '',
        href: '',
        click: jest.fn(),
        remove: jest.fn()
    })
}

const mockHomeResolver = {
    getUserDetails: jest.fn(),
    getMyDepartment: jest.fn()
}

const mockRouter = {
    navigate: jest.fn()
}

const mockEvents = {
    raiseInteractTelemetry: jest.fn()
}

describe('WelcomeComponent', () => {
    let component: WelcomeComponent

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create component instance
        component = new WelcomeComponent(
            mockDocument as any,
            mockHomeResolver as any,
            mockRouter as any,
            mockEvents as any
        )
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeDefined()
            expect(component.resolutionFilter).toBe('week')
            expect(component.compFilter).toBe('table')
            expect(component.showCBPLink).toBe(false)
            expect(component.showKarmayogiLink).toBe(false)
            expect(component.selectedDashboardId).toBe('')
            expect(component.currentDashboard).toEqual([])
        })

        it('should have correct API endpoints', () => {
            expect(component.getDashboardForKM).toBe('/apis/proxies/v8/dashboard/analytics/getDashboardConfig/Karmayogi')
            expect(component.getDashboardForProfile).toBe('/apis/proxies/v8/dashboard/analytics/getDashboardsForProfile/Karmayogi?realm=mdo')
            expect(component.getChartV2).toBe('/apis/proxies/v8/dashboard/analytics/getChartV2/Karmayogi')
        })
    })

    describe('ngOnInit', () => {
        it('should call getUserDetails and selectDashbord on init', () => {
            const getUserDetailsSpy = jest.spyOn(component, 'getUserDetails').mockImplementation()
            const selectDashbordSpy = jest.spyOn(component, 'selectDashbord').mockImplementation()

            component.ngOnInit()

            expect(getUserDetailsSpy).toHaveBeenCalled()
            expect(selectDashbordSpy).toHaveBeenCalled()
        })
    })

    describe('Filter Methods', () => {
        it('should update resolutionFilter when filterR is called', () => {
            component.filterR('month')
            expect(component.resolutionFilter).toBe('month')

            component.filterR('year')
            expect(component.resolutionFilter).toBe('year')
        })

        it('should update compFilter when filterComp is called', () => {
            component.filterComp('chart')
            expect(component.compFilter).toBe('chart')

            component.filterComp('graph')
            expect(component.compFilter).toBe('graph')
        })
    })

    describe('selectDashbord', () => {
        it('should set currentDashboard to empty data when selectedDashboardId is empty', () => {
            component.selectedDashboardId = ''
            component.selectDashbord()

            expect(component.currentDashboard).toHaveLength(1)
            expect(component.currentDashboard[0]).toEqual({ id: 'empty', name: 'Empty Dashboard' })
        })

        it('should not modify currentDashboard when selectedDashboardId is not empty', () => {
            component.selectedDashboardId = 'dashboard-123'
            component.currentDashboard = [{ id: 'existing', name: 'Existing Dashboard' }]

            component.selectDashbord()

            expect(component.currentDashboard).toHaveLength(1)
            expect(component.currentDashboard[0]).toEqual({ id: 'existing', name: 'Existing Dashboard' })
        })
    })

    describe('getUserDetails', () => {
        it('should set showCBPLink to true for content creation roles', () => {
            const mockResponse = {
                roles: ['CONTENT_CREATOR', 'OTHER_ROLE']
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(mockHomeResolver.getUserDetails).toHaveBeenCalled()
            expect(component.showCBPLink).toBe(true)
        })

        it('should set showCBPLink to true for EDITOR role', () => {
            const mockResponse = {
                roles: ['EDITOR']
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showCBPLink).toBe(true)
        })

        it('should set showCBPLink to true for PUBLISHER role', () => {
            const mockResponse = {
                roles: ['PUBLISHER']
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showCBPLink).toBe(true)
        })

        it('should set showCBPLink to true for REVIEWER role', () => {
            const mockResponse = {
                roles: ['REVIEWER']
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showCBPLink).toBe(true)
        })

        it('should set showKarmayogiLink to true for Member role', () => {
            const mockResponse = {
                roles: ['Member']
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showKarmayogiLink).toBe(true)
        })

        it('should handle multiple roles correctly', () => {
            const mockResponse = {
                roles: ['CONTENT_CREATOR', 'Member', 'OTHER_ROLE']
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showCBPLink).toBe(true)
            expect(component.showKarmayogiLink).toBe(true)
        })

        it('should handle response without roles', () => {
            const mockResponse = {}
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showCBPLink).toBe(false)
            expect(component.showKarmayogiLink).toBe(false)
        })

        it('should handle empty roles array', () => {
            const mockResponse = {
                roles: []
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showCBPLink).toBe(false)
            expect(component.showKarmayogiLink).toBe(false)
        })

        it('should handle service error gracefully', () => {
            mockHomeResolver.getUserDetails.mockReturnValue(throwError('Service error'))

            expect(() => component.getUserDetails()).not.toThrow()
        })
    })

    describe('Window Opening Methods', () => {
        it('should call openNewWindow when openky is called', () => {
            const openNewWindowSpy = jest.spyOn(component, 'openNewWindow').mockImplementation()

            component.openky()

            expect(openNewWindowSpy).toHaveBeenCalled()
        })

        it('should create and click link for Karmayogi in openNewWindow', () => {
            const mockLink = {
                target: '',
                href: '',
                click: jest.fn(),
                remove: jest.fn()
            }
            mockDocument.createElement.mockReturnValue(mockLink)

            component.openNewWindow()

            expect(mockDocument.createElement).toHaveBeenCalledWith('a')
            expect(mockLink.target).toBe('_blank')
            expect(mockLink.href).toBe('https://karmayogi.example.com')
            expect(mockLink.click).toHaveBeenCalled()
            expect(mockLink.remove).toHaveBeenCalled()
        })

        it('should call openNewWindowCBP when openCBP is called', () => {
            const openNewWindowCBPSpy = jest.spyOn(component, 'openNewWindowCBP').mockImplementation()

            component.openCBP()

            expect(openNewWindowCBPSpy).toHaveBeenCalled()
        })

        it('should create and click link for CBP in openNewWindowCBP', () => {
            const mockLink = {
                target: '',
                href: '',
                click: jest.fn(),
                remove: jest.fn()
            }
            mockDocument.createElement.mockReturnValue(mockLink)

            component.openNewWindowCBP()

            expect(mockDocument.createElement).toHaveBeenCalledWith('a')
            expect(mockLink.target).toBe('_blank')
            expect(mockLink.href).toBe('https://cbp.example.com')
            expect(mockLink.click).toHaveBeenCalled()
            expect(mockLink.remove).toHaveBeenCalled()
        })
    })

    describe('Navigation Methods', () => {
        it('should navigate to leadership page when viewmdoinfo is called with leadership', () => {
            component.viewmdoinfo('leadership')

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/mdoinfo/leadership'])
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK',
                    subType: 'BTN_CONTENT',
                    id: 'leadership',
                },
                {}
            )
        })

        it('should navigate to staff page when viewmdoinfo is called with staff', () => {
            component.viewmdoinfo('staff')

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/mdoinfo/staff'])
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK',
                    subType: 'BTN_CONTENT',
                    id: 'staff',
                },
                {}
            )
        })

        it('should navigate to budget page when viewmdoinfo is called with budget', () => {
            component.viewmdoinfo('budget')

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/mdoinfo/budget'])
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK',
                    subType: 'BTN_CONTENT',
                    id: 'budget',
                },
                {}
            )
        })

        it('should not navigate for unknown tab but still raise telemetry', () => {
            component.viewmdoinfo('unknown')

            expect(mockRouter.navigate).not.toHaveBeenCalled()
            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK',
                    subType: 'BTN_CONTENT',
                    id: 'unknown',
                },
                {}
            )
        })
    })

    describe('Dashboard Methods', () => {
        it('should raise telemetry event when dashboardClick is called', () => {
            component.dashboardClick()

            expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK',
                    subType: 'BTN_CONTENT',
                },
                {}
            )
        })

        it('should set selectedDashboardId when getDashboardId is called with valid value', () => {
            component.getDashboardId('dashboard-123')

            expect(component.selectedDashboardId).toBe('dashboard-123')
        })

        it('should reset dashboard when getDashboardId is called with null', () => {
            component.currentDashboard = [{ id: 'existing' }]

            component.getDashboardId(null as any)

            expect(component.currentDashboard).toHaveLength(1)
            expect(component.currentDashboard[0]).toEqual({ id: 'empty', name: 'Empty Dashboard' })
        })

        it('should reset dashboard when getDashboardId is called with empty string', () => {
            component.currentDashboard = [{ id: 'existing' }]

            component.getDashboardId('')

            expect(component.currentDashboard).toHaveLength(1)
            expect(component.currentDashboard[0]).toEqual({ id: 'empty', name: 'Empty Dashboard' })
        })

        it('should not reset dashboard when getDashboardId is called with valid string', () => {
            component.currentDashboard = [{ id: 'existing' }]

            component.getDashboardId('valid-id')

            expect(component.selectedDashboardId).toBe('valid-id')
            expect(component.currentDashboard).toHaveLength(1)
            expect(component.currentDashboard[0]).toEqual({ id: 'existing' })
        })
    })

    describe('Lifecycle Methods', () => {
        it('should have ngAfterViewInit method', () => {
            expect(() => component.ngAfterViewInit()).not.toThrow()
        })

        it('should have ngOnDestroy method', () => {
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('Edge Cases', () => {
        it('should handle getUserDetails with roles as object instead of array', () => {
            const mockResponse = {
                roles: {
                    0: 'CONTENT_CREATOR',
                    1: 'Member'
                }
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            expect(component.showCBPLink).toBe(true)
            expect(component.showKarmayogiLink).toBe(true)
        })

        it('should handle roles with different casing', () => {
            const mockResponse = {
                roles: ['content_creator', 'member']
            }
            mockHomeResolver.getUserDetails.mockReturnValue(of(mockResponse))

            component.getUserDetails()

            // Should not match due to case sensitivity
            expect(component.showCBPLink).toBe(false)
            expect(component.showKarmayogiLink).toBe(false)
        })

        it('should maintain state when calling methods multiple times', () => {
            component.filterR('month')
            component.filterR('year')
            expect(component.resolutionFilter).toBe('year')

            component.filterComp('chart')
            component.filterComp('table')
            expect(component.compFilter).toBe('table')
        })
    })
})