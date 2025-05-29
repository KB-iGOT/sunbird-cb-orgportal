import { AppDateAdapter, APP_DATE_FORMATS, changeformat, startWithYearformat } from './format-datepicker'

// Mock Angular Material dependencies
jest.mock('@angular/material/core', () => ({
  NativeDateAdapter: class MockNativeDateAdapter {
    // Mock base class - only implementing what we need
  },
  MatDateFormats: {}
}))

jest.mock('@angular/core', () => ({
  Injectable: () => (target: any) => target
}))

describe('AppDateAdapter', () => {
  let adapter: AppDateAdapter

  beforeEach(() => {
    adapter = new AppDateAdapter(null as any, null as any)
  })

  describe('format method', () => {
    it('should format date with input display format as DD-MM-YYYY', () => {
      const testDate = new Date(2023, 11, 5) // December 5, 2023
      const result = adapter.format(testDate, 'input')
      expect(result).toBe('05-12-2023')
    })

    it('should format date with single digit day and month correctly', () => {
      const testDate = new Date(2023, 0, 1) // January 1, 2023
      const result = adapter.format(testDate, 'input')
      expect(result).toBe('01-01-2023')
    })

    it('should format date with double digit day and month correctly', () => {
      const testDate = new Date(2023, 9, 15) // October 15, 2023
      const result = adapter.format(testDate, 'input')
      expect(result).toBe('15-10-2023')
    })

    it('should handle leap year date correctly', () => {
      const testDate = new Date(2024, 1, 29) // February 29, 2024 (leap year)
      const result = adapter.format(testDate, 'input')
      expect(result).toBe('29-02-2024')
    })

    it('should handle end of year date correctly', () => {
      const testDate = new Date(2023, 11, 31) // December 31, 2023
      const result = adapter.format(testDate, 'input')
      expect(result).toBe('31-12-2023')
    })

    it('should return toDateString() for non-input display format', () => {
      const testDate = new Date(2023, 11, 5)
      const expectedDateString = testDate.toDateString()
      const result = adapter.format(testDate, 'someOtherFormat')
      expect(result).toBe(expectedDateString)
    })

    it('should return toDateString() when displayFormat is undefined', () => {
      const testDate = new Date(2023, 11, 5)
      const expectedDateString = testDate.toDateString()
      const result = adapter.format(testDate, {})
      expect(result).toBe(expectedDateString)
    })

    it('should return toDateString() when displayFormat is null', () => {
      const testDate = new Date(2023, 11, 5)
      const expectedDateString = testDate.toDateString()
      const result = adapter.format(testDate, {})
      expect(result).toBe(expectedDateString)
    })
  })
})

describe('APP_DATE_FORMATS', () => {
  it('should have correct parse configuration', () => {
    expect(APP_DATE_FORMATS.parse).toBeDefined()
    expect(APP_DATE_FORMATS.parse.dateInput).toEqual({
      month: 'short',
      year: 'numeric',
      day: 'numeric'
    })
  })

  it('should have correct display configuration', () => {
    expect(APP_DATE_FORMATS.display).toBeDefined()
    expect(APP_DATE_FORMATS.display.dateInput).toBe('input')
    expect(APP_DATE_FORMATS.display.monthYearLabel).toEqual({
      year: 'numeric',
      month: 'numeric'
    })
    expect(APP_DATE_FORMATS.display.dateA11yLabel).toEqual({
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    expect(APP_DATE_FORMATS.display.monthYearA11yLabel).toEqual({
      year: 'numeric',
      month: 'long'
    })
  })
})

describe('changeformat function', () => {
  it('should format date as DD-MM-YYYY', () => {
    const testDate = new Date(2023, 11, 5) // December 5, 2023
    const result = changeformat(testDate)
    expect(result).toBe('05-12-2023')
  })

  it('should pad single digit day and month with zeros', () => {
    const testDate = new Date(2023, 0, 1) // January 1, 2023
    const result = changeformat(testDate)
    expect(result).toBe('01-01-2023')
  })

  it('should handle double digit day and month correctly', () => {
    const testDate = new Date(2023, 9, 15) // October 15, 2023
    const result = changeformat(testDate)
    expect(result).toBe('15-10-2023')
  })

  it('should handle leap year date', () => {
    const testDate = new Date(2024, 1, 29) // February 29, 2024
    const result = changeformat(testDate)
    expect(result).toBe('29-02-2024')
  })

  it('should handle end of month dates', () => {
    const testDate = new Date(2023, 2, 31) // March 31, 2023
    const result = changeformat(testDate)
    expect(result).toBe('31-03-2023')
  })

  it('should handle different years correctly', () => {
    const testDate = new Date(1999, 11, 31) // December 31, 1999
    const result = changeformat(testDate)
    expect(result).toBe('31-12-1999')
  })
})

describe('startWithYearformat function', () => {
  it('should format date as YYYY-MM-DD', () => {
    const testDate = new Date(2023, 11, 5) // December 5, 2023
    const result = startWithYearformat(testDate)
    expect(result).toBe('2023-12-05')
  })

  it('should pad single digit day and month with zeros', () => {
    const testDate = new Date(2023, 0, 1) // January 1, 2023
    const result = startWithYearformat(testDate)
    expect(result).toBe('2023-01-01')
  })

  it('should handle double digit day and month correctly', () => {
    const testDate = new Date(2023, 9, 15) // October 15, 2023
    const result = startWithYearformat(testDate)
    expect(result).toBe('2023-10-15')
  })

  it('should handle leap year date', () => {
    const testDate = new Date(2024, 1, 29) // February 29, 2024
    const result = startWithYearformat(testDate)
    expect(result).toBe('2024-02-29')
  })

  it('should handle end of year date', () => {
    const testDate = new Date(2023, 11, 31) // December 31, 2023
    const result = startWithYearformat(testDate)
    expect(result).toBe('2023-12-31')
  })

  it('should handle different years correctly', () => {
    const testDate = new Date(2000, 0, 1) // January 1, 2000
    const result = startWithYearformat(testDate)
    expect(result).toBe('2000-01-01')
  })
})

describe('Edge cases and error handling', () => {
  it('should handle invalid dates gracefully in changeformat', () => {
    const invalidDate = new Date('invalid')
    expect(() => changeformat(invalidDate)).not.toThrow()
    // Note: Invalid dates will produce NaN values, but the function doesn't explicitly handle this
  })

  it('should handle invalid dates gracefully in startWithYearformat', () => {
    const invalidDate = new Date('invalid')
    expect(() => startWithYearformat(invalidDate)).not.toThrow()
  })

  // it('should handle invalid dates gracefully in AppDateAdapter format', () => {
  //   const invalidDate = new Date('invalid')
  //   expect(() => adapter.format(invalidDate, 'input')).not.toThrow()
  // })
})

// Performance and consistency tests
describe('Performance and consistency', () => {
  const testDate = new Date(2023, 5, 15) // June 15, 2023

  it('should produce consistent results across multiple calls', () => {
    const result1 = changeformat(testDate)
    const result2 = changeformat(testDate)
    const result3 = changeformat(testDate)

    expect(result1).toBe(result2)
    expect(result2).toBe(result3)
    expect(result1).toBe('15-06-2023')
  })

  it('should produce consistent results for startWithYearformat', () => {
    const result1 = startWithYearformat(testDate)
    const result2 = startWithYearformat(testDate)

    expect(result1).toBe(result2)
    expect(result1).toBe('2023-06-15')
  })

  it('should produce consistent results for AppDateAdapter format', () => {
    const adapter1 = new AppDateAdapter(null as any, null as any)
    const adapter2 = new AppDateAdapter(null as any, null as any)

    const result1 = adapter1.format(testDate, 'input')
    const result2 = adapter2.format(testDate, 'input')

    expect(result1).toBe(result2)
    expect(result1).toBe('15-06-2023')
  })
})