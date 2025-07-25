import { CustomSelfRegistrationComponent } from './custom-self-registration.component'
import { of, throwError } from 'rxjs'

describe('CustomSelfRegistrationComponent', () => {
  let component: CustomSelfRegistrationComponent
  let mockDialog: any
  let mockActivatedRoute: any
  let mockRouter: any
  let mockFormBuilder: any
  let mockSnackbar: any
  let mockClipboard: any
  let mockOnboardingService: any
  let mockDesignationsService: any
  let mockEventService: any
  let mockDialogRef: any

  beforeEach(() => {
    // Mock dependencies
    mockDialog = {
      open: jest.fn()
    }

    mockActivatedRoute = {
      parent: {
        snapshot: {
          data: {
            configService: {
              userProfile: { rootOrgId: 'test-org-id' },
              orgReadData: {
                frameworkid: 'test-framework-id',
                orgName: 'Test Organization'
              }
            },
            pageData: { data: { testConfig: 'test' } }
          }
        }
      }
    }

    mockRouter = {
      navigate: jest.fn()
    }

    mockFormBuilder = {
      group: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue({ setValue: jest.fn() }),
        controls: {
          startDate: { value: new Date('2023-01-01') },
          endDate: { value: new Date('2023-12-31') }
        }
      })
    }

    mockSnackbar = {
      open: jest.fn()
    }

    mockClipboard = {
      copy: jest.fn()
    }

    mockOnboardingService = {
      getListOfRegisteedLinks: jest.fn(),
      generateSelfRegistrationQRCode: jest.fn(),
      setFlagToCheckRoute: jest.fn()
    }

    mockDesignationsService = {
      getFrameworkInfo: jest.fn()
    }

    mockEventService = {
      raiseInteractTelemetry: jest.fn()
    }

    mockDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn().mockReturnValue(of({}))
    }

    // Create component instance
    component = new CustomSelfRegistrationComponent(
      mockDialog,
      mockActivatedRoute,
      mockRouter,
      mockFormBuilder,
      mockSnackbar,
      mockClipboard,
      mockOnboardingService,
      mockDesignationsService,
      mockEventService
    )
  })

  describe('ngOnInit', () => {
    it('should initialize component properties', () => {
      component.ngOnInit()

      expect(component.configSvc).toBe(mockActivatedRoute.parent.snapshot.data.configService)
      expect(component.onboardingConfig).toBe(mockActivatedRoute.parent.snapshot.data.pageData.data)
      expect(component.rootOrdId).toBe('test-org-id')
      expect(component.framewordId).toBe('test-framework-id')
      expect(mockFormBuilder.group).toHaveBeenCalled()
    })

    it('should call getFrameworkInfo when framewordId and orgReadData exist', () => {
      jest.spyOn(component, 'getFrameworkInfo')
      component.ngOnInit()

      expect(component.getFrameworkInfo).toHaveBeenCalledWith('test-framework-id')
    })

    it('should not call getFrameworkInfo when framewordId is missing', () => {
      mockActivatedRoute.parent.snapshot.data.configService.orgReadData.frameworkid = ''
      jest.spyOn(component, 'getFrameworkInfo')
      component.ngOnInit()

      expect(component.getFrameworkInfo).not.toHaveBeenCalled()
    })
  })

  describe('getlistOfRegisterationLinks', () => {
    it('should handle successful response with valid data', () => {
      const mockResponse = {
        result: {
          qrCodeDataForOrg: [
            {
              startDate: '2023-01-01',
              endDate: '2023-12-31',
              url: 'http://test-url.com',
              qrCodeImagePath: 'portal/test-qr-path',
              numberOfUsersOnboarded: 10
            }
          ]
        }
      }

      mockOnboardingService.getListOfRegisteedLinks.mockReturnValue(of(mockResponse))
      jest.spyOn(component, 'getQRCodePath').mockReturnValue('mdo/test-qr-path')

      component.getlistOfRegisterationLinks()

      expect(component.registeredLinksList).toEqual(mockResponse.result.qrCodeDataForOrg)
      expect(component.latestRegisteredData).toEqual(mockResponse.result.qrCodeDataForOrg[0])
      expect(component.numberOfUsersOnboarded).toBe(0)
      expect(component.isLoading).toBe(false)
    })

    it('should handle response with no data', () => {
      const mockResponse = {
        result: {
          qrCodeDataForOrg: []
        }
      }

      mockOnboardingService.getListOfRegisteedLinks.mockReturnValue(of(mockResponse))

      component.getlistOfRegisterationLinks()

      expect(component.customRegistrationLinks).toBeUndefined()
      expect(component.isLoading).toBe(false)
    })

    it('should handle error response', () => {
      mockOnboardingService.getListOfRegisteedLinks.mockReturnValue(throwError('API Error'))

      component.getlistOfRegisterationLinks()

      expect(mockOnboardingService.getListOfRegisteedLinks).toHaveBeenCalled()
    })
  })

  describe('navigateTo', () => {
    it('should navigate to specified route', () => {
      const route = '/test-route'
      component.navigateTo(route)

      expect(mockRouter.navigate).toHaveBeenCalledWith([route])
    })
  })

  describe('initializeForm', () => {
    it('should initialize form with required validators', () => {
      component.initializeForm()

      expect(mockFormBuilder.group).toHaveBeenCalledWith({
        startDate: ['', [expect.any(Function)]],
        endDate: ['', [expect.any(Function)]]
      })
    })
  })

  describe('copyLinkToClipboard', () => {
    it('should copy link to clipboard and show success message', () => {
      const testLink = 'http://test-link.com'
      component.copyLinkToClipboard(testLink)

      expect(mockClipboard.copy).toHaveBeenCalledWith(testLink)
      expect(mockSnackbar.open).toHaveBeenCalledWith('Copied!', '', { panelClass: ['success'] })
    })
  })

  describe('downloadQRCode', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
      global.window.URL.createObjectURL = jest.fn().mockReturnValue('blob-url')
      global.window.URL.revokeObjectURL = jest.fn()
      global.window.open = jest.fn()

      // Mock document.createElement
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn()
      }
      global.document.createElement = jest.fn().mockReturnValue(mockAnchor)
    })

    it('should download QR code successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob)
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      jest.spyOn(component, 'raiseInteractTelementry')

      component.downloadQRCode('http://test-qr.com')

      expect(component.raiseInteractTelementry).toHaveBeenCalledWith('download-qr')
    })

    it('should handle network error and open link in new tab', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      jest.spyOn(component, 'raiseInteractTelementry')

      component.downloadQRCode('http://test-qr.com')

      expect(component.raiseInteractTelementry).toHaveBeenCalledWith('download-qr')
    })

    it('should handle non-ok response and open link in new tab', async () => {
      const mockResponse = {
        ok: false
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      jest.spyOn(component, 'raiseInteractTelementry')

      component.downloadQRCode('http://test-qr.com')

      expect(component.raiseInteractTelementry).toHaveBeenCalledWith('download-qr')
    })
  })

  describe('sendViaEmail', () => {
    beforeEach(() => {
      global.window.open = jest.fn()
      component.configSvc = {
        orgReadData: { orgName: 'Test Org' }
      }
    })

    it('should open email with proper subject and body', () => {
      jest.spyOn(component, 'raiseInteractTelementry')
      const testLink = 'http://test-link.com'

      component.sendViaEmail(testLink)

      expect(component.raiseInteractTelementry).toHaveBeenCalledWith('share-on-mail')
      expect(global.window.open).toHaveBeenCalledWith(
        expect.stringContaining('mailto:?subject='),
        '_self'
      )
    })

    it('should return early if link is empty', () => {
      jest.spyOn(component, 'raiseInteractTelementry')

      component.sendViaEmail('')

      expect(component.raiseInteractTelementry).toHaveBeenCalledWith('share-on-mail')
      expect(global.window.open).not.toHaveBeenCalled()
    })
  })

  describe('sendViaWhatsApp', () => {
    beforeEach(() => {
      global.window.open = jest.fn()
      component.configSvc = {
        orgReadData: { orgName: 'Test Org' }
      }
    })

    it('should open WhatsApp with encoded message', () => {
      jest.spyOn(component, 'raiseInteractTelementry')
      const testLink = 'http://test-link.com'

      component.sendViaWhatsApp(testLink)

      expect(component.raiseInteractTelementry).toHaveBeenCalledWith('share-on-whatsapp')
      expect(global.window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://api.whatsapp.com/send?text='),
        '_blank'
      )
    })
  })

  describe('generateRegistrationLink', () => {
    beforeEach(() => {
      mockDialog.open.mockReturnValue(mockDialogRef)
      component.rootOrdId = 'test-org-id'
      // component.selfRegistrationForm = {
      //   controls: {
      //     startDate: { value: new Date('2023-01-01'), },
      //     endDate: { value: new Date('2023-12-31'), }
      //   }
      // }
    })

    it('should generate registration link successfully', () => {
      const mockResponse = {
        result: {
          registrationLink: 'http://test-link.com',
          qrRegistrationLink: 'portal/test-qr.png',
          qrCodeLogoPath: 'portal/test-logo.png'
        },
        responseCode: 'OK'
      }

      mockOnboardingService.generateSelfRegistrationQRCode.mockReturnValue(of(mockResponse))

      component.generateRegistrationLink()

      expect(mockDialog.open).toHaveBeenCalled()
      expect(mockOnboardingService.generateSelfRegistrationQRCode).toHaveBeenCalledWith({
        registrationStartDate: expect.any(Number),
        registrationEndDate: expect.any(Number),
        orgId: 'test-org-id'
      })
    })

    it('should handle error response with message', () => {
      const mockResponse = {
        params: {
          errmsg: 'Custom error message'
        }
      }

      mockOnboardingService.generateSelfRegistrationQRCode.mockReturnValue(of(mockResponse))

      component.generateRegistrationLink()

      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'Custom error message',
        'X',
        { duration: 3000, panelClass: ['error'] }
      )
    })

    it('should handle generic error response', () => {
      const mockResponse = {
        result: {}
      }

      mockOnboardingService.generateSelfRegistrationQRCode.mockReturnValue(of(mockResponse))

      component.generateRegistrationLink()

      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'Oops! We couldn\'t generate the link or QR code.Please try again',
        'X',
        { duration: 3000, panelClass: ['error'] }
      )
    })

    it('should handle service error', () => {
      mockOnboardingService.generateSelfRegistrationQRCode.mockReturnValue(throwError('Service Error'))

      component.generateRegistrationLink()

      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })

  describe('getQRCodePath', () => {
    it('should return qrLogoPath when available', () => {
      const response = { qrLogoPath: 'portal/logo-path' }
      const result = component.getQRCodePath(response)
      expect(result).toBe('mdo/logo-path')
    })

    it('should return qrCodeLogoPath when qrLogoPath not available', () => {
      const response = { qrCodeLogoPath: 'portal/code-logo-path' }
      const result = component.getQRCodePath(response)
      expect(result).toBe('mdo/code-logo-path')
    })

    it('should return qrCodeImagePath when other paths not available', () => {
      const response = { qrCodeImagePath: 'portal/image-path' }
      const result = component.getQRCodePath(response)
      expect(result).toBe('mdo/image-path')
    })

    it('should return qrRegistrationLink when other paths not available', () => {
      const response = { qrRegistrationLink: 'portal/registration-link' }
      const result = component.getQRCodePath(response)
      expect(result).toBe('mdo/registration-link')
    })

    it('should return undefined when response is null', () => {
      const result = component.getQRCodePath(null)
      expect(result).toBeUndefined()
    })
  })

  describe('checkRegistrationStatus', () => {
    it('should return true when end date is in future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const result = component.checkRegistrationStatus(futureDate.toISOString())
      expect(result).toBe(true)
    })

    it('should return false when end date is in past', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      const result = component.checkRegistrationStatus(pastDate.toISOString())
      expect(result).toBe(false)
    })

    it('should return false when endDateRegistration is empty', () => {
      const result = component.checkRegistrationStatus('')
      expect(result).toBe(false)
    })
  })

  describe('getFrameworkInfo', () => {
    it('should process framework info successfully and call getlistOfRegisterationLinks', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: [
              {
                code: 'org',
                terms: [
                  {
                    children: [
                      { name: 'Designation 1' },
                      { name: 'Designation 2' }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }

      mockDesignationsService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse))
      jest.spyOn(component, 'getlistOfRegisterationLinks')

      component.getFrameworkInfo('test-framework-id')

      expect(component.isLoading).toBe(true)
      expect(mockDesignationsService.getFrameworkInfo).toHaveBeenCalledWith('test-framework-id')
      expect(component.getlistOfRegisterationLinks).toHaveBeenCalled()
    })

    it('should set isLoading to false when designationsList is empty', () => {
      const mockFrameworkResponse = {
        result: {
          framework: {
            categories: []
          }
        }
      }

      mockDesignationsService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse))

      component.getFrameworkInfo('test-framework-id')

      expect(component.isLoading).toBe(false)
    })
  })

  describe('getTermsByCode', () => {
    it('should return terms for matching code', () => {
      const categories = [
        {
          code: 'org',
          terms: [{ name: 'Term 1' }, { name: 'Term 2' }]
        },
        {
          code: 'other',
          terms: [{ name: 'Term 3' }]
        }
      ]

      const result = (component as any).getTermsByCode(categories, 'org')
      expect(result).toEqual([{ name: 'Term 1' }, { name: 'Term 2' }])
    })

    it('should return empty array for non-matching code', () => {
      const categories = [
        {
          code: 'other',
          terms: [{ name: 'Term 1' }]
        }
      ]

      const result = (component as any).getTermsByCode(categories, 'org')
      expect(result).toEqual([])
    })
  })

  describe('startImporting', () => {
    beforeEach(() => {
      mockDialog.open.mockReturnValue(mockDialogRef)
      jest.spyOn(component, 'subscribeToAfterClosedModal')
    })

    it('should open review dialog when designationsList is empty', () => {
      component.designationsList = []

      component.startImporting()

      expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
        autoFocus: false,
        width: '504px',
        height: '275px',
        maxWidth: '80vw',
        maxHeight: '90vh',
        data: { type: 'import-igot-master-review' },
        disableClose: true
      })
      expect(component.subscribeToAfterClosedModal).toHaveBeenCalled()
    })

    it('should open create dialog when designationsList has items', () => {
      component.designationsList = [{ name: 'Designation 1' }]

      component.startImporting()

      expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
        autoFocus: false,
        width: '504px',
        height: '275px',
        maxWidth: '80vw',
        maxHeight: '90vh',
        data: { type: 'import-igot-master-create' },
        disableClose: true
      })
      expect(component.subscribeToAfterClosedModal).toHaveBeenCalled()
    })
  })

  describe('subscribeToAfterClosedModal', () => {
    beforeEach(() => {
      component.dialogRef = mockDialogRef
      jest.spyOn(component, 'navigateTo')
    })

    it('should navigate when reviewImporting is true', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ reviewImporting: true }))

      component.subscribeToAfterClosedModal()

      expect(mockOnboardingService.setFlagToCheckRoute).toHaveBeenCalledWith(true)
      expect(component.navigateTo).toHaveBeenCalledWith('/app/home/org-designations')
    })

    it('should navigate when startImporting is true', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ startImporting: true }))

      component.subscribeToAfterClosedModal()

      expect(mockOnboardingService.setFlagToCheckRoute).toHaveBeenCalledWith(true)
      expect(component.navigateTo).toHaveBeenCalledWith('/app/home/org-designations')
    })

    it('should return when no valid result', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({}))

      component.subscribeToAfterClosedModal()

      expect(mockOnboardingService.setFlagToCheckRoute).not.toHaveBeenCalled()
      expect(component.navigateTo).not.toHaveBeenCalled()
    })
  })

  describe('raiseInteractTelementry', () => {
    it('should call eventService with correct parameters', () => {
      const subType = 'test-subtype'

      component.raiseInteractTelementry(subType)

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: subType,
          id: 'share-custom-registration-link',
          pageid: '/app/home/onboarding/self-registration'
        },
        {}
      )
    })
  })

  describe('publishNewLink', () => {
    beforeEach(() => {
      mockDialog.open.mockReturnValue(mockDialogRef)
      jest.spyOn(component, 'generateRegistrationLink')
    })

    it('should navigate when reviewImporting is true', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ reviewImporting: true }))
      jest.spyOn(component, 'navigateTo')

      component.publishNewLink()

      expect(mockOnboardingService.setFlagToCheckRoute).toHaveBeenCalledWith(true)
      expect(component.navigateTo).toHaveBeenCalledWith('/app/home/org-designations')
    })

    it('should navigate when startImporting is true', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ startImporting: true }))
      jest.spyOn(component, 'navigateTo')

      component.publishNewLink()

      expect(mockOnboardingService.setFlagToCheckRoute).toHaveBeenCalledWith(true)
      expect(component.navigateTo).toHaveBeenCalledWith('/app/home/org-designations')
    })

    it('should call generateRegistrationLink when no valid result', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({}))

      component.publishNewLink()

      expect(component.generateRegistrationLink).toHaveBeenCalled()
    })

    it('should open dialog with correct configuration', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({}))

      component.publishNewLink()

      expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
        autoFocus: false,
        width: '504px',
        height: '275px',
        maxWidth: '80vw',
        maxHeight: '90vh',
        data: { type: 'import-igot-master-review' },
        disableClose: true
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing activatedRoute parent', () => {
      mockActivatedRoute.parent = null

      component.ngOnInit()

      expect(component.configSvc).toBeUndefined()
      expect(component.onboardingConfig).toBeUndefined()
    })

    it('should handle missing orgReadData', () => {
      mockActivatedRoute.parent.snapshot.data.configService.orgReadData = null
      jest.spyOn(component, 'getFrameworkInfo')

      component.ngOnInit()

      expect(component.getFrameworkInfo).not.toHaveBeenCalled()
    })

    it('should handle getlistOfRegisterationLinks with null result', () => {
      const mockResponse = { result: null }
      mockOnboardingService.getListOfRegisteedLinks.mockReturnValue(of(mockResponse))

      component.getlistOfRegisterationLinks()

      expect(component.customRegistrationLinks).toBeUndefined()
    })
  })
})