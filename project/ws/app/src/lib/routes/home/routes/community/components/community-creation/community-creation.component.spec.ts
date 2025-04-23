import { CommunityCreationComponent } from './community-creation.component'
import { of, throwError } from 'rxjs'
import { FormBuilder } from '@angular/forms'
import { HttpErrorResponse } from '@angular/common/http'

describe('CommunityCreationComponent', () => {
  let component: CommunityCreationComponent
  let mockFormBuilder: FormBuilder
  let mockCdr: any
  let mockRouter: any
  let mockDialog: any
  let mockMatSnackBar: any
  let mockCommunitySvc: any
  let mockLoaderService: any
  let mockActivatedRoute: any

  // Mock community data
  const mockCommunityDetails = {
    id: 'community-123',
    communityName: 'Test Community',
    description: 'This is a test community',
    topicId: 'topic-123',
    topicName: 'Tech',
    communityGuideLines: 'These are the guidelines for the community',
    moderators: [{ userId: 'user1', name: 'User One' }],
    competencies_v6: [
      {
        competencyAreaName: 'Area 1',
        competencyThemeName: 'Theme 1',
        competencySubThemeName: 'SubTheme 1'
      }
    ],
    posterImageUrl: 'http://example.com/poster.jpg',
    imageUrl: 'http://example.com/image.jpg'
  }

  // Mock topics data
  const mockTopicData = {
    result: {
      search_results: {
        data: [
          { categoryId: 'topic-123', categoryName: 'Tech' },
          { categoryId: 'topic-456', categoryName: 'Leadership' }
        ]
      }
    }
  }

  beforeEach(() => {
    // Create FormBuilder
    mockFormBuilder = new FormBuilder()

    // Create mocks for all dependencies
    mockCdr = {
      detectChanges: jest.fn()
    }

    mockRouter = {
      navigate: jest.fn()
    }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    }

    mockMatSnackBar = {
      open: jest.fn()
    }

    mockCommunitySvc = {
      getTopicDetails: jest.fn().mockReturnValue(of(mockTopicData)),
      createCommunity: jest.fn().mockReturnValue(of({ result: { communityId: 'community-123' } })),
      updateCommunity: jest.fn().mockReturnValue(of({ result: true })),
      publishCommunity: jest.fn().mockReturnValue(of({ result: true })),
      fileUpload: jest.fn().mockReturnValue(of({
        result: {
          url: 'igot/discussionhub/upload/file.jpg'
        }
      }))
    }

    mockLoaderService = {
      changeLoaderState: jest.fn()
    }

    mockActivatedRoute = {
      params: of({}),
      snapshot: {
        data: {
          configService: {
            unMappedUser: {
              id: 'user-123',
              rootOrg: { orgName: 'TestOrg' },
              rootOrgId: 'org-123'
            }
          },
          communityDetails: {
            data: null
          }
        },
        url: [{ path: 'create-community' }]
      }
    }

    // Initialize component
    component = new CommunityCreationComponent(
      mockFormBuilder,
      mockCdr,
      mockRouter,
      mockDialog,
      mockMatSnackBar,
      mockCommunitySvc,
      mockLoaderService,
      mockActivatedRoute
    )

    // Spy on component methods
    jest.spyOn(component, 'getTopicData')
    jest.spyOn(component, 'initializeFormAndParams')
    jest.spyOn(component, 'getRouteSubscription');

    // Mock environment data for URL construction
    (component as any).environmentData = {
      karmYogiPath: 'https://karmayogi.gov.in',
      dicussV2Bucket: 'discussionhub'
    }
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('Constructor and initialization', () => {


    it('should initialize form with validators', () => {
      // Verify form controls
      expect(component.communityDetailsForm.get('communityName')).toBeDefined()
      expect(component.communityDetailsForm.get('topicName')).toBeDefined()
      expect(component.communityDetailsForm.get('posterImageUrl')).toBeDefined()
      expect(component.communityDetailsForm.get('description')).toBeDefined()
      expect(component.communityDetailsForm.get('communityGuideLines')).toBeDefined()
      expect(component.communityDetailsForm.get('moderators')).toBeDefined()
      expect(component.communityDetailsForm.get('imageUrl')).toBeDefined()
      expect(component.communityDetailsForm.get('competencies_v6')).toBeDefined()
    })

    it('should fetch topic data on initialization', () => {
      expect(mockCommunitySvc.getTopicDetails).toHaveBeenCalled()
      expect(component.topicDataList.length).toBe(2)
    })

    it('should determine mode based on route parameters', () => {
      // Default test is 'create' mode
      expect(component.openMode).toBe('create')

      // Test 'edit' mode
      mockActivatedRoute.params = of({ communityId: 'community-123' })
      component.getRouteSubscription()
      expect(component.openMode).toBe('edit')
      expect(component.communityId).toBe('community-123')
    })
  })

  describe('Form validation and canMoveToNext', () => {
    beforeEach(() => {
      // Setup a valid form
      component.communityDetailsForm.patchValue({
        communityName: 'Valid Community Name',
        topicName: { categoryId: 'topic-123', categoryName: 'Tech' },
        posterImageUrl: 'image-url.jpg',
        description: 'This is a description that is more than 50 characters long to meet the requirements',
        communityGuideLines: 'These are community guidelines with more than 100 characters. They provide rules and expectations for community members to follow when participating in discussions and activities.',
        moderators: [{ userId: 'user1', name: 'User One' }],
        imageUrl: 'image-url.jpg',
        competencies_v6: [{ competencyAreaName: 'Area 1' }]
      })

      component.competencies = [{ competencyAreaName: 'Area 1' }]
      component.selectedStepperLable = 'Basic Details'
    })

    it('should validate Basic Details step', () => {
      expect(component.canMoveToNext).toBeTruthy()

      // Make form invalid
      component.communityDetailsForm.patchValue({
        communityName: 'Short', // Too short
      })

      expect(component.canMoveToNext).toBeFalsy()
    })

    it('should validate Add Competency step', () => {
      component.selectedStepperLable = 'Add Competency'
      expect(component.canMoveToNext).toBeTruthy()

      // No competencies
      component.competencies = []
      expect(component.canMoveToNext).toBeFalsy()
    })

    it('should validate Add Moderator step', () => {
      component.selectedStepperLable = 'Add Moderator'
      expect(component.canMoveToNext).toBeTruthy()

      // No moderators
      component.communityDetailsForm.patchValue({
        moderators: []
      })
      expect(component.canMoveToNext).toBeFalsy()
    })

    it('should check canPublish', () => {
      component.selectedStepperLable = 'Preview'
      expect(component.canPublish).toBeTruthy()

      // No competencies
      component.competencies = []
      expect(component.canPublish).toBeFalsy()
    })
  })

  describe('patchFormValues', () => {
    it('should patch form values when community details are available', () => {
      // Setup
      component.topicDataList = [
        { categoryId: 'topic-123', categoryName: 'Tech' }
      ]
      component.communityDetailsObject = mockCommunityDetails

      // Call method
      component.patchFormValues()

      // Assert
      expect(component.communityDetailsForm.value.communityName).toBe('Test Community')
      expect(component.communityDetailsForm.value.description).toBe('This is a test community')
      expect(component.communityDetailsForm.value.competencies_v6).toEqual(mockCommunityDetails.competencies_v6)
      expect(component.competencies).toEqual(mockCommunityDetails.competencies_v6)
    })
  })

  describe('saveAndExit', () => {
    beforeEach(() => {
      // Setup a valid form
      component.communityDetailsForm.patchValue({
        communityName: 'Valid Community Name',
        topicName: { categoryId: 'topic-123', categoryName: 'Tech' },
        posterImageUrl: 'image-url.jpg',
        description: 'This is a description that is more than 50 characters long to meet the requirements',
        communityGuideLines: 'These are community guidelines with more than 100 characters. They provide rules and expectations for community members to follow when participating in discussions and activities.',
        moderators: [{ userId: 'user1', name: 'User One' }],
        imageUrl: 'image-url.jpg'
      })

      component.competencies = [{
        competencyAreaName: 'Area 1',
        competencyThemeName: 'Theme 1',
        competencySubThemeName: 'SubTheme 1'
      }]
    })

    it('should create a new community when in create mode', () => {
      // Setup
      component.openMode = 'create'

      // Call method
      component.saveAndExit()

      // Assert
      expect(mockCommunitySvc.createCommunity).toHaveBeenCalled()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
    })

    it('should update community when in edit mode', () => {
      // Setup
      component.openMode = 'edit'
      component.communityId = 'community-123'

      // Call method
      component.saveAndExit()

      // Assert
      expect(mockCommunitySvc.updateCommunity).toHaveBeenCalled()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
    })

    it('should validate form before saving', () => {
      // Setup - invalid form
      component.communityDetailsForm.patchValue({
        communityName: 'X', // too short
        topicName: null
      })

      // Spy on openSnackBar
      jest.spyOn(component as any, 'openSnackBar')

      // Call method
      component.saveAndExit()

      // Assert
      expect(mockCommunitySvc.createCommunity).not.toHaveBeenCalled()
      expect(component['openSnackBar']).toHaveBeenCalled()
    })
  })

  describe('uploadCommunityImage', () => {
    it('should upload poster image file', () => {
      // Setup
      const mockFile = new File(['test'], 'poster.jpg', { type: 'image/jpeg' })
      component.communityDetailsForm.patchValue({
        posterImageUrl: mockFile,
        imageUrl: 'http://example.com/image.jpg' // Not a File
      })

      // Spy on updateCommunityWithImage
      jest.spyOn(component, 'updateCommunityWithImage')

      // Call method
      component.uploadCommunityImage('community-123')

      // Assert
      expect(mockCommunitySvc.fileUpload).toHaveBeenCalled()
      expect(component.updateCommunityWithImage).toHaveBeenCalled()
    })


  })

  describe('getFormBodyOfEvent', () => {
    it('should prepare form data correctly for Draft status', () => {
      // Setup
      component.userProfile = {
        id: 'user-123',
        rootOrg: { orgName: 'TestOrg' },
        rootOrgId: 'org-123'
      }

      component.communityDetailsForm.patchValue({
        communityName: 'Test Community',
        topicName: { categoryId: 'topic-123', categoryName: 'Tech' },
        description: 'Test description',
        communityGuideLines: 'Test guidelines'
      })

      component.competencies = [
        {
          competencyAreaName: 'Area 1',
          competencyThemeName: 'Theme 1',
          competencySubThemeName: 'SubTheme 1'
        }
      ]

      // Call method
      const result = component.getFormBodyOfEvent('Draft')

      // Assert
      expect(result.communityName).toBe('Test Community')
      expect(result.topicId).toBe('topic-123')
      expect(result.topicName).toBe('Tech')
      expect(result.communityAccessLevel).toBe('public')
      expect(result.competencyArea).toEqual(['Area 1'])
      expect(result.competencyTheme).toEqual(['Theme 1'])
      expect(result.competencySubTheme).toEqual(['SubTheme 1'])
    })

    it('should add force creation flag when specified', () => {
      // Call method with force creation
      const result = component.getFormBodyOfEvent('Draft', true)

      // Assert
      expect(result.isCommunityCreationAllowed).toBe(true)
    })
  })

  describe('publishCommunity', () => {
    beforeEach(() => {
      // Setup valid form and competencies
      component.communityDetailsForm.patchValue({
        communityName: 'Valid Community Name',
        topicName: { categoryId: 'topic-123', categoryName: 'Tech' },
        posterImageUrl: 'image-url.jpg',
        description: 'This is a description that is more than 50 characters long to meet the requirements',
        communityGuideLines: 'These are community guidelines with more than 100 characters.',
        moderators: [{ userId: 'user1', name: 'User One' }],
        imageUrl: 'image-url.jpg'
      })

      component.competencies = [{
        competencyAreaName: 'Area 1',
        competencyThemeName: 'Theme 1',
        competencySubThemeName: 'SubTheme 1'
      }]

      component.selectedStepperLable = 'Preview'
    })



    it('should not proceed when form is invalid', () => {
      // Setup - invalid form
      component.communityDetailsForm.patchValue({
        communityName: 'X' // too short
      })

      // Spy on methods
      jest.spyOn(component, 'createCommunityAndPublish')
      jest.spyOn(component, 'publishCommunityMethod')

      // Call method
      component.publishCommunity()

      // Assert - neither method should be called
      expect(component.createCommunityAndPublish).not.toHaveBeenCalled()
      expect(component.publishCommunityMethod).not.toHaveBeenCalled()
    })
  })

  describe('updateCommunity', () => {
    beforeEach(() => {
      // Setup
      component.communityId = 'community-123'
      component.competencies = [{
        competencyAreaName: 'Area 1',
        competencyThemeName: 'Theme 1',
        competencySubThemeName: 'SubTheme 1'
      }]
      component.originalFormValues = {
        communityName: 'Original Name',
        competencies_v6: []
      }
    })

    it('should extract changed fields correctly', () => {
      // Setup - change a field
      component.communityDetailsForm.patchValue({
        communityName: 'Updated Name',
        topicName: { categoryId: 'topic-456', categoryName: 'Leadership' }
      })

      // Spy on getChangedFields
      jest.spyOn(component, 'getChangedFields')

      // Call method
      component.updateCommunity()

      // Assert
      expect(component.getChangedFields).toHaveBeenCalled()
      const changedFields = component.getChangedFields()
      expect(changedFields.communityName).toBe('Updated Name')
      expect(changedFields.competencies_v6).toBeTruthy()
    })

    it('should handle file uploads first before updating', () => {
      // Setup - add file to upload
      const mockFile = new File(['test'], 'poster.jpg', { type: 'image/jpeg' })
      component.communityDetailsForm.patchValue({
        posterImageUrl: mockFile
      })

      // Spy on methods
      jest.spyOn(component, 'getChangedFields').mockReturnValue({
        posterImageUrl: mockFile,
        communityId: 'community-123'
      })

      // Call method
      component.updateCommunity()

      // Assert
      expect(mockCommunitySvc.fileUpload).toHaveBeenCalled()
    })

    it('should call publishCommunityMethod when updating with Published status', () => {
      // Spy on publishCommunityMethod
      jest.spyOn(component, 'publishCommunityMethod')

      // Mock successful update
      mockCommunitySvc.updateCommunity.mockReturnValue(of(true))

      // Call method with Published status
      component.updateCommunity('Published')

      // Assert
      expect(component.publishCommunityMethod).toHaveBeenCalled()
    })

    it('should handle update API error', () => {
      // Mock API error
      mockCommunitySvc.updateCommunity.mockReturnValue(
        throwError(() => new HttpErrorResponse({
          error: { message: 'Update failed' },
          status: 500
        }))
      )

      // Spy on openSnackBar
      jest.spyOn(component as any, 'openSnackBar')

      // Call method
      component.updateCommunity()

      // Assert
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(component['openSnackBar']).toHaveBeenCalled()
    })
  })

  describe('navigateBack and confirmation', () => {
    it('should navigate to communities page', () => {
      // Call method
      component.navigateBack()

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/community'])
    })

    it('should open confirmation dialog in edit mode', () => {
      // Setup
      component.openMode = 'edit'

      // Call method
      component.openConforamtionPopup()

      // Assert
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should navigate back directly in view mode', () => {
      // Setup
      component.openMode = 'view'

      // Spy on navigateBack
      jest.spyOn(component, 'navigateBack')

      // Call method
      component.openConforamtionPopup()

      // Assert
      expect(mockDialog.open).not.toHaveBeenCalled()
      expect(component.navigateBack).toHaveBeenCalled()
    })
  })
})