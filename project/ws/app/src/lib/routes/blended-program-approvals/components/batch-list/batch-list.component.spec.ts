
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router'
import { BlendedApporvalService } from '../../services/blended-approval.service'
import { BatchListComponent } from './batch-list.component'
import { of } from 'rxjs'

describe('BatchListComponent', () => {
    let component: BatchListComponent
    let bpService: Partial<BlendedApporvalService>

    const router: Partial<Router> = {
        getCurrentNavigation: jest.fn(),
        navigate: jest.fn(),
    }
    const activeRouter: Partial<ActivatedRoute> = {
        data: of({
            pageData: {
                data: {
                    bulkUploadConfig: {
                        pageSize: 10,
                        pageSizeOptions: [10, 20, 30],
                    },
                },
            },
        }),
        snapshot: {
            data: {
                configService: {
                    userProfile: {
                        rootOrgId: 'sampleRootOrgId',
                        userProfileV2: {
                            email: 'test@example.com',
                            mobile: '1234567890',
                        },
                        orgReadData: {
                            frameworkid: 'sampleFrameworkId',
                        },
                    },
                },
            },
            url: [],
            params: { id: 'do_123' },
            queryParams: {},
            fragment: null,
            outlet: 'primary',
            component: null,
        } as unknown as ActivatedRouteSnapshot,
        parent: {
            snapshot: {
                data: {
                    configService: {
                        unMappedUser: { channel: 'test-org' },
                    },
                },
            },
        } as unknown as ActivatedRoute,
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        outlet: 'primary',
        component: null,
    } as unknown as ActivatedRoute

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
        bpService = {
            getBatchList: jest.fn().mockReturnValue(of({ result: { response: { content: [] } } })),
            getBlendedProgramsDetails: jest.fn().mockReturnValue(of({ result: { content: { name: 'Test Program' } } })),
            getRequests: jest.fn().mockReturnValue(of({ result: { data: [] } })),
            getLearners: jest.fn().mockReturnValue(of([])),
        }
        component = new BatchListComponent(
            router as Router,
            activeRouter as ActivatedRoute,
            bpService as BlendedApporvalService
        )
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    describe('getBPDetails', () => {
        it('should fetch program details and call fetchAndPopulateBatches', () => {
            const mockContent = { name: 'Test Program' }
            ;(bpService.getBlendedProgramsDetails as jest.Mock).mockReturnValue(
                of({ result: { content: mockContent } })
            )
            const fetchSpy = jest.spyOn(component, 'fetchAndPopulateBatches')

            component.getBPDetails('do_123')

            expect(bpService.getBlendedProgramsDetails).toHaveBeenCalledWith('do_123')
            expect(component.programData).toEqual(mockContent)
            expect(component.breadcrumbs).toBeDefined()
            expect(fetchSpy).toHaveBeenCalledWith('do_123')
        })

        it('should not set breadcrumbs if program has no name', () => {
            ;(bpService.getBlendedProgramsDetails as jest.Mock).mockReturnValue(
                of({ result: { content: {} } })
            )

            component.breadcrumbs = undefined
            component.getBPDetails('do_123')

            expect(component.breadcrumbs).toBeUndefined()
        })
    })

    describe('fetchAndPopulateBatches', () => {
        it('should split batches into active and archived by endDate', () => {
            const futureBatch = { batchId: 'b1', courseId: 'do_123', endDate: '2099-12-31' }
            const pastBatch = { batchId: 'b2', courseId: 'do_123', endDate: '2000-01-01' }
            ;(bpService.getBatchList as jest.Mock).mockReturnValue(
                of({ result: { response: { content: [futureBatch, pastBatch] } } })
            )

            component.batchesList = []
            component.arcBatchList = []
            component.fetchAndPopulateBatches('do_123')

            expect(component.batchesList).toContain(futureBatch)
            expect(component.arcBatchList).toContain(pastBatch)
        })

        it('should call getBatchList with correct payload', () => {
            component.fetchAndPopulateBatches('do_123')

            expect(bpService.getBatchList).toHaveBeenCalledWith({
                request: {
                    filters: { courseId: 'do_123' },
                    sort_by: { createdDate: 'desc' },
                    offset: 0,
                    limit: 500,
                },
            })
        })

        it('should handle empty batch list response', () => {
            ;(bpService.getBatchList as jest.Mock).mockReturnValue(
                of({ result: { response: { content: [] } } })
            )

            component.batchesList = []
            component.arcBatchList = []
            component.fetchAndPopulateBatches('do_123')

            expect(component.batchesList.length).toBe(0)
            expect(component.arcBatchList.length).toBe(0)
        })

        it('should set learnersCount to 0 initially and update after getLearners responds', () => {
            const batch: any = { batchId: 'b1', courseId: 'do_123', endDate: '2099-12-31' }
            ;(bpService.getBatchList as jest.Mock).mockReturnValue(
                of({ result: { response: { content: [batch] } } })
            )
            ;(bpService.getLearners as jest.Mock).mockReturnValue(of(['user1', 'user2']))

            component.fetchAndPopulateBatches('do_123')

            expect(batch.learnersCount).toBe(2)
        })

        it('should set newrequestsCount when requests are returned', () => {
            const batch: any = { batchId: 'b1', courseId: 'do_123', endDate: '2099-12-31' }
            ;(bpService.getBatchList as jest.Mock).mockReturnValue(
                of({ result: { response: { content: [batch] } } })
            )
            ;(bpService.getRequests as jest.Mock).mockReturnValue(
                of({ result: { data: [{ id: 'r1' }, { id: 'r2' }] } })
            )

            component.fetchAndPopulateBatches('do_123')

            expect(batch.newrequestsCount).toBe(2)
        })
    })
})
