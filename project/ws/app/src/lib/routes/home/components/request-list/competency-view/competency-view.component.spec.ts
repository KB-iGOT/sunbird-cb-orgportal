import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { CompetencyViewComponent } from './competency-view.component'

describe('CompetencyViewComponent', () => {
    let component: CompetencyViewComponent
    let fixture: ComponentFixture<CompetencyViewComponent>
    let mockDialogRef: jest.Mocked<MatDialogRef<CompetencyViewComponent>>
    let mockSanitizer: jest.Mocked<DomSanitizer>
    let mockDialogData: any

    beforeEach(async () => {
        // Mock MatDialogRef
        mockDialogRef = {
            close: jest.fn()
        } as any

        // Mock DomSanitizer
        mockSanitizer = {
            bypassSecurityTrustHtml: jest.fn().mockReturnValue('mocked-safe-html' as any)
        } as any

        // Mock dialog data
        mockDialogData = {
            id: 'test-id',
            selectedLevelId: 'level-1',
            children: [
                {
                    id: 'level-1',
                    description: 'First level • Second point • Third point'
                },
                {
                    id: 'level-2',
                    description: 'Another level • Different point'
                }
            ]
        }

        await TestBed.configureTestingModule({
            declarations: [CompetencyViewComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: DomSanitizer, useValue: mockSanitizer },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(CompetencyViewComponent)
        component = fixture.componentInstance
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with injected dependencies', () => {
            expect(component.dialogRef).toBe(mockDialogRef)
            expect(component.dData).toBe(mockDialogData)
        })
    })

    describe('ngOnInit', () => {
        it('should set levelSelected to the child with selectedLevelId when provided', () => {
            component.ngOnInit()

            expect(component.levelSelected).toEqual(mockDialogData.children[0])
            expect(component.levelSelected.id).toBe('level-1')
        })

        it('should set levelSelected to first child when no selectedLevelId is provided', () => {
            component.dData.selectedLevelId = null

            component.ngOnInit()

            expect(component.levelSelected).toEqual(mockDialogData.children[0])
        })

        it('should format text for all children', () => {
            component.ngOnInit()

            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(2)
            expect(component.dData.children[0].formatedText).toBe('mocked-safe-html')
            expect(component.dData.children[1].formatedText).toBe('mocked-safe-html')
        })

        it('should handle empty children array', () => {
            component.dData.children = []

            expect(() => component.ngOnInit()).not.toThrow()
            expect(component.levelSelected).toBeUndefined()
        })

        it('should handle missing dData', () => {
            component.dData = null

            expect(() => component.ngOnInit()).not.toThrow()
            expect(component.levelSelected).toBeUndefined()
        })

        it('should handle missing children property', () => {
            component.dData = { id: 'test' }

            expect(() => component.ngOnInit()).not.toThrow()
            expect(component.levelSelected).toBeUndefined()
        })

        it('should handle selectedLevelId that does not exist in children', () => {
            component.dData.selectedLevelId = 'non-existent-id'

            component.ngOnInit()

            expect(component.levelSelected).toEqual(mockDialogData.children[0])
        })
    })

    describe('add method', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should close dialog with ADD action and selected child id', () => {
            component.add()

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                id: 'test-id',
                action: 'ADD',
                childId: 'level-1'
            })
        })

        it('should close dialog with empty childId when no levelSelected', () => {
            component.levelSelected = null

            component.add()

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                id: 'test-id',
                action: 'ADD',
                childId: ''
            })
        })

        it('should close dialog with empty childId when levelSelected is empty object', () => {
            component.levelSelected = {}

            component.add()

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                id: 'test-id',
                action: 'ADD',
                childId: ''
            })
        })
    })

    describe('remove method', () => {
        it('should close dialog with DELETE action and data id', () => {
            component.remove()

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                id: 'test-id',
                action: 'DELETE'
            })
        })

        it('should use dData directly as id when dData.id is not available', () => {
            component.dData = 'direct-id'

            component.remove()

            expect(mockDialogRef.close).toHaveBeenCalledWith({
                id: 'direct-id',
                action: 'DELETE'
            })
        })
    })

    describe('formate method', () => {
        it('should format text with bullet points into HTML list', () => {
            const inputText = 'First point • Second point • Third point'
            const expectedHtml = '<ul class="pl-6"><li>First point</li><li>Second point</li><li>Third point</li></ul>'

            mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(expectedHtml as SafeHtml)

            const result = component.formate(inputText)

            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedHtml)
            expect(result).toBe(expectedHtml)
        })

        it('should handle text without bullet points', () => {
            const inputText = 'Single line text'
            const expectedHtml = '<ul class="pl-6"><li>Single line text</li></ul>'

            mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(expectedHtml as SafeHtml)

            component.formate(inputText)

            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedHtml)
        })

        it('should handle empty text', () => {
            const inputText = ''
            const expectedHtml = '<ul class="pl-6"></ul>'

            mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(expectedHtml as SafeHtml)

            component.formate(inputText)

            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedHtml)
        })

        it('should handle null text', () => {
            const inputText = null as any
            const expectedHtml = '<ul class="pl-6"></ul>'

            mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(expectedHtml as SafeHtml)

            component.formate(inputText)

            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedHtml)
        })

        it('should trim whitespace from bullet points', () => {
            const inputText = 'First point •  Second point with spaces  • Third point'
            const expectedHtml = '<ul class="pl-6"><li>First point</li><li>Second point with spaces</li><li>Third point</li></ul>'

            mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(expectedHtml as SafeHtml)

            component.formate(inputText)

            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedHtml)
        })

        it('should ignore empty bullet points', () => {
            const inputText = 'First point •  • Third point'
            const expectedHtml = '<ul class="pl-6"><li>First point</li><li>Third point</li></ul>'

            mockSanitizer.bypassSecurityTrustHtml.mockReturnValue(expectedHtml as SafeHtml)

            component.formate(inputText)

            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(expectedHtml)
        })
    })

    describe('Integration Tests', () => {
        it('should properly initialize and format data in complete flow', () => {
            const testData = {
                id: 'integration-test',
                selectedLevelId: 'level-2',
                children: [
                    {
                        id: 'level-1',
                        description: 'Level 1 • Description 1',
                        formatedText: ''
                    },
                    {
                        id: 'level-2',
                        description: 'Level 2 • Description 2 • Description 3',
                        formatedText: ''
                    }
                ]
            }

            component.dData = testData
            component.ngOnInit()

            expect(component.levelSelected.id).toBe('level-2')
            expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(2)
            expect(testData.children[0].formatedText).toBe('mocked-safe-html')
            expect(testData.children[1].formatedText).toBe('mocked-safe-html')
        })
    })
})