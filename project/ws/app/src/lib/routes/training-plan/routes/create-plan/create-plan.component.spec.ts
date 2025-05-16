import { SearchInputHomeComponent } from './search-input-home.component'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { SearchServService } from '../../services/search-serv.service'
import { of, BehaviorSubject } from 'rxjs'

describe('SearchInputHomeComponent', () => {
    let component: SearchInputHomeComponent
    let activatedRouteMock: Partial<ActivatedRoute>
    let routerMock: Partial<Router>
    let searchServSvcMock: Partial<SearchServService>
    let configSvcMock: Partial<ConfigurationsService>
    let routeMock: Partial<ActivatedRoute>

    // Mock data
    const mockSearchConfig = {
        search: {
            isAutoCompleteAllowed: true,
            languageSearch: ['All', 'En', 'Hi']
        }
    }

    // Create a proper ParamMap implementation
    const createParamMap = () => ({
        has: jest.fn().mockImplementation((key) => key === 'q'),
        get: jest.fn().mockImplementation((key) => {
            if (key === 'q') return 'test query'
            if (key === 'lang') return 'en'
            return null
        }),
        getAll: jest.fn().mockImplementation((key) => {
            if (key === 'q') return ['test query']
            if (key === 'lang') return ['en']
            return []
        }),
        keys: jest.fn().mockReturnValue(['q', 'lang'])
    })

    const mockQueryParamMap = new BehaviorSubject(createParamMap())

    beforeEach(() => {
        // Create mocks
        activatedRouteMock = {
            snapshot: {
                queryParams: { q: 'initial query' },
                data: {
                    searchPageData: {
                        data: mockSearchConfig
                    }
                },
                queryParamMap: createParamMap()
            },
            queryParamMap: mockQueryParamMap,
            parent: {} as any
        }

        routerMock = {
            navigate: jest.fn()
        }

        searchServSvcMock = {
            getSearchConfig: jest.fn().mockResolvedValue(mockSearchConfig),
            getLanguageSearchIndex: jest.fn().mockImplementation(locale => locale),
            searchAutoComplete: jest.fn().mockResolvedValue([{ displayText: 'test result', type: 'search' }])
        }

        configSvcMock = {
            activeLocale: { locals: ['en'] },
            userPreference: {
                selectedLangGroup: 'en,hi'
            }
        }

        routeMock = {
            snapshot: {
                data: {
                    searchPageData: {
                        data: mockSearchConfig
                    }
                }
            }
        }

        // Create component with mocks
        component = new SearchInputHomeComponent(
            activatedRouteMock as ActivatedRoute,
            routerMock as Router,
            searchServSvcMock as SearchServService,
            configSvcMock as ConfigurationsService,
            routeMock as ActivatedRoute
        )

        // Mock ViewChild
        component.searchInputElem = {
            nativeElement: {
                focus: jest.fn(),
                blur: jest.fn()
            }
        } as any
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should fetch search config and initialize', async () => {
            jest.spyOn(component, 'autoFilter')
            jest.spyOn(component, 'init')

            await component.ngOnInit()

            expect(searchServSvcMock.getSearchConfig).toHaveBeenCalled()
            expect(component.autoFilter).toHaveBeenCalled()
            expect(component.init).toHaveBeenCalled()
        })
    })

    describe('autoFilter', () => {
        it('should set up valueChanges subscription when autoComplete is allowed', () => {
            // Setup
            const spy = jest.spyOn(component.queryControl.valueChanges, 'pipe')

            // Execute
            component.autoFilter()

            // Verify
            expect(spy).toHaveBeenCalled()
        })

        it('should not set up valueChanges subscription when autoComplete is not allowed', () => {
            // Setup
            routeMock.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed = false
            const spy = jest.spyOn(component.queryControl.valueChanges, 'pipe')

            // Execute
            component.autoFilter()

            // Verify
            expect(spy).not.toHaveBeenCalled()
        })
    })

    describe('getActiveLocale', () => {
        it('should return locale from config service', () => {
            const result = component.getActiveLocale()
            expect(result).toBe('en')
            expect(searchServSvcMock.getLanguageSearchIndex).toHaveBeenCalledWith('en')
        })

        it('should return default locale if active locale not available', () => {
            configSvcMock.activeLocale = undefined
            const result = component.getActiveLocale()
            expect(searchServSvcMock.getLanguageSearchIndex).toHaveBeenCalledWith('en')
            expect(result).toBe('en')
        })
    })

    describe('preferredLanguages', () => {
        it('should return preferred languages from config', () => {
            const result = component.preferredLanguages
            expect(result).toBe('en,hi')
        })

        it('should return null if no user preference', () => {
            configSvcMock.userPreference = undefined
            const result = component.preferredLanguages
            expect(result).toBeNull()
        })
    })

    describe('updateQuery', () => {
        it('should navigate to search page with query params from home ref', () => {
            // Setup
            component.ref = 'home'
            const query = 'search term'
            const emitSpy = jest.spyOn(component.closed, 'emit')

            // Execute
            component.updateQuery(query)

            // Verify
            expect(component.searchInputElem.nativeElement.blur).toHaveBeenCalled()
            expect(emitSpy).toHaveBeenCalledWith(false)
            expect(routerMock.navigate).toHaveBeenCalledWith(
                ['/app/search'],
                {
                    queryParams: { q: 'search term' },
                    queryParamsHandling: 'merge'
                }
            )
        })

        it('should navigate relative to parent when not from home ref', () => {
            // Setup
            component.ref = 'other'
            const query = 'search term'

            // Execute
            component.updateQuery(query)

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith(
                [],
                {
                    relativeTo: activatedRouteMock.parent,
                    queryParams: { q: 'search term' },
                    queryParamsHandling: 'merge'
                }
            )
        })
    })

    describe('getSearchAutoCompleteResults', () => {
        it('should call searchAutoComplete when searchLocale is a single language', async () => {
            // Setup
            component.searchLocale = 'en'
            const query = 'test'

            // Execute
            await component.getSearchAutoCompleteResults(query)

            // Verify
            expect(searchServSvcMock.searchAutoComplete).toHaveBeenCalledWith({
                q: query,
                l: 'en'
            })
            expect(component.autoCompleteResults).toEqual([{ displayText: 'test result', type: 'search' }])
        })

        it('should not call searchAutoComplete when searchLocale has multiple languages', async () => {
            // Setup
            component.searchLocale = 'en,hi'
            const query = 'test'

            // Execute
            await component.getSearchAutoCompleteResults(query)

            // Verify
            expect(searchServSvcMock.searchAutoComplete).not.toHaveBeenCalled()
        })
    })

    describe('searchLanguage', () => {
        it('should navigate with language and current query', () => {
            // Setup
            component.queryControl.setValue('test query')

            // Execute
            component.searchLanguage('fr')

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith(
                [],
                {
                    relativeTo: activatedRouteMock.parent,
                    queryParams: {
                        lang: 'fr',
                        q: 'test query'
                    },
                    queryParamsHandling: 'merge'
                }
            )
        })
    })

    describe('init', () => {
        it('should set up queryParamMap subscription', () => {
            // Execute
            component.init()

            // Update the mock queryParamMap to simulate changes
            mockQueryParamMap.next({
                has: jest.fn().mockReturnValue(true),
                get: jest.fn().mockImplementation((key) => {
                    if (key === 'q') return 'new query'
                    if (key === 'lang') return 'fr'
                    return null
                }),
                getAll: jest.fn().mockImplementation((key) => {
                    if (key === 'q') return ['new query']
                    if (key === 'lang') return ['fr']
                    return []
                }),
                keys: jest.fn().mockReturnValue(['q', 'lang'])
            })

            // Verify queryControl was updated
            expect(component.queryControl.value).toBe('test query')
        })

        it('should focus on search input element', () => {
            // Execute
            component.init()

            // Verify
            expect(component.searchInputElem.nativeElement.focus).toHaveBeenCalled()
        })
    })

    describe('swapRemove', () => {
        it('should swap and remove element at specified indices', () => {
            // Setup
            const array = ['a', 'b', 'c', 'd']

            // Execute
            component.swapRemove(array, 2, 0)

            // Verify
            expect(array).toEqual(['c', 'a', 'b', 'd'])
        })
    })

    describe('ngOnChanges', () => {
        it('should handle placeHolder change', () => {
            // Setup
            component.placeHolder = 'New Placeholder'

            // Execute
            component.ngOnChanges()

            // Verify
            expect(component.placeHolder).toBe('New Placeholder')
        })
    })
})