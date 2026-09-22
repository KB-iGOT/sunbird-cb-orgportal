import { GatingCoursesComponent } from './gating-courses.component'

describe('GatingCoursesComponent', () => {
    let component: GatingCoursesComponent
    let mockDialog: any
    let mockTpdsSvc: any
    let mandatoryCount: number

    /** Ticks a course and reports how many warnings the box has been asked to show */
    const tick = (identifier: string, checked: boolean) => {
        component.onMandatoryChange({ checked } as any, { identifier })
    }

    beforeEach(() => {
        mandatoryCount = 0

        mockDialog = {
            open: jest.fn(),
        }

        mockTpdsSvc = {
            trainingPlanStepperData: { status: 'draft' },
            // the count the service would report, driven by the test
            getMandatoryContentCount: () => mandatoryCount,
            getContentIdentifiers: () => [],
            setContentMandatory: jest.fn(),
            isContentMandatory: jest.fn().mockReturnValue(false),
        }

        component = new GatingCoursesComponent(mockTpdsSvc, mockDialog)
    })

    it('should not warn while the plan stays under the threshold', () => {
        mandatoryCount = 24
        tick('do_1', true)

        expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should warn on the tick that crosses the threshold', () => {
        mandatoryCount = 25
        tick('do_25', true)

        expect(mockDialog.open).toHaveBeenCalledTimes(1)
        expect(mockDialog.open).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                data: expect.objectContaining({
                    type: 'warning',
                    title: '25 Mandatory contents selected',
                    primaryAction: 'Got it',
                }),
            })
        )
    })

    it('should keep the tick that raised the count, the warning only informs', () => {
        mandatoryCount = 25
        tick('do_25', true)

        expect(mockTpdsSvc.setContentMandatory).toHaveBeenCalledWith('do_25', true)
    })

    it('should say it once and not again on every tick past the threshold', () => {
        mandatoryCount = 25
        tick('do_25', true)
        mandatoryCount = 26
        tick('do_26', true)
        mandatoryCount = 27
        tick('do_27', true)

        expect(mockDialog.open).toHaveBeenCalledTimes(1)
    })

    it('should warn again once the count has dropped back under the threshold', () => {
        mandatoryCount = 25
        tick('do_25', true)
        mandatoryCount = 24
        tick('do_25', false)
        mandatoryCount = 25
        tick('do_25', true)

        expect(mockDialog.open).toHaveBeenCalledTimes(2)
    })

    it('should ignore a tick on a course with no identifier', () => {
        mandatoryCount = 25
        component.onMandatoryChange({ checked: true } as any, {})

        expect(mockTpdsSvc.setContentMandatory).not.toHaveBeenCalled()
        expect(mockDialog.open).not.toHaveBeenCalled()
    })

    it('should mark the content as changed on a live plan', () => {
        mockTpdsSvc.trainingPlanStepperData.status = 'Live'
        tick('do_1', true)

        expect(mockTpdsSvc.isContentChanged).toBe(true)
    })
})
