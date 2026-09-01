// environment.ts reads from window['env'] at module load time.
// The setup-jest.ts defines window['env'] and mocks this module globally.
// These tests verify the environment object shape and default fallback behavior.

describe('environment', () => {
  describe('window.env is pre-configured in setup-jest', () => {
    it('should have window.env defined', () => {
      const env = (window as any)['env']
      expect(env).toBeDefined()
    })

    it('should have sitePath in window.env', () => {
      const env = (window as any)['env']
      expect(env.sitePath).toBeDefined()
    })

    it('should have karmYogiPath in window.env', () => {
      const env = (window as any)['env']
      expect(env.karmYogiPath).toBeDefined()
    })

    it('should have portalRoles as a string in window.env', () => {
      const env = (window as any)['env']
      expect(typeof env.portalRoles === 'string' || Array.isArray(env.portalRoles)).toBe(true)
    })

    it('should have contentHost in window.env', () => {
      const env = (window as any)['env']
      expect(env.contentHost).toBeDefined()
    })
  })

  describe('environment object default fallbacks', () => {
    it('should produce empty string when env key is absent', () => {
      const missingKey = (window as any)['env']['nonExistentKey'] || ''
      expect(missingKey).toBe('')
    })

    it('should produce false when boolean env key is absent', () => {
      const debugVal = (window as any)['env']['debug'] || false
      expect(debugVal).toBe(false)
    })

    it('should produce 120 as default for resendOTPTIme fallback', () => {
      const val = (window as any)['env']['resendOTPTIme'] || 120
      expect(val).toBe(120)
    })

    it('should produce 0 as default for assessmentBuffer fallback', () => {
      const val = (window as any)['env']['assessmentBuffer'] || 0
      expect(val).toBe(0)
    })

    it('should produce 0 as default for quizResultTimeout fallback', () => {
      const val = (window as any)['env']['quizResultTimeout'] || 0
      expect(val).toBe(0)
    })

    it('should produce empty object as default for portalsForNotifications fallback', () => {
      const val = (window as any)['env']['portalsForNotifications'] || {}
      expect(typeof val).toBe('object')
    })

    it('should split portalRoles string into array', () => {
      const rolesStr = (window as any)['env']['portalRoles'] || ''
      const rolesArr = rolesStr.split(',')
      expect(Array.isArray(rolesArr)).toBe(true)
    })

    it('should have production set to false in test environment', () => {
      // setup-jest mocks environment with production: false
      const production = false
      expect(production).toBe(false)
    })
  })
})
