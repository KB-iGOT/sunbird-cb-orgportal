import { StandardCardComponent } from './standard-card.component'
import { TrainingPlanDataSharingService } from '../../services/training-plan-data-share.service'
import { ChangeDetectorRef } from '@angular/core'
import { Subject } from 'rxjs'

describe('StandardCardComponent', () => {
    let component: StandardCardComponent
    let mockTpdsSvc: jest.Mocked<TrainingPlanDataSharingService>
    let mockChangeDetectorRef: jest.Mocked<ChangeDetectorRef>
    let mockPaginator: any

    beforeEach(() => {
        // Mock TrainingPlanDataSharingService
        mockTpdsSvc = {
            clearFilter: new Subject(),
            handleContentPageChange: new Subject(),
            trainingPlanStepperData: {
                status: 'draft',
                contentList: []
            },
            trainingPlanContentData: {
                data: {
                    content: []
                }
            }
        } as any

        // Mock ChangeDetectorRef
        mockChangeDetectorRef = {
            detectChanges: jest.fn()
        } as any

        // Mock MatPaginator
        mockPaginator = {
            pageIndex: 0,
            pageSize: 20
        }

        // Create component instance
        component = new StandardCardComponent(mockTpdsSvc, mockChangeDetectorRef)
        component.paginator = mockPaginator
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeTruthy()
            expect(component.checkboxVisibility).toBe(true)
            expect(component.contentData).toEqual([])
            expect(component.showDeleteFlag).toBe(false)
            expect(component.showPagination).toBe(false)
            expect(component.count).toBe(0)
            expect(component.selectedContent).toEqual([])
            expect(component.startIndex).toBe(0)
            expect(component.lastIndex).toBe(20)
            expect(component.pageSize).toBe(20)
            expect(component.defaultPosterImage).toBe('/assets/instances/eagle/app_logos/default.png')
            expect(component.defaultThumbnail).toBe('assets/instances/eagle/app_logos/KarmayogiBharat_Logo.svg')
        })

        it('should initialize with custom input values', () => {
            component.cardSize = 'large'
            component.checkboxVisibility = false
            component.contentData = [{ id: 1, name: 'test' }]
            component.showDeleteFlag = true
            component.showPagination = true
            component.count = 50

            expect(component.cardSize).toBe('large')
            expect(component.checkboxVisibility).toBe(false)
            expect(component.contentData).toEqual([{ id: 1, name: 'test' }])
            expect(component.showDeleteFlag).toBe(true)
            expect(component.showPagination).toBe(true)
            expect(component.count).toBe(50)
        })
    })

    describe('ngOnInit', () => {
        it('should subscribe to clearFilter and set showDeleteFlag to false when status is live', () => {
            mockTpdsSvc.trainingPlanStepperData.status = 'live'
            const resetPageIndexSpy = jest.spyOn(component, 'resetPageIndex')

            component.ngOnInit()

            // Trigger clearFilter subject
            mockTpdsSvc.clearFilter.next()

            expect(resetPageIndexSpy).toHaveBeenCalled()
            expect(component.showDeleteFlag).toBe(false)
        })

        it('should not change showDeleteFlag when status is not live', () => {
            mockTpdsSvc.trainingPlanStepperData.status = 'draft'
            component.showDeleteFlag = true

            component.ngOnInit()

            expect(component.showDeleteFlag).toBe(true)
        })

        it('should handle case when status is LIVE (uppercase)', () => {
            mockTpdsSvc.trainingPlanStepperData.status = 'LIVE'

            component.ngOnInit()

            expect(component.showDeleteFlag).toBe(false)
        })

        it('should handle case when status is undefined', () => {
            mockTpdsSvc.trainingPlanStepperData.status = undefined
            component.showDeleteFlag = true

            component.ngOnInit()

            expect(component.showDeleteFlag).toBe(true)
        })
    })

    describe('ngAfterViewChecked', () => {
        it('should call detectChanges on ChangeDetectorRef', () => {
            component.ngAfterViewChecked()

            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
        })
    })

    describe('onChangePage', () => {
        it('should update pagination indices and emit page change event', () => {
            const pageEvent = {
                pageIndex: 2,
                pageSize: 10,
                length: 100
            }
            const nextSpy = jest.spyOn(mockTpdsSvc.handleContentPageChange, 'next')

            component.onChangePage(pageEvent)

            expect(component.startIndex).toBe(20) // pageIndex * pageSize
            expect(component.lastIndex).toBe(10) // pageSize
            expect(nextSpy).toHaveBeenCalledWith({ pageIndex: 20, pageSize: 10 })
        })

        it('should handle first page correctly', () => {
            const pageEvent = {
                pageIndex: 0,
                pageSize: 20,
                length: 100
            }
            const nextSpy = jest.spyOn(mockTpdsSvc.handleContentPageChange, 'next')

            component.onChangePage(pageEvent)

            expect(component.startIndex).toBe(0)
            expect(component.lastIndex).toBe(20)
            expect(nextSpy).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 20 })
        })
    })

    describe('selectContentItem', () => {
        beforeEach(() => {
            mockTpdsSvc.trainingPlanContentData.data.content = [
                { identifier: 'content1', name: 'Content 1', selected: false },
                { identifier: 'content2', name: 'Content 2', selected: false }
            ]
            mockTpdsSvc.trainingPlanStepperData.contentList = []
        })

        it('should select item when checkbox is checked', () => {
            const event = { checked: true }
            const item = { identifier: 'content1', name: 'Content 1' }
            const emitSpy = jest.spyOn(component.handleSelectedChips, 'emit')

            component.selectContentItem(event, item)

            const selectedContent = mockTpdsSvc.trainingPlanContentData.data.content.find(
                (c: any) => c.identifier === 'content1'
            )
            expect(selectedContent?.selected).toBe(true)
            expect(mockTpdsSvc.trainingPlanStepperData.contentList).toContain('content1')
            expect(emitSpy).toHaveBeenCalledWith(true)
        })

        it('should move selected item to the beginning of the array', () => {
            const event = { checked: true }
            const item = { identifier: 'content2', name: 'Content 2' }

            component.selectContentItem(event, item)

            expect(mockTpdsSvc.trainingPlanContentData.data.content[0].identifier).toBe('content2')
            expect(mockTpdsSvc.trainingPlanContentData.data.content[0].selected).toBe(true)
        })

        it('should deselect item when checkbox is unchecked', () => {
            // First select the item
            mockTpdsSvc.trainingPlanStepperData.contentList = ['content1']
            mockTpdsSvc.trainingPlanContentData.data.content[0].selected = true

            const event = { checked: false }
            const item = { identifier: 'content1', name: 'Content 1' }
            const emitSpy = jest.spyOn(component.handleSelectedChips, 'emit')

            component.selectContentItem(event, item)

            const deselectedContent = mockTpdsSvc.trainingPlanContentData.data.content.find(
                (c: any) => c.identifier === 'content1'
            )
            expect(deselectedContent?.selected).toBe(false)
            expect(mockTpdsSvc.trainingPlanStepperData.contentList).not.toContain('content1')
            expect(emitSpy).toHaveBeenCalledWith(true)
        })

        it('should handle case when contentList does not exist', () => {
            delete mockTpdsSvc.trainingPlanStepperData.contentList
            const event = { checked: true }
            const item = { identifier: 'content1', name: 'Content 1' }

            expect(() => component.selectContentItem(event, item)).not.toThrow()
        })
    })

    describe('deleteItem', () => {
        beforeEach(() => {
            component.contentData = [
                { identifier: 'content1', name: 'Content 1' },
                { identifier: 'content2', name: 'Content 2' }
            ]
            mockTpdsSvc.trainingPlanContentData.data.content = [
                { identifier: 'content1', name: 'Content 1', selected: true },
                { identifier: 'content2', name: 'Content 2', selected: false }
            ]
            mockTpdsSvc.trainingPlanStepperData.contentList = ['content1']
        })

        it('should remove item from all relevant arrays and emit event', () => {
            const item = { identifier: 'content1', name: 'Content 1' }
            const emitSpy = jest.spyOn(component.selectedContentRemoved, 'emit')

            component.deleteItem(item)

            // Check if item is deselected in trainingPlanContentData
            const deselectedContent = mockTpdsSvc.trainingPlanContentData.data.content.find(
                (c: any) => c.identifier === 'content1'
            )
            expect(deselectedContent?.selected).toBe(false)

            // Check if item is removed from contentData
            expect(component.contentData).toHaveLength(1)
            expect(component.contentData.find(c => c.identifier === 'content1')).toBeUndefined()

            // Check if item is removed from contentList
            expect(mockTpdsSvc.trainingPlanStepperData.contentList).not.toContain('content1')

            expect(emitSpy).toHaveBeenCalledWith(true)
        })

        it('should handle deleting non-existent item gracefully', () => {
            const item = { identifier: 'nonexistent', name: 'Non-existent' }
            const emitSpy = jest.spyOn(component.selectedContentRemoved, 'emit')

            expect(() => component.deleteItem(item)).not.toThrow()
            expect(emitSpy).toHaveBeenCalledWith(true)
        })
    })

    describe('resetPageIndex', () => {
        it('should reset pagination values to defaults', () => {
            // Set non-default values
            component.startIndex = 40
            component.lastIndex = 10
            component.pageSize = 10

            component.resetPageIndex()

            expect(component.startIndex).toBe(0)
            expect(component.lastIndex).toBe(20)
            expect(component.pageSize).toBe(20)
        })

        it('should reset paginator properties when paginator exists', () => {
            component.paginator = {
                pageIndex: 5,
                pageSize: 10
            }

            component.resetPageIndex()

            expect(component.paginator.pageIndex).toBe(0)
            expect(component.paginator.pageSize).toBe(20)
        })

        it('should handle case when paginator is null', () => {
            component.paginator = null

            expect(() => component.resetPageIndex()).not.toThrow()
            expect(component.startIndex).toBe(0)
            expect(component.lastIndex).toBe(20)
            expect(component.pageSize).toBe(20)
        })

        it('should handle case when paginator is undefined', () => {
            component.paginator = undefined

            expect(() => component.resetPageIndex()).not.toThrow()
        })
    })

    describe('Event Emitters', () => {
        it('should have handleSelectedChips event emitter', () => {
            expect(component.handleSelectedChips).toBeDefined()
            expect(component.handleSelectedChips.emit).toBeDefined()
        })

        it('should have selectedContentRemoved event emitter', () => {
            expect(component.selectedContentRemoved).toBeDefined()
            expect(component.selectedContentRemoved.emit).toBeDefined()
        })
    })

    describe('Input Properties', () => {
        it('should accept all input properties', () => {
            const testData = [{ id: 1, name: 'test' }]

            component.cardSize = 'medium'
            component.checkboxVisibility = false
            component.contentData = testData
            component.showDeleteFlag = true
            component.showPagination = true
            component.count = 100

            expect(component.cardSize).toBe('medium')
            expect(component.checkboxVisibility).toBe(false)
            expect(component.contentData).toBe(testData)
            expect(component.showDeleteFlag).toBe(true)
            expect(component.showPagination).toBe(true)
            expect(component.count).toBe(100)
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty content data gracefully', () => {
            component.contentData = []
            mockTpdsSvc.trainingPlanContentData.data.content = []

            const event = { checked: true }
            const item = { identifier: 'test', name: 'Test' }

            expect(() => component.selectContentItem(event, item)).not.toThrow()
        })

        it('should handle missing trainingPlanStepperData properties', () => {
            mockTpdsSvc.trainingPlanStepperData = {} as any

            expect(() => component.ngOnInit()).not.toThrow()

            const event = { checked: true }
            const item = { identifier: 'test', name: 'Test' }

            expect(() => component.selectContentItem(event, item)).not.toThrow()
        })

        it('should handle null/undefined service data', () => {
            mockTpdsSvc.trainingPlanContentData = null as any

            const event = { checked: true }
            const item = { identifier: 'test', name: 'Test' }

            // This should throw since the code doesn't handle null trainingPlanContentData
            expect(() => component.selectContentItem(event, item)).toThrow()
        })
    })
})