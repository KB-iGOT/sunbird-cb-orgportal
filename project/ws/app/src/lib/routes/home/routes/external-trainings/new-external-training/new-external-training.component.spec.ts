import { FormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { NewExternalTrainingComponent } from './new-external-training.component'

jest.mock('../../../../../../../../../../src/environments/environment', () => ({
  environment: {
    portalsForNotifications: {
      mdo: 'https://mdo.example.com',
    },
  },
}))

describe('NewExternalTrainingComponent', () => {
  let component: NewExternalTrainingComponent
  let mockFb: any
  let mockRouter: any
  let mockActiveRoute: any
  let mockExternalTrainingsSvc: any
  let mockMatSnackBar: any
  let mockSanitizer: any
  const realFb = new FormBuilder()

  beforeAll(() => {
    (global as any).URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url')
      ; (global as any).URL.revokeObjectURL = jest.fn()
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockFb = {
      group: jest.fn().mockImplementation((controls: any, options?: any) => {
        return realFb.group(controls, options)
      }),
    }

    mockRouter = {
      navigate: jest.fn(),
    }

    mockActiveRoute = {
      snapshot: {
        data: {
          configService: {
            userProfile: {
              userId: 'user123',
              rootOrgId: 'org123',
              firstName: 'TestUser',
            },
            unMappedUser: {
              rootOrg: {
                orgName: 'TestOrg',
              },
            },
            userProfileV2: {
              email: 'test@example.com',
            },
          },
        },
      },
    }

    mockExternalTrainingsSvc = {
      getDefaultTemplate: jest.fn().mockReturnValue(of({})),
      fetchTemplateByUrl: jest.fn().mockReturnValue(of(new Blob())),
      createExternalTraining: jest.fn().mockReturnValue(of({})),
      publishExternalTraining: jest.fn().mockReturnValue(of({})),
      createContent: jest.fn().mockReturnValue(of({})),
      uploadContent: jest.fn().mockReturnValue(of({})),
      setTrainingName: jest.fn(),
    }

    mockMatSnackBar = {
      open: jest.fn(),
    }

    mockSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: any) => url),
    }

    component = new NewExternalTrainingComponent(
      mockFb as any,
      mockRouter as any,
      mockActiveRoute as any,
      mockExternalTrainingsSvc as any,
      mockMatSnackBar as any,
      mockSanitizer as any
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set configSvc from route snapshot data', () => {
      mockExternalTrainingsSvc.getDefaultTemplate.mockReturnValue(of({}))
      component.ngOnInit()
      expect(component.configSvc).toEqual(mockActiveRoute.snapshot.data['configService'])
    })

    it('should set previewLogoUrl to defaultCertificateTemplateUrl', () => {
      mockExternalTrainingsSvc.getDefaultTemplate.mockReturnValue(of({}))
      component.ngOnInit()
      expect(component.previewLogoUrl).toBe(component.defaultCertificateTemplateUrl)
    })

    it('should call initializeForm and getDefaultTemplate', () => {
      const initSpy = jest.spyOn(component, 'initializeForm')
      const getDefaultSpy = jest.spyOn(component, 'getDefaultTemplate')
      mockExternalTrainingsSvc.getDefaultTemplate.mockReturnValue(of({}))
      component.ngOnInit()
      expect(initSpy).toHaveBeenCalled()
      expect(getDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('initializeForm', () => {
    it('should create trainingForm with correct controls', () => {
      component.initializeForm()
      expect(component.trainingForm).toBeDefined()
      expect(component.trainingForm.get('trainingTitle')).toBeTruthy()
      expect(component.trainingForm.get('learningObjective')).toBeTruthy()
      expect(component.trainingForm.get('deliveryMode')).toBeTruthy()
      expect(component.trainingForm.get('learningHours')).toBeTruthy()
      expect(component.trainingForm.get('trainingType')).toBeTruthy()
      expect(component.trainingForm.get('partnerName')).toBeTruthy()
    })

    it('should have trainingTitle as required', () => {
      component.initializeForm()
      const control = component.trainingForm.get('trainingTitle')
      control!.setValue('')
      expect(control!.hasError('required')).toBeTruthy()
    })

    it('should have trainingType as required', () => {
      component.initializeForm()
      const control = component.trainingForm.get('trainingType')
      control!.setValue('')
      expect(control!.hasError('required')).toBeTruthy()
    })

    it('should validate trainingTitle minLength of 10', () => {
      component.initializeForm()
      const control = component.trainingForm.get('trainingTitle')
      control!.setValue('Short')
      expect(control!.hasError('minlength')).toBeTruthy()
    })

    it('should validate trainingTitle maxLength of 70', () => {
      component.initializeForm()
      const control = component.trainingForm.get('trainingTitle')
      control!.setValue('a'.repeat(71))
      expect(control!.hasError('maxlength')).toBeTruthy()
    })

    it('should validate learningHours min value of 1', () => {
      component.initializeForm()
      const control = component.trainingForm.get('learningHours')
      control!.setValue(0)
      expect(control!.hasError('min')).toBeTruthy()
    })

    it('should validate learningObjective maxLength of 500', () => {
      component.initializeForm()
      const control = component.trainingForm.get('learningObjective')
      control!.setValue('a'.repeat(501))
      expect(control!.hasError('maxlength')).toBeTruthy()
    })
  })

  describe('getDefaultTemplate', () => {
    it('should parse response and call fetchTemplateByUrl on success', () => {
      const mockResponse = {
        result: {
          response: {
            value: JSON.stringify({
              template: 'https://example.com/content-store/templates/cert.svg',
              identifier: 'template123',
            }),
          },
        },
      }
      mockExternalTrainingsSvc.getDefaultTemplate.mockReturnValue(of(mockResponse))
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockExternalTrainingsSvc.fetchTemplateByUrl.mockReturnValue(of(mockBlob))

      component.getDefaultTemplate()

      expect(mockExternalTrainingsSvc.getDefaultTemplate).toHaveBeenCalled()
      expect(component.templateId).toBe('template123')
      expect(mockExternalTrainingsSvc.fetchTemplateByUrl).toHaveBeenCalled()
    })

    it('should set templateLoadFailed and show snackbar on getDefaultTemplate error', () => {
      mockExternalTrainingsSvc.getDefaultTemplate.mockReturnValue(throwError(() => new Error('fail')))
      const snackSpy = jest.spyOn(component, 'openSnackbar')

      component.getDefaultTemplate()

      expect(component.templateLoadFailed).toBe(true)
      expect(snackSpy).toHaveBeenCalledWith('Failed to load default certificate template.')
    })

    it('should set templateLoadFailed on invalid JSON parse', () => {
      const mockResponse = {
        result: {
          response: {
            value: 'not-json',
          },
        },
      }
      mockExternalTrainingsSvc.getDefaultTemplate.mockReturnValue(of(mockResponse))
      const snackSpy = jest.spyOn(component, 'openSnackbar')

      component.getDefaultTemplate()

      expect(component.templateLoadFailed).toBe(true)
      expect(snackSpy).toHaveBeenCalledWith('Failed to parse default certificate template response.')
    })

    it('should set templateLoadFailed on fetchTemplateByUrl error', () => {
      const mockResponse = {
        result: {
          response: {
            value: JSON.stringify({
              template: 'https://example.com/content-store/templates/cert.svg',
              identifier: 'template123',
            }),
          },
        },
      }
      mockExternalTrainingsSvc.getDefaultTemplate.mockReturnValue(of(mockResponse))
      mockExternalTrainingsSvc.fetchTemplateByUrl.mockReturnValue(throwError(() => new Error('fetch fail')))
      const snackSpy = jest.spyOn(component, 'openSnackbar')

      component.getDefaultTemplate()

      expect(component.templateLoadFailed).toBe(true)
      expect(snackSpy).toHaveBeenCalledWith('Failed to load certificate template SVG.')
    })
  })

  describe('onFileSelected', () => {
    it('should do nothing if no file is selected', () => {
      const event = { target: { files: [] } }
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      component.onFileSelected(event)
      expect(snackSpy).not.toHaveBeenCalled()
    })

    it('should show snackbar for non-SVG files', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' })
      const event = { target: { files: [file] } }
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      component.onFileSelected(event)
      expect(snackSpy).toHaveBeenCalledWith('Please upload a valid SVG file.')
    })

    it('should show snackbar for file larger than 1MB', () => {
      const largeContent = 'a'.repeat(1024 * 1024 + 1)
      const file = new File([largeContent], 'test.svg', { type: 'image/svg+xml' })
      const event = { target: { files: [file] } }
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      component.onFileSelected(event)
      expect(snackSpy).toHaveBeenCalledWith('Please upload a file less than 1 MB.')
    })
  })

  describe('removeUploadedLogo', () => {
    it('should reset logo state and restore original template', () => {
      const originalBlob = new Blob(['<svg>original</svg>'], { type: 'image/svg+xml' })
      const originalFile = new File([originalBlob], 'original.svg', { type: 'image/svg+xml' })
      component.originalContentFile = originalFile
      component.mergedLogoUrl = 'merged-url'
      component.logoFileName = 'logo.svg'
      component.logoUploaded = true
      component.selectedLogoImage = 'data:image/svg+xml;base64,abc'

      component.removeUploadedLogo()

      expect(component.mergedLogoUrl).toBeNull()
      expect(component.logoFileName).toBe('')
      expect(component.logoUploaded).toBe(false)
      expect(component.selectedLogoImage).toBeNull()
      expect(component.contentFile).toBe(originalFile)
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
    })
  })

  describe('onSelectedCompetencyChange', () => {
    it('should update selectedCompetencyList', () => {
      const competencies = [{ id: 1, name: 'Angular' }, { id: 2, name: 'React' }]
      component.onSelectedCompetencyChange(competencies)
      expect(component.selectedCompetencyList).toEqual(competencies)
    })
  })

  describe('buildPayload', () => {
    beforeEach(() => {
      component.configSvc = mockActiveRoute.snapshot.data['configService']
      component.initializeForm()
      component.trainingForm.patchValue({
        trainingTitle: 'Test Training Title',
        learningObjective: 'Test objective',
        deliveryMode: 'Online',
        learningHours: 5,
        trainingType: 'Domestic Training',
        partnerName: 'PartnerOrg',
      })
      component.selectedCompetencyList = [{ id: 1, name: 'Angular' }]
    })

    it('should build correct payload from form values', () => {
      const payload = component.buildPayload
      expect(payload.request.event.name).toBe('Test Training Title')
      expect(payload.request.event.description).toBe('Test objective')
      expect(payload.request.event.eventType).toBe('Online')
      expect(payload.request.event.duration).toBe(18000)
      expect(payload.request.event.categoryType).toBe('Domestic Training')
      expect(payload.request.event.partnerName).toBe('PartnerOrg')
      expect(payload.request.event.category).toBe('externalTraining')
      expect(payload.request.event.resourceType).toBe('externalTraining')
      expect(payload.request.event.mimeType).toBe('application/html')
      expect(payload.request.event.locale).toBe('en')
      expect(payload.request.event.code).toBe('externalTraining')
    })

    it('should include user profile data in payload', () => {
      const payload = component.buildPayload
      expect(payload.request.event.createdBy).toBe('user123')
      expect(payload.request.event.sourceName).toBe('TestOrg')
      expect(payload.request.event.createdFor).toEqual(['org123'])
      expect(payload.request.event.channel).toBe('org123')
      expect(payload.request.event.creatorName).toBe('TestUser')
      expect(payload.request.event.createrEmail).toBe('test@example.com')
    })

    it('should include competencies and trackable info', () => {
      const payload = component.buildPayload
      expect(payload.request.event.competencies_v6).toEqual([{ id: 1, name: 'Angular' }])
      expect(payload.request.event.trackable).toEqual({ enabled: 'Yes', autoBatch: 'No' })
    })

    it('should default learningHours to 0 if empty', () => {
      component.trainingForm.patchValue({ learningHours: '' })
      const payload = component.buildPayload
      expect(payload.request.event.duration).toBe(0)
    })

    it('should default deliveryMode to empty string if not set', () => {
      component.trainingForm.patchValue({ deliveryMode: '' })
      const payload = component.buildPayload
      expect(payload.request.event.eventType).toBe('')
    })
  })

  describe('onSubmit', () => {
    beforeEach(() => {
      component.configSvc = mockActiveRoute.snapshot.data['configService']
      component.initializeForm()
      component.trainingForm.patchValue({
        trainingTitle: 'Valid Training Title Here',
        learningObjective: 'Test learning objective',
        deliveryMode: 'Online',
        learningHours: 5,
        trainingType: 'Domestic Training',
        partnerName: 'PartnerOrg',
      })
      component.selectedCompetencyList = [{ id: 1, name: 'Angular' }]
      component.templateId = 'template123'
      component.defaultTemplateUrl = 'https://mdo.example.com/content-store/templates/cert.svg'
    })

    it('should show snackbar if form is invalid', () => {
      component.trainingForm.patchValue({ trainingTitle: '' })
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      component.onSubmit()
      expect(snackSpy).toHaveBeenCalledWith('Please fill all required fields, certificate template and select at least one competency.')
    })

    it('should show snackbar if no competencies selected', () => {
      component.selectedCompetencyList = []
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      component.onSubmit()
      expect(snackSpy).toHaveBeenCalledWith('Please fill all required fields, certificate template and select at least one competency.')
    })

    it('should show snackbar if templateId is empty', () => {
      component.templateId = ''
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      component.onSubmit()
      expect(snackSpy).toHaveBeenCalledWith('Please fill all required fields, certificate template and select at least one competency.')
    })

    it('should call createExternalTraining and publishExternalTraining when no logo uploaded (default template)', () => {
      component.logoUploaded = false
      const createRes = { result: { identifier: 'ext123', versionKey: 'v1' } }
      const publishRes = { result: { identifier: 'ext123' } }
      mockExternalTrainingsSvc.createExternalTraining.mockReturnValue(of(createRes))
      mockExternalTrainingsSvc.publishExternalTraining.mockReturnValue(of(publishRes))

      component.onSubmit()

      expect(mockExternalTrainingsSvc.createExternalTraining).toHaveBeenCalled()
      expect(mockExternalTrainingsSvc.publishExternalTraining).toHaveBeenCalled()
      expect(mockExternalTrainingsSvc.setTrainingName).toHaveBeenCalledWith('Valid Training Title Here')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'home', 'external-trainings', 'ext123', 'create-batch'])
    })

    it('should include certTemplate and certTemplateId in payload when no logo uploaded', () => {
      component.logoUploaded = false
      const createRes = { result: { identifier: 'ext123', versionKey: 'v1' } }
      const publishRes = { result: { identifier: 'ext123' } }
      mockExternalTrainingsSvc.createExternalTraining.mockReturnValue(of(createRes))
      mockExternalTrainingsSvc.publishExternalTraining.mockReturnValue(of(publishRes))

      component.onSubmit()

      const callArg = mockExternalTrainingsSvc.createExternalTraining.mock.calls[0][0]
      expect(callArg.request.event.certTemplate).toBe(component.defaultTemplateUrl)
      expect(callArg.request.event.certTemplateId).toBe('template123')
    })

    it('should handle error on createExternalTraining when no logo uploaded', () => {
      component.logoUploaded = false
      mockExternalTrainingsSvc.createExternalTraining.mockReturnValue(
        throwError({ error: { params: { errmsg: 'Creation failed' } } })
      )
      const snackSpy = jest.spyOn(component, 'openSnackbar')

      component.onSubmit()

      expect(snackSpy).toHaveBeenCalledWith('Creation failed')
    })

    it('should use default error message when error.params.errmsg is missing', () => {
      component.logoUploaded = false
      mockExternalTrainingsSvc.createExternalTraining.mockReturnValue(throwError({}))
      const snackSpy = jest.spyOn(component, 'openSnackbar')

      component.onSubmit()

      expect(snackSpy).toHaveBeenCalledWith('An error occurred while creating the training.')
    })

    it('should call createContent, uploadContent, createExternalTraining, and publishExternalTraining when logo is uploaded', () => {
      component.logoUploaded = true
      component.contentFile = new File(['<svg></svg>'], 'cert.svg', { type: 'image/svg+xml' })

      const createContentRes = { result: { identifier: 'content123' } }
      const uploadRes = { result: { artifactUrl: 'https://example.com/content/artifacts/cert.svg', identifier: 'content123' } }
      const createTrainingRes = { result: { identifier: 'ext123', versionKey: 'v1' } }
      const publishRes = { result: { identifier: 'ext123' } }

      mockExternalTrainingsSvc.createContent.mockReturnValue(of(createContentRes))
      mockExternalTrainingsSvc.uploadContent.mockReturnValue(of(uploadRes))
      mockExternalTrainingsSvc.createExternalTraining.mockReturnValue(of(createTrainingRes))
      mockExternalTrainingsSvc.publishExternalTraining.mockReturnValue(of(publishRes))

      component.onSubmit()

      expect(mockExternalTrainingsSvc.createContent).toHaveBeenCalled()
      expect(mockExternalTrainingsSvc.uploadContent).toHaveBeenCalledWith('content123', expect.any(FormData))
      expect(mockExternalTrainingsSvc.createExternalTraining).toHaveBeenCalled()
      expect(mockExternalTrainingsSvc.publishExternalTraining).toHaveBeenCalled()
      expect(mockExternalTrainingsSvc.setTrainingName).toHaveBeenCalledWith('Valid Training Title Here')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app', 'home', 'external-trainings', 'ext123', 'create-batch'])
    })

    it('should handle error in logo upload pipeline', () => {
      component.logoUploaded = true
      component.contentFile = new File(['<svg></svg>'], 'cert.svg', { type: 'image/svg+xml' })

      mockExternalTrainingsSvc.createContent.mockReturnValue(
        throwError({ error: { params: { errmsg: 'Upload failed' } } })
      )
      const snackSpy = jest.spyOn(component, 'openSnackbar')

      component.onSubmit()

      expect(snackSpy).toHaveBeenCalledWith('Upload failed')
    })

    it('should not navigate if publishExternalTraining result has no identifier', () => {
      component.logoUploaded = false
      const createRes = { result: { identifier: 'ext123', versionKey: 'v1' } }
      const publishRes = { result: {} }
      mockExternalTrainingsSvc.createExternalTraining.mockReturnValue(of(createRes))
      mockExternalTrainingsSvc.publishExternalTraining.mockReturnValue(of(publishRes))

      component.onSubmit()

      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('navigateToCreateBatch', () => {
    it('should navigate to create-batch route with identifier', () => {
      component.navigateToCreateBatch('ext123')
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        'app', 'home', 'external-trainings', 'ext123', 'create-batch',
      ])
    })
  })

  describe('goBackToExternalTrainings', () => {
    it('should navigate to external-trainings route', () => {
      component.goBackToExternalTrainings()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/external-trainings'])
    })
  })

  describe('openSnackbar', () => {
    it('should open snackbar with message and default action', () => {
      component.openSnackbar('Test message')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test message', 'Close', { duration: 3000 })
    })

    it('should open snackbar with custom action', () => {
      component.openSnackbar('Test message', 'close')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test message', 'close', { duration: 3000 })
    })
  })

  describe('deliveryModeList', () => {
    it('should have delivery mode list populated', () => {
      expect(component.deliveryModeList).toBeDefined()
      expect(component.deliveryModeList.length).toBeGreaterThan(0)
    })

    it('should contain key-value pairs for delivery modes', () => {
      const keys = component.deliveryModeList.map((item: any) => item.key)
      expect(keys).toContain('Online')
      expect(keys).toContain('Offline')
      expect(keys).toContain('OnlineAndOffline')
    })
  })

  describe('handleLogoUpload (via onFileSelected)', () => {
    let mockFileReaderInstances: any[]
    let OriginalFileReader: any

    beforeEach(() => {
      mockFileReaderInstances = []
      OriginalFileReader = (global as any).FileReader

        ; (global as any).FileReader = jest.fn().mockImplementation(() => {
          const instance: any = {
            readAsDataURL: jest.fn().mockImplementation(function (this: any) {
              if (this.onload) {
                this.onload({ target: { result: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' } })
              }
            }),
            readAsText: jest.fn().mockImplementation(function (this: any, _blob: any) {
              if (this.onload) {
                this.onload({
                  target: {
                    result: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g id="ProvidersLogo_Placement"><rect/></g></svg>',
                  },
                })
              }
            }),
            onload: null,
          }
          mockFileReaderInstances.push(instance)
          return instance
        })
    })

    afterEach(() => {
      ; (global as any).FileReader = OriginalFileReader
    })

    it('should set logoFileName, logoUploaded, selectedLogoImage and call mergeLogo on valid SVG', () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'
      const file = new File([svgContent], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File(
        ['<svg xmlns="http://www.w3.org/2000/svg"><g id="ProvidersLogo_Placement"></g></svg>'],
        'cert.svg',
        { type: 'image/svg+xml' }
      )
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.logoFileName).toBe('logo.svg')
      expect(component.logoUploaded).toBe(true)
      expect(component.selectedLogoImage).toBe('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')
    })

    it('should call mergeLogo which processes certificate and logo SVG', () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'
      const file = new File([svgContent], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File(
        ['<svg xmlns="http://www.w3.org/2000/svg"><g id="ProvidersLogo_Placement"></g></svg>'],
        'cert.svg',
        { type: 'image/svg+xml' }
      )
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
    })

    it('should not call mergeLogo if originalContentFile is not set', () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'
      const file = new File([svgContent], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = null
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.logoUploaded).toBe(true)
      expect(component.isLogoMerging).toBe(false)
    })
  })

  describe('mergeLogo catch block', () => {
    let OriginalFileReader: any

    beforeEach(() => {
      OriginalFileReader = (global as any).FileReader
    })

    afterEach(() => {
      ; (global as any).FileReader = OriginalFileReader
    })

    it('should handle error in mergeLogo when FileReader throws', () => {
      ; (global as any).FileReader = jest.fn().mockImplementation(() => {
        const instance: any = {
          readAsDataURL: jest.fn().mockImplementation(function (this: any) {
            if (this.onload) {
              this.onload({ target: { result: 'data:image/svg+xml;base64,PHN2Zz4=' } })
            }
          }),
          readAsText: jest.fn().mockImplementation(() => {
            throw new Error('FileReader error')
          }),
          onload: null,
        }
        return instance
      })

      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>'
      const file = new File([svgContent], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File(['<svg></svg>'], 'cert.svg', { type: 'image/svg+xml' })
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(snackSpy).toHaveBeenCalledWith('Error processing files: FileReader error', 'close')
    })
  })

  describe('processMergeLogo and updateCertificateWithLogo', () => {
    let OriginalFileReader: any

    const makeMockFileReader = (certSvg: string, logoSvgResult: string) => {
      let callCount = 0
        ; (global as any).FileReader = jest.fn().mockImplementation(() => {
          const instance: any = {
            readAsDataURL: jest.fn().mockImplementation(function (this: any) {
              if (this.onload) {
                this.onload({
                  target: { result: 'data:image/svg+xml;base64,' + Buffer.from(logoSvgResult).toString('base64') },
                })
              }
            }),
            readAsText: jest.fn().mockImplementation(function (this: any) {
              callCount++
              if (this.onload) {
                if (callCount === 1) {
                  this.onload({ target: { result: certSvg } })
                } else {
                  this.onload({ target: { result: logoSvgResult } })
                }
              }
            }),
            onload: null,
          }
          return instance
        })
    }

    beforeEach(() => {
      OriginalFileReader = (global as any).FileReader
    })

    afterEach(() => {
      ; (global as any).FileReader = OriginalFileReader
    })

    it('should merge logo into certificate with ProvidersLogo_Placement group', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"><rect width="50" height="50"/></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="50"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(component.contentFile).toBeDefined()
      expect(component.certificateUrl).toBe('blob:mock-url')
      expect(component.previewLogoUrl).toBe('blob:mock-url')
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled()
    })

    it('should append logo to root SVG when no ProvidersLogo_Placement group exists', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><rect width="100" height="100"/></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="50"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(component.contentFile).toBeDefined()
    })

    it('should handle logo SVG without viewBox but with width/height attributes', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="75"><rect width="150" height="75"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(component.contentFile).toBeDefined()
    })

    it('should handle logo SVG without viewBox and without width/height (defaults to 100x100)', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="50" height="50"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(component.contentFile).toBeDefined()
    })

    it('should show snackbar when certificate SVG has parse error', () => {
      const certSvg = '<not-valid-xml<>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(snackSpy).toHaveBeenCalledWith('Error parsing certificate SVG', 'close')
    })

    it('should show snackbar when logo SVG has parse error', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<not-valid-xml<>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(snackSpy).toHaveBeenCalledWith('Error parsing logo SVG', 'close')
    })

    it('should show snackbar when logo has no svg tag', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<html xmlns="http://www.w3.org/1999/xhtml"><body>Not an SVG</body></html>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const snackSpy = jest.spyOn(component, 'openSnackbar')
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(snackSpy).toHaveBeenCalledWith('Invalid logo SVG structure: No <svg> tag found', 'close')
    })

    it('should handle logoHeight of 0 by defaulting to 100', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 0"><circle cx="100" cy="0" r="0"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(component.contentFile).toBeDefined()
    })

    it('should use default fileName certificate.svg when fileName is empty', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="50"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = ''
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.contentFile).toBeDefined()
      expect((component.contentFile as File).name).toBe('certificate.svg')
    })

    it('should handle nested SVG elements inside logo and set width/height/viewBox if missing', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><svg><circle cx="100" cy="100" r="50"/></svg></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
      expect(component.contentFile).toBeDefined()
    })

    it('should handle processMergeLogo catch block when updateCertificateWithLogo throws', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'

      let callCount = 0
        ; (global as any).FileReader = jest.fn().mockImplementation(() => {
          const instance: any = {
            readAsDataURL: jest.fn().mockImplementation(function (this: any) {
              if (this.onload) {
                this.onload({
                  target: { result: 'data:image/svg+xml;base64,' + Buffer.from(logoSvg).toString('base64') },
                })
              }
            }),
            readAsText: jest.fn().mockImplementation(function (this: any) {
              callCount++
              if (this.onload) {
                if (callCount === 1) {
                  this.onload({ target: { result: certSvg } })
                } else {
                  this.onload({ target: { result: logoSvg } })
                }
              }
            }),
            onload: null,
          }
          return instance
        })

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'

      // Force updateCertificateWithLogo to throw by making sanitizer throw
      mockSanitizer.bypassSecurityTrustResourceUrl.mockImplementation(() => {
        throw new Error('sanitizer error')
      })

      const event = { target: { files: [file] } }
      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
    })

    it('should handle file with .svg extension even if type is not image/svg+xml', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="50"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: '' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.logoUploaded).toBe(true)
    })

    it('should handle viewBox with fewer than 4 parts gracefully', () => {
      const certSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2000"><g id="ProvidersLogo_Placement"></g></svg>'
      const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0"><circle cx="50" cy="50" r="25"/></svg>'

      makeMockFileReader(certSvg, logoSvg)

      const file = new File([logoSvg], 'logo.svg', { type: 'image/svg+xml' })
      component.originalContentFile = new File([certSvg], 'cert.svg', { type: 'image/svg+xml' })
      component.fileName = 'cert.svg'
      const event = { target: { files: [file] } }

      component.onFileSelected(event)

      expect(component.isLogoMerging).toBe(false)
    })
  })

  describe('isValidFile (via onFileSelected)', () => {
    it('should accept file with .svg extension regardless of case', () => {
      const OriginalFileReader = (global as any).FileReader
        ; (global as any).FileReader = jest.fn().mockImplementation(() => ({
          readAsDataURL: jest.fn().mockImplementation(function (this: any) {
            if (this.onload) {
              this.onload({ target: { result: 'data:image/svg+xml;base64,abc' } })
            }
          }),
          readAsText: jest.fn(),
          onload: null,
        }))

      const file = new File(['<svg></svg>'], 'LOGO.SVG', { type: '' })
      component.originalContentFile = null
      const event = { target: { files: [file] } }

      component.onFileSelected(event)
      expect(component.logoUploaded).toBe(true)

        ; (global as any).FileReader = OriginalFileReader
    })
  })
})
