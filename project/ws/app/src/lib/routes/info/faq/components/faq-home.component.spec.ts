import { BehaviorSubject } from 'rxjs'
import { ParamMap } from '@angular/router'

import { FaqHomeComponent } from './faq-home.component'
import { EFeatures, NsPage } from '@sunbird-cb/utils'
import { IFAQ } from '../faq.model'

// Mock classes
class MockValueService {
    private isLtMediumSubject = new BehaviorSubject<boolean>(false);
    isLtMedium$ = this.isLtMediumSubject.asObservable();

    setIsLtMedium(value: boolean) {
        this.isLtMediumSubject.next(value)
    }
}

class MockConfigurationsService {
    pageNavBar: Partial<NsPage.INavBackground> = {
        styles: {
            backgroundColor: '#1976d2',
            borderBottom: '2px solid #1565c0',
            padding: '10px',
            fontSize: '16px',
        },
        color: 'primary'
    };
    restrictedFeatures: Set<EFeatures> | null = null;

    setRestrictedFeatures(features: Set<EFeatures> | null) {
        this.restrictedFeatures = features
    }
}

class MockActivatedRoute {
    private dataSubject = new BehaviorSubject<any>({});
    private queryParamMapSubject = new BehaviorSubject<ParamMap>(new MockParamMap());

    data = this.dataSubject.asObservable();
    queryParamMap = this.queryParamMapSubject.asObservable();

    setData(data: any) {
        this.dataSubject.next(data)
    }

    setQueryParamMap(paramMap: ParamMap) {
        this.queryParamMapSubject.next(paramMap)
    }
}

class MockParamMap implements ParamMap {
    private params: { [key: string]: string } = {};

    constructor(params: { [key: string]: string } = {}) {
        this.params = params
    }

    get keys(): string[] {
        return Object.keys(this.params)
    }

    get(name: string): string | null {
        return this.params[name] || null
    }

    getAll(name: string): string[] {
        const value = this.params[name]
        return value ? [value] : []
    }

    has(name: string): boolean {
        return name in this.params
    }
}

describe('FaqHomeComponent', () => {
    let component: FaqHomeComponent
    let mockRoute: MockActivatedRoute
    let mockValueSvc: MockValueService
    let mockConfigSvc: MockConfigurationsService

    const mockFaqConfigs: IFAQ[] = [
        {
            groupKey: 'general',
            groupShortName: 'TEST',
            groupName: 'General',
            contents: [
                {
                    heading: 'What is your return policy?',
                    value: 'You can return any item within 30 days of purchase with a valid receipt.'
                },
                {
                    heading: 'Do you offer international shipping?',
                    value: 'Yes, we ship to over 50 countries worldwide. Shipping rates apply.'
                },
                {
                    heading: 'How can I track my order?',
                    value: 'Once your order is shipped, we will email you a tracking link.'
                }
            ]
        },

    ]

    const mockRouteData = {
        pageData: {
            data: mockFaqConfigs
        }
    }

    beforeEach(() => {
        mockRoute = new MockActivatedRoute()
        mockValueSvc = new MockValueService()
        mockConfigSvc = new MockConfigurationsService()

        component = new FaqHomeComponent(
            mockRoute as any,
            mockValueSvc as any,
            mockConfigSvc as any
        )
    })

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize with default values', () => {
            expect(component.errorMessageCode).toBe('NONE')
            expect(component.sideNavBarOpened).toBe(true)
            expect(component.pageNavbar).toEqual(mockConfigSvc.pageNavBar)
            expect(component.isFaqFeature).toBe(true)
            expect(component.isLtMedium$).toBe(mockValueSvc.isLtMedium$)
            expect(component.screenSizeIsLtMedium).toBe(false)
            expect(component.selectedTabData).toBeNull()
            expect(component.selectedTabIndex).toBe(0)
            expect(component.faqConfigs).toBeNull()
        })

        it('should initialize mode$ observable correctly', (done) => {
            // Test when isLtMedium is false
            component.mode$.subscribe(mode => {
                expect(mode).toBe('side')
                done()
            })
        })

        it('should return "over" mode when isLtMedium is true', (done) => {
            mockValueSvc.setIsLtMedium(true)

            component.mode$.subscribe(mode => {
                expect(mode).toBe('over')
                done()
            })
        })
    })

    describe('ngOnInit', () => {
        it('should subscribe to route data and set faqConfigs with selectedTabData', () => {
            mockRoute.setData(mockRouteData)

            component.ngOnInit()

            expect(component.faqConfigs).toEqual(mockFaqConfigs)
            expect(component.selectedTabData).toEqual(mockFaqConfigs[0].contents)
            expect(component.selectedTabIndex).toBe(0)
        })

        it('should handle route data without faqConfigs', () => {
            const emptyRouteData = { pageData: { data: null } }
            mockRoute.setData(emptyRouteData)

            component.ngOnInit()

            expect(component.faqConfigs).toBeNull()
            expect(component.selectedTabData).toBeNull()
            expect(component.selectedTabIndex).toBe(0)
        })

        it('should handle empty faqConfigs array', () => {
            const emptyFaqData = { pageData: { data: [] } }
            mockRoute.setData(emptyFaqData)

            component.ngOnInit()

            expect(component.faqConfigs).toEqual([])
            expect(component.selectedTabData).toBeNull()
        })

        it('should subscribe to queryParamMap and set active tab', () => {
            component.faqConfigs = mockFaqConfigs
            const paramMap = new MockParamMap({ tab: 'technical' })

            component.ngOnInit()
            mockRoute.setQueryParamMap(paramMap)

            expect(component.selectedTabIndex).toBe(1)
            expect(component.selectedTabData).toEqual(mockFaqConfigs[1].contents)
        })

        it('should handle queryParamMap with non-existent tab', () => {
            component.faqConfigs = mockFaqConfigs
            const paramMap = new MockParamMap({ tab: 'nonexistent' })

            component.ngOnInit()
            mockRoute.setQueryParamMap(paramMap)

            // Should remain at default values
            expect(component.selectedTabIndex).toBe(0)
            expect(component.selectedTabData).toEqual(mockFaqConfigs[0].contents)
        })

        it('should handle queryParamMap with empty tab parameter', () => {
            component.faqConfigs = mockFaqConfigs
            const paramMap = new MockParamMap({})

            component.ngOnInit()
            mockRoute.setQueryParamMap(paramMap)

            // Should remain at default values
            expect(component.selectedTabIndex).toBe(0)
        })

        it('should handle queryParamMap when faqConfigs is null', () => {
            component.faqConfigs = null
            const paramMap = new MockParamMap({ tab: 'technical' })

            component.ngOnInit()
            mockRoute.setQueryParamMap(paramMap)

            // Should not throw error and remain at default
            expect(component.selectedTabIndex).toBe(0)
            expect(component.selectedTabData).toBeNull()
        })

        it('should set isFaqFeature to true when restrictedFeatures is null', () => {
            mockConfigSvc.setRestrictedFeatures(null)

            component.ngOnInit()

            expect(component.isFaqFeature).toBe(true)
        })

        it('should set isFaqFeature to false when FAQ feature is restricted', () => {
            const restrictedFeatures = new Set([EFeatures.FAQ])
            mockConfigSvc.setRestrictedFeatures(restrictedFeatures)

            component.ngOnInit()

            expect(component.isFaqFeature).toBe(false)
        })

        it('should set isFaqFeature to true when FAQ feature is not restricted', () => {
            const restrictedFeatures = new Set([EFeatures.NAVIGATOR])
            mockConfigSvc.setRestrictedFeatures(restrictedFeatures)

            component.ngOnInit()

            expect(component.isFaqFeature).toBe(true)
        })

        it('should subscribe to isLtMedium$ and set sideNavBarOpened and screenSizeIsLtMedium', () => {
            mockValueSvc.setIsLtMedium(true)

            component.ngOnInit()

            expect(component.sideNavBarOpened).toBe(false)
            expect(component.screenSizeIsLtMedium).toBe(true)
        })

        it('should set sideNavBarOpened to true when screen is not small', () => {
            mockValueSvc.setIsLtMedium(false)

            component.ngOnInit()

            expect(component.sideNavBarOpened).toBe(true)
            expect(component.screenSizeIsLtMedium).toBe(false)
        })

        it('should handle combined route data and query params correctly', () => {
            mockRoute.setData(mockRouteData)
            const paramMap = new MockParamMap({ tab: 'technical' })

            component.ngOnInit()
            mockRoute.setQueryParamMap(paramMap)

            expect(component.faqConfigs).toEqual(mockFaqConfigs)
            expect(component.selectedTabIndex).toBe(1)
            expect(component.selectedTabData).toEqual(mockFaqConfigs[1].contents)
        })
    })

    describe('ngOnDestroy', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should unsubscribe from all subscriptions when they exist', () => {
            const subscriptionFAQSpy = jasmine.createSpy('unsubscribe')
            const subscriptionActiveFAQSpy = jasmine.createSpy('unsubscribe')
            const defaultSideNavBarSpy = jasmine.createSpy('unsubscribe');

            // Access private properties using bracket notation
            (component as any).subscriptionFAQ = { unsubscribe: subscriptionFAQSpy };
            (component as any).subscriptionActiveFAQ = { unsubscribe: subscriptionActiveFAQSpy };
            (component as any).defaultSideNavBarOpenedSubscription = { unsubscribe: defaultSideNavBarSpy }

            component.ngOnDestroy()

            expect(subscriptionFAQSpy).toHaveBeenCalled()
            expect(subscriptionActiveFAQSpy).toHaveBeenCalled()
            expect(defaultSideNavBarSpy).toHaveBeenCalled()
        })

        it('should handle null subscriptions without error', () => {
            (component as any).subscriptionFAQ = null;
            (component as any).subscriptionActiveFAQ = null;
            (component as any).defaultSideNavBarOpenedSubscription = null

            expect(() => component.ngOnDestroy()).not.toThrow()
        })

        it('should handle undefined subscriptions without error', () => {
            (component as any).subscriptionFAQ = undefined;
            (component as any).subscriptionActiveFAQ = undefined;
            (component as any).defaultSideNavBarOpenedSubscription = undefined

            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('sideNavOnClick', () => {
        beforeEach(() => {
            component.faqConfigs = mockFaqConfigs
        })

        it('should set selectedTabData and selectedTabIndex when faqConfigs exists', () => {
            const index = 1

            component.sideNavOnClick(index)

            expect(component.selectedTabData).toEqual(mockFaqConfigs[index].contents)
            expect(component.selectedTabIndex).toBe(index)
        })

        it('should not set data when faqConfigs is null', () => {
            component.faqConfigs = null
            const originalTabData = component.selectedTabData
            const originalTabIndex = component.selectedTabIndex

            component.sideNavOnClick(1)

            expect(component.selectedTabData).toBe(originalTabData)
            expect(component.selectedTabIndex).toBe(originalTabIndex)
        })

        it('should toggle sideNavBarOpened when screen is small', () => {
            component.screenSizeIsLtMedium = true
            component.sideNavBarOpened = true

            component.sideNavOnClick(0)

            expect(component.sideNavBarOpened).toBe(false)
        })

        it('should not toggle sideNavBarOpened when screen is large', () => {
            component.screenSizeIsLtMedium = false
            component.sideNavBarOpened = true

            component.sideNavOnClick(0)

            expect(component.sideNavBarOpened).toBe(true)
        })

        it('should handle index 0 correctly', () => {
            component.sideNavOnClick(0)

            expect(component.selectedTabData).toEqual(mockFaqConfigs[0].contents)
            expect(component.selectedTabIndex).toBe(0)
        })

        it('should handle last index correctly', () => {
            const lastIndex = mockFaqConfigs.length - 1

            component.sideNavOnClick(lastIndex)

            expect(component.selectedTabData).toEqual(mockFaqConfigs[lastIndex].contents)
            expect(component.selectedTabIndex).toBe(lastIndex)
        })

        it('should handle both conditions together', () => {
            component.screenSizeIsLtMedium = true
            component.sideNavBarOpened = false

            component.sideNavOnClick(1)

            expect(component.selectedTabData).toEqual(mockFaqConfigs[1].contents)
            expect(component.selectedTabIndex).toBe(1)
            expect(component.sideNavBarOpened).toBe(true)
        })
    })

    describe('Observable Streams', () => {
        it('should handle mode$ observable changes', (done) => {
            let callCount = 0
            const expectedValues = ['side', 'over']

            component.mode$.subscribe(mode => {
                expect(mode).toBe(expectedValues[callCount])
                callCount++

                if (callCount === 1) {
                    // Change isLtMedium to trigger second emission
                    mockValueSvc.setIsLtMedium(true)
                } else if (callCount === 2) {
                    done()
                }
            })
        })

        it('should properly initialize isLtMedium$ reference', () => {
            expect(component.isLtMedium$).toBe(mockValueSvc.isLtMedium$)
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty faqConfigs array in sideNavOnClick', () => {
            component.faqConfigs = []

            expect(() => component.sideNavOnClick(0)).not.toThrow()
        })

        it('should handle out of bounds index in sideNavOnClick', () => {
            component.faqConfigs = mockFaqConfigs

            expect(() => component.sideNavOnClick(999)).toThrow()
        })

        it('should handle negative index in sideNavOnClick', () => {
            component.faqConfigs = mockFaqConfigs

            expect(() => component.sideNavOnClick(-1)).toThrow()
        })

        it('should maintain state consistency during multiple operations', () => {
            // Initialize with route data
            mockRoute.setData(mockRouteData)
            component.ngOnInit()

            // Change via query param
            const paramMap = new MockParamMap({ tab: 'technical' })
            mockRoute.setQueryParamMap(paramMap)

            // Change via sideNavOnClick
            component.sideNavOnClick(0)

            expect(component.selectedTabIndex).toBe(0)
            expect(component.selectedTabData).toEqual(mockFaqConfigs[0].contents)
        })

        it('should handle rapid successive calls to sideNavOnClick', () => {
            component.faqConfigs = mockFaqConfigs

            component.sideNavOnClick(0)
            component.sideNavOnClick(1)
            component.sideNavOnClick(0)

            expect(component.selectedTabIndex).toBe(0)
            expect(component.selectedTabData).toEqual(mockFaqConfigs[0].contents)
        })
    })

    describe('Property Assignments', () => {
        it('should correctly assign pageNavbar from configSvc', () => {
            const customNavBar = { background: 'secondary', color: 'black' }
            // mockConfigSvc.pageNavBar = customNavBar

            const newComponent = new FaqHomeComponent(
                mockRoute as any,
                mockValueSvc as any,
                mockConfigSvc as any
            )

            expect(newComponent.pageNavbar).toEqual(customNavBar)
        })

        it('should maintain errorMessageCode type safety', () => {
            component.errorMessageCode = 'API_FAILURE'
            expect(component.errorMessageCode).toBe('API_FAILURE')

            component.errorMessageCode = 'NO_DATA'
            expect(component.errorMessageCode).toBe('NO_DATA')

            component.errorMessageCode = 'INVALID_DATA'
            expect(component.errorMessageCode).toBe('INVALID_DATA')

            component.errorMessageCode = 'NONE'
            expect(component.errorMessageCode).toBe('NONE')
        })
    })
})