import { of } from 'rxjs'
import { SearchRootComponent } from './search-root.component'

// ─── Mock Dependencies ────────────────────────────────────────────────────────

const mockSearchTabs = {
    tabs: [{ title: 'Learning' }, { title: 'Social' }],
    routeValue: ['learning', 'social'],
    placeHolder: { learning: 'Search learning...', social: 'Search social...' },
    social: {
        qanda: {
            latest: { dtLastModified: 'desc' },
            trending: { upVoteCount: 'desc' },
        },
    },
}

const mockConfigSvc = {
    pageNavBar: { background: 'primary' },
}

const mockUrlTree = {
    root: {
        children: {
            primary: {
                segments: [
                    { path: 'app' },
                    { path: 'search' },
                    { path: 'learning' },
                ],
            },
        },
    },
}

const mockRouter = {
    navigateByUrl: jest.fn(),
    parseUrl: jest.fn().mockReturnValue(mockUrlTree),
    url: '/app/search/learning',
}

const mockQueryParamMap = {
    has: jest.fn().mockReturnValue(true),
    get: jest.fn().mockReturnValue('angular'),
}

const mockActivatedRoute = {
    snapshot: {
        data: {
            searchPageData: {
                data: {
                    search: mockSearchTabs,
                },
            },
        },
    },
    queryParamMap: of(mockQueryParamMap),
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('SearchRootComponent', () => {
    let component: SearchRootComponent

    beforeEach(() => {
        jest.clearAllMocks()

        // Reset mocks to default values
        mockRouter.parseUrl.mockReturnValue(mockUrlTree)
        mockRouter.url = '/app/search/learning'
        mockQueryParamMap.has.mockReturnValue(true)
        mockQueryParamMap.get.mockReturnValue('angular')

        component = new SearchRootComponent(
            mockRouter as any,
            mockActivatedRoute as any,
            mockConfigSvc as any,
        )
    })

    // ─── Constructor ────────────────────────────────────────────────────────

    describe('Constructor', () => {
        it('should create an instance of the component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize searchTabs with default empty values', () => {
            expect(component.searchTabs).toEqual({
                tabs: [],
                routeValue: [],
                placeHolder: {},
                social: {},
            })
        })

        it('should initialize route to "learning"', () => {
            expect(component.route).toBe('learning')
        })

        it('should initialize searchRequest with empty defaults', () => {
            expect(component.searchRequest).toEqual({
                query: '',
                filters: {},
                social: '',
                sort: '',
            })
        })

        it('should initialize selectedIndex to 0', () => {
            expect(component.selectedIndex).toBe(0)
        })

        it('should assign pageNavbar from configSvc.pageNavBar', () => {
            expect(component.pageNavbar).toEqual(mockConfigSvc.pageNavBar)
        })
    })

    // ─── ngOnInit ──────────────────────────────────────────────────────────

    describe('ngOnInit', () => {
        it('should set searchTabs when searchPageData.data.search is present', () => {
            component.ngOnInit()
            expect(component.searchTabs).toEqual(mockSearchTabs)
        })

        it('should NOT override searchTabs when search data is absent', () => {
            const routeWithoutSearch = {
                snapshot: {
                    data: {
                        searchPageData: {
                            data: {},
                        },
                    },
                },
                queryParamMap: of(mockQueryParamMap),
            }

            const comp = new SearchRootComponent(
                mockRouter as any,
                routeWithoutSearch as any,
                mockConfigSvc as any,
            )
            comp.ngOnInit()

            // remains default
            expect(comp.searchTabs).toEqual({
                tabs: [],
                routeValue: [],
                placeHolder: {},
                social: {},
            })
        })

        it('should set searchRequest.query from queryParam "q"', () => {
            mockQueryParamMap.has.mockReturnValue(true)
            mockQueryParamMap.get.mockReturnValue('angular')

            component.ngOnInit()

            expect(component.searchRequest.query).toBe('angular')
        })

        it('should set searchRequest.query to empty string when queryParam "q" returns null', () => {
            mockQueryParamMap.has.mockReturnValue(true)
            mockQueryParamMap.get.mockReturnValue(null)

            component.ngOnInit()

            expect(component.searchRequest.query).toBe('')
        })

        it('should NOT update searchRequest.query when queryParam does not have "q"', () => {
            mockQueryParamMap.has.mockReturnValue(false)
            component.searchRequest.query = 'preserved'

            component.ngOnInit()

            expect(component.searchRequest.query).toBe('preserved')
        })

        it('should parse the current router URL and extract the last segment as route', () => {
            component.ngOnInit()
            expect(mockRouter.parseUrl).toHaveBeenCalledWith(mockRouter.url)
            expect(component.route).toBe('learning')
        })

        it('should set selectedIndex based on routeValue indexOf the current route', () => {
            // 'learning' is at index 0 in routeValue
            component.ngOnInit()
            expect(component.selectedIndex).toBe(0)
        })

        it('should set selectedIndex to -1 when current route is not in routeValue', () => {
            const unknownRouteUrlTree = {
                root: {
                    children: {
                        primary: {
                            segments: [
                                { path: 'app' },
                                { path: 'search' },
                                { path: 'unknown' },
                            ],
                        },
                    },
                },
            }
            mockRouter.parseUrl.mockReturnValue(unknownRouteUrlTree)

            component.ngOnInit()

            expect(component.route).toBe('unknown')
            expect(component.selectedIndex).toBe(-1)
        })

        it('should set selectedIndex to 1 when route matches second routeValue entry', () => {
            const socialRouteUrlTree = {
                root: {
                    children: {
                        primary: {
                            segments: [
                                { path: 'app' },
                                { path: 'search' },
                                { path: 'social' },
                            ],
                        },
                    },
                },
            }
            mockRouter.parseUrl.mockReturnValue(socialRouteUrlTree)

            component.ngOnInit()

            expect(component.route).toBe('social')
            expect(component.selectedIndex).toBe(1)
        })
    })

    // ─── routeTabs ─────────────────────────────────────────────────────────

    describe('routeTabs', () => {
        beforeEach(() => {
            component.ngOnInit()   // populate searchTabs.routeValue
        })

        it('should update selectedIndex to the given tab index', () => {
            component.routeTabs(1)
            expect(component.selectedIndex).toBe(1)
        })

        it('should navigate to the correct route using navigateByUrl', () => {
            component.routeTabs(0)
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/search/learning')
        })

        it('should navigate to the second tab route', () => {
            component.routeTabs(1)
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/search/social')
        })

        it('should set selectedIndex to 0 when first tab is selected', () => {
            component.routeTabs(0)
            expect(component.selectedIndex).toBe(0)
        })
    })

    // ─── hasKeys ───────────────────────────────────────────────────────────

    describe('hasKeys', () => {
        it('should return true when object has at least one key', () => {
            expect(component.hasKeys({ name: 'test' })).toBe(true)
        })

        it('should return false when object is empty', () => {
            expect(component.hasKeys({})).toBe(false)
        })

        it('should return false when object is null', () => {
            expect(component.hasKeys(null as any)).toBe(false)
        })

        it('should return false when object is undefined', () => {
            expect(component.hasKeys(undefined as any)).toBe(false)
        })

        it('should return true for object with multiple keys', () => {
            expect(component.hasKeys({ a: 1, b: 2, c: 3 })).toBe(true)
        })

        it('should return true for object with a nested object value', () => {
            expect(component.hasKeys({ nested: { key: 'value' } })).toBe(true)
        })
    })
})