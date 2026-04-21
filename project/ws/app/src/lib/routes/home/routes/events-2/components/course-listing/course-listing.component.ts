import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { EventsService } from '../../services/events.service'
import { PageEvent } from '@angular/material/paginator'
import { environment } from '../../../../../../../../../../../src/environments/environment'

@Component({
  selector: 'ws-app-course-listing',
  templateUrl: './course-listing.component.html',
  styleUrls: ['./course-listing.component.scss']
})
export class CourseListingComponent implements OnInit {

  @Input() courseDetails: any
  @Input() eventDetailsData: any
  @Input() openMode = 'edit'
  @Input() openTab = 'draft'
  @Input() eventStatus = ''
  @Output() courseSelected = new EventEmitter<any>()
  contentList: any[] = []
  selectedCourse: any = null

  // Pagination variables
  pageSize = 10
  pageIndex = 0
  totalCount = 0
  pageSizeOptions = [10, 20, 50, 100]

  // Search and sort
  searchQuery = ''
  sortOrder: 'asc' | 'desc' = 'desc'
  isDraft: boolean = false
  sortType: string = ''

  constructor(
    public eventsService: EventsService
  ) { }

  ngOnInit() {
    this.fetchCourseDetails()
    this.isDraft = this.eventDetailsData?.status?.toLowerCase() === 'draft' ||
      (this.eventDetailsData?.status?.toLowerCase() === 'rejected' && (!this.eventDetailsData?.prevStatus ||
        this.eventDetailsData?.prevStatus?.toLowerCase() === 'sentToPublish'))
    if (this.openMode === 'view' || this.eventStatus === 'live') {
      this.isDraft = false
    }
  }

  fetchCourseDetails() {
    const reqBody = {
      request: {
        limit: this.pageSize,
        offset: this.pageIndex * this.pageSize,
        query: this.searchQuery,
        sort_by: { lastSubmittedOn: this.sortOrder === 'asc' ? 'asc' : 'desc' } as any,
        filters: {
          must: {
            courseCategory: ['Course']
          },
          status: ['Live']
        }
      }
    }

    if (this.sortType === 'name') {
      reqBody.request.sort_by = { name: this.sortOrder === 'asc' ? 'asc' : 'desc' }
    }

    if (this.sortType === 'latest') {
      reqBody.request.sort_by = { lastPublishedOn: this.sortOrder === 'asc' ? 'asc' : 'desc' }
    }

    this.eventsService.getContentSearch(reqBody).subscribe((response: any) => {
      this.contentList = response.result.content || []
      this.totalCount = response.result.count || 0
      if (this.courseDetails?.identifier) {
        this.selectedCourse = this.courseDetails
      }
    })
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value
    this.pageIndex = 0
    this.fetchCourseDetails()
  }

  onSort(order: 'asc' | 'desc', type: string) {
    this.sortOrder = order
    this.sortType = type
    this.pageIndex = 0
    this.fetchCourseDetails()
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize
    this.pageIndex = event.pageIndex
    this.fetchCourseDetails()
  }

  onPageSizeChange(size: number) {
    this.pageSize = size
    this.pageIndex = 0
    this.fetchCourseDetails()
  }

  onCourseSelect(course: any) {
    this.selectedCourse = course
    this.courseSelected.emit(course)
  }

  removeCourse() {
    this.selectedCourse = null
    this.courseSelected.emit(null)
  }

  isSelected(course: any): boolean {
    return this.selectedCourse?.identifier === course?.identifier
  }

  trackByCourse(index: number, course: any): string {
    return course?.identifier || index
  }

  getCorrectUrl(url: string): string {
    if (url && url.includes('nic.in')) {
      return url.replace(/https?:\/\/[^\/]+\.nic\.in/, environment.domainName || '')
    }
    return url ? url : '/assets/images/default.png'
  }
}
