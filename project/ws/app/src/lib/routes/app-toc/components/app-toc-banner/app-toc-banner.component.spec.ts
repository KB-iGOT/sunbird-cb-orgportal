jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EPrimaryCategory: {
      BLENDED_PROGRAM: 'Blended Program',
      COURSE: 'Course',
      PROGRAM: 'Program',
    },
    ECourseCategory: {
      MODERATED_COURSE: 'Moderated Course',
      MODERATED_ASSESSEMENT: 'Moderated Assessment',
      MODERATED_PROGRAM: 'Moderated Program',
      INVITE_ONLY_PROGRAM: 'Invite Only Program',
    },
    EContentTypes: {
      KNOWLEDGE_ARTIFACT: 'Knowledge Artifact',
      RESOURCE: 'Resource',
    },
    WFBlendedProgramStatus: {
      APPROVED: 'APPROVED',
      SEND_FOR_MDO_APPROVAL: 'SEND_FOR_MDO_APPROVAL',
      SEND_FOR_PC_APPROVAL: 'SEND_FOR_PC_APPROVAL',
      WITHDRAWN: 'WITHDRAWN',
      REJECTED: 'REJECTED',
      REMOVED: 'REMOVED',
      WITHDRAW: 'WITHDRAW',
      INITIATE: 'INITIATE',
    },
    WFBlendedProgramApprovalTypes: {
      TWO_STEP_MDO_PC: 'TWO_STEP_MDO_PC',
      TWO_STEP_PC_MDO: 'TWO_STEP_PC_MDO',
    },
    WFSTATUS_MSG_MAPPING: {},
    EMimeTypes: { UNKNOWN: 'application/unknown' },
  },
  NsGoal: {},
  NsPlaylist: {},
  UserAutocompleteService: class { },
  viewerRouteGenerator: jest.fn().mockReturnValue({ url: '/viewer', queryParams: {} }),
  WidgetContentService: class { },
  ConfirmDialogComponent: class { },
}), { virtual: true })

jest.mock('src/app/services/mobile-apps.service', () => ({
  MobileAppsService: class { sendViewerData = jest.fn() },
}), { virtual: true })

jest.mock('@ws/author', () => ({
  AccessControlService: class { },
}), { virtual: true })

jest.mock('../../services/app-toc.service', () => ({
  AppTocService: class MockAppTocService {
    serverDate = new (require('rxjs').Subject)()
    showStartButton = jest.fn().mockReturnValue(true)
    subtitleOnBanners = true
    setWFDataSubject = new (require('rxjs').Subject)()
    getSelectedBatch = new (require('rxjs').Subject)()
    fetchPostAssessmentStatus = jest.fn().mockReturnValue((require('rxjs').of)({ result: [] }))
    getSelectedBatchData = jest.fn()
  },
}))

jest.mock('../../services/title-tag.service', () => ({
  TitleTagService: class { },
}))

jest.mock('../../services/action.service', () => ({
  ActionService: class {
    setUpdateCompGroupO: any
  },
}))

jest.mock('../../services/timer.service', () => ({
  TimerService: class { },
}))

jest.mock('../app-toc-dialog-intro-video/app-toc-dialog-intro-video.component', () => ({
  AppTocDialogIntroVideoComponent: class { },
}))

jest.mock('../enroll-questionnaire/enroll-questionnaire.component', () => ({
  EnrollQuestionnaireComponent: class { },
}))

jest.mock('../enroll-profile-form/enroll-profile-form.component', () => ({
  EnrollProfileFormComponent: class { },
}))

jest.mock('@sunbird-cb/utils-v2', () => ({
  TFetchStatus: {},
  UtilityService: class { isMobile = false },
  ConfigurationsService: class { },
  LoggerService: class { log = jest.fn() },
  WsEvents: {
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    EnumTelemetrySubType: { Loaded: 'Loaded' },
  },
  EventService: class { dispatchEvent = jest.fn() },
  MultilingualTranslationsService: class { translateLabel = jest.fn() },
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppTocBannerComponent } = require('./app-toc-banner.component') as any
import { of, Subject, Subscription } from 'rxjs'

describe('AppTocBannerComponent', () => {
  let component: any
  let mockSanitizer: any
  let mockRouter: any
  let mockRoute: any
  let mockDialog: any
  let mockTocSvc: any
  let mockContentSvc: any
  let mockUtilitySvc: any
  let mockMobileAppsSvc: any
  let mockSnackBar: any
  let mockConfigSvc: any
  let mockTagSvc: any
  let mockActionSvc: any
  let mockLogger: any
  let mockDatePipe: any
  let mockUserAutoComplete: any
  let mockEvents: any
  let mockLangTranslations: any
  let mockTimerService: any

  function buildComponent() {
    return new AppTocBannerComponent(
      mockSanitizer,
      mockRouter,
      mockRoute,
      mockDialog,
      mockTocSvc,
      mockContentSvc,
      mockUtilitySvc,
      mockMobileAppsSvc,
      mockSnackBar,
      mockConfigSvc,
      mockTagSvc,
      mockActionSvc,
      mockLogger,
      mockDatePipe,
      mockUserAutoComplete,
      mockEvents,
      mockLangTranslations,
      mockTimerService,
    )
  }

  beforeEach(() => {
    mockSanitizer = { bypassSecurityTrustStyle: jest.fn().mockReturnValue('safe-style') }

    mockRouter = {
      url: '/overview',
      events: of({}),
    }

    mockRoute = {
      data: of({ pageData: { data: {} } }),
      queryParamMap: of({ get: jest.fn().mockReturnValue(null) }),
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
    }

    mockTocSvc = {
      serverDate: new Subject(),
      showStartButton: jest.fn().mockReturnValue(true),
      subtitleOnBanners: true,
      setWFDataSubject: new Subject(),
      getSelectedBatch: new Subject(),
      fetchPostAssessmentStatus: jest.fn().mockReturnValue(of({ result: [] })),
      getSelectedBatchData: jest.fn(),
    }

    mockContentSvc = {
      enrollAndUnenrollUserToBatchWF: jest.fn().mockResolvedValue({ result: { status: 'OK', data: { status: 'APPROVED' } } }),
      fetchBlendedUserCOUNT: jest.fn().mockResolvedValue({ result: { content: [] } }),
      extContentEnroll: jest.fn().mockReturnValue(of({ result: {} })),
    }

    mockUtilitySvc = { isMobile: false }

    mockMobileAppsSvc = { sendViewerData: jest.fn() }

    mockSnackBar = { open: jest.fn() }

    mockConfigSvc = {
      instanceConfig: { logos: { defaultSourceLogo: 'logo.png' } },
      restrictedFeatures: new Set<string>(),
      rootOrg: 'testOrg',
      userProfile: {
        userId: 'user-001',
        rootOrgId: 'root-001',
        firstName: 'Test',
        departmentName: 'TestDept',
      },
      activeOrg: 'TestOrg',
    }

    mockTagSvc = {}
    mockActionSvc = { setUpdateCompGroupO: null }
    mockLogger = { log: jest.fn() }
    mockDatePipe = { transform: jest.fn().mockReturnValue('01-01-2024') }
    mockUserAutoComplete = { searchUser: jest.fn().mockReturnValue(of({})) }
    mockEvents = { dispatchEvent: jest.fn() }
    mockLangTranslations = { translateLabel: jest.fn().mockReturnValue('translated') }
    mockTimerService = {}

    component = buildComponent()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('isMobile getter', () => {
    it('should return false when not mobile', () => {
      expect(component.isMobile).toBe(false)
    })

    it('should return true when mobile', () => {
      mockUtilitySvc.isMobile = true
      component = buildComponent()
      expect(component.isMobile).toBe(true)
    })
  })

  describe('showSubtitleOnBanner getter', () => {
    it('should return tocSvc.subtitleOnBanners value', () => {
      expect(component.showSubtitleOnBanner).toBe(true)
    })
  })

  describe('showStart getter', () => {
    it('should return true when showStartButton returns true', () => {
      component.content = { identifier: 'test-id' } as any
      expect(component.showStart).toBe(true)
    })
  })

  describe('isPostAssessment getter', () => {
    it('should return false when tocConfig has no postAssessment', () => {
      (component as any).tocConfig = { postAssessment: false }
      expect(component.isPostAssessment).toBe(false)
    })

    it('should return false when content is null', () => {
      (component as any).tocConfig = { postAssessment: true }
      component.content = null
      expect(component.isPostAssessment).toBe(false)
    })

    it('should return true for Course with Instructor-Led learning mode', () => {
      (component as any).tocConfig = { postAssessment: true }
      component.content = {
        primaryCategory: 'Course',
        learningMode: 'Instructor-Led',
      } as any
      expect(component.isPostAssessment).toBe(true)
    })

    it('should return false for non-Course content', () => {
      (component as any).tocConfig = { postAssessment: true }
      component.content = {
        primaryCategory: 'Resource',
        learningMode: 'Instructor-Led',
      } as any
      expect(component.isPostAssessment).toBe(false)
    })
  })

  describe('showActionButtons getter', () => {
    it('should return false when actionBtnStatus is wait', () => {
      component.actionBtnStatus = 'wait'
      component.content = { status: 'Live' } as any
      expect(component.showActionButtons).toBe(false)
    })

    it('should return falsy when content is null', () => {
      component.actionBtnStatus = 'grant'
      component.content = null
      expect(component.showActionButtons).toBeFalsy()
    })

    it('should return false when content status is Deleted', () => {
      component.actionBtnStatus = 'grant'
      component.content = { status: 'Deleted' } as any
      expect(component.showActionButtons).toBe(false)
    })

    it('should return true for valid content and grant status', () => {
      component.actionBtnStatus = 'grant'
      component.content = { status: 'Live' } as any
      expect(component.showActionButtons).toBe(true)
    })
  })

  describe('isResource getter', () => {
    it('should return false when content is null', () => {
      component.content = null
      expect(component.isResource).toBe(false)
    })

    it('should return true for KNOWLEDGE_ARTIFACT contentType', () => {
      component.content = {
        contentType: 'Knowledge Artifact',
        children: [],
        artifactUrl: '',
      } as any
      expect(component.isResource).toBe(true)
    })

    it('should return true when no children', () => {
      component.content = {
        contentType: 'Course',
        children: [],
        artifactUrl: 'url',
      } as any
      expect(component.isResource).toBe(true)
    })

    it('should return false for Course with children', () => {
      component.content = {
        contentType: 'Course',
        children: [{ id: '1' }],
        artifactUrl: 'url',
      } as any
      expect(component.isResource).toBe(false)
    })
  })

  describe('showIntranetMsg getter', () => {
    it('should return true when isMobile is true', () => {
      mockUtilitySvc.isMobile = true
      component = buildComponent()
      expect(component.showIntranetMsg).toBe(true)
    })

    it('should return showIntranetMessage when not mobile', () => {
      component.showIntranetMessage = true
      expect(component.showIntranetMsg).toBe(true)
    })
  })

  describe('checkRejected', () => {
    it('should return false when batch is null', () => {
      expect(component.checkRejected(null)).toBe(false)
    })

    it('should return false when batchData has no workFlow', () => {
      component.batchData = {}
      expect(component.checkRejected({ batchId: 'b1' })).toBe(false)
    })

    it('should return true for REJECTED status matching batchId', () => {
      component.batchData = {
        workFlow: {
          wfItem: {
            applicationId: 'batch-001',
            currentStatus: 'REJECTED',
          },
        },
      }
      expect(component.checkRejected({ batchId: 'batch-001' })).toBe(true)
    })

    it('should return false for non-matching batchId', () => {
      component.batchData = {
        workFlow: {
          wfItem: {
            applicationId: 'batch-001',
            currentStatus: 'REJECTED',
          },
        },
      }
      expect(component.checkRejected({ batchId: 'other-batch' })).toBe(false)
    })
  })

  describe('handleEnrollmentEndDate', () => {
    it('should return false when enrollmentEndDate is invalid', () => {
      // dayjs formats undefined as 'Invalid Date' which fails isSame/isAfter => returns false
      expect(component.handleEnrollmentEndDate({ enrollmentEndDate: 'invalid-date' })).toBe(false)
    })

    it('should return true when enrollment end date is today or future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      const result = component.handleEnrollmentEndDate({ enrollmentEndDate: futureDate.toISOString() })
      expect(result).toBe(true)
    })

    it('should return false when enrollment end date is in the past', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      const result = component.handleEnrollmentEndDate({ enrollmentEndDate: pastDate.toISOString() })
      expect(result).toBe(false)
    })
  })

  describe('showIcon getter', () => {
    it('should return false when batchData is null', () => {
      component.batchData = null
      expect(component.showIcon).toBe(false)
    })

    it('should return true for APPROVED status', () => {
      component.batchData = {
        workFlow: { wfItem: { currentStatus: 'APPROVED' } },
      }
      expect(component.showIcon).toBe(true)
    })

    it('should return false for unknown status', () => {
      component.batchData = {
        workFlow: { wfItem: { currentStatus: 'UNKNOWN' } },
      }
      expect(component.showIcon).toBe(false)
    })
  })

  describe('WFIcon getter', () => {
    it('should return empty string when batchData is null', () => {
      component.batchData = null
      expect(component.WFIcon).toBe('')
    })

    it('should return circle for APPROVED status', () => {
      component.batchData = {
        workFlow: { wfItem: { currentStatus: 'APPROVED' } },
      }
      expect(component.WFIcon).toBe('circle')
    })

    it('should return info for REJECTED status', () => {
      component.batchData = {
        workFlow: { wfItem: { currentStatus: 'REJECTED' } },
      }
      expect(component.WFIcon).toBe('info')
    })
  })

  describe('iconColor getter', () => {
    it('should return empty string when batchData is null', () => {
      component.batchData = null
      expect(component.iconColor).toBe(' ')
    })

    it('should return green for APPROVED status', () => {
      component.batchData = {
        workFlow: { wfItem: { currentStatus: 'APPROVED' } },
      }
      expect(component.iconColor).toBe('ws-mat-green-text')
    })

    it('should return orange for SEND_FOR_MDO_APPROVAL', () => {
      component.batchData = {
        workFlow: { wfItem: { currentStatus: 'SEND_FOR_MDO_APPROVAL' } },
      }
      expect(component.iconColor).toBe('ws-mat-orange-text')
    })
  })

  describe('disableWithdrawnBtn getter', () => {
    it('should return false when batchData is null', () => {
      component.batchData = null
      expect(component.disableWithdrawnBtn).toBe(false)
    })

    it('should return true for TWO_STEP_MDO_PC with SEND_FOR_PC_APPROVAL', () => {
      component.batchData = {
        workFlow: {
          wfItem: {
            currentStatus: 'SEND_FOR_PC_APPROVAL',
            serviceName: 'TWO_STEP_MDO_PC',
          },
        },
      }
      expect(component.disableWithdrawnBtn).toBe(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe routerParamSubscription', () => {
      const sub = new Subscription()
      const spy = jest.spyOn(sub, 'unsubscribe')
      component.routerParamSubscription = sub
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should unsubscribe routeSubscription', () => {
      const sub = new Subscription()
      const spy = jest.spyOn(sub, 'unsubscribe')
      component.routeSubscription = sub
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should not throw when subscriptions are null', () => {
      component.routerParamSubscription = null
      component.routeSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('ngOnInit', () => {
    it('should subscribe to serverDate and set tocConfig', () => {
      component.ngOnInit()
      expect((component as any).tocConfig).toEqual({})
    })

    it('should set defaultSLogo from instanceConfig', () => {
      component.ngOnInit()
      expect(component.defaultSLogo).toBe('logo.png')
    })

    it('should handle missing instanceConfig logos', () => {
      mockConfigSvc.instanceConfig = null
      component = buildComponent()
      component.ngOnInit()
      expect(component.defaultSLogo).toBe('')
    })
  })
})

