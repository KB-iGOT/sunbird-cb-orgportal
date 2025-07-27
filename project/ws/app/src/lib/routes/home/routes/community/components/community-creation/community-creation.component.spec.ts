import { CommunityCreationComponent } from './community-creation.component'
import { of, throwError } from 'rxjs'

// Mock implementations
const mockFormBuilder = {
  group: jest.fn().mockReturnValue({
    value: {},
    controls: {},
    patchValue: jest.fn(),
    markAllAsTouched: jest.fn(),
    updateValueAndValidity: jest.fn(),
    invalid: false,
    valid: true
  })
}

const mockChangeDetectorRef = {
  detectChanges: jest.fn()
}

const mockRouter = {
  navigate: jest.fn()
}

const mockDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of(true))
  })
}

const mockMatSnackBar = {
  open: jest.fn()
}

const mockCommunityService = {
  getTopicDetails: jest.fn().mockReturnValue(of({
    result: {
      search_results: {
        data: [
          { categoryId: '1', categoryName: 'Topic 1' },
          { categoryId: '2', categoryName: 'Topic 2' }
        ]
      }
    }
  })),
  createCommunity: jest.fn().mockReturnValue(of({ result: { communityId: 'test-id' } })),
  updateCommunity: jest.fn().mockReturnValue(of({ result: { success: true } })),
  publishCommunity: jest.fn().mockReturnValue(of({ result: { success: true } })),
  fileUpload: jest.fn().mockReturnValue(of({ result: { url: 'test-url' } }))
}

const mockLoaderService = {
  changeLoaderState: jest.fn()
}

const mockActivatedRoute = {
  params: of({ communityId: 'test-id' }),
  snapshot: {
    data: {
      configService: {
        unMappedUser: {
          id: 'user-1',
          rootOrg: { orgName: 'Test Org' },
          rootOrgId: 'org-1'
        }
      },
      communityDetails: {
        data: {
          id: 'test-id',
          communityName: 'Test Community',
          description: 'Test Description',
          topicId: '1',
          topicName: 'Topic 1',
          posterImageUrl: 'poster-url',
          imageUrl: 'image-url',
          communityGuideLines: 'Test Guidelines',
          moderators: ['mod1'],
          competencies_v6: [{ competencyAreaName: 'Area 1' }]
        }
      }
    },
    url: [{ path: 'pending-approval' }]
  }
}

const mockStepper = {
  steps: {
    toArray: jest.fn().mockReturnValue([
      { label: 'Basic Details' },
      { label: 'Add Competency' },
      { label: 'Add Moderator' },
      { label: 'Preview' }
    ])
  },
  _getIndicatorType: jest.fn()
}

const mockEnvironment = {
  karmYogiPath: 'https://test.com',
  dicussV2Bucket: 'bucket'
};

// Mock global environment
(global as any).environment = mockEnvironment

describe('CommunityCreationComponent', () => {
  let component: CommunityCreationComponent
  let mockForm: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create mock form
    mockForm = {
      value: {
        communityName: 'Test Community',
        topicName: { categoryId: '1', categoryName: 'Topic 1' },
        posterImageUrl: 'poster-url',
        description: 'Test description with more than fifty characters to pass validation',
        communityGuideLines: 'Test guidelines with more than one hundred characters to pass the minimum length validation requirement',
        moderators: ['mod1'],
        imageUrl: 'image-url',
        competencies_v6: [],
        searchTopic: ''
      },
      controls: {
        communityName: { invalid: false, setValue: jest.fn() },
        topicName: { invalid: false, setValue: jest.fn() },
        posterImageUrl: { invalid: false, setValue: jest.fn() },
        description: { invalid: false, setValue: jest.fn() },
        communityGuideLines: { invalid: false, setValue: jest.fn() },
        moderators: { invalid: false, setValue: jest.fn() },
        imageUrl: { invalid: false, setValue: jest.fn() },
        competencies_v6: { invalid: false, setValue: jest.fn() },
        searchTopic: { invalid: false, setValue: jest.fn() }
      },
      patchValue: jest.fn(),
      markAllAsTouched: jest.fn(),
      updateValueAndValidity: jest.fn(),
      invalid: false,
      valid: true
    }

    mockFormBuilder.group.mockReturnValue(mockForm)

    // Create component instance
    component = new CommunityCreationComponent(
      mockFormBuilder as any,
      mockChangeDetectorRef as any,
      mockRouter as any,
      mockDialog as any,
      mockMatSnackBar as any,
      mockCommunityService as any,
      mockLoaderService as any,
      mockActivatedRoute as any
    )

    // Set up component properties
    component.communityDetailsForm = mockForm
    component.stepper = mockStepper as any
    component.topicDataList = [
      { categoryId: '1', categoryName: 'Topic 1' },
      { categoryId: '2', categoryName: 'Topic 2' }
    ]
    component.competencies = [
      {
        competencyAreaName: 'Area 1',
        competencyThemeName: 'Theme 1',
        competencySubThemeName: 'SubTheme 1'
      }
    ]
    component.userProfile = {
      id: 'user-1',
      rootOrg: { orgName: 'Test Org' },
      rootOrgId: 'org-1'
    }
    component.communityDetailsObject = {
      id: 'test-id',
      communityName: 'Test Community'
    }
  })

  describe('Constructor and Initialization', () => {
    it('should create component and call initialization methods', () => {
      expect(component).toBeDefined()
      expect(mockCommunityService.getTopicDetails).toHaveBeenCalled()
    })
  })

  describe('openConforamtionPopup', () => {
    it('should open confirmation dialog when in edit mode', () => {
      component.openMode = 'edit'
      component.openConforamtionPopup()

      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should navigate back directly when not in edit mode', () => {
      component.openMode = 'create'
      component.openConforamtionPopup()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community'])
    })

    it('should navigate back when dialog returns true', () => {
      component.openMode = 'edit'
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })

      component.openConforamtionPopup()

      expect(mockDialog.open).toHaveBeenCalled()
    })
  })

  describe('getRouteSubscription', () => {
    it('should set openMode to edit when communityId exists', () => {
      const mockParams = { communityId: 'test-id' }
      mockActivatedRoute.params = of(mockParams)

      component.getRouteSubscription()

      expect(component.openMode).toBe('edit')
      expect(component.communityId).toBe('test-id')
    })

    it('should set openMode to create when communityId does not exist', () => {
      //const mockParams = {}
      //mockActivatedRoute.params = of(mockParams)

      component.getRouteSubscription()

      expect(component.openMode).toBe('create')
    })
  })

  describe('patchFormValues', () => {
    it('should patch form values with community data', () => {
      component.communityDetailsObject = {
        communityName: 'Test Community',
        topicId: '1',
        posterImageUrl: 'poster-url',
        description: 'Test Description',
        communityGuideLines: 'Test Guidelines',
        moderators: ['mod1'],
        imageUrl: 'image-url',
        competencies_v6: [{ competencyAreaName: 'Area 1' }]
      }

      component.patchFormValues()

      expect(mockForm.patchValue).toHaveBeenCalled()
    })

    it('should handle empty community data', () => {
      component.communityDetailsObject = {}

      component.patchFormValues()

      expect(mockForm.patchValue).toHaveBeenCalled()
    })
  })

  describe('navigateBack', () => {
    it('should navigate to community home', () => {
      component.navigateBack()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community'])
    })
  })

  describe('moveToNextForm', () => {
    it('should move to next step when form is valid', () => {
      component.currentStepperIndex = 0
      Object.defineProperty(component, 'canMoveToNext', {
        get: jest.fn().mockReturnValue(true)
      })

      component.moveToNextForm()

      expect(component.currentStepperIndex).toBe(1)
      expect(mockForm.markAllAsTouched).toHaveBeenCalled()
    })

    it('should not move to next step when form is invalid', () => {
      component.currentStepperIndex = 0
      Object.defineProperty(component, 'canMoveToNext', {
        get: jest.fn().mockReturnValue(false)
      })

      component.moveToNextForm()

      expect(component.currentStepperIndex).toBe(0)
    })
  })

  describe('onSelectionChange', () => {
    it('should update current stepper index and label', () => {
      const event = { selectedIndex: 1 }

      component.onSelectionChange(event as any)

      expect(component.currentStepperIndex).toBe(1)
      expect(component.selectedStepperLable).toBe('Add Competency')
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should set stepper indicator type to number', () => {
      component.ngAfterViewInit()

      expect(component.stepper!._getIndicatorType).toBeDefined()
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
    })

    it('should handle missing stepper', () => {
      component.stepper = undefined

      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  describe('initializeFormAndParams', () => {
    it('should initialize form with validators', () => {
      component.initializeFormAndParams()

      expect(mockFormBuilder.group).toHaveBeenCalled()
    })

    it('should set isEdit to true when in edit mode with communityId', () => {
      component.openMode = 'edit'
      component.communityDetailsObject = { id: 'test-id' }

      component.initializeFormAndParams()

      expect(component.isEdit).toBe(true)
    })
  })

  describe('getTopicData', () => {
    it('should fetch and set topic data', () => {
      component.getTopicData()

      expect(mockCommunityService.getTopicDetails).toHaveBeenCalled()
      expect(component.topicDataList).toHaveLength(2)
    })

    it('should handle empty response', () => {
      mockCommunityService.getTopicDetails.mockReturnValue(of({}))

      component.getTopicData()

      expect(mockCommunityService.getTopicDetails).toHaveBeenCalled()
    })
  })

  describe('canPublish getter', () => {
    it('should return true when all conditions are met', () => {
      component.selectedStepperLable = 'Preview'
      mockForm.invalid = false
      component.competencies = [{ competencyAreaName: 'Area 1' }]

      const result = component.canPublish

      expect(result).toBe(true)
    })

    it('should return false when form is invalid', () => {
      mockForm.invalid = true

      const result = component.canPublish

      expect(result).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Please fill all mandatory fields',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should return false when no competencies are added', () => {
      component.selectedStepperLable = 'Add Competency'
      mockForm.invalid = false
      component.competencies = []

      const result = component.canPublish

      expect(result).toBe(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Please add atleast one competency in Add Competency',
        '',
        { duration: 3000, panelClass: [] }
      )
    })
  })

  describe('canMoveToNext getter', () => {
    it('should return true for valid Basic Details step', () => {
      component.selectedStepperLable = 'Basic Details'
      mockForm.controls = {
        communityName: { invalid: false },
        topicName: { invalid: false },
        posterImageUrl: { invalid: false },
        description: { invalid: false },
        communityGuideLines: { invalid: false },
        imageUrl: { invalid: false },
        searchTopic: { invalid: false },
        moderators: { invalid: false },
        competencies_v6: { invalid: false }
      }

      const result = component.canMoveToNext

      expect(result).toBe(true)
    })

    it('should return false for invalid Basic Details step', () => {
      component.selectedStepperLable = 'Basic Details'
      mockForm.controls = {
        communityName: { invalid: true },
        topicName: { invalid: false },
        posterImageUrl: { invalid: false },
        description: { invalid: false },
        communityGuideLines: { invalid: false },
        imageUrl: { invalid: false },
        searchTopic: { invalid: false },
        moderators: { invalid: false },
        competencies_v6: { invalid: false }
      }

      const result = component.canMoveToNext

      expect(result).toBe(false)
    })

    it('should return true for Add Competency step with competencies', () => {
      component.selectedStepperLable = 'Add Competency'
      component.competencies = [{ competencyAreaName: 'Area 1' }]

      const result = component.canMoveToNext

      expect(result).toBe(true)
    })

    it('should return false for Add Competency step without competencies', () => {
      component.selectedStepperLable = 'Add Competency'
      component.competencies = []

      const result = component.canMoveToNext

      expect(result).toBe(false)
    })

    it('should return true for Add Moderator step with moderators', () => {
      component.selectedStepperLable = 'Add Moderator'
      mockForm.value = {
        moderators: ['mod1']
      }

      const result = component.canMoveToNext

      expect(result).toBe(true)
    })

    it('should return false for Add Moderator step without moderators', () => {
      component.selectedStepperLable = 'Add Moderator'
      mockForm.value = {
        moderators: []
      }

      const result = component.canMoveToNext

      expect(result).toBe(false)
    })
  })

  describe('addCompetencies', () => {
    it('should add competencies and update form', () => {
      const competencies = [{ competencyAreaName: 'Area 1' }]

      component.addCompetencies(competencies)

      expect(component.competencies).toEqual(competencies)
      expect(mockForm.controls.competencies_v6.setValue).toHaveBeenCalledWith(competencies)
    })
  })

  describe('saveAndExit', () => {
    it('should call updateCommunity when in edit mode', () => {
      component.openMode = 'edit'
      jest.spyOn(component, 'updateCommunity').mockImplementation()

      component.saveAndExit()

      expect(component.updateCommunity).toHaveBeenCalledWith('Draft', false)
    })

    it('should show error for invalid community name', () => {
      component.openMode = 'create'
      mockForm.value.communityName = ''
      mockForm.controls.communityName.invalid = true

      component.saveAndExit()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Please provide a valid community name',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should show error for invalid topic', () => {
      component.openMode = 'create'
      mockForm.value.topicName = null
      mockForm.controls.topicName.invalid = true

      component.saveAndExit()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Please select a valid topic',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should create community successfully', () => {
      component.openMode = 'create'
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      jest.spyOn(component, 'uploadCommunityImage').mockImplementation()

      component.saveAndExit()

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockCommunityService.createCommunity).toHaveBeenCalled()
    })

    it('should handle 412 error with confirmation dialog', () => {
      component.openMode = 'create'
      const error = { status: 412, error: { params: { errMsg: 'Conflict error' } } }
      mockCommunityService.createCommunity.mockReturnValue(throwError(error))
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      jest.spyOn(component, 'getConfirmationForCreation').mockImplementation()

      component.saveAndExit()

      expect(component.getConfirmationForCreation).toHaveBeenCalled()
    })

    it('should handle conflict error', () => {
      component.openMode = 'create'
      const error = {
        status: 400,
        error: {
          responseCode: 'CONFLICT',
          params: { errMsg: 'Community already exists' }
        }
      }
      mockCommunityService.createCommunity.mockReturnValue(throwError(error))
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      component.saveAndExit()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Community already exists',
        '',
        { duration: 3000, panelClass: ['red-snackbar'] }
      )
    })

    it('should handle generic error', () => {
      component.openMode = 'create'
      const error = { status: 500, error: { message: 'Server error' } }
      mockCommunityService.createCommunity.mockReturnValue(throwError(error))
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      component.saveAndExit()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Server error',
        '',
        { duration: 3000, panelClass: ['red-snackbar'] }
      )
    })
  })

  describe('getFormBodyOfEvent', () => {
    it('should return properly formatted community data', () => {
      component.userProfile = {
        id: 'user-1',
        rootOrg: { orgName: 'Test Org' },
        rootOrgId: 'org-1'
      }

      const result = component.getFormBodyOfEvent('Draft')

      expect(result).toHaveProperty('communityName')
      expect(result).toHaveProperty('orgId', 'org-1')
      expect(result).toHaveProperty('createdUserId', 'user-1')
    })

    it('should handle competencies properly', () => {
      component.competencies = [
        {
          competencyAreaName: 'Area 1',
          competencyThemeName: 'Theme 1',
          competencySubThemeName: 'SubTheme 1'
        }
      ]

      const result = component.getFormBodyOfEvent('Draft')

      expect(result.competencyArea).toContain('Area 1')
      expect(result.competencyTheme).toContain('Theme 1')
      expect(result.competencySubTheme).toContain('SubTheme 1')
    })

    it('should handle Published status', () => {
      component.communityId = 'test-id'
      component.posterImageUrl = 'poster-url'
      component.imageUrl = 'image-url'

      const result = component.getFormBodyOfEvent('Published')

      expect(result.communityId).toBe('test-id')
      expect(result.posterImageUrl).toBe('poster-url')
      expect(result.imageUrl).toBe('image-url')
    })

    it('should set isCommunityCreationAllowed when forceCreation is true', () => {
      const result = component.getFormBodyOfEvent('Draft', true)

      expect(result.isCommunityCreationAllowed).toBe(true)
    })

    it('should set isCommunityCreationAllowed when userConfirmCommunityCreation is true', () => {
      component.userConfirmCommunityCreation = true

      const result = component.getFormBodyOfEvent('Draft')

      expect(result.isCommunityCreationAllowed).toBe(true)
    })
  })

  describe('getChangedFields', () => {
    it('should return changed fields between current and original values', () => {
      component.originalFormValues = {
        communityName: 'Old Name',
        description: 'Old Description'
      }
      mockForm.value = {
        communityName: 'New Name',
        description: 'Old Description'
      }
      component.communityId = 'test-id'

      const result = component.getChangedFields()

      expect(result.communityName).toBe('New Name')
      expect(result.communityId).toBe('test-id')
      expect(result).not.toHaveProperty('description')
    })

    it('should handle array changes', () => {
      component.originalFormValues = {
        moderators: ['mod1']
      }
      mockForm.value = {
        moderators: ['mod1', 'mod2']
      }

      const result = component.getChangedFields()

      expect(result.moderators).toEqual(['mod1', 'mod2'])
    })

    it('should handle object changes', () => {
      component.originalFormValues = {
        topicName: { id: '1', name: 'Topic 1' }
      }
      mockForm.value = {
        topicName: { id: '2', name: 'Topic 2' }
      }

      const result = component.getChangedFields()

      expect(result.topicName).toEqual({ id: '2', name: 'Topic 2' })
    })

    it('should handle competency changes', () => {
      component.originalFormValues = {
        competencies_v6: []
      }
      component.competencies = [{ competencyAreaName: 'Area 1' }]

      const result = component.getChangedFields()

      expect(result.competencies_v6).toEqual([{ competencyAreaName: 'Area 1' }])
    })

    it('should set isCommunityCreationAllowed when forceCreation is true', () => {
      const result = component.getChangedFields(true)

      expect(result.isCommunityCreationAllowed).toBe(true)
    })
  })

  describe('uploadCommunityImage', () => {
    it('should upload poster image when it is a File', () => {
      const file = new File([''], 'test.jpg')
      mockForm.value.posterImageUrl = file
      mockForm.value.imageUrl = 'existing-url'
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'updateCommunityWithImage').mockImplementation()

      component.uploadCommunityImage('test-id')

      expect(mockCommunityService.fileUpload).toHaveBeenCalled()
    })

    it('should upload both images when both are Files', () => {
      const file1 = new File([''], 'poster.jpg')
      const file2 = new File([''], 'image.jpg')
      mockForm.value.posterImageUrl = file1
      mockForm.value.imageUrl = file2
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'uploadImageUrl').mockImplementation()

      component.uploadCommunityImage('test-id')

      expect(mockCommunityService.fileUpload).toHaveBeenCalled()
    })

    it('should handle upload success', () => {
      const file = new File([''], 'test.jpg')
      mockForm.value.posterImageUrl = file
      mockForm.value.imageUrl = 'existing-url'
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'updateCommunityWithImage').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.uploadCommunityImage('test-id')

      expect(component.updateCommunityWithImage).toHaveBeenCalledWith({
        communityId: 'test-id',
        posterImageUrl: 'https://test.com/split-url'
      })
    })

    it('should handle upload failure', () => {
      const file = new File([''], 'test.jpg')
      mockForm.value.posterImageUrl = file
      mockForm.value.imageUrl = 'existing-url'
      jest.spyOn(component, 'navigateBack').mockImplementation()

      const error = { error: { message: 'Upload failed' } }
      mockCommunityService.fileUpload.mockReturnValue(throwError(error))

      component.uploadCommunityImage('test-id')

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Upload failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should update community when no files to upload', () => {
      mockForm.value.posterImageUrl = 'existing-poster-url'
      mockForm.value.imageUrl = 'existing-image-url'
      jest.spyOn(component, 'updateCommunityWithImage').mockImplementation()

      component.uploadCommunityImage('test-id')

      expect(component.updateCommunityWithImage).toHaveBeenCalledWith({
        communityId: 'test-id',
        posterImageUrl: 'existing-poster-url'
      })
    })
  })

  describe('splitUrl', () => {
    it('should split URL with igot/discussionhub', () => {
      const url = 'https://test.com/igot/discussionhub/path/to/file'

      const result = component.splitUrl(url)

      expect(result).toBe('/path/to/file')
    })

    it('should split URL with igotqa/discussionhub', () => {
      const url = 'https://test.com/igotqa/discussionhub/path/to/file'

      const result = component.splitUrl(url)

      expect(result).toBe('/path/to/file')
    })

    it('should split URL with igotprod/discussionhub', () => {
      const url = 'https://test.com/igotprod/discussionhub/path/to/file'

      const result = component.splitUrl(url)

      expect(result).toBe('/path/to/file')
    })

    it('should split URL with igotuat/discussionhub', () => {
      const url = 'https://test.com/igotuat/discussionhub/path/to/file'

      const result = component.splitUrl(url)

      expect(result).toBe('/path/to/file')
    })

    it('should return original URL when no matching pattern', () => {
      const url = 'https://test.com/other/path'

      const result = component.splitUrl(url)

      expect(result).toBe(url)
    })
  })

  describe('uploadImageUrl', () => {
    it('should upload image and call updateCommunityWithImage', () => {
      const file = new File([''], 'image.jpg')
      mockForm.value.imageUrl = file
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'updateCommunityWithImage').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.uploadImageUrl('test-id', 'poster-url')

      expect(component.updateCommunityWithImage).toHaveBeenCalledWith({
        communityId: 'test-id',
        imageUrl: 'https://test.com/split-url',
        posterImageUrl: 'poster-url'
      })
    })

    it('should handle upload error', () => {
      const file = new File([''], 'image.jpg')
      mockForm.value.imageUrl = file
      jest.spyOn(component, 'navigateBack').mockImplementation()

      const error = { error: { message: 'Upload failed' } }
      mockCommunityService.fileUpload.mockReturnValue(throwError(error))

      component.uploadImageUrl('test-id')

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Upload failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should handle upload without poster URL', () => {
      const file = new File([''], 'image.jpg')
      mockForm.value.imageUrl = file
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'updateCommunityWithImage').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.uploadImageUrl('test-id')

      expect(component.updateCommunityWithImage).toHaveBeenCalledWith({
        communityId: 'test-id',
        imageUrl: 'https://test.com/split-url'
      })
    })
  })

  describe('updateCommunityWithImage', () => {
    it('should update community successfully', () => {
      jest.spyOn(component, 'navigateBack').mockImplementation()

      const updateData = { communityId: 'test-id', imageUrl: 'image-url' }
      component.updateCommunityWithImage(updateData)

      expect(mockCommunityService.updateCommunity).toHaveBeenCalledWith(updateData)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Community created/updated successfully',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should handle update error', () => {
      jest.spyOn(component, 'navigateBack').mockImplementation()

      const error = { error: { message: 'Update failed' } }
      mockCommunityService.updateCommunity.mockReturnValue(throwError(error))

      const updateData = { communityId: 'test-id', imageUrl: 'image-url' }
      component.updateCommunityWithImage(updateData)

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Update failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })
  })

  describe('updateCommunity', () => {
    it('should update community with changed fields', () => {
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        communityName: 'Updated Name',
        communityId: 'test-id'
      })

      component.updateCommunity()

      expect(mockCommunityService.updateCommunity).toHaveBeenCalled()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
    })

    it('should handle file uploads before update', () => {
      const file = new File([''], 'poster.jpg')
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        posterImageUrl: file,
        communityId: 'test-id'
      })
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'finalizeUpdate').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.updateCommunity()

      expect(mockCommunityService.fileUpload).toHaveBeenCalled()
    })

    it('should handle both poster and image file uploads', () => {
      const posterFile = new File([''], 'poster.jpg')
      const imageFile = new File([''], 'image.jpg')
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        posterImageUrl: posterFile,
        imageUrl: imageFile,
        communityId: 'test-id'
      })
      jest.spyOn(component, 'uploadSecondImageAndUpdate').mockImplementation()
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.updateCommunity()

      expect(component.uploadSecondImageAndUpdate).toHaveBeenCalled()
    })

    it('should handle only image file upload', () => {
      const imageFile = new File([''], 'image.jpg')
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        imageUrl: imageFile,
        communityId: 'test-id'
      })
      jest.spyOn(component, 'uploadSecondImageAndUpdate').mockImplementation()

      component.updateCommunity()

      expect(component.uploadSecondImageAndUpdate).toHaveBeenCalled()
    })

    it('should handle 412 error', () => {
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        communityName: 'Updated Name'
      })
      jest.spyOn(component, 'getConfirmationForCreation').mockImplementation()

      const error = { status: 412, error: { params: { errMsg: 'Conflict' } } }
      mockCommunityService.updateCommunity.mockReturnValue(throwError(error))

      component.updateCommunity()

      expect(component.getConfirmationForCreation).toHaveBeenCalled()
    })

    it('should handle generic update error', () => {
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        communityName: 'Updated Name'
      })

      const error = { error: { message: 'Update failed' } }
      mockCommunityService.updateCommunity.mockReturnValue(throwError(error))

      component.updateCommunity()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Update failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should call publishCommunityMethod when status is Published', () => {
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        communityName: 'Updated Name'
      })
      jest.spyOn(component, 'publishCommunityMethod').mockImplementation()

      component.updateCommunity('Published')

      expect(component.publishCommunityMethod).toHaveBeenCalled()
    })
  })

  describe('uploadSecondImageAndUpdate', () => {
    it('should upload second image and finalize update', () => {
      const file = new File([''], 'image.jpg')
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'finalizeUpdate').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.uploadSecondImageAndUpdate(file, {}, 'Draft')

      expect(component.finalizeUpdate).toHaveBeenCalled()
    })

    it('should handle upload error', () => {
      const file = new File([''], 'image.jpg')

      const error = { error: { message: 'Upload failed' } }
      mockCommunityService.fileUpload.mockReturnValue(throwError(error))

      component.uploadSecondImageAndUpdate(file, {}, 'Draft')

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Upload failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })
  })

  describe('finalizeUpdate', () => {
    it('should finalize update successfully', () => {
      jest.spyOn(component, 'navigateBack').mockImplementation()

      component.finalizeUpdate({}, 'Draft')

      expect(mockCommunityService.updateCommunity).toHaveBeenCalled()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Community updated successfully',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should call publishCommunityMethod when status is Published', () => {
      jest.spyOn(component, 'publishCommunityMethod').mockImplementation()

      component.finalizeUpdate({}, 'Published')

      expect(component.publishCommunityMethod).toHaveBeenCalled()
    })

    it('should handle 412 error', () => {
      jest.spyOn(component, 'getConfirmationForCreation').mockImplementation()

      const error = { status: 412, error: { params: { errMsg: 'Conflict' } } }
      mockCommunityService.updateCommunity.mockReturnValue(throwError(error))

      const updatedFields = { communityId: 'test-id' }
      component.finalizeUpdate(updatedFields, 'Draft')

      expect(component.getConfirmationForCreation).toHaveBeenCalledWith(
        error.error,
        'Draft',
        'finalizeUpdate',
        updatedFields
      )
    })

    it('should handle generic error', () => {
      const error = { error: { message: 'Update failed' } }
      mockCommunityService.updateCommunity.mockReturnValue(throwError(error))

      component.finalizeUpdate({}, 'Draft')

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Update failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })
  })

  describe('publishCommunity', () => {
    it('should return early if canPublish is false', () => {
      Object.defineProperty(component, 'canPublish', {
        get: jest.fn().mockReturnValue(false)
      })

      component.publishCommunity()

      expect(mockCommunityService.publishCommunity).not.toHaveBeenCalled()
    })

    it('should create and publish when no communityId', () => {
      Object.defineProperty(component, 'canPublish', {
        get: jest.fn().mockReturnValue(true)
      })
      component.communityId = null
      jest.spyOn(component, 'createCommunityAndPublish').mockImplementation()

      component.publishCommunity()

      expect(component.createCommunityAndPublish).toHaveBeenCalled()
    })

    it('should update community when on Add Competency step with changes', () => {
      Object.defineProperty(component, 'canPublish', {
        get: jest.fn().mockReturnValue(true)
      })
      component.communityId = 'test-id'
      component.selectedStepperLable = 'Add Competency'
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        communityName: 'Updated',
        description: 'Updated',
        communityId: 'test-id'
      })
      jest.spyOn(component, 'updateCommunity').mockImplementation()

      component.publishCommunity()

      expect(component.updateCommunity).toHaveBeenCalledWith('Published')
    })

    it('should directly publish when on Add Competency step without changes', () => {
      Object.defineProperty(component, 'canPublish', {
        get: jest.fn().mockReturnValue(true)
      })
      component.communityId = 'test-id'
      component.selectedStepperLable = 'Add Competency'
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        communityId: 'test-id'
      })
      jest.spyOn(component, 'publishCommunityMethod').mockImplementation()

      component.publishCommunity()

      expect(component.publishCommunityMethod).toHaveBeenCalled()
    })
  })

  describe('publishCommunityMethod', () => {
    it('should publish community successfully', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      jest.spyOn(component, 'navigateBack').mockImplementation()

      component.publishCommunityMethod()

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockCommunityService.publishCommunity).toHaveBeenCalled()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Community published successfully',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should handle publish failure', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      mockCommunityService.publishCommunity.mockReturnValue(of({}))

      component.publishCommunityMethod()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Failed to publish community',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should handle 412 error', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      jest.spyOn(component, 'getConfirmationForCreation').mockImplementation()

      const error = { status: 412, error: { params: { errMsg: 'Conflict' } } }
      mockCommunityService.publishCommunity.mockReturnValue(throwError(error))

      component.publishCommunityMethod()

      expect(component.getConfirmationForCreation).toHaveBeenCalled()
    })

    it('should handle generic error', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      const error = { error: { message: 'Publish failed' } }
      mockCommunityService.publishCommunity.mockReturnValue(throwError(error))

      component.publishCommunityMethod()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Publish failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should set isCommunityCreationAllowed when forceCreation is true', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      component.publishCommunityMethod('Published', true)

      expect(mockCommunityService.publishCommunity).toHaveBeenCalled()
    })

    it('should set isCommunityCreationAllowed when userConfirmCommunityCreation is true', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      component.userConfirmCommunityCreation = true

      component.publishCommunityMethod()

      expect(mockCommunityService.publishCommunity).toHaveBeenCalled()
    })
  })

  describe('getEnvironmentBaseUrl', () => {
    it('should return base URL from environment', () => {
      component.environmentData = {
        karmYogiPath: 'https://test.com',
        dicussV2Bucket: 'bucket'
      }

      const result = component.getEnvironmentBaseUrl()

      expect(result).toBe('https://test.com/bucket')
    })

    it('should return base URL from nested environment', () => {
      component.environmentData = {
        environment: {
          karmYogiPath: 'https://test.com',
          dicussV2Bucket: 'bucket'
        }
      }

      const result = component.getEnvironmentBaseUrl()

      expect(result).toBe('https://test.com/bucket')
    })

    it('should return empty string when no environment data', () => {
      component.environmentData = {}

      const result = component.getEnvironmentBaseUrl()

      expect(result).toBe('')
    })
  })

  describe('createCommunityAndPublish', () => {
    it('should create community and upload images for publish', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      jest.spyOn(component, 'uploadCommunityImagesAndPublish').mockImplementation()

      mockCommunityService.createCommunity.mockReturnValue(of({
        result: { communityId: 'new-id' }
      }))

      component.createCommunityAndPublish()

      expect(component.communityId).toBe('new-id')
      expect(component.uploadCommunityImagesAndPublish).toHaveBeenCalledWith('new-id')
    })

    it('should handle creation failure', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      mockCommunityService.createCommunity.mockReturnValue(of({}))

      component.createCommunityAndPublish()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Failed to create community',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should handle 412 error', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      jest.spyOn(component, 'getConfirmationForCreation').mockImplementation()

      const error = { status: 412, error: { params: { errMsg: 'Conflict' } } }
      mockCommunityService.createCommunity.mockReturnValue(throwError(error))

      component.createCommunityAndPublish()

      expect(component.getConfirmationForCreation).toHaveBeenCalled()
    })

    it('should handle conflict error', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      const error = {
        error: {
          responseCode: 'CONFLICT',
          params: { errMsg: 'Community exists' }
        }
      }
      mockCommunityService.createCommunity.mockReturnValue(throwError(error))

      component.createCommunityAndPublish()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Community exists',
        '',
        { duration: 3000, panelClass: ['red-snackbar'] }
      )
    })

    it('should handle generic creation error', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})

      const error = { error: { message: 'Creation failed' } }
      mockCommunityService.createCommunity.mockReturnValue(throwError(error))

      component.createCommunityAndPublish()

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Creation failed',
        '',
        { duration: 3000, panelClass: ['red-snackbar'] }
      )
    })

    it('should set userConfirmCommunityCreation when forceCreation is true', () => {
      jest.spyOn(component, 'getFormBodyOfEvent').mockReturnValue({})
      jest.spyOn(component, 'uploadCommunityImagesAndPublish').mockImplementation()

      mockCommunityService.createCommunity.mockReturnValue(of({
        result: { communityId: 'new-id' }
      }))

      component.createCommunityAndPublish(true)

      expect(component.userConfirmCommunityCreation).toBe(true)
    })
  })

  describe('updateAndPublish', () => {
    it('should update community and then publish', () => {
      jest.spyOn(component, 'publishCommunityMethod').mockImplementation()

      component.updateAndPublish({})

      expect(mockCommunityService.updateCommunity).toHaveBeenCalled()
      expect(component.publishCommunityMethod).toHaveBeenCalled()
    })

    it('should set isCommunityCreationAllowed when userConfirmCommunityCreation is true', () => {
      component.userConfirmCommunityCreation = true
      jest.spyOn(component, 'publishCommunityMethod').mockImplementation()

      const updatedFields = { communityId: 'test-id' }
      component.updateAndPublish(updatedFields)

      expect(mockCommunityService.updateCommunity).toHaveBeenCalledWith({
        communityId: 'test-id',
        isCommunityCreationAllowed: true
      })
    })

    it('should handle update failure', () => {
      const error = { error: { message: 'Update failed' } }
      mockCommunityService.updateCommunity.mockReturnValue(throwError(error))

      component.updateAndPublish({})

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Update failed',
        '',
        { duration: 3000, panelClass: [] }
      )
    })
  })

  describe('uploadCommunityImagesAndPublish', () => {
    it('should upload both images and publish', () => {
      const posterFile = new File([''], 'poster.jpg')
      const imageFile = new File([''], 'image.jpg')
      mockForm.value.posterImageUrl = posterFile
      mockForm.value.imageUrl = imageFile
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'updateAndPublish').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.uploadCommunityImagesAndPublish('test-id')

      expect(mockCommunityService.fileUpload).toHaveBeenCalledTimes(2)
    })

    it('should upload only poster image', () => {
      const posterFile = new File([''], 'poster.jpg')
      mockForm.value.posterImageUrl = posterFile
      mockForm.value.imageUrl = 'existing-url'
      jest.spyOn(component, 'getEnvironmentBaseUrl').mockReturnValue('https://test.com')
      jest.spyOn(component, 'splitUrl').mockReturnValue('/split-url')
      jest.spyOn(component, 'updateAndPublish').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({
        result: { url: 'https://test.com/uploaded-url' }
      }))

      component.uploadCommunityImagesAndPublish('test-id')

      expect(mockCommunityService.fileUpload).toHaveBeenCalledTimes(1)
    })

    it('should publish directly when no files to upload', () => {
      mockForm.value.posterImageUrl = 'existing-poster'
      mockForm.value.imageUrl = 'existing-image'
      jest.spyOn(component, 'publishCommunityMethod').mockImplementation()

      component.uploadCommunityImagesAndPublish('test-id')

      expect(component.publishCommunityMethod).toHaveBeenCalled()
    })

    it('should handle upload error', () => {
      const posterFile = new File([''], 'poster.jpg')
      mockForm.value.posterImageUrl = posterFile
      mockForm.value.imageUrl = 'existing-url'
      jest.spyOn(component, 'handleUploadError').mockImplementation()

      mockCommunityService.fileUpload.mockReturnValue(of({}))

      component.uploadCommunityImagesAndPublish('test-id')

      expect(component.handleUploadError).toHaveBeenCalledWith('Failed to upload poster image')
    })
  })

  describe('handleUploadError', () => {
    it('should handle string error', () => {
      component.handleUploadError('Custom error message')

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Custom error message',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should handle error object', () => {
      const error = { error: { message: 'Network error' } }
      component.handleUploadError(error)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Network error',
        '',
        { duration: 3000, panelClass: [] }
      )
    })

    it('should handle error without message', () => {
      const error = { status: 500 }
      component.handleUploadError(error)

      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Failed to upload image',
        '',
        { duration: 3000, panelClass: [] }
      )
    })
  })

  describe('getConfirmationForCreation', () => {
    it('should open confirmation dialog with custom message', () => {
      const errData = { params: { errMsg: 'Custom error message' } }

      component.getConfirmationForCreation(errData, 'Draft', 'saveAndExit')

      expect(mockDialog.open).toHaveBeenCalled()
      const dialogData = mockDialog.open.mock.calls[0][1].data
      expect(dialogData.message).toBe('Custom error message')
    })

    it('should use default message when no custom message', () => {
      const errData = {}

      component.getConfirmationForCreation(errData, 'Draft', 'saveAndExit')

      const dialogData = mockDialog.open.mock.calls[0][1].data
      expect(dialogData.message).toBe('Community with the given communityName already present in another organisation')
    })

    it('should call saveAndExit when confirmed', () => {
      jest.spyOn(component, 'saveAndExit').mockImplementation()
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })

      component.getConfirmationForCreation({}, 'Draft', 'saveAndExit')

      expect(component.saveAndExit).toHaveBeenCalledWith('Draft', true)
    })

    it('should call updateCommunity when confirmed', () => {
      jest.spyOn(component, 'updateCommunity').mockImplementation()
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })

      component.getConfirmationForCreation({}, 'Draft', 'updateCommunity')

      expect(component.updateCommunity).toHaveBeenCalledWith('Draft', true)
    })

    it('should call finalizeUpdate when confirmed', () => {
      jest.spyOn(component, 'finalizeUpdate').mockImplementation()
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })

      const request = { communityId: 'test-id' }
      component.getConfirmationForCreation({}, 'Draft', 'finalizeUpdate', request)

      expect(component.finalizeUpdate).toHaveBeenCalledWith(
        { communityId: 'test-id', isCommunityCreationAllowed: true },
        'Draft'
      )
    })

    it('should call publishCommunityMethod when confirmed', () => {
      jest.spyOn(component, 'publishCommunityMethod').mockImplementation()
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })

      component.getConfirmationForCreation({}, 'Published', 'publishCommunityMethod')

      expect(component.publishCommunityMethod).toHaveBeenCalledWith('Published', true)
    })

  })
})