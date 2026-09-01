import { of, throwError } from 'rxjs'
import { PreviewComponent } from './preview.component'

describe('PreviewComponent', () => {
  let component: PreviewComponent
  let mockRoute: any
  let mockExploreContentService: any
  let mockLoaderService: any
  let mockRouter: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('test-identifier'),
        },
      },
    }

    mockExploreContentService = {
      extendedContentRead: jest.fn().mockReturnValue(
        of({ result: { content: { name: 'Test Content', identifier: 'test-identifier' } } })
      ),
    }

    mockLoaderService = {
      changeLoaderState: jest.fn(),
    }

    mockRouter = {
      navigate: jest.fn(),
    }

    component = new PreviewComponent(
      mockRoute,
      mockExploreContentService,
      mockLoaderService,
      mockRouter
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.contentId).toBeNull()
    expect(component.contentData).toBeUndefined()
    expect(component.contentLoaded).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should set loaderState to true and fetch content when contentId exists', () => {
      component.ngOnInit()

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(component.contentId).toBe('test-identifier')
      expect(mockExploreContentService.extendedContentRead).toHaveBeenCalledWith('test-identifier')
      expect(component.contentData).toEqual({ name: 'Test Content', identifier: 'test-identifier' })
      expect(component.contentLoaded).toBe(true)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should set loaderState to false when contentId is null', () => {
      mockRoute.snapshot.paramMap.get.mockReturnValue(null)
      component.ngOnInit()

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(component.contentId).toBeNull()
      expect(mockExploreContentService.extendedContentRead).not.toHaveBeenCalled()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(component.contentLoaded).toBe(false)
    })

    it('should set loaderState to false on error', () => {
      mockExploreContentService.extendedContentRead.mockReturnValue(
        throwError(() => new Error('Network error'))
      )

      component.ngOnInit()

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(component.contentLoaded).toBe(false)
    })
  })

  describe('goBack', () => {
    it('should navigate to explore-content route', () => {
      component.goBack()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'home', 'explore-content'])
    })
  })
})

