import { AppTocAnalyticsComponent } from './app-toc-analytics.component'
import { ConfigurationsService } from '@ws-widget/utils'
import { AppTocService } from '../../services/app-toc.service'
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'
import { Subject } from 'rxjs'

describe('AppTocAnalyticsComponent', () => {
    let component: AppTocAnalyticsComponent
    let mockConfigService: jest.Mocked<ConfigurationsService>
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
            initData: jest.fn(),
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
                component: '',
                routeConfig: undefined,
                root: new ActivatedRouteSnapshot,
                parent: new ActivatedRouteSnapshot,
                firstChild: new ActivatedRouteSnapshot,
                children: [],
                pathFromRoot: [],
                paramMap: undefined,
                queryParamMap: undefined
            },
            parent: {
                data: new Subject(),
                url: undefined,
                params: undefined,
                queryParams: undefined,
                fragment: undefined,
                outlet: '',
                component: '',
                snapshot: new ActivatedRouteSnapshot,
                routeConfig: undefined,
                root: new ActivatedRoute,
                parent: new ActivatedRoute,
                firstChild: new ActivatedRoute,
                children: [],
                pathFromRoot: [],
                paramMap: undefined,
                queryParamMap: undefined
            }
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
                block: 'start'
            })
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
    })
})
