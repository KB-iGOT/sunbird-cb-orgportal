import { OrgProfileService, IATIOnbaording } from './org-profile.service'
import { of } from 'rxjs'

// Mock HttpClient
const mockHttpClient = {
  patch: jest.fn()
}

describe('OrgProfileService', () => {
  let service: OrgProfileService

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create service instance with mocked HttpClient
    service = new OrgProfileService(mockHttpClient as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize formValues with correct structure', () => {
    expect(service.formValues).toEqual({
      instituteProfile: {},
      rolesAndFunctions: {},
      infrastructure: {},
      trainingPrograms: {},
      research: {},
      consultancy: {},
      faculty: {},
      platformWalkthrough: {},
    })
  })

  it('should initialize formStatus with correct structure', () => {
    expect(service.formStatus).toEqual({
      instituteProfile: false,
      rolesAndFunctions: false,
      infrastructure: false,
      trainingPrograms: false,
      research: false,
      consultancy: false,
      faculty: false,
      platformWalkthrough: false,
    })
  })

  describe('updateOrgProfileDetails', () => {
    it('should make HTTP PATCH call with correct parameters', () => {
      const testData = { name: 'Test Organization' }
      const expectedResponse = { success: true }

      mockHttpClient.patch.mockReturnValue(of(expectedResponse))

      const result = service.updateOrgProfileDetails(testData)

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/apis/proxies/v8/org/v1/profile/patch',
        { request: testData }
      )

      result.subscribe(response => {
        expect(response).toEqual(expectedResponse)
      })
    })

    it('should return observable from HTTP client', () => {
      const testData = { id: 123 }
      const mockResponse = { status: 'updated' }

      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      const result = service.updateOrgProfileDetails(testData)

      expect(result).toBeDefined()
      result.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })
  })

  describe('updateLocalFormValue', () => {
    it('should update formValues for instituteProfile', () => {
      const testValue = { name: 'Test Institute' }

      service.updateLocalFormValue('instituteProfile', testValue)

      expect(service.formValues.instituteProfile).toEqual(testValue)
    })

    it('should update formValues for all possible keys', () => {
      const keys: (keyof IATIOnbaording)[] = [
        'instituteProfile',
        'rolesAndFunctions',
        'infrastructure',
        'trainingPrograms',
        'research',
        'consultancy',
        'faculty',
        'platformWalkthrough'
      ]

      keys.forEach(key => {
        const testValue = { [`${key}Data`]: 'test' }
        service.updateLocalFormValue(key, testValue)
        expect(service.formValues[key]).toEqual(testValue)
      })
    })

    it('should handle null and undefined values', () => {
      service.updateLocalFormValue('research', null)
      expect(service.formValues.research).toBeNull()

      service.updateLocalFormValue('consultancy', undefined)
      expect(service.formValues.consultancy).toBeUndefined()
    })
  })

  describe('getLocalFormValue', () => {
    it('should return correct value for given key', () => {
      const testValue = { name: 'Test Data' }
      service.formValues.research = testValue

      const result = service.getLocalFormValue('research')

      expect(result).toEqual(testValue)
    })

    it('should return correct values for all keys', () => {
      const keys: (keyof IATIOnbaording)[] = [
        'instituteProfile',
        'rolesAndFunctions',
        'infrastructure',
        'trainingPrograms',
        'research',
        'consultancy',
        'faculty',
        'platformWalkthrough'
      ]

      keys.forEach(key => {
        const testValue = { [`${key}Data`]: 'test' }
        service.formValues[key] = testValue
        expect(service.getLocalFormValue(key)).toEqual(testValue)
      })
    })

    it('should return initial empty object for unmodified keys', () => {
      const result = service.getLocalFormValue('infrastructure')
      expect(result).toEqual({})
    })
  })

  describe('updateFormStatus', () => {
    it('should update formStatus to true', () => {
      service.updateFormStatus('consultancy', true)

      expect(service.formStatus.consultancy).toBe(true)
    })

    it('should update formStatus to false', () => {
      service.updateFormStatus('faculty', false)

      expect(service.formStatus.faculty).toBe(false)
    })

    it('should update formStatus for all possible keys', () => {
      const keys: (keyof IATIOnbaording)[] = [
        'instituteProfile',
        'rolesAndFunctions',
        'infrastructure',
        'trainingPrograms',
        'research',
        'consultancy',
        'faculty',
        'platformWalkthrough'
      ]

      keys.forEach((key, index) => {
        const status = index % 2 === 0 // Alternate between true/false
        service.updateFormStatus(key, status)
        expect(service.formStatus[key]).toBe(status)
      })
    })
  })

  describe('getFormStatus', () => {
    it('should return correct status for given key', () => {
      service.formStatus.faculty = true

      const result = service.getFormStatus('faculty')

      expect(result).toBe(true)
    })

    it('should return false for initial status', () => {
      const result = service.getFormStatus('platformWalkthrough')

      expect(result).toBe(false)
    })

    it('should return correct status for all keys', () => {
      const keys: (keyof IATIOnbaording)[] = [
        'instituteProfile',
        'rolesAndFunctions',
        'infrastructure',
        'trainingPrograms',
        'research',
        'consultancy',
        'faculty',
        'platformWalkthrough'
      ]

      keys.forEach((key, index) => {
        const status = index % 2 === 0 // Alternate between true/false
        service.formStatus[key] = status
        expect(service.getFormStatus(key)).toBe(status)
      })
    })
  })

  describe('Integration tests', () => {
    it('should maintain state consistency between updates and gets', () => {
      const testValue = { description: 'Test Description' }
      const testStatus = true

      service.updateLocalFormValue('trainingPrograms', testValue)
      service.updateFormStatus('trainingPrograms', testStatus)

      expect(service.getLocalFormValue('trainingPrograms')).toEqual(testValue)
      expect(service.getFormStatus('trainingPrograms')).toBe(testStatus)
    })

    it('should handle multiple sequential updates', () => {
      service.updateLocalFormValue('infrastructure', { first: 'value1' })
      service.updateLocalFormValue('infrastructure', { second: 'value2' })

      expect(service.getLocalFormValue('infrastructure')).toEqual({ second: 'value2' })
    })
  })
})