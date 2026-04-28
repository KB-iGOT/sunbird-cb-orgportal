import { NsAppToc, NsCohorts } from './app-toc.model'

describe('NsAppToc.EWsTocErrorCode', () => {
  it('should have API_FAILURE value', () => {
    expect(NsAppToc.EWsTocErrorCode.API_FAILURE).toBe('API_FAILURE')
  })

  it('should have INVALID_DATA value', () => {
    expect(NsAppToc.EWsTocErrorCode.INVALID_DATA).toBe('INVALID_DATA')
  })

  it('should have NO_DATA value', () => {
    expect(NsAppToc.EWsTocErrorCode.NO_DATA).toBe('NO_DATA')
  })

  it('should be looked up by value', () => {
    const code: NsAppToc.EWsTocErrorCode = NsAppToc.EWsTocErrorCode.API_FAILURE
    expect(code).toBeDefined()
  })
})

describe('NsAppToc interfaces', () => {
  it('should create a valid IWsTocResponse object', () => {
    const response: NsAppToc.IWsTocResponse = {
      content: null,
      errorCode: NsAppToc.EWsTocErrorCode.NO_DATA,
    }
    expect(response.content).toBeNull()
    expect(response.errorCode).toBe('NO_DATA')
  })

  it('should create a valid ITocBanner object', () => {
    const banner: NsAppToc.ITocBanner = {
      analytics: '/analytics',
      overview: '/overview',
      contents: '/contents',
    }
    expect(banner.analytics).toBe('/analytics')
    expect(banner.overview).toBe('/overview')
    expect(banner.contents).toBe('/contents')
  })

  it('should create a valid IPostAssessment object', () => {
    const assessment: NsAppToc.IPostAssessment = {
      userId: 'user1',
      contentId: 'content1',
      post_assessment: true,
    }
    expect(assessment.userId).toBe('user1')
    expect(assessment.post_assessment).toBe(true)
  })

  it('should create a valid IContentParentReq object', () => {
    const req: NsAppToc.IContentParentReq = {
      fields: ['identifier', 'name'],
    }
    expect(req.fields).toHaveLength(2)
  })
})

describe('NsCohorts.ECohortTypes', () => {
  it('should have ACTIVE_USERS value', () => {
    expect(NsCohorts.ECohortTypes.ACTIVE_USERS).toBe('activeusers')
  })

  it('should have COMMON_GOALS value', () => {
    expect(NsCohorts.ECohortTypes.COMMON_GOALS).toBe('commongoals')
  })

  it('should have AUTHORS value', () => {
    expect(NsCohorts.ECohortTypes.AUTHORS).toBe('authors')
  })

  it('should have EDUCATORS value', () => {
    expect(NsCohorts.ECohortTypes.EDUCATORS).toBe('educators')
  })

  it('should have TOP_PERFORMERS value', () => {
    expect(NsCohorts.ECohortTypes.TOP_PERFORMERS).toBe('top-performers')
  })
})
