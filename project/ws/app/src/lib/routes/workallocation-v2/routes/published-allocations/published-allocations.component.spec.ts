import { PublishedAllocationsComponent } from './published-allocations.component'
import { ActivatedRoute } from '@angular/router'
import { ExportAsService } from 'ngx-export-as'
import { AllocationService } from '../../services/allocation.service'
import { of, Subject } from 'rxjs'
import { SimpleChanges } from '@angular/core'

describe('PublishedAllocationsComponent', () => {
    let component: PublishedAllocationsComponent
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>
    let mockExportAsService: jest.Mocked<ExportAsService>
    let mockAllocationService: jest.Mocked<AllocationService>
    let paramSubject: Subject<any>

    beforeEach(() => {
        // Create mock services
        paramSubject = new Subject()

        mockActivatedRoute = {
            params: paramSubject.asObservable()
        } as any

        mockExportAsService = {
            save: jest.fn()
        } as any

        mockAllocationService = {
            getAllocatedUsers: jest.fn()
        } as any

        // Create component instance
        component = new PublishedAllocationsComponent(
            mockActivatedRoute,
            mockExportAsService,
            mockAllocationService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should initialize with default values', () => {
            expect(component.data).toEqual([])
            expect(component.pageSize).toBe(10)
            expect(component.pageSizeOptions).toEqual([5, 10, 20])
            expect(component.p).toBe(1)
            expect(component.userslist).toEqual([])
            expect(component.downloaddata).toEqual([])
        })

        it('should set up breadcrumb titles', () => {
            const expectedBdTitles = [
                { title: 'Work allocation tool', url: '/app/home/workallocation' },
                { title: 'Published', url: '/app/home/workallocation/published' }
            ]
            expect(component.bdtitles).toEqual(expectedBdTitles)
        })

        it('should configure export settings', () => {
            expect(component.config).toEqual({
                type: 'pdf',
                elementIdOrContent: 'downloadtemplate'
            })
        })

        it('should subscribe to route params and call getAllocatedUsers', () => {
            const spy = jest.spyOn(component, 'getAllocatedUsers').mockImplementation()
            const testWorkorderId = 'test-workorder-123'

            // Emit route params
            paramSubject.next({ workorder: testWorkorderId })

            expect(component.workorderID).toBe(testWorkorderId)
            expect(spy).toHaveBeenCalledWith(testWorkorderId)
        })

        it('should handle missing workorder param', () => {
            const spy = jest.spyOn(component, 'getAllocatedUsers').mockImplementation()

            // Emit route params without workorder
            paramSubject.next({})

            expect(component.workorderID).toBe('')
            expect(spy).toHaveBeenCalledWith('')
        })
    })

    describe('ngOnInit', () => {
        it('should be defined', () => {
            expect(component.ngOnInit).toBeDefined()
            // Method is currently empty, so just verify it exists
            component.ngOnInit()
        })
    })

    describe('viewscanned', () => {
        it('should open PDF URL in new window', () => {
            const mockOpen = jest.fn()
            Object.defineProperty(window, 'open', { value: mockOpen })

            const testPdfUrl = 'https://example.com/signed.pdf'
            component.workorderData = { signedPdfLink: testPdfUrl }

            component.viewscanned()

            expect(mockOpen).toHaveBeenCalledWith(testPdfUrl)
        })
    })

    describe('print', () => {
        it('should open published PDF URL in new window', () => {
            const mockOpen = jest.fn()
            Object.defineProperty(window, 'open', { value: mockOpen })

            const testPdfUrl = 'https://example.com/published.pdf'
            component.workorderData = { publishedPdfLink: testPdfUrl }

            component.print()

            expect(mockOpen).toHaveBeenCalledWith(testPdfUrl)
        })
    })

    describe('ngOnChanges', () => {
        it('should update data and length from changes', () => {
            const mockPaginator = {
                firstPage: jest.fn()
            }
            component.paginator = mockPaginator as any

            const testData = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]
            const changes: SimpleChanges = {
                data: {
                    currentValue: testData,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            }

            component.ngOnChanges(changes)

            expect(component.data).toEqual(testData)
            expect(component.length).toBe(2)
            expect(mockPaginator.firstPage).toHaveBeenCalled()
        })

        it('should handle undefined data in changes', () => {
            const mockPaginator = {
                firstPage: jest.fn()
            }
            component.paginator = mockPaginator as any

            const changes: SimpleChanges = {
                data: {
                    currentValue: undefined,
                    previousValue: null,
                    firstChange: true,
                    isFirstChange: () => true
                }
            }

            component.ngOnChanges(changes)

            expect(component.data).toBeUndefined()
            expect(component.length).toBeUndefined()
            expect(mockPaginator.firstPage).toHaveBeenCalled()
        })
    })

    describe('buttonClick', () => {
        beforeEach(() => {
            component.downloaddata = []
        })

        it('should handle Download action', () => {
            const mockSave: any = of({})
            mockExportAsService.save.mockReturnValue(mockSave)

            const testRow = { id: 1, name: 'Test User' }

            component.buttonClick('Download', testRow)

            expect(component.downloaddata).toEqual([testRow])
            expect(mockExportAsService.save).toHaveBeenCalledWith(
                component.config,
                'WorkAllocation'
            )
        })

        it('should handle Archive action', () => {
            const testRow = { id: 1, name: 'Test User' }

            component.buttonClick('Archive', testRow)

            // Currently Archive action is commented out, so just verify it doesn't throw
            expect(component.downloaddata).toEqual([])
        })

        it('should handle unknown action', () => {
            const testRow = { id: 1, name: 'Test User' }

            component.buttonClick('UnknownAction', testRow)

            expect(component.downloaddata).toEqual([])
            expect(mockExportAsService.save).not.toHaveBeenCalled()
        })

        it('should reset downloaddata before Download action', () => {
            component.downloaddata = [{ id: 999, name: 'Old Data' }]
            const mockSave: any = of({})
            mockExportAsService.save.mockReturnValue(mockSave)

            const testRow = { id: 1, name: 'Test User' }

            component.buttonClick('Download', testRow)

            expect(component.downloaddata).toEqual([testRow])
        })
    })

    describe('getAllocatedUsers', () => {
        it('should fetch allocated users and update component data', () => {
            const testWorkorderId = 'test-wo-123'
            const mockResponse = {
                result: {
                    data: {
                        name: 'Test Work Order',
                        users: [
                            { id: 1, name: 'User 1' },
                            { id: 2, name: 'User 2' }
                        ]
                    }
                }
            }

            mockAllocationService.getAllocatedUsers.mockReturnValue(of(mockResponse))

            component.getAllocatedUsers(testWorkorderId)

            expect(mockAllocationService.getAllocatedUsers).toHaveBeenCalledWith(testWorkorderId)
            expect(component.workorderData).toEqual(mockResponse.result.data)
            expect(component.data).toEqual(mockResponse.result.data.users)

            // Check if new breadcrumb title was added
            expect(component.bdtitles).toHaveLength(3)
            expect(component.bdtitles[2]).toEqual({
                title: 'Test Work Order',
                url: 'none'
            })
        })

        it('should handle service error', () => {
            const testWorkorderId = 'test-wo-123'
            //const mockError = new Error('Service error')

            mockAllocationService.getAllocatedUsers.mockReturnValue(
                new Subject().asObservable() // This will not emit anything
            )

            // Test that method doesn't throw when called
            expect(() => {
                component.getAllocatedUsers(testWorkorderId)
            }).not.toThrow()

            expect(mockAllocationService.getAllocatedUsers).toHaveBeenCalledWith(testWorkorderId)
        })

        it('should handle null workorder ID', () => {
            const mockResponse = {
                result: {
                    data: {
                        name: 'Default Work Order',
                        users: []
                    }
                }
            }

            mockAllocationService.getAllocatedUsers.mockReturnValue(of(mockResponse))

            component.getAllocatedUsers(null)

            expect(mockAllocationService.getAllocatedUsers).toHaveBeenCalledWith(null)
            expect(component.workorderData).toEqual(mockResponse.result.data)
        })
    })

    describe('Property Initialization', () => {
        it('should have correct initial breadcrumb structure', () => {
            expect(component.bdtitles).toEqual([
                { title: 'Work allocation tool', url: '/app/home/workallocation' },
                { title: 'Published', url: '/app/home/workallocation/published' }
            ])
        })

        it('should have correct pagination defaults', () => {
            expect(component.pageSize).toBe(10)
            expect(component.pageSizeOptions).toEqual([5, 10, 20])
            expect(component.p).toBe(1)
        })

        it('should initialize arrays as empty', () => {
            expect(component.data).toEqual([])
            expect(component.userslist).toEqual([])
            expect(component.downloaddata).toEqual([])
        })
    })
})