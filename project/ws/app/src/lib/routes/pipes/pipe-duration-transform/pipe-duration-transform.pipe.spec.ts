import { PipeDurationTransformPipe } from './pipe-duration-transform.pipe'

describe('PipeDurationTransformPipe', () => {
  let pipe: PipeDurationTransformPipe

  beforeEach(() => {
    pipe = new PipeDurationTransformPipe()
  })

  describe('transform method', () => {
    describe('when data <= 0', () => {
      it('should return empty string for zero', () => {
        expect(pipe.transform(0, 'time24')).toBe('')
      })

      it('should return empty string for negative number', () => {
        expect(pipe.transform(-5, 'hms')).toBe('')
      })
    })

    describe('time24 type', () => {
      it('should format hours, minutes and seconds', () => {
        expect(pipe.transform(3661, 'time24')).toBe('01:01:01') // 1h 1m 1s
      })

      it('should format minutes and seconds when no hours', () => {
        expect(pipe.transform(125, 'time24')).toBe('02:05') // 2m 5s
      })

      it('should format only seconds when no hours or minutes', () => {
        expect(pipe.transform(45, 'time24')).toBe('00:45') // 45s
      })

      it('should handle zero minutes with hours', () => {
        expect(pipe.transform(3605, 'time24')).toBe('01:00:05') // 1h 0m 5s
      })
    })

    describe('hms type', () => {
      it('should format with h/m/s suffixes for all components', () => {
        expect(pipe.transform(3661, 'hms')).toBe('1h 1m 1s') // 1h 1m 1s
      })

      it('should format hours and minutes without seconds when hours > 0', () => {
        expect(pipe.transform(3660, 'hms')).toBe('1h 1m') // 1h 1m 0s (seconds omitted when h > 0)
      })

      it('should format minutes and seconds when no hours', () => {
        expect(pipe.transform(125, 'hms')).toBe('2m 5s') // 2m 5s
      })

      it('should format only seconds when no hours or minutes', () => {
        expect(pipe.transform(45, 'hms')).toBe('45s') // 45s
      })

      it('should format only minutes when no hours and no seconds', () => {
        expect(pipe.transform(120, 'hms')).toBe('2m') // 2m 0s
      })

      it('should format only hours when no minutes or seconds', () => {
        expect(pipe.transform(3600, 'hms')).toBe('1h') // 1h 0m 0s
      })
    })

    describe('hms2H type', () => {
      it('should format as HH:mm:ss using moment', () => {
        expect(pipe.transform(3661, 'hms2H')).toBe('01:01:01') // 1h 1m 1s
      })

      it('should format minutes and seconds with leading zeros', () => {
        expect(pipe.transform(125, 'hms2H')).toBe('00:02:05') // 2m 5s
      })

      it('should format only seconds with leading zeros', () => {
        expect(pipe.transform(45, 'hms2H')).toBe('00:00:45') // 45s
      })
    })

    describe('hms2M type', () => {
      it('should format as mm:ss using moment', () => {
        expect(pipe.transform(125, 'hms2M')).toBe('02:05') // 2m 5s
      })

      it('should format only seconds with leading zeros', () => {
        expect(pipe.transform(45, 'hms2M')).toBe('00:45') // 45s
      })

      it('should handle hours by converting to minutes', () => {
        expect(pipe.transform(3661, 'hms2M')).toBe('61:01') // 1h 1m 1s = 61m 1s
      })
    })

    describe('hour type', () => {
      it('should return "less than an hour" when h === 0', () => {
        expect(pipe.transform(1800, 'hour')).toBe('less than an hour') // 30 minutes
      })

      it('should return "1 hour" when h === 1', () => {
        expect(pipe.transform(3600, 'hour')).toBe('1 hour') // 1 hour
      })

      it('should return "X hours" when h > 1', () => {
        expect(pipe.transform(7200, 'hour')).toBe('2 hours') // 2 hours
        expect(pipe.transform(10800, 'hour')).toBe('3 hours') // 3 hours
      })
    })

    describe('day type', () => {
      it('should return days when h > 24', () => {
        const dataFor2Days = 48 * 3600 + 30 * 60 // 48h 30m
        expect(pipe.transform(dataFor2Days, 'day')).toBe('2 day(s)')
      })

      it('should return hms calculation when h <= 24', () => {
        expect(pipe.transform(3661, 'day')).toBe('1 hr 1 min 1 sec') // 1h 1m 1s
        expect(pipe.transform(23 * 3600, 'day')).toBe('23 hr') // 23 hours
      })
    })

    describe('default case', () => {
      it('should use defaultDuration for unknown type', () => {
        // TypeScript would catch this, but testing the runtime behavior
        expect(pipe.transform(3661, 'unknown' as any)).toBe('01:01:01')
      })
    })
  })

  describe('defaultDuration method', () => {
    it('should format all components when h, m, s > 0', () => {
      expect(pipe.defaultDuration(1, 1, 1)).toBe('01:01:01')
    })

    it('should format without hours when h === 0', () => {
      expect(pipe.defaultDuration(0, 2, 5)).toBe('02:05')
    })

    it('should format with 00 for minutes when m === 0 but h > 0', () => {
      expect(pipe.defaultDuration(1, 0, 5)).toBe('01:00:05')
    })

    it('should format with 00 for seconds when s === 0', () => {
      expect(pipe.defaultDuration(1, 1, 0)).toBe('01:01:00')
    })

    it('should format only 00:00 when h === 0, m === 0, s === 0', () => {
      expect(pipe.defaultDuration(0, 0, 0)).toBe('00:00')
    })

    it('should pad single digits with leading zeros', () => {
      expect(pipe.defaultDuration(9, 8, 7)).toBe('09:08:07')
    })
  })

  describe('hmsCalculation method', () => {
    describe('with hms type', () => {
      it('should format all components with proper spacing', () => {
        expect(pipe.hmsCalculation(1, 1, 1, '', 'hms')).toBe('1h 1m 1s')
      })

      it('should format hours and minutes without seconds when h > 0', () => {
        expect(pipe.hmsCalculation(1, 1, 0, '', 'hms')).toBe('1h 1m')
      })

      it('should format minutes and seconds when h === 0', () => {
        expect(pipe.hmsCalculation(0, 2, 5, '', 'hms')).toBe('2m 5s')
      })

      it('should format only hours when m === 0 and s === 0', () => {
        expect(pipe.hmsCalculation(2, 0, 0, '', 'hms')).toBe('2h')
      })

      it('should format only minutes when h === 0 and s === 0', () => {
        expect(pipe.hmsCalculation(0, 3, 0, '', 'hms')).toBe('3m')
      })

      it('should format only seconds when h === 0 and m === 0', () => {
        expect(pipe.hmsCalculation(0, 0, 45, '', 'hms')).toBe('45s')
      })

      it('should not include seconds when h > 0 even if s > 0', () => {
        expect(pipe.hmsCalculation(2, 0, 30, '', 'hms')).toBe('2h')
      })
    })

    describe('with non-hms type (day)', () => {
      it('should format all components with full words', () => {
        expect(pipe.hmsCalculation(1, 1, 1, '', 'day')).toBe('1 hr 1 min 1 sec')
      })

      it('should format hours and minutes without seconds when h > 0', () => {
        expect(pipe.hmsCalculation(1, 1, 0, '', 'day')).toBe('1 hr 1 min')
      })

      it('should format minutes and seconds when h === 0', () => {
        expect(pipe.hmsCalculation(0, 2, 5, '', 'day')).toBe('2 min 5 sec')
      })

      it('should format only hours when m === 0 and s === 0', () => {
        expect(pipe.hmsCalculation(2, 0, 0, '', 'day')).toBe('2 hr')
      })

      it('should format only minutes when h === 0 and s === 0', () => {
        expect(pipe.hmsCalculation(0, 3, 0, '', 'day')).toBe('3 min')
      })

      it('should format only seconds when h === 0 and m === 0', () => {
        expect(pipe.hmsCalculation(0, 0, 45, '', 'day')).toBe('45 sec')
      })
    })

    describe('spacing logic', () => {
      it('should add space between hours and minutes when both exist', () => {
        expect(pipe.hmsCalculation(1, 30, 0, '', 'hms')).toBe('1h 30m')
      })

      it('should add space between minutes and seconds when both exist and h === 0', () => {
        expect(pipe.hmsCalculation(0, 30, 45, '', 'hms')).toBe('30m 45s')
      })

      it('should not add space when only one component exists', () => {
        expect(pipe.hmsCalculation(2, 0, 0, '', 'hms')).toBe('2h')
        expect(pipe.hmsCalculation(0, 30, 0, '', 'hms')).toBe('30m')
        expect(pipe.hmsCalculation(0, 0, 45, '', 'hms')).toBe('45s')
      })
    })

    describe('with existing duration parameter', () => {
      it('should append to existing duration string', () => {
        expect(pipe.hmsCalculation(1, 30, 0, 'prefix ', 'hms')).toBe('prefix 1h 30m')
      })
    })
  })
})