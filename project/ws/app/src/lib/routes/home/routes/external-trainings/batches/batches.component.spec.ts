import { BatchesComponent } from './batches.component'
import { of, throwError } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../src/app/services/loader.service'

describe('BatchesComponent', () => {
  let component: BatchesComponent
  let mockExternalTrainingsSvc: any
  let mockRoute: any
  let mockLoaderService: any
  let mockRouter: any

  beforeEach(() => {
    mockExternalTrainingsSvc = {
      getExternalTrainingDetails: jest.fn(),
      setTrainingName: jest.fn(),
    }
    mockRoute = {
      parent: { snapshot: { params: { id: 'training123' } } },
      snapshot: { params: {} },
    }
    mockLoaderService = new LoaderService()
    jest.spyOn(mockLoaderService, 'changeLoaderState')
    mockRouter = { navigate: jest.fn() }

    component = new BatchesComponent(
      mockExternalTrainingsSvc,
      mockRoute,
      mockLoaderService,
      mockRouter,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getRoutingDetails', () => {
      jest.spyOn(component as any, 'getRoutingDetails').mockImplementation(() => { })
      component.ngOnInit()
      expect((component as any).getRoutingDetails).toHaveBeenCalled()
    })
  })

  // ─── getRoutingDetails ────────────────────────────────────────────────────

  describe('getRoutingDetails', () => {
    it('should call getTrainingDetails when id is present', () => {
      jest.spyOn(component as any, 'getTrainingDetails').mockImplementation(() => { })
      component.getRoutingDetails()
      expect((component as any).getTrainingDetails).toHaveBeenCalledWith('training123')
    })

    it('should not call getTrainingDetails when id is absent', () => {
      mockRoute.parent = { snapshot: { params: {} } }
      jest.spyOn(component as any, 'getTrainingDetails').mockImplementation(() => { })
      component.getRoutingDetails()
      expect((component as any).getTrainingDetails).not.toHaveBeenCalled()
    })

    it('should not call getTrainingDetails when parent is null', () => {
      mockRoute.parent = null
      jest.spyOn(component as any, 'getTrainingDetails').mockImplementation(() => { })
      component.getRoutingDetails()
      expect((component as any).getTrainingDetails).not.toHaveBeenCalled()
    })
  })

  // ─── getTrainingDetails ───────────────────────────────────────────────────

  describe('getTrainingDetails', () => {
    const makeResponse = (overrides: any = {}) => ({
      result: {
        event: {
          name: 'Training Name',
          eventType: 'online',
          description: 'Desc',
          duration: 7200,
          competencies_v6: [{ id: 'c1' }],
          batches: [{ batchId: 'b1' }],
          ...overrides,
        }
      }
    })

    it('should populate training and batches on success (integer hours)', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(of(makeResponse()))
      component.getTrainingDetails('training123')
      expect(component.training.title).toBe('Training Name')
      expect(component.batches).toEqual([{ batchId: 'b1' }])
      expect(component.durationInMinutes).toBe(120)
      expect(component.training.learningHours).toBe('2 Hours')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should set learningHours as singular Hour when 1 hour', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(of(makeResponse({ duration: 3600 })))
      component.getTrainingDetails('training123')
      expect(component.training.learningHours).toBe('1 Hour')
    })

    it('should use toFixed(2) when hours not integer', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(of(makeResponse({ duration: 5400 })))
      component.getTrainingDetails('training123')
      expect(component.training.learningHours).toBe('1.50 Hours')
    })

    it('should use default empty arrays when competencies_v6 and batches absent', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of({ result: { event: { name: 'T', eventType: 'x', description: 'D', duration: 0 } } })
      )
      component.getTrainingDetails('training123')
      expect(component.training.competency_v6).toEqual([])
      expect(component.batches).toEqual([])
    })

    it('should handle API error', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        throwError(() => new Error('Network error'))
      )
      component.getTrainingDetails('training123')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(component.isLoading).toBe(false)
    })
  })

  // ─── viewBatch ────────────────────────────────────────────────────────────

  describe('viewBatch', () => {
    it('should navigate relative to route', () => {
      component.viewBatch({ batchId: 'batch1' })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['batch1'], { relativeTo: mockRoute })
    })
  })

  // ─── LoaderService direct coverage ───────────────────────────────────────

  describe('LoaderService', () => {
    it('should emit value via changeLoaderState', () => {
      let emitted: boolean | undefined
      mockLoaderService.$currentState.subscribe((v: boolean) => (emitted = v))
      mockLoaderService.changeLoaderState(true)
      expect(emitted).toBe(true)
    })
  })
})

