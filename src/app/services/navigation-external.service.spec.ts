import { NavigationExternalService } from './navigation-external.service'
import { fromEvent } from 'rxjs'

// Mock dependencies
jest.mock('rxjs', () => ({
    fromEvent: jest.fn()
}))

// Mock Router class
const mockRouter = {
    navigate: jest.fn(),
    url: '/current-path?param=value'
}

describe('NavigationExternalService', () => {
    let service: NavigationExternalService
    let mockFromEvent: jest.MockedFunction<typeof fromEvent>
    let mockSubscribe: jest.Mock

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()

        // Create mock subscribe function
        mockSubscribe = jest.fn()

        // Mock fromEvent to return an observable with subscribe method
        mockFromEvent = fromEvent as jest.MockedFunction<typeof fromEvent>
        mockFromEvent.mockReturnValue({
            subscribe: mockSubscribe
        } as any)

        // Create service instance
        service = new NavigationExternalService(mockRouter as any)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('constructor', () => {
        it('should create service instance', () => {
            expect(service).toBeDefined()
            expect(service.dummy).toBe(1)
        })

        it('should set up event listener for NAVIGATION_DATA_INCOMING', () => {
            expect(mockFromEvent).toHaveBeenCalledWith(document, 'NAVIGATION_DATA_INCOMING')
            expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function))
        })

        it('should call navigateTo when event is received', () => {
            // Get the callback function passed to subscribe
            const eventCallback = mockSubscribe.mock.calls[0][0]

            // Spy on navigateTo method
            const navigateToSpy = jest.spyOn(service, 'navigateTo')

            // Mock event data
            const mockEvent = {
                detail: {
                    url: '/test-url',
                    params: { testParam: 'testValue' }
                }
            }

            // Call the event callback
            eventCallback(mockEvent)

            expect(navigateToSpy).toHaveBeenCalledWith('/test-url', { testParam: 'testValue' })
        })
    })

    describe('init', () => {
        it('should increment dummy property', () => {
            const initialDummy = service.dummy
            service.init()
            expect(service.dummy).toBe(initialDummy + 1)
        })

        it('should increment dummy multiple times', () => {
            service.init()
            service.init()
            service.init()
            expect(service.dummy).toBe(4)
        })
    })

    describe('navigateTo', () => {
        beforeEach(() => {
            mockRouter.url = '/current-path?existing=param'
        })

        it('should navigate to url without params', () => {
            service.navigateTo('/test-url')

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        ref: encodeURIComponent('/current-path?existing=param')
                    }
                }
            )
        })

        it('should navigate to url with params', () => {
            const params = { param1: 'value1', param2: 'value2' }
            service.navigateTo('/test-url', params)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        param1: 'value1',
                        param2: 'value2',
                        ref: encodeURIComponent('/current-path?existing=param')
                    }
                }
            )
        })

        it('should preserve existing ref param when provided', () => {
            const params = { param1: 'value1', ref: '/existing-ref' }
            service.navigateTo('/test-url', params)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        param1: 'value1',
                        ref: '/existing-ref'
                    }
                }
            )
        })

        it('should handle router url with existing ref parameter', () => {
            mockRouter.url = '/current-path?ref=old-ref&other=param'

            service.navigateTo('/test-url')

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        ref: encodeURIComponent('/current-path?other=param')
                    }
                }
            )
        })

        it('should handle router url ending with question mark', () => {
            mockRouter.url = '/current-path?ref=old-ref&'

            service.navigateTo('/test-url')

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        ref: encodeURIComponent('/current-path')
                    }
                }
            )
        })

        it('should handle empty params object', () => {
            service.navigateTo('/test-url', {})

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        ref: encodeURIComponent('/current-path?existing=param')
                    }
                }
            )
        })

        it('should handle null params', () => {
            service.navigateTo('/test-url', null)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        ref: encodeURIComponent('/current-path?existing=param')
                    }
                }
            )
        })

        it('should handle undefined params', () => {
            service.navigateTo('/test-url', undefined)

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/test-url'],
                {
                    queryParams: {
                        ref: encodeURIComponent('/current-path?existing=param')
                    }
                }
            )
        })
    })
})