import { DatePipe } from '@angular/common'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { aparPlan } from '../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from './comprehensive-assessment.service'

const PLAN_SEARCH_URL = 'apis/proxies/v8/cbplan/v4/search'
const CONTENT_SEARCH_URL = 'apis/proxies/v8/sunbirdigot/v4/search'
const PLAN_UPDATE_URL = 'apis/proxies/v8/cbplan/v4/update'
/** The key the linkage is written under, read off the model so a version bump is one edit. */
const LINK_KEY = aparPlan.TRAINING_PLAN_KEY

/** One row as the cbplan v4 search hands it back. */
const planRow = (overrides: any = {}) => ({
  id: 'plan-1',
  name: 'APAR 2026-27 — Section Officer & Under Secretary',
  planYear: '2026-27',
  endDate: '2027-03-31T00:00:00.000Z',
  isApar: true,
  contentList: [
    { identifier: 'do-1', mandatory: true },
    { identifier: 'do-2', mandatory: false },
    { identifier: 'do-3', mandatory: true },
  ],
  ...overrides,
})

const planSearchResponse = (data: any[], totalCount = data.length) => ({
  params: { status: 'success' },
  result: { result: { data, totalCount } },
})

describe('ComprehensiveAssessmentService', () => {
  let service: ComprehensiveAssessmentService
  let httpMock: HttpTestingController

  const searchParams = {
    planYear: '2026-27',
    searchString: '',
    pageIndex: 0,
    pageSize: 20,
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DatePipe,
        ComprehensiveAssessmentService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    })

    service = TestBed.inject(ComprehensiveAssessmentService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('searchAparPlans', () => {
    it('should post the query the cbplan v4 search expects', () => {
      service.searchAparPlans(searchParams).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({
        request: {
          query: {
            bool: {
              must: [
                { term: { 'status.keyword': 'Live' } },
                { term: { 'planYear.keyword': '2026-27' } },
              ],
              must_not: [{ exists: { field: aparPlan.LINKED_ASSESSMENT_FIELD } }],
            },
          },
          pageNumber: 0,
          pageSize: 20,
          searchString: '',
          applyOrgIdFilter: true,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        },
      })
      req.flush(planSearchResponse([]))
    })

    /** The api is the one that knows, the picker no longer works it out from a second search. */
    it('should ask the search to leave out a plan another assessment already holds', () => {
      service.searchAparPlans(searchParams).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.body.request.query.bool.must_not).toEqual([
        { exists: { field: 'caLinkedId' } },
      ])
      req.flush(planSearchResponse([]))
    })

    it('should scope the search to the org without naming it', () => {
      service.searchAparPlans(searchParams).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.body.request.applyOrgIdFilter).toBe(true)
      expect(JSON.stringify(req.request.body)).not.toContain('orgIdList')
      req.flush(planSearchResponse([]))
    })

    it('should leave planYear off the query while the list is not narrowed to one year', () => {
      service.searchAparPlans({ ...searchParams, planYear: aparPlan.ALL_YEARS }).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.body.request.query.bool.must).toEqual([
        { term: { 'status.keyword': 'Live' } },
      ])
      req.flush(planSearchResponse([]))
    })

    it('should drop the ordering while a search is on, the api orders by relevance then', () => {
      service.searchAparPlans({ ...searchParams, searchString: 'section officer' }).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.body.request.searchString).toBe('section officer')
      expect(req.request.body.request.orderBy).toBeUndefined()
      expect(req.request.body.request.orderDirection).toBeUndefined()
      req.flush(planSearchResponse([]))
    })

    it('should flatten a row into what the picker table renders', () => {
      let result: any
      service.searchAparPlans(searchParams).subscribe((res: any) => result = res)

      httpMock.expectOne(PLAN_SEARCH_URL).flush(planSearchResponse([planRow()], 7))

      expect(result.count).toBe(7)
      expect(result.plans).toEqual([{
        id: 'plan-1',
        name: 'APAR 2026-27 — Section Officer & Under Secretary',
        planYear: '2026-27',
        endDate: '2027-03-31T00:00:00.000Z',
        endDateDisplay: '31 Mar, 2027',
        orgName: '',
        // two of the three contents are marked mandatory, they are the gating set
        gatingCourseCount: 2,
        // the courses travel with the row, the linkage is written from them
        contentList: [
          { identifier: 'do-1', mandatory: true },
          { identifier: 'do-2', mandatory: false },
          { identifier: 'do-3', mandatory: true },
        ],
        hasActiveAssessment: false,
        isYearClosed: false,
      }])
    })

    it('should not offer a plan with APAR assignment switched off', () => {
      let result: any
      service.searchAparPlans(searchParams).subscribe((res: any) => result = res)

      httpMock.expectOne(PLAN_SEARCH_URL).flush(planSearchResponse([
        planRow({ id: 'plan-1', isApar: true }),
        planRow({ id: 'plan-2', isApar: false }),
      ]))

      expect(result.plans.map((plan: any) => plan.id)).toEqual(['plan-1'])
    })

    /**
     * The regression behind an empty picker: the field is absent, not false, whenever the
     * search does not project it, and a truthiness filter would then drop every plan.
     */
    it('should keep a plan whose row carries no isApar field at all', () => {
      let result: any
      service.searchAparPlans(searchParams).subscribe((res: any) => result = res)

      const row = planRow()
      delete (row as any).isApar
      httpMock.expectOne(PLAN_SEARCH_URL).flush(planSearchResponse([row]))

      expect(result.plans.length).toBe(1)
    })

    it('should resolve empty when the response carries no result envelope', () => {
      let result: any
      service.searchAparPlans(searchParams).subscribe((res: any) => result = res)

      httpMock.expectOne(PLAN_SEARCH_URL).flush({})

      expect(result).toEqual({ plans: [], count: 0 })
    })

    it('should count no gating course when the plan marks nothing mandatory', () => {
      let result: any
      service.searchAparPlans(searchParams).subscribe((res: any) => result = res)

      httpMock.expectOne(PLAN_SEARCH_URL).flush(planSearchResponse([planRow({ contentList: [] })]))

      expect(result.plans[0].gatingCourseCount).toBe(0)
    })
  })

  /** The publish time check: the picker only guards the moment a plan is linked. */
  describe('isPlanAvailable', () => {
    it('should ask the same search for the one plan, still free and still Live', () => {
      service.isPlanAvailable('plan-1').subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.body).toEqual({
        request: {
          query: {
            bool: {
              must: [
                { term: { 'status.keyword': 'Live' } },
                { term: { 'id.keyword': 'plan-1' } },
              ],
              must_not: [{ exists: { field: 'caLinkedId' } }],
            },
          },
          pageNumber: 0,
          pageSize: aparPlan.PAGE_SIZE,
          applyOrgIdFilter: true,
        },
      })
      req.flush(planSearchResponse([]))
    })

    it('should answer that the plan is free while the search still returns it', () => {
      let available: boolean | undefined

      service.isPlanAvailable('plan-1').subscribe((res: boolean) => available = res)
      httpMock.expectOne(PLAN_SEARCH_URL).flush(planSearchResponse([planRow()]))

      expect(available).toBe(true)
    })

    /** Another assessment has taken it, or it is no longer Live - either way it is gone. */
    it('should answer that the plan is taken when the search returns nothing', () => {
      let available: boolean | undefined

      service.isPlanAvailable('plan-1').subscribe((res: boolean) => available = res)
      httpMock.expectOne(PLAN_SEARCH_URL).flush(planSearchResponse([]))

      expect(available).toBe(false)
    })

    it('should answer without asking at all for an assessment holding no plan', () => {
      let available: boolean | undefined

      service.isPlanAvailable('').subscribe((res: boolean) => available = res)

      expect(available).toBe(false)
      httpMock.expectNone(PLAN_SEARCH_URL)
    })
  })

  describe('linkPlanToAssessment', () => {
    it('should write the assessment onto the plan it was published against', () => {
      service.linkPlanToAssessment('plan-1', 'do_123').subscribe()

      const req = httpMock.expectOne(PLAN_UPDATE_URL)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({
        request: {
          id: 'plan-1',
          caLinkedId: 'do_123',
        },
      })
      req.flush({})
    })
  })

  describe('getPlanIdsWithLiveAssessment', () => {
    it('should ask the content search for the plan id of every Live assessment', () => {
      service.getPlanIdsWithLiveAssessment('org-1').subscribe()

      const req = httpMock.expectOne(CONTENT_SEARCH_URL)
      expect(req.request.body.request.fields)
        .toEqual(['identifier', 'aparPlanId', LINK_KEY])
      expect(req.request.body.request.filters.status).toEqual(['Live'])
      expect(req.request.body.request.filters.createdFor).toEqual(['org-1'])
      req.flush({ result: { content: [] } })
    })

    it('should return the plan ids and drop the assessments carrying none', () => {
      let planIds: string[] = []
      service.getPlanIdsWithLiveAssessment('org-1').subscribe((res: string[]) => planIds = res)

      httpMock.expectOne(CONTENT_SEARCH_URL).flush({
        result: {
          content: [
            { identifier: 'ca-1', [LINK_KEY]: { identifier: 'plan-1', contentList: [] } },
            { identifier: 'ca-2' },
            // linked before the linkage was written onto it, the flat key still answers
            { identifier: 'ca-3', aparPlanId: 'plan-3' },
          ],
        },
      })

      expect(planIds).toEqual(['plan-1', 'plan-3'])
    })

    /** The flag is an extra, it must never stop the picker from listing the plans. */
    it('should resolve empty rather than fail when the search errors', () => {
      let planIds: string[] | undefined
      let errored = false
      service.getPlanIdsWithLiveAssessment('org-1').subscribe({
        next: (res: string[]) => planIds = res,
        error: () => errored = true,
      })

      httpMock.expectOne(CONTENT_SEARCH_URL).flush('boom', { status: 500, statusText: 'Server Error' })

      expect(errored).toBe(false)
      expect(planIds).toEqual([])
    })
  })

  describe('plan metadata', () => {
    const linkedPlan: aparPlan.ILinkedPlan = {
      id: 'plan-1',
      name: 'APAR 2026-27 — Section Officer & Under Secretary',
      planYear: '2026-27',
      endDate: '2027-03-31T00:00:00.000Z',
      orgName: 'Department of Personnel & Training',
      gatingCourseCount: 2,
      contentList: [
        { identifier: 'do-1', mandatory: true },
        { identifier: 'do-2', mandatory: false },
        { identifier: 'do-3', mandatory: true },
      ],
    }

    /** An assessment saved while the plan was still denormalised beside the linkage. */
    const legacyContent = {
      [LINK_KEY]: { identifier: 'plan-1', contentList: linkedPlan.contentList },
      aparPlanId: 'plan-1',
      aparPlanName: 'APAR 2026-27 — Section Officer & Under Secretary',
      aparYear: '2026-27',
      aparPlanEndDate: '2027-03-31T00:00:00.000Z',
      aparPlanOrgName: 'Department of Personnel & Training',
      aparGatingCourseCount: '2',
    }

    /**
     * The linkage the platform reads the unlock rule off, and the only place the plan
     * itself is held now that the flat copies are no longer written.
     */
    it('should write the plan and the courses it gates as the training plan link', () => {
      expect(service.buildPlanMetadata(linkedPlan)[LINK_KEY]).toEqual({
        identifier: 'plan-1',
        name: 'APAR 2026-27 — Section Officer & Under Secretary',
        planYear: '2026-27',
        endDate: '2027-03-31T00:00:00.000Z',
        orgName: 'Department of Personnel & Training',
        contentList: [
          { identifier: 'do-1', mandatory: true },
          { identifier: 'do-2', mandatory: false },
          { identifier: 'do-3', mandatory: true },
        ],
      })
    })

    /**
     * The platform reads the unlock rule off this key, so its name is part of the contract
     * rather than an internal detail - a version bump has to be a deliberate edit here.
     */
    it('should write the linkage under the key the platform reads', () => {
      expect(Object.keys(service.buildPlanMetadata(linkedPlan))).toContain('trainingPlan_v2')
    })

    /** Whatever else a plan's course carries, the linkage keeps the two fields it needs. */
    it('should keep the course list down to the identifier and the gating flag', () => {
      const plan = {
        ...linkedPlan,
        contentList: [{ identifier: 'do-1', mandatory: true, name: 'Ethics', duration: 3600 }],
      } as any

      expect(service.buildPlanMetadata(plan)[LINK_KEY].contentList)
        .toEqual([{ identifier: 'do-1', mandatory: true }])
    })

    /**
     * The plan used to be denormalised to a set of flat `apar*` keys beside the linkage.
     * The linkage carries it now, so the save writes that and nothing else.
     */
    it('should write nothing beside the linkage', () => {
      expect(service.buildPlanMetadata(linkedPlan)).toEqual({ [LINK_KEY]: expect.any(Object) })
    })

    it('should clear the linkage when no plan is linked', () => {
      expect(service.buildPlanMetadata(null)).toEqual({
        [LINK_KEY]: {
          identifier: '', name: '', planYear: '', endDate: '', orgName: '', contentList: [],
        },
      })
    })

    /** Everything the reopened builder and the dashboard show comes back off the linkage. */
    it('should read the plan back off the linkage the save wrote', () => {
      expect(service.readPlanMetadata(service.buildPlanMetadata(linkedPlan))).toEqual(linkedPlan)
    })

    /** Nothing writes the flat copies any more, but an assessment carrying them still reads. */
    it('should read the whole plan off an assessment that still carries the flat copies', () => {
      expect(service.readPlanMetadata(legacyContent)).toEqual(linkedPlan)
    })

    /**
     * The linkage is written as an object, but a content schema that types the field as a
     * String hands it back serialised.
     */
    it('should read a linkage the api serialised', () => {
      const content = {
        ...service.buildPlanMetadata(linkedPlan),
        [LINK_KEY]: JSON.stringify({
          identifier: 'plan-1',
          contentList: [{ identifier: 'do-1', mandatory: true }],
        }),
      }

      const linked = service.readPlanMetadata(content)

      expect(linked && linked.id).toBe('plan-1')
      expect(linked && linked.contentList).toEqual([{ identifier: 'do-1', mandatory: true }])
    })

    it('should fall back to the display copies when the linkage cannot be read', () => {
      const content = { ...legacyContent, [LINK_KEY]: '{ not json' }

      const linked = service.readPlanMetadata(content)

      expect(linked && linked.id).toBe('plan-1')
      expect(linked && linked.name).toBe('APAR 2026-27 — Section Officer & Under Secretary')
      expect(linked && linked.contentList).toEqual([])
      // nothing left to count them from, so the stored number is what answers
      expect(linked && linked.gatingCourseCount).toBe(2)
    })

    /** The course list is the live answer, the stored count only a copy of it. */
    it('should count the gating courses off the linkage rather than the stored count', () => {
      const content = {
        ...legacyContent,
        aparGatingCourseCount: '99',
      }

      const linked = service.readPlanMetadata(content)

      expect(linked && linked.gatingCourseCount).toBe(2)
    })

    it('should read a plan linked before the linkage was written onto it', () => {
      const linked = service.readPlanMetadata({
        aparPlanId: 'plan-1',
        aparPlanName: 'APAR 2026-27',
        aparGatingCourseCount: '3',
      })

      expect(linked && linked.id).toBe('plan-1')
      expect(linked && linked.contentList).toEqual([])
      expect(linked && linked.gatingCourseCount).toBe(3)
    })

    it('should read no plan while the assessment carries no plan id', () => {
      expect(service.readPlanMetadata({ name: 'A draft with no plan' })).toBeNull()
      expect(service.readPlanMetadata(null)).toBeNull()
    })

    it('should read a gating count of zero when the stored value is not a number', () => {
      const linked = service.readPlanMetadata({ aparPlanId: 'plan-1', aparGatingCourseCount: 'many' })

      expect(linked && linked.gatingCourseCount).toBe(0)
    })
  })

  describe('content apis', () => {
    const userProfile = {
      userId: 'user-1',
      userName: 'Manjula',
      rootOrgId: 'org-1',
      departmentName: 'Karnataka Postal Circle',
    }

    it('should create a content', () => {
      service.createContent({ request: {} }).subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/create')
      expect(req.request.method).toBe('POST')
      req.flush({})
    })

    it('should upload a file against a content', () => {
      service.uploadContent('do-1', new FormData()).subscribe()

      httpMock.expectOne('apis/proxies/v8/upload/action/content/v3/upload/do-1').flush({})
    })

    it('should read the hierarchy in edit mode so a draft is returned', () => {
      service.getContentHierarchy('do-1').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/hierarchy/do-1?mode=edit')
      expect(req.request.method).toBe('GET')
      req.flush({})
    })

    it('should patch a content under the request envelope', () => {
      service.updateContent('do-1', { name: 'Renamed' }).subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/update/do-1')
      expect(req.request.method).toBe('PATCH')
      expect(req.request.body).toEqual({ request: { content: { name: 'Renamed' } } })
      req.flush({})
    })

    it('should publish a draft naming who published it', () => {
      service.publishAssessment('do-1', 'user-1', 'org-1').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/ca/v1/publish/do-1')
      expect(req.request.body).toEqual({ request: { content: { lastPublishedBy: 'user-1' } } })
      req.flush({})
    })

    /**
     * The `ca` routes answer against the org the publish is made for rather than reading it
     * off the session, so every call of the publish flow names it in the header.
     */
    it('should name the org the publish is made for on every call of the flow', () => {
      service.publishAssessment('do-1', 'user-1', 'org-1').subscribe()
      service.publishQuestionSet('qs-1', 'org-1').subscribe()
      service.getQuestionSetStatus('qs-1', 'org-1').subscribe()

      const requests = [
        httpMock.expectOne('apis/proxies/v8/ca/v1/publish/do-1'),
        httpMock.expectOne('apis/proxies/v8/ca/questionset/v1/publish/qs-1'),
        httpMock.expectOne('apis/proxies/v8/questionset/v1/read/qs-1'),
      ]

      requests.forEach((req: any) => {
        expect(req.request.headers.get('x-authenticated-user-orgid')).toBe('org-1')
        req.flush({})
      })
    })

    /** An empty header says less than no header at all, so none is sent. */
    it('should send no org header while the org is not known', () => {
      service.publishQuestionSet('qs-1', '').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/ca/questionset/v1/publish/qs-1')
      expect(req.request.headers.has('x-authenticated-user-orgid')).toBe(false)
      req.flush({})
    })

    /** The first of the two publishes: the assessment can only follow its question set. */
    it('should publish the question set the assessment holds', () => {
      service.publishQuestionSet('qs-1', 'org-1').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/ca/questionset/v1/publish/qs-1')
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ request: { questionset: {} } })
      req.flush({})
    })

    /** The draft copy answers Draft however far along the publish is, so it is not read. */
    it('should read the status off the published copy of the question set', () => {
      let status = ''
      service.getQuestionSetStatus('qs-1', 'org-1').subscribe((res: string) => status = res)

      const req = httpMock.expectOne('apis/proxies/v8/questionset/v1/read/qs-1')
      expect(req.request.method).toBe('GET')
      req.flush({ result: { questionset: { identifier: 'qs-1', status: 'Live' } } })

      expect(status).toBe('Live')
    })

    it('should read the status whichever casing the api answers under', () => {
      let status = ''
      service.getQuestionSetStatus('qs-1', 'org-1').subscribe((res: string) => status = res)

      httpMock.expectOne('apis/proxies/v8/questionset/v1/read/qs-1')
        .flush({ result: { questionSet: { status: 'Processing' } } })

      expect(status).toBe('Processing')
    })

    /** The live copy does not exist until the publish finishes, and a 404 is not a failure. */
    it('should report no status rather than fail when the read errors', () => {
      let status: string | undefined
      let errored = false
      service.getQuestionSetStatus('qs-1', 'org-1').subscribe({
        next: (res: string) => status = res,
        error: () => errored = true,
      })

      httpMock.expectOne('apis/proxies/v8/questionset/v1/read/qs-1')
        .flush('not found', { status: 404, statusText: 'Not Found' })

      expect(errored).toBe(false)
      expect(status).toBe('')
    })

    it('should retire a content, the delete the api offers', () => {
      service.retireAssessment('do-1').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/retire/do-1')
      expect(req.request.method).toBe('DELETE')
      req.flush({})
    })

    it('should read a question set hierarchy down to the question set itself', () => {
      let questionSet: any
      service.getQuestionSetHierarchy('qs-1').subscribe((res: any) => questionSet = res)

      httpMock.expectOne('apis/proxies/v8/questionset/v1/hierarchy/qs-1?mode=edit')
        .flush({ result: { questionSet: { identifier: 'qs-1' } } })

      expect(questionSet).toEqual({ identifier: 'qs-1' })
    })

    it('should add the question set to the collection children without repeating one', () => {
      const collection = {
        identifier: 'do-1',
        name: 'A comprehensive assessment',
        children: [{ identifier: 'qs-1' }],
      }

      service.linkAssessmentToCollection(collection, 'qs-1').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/hierarchy/update')
      expect(req.request.body.request.data.hierarchy['do-1'].children).toEqual(['qs-1'])
      req.flush({})
    })

    it('should create the assessment collection with the name and thumbnail captured', () => {
      service.createAssessmentCollection('A new assessment', 'icon-url', userProfile, 'a@b.com').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/create')
      const content = req.request.body.request.content
      expect(content.name).toBe('A new assessment')
      expect(content.appIcon).toBe('icon-url')
      expect(content.posterImage).toBe('icon-url')
      expect(content.createdFor).toEqual(['org-1'])
      expect(content.creatorContacts[0].email).toBe('a@b.com')
      req.flush({})
    })

    it('should fall back to the profile email when the caller passes none', () => {
      service.createAssessmentCollection('A new assessment', 'icon-url',
                                         { ...userProfile, email: 'profile@b.com' }, '').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/create')
      expect(req.request.body.request.content.creatorContacts[0].email).toBe('profile@b.com')
      req.flush({})
    })

    it('should upload the picked image and resolve with its public url', () => {
      let appIcon = ''
      const file = new File(['x'], 'thumb.png', { type: 'image/png' })
      service.uploadImageAsset(file, userProfile).subscribe((res: string) => appIcon = res)

      httpMock.expectOne('apis/proxies/v8/action/content/v3/create').flush({ result: { identifier: 'asset-1' } })
      httpMock.expectOne('apis/proxies/v8/upload/action/content/v3/upload/asset-1')
        .flush({ result: { artifactUrl: 'https://cdn.example.com/thumb.png' } })

      expect(appIcon).toBe('https://cdn.example.com/thumb.png')
    })

    it('should fail the upload when the asset content could not be created', () => {
      let message = ''
      const file = new File(['x'], 'thumb.png', { type: 'image/png' })
      service.uploadImageAsset(file, userProfile).subscribe({
        error: (error: Error) => message = error.message,
      })

      httpMock.expectOne('apis/proxies/v8/action/content/v3/create').flush({ result: {} })

      expect(message).toBe('Something went wrong while creating the image asset')
    })
  })

  describe('searchAssessments', () => {
    const searchUrl = 'apis/proxies/v8/sunbirdigot/v4/search'

    it('should offset by the browsed page while nothing is searched', () => {
      service.searchAssessments({
        status: 'Draft', rootOrgId: 'org-1', query: '', pageSize: 20, pageIndex: 2,
      }).subscribe()

      const req = httpMock.expectOne(searchUrl)
      expect(req.request.body.request.offset).toBe(40)
      expect(req.request.body.request.filters.status).toEqual(['Draft'])
      req.flush({})
    })

    it('should restart at the first page when a search is on', () => {
      service.searchAssessments({
        status: 'Live', rootOrgId: 'org-1', query: 'apar', pageSize: 20, pageIndex: 2,
      }).subscribe()

      const req = httpMock.expectOne(searchUrl)
      expect(req.request.body.request.offset).toBe(0)
      expect(req.request.body.request.query).toBe('apar')
      req.flush({})
    })

    it('should shape a hit into the display ready row the listing renders', () => {
      let result: any
      service.searchAssessments({
        status: 'Live', rootOrgId: 'org-1', query: '', pageSize: 20, pageIndex: 0,
      }).subscribe((res: any) => result = res)

      httpMock.expectOne(searchUrl).flush({
        result: {
          count: 1,
          content: [{
            identifier: 'do-1',
            createdOn: '2026-04-01T00:00:00.000Z',
            lastUpdatedOn: '2026-04-02T00:00:00.000Z',
            lastPublishedOn: '',
            creator: '',
            duration: '3900',
          }],
        },
      })

      expect(result.count).toBe(1)
      expect(result.content[0].createdOn).toBe('01 Apr, 2026')
      expect(result.content[0].lastPublishedOn).toBe('')
      // an unnamed creator reads as a dash rather than an empty cell
      expect(result.content[0].creator).toBe('-')
      expect(result.content[0].durationDisplay).toBe('1 hr 5 min')
    })

    it('should render a duration in the units it actually has', () => {
      let result: any
      service.searchAssessments({
        status: 'Live', rootOrgId: 'org-1', query: '', pageSize: 20, pageIndex: 0,
      }).subscribe((res: any) => result = res)

      httpMock.expectOne(searchUrl).flush({
        result: {
          count: 3,
          content: [{ duration: '600' }, { duration: '45' }, { duration: '0' }],
        },
      })

      expect(result.content.map((r: any) => r.durationDisplay)).toEqual(['10 min', '45 sec', '-'])
    })
  })

  describe('helpers', () => {
    it('should find the question set linked to the collection', () => {
      const collection = {
        children: [
          { identifier: 'do-2', mimeType: 'application/pdf' },
          { identifier: 'qs-1', mimeType: 'application/vnd.sunbird.questionset' },
        ],
      }

      expect(service.getLinkedAssessmentId(collection)).toBe('qs-1')
      expect(service.getLinkedAssessmentId({ children: [] })).toBe('')
    })

    /** What the publish dialog lists, so the admin sees by name what is about to go Live. */
    it('should list the question sets the assessment holds, named and with their status', () => {
      const collection = {
        children: [
          { identifier: 'do-2', name: 'A handout', mimeType: 'application/pdf', status: 'Live' },
          {
            identifier: 'qs-1',
            name: 'APAR assessment question set',
            mimeType: 'application/vnd.sunbird.questionset',
            status: 'Draft',
          },
        ],
      }

      expect(service.getLinkedResources(collection)).toEqual([
        { identifier: 'qs-1', name: 'APAR assessment question set', status: 'Draft' },
      ])
    })

    it('should list nothing for a collection carrying no question set', () => {
      expect(service.getLinkedResources({ children: [] })).toEqual([])
      expect(service.getLinkedResources(null)).toEqual([])
    })

    it('should generate the 16 digit numeric code sunbird expects', () => {
      expect(service.generateCode()).toMatch(/^[0-9]{16}$/)
    })

    it('should leave a url that is not a raw storage url alone', () => {
      expect(service.toPublicUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
      expect(service.toPublicUrl('')).toBe('')
    })

    it('should rewrite a raw storage url onto the portal public path', () => {
      // only the leading empty segment is dropped, the path behind the igot root is kept whole
      expect(service.toPublicUrl('https://storage.googleapis.com/igot/bucket/content/a.png'))
        .toContain('/assets/public/bucket/content/a.png')
    })
  })

  describe('isWindowOpen', () => {
    const hours = (count: number) => new Date(Date.now() + (count * 60 * 60 * 1000)).toISOString()

    it('should let a window that has not ended yet through', () => {
      expect(service.isWindowOpen(hours(24))).toBe(true)
    })

    it('should close a window whose end date has passed', () => {
      expect(service.isWindowOpen(hours(-24))).toBe(false)
    })

    /** No plan linked, or a plan with no timeline — there is no window to publish into. */
    it('should treat a missing end date as no window at all', () => {
      expect(service.isWindowOpen('')).toBe(false)
      expect(service.isWindowOpen(null)).toBe(false)
      expect(service.isWindowOpen(undefined)).toBe(false)
    })

    it('should treat an unreadable end date as no window at all', () => {
      expect(service.isWindowOpen('not a date')).toBe(false)
    })
  })
})
