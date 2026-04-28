import { MicrositeV1Component } from './microsite-v1.component'

describe('MicrositeV1Component', () => {
  let mockRoute: any
  let mockConfigSvc: any

  function createComponent() {
    return new MicrositeV1Component(mockRoute, mockConfigSvc)
  }

  beforeEach(() => {
    mockRoute = {
      snapshot: {
        data: {},
      },
    }
    mockConfigSvc = {}
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation & defaults ──────────────────────────────────────────────────────

  it('should create', () => {
    expect(createComponent()).toBeTruthy()
  })

  it('should default slwConfig to empty object', () => {
    const component = createComponent()
    expect(component.slwConfig).toEqual({})
  })

  it('should default sectionList to empty array', () => {
    const component = createComponent()
    expect(component.sectionList).toEqual([])
  })

  it('should default channelName to empty string', () => {
    const component = createComponent()
    expect(component.channelName).toBe('')
  })

  it('should default orgId to empty string', () => {
    const component = createComponent()
    expect(component.orgId).toBe('')
  })

  it('should default isDefault to false', () => {
    const component = createComponent()
    expect(component.isDefault).toBe(false)
  })

  it('should default userRedirData to empty object', () => {
    const component = createComponent()
    expect(component.userRedirData).toEqual({})
  })

  // ─── configSvc channel extraction ────────────────────────────────────────────

  describe('channelName and orgId from configSvc', () => {
    it('should set channelName and orgId when unMappedUser has channel', () => {
      mockConfigSvc = {
        unMappedUser: { channel: 'igot-channel', rootOrgId: 'org-001' },
      }
      const component = createComponent()
      expect(component.channelName).toBe('igot-channel')
      expect(component.orgId).toBe('org-001')
    })

    it('should leave channelName empty when unMappedUser is absent', () => {
      mockConfigSvc = {}
      const component = createComponent()
      expect(component.channelName).toBe('')
      expect(component.orgId).toBe('')
    })

    it('should leave channelName empty when unMappedUser.channel is absent', () => {
      mockConfigSvc = { unMappedUser: { rootOrgId: 'org-002' } }
      const component = createComponent()
      expect(component.channelName).toBe('')
    })

    it('should not throw when configSvc is null', () => {
      mockConfigSvc = null
      expect(() => createComponent()).not.toThrow()
    })
  })

  // ─── isDefault from route formData ───────────────────────────────────────────

  describe('isDefault', () => {
    it('should set isDefault=true when formData.default is true', () => {
      mockRoute.snapshot.data = { formData: { default: true } }
      const component = createComponent()
      expect(component.isDefault).toBe(true)
    })

    it('should set isDefault=false when formData.default is false', () => {
      mockRoute.snapshot.data = { formData: { default: false } }
      const component = createComponent()
      expect(component.isDefault).toBe(false)
    })

    it('should set isDefault=false when formData is absent', () => {
      mockRoute.snapshot.data = {}
      const component = createComponent()
      expect(component.isDefault).toBe(false)
    })

    it('should set isDefault=false when route is null-safe (optional chaining)', () => {
      mockRoute = { snapshot: { data: null } }
      const component = createComponent()
      expect(component.isDefault).toBe(false)
    })
  })

  // ─── sectionList from route formData ─────────────────────────────────────────

  describe('sectionList', () => {
    it('should populate sectionList from formData.data.sectionList', () => {
      const sections = [{ id: 's1', title: 'Section 1' }]
      mockRoute.snapshot.data = {
        formData: { data: { sectionList: sections } },
      }
      const component = createComponent()
      expect(component.sectionList).toBe(sections)
    })

    it('should leave sectionList empty when formData is absent', () => {
      mockRoute.snapshot.data = {}
      const component = createComponent()
      expect(component.sectionList).toEqual([])
    })

    it('should leave sectionList empty when formData.data is absent', () => {
      mockRoute.snapshot.data = { formData: {} }
      const component = createComponent()
      expect(component.sectionList).toEqual([])
    })

    it('should leave sectionList empty when sectionList key is absent in data', () => {
      mockRoute.snapshot.data = { formData: { data: {} } }
      const component = createComponent()
      expect(component.sectionList).toEqual([])
    })
  })

  // ─── slwConfig from route formData ───────────────────────────────────────────

  describe('slwConfig', () => {
    it('should populate slwConfig from formData.data.stateLearningWeekConfig', () => {
      const config = { startDate: '2024-01-01', endDate: '2024-01-07' }
      mockRoute.snapshot.data = {
        formData: { data: { stateLearningWeekConfig: config } },
      }
      const component = createComponent()
      expect(component.slwConfig).toBe(config)
    })

    it('should leave slwConfig empty when formData is absent', () => {
      mockRoute.snapshot.data = {}
      const component = createComponent()
      expect(component.slwConfig).toEqual({})
    })

    it('should leave slwConfig empty when stateLearningWeekConfig key is absent', () => {
      mockRoute.snapshot.data = { formData: { data: {} } }
      const component = createComponent()
      expect(component.slwConfig).toEqual({})
    })
  })

  // ─── userRedirData from route formData ───────────────────────────────────────

  describe('userRedirData', () => {
    it('should populate userRedirData from formData.data.userRedirectionData', () => {
      const redirectData = { url: '/home', label: 'Home' }
      mockRoute.snapshot.data = {
        formData: { data: { userRedirectionData: redirectData } },
      }
      const component = createComponent()
      expect(component.userRedirData).toBe(redirectData)
    })

    it('should leave userRedirData as empty object when formData is absent', () => {
      mockRoute.snapshot.data = {}
      const component = createComponent()
      expect(component.userRedirData).toEqual({})
    })

    it('should leave userRedirData as empty object when userRedirectionData key is absent', () => {
      mockRoute.snapshot.data = { formData: { data: {} } }
      const component = createComponent()
      expect(component.userRedirData).toEqual({})
    })
  })

  // ─── all data fields populated together ──────────────────────────────────────

  describe('full formData', () => {
    it('should set all fields from a complete formData object', () => {
      const sections = [{ id: 's1' }]
      const slwConfig = { weeks: 4 }
      const redirectData = { url: '/dashboard' }
      mockConfigSvc = {
        unMappedUser: { channel: 'state-channel', rootOrgId: 'org-state' },
      }
      mockRoute.snapshot.data = {
        formData: {
          default: true,
          data: {
            sectionList: sections,
            stateLearningWeekConfig: slwConfig,
            userRedirectionData: redirectData,
          },
        },
      }
      const component = createComponent()
      expect(component.channelName).toBe('state-channel')
      expect(component.orgId).toBe('org-state')
      expect(component.isDefault).toBe(true)
      expect(component.sectionList).toBe(sections)
      expect(component.slwConfig).toBe(slwConfig)
      expect(component.userRedirData).toBe(redirectData)
    })
  })
})
