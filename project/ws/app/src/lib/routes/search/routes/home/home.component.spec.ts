import { Subject } from 'rxjs'
import { HomeComponent } from './home.component'
import { UntypedFormControl } from '@angular/forms'

// Mock dependencies
const mockConfigSvc = {
    pageNavBar: { theme: 'default' },
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
    queryParamMap: new Subject(),
    parent: {}
}

const mockSearchSvc = {
    searchAutoComplete: jest.fn().mockResolvedValue([]),
    getLanguageSearchIndex: jest.fn().mockReturnValue('en'),
    getSearchConfig: jest.fn().mockResolvedValue({
        search: {
            suggestedFilters: [
                { contentType: 'Course', displayName: 'Courses' },
                { resourceType: 'Video', displayName: 'Videos' }
            ]
        }
    })
}

describe('HomeComponent', () => {
    let component: HomeComponent
    let queryParamMapSubject: Subject<any>

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create fresh query param subject
        queryParamMapSubject = new Subject()
        mockRoute.queryParamMap = queryParamMapSubject

        // Create component instance
        component = new HomeComponent(
            mockConfigSvc as any,
            mockRouter as any,
            mockRoute as any,
            mockSearchSvc as any
        )
    })

    afterEach(() => {
        queryParamMapSubject.complete()
    })

    describe('Constructor', () => {
        it('should initialize with default values', () => {
            expect(component.query).toBeInstanceOf(UntypedFormControl)
            expect(component.pageNavbar).toEqual({ theme: 'default' })
            expect(component.autoCompleteResults).toEqual([])
            expect(component.searchQuery).toEqual({
                l: 'en',
                q: ''
            })
        })

        it('should set up autocomplete when isAutoCompleteAllowed is true', () => {
            const spy = jest.spyOn(component, 'getAutoCompleteResults')

            // Trigger value change
            component.query.setValue('test query')

            // Wait for debounce
            setTimeout(() => {
                expect(spy).toHaveBeenCalled()
            }, 250)
        })

        it('should not set up autocomplete when isAutoCompleteAllowed is false', () => {
            mockRoute.snapshot.data.pageData.data.search.isAutoCompleteAllowed = false

            const newComponent = new HomeComponent(
                mockConfigSvc as any,
                mockRouter as any,
                mockRoute as any,
                mockSearchSvc as any
            )

            const spy = jest.spyOn(newComponent, 'getAutoCompleteResults')
            newComponent.query.setValue('test')

            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled()
            }, 250)
        })
    })

    describe('search method', () => {
        it('should navigate to search pages with query parameters', async () => {
            component.searchQuery = { l: 'en', q: 'test query' }

            await component.search()

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'], {
                queryParams: { lang: 'en', q: 'test query' }
            })

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/learning'], {
                queryParams: { q: 'test query', lang: 'en' }
            })
        })

        it('should use provided query parameter over searchQuery.q', async () => {
            component.searchQuery = { l: 'hi', q: 'old query' }

            await component.search('new query')

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search/home'], {
                queryParams: { lang: 'hi', q: 'new query' }
            })
        })
    })

    describe('searchWithFilter method', () => {
        it('should handle contentType filter', async () => {
            const filter = { contentType: 'Course' }
            component.searchQuery = { l: 'en', q: 'test' }

            await component.searchWithFilter(filter)

            expect(mockRouter.navigate).toHaveBeenLastCalledWith(['/app/search/learning'], {
                queryParams: {
                    q: 'test',
                    lang: 'en',
                    f: JSON.stringify({ contentType: ['Course'] })
                }
            })
        })

        it('should handle resourceType filter', async () => {
            const filter = { resourceType: 'Video' }
            component.searchQuery = { l: 'en', q: 'test' }

            await component.searchWithFilter(filter)

            expect(mockRouter.navigate).toHaveBeenLastCalledWith(['/app/search/learning'], {
                queryParams: {
                    q: 'test',
                    lang: 'en',
                    f: JSON.stringify({ resourceType: ['Video'] })
                }
            })
        })

        it('should handle learningContent combinedType filter', async () => {
            const filter = { combinedType: 'learningContent' }
            component.searchQuery = { l: 'en', q: 'test' }

            await component.searchWithFilter(filter)

            expect(mockRouter.navigate).toHaveBeenLastCalledWith(['/app/search/learning'], {
                queryParams: {
                    q: 'test',
                    lang: 'en',
                    f: JSON.stringify({ contentType: ['Collection', 'Learning Path', 'Course'] })
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

        it('should return "en" as default when no locale available', () => {
            mockConfigSvc.activeLocale = { locals: ['en'] }
            mockSearchSvc.getLanguageSearchIndex.mockReturnValue('en')

            const result = component.getActivateLocale()

            expect(mockSearchSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
            expect(result).toBe('en')
        })
    })

    describe('preferredLanguages getter', () => {
        it('should return formatted preferred languages', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi,ta' }
            mockSearchSvc.getLanguageSearchIndex.mockImplementation((lang) => `${lang}_index`)

            const result = component.preferredLanguages

            expect(result).toBe('en_index,hi_index,ta_index')
        })

        it('should return null when no user preference', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: '' }

            const result = component.preferredLanguages

            expect(result).toBeNull()
        })

        it('should return null when no selectedLangGroup', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: '' }

            const result = component.preferredLanguages

            expect(result).toBeNull()
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

            expect(testArray).toEqual(['b', 'c', 'a'])
        })
    })

    describe('getAutoCompleteResults method', () => {
        it('should fetch and set autocomplete results', async () => {
            const mockResults = [
                { displayText: 'Angular', identifier: 'ang1' },
                { displayText: 'React', identifier: 'react1' }
            ]
            mockSearchSvc.searchAutoComplete.mockResolvedValue(mockResults)
            component.searchQuery = { l: 'en', q: 'test' }

            await component.getAutoCompleteResults()

            expect(mockSearchSvc.searchAutoComplete).toHaveBeenCalledWith({ l: 'en', q: 'test' })
            expect(component.autoCompleteResults).toEqual(mockResults)
        })

        it('should handle autocomplete service errors gracefully', async () => {
            mockSearchSvc.searchAutoComplete.mockRejectedValue(new Error('Service error'))
            component.searchQuery = { l: 'en', q: 'test' }

            await component.getAutoCompleteResults()

            expect(component.autoCompleteResults).toEqual([])
        })
    })

    describe('searchLanguage method', () => {
        it('should navigate with updated language parameter', async () => {
            component.searchQuery = { l: 'en', q: 'test' }
            const getAutoCompleteSpy = jest.spyOn(component, 'getAutoCompleteResults')

            await component.searchLanguage('hi')

            expect(mockRouter.navigate).toHaveBeenCalledWith([], {
                queryParams: { lang: 'hi', q: 'test' },
                queryParamsHandling: 'merge',
                relativeTo: {}
            })
            expect(getAutoCompleteSpy).toHaveBeenCalled()
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            // Reset route data
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['All', 'English', 'Hindi']
        })

        it('should subscribe to query parameters and initialize component', () => {
            const mockQueryParamMap = {
                has: jest.fn(),
                get: jest.fn()
            }

            // Mock query parameter map behavior
            mockQueryParamMap.has.mockImplementation((key) => key === 'q' || key === 'lang')
            mockQueryParamMap.get.mockImplementation((key) => {
                if (key === 'q') return 'test query'
                if (key === 'lang') return 'hi'
                return null
            })

            component.ngOnInit()

            // Emit query param changes
            queryParamMapSubject.next(mockQueryParamMap)

            expect(component.searchQuery.q).toBe('test query')
            expect(component.searchQuery.l).toBe('hi')
            expect(component.query.value).toBe('test query')
        })

        it('should handle missing query parameters', () => {
            const mockQueryParamMap = {
                has: jest.fn().mockReturnValue(false),
                get: jest.fn().mockReturnValue(null)
            }

            mockSearchSvc.getLanguageSearchIndex.mockReturnValue('en')

            component.ngOnInit()
            queryParamMapSubject.next(mockQueryParamMap)

            expect(component.searchQuery.q).toBe('')
            expect(component.searchQuery.l).toBe('en')
        })

        it('should sort language search array and move "all" to first position', () => {
            mockRoute.snapshot.data.pageData.data.search.languageSearch = ['Hindi', 'All', 'English']

            const mockQueryParamMap = {
                has: jest.fn().mockReturnValue(false),
                get: jest.fn().mockReturnValue(null)
            }

            component.ngOnInit()
            queryParamMapSubject.next(mockQueryParamMap)

            expect(component.languageSearch[0]).toBe('all')
            expect(component.languageSearch).toEqual(['all', 'english', 'hindi'])
        })

        it('should add preferred languages when multiple languages selected', () => {
            mockConfigSvc.userPreference = { selectedLangGroup: 'en,hi' }

            const mockQueryParamMap = {
                has: jest.fn().mockReturnValue(false),
                get: jest.fn().mockReturnValue(null)
            }

            // Mock preferredLanguages getter
            Object.defineProperty(component, 'preferredLanguages', {
                get: jest.fn().mockReturnValue('en,hi')
            })

            component.ngOnInit()
            queryParamMapSubject.next(mockQueryParamMap)

            expect(component.languageSearch[1]).toBe('en,hi')
        })

        it('should fetch search configuration and set suggested filters', async () => {
            const mockQueryParamMap = {
                has: jest.fn().mockReturnValue(false),
                get: jest.fn().mockReturnValue(null)
            }

            component.ngOnInit()
            queryParamMapSubject.next(mockQueryParamMap)

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(mockSearchSvc.getSearchConfig).toHaveBeenCalled()
            expect(component.suggestedFilters).toEqual([
                { contentType: 'Course', displayName: 'Courses' },
                { resourceType: 'Video', displayName: 'Videos' }
            ])
        })

        it('should handle search config service error', async () => {
            mockSearchSvc.getSearchConfig.mockRejectedValue(new Error('Config error'))

            const mockQueryParamMap = {
                has: jest.fn().mockReturnValue(false),
                get: jest.fn().mockReturnValue(null)
            }

            component.ngOnInit()
            queryParamMapSubject.next(mockQueryParamMap)

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(component.suggestedFilters).toBeUndefined()
        })
    })

    describe('Integration tests', () => {
        it('should handle complete search flow', async () => {
            const mockQueryParamMap = {
                has: jest.fn().mockImplementation((key) => key === 'q'),
                get: jest.fn().mockImplementation((key) => key === 'q' ? 'angular tutorial' : null)
            }

            mockSearchSvc.searchAutoComplete.mockResolvedValue([
                { displayText: 'Angular Tutorial', identifier: 'ang1' }
            ])

            component.ngOnInit()
            queryParamMapSubject.next(mockQueryParamMap)

            // Simulate user typing
            component.query.setValue('angular')

            // Wait for debounce and async operations
            await new Promise(resolve => setTimeout(resolve, 250))

            expect(component.searchQuery.q).toBe('angular tutorial')
            expect(mockSearchSvc.searchAutoComplete).toHaveBeenCalled()
        })
    })
})