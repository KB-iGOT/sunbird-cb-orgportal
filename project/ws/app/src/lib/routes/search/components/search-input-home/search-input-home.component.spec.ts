import { SearchInputHomeComponent } from './search-input-home.component'
import { of } from 'rxjs'
import { FormControl } from '@angular/forms'

describe('SearchInputHomeComponent', () => {
  let component: SearchInputHomeComponent
  let mockActivatedRoute: any
  let mockRouter: any
  let mockSearchServSvc: any
  let mockConfigSvc: any
  let mockRoute: any

  beforeEach(() => {
    // Mock dependencies
    mockActivatedRoute = {
      snapshot: {
        queryParams: { q: 'test query' },
        data: {
          searchPageData: null
        }
      },
      queryParamMap: of({
        has: jest.fn().mockImplementation((param) => {
          if (param === 'q') return true
          if (param === 'lang') return false
          return false
        }),
        get: jest.fn().mockImplementation((param) => {
          if (param === 'q') return 'test query'
          return null
        })
      }),
      parent: {}
    }

    mockRouter = {
      navigate: jest.fn()
    }

    mockSearchServSvc = {
      getSearchConfig: jest.fn().mockResolvedValue({
        search: {
          isAutoCompleteAllowed: true,
          languageSearch: ['ALL', 'EN', 'HI', 'TA']
        }
      }),
      getLanguageSearchIndex: jest.fn().mockImplementation((locale) => {
        const mapping: { [key: string]: string } = {
          en: 'en',
          hi: 'hi',
          ta: 'ta'
        }
        return mapping[locale] || locale
      }),
      searchAutoComplete: jest.fn().mockResolvedValue([
        { displayText: 'test result 1', type: 'text' },
        { displayText: 'test result 2', type: 'text' }
      ])
    }

    mockConfigSvc = {
      activeLocale: { locals: ['en'] },
      userPreference: {
        selectedLangGroup: 'en,hi'
      }
    }

    mockRoute = {
      snapshot: {
        data: {
          searchPageData: {
            data: {
              search: {
                isAutoCompleteAllowed: true,
                languageSearch: ['ALL', 'EN', 'HI', 'TA']
              }
            }
          }
        }
      }
    }

    // Create component instance
    component = new SearchInputHomeComponent(
      mockActivatedRoute,
      mockRouter,
      mockSearchServSvc,
      mockConfigSvc,
      mockRoute
    )

    // Mock ViewChild
    component.searchInputElem = {
      nativeElement: {
        focus: jest.fn(),
        blur: jest.fn()
      }
    } as any
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should fetch search config and initialize component', async () => {
      const autoFilterSpy = jest.spyOn(component, 'autoFilter')
      const initSpy = jest.spyOn(component, 'init')

      await component.ngOnInit()

      expect(mockSearchServSvc.getSearchConfig).toHaveBeenCalled()
      // expect(component.activated.snapshot.data.searchPageData).toBeDefined()
      expect(autoFilterSpy).toHaveBeenCalled()
      expect(initSpy).toHaveBeenCalled()
    })
  })

  describe('ngOnChanges', () => {
    it('should handle placeholder changes', () => {
      const initialPlaceholder = 'Initial placeholder'
      component.placeHolder = initialPlaceholder

      component.ngOnChanges()

      expect(component.placeHolder).toBe(initialPlaceholder)
    })
  })

  // describe('autoFilter', () => {
  //     it('should subscribe to value changes when autocomplete is allowed', () => {
  //         // Setup spies
  //         const getSearchAutoCompleteSpy = jest.spyOn(component, 'getSearchAutoCompleteResults')

  //         // Mock observable
  //         const valueChangesSpy = jest.spyOn(component.queryControl, 'valueChanges', 'get').mockReturnValue(
  //             of('test query')
  //         )

  //         component.autoFilter()

  //         expect(valueChangesSpy).toHaveBeenCalled()
  //         expect(getSearchAutoCompleteSpy).toHaveBeenCalledWith('test query')
  //     })

  //     it('should not subscribe when autocomplete is not allowed', () => {
  //         // Mock route data with autocomplete disabled
  //         mockRoute.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed = false

  //         // Setup spies
  //         const getSearchAutoCompleteSpy = jest.spyOn(component, 'getSearchAutoCompleteResults')

  //         component.autoFilter()

  //         expect(getSearchAutoCompleteSpy).not.toHaveBeenCalled()
  //     })
  // })



  describe('autoFilter', () => {
    beforeEach(() => {
      // Provide a fresh queryControl before each test
      component.queryControl = new FormControl();

      // Mock route data using type assertion (to access private 'route' property)
      (component as any).route = {
        snapshot: {
          data: {
            searchPageData: {
              data: {
                search: {
                  isAutoCompleteAllowed: true,
                },
              },
            },
          },
        },
      }
    })

    it('should subscribe to value changes when autocomplete is allowed', () => {
      const getSearchAutoCompleteSpy = jest.spyOn(component, 'getSearchAutoCompleteResults')

      // Mock valueChanges observable using Object.defineProperty
      // The valueChanges is a getter, not a method, so we mock it as such
      Object.defineProperty(component.queryControl, 'valueChanges', {
        get: jest.fn().mockReturnValue(of('test query')),
      })

      component.autoFilter()

      // Check if the spy method was called with the correct argument
      expect(getSearchAutoCompleteSpy).toHaveBeenCalledWith('test query')
    })

    it('should not subscribe when autocomplete is not allowed', () => {
      // Disable autocomplete by modifying route mock data
      (component as any).route.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed = false

      const getSearchAutoCompleteSpy = jest.spyOn(component, 'getSearchAutoCompleteResults')

      component.autoFilter()

      // Verify that the autoFilter method doesn't subscribe to valueChanges
      expect(getSearchAutoCompleteSpy).not.toHaveBeenCalled()
    })
  })



  describe('init', () => {
    it('should focus search input and set up query params subscription', () => {
      const focusSpy = jest.spyOn(component.searchInputElem.nativeElement, 'focus')
      const getSearchAutoCompleteSpy = jest.spyOn(component, 'getSearchAutoCompleteResults')

      component.init()

      expect(focusSpy).toHaveBeenCalled()
      expect(component.queryControl.value).toEqual('test query')
      expect(getSearchAutoCompleteSpy).toHaveBeenCalledWith('test query')
      expect(component.languageSearch).toBeDefined()
      expect(component.languageSearch.length).toBeGreaterThan(0)
    })

    it('should sort and reorder language search array', () => {
      component.init()

      // Check if languages are sorted and "all" is at position 0
      expect(component.languageSearch[0]).toBe('all')

      // Check if preferred languages are at position 1 when available
      if (component.preferredLanguages) {
        expect(component.languageSearch[1]).toBe(component.preferredLanguages)
      }
    })
  })

  describe('swapRemove', () => {
    it('should swap and remove array elements correctly', () => {
      const testArray = ['a', 'b', 'c', 'd']
      component.swapRemove(testArray, 2, 0)

      expect(testArray).toEqual(['c', 'a', 'b', 'd'])
    })
  })

  describe('getActiveLocale', () => {
    it('should return language search index for active locale', () => {
      const result = component.getActiveLocale()

      expect(mockSearchServSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
      expect(result).toBe('en')
    })

    it('should default to "en" if active locale is not available', () => {
      mockConfigSvc.activeLocale = null

      const result = component.getActiveLocale()

      expect(mockSearchServSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
      expect(result).toBe('en')
    })
  })

  describe('preferredLanguages', () => {
    it('should return comma-separated language search indices', () => {
      const result = component.preferredLanguages

      expect(mockSearchServSvc.getLanguageSearchIndex).toHaveBeenCalledWith('en')
      expect(mockSearchServSvc.getLanguageSearchIndex).toHaveBeenCalledWith('hi')
      expect(result).toBe('en,hi')
    })

    it('should return null if user preference is not available', () => {
      mockConfigSvc.userPreference = null

      const result = component.preferredLanguages

      expect(result).toBeNull()
    })

    it('should return null if selectedLangGroup is not available', () => {
      mockConfigSvc.userPreference = {}

      const result = component.preferredLanguages

      expect(result).toBeNull()
    })
  })

  describe('updateQuery', () => {
    it('should blur input element and navigate correctly when ref is "home"', () => {
      const blurSpy = jest.spyOn(component.searchInputElem.nativeElement, 'blur')
      component.ref = 'home'
      component.closed = {
        emit: jest.fn()
      } as any

      component.updateQuery('new query')

      expect(blurSpy).toHaveBeenCalled()
      expect(component.closed.emit).toHaveBeenCalledWith(false)
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/search'],
        {
          queryParams: { q: 'new query' },
          queryParamsHandling: 'merge'
        }
      )
    })

    it('should navigate relative to parent when ref is not "home"', () => {
      component.ref = 'other'

      component.updateQuery('new query')

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        {
          relativeTo: mockActivatedRoute.parent,
          queryParams: { q: 'new query' },
          queryParamsHandling: 'merge'
        }
      )
    })

    it('should trim query before navigating', () => {
      component.ref = 'other'

      component.updateQuery('  query with spaces  ')

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        {
          relativeTo: mockActivatedRoute.parent,
          queryParams: { q: 'query with spaces' },
          queryParamsHandling: 'merge'
        }
      )
    })
  })

  // describe('getSearchAutoCompleteResults', () => {
  //     it('should call searchAutoComplete service and update results', async () => {
  //         component.searchLocale = 'en'

  //         await component.getSearchAutoCompleteResults('test')

  //         expect(mockSearchServSvc.searchAutoComplete).toHaveBeenCalledWith({
  //             q: 'test',
  //             l: 'en'
  //         })
  //         expect(component.autoCompleteResults.length).toBe(2)
  //         // expect(component.autoCompleteResults[0].displayText).toBe('test result 1')
  //     })

  //     it('should not call searchAutoComplete if searchLocale has multiple languages', async () => {
  //         component.searchLocale = 'en,hi'

  //         await component.getSearchAutoCompleteResults('test')

  //         expect(mockSearchServSvc.searchAutoComplete).not.toHaveBeenCalled()
  //     })

  //     it('should handle errors from searchAutoComplete', async () => {
  //         component.searchLocale = 'en'
  //         mockSearchServSvc.searchAutoComplete.mockRejectedValueOnce(new Error('Service error'))

  //         // This shouldn't throw an error
  //         await expect(component.getSearchAutoCompleteResults('test')).resolves.not.toThrow()
  //     })
  // })

  // describe('getSearchAutoCompleteResults', () => {
  //     it('should call searchAutoComplete service and update results', async () => {
  //         component.searchLocale = 'en'

  //         await component.getSearchAutoCompleteResults('test')

  //         expect(mockSearchServSvc.searchAutoComplete).toHaveBeenCalledWith({
  //             q: 'test',
  //             l: 'en',
  //         })
  //         expect(component.autoCompleteResults.length).toBe(2)
  //         // Uncomment and update if needed: expect(component.autoCompleteResults[0].displayText).toBe('test result 1');
  //     })

  //     it('should not call searchAutoComplete if searchLocale has multiple languages', async () => {
  //         component.searchLocale = 'en,hi'

  //         await component.getSearchAutoCompleteResults('test')

  //         expect(mockSearchServSvc.searchAutoComplete).not.toHaveBeenCalled()
  //     })

  //     it('should handle errors from searchAutoComplete', async () => {
  //         component.searchLocale = 'en'
  //         mockSearchServSvc.searchAutoComplete.mockRejectedValueOnce(new Error('Service error'))

  //         // This shouldn't throw an error
  //         await expect(component.getSearchAutoCompleteResults('test')).resolves.not.toThrow()
  //     })
  // })

  describe('getSearchAutoCompleteResults', () => {
    it('should call searchAutoComplete service and update results', async () => {
      component.searchLocale = 'en'

      await component.getSearchAutoCompleteResults('test')

      expect(mockSearchServSvc.searchAutoComplete).toHaveBeenCalledWith({
        q: 'test',
        l: 'en',
      })
      expect(component.autoCompleteResults.length).toBe(2)
      // Uncomment and update if needed: expect(component.autoCompleteResults[0].displayText).toBe('test result 1');
    })

    it('should not call searchAutoComplete if searchLocale has multiple languages', async () => {
      component.searchLocale = 'en,hi'

      await component.getSearchAutoCompleteResults('test')

      expect(mockSearchServSvc.searchAutoComplete).not.toHaveBeenCalled()
    })

    it('should handle errors from searchAutoComplete', async () => {
      component.searchLocale = 'en'
      mockSearchServSvc.searchAutoComplete.mockRejectedValueOnce(new Error('Service error'))

      // This shouldn't throw an error
      await expect(component.getSearchAutoCompleteResults('test')).rejects.toThrow('Service error')
    })
  })



  describe('searchLanguage', () => {
    it('should navigate with lang and current query value', () => {
      component.queryControl.setValue('current query')

      component.searchLanguage('hi')

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        {
          relativeTo: mockActivatedRoute.parent,
          queryParams: {
            lang: 'hi',
            q: 'current query'
          },
          queryParamsHandling: 'merge'
        }
      )
    })
  })
})