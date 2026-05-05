import { StepperComponent } from './stepper.component'
import { TrainingPlanContent } from '../../models/training-plan.model'

// Mock dependencies
const mockActivatedRoute = {
    snapshot: {
        data: {}
    }
}

const mockTrainingPlanDataSharingService = {
    trainingPlanStepperData: {
        status: ''
    }
}

describe('StepperComponent', () => {
    let component: StepperComponent

    beforeEach(() => {
        // Reset mocks before each test
        mockActivatedRoute.snapshot.data = {}
        mockTrainingPlanDataSharingService.trainingPlanStepperData.status = ''

        // Create component instance with mocked dependencies
        component = new StepperComponent(
            mockActivatedRoute as any,
            mockTrainingPlanDataSharingService as any
        )

        // Mock EventEmitter methods
        component.selectedTabType.emit = jest.fn()
        component.titleInvalid.emit = jest.fn()
        component.addContentIsInvalid.emit = jest.fn()
        component.addAssigneeIsInvalid.emit = jest.fn()
        component.addAccessSettingsIsInvalid.emit = jest.fn()
    })

    describe('Component Initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.tabType).toBe(TrainingPlanContent.TTabLabelKey)
            expect(component.tabIndexValue).toBe(0)
            expect(component.editState).toBe(false)
            expect(component.isContentLive).toBe(false)
        })
    })

    describe('ngOnInit', () => {
        it('should set editState to true when contentData exists in route', () => {
            ; (mockActivatedRoute.snapshot.data as any)['contentData'] = { id: 1 }

            component.ngOnInit()

            expect(component.editState).toBe(true)
        })

        it('should set editState to false when contentData does not exist in route', () => {
            mockActivatedRoute.snapshot.data = {}

            component.ngOnInit()

            expect(component.editState).toBe(false)
        })

        it('should set isContentLive to true when status is "live"', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.status = 'live'

            component.ngOnInit()

            expect(component.isContentLive).toBe(true)
        })

        it('should set isContentLive to true when status is "LIVE" (case insensitive)', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.status = 'LIVE'

            component.ngOnInit()

            expect(component.isContentLive).toBe(true)
        })

        it('should keep isContentLive false when status is not "live"', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.status = 'draft'

            component.ngOnInit()

            expect(component.isContentLive).toBe(false)
        })

        it('should handle undefined status', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData = { status: '' }

            component.ngOnInit()

            expect(component.isContentLive).toBe(false)
        })
    })

    describe('ngAfterViewInit', () => {
        it('should set all disable flags to true', () => {
            component.ngAfterViewInit()

            expect(component.addCotnentDisable).toBe(true)
            expect(component.addAssigneeDisable).toBe(true)
            expect(component.addTimelineDisable).toBe(true)
        })
    })

    describe('ngOnChanges', () => {
        it('should set tabIndexValue to 0 for CREATE_PLAN', () => {
            component.changeTabOnNext = TrainingPlanContent.TTabLabelKey.CREATE_PLAN

            component.ngOnChanges()

            expect(component.tabIndexValue).toBe(0)
        })

        it('should set tabIndexValue to 1 for ADD_CONTENT', () => {
            component.changeTabOnNext = TrainingPlanContent.TTabLabelKey.ADD_CONTENT

            component.ngOnChanges()

            expect(component.tabIndexValue).toBe(1)
        })

        it('should set tabIndexValue to 2 for ADD_ASSIGNEE', () => {
            component.changeTabOnNext = TrainingPlanContent.TTabLabelKey.ADD_ACCESS_SETTINGS

            component.ngOnChanges()

            expect(component.tabIndexValue).toBe(2)
        })

        it('should set tabIndexValue to 3 for ADD_TIMELINE', () => {
            component.changeTabOnNext = TrainingPlanContent.TTabLabelKey.ADD_TIMELINE

            component.ngOnChanges()

            expect(component.tabIndexValue).toBe(3)
        })

        it('should not change tabIndexValue when changeTabOnNext is not set', () => {
            component.tabIndexValue = 2
            component.changeTabOnNext = ''

            component.ngOnChanges()

            expect(component.tabIndexValue).toBe(2)
        })

        it('should not change tabIndexValue for unknown tab type', () => {
            component.tabIndexValue = 1
            component.changeTabOnNext = 'UNKNOWN_TAB'

            component.ngOnChanges()

            expect(component.tabIndexValue).toBe(1)
        })
    })

    describe('tabSelected', () => {
        it('should update tabIndexValue and emit selectedTabType', () => {
            const mockEvent = {
                index: 2,
                tab: {
                    textLabel: 'Add Assignee'
                }
            }

            component.tabSelected(mockEvent)

            expect(component.tabIndexValue).toBe(2)
            expect(component.selectedTabType.emit).toHaveBeenCalledWith('Add Assignee')
        })

        it('should handle event with different index and textLabel', () => {
            const mockEvent = {
                index: 0,
                tab: {
                    textLabel: 'Create Plan'
                }
            }

            component.tabSelected(mockEvent)

            expect(component.tabIndexValue).toBe(0)
            expect(component.selectedTabType.emit).toHaveBeenCalledWith('Create Plan')
        })
    })

    describe('checkForPlanTitle', () => {
        it('should update addCotnentDisable and emit titleInvalid after timeout', (done) => {
            const testValue = false

            component.checkForPlanTitle(testValue)

            setTimeout(() => {
                expect(component.addCotnentDisable).toBe(testValue)
                expect(component.titleInvalid.emit).toHaveBeenCalledWith(testValue)
                done()
            }, 1)
        })

        it('should handle true value', (done) => {
            const testValue = true

            component.checkForPlanTitle(testValue)

            setTimeout(() => {
                expect(component.addCotnentDisable).toBe(testValue)
                expect(component.titleInvalid.emit).toHaveBeenCalledWith(testValue)
                done()
            }, 1)
        })
    })

    describe('checkForaddContent', () => {
        it('should update addAssigneeDisable and emit addContentIsInvalid after timeout', (done) => {
            const testValue = false

            component.checkForaddContent(testValue)

            setTimeout(() => {
                expect(component.addAccessSettingDisable).toBe(testValue)
                expect(component.addContentIsInvalid.emit).toHaveBeenCalledWith(testValue)
                done()
            }, 1)
        })

        it('should handle true value', (done) => {
            const testValue = true

            component.checkForaddContent(testValue)

            setTimeout(() => {
                expect(component.addAccessSettingDisable).toBe(testValue)
                expect(component.addContentIsInvalid.emit).toHaveBeenCalledWith(testValue)
                done()
            }, 1)
        })
    })

    // checkForaddAssignee is commented out in source — skipped

    describe('tabChangeToTimeline', () => {
        it('should update addTimelineDisable, emit addAssigneeIsInvalid, and set tabIndexValue to 3', (done) => {
            const testValue = false
            component.tabIndexValue = 1

            component.tabChangeToTimeline(testValue)

            expect(component.tabIndexValue).toBe(3)

            setTimeout(() => {
                expect(component.addTimelineDisable).toBe(testValue)
                expect(component.addAccessSettingsIsInvalid.emit).toHaveBeenCalledWith(testValue)
                done()
            }, 1)
        })

        it('should handle true value and still set tabIndexValue to 3', (done) => {
            const testValue = true
            component.tabIndexValue = 0

            component.tabChangeToTimeline(testValue)

            expect(component.tabIndexValue).toBe(3)

            setTimeout(() => {
                expect(component.addTimelineDisable).toBe(testValue)
                expect(component.addAccessSettingsIsInvalid.emit).toHaveBeenCalledWith(testValue)
                done()
            }, 1)
        })
    })

    describe('Integration Tests', () => {
        it('should handle complete workflow from ngOnInit to tabChangeToTimeline', (done) => {
            // Setup initial state
            ; (mockActivatedRoute.snapshot.data as any)['contentData'] = { id: 1 }
            mockTrainingPlanDataSharingService.trainingPlanStepperData.status = 'live'

            // Initialize component
            component.ngOnInit()
            component.ngAfterViewInit()

            expect(component.editState).toBe(true)
            expect(component.isContentLive).toBe(true)
            expect(component.addCotnentDisable).toBe(true)

            // Test tab change
            component.changeTabOnNext = TrainingPlanContent.TTabLabelKey.ADD_CONTENT
            component.ngOnChanges()
            expect(component.tabIndexValue).toBe(1)

            // Test final timeline change
            component.tabChangeToTimeline(false)
            expect(component.tabIndexValue).toBe(3)

            setTimeout(() => {
                expect(component.addTimelineDisable).toBe(false)
                expect(component.addAccessSettingsIsInvalid.emit).toHaveBeenCalledWith(false)
                done()
            }, 1)
        })
    })

    describe('Edge Cases', () => {
        it('should handle null/undefined values gracefully', () => {
            expect(() => {
                component.checkForPlanTitle(null)
                component.checkForaddContent(undefined)
                component.tabSelected({ index: null, tab: { textLabel: null } })
            }).not.toThrow()
        })

        it('should handle missing properties in tabSelected event', () => {
            const mockEvent = { index: 1, tab: { textLabel: '' } }

            expect(() => {
                component.tabSelected(mockEvent)
            }).not.toThrow()

            expect(component.tabIndexValue).toBe(1)
        })
    })
})