jest.mock('../../services/app-toc.service', () => ({
    AppTocService: class MockAppTocService {
        analyticsFetchStatus = 'none'
        analyticsReplaySubject = new (require('rxjs').Subject)()
        initData = jest.fn().mockReturnValue({ content: null })
        fetchContentAnalyticsData = jest.fn()
        fetchContentAnalyticsClientData = jest.fn()
    },
}))

jest.mock('@ws-widget/collection', () => ({
    NsContent: {},
    ROOT_WIDGET_CONFIG: {
        errorResolver: { _type: 'error', errorResolver: 'errorResolver' },
        graph: { _type: 'graph', graphGeneral: 'graphGeneral' },
    },
    IGraphWidget: {},
    NsError: {},
}), { virtual: true })

jest.mock('@ws-widget/resolver', () => ({
    NsWidgetResolver: {},
}), { virtual: true })

import { AppTocAnalyticsComponent } from './app-toc-analytics.component'
import { AppTocService } from '../../services/app-toc.service'
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'
import { Subject } from 'rxjs'

describe('AppTocAnalyticsComponent', () => {
    let component: AppTocAnalyticsComponent
    let mockConfigService: any
    let mockTocService: jest.Mocked<AppTocService>
    let mockActivatedRoute: Partial<ActivatedRoute>
    let prefChangeNotifier: Subject<void>

    beforeEach(() => {
        prefChangeNotifier = new Subject<void>()

        mockConfigService = {
            prefChangeNotifier,
            activeThemeObject: {
                color: {
                    primary: '#FF0000',
                    accent: '#00FF00'
                }
            }
        } as any

        mockTocService = {
            analyticsFetchStatus: 'none',
            analyticsReplaySubject: new Subject(),
            initData: jest.fn().mockReturnValue({ content: null }),
            fetchContentAnalyticsData: jest.fn(),
            fetchContentAnalyticsClientData: jest.fn()
        } as any

        mockActivatedRoute = {
            snapshot: {
                data: {
                    pageData: {
                        data: {
                            analytics: {
                                courseAnalytics: true,
                                courseAnalyticsClient: false
                            }
                        }
                    }
                },
                url: [],
                params: {},
                queryParams: {},
                fragment: '',
                outlet: '',
                component: '' as any,
                routeConfig: undefined as any,
                root: new ActivatedRouteSnapshot,
                parent: new ActivatedRouteSnapshot,
                firstChild: new ActivatedRouteSnapshot,
                children: [],
                pathFromRoot: [],
                paramMap: undefined as any,
                queryParamMap: undefined as any
            } as any,
            parent: {
                data: new Subject(),
                url: undefined as any,
                params: undefined as any,
                queryParams: undefined as any,
                fragment: undefined as any,
                outlet: '',
                component: '' as any,
                snapshot: new ActivatedRouteSnapshot,
                routeConfig: undefined as any,
                root: new ActivatedRoute,
                parent: new ActivatedRoute,
                firstChild: new ActivatedRoute,
                children: [],
                pathFromRoot: [],
                paramMap: undefined as any,
                queryParamMap: undefined as any,
                title: undefined as any
            } as any
        }

        component = new AppTocAnalyticsComponent(
            mockActivatedRoute as ActivatedRoute,
            mockTocService,
            mockConfigService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should subscribe to prefChangeNotifier', async () => {
            const populateChartDataSpy = jest.spyOn(component as any, 'populateChartData')

            await component.ngOnInit()
            prefChangeNotifier.next()

            expect(populateChartDataSpy).toHaveBeenCalled()
        })

        it('should subscribe to parent route data when available', async () => {
            const initDataSpy = jest.spyOn(component as any, 'initData')
            const mockData = { content: { identifier: '123' } }

            await component.ngOnInit();
            (mockActivatedRoute.parent?.data as Subject<any>).next(mockData)

            expect(initDataSpy).toHaveBeenCalledWith(mockData)
        })
    })

    describe('ngOnDestroy', () => {
        it('should reset analyticsFetchStatus and unsubscribe from subscriptions', () => {
            component.ngOnDestroy()

            expect(mockTocService.analyticsFetchStatus).toBe('none')
        })
    })

    describe('onClose / onCloseClient', () => {
        it('should set isExpandTrue to false on onClose', () => {
            component.isExpandTrue = true
            jest.spyOn(component as any, 'populateChartData').mockImplementation(() => { })
            component.onClose()
            expect(component.isExpandTrue).toBe(false)
        })

        it('should set isExpandTrue to false on onCloseClient', () => {
            component.isExpandTrue = true
            jest.spyOn(component as any, 'chartData').mockImplementation(() => { })
            component.onCloseClient()
            expect(component.isExpandTrue).toBe(false)
        })
    })

    describe('onClick', () => {
        it('should scroll to departments section', () => {
            const mockScrollIntoView = jest.fn()
            document.getElementById = jest.fn().mockReturnValue({
                scrollIntoView: mockScrollIntoView
            })

            component.onClick('departments')

            expect(document.getElementById).toHaveBeenCalledWith('departments')
            expect(mockScrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            })
        })

        it('should scroll to countries section', () => {
            const mockScrollIntoView = jest.fn()
            document.getElementById = jest.fn().mockImplementation((id: string) =>
                id === 'countries' ? { scrollIntoView: mockScrollIntoView } : null
            )
            component.onClick('countries')
            expect(mockScrollIntoView).toHaveBeenCalled()
        })

        it('should scroll to devices section', () => {
            const mockScrollIntoView = jest.fn()
            document.getElementById = jest.fn().mockImplementation((id: string) =>
                id === 'devices' ? { scrollIntoView: mockScrollIntoView } : null
            )
            component.onClick('devices')
            expect(mockScrollIntoView).toHaveBeenCalled()
        })

        it('should not throw when element not found', () => {
            document.getElementById = jest.fn().mockReturnValue(null)
            expect(() => component.onClick('departments')).not.toThrow()
        })
    })

    describe('ngOnInit with content', () => {
        it('should fetch analytics when content exists and courseAnalytics is true', () => {
            const mockContent = { identifier: 'test-id' }
            mockTocService.initData = jest.fn().mockReturnValue({ content: mockContent })

            component.ngOnInit()
                ; (mockActivatedRoute.parent?.data as Subject<any>).next({ content: mockContent })

            expect(mockTocService.fetchContentAnalyticsData).toHaveBeenCalledWith('test-id')
        })

        it('should fetch client analytics when courseAnalyticsClient is true', () => {
            ; (mockActivatedRoute as any).snapshot.data.pageData.data.analytics = {
                courseAnalytics: false,
                courseAnalyticsClient: true,
            }
            component = new AppTocAnalyticsComponent(
                mockActivatedRoute as ActivatedRoute,
                mockTocService,
                mockConfigService
            )
            const mockContent = { identifier: 'client-id' }
            mockTocService.initData = jest.fn().mockReturnValue({ content: mockContent })

            component.ngOnInit()
                ; (mockActivatedRoute.parent?.data as Subject<any>).next({ content: mockContent })

            expect(mockTocService.fetchContentAnalyticsClientData).toHaveBeenCalledWith('client-id')
        })

        it('should set fetchStatus to none when content is null', () => {
            mockTocService.initData = jest.fn().mockReturnValue({ content: null })
            component.ngOnInit()
                ; (mockActivatedRoute.parent?.data as Subject<any>).next({})
            expect(component.fetchStatus).toBe('none')
        })
    })

    describe('onExpand', () => {
        it('should update chart data for expanded view', () => {
            component.analyticsData = {
                participants: {
                    ibu: [
                        {
                            key: 'Unit1',
                            value: [
                                { key: 'Offshore', value: 50 },
                                { key: 'Onsite', value: 30 }
                            ],
                            count: 80
                        }
                    ]
                }
            } as any

            component.onExpand('ibu')

            expect(component.isExpandTrue).toBe(true)
            expect(component.barChartOnExpandData.widgetData.graphData.labels).toContain('Unit1')
        })

        it('should handle empty analyticsData gracefully', () => {
            component.analyticsData = null
            expect(() => component.onExpand('ibu')).not.toThrow()
            expect(component.isExpandTrue).toBe(true)
        })
    })

    describe('onExpandClient', () => {
        it('should set isExpandTrue when analyticsDataClient exists', () => {
            component.analyticsDataClient = {
                department: [{ key: 'Dept1', doc_count: 10, total_hits: 5 }],
            } as any
            component.onExpandClient('department', 'users')
            expect(component.isExpandTrue).toBe(true)
        })

        it('should not change isExpandTrue when analyticsDataClient is null', () => {
            component.analyticsDataClient = null
            component.onExpandClient('department', 'users')
            expect(component.isExpandTrue).toBe(false)
        })

        it('should populate hits type for client data', () => {
            component.analyticsDataClient = {
                department: [{ key: 'Dept1', doc_count: 10, total_hits: 99 }],
            } as any
            component.onExpandClient('department', 'hits')
            expect(component.barChartExpandClientData.widgetData.graphData.datasets[0].data).toContain(99)
        })
    })

    // ── populateChartData ─────────────────────────────────────────────────────
    describe('populateChartData', () => {
        const makeParticipantItem = (key: string, count: number) => ({
            key,
            count,
            value: [
                { key: 'Offshore', value: Math.floor(count / 2) },
                { key: 'Onsite', value: Math.ceil(count / 2) },
            ],
        })

        const fullAnalyticsData = {
            uniqueParticipants: [
                { key: 'iGot', uniqueCount: 42 },
                { key: 'other', uniqueCount: 5 },
            ],
            participants: {
                onsiteOffshoreIndicator: [
                    { key: 'Onsite', count: 20 },
                    { key: 'Offshore', count: 10 },
                    { key: 'NA', count: 3 },
                ],
                ibu: [makeParticipantItem('Unit-A', 50), makeParticipantItem('Unit-B', 30)],
                pu: [makeParticipantItem('PU-1', 20), makeParticipantItem('PU-2', 15)],
                jl: [makeParticipantItem('JL-5', 10), makeParticipantItem('JL-6', 8)],
                location: [makeParticipantItem('Bangalore', 40), makeParticipantItem('Chennai', 20)],
                account: [makeParticipantItem('Acct-1', 25), makeParticipantItem('Acct-2', 12)],
                country: [makeParticipantItem('India', 60), makeParticipantItem('USA', 20)],
                department: [makeParticipantItem('Dept-A', 30)],
            },
            hits: [{ key: 'iGot', count: 100 }],
            avgTime: [{ key: 'iGot', avgTime: 120 }],
            dailyHits: [{ key_as_string: '2023-01-15T00:00:00', doc_count: 5, hits_count: 8 }],
            dailyUsers: [{ key_as_string: '2023-01-15T00:00:00', doc_count: 3, hits_count: 0 }],
        }

        it('should set uniqueUsers when analyticsData is provided', () => {
            component.analyticsData = fullAnalyticsData as any
            component.populateChartData()
            expect(component.uniqueUsers).toBe(42)
        })

        it('should build onsiteOffshoreData chart (excluding NA key)', () => {
            component.analyticsData = fullAnalyticsData as any
            component.populateChartData()
            expect(component.onsiteOffshoreData.widgetData).toBeDefined()
            expect(component.onsiteOffshoreData.widgetData.graphId).toBe('onsiteOffshoreChart')
        })

        it('should build barChartUnitData for ibu participants', () => {
            component.analyticsData = fullAnalyticsData as any
            component.populateChartData()
            expect(component.barChartUnitData.widgetData.graphData.labels).toContain('Unit-A')
        })

        it('should build barChartPuData for pu participants', () => {
            component.analyticsData = fullAnalyticsData as any
            component.populateChartData()
            expect(component.barChartPuData.widgetData.graphData.labels).toContain('PU-1')
        })

        it('should build barChartJLData for jl participants', () => {
            component.analyticsData = fullAnalyticsData as any
            component.populateChartData()
            expect(component.barChartJLData.widgetData.graphData.labels).toContain('JL-5')
        })

        it('should build barChartLocationData for location participants', () => {
            component.analyticsData = fullAnalyticsData as any
            component.populateChartData()
            expect(component.barChartLocationData.widgetData.graphData.labels).toContain('Bangalore')
        })

        it('should build barChartAccountData for account participants', () => {
            component.analyticsData = fullAnalyticsData as any
            component.populateChartData()
            expect(component.barChartAccountData.widgetData.graphData.labels).toContain('Acct-1')
        })

        it('should not throw when analyticsData is null', () => {
            component.analyticsData = null
            expect(() => component.populateChartData()).not.toThrow()
        })

        it('should use activeThemeObject colors when available', () => {
            component.analyticsData = fullAnalyticsData as any
            mockConfigService.activeThemeObject = { color: { primary: '#123456', accent: '#654321' } }
            component.populateChartData()
            const datasets = component.barChartUnitData.widgetData.graphData.datasets as any[]
            expect(datasets[0].backgroundColor).toBe('#123456')
        })

        it('should use empty string colors when activeThemeObject is null', () => {
            component.analyticsData = fullAnalyticsData as any
            mockConfigService.activeThemeObject = null
            component.populateChartData()
            const datasets = component.barChartUnitData.widgetData.graphData.datasets as any[]
            expect(datasets[0].backgroundColor).toBe('')
        })
    })

    // ── chartData ────────────────────────────────────────────────────────────
    describe('chartData', () => {
        const makeChartItem = (key: string, doc_count: number, total_hits = 0) => ({
            key,
            doc_count,
            total_hits,
        })

        const fullClientData = {
            userCount: 200,
            hits: 500,
            avg_time_spent: 3600,
            department: [
                makeChartItem('Dept-A', 30, 45),
                makeChartItem('Dept-B', 20, 35),
            ],
            country: [
                makeChartItem('India', 100, 150),
                makeChartItem('USA', 50, 75),
            ],
            day_wise_users: [
                { key_as_string: '2023-03-15T00:00:00', doc_count: 10, hits_count: 20 },
                { key_as_string: '2023-03-16T00:00:00', doc_count: 8, hits_count: 16 },
            ],
            device: [
                { key: 'Desktop', doc_count: 120, total_hits: 200 },
                { key: 'Mobile', doc_count: 80, total_hits: 300 },
            ],
            designation: [makeChartItem('Engineer', 70)],
            learningMode: [makeChartItem('Online', 90)],
        }

        it('should set uniqueUsers, hits and avgTimeSpent from analyticsDataClient', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.uniqueUsers).toBe(200)
            expect(component.hits).toBe(500)
            expect(component.avgTimeSpent).toBe(60)
        })

        it('should build barChartDeptData with department keys', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.barChartDeptData.widgetData.graphData.labels).toContain('Dept-A')
        })

        it('should build barChartCountryData with country keys', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.barChartCountryData.widgetData.graphData.labels).toContain('India')
        })

        it('should build daily users chart from day_wise_users', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.barChartDailyUsersData.widgetData.graphData.datasets[0].data).toEqual([10, 8])
        })

        it('should build daily hits chart from day_wise_users hits_count', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.barChartDailyHitsData.widgetData.graphData.datasets[0].data).toEqual([20, 16])
        })

        it('should build device pie chart data', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.pieChartDeviceData.widgetData.graphId).toBe('deviceChart')
        })

        it('should build device hits pie chart', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.pieChartDeviceHitsData.widgetData.graphId).toBe('deviceHitsChart')
        })

        it('should build dept hits bar chart', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.barChartDeptHitsData.widgetData.graphData.labels).toContain('Dept-A')
        })

        it('should build country hits bar chart', () => {
            component.analyticsDataClient = fullClientData as any
            component.chartData()
            expect(component.barChartCountryHitsData.widgetData.graphData.labels).toContain('India')
        })

        it('should not throw when analyticsDataClient is null', () => {
            component.analyticsDataClient = null
            expect(() => component.chartData()).not.toThrow()
        })
    })

    // ── subscription success/error paths ─────────────────────────────────────
    describe('initData subscription paths', () => {
        it('should set fetchStatus to done and call populateChartData on analytics success', () => {
            const populateSpy = jest.spyOn(component, 'populateChartData').mockImplementation(() => { })
            mockTocService.initData = jest.fn().mockReturnValue({ content: { identifier: 'x' } })
            component.ngOnInit()
                ; (mockActivatedRoute.parent?.data as Subject<any>).next({})
                ; (mockTocService as any).analyticsReplaySubject.next({
                    uniqueParticipants: [],
                    participants: { onsiteOffshoreIndicator: [], ibu: [], pu: [], jl: [], location: [], account: [] },
                })
            expect(component.fetchStatus).toBe('done')
            expect(populateSpy).toHaveBeenCalled()
        })

        it('should set fetchStatus to error on analytics error', () => {
            jest.spyOn(component, 'populateChartData').mockImplementation(() => { })
            mockTocService.initData = jest.fn().mockReturnValue({ content: { identifier: 'x' } })
            component.ngOnInit()
                ; (mockActivatedRoute.parent?.data as Subject<any>).next({})
                ; (mockTocService as any).analyticsReplaySubject.error(new Error('fail'))
            expect(component.fetchStatus).toBe('error')
            expect(component.analyticsData).toBeNull()
        })

        it('should set fetchStatus to done and call chartData on client analytics success', () => {
            ; (mockActivatedRoute as any).snapshot.data.pageData.data.analytics = {
                courseAnalytics: false,
                courseAnalyticsClient: true,
            }
            component = new AppTocAnalyticsComponent(
                mockActivatedRoute as ActivatedRoute,
                mockTocService,
                mockConfigService,
            )
            const chartDataSpy = jest.spyOn(component, 'chartData').mockImplementation(() => { })
            mockTocService.initData = jest.fn().mockReturnValue({ content: { identifier: 'y' } })
            component.ngOnInit()
                ; (mockActivatedRoute.parent?.data as Subject<any>).next({})
                ; (mockTocService as any).analyticsReplaySubject.next({ department: [], country: [], day_wise_users: [], device: [] })
            expect(component.fetchStatus).toBe('done')
            expect(chartDataSpy).toHaveBeenCalled()
        })

        it('should set fetchStatus to error on client analytics error', () => {
            ; (mockActivatedRoute as any).snapshot.data.pageData.data.analytics = {
                courseAnalytics: false,
                courseAnalyticsClient: true,
            }
            component = new AppTocAnalyticsComponent(
                mockActivatedRoute as ActivatedRoute,
                mockTocService,
                mockConfigService,
            )
            jest.spyOn(component, 'chartData').mockImplementation(() => { })
            mockTocService.initData = jest.fn().mockReturnValue({ content: { identifier: 'y' } })
            component.ngOnInit()
                ; (mockActivatedRoute.parent?.data as Subject<any>).next({})
                ; (mockTocService as any).analyticsReplaySubject.error(new Error('fail'))
            expect(component.fetchStatus).toBe('error')
            expect(component.analyticsDataClient).toBeNull()
        })
    })
})
