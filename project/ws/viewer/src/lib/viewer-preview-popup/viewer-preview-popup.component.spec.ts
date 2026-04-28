import { ViewerPreviewPopupComponent } from './viewer-preview-popup.component'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDialogData = {
    isFetchingDataComplete: true,
    testData: { question: 'What is Angular?', answer: 'A framework' },
    isErrorOccured: false,
    quizJson: { quiz: [{ id: 1, text: 'Sample quiz question' }] },
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function createComponent(data: any): ViewerPreviewPopupComponent {
    return new ViewerPreviewPopupComponent(data)
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('ViewerPreviewPopupComponent', () => {
    let component: ViewerPreviewPopupComponent

    beforeEach(() => {
        jest.clearAllMocks()
        component = createComponent(mockDialogData)
    })

    // ─── Constructor ──────────────────────────────────────────────────────

    describe('Constructor', () => {
        it('should create an instance of the component', () => {
            expect(component).toBeTruthy()
        })

        it('should store injected data on the public data property', () => {
            expect(component.data).toEqual(mockDialogData)
        })

        it('should accept null as dialog data without throwing', () => {
            const comp = createComponent(null)
            expect(comp).toBeTruthy()
            expect(comp.data).toBeNull()
        })

        it('should accept undefined as dialog data without throwing', () => {
            const comp = createComponent(undefined)
            expect(comp).toBeTruthy()
            expect(comp.data).toBeUndefined()
        })
    })

    // ─── ngOnInit – with data ──────────────────────────────────────────────

    describe('ngOnInit – when data is provided', () => {
        beforeEach(() => {
            component = createComponent(mockDialogData)
            component.ngOnInit()
        })

        it('should set isFetchingDataComplete from data', () => {
            expect(component.isFetchingDataComplete).toBe(true)
        })

        it('should set testData from data', () => {
            expect(component.testData).toEqual(mockDialogData.testData)
        })

        it('should set isErrorOccured from data', () => {
            expect(component.isErrorOccured).toBe(false)
        })

        it('should set quizJson from data', () => {
            expect(component.quizJson).toEqual(mockDialogData.quizJson)
        })
    })

    // ─── ngOnInit – with falsy/partial data ───────────────────────────────

    describe('ngOnInit – when data is null', () => {
        beforeEach(() => {
            component = createComponent(null)
            component.ngOnInit()
        })

        it('should NOT assign isFetchingDataComplete when data is null', () => {
            expect(component.isFetchingDataComplete).toBeUndefined()
        })

        it('should NOT assign testData when data is null', () => {
            expect(component.testData).toBeUndefined()
        })

        it('should NOT assign isErrorOccured when data is null', () => {
            expect(component.isErrorOccured).toBeUndefined()
        })

        it('should NOT assign quizJson when data is null', () => {
            expect(component.quizJson).toBeUndefined()
        })
    })

    describe('ngOnInit – when data is undefined', () => {
        beforeEach(() => {
            component = createComponent(undefined)
            component.ngOnInit()
        })

        it('should NOT assign any properties when data is undefined', () => {
            expect(component.isFetchingDataComplete).toBeUndefined()
            expect(component.testData).toBeUndefined()
            expect(component.isErrorOccured).toBeUndefined()
            expect(component.quizJson).toBeUndefined()
        })
    })

    describe('ngOnInit – with isFetchingDataComplete as false', () => {
        it('should correctly assign false value for isFetchingDataComplete', () => {
            component = createComponent({ ...mockDialogData, isFetchingDataComplete: false })
            component.ngOnInit()
            expect(component.isFetchingDataComplete).toBe(false)
        })
    })

    describe('ngOnInit – with isErrorOccured as true', () => {
        it('should correctly assign true value for isErrorOccured', () => {
            component = createComponent({ ...mockDialogData, isErrorOccured: true })
            component.ngOnInit()
            expect(component.isErrorOccured).toBe(true)
        })
    })

    describe('ngOnInit – with empty object as data', () => {
        beforeEach(() => {
            component = createComponent({})
            component.ngOnInit()
        })

        it('should set isFetchingDataComplete to undefined when key is absent', () => {
            expect(component.isFetchingDataComplete).toBeUndefined()
        })

        it('should set testData to undefined when key is absent', () => {
            expect(component.testData).toBeUndefined()
        })

        it('should set isErrorOccured to undefined when key is absent', () => {
            expect(component.isErrorOccured).toBeUndefined()
        })

        it('should set quizJson to undefined when key is absent', () => {
            expect(component.quizJson).toBeUndefined()
        })
    })

    describe('ngOnInit – with partial data', () => {
        it('should assign only provided fields and leave others undefined', () => {
            component = createComponent({ isFetchingDataComplete: true, quizJson: { quiz: [] } })
            component.ngOnInit()

            expect(component.isFetchingDataComplete).toBe(true)
            expect(component.quizJson).toEqual({ quiz: [] })
            expect(component.testData).toBeUndefined()
            expect(component.isErrorOccured).toBeUndefined()
        })
    })
})
