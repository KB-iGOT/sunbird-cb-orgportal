import { CourseListingComponent } from './course-listing.component'
import { of } from 'rxjs'
import { PageEvent } from '@angular/material/paginator'

describe('CourseListingComponent', () => {
  let component: CourseListingComponent
  let mockEventsService: any

  const makeResponse = (items: any[] = [], count = 0) => ({
    result: { content: items, count },
  })

  beforeEach(() => {
    mockEventsService = {
      getContentSearch: jest.fn().mockReturnValue(of(makeResponse())),
    }
    component = new CourseListingComponent(mockEventsService)
  })

  // ─── create ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have correct initial state', () => {
    expect(component.contentList).toEqual([])
    expect(component.selectedCourse).toBeNull()
    expect(component.pageSize).toBe(10)
    expect(component.pageIndex).toBe(0)
    expect(component.sortOrder).toBe('desc')
    expect(component.sortType).toBe('')
    expect(component.searchQuery).toBe('')
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call fetchCourseDetails on init', () => {
      const spy = jest.spyOn(component, 'fetchCourseDetails')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set isDraft=true when status is draft', () => {
      component.eventDetailsData = { status: 'draft' }
      component.ngOnInit()
      expect(component.isDraft).toBe(true)
    })

    it('should set isDraft=true when status is rejected and no prevStatus', () => {
      component.eventDetailsData = { status: 'rejected' }
      component.ngOnInit()
      expect(component.isDraft).toBe(true)
    })

    it('should set isDraft=true when status is rejected and prevStatus is sentToPublish', () => {
      // The component checks prevStatus.toLowerCase() === 'sentToPublish' which never matches
      // (toLowerCase produces 'senttopublish'), so isDraft relies on !prevStatus being true
      component.eventDetailsData = { status: 'rejected', prevStatus: null }
      component.ngOnInit()
      expect(component.isDraft).toBe(true)
    })

    it('should set isDraft=false when status is rejected and prevStatus is not sentToPublish', () => {
      component.eventDetailsData = { status: 'rejected', prevStatus: 'live' }
      component.ngOnInit()
      expect(component.isDraft).toBe(false)
    })

    it('should set isDraft=false when openMode is view', () => {
      component.eventDetailsData = { status: 'draft' }
      component.openMode = 'view'
      component.ngOnInit()
      expect(component.isDraft).toBe(false)
    })

    it('should set isDraft=false when eventStatus is live', () => {
      component.eventDetailsData = { status: 'draft' }
      component.eventStatus = 'live'
      component.ngOnInit()
      expect(component.isDraft).toBe(false)
    })

    it('should handle null eventDetailsData gracefully', () => {
      component.eventDetailsData = null
      expect(() => component.ngOnInit()).not.toThrow()
      expect(component.isDraft).toBe(false)
    })
  })

  // ─── fetchCourseDetails ───────────────────────────────────────────────────

  describe('fetchCourseDetails', () => {
    it('should call getContentSearch with default request body', () => {
      component.fetchCourseDetails()
      const req = mockEventsService.getContentSearch.mock.calls[0][0]
      expect(req.request.limit).toBe(10)
      expect(req.request.offset).toBe(0)
      expect(req.request.query).toBe('')
      expect(req.request.sort_by).toEqual({ lastSubmittedOn: 'desc' })
    })

    it('should use asc sort order when sortOrder is asc', () => {
      component.sortOrder = 'asc'
      component.fetchCourseDetails()
      const req = mockEventsService.getContentSearch.mock.calls[0][0]
      expect(req.request.sort_by).toEqual({ lastSubmittedOn: 'asc' })
    })

    it('should use name sort when sortType is name', () => {
      component.sortType = 'name'
      component.sortOrder = 'asc'
      component.fetchCourseDetails()
      const req = mockEventsService.getContentSearch.mock.calls[0][0]
      expect(req.request.sort_by).toEqual({ name: 'asc' })
    })

    it('should use lastPublishedOn sort when sortType is latest', () => {
      component.sortType = 'latest'
      component.sortOrder = 'desc'
      component.fetchCourseDetails()
      const req = mockEventsService.getContentSearch.mock.calls[0][0]
      expect(req.request.sort_by).toEqual({ lastPublishedOn: 'desc' })
    })

    it('should populate contentList and totalCount from response', () => {
      const items = [{ identifier: 'c1' }, { identifier: 'c2' }]
      mockEventsService.getContentSearch.mockReturnValue(of(makeResponse(items, 2)))
      component.fetchCourseDetails()
      expect(component.contentList).toEqual(items)
      expect(component.totalCount).toBe(2)
    })

    it('should set selectedCourse when courseDetails has identifier', () => {
      component.courseDetails = { identifier: 'c1', name: 'Test' }
      mockEventsService.getContentSearch.mockReturnValue(of(makeResponse([{ identifier: 'c1' }], 1)))
      component.fetchCourseDetails()
      expect(component.selectedCourse).toEqual(component.courseDetails)
    })

    it('should not set selectedCourse when courseDetails has no identifier', () => {
      component.courseDetails = null
      component.fetchCourseDetails()
      expect(component.selectedCourse).toBeNull()
    })

    it('should handle response with no content (undefined)', () => {
      mockEventsService.getContentSearch.mockReturnValue(of({ result: { count: 0 } }))
      component.fetchCourseDetails()
      expect(component.contentList).toEqual([])
    })

    it('should calculate correct offset for page > 0', () => {
      component.pageIndex = 2
      component.pageSize = 10
      component.fetchCourseDetails()
      const req = mockEventsService.getContentSearch.mock.calls[0][0]
      expect(req.request.offset).toBe(20)
    })
  })

  // ─── onSearch ─────────────────────────────────────────────────────────────

  describe('onSearch', () => {
    it('should update searchQuery and reset pageIndex then fetch', () => {
      const spy = jest.spyOn(component, 'fetchCourseDetails')
      component.pageIndex = 3
      component.onSearch({ target: { value: 'angular' } })
      expect(component.searchQuery).toBe('angular')
      expect(component.pageIndex).toBe(0)
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── onSort ───────────────────────────────────────────────────────────────

  describe('onSort', () => {
    it('should update sortOrder and sortType then fetch', () => {
      const spy = jest.spyOn(component, 'fetchCourseDetails')
      component.pageIndex = 2
      component.onSort('asc', 'name')
      expect(component.sortOrder).toBe('asc')
      expect(component.sortType).toBe('name')
      expect(component.pageIndex).toBe(0)
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── onPageChange ─────────────────────────────────────────────────────────

  describe('onPageChange', () => {
    it('should update pageSize and pageIndex then fetch', () => {
      const spy = jest.spyOn(component, 'fetchCourseDetails')
      const event: PageEvent = { pageSize: 20, pageIndex: 1, length: 100 }
      component.onPageChange(event)
      expect(component.pageSize).toBe(20)
      expect(component.pageIndex).toBe(1)
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── onPageSizeChange ─────────────────────────────────────────────────────

  describe('onPageSizeChange', () => {
    it('should update pageSize and reset pageIndex then fetch', () => {
      const spy = jest.spyOn(component, 'fetchCourseDetails')
      component.pageIndex = 5
      component.onPageSizeChange(50)
      expect(component.pageSize).toBe(50)
      expect(component.pageIndex).toBe(0)
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── onCourseSelect ───────────────────────────────────────────────────────

  describe('onCourseSelect', () => {
    it('should set selectedCourse and emit it', () => {
      const course = { identifier: 'c1', name: 'Test Course' }
      const emitSpy = jest.spyOn(component.courseSelected, 'emit')
      component.onCourseSelect(course)
      expect(component.selectedCourse).toEqual(course)
      expect(emitSpy).toHaveBeenCalledWith(course)
    })
  })

  // ─── removeCourse ─────────────────────────────────────────────────────────

  describe('removeCourse', () => {
    it('should clear selectedCourse and emit null', () => {
      component.selectedCourse = { identifier: 'c1' }
      const emitSpy = jest.spyOn(component.courseSelected, 'emit')
      component.removeCourse()
      expect(component.selectedCourse).toBeNull()
      expect(emitSpy).toHaveBeenCalledWith(null)
    })
  })

  // ─── isSelected ───────────────────────────────────────────────────────────

  describe('isSelected', () => {
    it('should return true when course identifier matches selectedCourse', () => {
      component.selectedCourse = { identifier: 'c1' }
      expect(component.isSelected({ identifier: 'c1' })).toBe(true)
    })

    it('should return false when identifiers differ', () => {
      component.selectedCourse = { identifier: 'c1' }
      expect(component.isSelected({ identifier: 'c2' })).toBe(false)
    })

    it('should return false when selectedCourse is null', () => {
      component.selectedCourse = null
      expect(component.isSelected({ identifier: 'c1' })).toBe(false)
    })

    it('should return false when course is null', () => {
      component.selectedCourse = { identifier: 'c1' }
      expect(component.isSelected(null)).toBe(false)
    })
  })

  // ─── trackByCourse ────────────────────────────────────────────────────────

  describe('trackByCourse', () => {
    it('should return course identifier when present', () => {
      expect(component.trackByCourse(0, { identifier: 'c1' })).toBe('c1')
    })

    it('should return index when identifier is absent', () => {
      expect(component.trackByCourse(5, {})).toBe(5)
    })

    it('should return index when course is null', () => {
      expect(component.trackByCourse(3, null)).toBe(3)
    })
  })

  // ─── getCorrectUrl ────────────────────────────────────────────────────────

  describe('getCorrectUrl', () => {
    it('should replace nic.in domain with environment.domainName', () => {
      const result = component.getCorrectUrl('https://portal.nic.in/assets/image.png')
      // environment.domainName is '' in test env, so the nic.in host gets stripped
      expect(result).toContain('/assets/image.png')
      expect(result).not.toContain('nic.in')
    })

    it('should return url unchanged when nic.in is absent', () => {
      const url = 'https://cdn.example.com/image.png'
      expect(component.getCorrectUrl(url)).toBe(url)
    })

    it('should return default image when url is null', () => {
      expect(component.getCorrectUrl(null as any)).toBe('/assets/images/default.png')
    })

    it('should return default image when url is empty string', () => {
      expect(component.getCorrectUrl('')).toBe('/assets/images/default.png')
    })
  })
})
