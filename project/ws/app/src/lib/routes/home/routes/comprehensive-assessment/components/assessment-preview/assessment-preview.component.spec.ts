import { Router } from '@angular/router'
import * as _ from 'lodash'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { QUESTIONSET_MIME_TYPE, QUESTIONSET_PRIMARY_CATEGORY } from '../../models/comprehensive-assessment.model'
import { AssessmentPreviewComponent } from './assessment-preview.component'

describe('AssessmentPreviewComponent', () => {
  let component: AssessmentPreviewComponent
  let router: any
  let assessmentSvc: any

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
    } as unknown as Event
  }

  /** A click anywhere on the card that is not the View button. */
  const otherClick = () => ({
    target: { closest: jest.fn(() => null) },
    preventDefault: jest.fn(),
  } as unknown as Event)

  beforeEach(() => {
    router = { navigate: jest.fn() }
    assessmentSvc = {
      getLinkedAssessmentId: jest.fn((content: any) =>
        ((content && content.children) || [])
          .filter((child: any) => child.mimeType === QUESTIONSET_MIME_TYPE)
          .map((child: any) => child.identifier)[0] || ''),
    }
    component = new AssessmentPreviewComponent(
      router as Router,
      assessmentSvc as ComprehensiveAssessmentService
    )
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should start with no content to preview', () => {
    expect(component.content).toBeUndefined()
    expect(component.buildPlayerRoute()).toBeNull()
  })

  describe('the player route', () => {
    /** The player is addressed by the question set, never by the collection around it. */
    it('should point at the question set of the assessment', () => {
      component.content = hierarchy()

      expect(_.get(component.buildPlayerRoute(), 'url'))
        .toBe('/app/home/explore-content/viewer/practice/do_questionset')
    })

    it('should carry everything the player needs to resolve the assessment', () => {
      component.content = hierarchy()

      expect(_.get(component.buildPlayerRoute(), 'queryParams')).toEqual({
        collectionId: 'do_collection',
        primaryCategory: QUESTIONSET_PRIMARY_CATEGORY,
        collectionType: 'Course',
        courseName: 'Basic assessmnet',
        // these two are what make the player read the draft, not the published copy
        preview: 'true',
        editMode: 'true',
        batchId: '',
        channelId: '01392275379456409617',
      })
    })

    it('should have no route until a question set is created', () => {
      component.content = hierarchy({ children: [] })

      expect(component.buildPlayerRoute()).toBeNull()
    })

    it('should have no route before the assessment itself is saved', () => {
      component.content = hierarchy({ identifier: '' })

      expect(component.buildPlayerRoute()).toBeNull()
    })

    it('should have no route with no content at all', () => {
      component.content = null

      expect(component.buildPlayerRoute()).toBeNull()
    })
  })

  describe('openPlayer', () => {
    it('should open the player on the route it worked out', () => {
      component.content = hierarchy()

      component.openPlayer()

      expect(router.navigate).toHaveBeenCalledWith(
        ['/app/home/explore-content/viewer/practice/do_questionset'],
        { queryParams: _.get(component.buildPlayerRoute(), 'queryParams') }
      )
    })

    it('should do nothing while there is no question set to play', () => {
      component.content = hierarchy({ children: [] })

      component.openPlayer()

      expect(router.navigate).not.toHaveBeenCalled()
    })
  })

  describe('the card View button', () => {
    beforeEach(() => {
      component.content = hierarchy()
    })

    /** The toc resolved nothing, so the anchor is dead and the click is taken here. */
    it('should start the player when the toc left the View with no link', () => {
      const event = viewClick(null)

      component.onPreviewClick(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(router.navigate).toHaveBeenCalledWith(
        ['/app/home/explore-content/viewer/practice/do_questionset'],
        expect.anything()
      )
    })

    /** A link the toc did resolve is its own to follow, the router handles it. */
    it('should leave a View the toc resolved to the toc', () => {
      const event = viewClick('/viewer/practice/do_questionset')

      component.onPreviewClick(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('should ignore a click anywhere else on the card', () => {
      const event = otherClick()

      component.onPreviewClick(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('should swallow the dead click when there is no question set yet', () => {
      component.content = hierarchy({ children: [] })
      const event = viewClick(null)

      component.onPreviewClick(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(router.navigate).not.toHaveBeenCalled()
    })

    it('should be safe on a click carrying no element', () => {
      const event = { target: null, preventDefault: jest.fn() } as unknown as Event

      expect(() => component.onPreviewClick(event)).not.toThrow()
      expect(router.navigate).not.toHaveBeenCalled()
    })
  })
})
