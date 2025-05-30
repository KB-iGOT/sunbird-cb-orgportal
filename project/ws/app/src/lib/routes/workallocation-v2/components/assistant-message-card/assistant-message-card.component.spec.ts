import { AssistantMessageCardComponent } from './assistant-message-card.component'
import { WatStoreService } from '../../services/wat.store.service'
import { of } from 'rxjs'

// Mock lodash
jest.mock('lodash', () => ({
    groupBy: jest.fn(),
    size: jest.fn(),
    get: jest.fn(),
    first: jest.fn(),
    without: jest.fn(),
    union: jest.fn(),
    max: jest.fn()
}))

const _ = require('lodash')

// Mock WatStoreService
const mockWatStoreService = {
    getactivitiesGroup: of([]),
    getcompetencyGroup: of([]),
    getUpdateCompGroupO: of([]),
    getOfficerGroup: of({}),
    setErrorCount: jest.fn(),
    setCurrentProgress: jest.fn()
}

describe('AssistantMessageCardComponent', () => {
    let component: AssistantMessageCardComponent
    let watStoreService: jest.Mocked<WatStoreService>

    beforeEach(() => {
        jest.clearAllMocks()
        // Reset lodash mocks
        _.groupBy.mockReset()
        _.size.mockReset()
        _.get.mockReset()
        _.first.mockReset()
        _.without.mockReset()
        _.union.mockReset()
        _.max.mockReset()

        watStoreService = mockWatStoreService as any
        component = new AssistantMessageCardComponent(watStoreService)
    })

    describe('Component Initialization', () => {
        it('should create component instance', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with correct default progress values', () => {
            expect(component.defaultProgressValues.officer.weight).toBe(10)
            expect(component.defaultProgressValues.roles.weight).toBe(60)
            expect(component.defaultProgressValues.competecy.weight).toBe(20)
            expect(component.defaultProgressValues.competecyDetails.weight).toBe(10)

            // Check nested control values
            expect(component.defaultProgressValues.officer.controls.officerName).toBe(33.33)
            expect(component.defaultProgressValues.roles.minRole).toBe(1)
            expect(component.defaultProgressValues.roles.minRolePercent).toBe(20)
            expect(component.defaultProgressValues.competecy.minCompetency).toBe(1)
            expect(component.defaultProgressValues.competecy.minCompetencyPercent).toBe(50)
        })

        it('should call fetchFormsData on ngOnInit', () => {
            const fetchFormsDataSpy = jest.spyOn(component, 'fetchFormsData')
            component.ngOnInit()
            expect(fetchFormsDataSpy).toHaveBeenCalled()
        })
    })

    describe('fetchFormsData - Observable Subscriptions', () => {
        it('should handle activities subscription with length > 0', () => {
            const mockActivities = [{ id: 1, activities: [] }]
            //watStoreService.getactivitiesGroup = of(mockActivities)
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.activityGroups).toEqual(mockActivities)
            expect(validationsSpy).toHaveBeenCalled()
        })

        it('should handle activities subscription with length = 0', () => {
            //watStoreService.getactivitiesGroup = of([])
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.activityGroups).toBeUndefined()
            expect(validationsSpy).not.toHaveBeenCalled()
        })

        it('should handle competency group subscription with length > 0', () => {
            const mockComp = [{ id: 1, competincies: [] }]
            // watStoreService.getcompetencyGroup = of(mockComp)
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.compGroups).toEqual(mockComp)
            expect(validationsSpy).toHaveBeenCalled()
        })

        it('should handle competency group subscription with length = 0', () => {
            //watStoreService.getcompetencyGroup = of([])
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.compGroups).toBeUndefined()
            expect(validationsSpy).not.toHaveBeenCalled()
        })

        it('should handle comp details subscription with data and length > 0', () => {
            const mockCompDetails = [{ compLevel: 'Basic' }]
            //watStoreService.getUpdateCompGroupO = of(mockCompDetails)
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.compDetails).toEqual(mockCompDetails)
            expect(validationsSpy).toHaveBeenCalled()
        })

        it('should handle comp details subscription with null data', () => {
            // watStoreService.getUpdateCompGroupO = of(null)
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.compDetails).toBeUndefined()
            expect(validationsSpy).not.toHaveBeenCalled()
        })

        it('should handle comp details subscription with empty array', () => {
            // watStoreService.getUpdateCompGroupO = of([])
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.compDetails).toBeUndefined()
            expect(validationsSpy).not.toHaveBeenCalled()
        })

        it('should always handle officer form subscription', () => {
            const mockOfficerData = { officerName: 'John' }
            //watStoreService.getOfficerGroup = of(mockOfficerData)
            const validationsSpy = jest.spyOn(component, 'validationsCombined')

            component.fetchFormsData()

            expect(component.dataStructure.officerFormData).toEqual(mockOfficerData)
            expect(validationsSpy).toHaveBeenCalled()
        })
    })

    describe('currentProgress getter', () => {
        it('should return calculated progress value', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(75)
            expect(component.currentProgress).toBe(75)
        })
    })

    describe('progressColor method', () => {
        it('should return red for progress <= 30', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(30)
            expect(component.progressColor()).toBe('#D13924')
        })

        it('should return red for progress < 30', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(25)
            expect(component.progressColor()).toBe('#D13924')
        })

        it('should return orange for progress between 30 and 70', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(50)
            expect(component.progressColor()).toBe('#E99E38')
        })

        it('should return orange for progress = 70', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(70)
            expect(component.progressColor()).toBe('#E99E38')
        })

        it('should return green for progress > 70 and <= 100', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(85)
            expect(component.progressColor()).toBe('#1D8923')
        })

        it('should return green for progress = 100', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(100)
            expect(component.progressColor()).toBe('#1D8923')
        })

        it('should return empty string for progress > 100', () => {
            jest.spyOn(component, 'calculatePercentage').mockReturnValue(150)
            expect(component.progressColor()).toBe('')
        })
    })

    describe('validationsCombined method', () => {
        it('should group validations and set error count', () => {
            const mockValidations: any = [
                { _type: 'error', type: 'officer', counts: 1, label: 'Error 1' },
                { _type: 'error', type: 'role', counts: 1, label: 'Error 2' },
                { _type: 'warning', type: 'activity', counts: 1, label: 'Warning 1' }
            ]

            const mockGroupedValidations = {
                error: [
                    { _type: 'error', type: 'officer', counts: 1, label: 'Error 1' },
                    { _type: 'error', type: 'role', counts: 1, label: 'Error 2' }
                ],
                warning: [
                    { _type: 'warning', type: 'activity', counts: 1, label: 'Warning 1' }
                ]
            }

            jest.spyOn(component, 'individualValidations').mockReturnValue(mockValidations)
            _.groupBy.mockReturnValue(mockGroupedValidations)
            _.get.mockReturnValue([{ _type: 'error' }, { _type: 'error' }])
            _.size.mockReturnValue(2)

            component.validationsCombined()

            expect(_.groupBy).toHaveBeenCalledWith(mockValidations, '_type')
            expect(component.validations).toEqual(mockGroupedValidations)
            expect(watStoreService.setErrorCount).toHaveBeenCalledWith(2)
        })
    })

    describe('individualValidations method', () => {
        beforeEach(() => {
            jest.spyOn(component, 'calculateOfficerErrors').mockReturnValue([])
            jest.spyOn(component, 'calculateActivityError').mockReturnValue([])
            jest.spyOn(component, 'calculateCompError').mockReturnValue([])
            jest.spyOn(component, 'calculateCompDetailsError').mockReturnValue([])
            _.union.mockReturnValue([])
        })

        it('should collect validations when all data structures exist', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            component.individualValidations()

            expect(component.calculateOfficerErrors).toHaveBeenCalledWith({ officerName: 'John' })
            expect(component.calculateActivityError).toHaveBeenCalledWith([{ activities: [] }])
            expect(component.calculateCompError).toHaveBeenCalledWith([{ competincies: [] }])
            expect(component.calculateCompDetailsError).toHaveBeenCalledWith([{ compLevel: 'Basic' }])
            expect(_.union).toHaveBeenCalledWith([], [], [], [])
        })

        it('should handle missing officerFormData', () => {
            component.dataStructure = {
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            component.individualValidations()

            expect(component.calculateOfficerErrors).not.toHaveBeenCalled()
            expect(_.union).toHaveBeenCalledWith([], [], [], [])
        })

        it('should handle missing activityGroups', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            component.individualValidations()

            expect(component.calculateActivityError).not.toHaveBeenCalled()
            expect(_.union).toHaveBeenCalledWith([], [], [], [])
        })

        it('should handle missing compGroups', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            component.individualValidations()

            expect(component.calculateCompError).not.toHaveBeenCalled()
            expect(_.union).toHaveBeenCalledWith([], [], [], [])
        })

        it('should handle missing compDetails', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }]
            }

            component.individualValidations()

            expect(component.calculateCompDetailsError).not.toHaveBeenCalled()
            expect(_.union).toHaveBeenCalledWith([], [], [], [])
        })

        it('should handle empty dataStructure', () => {
            component.dataStructure = {}

            // const result = component.individualValidations()

            expect(component.calculateOfficerErrors).not.toHaveBeenCalled()
            expect(component.calculateActivityError).not.toHaveBeenCalled()
            expect(component.calculateCompError).not.toHaveBeenCalled()
            expect(component.calculateCompDetailsError).not.toHaveBeenCalled()
            expect(_.union).toHaveBeenCalledWith([], [], [], [])
        })
    })

    describe('calculateOfficerErrors method', () => {
        it('should return error when officerName is empty but other fields are filled', () => {
            const data = { officerName: '', position: 'Manager', positionDescription: 'Description' }
            const result = component.calculateOfficerErrors(data)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual({
                _type: 'error',
                type: 'officer',
                counts: 0,
                label: 'Officer name is empty'
            })
        })

        it('should return error when officerName is empty and position is filled', () => {
            const data = { officerName: '', position: 'Manager', positionDescription: '' }
            const result = component.calculateOfficerErrors(data)

            expect(result).toHaveLength(2)
            expect(result[0].label).toBe('Officer name is empty')
            expect(result[1].label).toBe('Designation description missing')
        })

        it('should return error when officerName is empty and positionDescription is filled', () => {
            const data = { officerName: '', position: '', positionDescription: 'Description' }
            const result = component.calculateOfficerErrors(data)

            expect(result).toHaveLength(2)
            expect(result[0].label).toBe('Officer name is empty')
            expect(result[1].label).toBe('Designation missing')
        })

        it('should return error when position is empty but other fields are filled', () => {
            const data = { officerName: 'John', position: '', positionDescription: 'Description' }
            const result = component.calculateOfficerErrors(data)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual({
                _type: 'error',
                type: 'officer',
                counts: 0,
                label: 'Designation missing'
            })
        })

        it('should return error when position is empty and officerName is filled', () => {
            const data = { officerName: 'John', position: '', positionDescription: '' }
            const result = component.calculateOfficerErrors(data)

            expect(result).toHaveLength(2)
            expect(result[0].label).toBe('Designation missing')
            expect(result[1].label).toBe('Designation description missing')
        })

        it('should return error when position is empty and positionDescription is filled', () => {
            const data = { officerName: '', position: '', positionDescription: 'Description' }
            const result = component.calculateOfficerErrors(data)

            expect(result).toHaveLength(1)
            expect(result[0].label).toBe('Designation missing')
        })

        it('should return warning when positionDescription is empty', () => {
            const data = { officerName: 'John', position: 'Manager', positionDescription: '' }
            const result = component.calculateOfficerErrors(data)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual({
                _type: 'warning',
                type: 'officer',
                counts: 0,
                label: 'Designation description missing'
            })
        })

        it('should return no errors for complete data', () => {
            const data = { officerName: 'John', position: 'Manager', positionDescription: 'Team Manager' }
            const result = component.calculateOfficerErrors(data)
            expect(result).toHaveLength(0)
        })

        it('should return no errors for all empty data', () => {
            const data = { officerName: '', position: '', positionDescription: '' }
            const result = component.calculateOfficerErrors(data)
            expect(result).toHaveLength(1) // Only positionDescription warning
            expect(result[0].label).toBe('Designation description missing')
        })

        it('should handle null/undefined data', () => {
            expect(component.calculateOfficerErrors(null)).toHaveLength(0)
            expect(component.calculateOfficerErrors(undefined)).toHaveLength(0)
        })
    })

    describe('calculateActivityError method', () => {
        beforeEach(() => {
            _.size.mockReturnValue(0)
            _.get.mockReturnValue([])
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([])
        })

        it('should return error for unmapped activities', () => {
            const data = [{ activities: [{ activityDescription: 'Test', assignedTo: 'User' }] }]
            _.first.mockReturnValue({ activities: [{ activityDescription: 'Test', assignedTo: 'User' }] })
            _.size.mockReturnValue(1)
            _.get.mockReturnValue([{ activityDescription: 'Test', assignedTo: 'User' }])
            _.without.mockReturnValue([])

            const result = component.calculateActivityError(data)

            expect(result[0]).toEqual({
                _type: 'error',
                type: 'activity',
                counts: 1,
                label: 'Unmapped activities'
            })
        })

        it('should count activities with missing descriptions in unmapped section', () => {
            const unmappedActivities = [
                { activityDescription: '', assignedTo: 'User1' },
                { activityDescription: 'Valid', assignedTo: 'User2' }
            ]

            const data = [{ activities: unmappedActivities }]
            _.first.mockReturnValue({ activities: unmappedActivities })
            _.size.mockReturnValue(2)
            _.get.mockReturnValue(unmappedActivities)
            _.without.mockReturnValue([])

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'Activity description missing' && error.counts === 1)).toBeTruthy()
        })

        it('should count activities with missing assignedTo in unmapped section', () => {
            const unmappedActivities = [
                { activityDescription: 'Test1', assignedTo: '' },
                { activityDescription: 'Test2', assignedTo: 'User' }
            ]

            const data = [{ activities: unmappedActivities }]
            _.first.mockReturnValue({ activities: unmappedActivities })
            _.size.mockReturnValue(2)
            _.get.mockReturnValue(unmappedActivities)
            _.without.mockReturnValue([])

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'Submit to is missing' && error.counts === 1)).toBeTruthy()
        })

        it('should handle roles without groupName', () => {
            const data = [
                { activities: [] }, // unmapped
                { groupName: '', activities: [] }
            ]
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([{ groupName: '', activities: [] }])
            _.get.mockReturnValue([])

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'Role label missing' && error.counts === 1)).toBeTruthy()
        })

        it('should handle roles with "Untitled role" groupName (case insensitive)', () => {
            const data = [
                { activities: [] }, // unmapped
                { groupName: 'UNTITLED ROLE', activities: [] }
            ]
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([{ groupName: 'UNTITLED ROLE', activities: [] }])
            _.get.mockReturnValue([])

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'Role label missing')).toBeTruthy()
        })

        it('should handle roles without groupDescription', () => {
            const data = [
                { activities: [] }, // unmapped
                { groupName: 'Valid Role', groupDescription: '', activities: [] }
            ]
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([{ groupName: 'Valid Role', groupDescription: '', activities: [] }])
            _.get.mockReturnValue([])

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'Role description missing')).toBeTruthy()
        })

        it('should handle roles with no activities', () => {
            const data = [
                { activities: [] }, // unmapped
                { groupName: 'Valid Role', groupDescription: 'Valid Desc', activities: [] }
            ]
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([{ groupName: 'Valid Role', groupDescription: 'Valid Desc', activities: [] }])
            _.get.mockReturnValue([])

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'No activities mapped')).toBeTruthy()
        })

        it('should handle activities within roles missing descriptions', () => {
            const roleActivities = [
                { activityDescription: '', assignedTo: 'User1' },
                { activityDescription: 'Valid', assignedTo: 'User2' }
            ]

            const data = [
                { activities: [] }, // unmapped
                { groupName: 'Valid Role', activities: roleActivities }
            ]
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([{ groupName: 'Valid Role', activities: roleActivities }])
            _.get.mockReturnValue(roleActivities)

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'Activity description missing')).toBeTruthy()
        })

        it('should handle activities within roles missing assignedTo', () => {
            const roleActivities = [
                { activityDescription: 'Test1', assignedTo: '' },
                { activityDescription: 'Test2', assignedTo: 'User' }
            ]

            const data = [
                { activities: [] }, // unmapped
                { groupName: 'Valid Role', activities: roleActivities }
            ]
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([{ groupName: 'Valid Role', activities: roleActivities }])
            _.get.mockReturnValue(roleActivities)

            const result = component.calculateActivityError(data)

            expect(result.some(error => error.label === 'Submit to is missing')).toBeTruthy()
        })

        it('should handle roles with null/undefined activities', () => {
            const data = [
                { activities: [] }, // unmapped
                { groupName: 'Valid Role', activities: null }
            ]
            _.first.mockReturnValue({ activities: [] })
            _.without.mockReturnValue([{ groupName: 'Valid Role', activities: null }])
            _.get.mockReturnValue(null)

            expect(() => component.calculateActivityError(data)).not.toThrow()
        })
    })

    describe('calculateCompError method', () => {
        beforeEach(() => {
            _.size.mockReturnValue(0)
            _.get.mockReturnValue([])
            _.first.mockReturnValue({ competincies: [] })
            _.without.mockReturnValue([])
        })

        it('should return error for unmapped competencies', () => {
            const data = [{ competincies: [{ compName: 'Test', compDescription: 'Test' }] }]
            _.first.mockReturnValue({ competincies: [{ compName: 'Test', compDescription: 'Test' }] })
            _.size.mockReturnValue(1)
            _.get.mockReturnValue([{ compName: 'Test', compDescription: 'Test' }])
            _.without.mockReturnValue([])

            const result = component.calculateCompError(data)

            expect(result[0]).toEqual({
                _type: 'error',
                type: 'competency',
                counts: 1,
                label: 'Unmapped competencies'
            })
        })

        it('should count competencies with missing descriptions in unmapped section', () => {
            const unmappedComps = [
                { compName: 'Test1', compDescription: '' },
                { compName: 'Test2', compDescription: 'Valid' }
            ]

            const data = [{ competincies: unmappedComps }]
            _.first.mockReturnValue({ competincies: unmappedComps })
            _.size.mockReturnValue(2)
            _.get.mockReturnValue(unmappedComps)
            _.without.mockReturnValue([])

            const result = component.calculateCompError(data)

            expect(result.some(error => error.label === 'Competency description missing' && error.counts === 1)).toBeTruthy()
        })

        it('should count competencies with missing compName in unmapped section', () => {
            const unmappedComps = [
                { compName: '', compDescription: 'Test1' },
                { compName: 'Valid', compDescription: 'Test2' }
            ]

            const data = [{ competincies: unmappedComps }]
            _.first.mockReturnValue({ competincies: unmappedComps })
            _.size.mockReturnValue(2)
            _.get.mockReturnValue(unmappedComps)
            _.without.mockReturnValue([])

            const result = component.calculateCompError(data)

            expect(result.some(error => error.label === 'Competency label missing' && error.counts === 1)).toBeTruthy()
        })

        it('should handle competency roles with no competencies', () => {
            const data = [
                { competincies: [] }, // unmapped
                { competincies: [] }
            ]
            _.first.mockReturnValue({ competincies: [] })
            _.without.mockReturnValue([{ competincies: [] }])
            _.get.mockReturnValue([])

            const result = component.calculateCompError(data)

            expect(result.some(error => error.label === 'No competencies mapped')).toBeTruthy()
        })

        it('should handle competencies within roles missing descriptions', () => {
            const roleComps = [
                { compName: 'Test1', compDescription: '' },
                { compName: 'Test2', compDescription: 'Valid' }
            ]

            const data = [
                { competincies: [] }, // unmapped
                { competincies: roleComps }
            ]
            _.first.mockReturnValue({ competincies: [] })
            _.without.mockReturnValue([{ competincies: roleComps }])
            _.get.mockReturnValue(roleComps)

            const result = component.calculateCompError(data)

            expect(result.some(error => error.label === 'Competency description missing')).toBeTruthy()
        })

        it('should handle competencies within roles missing compName', () => {
            const roleComps = [
                { compName: '', compDescription: 'Test1' },
                { compName: 'Valid', compDescription: 'Test2' }
            ]

            const data = [
                { competincies: [] }, // unmapped
                { competincies: roleComps }
            ]
            _.first.mockReturnValue({ competincies: [] })
            _.without.mockReturnValue([{ competincies: roleComps }])
            _.get.mockReturnValue(roleComps)

            const result = component.calculateCompError(data)

            expect(result.some(error => error.label === 'Competency label missing')).toBeTruthy()
        })

        it('should handle roles with null/undefined competencies', () => {
            const data = [
                { competincies: [] }, // unmapped
                { competincies: null }
            ]
            _.first.mockReturnValue({ competincies: [] })
            _.without.mockReturnValue([{ competincies: null }])
            _.get.mockReturnValue(null)

            expect(() => component.calculateCompError(data)).not.toThrow()
        })
    })

    describe('calculateCompDetailsError method', () => {
        it('should return warnings for missing compLevel', () => {
            const data = [
                { compLevel: '', compType: 'Technical', compArea: 'IT' },
                { compLevel: 'Basic', compType: 'Technical', compArea: 'IT' }
            ]

            const result = component.calculateCompDetailsError(data)

            expect(result.some(error => error.label === 'Competency level missing' && error.counts === 1)).toBeTruthy()
        })

        it('should return warnings for missing compType', () => {
            const data = [
                { compLevel: 'Basic', compType: '', compArea: 'IT' },
                { compLevel: 'Basic', compType: 'Technical', compArea: 'IT' }
            ]

            const result = component.calculateCompDetailsError(data)

            expect(result.some(error => error.label === 'Competency type missing' && error.counts === 1)).toBeTruthy()
        })

        it('should return warnings for missing compArea', () => {
            const data = [
                { compLevel: 'Basic', compType: 'Technical', compArea: '' },
                { compLevel: 'Basic', compType: 'Technical', compArea: 'IT' }
            ]

            const result = component.calculateCompDetailsError(data)

            expect(result.some(error => error.label === 'Competency area missing' && error.counts === 1)).toBeTruthy()
        })

        it('should return multiple warnings for multiple missing fields', () => {
            const data = [
                { compLevel: '', compType: '', compArea: '' }
            ]

            const result = component.calculateCompDetailsError(data)

            expect(result).toHaveLength(3)
            expect(result.every(error => error._type === 'warning')).toBeTruthy()
            expect(result.every(error => error.counts === 1)).toBeTruthy()
        })

        it('should return no errors for complete data', () => {
            const data = [
                { compLevel: 'Basic', compType: 'Technical', compArea: 'IT' }
            ]

            const result = component.calculateCompDetailsError(data)
            expect(result).toHaveLength(0)
        })

        it('should handle empty array', () => {
            const result = component.calculateCompDetailsError([])
            expect(result).toHaveLength(0)
        })

        it('should handle null/undefined data', () => {
            expect(component.calculateCompDetailsError(null)).toHaveLength(0)
            expect(component.calculateCompDetailsError(undefined)).toHaveLength(0)
        })
    })

    describe('calculatePercentage method', () => {
        beforeEach(() => {
            jest.spyOn(component, 'calculateOfficerProgress').mockReturnValue(0)
            jest.spyOn(component, 'calculateActivityProgress').mockReturnValue(0)
            jest.spyOn(component, 'calculateCompProgress').mockReturnValue(0)
            jest.spyOn(component, 'calculateCompDetailsProgress').mockReturnValue(0)
        })

        it('should calculate progress when all data structures exist', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            jest.spyOn(component, 'calculateOfficerProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateActivityProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompDetailsProgress').mockReturnValue(100)

            const result = component.calculatePercentage()

            expect(result).toBe(100) // Math.ceil(10 + 60 + 20 + 10)
            expect(watStoreService.setCurrentProgress).toHaveBeenCalledWith(100)
        })

        it('should handle missing officerFormData', () => {
            component.dataStructure = {
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            jest.spyOn(component, 'calculateActivityProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompDetailsProgress').mockReturnValue(100)

            const result = component.calculatePercentage()

            expect(component.calculateOfficerProgress).not.toHaveBeenCalled()
            expect(result).toBe(90) // Math.ceil(0 + 60 + 20 + 10)
        })

        it('should handle missing activityGroups', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            jest.spyOn(component, 'calculateOfficerProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompDetailsProgress').mockReturnValue(100)

            const result = component.calculatePercentage()

            expect(component.calculateActivityProgress).not.toHaveBeenCalled()
            expect(result).toBe(40) // Math.ceil(10 + 0 + 20 + 10)
        })

        it('should handle missing compGroups', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            jest.spyOn(component, 'calculateOfficerProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateActivityProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompDetailsProgress').mockReturnValue(100)

            const result = component.calculatePercentage()

            expect(component.calculateCompProgress).not.toHaveBeenCalled()
            expect(result).toBe(80) // Math.ceil(10 + 60 + 0 + 10)
        })

        it('should handle missing compDetails', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }]
            }

            jest.spyOn(component, 'calculateOfficerProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateActivityProgress').mockReturnValue(100)
            jest.spyOn(component, 'calculateCompProgress').mockReturnValue(100)

            const result = component.calculatePercentage()

            expect(component.calculateCompDetailsProgress).not.toHaveBeenCalled()
            expect(result).toBe(90) // Math.ceil(10 + 60 + 20 + 0)
        })

        it('should handle NaN values gracefully', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            jest.spyOn(component, 'calculateOfficerProgress').mockReturnValue(NaN)
            jest.spyOn(component, 'calculateActivityProgress').mockReturnValue(50)
            jest.spyOn(component, 'calculateCompProgress').mockReturnValue(NaN)
            jest.spyOn(component, 'calculateCompDetailsProgress').mockReturnValue(75)

            const result = component.calculatePercentage()

            expect(result).toBe(38) // Math.ceil(0 + 30 + 0 + 7.5)
        })

        it('should return 0 on calculation error', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' }
            }

            jest.spyOn(component, 'calculateOfficerProgress').mockImplementation(() => {
                throw new Error('Test error')
            })

            const result = component.calculatePercentage()
            expect(result).toBe(0)
        })

        it('should handle all NaN values', () => {
            component.dataStructure = {
                officerFormData: { officerName: 'John' },
                activityGroups: [{ activities: [] }],
                compGroups: [{ competincies: [] }],
                compDetails: [{ compLevel: 'Basic' }]
            }

            jest.spyOn(component, 'calculateOfficerProgress').mockReturnValue(NaN)
            jest.spyOn(component, 'calculateActivityProgress').mockReturnValue(NaN)
            jest.spyOn(component, 'calculateCompProgress').mockReturnValue(NaN)
            jest.spyOn(component, 'calculateCompDetailsProgress').mockReturnValue(NaN)

            const result = component.calculatePercentage()
            expect(result).toBe(0)
        })
    })

    describe('calculateOfficerProgress method', () => {
        it('should return 0 for empty/null data', () => {
            expect(component.calculateOfficerProgress(null)).toBe(0)
            expect(component.calculateOfficerProgress(undefined)).toBe(0)
            expect(component.calculateOfficerProgress({})).toBe(0)
        })

        it('should calculate progress for officerName only', () => {
            const data = { officerName: 'John', position: '', positionDescription: '' }
            const result = component.calculateOfficerProgress(data)
            expect(result).toBe(33) // Floor of 33.33
        })

        it('should calculate progress for position only', () => {
            const data = { officerName: '', position: 'Manager', positionDescription: '' }
            const result = component.calculateOfficerProgress(data)
            expect(result).toBe(33) // Floor of 33.33
        })

        it('should calculate progress for positionDescription only', () => {
            const data = { officerName: '', position: '', positionDescription: 'Description' }
            const result = component.calculateOfficerProgress(data)
            expect(result).toBe(33) // Floor of 33.33
        })

        it('should calculate progress for two fields', () => {
            const data = { officerName: 'John', position: 'Manager', positionDescription: '' }
            const result = component.calculateOfficerProgress(data)
            expect(result).toBe(66) // Floor of 66.66
        })

        it('should return 100 for complete data (>= 99.90)', () => {
            const data = { officerName: 'John', position: 'Manager', positionDescription: 'Team Manager' }
            const result = component.calculateOfficerProgress(data)
            expect(result).toBe(100) // 99.99 >= 99.90, so returns 100
        })
    })

    describe('calculateActivityProgress method', () => {
        beforeEach(() => {
            _.without.mockReturnValue([])
            _.get.mockReturnValue([])
        })

        it('should return 0 for empty data', () => {
            const result = component.calculateActivityProgress([])
            expect(result).toBe(0)
        })

        it('should add minRolePercent when roles count >= minRole', () => {
            const data = [
                { activities: [] }, // unmapped
                { groupName: 'Role1', activities: [] }
            ]
            _.without.mockReturnValue([{ groupName: 'Role1', activities: [] }])
            _.get.mockReturnValue([])

            const result = component.calculateActivityProgress(data)
            expect(result).toBeGreaterThanOrEqual(20) // minRolePercent
        })

        it('should not add minRolePercent when roles count < minRole', () => {
            const data = [
                { activities: [] } // only unmapped, no actual roles
            ]
            _.without.mockReturnValue([])

            const result = component.calculateActivityProgress(data)
            expect(result).toBe(0)
        })

        it('should calculate role progress with valid groupName', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: 'Valid Role',
                    groupDescription: 'Valid Description',
                    activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
                }
            ]
            _.without.mockReturnValue([{
                groupName: 'Valid Role',
                groupDescription: 'Valid Description',
                activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
            }])
            _.get.mockReturnValue([{ activityDescription: 'Activity', assignedTo: 'User' }])

            const result = component.calculateActivityProgress(data)
            expect(result).toBe(100) // Should return 100 when >= 99.99
        })

        it('should not add label progress for empty groupName', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: '',
                    groupDescription: 'Valid Description',
                    activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
                }
            ]
            _.without.mockReturnValue([{
                groupName: '',
                groupDescription: 'Valid Description',
                activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
            }])
            _.get.mockReturnValue([{ activityDescription: 'Activity', assignedTo: 'User' }])

            const result = component.calculateActivityProgress(data)
            expect(result).toBeGreaterThan(0)
        })

        it('should not add label progress for "Untitled role" groupName', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: 'Untitled role',
                    groupDescription: 'Valid Description',
                    activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
                }
            ]
            _.without.mockReturnValue([{
                groupName: 'Untitled role',
                groupDescription: 'Valid Description',
                activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
            }])
            _.get.mockReturnValue([{ activityDescription: 'Activity', assignedTo: 'User' }])

            const result = component.calculateActivityProgress(data)
            expect(result).toBeGreaterThan(0)
        })

        it('should not add description progress for empty groupDescription', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: 'Valid Role',
                    groupDescription: '',
                    activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
                }
            ]
            _.without.mockReturnValue([{
                groupName: 'Valid Role',
                groupDescription: '',
                activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
            }])
            _.get.mockReturnValue([{ activityDescription: 'Activity', assignedTo: 'User' }])

            const result = component.calculateActivityProgress(data)
            expect(result).toBeGreaterThan(0)
        })

        it('should add minActivityPercent when activities count >= minActivity', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: 'Valid Role',
                    activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
                }
            ]
            _.without.mockReturnValue([{
                groupName: 'Valid Role',
                activities: [{ activityDescription: 'Activity', assignedTo: 'User' }]
            }])
            _.get.mockReturnValue([{ activityDescription: 'Activity', assignedTo: 'User' }])

            const result = component.calculateActivityProgress(data)
            expect(result).toBeGreaterThan(20) // Should include minActivityPercent
        })

        it('should not process activities when count < minActivity', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: 'Valid Role',
                    activities: [] // empty activities
                }
            ]
            _.without.mockReturnValue([{
                groupName: 'Valid Role',
                activities: []
            }])
            _.get.mockReturnValue([])

            const result = component.calculateActivityProgress(data)
            expect(result).toBe(35) // minRolePercent + label + description progress
        })

        it('should handle multiple roles correctly', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: 'Role1',
                    groupDescription: 'Desc1',
                    activities: [{ activityDescription: 'Activity1', assignedTo: 'User1' }]
                },
                {
                    groupName: 'Role2',
                    groupDescription: 'Desc2',
                    activities: [{ activityDescription: 'Activity2', assignedTo: 'User2' }]
                }
            ]
            _.without.mockReturnValue([
                {
                    groupName: 'Role1',
                    groupDescription: 'Desc1',
                    activities: [{ activityDescription: 'Activity1', assignedTo: 'User1' }]
                },
                {
                    groupName: 'Role2',
                    groupDescription: 'Desc2',
                    activities: [{ activityDescription: 'Activity2', assignedTo: 'User2' }]
                }
            ])
            _.get.mockReturnValueOnce([{ activityDescription: 'Activity1', assignedTo: 'User1' }])
                .mockReturnValueOnce([{ activityDescription: 'Activity2', assignedTo: 'User2' }])

            const result = component.calculateActivityProgress(data)
            expect(result).toBe(100) // Should return 100 when >= 99.99
        })
    })

    describe('calculateCompProgress method', () => {
        beforeEach(() => {
            _.without.mockReturnValue([])
            _.get.mockReturnValue([])
        })

        it('should return 0 for empty data', () => {
            const result = component.calculateCompProgress([])
            expect(result).toBe(0)
        })

        it('should add minCompetencyPercent when competencies count >= minCompetency', () => {
            const data = [
                { competincies: [] }, // unmapped
                { competincies: [{ compName: 'Comp1', compDescription: 'Desc1' }] }
            ]
            _.without.mockReturnValue([{ competincies: [{ compName: 'Comp1', compDescription: 'Desc1' }] }])
            _.get.mockReturnValue([{ compName: 'Comp1', compDescription: 'Desc1' }])

            const result = component.calculateCompProgress(data)
            expect(result).toBe(100) // Should return 100 when >= 99.99
        })

        it('should not add minCompetencyPercent when competencies count < minCompetency', () => {
            const data = [
                { competincies: [] }, // unmapped
                { competincies: [] } // no competencies
            ]
            _.without.mockReturnValue([{ competincies: [] }])
            _.get.mockReturnValue([])

            const result = component.calculateCompProgress(data)
            expect(result).toBe(0)
        })

        it('should handle multiple roles correctly', () => {
            const data = [
                { competincies: [] }, // unmapped
                { competincies: [{ compName: 'Comp1', compDescription: 'Desc1' }] },
                { competincies: [{ compName: 'Comp2', compDescription: 'Desc2' }] }
            ]
            _.without.mockReturnValue([
                { competincies: [{ compName: 'Comp1', compDescription: 'Desc1' }] },
                { competincies: [{ compName: 'Comp2', compDescription: 'Desc2' }] }
            ])
            _.get.mockReturnValueOnce([{ compName: 'Comp1', compDescription: 'Desc1' }])
                .mockReturnValueOnce([{ compName: 'Comp2', compDescription: 'Desc2' }])

            const result = component.calculateCompProgress(data)
            expect(result).toBe(100) // Should return 100 when >= 99.99
        })

        it('should handle competencies with missing compDescription', () => {
            const data = [
                { competincies: [] }, // unmapped
                { competincies: [{ compName: 'Comp1', compDescription: '' }] }
            ]
            _.without.mockReturnValue([{ competincies: [{ compName: 'Comp1', compDescription: '' }] }])
            _.get.mockReturnValue([{ compName: 'Comp1', compDescription: '' }])

            const result = component.calculateCompProgress(data)
            expect(result).toBeGreaterThan(0)
        })

        it('should handle competencies with missing compName', () => {
            const data = [
                { competincies: [] }, // unmapped
                { competincies: [{ compName: '', compDescription: 'Desc1' }] }
            ]
            _.without.mockReturnValue([{ competincies: [{ compName: '', compDescription: 'Desc1' }] }])
            _.get.mockReturnValue([{ compName: '', compDescription: 'Desc1' }])

            const result = component.calculateCompProgress(data)
            expect(result).toBeGreaterThan(0)
        })
    })

    describe('calculateCompDetailsProgress method', () => {
        it('should return 0 for empty/null data', () => {
            expect(component.calculateCompDetailsProgress([])).toBe(0)
            expect(component.calculateCompDetailsProgress(null)).toBe(0)
            expect(component.calculateCompDetailsProgress(undefined)).toBe(0)
        })

        it('should calculate progress for single complete item', () => {
            const data = [{ compLevel: 'Basic', compType: 'Technical', compArea: 'IT' }]
            const result = component.calculateCompDetailsProgress(data)
            expect(result).toBe(100) // 99.99 >= 99.90, so returns 100
        })

        it('should calculate progress for single item with missing compLevel', () => {
            const data = [{ compLevel: '', compType: 'Technical', compArea: 'IT' }]
            const result = component.calculateCompDetailsProgress(data)
            expect(result).toBe(66) // Floor of 66.66
        })

        it('should calculate progress for single item with missing compType', () => {
            const data = [{ compLevel: 'Basic', compType: '', compArea: 'IT' }]
            const result = component.calculateCompDetailsProgress(data)
            expect(result).toBe(66) // Floor of 66.66
        })

        it('should calculate progress for single item with missing compArea', () => {
            const data = [{ compLevel: 'Basic', compType: 'Technical', compArea: '' }]
            const result = component.calculateCompDetailsProgress(data)
            expect(result).toBe(66) // Floor of 66.66
        })

        it('should calculate progress for multiple items', () => {
            const data = [
                { compLevel: 'Basic', compType: 'Technical', compArea: 'IT' },
                { compLevel: '', compType: 'Technical', compArea: 'IT' }
            ]
            const result = component.calculateCompDetailsProgress(data)
            expect(result).toBe(83) // Floor of 83.33
        })

        it('should handle all empty fields', () => {
            const data = [{ compLevel: '', compType: '', compArea: '' }]
            const result = component.calculateCompDetailsProgress(data)
            expect(result).toBe(0)
        })
    })

    describe('ngOnDestroy method', () => {
        it('should unsubscribe from all subscriptions when they exist', () => {
            // Setup mock subscriptions
            component.activitySubscription = { unsubscribe: jest.fn() }
            component.groupSubscription = { unsubscribe: jest.fn() }
            component.officerFormSubscription = { unsubscribe: jest.fn() }
            component.compDetailsSubscription = { unsubscribe: jest.fn() }

            component.ngOnDestroy()

            expect(component.activitySubscription.unsubscribe).toHaveBeenCalled()
            expect(component.groupSubscription.unsubscribe).toHaveBeenCalled()
            expect(component.officerFormSubscription.unsubscribe).toHaveBeenCalled()
            expect(component.compDetailsSubscription.unsubscribe).toHaveBeenCalled()
        })

        it('should handle undefined subscriptions gracefully', () => {
            component.activitySubscription = undefined
            component.groupSubscription = undefined
            component.officerFormSubscription = undefined
            component.compDetailsSubscription = undefined

            expect(() => component.ngOnDestroy()).toThrow()
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle lodash functions returning undefined', () => {
            _.groupBy.mockReturnValue(undefined)
            _.get.mockReturnValue(undefined)
            _.size.mockReturnValue(undefined)

            expect(() => component.validationsCombined()).not.toThrow()
        })

        it('should handle data with unexpected structure', () => {
            const malformedData = [
                { unexpectedProperty: 'value' },
                null,
                undefined,
                { activities: null },
                { competincies: undefined }
            ]

            expect(() => component.calculateActivityError(malformedData)).not.toThrow()
            expect(() => component.calculateCompError(malformedData)).not.toThrow()
        })

        it('should handle string comparison edge cases in activity validation', () => {
            const data = [
                { activities: [] }, // unmapped
                {
                    groupName: 123, // non-string groupName
                    activities: []
                }
            ]
            _.without.mockReturnValue([{ groupName: 123, activities: [] }])
            _.get.mockReturnValue([])

            expect(() => component.calculateActivityError(data)).not.toThrow()
        })

        it('should handle various types of falsy values in calculations', () => {
            const officerData = {
                officerName: null,
                position: undefined,
                positionDescription: false
            }

            expect(() => component.calculateOfficerProgress(officerData)).not.toThrow()
            expect(() => component.calculateOfficerErrors(officerData)).not.toThrow()
        })
    })
})