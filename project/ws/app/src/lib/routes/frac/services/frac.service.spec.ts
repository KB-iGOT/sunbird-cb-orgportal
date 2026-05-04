import { of } from 'rxjs'
import { FracService } from './frac.service'

describe('FracService', () => {
  let service: FracService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockConfigSvc = { baseUrl: 'http://test.com' }
    mockHttp = { get: jest.fn() }
    service = new FracService(mockConfigSvc, mockHttp)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('fetchFrac()', () => {
    it('should call GET with correct URL', async () => {
      const mockFrac = { id: 'frac-data' }
      mockHttp.get.mockReturnValue(of(mockFrac))

      const result = await service.fetchFrac()
      expect(mockHttp.get).toHaveBeenCalledWith('http://test.com/feature/frac.json')
      expect(result).toEqual(mockFrac)
    })

    it('should return a promise', () => {
      mockHttp.get.mockReturnValue(of({}))
      const result = service.fetchFrac()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve with frac data', async () => {
      const fracData = { roles: ['admin'], competencies: [] }
      mockHttp.get.mockReturnValue(of(fracData))

      const result = await service.fetchFrac()
      expect(result).toEqual(fracData)
    })
  })
})
