import { of, Subject } from 'rxjs'
import { SubapplicationRespondService } from './subapplication-responsd.service'

describe('SubapplicationRespondService', () => {
  let service: SubapplicationRespondService
  let mockConfigSvc: any
  let mockContentSvc: any
  let mockActivatedRoute: any
  let mockRouter: any
  let prefChangeSubject: Subject<any>

  beforeEach(() => {
    prefChangeSubject = new Subject()
    mockConfigSvc = {
      prefChangeNotifier: prefChangeSubject,
      userProfile: { userId: 'user-001', userName: 'John Doe' },
      rootOrg: 'igot',
      activeOrg: 'dopt',
      userRoles: new Set(['ROLE_1', 'ROLE_2']),
      activeThemeObject: { themeName: 'light', color: { primary: '#fff' } },
      activeFontObject: { baseFontSize: '16px' },
      userPreference: { selectedLocale: 'en' },
      isDarkMode: false,
    }
    mockContentSvc = {
      fetchContentHistory: jest.fn().mockReturnValue(
        of({ continueData: { data: { page: 1 } } }),
      ),
      saveContinueLearning: jest.fn().mockReturnValue(of({})),
    }
    mockActivatedRoute = {
      snapshot: {
        queryParams: {},
      },
    }
    mockRouter = { url: '/viewer/iap-001' }

    service = new SubapplicationRespondService(
      mockConfigSvc,
      mockContentSvc,
      mockActivatedRoute,
      mockRouter,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ─── Creation ────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with loaded=false', () => {
    expect(service.loaded).toBe(false)
  })

  it('should initialize with empty subAppname', () => {
    expect(service.subAppname).toBe('')
  })

  it('should initialize continueLearningData as null', () => {
    expect(service.continueLearningData).toBeNull()
  })

  // ─── loadedRespond - RESUME viewMode ─────────────────────────────────────
  describe('loadedRespond - RESUME viewMode', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParams = { viewMode: 'RESUME' }
    })

    it('should fetch content history when id is provided and viewMode=RESUME', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP', 'content-001')
      expect(mockContentSvc.fetchContentHistory).toHaveBeenCalledWith('content-001')
    })

    it('should post LOADED response to contentWindow after fetching history', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP', 'content-001')
      expect(win.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'LOADED', subApplicationName: 'IAP' }),
        '*',
      )
    })

    it('should include continueLearning data when continueData.data is set', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP', 'content-001')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.data).not.toBeNull()
      expect(posted.data.continueLearning).toEqual({ page: 1 })
    })

    it('should send null data when continueData.data is absent', () => {
      mockContentSvc.fetchContentHistory.mockReturnValue(of({ continueData: {} }))
      service = new SubapplicationRespondService(
        mockConfigSvc, mockContentSvc, mockActivatedRoute, mockRouter,
      )
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP', 'content-001')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.data).toBeNull()
    })

    it('should set loaded=true and store contentWindowinfo after RESUME response', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP', 'content-001')
      expect(service.loaded).toBe(true)
      expect(service.contentWindowinfo).toBe(win)
    })

    it('should set subAppname after RESUME response', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'TestApp', 'content-001')
      expect(service.subAppname).toBe('TestApp')
    })

    it('should include user firstName derived from userName', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP', 'content-001')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.user.firstName).toBe('John')
    })

    it('should not postMessage when userProfile is null in RESUME mode', () => {
      mockConfigSvc.userProfile = null
      service = new SubapplicationRespondService(
        mockConfigSvc, mockContentSvc, mockActivatedRoute, mockRouter,
      )
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP', 'content-001')
      // fetchContentHistory is still called but postMessage is not
      expect(win.postMessage).not.toHaveBeenCalled()
    })
  })

  // ─── loadedRespond - normal mode (no RESUME) ─────────────────────────────
  describe('loadedRespond - normal mode', () => {
    it('should post LOADED response without fetching history', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      expect(mockContentSvc.fetchContentHistory).not.toHaveBeenCalled()
      expect(win.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'LOADED', subApplicationName: 'IAP' }),
        '*',
      )
    })

    it('should set loaded=true and store contentWindowinfo', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      expect(service.loaded).toBe(true)
      expect(service.contentWindowinfo).toBe(win)
    })

    it('should set subAppname', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'MySubApp')
      expect(service.subAppname).toBe('MySubApp')
    })

    it('should include user info in parentContext', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.user.userId).toBe('user-001')
      expect(posted.parentContext.user.firstName).toBe('John')
    })

    it('should include roles array in user', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.user.roles).toEqual(['ROLE_1', 'ROLE_2'])
    })

    it('should use empty array for roles when userRoles is null', () => {
      mockConfigSvc.userRoles = null
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.user.roles).toEqual([])
    })

    it('should use empty string for theme when activeThemeObject is null', () => {
      mockConfigSvc.activeThemeObject = null
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.theme).toBe('')
    })

    it('should include theme from activeThemeObject when present', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.theme).toBeTruthy()
      expect(posted.parentContext.theme.name).toBe('light')
    })

    it('should default fontSize to 14px when activeFontObject is null', () => {
      mockConfigSvc.activeFontObject = null
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.fontSize).toBe('14px')
    })

    it('should use configured fontSize when activeFontObject is present', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.fontSize).toBe('16px')
    })

    it('should default locale to en when userPreference is null', () => {
      mockConfigSvc.userPreference = null
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.locale).toBe('en')
    })

    it('should use selectedLocale from userPreference', () => {
      mockConfigSvc.userPreference = { selectedLocale: 'hi' }
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.locale).toBe('hi')
    })

    it('should include empty firstName when userName is not set', () => {
      mockConfigSvc.userProfile = { userId: 'u2', userName: '' }
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.user.firstName).toBe('')
    })

    it('should include data=null in normal mode response', () => {
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.data).toBeNull()
    })

    it('should not call postMessage when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      expect(win.postMessage).not.toHaveBeenCalled()
    })

    it('should include viewMode in subApplicationStartMode', () => {
      mockActivatedRoute.snapshot.queryParams = { viewMode: 'PREVIEW' }
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.subApplicationStartMode).toBe('PREVIEW')
    })

    it('should use empty string subApplicationStartMode when no viewMode', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      const win = { postMessage: jest.fn() }
      service.loadedRespond(win, 'IAP')
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.subApplicationStartMode).toBe('')
    })
  })

  // ─── continueLearningRespond ──────────────────────────────────────────────
  describe('continueLearningRespond', () => {
    it('should call saveContinueLearning', () => {
      service.continueLearningRespond('content-001', { page: 1 })
      expect(mockContentSvc.saveContinueLearning).toHaveBeenCalled()
    })

    it('should pass contextPathId and resourceId as the id', () => {
      service.continueLearningRespond('content-001', { page: 1 })
      const args = mockContentSvc.saveContinueLearning.mock.calls[0][0]
      expect(args.contextPathId).toBe('content-001')
      expect(args.resourceId).toBe('content-001')
    })

    it('should serialize continueLearning data as JSON string', () => {
      service.continueLearningRespond('content-001', { page: 2 })
      const args = mockContentSvc.saveContinueLearning.mock.calls[0][0]
      const parsed = JSON.parse(args.data)
      expect(parsed.data).toEqual({ page: 2 })
    })
  })

  // ─── unsubscribeResponse ─────────────────────────────────────────────────
  describe('unsubscribeResponse', () => {
    it('should reset subAppname to empty string', () => {
      service.subAppname = 'IAP'
      service.unsubscribeResponse()
      expect(service.subAppname).toBe('')
    })

    it('should reset loaded to false', () => {
      service.loaded = true
      service.unsubscribeResponse()
      expect(service.loaded).toBe(false)
    })

    it('should reset continueLearningData to null', () => {
      service.continueLearningData = { x: 1 }
      service.unsubscribeResponse()
      expect(service.continueLearningData).toBeNull()
    })

    it('should reset contentWindowinfo to null', () => {
      service.contentWindowinfo = { postMessage: jest.fn() }
      service.unsubscribeResponse()
      expect(service.contentWindowinfo).toBeNull()
    })
  })

  // ─── changeContextrespond ─────────────────────────────────────────────────
  describe('changeContextrespond', () => {
    it('should post CONTEXT_CHANGE when all dependencies ready', () => {
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      service.changeContextrespond()
      expect(win.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'CONTEXT_CHANGE', subApplicationName: 'IAP' }),
        '*',
      )
    })

    it('should not post when loaded=false', () => {
      const win = { postMessage: jest.fn() }
      service.loaded = false
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      service.changeContextrespond()
      expect(win.postMessage).not.toHaveBeenCalled()
    })

    it('should not post when contentWindowinfo is null', () => {
      service.loaded = true
      service.contentWindowinfo = null
      service.subAppname = 'IAP'
      expect(() => service.changeContextrespond()).not.toThrow()
    })

    it('should not post when subAppname is empty', () => {
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = ''
      service.changeContextrespond()
      expect(win.postMessage).not.toHaveBeenCalled()
    })

    it('should post CONTEXT_CHANGE when prefChangeNotifier emits', () => {
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      prefChangeSubject.next({})
      expect(win.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ requestId: 'CONTEXT_CHANGE' }),
        '*',
      )
    })

    it('should include user firstName in CONTEXT_CHANGE', () => {
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      service.changeContextrespond()
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.user.firstName).toBe('John')
    })

    it('should use empty string theme when activeThemeObject is null in context change', () => {
      mockConfigSvc.activeThemeObject = null
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      service.changeContextrespond()
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.theme).toBe('')
    })

    it('should use 14px default fontSize when activeFontObject is null in context change', () => {
      mockConfigSvc.activeFontObject = null
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      service.changeContextrespond()
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.fontSize).toBe('14px')
    })

    it('should use en locale when userPreference is null in context change', () => {
      mockConfigSvc.userPreference = null
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      service.changeContextrespond()
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.locale).toBe('en')
    })

    it('should use empty array for roles when userRoles is null in context change', () => {
      mockConfigSvc.userRoles = null
      const win = { postMessage: jest.fn() }
      service.loaded = true
      service.contentWindowinfo = win
      service.subAppname = 'IAP'
      service.changeContextrespond()
      const posted = win.postMessage.mock.calls[0][0]
      expect(posted.parentContext.user.roles).toEqual([])
    })
  })
})
