import { PipeDurationTransformPipe } from './pipe-duration-transform.pipe'

// Mock moment if needed
jest.mock('moment', () => {
  const momentMock = {
    duration: jest.fn().mockReturnThis(),
    days: jest.fn().mockReturnValue(1),
    asMilliseconds: jest.fn().mockReturnValue(1000),
    utc: jest.fn().mockReturnThis(),
    format: jest.fn(),
  };
  (momentMock as any).utc = jest.fn().mockReturnValue(momentMock)
  return momentMock
})

describe('PipeDurationTransformPipe', () => {
  let pipe: PipeDurationTransformPipe

  beforeEach(() => {
    pipe = new PipeDurationTransformPipe()
    jest.clearAllMocks()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return empty string for zero or negative values', () => {
    expect(pipe.transform(0, 'time24')).toBe('')
    expect(pipe.transform(-10, 'time24')).toBe('')
  })



  describe('hms format', () => {


    it('should handle combinations correctly', () => {
      expect(pipe.transform(3660, 'hms')).toBe('1h 1m')
      expect(pipe.transform(61, 'hms')).toBe('1m 1s')
    })


  })


  describe('hour format', () => {
    it('should display "less than an hour" for time less than an hour', () => {
      expect(pipe.transform(3599, 'hour')).toBe('less than an hour')
    })

    it('should display singular "hour" for exactly one hour', () => {
      expect(pipe.transform(3600, 'hour')).toBe('1 hour')
    })

    it('should display plural "hours" for more than one hour', () => {
      expect(pipe.transform(7200, 'hour')).toBe('2 hours')
      expect(pipe.transform(10800, 'hour')).toBe('3 hours')
    })
  })

  describe('day format', () => {


    it('should format as hms for times under 24 hours', () => {
      // Spy on the hmsCalculation method
      const spy = jest.spyOn(pipe, 'hmsCalculation')

      // Under 24 hours
      pipe.transform(3661, 'day')

      expect(spy).toHaveBeenCalledWith(1, 1, 1, '', 'day')
    })
  })


  describe('hmsCalculation', () => {
    it('should format with appropriate suffixes for hms type', () => {
      expect(pipe.hmsCalculation(1, 1, 1, '', 'hms')).toBe('1h 1m')
      expect(pipe.hmsCalculation(0, 1, 1, '', 'hms')).toBe('1m 1s')
      expect(pipe.hmsCalculation(0, 0, 30, '', 'hms')).toBe('30s')
    })

    it('should format with appropriate suffixes for day type', () => {
      expect(pipe.hmsCalculation(1, 1, 1, '', 'day')).toBe('1 hr 1 min')
      expect(pipe.hmsCalculation(0, 1, 1, '', 'day')).toBe('1 min 1 sec')
      expect(pipe.hmsCalculation(0, 0, 30, '', 'day')).toBe('30 sec')
    })
  })
})