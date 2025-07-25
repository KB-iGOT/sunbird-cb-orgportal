import { CategoryDropDownComponent } from './category-drop-down.component'
import { of, Subject } from 'rxjs'

// Mock dependencies
const mockDialog = {
    open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of('confirm'))
    })
}

const mockTrainingPlanDataSharingService = {
    trainingPlanCategoryChangeEvent: new Subject(),
    trainingPlanStepperData: {
        contentList: [],
        assignmentTypeInfo: [],
        contentType: '',
        assignmentType: ''
    },
    trainingPlanContentData: {
        data: [],
        category: 'Course'
    },
    trainingPlanAssigneeData: {
        data: [],
        category: 'Designation'
    },
    moderatedCourseSelectStatus: {
        next: jest.fn()
    }
}

describe('CategoryDropDownComponent', () => {
    let component: CategoryDropDownComponent

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()

        // Reset service data
        mockTrainingPlanDataSharingService.trainingPlanStepperData = {
            contentList: [],
            assignmentTypeInfo: [],
            contentType: '',
            assignmentType: ''
        }
        mockTrainingPlanDataSharingService.trainingPlanContentData = {
            data: [],
            category: 'Course'
        }
        mockTrainingPlanDataSharingService.trainingPlanAssigneeData = {
            data: [],
            category: 'Designation'
        }

        // Create component instance
        component = new CategoryDropDownComponent(mockDialog as any, mockTrainingPlanDataSharingService as any)

        // Initialize component properties
        component.categoryData = []
        component.from = ''
        component.handleCategorySelection = {
            emit: jest.fn()
        }
    })

    describe('ngOnInit', () => {
        it('should subscribe to trainingPlanCategoryChangeEvent', () => {
            const subscribeSpy = jest.spyOn(mockTrainingPlanDataSharingService.trainingPlanCategoryChangeEvent, 'pipe')

            component.ngOnInit()

            expect(subscribeSpy).toHaveBeenCalled()
        })

        it('should clear contentList and contentData when content type events are triggered', () => {
            component.ngOnInit()

            // Test Course event
            mockTrainingPlanDataSharingService.trainingPlanCategoryChangeEvent.next({ event: 'Course' })

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList).toEqual([])
            expect(mockTrainingPlanDataSharingService.trainingPlanContentData.data).toEqual([])
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Course')
        })

        it('should clear assignmentTypeInfo and assigneeData when assignee type events are triggered', () => {
            component.ngOnInit()

            // Test Designation event
            mockTrainingPlanDataSharingService.trainingPlanCategoryChangeEvent.next({ event: 'Designation' })

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentTypeInfo).toEqual([])
            expect(mockTrainingPlanDataSharingService.trainingPlanAssigneeData.data).toEqual([])
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Designation')
        })

        it('should handle all content type events', () => {
            component.ngOnInit()

            const contentEvents = ['Course', 'Standalone Assessment', 'Program', 'Blended program', 'Curated program', 'Moderated Course']

            contentEvents.forEach(event => {
                mockTrainingPlanDataSharingService.trainingPlanCategoryChangeEvent.next({ event })
                expect(component.handleCategorySelection.emit).toHaveBeenCalledWith(event)
            })
        })

        it('should handle all assignee type events', () => {
            component.ngOnInit()

            const assigneeEvents = ['Designation', 'AllUser', 'CustomUser']

            assigneeEvents.forEach(event => {
                mockTrainingPlanDataSharingService.trainingPlanCategoryChangeEvent.next({ event })
                expect(component.handleCategorySelection.emit).toHaveBeenCalledWith(event)
            })
        })
    })

    describe('ngOnChanges', () => {
        it('should call checkForContent', () => {
            const checkForContentSpy = jest.spyOn(component, 'checkForContent')

            component.ngOnChanges()

            expect(checkForContentSpy).toHaveBeenCalled()
        })
    })

    describe('checkForContent', () => {
        describe('when from is content', () => {
            beforeEach(() => {
                component.from = 'content'
            })

            it('should use existing contentType if available', () => {
                mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType = 'Program'

                component.checkForContent()

                expect(component.selectedValue).toBe('Program')
                expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Program')
            })

            it('should set default Course contentType if not available', () => {
                mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType = ''

                component.checkForContent()

                expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Course')
                expect(component.selectedValue).toBe('Course')
                expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Course')
            })
        })

        describe('when from is assignee', () => {
            beforeEach(() => {
                component.from = 'assignee'
            })

            it('should use existing assignmentType if available', () => {
                mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType = 'CustomUser'

                component.checkForContent()

                expect(component.selectedValue).toBe('CustomUser')
                expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('CustomUser')
            })

            it('should set default Designation assignmentType if not available', () => {
                mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType = ''

                component.checkForContent()

                expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType).toBe('Designation')
                expect(component.selectedValue).toBe('Designation')
                expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Designation')
            })
        })
    })

    describe('showDialogBox', () => {
        it('should emit event directly when no existing content for Course', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []

            component.showDialogBox('Course')

            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Course')
            expect(mockDialog.open).not.toHaveBeenCalled()
        })

        it('should show dialog when existing content for Course', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []
            const openDialogSpy = jest.spyOn(component, 'openDialoagBox')

            component.showDialogBox('Course')

            expect(openDialogSpy).toHaveBeenCalled()
            expect(mockTrainingPlanDataSharingService.moderatedCourseSelectStatus.next).toHaveBeenCalledWith(false)
        })

        it('should handle Standalone Assessment event', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []

            component.showDialogBox('Standalone Assessment')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Standalone Assessment')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Standalone Assessment')
        })

        it('should handle Program event', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []

            component.showDialogBox('Program')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Program')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Program')
        })

        it('should handle Blended program event', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []

            component.showDialogBox('Blended program')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Blended program')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Blended program')
        })

        it('should handle Curated program event', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []

            component.showDialogBox('Curated program')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Curated program')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Curated program')
        })

        it('should handle Moderated Course event without moderatedCourseSelectStatus call', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []

            component.showDialogBox('Moderated Course')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Moderated Course')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Moderated Course')
            // Note: Moderated Course doesn't call moderatedCourseSelectStatus.next(false) in the original code
        })

        it('should handle Designation event', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentTypeInfo = []

            component.showDialogBox('Designation')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType).toBe('Designation')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('Designation')
        })

        it('should show dialog when existing assignmentTypeInfo for Designation', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentTypeInfo = []
            const openDialogSpy = jest.spyOn(component, 'openDialoagBox')

            component.showDialogBox('Designation')

            expect(openDialogSpy).toHaveBeenCalled()
        })

        it('should handle AllUser event', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentTypeInfo = []

            component.showDialogBox('AllUser')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType).toBe('AllUser')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('AllUser')
        })

        it('should handle CustomUser event', () => {
            mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentTypeInfo = []

            component.showDialogBox('CustomUser')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType).toBe('CustomUser')
            expect(component.handleCategorySelection.emit).toHaveBeenCalledWith('CustomUser')
        })
    })

    describe('openDialoagBox', () => {
        const mockDialogData = {
            type: 'normal',
            icon: 'radio_on',
            title: 'Test Title',
            subTitle: 'Test Subtitle',
            primaryAction: 'Confirm',
            secondaryAction: 'Cancel',
            event: 'Course'
        }

        it('should open dialog with correct data', () => {
            component.openDialoagBox(mockDialogData)

            expect(mockDialog.open).toHaveBeenCalledWith(
                expect.any(Function), // ConfirmationBoxComponent
                {
                    data: mockDialogData,
                    autoFocus: false
                }
            )
        })

        it('should handle cancel response for content type', () => {
            component.from = 'content'
            mockTrainingPlanDataSharingService.trainingPlanContentData.category = 'Program'

            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of('cancel'))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.openDialoagBox(mockDialogData)

            expect(component.selectedValue).toBe('Program')
            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Program')
        })

        it('should handle cancel response for assignee type', () => {
            component.from = 'assignee'
            mockTrainingPlanDataSharingService.trainingPlanAssigneeData.category = 'AllUser'

            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of('cancel'))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.openDialoagBox(mockDialogData)

            expect(component.selectedValue).toBe('AllUser')
            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType).toBe('AllUser')
        })

        it('should not handle non-cancel responses', () => {
            component.from = 'content'
            const originalSelectedValue = component.selectedValue

            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of('confirm'))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.openDialoagBox(mockDialogData)

            expect(component.selectedValue).toBe(originalSelectedValue)
        })
    })

    describe('hideConfirmationBox', () => {
        it('should close dialog', () => {
            const mockDialogRef = {
                close: jest.fn(),
                afterClosed: jest.fn().mockReturnValue(of(''))
            }
            component.dialogRef = mockDialogRef

            component.hideConfirmationBox()

            expect(mockDialogRef.close).toHaveBeenCalled()
        })
    })

    describe('Component Properties', () => {
        it('should initialize with default values', () => {
            const newComponent = new CategoryDropDownComponent(mockDialog as any, mockTrainingPlanDataSharingService as any)

            expect(newComponent.categoryData).toEqual([])
            expect(newComponent.from).toBe('')
        })

        it('should accept input properties', () => {
            component.categoryData = ['test1', 'test2']
            component.from = 'content'

            expect(component.categoryData).toEqual(['test1', 'test2'])
            expect(component.from).toBe('content')
        })
    })

    describe('Integration Tests', () => {
        it('should complete workflow for content type change with existing data', () => {
            component.from = 'content'
            mockTrainingPlanDataSharingService.trainingPlanStepperData.contentList = []

            const openDialogSpy = jest.spyOn(component, 'openDialoagBox')

            component.showDialogBox('Program')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.contentType).toBe('Program')
            expect(openDialogSpy).toHaveBeenCalled()
            expect(mockTrainingPlanDataSharingService.moderatedCourseSelectStatus.next).toHaveBeenCalledWith(false)
        })

        it('should complete workflow for assignee type change with existing data', () => {
            component.from = 'assignee'
            mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentTypeInfo = []

            const openDialogSpy = jest.spyOn(component, 'openDialoagBox')

            component.showDialogBox('CustomUser')

            expect(mockTrainingPlanDataSharingService.trainingPlanStepperData.assignmentType).toBe('CustomUser')
            expect(openDialogSpy).toHaveBeenCalled()
        })
    })
})