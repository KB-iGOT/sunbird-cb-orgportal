import { MatDialog } from '@angular/material/dialog'
import { of, throwError } from 'rxjs'
import { aparPlan } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { PlanPickerComponent } from '../plan-picker/plan-picker.component'
import { PublishResourceComponent } from './publish-resource.component'

/** The ten seconds the dialog waits before it reads the status back. */
const WAIT_SECONDS = 10

describe('PublishResourceComponent', () => {
  let component: PublishResourceComponent
  let dialogRef: any
  let assessmentSvc: any
  let dialog: any
  /** What the plan picker hands back when the admin picks one from the publish dialog. */
  let pickedPlan: aparPlan.ILinkedPlan | null

  const userProfile = { userId: 'user-1', rootOrgId: 'org-1' }
  const questionSet = { identifier: 'qs-1', name: 'APAR assessment question set', status: 'Draft' }
  /** The plan the assessment holds, as the service reads it off the linkage. */
  const linkedPlan = { id: 'plan-1', name: 'APAR 2026-27 — Section Officer' }

  const collection = () => ({
    identifier: 'do_123',
    name: 'APAR comprehensive assessment',
    versionKey: 'v1',
    children: [{ ...questionSet, mimeType: 'application/vnd.sunbird.questionset' }],
  })

  /** The plan a run of the picker comes back with, `pickedPlan` being what it hands over. */
  const newPlan = (): aparPlan.ILinkedPlan => ({
    id: 'plan-2',
    name: 'APAR 2026-27 — Deputy Secretary',
    planYear: '2026-27',
    endDate: '2027-03-31T00:00:00.000Z',
    orgName: 'DoPT',
    gatingCourseCount: 1,
    contentList: [{ identifier: 'do-1', mandatory: true }],
  })

  const build = (data: any = { collection: collection(), userProfile }) =>
    new PublishResourceComponent(
      dialogRef, data, assessmentSvc as ComprehensiveAssessmentService, dialog as MatDialog
    )

  /** Publishes, then moves the clock on so the status read behind the wait runs. */
  const publishAndWait = (seconds: number = WAIT_SECONDS) => {
    jest.useFakeTimers()
    component.publishResource()
    jest.advanceTimersByTime(seconds * 1000)
    jest.useRealTimers()
  }

  beforeEach(() => {
    dialogRef = { close: jest.fn() }
    pickedPlan = newPlan()
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(pickedPlan) })) }
    assessmentSvc = {
      getLinkedResources: jest.fn().mockReturnValue([{ ...questionSet }]),
      publishQuestionSet: jest.fn().mockReturnValue(of({})),
      getQuestionSetStatus: jest.fn().mockReturnValue(of('Live')),
      publishAssessment: jest.fn().mockReturnValue(of({})),
      readPlanMetadata: jest.fn().mockReturnValue(linkedPlan),
      isPlanAvailable: jest.fn().mockReturnValue(of(true)),
      linkPlanToAssessment: jest.fn().mockReturnValue(of({})),
      updateLinkedPlan: jest.fn().mockReturnValue(of({ result: { versionKey: 'v2' } })),
    }
    component = build()
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  describe('what the dialog opens on', () => {
    /** The admin is told what is about to be published, by name. */
    it('should list the resources the assessment holds', () => {
      expect(assessmentSvc.getLinkedResources).toHaveBeenCalled()
      expect(component.resources).toEqual([questionSet])
    })

    it('should offer the resource publish first', () => {
      expect(component.stage).toBe('resource')
      expect(component.isRecheck).toBe(false)
      expect(component.isPublishResourceDisabled).toBe(false)
      expect(component.canPublishAssessment).toBe(false)
    })

    it('should offer no publish at all with nothing listed to publish', () => {
      assessmentSvc.getLinkedResources.mockReturnValue([])

      component = build()

      expect(component.isPublishResourceDisabled).toBe(true)
    })

    /** Reopened on an assessment whose question set is already Live, nothing to republish. */
    it('should go straight to the assessment publish when the resource is already Live', () => {
      assessmentSvc.getLinkedResources.mockReturnValue([{ ...questionSet, status: 'Live' }])

      component = build()

      expect(component.stage).toBe('live')
      expect(component.canPublishAssessment).toBe(true)
    })

    it('should offer no publish at all when the assessment holds no resource', () => {
      assessmentSvc.getLinkedResources.mockReturnValue([])

      component = build()
      component.publishResource()

      expect(component.stage).toBe('resource')
      expect(assessmentSvc.publishQuestionSet).not.toHaveBeenCalled()
    })
  })

  describe('publishing the resource', () => {
    it('should publish every resource it listed', () => {
      publishAndWait()

      expect(assessmentSvc.publishQuestionSet).toHaveBeenCalledWith('qs-1', 'org-1')
    })

    /** The `ca` routes answer against the org the publish is made for, not the session. */
    it('should name the org of the user publishing on the calls it makes', () => {
      publishAndWait()
      component.publishAssessment()

      expect(assessmentSvc.publishQuestionSet).toHaveBeenCalledWith('qs-1', 'org-1')
      expect(assessmentSvc.getQuestionSetStatus).toHaveBeenCalledWith('qs-1', 'org-1')
      expect(assessmentSvc.publishAssessment).toHaveBeenCalledWith('do_123', 'user-1', 'org-1')
    })

    /** The platform is still working when the call answers, so nothing is read until then. */
    it('should leave the status alone until the ten seconds are up', () => {
      publishAndWait(WAIT_SECONDS - 1)

      expect(assessmentSvc.getQuestionSetStatus).not.toHaveBeenCalled()
      expect(component.stage).toBe('waiting')
      expect(component.isBusy).toBe(true)
    })

    /** The wait is counted down in the dialog, so it reads as the platform working. */
    it('should count the seconds down while the platform publishes', () => {
      jest.useFakeTimers()
      component.publishResource()
      expect(component.countdown).toBe(WAIT_SECONDS)

      jest.advanceTimersByTime(4000)
      expect(component.countdown).toBe(WAIT_SECONDS - 4)

      jest.advanceTimersByTime((WAIT_SECONDS - 4) * 1000)
      expect(component.countdown).toBe(0)
      jest.useRealTimers()
    })

    it('should read the status back once the wait is over', () => {
      publishAndWait()

      expect(assessmentSvc.getQuestionSetStatus).toHaveBeenCalledWith('qs-1', 'org-1')
      expect(component.isBusy).toBe(false)
    })

    it('should open the assessment publish once every resource answers Live', () => {
      publishAndWait()

      expect(component.stage).toBe('live')
      expect(component.canPublishAssessment).toBe(true)
      expect(component.resources[0].status).toBe('Live')
      expect(component.message)
        .toBe('The resource is live and the plan is free, the assessment can now be published')
    })

    /**
     * The platform took the publish and is still working on it, so the way on is to look
     * again - sending a second publish would not make the first one finish any sooner.
     */
    it('should offer the recheck rather than a republish while the resource is not Live', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Processing'))

      publishAndWait()

      expect(component.stage).toBe('recheck')
      expect(component.isRecheck).toBe(true)
      // the publish is closed off: the platform has it, Refresh is the way on
      expect(component.isPublishResourceDisabled).toBe(true)
      expect(component.canPublishAssessment).toBe(false)
      expect(component.message)
        .toBe('The resource is not live yet, publishing can take a little longer - check again')
    })

    it('should read the status again on the recheck without publishing again', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Processing'))
      publishAndWait()
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Live'))

      component.recheckStatus()

      expect(assessmentSvc.publishQuestionSet).toHaveBeenCalledTimes(1)
      expect(assessmentSvc.getQuestionSetStatus).toHaveBeenCalledTimes(2)
      expect(component.stage).toBe('live')
    })

    /** The recheck is the admin's to time, so it reads straight away. */
    it('should read the status on the recheck without waiting the seconds out again', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Processing'))
      publishAndWait()
      assessmentSvc.getQuestionSetStatus.mockClear()

      component.recheckStatus()

      expect(assessmentSvc.getQuestionSetStatus).toHaveBeenCalledTimes(1)
      expect(component.countdown).toBe(0)
    })

    it('should keep the resource it could not read at the status it had', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of(''))

      publishAndWait()

      expect(component.resources[0].status).toBe('Draft')
      expect(component.stage).toBe('recheck')
    })

    it('should wait on every resource of an assessment holding more than one', () => {
      assessmentSvc.getLinkedResources.mockReturnValue([
        { identifier: 'qs-1', name: 'Section A', status: 'Draft' },
        { identifier: 'qs-2', name: 'Section B', status: 'Draft' },
      ])
      assessmentSvc.getQuestionSetStatus.mockImplementation((id: string) =>
        of(id === 'qs-1' ? 'Live' : 'Processing'))
      component = build()

      publishAndWait()

      expect(assessmentSvc.publishQuestionSet).toHaveBeenCalledTimes(2)
      expect(component.stage).toBe('recheck')
    })
  })

  /**
   * A publish the platform refused is the admin's to see straight away: there is nothing
   * being worked on to wait for, and nothing to read back.
   */
  describe('when the resource publish fails', () => {
    const notFound = {
      error: {
        params: { err: 'NOT_FOUND', errmsg: `Error! Node(s) doesn't Exists. | [Invalid Node Id.]: qs-1` },
        responseCode: 'RESOURCE_NOT_FOUND',
      },
    }

    beforeEach(() => {
      assessmentSvc.publishQuestionSet.mockReturnValue(throwError(() => notFound))
    })

    it('should report what the platform objected to, as it said it', () => {
      component.publishResource()

      expect(component.isError).toBe(true)
      expect(component.message).toBe(`Error! Node(s) doesn't Exists. | [Invalid Node Id.]: qs-1`)
    })

    it('should report it without waiting the seconds out', () => {
      jest.useFakeTimers()
      component.publishResource()

      expect(component.isBusy).toBe(false)
      expect(component.countdown).toBe(0)
      jest.advanceTimersByTime(WAIT_SECONDS * 1000)

      expect(assessmentSvc.getQuestionSetStatus).not.toHaveBeenCalled()
      jest.useRealTimers()
    })

    /** Nothing was published, so the publish is what is offered again - not a recheck. */
    it('should offer the publish again rather than a recheck', () => {
      component.publishResource()

      expect(component.stage).toBe('resource')
      expect(component.isRecheck).toBe(false)
      expect(component.isPublishResourceDisabled).toBe(false)
      expect(component.canPublishAssessment).toBe(false)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.publishQuestionSet.mockReturnValue(throwError(() => ({})))

      component.publishResource()

      expect(component.message).toBe('Unable to publish the resource, please try again')
    })

    /**
     * Refresh after a failed publish must not close the publish off: nothing was published,
     * so there is no platform work to wait on and the publish is still the way forward.
     */
    it('should keep the publish open when a refresh follows a failed publish', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Draft'))
      component.publishResource()

      component.recheckStatus()

      expect(component.stage).toBe('resource')
      expect(component.isRecheck).toBe(false)
      expect(component.isPublishResourceDisabled).toBe(false)
      expect(component.message).toBe('The resource is not live yet, publish it to take it live')
    })

    it('should publish again after the refresh that followed the failure', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Draft'))
      component.publishResource()
      component.recheckStatus()
      assessmentSvc.publishQuestionSet.mockReturnValue(of({}))

      publishAndWait()

      expect(assessmentSvc.publishQuestionSet).toHaveBeenCalledTimes(2)
      expect(component.stage).toBe('recheck')
    })
  })

  /** Refresh is offered from the moment the dialog opens, before anything is published. */
  describe('refreshing before anything is published', () => {
    it('should leave the publish open when the resource is not Live', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Draft'))

      component.recheckStatus()

      expect(assessmentSvc.publishQuestionSet).not.toHaveBeenCalled()
      expect(component.stage).toBe('resource')
      expect(component.isPublishResourceDisabled).toBe(false)
    })

    /** Someone else published it in the meantime, so there is nothing left to publish. */
    it('should open the assessment publish when the resource is already Live', () => {
      component.recheckStatus()

      expect(component.stage).toBe('live')
      expect(component.canPublishAssessment).toBe(true)
    })
  })

  describe('publishing the assessment', () => {
    beforeEach(() => {
      publishAndWait()
    })

    it('should publish the assessment naming who published it', () => {
      component.publishAssessment()

      expect(assessmentSvc.publishAssessment).toHaveBeenCalledWith('do_123', 'user-1', 'org-1')
    })

    it('should close reporting the assessment published', () => {
      component.publishAssessment()

      expect(dialogRef.close).toHaveBeenCalledWith(true)
    })

    /** The resources are Live whatever happened here, so the offer stands rather than resets. */
    it('should stay open and say why the publish failed', () => {
      assessmentSvc.publishAssessment.mockReturnValue(
        throwError(() => ({ error: { message: 'the linked plan window has ended' } }))
      )

      component.publishAssessment()

      expect(dialogRef.close).not.toHaveBeenCalled()
      expect(component.stage).toBe('live')
      expect(component.isError).toBe(true)
      expect(component.message).toBe('the linked plan window has ended')
    })

    it('should report what the content api objected to, as it said it', () => {
      assessmentSvc.publishAssessment.mockReturnValue(
        throwError(() => ({ error: { params: { errmsg: 'Error! Node(s) doesn\'t Exists.' } } }))
      )

      component.publishAssessment()

      expect(component.message).toBe(`Error! Node(s) doesn't Exists.`)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.publishAssessment.mockReturnValue(throwError(() => ({})))

      component.publishAssessment()

      expect(component.message).toBe('Unable to publish the assessment, please try again')
    })

    it('should not publish the assessment before the resource is Live', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Processing'))
      component = build()
      publishAndWait()

      component.publishAssessment()

      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })
  })

  /**
   * A plan is linked in the builder and published from here, and the two can be days apart.
   * The publish is the last point at which the plan can still be found to be gone.
   */
  describe('the linked plan', () => {
    it('should name the plan the assessment holds from the moment it opens', () => {
      expect(component.planName).toBe('APAR 2026-27 — Section Officer')
      expect(component.isPlanFree).toBeNull()
      expect(component.planStatusText).toBe('Not checked yet')
    })

    it('should check the plan once every resource is Live', () => {
      publishAndWait()

      expect(assessmentSvc.isPlanAvailable).toHaveBeenCalledWith('plan-1', 'do_123')
      expect(component.isPlanFree).toBe(true)
      expect(component.planStatusText).toBe('Available')
      expect(component.stage).toBe('live')
    })

    /** Nothing is checked while there is still a resource to publish. */
    it('should leave the plan alone while a resource is not Live yet', () => {
      assessmentSvc.getQuestionSetStatus.mockReturnValue(of('Processing'))

      publishAndWait()

      expect(assessmentSvc.isPlanAvailable).not.toHaveBeenCalled()
    })

    it('should check the plan of an assessment that opens with its resource already Live', () => {
      assessmentSvc.getLinkedResources.mockReturnValue([{ ...questionSet, status: 'Live' }])
      component = build()

      component.ngOnInit()

      expect(assessmentSvc.isPlanAvailable).toHaveBeenCalledWith('plan-1', 'do_123')
      expect(component.stage).toBe('live')
    })

    /** The plan names the assessment holding it, and by then it can be a different one. */
    it('should refuse the publish when another assessment holds the plan', () => {
      assessmentSvc.isPlanAvailable.mockReturnValue(of(false))

      publishAndWait()

      expect(component.stage).toBe('planTaken')
      expect(component.isPlanTaken).toBe(true)
      expect(component.isPlanFree).toBe(false)
      expect(component.planStatusText).toBe('Not available')
      expect(component.canPublishAssessment).toBe(false)
      expect(component.isError).toBe(true)
    })

    /** The resource publish is done, so the offer stays the assessment publish - disabled. */
    it('should keep offering the assessment publish rather than the resource one', () => {
      assessmentSvc.isPlanAvailable.mockReturnValue(of(false))

      publishAndWait()

      expect(component.resourcesLive).toBe(true)
    })

    it('should not publish an assessment whose plan is taken', () => {
      assessmentSvc.isPlanAvailable.mockReturnValue(of(false))
      publishAndWait()

      component.publishAssessment()

      expect(assessmentSvc.publishAssessment).not.toHaveBeenCalled()
    })

    it('should check the plan again on a refresh', () => {
      assessmentSvc.isPlanAvailable.mockReturnValue(of(false))
      publishAndWait()
      assessmentSvc.isPlanAvailable.mockReturnValue(of(true))

      component.recheckStatus()

      expect(component.stage).toBe('live')
      expect(component.canPublishAssessment).toBe(true)
    })

    /** The publish itself answers for the plan, so a lookup that fails does not block it. */
    it('should leave the publish open when the plan cannot be checked at all', () => {
      assessmentSvc.isPlanAvailable.mockReturnValue(throwError(() => ({})))

      publishAndWait()

      expect(component.stage).toBe('live')
      expect(component.isPlanFree).toBeNull()
      expect(component.isError).toBe(false)
    })
  })

  /**
   * A plan that has gone while the assessment sat in draft is changed from here: sending the
   * admin back through the builder to pick another one would lose the publish they are in.
   */
  describe('changing the plan from the publish dialog', () => {
    /** Everything below starts from the plan having been found gone. */
    beforeEach(() => {
      assessmentSvc.isPlanAvailable.mockReturnValue(of(false))
      publishAndWait()
      assessmentSvc.isPlanAvailable.mockReturnValue(of(true))
    })

    it('should offer the change only once the plan is known to be gone', () => {
      expect(component.canChangePlan).toBe(true)

      assessmentSvc.isPlanAvailable.mockReturnValue(of(true))
      component.recheckStatus()

      expect(component.canChangePlan).toBe(false)
    })

    it('should open the picker on the plan the assessment holds', () => {
      component.changePlan()

      expect(dialog.open).toHaveBeenCalledWith(PlanPickerComponent, expect.objectContaining({
        data: { userProfile, selectedPlanId: 'plan-1' },
      }))
    })

    it('should write the picked plan onto the assessment', () => {
      component.changePlan()

      expect(assessmentSvc.updateLinkedPlan).toHaveBeenCalledWith('do_123', 'v1', pickedPlan)
      expect(component.planName).toBe('APAR 2026-27 — Deputy Secretary')
    })

    /** Checked rather than taken on trust, so one guard answers for every plan. */
    it('should check the picked plan and open the publish', () => {
      component.changePlan()

      expect(assessmentSvc.isPlanAvailable).toHaveBeenLastCalledWith('plan-2', 'do_123')
      expect(component.stage).toBe('live')
      expect(component.canPublishAssessment).toBe(true)
      expect(component.isPlanFree).toBe(true)
    })

    it('should publish against the plan that was picked, not the one that was taken', () => {
      component.changePlan()

      component.publishAssessment()

      expect(assessmentSvc.linkPlanToAssessment).toHaveBeenCalledWith('plan-2', 'do_123')
    })

    /** A content update answers with a new version key, and a stale one fails the next. */
    it('should carry the new version key into a second change', () => {
      component.changePlan()
      assessmentSvc.isPlanAvailable.mockReturnValue(of(false))
      component.recheckStatus()

      component.changePlan()

      expect(assessmentSvc.updateLinkedPlan).toHaveBeenLastCalledWith('do_123', 'v2', pickedPlan)
    })

    it('should leave everything as it was when the picker is closed with nothing', () => {
      pickedPlan = null

      component.changePlan()

      expect(assessmentSvc.updateLinkedPlan).not.toHaveBeenCalled()
      expect(component.stage).toBe('planTaken')
    })

    it('should stay on the taken plan and say why the change did not save', () => {
      assessmentSvc.updateLinkedPlan.mockReturnValue(
        throwError(() => ({ error: { params: { errmsg: 'versionKey mismatch' } } }))
      )

      component.changePlan()

      expect(component.stage).toBe('planTaken')
      expect(component.isError).toBe(true)
      expect(component.message).toBe('versionKey mismatch')
      expect(component.canPublishAssessment).toBe(false)
    })

    it('should not open the picker for a plan that is still free', () => {
      component.recheckStatus()

      component.changePlan()

      expect(dialog.open).not.toHaveBeenCalled()
    })
  })

  /** The plan is told which assessment holds it, so no other assessment is offered it. */
  describe('linking the plan to the published assessment', () => {
    beforeEach(() => {
      publishAndWait()
    })

    it('should link the plan once the assessment is published', () => {
      component.publishAssessment()

      expect(assessmentSvc.linkPlanToAssessment).toHaveBeenCalledWith('plan-1', 'do_123')
      expect(dialogRef.close).toHaveBeenCalledWith(true)
    })

    it('should link only after the publish, never before it', () => {
      assessmentSvc.publishAssessment.mockReturnValue(throwError(() => ({})))

      component.publishAssessment()

      expect(assessmentSvc.linkPlanToAssessment).not.toHaveBeenCalled()
    })

    /**
     * The assessment is Live by here, so publishing again would be wrong - the linkage is
     * the only thing left, and it is what the retry sends.
     */
    it('should offer the linking again when only that failed', () => {
      assessmentSvc.linkPlanToAssessment.mockReturnValue(throwError(() => ({})))

      component.publishAssessment()

      expect(component.stage).toBe('linkFailed')
      expect(component.isLinkFailed).toBe(true)
      expect(component.isError).toBe(true)
      expect(component.message).toBe('The assessment is published, but the APAR plan was not linked to it')
      expect(dialogRef.close).not.toHaveBeenCalled()
    })

    it('should send the linkage alone on the retry', () => {
      assessmentSvc.linkPlanToAssessment.mockReturnValue(throwError(() => ({})))
      component.publishAssessment()
      assessmentSvc.linkPlanToAssessment.mockReturnValue(of({}))

      component.linkPlan()

      expect(assessmentSvc.publishAssessment).toHaveBeenCalledTimes(1)
      expect(dialogRef.close).toHaveBeenCalledWith(true)
    })

    /** Backing out of a failed linkage still leaves an assessment that was published. */
    it('should report the publish when the dialog is closed after a failed linkage', () => {
      assessmentSvc.linkPlanToAssessment.mockReturnValue(throwError(() => ({})))
      component.publishAssessment()

      component.close()

      expect(dialogRef.close).toHaveBeenCalledWith(true)
    })

    it('should close on the publish alone when the assessment holds no plan', () => {
      assessmentSvc.readPlanMetadata.mockReturnValue(null)
      component = build()
      publishAndWait()

      component.publishAssessment()

      expect(assessmentSvc.linkPlanToAssessment).not.toHaveBeenCalled()
      expect(dialogRef.close).toHaveBeenCalledWith(true)
    })
  })

  describe('closing the dialog', () => {
    it('should report that nothing was published', () => {
      component.close()

      expect(dialogRef.close).toHaveBeenCalledWith(false)
    })
  })
})
