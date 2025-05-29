import { CommunityBasicDetailsComponent } from './community-basic-details.component'
import { FormControl, FormGroup } from '@angular/forms'
import { of } from 'rxjs'

// Mock dependencies
const mockDomSanitizer = {
  bypassSecurityTrustHtml: jest.fn().mockReturnValue('mocked-html')
}

const mockMatSnackBar = {
  open: jest.fn()
}

// Helper to create form group
const createMockFormGroup = () => {
  return new FormGroup({
    searchTopic: new FormControl(''),
    communityName: new FormControl(''),
    description: new FormControl(''),
    communityGuideLines: new FormControl(''),
    posterImageUrl: new FormControl(''),
    imageUrl: new FormControl('')
  })
}

describe('CommunityBasicDetailsComponent', () => {
  let component: CommunityBasicDetailsComponent
  let mockFormGroup: FormGroup

  beforeEach(() => {
    mockFormGroup = createMockFormGroup()
    component = new CommunityBasicDetailsComponent(
      mockDomSanitizer as any,
      mockMatSnackBar as any
    )
    component.communityDetailsForm = mockFormGroup
    component.topicDataList = [
      { categoryName: 'Technology' },
      { categoryName: 'Sports' },
      { categoryName: 'Music' }
    ]

    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize component with default values', () => {
      expect(component.fileSize).toBe(10)
      expect(component.communityStatus).toBe('draft')
      expect(component.previewUrl).toBe('')
      expect(component.isDragging).toBe(false)
      expect(component.previewImageUrl).toBe('')
      expect(component.minimumCharacters).toEqual({
        communityName: 10,
        description: 50,
        communityGuideLines: 100
      })
    })

    it('should initialize tooltip HTML with sanitizer', () => {
      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled()
      expect(component.tooltipHtml).toBe('mocked-html')
    })

    it('should initialize CKEditor configuration', () => {
      expect(component.ckEditorConfig).toBeDefined()
      expect(component.ckEditorConfig.toolbar).toBeDefined()
      expect(component.ckEditorConfig.plugins).toBeDefined()
      expect(component.ckEditorConfig.placeholder).toBe('What you want to say...!')
    })
  })

  describe('ngOnInit', () => {
    it('should setup search topic subscription', () => {
      const searchControl = mockFormGroup.get('searchTopic')
      jest.spyOn(searchControl!.valueChanges, 'pipe').mockReturnValue(of('tech'))

      component.ngOnInit()

      expect(searchControl!.valueChanges.pipe).toHaveBeenCalled()
    })

    it('should filter topic details when search text is provided', (done) => {
      const searchControl = mockFormGroup.get('searchTopic')

      component.ngOnInit()

      searchControl!.setValue('tech')

      setTimeout(() => {
        expect(component.filterTopicDetails).toHaveLength(1)
        expect(component.filterTopicDetails[0].categoryName).toBe('Technology')
        done()
      }, 300)
    })

    it('should show all topics when search text is empty', (done) => {
      const searchControl = mockFormGroup.get('searchTopic')

      component.ngOnInit()

      searchControl!.setValue('')

      setTimeout(() => {
        expect(component.filterTopicDetails).toEqual(component.topicDataList)
        done()
      }, 300)
    })
  })

  describe('showValidationMsg', () => {
    describe('for communityGuideLines', () => {
      it('should return true for maxlength validation when content exceeds 500 characters', () => {
        const longContent = '<p>' + 'a'.repeat(600) + '</p>'
        mockFormGroup.get('communityGuideLines')?.setValue(longContent)
        mockFormGroup.get('communityGuideLines')?.markAsTouched()

        const result = component.showValidationMsg('communityGuideLines', 'maxlength')

        expect(result).toBe(true)
      })

      it('should return false for maxlength validation when content is within limit', () => {
        const shortContent = '<p>' + 'a'.repeat(400) + '</p>'
        mockFormGroup.get('communityGuideLines')?.setValue(shortContent)
        mockFormGroup.get('communityGuideLines')?.markAsTouched()

        const result = component.showValidationMsg('communityGuideLines', 'maxlength')

        expect(result).toBe(false)
      })

      it('should return true for minlength validation when content is less than 100 characters', () => {
        const shortContent = '<p>' + 'a'.repeat(50) + '</p>'
        mockFormGroup.get('communityGuideLines')?.setValue(shortContent)
        mockFormGroup.get('communityGuideLines')?.markAsTouched()

        const result = component.showValidationMsg('communityGuideLines', 'minlength')

        expect(result).toBe(true)
      })

      it('should return false for minlength validation when content meets minimum requirement', () => {
        const validContent = '<p>' + 'a'.repeat(150) + '</p>'
        mockFormGroup.get('communityGuideLines')?.setValue(validContent)
        mockFormGroup.get('communityGuideLines')?.markAsTouched()

        const result = component.showValidationMsg('communityGuideLines', 'minlength')

        expect(result).toBe(false)
      })
    })

    describe('for other controls', () => {
      it('should return true when control is touched, invalid and has specific error', () => {
        const control = mockFormGroup.get('communityName')
        control?.setErrors({ required: true })
        control?.markAsTouched()

        const result = component.showValidationMsg('communityName', 'required')

        expect(result).toBe(true)
      })

      it('should return false when control is not touched', () => {
        const control = mockFormGroup.get('communityName')
        control?.setErrors({ required: true })

        const result = component.showValidationMsg('communityName', 'required')

        expect(result).toBe(false)
      })
    })
  })

  describe('File handling methods', () => {
    describe('onFileSelected', () => {
      it('should call handleFile when file is selected', () => {
        const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
        const mockEvent = {
          target: { files: [mockFile] }
        } as any

        jest.spyOn(component, 'handleFile').mockImplementation()

        component.onFileSelected(mockEvent, 'posterImageUrl')

        expect(component.handleFile).toHaveBeenCalledWith(mockFile, 'posterImageUrl')
      })

      it('should not call handleFile when no file is selected', () => {
        const mockEvent = {
          target: { files: [] }
        } as any

        jest.spyOn(component, 'handleFile').mockImplementation()

        component.onFileSelected(mockEvent, 'posterImageUrl')

        expect(component.handleFile).not.toHaveBeenCalled()
      })
    })

    describe('Drag and drop methods', () => {
      it('should set isDragging to true on drag over', () => {
        const mockEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn()
        } as any

        component.onDragOver(mockEvent)

        expect(component.isDragging).toBe(true)
        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(mockEvent.stopPropagation).toHaveBeenCalled()
      })

      it('should set isDragging to false on drag leave', () => {
        component.isDragging = true
        const mockEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn()
        } as any

        component.onDragLeave(mockEvent)

        expect(component.isDragging).toBe(false)
        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(mockEvent.stopPropagation).toHaveBeenCalled()
      })

      it('should handle file drop', () => {
        const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
        const mockEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
          dataTransfer: { files: [mockFile] }
        } as any

        jest.spyOn(component, 'handleFile').mockImplementation()

        component.onDrop(mockEvent, 'imageUrl')

        expect(component.isDragging).toBe(false)
        expect(component.handleFile).toHaveBeenCalledWith(mockFile, 'imageUrl')
      })
    })
  })

  describe('File validation methods', () => {
    describe('validatePosterImage', () => {
      it('should resolve false for file size exceeding limit', async () => {
        const oversizedFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
        Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024 }) // 11MB

        const result = await component.validatePosterImage(oversizedFile)

        expect(result).toBe(false)
        expect(mockMatSnackBar.open).toHaveBeenCalledWith('File size must be less than 10MB')
      })

      it('should resolve false for invalid image dimensions', async () => {
        const validSizeFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
        Object.defineProperty(validSizeFile, 'size', { value: 5 * 1024 * 1024 }) // 5MB

        // Mock Image constructor
        const mockImage = {
          onload: null as ((event: Event) => void) | null,
          onerror: null as ((event: Event) => void) | null,
          src: '',
          width: 800,
          height: 600
        }

        global.Image = jest.fn().mockImplementation(() => mockImage)
        global.URL = {
          createObjectURL: jest.fn().mockReturnValue('blob:url'),
          revokeObjectURL: jest.fn()
        } as any

        const promise = component.validatePosterImage(validSizeFile)

        // Simulate image load with wrong dimensions
        if (mockImage.onload) {
          mockImage.onload({} as Event)
        }

        const result = await promise

        expect(result).toBe(false)
        expect(mockMatSnackBar.open).toHaveBeenCalledWith('Image must be exactly 1152x288 pixels')
      })

      it('should resolve true for valid image', async () => {
        const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
        Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 }) // 5MB

        const mockImage = {
          onload: null as ((event: Event) => void) | null,
          onerror: null as ((event: Event) => void) | null,
          src: '',
          width: 1152,
          height: 288
        }

        global.Image = jest.fn().mockImplementation(() => mockImage)

        const promise = component.validatePosterImage(validFile)

        // Simulate successful image load
        if (mockImage.onload) {
          mockImage.onload({} as Event)
        }

        const result = await promise

        expect(result).toBe(true)
      })
    })

    describe('validateCommunityImage', () => {
      it('should resolve true for valid community image regardless of dimensions', async () => {
        const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
        Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 }) // 5MB

        const result = await component.validateCommunityImage(validFile)

        expect(result).toBe(true)
      })

      it('should resolve false for oversized file', async () => {
        const oversizedFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
        Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024 }) // 11MB

        const result = await component.validateCommunityImage(oversizedFile)

        expect(result).toBe(false)
        expect(mockMatSnackBar.open).toHaveBeenCalledWith('File size must be less than 10MB')
      })
    })
  })

  describe('handleFile', () => {
    beforeEach(() => {
      const MockFileReader: any = jest.fn().mockImplementation(() => ({
        readAsDataURL: jest.fn(function (this: any) {
          if (this.onload) {
            this.onload({} as ProgressEvent<FileReader>)
          }
        }),
        result: 'data:image/jpeg;base64,mockbase64',
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onabort: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onloadstart: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onloadend: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onprogress: null as ((event: ProgressEvent<FileReader>) => void) | null,
        readyState: 0,
        error: null,
        abort: jest.fn(),
        readAsArrayBuffer: jest.fn(),
        readAsBinaryString: jest.fn(),
        readAsText: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))

      // Add static properties
      MockFileReader.EMPTY = 0
      MockFileReader.LOADING = 1
      MockFileReader.DONE = 2
      MockFileReader.prototype = {}

      global.FileReader = MockFileReader as any
    })

    it('should show error for non-image files', async () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })

      await component.handleFile(textFile, 'posterImageUrl')

      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please upload an image file')
    })

    it('should handle poster image upload successfully', async () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      jest.spyOn(component, 'validatePosterImage').mockResolvedValue(true)

      await component.handleFile(imageFile, 'posterImageUrl')

      expect(component.validatePosterImage).toHaveBeenCalledWith(imageFile)
      expect(component.previewUrl).toBe('data:image/jpeg;base64,mockbase64')
    })

    it('should handle community image upload successfully', async () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      jest.spyOn(component, 'validateCommunityImage').mockResolvedValue(true)

      await component.handleFile(imageFile, 'imageUrl')

      expect(component.validateCommunityImage).toHaveBeenCalledWith(imageFile)
      expect(component.previewImageUrl).toBe('data:image/jpeg;base64,mockbase64')
    })
  })

  describe('Editor methods', () => {
    describe('getEditorTextLength', () => {
      it('should return correct text length after removing HTML tags', () => {
        const htmlContent = '<p>Hello <strong>world</strong>!</p>'

        const result = component.getEditorTextLength(htmlContent)

        expect(result).toBe(12) // "Hello world!"
      })

      it('should handle nbsp entities', () => {
        const htmlContent = '<p>Hello&nbsp;world</p>'

        const result = component.getEditorTextLength(htmlContent)

        expect(result).toBe(11) // "Hello world"
      })

      it('should trim whitespace', () => {
        const htmlContent = '  <p>Hello</p>  '

        const result = component.getEditorTextLength(htmlContent)

        expect(result).toBe(5) // "Hello"
      })
    })

    describe('onReady', () => {
      it('should set minimum height and remove powered by element', () => {
        const mockEditor = {
          editing: {
            view: {
              change: jest.fn(),
              document: {
                getRoot: jest.fn()
              }
            }
          }
        }

        // Mock DOM element
        const mockElement = { remove: jest.fn() }
        jest.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)

        component.onReady(mockEditor)

        expect(mockEditor.editing.view.change).toHaveBeenCalled()
        expect(mockElement.remove).toHaveBeenCalled()
      })
    })

    describe('checkCharacterLimit', () => {
      it('should prevent input when description exceeds 3000 characters', () => {
        const longText = 'a'.repeat(3001)
        mockFormGroup.get('description')?.setValue(`<p>${longText}</p>`)

        const mockEvent = {
          editor: {
            getData: jest.fn().mockReturnValue(`<p>${longText}</p>`),
            setData: jest.fn()
          }
        }

        component.checkCharacterLimit(mockEvent)

        expect(mockEvent.editor.setData).toHaveBeenCalled()
      })
    })

    describe('onEditorChange', () => {
      it('should truncate content when it exceeds 3000 characters', () => {
        const longText = 'a'.repeat(3001)
        const mockEditor = {
          getData: jest.fn().mockReturnValue(`<p>${longText}</p>`),
          setData: jest.fn(),
          model: {
            document: {
              selection: {},
              model: {
                createPositionAt: jest.fn(),
              },
              getRoot: jest.fn()
            }
          }
        }

        const mockEvent = { editor: mockEditor }

        component.onEditorChange(mockEvent)

        expect(mockEditor.setData).toHaveBeenCalled()
      })
    })

    describe('onFocus', () => {
      it('should remove powered by element', () => {
        const mockElement = { remove: jest.fn() }
        jest.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)

        component.onFocus()

        expect(mockElement.remove).toHaveBeenCalled()
      })
    })
  })

  describe('Image clearing methods', () => {
    it('should clear poster image', () => {
      component.previewUrl = 'some-url'

      component.emptyPosterImage()

      expect(component.previewUrl).toBe('')
      expect(mockFormGroup.get('posterImageUrl')?.value).toBe('')
    })

    it('should clear community image', () => {
      component.previewImageUrl = 'some-url'

      component.emptyImageUrl()

      expect(component.previewImageUrl).toBe('')
      expect(mockFormGroup.get('imageUrl')?.value).toBe('')
    })
  })

  describe('Utility methods', () => {
    it('should return CKEditor config', () => {
      const config = component.getCongif()

      expect(config).toBe(component.ckEditorConfig)
    })
  })

  describe('Input properties', () => {
    it('should accept input properties', () => {
      component.openMode = 'edit'
      component.topicDataList = [{ categoryName: 'Test' }]
      component.filterTopicDetails = [{ categoryName: 'Filtered' }]

      expect(component.openMode).toBe('edit')
      expect(component.topicDataList).toHaveLength(1)
      expect(component.filterTopicDetails).toHaveLength(1)
    })
  })
})