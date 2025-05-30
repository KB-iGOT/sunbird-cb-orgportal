import { CompetencySummaryComponent } from './competency-summary.component'

// Mock environment
jest.mock('../../../../../../../../../src/environments/environment', () => ({
    environment: {
        compentencyVersionKey: 'v1'
    }
}))

describe('CompetencySummaryComponent', () => {
    let component: CompetencySummaryComponent
    let mockInitService: any

    beforeEach(() => {
        // Mock InitService
        mockInitService = {
            configSvc: {
                competency: {
                    v1: {
                        vKey: 'competencies',
                        vCompetencyArea: 'competencyArea',
                        vCompetencyTheme: 'competencyTheme'
                    }
                }
            }
        }

        // Create component instance
        component = new CompetencySummaryComponent(mockInitService)
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeTruthy()
            expect(component.selectedCardData).toEqual([])
            expect(component.selectedIndex).toBe(0)
            expect(component.competencySummaryObj).toHaveLength(3)
            expect(component.competencySummaryObj[0].title).toBe('behavioural')
            expect(component.competencySummaryObj[1].title).toBe('functional')
            expect(component.competencySummaryObj[2].title).toBe('domain')
        })

        it('should initialize competencySummaryObj with correct structure', () => {
            const expectedStructure = [
                {
                    title: 'behavioural',
                    behavioural: {
                        listData: [],
                        count: 0,
                    },
                },
                {
                    title: 'functional',
                    functional: {
                        listData: [],
                        count: 0,
                    },
                },
                {
                    title: 'domain',
                    domain: {
                        listData: [],
                        count: 0,
                    },
                }
            ]

            expect(component.competencySummaryObj).toEqual(expectedStructure)
        })
    })

    describe('ngOnInit', () => {
        it('should set compentencyKey from initService', () => {
            component.ngOnInit()

            expect(component.compentencyKey).toEqual({
                vKey: 'competencies',
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme'
            })
        })

        it('should handle missing competency config', () => {
            mockInitService.configSvc.competency = {}

            component.ngOnInit()

            expect(component.compentencyKey).toBeUndefined()
        })

        it('should handle missing configSvc', () => {
            mockInitService.configSvc = undefined

            expect(() => component.ngOnInit()).toThrow()
        })
    })

    describe('ngOnChanges', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vKey: 'competencies',
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencyAreaDescription: "competencyAreaDescription",
                vCompetencySubTheme: "competencySubTheme"
            }
        })

        it('should reset selectedCardData and competencySummaryObj', () => {
            component.selectedCardData = [{ id: 1 }]
            component.competencySummaryObj[0].behavioural.count = 5

            component.ngOnChanges()

            expect(component.selectedCardData).toEqual([])
            expect(component.competencySummaryObj[0].behavioural.count).toBe(0)
        })

        it('should handle null contentData', () => {
            component.contentData = null

            expect(() => component.ngOnChanges()).not.toThrow()
            expect(component.selectedCardData).toEqual([])
        })

        it('should handle undefined contentData', () => {
            component.contentData = undefined

            expect(() => component.ngOnChanges()).not.toThrow()
            expect(component.selectedCardData).toEqual([])
        })

        it('should filter selected items from contentData', () => {
            component.contentData = [
                { id: 1, selected: true },
                { id: 2, selected: false },
                { id: 3, selected: true },
                null, // Test null item
                undefined // Test undefined item
            ]

            component.ngOnChanges()

            expect(component.selectedCardData).toHaveLength(2)
            expect(component.selectedCardData).toEqual([
                { id: 1, selected: true },
                { id: 3, selected: true }
            ])
        })

        it('should handle contentData with mixed selected values', () => {
            component.contentData = [
                { id: 1, selected: true },
                { id: 2, selected: 0 }, // Falsy
                { id: 3, selected: 1 }, // Truthy
                { id: 4, selected: null }, // Falsy
                { id: 5, selected: 'true' }, // Truthy
            ]

            component.ngOnChanges()

            expect(component.selectedCardData).toHaveLength(3)
            expect(component.selectedCardData.map(item => item.id)).toEqual([1, 3, 5])
        })

        describe('Competency Processing', () => {
            beforeEach(() => {
                component.compentencyKey = {
                    vKey: 'competencies',
                    vCompetencyArea: 'competencyArea',
                    vCompetencyTheme: 'competencyTheme',
                    vCompetencyAreaDescription: "competencyAreaDescription",
                    vCompetencySubTheme: "competencySubTheme"
                }
            })

            it('should process behavioural competencies', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [{
                        competencyArea: 'Behavioural',
                        competencyTheme: 'Leadership'
                    }]
                }]

                jest.spyOn(component, 'checkIfThemeNameExists').mockReturnValue(true)

                component.ngOnChanges()

                expect(component.competencySummaryObj[0].behavioural.count).toBe(1)
                expect(component.competencySummaryObj[0].behavioural.listData).toHaveLength(1)
                expect(component.competencySummaryObj[0].behavioural.listData[0]).toEqual({
                    competencyTheme: 'Leadership',
                    count: 1
                })
                expect(component.selectedIndex).toBe(0)
            })

            it('should process functional competencies', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [{
                        competencyArea: 'Functional',
                        competencyTheme: 'Technical Skills'
                    }]
                }]

                jest.spyOn(component, 'checkIfThemeNameExists').mockReturnValue(true)

                component.ngOnChanges()

                expect(component.competencySummaryObj[1].functional.count).toBe(1)
                expect(component.competencySummaryObj[1].functional.listData).toHaveLength(1)
                expect(component.competencySummaryObj[1].functional.listData[0]).toEqual({
                    competencyTheme: 'Technical Skills',
                    count: 1
                })
                expect(component.selectedIndex).toBe(1)
            })

            it('should process domain competencies', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [{
                        competencyArea: 'Domain',
                        competencyTheme: 'Business Knowledge'
                    }]
                }]

                jest.spyOn(component, 'checkIfThemeNameExists').mockReturnValue(true)

                component.ngOnChanges()

                expect(component.competencySummaryObj[2].domain.count).toBe(1)
                expect(component.competencySummaryObj[2].domain.listData).toHaveLength(1)
                expect(component.competencySummaryObj[2].domain.listData[0]).toEqual({
                    competencyTheme: 'Business Knowledge',
                    count: 1
                })
                expect(component.selectedIndex).toBe(2)
            })

            it('should handle case insensitive competency areas', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [
                        { competencyArea: 'BEHAVIOURAL', competencyTheme: 'Leadership' },
                        { competencyArea: 'functional', competencyTheme: 'Technical' },
                        { competencyArea: 'Domain', competencyTheme: 'Business' }
                    ]
                }]

                jest.spyOn(component, 'checkIfThemeNameExists').mockReturnValue(true)

                component.ngOnChanges()

                expect(component.competencySummaryObj[0].behavioural.count).toBe(1)
                expect(component.competencySummaryObj[1].functional.count).toBe(1)
                expect(component.competencySummaryObj[2].domain.count).toBe(1)
            })

            it('should not process when checkIfThemeNameExists returns false', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [{
                        competencyArea: 'Behavioural',
                        competencyTheme: 'Leadership'
                    }]
                }]

                jest.spyOn(component, 'checkIfThemeNameExists').mockReturnValue(false)

                component.ngOnChanges()

                expect(component.competencySummaryObj[0].behavioural.count).toBe(0)
                expect(component.competencySummaryObj[0].behavioural.listData).toHaveLength(0)
            })

            it('should handle multiple competency items', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [
                        { competencyArea: 'Behavioural', competencyTheme: 'Leadership' },
                        { competencyArea: 'Behavioural', competencyTheme: 'Communication' },
                        { competencyArea: 'Functional', competencyTheme: 'Technical' }
                    ]
                }]

                jest.spyOn(component, 'checkIfThemeNameExists').mockReturnValue(true)

                component.ngOnChanges()

                expect(component.competencySummaryObj[0].behavioural.count).toBe(2)
                expect(component.competencySummaryObj[1].functional.count).toBe(1)
            })

            it('should handle items without competency key', () => {
                component.contentData = [{
                    selected: true,
                    // No competencies key
                }]

                component.ngOnChanges()

                expect(component.competencySummaryObj[0].behavioural.count).toBe(0)
                expect(component.competencySummaryObj[1].functional.count).toBe(0)
                expect(component.competencySummaryObj[2].domain.count).toBe(0)
            })

            it('should handle null competency items', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [
                        null,
                        undefined,
                        { competencyArea: 'Behavioural', competencyTheme: 'Leadership' }
                    ]
                }]

                jest.spyOn(component, 'checkIfThemeNameExists').mockReturnValue(true)

                component.ngOnChanges()

                expect(component.competencySummaryObj[0].behavioural.count).toBe(1)
            })

            it('should handle missing compentencyKey', () => {
                // component.compentencyKey = {}
                component.contentData = [{
                    selected: true,
                    competencies: [{ competencyArea: 'Behavioural', competencyTheme: 'Leadership' }]
                }]

                expect(() => component.ngOnChanges()).not.toThrow()
            })

            it('should handle missing vKey in compentencyKey', () => {
                component.compentencyKey = {
                    vCompetencyArea: 'competencyArea',
                    vCompetencyTheme: 'competencyTheme'
                } as any

                component.contentData = [{
                    selected: true,
                    competencies: [{ competencyArea: 'Behavioural', competencyTheme: 'Leadership' }]
                }]

                expect(() => component.ngOnChanges()).not.toThrow()
            })

            it('should handle unknown competency areas', () => {
                component.contentData = [{
                    selected: true,
                    competencies: [{
                        competencyArea: 'Unknown',
                        competencyTheme: 'Some Theme'
                    }]
                }]

                component.ngOnChanges()

                // Should not affect any of the three categories
                expect(component.competencySummaryObj[0].behavioural.count).toBe(0)
                expect(component.competencySummaryObj[1].functional.count).toBe(0)
                expect(component.competencySummaryObj[2].domain.count).toBe(0)
            })
        })
    })

    describe('checkIfThemeNameExists', () => {
        beforeEach(() => {
            component.compentencyKey = {
                vKey: 'competencies',
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencyAreaDescription: "competencyAreaDescription",
                vCompetencySubTheme: "competencySubTheme"
            }
        })

        it('should return true when theme does not exist in array', () => {
            const arr = [
                { competencyTheme: 'Leadership', count: 1 },
                { competencyTheme: 'Communication', count: 2 }
            ]
            const fitem = { competencyTheme: 'Technical Skills' }

            const result = component.checkIfThemeNameExists(arr, fitem)

            expect(result).toBe(true)
        })

        it('should return false and increment count when theme exists', () => {
            const arr = [
                { competencyTheme: 'Leadership', count: 1 },
                { competencyTheme: 'Communication', count: 2 }
            ]
            const fitem = { competencyTheme: 'Leadership' }

            const result = component.checkIfThemeNameExists(arr, fitem)

            expect(result).toBe(false)
            expect(arr[0].count).toBe(2)
        })

        it('should handle empty array', () => {
            const arr: any[] = []
            const fitem = { competencyTheme: 'Leadership' }

            const result = component.checkIfThemeNameExists(arr, fitem)

            expect(result).toBe(true)
        })

        it('should handle multiple matches and increment first match only', () => {
            const arr = [
                { competencyTheme: 'Leadership', count: 1 },
                { competencyTheme: 'Leadership', count: 3 }, // Duplicate
                { competencyTheme: 'Communication', count: 2 }
            ]
            const fitem = { competencyTheme: 'Leadership' }

            const result = component.checkIfThemeNameExists(arr, fitem)

            expect(result).toBe(false)
            expect(arr[0].count).toBe(2) // First match incremented
            expect(arr[1].count).toBe(4) // Second match unchanged (due to flag = false)
        })

        it('should handle null or undefined items in array', () => {
            const arr = [
                null,
                undefined,
                { competencyTheme: 'Leadership', count: 1 }
            ]
            const fitem = { competencyTheme: 'Leadership' }

            // This should handle null/undefined gracefully without throwing
            expect(() => {
                const result = component.checkIfThemeNameExists(arr, fitem)
                expect(result).toBe(false)
            }).not.toThrow()
        })

        it('should handle fitem without competencyTheme property', () => {
            const arr = [
                { competencyTheme: 'Leadership', count: 1 }
            ]
            const fitem = {} // No competencyTheme property

            const result = component.checkIfThemeNameExists(arr, fitem)

            expect(result).toBe(true)
        })

        it('should handle case sensitive matching', () => {
            const arr = [
                { competencyTheme: 'Leadership', count: 1 },
                { competencyTheme: 'leadership', count: 2 }
            ]
            const fitem = { competencyTheme: 'Leadership' }

            const result = component.checkIfThemeNameExists(arr, fitem)

            expect(result).toBe(false)
            expect(arr[0].count).toBe(2)
            expect(arr[1].count).toBe(2) // Should remain unchanged
        })
    })

    describe('Input Properties', () => {
        it('should handle contentData input changes', () => {
            const testData = [{ id: 1, selected: true }]
            component.contentData = testData

            expect(component.contentData).toBe(testData)
        })

        it('should handle selectContentCount input changes', () => {
            const testCount = 5
            component.selectContentCount = testCount

            expect(component.selectContentCount).toBe(testCount)
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle component with all null inputs', () => {
            component.contentData = null
            component.selectContentCount = null
            component.compentencyKey = null as any

            expect(() => component.ngOnChanges()).not.toThrow()
        })

        it('should handle malformed competency data', () => {
            component.compentencyKey = {
                vKey: 'competencies',
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencyAreaDescription: "competencyAreaDescription",
                vCompetencySubTheme: "competencySubTheme"
            }

            component.contentData = [{
                selected: true,
                competencies: [
                    'invalid string', // Invalid type
                    123, // Invalid type
                    { competencyArea: 'Behavioural' }, // Missing competencyTheme
                    { competencyTheme: 'Leadership' }, // Missing competencyArea
                ]
            }]

            expect(() => component.ngOnChanges()).not.toThrow()
        })

        it('should maintain state consistency after multiple ngOnChanges calls', () => {
            component.compentencyKey = {
                vKey: 'competencies',
                vCompetencyArea: 'competencyArea',
                vCompetencyTheme: 'competencyTheme',
                vCompetencyAreaDescription: "competencyAreaDescription",
                vCompetencySubTheme: "competencySubTheme"
            }

            // First call
            component.contentData = [{
                selected: true,
                competencies: [{ competencyArea: 'Behavioural', competencyTheme: 'Leadership' }]
            }]
            component.ngOnChanges()

            // const firstCallCount = component.competencySummaryObj[0].behavioural.count

            // Second call should reset and recalculate
            component.contentData = [{
                selected: true,
                competencies: [
                    { competencyArea: 'Behavioural', competencyTheme: 'Leadership' },
                    { competencyArea: 'Functional', competencyTheme: 'Technical' }
                ]
            }]
            component.ngOnChanges()

            expect(component.competencySummaryObj[0].behavioural.count).toBe(1)
            expect(component.competencySummaryObj[1].functional.count).toBe(1)
        })
    })

    describe('Integration Tests', () => {
        it('should process complete workflow from init to changes', () => {
            // Initialize
            component.ngOnInit()
            expect(component.compentencyKey).toBeDefined()

            // Set test data
            component.contentData = [
                {
                    selected: true,
                    competencies: [
                        { competencyArea: 'Behavioural', competencyTheme: 'Leadership' },
                        { competencyArea: 'Behavioural', competencyTheme: 'Leadership' }, // Duplicate
                        { competencyArea: 'Functional', competencyTheme: 'Technical' }
                    ]
                },
                {
                    selected: false, // Should be ignored
                    competencies: [
                        { competencyArea: 'Domain', competencyTheme: 'Business' }
                    ]
                }
            ]

            // Process changes
            component.ngOnChanges()

            // Verify results
            expect(component.selectedCardData).toHaveLength(1)
            expect(component.competencySummaryObj[0].behavioural.count).toBe(1)
            expect(component.competencySummaryObj[0].behavioural.listData[0].count).toBe(2) // Incremented for duplicate
            expect(component.competencySummaryObj[1].functional.count).toBe(1)
            expect(component.competencySummaryObj[2].domain.count).toBe(0) // Not selected
        })
    })
})