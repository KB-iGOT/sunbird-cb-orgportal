import { TrainingPlanDataSharingService } from './training-plan-data-share.service'

describe('TrainingPlanDataSharingService content list', () => {
  let svc: TrainingPlanDataSharingService
  beforeEach(() => { svc = new TrainingPlanDataSharingService() })

  it('tracks adds and removes', () => {
    svc.addContentToPlan('A'); svc.addContentToPlan('B')
    expect(svc.isContentSelected('A')).toBe(true)
    expect(svc.isContentSelected('B')).toBe(true)
    svc.removeContentFromPlan('A')
    expect(svc.isContentSelected('A')).toBe(false)
    expect(svc.isContentSelected('B')).toBe(true)
  })

  it('is not stale when a remove and an add keep the length the same', () => {
    svc.addContentToPlan('A'); svc.addContentToPlan('B')
    expect(svc.isContentSelected('A')).toBe(true)
    svc.removeContentFromPlan('A')
    svc.addContentToPlan('C')
    expect(svc.isContentSelected('A')).toBe(false)
    expect(svc.isContentSelected('C')).toBe(true)
    expect(svc.getContentIdentifiers()).toEqual(['B', 'C'])
  })

  it('sees the list being emptied from the outside', () => {
    svc.addContentToPlan('A')
    expect(svc.isContentSelected('A')).toBe(true)
    svc.trainingPlanStepperData.contentList = []
    expect(svc.isContentSelected('A')).toBe(false)
  })

  it('sees a same length list swapped in from the outside', () => {
    svc.addContentToPlan('A')
    expect(svc.isContentSelected('A')).toBe(true)
    svc.trainingPlanStepperData.contentList = [{ identifier: 'Z', mandatory: false }]
    expect(svc.isContentSelected('A')).toBe(false)
    expect(svc.isContentSelected('Z')).toBe(true)
  })

  it('keeps the mandatory flag and the payload shape', () => {
    svc.addContentToPlan('A'); svc.addContentToPlan('B')
    svc.setContentMandatory('B', true)
    expect(svc.isContentMandatory('A')).toBe(false)
    expect(svc.isContentMandatory('B')).toBe(true)
    expect(svc.getMandatoryContentCount()).toBe(1)
    expect(svc.buildContentListPayload(svc.getContentList())).toEqual([
      { identifier: 'A', mandatory: false },
      { identifier: 'B', mandatory: true },
    ])
  })

  it('clears the mandatory flag off every content', () => {
    svc.addContentToPlan('A'); svc.addContentToPlan('B'); svc.addContentToPlan('C')
    svc.setContentMandatory('A', true)
    svc.setContentMandatory('C', true)

    svc.clearMandatoryContent()

    expect(svc.getMandatoryContentCount()).toBe(0)
    expect(svc.isContentMandatory('A')).toBe(false)
    expect(svc.isContentMandatory('C')).toBe(false)
  })

  it('keeps the content itself when the mandatory flags are cleared', () => {
    svc.addContentToPlan('A'); svc.addContentToPlan('B')
    svc.setContentMandatory('B', true)
    const contentList = svc.getContentList()

    svc.clearMandatoryContent()

    // the list is rewritten in place, the index built off it stays good
    expect(svc.getContentList()).toBe(contentList)
    expect(svc.getContentIdentifiers()).toEqual(['A', 'B'])
    expect(svc.isContentSelected('B')).toBe(true)
  })

  it('clears the flags on a plan saved as plain content ids', () => {
    svc.trainingPlanStepperData.contentList = ['A', 'B']

    svc.clearMandatoryContent()

    expect(svc.buildContentListPayload(svc.getContentList()))
      .toEqual([{ identifier: 'A', mandatory: false }, { identifier: 'B', mandatory: false }])
  })

  it('is safe on a plan with no content at all', () => {
    svc.trainingPlanStepperData.contentList = null

    expect(() => svc.clearMandatoryContent()).not.toThrow()
  })

  it('reads plans saved as plain content ids', () => {
    svc.trainingPlanStepperData.contentList = ['A', 'B']
    expect(svc.isContentSelected('B')).toBe(true)
    expect(svc.isContentMandatory('B')).toBe(false)
    expect(svc.buildContentListPayload(svc.getContentList()))
      .toEqual([{ identifier: 'A', mandatory: false }, { identifier: 'B', mandatory: false }])
  })
})
