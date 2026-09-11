import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router'
import { Subject, of } from 'rxjs'
import { BasicInfoComponent } from '../../dialogs/basic-info/basic-info.component'
import { ComprehensiveAssessmentsComponent } from './comprehensive-assessments.component'

describe('ComprehensiveAssessmentsComponent', () => {
  let component: ComprehensiveAssessmentsComponent
  let dialog: any
  let activatedRoute: any
  let router: any
  let routerEvents: Subject<any>
  let afterClosed: Subject<any>

  const userProfile = { rootOrgId: 'org-1', userId: 'user-1' }

  beforeEach(() => {
    afterClosed = new Subject<any>()
    dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => afterClosed.asObservable() }) }
    activatedRoute = {
      snapshot: {
        data: {
          configService: {
            userProfile,
            userProfileV2: { email: 'creator@igot.in' },
          },
        },
      },
    }
    routerEvents = new Subject<any>()
    router = {
      url: '/app/home/comprehensive-assessment/live',
      events: routerEvents.asObservable(),
      navigate: jest.fn(),
    }
    component = new ComprehensiveAssessmentsComponent(
      dialog as MatDialog,
      activatedRoute as ActivatedRoute,
      router as Router
    )
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should start on the live tab', () => {
    expect(component.currentRoute).toBe('live')
  })

  describe('ngOnInit', () => {
    it('should read the signed in user off the route', () => {
      component.ngOnInit()

      expect(component.userProfile).toEqual(userProfile)
      expect(component.userEmail).toBe('creator@igot.in')
    })

    it('should fall back to no email when the profile carries none', () => {
      activatedRoute.snapshot.data.configService.userProfileV2 = {}

      component.ngOnInit()

      expect(component.userEmail).toBe('')
    })

    it('should highlight the tab the url is already on', () => {
      router.url = '/app/home/comprehensive-assessment/draft'

      component.ngOnInit()

      expect(component.currentRoute).toBe('draft')
    })
  })

  describe('updateCurrentRoute', () => {
    it('should take the tab off the last url segment', () => {
      router.url = '/app/home/comprehensive-assessment/draft'

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('draft')
    })

    it('should ignore the query string behind the tab', () => {
      router.url = '/app/home/comprehensive-assessment/live?pageIndex=2'

      component.updateCurrentRoute()

      expect(component.currentRoute).toBe('live')
    })
  })

  describe('following the router', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should move the highlight once a navigation finishes', () => {
      router.url = '/app/home/comprehensive-assessment/draft'

      routerEvents.next(new NavigationEnd(1, '/x', '/x'))

      expect(component.currentRoute).toBe('draft')
    })

    it('should leave the highlight where it is while a navigation is only starting', () => {
      router.url = '/app/home/comprehensive-assessment/draft'

      routerEvents.next(new NavigationStart(1, '/x'))

      expect(component.currentRoute).toBe('live')
    })
  })

  describe('openBasicInfoDialog', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should open the dialog with the signed in user', () => {
      component.openBasicInfoDialog()

      expect(dialog.open).toHaveBeenCalledWith(BasicInfoComponent, {
        panelClass: 'create-comprehensive-assessment-dialog',
        data: { userProfile, userEmail: 'creator@igot.in' },
      })
    })

    /**
     * preview/editMode are read by @sunbird-cb/toc off the url to pick its draft aware
     * hierarchy endpoint, and a new assessment is a draft so Back lands on the Draft tab.
     */
    it('should open the builder on the assessment the dialog created', () => {
      component.openBasicInfoDialog()

      afterClosed.next('do_123')

      expect(router.navigate).toHaveBeenCalledWith(
        ['/app/home/comprehensive-assessment/edit', 'do_123'],
        { queryParams: { mode: 'edit', preview: 'true', editMode: 'true', pathUrl: 'draft' } }
      )
    })

    it('should stay on the list when the dialog is cancelled', () => {
      dialog.open.mockReturnValue({ afterClosed: () => of(undefined) })

      component.openBasicInfoDialog()

      expect(router.navigate).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should stop following the router', () => {
      component.ngOnInit()

      component.ngOnDestroy()

      expect((component as any).routeSubscription.closed).toBe(true)
    })

    it('should be safe on a tab that never initialised', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
