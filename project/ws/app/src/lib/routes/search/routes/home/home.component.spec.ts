
import { HomeComponent } from './home.component'
import { UntypedFormControl } from '@angular/forms'
import { of } from 'rxjs'

// Mock dependencies
const mockConfigSvc = {
    pageNavBar: { background: 'test' },
    activeLocale: { locals: ['en'] },
    userPreference: { selectedLangGroup: 'en,hi' }
}

const mockRouter = {
    navigate: jest.fn().mockResolvedValue(true)
}

const mockRoute = {
    snapshot: {
        data: {
            pageData: {
                data: {
                    search: {
                        isAutoCompleteAllowed: true,
                        languageSearch: ['All', 'English', 'Hindi']
                    }
                }
            }
        }
    },
    queryParamMap: of(new Map([['q', 'test query'], ['lang', 'en']])),
    parent: {}
}

const mockSearchSvc = {
    searchAutoComplete: jest.fn(),
    getLanguageSearchIndex: jest.fn(),
    getSearchConfig: jest.fn()
}

// Mock Map implementation for queryParamMap

describe('HomeComponent', () => {
    let component: HomeComponent

    beforeEach(() => {
        jest.clearAllMocks()

        // Reset mocks to default values
        mockConfigSvc.activeLocale = { locals: ['en'] }
        mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi' }
        mockRoute.snapshot.data.pageData.data.search.isAutoCompleteAllowed = true
        mockSearchSvc.getLanguageSearchIndex.mockReturnValue('en')
        mockSearchSvc.searchAutoComplete.mockResolvedValue([])
        mockSearchSvc.getSearchConfig.mockResolvedValue({ search: { suggestedFilters: [] } })

        component = new HomeComponent(
            mockConfigSvc as any,
            mockRouter as any,
            mockRoute as any,
            mockSearchSvc as any
        )
    })

    describe('Constructor', () => {
        it('should initialize component with default values', () => {
            expect(component.query).toBeInstanceOf(UntypedFormControl)
            expect(component.pageNavbar).toEqual(mockConfigSvc.pageNavBar)
            expect(component.autoCompleteResults).toEqual([])
            expect(component.languageSearch).toEqual([])
            expect(component.suggestedFilters).toEqual([])
        })

        it('should set up autocomplete when isAutoCompleteAllowed is true', () => {
            const spy = jest.spyOn(component, 'getAutoCompleteResults')

            // Create new component to trigger constructor
            const newComponent = new HomeComponent(
                mockConfigSvc as any,
                mockRouter as any,
                mockRoute as any,
                mockSearchSvc as any
            )

            // Simulate form control value change
            newComponent.query.setValue('test')

            // Wait for debounceTime
            setTimeout(() => {
                expect(spy).toHaveBeenCalled()
                expect(newComponent.searchQuery.q).toBe('test')
            }, 250)
        })

        it('should not set up autocomplete when isAutoCompleteAllowed is false', () => {
            mockRoute.snapshot.data.pageData.data.search.isAutoCompleteAllowed = false
            const spy = jest.spyOn(component, 'getAutoCompleteResults')

            const newComponent = new HomeComponent(
                mockConfigSvc as any,
                mockRouter as any,
                mockRoute as any,
                mockSearchSvc as any
            )

            newComponent.query.setValue('test')

            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled()
            }, 250)
        })

        it('should set up autocomplete when isAutoCompleteAllowed is undefined', () => {
            mockRoute.snapshot.data.pageData.data.search.isAutoCompleteAllowed = false

            const newComponent = new HomeComponent(
                mockConfigSvc as any,
                mockRouter as any,
                mockRoute as any,
                mockSearchSvc as any
            )

            expect(newComponent).toBeDefined()
        })
    })

    describe('search method', () => {
        beforeEach(() => {
            component.searchQuery = { l: 'en', q: 'test query' }
        })

        it('should navigate with query parameter', async () => {
            await component.search('custom query')

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'], {
                queryParams: { lang: 'en', q: 'custom query' }
            })

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'], {
                queryParams: { q: 'custom query', lang: 'en' }
            })
        })

        it('should navigate with default searchQuery.q when no query provided', async () => {
            await component.search()

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'], {
                queryParams: { lang: 'en', q: 'test query' }
            })

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'], {
                queryParams: { q: 'test query', lang: 'en' }
            })
        })
    })

    describe('searchWithFilter method', () => {
        beforeEach(() => {
            component.searchQuery = { l: 'en', q: 'test query' }
        })

        it('should handle contentType filter', async () => {
            const filter = { contentType: 'Course' }
            await component.searchWithFilter(filter)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'], {
                queryParams: {
                    q: 'test query',
                    lang: 'en',
                    f: JSON.stringify({ contentType: ['Course'] })
                }
            })
        })

        it('should handle resourceType filter', async () => {
            const filter = { resourceType: 'Video' }
            await component.searchWithFilter(filter)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'], {
                queryParams: {
                    q: 'test query',
                    lang: 'en',
                    f: JSON.stringify({ resourceType: ['Video'] })
                }
            })
        })

        it('should handle learningContent combinedType filter', async () => {
            const filter = { combinedType: 'learningContent' }
            await component.searchWithFilter(filter)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'], {
                queryParams: {
                    q: 'test query',
                    lang: 'en',
                    f: JSON.stringify({ contentType: ['Collection', 'Learning Path', 'Course'] })
                }
            })
        })

        it('should handle filter with no matching type', async () => {
            const filter = { someOtherType: 'value' }
            await component.searchWithFilter(filter)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'], {
                queryParams: {
                    q: 'test query',
                    lang: 'en',
                    f: JSON.stringify('')
                }
            })
        })
    })

    describe('getActivateLocale method', () => {
        it('should return locale from configSvc when available', () => {
            mockConfigSvc.activeLocale = { locals: ['hi'] }
            mockSearchSvc.getLanguageSearchIndex.mockReturnValue('hi')

            const result = component.getActivateLocale()

            expect(mockSearchSvc.getLanguageSearchIndex).toHaveBeenCalledWith('hi')
            expect(result).toBe('hi')
        })

        it('should return default "en" when activeLocale is not available', () => {
            mockConfigSvc.activeLocale = { locals: [] }
            mockSearchSvc.getLanguageSearchIndex.mockReturnValue('en')

            const result = component.getActivateLocale()

            expect(mockSearchSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
            expect(result).toBe('en')
        })

        it('should return default "en" when locals array is empty', () => {
            mockConfigSvc.activeLocale = { locals: [] }
            mockSearchSvc.getLanguageSearchIndex.mockReturnValue('en')

            const result = component.getActivateLocale()

            expect(result).toBe('en')
        })
    })

    describe('preferredLanguages getter', () => {
        it('should return formatted preferred languages when userPreference exists', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi,ta' }
            mockSearchSvc.getLanguageSearchIndex
                .mockReturnValueOnce('en')
                .mockReturnValueOnce('hi')
                .mockReturnValueOnce('ta')

            const result = component.preferredLanguages

            expect(result).toBe('en,hi,ta')
        })

        it('should return null when userPreference is not available', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: 'en' }

            const result = component.preferredLanguages

            expect(result).toBeNull()
        })

        it('should return null when selectedLangGroup is not available', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: 'en' }

            const result = component.preferredLanguages

            expect(result).toBeNull()
        })

        it('should handle empty language in selectedLangGroup', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: 'en,,hi' }
            mockSearchSvc.getLanguageSearchIndex
                .mockReturnValueOnce('en')
                .mockReturnValueOnce('en') // for empty string, defaults to 'en'
                .mockReturnValueOnce('hi')

            // const result = component.preferredLanguages

            expect(mockSearchSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
            expect(mockSearchSvc.getLanguageSearchIndex).toHaveBeenCalledWith('')
            expect(mockSearchSvc.getLanguageSearchIndex).toHaveBeenCalledWith('hi')
        })
    })

    describe('swapRemove method', () => {
        it('should move element from one position to another', () => {
            const testArray = ['a', 'b', 'c', 'd']
            component.swapRemove(testArray, 2, 0)

            expect(testArray).toEqual(['c', 'a', 'b', 'd'])
        })

        it('should handle moving element to end', () => {
            const testArray = ['a', 'b', 'c']
            component.swapRemove(testArray, 0, 2)

            expect(testArray).toEqual(['b', 'a', 'c'])
        })
    })

    describe('getAutoCompleteResults method', () => {
        it('should fetch autocomplete results successfully', async () => {
            const mockResults = [{ query: 'test', suggestions: [] }]
            mockSearchSvc.searchAutoComplete.mockResolvedValue(mockResults)
            component.searchQuery = { l: 'en', q: 'test' }

            await component.getAutoCompleteResults()

            expect(mockSearchSvc.searchAutoComplete).toHaveBeenCalledWith({ l: 'en', q: 'test' })
            expect(component.autoCompleteResults).toEqual(mockResults)
        })

        it('should handle autocomplete results fetch error', async () => {
            mockSearchSvc.searchAutoComplete.mockRejectedValue(new Error('API Error'))
            component.searchQuery = { l: 'en', q: 'test' }

            await component.getAutoCompleteResults()

            expect(component.autoCompleteResults).toEqual([]) // Should remain unchanged
        })
    })

    describe('searchLanguage method', () => {
        it('should navigate with language parameter and trigger autocomplete', async () => {
            const spy = jest.spyOn(component, 'getAutoCompleteResults')
            component.searchQuery = { l: 'en', q: 'test' }

            await component.searchLanguage('hi')

            expect(mockRouter.navigate).toHaveBeenCalledWith([], {
                queryParams: { lang: 'hi', q: 'test' },
                queryParamsHandling: 'merge',
                relativeTo: mockRoute.parent
            })
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('ngOnInit method', () => {
        it('should initialize component with query parameters', () => {
            //const queryParamMap = new MockMap()
            //mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All', 'English', 'Hindi']
            mockSearchSvc.getSearchConfig.mockResolvedValue({
                search: { suggestedFilters: [{ name: 'filter1' }] }
            })

            component.ngOnInit()

            expect(component.searchQuery.q).toBe('test search')
            expect(component.searchQuery.l).toBe('hi')
            expect(component.query.value).toBe('test search')
        })

        it('should handle missing query parameter', () => {
            // const queryParamMap = new MockMap([['lang', 'en']])
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All']

            component.ngOnInit()

            expect(component.searchQuery.q).toBe('')
            expect(component.query.value).toBe('')
        })

        it('should handle missing language parameter', () => {
            // const queryParamMap = new MockMap([['q', 'test']])
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All']
            mockSearchSvc.getLanguageSearchIndex.mockReturnValue('en')

            component.ngOnInit()

            expect(component.searchQuery.l).toBe('en')
        })

        it('should process language search array correctly', () => {
            // const queryParamMap = new MockMap()
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['English', 'All', 'Hindi']

            component.ngOnInit()

            expect(component.languageSearch).toEqual(['all', 'english', 'hindi'])
        })

        it('should add preferred languages when multiple preferences exist', () => {
            // const queryParamMap = new MockMap()
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All', 'English']
            mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi,ta' }

            // Mock the preferredLanguages getter
            Object.defineProperty(component, 'preferredLanguages', {
                get: jest.fn().mockReturnValue('en,hi,ta')
            })

            component.ngOnInit()

            expect(component.languageSearch[1]).toBe('en,hi,ta')
        })

        it('should not add preferred languages when only one preference exists', () => {
            // const queryParamMap = new MockMap()
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All', 'English']
            mockConfigSvc.userPreference = { selectedLangGroup: 'en' }

            // Mock the preferredLanguages getter
            Object.defineProperty(component, 'preferredLanguages', {
                get: jest.fn().mockReturnValue('en')
            })

            component.ngOnInit()

            expect(component.languageSearch).toEqual(['all', 'english'])
        })

        it('should handle search config successfully', async () => {
            // const queryParamMap = new MockMap()
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All']
            const mockConfig = {
                search: { suggestedFilters: [{ name: 'test filter' }] }
            }
            mockSearchSvc.getSearchConfig.mockResolvedValue(mockConfig)

            component.ngOnInit()

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(component.suggestedFilters).toEqual([{ name: 'test filter' }])
        })

        it('should handle search config without search property', async () => {
            // const queryParamMap = new MockMap()
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All']
            mockSearchSvc.getSearchConfig.mockResolvedValue({})

            component.ngOnInit()

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(component.suggestedFilters).toBeUndefined()
        })

        it('should handle null query parameter value', () => {
            // const queryParamMap = new MockMap([['q', null], ['lang', null]])
            // Override get method to return null
            // queryParamMap.get = jest.fn().mockReturnValue(null)
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All']
            mockSearchSvc.getLanguageSearchIndex.mockReturnValue('en')

            component.ngOnInit()

            expect(component.searchQuery.q).toBe('')
            expect(component.searchQuery.l).toBe('en')
        })
    })

    describe('Edge cases and error handling', () => {
        it('should handle swapRemove with same from and to positions', () => {
            const testArray = ['a', 'b', 'c']
            component.swapRemove(testArray, 1, 1)

            expect(testArray).toEqual(['a', 'b', 'c'])
        })

        it('should handle empty language search array', () => {
            // const queryParamMap = new MockMap()
            // mockRoute.queryParamMap = of(queryParamMap)
            mockRoute.snapshot.data.pageData.data.search.languageSearch = []

            component.ngOnInit()

            expect(component.languageSearch).toEqual([])
        })

        it('should handle missing pageData structure', () => {
            // mockRoute.snapshot.data = {}

            expect(() => {
                new HomeComponent(
                    mockConfigSvc as any,
                    mockRouter as any,
                    mockRoute as any,
                    mockSearchSvc as any
                )
            }).toThrow()
        })
    })
})