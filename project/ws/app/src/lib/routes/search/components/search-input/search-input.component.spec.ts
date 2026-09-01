import { Subject } from 'rxjs'

import { SearchInputComponent } from './search-input.component'
import { ISearchAutoComplete } from '../../models/search.model'

// Mock classes and interfaces
class MockActivatedRoute {
    snapshot = {
        queryParams: { q: 'test-query' },
        data: {
            searchPageData: {
                data: {
                    search: {
                        isAutoCompleteAllowed: true,
                        languageSearch: ['all', 'en', 'fr', 'es']
                    }
                }
            }
        }
    };
    queryParamMap = new Subject();
    parent = {};
}

class MockRouter {
    navigate = jest.fn();
}

class MockSearchServService {
    searchAutoComplete = jest.fn();
    getLanguageSearchIndex = jest.fn();
}

class MockConfigurationsService {
    activeLocale = { locals: ['en'] };
    userPreference = { selectedLangGroup: 'en,fr' };
}

class MockElementRef {
    nativeElement = {
        activated: jest.fn(),
        blur: jest.fn()
    };
}

describe('SearchInputComponent', () => {
    let component: SearchInputComponent
    let activatedRoute: MockActivatedRoute
    let router: MockRouter
    let searchServSvc: MockSearchServService
    let configSvc: MockConfigurationsService
    let route: MockActivatedRoute

    beforeEach(() => {
        activatedRoute = new MockActivatedRoute()
        router = new MockRouter()
        searchServSvc = new MockSearchServService()
        configSvc = new MockConfigurationsService()
        route = new MockActivatedRoute()

        // Setup default mocks
        searchServSvc.getLanguageSearchIndex.mockReturnValue('en')
        searchServSvc.searchAutoComplete.mockResolvedValue([])

        component = new SearchInputComponent(
            activatedRoute as any,
            router as any,
            searchServSvc as any,
            configSvc as any,
            route as any
        )

        // Mock ViewChild
        component.searchInputElem = new MockElementRef() as any
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Constructor', () => {
        it('should initialize with default values', () => {
            expect(component.placeHolder).toBe('')
            expect(component.ref).toBe('')
            expect(component.queryControl.value).toBe('test-query')
            expect(component.autoCompleteResults).toEqual([])
        })

        it('should set up autocomplete subscription when isAutoCompleteAllowed is true', () => {
            const spy = jest.spyOn(searchServSvc, 'searchAutoComplete')

            // Create new component to test constructor
            const newComponent = new SearchInputComponent(
                activatedRoute as any,
                router as any,
                searchServSvc as any,
                configSvc as any,
                route as any
            )

            // Simulate value change
            newComponent.queryControl.setValue('test')

            // Wait for debounce
            setTimeout(() => {
                expect(spy).toHaveBeenCalled()
            }, 250)
        })

        it('should not set up autocomplete subscription when isAutoCompleteAllowed is false', () => {
            route.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed = false
            const spy = jest.spyOn(searchServSvc, 'searchAutoComplete')

            const newComponent = new SearchInputComponent(
                activatedRoute as any,
                router as any,
                searchServSvc as any,
                configSvc as any,
                route as any
            )

            newComponent.queryControl.setValue('test')

            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled()
            }, 250)
        })

        // it('should set up autocomplete subscription when isAutoCompleteAllowed is undefined', () => {
        //     route.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed = undefined
        //     const spy = jest.spyOn(searchServSvc, 'searchAutoComplete')

        //     const newComponent = new SearchInputComponent(
        //         activatedRoute as any,
        //         router as any,
        //         searchServSvc as any,
        //         configSvc as any,
        //         route as any
        //     )

        //     newComponent.queryControl.setValue('test')

        //     setTimeout(() => {
        //         expect(spy).toHaveBeenCalled()
        //     }, 250)
        // })
    })

    describe('ngOnInit', () => {
        it('should activate search input element if available', () => {
            const spy = jest.spyOn(component.searchInputElem.nativeElement, 'activated')

            component.ngOnInit()

            expect(spy).toHaveBeenCalled()
        })

        it('should handle query param subscription with q parameter', () => {
            const spy = jest.spyOn(component.queryControl, 'setValue')

            component.ngOnInit()

            activatedRoute.queryParamMap.next(new Map([['q', 'new-query']]))

            expect(spy).toHaveBeenCalledWith('new-query')
        })

        it('should handle query param subscription without q parameter', () => {
            const spy = jest.spyOn(component, 'updateQuery')

            component.ngOnInit()

            activatedRoute.queryParamMap.next(new Map())

            expect(spy).toHaveBeenCalledWith('all')
        })

        it('should handle lang parameter in query params', () => {
            component.ngOnInit()

            activatedRoute.queryParamMap.next(new Map([['lang', 'fr']]))

            expect(component.searchLocale).toBe('fr')
        })

        it('should use active locale when no lang parameter', () => {
            jest.spyOn(component, 'getActiveLocale').mockReturnValue('en')

            component.ngOnInit()

            activatedRoute.queryParamMap.next(new Map())

            expect(component.searchLocale).toBe('en')
        })

        it('should call getSearchAutoCompleteResults when autocomplete is allowed', () => {
            const spy = jest.spyOn(component, 'getSearchAutoCompleteResults')

            component.ngOnInit()

            activatedRoute.queryParamMap.next(new Map([['q', 'test']]))

            expect(spy).toHaveBeenCalledWith('test')
        })

        it('should not call getSearchAutoCompleteResults when autocomplete is not allowed', () => {
            route.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed = false
            const spy = jest.spyOn(component, 'getSearchAutoCompleteResults')

            component.ngOnInit()

            activatedRoute.queryParamMap.next(new Map([['q', 'test']]))

            expect(spy).not.toHaveBeenCalled()
        })

        it('should process language search array correctly', () => {
            component.ngOnInit()

            expect(component.languageSearch).toEqual(['all', 'en,fr', 'en', 'es', 'fr'])
        })

        // it('should process language search without preferred languages', () => {
        //     configSvc.userPreference = null

        //     component.ngOnInit()

        //     expect(component.languageSearch).toEqual(['all', 'en', 'es', 'fr'])
        // })

        it('should handle single preferred language', () => {
            configSvc.userPreference = { selectedLangGroup: 'en' }

            component.ngOnInit()

            expect(component.languageSearch).toContain('all')
        })
    })

    describe('ngOnChanges', () => {
        it('should update placeHolder when changed', () => {
            component.placeHolder = 'new-placeholder'

            component.ngOnChanges()

            expect(component.placeHolder).toBe('new-placeholder')
        })
    })

    describe('swapRemove', () => {
        it('should swap elements in array correctly', () => {
            const testArray = ['a', 'b', 'c', 'd']

            component.swapRemove(testArray, 2, 0)

            expect(testArray).toEqual(['c', 'a', 'b', 'd'])
        })
    })

    describe('getActiveLocale', () => {
        it('should return locale from config service', () => {
            searchServSvc.getLanguageSearchIndex.mockReturnValue('en-mapped')

            const result = component.getActiveLocale()

            expect(searchServSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
            expect(result).toBe('en-mapped')
        })

        // it('should return default locale when config is null', () => {
        //     configSvc.activeLocale = null
        //     searchServSvc.getLanguageSearchIndex.mockReturnValue('en-default')

        //     const result = component.getActiveLocale()

        //     expect(searchServSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
        //     expect(result).toBe('en-default')
        // })
    })

    describe('preferredLanguages getter', () => {
        it('should return mapped preferred languages', () => {
            searchServSvc.getLanguageSearchIndex.mockImplementation((lang) => `${lang}-mapped`)

            const result = component.preferredLanguages

            expect(result).toBe('en-mapped,fr-mapped')
        })

        // it('should return null when no user preference', () => {
        //     configSvc.userPreference = null

        //     const result = component.preferredLanguages

        //     expect(result).toBeNull()
        // })

        // it('should return null when no selectedLangGroup', () => {
        //     configSvc.userPreference = {}

        //     const result = component.preferredLanguages

        //     expect(result).toBeNull()
        // })

        it('should handle empty language in selectedLangGroup', () => {
            configSvc.userPreference = { selectedLangGroup: 'en,' }
            searchServSvc.getLanguageSearchIndex.mockImplementation((lang) => lang || 'en')

            const result = component.preferredLanguages

            expect(result).toBe('en,en')
        })
    })

    describe('updateQuery', () => {
        it('should blur search input and navigate for home ref', () => {
            component.ref = 'home'
            const blurSpy = jest.spyOn(component.searchInputElem.nativeElement, 'blur')
            const closedSpy = jest.spyOn(component.closed, 'emit')

            component.updateQuery('test query ')

            expect(blurSpy).toHaveBeenCalled()
            expect(closedSpy).toHaveBeenCalledWith(false)
            expect(router.navigate).toHaveBeenCalledWith(['/app/search'], {
                queryParams: { q: 'test query' },
                queryParamsHandling: 'merge',
            })
        })

        it('should navigate relatively for non-home ref', () => {
            component.ref = 'other'

            component.updateQuery('test query ')

            expect(router.navigate).toHaveBeenCalledWith([], {
                relativeTo: activatedRoute.parent,
                queryParams: { q: 'test query' },
                queryParamsHandling: 'merge',
            })
        })

        it('should handle null search input element', () => {
            component.searchInputElem = null as any

            expect(() => component.updateQuery('test')).not.toThrow()
        })

        it('should handle undefined nativeElement', () => {
            component.searchInputElem = { nativeElement: null } as any

            expect(() => component.updateQuery('test')).not.toThrow()
        })
    })

    describe('getSearchAutoCompleteResults', () => {
        it('should call searchAutoComplete for single locale', async () => {
            component.searchLocale = 'en'
            const mockResults: ISearchAutoComplete[] = [{ term: 'test' } as any]
            searchServSvc.searchAutoComplete.mockResolvedValue(mockResults)

            await component.getSearchAutoCompleteResults('test')

            expect(searchServSvc.searchAutoComplete).toHaveBeenCalledWith({
                q: 'test',
                l: 'en',
            })
            expect(component.autoCompleteResults).toEqual(mockResults)
        })

        it('should not call searchAutoComplete for multiple locales', async () => {
            component.searchLocale = 'en,fr'

            await component.getSearchAutoCompleteResults('test')

            expect(searchServSvc.searchAutoComplete).not.toHaveBeenCalled()
        })

        it('should handle searchAutoComplete error', async () => {
            component.searchLocale = 'en'
            searchServSvc.searchAutoComplete.mockRejectedValue(new Error('API Error'))

            await component.getSearchAutoCompleteResults('test')

            expect(searchServSvc.searchAutoComplete).toHaveBeenCalled()
            // Should not throw error
        })
    })

    describe('searchLanguage', () => {
        it('should navigate with language and current query', () => {
            component.queryControl.setValue('current-query')

            component.searchLanguage('fr')

            expect(router.navigate).toHaveBeenCalledWith([], {
                relativeTo: activatedRoute.parent,
                queryParams: { lang: 'fr', q: 'current-query' },
                queryParamsHandling: 'merge',
            })
        })
    })

    describe('filteredOptions$', () => {
        it('should be defined and return empty array', (done) => {
            component.filteredOptions$.subscribe(result => {
                expect(result).toEqual([])
                done()
            })
        })
    })

    describe('Event Emitters', () => {
        it('should emit closed event', () => {
            const spy = jest.spyOn(component.closed, 'emit')

            component.closed.emit(true)

            expect(spy).toHaveBeenCalledWith(true)
        })
    })

    describe('Input Properties', () => {
        it('should accept placeHolder input', () => {
            component.placeHolder = 'Search here...'
            expect(component.placeHolder).toBe('Search here...')
        })

        it('should accept ref input', () => {
            component.ref = 'header'
            expect(component.ref).toBe('header')
        })
    })

    describe('Edge Cases', () => {
        it('should handle null query in updateQuery', () => {
            expect(() => component.updateQuery(null as any)).not.toThrow()
        })

        it('should handle undefined query in updateQuery', () => {
            expect(() => component.updateQuery(undefined as any)).not.toThrow()
        })

        it('should handle empty string in getSearchAutoCompleteResults', async () => {
            component.searchLocale = 'en'

            await component.getSearchAutoCompleteResults('')

            expect(searchServSvc.searchAutoComplete).toHaveBeenCalledWith({
                q: '',
                l: 'en',
            })
        })

        it('should handle null searchLocale in getSearchAutoCompleteResults', async () => {
            component.searchLocale = null as any

            expect(() => component.getSearchAutoCompleteResults('test')).not.toThrow()
        })
    })

    describe('Component Lifecycle', () => {
        it('should initialize queryControl with route params', () => {
            activatedRoute.snapshot.queryParams.q = 'initial-query'

            const newComponent = new SearchInputComponent(
                activatedRoute as any,
                router as any,
                searchServSvc as any,
                configSvc as any,
                route as any
            )

            expect(newComponent.queryControl.value).toBe('initial-query')
        })

        // it('should initialize queryControl with default value when no route params', () => {
        //     activatedRoute.snapshot.queryParams = {}

        //     const newComponent = new SearchInputComponent(
        //         activatedRoute as any,
        //         router as any,
        //         searchServSvc as any,
        //         configSvc as any,
        //         route as any
        //     )

        //     expect(newComponent.queryControl.value).toBe('all')
        // })
    })
})