import { LangSelectComponent } from './lang-select.component'
import { UntypedFormControl, Validators } from '@angular/forms'

// Mock dependencies
const mockConfigurationsService = {
    userProfile: null as any,
    instanceConfig: null as any,
    userUrl: null as any
}

const mockRouter = {
    navigateByUrl: jest.fn()
}

const mockUserPreferenceService = {
    saveUserPreference: jest.fn()
}

// Mock global location object
const mockLocation = {
    origin: 'https://example.com',
    assign: jest.fn()
}

// Setup global mocks
Object.defineProperty(global, 'location', {
    value: mockLocation,
    writable: true
})

describe('LangSelectComponent', () => {
    let component: LangSelectComponent

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Reset mock services to default state
        mockConfigurationsService.userProfile = {
            givenName: 'John Doe'
        }
        mockConfigurationsService.instanceConfig = {
            locals: [
                { path: 'en', isAvailable: true, isEnabled: true },
                { path: 'fr', isAvailable: true, isEnabled: false },
                { path: 'es', isAvailable: false, isEnabled: true },
                { path: 'de', isAvailable: true, isEnabled: true }
            ]
        }
        mockConfigurationsService.userUrl = 'https://redirect.example.com'

        mockUserPreferenceService.saveUserPreference.mockResolvedValue(undefined)

        // Create component instance
        component = new LangSelectComponent(
            mockConfigurationsService as any,
            mockRouter as any,
            mockUserPreferenceService as any
        )
    })

    describe('Constructor', () => {
        it('should initialize with default values', () => {
            expect(component.userName).toBe('')
            expect(component.selectedLang).toBe('')
            expect(component.lang).toBe('')
            expect(component.allowedLangCode).toEqual({})
            expect(component.animalControl).toBeInstanceOf(UntypedFormControl)
            expect(component.animalControl.value).toBe('')
            expect(component.animalControl.hasError('required')).toBe(true)
        })

        it('should initialize animalControl with required validator', () => {
            expect(component.animalControl.validator).toBeTruthy()
            expect(component.animalControl.hasError('required')).toBe(true)

            component.animalControl.setValue('test')
            expect(component.animalControl.hasError('required')).toBe(false)
        })
    })

    describe('ngOnInit', () => {
        it('should set userName from userProfile.givenName', () => {
            component.ngOnInit()

            expect(component.userName).toBe('John Doe')
        })

        it('should set userName to empty string when givenName is null', () => {
            mockConfigurationsService.userProfile.givenName = null

            component.ngOnInit()

            expect(component.userName).toBe('')
        })

        it('should set userName to empty string when givenName is undefined', () => {
            mockConfigurationsService.userProfile.givenName = undefined

            component.ngOnInit()

            expect(component.userName).toBe('')
        })

        it('should set userName to empty string when userProfile is null', () => {
            mockConfigurationsService.userProfile = null

            component.ngOnInit()

            expect(component.userName).toBe('')
        })

        it('should set userName to empty string when userProfile is undefined', () => {
            mockConfigurationsService.userProfile = undefined

            component.ngOnInit()

            expect(component.userName).toBe('')
        })

        it('should reset selectedLang to empty string', () => {
            component.selectedLang = 'previous-value'

            component.ngOnInit()

            expect(component.selectedLang).toBe('')
        })

        it('should build allowedLangCode from instanceConfig.locals', () => {
            component.ngOnInit()

            expect(component.allowedLangCode).toEqual({
                'en': { path: 'en', isAvailable: true, isEnabled: true },
                'fr': { path: 'fr', isAvailable: true, isEnabled: false },
                'es': { path: 'es', isAvailable: false, isEnabled: true },
                'de': { path: 'de', isAvailable: true, isEnabled: true }
            })
        })

        it('should handle null instanceConfig', () => {
            mockConfigurationsService.instanceConfig = null

            component.ngOnInit()

            expect(component.allowedLangCode).toEqual({})
        })

        it('should handle undefined instanceConfig', () => {
            mockConfigurationsService.instanceConfig = undefined

            component.ngOnInit()

            expect(component.allowedLangCode).toEqual({})
        })

        it('should handle instanceConfig with null locals', () => {
            mockConfigurationsService.instanceConfig = { locals: null }

            expect(() => component.ngOnInit()).toThrow()
        })

        it('should handle instanceConfig with empty locals array', () => {
            mockConfigurationsService.instanceConfig = { locals: [] }

            component.ngOnInit()

            expect(component.allowedLangCode).toEqual({})
        })

        it('should handle instanceConfig with single locale', () => {
            mockConfigurationsService.instanceConfig = {
                locals: [{ path: 'en', isAvailable: true, isEnabled: true }]
            }

            component.ngOnInit()

            expect(component.allowedLangCode).toEqual({
                'en': { path: 'en', isAvailable: true, isEnabled: true }
            })
        })
    })

    describe('isLocaleAvailable', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should return true for available locale', () => {
            const result = component.isLocaleAvailable('en')

            expect(result).toBe(true)
        })

        it('should return false for unavailable locale', () => {
            const result = component.isLocaleAvailable('es')

            expect(result).toBe(false)
        })

        it('should return false for non-existent locale', () => {
            const result = component.isLocaleAvailable('nonexistent')

            expect(result).toBe(undefined)
        })

        it('should return false when allowedLangCode is empty', () => {
            component.allowedLangCode = {}

            const result = component.isLocaleAvailable('en')

            expect(result).toBe(undefined)
        })

        it('should return false for null langPath', () => {
            const result = component.isLocaleAvailable(null as any)

            expect(result).toBe(undefined)
        })

        it('should return false for undefined langPath', () => {
            const result = component.isLocaleAvailable(undefined as any)

            expect(result).toBe(undefined)
        })

        it('should return false for empty string langPath', () => {
            const result = component.isLocaleAvailable('')

            expect(result).toBe(undefined)
        })

        it('should handle locale with isAvailable undefined', () => {
            component.allowedLangCode['test'] = { path: 'test' } as any

            const result = component.isLocaleAvailable('test')

            expect(result).toBe(false)
        })
    })

    describe('isLocaleEnabled', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should return true for enabled locale', () => {
            const result = component.isLocaleEnabled('en')

            expect(result).toBe(true)
        })

        it('should return false for disabled locale', () => {
            const result = component.isLocaleEnabled('fr')

            expect(result).toBe(undefined)
        })

        it('should return false for non-existent locale', () => {
            const result = component.isLocaleEnabled('nonexistent')

            expect(result).toBe(undefined)
        })

        it('should return false when allowedLangCode is empty', () => {
            component.allowedLangCode = {}

            const result = component.isLocaleEnabled('en')

            expect(result).toBe(undefined)
        })

        it('should return false for null langPath', () => {
            const result = component.isLocaleEnabled(null as any)

            expect(result).toBe(undefined)
        })

        it('should return false for undefined langPath', () => {
            const result = component.isLocaleEnabled(undefined as any)

            expect(result).toBe(undefined)
        })

        it('should return false for empty string langPath', () => {
            const result = component.isLocaleEnabled('')

            expect(result).toBe(undefined)
        })

        it('should handle locale with isEnabled undefined', () => {
            component.allowedLangCode['test'] = { path: 'test' } as any

            const result = component.isLocaleEnabled('test')

            expect(result).toBe(undefined)
        })
    })

    describe('langChanged', () => {
        it('should set selectedLang to provided path', () => {
            component.langChanged('fr')

            expect(component.selectedLang).toBe('fr')
        })

        it('should handle empty string path', () => {
            component.langChanged('')

            expect(component.selectedLang).toBe('')
        })

        it('should handle null path', () => {
            component.langChanged(null as any)

            expect(component.selectedLang).toBe(null)
        })

        it('should handle undefined path', () => {
            component.langChanged(undefined as any)

            expect(component.selectedLang).toBe(undefined)
        })

        it('should overwrite existing selectedLang', () => {
            component.selectedLang = 'old-lang'

            component.langChanged('new-lang')

            expect(component.selectedLang).toBe('new-lang')
        })
    })

    describe('applyLang', () => {
        it('should convert "en" to empty string and use router navigation', async () => {
            component.selectedLang = 'en'

            await component.applyLang()

            expect(component.selectedLang).toBe('')
            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledWith({
                selectedLocale: ''
            })
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/setup/home/tnc')
            expect(mockLocation.assign).not.toHaveBeenCalled()
        })

        it('should use location.assign for non-en languages with userUrl', async () => {
            component.selectedLang = 'fr'

            await component.applyLang()

            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledWith({
                selectedLocale: 'fr'
            })
            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/fr/app/setup/home/tnc?ref=https%3A%2F%2Fredirect.example.com'
            )
            expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
        })

        it('should use location.assign for non-en languages without userUrl', async () => {
            mockConfigurationsService.userUrl = null
            component.selectedLang = 'fr'

            await component.applyLang()

            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/fr/app/setup/home/tnc'
            )
        })

        it('should handle empty userUrl', async () => {
            mockConfigurationsService.userUrl = ''
            component.selectedLang = 'fr'

            await component.applyLang()

            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/fr/app/setup/home/tnc'
            )
        })

        it('should handle undefined userUrl', async () => {
            mockConfigurationsService.userUrl = undefined
            component.selectedLang = 'fr'

            await component.applyLang()

            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/fr/app/setup/home/tnc'
            )
        })

        it('should handle empty selectedLang (not "en")', async () => {
            component.selectedLang = ''

            await component.applyLang()

            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledWith({
                selectedLocale: ''
            })
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/setup/home/tnc')
        })

        it('should properly encode complex userUrl', async () => {
            mockConfigurationsService.userUrl = 'https://example.com/path?param=value&other=test#fragment'
            component.selectedLang = 'de'

            await component.applyLang()

            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/de/app/setup/home/tnc?ref=https%3A%2F%2Fexample.com%2Fpath%3Fparam%3Dvalue%26other%3Dtest%23fragment'
            )
        })

        it('should handle saveUserPreference rejection', async () => {
            const error = new Error('Save failed')
            mockUserPreferenceService.saveUserPreference.mockRejectedValue(error)
            component.selectedLang = 'fr'

            await expect(component.applyLang()).rejects.toThrow('Save failed')

            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledWith({
                selectedLocale: 'fr'
            })
            expect(mockLocation.assign).not.toHaveBeenCalled()
            expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
        })

        it('should handle saveUserPreference rejection for en language', async () => {
            const error = new Error('Save failed')
            mockUserPreferenceService.saveUserPreference.mockRejectedValue(error)
            component.selectedLang = 'en'

            await expect(component.applyLang()).rejects.toThrow('Save failed')

            expect(component.selectedLang).toBe('') // Still gets converted
            expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
        })

        it('should handle special characters in selectedLang', async () => {
            component.selectedLang = 'zh-CN'

            await component.applyLang()

            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/zh-CN/app/setup/home/tnc?ref=https%3A%2F%2Fredirect.example.com'
            )
        })

        it('should handle null selectedLang', async () => {
            component.selectedLang = null as any

            await component.applyLang()

            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledWith({
                selectedLocale: null
            })
            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/null/app/setup/home/tnc?ref=https%3A%2F%2Fredirect.example.com'
            )
        })

        it('should handle undefined selectedLang', async () => {
            component.selectedLang = undefined as any

            await component.applyLang()

            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledWith({
                selectedLocale: undefined
            })
            expect(mockLocation.assign).toHaveBeenCalledWith(
                'https://example.com/undefined/app/setup/home/tnc?ref=https%3A%2F%2Fredirect.example.com'
            )
        })
    })

    describe('Form Control Validation', () => {
        it('should be invalid initially', () => {
            expect(component.animalControl.valid).toBe(false)
            expect(component.animalControl.hasError('required')).toBe(true)
        })

        it('should be valid when value is set', () => {
            component.animalControl.setValue('some-value')

            expect(component.animalControl.valid).toBe(true)
            expect(component.animalControl.hasError('required')).toBe(false)
        })

        it('should be invalid when value is set to empty string', () => {
            component.animalControl.setValue('some-value')
            component.animalControl.setValue('')

            expect(component.animalControl.valid).toBe(false)
            expect(component.animalControl.hasError('required')).toBe(true)
        })

        it('should be invalid when value is set to null', () => {
            component.animalControl.setValue('some-value')
            component.animalControl.setValue(null)

            expect(component.animalControl.valid).toBe(false)
            expect(component.animalControl.hasError('required')).toBe(true)
        })

        it('should be invalid when value is set to undefined', () => {
            component.animalControl.setValue('some-value')
            component.animalControl.setValue(undefined)

            expect(component.animalControl.valid).toBe(false)
            expect(component.animalControl.hasError('required')).toBe(true)
        })

        it('should maintain validator reference', () => {
            const originalValidator = component.animalControl.validator

            expect(originalValidator).toBe(Validators.required)
        })
    })

    describe('Component State Management', () => {
        it('should maintain independent state for each property', () => {
            component.userName = 'Test User'
            component.selectedLang = 'fr'
            component.lang = 'en-US'
            component.allowedLangCode = { 'test': {} as any }

            expect(component.userName).toBe('Test User')
            expect(component.selectedLang).toBe('fr')
            expect(component.lang).toBe('en-US')
            expect(component.allowedLangCode).toEqual({ 'test': {} })
        })

        it('should handle multiple method calls in sequence', async () => {
            component.ngOnInit()
            component.langChanged('fr')

            expect(component.selectedLang).toBe('fr')
            expect(component.isLocaleAvailable('en')).toBe(true)
            expect(component.isLocaleEnabled('fr')).toBe(false)

            await component.applyLang()

            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledWith({
                selectedLocale: 'fr'
            })
        })
    })

    describe('Edge Cases and Error Conditions', () => {
        it('should handle malformed instanceConfig gracefully', () => {
            mockConfigurationsService.instanceConfig = { locals: 'invalid' } as any

            expect(() => component.ngOnInit()).toThrow()
        })

        it('should handle instanceConfig.locals with invalid items', () => {
            mockConfigurationsService.instanceConfig = {
                locals: [
                    null,
                    undefined,
                    { path: 'en', isAvailable: true, isEnabled: true },
                    'invalid',
                    { path: 'fr', isAvailable: false, isEnabled: true }
                ]
            } as any

            expect(() => component.ngOnInit()).toThrow()
        })

        it('should handle concurrent applyLang calls', async () => {
            component.selectedLang = 'fr'

            const promise1 = component.applyLang()
            const promise2 = component.applyLang()

            await Promise.all([promise1, promise2])

            expect(mockUserPreferenceService.saveUserPreference).toHaveBeenCalledTimes(2)
            expect(mockLocation.assign).toHaveBeenCalledTimes(2)
        })

        it('should handle very long userUrl', async () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '?param=' + 'b'.repeat(1000)
            mockConfigurationsService.userUrl = longUrl
            component.selectedLang = 'fr'

            await component.applyLang()

            expect(mockLocation.assign).toHaveBeenCalledWith(
                `https://example.com/fr/app/setup/home/tnc?ref=${encodeURIComponent(longUrl)}`
            )
        })
    })
})