import { UserWorkResolverService } from './user-work-resolver.service'
import { UserWorkService } from './user-work.service'
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot } from '@angular/router'

describe('UserWorkResolverService', () => {
  let resolver: UserWorkResolverService
  let mockUserWorkService: jest.Mocked<UserWorkService>

  beforeEach(() => {
    // Create a mock UserWorkService
    mockUserWorkService = {
      fetchUserWorkAllocation: jest.fn(),
    } as any

    // Instantiate the resolver with the mocked service
    resolver = new UserWorkResolverService(mockUserWorkService)
  })

  // Increase Jest timeout to handle longer asynchronous operations
  jest.setTimeout(10000) // Set timeout to 10 seconds

  it('should resolve successfully with data when fetchUserWorkAllocation succeeds', (done) => {
    const route: ActivatedRouteSnapshot = { params: { officerId: '123' } } as any

    const mockResponse = {
      result: {
        data: {
          id: '456',
          userEmail: 'test@example.com',
          userPosition: 'Test Position',
        },
      },
      status: 'OK',
      message: 'Successful',
    }

    // Mock the fetchUserWorkAllocation method to return an observable with the mock response
    mockUserWorkService.fetchUserWorkAllocation.mockReturnValue(of(mockResponse))

    // Resolve the route and subscribe to the observable
    resolver.resolve(route).subscribe({
      next: (result) => {
        expect(result).toEqual({ data: mockResponse.result.data, error: null })
        done()  // Ensure done() is called when the observable emits a value
      },
      error: (err) => {
        done(err)  // If there is an error, we pass it to `done` to fail the test
      },
    })
  })


  it('should handle error when fetchUserWorkAllocation fails', (done) => {
    const route: ActivatedRouteSnapshot = { params: { officerId: '123' } } as any

    const mockError = new Error('Something went wrong')

    // Mock the fetchUserWorkAllocation method to return an observable that emits an error
    mockUserWorkService.fetchUserWorkAllocation.mockReturnValue(throwError(() => mockError))

    // Resolve the route and subscribe to the observable
    resolver.resolve(route).subscribe({
      next: () => {
        done('Expected an error, but got success')  // Fail the test if the observable emits a success
      },
      error: (err) => {
        expect(err).toEqual(mockError)  // Check that the error returned is the one we expect
        done()  // Call done() to indicate the test has finished
      },
    })
  })

})
