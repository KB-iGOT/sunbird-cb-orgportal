import { BasicInfoComponent } from './basic-info.component'
import { of, throwError } from 'rxjs'
import { FormBuilder } from '@angular/forms'

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent
  let mockDialogRef: any
  let mockFormBuilder: any
  let mockMatSnackBar: any
  let mockEventSvc: any
  let mockLoaderService: any
  let mockConfigSvc: any
  let mockData: any

  const mockFormGroup = {
    valid: true,
    markAllAsTouched: jest.fn(),
    controls: {
      eventName: { value: 'Test Event Name That Is Long' },
      eventType: { value: 'record' },
    },
  }

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }

    mockFormBuilder = {
      group: jest.fn().mockReturnValue(mockFormGroup),
    }

    mockMatSnackBar = { open: jest.fn() }

    mockEventSvc = {
      createContent: jest.fn(),
      uploadContent: jest.fn(),
      createEvent: jest.fn(),
    }

    mockLoaderService = { changeLoaderState: jest.fn() }

    mockConfigSvc = { orgReadData: { name: 'Test Org' } }

    mockData = {
      userProfile: {
        rootOrgId: 'root-org-id',
        userId: 'user-id',
        givenName: 'John',
        firstName: 'John',
        departmentName: 'Test Department',
        userName: 'johnDoe',
        email: 'john@example.com',
      },
      userEmail: 'john@example.com',
    }

    component = new BasicInfoComponent(
      mockDialogRef,
      mockData,
      mockFormBuilder as FormBuilder,
      mockMatSnackBar,
      mockEventSvc,
      mockLoaderService,
      mockConfigSvc
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set userProfile and userEmail from data in constructor', () => {
    expect(component.userProfile).toEqual(mockData.userProfile)
    expect(component.userEmail).toBe('john@example.com')
  })

  it('should initialize form on ngOnInit', () => {
    const createFormSpy = jest.spyOn(component, 'createForm')
    component.ngOnInit()
    expect(createFormSpy).toHaveBeenCalled()
  })

  it('should set orgData on ngOnInit', () => {
    component.ngOnInit()
    expect(component.orgData).toEqual({ name: 'Test Org' })
  })

  it('should create form with required controls', () => {
    component.createForm()
    expect(mockFormBuilder.group).toHaveBeenCalled()
  })

  // ─── onFileSelected ────────────────────────────────────────────────────────

  describe('onFileSelected', () => {
    it('should return early if no files are selected', () => {
      component.onFileSelected([])
      expect(component.imgURL).toBeNull()
    })

    it('should show error for unsupported file types', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      component.onFileSelected([{ type: 'application/pdf' }])
      expect(openSnackBarSpy).toHaveBeenCalledWith('Only JPG and PNG files are supported')
      expect(component.imgURL).toBeNull()
    })

    it('should show error if file is too large', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      component.onFileSelected([{ type: 'image/jpeg', size: 600000 }])
      expect(openSnackBarSpy).toHaveBeenCalledWith('Please select an image with a size of less than 500KB.')
      expect(component.imgURL).toBeNull()
    })

    it('should process valid image file and call FileReader', () => {
      const mockFileReader: any = {
        readAsDataURL: jest.fn(),
        onload: null,
        result: 'data:image/jpeg;base64,abcdef',
      }
      global.FileReader = jest.fn().mockImplementation(() => mockFileReader) as unknown as typeof FileReader
      const files = [{ type: 'image/jpeg', size: 300000 }]
      component.onFileSelected(files)
      expect(component.imagePath).toEqual(files[0])
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(files[0])
      mockFileReader.onload(new Event('load'))
      expect(component.imgURL).toBe('data:image/jpeg;base64,abcdef')
    })
  })

  // ─── onSave ────────────────────────────────────────────────────────────────

  describe('onSave', () => {
    it('should call saveImage when form is valid and image is uploaded', () => {
      const saveImageSpy = jest.spyOn(component, 'saveImage').mockImplementation()
      component.eventForm = { valid: true } as any
      component.imgURL = 'data:image/jpeg;base64,abcdef'
      component.onSave()
      expect(saveImageSpy).toHaveBeenCalled()
    })

    it('should show error when form is valid but no image is uploaded', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      component.eventForm = { valid: true } as any
      component.imgURL = null
      component.onSave()
      expect(openSnackBarSpy).toHaveBeenCalledWith('Please upload image')
    })

    it('should do nothing when form is invalid', () => {
      const saveImageSpy = jest.spyOn(component, 'saveImage').mockImplementation()
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      component.eventForm = { valid: false } as any
      component.imgURL = 'data:image/jpeg;base64,abcdef'
      component.onSave()
      expect(saveImageSpy).not.toHaveBeenCalled()
      expect(openSnackBarSpy).not.toHaveBeenCalled()
    })
  })

  // ─── saveImage ─────────────────────────────────────────────────────────────

  describe('saveImage', () => {
    beforeEach(() => {
      component.imagePath = { type: 'image/jpeg', size: 300000 }
      component.userProfile = mockData.userProfile
    })

    it('should do nothing when imagePath is falsy', () => {
      component.imagePath = null
      component.saveImage()
      expect(mockEventSvc.createContent).not.toHaveBeenCalled()
    })

    it('should upload image and call createEvent on success with igot URL', () => {
      const igotUrl = 'https://storage.googleapis.com/igot/bucket/path/image.jpg'
      mockEventSvc.createContent.mockReturnValue(of({ result: { identifier: 'content-id' } }))
      mockEventSvc.uploadContent.mockReturnValue(of({ result: { artifactUrl: igotUrl } }))
      const createEventSpy = jest.spyOn(component, 'createEvent').mockImplementation()
      component.saveImage()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockEventSvc.createContent).toHaveBeenCalled()
      expect(mockEventSvc.uploadContent).toHaveBeenCalledWith('content-id', expect.any(FormData))
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(createEventSpy).toHaveBeenCalled()
    })

    it('should use original URL as appIcon when not an igot storage URL', () => {
      const regularUrl = 'https://other.storage.com/image.jpg'
      mockEventSvc.createContent.mockReturnValue(of({ result: { identifier: 'content-id' } }))
      mockEventSvc.uploadContent.mockReturnValue(of({ result: { artifactUrl: regularUrl } }))
      const createEventSpy = jest.spyOn(component, 'createEvent').mockImplementation()
      component.saveImage()
      expect(createEventSpy).toHaveBeenCalledWith(regularUrl)
    })

    it('should do nothing in next callback when artifactUrl is empty', () => {
      const createEventSpy = jest.spyOn(component, 'createEvent').mockImplementation()
      mockEventSvc.createContent.mockReturnValue(of({ result: { identifier: 'content-id' } }))
      mockEventSvc.uploadContent.mockReturnValue(of({ result: { artifactUrl: '' } }))
      component.saveImage()
      expect(createEventSpy).not.toHaveBeenCalled()
    })

    it('should handle missing contentID by calling snackbar via error handler', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      mockEventSvc.createContent.mockReturnValue(of({ result: {} }))
      component.saveImage()
      expect(openSnackBarSpy).toHaveBeenCalledWith('Something went wrong please try again')
    })

    it('should handle error from createContent and show snackbar', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      mockEventSvc.createContent.mockReturnValue(throwError({ error: { message: 'Upload failed' } }))
      component.saveImage()
      expect(openSnackBarSpy).toHaveBeenCalledWith('Upload failed')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should use fallback error message when error has no message', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      mockEventSvc.createContent.mockReturnValue(throwError({}))
      component.saveImage()
      expect(openSnackBarSpy).toHaveBeenCalledWith('Something went wrong please try again')
    })
  })

  // ─── createEvent ───────────────────────────────────────────────────────────

  describe('createEvent', () => {
    beforeEach(() => {
      component.eventForm = {
        valid: true,
        controls: {
          eventName: { value: 'Test Event Name Long' },
          eventType: { value: 'record' },
        },
      } as any
      component.imgURL = 'data:image/jpeg;base64,abcdef'
      component.userProfile = mockData.userProfile
      component.userEmail = mockData.userEmail
    })

    it('should do nothing when form is invalid', () => {
      component.eventForm = { valid: false } as any
      component.createEvent('icon.png')
      expect(mockEventSvc.createEvent).not.toHaveBeenCalled()
    })

    it('should do nothing when imgURL is not set', () => {
      component.imgURL = null
      component.createEvent('icon.png')
      expect(mockEventSvc.createEvent).not.toHaveBeenCalled()
    })

    it('should create event and show success message', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      mockEventSvc.createEvent.mockReturnValue(of({ result: { identifier: 'event-id' } }))
      component.createEvent('https://example.com/image.jpg')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockEventSvc.createEvent).toHaveBeenCalled()
      expect(openSnackBarSpy).toHaveBeenCalledWith('Event created successfully')
      expect(mockDialogRef.close).toHaveBeenCalledWith('event-id')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should use userProfile email when userEmail is empty', () => {
      component.userEmail = ''
      mockEventSvc.createEvent.mockReturnValue(of({ result: { identifier: 'event-id' } }))
      component.createEvent('icon.png')
      expect(mockEventSvc.createEvent).toHaveBeenCalled()
    })

    it('should handle falsy result from createEvent without showing success snackbar', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      mockEventSvc.createEvent.mockReturnValue(of(null))
      component.createEvent('https://example.com/image.jpg')
      expect(openSnackBarSpy).not.toHaveBeenCalled()
    })

    it('should handle error from createEvent and show snackbar', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      mockEventSvc.createEvent.mockReturnValue(throwError({ error: { message: 'Event creation failed' } }))
      component.createEvent('https://example.com/image.jpg')
      expect(openSnackBarSpy).toHaveBeenCalledWith('Event creation failed')
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
    })

    it('should use fallback error message when createEvent error has no message', () => {
      const openSnackBarSpy = jest.spyOn(component as any, 'openSnackBar')
      mockEventSvc.createEvent.mockReturnValue(throwError({}))
      component.createEvent('https://example.com/image.jpg')
      expect(openSnackBarSpy).toHaveBeenCalledWith('Something went wrong while creating event, please try again')
    })
  })

  // ─── openSnackBar ──────────────────────────────────────────────────────────

  it('should open snack bar with message', () => {
    ; (component as any).openSnackBar('Test message')
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test message')
  })
})
