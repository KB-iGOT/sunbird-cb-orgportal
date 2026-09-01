import { TrainingPlanDashboardviewComponent } from './training-plan-dashboardview.component'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { HttpClient } from '@angular/common/http'
import { CreateMDOService } from '../../../../../head/work-allocation-table/create-mdo.services'
import { of, throwError } from 'rxjs'
import { dashboardEmptyData, mapFilePath } from '../../../../../../../../../../src/mdo-assets/data/data'

// Mock dependencies
const mockRouter = {
  url: '/some-url',
  navigate: jest.fn()
}

const mockConfigSvc = {
  pageNavBar: { backgroundColor: 'blue' }
}

const mockHttp = {
  get: jest.fn()
}

const mockMdoService = {
  getDashboardData: jest.fn()
}

describe('TrainingPlanDashboardviewComponent', () => {
  let component: TrainingPlanDashboardviewComponent
  let router: Router
  let configSvc: ConfigurationsService
  let http: HttpClient
  let mdoService: CreateMDOService

  beforeEach(() => {
    router = mockRouter as any
    configSvc = mockConfigSvc as any
    http = mockHttp as any
    mdoService = mockMdoService as any

    component = new TrainingPlanDashboardviewComponent(router, configSvc, http, mdoService)

    // Reset mocks
    jest.clearAllMocks()
  })

  describe('Constructor and Initial Setup', () => {
    it('should create component with proper dependencies', () => {
      expect(component).toBeDefined()
      expect(component.pageNavbar).toEqual({ backgroundColor: 'blue' })
      expect(component.mapPath).toBe(mapFilePath)
      expect(component.dashboardEmpty).toBe(dashboardEmptyData)
    })

    it('should initialize with default values', () => {
      expect(component.selectedDashboardId).toBe('')
      expect(component.currentDashboard).toEqual([])
      expect(component.token).toBe('')
      expect(component.lookerDashboardDetail).toBeUndefined()
      expect(component.userData).toBeUndefined()
      expect(component.showLookerProDashboard).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should call getUserProfileDetail on initialization', () => {
      const getUserProfileDetailSpy = jest.spyOn(component, 'getUserProfileDetail').mockResolvedValue()

      component.ngOnInit()

      expect(getUserProfileDetailSpy).toHaveBeenCalled()
    })
  })

  describe('getDashboardId', () => {
    it('should set selectedDashboardId when value is provided', () => {
      const testValue = 'dashboard-123'

      component.getDashboardId(testValue)

      expect(component.selectedDashboardId).toBe(testValue)
    })

    it('should set currentDashboard to empty data when value is null', () => {
      component.getDashboardId(null as any)

      expect(component.currentDashboard).toEqual([dashboardEmptyData])
    })

    it('should set currentDashboard to empty data when value is empty string', () => {
      component.getDashboardId('')

      expect(component.currentDashboard).toEqual([dashboardEmptyData])
    })

    it('should set currentDashboard to empty data when value is undefined', () => {
      component.getDashboardId(undefined as any)

      expect(component.currentDashboard).toEqual([dashboardEmptyData])
    })
  })

  describe('backToHome', () => {
    it('should navigate to home page', () => {
      component.backToHome()

      expect(router.navigate).toHaveBeenCalledWith(['page', 'home'])
    })
  })

  describe('getUserProfileDetail', () => {
    const mockUserData = {
      userId: 'user-123',
      rootOrgId: 'org-456',
      roles: ['USER'],
      firstName: 'John'
    }

    beforeEach(() => {
      jest.spyOn(component, 'showDashboard').mockImplementation()
      jest.spyOn(console, 'log').mockImplementation()
    })

    it('should fetch user profile and call showDashboard when userData exists', async () => {
      const mockResponse = {
        result: {
          response: mockUserData
        }
      }

      mockHttp.get.mockReturnValue(of(mockResponse))

      await component.getUserProfileDetail()

      expect(http.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read')
      expect(component.userData).toEqual(mockUserData)
      expect(component.showLookerProDashboard).toBe(true)
      expect(component.showDashboard).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('userData', 'rootOrgId', mockUserData.rootOrgId, 'userId', mockUserData.userId)
    })

    it('should handle error when fetching user profile fails', async () => {
      mockHttp.get.mockReturnValue(throwError('API Error'))

      await expect(component.getUserProfileDetail()).rejects.toThrow('API Error')
    })

    it('should not call showDashboard when userData is null', async () => {
      const mockResponse = {
        result: {
          response: null
        }
      }

      mockHttp.get.mockReturnValue(of(mockResponse))

      await component.getUserProfileDetail()

      expect(component.userData).toBeNull()
      expect(component.showDashboard).not.toHaveBeenCalled()
    })
  })

  describe('getUserProfileTempDetail', () => {
    const mockUserData = {
      userId: 'user-123',
      rootOrgId: 'org-456',
      roles: ['USER'],
      firstName: 'John'
    }

    beforeEach(() => {
      jest.spyOn(component, 'showTempDashboard').mockImplementation()
      jest.spyOn(console, 'log').mockImplementation()
    })

    it('should fetch user profile and call showTempDashboard when userData exists', async () => {
      const mockResponse = {
        result: {
          response: mockUserData
        }
      }

      mockHttp.get.mockReturnValue(of(mockResponse))

      await component.getUserProfileTempDetail()

      expect(http.get).toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read')
      expect(component.userData).toEqual(mockUserData)
      expect(component.showTempDashboard).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('userData', 'rootOrgId', mockUserData.rootOrgId, 'userId', mockUserData.userId)
    })

    it('should handle error when fetching user profile fails', async () => {
      mockHttp.get.mockReturnValue(throwError('API Error'))

      await expect(component.getUserProfileTempDetail()).rejects.toThrow('API Error')
    })
  })

  describe('showTempDashboard', () => {
    beforeEach(() => {
      jest.spyOn(component, 'reloadIframeWithNewUser').mockImplementation()
    })

    it('should show temp dashboard with default userId', () => {
      const mockUserData = {
        userId: 'user-123',
        rootOrgId: 'org-456',
        roles: ['USER']
      }

      component.userData = mockUserData

      const mockDashboardResponse = {
        signedUrl: 'https://looker.example.com/signed-url'
      }

      mockMdoService.getDashboardData.mockReturnValue(of(mockDashboardResponse))

      component.showTempDashboard()

      expect(component.lookerDashboardDetail).toBe('')
      expect(mdoService.getDashboardData).toHaveBeenCalledWith(
        'apis/proxies/v8/looker/dashboard',
        {
          request: {
            embedUrl: '/embed/dashboards/7',
            sessionLengthInSec: 900,
            userAttributes: {
              roles: mockUserData.roles,
              orgId: mockUserData.rootOrgId,
              userId: mockUserData.userId
            }
          }
        }
      )
      expect(component.lookerDashboardDetail).toBe(mockDashboardResponse.signedUrl)
      expect(component.reloadIframeWithNewUser).toHaveBeenCalled()
    })

    it('should use specific userId for rootOrgId 01359132123730739281', () => {
      const mockUserData = {
        userId: 'user-123',
        rootOrgId: '01359132123730739281',
        roles: ['USER']
      }

      component.userData = mockUserData

      const mockDashboardResponse = {
        signedUrl: 'https://looker.example.com/signed-url'
      }

      mockMdoService.getDashboardData.mockReturnValue(of(mockDashboardResponse))

      component.showTempDashboard()

      expect(mdoService.getDashboardData).toHaveBeenCalledWith(
        'apis/proxies/v8/looker/dashboard',
        expect.objectContaining({
          request: expect.objectContaining({
            userAttributes: expect.objectContaining({
              userId: 'c32ced54-14bc-4750-bed0-b335e4d0bc0e'
            })
          })
        })
      )
    })

    it('should use specific userId for rootOrgId 01376822290813747263', () => {
      const mockUserData = {
        userId: 'user-123',
        rootOrgId: '01376822290813747263',
        roles: ['USER']
      }

      component.userData = mockUserData

      const mockDashboardResponse = {
        signedUrl: 'https://looker.example.com/signed-url'
      }

      mockMdoService.getDashboardData.mockReturnValue(of(mockDashboardResponse))

      component.showTempDashboard()

      expect(mdoService.getDashboardData).toHaveBeenCalledWith(
        'apis/proxies/v8/looker/dashboard',
        expect.objectContaining({
          request: expect.objectContaining({
            userAttributes: expect.objectContaining({
              userId: '91d6d08a-8c23-4cc4-9e59-652fd292d426'
            })
          })
        })
      )
    })

    it('should not call reloadIframeWithNewUser when signedUrl is not present', () => {
      const mockUserData = {
        userId: 'user-123',
        rootOrgId: 'org-456',
        roles: ['USER']
      }

      component.userData = mockUserData

      const mockDashboardResponse = {}

      mockMdoService.getDashboardData.mockReturnValue(of(mockDashboardResponse))

      component.showTempDashboard()

      expect(component.reloadIframeWithNewUser).not.toHaveBeenCalled()
    })
  })

  describe('showDashboard', () => {
    beforeEach(() => {
      jest.spyOn(component, 'reloadIframeWithNewUser').mockImplementation()
    })

    it('should show dashboard with user data', () => {
      const mockUserData = {
        userId: 'user-123',
        rootOrgId: 'org-456',
        roles: ['USER'],
        firstName: 'John'
      }

      component.userData = mockUserData

      const mockDashboardResponse = {
        signedUrl: 'https://looker.example.com/signed-url'
      }

      mockMdoService.getDashboardData.mockReturnValue(of(mockDashboardResponse))

      component.showDashboard()

      expect(component.lookerDashboardDetail).toBe('')
      expect(mdoService.getDashboardData).toHaveBeenCalledWith(
        'apis/proxies/v8/looker/dashboard',
        {
          request: {
            embedUrl: '/embed/dashboards/10',
            userAttributes: {
              roles: mockUserData.roles,
              orgId: mockUserData.rootOrgId,
              userId: mockUserData.userId,
              firstName: mockUserData.firstName
            }
          }
        }
      )
      expect(component.lookerDashboardDetail).toBe(mockDashboardResponse.signedUrl)
      expect(component.reloadIframeWithNewUser).toHaveBeenCalled()
    })

    it('should use userId as firstName when firstName is not available', () => {
      const mockUserData = {
        userId: 'user-123',
        rootOrgId: 'org-456',
        roles: ['USER']
      }

      component.userData = mockUserData

      const mockDashboardResponse = {
        signedUrl: 'https://looker.example.com/signed-url'
      }

      mockMdoService.getDashboardData.mockReturnValue(of(mockDashboardResponse))

      component.showDashboard()

      expect(mdoService.getDashboardData).toHaveBeenCalledWith(
        'apis/proxies/v8/looker/dashboard',
        expect.objectContaining({
          request: expect.objectContaining({
            userAttributes: expect.objectContaining({
              firstName: mockUserData.userId
            })
          })
        })
      )
    })

    it('should not call reloadIframeWithNewUser when signedUrl is not present', () => {
      const mockUserData = {
        userId: 'user-123',
        rootOrgId: 'org-456',
        roles: ['USER'],
        firstName: 'John'
      }

      component.userData = mockUserData

      const mockDashboardResponse = {}

      mockMdoService.getDashboardData.mockReturnValue(of(mockDashboardResponse))

      component.showDashboard()

      expect(component.reloadIframeWithNewUser).not.toHaveBeenCalled()
    })
  })

  describe('reloadIframeWithNewUser', () => {
    it('should set iframe src when lookerIframe exists', () => {
      const mockIframe = {
        src: ''
      }

      component.lookerIframe = {
        nativeElement: mockIframe
      } as any

      component.lookerDashboardDetail = 'https://looker.example.com/signed-url'

      component.reloadIframeWithNewUser()

      expect(mockIframe.src).toBe('https://looker.example.com/signed-url')
    })

    it('should not throw error when lookerIframe does not exist', () => {
      component.lookerIframe = undefined as any
      component.lookerDashboardDetail = 'https://looker.example.com/signed-url'

      expect(() => component.reloadIframeWithNewUser()).not.toThrow()
    })
  })

  describe('Component Properties', () => {
    it('should have correct endpoint URLs', () => {
      expect(component.getDashboardForKM).toBe('/apis/proxies/v8/dashboard/analytics/getDashboardConfig/Karmayogi')
      expect(component.getDashboardForProfile).toBe('/apis/proxies/v8/dashboard/analytics/getDashboardsForProfile/Karmayogi?realm=mdo')
      expect(component.getChartV2).toBe('/apis/proxies/v8/dashboard/analytics/getChartV2/Karmayogi')
    })
  })
})