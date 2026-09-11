import { FormBuilder } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { comprehensiveAssessment } from '../../models/comprehensive-assessment.model'
import { ComprehensiveAssessmentService } from '../../services/comprehensive-assessment.service'
import { BasicInfoComponent } from './basic-info.component'

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent
  let dialogRef: any
  let assessmentSvc: any
  let loaderService: any
  let configSvc: any
  let matSnackBar: any

  const userProfile = { rootOrgId: 'org-1', userId: 'user-1' }
  const validName = 'APAR comprehensive assessment'
  const artifactUrl = 'https://content.igot.in/content/assets/do_1/icon.png'

  /** A picked file, small enough to pass the size check unless told otherwise. */
  const imageFile = (overrides: any = {}) => ({
    type: 'image/png',
    size: 1024,
    name: 'icon.png',
    ...overrides,
  })

  const build = (data: any = {}) => new BasicInfoComponent(
    dialogRef as MatDialogRef<BasicInfoComponent>,
    { userProfile, userEmail: 'creator@igot.in', ...data },
    new FormBuilder(),
    matSnackBar as MatSnackBar,
    assessmentSvc as ComprehensiveAssessmentService,
    loaderService as LoaderService,
    configSvc as ConfigurationsService
  )

  beforeEach(() => {
    dialogRef = { close: jest.fn() }
    assessmentSvc = {
      uploadImageAsset: jest.fn().mockReturnValue(of(artifactUrl)),
      createAssessmentCollection: jest.fn().mockReturnValue(of({ result: { identifier: 'do_123' } })),
    }
    loaderService = { changeLoaderState: jest.fn() }
    configSvc = { orgReadData: { orgName: 'Dept Of Project Management' } }
    matSnackBar = { open: jest.fn() }
    component = build()
  })

  it('should create a instance of component', () => {
    expect(component).toBeTruthy()
  })

  it('should read the caller and the mode off the dialog data', () => {
    expect(component.userProfile).toEqual(userProfile)
    expect(component.userEmail).toBe('creator@igot.in')
    expect(component.mode).toBe('create')
    expect(component.isEditMode).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should open the create dialog empty', () => {
      component.ngOnInit()

      expect(component.assessmentForm.value).toEqual({ assessmentName: '' })
      expect(component.imgURL).toBeNull()
      expect(component.orgData).toEqual({ orgName: 'Dept Of Project Management' })
    })

    /** In edit mode the stored icon is already an artifact url, it previews as it is. */
    it('should open the edit dialog on the values it was handed', () => {
      component = build({ mode: 'edit', assessmentName: validName, appIcon: artifactUrl })

      component.ngOnInit()

      expect(component.isEditMode).toBe(true)
      expect(component.assessmentForm.value).toEqual({ assessmentName: validName })
      expect(component.imgURL).toBe(artifactUrl)
      expect(component.imagePath).toBeUndefined()
    })

    it('should carry no org data when the config service holds none', () => {
      configSvc = {}
      component = build()

      component.ngOnInit()

      expect(component.orgData).toEqual({})
    })
  })

  describe('the name field', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should be required', () => {
      expect(component.assessmentName?.hasError('required')).toBe(true)
    })

    it('should refuse a name below the floor', () => {
      component.assessmentName?.setValue('short')

      expect(component.assessmentName?.hasError('minlength')).toBe(true)
    })

    it('should refuse a name above the ceiling', () => {
      component.assessmentName?.setValue('a'.repeat(comprehensiveAssessment.NAME_MAX_LENGTH + 1))

      expect(component.assessmentName?.hasError('maxlength')).toBe(true)
    })

    it('should refuse a name carrying a special character', () => {
      component.assessmentName?.setValue('APAR assessment <script>')

      expect(component.assessmentName?.hasError('pattern')).toBe(true)
    })

    it('should accept an ordinary assessment name', () => {
      component.assessmentName?.setValue(validName)

      expect(component.assessmentForm.valid).toBe(true)
    })

    it('should report the length the counter shows', () => {
      expect(component.assessmentNameLength).toBe(0)

      component.assessmentName?.setValue(validName)

      expect(component.assessmentNameLength).toBe(validName.length)
    })
  })

  describe('onFileSelected', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should ignore an empty pick', () => {
      component.onFileSelected(null)
      component.onFileSelected([])

      expect(component.imagePath).toBeUndefined()
      expect(matSnackBar.open).not.toHaveBeenCalled()
    })

    it('should refuse a file that is not an image', () => {
      component.onFileSelected([imageFile({ type: 'application/pdf' })])

      expect(matSnackBar.open).toHaveBeenCalledWith('Only JPG and PNG files are supported')
      expect(component.imagePath).toBeUndefined()
    })

    it('should refuse a file the browser reports no type for', () => {
      component.onFileSelected([imageFile({ type: '' })])

      expect(matSnackBar.open).toHaveBeenCalledWith('Only JPG and PNG files are supported')
    })

    it('should refuse an image over the size limit and keep nothing', () => {
      component.onFileSelected([imageFile({ size: comprehensiveAssessment.IMAGE_MAX_SIZE + 1 })])

      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Please select an image with a size of less than 500KB.'
      )
      expect(component.imagePath).toBe('')
    })

    /** The preview is the reader's own data url, it is never an artifact url yet. */
    it('should keep the picked image and preview it off its own data url', () => {
      const reader: any = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,aaa' }
      const readerSpy = jest.spyOn(window as any, 'FileReader').mockImplementation(() => reader)
      const file = imageFile()

      component.onFileSelected([file])

      expect(component.imagePath).toBe(file)
      expect(reader.readAsDataURL).toHaveBeenCalledWith(file)

      reader.onload()

      expect(component.imgURL).toBe('data:image/png;base64,aaa')
      readerSpy.mockRestore()
    })
  })

  describe('onSave', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should touch the whole form and stop while the name is not valid', () => {
      component.imgURL = artifactUrl

      component.onSave()

      expect(component.assessmentName?.touched).toBe(true)
      expect(assessmentSvc.uploadImageAsset).not.toHaveBeenCalled()
    })

    /** The thumbnail is optional, an assessment can be created without one. */
    it('should create the assessment with no image at all', () => {
      component.assessmentName?.setValue(validName)

      component.onSave()

      expect(assessmentSvc.uploadImageAsset).not.toHaveBeenCalled()
      expect(assessmentSvc.createAssessmentCollection).toHaveBeenCalledWith(
        validName, '', userProfile, 'creator@igot.in'
      )
      expect(dialogRef.close).toHaveBeenCalledWith('do_123')
    })

    it('should create the assessment in create mode', () => {
      component.assessmentName?.setValue(validName)
      component.imagePath = imageFile()
      component.imgURL = 'data:image/png;base64,aaa'

      component.onSave()

      expect(assessmentSvc.createAssessmentCollection).toHaveBeenCalled()
    })

    it('should only hand the values back in edit mode', () => {
      component = build({ mode: 'edit', assessmentName: validName, appIcon: artifactUrl })
      component.ngOnInit()

      component.onSave()

      expect(assessmentSvc.createAssessmentCollection).not.toHaveBeenCalled()
      expect(dialogRef.close).toHaveBeenCalledWith({ assessmentName: validName, appIcon: artifactUrl })
    })
  })

  describe('updateBasicInfo', () => {
    beforeEach(() => {
      component = build({ mode: 'edit', assessmentName: validName, appIcon: artifactUrl })
      component.ngOnInit()
    })

    it('should hand back the trimmed name and the stored icon when the image is untouched', () => {
      component.assessmentName?.setValue(`  ${validName}  `)

      component.updateBasicInfo()

      expect(assessmentSvc.uploadImageAsset).not.toHaveBeenCalled()
      expect(dialogRef.close).toHaveBeenCalledWith({ assessmentName: validName, appIcon: artifactUrl })
    })

    /** appIcon has to be an artifact url, so a newly picked image is uploaded first. */
    it('should upload a newly picked image and hand back its url', () => {
      assessmentSvc.uploadImageAsset.mockReturnValue(of('https://content.igot.in/content/assets/do_1/new.png'))
      component.imagePath = imageFile()

      component.updateBasicInfo()

      expect(assessmentSvc.uploadImageAsset).toHaveBeenCalledWith(component.imagePath, userProfile)
      expect(dialogRef.close).toHaveBeenCalledWith({
        assessmentName: validName,
        appIcon: 'https://content.igot.in/content/assets/do_1/new.png',
      })
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should keep the stored icon when the upload comes back empty', () => {
      assessmentSvc.uploadImageAsset.mockReturnValue(of(''))
      component.imagePath = imageFile()

      component.updateBasicInfo()

      expect(dialogRef.close).toHaveBeenCalledWith({ assessmentName: validName, appIcon: artifactUrl })
    })

    it('should keep the dialog open and say why the upload failed', () => {
      assessmentSvc.uploadImageAsset.mockReturnValue(
        throwError(() => ({ error: { message: 'asset service is down' } }))
      )
      component.imagePath = imageFile()

      component.updateBasicInfo()

      expect(matSnackBar.open).toHaveBeenCalledWith('asset service is down')
      expect(dialogRef.close).not.toHaveBeenCalled()
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.uploadImageAsset.mockReturnValue(throwError(() => ({})))
      component.imagePath = imageFile()

      component.updateBasicInfo()

      expect(matSnackBar.open).toHaveBeenCalledWith('Something went wrong please try again')
    })
  })

  describe('createAssessment', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.assessmentName?.setValue(`  ${validName}  `)
      component.imagePath = imageFile()
    })

    it('should upload the image and create the collection with its url', () => {
      component.createAssessment()

      expect(assessmentSvc.uploadImageAsset).toHaveBeenCalledWith(component.imagePath, userProfile)
      expect(assessmentSvc.createAssessmentCollection).toHaveBeenCalledWith(
        validName, artifactUrl, userProfile, 'creator@igot.in'
      )
    })

    it('should skip the upload entirely when no image was picked', () => {
      component.imagePath = undefined

      component.createAssessment()

      expect(assessmentSvc.uploadImageAsset).not.toHaveBeenCalled()
      expect(assessmentSvc.createAssessmentCollection).toHaveBeenCalledWith(
        validName, '', userProfile, 'creator@igot.in'
      )
    })

    it('should hand the new assessment back so the builder can open on it', () => {
      component.createAssessment()

      expect(matSnackBar.open).toHaveBeenCalledWith('Comprehensive assessment created successfully')
      expect(dialogRef.close).toHaveBeenCalledWith('do_123')
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should stay open when the api answers without an identifier', () => {
      assessmentSvc.createAssessmentCollection.mockReturnValue(of({ result: {} }))

      component.createAssessment()

      expect(matSnackBar.open).toHaveBeenCalledWith('Something went wrong please try again')
      expect(dialogRef.close).not.toHaveBeenCalled()
    })

    it('should report why the creation failed', () => {
      assessmentSvc.createAssessmentCollection.mockReturnValue(
        throwError(() => ({ error: { message: 'name is already taken' } }))
      )

      component.createAssessment()

      expect(matSnackBar.open).toHaveBeenCalledWith('name is already taken')
      expect(dialogRef.close).not.toHaveBeenCalled()
      expect(loaderService.changeLoaderState).toHaveBeenLastCalledWith(false)
    })

    it('should fall back to a readable message when the failure carries none', () => {
      assessmentSvc.uploadImageAsset.mockReturnValue(throwError(() => ({})))

      component.createAssessment()

      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Something went wrong while creating the assessment, please try again'
      )
      expect(assessmentSvc.createAssessmentCollection).not.toHaveBeenCalled()
    })
  })
})
