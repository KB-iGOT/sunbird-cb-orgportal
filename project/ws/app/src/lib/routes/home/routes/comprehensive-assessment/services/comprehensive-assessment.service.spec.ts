import { DatePipe } from '@angular/common'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { aparPlan } from '../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from './comprehensive-assessment.service'

const PLAN_SEARCH_URL = 'apis/proxies/v8/cbplan/v3/search'
const CONTENT_SEARCH_URL = 'apis/proxies/v8/sunbirdigot/v4/search'

/** One row as the cbplan v3 search hands it back. */
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
    rootOrgId: 'org-1',
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
    it('should post the filter the cbplan v3 search expects', () => {
      service.searchAparPlans(searchParams).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({
        filter: {
          status: ['Live'],
          orgIdList: ['org-1'],
          isApar: true,
          planYear: '2026-27',
        },
        pageNumber: 0,
        pageSize: 20,
        searchString: '',
        orderBy: 'createdAt',
        orderDirection: 'desc',
      })
      req.flush(planSearchResponse([]))
    })

    it('should leave planYear off the filter while the list is not narrowed to one year', () => {
      service.searchAparPlans({ ...searchParams, planYear: aparPlan.ALL_YEARS }).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.body.filter.planYear).toBeUndefined()
      req.flush(planSearchResponse([]))
    })

    it('should drop the ordering while a search is on, the api orders by relevance then', () => {
      service.searchAparPlans({ ...searchParams, searchString: 'section officer' }).subscribe()

      const req = httpMock.expectOne(PLAN_SEARCH_URL)
      expect(req.request.body.searchString).toBe('section officer')
      expect(req.request.body.orderBy).toBeUndefined()
      expect(req.request.body.orderDirection).toBeUndefined()
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

  describe('getPlanIdsWithLiveAssessment', () => {
    it('should ask the content search for the plan id of every Live assessment', () => {
      service.getPlanIdsWithLiveAssessment('org-1').subscribe()

      const req = httpMock.expectOne(CONTENT_SEARCH_URL)
      expect(req.request.body.request.fields).toEqual(['identifier', 'aparPlanId'])
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
            { identifier: 'ca-1', aparPlanId: 'plan-1' },
            { identifier: 'ca-2' },
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
    }

    it('should write the linked plan onto the content under the apar keys', () => {
      expect(service.buildPlanMetadata(linkedPlan)).toEqual({
        aparPlanId: 'plan-1',
        aparPlanName: 'APAR 2026-27 — Section Officer & Under Secretary',
        aparYear: '2026-27',
        aparPlanEndDate: '2027-03-31T00:00:00.000Z',
        aparPlanOrgName: 'Department of Personnel & Training',
        // the content schema types the numeric extras as String
        aparGatingCourseCount: '2',
      })
    })

    it('should clear every key when no plan is linked', () => {
      expect(service.buildPlanMetadata(null)).toEqual({
        aparPlanId: '',
        aparPlanName: '',
        aparYear: '',
        aparPlanEndDate: '',
        aparPlanOrgName: '',
        aparGatingCourseCount: '0',
      })
    })

    it('should read the linked plan back off a saved assessment', () => {
      expect(service.readPlanMetadata(service.buildPlanMetadata(linkedPlan))).toEqual(linkedPlan)
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
      service.publishAssessment('do-1', 'user-1').subscribe()

      const req = httpMock.expectOne('apis/proxies/v8/action/content/v3/publish/do-1')
      expect(req.request.body).toEqual({ request: { content: { lastPublishedBy: 'user-1' } } })
      req.flush({})
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
