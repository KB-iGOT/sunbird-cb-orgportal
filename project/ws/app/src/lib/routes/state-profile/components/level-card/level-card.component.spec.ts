import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LevelCardComponent } from './level-card.component'

describe('LevelCardComponent', () => {
    let component: LevelCardComponent
    let fixture: ComponentFixture<LevelCardComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LevelCardComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(LevelCardComponent)
        component = fixture.componentInstance
    })

    afterEach(() => {
        fixture.destroy()
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.selectedLevelId).toBeUndefined()
            expect(component.selectedCompId).toBeUndefined()
            expect(component.selectedCompList).toEqual([])
        })

        it('should call ngOnInit without errors', () => {
            spyOn(component, 'ngOnInit').and.callThrough()
            component.ngOnInit()
            expect(component.ngOnInit).toHaveBeenCalled()
        })
    })

    describe('Input Properties', () => {
        it('should accept competencyLevelData input', () => {
            const mockData = { level: 1, name: 'Beginner' }
            component.competencyLevelData = mockData
            expect(component.competencyLevelData).toEqual(mockData)
        })

        it('should accept competency input', () => {
            const mockCompetency = { id: 1, name: 'Test Competency' }
            component.competency = mockCompetency
            expect(component.competency).toEqual(mockCompetency)
        })
    })

    describe('Output Events', () => {
        it('should have selectedCompetency EventEmitter', () => {
            expect(component.selectedCompetency).toBeDefined()
            expect(component.selectedCompetency.emit).toBeDefined()
        })
    })

    describe('selectLevel method', () => {
        let mockCompetency: any
        let mockComplevel: any

        beforeEach(() => {
            mockCompetency = {
                id: 'comp123',
                type: 'skill',
                name: 'Test Competency',
                description: 'Test Description',
                status: 'active',
                source: 'manual',
                osid: 'osid123',
                additionalProperties: {
                    competencyType: 'technical'
                }
            }

            mockComplevel = {
                id: '1',
                name: 'Beginner'
            }
        })

        it('should set selectedLevelId as number when complevel.id is numeric string', () => {
            mockComplevel.id = '123'
            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedLevelId).toBe(123)
            expect(typeof component.selectedLevelId).toBe('number')
        })

        it('should set selectedLevelId as original value when complevel.id is not numeric', () => {
            mockComplevel.id = 'abc123'
            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedLevelId).toBe('abc123')
        })

        it('should set selectedLevelId as number when complevel.id is already a number', () => {
            mockComplevel.id = 456
            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedLevelId).toBe(456)
        })

        it('should set selectedCompId from competency.id', () => {
            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedCompId).toBe(mockCompetency.id)
        })

        it('should add new competency to selectedCompList when not already present', () => {
            spyOn(component.selectedCompetency, 'emit')

            component.selectLevel(mockComplevel, mockCompetency)

            expect(component.selectedCompList).toHaveLength(1)
            expect(component.selectedCompList[0]).toEqual({
                type: mockCompetency.type,
                id: mockCompetency.id,
                name: mockCompetency.name,
                description: mockCompetency.description,
                status: mockCompetency.status,
                source: mockCompetency.source,
                competencyType: mockCompetency.additionalProperties.competencyType,
                competencySelfAttestedLevel: mockComplevel.id,
                competencySelfAttestedLevelValue: mockComplevel.name,
                osid: mockCompetency.osid
            })
        })

        it('should emit selectedCompetency event when new competency is added', () => {
            spyOn(component.selectedCompetency, 'emit')

            component.selectLevel(mockComplevel, mockCompetency)

            expect(component.selectedCompetency.emit).toHaveBeenCalledWith(component.selectedCompList)
        })

        it('should not add duplicate competency to selectedCompList', () => {
            spyOn(component.selectedCompetency, 'emit')

            // Add competency first time
            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedCompList).toHaveLength(1)

            // Try to add same competency again
            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedCompList).toHaveLength(1)

            // Emit should only be called once (first time)
            expect(component.selectedCompetency.emit).toHaveBeenCalledTimes(1)
        })

        it('should handle competency with missing additionalProperties', () => {
            const competencyWithoutAdditionalProps = { ...mockCompetency }
            delete competencyWithoutAdditionalProps.additionalProperties

            spyOn(component.selectedCompetency, 'emit')

            component.selectLevel(mockComplevel, competencyWithoutAdditionalProps)

            expect(component.selectedCompList[0].competencyType).toBeUndefined()
            expect(component.selectedCompetency.emit).toHaveBeenCalled()
        })

        it('should handle competency with empty additionalProperties', () => {
            mockCompetency.additionalProperties = {}

            spyOn(component.selectedCompetency, 'emit')

            component.selectLevel(mockComplevel, mockCompetency)

            expect(component.selectedCompList[0].competencyType).toBeUndefined()
            expect(component.selectedCompetency.emit).toHaveBeenCalled()
        })

        it('should handle numeric complevel.id correctly', () => {
            mockComplevel.id = 999

            component.selectLevel(mockComplevel, mockCompetency)

            expect(component.selectedLevelId).toBe(999)
            expect(component.selectedCompList[0].competencySelfAttestedLevel).toBe(999)
        })

        it('should handle string complevel.id that converts to number', () => {
            mockComplevel.id = '777'

            component.selectLevel(mockComplevel, mockCompetency)

            expect(component.selectedLevelId).toBe(777)
            expect(component.selectedCompList[0].competencySelfAttestedLevel).toBe('777')
        })

        it('should handle edge case with zero as complevel.id', () => {
            mockComplevel.id = '0'

            component.selectLevel(mockComplevel, mockCompetency)

            expect(component.selectedLevelId).toBe(0)
            expect(component.selectedCompList[0].competencySelfAttestedLevel).toBe('0')
        })

        it('should handle multiple different competencies', () => {
            const mockCompetency2 = { ...mockCompetency, id: 'comp456', name: 'Second Competency' }
            spyOn(component.selectedCompetency, 'emit')

            component.selectLevel(mockComplevel, mockCompetency)
            component.selectLevel(mockComplevel, mockCompetency2)

            expect(component.selectedCompList).toHaveLength(2)
            expect(component.selectedCompetency.emit).toHaveBeenCalledTimes(2)
        })

        it('should preserve existing selectedCompList when adding new competency', () => {
            const existingComp = { ...mockCompetency, id: 'existing' }
            component.selectedCompList = [existingComp]

            spyOn(component.selectedCompetency, 'emit')

            component.selectLevel(mockComplevel, mockCompetency)

            expect(component.selectedCompList).toHaveLength(2)
            expect(component.selectedCompList[0]).toBe(existingComp)
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle null complevel', () => {
            const mockCompetency = { id: 'test', additionalProperties: {} }

            expect(() => {
                component.selectLevel(null, mockCompetency)
            }).not.toThrow()
        })

        it('should handle null competency', () => {
            const mockComplevel = { id: '1', name: 'Test' }

            expect(() => {
                component.selectLevel(mockComplevel, null)
            }).not.toThrow()
        })

        it('should handle complevel with null id', () => {
            const mockComplevel = { id: null, name: 'Test' }
            const mockCompetency = { id: 'test', additionalProperties: {} }

            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedLevelId).toBeNull()
        })

        it('should handle complevel with undefined id', () => {
            const mockComplevel = { id: undefined, name: 'Test' }
            const mockCompetency = { id: 'test', additionalProperties: {} }

            component.selectLevel(mockComplevel, mockCompetency)
            expect(component.selectedLevelId).toBeUndefined()
        })
    })
})