import { DetailsComponent } from './details.component'
import { of, throwError } from 'rxjs'

describe('DetailsComponent', () => {
  let component: DetailsComponent
  let mockRoute: any
  let mockExternalTrainingsSvc: any
  let mockLoaderService: any

  const makeTrainingResponse = (overrides: any = {}) => ({
    result: {
      event: {
        name: 'Test Training',
        duration: 3600,
        eventType: 'Online',
        description: 'Test Objective',
        competencies_v6: [],
        ...overrides,
      },
    },
  })

  beforeEach(() => {
    mockRoute = {
      parent: {
        snapshot: {
          params: { id: 'training-001' },
        },
      },
    }

    mockExternalTrainingsSvc = {
      getExternalTrainingDetails: jest.fn().mockReturnValue(of(makeTrainingResponse())),
      setTrainingName: jest.fn(),
    }

    mockLoaderService = {
      changeLoaderState: jest.fn(),
    }

    component = new DetailsComponent(mockRoute, mockExternalTrainingsSvc, mockLoaderService)
  })

  afterEach(() => jest.clearAllMocks())

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isTableExpanded to true', () => {
    expect(component.isTableExpanded).toBe(true)
  })

  it('should default listView to true', () => {
    expect(component.listView).toBe(true)
  })

  it('should default training to empty object', () => {
    expect(component.training).toEqual({})
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getRoutingDetails on init', () => {
      const spy = jest.spyOn(component, 'getRoutingDetails')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── getRoutingDetails ────────────────────────────────────────────────────────

  describe('getRoutingDetails', () => {
    it('should call getTrainingDetails when route has an id', () => {
      const spy = jest.spyOn(component, 'getTrainingDetails')
      component.getRoutingDetails()
      expect(spy).toHaveBeenCalledWith('training-001')
    })

    it('should not call getTrainingDetails when route has no id', () => {
      mockRoute.parent.snapshot.params = {}
      const spy = jest.spyOn(component, 'getTrainingDetails')
      component.getRoutingDetails()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not throw when route.parent is null', () => {
      mockRoute.parent = null
      expect(() => component.getRoutingDetails()).not.toThrow()
    })
  })

  // ─── getTrainingDetails ───────────────────────────────────────────────────────

  describe('getTrainingDetails', () => {
    it('should set training with mapped fields on success', () => {
      component.getTrainingDetails('training-001')
      expect(component.training.title).toBe('Test Training')
      expect(component.training.deliveryMode).toBe('Online')
      expect(component.training.learningObjective).toBe('Test Objective')
    })

    it('should call setTrainingName with event name', () => {
      component.getTrainingDetails('training-001')
      expect(mockExternalTrainingsSvc.setTrainingName).toHaveBeenCalledWith('Test Training')
    })

    it('should compute learningHours as "1 Hour" for 3600 seconds (integer hours)', () => {
      component.getTrainingDetails('training-001')
      expect(component.training.learningHours).toBe('1 Hour')
    })

    it('should compute learningHours with plural "Hours" for duration > 3600s (integer)', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of(makeTrainingResponse({ duration: 7200 }))
      )
      component.getTrainingDetails('training-001')
      expect(component.training.learningHours).toBe('2 Hours')
    })

    it('should compute learningHours as decimal for fractional hours', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of(makeTrainingResponse({ duration: 5400 })) // 1.5 hours
      )
      component.getTrainingDetails('training-001')
      expect(component.training.learningHours).toBe('1.50 Hours')
    })

    it('should set learningHours to empty string when duration is 0', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of(makeTrainingResponse({ duration: 0 }))
      )
      component.getTrainingDetails('training-001')
      expect(component.training.learningHours).toBe('')
    })

    it('should map deliveryMode via deliveryModeList for known eventType', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of(makeTrainingResponse({ eventType: 'OnlineAndOffline' }))
      )
      component.getTrainingDetails('training-001')
      expect(component.training.deliveryMode).toBe('Hybrid')
    })

    it('should use eventType directly when not in deliveryModeList', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of(makeTrainingResponse({ eventType: 'Unknown' }))
      )
      component.getTrainingDetails('training-001')
      expect(component.training.deliveryMode).toBe('Unknown')
    })

    it('should default competency_v6 to [] when competencies_v6 is absent', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of({ result: { event: { name: 'T', duration: 0, eventType: 'Online' } } })
      )
      component.getTrainingDetails('training-001')
      expect(component.training.competency_v6).toEqual([])
    })

    it('should call loaderService.changeLoaderState(false) on error', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        throwError(() => new Error('HTTP error'))
      )
      component.getTrainingDetails('training-001')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should call setTrainingName with empty string when event.name is absent', () => {
      mockExternalTrainingsSvc.getExternalTrainingDetails.mockReturnValue(
        of({ result: { event: { duration: 0, eventType: 'Online' } } })
      )
      component.getTrainingDetails('training-001')
      expect(mockExternalTrainingsSvc.setTrainingName).toHaveBeenCalledWith('')
    })
  })

  // ─── competenciesValue getter ─────────────────────────────────────────────────

  describe('competenciesValue', () => {
    it('should return empty array when training is null', () => {
      component.training = null
      expect(component.competenciesValue).toEqual([])
    })

    it('should return empty array when competency_v6 has no value property', () => {
      component.training = { competency_v6: [] }
      expect(component.competenciesValue).toEqual([])
    })

    it('should return competency_v6 value array when present', () => {
      component.training = { competency_v6: { value: ['A', 'B'] } }
      expect(component.competenciesValue).toEqual(['A', 'B'])
    })
  })

  // ─── uniqueAreas getter ───────────────────────────────────────────────────────

  describe('uniqueAreas', () => {
    it('should return empty array when training has no competency_v6', () => {
      component.training = {}
      expect(component.uniqueAreas).toEqual([])
    })

    it('should return empty array when competency_v6 is empty', () => {
      component.training = { competency_v6: [] }
      expect(component.uniqueAreas).toEqual([])
    })

    it('should return unique area names', () => {
      component.training = {
        competency_v6: [
          { competencyAreaName: 'Area A', competencyThemeName: 'T1', competencySubThemeName: 'S1' },
          { competencyAreaName: 'Area B', competencyThemeName: 'T2', competencySubThemeName: 'S2' },
          { competencyAreaName: 'Area A', competencyThemeName: 'T3', competencySubThemeName: 'S3' },
        ],
      }
      expect(component.uniqueAreas).toEqual(['Area A', 'Area B'])
    })
  })

  // ─── getUniqueThemesForArea ───────────────────────────────────────────────────

  describe('getUniqueThemesForArea', () => {
    it('should return empty array when training has no competency_v6', () => {
      component.training = {}
      expect(component.getUniqueThemesForArea('Area A')).toEqual([])
    })

    it('should return empty array when competency_v6 is empty', () => {
      component.training = { competency_v6: [] }
      expect(component.getUniqueThemesForArea('Area A')).toEqual([])
    })

    it('should return unique themes for the given area', () => {
      component.training = {
        competency_v6: [
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 1' },
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 2' },
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 1' },
          { competencyAreaName: 'Area B', competencyThemeName: 'Theme 3' },
        ],
      }
      expect(component.getUniqueThemesForArea('Area A')).toEqual(['Theme 1', 'Theme 2'])
    })

    it('should return empty array for area with no matching entries', () => {
      component.training = {
        competency_v6: [
          { competencyAreaName: 'Area B', competencyThemeName: 'Theme 3' },
        ],
      }
      expect(component.getUniqueThemesForArea('Area A')).toEqual([])
    })
  })

  // ─── getSubthemesForAreaAndTheme ──────────────────────────────────────────────

  describe('getSubthemesForAreaAndTheme', () => {
    it('should return empty array when training has no competency_v6', () => {
      component.training = {}
      expect(component.getSubthemesForAreaAndTheme('A', 'T')).toEqual([])
    })

    it('should return empty array when competency_v6 is empty', () => {
      component.training = { competency_v6: [] }
      expect(component.getSubthemesForAreaAndTheme('A', 'T')).toEqual([])
    })

    it('should return subtheme names matching area and theme', () => {
      component.training = {
        competency_v6: [
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 1', competencySubThemeName: 'Sub 1' },
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 1', competencySubThemeName: 'Sub 2' },
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 2', competencySubThemeName: 'Sub 3' },
          { competencyAreaName: 'Area B', competencyThemeName: 'Theme 1', competencySubThemeName: 'Sub 4' },
        ],
      }
      expect(component.getSubthemesForAreaAndTheme('Area A', 'Theme 1')).toEqual(['Sub 1', 'Sub 2'])
    })
  })

  // ─── getTotalRowsForArea ──────────────────────────────────────────────────────

  describe('getTotalRowsForArea', () => {
    it('should return 0 when no competencies exist', () => {
      component.training = { competency_v6: [] }
      expect(component.getTotalRowsForArea('Area A')).toBe(0)
    })

    it('should return total subtheme count across all themes for the area', () => {
      component.training = {
        competency_v6: [
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 1', competencySubThemeName: 'Sub 1' },
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 1', competencySubThemeName: 'Sub 2' },
          { competencyAreaName: 'Area A', competencyThemeName: 'Theme 2', competencySubThemeName: 'Sub 3' },
          { competencyAreaName: 'Area B', competencyThemeName: 'Theme 3', competencySubThemeName: 'Sub 4' },
        ],
      }
      // Theme 1 has 2 subthemes, Theme 2 has 1 → total 3 for Area A
      expect(component.getTotalRowsForArea('Area A')).toBe(3)
    })

    it('should return 0 for an area not present in competencies', () => {
      component.training = {
        competency_v6: [
          { competencyAreaName: 'Area B', competencyThemeName: 'Theme 1', competencySubThemeName: 'Sub 1' },
        ],
      }
      expect(component.getTotalRowsForArea('Area X')).toBe(0)
    })
  })
})
