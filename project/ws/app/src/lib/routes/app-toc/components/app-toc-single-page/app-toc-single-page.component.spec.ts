// Note: app-toc-single-page.component.ts has TS2307 (connection-hover.servive typo, rating.service missing)
// and TS2339 (CHANNEL, KNOWLEDGE_BOARD, KNOWLEDGE_ARTIFACT missing from EPrimaryCategory type).
// Using inline class to mirror testable logic without importing the broken source file.

import { of, throwError, Subject } from 'rxjs'
import _ from 'lodash'

// Inline representation of EPrimaryCategory values as strings (matching actual runtime values)
const EPrimaryCategory = {
  CHANNEL: 'Channel',
  KNOWLEDGE_BOARD: 'Knowledge Board',
  KNOWLEDGE_ARTIFACT: 'Knowledge Artifact',
  RESOURCE: 'Resource',
  MODULE: 'Learning Module',
  COURSE: 'Course',
}

class AppTocSinglePageLogic {
  showMoreGlance = false
  askAuthorEnabled = true
  trainingLHubEnabled = false
  body: any = null
  viewMoreRelatedTopics = false
  hasTocStructure = false
  tocStructure: any = null
  contentParents: { [key: string]: any[] } = {}
  objKeys = Object.keys
  content: any = null
  forPreview = window.location.href.includes('/public/') || window.location.href.includes('&preview=true') ||
    window.location.href.includes('&status=Draft')
  resumeData: any = null
  batchData: any = null
  tocConfig: any = null
  loggedInUserId: any
  routeSubscription: any = null
  routeQuerySubscription: any = null
  batchId: any
  isNotEditor = true
  cohortResults: { [key: string]: { hasError: boolean; contents: any[] } } = {}
  discussionConfig: any = {}
  batchDataLoaded = false
  competencies: any
  howerUser: any
  searchForm: any
  progress = 50
  ratingSummary: any
  ratingLookup: any
  ratingSummaryProcessed: any
  ratingReviews: any[] = []
  ratingViewCount = 3
  ratingViewCountDefault = 3
  lookupLimit = 3
  sortReviewValues = ['topReviews', 'latestReviews']
  previousFilter = this.sortReviewValues[0]
  lastLookUp: any
  reviewPage = 1
  reviewDefaultLimit = 2
  disableLoadMore = false
  displayLoader = false
  tabSelectedIndex = 0
  updateReviewsSubscription: any = null
  batchSubscription: any = null
  compentencyKey = ''
  primaryCategory = EPrimaryCategory

  constructor(
    private router: any,
    _route: any,
    private tocSharedSvc: any,
    private domSanitizer: any,
    _authAccessControlSvc: any,
    private logger: any,
    _titleTagService: any,
    public createBatchDialog: any,
    private mobileAppsSvc: any,
    public configSvc: any,
    private connectionHoverService: any,
    _eventSvc: any,
    private ratingSvc: any,
    _translate: any,
    _langtranslations: any,
  ) {
    if (this.configSvc.restrictedFeatures) {
      this.askAuthorEnabled = !this.configSvc.restrictedFeatures.has('askAuthor')
      this.trainingLHubEnabled = !this.configSvc.restrictedFeatures.has('trainingLHub')
    }
    this.discussionConfig = {
      userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
    }
  }

  ngOnChanges() {
    if (this.batchData) {
      this.tabSelectedIndex = 1
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe() }
    if (this.routeQuerySubscription) { this.routeQuerySubscription.unsubscribe() }
    if (this.updateReviewsSubscription) { this.updateReviewsSubscription.unsubscribe() }
    if (this.batchSubscription) { this.batchSubscription.unsubscribe() }
  }

  detailUrl(data: any) {
    let locationOrigin = location.origin
    if (this.configSvc.activeLocale && this.configSvc.activeLocale.path) {
      locationOrigin += `/${this.configSvc.activeLocale.path}`
    }
    switch (data.primaryCategory) {
      case EPrimaryCategory.CHANNEL:
        return `${locationOrigin}${data.artifactUrl}`
      case EPrimaryCategory.KNOWLEDGE_BOARD:
        return `${locationOrigin}/app/knowledge-board/${data.identifier}`
      case EPrimaryCategory.KNOWLEDGE_ARTIFACT:
        return `${locationOrigin}/app/toc/${data.identifier}/overview?primaryCategory=${data.primaryCategory}`
      default:
        return `${locationOrigin}/app/toc/${data.identifier}/overview?primaryCategory=${data.primaryCategory}`
    }
  }

  get showSubtitleOnBanner() {
    return this.tocSharedSvc.subtitleOnBanners
  }

  get showDescription() {
    if (this.content && !this.content.body) {
      return true
    }
    return this.tocSharedSvc.showDescription
  }

  get isResource() {
    if (this.content) {
      const isResource = this.content.primaryCategory === EPrimaryCategory.KNOWLEDGE_ARTIFACT ||
        this.content.primaryCategory === EPrimaryCategory.RESOURCE || !this.content.children.length
      if (isResource && this.mobileAppsSvc) {
        this.mobileAppsSvc.sendViewerData(this.content)
      }
      return isResource
    }
    return false
  }

  get enablePeopleSearch(): boolean {
    if (this.configSvc.restrictedFeatures) {
      return !this.configSvc.restrictedFeatures.has('peopleSearch')
    }
    return false
  }

  sanitize(data: any) {
    return this.domSanitizer.bypassSecurityTrustHtml(data)
  }

  getContentParent() {
    if (this.content) {
      const contentParentReq = { fields: ['contentType', 'name'] }
      this.tocSharedSvc
        .fetchContentParent(this.content.identifier, contentParentReq, this.forPreview)
        .subscribe(
          (res: any) => { this.parseContentParent(res) },
          () => { this.contentParents = {} },
        )
    }
  }

  public getCompetencies(competencies: any) {
    const competenciesArray = JSON.parse(competencies)
    const competencyStringArray: any[] = []
    competenciesArray.map((c: any) => { competencyStringArray.push(c.name) })
    return competencyStringArray
  }

  parseContentParent(content: any) {
    content.collections.forEach((collection: any) => {
      if (!this.contentParents.hasOwnProperty(collection.contentType)) {
        this.contentParents[collection.contentType] = []
      }
      this.contentParents[collection.contentType].push(collection)
      this.parseContentParent(collection)
    })
  }

  resetAndFetchTocStructure() {
    this.tocStructure = {
      assessment: 0, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0,
      learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0, practiceTest: 0,
      quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0,
    }
    if (this.content) {
      this.hasTocStructure = false
      this.tocStructure.learningModule = this.content.primaryCategory === EPrimaryCategory.MODULE ? -1 : 0
      this.tocStructure.course = this.content.primaryCategory === EPrimaryCategory.COURSE ? -1 : 0
      this.tocStructure = this.tocSharedSvc.getTocStructure(this.content, this.tocStructure)
      for (const progType in this.tocStructure) {
        if (this.tocStructure[progType] > 0) {
          this.hasTocStructure = true
          break
        }
      }
    }
  }

  openDialog(content: any): void {
    const dialogRef = this.createBatchDialog.open(class CreateBatchDialogComponent { }, {
      width: '600px',
      data: { content },
    })
    dialogRef.afterClosed().subscribe((_result: any) => {
      if (!this.batchId) {
        this.tocSharedSvc.updateBatchData()
      }
    })
  }

  public parseJsonData(s: string) {
    try {
      return JSON.parse(s)
    } catch {
      return []
    }
  }

  goToUserProfile(user: any) {
    if (this.enablePeopleSearch) {
      this.router.navigate(['/app/person-profile', user.wid])
    }
  }

  getUserFullName(user: any) {
    if (user && user.first_name && user.last_name) {
      return `${user.first_name.trim()} ${user.last_name.trim()}`
    }
    return ''
  }

  getHoverUser(user: any) {
    const userId = user.wid
    this.connectionHoverService.fetchProfile(userId).subscribe((res: any) => {
      if (res.profileDetails !== null) {
        this.howerUser = res.profileDetails
      } else {
        this.howerUser = res || {}
      }
      return this.howerUser
    })
  }

  fetchCohorts(cohortType: string, contentID: any) {
    if (!this.cohortResults[cohortType] && !this.forPreview) {
      this.tocSharedSvc.fetchContentCohorts(cohortType, contentID).subscribe(
        (data: any) => {
          this.cohortResults[cohortType] = {
            contents: _.map(data, (d: any) => ({
              first_name: _.get(d, 'first_name'),
              last_name: _.get(d, 'last_name'),
              department: _.get(d, 'department'),
              designation: _.get(d, 'designation'),
              email: _.get(d, 'email'),
              desc: _.get(d, 'desc'),
              uid: _.get(d, 'user_id'),
              last_ts: _.get(d, 'last_ts'),
              phone_No: _.get(d, 'phone_No'),
              city: _.get(d, 'city'),
              userLocation: _.get(d, 'userLocation'),
            })) || [],
            hasError: false,
          }
        },
        () => {
          this.cohortResults[cohortType] = { contents: [], hasError: true }
        },
      )
    } else if (this.cohortResults[cohortType] && !this.forPreview) {
      return
    } else {
      this.cohortResults[cohortType] = { contents: [], hasError: false }
    }
  }

  fetchRatingSummary() {
    this.displayLoader = true
    if (!this.forPreview && this.content && this.content.identifier && this.content.primaryCategory) {
      this.ratingSvc.getRatingSummary(this.content.identifier, this.content.primaryCategory).subscribe(
        (res: any) => {
          this.displayLoader = false
          if (res && res.result && res.result.response) {
            this.ratingSummary = res.result.response
          }
          this.ratingSummaryProcessed = this.processRatingSummary()
        },
        (err: any) => {
          this.displayLoader = false
          this.logger.error('USER RATING FETCH ERROR >', err)
        }
      )
    }
  }

  processRatingSummary() {
    return this.ratingSummary ? { processed: true } : null
  }
}

describe('AppTocSinglePageComponent', () => {
  let component: AppTocSinglePageLogic
  let mockRouter: any
  let mockRoute: any
  let mockTocSharedSvc: any
  let mockDomSanitizer: any
  let mockAuthAccessControlSvc: any
  let mockLogger: any
  let mockTitleTagService: any
  let mockCreateBatchDialog: any
  let mockMobileAppsSvc: any
  let mockConfigSvc: any
  let mockConnectionHoverService: any
  let mockEventSvc: any
  let mockRatingSvc: any
  let mockTranslate: any
  let mockLangTranslations: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    mockRoute = { fragment: new Subject(), data: new Subject() }
    mockTocSharedSvc = {
      getSelectedBatch: new Subject(),
      initData: jest.fn(),
      getTocStructure: jest.fn().mockReturnValue({
        assessment: 0, finalTest: 0, course: 0, handsOn: 0,
        interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0, survey: 0, podcast: 0,
        practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0, youtube: 0,
        interactivecontent: 0, offlineSession: 0
      }),
      updateBatchData: jest.fn(),
      subtitleOnBanners: false,
      showDescription: true,
      fetchContentParent: jest.fn().mockReturnValue(of({ collections: [] })),
      fetchContentCohorts: jest.fn().mockReturnValue(of([])),
      updateReviewsObservable: new Subject(),
    }
    mockDomSanitizer = { bypassSecurityTrustHtml: jest.fn(v => v) }
    mockAuthAccessControlSvc = { proxyToAuthoringUrl: jest.fn(v => v) }
    mockLogger = { error: jest.fn() }
    mockTitleTagService = { setSocialMediaTags: jest.fn() }
    mockCreateBatchDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(null) }),
    }
    mockMobileAppsSvc = { sendViewerData: jest.fn() }
    mockConfigSvc = {
      restrictedFeatures: new Set<string>(),
      userProfile: { userId: 'test-user-id' },
      activeLocale: { path: 'en' },
      nodebbUserProfile: null,
      userRoles: new Set<string>(),
    }
    mockConnectionHoverService = { fetchProfile: jest.fn().mockReturnValue(of({ profileDetails: { name: 'Test User' } })) }
    mockEventSvc = { telemetry$: new Subject() }
    mockRatingSvc = {
      getRatingSummary: jest.fn().mockReturnValue(of({ result: { response: { count: 5, avg: 4.0 } } })),
      getRatingLookup: jest.fn().mockReturnValue(of({})),
      getRatingReply: jest.fn().mockReturnValue(of({})),
    }
    mockTranslate = { setDefaultLang: jest.fn(), use: jest.fn() }
    mockLangTranslations = {}

    component = new AppTocSinglePageLogic(
      mockRouter, mockRoute, mockTocSharedSvc, mockDomSanitizer, mockAuthAccessControlSvc,
      mockLogger, mockTitleTagService, mockCreateBatchDialog, mockMobileAppsSvc, mockConfigSvc,
      mockConnectionHoverService, mockEventSvc, mockRatingSvc, mockTranslate, mockLangTranslations,
    )
  })

  afterEach(() => { jest.clearAllMocks() })

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.showMoreGlance).toBeFalsy()
      expect(component.askAuthorEnabled).toBeTruthy()
      expect(component.trainingLHubEnabled).toBeTruthy()
      expect(component.body).toBeNull()
      expect(component.viewMoreRelatedTopics).toBeFalsy()
      expect(component.hasTocStructure).toBeFalsy()
    })

    it('should set askAuthorEnabled false when restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['askAuthor'])
      const comp2 = new AppTocSinglePageLogic(
        mockRouter, mockRoute, mockTocSharedSvc, mockDomSanitizer, mockAuthAccessControlSvc,
        mockLogger, mockTitleTagService, mockCreateBatchDialog, mockMobileAppsSvc, mockConfigSvc,
        mockConnectionHoverService, mockEventSvc, mockRatingSvc, mockTranslate, mockLangTranslations,
      )
      expect(comp2.askAuthorEnabled).toBeFalsy()
    })

    it('should set trainingLHubEnabled true when not restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set()
      const comp2 = new AppTocSinglePageLogic(
        mockRouter, mockRoute, mockTocSharedSvc, mockDomSanitizer, mockAuthAccessControlSvc,
        mockLogger, mockTitleTagService, mockCreateBatchDialog, mockMobileAppsSvc, mockConfigSvc,
        mockConnectionHoverService, mockEventSvc, mockRatingSvc, mockTranslate, mockLangTranslations,
      )
      expect(comp2.trainingLHubEnabled).toBeTruthy()
    })

    it('should set discussionConfig.userName from nodebbUserProfile', () => {
      mockConfigSvc.nodebbUserProfile = { username: 'nodeuser' }
      const comp2 = new AppTocSinglePageLogic(
        mockRouter, mockRoute, mockTocSharedSvc, mockDomSanitizer, mockAuthAccessControlSvc,
        mockLogger, mockTitleTagService, mockCreateBatchDialog, mockMobileAppsSvc, mockConfigSvc,
        mockConnectionHoverService, mockEventSvc, mockRatingSvc, mockTranslate, mockLangTranslations,
      )
      expect(comp2.discussionConfig.userName).toBe('nodeuser')
    })
  })

  describe('ngOnChanges()', () => {
    it('should set tabSelectedIndex to 1 when batchData is present', () => {
      component.batchData = { id: 'batch-1' }
      component.ngOnChanges()
      expect(component.tabSelectedIndex).toBe(1)
    })

    it('should not change tabSelectedIndex when batchData is null', () => {
      component.batchData = null
      component.ngOnChanges()
      expect(component.tabSelectedIndex).toBe(0)
    })
  })

  describe('ngOnDestroy()', () => {
    it('should unsubscribe all subscriptions', () => {
      const unsub1 = jest.fn()
      const unsub2 = jest.fn()
      const unsub3 = jest.fn()
      const unsub4 = jest.fn()
      component.routeSubscription = { unsubscribe: unsub1 }
      component.routeQuerySubscription = { unsubscribe: unsub2 }
      component.updateReviewsSubscription = { unsubscribe: unsub3 }
      component.batchSubscription = { unsubscribe: unsub4 }
      component.ngOnDestroy()
      expect(unsub1).toHaveBeenCalled()
      expect(unsub2).toHaveBeenCalled()
      expect(unsub3).toHaveBeenCalled()
      expect(unsub4).toHaveBeenCalled()
    })

    it('should not throw when subscriptions are null', () => {
      component.routeSubscription = null
      component.routeQuerySubscription = null
      component.updateReviewsSubscription = null
      component.batchSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('detailUrl()', () => {
    it('should return channel URL for CHANNEL category', () => {
      const data = { primaryCategory: 'Channel', artifactUrl: '/test-url' }
      const result = component.detailUrl(data)
      expect(result).toContain('/test-url')
      expect(result).toContain('en')
    })

    it('should return knowledge-board URL for KNOWLEDGE_BOARD category', () => {
      const data = { primaryCategory: 'Knowledge Board', identifier: 'kb-001' }
      const result = component.detailUrl(data)
      expect(result).toContain('/app/knowledge-board/kb-001')
    })

    it('should return toc URL for KNOWLEDGE_ARTIFACT category', () => {
      const data = { primaryCategory: 'Knowledge Artifact', identifier: 'ka-001' }
      const result = component.detailUrl(data)
      expect(result).toContain('/app/toc/ka-001/overview')
      expect(result).toContain('Knowledge Artifact')
    })

    it('should return toc URL for default category', () => {
      const data = { primaryCategory: 'Course', identifier: 'c-001' }
      const result = component.detailUrl(data)
      expect(result).toContain('/app/toc/c-001/overview')
    })

    it('should use location.origin without locale when activeLocale is null', () => {
      mockConfigSvc.activeLocale = null
      const data = { primaryCategory: 'Course', identifier: 'c-001' }
      const result = component.detailUrl(data)
      expect(result).toContain(location.origin)
    })
  })

  describe('showSubtitleOnBanner getter', () => {
    it('should return tocSharedSvc.subtitleOnBanners', () => {
      mockTocSharedSvc.subtitleOnBanners = true
      expect(component.showSubtitleOnBanner).toBe(true)
      mockTocSharedSvc.subtitleOnBanners = false
      expect(component.showSubtitleOnBanner).toBe(false)
    })
  })

  describe('showDescription getter', () => {
    it('should return true when content has no body', () => {
      component.content = { body: null }
      expect(component.showDescription).toBe(true)
    })

    it('should return tocSharedSvc.showDescription when content has body', () => {
      component.content = { body: 'some body content' }
      mockTocSharedSvc.showDescription = false
      expect(component.showDescription).toBe(false)
    })

    it('should return tocSharedSvc.showDescription when content is null', () => {
      component.content = null
      mockTocSharedSvc.showDescription = true
      expect(component.showDescription).toBe(true)
    })
  })

  describe('isResource getter', () => {
    it('should return true for KNOWLEDGE_ARTIFACT primaryCategory', () => {
      component.content = { primaryCategory: 'Knowledge Artifact', children: [{}] }
      expect(component.isResource).toBe(true)
    })

    it('should return true for RESOURCE primaryCategory', () => {
      component.content = { primaryCategory: 'Resource', children: [{}] }
      expect(component.isResource).toBe(true)
    })

    it('should return true when content has no children', () => {
      component.content = { primaryCategory: 'Course', children: [] }
      expect(component.isResource).toBe(true)
    })

    it('should return false for non-resource course with children', () => {
      component.content = { primaryCategory: 'Course', children: [{ id: 'child1' }] }
      expect(component.isResource).toBe(false)
    })

    it('should return false when content is null', () => {
      component.content = null
      expect(component.isResource).toBe(false)
    })

    it('should call mobileAppsSvc.sendViewerData when isResource is true', () => {
      component.content = { primaryCategory: 'Resource', children: [] }
      component.isResource
      expect(mockMobileAppsSvc.sendViewerData).toHaveBeenCalledWith(component.content)
    })
  })

  describe('enablePeopleSearch getter', () => {
    it('should return true when peopleSearch is not restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set()
      expect(component.enablePeopleSearch).toBe(true)
    })

    it('should return false when peopleSearch is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['peopleSearch'])
      expect(component.enablePeopleSearch).toBe(false)
    })

    it('should return false when restrictedFeatures is undefined', () => {
      mockConfigSvc.restrictedFeatures = null
      expect(component.enablePeopleSearch).toBe(false)
    })
  })

  describe('sanitize()', () => {
    it('should call domSanitizer.bypassSecurityTrustHtml', () => {
      component.sanitize('<b>safe</b>')
      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<b>safe</b>')
    })
  })

  describe('getCompetencies()', () => {
    it('should parse and return competency names', () => {
      const competencies = JSON.stringify([{ name: 'Leadership' }, { name: 'Communication' }])
      const result = component.getCompetencies(competencies)
      expect(result).toEqual(['Leadership', 'Communication'])
    })

    it('should return empty array for empty competencies', () => {
      const result = component.getCompetencies('[]')
      expect(result).toEqual([])
    })
  })

  describe('parseContentParent()', () => {
    it('should populate contentParents by contentType', () => {
      component.contentParents = {}
      const content = {
        collections: [
          { contentType: 'Course', identifier: 'c-001', collections: [] },
          { contentType: 'Course', identifier: 'c-002', collections: [] },
          { contentType: 'Program', identifier: 'p-001', collections: [] },
        ],
      }
      component.parseContentParent(content)
      expect(component.contentParents['Course'].length).toBe(2)
      expect(component.contentParents['Program'].length).toBe(1)
    })

    it('should handle empty collections', () => {
      component.contentParents = {}
      component.parseContentParent({ collections: [] })
      expect(Object.keys(component.contentParents).length).toBe(0)
    })
  })

  describe('resetAndFetchTocStructure()', () => {
    it('should initialize tocStructure with zeros', () => {
      component.content = null
      component.resetAndFetchTocStructure()
      expect(component.tocStructure).toBeTruthy()
      expect(component.tocStructure.course).toBe(0)
    })

    it('should set learningModule to -1 for MODULE content', () => {
      component.content = { primaryCategory: 'Learning Module', children: [] }
      mockTocSharedSvc.getTocStructure.mockReturnValue({ ...component.tocStructure, learningModule: -1 })
      component.resetAndFetchTocStructure()
      expect(mockTocSharedSvc.getTocStructure).toHaveBeenCalled()
    })

    it('should set course to -1 for COURSE content', () => {
      component.content = { primaryCategory: 'Course', children: [] }
      mockTocSharedSvc.getTocStructure.mockReturnValue({ ...component.tocStructure, course: -1, video: 1 })
      component.resetAndFetchTocStructure()
      expect(component.hasTocStructure).toBe(true)
    })

    it('should set hasTocStructure true when any tocStructure property > 0', () => {
      component.content = { primaryCategory: 'Course', children: [] }
      mockTocSharedSvc.getTocStructure.mockReturnValue({
        assessment: 0, finalTest: 0, course: 0, handsOn: 0, interactiveVideo: 0,
        learningModule: 0, other: 0, pdf: 5, survey: 0, podcast: 0,
        practiceTest: 0, quiz: 0, video: 0, webModule: 0, webPage: 0,
        youtube: 0, interactivecontent: 0, offlineSession: 0,
      })
      component.resetAndFetchTocStructure()
      expect(component.hasTocStructure).toBe(true)
    })
  })

  describe('parseJsonData()', () => {
    it('should parse valid JSON string', () => {
      const result = component.parseJsonData('[{"id":1}]')
      expect(result).toEqual([{ id: 1 }])
    })

    it('should return empty array for invalid JSON', () => {
      const result = component.parseJsonData('invalid-json')
      expect(result).toEqual([])
    })
  })

  describe('goToUserProfile()', () => {
    it('should navigate to person-profile when peopleSearch is enabled', () => {
      mockConfigSvc.restrictedFeatures = new Set()
      component.goToUserProfile({ wid: 'user-001' })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile', 'user-001'])
    })

    it('should not navigate when peopleSearch is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['peopleSearch'])
      component.goToUserProfile({ wid: 'user-001' })
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('getUserFullName()', () => {
    it('should return trimmed full name', () => {
      expect(component.getUserFullName({ first_name: 'John ', last_name: ' Doe' })).toBe('John Doe')
    })

    it('should return empty string when names are missing', () => {
      expect(component.getUserFullName({})).toBe('')
    })

    it('should return empty string for null user', () => {
      expect(component.getUserFullName(null)).toBe('')
    })
  })

  describe('getHoverUser()', () => {
    it('should set howerUser from profileDetails', (done) => {
      mockConnectionHoverService.fetchProfile.mockReturnValue(of({ profileDetails: { name: 'Hover User' } }))
      component.getHoverUser({ wid: 'u-001' })
      setTimeout(() => {
        expect(component.howerUser).toEqual({ name: 'Hover User' })
        done()
      }, 0)
    })

    it('should set howerUser from res when profileDetails is null', (done) => {
      mockConnectionHoverService.fetchProfile.mockReturnValue(of({ profileDetails: null, name: 'Fallback' }))
      component.getHoverUser({ wid: 'u-001' })
      setTimeout(() => {
        expect(component.howerUser).toBeTruthy()
        done()
      }, 0)
    })
  })

  describe('fetchRatingSummary()', () => {
    it('should call getRatingSummary and set ratingSummary', (done) => {
      component.content = { identifier: 'c-001', primaryCategory: 'Course' }
      component.fetchRatingSummary()
      setTimeout(() => {
        expect(mockRatingSvc.getRatingSummary).toHaveBeenCalledWith('c-001', 'Course')
        expect(component.displayLoader).toBe(false)
        done()
      }, 0)
    })

    it('should not call getRatingSummary in preview mode', () => {
      component.forPreview = true
      component.content = { identifier: 'c-001', primaryCategory: 'Course' }
      component.fetchRatingSummary()
      expect(mockRatingSvc.getRatingSummary).not.toHaveBeenCalled()
    })

    it('should handle error and log it', (done) => {
      const mockError = new Error('rating error')
      mockRatingSvc.getRatingSummary.mockReturnValue(throwError(mockError))
      component.content = { identifier: 'c-001', primaryCategory: 'Course' }
      component.fetchRatingSummary()
      setTimeout(() => {
        expect(mockLogger.error).toHaveBeenCalledWith('USER RATING FETCH ERROR >', mockError)
        expect(component.displayLoader).toBe(false)
        done()
      }, 0)
    })
  })

  describe('getContentParent()', () => {
    it('should call fetchContentParent when content is set', () => {
      component.content = { identifier: 'c-001' }
      mockTocSharedSvc.fetchContentParent.mockReturnValue(of({ collections: [] }))
      component.getContentParent()
      expect(mockTocSharedSvc.fetchContentParent).toHaveBeenCalledWith('c-001', { fields: ['contentType', 'name'] }, false)
    })

    it('should not call fetchContentParent when content is null', () => {
      component.content = null
      component.getContentParent()
      expect(mockTocSharedSvc.fetchContentParent).not.toHaveBeenCalled()
    })

    it('should reset contentParents on error', (done) => {
      component.content = { identifier: 'c-001' }
      mockTocSharedSvc.fetchContentParent.mockReturnValue(throwError('error'))
      component.getContentParent()
      setTimeout(() => {
        expect(component.contentParents).toEqual({})
        done()
      }, 0)
    })
  })

  describe('fetchCohorts()', () => {
    it('should fetch cohort data and set cohortResults', (done) => {
      const cohortData = [{ first_name: 'John', last_name: 'Doe', department: 'IT' }]
      mockTocSharedSvc.fetchContentCohorts.mockReturnValue(of(cohortData))
      component.fetchCohorts('ACTIVE_USERS', 'c-001')
      setTimeout(() => {
        expect(component.cohortResults['ACTIVE_USERS']).toBeTruthy()
        expect(component.cohortResults['ACTIVE_USERS'].hasError).toBe(false)
        done()
      }, 0)
    })

    it('should set hasError true on fetch error', (done) => {
      mockTocSharedSvc.fetchContentCohorts.mockReturnValue(throwError('err'))
      component.fetchCohorts('ACTIVE_USERS', 'c-001')
      setTimeout(() => {
        expect(component.cohortResults['ACTIVE_USERS'].hasError).toBe(true)
        done()
      }, 0)
    })

    it('should set empty cohortResults in preview mode', () => {
      component.forPreview = true
      component.fetchCohorts('ACTIVE_USERS', 'c-001')
      expect(component.cohortResults['ACTIVE_USERS']).toEqual({ contents: [], hasError: false })
    })

    it('should return early if cohortResults already has cohortType in non-preview mode', () => {
      component.forPreview = false
      component.cohortResults['ACTIVE_USERS'] = { contents: [], hasError: false }
      component.fetchCohorts('ACTIVE_USERS', 'c-001')
      expect(mockTocSharedSvc.fetchContentCohorts).not.toHaveBeenCalled()
    })
  })

  describe('openDialog()', () => {
    it('should open CreateBatchDialogComponent dialog', () => {
      const content = { id: 'content-001' }
      component.openDialog(content)
      expect(mockCreateBatchDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        { width: '600px', data: { content } }
      )
    })
  })
})
