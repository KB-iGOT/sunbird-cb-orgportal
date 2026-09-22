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
  // the window is resolved onto the row by the service, off the plan the assessment carries
  const row = {
    identifier: 'do_123',
    name: 'APAR assessment',
    [comprehensiveAssessmentList.WINDOW_END_KEY]: openWindow,
  }
  /** The listing is served by a search, so the children come from a hierarchy read. */
  const collection = {
    identifier: 'do_123',
    name: 'APAR assessment',
    children: [{ identifier: 'qs-1', name: 'Question set', mimeType: 'application/vnd.sunbird.questionset' }],
  }

  /**
   * The tab is taken off the child route the tab link points at, the roles off the same
   * resolved config. `userRoles` is the lowercased set the init service builds on login.
   */
  const build = (path = 'live', roles: string[] | null = ['mdo_leader']) => {
    activatedRoute = {
      snapshot: {
        url: [{ path }],
        data: { configService: { userProfile, userRoles: roles ? new Set(roles) : null } },
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
      getContentHierarchy: jest.fn().mockReturnValue(of({ result: { content: collection } })),
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

  /**
   * The authoring actions are owner bound for an MDO admin and open to an MDO leader, and
   * the table reads `buttonsToHide` to drop them for one row while the tab menu still
   * carries them. View is never dropped, so the rest of the org stays readable.
   */
  describe('the rows an MDO admin may act on', () => {
    const own = { identifier: 'do_own', createdBy: 'user-1' }
    const someoneElses = { identifier: 'do_other', createdBy: 'user-2' }

    const listFor = (roles: string[], path = 'draft') => {
      assessmentSvc.searchAssessments.mockReturnValue(of({ content: [own, someoneElses], count: 2 }))
      component = build(path, roles)
      component.ngOnInit()
      return component.assessmentsList
    }

    /** The tab menu less whatever the row hides, which is what the table renders. */
    const actionsFor = (row: any) => component.menuItems
      .map((item: any) => item.action)
      .filter((action: string) => !(row.buttonsToHide || []).includes(action))

    /** Their own draft keeps View, Edit, Publish and Delete; the rest of the org keeps View. */
    it('should leave only view on the assessments an MDO admin did not author', () => {
      const [ownRow, otherRow] = listFor(['mdo_admin'])

      expect(ownRow.buttonsToHide).toBeUndefined()
      expect(otherRow.buttonsToHide).toEqual(['edit', 'publish', 'delete'])
    })

    /** The requirement itself: what the table is left to render for each row. */
    it('should leave an MDO admin the whole menu on their own draft and view on the rest', () => {
      const [ownRow, otherRow] = listFor(['mdo_admin'])

      expect(actionsFor(ownRow)).toEqual(['view', 'edit', 'publish', 'delete'])
      expect(actionsFor(otherRow)).toEqual(['view'])
    })

    /** The live tab carries no publish, so the same rule leaves View, Edit and Delete. */
    it('should leave an MDO admin their own live assessment to work on and view on the rest', () => {
      const [ownRow, otherRow] = listFor(['mdo_admin'], 'live')

      expect(actionsFor(ownRow)).toEqual(['view', 'edit', 'delete'])
      expect(actionsFor(otherRow)).toEqual(['view'])
    })

    it('should leave an MDO leader the whole menu on every live assessment', () => {
      const [ownRow, otherRow] = listFor(['mdo_leader'], 'live')

      expect(actionsFor(ownRow)).toEqual(['view', 'edit', 'delete'])
      expect(actionsFor(otherRow)).toEqual(['view', 'edit', 'delete'])
    })

    it('should leave every row editable for an MDO leader', () => {
      const rows = listFor(['mdo_leader'])

      expect(rows.map((listed: any) => listed.buttonsToHide)).toEqual([undefined, undefined])
    })

    /** The unbound role wins, an admin who is also a leader edits the whole org. */
    it('should leave every row editable for an MDO admin who is also a leader', () => {
      const rows = listFor(['mdo_admin', 'mdo_leader'])

      expect(rows.map((listed: any) => listed.buttonsToHide)).toEqual([undefined, undefined])
    })

    /** Nothing to own against, so the owner bound author is left with no row to work on. */
    it('should leave only view on every row while the user id is unresolved', () => {
      assessmentSvc.searchAssessments.mockReturnValue(of({ content: [own, someoneElses], count: 2 }))
      activatedRoute = {
        snapshot: {
          url: [{ path: 'draft' }],
          data: { configService: { userProfile: {}, userRoles: new Set(['mdo_admin']) } },
        },
      }
      component = new AssessmentsListComponent(
        assessmentSvc, activatedRoute, router, dialog, matSnackBar, loaderService
      )

      component.ngOnInit()

      expect(component.assessmentsList.map((listed: any) => listed.buttonsToHide))
        .toEqual([['edit', 'publish', 'delete'], ['edit', 'publish', 'delete']])
    })

    /** A row already suppressing an action keeps it, the owner rule only adds to the list. */
    it('should keep the actions a row already hides', () => {
      assessmentSvc.searchAssessments.mockReturnValue(
        of({ content: [{ ...someoneElses, buttonsToHide: ['delete'] }], count: 1 })
      )
      component = build('draft', ['mdo_admin'])

      component.ngOnInit()

      expect(component.assessmentsList[0].buttonsToHide).toEqual(['delete', 'edit', 'publish'])
    })
  })

  describe('the tab configuration', () => {
    /** A published assessment is viewed and edited, it is not deleted off the dashboard. */
    it('should show published on and view, edit and delete on the live tab', () => {
      component.ngOnInit()

      expect(component.tableData.columns.map((column: any) => column.key))
        .toEqual(['name', 'planName', 'reportingYear', 'assessmentWindow', 'creator', 'lastPublishedOn'])
      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view', 'edit', 'delete'])
      expect(component.tableData.noDataMessage).toBe('There are no live assessments.')
    })

    it('should show when it was created and the publish action on the draft tab', () => {
      component = build('draft')

      component.ngOnInit()

      expect(component.tableData.columns.map((column: any) => column.key))
        .toEqual(['name', 'planName', 'reportingYear', 'assessmentWindow', 'creator', 'createdOn'])
      expect(component.menuItems.map((item: any) => item.action))
        .toEqual(['view', 'edit', 'publish', 'delete'])
      expect(component.tableData.noDataMessage).toBe('There are no draft assessments.')
    })

    /** Edit is the one action the requirement holds behind a role. */
    it('should not offer edit to a user holding neither editing role', () => {
      component = build('draft', ['content_creator'])

      component.ngOnInit()

      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view', 'publish', 'delete'])
    })

    it('should not offer edit on the live tab either without an editing role', () => {
      component = build('live', ['content_creator'])

      component.ngOnInit()

      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view', 'delete'])
    })

    /** An MDO admin edits their own assessments, so the tab menu carries the action. */
    it('should offer edit to an MDO admin on either tab', () => {
      component = build('draft', ['mdo_admin'])

      component.ngOnInit()

      expect(component.menuItems.map((item: any) => item.action))
        .toEqual(['view', 'edit', 'publish', 'delete'])

      component = build('live', ['mdo_admin'])

      component.ngOnInit()

      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view', 'edit', 'delete'])
    })

    /** A role set that never resolved is not a reason to offer an action that needs one. */
    it('should not offer edit while the roles are unresolved', () => {
      component = build('draft', null)

      component.ngOnInit()

      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view', 'publish', 'delete'])
    })

    /** A retired assessment is kept for the record, so it is read and nothing else. */
    it('should show when it was retired and view alone on the retired tab', () => {
      component = build('retired')

      component.ngOnInit()

      expect(component.tableData.columns.map((column: any) => column.key))
        .toEqual(['name', 'planName', 'reportingYear', 'assessmentWindow', 'creator', 'lastUpdatedOn'])
      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view'])
      expect(component.tableData.noDataMessage).toBe('There are no retired assessments.')
    })

    it('should offer view alone on the retired tab whatever role the user holds', () => {
      component = build('retired', ['mdo_leader'])
      component.ngOnInit()
      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view'])

      component = build('retired', ['mdo_admin'])
      component.ngOnInit()
      expect(component.menuItems.map((item: any) => item.action)).toEqual(['view'])
    })

    it('should list the linked plan and everything derived from it on either tab', () => {
      component.ngOnInit()

      const planColumns = component.tableData.columns.slice(1, 4)
      expect(planColumns).toEqual([
        { displayName: 'Linked APAR Plan', key: 'planName', cellType: 'text', cellClass: 'text-overflow-elipse' },
        { displayName: 'Reporting Year', key: 'reportingYear', cellType: 'text' },
        { displayName: 'Assessment Window', key: 'assessmentWindow', cellType: 'text' },
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

    it('should ask for the Retired assessments on the retired tab', () => {
      component = build('retired')

      component.ngOnInit()

      expect(assessmentSvc.searchAssessments).toHaveBeenCalledWith(
        expect.objectContaining({ status: comprehensiveAssessmentList.STATUS_RETIRED })
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

    /**
     * Publishing is two publishes, the question set first - the dialog walks both of them,
     * so the row action hands over to it rather than publishing the assessment itself.
     */
    it('should open the publish dialog on the assessment being published', () => {
      component.onActionClick({ action: 'publish', rows: row })

      expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        disableClose: true,
        data: expect.objectContaining({ collection, userProfile }),
      }))
      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })

    /** The row comes off a search, which answers only the fields it projects - not children. */
    it('should read the hierarchy for the resources the row does not carry', () => {
      component.onActionClick({ action: 'publish', rows: row })

      expect(assessmentSvc.getContentHierarchy).toHaveBeenCalledWith('do_123')
    })

    it('should say why the assessment could not be read rather than open the dialog', () => {
      assessmentSvc.getContentHierarchy.mockReturnValue(
        throwError(() => ({ error: { message: 'the assessment could not be read' } }))
      )

      component.onActionClick({ action: 'publish', rows: row })

      expect(dialog.open).not.toHaveBeenCalled()
      expect(matSnackBar.open).toHaveBeenCalledWith('the assessment could not be read')
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should leave the list as it is when the dialog is closed part way through', () => {
      assessmentSvc.searchAssessments.mockClear()

      component.onActionClick({ action: 'publish', rows: row })
      afterClosed.next(false)

      expect(matSnackBar.open).not.toHaveBeenCalledWith('Assessment published successfully')
      expect(assessmentSvc.searchAssessments).not.toHaveBeenCalled()
    })

    /**
     * The window belongs to the linked plan and only the plan can correct it, so a closed
     * window stops the publish here rather than sending it to be rejected.
     */
    it('should refuse to publish once the assessment window has ended', () => {
      assessmentSvc.isWindowOpen.mockReturnValue(false)

      component.publishAssessment(row)

      expect(dialog.open).not.toHaveBeenCalled()
      expect(assessmentSvc.getContentHierarchy).not.toHaveBeenCalled()
      expect(matSnackBar.open).toHaveBeenCalledWith(comprehensiveAssessmentList.WINDOW_CLOSED_MESSAGE)
      expect(loaderService.changeLoaderState).not.toHaveBeenCalled()
    })

    it('should check the window of the plan the assessment is linked to', () => {
      component.publishAssessment(row)

      expect(assessmentSvc.isWindowOpen).toHaveBeenCalledWith(openWindow)
    })

    /**
     * Publishing moves the row out of the Draft tab, and the platform is still finishing the
     * publish when the dialog closes - so the Live tab is opened once it has had its seconds.
     */
    it('should open the Live tab once the platform has had its seconds', () => {
      jest.useFakeTimers()

      component.publishAssessment(row)
      afterClosed.next(true)

      expect(matSnackBar.open).toHaveBeenCalledWith('Assessment published successfully')
      expect(router.navigate).not.toHaveBeenCalled()

      jest.advanceTimersByTime(comprehensiveAssessmentList.PUBLISH_SETTLE_MS)

      expect(router.navigate).toHaveBeenCalledWith(['/app/home/comprehensive-assessment', 'live'])
      jest.useRealTimers()
    })

    it('should hold the loader up for the wait rather than leave the tab looking idle', () => {
      jest.useFakeTimers()

      component.publishAssessment(row)
      afterClosed.next(true)

      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(true)

      jest.advanceTimersByTime(comprehensiveAssessmentList.PUBLISH_SETTLE_MS)

      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
      jest.useRealTimers()
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.getContentHierarchy.mockReturnValue(throwError(() => ({})))

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
