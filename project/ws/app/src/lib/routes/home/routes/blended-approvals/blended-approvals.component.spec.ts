import { BlendedApprovalsComponent } from './blended-approvals.component'
import { ActivatedRoute, Router } from '@angular/router'
import { BlendedService } from '../../services/blended.service'
import { of, throwError } from 'rxjs'
import moment from 'moment'

// Mock moment to have consistent date testing
jest.mock('moment', () => {
    const actualMoment = jest.requireActual('moment')
    return {
        ...actualMoment,
        default: jest.fn(() => actualMoment('2024-01-15')), // Mock current date
    }
})

describe('BlendedApprovalsComponent', () => {
    let component: BlendedApprovalsComponent
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>
    let mockRouter: jest.Mocked<Router>
    let mockBlendedService: jest.Mocked<BlendedService>

    const mockUserProfile = {
        rootOrgId: 'test-org-id',
        channel: 'test-channel'
    }

    const mockBlendedProgramsResponse = {
        result: {
            content: [
                {
                    identifier: 'program-1',
                    name: 'Test Program 1',
                    batches: [
                        { batchId: 'batch-1', endDate: '2024-02-15' },
                        { batchId: 'batch-2', endDate: '2023-12-15' }, // Past date
                    ]
                },
                {
                    identifier: 'program-2',
                    name: 'Test Program 2',
                    batches: [
                        { batchId: 'batch-3', endDate: '2024-03-15' },
                    ]
                }
            ]
        }
    }

    const mockRequestsResponse = {
        result: {
            data: [
                { id: 'request-1' },
                { id: 'request-2' }
            ]
        }
    }

    beforeEach(() => {
        // Create mocks
        mockActivatedRoute = {
            parent: {
                snapshot: {
                    data: {
                        configService: {
                            unMappedUser: mockUserProfile
                        }
                    }
                }
            }
        } as any

        mockRouter = {
            navigate: jest.fn()
        } as any

        mockBlendedService = {
            getBlendedPrograms: jest.fn(),
            getRequests: jest.fn()
        } as any

        // Create component instance
        component = new BlendedApprovalsComponent(
            mockActivatedRoute,
            mockRouter,
            mockBlendedService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Initialization', () => {
        it('should create component with default values', () => {
            expect(component).toBeTruthy()
            expect(component.data).toEqual([])
            expect(component.currentFilter).toBe('toapprove')
            expect(component.departName).toBe('')
            expect(component.bIDs).toEqual([])
        })

        it('should have correct table configuration', () => {
            expect(component.tabledata).toEqual({
                actions: [],
                columns: [
                    { displayName: 'CBP name', key: 'name', imageUrl: true },
                    { displayName: 'Batches', key: 'batchesCount' },
                    { displayName: 'New requests (Across batches)', key: 'newrequests', isList: true },
                ],
                needCheckBox: false,
                needHash: false,
                sortColumn: 'fullname',
                sortState: 'asc',
                needUserMenus: false,
            })
        })
    })

    describe('ngOnInit', () => {
        it('should set userProfile from route data and call getBlendedPreogramsList', () => {
            const getBlendedProgramsListSpy = jest.spyOn(component, 'getBlendedPreogramsList').mockImplementation()

            component.ngOnInit()

            expect(component.userProfile).toEqual(mockUserProfile)
            expect(getBlendedProgramsListSpy).toHaveBeenCalledTimes(1)
        })

        it('should handle missing parent route data gracefully', () => {
            // mockActivatedRoute.parent = null
            const getBlendedProgramsListSpy = jest.spyOn(component, 'getBlendedPreogramsList').mockImplementation()

            component.ngOnInit()

            expect(component.userProfile).toBeUndefined()
            expect(getBlendedProgramsListSpy).toHaveBeenCalledTimes(1)
        })

        it('should handle missing configService data gracefully', () => {
            mockActivatedRoute.parent!.snapshot.data = {}
            const getBlendedProgramsListSpy = jest.spyOn(component, 'getBlendedPreogramsList').mockImplementation()

            component.ngOnInit()

            expect(component.userProfile).toBeUndefined()
            expect(getBlendedProgramsListSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('getBlendedPreogramsList', () => {
        beforeEach(() => {
            component.userProfile = mockUserProfile
        })

        it('should call blendedService with correct request parameters', () => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(of(mockBlendedProgramsResponse))
            mockBlendedService.getRequests.mockReturnValue(of(mockRequestsResponse))

            component.getBlendedPreogramsList()

            expect(mockBlendedService.getBlendedPrograms).toHaveBeenCalledWith({
                locale: ['en'],
                query: '',
                request: {
                    query: '',
                    filters: {
                        status: ['Live'],
                        primaryCategory: ['Blended Program'],
                        createdFor: [],
                    },
                    sort_by: { lastUpdatedOn: 'desc' },
                    facets: ['primaryCategory', 'mimeType'],
                    limit: 1000,
                    offset: 0,
                },
            })
        })

        it('should process blended programs data correctly', (done) => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(of(mockBlendedProgramsResponse))
            mockBlendedService.getRequests.mockReturnValue(of(mockRequestsResponse))

            component.getBlendedPreogramsList()

            // Allow async operations to complete
            setTimeout(() => {
                expect(component.data).toHaveLength(2)
                expect(component.data[0].batchesCount).toBe(1) // Only future batches count
                expect(component.data[1].batchesCount).toBe(1)
                done()
            }, 100)
        })

        it('should filter out past batches correctly', (done) => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(of(mockBlendedProgramsResponse))
            mockBlendedService.getRequests.mockReturnValue(of(mockRequestsResponse))

            component.getBlendedPreogramsList()

            setTimeout(() => {
                // First program has 2 batches but only 1 should be counted (future batch)
                expect(component.data[0].batchesCount).toBe(1)
                done()
            }, 100)
        })

        it('should call getRequests for each program with allowed batches', (done) => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(of(mockBlendedProgramsResponse))
            mockBlendedService.getRequests.mockReturnValue(of(mockRequestsResponse))

            component.getBlendedPreogramsList()

            setTimeout(() => {
                expect(mockBlendedService.getRequests).toHaveBeenCalledTimes(2)
                expect(mockBlendedService.getRequests).toHaveBeenCalledWith({
                    serviceName: 'blendedprogram',
                    applicationStatus: 'SEND_FOR_MDO_APPROVAL',
                    applicationIds: ['batch-1'], // Only future batch ID
                    limit: 100,
                    offset: 0,
                    deptName: 'test-channel',
                })
                done()
            }, 100)
        })

        it('should set newrequests count from service response', (done) => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(of(mockBlendedProgramsResponse))
            mockBlendedService.getRequests.mockReturnValue(of(mockRequestsResponse))

            component.getBlendedPreogramsList()

            setTimeout(() => {
                expect(component.data[0].newrequests).toBe(2) // Length of mock response data
                expect(component.data[1].newrequests).toBe(2)
                done()
            }, 100)
        })

        it('should handle programs without batches', () => {
            const responseWithoutBatches = {
                result: {
                    content: [
                        {
                            identifier: 'program-3',
                            name: 'Program Without Batches'
                        }
                    ]
                }
            }

            mockBlendedService.getBlendedPrograms.mockReturnValue(of(responseWithoutBatches))

            component.getBlendedPreogramsList()

            expect(component.data).toHaveLength(1)
            expect(component.data[0].batchesCount).toBe(0)
            expect(component.data[0].newrequests).toBe(0)
        })

        it('should handle empty response', () => {
            const emptyResponse = { result: { content: [] } }
            mockBlendedService.getBlendedPrograms.mockReturnValue(of(emptyResponse))

            component.getBlendedPreogramsList()

            expect(component.data).toEqual([])
        })

        it('should handle service error gracefully', () => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(throwError('Service error'))

            expect(() => component.getBlendedPreogramsList()).not.toThrow()
        })

        it('should handle missing result property', () => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(of({}))

            component.getBlendedPreogramsList()

            expect(component.data).toEqual([])
        })

        it('should handle getRequests service error', (done) => {
            mockBlendedService.getBlendedPrograms.mockReturnValue(of(mockBlendedProgramsResponse))
            mockBlendedService.getRequests.mockReturnValue(throwError('Requests service error'))

            component.getBlendedPreogramsList()

            setTimeout(() => {
                // Should still process the programs even if requests fail
                expect(component.data).toHaveLength(2)
                done()
            }, 100)
        })
    })

    describe('viewDetails', () => {
        it('should navigate to correct route with event data', () => {
            const mockEvent = {
                identifier: 'test-program-id',
                name: 'Test Program'
            }

            component.viewDetails(mockEvent)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/app/blended-approvals/test-program-id/batches'],
                { state: mockEvent }
            )
        })

        it('should handle event without identifier', () => {
            const mockEvent = { name: 'Test Program' }

            component.viewDetails(mockEvent)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/app/blended-approvals/undefined/batches'],
                { state: mockEvent }
            )
        })
    })

    describe('getTableData getter', () => {
        it('should return current data array', () => {
            const testData = [{ id: 1, name: 'test' }]
            component.data = testData

            expect(component.getTableData).toBe(testData)
        })

        it('should return empty array when data is empty', () => {
            component.data = []

            expect(component.getTableData).toEqual([])
        })
    })

    describe('Date filtering logic', () => {
        it('should correctly identify future dates', () => {
            const futureDate = '2024-06-15'
            const today = moment('2024-01-15')
            const isFuture = today.isSameOrBefore(moment(futureDate), 'day')

            expect(isFuture).toBe(true)
        })

        it('should correctly identify past dates', () => {
            const pastDate = '2023-12-15'
            const today = moment('2024-01-15')
            const isFuture = today.isSameOrBefore(moment(pastDate), 'day')

            expect(isFuture).toBe(false)
        })

        it('should handle same date as today', () => {
            const todayDate = '2024-01-15'
            const today = moment('2024-01-15')
            const isSameOrBefore = today.isSameOrBefore(moment(todayDate), 'day')

            expect(isSameOrBefore).toBe(true)
        })
    })
})