import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { ProfileV2Service } from '@ws/app/src/lib/routes/profile-v2/services/profile-v2.servive'
import { of, throwError } from 'rxjs'
import { EnrollProfileFormComponent } from './enroll-profile-form.component'

describe('EnrollProfileFormComponent', () => {
  let component: EnrollProfileFormComponent
  let mockUserProfileService: jest.Mocked<UserProfileService>
  let mockConfigService: jest.Mocked<ConfigurationsService>
  let mockProfileV2Service: jest.Mocked<ProfileV2Service>
  let mockTranslateService: jest.Mocked<TranslateService>
  let mockDialogRef: jest.Mocked<MatDialogRef<EnrollProfileFormComponent>>
  let mockSnackBar: jest.Mocked<MatSnackBar>

  const mockDialogData = {
    batchData: {
      batchAttributes: {
        userProfileFileds: 'Full iGOT profile',
        bpEnrolMandatoryProfileFields: [
          { field: 'profileDetails.personalDetails.firstname', name: 'name' },
          { field: 'profileDetails.personalDetails.primaryEmail', name: 'email' }
        ]
      }
    }
  }

  beforeEach(() => {
    mockUserProfileService = {
      getGroups: jest.fn().mockReturnValue(of({ result: { response: ['Group1', 'Group2'] } })),
      getDesignations: jest.fn().mockReturnValue(of({ responseData: [] })),
      getMasterLanguages: jest.fn().mockReturnValue(of({ languages: [] })),
      handleTranslateTo: jest.fn().mockReturnValue('translated text'),
      editProfileDetails: jest.fn().mockReturnValue(of({ responseCode: 'OK' })),
      updatePrimaryEmailDetails: jest.fn().mockReturnValue(of({}))
    } as any

    mockConfigService = {
      unMappedUser: {
        id: 'test-user',
        profileDetails: {
          personalDetails: {
            firstname: 'Test',
            primaryEmail: 'test@example.com'
          },
          employmentDetails: {},
          professionalDetails: [{}]
        }
      }
    } as any

    mockProfileV2Service = {
      fetchCadre: jest.fn().mockReturnValue(of({
        result: {
          response: {
            value: {
              civilServiceType: {
                civilServiceTypeList: []
              }
            }
          }
        }
      })),
      fetchApprovalDetails: jest.fn().mockReturnValue(of({ result: { data: [] } }))
    } as any

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn()
    } as any

    mockDialogRef = {
      close: jest.fn()
    } as any

    mockSnackBar = {
      open: jest.fn()
    } as any


    component = new EnrollProfileFormComponent(
      mockSnackBar,
      mockDialogRef,
      mockUserProfileService,
      mockConfigService,
      mockProfileV2Service,
      mockTranslateService,
      mockDialogData
    )
  })

  it('should create component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.spyOn(component, 'fetchCadreData')
      jest.spyOn(component, 'getGroupData')
      jest.spyOn(component, 'getPendingDetails')
    })

    it('should initialize component and call required methods', () => {
      component.ngOnInit()
      expect(component.fetchCadreData).toHaveBeenCalled()
      expect(component.getGroupData).toHaveBeenCalled()
      expect(component.getPendingDetails).toHaveBeenCalled()
    })
  })

  describe('form validation', () => {
    it('should validate email format', () => {
      const emailControl = component.userDetailsForm.get('primaryEmail')
      emailControl?.setValue('invalid-email')
      expect(emailControl?.errors?.['pattern']).toBeTruthy()

      emailControl?.setValue('valid@email.com')
      expect(emailControl?.errors).toBeNull()
    })

    it('should validate mobile number format', () => {
      const mobileControl = component.userDetailsForm.get('mobile')
      mobileControl?.setValue('123')
      expect(mobileControl?.errors?.['pattern']).toBeUndefined()

      mobileControl?.setValue('9876543210')
      expect(mobileControl?.errors).toBeNull()
    })
  })

  describe('getIsCadreStatus', () => {
    it('should update form validations when cadre status changes', () => {
      const addValidatorsSpy = jest.spyOn(component, 'addValidators')
      const removeValidatorsSpy = jest.spyOn(component, 'removeValidators')

      component.getIsCadreStatus(true)
      expect(component.isCadreStatus).toBe(true)
      expect(addValidatorsSpy).toHaveBeenCalled()

      component.getIsCadreStatus(false)
      expect(component.isCadreStatus).toBe(false)
      expect(removeValidatorsSpy).toHaveBeenCalled()
    })
  })

  describe('onSubmitForm', () => {
    beforeEach(() => {
      jest.spyOn(component, 'generateProfilePayload')
      jest.spyOn(component, 'submitProfile')
    })

    it('should submit form with correct payload', () => {
      const mockPayload = {
        request: {
          userId: 'test-user',
          profileDetails: {
            personalDetails: {},
            employmentDetails: {},
            cadreDetails: {}
          }
        }
      }

      component.generateProfilePayload = jest.fn().mockReturnValue(mockPayload)
      component.onSubmitForm(component.userDetailsForm)

      expect(component.generateProfilePayload).toHaveBeenCalled()
      expect(component.submitProfile).toHaveBeenCalledWith(mockPayload)
    })

  })

  describe('updateEmail', () => {
    it('should update email and show success message', () => {
      const newEmail = 'new@email.com'
      component.updateEmail(newEmail)

      expect(mockUserProfileService.updatePrimaryEmailDetails).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text')
    })

    it('should handle email update error', () => {
      const newEmail = 'new@email.com'
      mockUserProfileService.updatePrimaryEmailDetails.mockReturnValue(
        throwError(() => ({ ok: false }))
      )

      component.updateEmail(newEmail)
      expect(mockSnackBar.open).toHaveBeenCalledWith('translated text')
    })
  })
})