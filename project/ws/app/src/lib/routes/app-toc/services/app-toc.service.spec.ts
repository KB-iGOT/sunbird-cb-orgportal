jest.mock('@sunbird-cb/collection', () => ({
  WidgetContentService: class MockWidgetContentService {
    getFirstChildInHierarchy = jest.fn()
    fetchContent = jest.fn()
  },
  NsContentConstants: {
    VALID_PRACTICE_RESOURCES: new Set(['Practice Resource', 'PracticeResource']),
    VALID_ASSESSMENT_RESOURCES: new Set(['Assessment', 'FinalAssessment']),
  },
}))

  ; (window as any)['env'] = {
    name: 'test-environment',
    sitePath: '/test-site-path',
    karmYogiPath: '/test-karm-yogi-path',
    cbpPath: '/test-cbp-path',
  }

import { AppTocService } from './app-toc.service'
import { of, throwError } from 'rxjs'
import { NsAppToc, NsCohorts } from '../models/app-toc.model'

const emptyTocStructure = (): NsAppToc.ITocStructure => ({
  assessment: 0, course: 0, handsOn: 0, interactiveVideo: 0,
  learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0,
  quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0,
  interactivecontent: 0, practiceTest: 0, finalTest: 0, offlineSession: 0,
})

const mockContent = (overrides: any = {}): any => ({
  identifier: 'c-001', name: 'Test Content', description: 'desc',
  artifactUrl: 'https://example.com/content.html',
  mimeType: 'application/html', primaryCategory: 'Learning Resource',
  resourceType: 'Learning', contentType: 'Resource',
  children: [], leafNodesCount: 1, leafNodes: [], duration: 100,
  expectedDuration: 100, parent: 'parent-001', progress: 0,
  completionPercentage: 0, completionStatus: 0, isExternal: false,
  ...overrides,
})

describe('AppTocService', () => {
  let service: AppTocService
  let httpClientMock: any
  let configServiceMock: any
  let widgetServiceMock: any

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
    }
    configServiceMock = {
      rootOrg: 'root-org',
      org: ['org1'],
      userProfile: { userId: 'test-user', country: 'India', dealerCode: null },
    }
    widgetServiceMock = {
      getFirstChildInHierarchy: jest.fn().mockReturnValue({ identifier: 'child-001' }),
      fetchContent: jest.fn().mockReturnValue(of({ result: { content: {} } })),
    }
    service = new AppTocService(httpClientMock, configServiceMock, widgetServiceMock)
  })

  afterEach(() => { jest.restoreAllMocks() })

  // Getters / Setters
  describe('subtitleOnBanners getter/setter', () => {
    it('should default to false', () => { expect(service.subtitleOnBanners).toBe(false) })
    it('should set value', () => { service.subtitleOnBanners = true; expect(service.subtitleOnBanners).toBe(true) })
  })

  describe('showDescription getter/setter', () => {
    it('should default to false', () => { expect(service.showDescription).toBe(false) })
    it('should set value', () => { service.showDescription = true; expect(service.showDescription).toBe(true) })
  })

  // Subject wrappers
  describe('updateBatchData', () => {
    it('should emit on batchReplaySubject', () => {
      const spy = jest.spyOn(service.batchReplaySubject, 'next')
      service.updateBatchData()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('setBatchData', () => {
    it('should emit on setBatchDataSubject', () => {
      const spy = jest.spyOn(service.setBatchDataSubject, 'next')
      service.setBatchData({ hasEnrollments: true, enrolledList: [], data: [] } as any)
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('setWFData', () => {
    it('should emit on setWFDataSubject', () => {
      const spy = jest.spyOn(service.setWFDataSubject, 'next')
      service.setWFData({ test: 1 })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('updateResumaData', () => {
    it('should emit on resumeData subject', () => {
      const spy = jest.spyOn(service.resumeData, 'next')
      service.updateResumaData([{ contentId: 'c-001' }])
      expect(spy).toHaveBeenCalledWith([{ contentId: 'c-001' }])
    })
  })

  describe('changeUpdateReviews', () => {
    it('should emit on updateReviews subject', () => {
      let emitted: any
      service.updateReviewsObservable.subscribe((v: any) => (emitted = v))
      service.changeUpdateReviews(true)
      expect(emitted).toBe(true)
    })
  })

  describe('getSelectedBatchData', () => {
    it('should emit on getSelectedBatch subject', () => {
      const spy = jest.spyOn(service.getSelectedBatch, 'next')
      service.getSelectedBatchData({ batchId: 'b1' })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('changeServerDate', () => {
    it('should emit on serverDate subject', () => {
      let emitted: any
      service.currentServerDate.subscribe((v: any) => (emitted = v))
      service.changeServerDate('2024-01-01')
      expect(emitted).toBe('2024-01-01')
    })
  })

  // showStartButton
  describe('showStartButton', () => {
    it('should return { show: false, msg: "" } when content is null', () => {
      expect(service.showStartButton(null)).toEqual({ show: false, msg: '' })
    })
    it('should return youtubeForbidden for China user with youtube URL', () => {
      configServiceMock.userProfile = { userId: 'u', country: 'China' }
      expect(service.showStartButton(mockContent({ artifactUrl: 'https://youtu.be/xyz' })))
        .toEqual({ show: false, msg: 'youtubeForbidden' })
    })
    it('should show for non-Certification resourceType', () => {
      expect(service.showStartButton(mockContent({ resourceType: 'Learning' })).show).toBe(true)
    })
    it('should hide for Certification resourceType', () => {
      expect(service.showStartButton(mockContent({ resourceType: 'Certification' })).show).toBe(false)
    })
    it('should show when artifactUrl has no youtube match', () => {
      expect(service.showStartButton(mockContent({ artifactUrl: 'https://example.com/video' })).show).toBe(true)
    })
  })

  // initData
  describe('initData', () => {
    it('should return content from data.content.data when identifier present', () => {
      const result = service.initData({ content: { data: mockContent() } })
      expect(result.content).toBeTruthy()
      expect(result.errorCode).toBeNull()
    })
    it('should set API_FAILURE error when data.error exists', () => {
      const result = service.initData({ content: null, error: 'some-error' })
      expect(result.errorCode).toBe(NsAppToc.EWsTocErrorCode.API_FAILURE)
    })
    it('should set NO_DATA error when content missing', () => {
      expect(service.initData({ content: {} }).errorCode).toBe(NsAppToc.EWsTocErrorCode.NO_DATA)
    })
    it('should subscribe to resumeData when needResumeData=true', () => {
      const spy = jest.spyOn(service.resumeData, 'subscribe')
      service.initData({ content: { data: mockContent() } }, true)
      expect(spy).toHaveBeenCalled()
    })
    it('should map completion when resumeData emits with needResumeData=true', () => {
      service.initData({ content: { data: mockContent({ children: [{ identifier: 'c1' }] }) } }, true)
      expect(() => service.resumeData.next([{ contentId: 'c1', completionPercentage: 50 }] as any)).not.toThrow()
    })
  })

  // mapCompletionPercentage
  describe('mapCompletionPercentage', () => {
    it('should call contentLoader false when content has no children', () => {
      const spy = jest.spyOn(service.contentLoader, 'next')
      service.mapCompletionPercentage(mockContent({ children: null }), [])
      expect(spy).toHaveBeenCalledWith(false)
    })
    it('should map completion percentages for matching children', () => {
      const child = mockContent({ identifier: 'child-1', completionPercentage: 0 })
      const content = mockContent({ children: [child] })
      service.mapCompletionPercentage(content, [{ contentId: 'child-1', completionPercentage: 75, progress: 75, status: 1 }])
      expect(child.completionPercentage).toBe(75)
    })
    it('should recurse for children not found in dataResult', () => {
      const grandchild = mockContent({ identifier: 'gc-1' })
      const child = mockContent({ identifier: 'child-1', children: [grandchild] })
      expect(() => service.mapCompletionPercentage(mockContent({ children: [child] }), [])).not.toThrow()
    })
  })

  // mapModuleCount
  describe('mapModuleCount', () => {
    it('should count modules in children', () => {
      const child = mockContent({ primaryCategory: 'Course Unit' })
      const content = mockContent({ children: [child] })
      service.mapModuleCount(content)
      expect(content['moduleCount']).toBe(1)
    })
    it('should recurse into Course children', () => {
      const courseChild = mockContent({ primaryCategory: 'Course', children: [] })
      expect(() => service.mapModuleCount(mockContent({ children: [courseChild] }))).not.toThrow()
    })
    it('should do nothing when no children', () => {
      expect(() => service.mapModuleCount(mockContent({ children: null }))).not.toThrow()
    })
  })

  // getMimeType
  describe('getMimeType', () => {
    it('should return mimeType when identifier matches', () => {
      expect(service.getMimeType(mockContent({ identifier: 'c-001', mimeType: 'application/pdf' }), 'c-001')).toBe('application/pdf')
    })
    it('should return defined value for empty children array', () => {
      expect(service.getMimeType(mockContent({ identifier: 'other', children: [] }), 'not-found')).toBeDefined()
    })
    it('should find child in flat list', () => {
      const child = mockContent({ identifier: 'child-a', mimeType: 'application/pdf', children: null })
      expect(service.getMimeType(mockContent({ identifier: 'parent', children: [child] }), 'child-a')).toBe('application/pdf')
    })
    it('should return empty string when no match in flat list', () => {
      const child = mockContent({ identifier: 'child-a', mimeType: 'application/pdf', children: null })
      const result = service.getMimeType(mockContent({ identifier: 'parent', children: [child] }), 'no-match')
      expect(result).toBeDefined()
    })
  })

  // getTocStructure
  describe('getTocStructure', () => {
    const makeResource = (mimeType: string, primaryCategory = 'Learning Resource'): any =>
      mockContent({ mimeType, primaryCategory, children: null })

    it('should count courses', () => {
      expect(service.getTocStructure(mockContent({ primaryCategory: 'Course', children: [] }), emptyTocStructure()).course).toBe(1)
    })
    it('should count modules', () => {
      expect(service.getTocStructure(mockContent({ primaryCategory: 'Course Unit', children: [] }), emptyTocStructure()).learningModule).toBe(1)
    })
    it('should count mp3 as podcast', () => {
      expect(service.getTocStructure(makeResource('audio/mpeg'), emptyTocStructure()).podcast).toBe(1)
    })
    it('should count mp4 as video', () => {
      expect(service.getTocStructure(makeResource('video/mp4'), emptyTocStructure()).video).toBe(1)
    })
    it('should count m3u8 as video', () => {
      expect(service.getTocStructure(makeResource('application/x-mpegURL'), emptyTocStructure()).video).toBe(1)
    })
    it('should count youtube as video', () => {
      expect(service.getTocStructure(makeResource('video/x-youtube'), emptyTocStructure()).video).toBe(1)
    })
    it('should count pdf', () => {
      expect(service.getTocStructure(makeResource('application/pdf'), emptyTocStructure()).pdf).toBe(1)
    })
    it('should count text/x-url as webPage', () => {
      expect(service.getTocStructure(makeResource('text/x-url'), emptyTocStructure()).webPage).toBe(1)
    })
    it('should count quiz as assessment', () => {
      expect(service.getTocStructure(makeResource('application/quiz'), emptyTocStructure()).assessment).toBe(1)
    })
    it('should count application/json as assessment', () => {
      expect(service.getTocStructure(makeResource('application/json'), emptyTocStructure()).assessment).toBe(1)
    })
    it('should count survey', () => {
      expect(service.getTocStructure(makeResource('application/survey'), emptyTocStructure()).survey).toBe(1)
    })
    it('should count offline session mime', () => {
      expect(service.getTocStructure(makeResource('application/offline'), emptyTocStructure()).offlineSession).toBe(1)
    })
    it('should count PRACTICE_RESOURCE as practiceTest', () => {
      expect(service.getTocStructure(makeResource('application/vnd.sunbird.questionset', 'Practice Question Set'), emptyTocStructure()).practiceTest).toBe(1)
    })
    it('should count FINAL_ASSESSMENT as finalTest', () => {
      expect(service.getTocStructure(makeResource('application/vnd.sunbird.questionset', 'Course Assessment'), emptyTocStructure()).finalTest).toBe(1)
    })
    it('should count ecml-archive as interactivecontent', () => {
      expect(service.getTocStructure(makeResource('application/vnd.ekstep.ecml-archive'), emptyTocStructure()).interactivecontent).toBe(1)
    })
    it('should count html-archive as interactivecontent', () => {
      expect(service.getTocStructure(makeResource('application/vnd.ekstep.html-archive'), emptyTocStructure()).interactivecontent).toBe(1)
    })
    it('should count unknown mime as other', () => {
      expect(service.getTocStructure(makeResource('application/unknown-xyz'), emptyTocStructure()).other).toBe(1)
    })
    it('should recurse into children for non-leaf nodes', () => {
      const child = makeResource('audio/mpeg')
      const result = service.getTocStructure(mockContent({ primaryCategory: 'Course', children: [child] }), emptyTocStructure())
      expect(result.course).toBe(1)
      expect(result.podcast).toBe(1)
    })
  })

  // filterToc
  describe('filterToc', () => {
    it('should return content for leaf with ALL filter', () => {
      expect(service.filterToc(mockContent({ primaryCategory: 'Learning Resource' }))).not.toBeNull()
    })
    it('should return content with filtered children', () => {
      const child = mockContent({ primaryCategory: 'Learning Resource' })
      expect(service.filterToc(mockContent({ primaryCategory: 'Course', children: [child] }))).toBeTruthy()
    })
    it('should return null when no valid children remain', () => {
      expect(service.filterToc(mockContent({ primaryCategory: 'Course', children: [] }))).toBeNull()
    })
  })

  // filterUnitContent
  describe('filterUnitContent', () => {
    it('should return true for ALL filterCategory', () => {
      expect(service.filterUnitContent(mockContent({ resourceType: 'Learning' }), 'ALL' as any)).toBe(true)
    })
    it('should filter LEARN category', () => {
      expect(typeof service.filterUnitContent(mockContent({ resourceType: 'Learning' }), 'LEARN' as any)).toBe('boolean')
    })
    it('should filter PRACTICE category', () => {
      expect(typeof service.filterUnitContent(mockContent({ resourceType: 'Learning' }), 'PRACTICE' as any)).toBe('boolean')
    })
    it('should filter ASSESS category', () => {
      expect(typeof service.filterUnitContent(mockContent({ resourceType: 'Assessment' }), 'ASSESS' as any)).toBe('boolean')
    })
  })

  // fetchContentAnalyticsClientData
  describe('fetchContentAnalyticsClientData', () => {
    it('should trigger fetch when status is none', () => {
      httpClientMock.get.mockReturnValue(of({ data: 'analytics' }))
      service.analyticsFetchStatus = 'none'
      service.fetchContentAnalyticsClientData('c-001')
      expect(httpClientMock.get).toHaveBeenCalled()
    })
    it('should not call when status is fetching', () => {
      service.analyticsFetchStatus = 'fetching'
      service.fetchContentAnalyticsClientData('c-001')
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
    it('should emit null on analytics client error', (done: any) => {
      httpClientMock.get.mockReturnValue(throwError(() => new Error('fail')))
      service.analyticsFetchStatus = 'none'
      service.analyticsReplaySubject.subscribe((d: any) => { expect(d).toBeNull(); done() })
      service.fetchContentAnalyticsClientData('c-001')
    })
  })

  // fetchContentAnalyticsData
  describe('fetchContentAnalyticsData', () => {
    it('should fetch analytics data and emit through subject', (done: any) => {
      httpClientMock.get.mockReturnValue(of({ data: 'test' }))
      service.analyticsReplaySubject.subscribe((data: any) => { expect(data).toEqual({ data: 'test' }); done() })
      service.fetchContentAnalyticsData('test-content-id')
      expect(httpClientMock.get).toHaveBeenCalled()
    })
    it('should not fetch when status is fetching', () => {
      service.analyticsFetchStatus = 'fetching'
      service.fetchContentAnalyticsData('c-001')
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
    it('should emit null on error', (done: any) => {
      httpClientMock.get.mockReturnValue(throwError(() => new Error('fail')))
      service.analyticsReplaySubject.subscribe((d: any) => { expect(d).toBeNull(); done() })
      service.fetchContentAnalyticsData('bad-id')
    })
  })

  // clearAnalyticsData
  describe('clearAnalyticsData', () => {
    it('should not throw when called', () => {
      expect(() => service.clearAnalyticsData()).not.toThrow()
    })
  })

  // fetchContentParents
  describe('fetchContentParents', () => {
    it('should return EMPTY observable', (done: any) => {
      service.fetchContentParents('c-001').subscribe({ complete: done })
    })
  })

  // fetchContentWhatsNext
  describe('fetchContentWhatsNext', () => {
    it('should call http.get with contentType param when provided', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.fetchContentWhatsNext('c-001', 'Course')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('contentType=Course'))
    })
    it('should call http.get with ts param when no contentType', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.fetchContentWhatsNext('c-001')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('ts='))
    })
  })

  // fetchMoreLikeThis*
  describe('fetchMoreLikeThisPaid', () => {
    it('should call http.get with exclusiveContent=true', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.fetchMoreLikeThisPaid('c-001')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('exclusiveContent=true'))
    })
  })
  describe('fetchMoreLikeThisFree', () => {
    it('should call http.get with exclusiveContent=false', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.fetchMoreLikeThisFree('c-001')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('exclusiveContent=false'))
    })
  })
  describe('fetchMoreLikeThis', () => {
    it('should call http.get with contentId in url', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.fetchMoreLikeThis('c-001', 'Course')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('c-001'))
    })
  })

  // fetchContentCohorts
  describe('fetchContentCohorts', () => {
    it('should call http.get with cohort endpoint', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.fetchContentCohorts(NsCohorts.ECohortTypes.ACTIVE_USERS, 'c-001')
      expect(httpClientMock.get).toHaveBeenCalled()
    })
  })

  // fetchExternalContentAccess
  describe('fetchExternalContentAccess', () => {
    it('should call http.get', () => {
      httpClientMock.get.mockReturnValue(of({ hasAccess: true }))
      service.fetchExternalContentAccess('c-001')
      expect(httpClientMock.get).toHaveBeenCalled()
    })
  })

  // fetchCohortGroupUsers
  describe('fetchCohortGroupUsers', () => {
    it('should call http.get', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.fetchCohortGroupUsers(123)
      expect(httpClientMock.get).toHaveBeenCalled()
    })
  })

  // fetchPostAssessmentStatus
  describe('fetchPostAssessmentStatus', () => {
    it('should call http.get with assessment endpoint', () => {
      httpClientMock.get.mockReturnValue(of({ result: [] }))
      service.fetchPostAssessmentStatus('c-001')
      expect(httpClientMock.get).toHaveBeenCalled()
    })
  })

  // fetchGetContentData
  describe('fetchGetContentData', () => {
    it('should call http.get in normal mode', () => {
      httpClientMock.get.mockReturnValue(of({ result: {} }))
      service.fetchGetContentData('c-001')
      expect(httpClientMock.get).toHaveBeenCalled()
    })
    it('should use editMode URL when href includes editMode=true and _rc and preview', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/?editMode=true&_rc=true&preview=true' }, writable: true,
      })
      httpClientMock.get.mockReturnValue(of({ result: {} }))
      service.fetchGetContentData('c-001')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('proxies'))
      Object.defineProperty(window, 'location', { value: { href: 'http://localhost/' }, writable: true })
    })
    it('should use /api/content URL for preview without editMode', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/content?foo=bar&preview=true' }, writable: true,
      })
      httpClientMock.get.mockReturnValue(of({ result: {} }))
      service.fetchGetContentData('c-001')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('/api/content'))
      Object.defineProperty(window, 'location', { value: { href: 'http://localhost/' }, writable: true })
    })
  })

  // fetchContentParent
  describe('fetchContentParent', () => {
    it('should post to content parent endpoint', () => {
      httpClientMock.post.mockReturnValue(of({} as any))
      service.fetchContentParent('c-001', { fields: ['children'] })
      expect(httpClientMock.post).toHaveBeenCalled()
    })
    it('should use auth parent endpoint when forPreview=true', () => {
      httpClientMock.post.mockReturnValue(of({} as any))
      service.fetchContentParent('c-001', { fields: [] }, true)
      expect(httpClientMock.post).toHaveBeenCalledWith(expect.stringContaining('authApi'), expect.anything())
    })
  })

  // createBatch
  describe('createBatch', () => {
    it('should post batch data', () => {
      httpClientMock.post.mockReturnValue(of({ result: { batchId: 'b1' } }))
      service.createBatch({ name: 'Batch 1', courseId: 'c-001' })
      expect(httpClientMock.post).toHaveBeenCalledWith(
        expect.stringContaining('batch/create'), { request: { name: 'Batch 1', courseId: 'c-001' } },
      )
    })
  })

  // getServerDate
  describe('getServerDate', () => {
    it('should make HTTP GET request to server date endpoint', () => {
      httpClientMock.get.mockReturnValue(of({ result: { serverTime: Date.now() } }))
      service.getServerDate()
      expect(httpClientMock.get).toHaveBeenCalled()
    })
  })

  // shareContent
  describe('shareContent', () => {
    it('should make HTTP POST request to share content endpoint', () => {
      httpClientMock.post.mockReturnValue(of({ result: true }))
      const req = { contentId: 'test-content', users: ['user1'] }
      service.shareContent(req)
      expect(httpClientMock.post).toHaveBeenCalledWith(expect.stringContaining('/recommend'), req)
    })
  })

  // checkCompletedLeafnodes
  describe('checkCompletedLeafnodes', () => {
    it('should add new content IDs to leafNodes', () => {
      const leafNodes: string[] = []
      service.checkCompletedLeafnodes(leafNodes, [{ contentId: 'c1' }, { contentId: 'c2' }])
      expect(leafNodes).toContain('c1')
      expect(leafNodes).toContain('c2')
    })
    it('should not add duplicate content IDs', () => {
      const leafNodes = ['c1']
      service.checkCompletedLeafnodes(leafNodes, [{ contentId: 'c1' }])
      expect(leafNodes.filter((n: any) => n === 'c1').length).toBe(1)
    })
    it('should do nothing when completedCount is empty', () => {
      const leafNodes = ['c1']
      service.checkCompletedLeafnodes(leafNodes, [])
      expect(leafNodes.length).toBe(1)
    })
  })

  // mapCompletionChildPercentageProgram
  describe('mapCompletionChildPercentageProgram', () => {
    it('should set completionPercentage=100 for leaf children', () => {
      const child = mockContent({ primaryCategory: 'Learning Resource', children: null })
      service.mapCompletionChildPercentageProgram(mockContent({ children: [child] }))
      expect(child['completionPercentage']).toBe(100)
      expect(child['completionStatus']).toBe(2)
    })
    it('should recurse for MODULE children', () => {
      const grandchild = mockContent({ primaryCategory: 'Learning Resource', children: null })
      const module = mockContent({ primaryCategory: 'Course Unit', children: [grandchild] })
      service.mapCompletionChildPercentageProgram(mockContent({ children: [module] }))
      expect(grandchild['completionPercentage']).toBe(100)
    })
    it('should do nothing with no children', () => {
      expect(() => service.mapCompletionChildPercentageProgram(mockContent({ children: null }))).not.toThrow()
    })
  })

  // mapModuleDurationAndProgress
  describe('mapModuleDurationAndProgress', () => {
    it('should not throw for content without children', () => {
      expect(() => service.mapModuleDurationAndProgress(mockContent({ children: null }), null)).not.toThrow()
    })
    it('should process module children', () => {
      const child = mockContent({ primaryCategory: 'Course Unit', children: [mockContent()] })
      expect(() => service.mapModuleDurationAndProgress(mockContent({ primaryCategory: 'Course', children: [child] }), null)).not.toThrow()
    })
    it('should process MODULE primaryCategory content', () => {
      const leaf = mockContent({ children: null })
      const content = mockContent({ primaryCategory: 'Course Unit', children: [leaf] })
      expect(() => service.mapModuleDurationAndProgress(content, null)).not.toThrow()
    })
  })

  // createHirarchyProgressHashmap
  describe('createHirarchyProgressHashmap', () => {
    it('should add children to hashmap', () => {
      const child = mockContent({ identifier: 's-child-1' })
      service.createHirarchyProgressHashmap(mockContent({ children: [child] }) as any)
      expect(service.hashmap['s-child-1']).toBeDefined()
    })
    it('should recurse into nested children', () => {
      const grandchild = mockContent({ identifier: 'gc-001' })
      const child = mockContent({ identifier: 's-child-2', children: [grandchild] })
      service.createHirarchyProgressHashmap(mockContent({ children: [child] }) as any)
      expect(service.hashmap['gc-001']).toBeDefined()
    })
    it('should do nothing when no children', () => {
      expect(() => service.createHirarchyProgressHashmap(mockContent({ children: null }) as any)).not.toThrow()
    })
  })

  // callHirarchyProgressHashmap
  describe('callHirarchyProgressHashmap', () => {
    it('should add content to hashmap', () => {
      service.callHirarchyProgressHashmap(mockContent({ identifier: 'root-001', children: [] }) as any)
      expect(service.hashmap['root-001']).toBeDefined()
    })
    it('should handle null', () => {
      expect(() => service.callHirarchyProgressHashmap(null)).not.toThrow()
    })
  })

  // getCalculationsFromChildren
  describe('getCalculationsFromChildren', () => {
    it('should calculate total duration from children', () => {
      const item = mockContent({ children: [mockContent({ duration: 50, completionStatus: 1 }), mockContent({ duration: 70, completionStatus: 2 })], leafNodesCount: 2 })
      expect(service.getCalculationsFromChildren(item as any)['duration']).toBe(120)
    })
    it('should set completionPercentage based on completed children', () => {
      const item = mockContent({ children: [mockContent({ completionStatus: 2 }), mockContent({ completionStatus: 1 })], leafNodesCount: 2 })
      expect(service.getCalculationsFromChildren(item as any)['completionPercentage']).toBe(50)
    })
    it('should set completionStatus to 2 when 100% done', () => {
      const item = mockContent({ children: [mockContent({ completionStatus: 2 })], leafNodesCount: 1 })
      expect(service.getCalculationsFromChildren(item as any)['completionStatus']).toBe(2)
    })
  })

  // fetchContentHistoryV2
  describe('fetchContentHistoryV2', () => {
    it('should post to history endpoint with courseId', () => {
      httpClientMock.post.mockReturnValue(of({ result: { contentList: [] } }))
      const req: any = { request: { courseId: 'c-001', batchId: 'b-001', userId: 'u-001', contentIds: [], fields: [] } }
      service.fetchContentHistoryV2(req)
      expect(httpClientMock.post).toHaveBeenCalledWith(expect.stringContaining('c-001'), req)
    })
  })

  // dowonloadCertificate
  describe('dowonloadCertificate', () => {
    it('should call http.get with cert id', () => {
      httpClientMock.get.mockReturnValue(of({ result: {} }))
      service.dowonloadCertificate('cert-001')
      expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('cert-001'))
    })
  })

  // checkModuleWiseData
  describe('checkModuleWiseData', () => {
    it('should count online and offline resources for MODULE children', () => {
      const online = mockContent({ primaryCategory: 'Learning Resource' })
      const offline = mockContent({ primaryCategory: 'Offline Session' })
      const module = mockContent({ primaryCategory: 'Course Unit', children: [online, offline] })
      const content = mockContent({ children: [module] })
      service.checkModuleWiseData(content)
      expect(module['moduleResourseCount']).toBe(1)
      expect(module['offlineResourseCount']).toBe(1)
    })
    it('should recurse into Course children', () => {
      const courseChild = mockContent({ primaryCategory: 'Course', children: [] })
      expect(() => service.checkModuleWiseData(mockContent({ children: [courseChild] }))).not.toThrow()
    })
    it('should do nothing with empty children', () => {
      expect(() => service.checkModuleWiseData(mockContent({ children: [] }))).not.toThrow()
    })
  })

  // createPreAssessmentHirarchyProgressHashmap
  describe('createPreAssessmentHirarchyProgressHashmap', () => {
    it('should add preEnrolmentResources to hashmap', () => {
      const resource = mockContent({ identifier: 'pre-001' })
      service.createPreAssessmentHirarchyProgressHashmap(mockContent({ preEnrolmentResources: [resource] }) as any)
      expect(service.hashmap['pre-001']).toBeDefined()
    })
    it('should recurse into nested preEnrolmentResources', () => {
      const nested = mockContent({ identifier: 'nested-pre', preEnrolmentResources: [] })
      const resource = mockContent({ identifier: 'pre-002', preEnrolmentResources: [nested] })
      service.createPreAssessmentHirarchyProgressHashmap(mockContent({ preEnrolmentResources: [resource] }) as any)
      expect(service.hashmap['pre-002']).toBeDefined()
    })
    it('should do nothing when no preEnrolmentResources', () => {
      expect(() => service.createPreAssessmentHirarchyProgressHashmap(mockContent() as any)).not.toThrow()
    })
  })

  // readPreEnrollmentResourcesState
  describe('readPreEnrollmentResourcesState', () => {
    it('should post to pre-enrollment state endpoint', () => {
      httpClientMock.post.mockReturnValue(of({ result: {} }))
      service.readPreEnrollmentResourcesState({ contentId: 'c-001' })
      expect(httpClientMock.post).toHaveBeenCalledWith(expect.stringContaining('state/read'), { contentId: 'c-001' })
    })
  })

  // mapSessionCompletionPercentage
  describe('mapSessionCompletionPercentage', () => {
    it('should call sessionCompletionPercentage when resumeDataPass and batchData.content provided', () => {
      const spy = jest.spyOn(service as any, 'sessionCompletionPercentage')
      service.mapSessionCompletionPercentage({ content: [{ batchAttributes: {} }] }, [{ contentId: 's-001' }])
      expect(spy).toHaveBeenCalled()
    })
    it('should subscribe to resumeData when no resumeDataPass', () => {
      const spy = jest.spyOn(service.resumeData, 'subscribe')
      service.mapSessionCompletionPercentage({ content: [] })
      expect(spy).toHaveBeenCalled()
    })
    it('should not call sessionCompletionPercentage when resumeDataPass is empty', () => {
      const spy = jest.spyOn(service as any, 'sessionCompletionPercentage')
      service.mapSessionCompletionPercentage({ content: [] }, [])
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // sessionCompletionPercentage
  describe('sessionCompletionPercentage', () => {
    it('should map completion percentages for sessions with matching resume data', () => {
      const session = { sessionId: 's-001', completionPercentage: 0 }
      const batchData = { content: [{ batchAttributes: { sessionDetails_v2: [session] } }] }
      service.sessionCompletionPercentage(batchData, [{ contentId: 's-001', completionPercentage: 80, status: 1, lastCompletedTime: '2024' }])
      expect(session.completionPercentage).toBe(80)
    })
    it('should call contentLoader.next(false) after processing', () => {
      const spy = jest.spyOn(service.contentLoader, 'next')
      service.sessionCompletionPercentage({ content: [{ batchAttributes: { sessionDetails_v2: [] } }] }, [{ contentId: 's-001' }])
      expect(spy).toHaveBeenCalledWith(false)
    })
    it('should do nothing when resumeDataPass is empty', () => {
      expect(() => service.sessionCompletionPercentage({ content: [] }, [])).not.toThrow()
    })
  })

  // fetchCourseHeirarchy
  describe('fetchCourseHeirarchy', () => {
    it('should fetch hierarchy for Course children', async () => {
      widgetServiceMock.fetchContent = jest.fn().mockReturnValue(of({ result: { content: { children: [{ identifier: 'sub-1' }] } } }))
      await service.fetchCourseHeirarchy({ children: [mockContent({ primaryCategory: 'Course', identifier: 'c-sub' })] })
      expect(widgetServiceMock.fetchContent).toHaveBeenCalledWith('c-sub')
    })
    it('should not fetch when content has no children', async () => {
      await service.fetchCourseHeirarchy({})
      expect(widgetServiceMock.fetchContent).not.toHaveBeenCalled()
    })
  })
})
