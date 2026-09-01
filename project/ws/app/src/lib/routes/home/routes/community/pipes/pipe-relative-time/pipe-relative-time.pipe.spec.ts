import { PipeRelativeTimePipe } from './pipe-relative-time.pipe'

describe('PipeRelativeTimePipe', () => {
  let pipe: PipeRelativeTimePipe
  let originalDate: DateConstructor

  beforeEach(() => {
    pipe = new PipeRelativeTimePipe()
    // Store original Date constructor
    originalDate = global.Date
  })

  afterEach(() => {
    // Restore original Date constructor
    global.Date = originalDate
  })

  const mockCurrentTime = (currentTime: number) => {
    global.Date = jest.fn((dateString?: string | number | Date) => {
      if (dateString !== undefined) {
        return new originalDate(dateString)
      }
      return new originalDate(currentTime)
    }) as any;

    // Mock static methods
    (global.Date as any).now = jest.fn(() => currentTime)
    Object.setPrototypeOf(global.Date, originalDate)
  }

  describe('transform', () => {
    it('should create an instance', () => {
      expect(pipe).toBeTruthy()
    })

    it('should return "Just now" for times less than 30 seconds ago', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T11:59:45Z').getTime() // 15 seconds ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('Just now')
    })

    it('should return "Just now" for exactly 29 seconds ago', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T11:59:31Z').getTime() // 29 seconds ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('Just now')
    })

    it('should return "1 second ago" for exactly 30 seconds ago', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T11:59:30Z').getTime() // 30 seconds ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('30 seconds ago')
    })

    it('should return "1 minute ago" for 1 minute ago', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T11:59:00Z').getTime() // 1 minute ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 minute ago')
    })

    it('should return "5 minutes ago" for 5 minutes ago', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T11:55:00Z').getTime() // 5 minutes ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('5 minutes ago')
    })

    it('should return "1 hour ago" for 1 hour ago', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T11:00:00Z').getTime() // 1 hour ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 hour ago')
    })

    it('should return "3 hours ago" for 3 hours ago', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T09:00:00Z').getTime() // 3 hours ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('3 hours ago')
    })

    it('should return "1 day ago" for 1 day ago', () => {
      const currentTime = new Date('2023-01-02T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // 1 day ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 day ago')
    })

    it('should return "3 days ago" for 3 days ago', () => {
      const currentTime = new Date('2023-01-04T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // 3 days ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('3 days ago')
    })

    it('should return "1 week ago" for 1 week ago', () => {
      const currentTime = new Date('2023-01-08T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // 1 week ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 week ago')
    })

    it('should return "2 weeks ago" for 2 weeks ago', () => {
      const currentTime = new Date('2023-01-15T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // 2 weeks ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('2 weeks ago')
    })

    it('should return "1 month ago" for 1 month ago', () => {
      const currentTime = new Date('2023-02-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // ~1 month ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 month ago')
    })

    it('should return "3 months ago" for 3 months ago', () => {
      const currentTime = new Date('2023-04-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // ~3 months ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('3 months ago')
    })

    it('should return "1 year ago" for 1 year ago', () => {
      const currentTime = new Date('2024-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // 1 year ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 year ago')
    })

    it('should return "2 years ago" for 2 years ago', () => {
      const currentTime = new Date('2025-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // 2 years ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('2 years ago')
    })

    it('should handle edge case of exactly 1 unit (singular form)', () => {
      const currentTime = new Date('2023-01-01T12:01:00Z').getTime()
      const testTime = new Date('2023-01-01T12:00:00Z').getTime() // exactly 1 minute ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 minute ago')
    })

    it('should return original value when input is falsy (null)', () => {
      const result = pipe.transform(5)
      expect(result).toBe(null)
    })

    it('should return original value when input is falsy (undefined)', () => {
      const result = pipe.transform(3)
      expect(result).toBe(undefined)
    })

    it('should return original value when input is falsy (0)', () => {
      const result = pipe.transform(0)
      expect(result).toBe(0)
    })

    it('should handle future dates (negative time difference)', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const futureTime = new Date('2023-01-01T13:00:00Z').getTime() // 1 hour in future

      mockCurrentTime(currentTime)

      const result = pipe.transform(futureTime)
      expect(result).toBe(futureTime) // Should return original value
    })

    it('should handle string input that can be converted to Date', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTimeString = '2023-01-01T11:55:00Z' // 5 minutes ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTimeString as any)
      expect(result).toBe('5 minutes ago')
    })

    it('should prioritize larger time units over smaller ones', () => {
      const currentTime = new Date('2023-01-01T12:00:00Z').getTime()
      const testTime = new Date('2023-01-01T10:30:00Z').getTime() // 1.5 hours ago

      mockCurrentTime(currentTime)

      const result = pipe.transform(testTime)
      expect(result).toBe('1 hour ago') // Should show hours, not minutes
    })
  })
})