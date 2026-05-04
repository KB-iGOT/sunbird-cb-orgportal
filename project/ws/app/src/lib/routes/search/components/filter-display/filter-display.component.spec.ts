import { Subject } from 'rxjs'
import { FilterDisplayComponent } from './filter-display.component'

describe('FilterDisplayComponent', () => {
    let component: FilterDisplayComponent
    let mockActivated: any
    let mockRouter: any
    let mockSearchServ: any
    let mockConfigSvc: any
    let queryParamSubject: Subject<any>

    beforeEach(() => {
        queryParamSubject = new Subject<any>()
        mockActivated = {
            parent: {
                snapshot: {
                    data: {
                        searchPageData: { data: { search: { tabs: [] } } }
                    }
                }
            },
            queryParamMap: queryParamSubject.asObservable(),
        }
        mockRouter = { navigate: jest.fn() }
        mockSearchServ = { translateSearchFilters: jest.fn().mockResolvedValue({}) }
        mockConfigSvc = { userPreference: { selectedLocale: 'en' } }

        component = new FilterDisplayComponent(mockActivated, mockRouter, mockSearchServ, mockConfigSvc)
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize with empty filtersResponse', () => {
        expect(component.filtersResponse).toEqual([])
    })

    describe('ngOnInit()', () => {
        it('should call translateSearchFilters with selected locale', async () => {
            mockSearchServ.translateSearchFilters.mockResolvedValue({ en: { test: { value: null } } })
            component.ngOnInit()
            await Promise.resolve()
            expect(mockSearchServ.translateSearchFilters).toHaveBeenCalledWith('en')
        })

        it('should use en when userPreference is null', async () => {
            mockConfigSvc.userPreference = null
            mockSearchServ.translateSearchFilters.mockResolvedValue({})
            component.ngOnInit()
            await Promise.resolve()
            expect(mockSearchServ.translateSearchFilters).toHaveBeenCalledWith('en')
        })

        it('should update translatedFilters after translateSearchFilters resolves', async () => {
            const filters = { course: { value: null } }
            mockSearchServ.translateSearchFilters.mockResolvedValue(filters)
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 0))
            expect(component.translatedFilters).toEqual(filters)
        })

        it('should set advancedFilters from matching tab', async () => {
            const advancedFilters = [{ filters: { type: ['course'] }, title: 'test' }]
            mockActivated.parent.snapshot.data.searchPageData.data.search.tabs = [
                { titleKey: 'courses', searchQuery: { advancedFilters } }
            ]
            mockSearchServ.translateSearchFilters.mockResolvedValue({})
            component.routeComp = 'courses'
            component.ngOnInit()
            await Promise.resolve()
            expect(component.advancedFilters).toEqual(advancedFilters)
        })

        it('should reset searchRequest when queryParamMap emits without f', () => {
            const mockParams = { has: jest.fn().mockReturnValue(false), get: jest.fn() }
            component.ngOnInit()
            queryParamSubject.next(mockParams)
            expect(component.searchRequest.filters).toEqual({})
        })

        it('should parse f param from queryParamMap', () => {
            const filters = { type: ['course'] }
            const mockParams = { has: jest.fn().mockReturnValue(true), get: jest.fn().mockReturnValue(JSON.stringify(filters)) }
            component.ngOnInit()
            queryParamSubject.next(mockParams)
            expect(component.searchRequest.filters).toEqual(filters)
        })
    })

    describe('addFilter()', () => {
        it('should add new filter key', () => {
            component.searchRequest.filters = {}
            component.addFilter({ key: 'type', value: 'course' })
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { f: JSON.stringify({ type: ['course'] }) } })
            )
        })

        it('should append to existing filter key', () => {
            component.searchRequest.filters = { type: ['program'] }
            component.addFilter({ key: 'type', value: 'course' })
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { f: JSON.stringify({ type: ['program', 'course'] }) } })
            )
        })
    })

    describe('removeFilter()', () => {
        it('should remove specific filter value', () => {
            component.searchRequest.filters = { type: ['course', 'program'] }
            component.removeFilter({ key: 'type', value: 'course' })
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { f: JSON.stringify({ type: ['program'] }) } })
            )
        })

        it('should remove empty filter key after removal', () => {
            component.searchRequest.filters = { type: ['course'] }
            component.removeFilter({ key: 'type', value: 'course' })
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { f: JSON.stringify({}) } })
            )
        })
    })

    describe('removeFilters()', () => {
        it('should navigate with f: null', () => {
            component.removeFilters()
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [],
                { queryParams: { f: null }, queryParamsHandling: 'merge', relativeTo: mockActivated.parent }
            )
        })
    })

    describe('advancedFilterClick()', () => {
        it('should navigate with advanced filter', () => {
            const filter = { filters: { type: ['course'] }, title: 'Courses' }
            component.advancedFilterClick(filter as any)
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { f: JSON.stringify({ type: ['course'] }) } })
            )
        })
    })

    describe('applyFilters()', () => {
        it('should call addFilter when filter is not in current filters', () => {
            const addFilterSpy = jest.spyOn(component, 'addFilter')
            component.searchRequest.filters = {}
            component.applyFilters({ unitFilter: { id: '1', type: 'course' } as any, filterType: 'type' })
            expect(addFilterSpy).toHaveBeenCalledWith({ key: 'type', value: 'course' })
        })

        it('should call removeFilter when filter is already selected', () => {
            const removeFilterSpy = jest.spyOn(component, 'removeFilter')
            component.searchRequest.filters = { type: ['course'] }
            component.applyFilters({ unitFilter: { id: '1', type: 'course' } as any, filterType: 'type' })
            expect(removeFilterSpy).toHaveBeenCalledWith({ key: 'type', value: 'course' })
        })
    })

    describe('filterUnitResponseTrackBy()', () => {
        it('should return filter.id', () => {
            const result = component.filterUnitResponseTrackBy({ id: 'filter-1' } as any)
            expect(result).toBe('filter-1')
        })
    })

    describe('filterUnitTrackBy()', () => {
        it('should return filter.id', () => {
            const result = component.filterUnitTrackBy({ id: 'unit-1' } as any)
            expect(result).toBe('unit-1')
        })
    })

    describe('lowerCaseFilter()', () => {
        it('should create lowercase property alias', () => {
            const obj: any = { TestKey: { value: null } }
            component.lowerCaseFilter(obj, ['TestKey'])
            expect(Object.prototype.hasOwnProperty.call(obj, 'testkey')).toBe(true)
        })

        it('should recursively lower case nested value keys', () => {
            const nested: any = { NestedKey: 'value' }
            const obj: any = { TestKey: { value: nested } }
            component.lowerCaseFilter(obj, ['TestKey'])
            expect(Object.prototype.hasOwnProperty.call(obj, 'testkey')).toBe(true)
        })
    })
})
