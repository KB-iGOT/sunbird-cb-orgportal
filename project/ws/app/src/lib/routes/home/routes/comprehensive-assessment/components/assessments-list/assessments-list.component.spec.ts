import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject, of, throwError } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { comprehensiveAssessmentList } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { AssessmentsListComponent } from './assessments-list.component'

describe('AssessmentsListComponent', () => {
  let component: AssessmentsListComponent
  let assessmentSvc: any
  let activatedRoute: any
  let router: any
  let dialog: any
  let matSnackBar: any
  let loaderService: any
  let afterClosed: Subject<any>

  const userProfile = { rootOrgId: 'org-1', userId: 'user-1' }
  /** A window a year out, so the publish guard lets the row through unless a test says otherwise. */
  const openWindow = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString()
  const row = { identifier: 'do_123', name: 'APAR assessment', aparPlanEndDate: openWindow }

  /** The tab is taken off the child route the tab link points at. */
  const build = (path = 'live') => {
    activatedRoute = {
      snapshot: {
        url: [{ path }],
        data: { configService: { userProfile } },
      },
    }
    return new AssessmentsListComponent(
      assessmentSvc as ComprehensiveAssessmentService,
      activatedRoute as ActivatedRoute,
      router as Router,
      dialog as MatDialog,
      matSnackBar as MatSnackBar,
      loaderService as LoaderService
    )
  }

  beforeEach(() => {
    afterClosed = new Subject<any>()
    assessmentSvc = {
      searchAssessments: jest.fn().mockReturnValue(of({ content: [row], count: 1 })),
      publishAssessment: jest.fn().mockReturnValue(of({})),
      retireAssessment: jest.fn().mockReturnValue(of({})),
      isWindowOpen: jest.fn().mockReturnValue(true),
    }
    router = { navigate: jest.fn() }
    dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => afterClosed.asObservable() }) }
    matSnackBar = { open: jest.fn() }
    loaderService = { changeLoaderState: jest.fn() }
    component = build()
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should start on the live tab with nothing loaded', () => {
    expect(component.pathUrl).toBe('live')
    expect(component.assessmentsList).toEqual([])
    expect(component.searchKey).toBe('')
  })

  describe('ngOnInit', () => {
    it('should read the tab and the signed in user off the route', () => {
      component = build('draft')

      component.ngOnInit()

      expect(component.pathUrl).toBe('draft')
      expect(component.userProfile).toEqual(userProfile)
    })

    it('should fall back to the live tab when the route names none', () => {
      activatedRoute = { snapshot: { url: [], data: {} } }
      component = new AssessmentsListComponent(
        assessmentSvc, activatedRoute, router, dialog, matSnackBar, loaderService
      )

      component.ngOnInit()

      expect(component.pathUrl).toBe('live')
    })

    it('should open on the first page', () => {
      component.ngOnInit()

      // totalCount is the one value the search fills in, the rest is the opening window
      expect(component.paginationDetails).toEqual({
        startIndex: 0,
        lastIndex: comprehensiveAssessmentList.DEFAULT_PAGE_SIZE,
        pageSize: comprehensiveAssessmentList.DEFAULT_PAGE_SIZE,
        pageIndex: 0,
        totalCount: 1,
      })
    })
  })

  describe('the tab configuration', () => {
    it('should show published on and no publish action on the live tab', () => {
      component.ngOnInit()

      expect(component.tableData.columns.map((column: any) => column.key))
        .toEqual(['name', 'planName', 'reportingYear', 'assessmentWindow', 'status',
          'creator', 'durationDisplay', 'lastPublishedOn'])
      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view', 'edit', 'delete'])
      expect(component.tableData.noDataMessage).toBe('There are no live assessments.')
    })

    it('should show the draft timestamps and the publish action on the draft tab', () => {
      component = build('draft')

      component.ngOnInit()

      expect(component.tableData.columns.map((column: any) => column.key))
        .toEqual(['name', 'planName', 'reportingYear', 'assessmentWindow', 'status',
          'creator', 'durationDisplay', 'createdOn', 'lastUpdatedOn'])
      expect(component.menuItems.map((item: any) => item.action)).toEqual(['edit', 'publish', 'delete'])
      expect(component.tableData.noDataMessage).toBe('There are no draft assessments.')
    })

    it('should list the linked plan and everything derived from it on either tab', () => {
      component.ngOnInit()

      const planColumns = component.tableData.columns.slice(1, 5)
      expect(planColumns).toEqual([
        { displayName: 'Linked APAR Plan', key: 'planName', cellType: 'text', cellClass: 'text-overflow-elipse' },
        { displayName: 'Reporting Year', key: 'reportingYear', cellType: 'text' },
        { displayName: 'Assessment Window', key: 'assessmentWindow', cellType: 'text' },
        { displayName: 'Status', key: 'status', cellType: 'status' },
      ])
    })

    it('should carry the thumbnail on the name column of either tab', () => {
      component.ngOnInit()

      expect(component.tableData.columns[0]).toEqual(expect.objectContaining({
        key: 'name',
        cellType: 'textImage',
        imageKey: 'appIcon',
      }))
    })
  })

  describe('getAssessments', () => {
    it('should ask for the Live assessments of the org on the live tab', () => {
      component.ngOnInit()

      expect(assessmentSvc.searchAssessments).toHaveBeenCalledWith({
        status: comprehensiveAssessmentList.STATUS_LIVE,
        rootOrgId: 'org-1',
        query: '',
        pageSize: comprehensiveAssessmentList.DEFAULT_PAGE_SIZE,
        pageIndex: 0,
      })
    })

    it('should ask for the Draft assessments on the draft tab', () => {
      component = build('draft')

      component.ngOnInit()

      expect(assessmentSvc.searchAssessments).toHaveBeenCalledWith(
        expect.objectContaining({ status: comprehensiveAssessmentList.STATUS_DRAFT })
      )
    })

    it('should list what came back along with the total to page through', () => {
      component.ngOnInit()

      expect(component.assessmentsList).toEqual([row])
      expect(component.paginationDetails.totalCount).toBe(1)
      expect(component.showLoader).toBe(false)
    })

    it('should empty the list and say so when the search fails', () => {
      assessmentSvc.searchAssessments.mockReturnValue(
        throwError(() => ({ error: { message: 'search is down' } }))
      )

      component.ngOnInit()

      expect(component.assessmentsList).toEqual([])
      expect(component.showLoader).toBe(false)
      expect(matSnackBar.open).toHaveBeenCalledWith('search is down')
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.searchAssessments.mockReturnValue(throwError(() => ({})))

      component.ngOnInit()

      expect(matSnackBar.open).toHaveBeenCalledWith('Unable to load the assessments, please try again')
    })

    /** A search issued while the previous one is in flight must not land after it. */
    it('should drop the search still in flight before issuing another', () => {
      const pending = new Subject<any>()
      assessmentSvc.searchAssessments.mockReturnValue(pending.asObservable())
      component.ngOnInit()

      component.getAssessments()
      pending.next({ content: [row], count: 1 })

      expect(component.assessmentsList).toEqual([row])
      expect(assessmentSvc.searchAssessments).toHaveBeenCalledTimes(2)
    })
  })

  describe('searching and paging', () => {
    beforeEach(() => {
      component.ngOnInit()
      assessmentSvc.searchAssessments.mockClear()
    })

    it('should search from the first page whatever page the user was on', () => {
      component.paginationDetails = { ...component.paginationDetails, pageIndex: 3 }

      component.onSearch('apar')

      expect(component.searchKey).toBe('apar')
      expect(component.paginationDetails.pageIndex).toBe(0)
      expect(assessmentSvc.searchAssessments).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'apar', pageIndex: 0 })
      )
    })

    it('should reload on the page the table moved to', () => {
      component.onPageChange({
        startIndex: 40, lastIndex: 60, pageSize: 20, pageIndex: 2, totalCount: 57,
      })

      expect(assessmentSvc.searchAssessments).toHaveBeenCalledWith(
        expect.objectContaining({ pageIndex: 2, pageSize: 20 })
      )
    })
  })

  describe('onActionClick', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should open the assessment to view', () => {
      component.onActionClick({ action: 'view', rows: row })

      expect(router.navigate).toHaveBeenCalledWith(
        ['/app/home/comprehensive-assessment/edit', 'do_123'],
        { queryParams: { mode: 'view', preview: 'true', editMode: 'true', pathUrl: 'live' } }
      )
    })

    it('should open the assessment to edit', () => {
      component.onActionClick({ action: 'edit', rows: row })

      expect(router.navigate).toHaveBeenCalledWith(
        ['/app/home/comprehensive-assessment/edit', 'do_123'],
        expect.objectContaining({ queryParams: expect.objectContaining({ mode: 'edit' }) })
      )
    })

    it('should carry the tab it was opened from so Back returns to it', () => {
      component = build('draft')
      component.ngOnInit()

      component.onActionClick({ action: 'edit', rows: row })

      expect(router.navigate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ queryParams: expect.objectContaining({ pathUrl: 'draft' }) })
      )
    })

    it('should ignore an action raised without a row', () => {
      component.onActionClick({ action: 'delete' })

      expect(dialog.open).not.toHaveBeenCalled()
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('should ignore an action it does not offer', () => {
      component.onActionClick({ action: 'archive', rows: row })

      expect(dialog.open).not.toHaveBeenCalled()
      expect(router.navigate).not.toHaveBeenCalled()
    })
  })

  describe('publishing', () => {
    beforeEach(() => {
      component = build('draft')
      component.ngOnInit()
    })

    it('should ask before publishing', () => {
      component.onActionClick({ action: 'publish', rows: row })

      expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        data: expect.objectContaining({
          message: 'Are you sure you want to publish this assessment?',
        }),
      }))
      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })

    it('should publish once the user confirms', () => {
      component.onActionClick({ action: 'publish', rows: row })

      afterClosed.next(true)

      expect(assessmentSvc.publishAssessment).toHaveBeenCalledWith('do_123', 'user-1')
    })

    it('should leave the assessment alone when the user backs out', () => {
      component.onActionClick({ action: 'publish', rows: row })

      afterClosed.next(false)

      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })

    /**
     * The window belongs to the linked plan and only the plan can correct it, so a closed
     * window stops the publish here rather than sending it to be rejected.
     */
    it('should refuse to publish once the assessment window has ended', () => {
      assessmentSvc.isWindowOpen.mockReturnValue(false)

      component.publishAssessment(row)

      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
      expect(matSnackBar.open).toHaveBeenCalledWith(comprehensiveAssessmentList.WINDOW_CLOSED_MESSAGE)
      expect(loaderService.changeLoaderState).not.toHaveBeenCalled()
    })

    it('should check the window of the plan the assessment is linked to', () => {
      component.publishAssessment(row)

      expect(assessmentSvc.isWindowOpen).toHaveBeenCalledWith(openWindow)
    })

    /** Publishing moves the row out of the Draft tab, so the tab is reloaded. */
    it('should reload the tab once the assessment is published', () => {
      assessmentSvc.searchAssessments.mockClear()

      component.publishAssessment(row)

      expect(matSnackBar.open).toHaveBeenCalledWith('Assessment published successfully')
      expect(assessmentSvc.searchAssessments).toHaveBeenCalledTimes(1)
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should report why the publish failed and keep the list as it is', () => {
      assessmentSvc.publishAssessment.mockReturnValue(
        throwError(() => ({ error: { message: 'questions are missing' } }))
      )
      assessmentSvc.searchAssessments.mockClear()

      component.publishAssessment(row)

      expect(matSnackBar.open).toHaveBeenCalledWith('questions are missing')
      expect(assessmentSvc.searchAssessments).not.toHaveBeenCalled()
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.publishAssessment.mockReturnValue(throwError(() => ({})))

      component.publishAssessment(row)

      expect(matSnackBar.open).toHaveBeenCalledWith('Unable to publish the assessment, please try again')
    })
  })

  describe('deleting', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should warn that the delete cannot be undone', () => {
      component.onActionClick({ action: 'delete', rows: row })

      expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        data: expect.objectContaining({
          message: 'Are you sure you want to delete this assessment? This cannot be undone.',
        }),
      }))
    })

    it('should retire the assessment once the user confirms', () => {
      component.onActionClick({ action: 'delete', rows: row })

      afterClosed.next(true)

      expect(assessmentSvc.retireAssessment).toHaveBeenCalledWith('do_123')
    })

    it('should keep the assessment when the user backs out', () => {
      component.onActionClick({ action: 'delete', rows: row })

      afterClosed.next(false)

      expect(assessmentSvc.retireAssessment).not.toHaveBeenCalled()
    })

    it('should reload the tab once the assessment is deleted', () => {
      assessmentSvc.searchAssessments.mockClear()

      component.deleteAssessment(row)

      expect(matSnackBar.open).toHaveBeenCalledWith('Assessment deleted successfully')
      expect(assessmentSvc.searchAssessments).toHaveBeenCalledTimes(1)
    })

    it('should report why the delete failed', () => {
      assessmentSvc.retireAssessment.mockReturnValue(
        throwError(() => ({ error: { message: 'assessment is in use' } }))
      )

      component.deleteAssessment(row)

      expect(matSnackBar.open).toHaveBeenCalledWith('assessment is in use')
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.retireAssessment.mockReturnValue(throwError(() => ({})))

      component.deleteAssessment(row)

      expect(matSnackBar.open).toHaveBeenCalledWith('Unable to delete the assessment, please try again')
    })
  })

  describe('ngOnDestroy', () => {
    it('should drop the search still in flight', () => {
      assessmentSvc.searchAssessments.mockReturnValue(new Subject<any>().asObservable())
      component.ngOnInit()

      component.ngOnDestroy()

      expect((component as any).searchSubscription.closed).toBe(true)
    })

    it('should be safe on a tab that never loaded', () => {
      expect(() => build().ngOnDestroy()).not.toThrow()
    })
  })
})
