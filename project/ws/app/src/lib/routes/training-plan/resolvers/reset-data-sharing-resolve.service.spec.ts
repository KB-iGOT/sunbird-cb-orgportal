import { ResetDataSharingResolveService } from './reset-data-sharing-resolve.service'
import { ActivatedRouteSnapshot } from '@angular/router'

describe('ResetDataSharingResolveService', () => {
  let resolver: ResetDataSharingResolveService
  let mockTrainingPlanDataSharingService: any
  let mockActivatedRouteSnapshot: Partial<ActivatedRouteSnapshot>

  beforeEach(() => {
    // Mock the TrainingPlanDataSharingService
    mockTrainingPlanDataSharingService = {
      resetAllObjects: jest.fn()
    }

    // Create resolver with mocked dependencies
    resolver = new ResetDataSharingResolveService(
      mockTrainingPlanDataSharingService
    )

    // Mock ActivatedRouteSnapshot
    mockActivatedRouteSnapshot = {}
  })

  it('should be created', () => {
    expect(resolver).toBeTruthy()
  })

  it('should call resetAllObjects and return empty object observable', (done) => {
    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot
    )

    // Assert
    expect(mockTrainingPlanDataSharingService.resetAllObjects).toHaveBeenCalledTimes(1)

    result.subscribe(data => {
      expect(data).toEqual({})
      done()
    })
  })

  it('should call resetAllObjects even if route is different', (done) => {
    // Arrange
    mockActivatedRouteSnapshot = {
      params: { someParam: 'value' },
      queryParams: { someQuery: 'queryValue' }
    }

    // Act
    const result = resolver.resolve(
      mockActivatedRouteSnapshot as ActivatedRouteSnapshot
    )

    // Assert
    expect(mockTrainingPlanDataSharingService.resetAllObjects).toHaveBeenCalledTimes(1)

    result.subscribe(data => {
      expect(data).toEqual({})
      done()
    })
  })

  // Testing implementation detail - checking that a new empty object is returned
  it('should return a new object each time', () => {
    // Act
    const result1 = resolver.resolve(mockActivatedRouteSnapshot as ActivatedRouteSnapshot)
    const result2 = resolver.resolve(mockActivatedRouteSnapshot as ActivatedRouteSnapshot)

    // Assert
    // This verifies that each call returns a different object reference
    expect(result1).not.toBe(result2)
  })
})