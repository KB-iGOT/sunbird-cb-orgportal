import { AddTimelineFormComponent } from './add-timeline-form.component'
import { DatePipe } from '@angular/common'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { AparYearService } from '../../../../common/apar-year-select/apar-year.service'

describe('AddTimelineFormComponent', () => {
    let component: AddTimelineFormComponent
    let tpdsSvcMock: jest.Mocked<TrainingPlanDataSharingService>
    let datePipeMock: jest.Mocked<DatePipe>
    let aparYearSvcMock: jest.Mocked<AparYearService>

    beforeEach(() => {
        tpdsSvcMock = {
            trainingPlanStepperData: { endDate: '2025-03-01' },
        } as any

        datePipeMock = {
            transform: jest.fn(),
        } as any

        aparYearSvcMock = {
            getCurrentAparYear: jest.fn().mockReturnValue('2026-27'),
        } as any

        component = new AddTimelineFormComponent(tpdsSvcMock, datePipeMock, aparYearSvcMock)
    })

    describe('ngOnInit', () => {
        it('should set todayDate if endDate is present in trainingPlanStepperData', () => {
            component.ngOnInit()
            expect(component.todayDate).toBeInstanceOf(Date)
            expect(component.todayDate.toISOString()).toBe('2025-03-01T00:00:00.000Z')
        })

        it('should not set todayDate if endDate is not present in trainingPlanStepperData', () => {
            tpdsSvcMock.trainingPlanStepperData.endDate = undefined
            component.ngOnInit()
            expect(component.todayDate).toBeUndefined()
        })
    })

    describe('APAR year', () => {
        it('should default to the current APAR year and share it with the stepper', () => {
            component.ngOnInit()

            expect(component.aparYear).toBe('2026-27')
            expect(tpdsSvcMock.trainingPlanStepperData['aparYear']).toBe('2026-27')
        })

        it('should keep an APAR year already held by the stepper', () => {
            tpdsSvcMock.trainingPlanStepperData['aparYear'] = '2024-25'

            component.ngOnInit()

            expect(component.aparYear).toBe('2024-25')
            expect(aparYearSvcMock.getCurrentAparYear).not.toHaveBeenCalled()
        })

        it('should push a newly picked year to the stepper', () => {
            component.changeAparYear('2023-24')

            expect(component.aparYear).toBe('2023-24')
            expect(tpdsSvcMock.trainingPlanStepperData['aparYear']).toBe('2023-24')
        })
    })

    describe('changeTimeline', () => {
        it('should update trainingPlanStepperData with the correct transformed date', () => {
            const timeline = new Date('2025-03-10')
            datePipeMock.transform.mockReturnValue('2025-03-10')

            component.changeTimeline(timeline)

            expect(tpdsSvcMock.trainingPlanStepperData['endDate']).toBe('2025-03-10')
            expect(datePipeMock.transform).toHaveBeenCalledWith(timeline, 'yyyy-MM-dd')
        })

        it('should call transform method with the correct parameters', () => {
            const timeline = new Date('2025-03-15')
            component.changeTimeline(timeline)
            expect(datePipeMock.transform).toHaveBeenCalledWith(timeline, 'yyyy-MM-dd')
        })
    })
})
