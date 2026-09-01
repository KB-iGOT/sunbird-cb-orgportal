
import { ProfileV3Service } from '../services/profile_v3.service' // adjust path as necessary
import { of, throwError } from 'rxjs'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { CompetencyResolverService } from './competency.resolver'

jest.mock('../services/profile_v3.service') // Automatically mocks ProfileV3Service

describe('CompetencyResolverService', () => {
  let resolver: CompetencyResolverService
  let mockProfileService: jest.Mocked<ProfileV3Service>

  beforeEach(() => {
    mockProfileService = new ProfileV3Service(null as any) as jest.Mocked<ProfileV3Service> // Mocking ProfileV3Service
    resolver = new CompetencyResolverService(mockProfileService) // Inject mocked service
  })

  it('should resolve data when getAllCompetencies returns data successfully', (done) => {
    // Arrange: Mock the getAllCompetencies method to return an observable with data
    const mockResponse = { responseData: [{ id: 1, name: 'Competency 1' }] }
    mockProfileService.getAllCompetencies.mockReturnValue(of(mockResponse))

    const mockRoute = {} as ActivatedRouteSnapshot
    const mockState = {} as RouterStateSnapshot

    // Act: Call the resolver's resolve method
    resolver.resolve(mockRoute, mockState).subscribe((result) => {
      // Assert: Verify that the data is processed correctly
      expect(result.data).toEqual(mockResponse.responseData)
      expect(result.error).toBeNull()
      done() // Indicate that the async operation is complete
    })
  })

  it('should handle error when getAllCompetencies fails', (done) => {
    // Arrange: Mock the getAllCompetencies method to return an observable that throws an error
    const mockError = { message: 'Error fetching competencies' }
    mockProfileService.getAllCompetencies.mockReturnValue(throwError(mockError))

    const mockRoute = {} as ActivatedRouteSnapshot
    const mockState = {} as RouterStateSnapshot

    // Act: Call the resolver's resolve method
    resolver.resolve(mockRoute, mockState).subscribe((result) => {
      // Assert: Verify that the error is handled correctly
      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
      done() // Indicate that the async operation is complete
    })
  })
})
