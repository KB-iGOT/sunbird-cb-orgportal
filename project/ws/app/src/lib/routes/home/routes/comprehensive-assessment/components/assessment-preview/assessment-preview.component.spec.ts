import { ElementRef, NgZone } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { QUESTIONSET_MIME_TYPE, QUESTIONSET_PRIMARY_CATEGORY } from '../../models/comprehensive-assessment.model'
import { CA_DRAFT_PREVIEW_PARAM } from '../../../../../../../../../../../src/app/services/ca-hierarchy-interceptor.service'
import { AssessmentPreviewComponent } from './assessment-preview.component'

describe('AssessmentPreviewComponent', () => {
  let component: AssessmentPreviewComponent
  let sanitizer: any
  let assessmentSvc: any
  let host: any
  let ngZone: any

  /** The sanitizer hands the url straight back, so the tests can read what was opened. */
  const openedUrl = (): string => String(component.playerUrl)

  const hierarchy = (overrides: any = {}) => ({
    identifier: 'do_collection',
    name: 'Basic assessmnet',
    channel: '01392275379456409617',
    children: [{ identifier: 'do_questionset', mimeType: QUESTIONSET_MIME_TYPE }],
    ...overrides,
  })

  /**
   * A click on the card's View anchor. `href` is what Angular renders once the toc has
   * resolved its routerLink, so a null one stands for the link it could not work out.
   */
  const viewClick = (href: string | null = null) => {
    const anchor = { getAttribute: jest.fn(() => href) }
    return {
      target: { closest: jest.fn((selector: string) => (selector === 'a.action-button' ? anchor : null)) },
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as Event
  }

  /** A click anywhere on the card that is not the View button. */
  const otherClick = () => ({
    target: { closest: jest.fn(() => null) },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  } as unknown as Event)

  beforeEach(() => {
    sanitizer = { bypassSecurityTrustResourceUrl: jest.fn((url: string) => url) }
    assessmentSvc = {
      getLinkedAssessmentId: jest.fn((content: any) =>
        ((content && content.children) || [])
          .filter((child: any) => child.mimeType === QUESTIONSET_MIME_TYPE)
          .map((child: any) => child.identifier)[0] || ''),
    }
    host = { addEventListener: jest.fn(), removeEventListener: jest.fn() }
    // the zone only has to run what it is handed, the component drives the rest
    ngZone = { run: jest.fn((fn: () => void) => fn()) }
    component = new AssessmentPreviewComponent(
      sanitizer as DomSanitizer,
      assessmentSvc as ComprehensiveAssessmentService,
      { nativeElement: host } as ElementRef,
      ngZone as NgZone
    )
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should open on the card, with no player', () => {
    expect(component.content).toBeUndefined()
    expect(component.playerUrl).toBeNull()
    expect(component.isPlayerOpen).toBe(false)
  })

  describe('opening the player from the card', () => {
    beforeEach(() => {
      component.content = hierarchy()
    })

    /**
     * RouterLink answers the click on the anchor itself, so the event has to be stopped
     * on the way down — preventing the default alone leaves the router already navigating.
     */
    it('should stop the click before RouterLink can navigate away from the step', () => {
      const event = viewClick('/app/home/explore-content/viewer/practice/do_questionset?preview=true')

      component.onPreviewClick(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    /** The toc worked the address out, so its query string is taken as it stands. */
    it('should open what the View link pointed at, on the player page', () => {
      component.onPreviewClick(viewClick(
        '/app/home/explore-content/viewer/practice/do_questionset?preview=true&editMode=true'))

      expect(component.isPlayerOpen).toBe(true)
      expect(openedUrl()).toContain('/app/assessment-player/practice/do_questionset')
      expect(openedUrl()).toContain('preview=true')
      expect(openedUrl()).toContain('editMode=true')
    })

    /**
     * The toc addresses the player under the home shell, which wraps it in the portal's
     * left menu. The same routes are mounted on a bare page for the step to frame.
     */
    it('should move the address off the home shell onto the player page', () => {
      component.onPreviewClick(viewClick('/app/home/explore-content/viewer/practice/do_qs?x=1'))

      expect(openedUrl()).not.toContain('/app/home/explore-content/viewer')
      expect(openedUrl()).toContain('/app/assessment-player/practice/do_qs')
    })

    /**
     * The toc actually builds the short form and the app redirects it into the home shell
     * on navigation, so this is the one the anchor really carries.
     */
    it('should move the short address the toc builds onto the player page', () => {
      component.onPreviewClick(viewClick('/viewer/practice/do_qs?preview=true'))

      expect(openedUrl()).toContain('/app/assessment-player/practice/do_qs')
      expect(openedUrl()).not.toContain('/viewer/practice')
    })

    /** A path that merely mentions the viewer elsewhere is not an address to rewrite. */
    it('should leave an address that does not start at the viewer alone', () => {
      component.onPreviewClick(viewClick('/app/home/some-viewer-report?x=1'))

      expect(openedUrl()).toContain('/app/home/some-viewer-report')
    })

    /**
     * Inside the frame the location is the player's own, so the marker is what tells the
     * hierarchy interceptor this is a draft assessment and not a published course.
     */
    it('should mark the frame as a draft assessment preview', () => {
      component.onPreviewClick(viewClick('/app/home/explore-content/viewer/practice/do_qs?preview=true'))

      expect(openedUrl()).toContain(`${CA_DRAFT_PREVIEW_PARAM}=true`)
    })

    it('should mark an address that carries no query string of its own', () => {
      component.onPreviewClick(viewClick('/app/home/explore-content/viewer/practice/do_qs'))

      expect(openedUrl()).toContain(`/app/assessment-player/practice/do_qs?${CA_DRAFT_PREVIEW_PARAM}=true`)
    })

    /**
     * Finish otherwise lands on the content preview page, which arrives wearing the whole
     * portal and which the builder never came from.
     */
    it('should name where the player\'s Finish should land', () => {
      component.onPreviewClick(viewClick('/viewer/practice/do_qs?preview=true'))

      expect(openedUrl()).toContain('finishUrl=')
    })

    it('should land Finish back on the player, inside the frame', () => {
      component.onPreviewClick(viewClick('/viewer/practice/do_qs?preview=true'))

      const landing = decodeURIComponent(openedUrl().split('finishUrl=')[1])
      expect(landing).toContain('/app/assessment-player/practice/do_qs')
      expect(landing).not.toContain('/app/home/explore-content')
    })

    it('should not name the landing twice', () => {
      const href = `/app/assessment-player/practice/do_qs?${CA_DRAFT_PREVIEW_PARAM}=true&finishUrl=%2Fx`
      component.onPreviewClick(viewClick(href))

      expect(openedUrl().match(/finishUrl=/g)).toHaveLength(1)
    })

    it('should not mark an address twice', () => {
      const href = `/app/assessment-player/practice/do_qs?${CA_DRAFT_PREVIEW_PARAM}=true`
      component.onPreviewClick(viewClick(href))

      expect(openedUrl().match(new RegExp(`${CA_DRAFT_PREVIEW_PARAM}=true`, 'g'))).toHaveLength(1)
    })

    /** Only when the toc worked no link out does the component address the player itself. */
    it('should fall back to its own address when the toc left the View dead', () => {
      component.onPreviewClick(viewClick(null))

      expect(component.isPlayerOpen).toBe(true)
      expect(openedUrl()).toContain('/app/assessment-player/practice/do_questionset')
      expect(openedUrl()).toContain('preview=true')
      expect(openedUrl()).toContain('editMode=true')
    })

    it('should ignore a click anywhere else on the card', () => {
      const event = otherClick()

      component.onPreviewClick(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(component.isPlayerOpen).toBe(false)
    })

    it('should be safe on a click carrying no element', () => {
      const event = { target: null, preventDefault: jest.fn() } as unknown as Event

      expect(() => component.onPreviewClick(event)).not.toThrow()
      expect(component.isPlayerOpen).toBe(false)
    })

    it('should stay on the card when there is nothing to play and no link', () => {
      component.content = hierarchy({ children: [] })
      const event = viewClick(null)

      component.onPreviewClick(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(component.isPlayerOpen).toBe(false)
    })
  })

  describe('catching the click on the way down', () => {
    /** Bound in the capture phase, which is the only phase that beats RouterLink to it. */
    it('should listen on the host in the capture phase', () => {
      component.ngAfterViewInit()

      expect(host.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), true)
    })

    it('should drop the listener when the step goes away', () => {
      component.ngAfterViewInit()
      const bound = host.addEventListener.mock.calls[0][1]

      component.ngOnDestroy()

      expect(host.removeEventListener).toHaveBeenCalledWith('click', bound, true)
    })

    it('should open the player through the listener it bound', () => {
      component.content = hierarchy()
      component.ngAfterViewInit()
      const bound = host.addEventListener.mock.calls[0][1]

      bound(viewClick('/player'))

      expect(ngZone.run).toHaveBeenCalled()
      expect(component.isPlayerOpen).toBe(true)
    })
  })

  describe('closing the player', () => {
    it('should put the card back', () => {
      component.content = hierarchy()
      component.onPreviewClick(viewClick('/player'))

      component.closePlayer()

      expect(component.isPlayerOpen).toBe(false)
      expect(component.playerUrl).toBeNull()
    })

    /** A newer draft means whatever is open is stale. */
    it('should put the card back when a newer draft arrives', () => {
      component.content = hierarchy()
      component.onPreviewClick(viewClick('/player'))

      component.ngOnChanges()

      expect(component.isPlayerOpen).toBe(false)
    })
  })

  describe('the address it falls back to', () => {
    /** The player is addressed by the question set, never by the collection around it. */
    it('should point at the question set of the assessment', () => {
      component.content = hierarchy()

      expect(component.buildPlayerUrl())
        .toContain('/app/assessment-player/practice/do_questionset?')
    })

    it('should carry everything the player needs to resolve the assessment', () => {
      component.content = hierarchy()
      const url = component.buildPlayerUrl()

      expect(url).toContain('collectionId=do_collection')
      expect(url).toContain('collectionType=Course')
      expect(url).toContain(`primaryCategory=${encodeURIComponent(QUESTIONSET_PRIMARY_CATEGORY)}`)
      expect(url).toContain('courseName=Basic%20assessmnet')
      expect(url).toContain('channelId=01392275379456409617')
    })

    it('should escape a name carrying characters a url cannot hold', () => {
      component.content = hierarchy({ name: 'APAR & CA / 2026' })

      expect(component.buildPlayerUrl()).toContain('courseName=APAR%20%26%20CA%20%2F%202026')
    })

    it('should have no address until a question set is created', () => {
      component.content = hierarchy({ children: [] })

      expect(component.buildPlayerUrl()).toBe('')
    })

    it('should have no address before the assessment itself is saved', () => {
      component.content = hierarchy({ identifier: '' })

      expect(component.buildPlayerUrl()).toBe('')
    })

    it('should have no address with no content at all', () => {
      component.content = null

      expect(component.buildPlayerUrl()).toBe('')
    })
  })
})
