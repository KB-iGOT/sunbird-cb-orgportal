jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  NsAutoComplete: {},
}), { virtual: true })

jest.mock('../../services/app-toc.service', () => ({
  AppTocService: class {
    fetchContentCohorts = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { AppTocCohortsComponent } from './app-toc-cohorts.component'
import { NsCohorts } from '../../models/app-toc.model'

describe('AppTocCohortsComponent (components)', () => {
  let component: AppTocCohortsComponent
  let mockTocSvc: any
  let mockConfigSvc: any
  let mockRouter: any

  beforeEach(() => {
    mockTocSvc = {
      fetchContentCohorts: jest.fn().mockReturnValue(of([{ userId: 'u1', name: 'User1' }])),
    }

    mockConfigSvc = {
      restrictedFeatures: new Set<string>(),
    }

    mockRouter = {
      navigate: jest.fn(),
    }

    component = new AppTocCohortsComponent(mockTocSvc, mockConfigSvc, mockRouter)
    component.content = { identifier: 'content-001' } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  describe('enableFeature getter', () => {
    it('should return true when cohorts is not restricted', () => {
      expect(component.enableFeature).toBe(true)
    })

    it('should return false when cohorts is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['cohorts'])
      expect(component.enableFeature).toBe(false)
    })

    it('should return false when restrictedFeatures is null', () => {
      mockConfigSvc.restrictedFeatures = null
      expect(component.enableFeature).toBe(false)
    })
  })

  describe('enablePeopleSearch getter', () => {
    it('should return true when peopleSearch is not restricted', () => {
      expect(component.enablePeopleSearch).toBe(true)
    })

    it('should return false when peopleSearch is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['peopleSearch'])
      expect(component.enablePeopleSearch).toBe(false)
    })

    it('should return false when restrictedFeatures is null', () => {
      mockConfigSvc.restrictedFeatures = null
      expect(component.enablePeopleSearch).toBe(false)
    })
  })

  describe('goToUserProfile', () => {
    it('should navigate to person profile when peopleSearch is enabled', () => {
      const user = { wid: 'user-wid-001' } as any
      component.goToUserProfile(user)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/person-profile', 'user-wid-001'])
    })

    it('should not navigate when peopleSearch is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['peopleSearch'])
      const user = { wid: 'user-wid-001' } as any
      component.goToUserProfile(user)
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('getUserFullName', () => {
    it('should return full name when first_name and last_name are set', () => {
      const user = { first_name: 'John', last_name: 'Doe' }
      expect(component.getUserFullName(user)).toBe('John Doe')
    })

    it('should trim whitespace from first and last name', () => {
      const user = { first_name: '  Jane ', last_name: ' Smith  ' }
      expect(component.getUserFullName(user)).toBe('Jane Smith')
    })

    it('should return empty string when user is null', () => {
      expect(component.getUserFullName(null)).toBe('')
    })

    it('should return empty string when first_name is missing', () => {
      const user = { last_name: 'Doe' }
      expect(component.getUserFullName(user)).toBe('')
    })

    it('should return empty string when last_name is missing', () => {
      const user = { first_name: 'John' }
      expect(component.getUserFullName(user)).toBe('')
    })
  })

  describe('fetchCohorts', () => {
    it('should fetch cohorts when not already fetched and not forPreview', () => {
      component.forPreview = false
      component.fetchCohorts(NsCohorts.ECohortTypes.ACTIVE_USERS)

      expect(mockTocSvc.fetchContentCohorts).toHaveBeenCalledWith(
        NsCohorts.ECohortTypes.ACTIVE_USERS,
        'content-001'
      )
    })

    it('should store fetched cohorts in cohortResults', (done) => {
      component.forPreview = false
      component.fetchCohorts(NsCohorts.ECohortTypes.ACTIVE_USERS)

      setTimeout(() => {
        expect(component.cohortResults[NsCohorts.ECohortTypes.ACTIVE_USERS]).toEqual({
          contents: [{ userId: 'u1', name: 'User1' }],
          hasError: false,
        })
        done()
      })
    })

    it('should set hasError true when fetchContentCohorts fails', (done) => {
      mockTocSvc.fetchContentCohorts.mockReturnValue(throwError('error'))
      component.forPreview = false
      component.fetchCohorts(NsCohorts.ECohortTypes.ACTIVE_USERS)

      setTimeout(() => {
        expect(component.cohortResults[NsCohorts.ECohortTypes.ACTIVE_USERS]).toEqual({
          contents: [],
          hasError: true,
        })
        done()
      })
    })

    it('should not fetch again when cohortResults already has the type', () => {
      component.forPreview = false
      component.cohortResults[NsCohorts.ECohortTypes.ACTIVE_USERS] = { contents: [], hasError: false }
      component.fetchCohorts(NsCohorts.ECohortTypes.ACTIVE_USERS)

      expect(mockTocSvc.fetchContentCohorts).not.toHaveBeenCalled()
    })

    it('should set empty cohorts when forPreview is true', () => {
      component.forPreview = true
      component.fetchCohorts(NsCohorts.ECohortTypes.ACTIVE_USERS)

      expect(component.cohortResults[NsCohorts.ECohortTypes.ACTIVE_USERS]).toEqual({
        contents: [],
        hasError: false,
      })
      expect(mockTocSvc.fetchContentCohorts).not.toHaveBeenCalled()
    })
  })
})
