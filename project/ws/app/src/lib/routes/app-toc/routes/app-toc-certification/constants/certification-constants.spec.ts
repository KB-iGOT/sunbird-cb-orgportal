import {
  CERT_FILE_TYPES,
  CERT_GRADE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from './certification-constants'

describe('certification-constants', () => {
  describe('CERT_FILE_TYPES', () => {
    it('should be an array of strings', () => {
      expect(Array.isArray(CERT_FILE_TYPES)).toBe(true)
      CERT_FILE_TYPES.forEach(type => expect(typeof type).toBe('string'))
    })

    it('should contain .jpg', () => {
      expect(CERT_FILE_TYPES).toContain('.jpg')
    })

    it('should contain .jpeg', () => {
      expect(CERT_FILE_TYPES).toContain('.jpeg')
    })

    it('should contain .pdf', () => {
      expect(CERT_FILE_TYPES).toContain('.pdf')
    })

    it('should contain .tiff', () => {
      expect(CERT_FILE_TYPES).toContain('.tiff')
    })

    it('should contain .tif', () => {
      expect(CERT_FILE_TYPES).toContain('.tif')
    })

    it('should contain .gif', () => {
      expect(CERT_FILE_TYPES).toContain('.gif')
    })

    it('should have exactly 6 file types', () => {
      expect(CERT_FILE_TYPES.length).toBe(6)
    })
  })

  describe('CERT_GRADE_TYPES', () => {
    it('should be an array of strings', () => {
      expect(Array.isArray(CERT_GRADE_TYPES)).toBe(true)
      CERT_GRADE_TYPES.forEach(grade => expect(typeof grade).toBe('string'))
    })

    it('should contain A grade', () => {
      expect(CERT_GRADE_TYPES).toContain('A')
    })

    it('should contain A+ grade', () => {
      expect(CERT_GRADE_TYPES).toContain('A+')
    })

    it('should contain B grade', () => {
      expect(CERT_GRADE_TYPES).toContain('B')
    })

    it('should contain C grade', () => {
      expect(CERT_GRADE_TYPES).toContain('C')
    })

    it('should have 9 grade types', () => {
      expect(CERT_GRADE_TYPES.length).toBe(9)
    })
  })

  describe('MAX_FILE_SIZE_BYTES', () => {
    it('should be a number', () => {
      expect(typeof MAX_FILE_SIZE_BYTES).toBe('number')
    })

    it('should equal 3145728 (3MB)', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(3145728)
    })

    it('should equal 3 * 1024 * 1024', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(3 * 1024 * 1024)
    })
  })
})
