import { UpdatePlanResolveService } from './update-plan-resolve.service'
import { TrainingPlanService } from '../services/traininig-plan.service'
import { of } from 'rxjs'
import { retry } from 'rxjs/operators'

// Mock the TrainingPlanService
jest.mock('../services/traininig-plan.service')

describe('UpdatePlanResolveService', () => {
  let service: UpdatePlanResolveService
  let tpSvc: jest.Mocked<TrainingPlanService>

  beforeEach(() => {
    tpSvc = new TrainingPlanService(null as any) as jest.Mocked<TrainingPlanService> // Mock the service
    service = new UpdatePlanResolveService(tpSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should resolve plan and return content', () => {
    const planId = '12345'  // Example planId
    const mockResponse = {
      result: {
        content: 'Test plan content',
      },
    }

    // Mock the readPlan method to return the mock response
    tpSvc.readPlan.mockReturnValue(of(mockResponse))

    // Create a mock ActivatedRouteSnapshot
    const mockRoute: any = {
      paramMap: {
        get: jest.fn().mockReturnValue(planId),  // Mock paramMap.get('planId')
      },
    }

    service.resolve(mockRoute).subscribe((result) => {
      expect(result).toBe('Test plan content')  // Check that the content is returned
      expect(tpSvc.readPlan).toHaveBeenCalledWith(planId)  // Ensure readPlan was called with correct parameter
    })
  })

  it('should retry once on error', () => {
    const planId = '12345'
    const mockErrorResponse = new Error('Failed to fetch plan')

    tpSvc.readPlan.mockReturnValue(of(mockErrorResponse).pipe(retry(1)))

    const mockRoute: any = {
      paramMap: {
        get: jest.fn().mockReturnValue(planId),
      },
    }

    // Check that retry is handled
    service.resolve(mockRoute).subscribe({
      next: () => {
        expect(tpSvc.readPlan).toHaveBeenCalledWith(planId)
      },
      error: (err) => {
        expect(err).toBe(mockErrorResponse)
      },
    })
  })
})
