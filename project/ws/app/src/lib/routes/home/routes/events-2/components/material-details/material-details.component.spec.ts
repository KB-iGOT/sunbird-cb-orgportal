import { SimpleChange } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { of } from 'rxjs'
import { MaterialDetailsComponent } from './material-details.component'
import { material } from '../../models/events.model'

describe('MaterialDetailsComponent', () => {
  let component: MaterialDetailsComponent
  let mockFormBuilder: jest.Mocked<FormBuilder>
  let mockMatSnackBar: any
  let mockEventService: any
  let mockLoaderService: any
  let mockFormGroup: FormGroup

  beforeEach(() => {
    // Create mock form group
    mockFormGroup = {
      setValue: jest.fn(),
      controls: {
        title: {
          valueChanges: of(''),
          patchValue: jest.fn(),
          updateValueAndValidity: jest.fn()
        },
        content: {
          patchValue: jest.fn(),
          updateValueAndValidity: jest.fn()
        }
      },
      valid: true,
      value: { title: 'Test Title', content: 'Test Content' },
      markAllAsTouched: jest.fn()
    } as unknown as FormGroup

    // Create mock form builder
    mockFormBuilder = {
      group: jest.fn().mockReturnValue(mockFormGroup)
    } as unknown as jest.Mocked<FormBuilder>

    // Create mock snackbar
    mockMatSnackBar = {
      open: jest.fn()
    }

    // Create mock event service
    mockEventService = {
      createContent: jest.fn(),
      uploadContent: jest.fn()
    }

    // Create mock loader service
    mockLoaderService = {
      changeLoaderState: jest.fn()
    }

    // Create component instance
    component = new MaterialDetailsComponent(
      mockFormBuilder,
      mockMatSnackBar,
      mockEventService,
      mockLoaderService
    )

    // Setup spies
    jest.spyOn(component.updatedMaterialDetails, 'emit')
    jest.spyOn(component.canCloseOrOpenMaterial, 'emit')
    jest.spyOn(component.currentMaterialSaveUpdate, 'emit')
    jest.spyOn(component.deleteMaterial, 'emit')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnChanges', () => {
    it('should build form when materialDetails changes', () => {
      // Arrange
      const spy = jest.spyOn(component, 'buildForm')
      const mockMaterialDetails: material = {
        title: 'Test Title',
        content: 'content_test.pdf'
      }
      component.materialDetails = mockMaterialDetails

      // Act
      component.ngOnChanges({ materialDetails: new SimpleChange(null, mockMaterialDetails, true) })

      // Assert
      expect(spy).toHaveBeenCalled()
    })

    it('should not build form when other changes occur', () => {
      // Arrange
      const spy = jest.spyOn(component, 'buildForm')

      // Act
      component.ngOnChanges({ otherProp: new SimpleChange(null, 'test', true) })

      // Assert
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('buildForm', () => {
    it('should create form when materialDetails exist and form does not exist', () => {
      // Arrange
      const mockMaterialDetails: material = {
        title: 'Test Title',
        content: 'content_test.pdf'
      }
      component.materialDetails = mockMaterialDetails
      component.eventForm = undefined as any

      // Act
      component.buildForm()

      // Assert
      expect(mockFormBuilder.group).toHaveBeenCalled()
      expect(component.eventForm).toBeDefined()
    })

    it('should update form value when materialDetails change and form exists', () => {
      // Arrange
      const mockMaterialDetails: material = {
        title: 'Test Title',
        content: 'content_test.pdf'
      }
      component.materialDetails = mockMaterialDetails
      component.eventForm = mockFormGroup

      // Act
      component.buildForm()

      // Assert
      expect(mockFormGroup.setValue).toHaveBeenCalledWith(mockMaterialDetails)
    })

    it('should disable form when openMode is view', () => {
      // Arrange
      const mockMaterialDetails: material = {
        title: 'Test Title',
        content: 'content_test.pdf'
      }
      component.materialDetails = mockMaterialDetails
      component.eventForm = undefined as any
      component.openMode = 'view'

      // Mock the disable method
      const disableSpy = jest.fn()
      jest.spyOn(mockFormBuilder, 'group').mockReturnValue({
        ...mockFormGroup,
        disable: disableSpy
      } as unknown as FormGroup)

      // Act
      component.buildForm()

      // Assert
      expect(disableSpy).toHaveBeenCalled()
    })
  })

  describe('genrateMaterialName', () => {
    it('should extract filename from content URL', () => {
      // Arrange
      component.eventForm = {
        value: { content: 'folder_path_test.pdf' }
      } as unknown as FormGroup

      // Act
      component.genrateMaterialName()

      // Assert
      expect(component.materialName).toBe('test.pdf')
    })

    it('should handle empty content URL', () => {
      // Arrange
      component.eventForm = {
        value: { content: '' }
      } as unknown as FormGroup

      // Act
      component.genrateMaterialName()

      // Assert
      expect(component.materialName).toBe('')
    })
  })

  describe('genrateUploadedDocTypeImg', () => {
    it('should set correct icon for PDF files', () => {
      // Arrange
      component.materialName = 'test.pdf'

      // Act
      component.genrateUploadedDocTypeImg()

      // Assert
      expect(component.uploadedDocTypeImg).toBe('/assets/icons/pdf.svg')
      expect(component.materialType).toBe('1 pdf')
    })

    it('should set correct icon for PPT files', () => {
      // Arrange
      component.materialName = 'test.ppt'

      // Act
      component.genrateUploadedDocTypeImg()

      // Assert
      expect(component.uploadedDocTypeImg).toBe('/assets/icons/ppt.svg')
      expect(component.materialType).toBe('1 ppt')
    })

    it('should set correct icon for DOC files', () => {
      // Arrange
      component.materialName = 'test.doc'

      // Act
      component.genrateUploadedDocTypeImg()

      // Assert
      expect(component.uploadedDocTypeImg).toBe('/assets/icons/doc.svg')
      expect(component.materialType).toBe('1 doc')
    })
  })

  describe('removeMaterial', () => {
    it('should clear content value and material name', () => {
      // Arrange
      component.eventForm = mockFormGroup
      component.materialName = 'test.pdf'

      // Act
      component.removeMaterial()

      // Assert
      expect(mockFormGroup.controls.content.patchValue).toHaveBeenCalledWith('')
      expect(mockFormGroup.controls.content.updateValueAndValidity).toHaveBeenCalled()
      expect(component.materialName).toBe('')
    })
  })

  describe('openStatus', () => {
    it('should emit canCloseOrOpenMaterial with provided status', () => {
      // Act
      component.openStatus(true)

      // Assert
      expect(component.canCloseOrOpenMaterial.emit).toHaveBeenCalledWith(true)
    })
  })

  describe('deleteMaterialFromList', () => {
    it('should emit deleteMaterial with true', () => {
      // Act
      component.deleteMaterialFromList()

      // Assert
      expect(component.deleteMaterial.emit).toHaveBeenCalledWith(true)
    })
  })

  describe('saveDetails', () => {
    it('should emit updatedMaterialDetails when form is valid', () => {
      // Arrange
      component.eventForm = mockFormGroup
      // component.eventForm.valid = true

      // Act
      component.saveDetails()

      // Assert
      expect(component.updatedMaterialDetails.emit).toHaveBeenCalledWith(mockFormGroup.value)
    })

    it('should mark all fields as touched when save is called', () => {
      // Arrange
      component.eventForm = mockFormGroup

      // Act
      component.saveDetails()

      // Assert
      expect(mockFormGroup.markAllAsTouched).toHaveBeenCalled()
    })
  })

  describe('preventDefaultCDK', () => {
    it('should prevent default behavior of event', () => {
      // Arrange
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: document.createElement('div')
      } as unknown as DragEvent

      // Act
      component.preventDefaultCDK(mockEvent)

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    it('should change opacity on enter', () => {
      // Arrange
      const mockTarget = document.createElement('div')
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: mockTarget
      } as unknown as DragEvent

      // Act
      component.preventDefaultCDK(mockEvent, 'enter')

      // Assert
      expect(mockTarget.style.opacity).toBe('0.5')
    })

    it('should restore opacity on leave', () => {
      // Arrange
      const mockTarget = document.createElement('div')
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: mockTarget
      } as unknown as DragEvent

      // Act
      component.preventDefaultCDK(mockEvent, 'leave')

      // Assert
      expect(mockTarget.style.opacity).toBe('1')
    })
  })

  describe('onDrop', () => {
    it('should call onMaterialSelect when files are dropped', () => {
      // Arrange
      const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })]
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: mockFiles },
        target: document.createElement('div')
      } as unknown as DragEvent
      const spy = jest.spyOn(component, 'onMaterialSelect')

      // Act
      component.onDrop(mockEvent)

      // Assert
      expect(spy).toHaveBeenCalledWith(mockFiles)
    })
  })

  describe('onMaterialSelect', () => {
    it('should return early if no files are selected', () => {
      // Arrange
      const mockFiles: File[] = []
      const spy = jest.spyOn(component, 'saveFile')

      // Act
      component.onMaterialSelect(mockFiles)

      // Assert
      expect(spy).not.toHaveBeenCalled()
    })

    it('should show error for invalid file types', () => {
      // Arrange
      const mockFiles = [new File([''], 'test.txt', { type: 'text/plain' })]
      const spy = jest.spyOn(component as any, 'openSnackBar')

      // Act
      component.onMaterialSelect(mockFiles)

      // Assert
      expect(spy).toHaveBeenCalledWith('Invalid file type. Please upload a PDF, PPT, or DOC file.')
    })

    it('should process valid file types', () => {
      // Mock FileReader
      const originalFileReader = global.FileReader
      const mockFileReaderInstance = {
        readAsDataURL: jest.fn(),
        onload: null
      }
      global.FileReader = jest.fn(() => mockFileReaderInstance) as any

      // Arrange
      const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })]
      const saveFileSpy = jest.spyOn(component, 'saveFile').mockImplementation(jest.fn())

      // Act
      component.onMaterialSelect(mockFiles)
      if (mockFileReaderInstance.onload) {
        //  mockFileReaderInstance.onload({} as any)
      }

      // Assert
      expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalledWith(mockFiles[0])
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(saveFileSpy).toHaveBeenCalledWith(mockFiles[0])

      // Restore original FileReader
      global.FileReader = originalFileReader
    })
  })

  describe('saveFile', () => {
    it('should return early if no file is provided', () => {
      // Act
      component.saveFile(null)

      // Assert
      expect(mockEventService.createContent).not.toHaveBeenCalled()
    })

    it('should handle successful file upload', () => {
      // Arrange
      const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' })
      component.eventForm = mockFormGroup
      component.userProfile = {
        rootOrgId: 'org123',
        departmentName: 'dept1',
        userName: 'testUser',
        userId: 'user123'
      }

      // Mock the service responses
      mockEventService.createContent = jest.fn().mockReturnValue(
        of({ result: { identifier: 'content123' } })
      )
      mockEventService.uploadContent = jest.fn().mockReturnValue(
        of({ result: { artifactUrl: 'https://storage.googleapis.com/igot/assets/test.pdf' } })
      )

      // Act
      component.saveFile(mockFile)

      // Assert
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockEventService.createContent).toHaveBeenCalled()
      expect(mockEventService.uploadContent).toHaveBeenCalled()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockFormGroup.controls.content.patchValue).toHaveBeenCalled()
      expect(mockFormGroup.controls.content.updateValueAndValidity).toHaveBeenCalled()
    })
  })
})
