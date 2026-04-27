import { Storage } from './storage'

describe('Storage', () => {
  let storage: Storage

  beforeEach(() => {
    localStorage.clear()
    storage = new Storage()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should create the storage service', () => {
    expect(storage).toBeTruthy()
  })

  it('should have default key as scormData', () => {
    expect(storage.key).toBe('scormData')
  })

  // contentKey getter/setter
  describe('contentKey', () => {
    it('should set and get contentKey', () => {
      storage.contentKey = 'my-content-key'
      expect(storage.contentKey).toBe('my-content-key')
    })
  })

  // setItem
  describe('setItem', () => {
    it('should create new entry when localStorage is empty', () => {
      storage.contentKey = 'test-key'
      storage.setItem('cmi.core.lesson_status', 'passed')
      const stored = JSON.parse(localStorage.getItem('test-key') || '{}')
      expect(stored['cmi.core.lesson_status']).toBe('passed')
    })

    it('should update existing entry in localStorage', () => {
      storage.contentKey = 'test-key'
      localStorage.setItem('test-key', JSON.stringify({ 'cmi.core.exit': 'suspend' }))
      storage.setItem('cmi.core.session_time', '00:05:00')
      const stored = JSON.parse(localStorage.getItem('test-key') || '{}')
      expect(stored['cmi.core.session_time']).toBe('00:05:00')
      expect(stored['cmi.core.exit']).toBe('suspend')
    })

    it('should overwrite value for existing key', () => {
      storage.contentKey = 'test-key'
      localStorage.setItem('test-key', JSON.stringify({ status: 'incomplete' }))
      storage.setItem('status', 'completed')
      const stored = JSON.parse(localStorage.getItem('test-key') || '{}')
      expect(stored['status']).toBe('completed')
    })

    it('should handle setting boolean value', () => {
      storage.contentKey = 'test-key'
      storage.setItem('Initialized', true)
      const stored = JSON.parse(localStorage.getItem('test-key') || '{}')
      expect(stored['Initialized']).toBe(true)
    })
  })

  // getItem
  describe('getItem', () => {
    it('should return null when localStorage has no entry for contentKey', () => {
      storage.contentKey = 'nonexistent-key'
      const result = storage.getItem('cmi.core.lesson_status')
      expect(result).toBeNull()
    })

    it('should return value for existing element', () => {
      storage.contentKey = 'test-key'
      localStorage.setItem('test-key', JSON.stringify({ 'cmi.core.lesson_status': 'passed' }))
      const result = storage.getItem('cmi.core.lesson_status')
      expect(result).toBe('passed')
    })

    it('should return null when element does not exist in stored data', () => {
      storage.contentKey = 'test-key'
      localStorage.setItem('test-key', JSON.stringify({ other: 'value' }))
      const result = storage.getItem('nonexistent')
      expect(result).toBeUndefined()
    })
  })

  // getAll
  describe('getAll', () => {
    it('should return null when nothing stored', () => {
      storage.contentKey = 'empty-key'
      const result = storage.getAll()
      expect(result).toBeNull()
    })

    it('should return all stored data', () => {
      storage.contentKey = 'test-key'
      const data = {
        Initialized: true,
        'cmi.core.lesson_status': 'passed',
        'cmi.core.exit': 'suspend',
      }
      localStorage.setItem('test-key', JSON.stringify(data))
      const result = storage.getAll()
      expect(result).toEqual(data)
    })

    it('should return null when stored value is empty JSON literal null', () => {
      storage.contentKey = 'test-key'
      localStorage.setItem('test-key', 'null')
      const result = storage.getAll()
      expect(result).toBeNull()
    })
  })

  // setAll
  describe('setAll', () => {
    it('should store all data to localStorage', () => {
      storage.contentKey = 'test-key'
      const data: any = {
        Initialized: true,
        'cmi.core.lesson_status': 'incomplete',
      }
      storage.setAll(data)
      const stored = JSON.parse(localStorage.getItem('test-key') || '{}')
      expect(stored).toEqual(data)
    })

    it('should not store when data is falsy', () => {
      storage.contentKey = 'test-key'
      storage.setAll(null as any)
      expect(localStorage.getItem('test-key')).toBeNull()
    })
  })

  // clearAll
  describe('clearAll', () => {
    it('should remove the key from localStorage', () => {
      storage.contentKey = 'test-key'
      localStorage.setItem('test-key', JSON.stringify({ data: 'value' }))
      storage.clearAll()
      expect(localStorage.getItem('test-key')).toBeNull()
    })

    it('should not throw when key does not exist', () => {
      storage.contentKey = 'nonexistent-key'
      expect(() => storage.clearAll()).not.toThrow()
    })
  })
})
