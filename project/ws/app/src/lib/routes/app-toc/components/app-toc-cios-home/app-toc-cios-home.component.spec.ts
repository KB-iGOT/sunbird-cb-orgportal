jest.mock('@ws/author/src/public-api', () => ({
  LoaderService: class MockLoaderService {
    changeLoad = new (require('rxjs').Subject)()
  },
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class {},
  EventService: class { dispatchEvent = jest.fn() },
  MultilingualTranslationsService: class { translateLabel = jest.fn().mockReturnValue('translated') },
  WidgetContentService: class {},
  WsEvents: {
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded' },
  },
}))

import { of, Subject } from 'rxjs'
import { AppTocCiosHomeComponent } from './app-toc-cios-home.component'

describe('AppTocCiosHomeComponent', () => {
  let component: AppTocCiosHomeComponent
  let mockRoute: any
  let mockConfigSvc: any
  let mockEvents: any
  let mockLangTranslations: any
  let mockContentSvc: any
  let mockLoader: any
  let mockSnackBar: any

  function buildComponent() {
    return new AppTocCiosHomeComponent(
      mockRoute,
      mockConfigSvc,
      mockEvents,
      mockLangTranslations,
      mockContentSvc,
      mockLoader,
      mockSnackBar,
    )
  }

  beforeEach(() => {
    mockRoute = {
      data: of({}),
      snapshot: {
        data: {
          pageData: { data: { config: 'test' } },
        },
      },
    }

    mockConfigSvc = {
      userProfile: { rootOrgId: 'root-001' },
      userProfileV2: { email: 'test@example.com' },
    }

    mockEvents = { dispatchEvent: jest.fn() }

    mockLangTranslations = { translateLabel: jest.fn().mockReturnValue('translated') }

    mockContentSvc = {
      extContentEnroll: jest.fn().mockReturnValue(of({ result: { enrolled: true } })),
      fetchExtUserContentEnroll: jest.fn().mockReturnValue(of({ result: { completionpercentage: 50 } })),
    }

    mockLoader = { changeLoad: new Subject() }
    mockSnackBar = { open: jest.fn() }

    component = buildComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set skeletonLoader to false when route data has no content', () => {
    expect(component.skeletonLoader).toBe(false)
    expect(component.extContentAvailable).toBe(false)
  })

  it('should set extContentReadData when route data has content', () => {
    mockRoute.data = of({
      extContent: {
        data: {
          content: { identifier: 'ext-001', name: 'External Course' },
        },
      },
    })
    component = buildComponent()
    expect(component.extContentReadData).toEqual(
      expect.objectContaining({ identifier: 'ext-001', certificateObj: { data: {} } })
    )
    expect(component.skeletonLoader).toBe(false)
    expect(component.extContentAvailable).toBe(true)
  })

  it('should set userExtCourseEnroll when enrollment data exists', () => {
    mockRoute.data = of({
      extContent: {
        data: { content: { identifier: 'ext-001' } },
      },
      userEnrollContent: {
        data: { result: { completionpercentage: 50, courseId: 'c-001' } },
      },
    })
    component = buildComponent()
    expect(component.userExtCourseEnroll).toEqual({ completionpercentage: 50, courseId: 'c-001' })
  })

  it('should set rootOrgId from userProfile', () => {
    expect(component.rootOrgId).toBe('root-001')
  })

  it('should handle missing userProfile', () => {
    mockConfigSvc.userProfile = null
    component = buildComponent()
    expect(component.rootOrgId).toBeUndefined()
  })

  describe('ngOnInit', () => {
    it('should set config from snapshot pageData', () => {
      component.ngOnInit()
      expect(component.config).toEqual({ config: 'test' })
    })

    it('should handle missing pageData', () => {
      mockRoute.snapshot.data = {}
      component = buildComponent()
      component.ngOnInit()
      expect(component.config).toBeUndefined()
    })
  })

  describe('handleCapitalize', () => {
    it('should return the input string unchanged', () => {
      expect(component.handleCapitalize('hello world')).toBe('hello world')
    })

    it('should return empty string for empty input', () => {
      expect(component.handleCapitalize('')).toBe('')
    })
  })

  describe('translateLabels', () => {
    it('should call langtranslations.translateLabel and return translated value', () => {
      const result = component.translateLabels('key', 'type')
      expect(mockLangTranslations.translateLabel).toHaveBeenCalledWith('key', 'type', '')
      expect(result).toBe('translated')
    })
  })

  describe('redirectToContent', () => {
    it('should replace <username> with user email in redirect URL', () => {
      const contentData = { redirectUrl: 'https://example.com?user=<username>' }
      const result = component.redirectToContent(contentData)
      expect(result).toBe('https://example.com?user=test@example.com')
    })
  })

  describe('replaceText', () => {
    it('should remove occurrences of replaceTxt from str', () => {
      expect(component.replaceText('hello world', 'world')).toBe('hello ')
    })

    it('should return the original string when replaceTxt not found', () => {
      expect(component.replaceText('hello', 'xyz')).toBe('hello')
    })
  })

  describe('enRollToExtCourse', () => {
    it('should call extContentEnroll and then getUserContentEnroll on success', async () => {
      const content = { contentId: 'c-001', contentPartner: { id: 'p-001' } }
      mockContentSvc.extContentEnroll.mockReturnValue(of({ result: { enrolled: true } }))
      mockContentSvc.fetchExtUserContentEnroll.mockReturnValue(of({ result: { completionpercentage: 50 } }))

      await component.enRollToExtCourse(content)

      expect(mockContentSvc.extContentEnroll).toHaveBeenCalledWith({
        courseId: 'c-001',
        partnerId: 'p-001',
      })
    })

    it('should open snackbar when enrollment result is empty', async () => {
      const content = { contentId: 'c-001', contentPartner: { id: 'p-001' } }
      mockContentSvc.extContentEnroll.mockReturnValue(of({}))

      await component.enRollToExtCourse(content)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Unable to enroll to the content')
    })
  })

  describe('getUserContentEnroll', () => {
    it('should update userExtCourseEnroll on success', async () => {
      mockContentSvc.fetchExtUserContentEnroll.mockReturnValue(
        of({ result: { completionpercentage: 75 } })
      )
      await component.getUserContentEnroll('content-001')
      expect(component.userExtCourseEnroll).toEqual({ completionpercentage: 75 })
    })

    it('should open snackbar when result is empty', async () => {
      mockContentSvc.fetchExtUserContentEnroll.mockReturnValue(of({}))
      await component.getUserContentEnroll('content-001')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Unable to get the enrolled details')
    })
  })

  describe('raiseTelemtryStartEvent', () => {
    it('should call events.dispatchEvent', () => {
      component.raiseTelemtryStartEvent()
      expect(mockEvents.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe('raiseTelemtryEndEvent', () => {
    it('should call events.dispatchEvent', () => {
      component.raiseTelemtryEndEvent()
      expect(mockEvents.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe('onClickOfShare', () => {
    it('should set enableShare to true', () => {
      component.enableShare = false
      component.onClickOfShare()
      expect(component.enableShare).toBe(true)
    })
  })

  describe('resetEnableShare', () => {
    it('should set enableShare to false', () => {
      component.enableShare = true
      component.resetEnableShare({})
      expect(component.enableShare).toBe(false)
    })
  })

  describe('downloadCert', () => {
    it('should not throw', async () => {
      await expect(component.downloadCert()).resolves.not.toThrow()
    })
  })
})
