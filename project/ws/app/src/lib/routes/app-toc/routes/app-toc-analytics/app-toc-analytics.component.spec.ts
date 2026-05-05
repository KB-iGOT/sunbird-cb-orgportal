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
})
