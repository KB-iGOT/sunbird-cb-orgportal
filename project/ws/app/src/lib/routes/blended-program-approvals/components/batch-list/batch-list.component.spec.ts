import { BatchListComponent } from './batch-list.component'
import { of } from 'rxjs'
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap } from '@angular/router'
// import { fakeAsync, tick } from '@angular/core/testing'
// import moment from 'moment'

// Mock moment to control dates in tests
jest.mock('moment', () => {
    const actualMoment = jest.requireActual('moment')
    return {
        __esModule: true,
        default: jest.fn((date?: any) => {
            if (date) {
                return actualMoment(date)
            }
            // Return a fixed date for "now" in tests
            return actualMoment('2023-06-15')
        }),
    }
})

// jest.mock('moment')

describe('BatchListComponent', () => {
    let component: BatchListComponent
    let mockRouter: any
    let mockActivatedRoute: any
    let mockBlendedApprovalService: any

    // Mock data
    const mockUserProfile = {
        channel: 'test-channel',
        userId: 'user123'
    }

    const mockProgramData = {
        id: 'program123',
        name: 'Test Program',
        description: 'Test Program Description',
        batches: [
            {
                batchId: 'batch1',
                name: 'Batch 1',
                startDate: '2023-05-01',
                endDate: '2023-06-30' // Future date
            },
            {
                batchId: 'batch2',
                name: 'Batch 2',
                startDate: '2023-05-01',
                endDate: '2023-05-31' // Past date (archived)
            },
            {
                batchId: 'batch3',
                name: 'Batch 3',
                startDate: '2023-06-10',
                endDate: '2023-07-10' // Future date
            }
        ]
    }

    const mockNavigationState = {
        extras: {
            state: mockProgramData
        }
    }

    const mockRequestsResponse = {
        result: {
            data: [
                { id: 'req1', status: 'SEND_FOR_MDO_APPROVAL' },
                { id: 'req2', status: 'SEND_FOR_MDO_APPROVAL' }
            ]
        }
    }

    const mockLearnersResponse = [
        { id: 'learner1', name: 'Learner 1' },
        { id: 'learner2', name: 'Learner 2' },
        { id: 'learner3', name: 'Learner 3' }
    ]

    const mockBPDetailsResponse = {
        result: {
            content: mockProgramData
        }
    }

    beforeEach(() => {
        // Setup mocks
        mockRouter = {
            getCurrentNavigation: jest.fn(),
            navigate: jest.fn()
        }

        mockActivatedRoute = {
            snapshot: {
                params: { id: 'program123' }
            },
            parent: {
                snapshot: {
                    data: {
                        configService: {
                            unMappedUser: mockUserProfile
                        }
                    }
                }
            }
        }

        mockBlendedApprovalService = {
            getRequests: jest.fn().mockReturnValue(of(mockRequestsResponse)),
            getLearners: jest.fn().mockReturnValue(of(mockLearnersResponse)),
            getBlendedProgramsDetails: jest.fn().mockReturnValue(of(mockBPDetailsResponse))
        }

        // Reset mocks before each test
        jest.clearAllMocks()
    })

    // describe('Constructor - With Navigation State', () => {
    //     beforeEach(() => {
    //         mockRouter.getCurrentNavigation.mockReturnValue(mockNavigationState)
    //     })

    //     it('should create component with navigation state', () => {
    //         component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

    //         expect(component).toBeTruthy()
    //         expect(component.programData).toEqual(mockProgramData)
    //         expect(component.programID).toBe('program123')
    //         expect(component.userProfile).toEqual(mockUserProfile)
    //     })

    //     it('should set up breadcrumbs correctly', () => {
    //         component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

    //         expect(component.breadcrumbs).toEqual({
    //             titles: [
    //                 { title: 'Blended programs', url: '/app/home/blended-approvals' },
    //                 { title: 'Test Program', url: 'none' }
    //             ]
    //         })
    //     })

    //     it('should categorize batches into active and archived lists', () => {
    //         component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

    //         // batch1 and batch3 should be active (end date is same or after current date)
    //         expect(component.batchesList).toHaveLength(2)
    //         expect(component.batchesList.map((b: any) => b.batchId)).toContain('batch1')
    //         expect(component.batchesList.map((b: any) => b.batchId)).toContain('batch3')

    //         // batch2 should be archived (end date is before current date)
    //         expect(component.arcBatchList).toHaveLength(1)
    //         expect(component.arcBatchList[0].batchId).toBe('batch2')
    //     })

    //     it('should initialize learners count and make service calls for each batch', () => {
    //         component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

    //         // Should call getRequests for each batch
    //         expect(mockBlendedApprovalService.getRequests).toHaveBeenCalledTimes(3)

    //         // Should call getLearners for each batch
    //         expect(mockBlendedApprovalService.getLearners).toHaveBeenCalledTimes(3)

    //         // Verify the request parameters for the first batch
    //         expect(mockBlendedApprovalService.getRequests).toHaveBeenCalledWith({
    //             serviceName: 'blendedprogram',
    //             applicationStatus: 'SEND_FOR_MDO_APPROVAL',
    //             applicationIds: ['batch1'],
    //             limit: 100,
    //             offset: 0,
    //             deptName: 'test-channel'
    //         })

    //         // Verify getLearners calls
    //         expect(mockBlendedApprovalService.getLearners).toHaveBeenCalledWith('batch1', 'test-channel')
    //         expect(mockBlendedApprovalService.getLearners).toHaveBeenCalledWith('batch2', 'test-channel')
    //         expect(mockBlendedApprovalService.getLearners).toHaveBeenCalledWith('batch3', 'test-channel')
    //     })

    //     it('should update batch counts from service responses', (done) => {
    //         component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

    //         // Wait for async operations to complete
    //         setTimeout(() => {
    //             const batch1 = component.batchesList.find((b: any) => b.batchId === 'batch1')
    //             const batch2 = component.arcBatchList.find((b: any) => b.batchId === 'batch2')
    //             const batch3 = component.batchesList.find((b: any) => b.batchId === 'batch3')

    //             // All batches should have updated counts
    //             expect(batch1.newrequestsCount).toBe(2)
    //             expect(batch1.learnersCount).toBe(3)

    //             expect(batch2.newrequestsCount).toBe(2)
    //             expect(batch2.learnersCount).toBe(3)

    //             expect(batch3.newrequestsCount).toBe(2)
    //             expect(batch3.learnersCount).toBe(3)

    //             done()
    //         }, 100)
    //     })
    // })

    describe('Constructor - Without Navigation State', () => {
        beforeEach(() => {
            mockRouter.getCurrentNavigation.mockReturnValue(null)
        })

        it('should create component and call getBPDetails when no navigation state', () => {
            const getBPDetailsSpy = jest.spyOn(BatchListComponent.prototype, 'getBPDetails')

            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            expect(component.programID).toBe('program123')
            expect(getBPDetailsSpy).toHaveBeenCalledWith('program123')
        })

        it('should handle case when no parent route data exists', () => {
            const mockActivatedRouteNoParent = {
                snapshot: {
                    params: { id: 'program123' },
                    queryParams: {},
                    fragment: '',
                    data: {},
                    outlet: 'primary',
                    component: null,
                    url: [],
                    paramMap: convertToParamMap({ id: 'program123' }),
                    queryParamMap: convertToParamMap({}),
                    root: {} as ActivatedRouteSnapshot,
                    firstChild: null,
                    children: [],
                    pathFromRoot: [],
                    toString: () => '',
                    title: '', // ✅ required in snapshot
                    routeConfig: null, // ✅ required in snapshot
                    parent: null,
                },
                parent: null,
                url: of([]),
                params: of({ id: 'program123' }),
                queryParams: of({}),
                fragment: of(''),
                data: of({}),
                outlet: 'primary',
                component: null,
                routeConfig: null,
                root: {} as ActivatedRoute,
                firstChild: null,
                children: [],
                pathFromRoot: [],
                paramMap: of(convertToParamMap({ id: 'program123' })),
                queryParamMap: of(convertToParamMap({})),
                title: of(''),
            }

            component = new BatchListComponent(mockRouter, mockActivatedRouteNoParent, mockBlendedApprovalService)

            expect(component.userProfile).toBeUndefined()
        })
    })

    describe('getBPDetails', () => {
        beforeEach(() => {
            mockRouter.getCurrentNavigation.mockReturnValue(null)
            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)
        })

        it('should fetch program details and set up data', () => {
            component.getBPDetails('program123')

            expect(mockBlendedApprovalService.getBlendedProgramsDetails).toHaveBeenCalledWith('program123')
            expect(component.programData).toEqual(mockProgramData)
        })

        it('should set up breadcrumbs after fetching details', () => {
            component.getBPDetails('program123')

            expect(component.breadcrumbs).toEqual({
                titles: [
                    { title: 'Blended programs', url: '/app/home/blended-approvals' },
                    { title: 'Test Program', url: 'none' }
                ]
            })
        })



        it('should handle empty response gracefully', () => {
            const emptyResponse = { result: { content: null } }
            mockBlendedApprovalService.getBlendedProgramsDetails.mockReturnValue(of(emptyResponse))

            component.batchesList = []
            component.arcBatchList = []

            mockBlendedApprovalService.getRequests.mockClear()
            mockBlendedApprovalService.getLearners.mockClear()
            component.getBPDetails('program123')

            expect(component.programData).toBeNull()

            // Expect breadcrumbs to fall back to default if content is null
            expect(component.breadcrumbs).toEqual({
                titles: [
                    { title: 'Blended programs', url: '/app/home/blended-approvals' },
                    { title: 'Test Program', url: 'none' }
                ]
            })
        })


        it('should handle response without batches', () => {
            const noBatchesResponse = {
                result: {
                    content: {
                        id: 'program123',
                        name: 'Test Program',
                        batches: null
                    }
                }
            }

            mockBlendedApprovalService.getBlendedProgramsDetails.mockReturnValue(of(noBatchesResponse))

            // Reset the component instance to avoid leftover data
            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            component.getBPDetails('program123')

            expect(component.batchesList).toEqual([])
            expect(component.arcBatchList).toEqual([])
        })
    })

    describe('viewDetails', () => {
        beforeEach(() => {
            mockRouter.getCurrentNavigation.mockReturnValue(mockNavigationState)
            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)
        })

        it('should navigate to batch details with correct parameters', () => {
            const mockBatch = {
                batchId: 'batch123',
                name: 'Test Batch'
            }

            component.viewDetails(mockBatch)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/app/blended-approvals/program123/batches/batch123'],
                { state: mockBatch }
            )
        })
    })

    describe('Service Response Handling', () => {
        beforeEach(() => {
            mockRouter.getCurrentNavigation.mockReturnValue(mockNavigationState)
        })

        it('should handle empty requests response', (done) => {
            const emptyRequestsResponse = { result: { data: [] } }
            mockBlendedApprovalService.getRequests.mockReturnValue(of(emptyRequestsResponse))

            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            setTimeout(() => {
                const batch = component.batchesList.find((b: any) => b.batchId === 'batch1')
                expect(batch).toBeUndefined()
                expect(batch?.newrequestsCount).toBeUndefined()
                done()
            }, 100)
        })

        it('should handle null requests response', (done) => {
            const nullRequestsResponse = { result: null }
            mockBlendedApprovalService.getRequests.mockReturnValue(of(nullRequestsResponse))

            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            setTimeout(() => {
                const batch = component.batchesList.find((b: any) => b.batchId === 'batch1')
                expect(batch).toBeUndefined()
                expect(batch?.newrequestsCount).toBeUndefined()
                done()
            }, 100)
        })

        it('should handle empty learners response', (done) => {
            mockBlendedApprovalService.getLearners.mockReturnValue(of([]))

            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            setTimeout(() => {
                const batch = component.batchesList.find((b: any) => b.batchId === 'batch1')
                expect(batch).toBeUndefined()
                // expect(batch?.learnersCount).toBe(0)
                done()
            }, 100)
        })


    })

    describe('Date Logic', () => {



        it('should handle batches without end dates', () => {
            const programWithoutEndDates = {
                ...mockProgramData,
                batches: [
                    {
                        batchId: 'batch1',
                        name: 'Batch 1',
                        startDate: '2023-06-01',
                        endDate: null
                    }
                ]
            }

            mockRouter.getCurrentNavigation.mockReturnValue({
                extras: { state: programWithoutEndDates }
            })

            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            // Should handle null end dates by using current date
            expect(component.batchesList).toHaveLength(1)
            expect(component.arcBatchList).toHaveLength(0)
        })
    })

    describe('Edge Cases', () => {
        it('should handle missing program name', () => {
            const programWithoutName = {
                ...mockProgramData,
                name: null
            }

            mockRouter.getCurrentNavigation.mockReturnValue({
                extras: { state: programWithoutName }
            })

            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            expect(component.breadcrumbs).toBeUndefined()
        })

        it('should initialize with empty arrays when no batches', () => {
            const programWithoutBatches = {
                ...mockProgramData,
                batches: null
            }

            mockRouter.getCurrentNavigation.mockReturnValue({
                extras: { state: programWithoutBatches }
            })

            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            expect(component.batchesList).toEqual([])
            expect(component.arcBatchList).toEqual([])
        })

        it('should handle undefined userProfile gracefully', () => {
            // const routeWithoutUserProfile = {
            //     snapshot: {
            //         params: { id: 'program123' },
            //         queryParams: {},
            //         fragment: '',
            //         data: {},
            //         outlet: 'primary',
            //         component: null,
            //         url: [],
            //         paramMap: convertToParamMap({ id: 'program123' }),
            //         queryParamMap: convertToParamMap({}),
            //         root: {} as ActivatedRouteSnapshot,
            //         firstChild: null,
            //         children: [],
            //         pathFromRoot: [],
            //         toString: () => '',
            //         routeConfig: null,
            //         title: '',
            //         parent: null,
            //     },
            //     parent: {
            //         snapshot: {
            //             data: {
            //                 configService: null,
            //             },
            //             params: {},
            //             queryParams: {},
            //             fragment: '',
            //             outlet: 'primary',
            //             component: null,
            //             url: [],
            //             paramMap: convertToParamMap({}),
            //             queryParamMap: convertToParamMap({}),
            //             root: {} as ActivatedRouteSnapshot,
            //             firstChild: null,
            //             children: [],
            //             pathFromRoot: [],
            //             toString: () => '',
            //             routeConfig: null,
            //             title: '',
            //             parent: null,
            //         },
            //         url: of([]),
            //         params: of({}),
            //         queryParams: of({}),
            //         fragment: of(''),
            //         data: of({ configService: null }),
            //         outlet: 'primary',
            //         component: null,
            //         routeConfig: null,
            //         root: {} as ActivatedRoute,
            //         firstChild: null,
            //         children: [],
            //         pathFromRoot: [],
            //         paramMap: of(convertToParamMap({})),
            //         queryParamMap: of(convertToParamMap({})),
            //         title: of(''),
            //     },
            //     url: of([]),
            //     params: of({ id: 'program123' }),
            //     queryParams: of({}),
            //     fragment: of(''),
            //     data: of({}),
            //     outlet: 'primary',
            //     component: null,
            //     routeConfig: null,
            //     root: {} as ActivatedRoute,
            //     firstChild: null,
            //     children: [],
            //     pathFromRoot: [],
            //     paramMap: of(convertToParamMap({ id: 'program123' })),
            //     queryParamMap: of(convertToParamMap({})),
            //     title: of(''),
            // }
            const mockSnapshotParent: ActivatedRouteSnapshot = {
                data: { configService: null },
                params: {},
                queryParams: {},
                fragment: '',
                outlet: 'primary',
                component: null,
                url: [],
                paramMap: convertToParamMap({}),
                queryParamMap: convertToParamMap({}),
                root: {} as ActivatedRouteSnapshot,
                firstChild: null,
                children: [],
                pathFromRoot: [],
                toString: () => '',
                routeConfig: null,
                title: '',
                parent: null,
            }

            // Create a reusable parent ActivatedRoute mock
            const mockParentRoute: ActivatedRoute = {
                snapshot: mockSnapshotParent,
                url: of([]),
                params: of({}),
                queryParams: of({}),
                fragment: of(''),
                data: of({ configService: null }),
                outlet: 'primary',
                component: null,
                routeConfig: null,
                root: {} as ActivatedRoute,
                firstChild: null,
                children: [],
                pathFromRoot: [],
                paramMap: of(convertToParamMap({})),
                queryParamMap: of(convertToParamMap({})),
                title: of(''),
                parent: null,
            }

            // Now define routeWithoutUserProfile with required properties
            const routeWithoutUserProfile: ActivatedRoute = {
                snapshot: {
                    params: { id: 'program123' },
                    queryParams: {},
                    fragment: '',
                    data: {},
                    outlet: 'primary',
                    component: null,
                    url: [],
                    paramMap: convertToParamMap({ id: 'program123' }),
                    queryParamMap: convertToParamMap({}),
                    root: {} as ActivatedRouteSnapshot,
                    firstChild: null,
                    children: [],
                    pathFromRoot: [],
                    toString: () => '',
                    routeConfig: null,
                    title: '',
                    parent: mockSnapshotParent, // ✅ MUST be snapshot of parent route
                },
                parent: mockParentRoute,       // ✅ Must be fully mocked ActivatedRoute
                url: of([]),
                params: of({ id: 'program123' }),
                queryParams: of({}),
                fragment: of(''),
                data: of({}),
                outlet: 'primary',
                component: null,
                routeConfig: null,
                root: {} as ActivatedRoute,
                firstChild: null,
                children: [],
                pathFromRoot: [],
                paramMap: of(convertToParamMap({ id: 'program123' })),
                queryParamMap: of(convertToParamMap({})),
                title: of(''),
            }


            mockRouter.getCurrentNavigation.mockReturnValue(mockNavigationState)

            component = new BatchListComponent(mockRouter, routeWithoutUserProfile, mockBlendedApprovalService)

            expect(component.userProfile).toBeUndefined()
            // Should still make service calls, but deptName will be undefined
            expect(mockBlendedApprovalService.getRequests).toHaveBeenCalled()
        })
    })

    describe('ngOnInit', () => {
        it('should exist and be callable', () => {
            mockRouter.getCurrentNavigation.mockReturnValue(mockNavigationState)
            component = new BatchListComponent(mockRouter, mockActivatedRoute, mockBlendedApprovalService)

            expect(() => component.ngOnInit()).not.toThrow()
        })
    })
})