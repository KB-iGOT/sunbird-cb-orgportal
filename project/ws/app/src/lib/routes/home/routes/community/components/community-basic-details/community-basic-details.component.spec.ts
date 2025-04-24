// Mock CKEditor and other dependencies before importing any other modules
jest.mock('ckeditor5', () => ({
  ClassicEditor: {
    create: jest.fn()
  },
  Autosave: jest.fn(),
  BlockQuote: jest.fn(),
  Bold: jest.fn(),
  Code: jest.fn(),
  Essentials: jest.fn(),
  FontBackgroundColor: jest.fn(),
  FontColor: jest.fn(),
  FontFamily: jest.fn(),
  FontSize: jest.fn(),
  Heading: jest.fn(),
  Highlight: jest.fn(),
  Indent: jest.fn(),
  IndentBlock: jest.fn(),
  Italic: jest.fn(),
  Link: jest.fn(),
  List: jest.fn(),
  Mention: jest.fn(),
  Paragraph: jest.fn(),
  RemoveFormat: jest.fn(),
  SpecialCharacters: jest.fn(),
  Strikethrough: jest.fn(),
  Subscript: jest.fn(),
  Superscript: jest.fn(),
  Table: jest.fn(),
  TableCaption: jest.fn(),
  TableCellProperties: jest.fn(),
  TableColumnResize: jest.fn(),
  TableProperties: jest.fn(),
  TableToolbar: jest.fn(),
  Underline: jest.fn(),
  WordCount: jest.fn()
}))

// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, defaultValue) => {
    if (!obj) return defaultValue
    const pathParts = path.split('.')
    let result = obj
    for (const part of pathParts) {
      result = result?.[part]
      if (result === undefined) return defaultValue
    }
    return result
  })
}))

import { CommunityBasicDetailsComponent } from './community-basic-details.component'
import { Subject } from 'rxjs'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as _ from 'lodash'

describe('CommunityBasicDetailsComponent', () => {
  let component: CommunityBasicDetailsComponent
  let mockSanitizer: any
  let mockMatSnackBar: any
  let formGroup: FormGroup

  // Mock URL.createObjectURL and URL.revokeObjectURL
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeAll(() => {
    // Mock URL methods
    URL.createObjectURL = jest.fn().mockReturnValue('blob:test-url')
    URL.revokeObjectURL = jest.fn()

    // Mock FileReader
    global.FileReader = class {
      onload: any
      readAsDataURL() {
        if (this.onload) {
          this.onload({ target: { result: 'data:image/jpeg;base64,mockImageData' } })
        }
      }
    } as any

    // Mock Image
    global.Image = class {
      width = 1152;
      height = 288;
      src = '';
      onload: any
      onerror: any

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 0)
      }
    } as any
  })

  afterAll(() => {
    // Restore original URL methods
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  beforeEach(() => {
    // Create mocks
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn(html => html)
    }

    mockMatSnackBar = {
      open: jest.fn()
    }

    // Create form controls
    formGroup = new FormGroup({
      communityName: new FormControl('', [Validators.required, Validators.minLength(10)]),
      description: new FormControl('', [Validators.required, Validators.minLength(50)]),
      communityGuideLines: new FormControl('', [Validators.required]),
      topicName: new FormControl(null, [Validators.required]),
      posterImageUrl: new FormControl(''),
      imageUrl: new FormControl(''),
      searchTopic: new FormControl('')
    })

    // Create component
    component = new CommunityBasicDetailsComponent(
      mockSanitizer as any,
      mockMatSnackBar as any
    )

    // Set input properties
    component.communityDetailsForm = formGroup
    component.openMode = 'create'
    component.topicDataList = [
      { categoryId: 'topic1', categoryName: 'Technology' },
      { categoryId: 'topic2', categoryName: 'Leadership' },
      { categoryId: 'topic3', categoryName: 'Health' }
    ]
    component.filterTopicDetails = [...component.topicDataList]
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set up searchTopic valueChanges subscription', () => {
      // Mock valueChanges
      const valueChanges = new Subject<string>()

      // Initialize the component
      component.ngOnInit()

      // Test with empty search
      valueChanges.next('')
      expect(component.filterTopicDetails).toEqual(component.topicDataList)

      // Test with search term
      valueChanges.next('tech')
      expect(component.filterTopicDetails.length).toBe(1)
      expect(component.filterTopicDetails[0].categoryName).toBe('Technology')
    })
  })

  describe('showValidationMsg', () => {
    beforeEach(() => {
      // Setup form controls
      component.communityDetailsForm.get('communityName')?.setValue('Short')
      component.communityDetailsForm.get('communityName')?.markAsTouched()

      // Setup spy on lodash.get
      jest.spyOn(_, 'get').mockImplementation((_obj, path) => {
        if (path === 'controls.communityName') {
          return component.communityDetailsForm.get('communityName')
        }
        if (path === 'controls.communityGuideLines') {
          return component.communityDetailsForm.get('communityGuideLines')
        }
        return null
      })
    })

    it('should show validation message for normal form controls', () => {
      // Test minlength validation
      const result = component.showValidationMsg('communityName', 'minlength')
      expect(result).toBe(true)
    })

    it('should check editor text length for communityGuideLines', () => {
      // Mock the getEditorTextLength method
      jest.spyOn(component, 'getEditorTextLength').mockImplementation((content) => {
        if (content === '<p>Short</p>') return 5
        if (content === '<p>Very long content</p>') return 120
        if (content === '<p>Extremely long content</p>') return 600
        return 0
      })

      // Test minlength validation (too short)
      component.communityDetailsForm.get('communityGuideLines')?.setValue('<p>Short</p>')
      component.communityDetailsForm.get('communityGuideLines')?.markAsTouched()
      expect(component.showValidationMsg('communityGuideLines', 'minlength')).toBe(true)

      // Test minlength validation (long enough)
      component.communityDetailsForm.get('communityGuideLines')?.setValue('<p>Very long content</p>')
      expect(component.showValidationMsg('communityGuideLines', 'minlength')).toBe(false)

      // Test maxlength validation (too long)
      component.communityDetailsForm.get('communityGuideLines')?.setValue('<p>Extremely long content</p>')
      expect(component.showValidationMsg('communityGuideLines', 'maxlength')).toBe(true)
    })
  })

  describe('file handling', () => {
    let mockFileEvent: any
    let mockFile: File

    beforeEach(() => {
      // Create mock file event
      mockFile = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' })
      mockFileEvent = {
        target: {
          files: [mockFile]
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      }

      // Spy on handleFile
      jest.spyOn(component, 'handleFile')
    })

    it('should handle file selection via input', () => {
      component.onFileSelected(mockFileEvent as any, 'posterImageUrl')
      expect(component.handleFile).toHaveBeenCalledWith(mockFile, 'posterImageUrl')
    })

    it('should handle drag events', () => {
      // Test dragover
      const dragOverEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      }
      component.onDragOver(dragOverEvent as any)
      expect(dragOverEvent.preventDefault).toHaveBeenCalled()
      expect(component.isDragging).toBe(true)

      // Test dragleave
      const dragLeaveEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      }
      component.onDragLeave(dragLeaveEvent as any)
      expect(dragLeaveEvent.preventDefault).toHaveBeenCalled()
      expect(component.isDragging).toBe(false)

      // Test drop
      const dropEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: {
          files: [mockFile]
        }
      }
      component.onDrop(dropEvent as any, 'posterImageUrl')
      expect(dropEvent.preventDefault).toHaveBeenCalled()
      expect(component.handleFile).toHaveBeenCalledWith(mockFile, 'posterImageUrl')
      expect(component.isDragging).toBe(false)
    })
  })

  describe('file validation', () => {


    it('should validate poster image dimensions', async () => {
      // Valid image
      const validFile = new File(['valid image content'], 'valid.jpg', { type: 'image/jpeg' })
      const validResult = await component.validatePosterImage(validFile)
      expect(validResult).toBe(true)

      // Invalid size
      const largeFile = new File(['large file content'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 })
      const sizeResult = await component.validatePosterImage(largeFile)
      expect(sizeResult).toBe(false)

      // Invalid dimensions
      const mockImage = {
        width: 800,
        height: 600,
        onload: null,
        onerror: null
      }

      // Mock global Image constructor
      global.Image = jest.fn().mockImplementation(() => mockImage) as any

      const invalidDimensionsFile = new File(['invalid dimensions content'], 'invalid.jpg', { type: 'image/jpeg' })
      const dimensionsPromise = component.validatePosterImage(invalidDimensionsFile)

      // Manually trigger onload

      const dimensionsResult = await dimensionsPromise
      expect(dimensionsResult).toBe(false)
    })
  })

  describe('file handling', () => {


    it('should handle poster image file', async () => {
      const imageFile = new File(['image content'], 'poster.jpg', { type: 'image/jpeg' })
      jest.spyOn(component, 'validatePosterImage').mockResolvedValue(true)

      await component.handleFile(imageFile, 'posterImageUrl')

      expect(component.previewUrl).toBe('data:image/jpeg;base64,mockImageData')
      expect(component.communityDetailsForm.get('posterImageUrl')?.value).toBe(imageFile)
    })

    it('should handle community image file', async () => {
      const imageFile = new File(['image content'], 'community.jpg', { type: 'image/jpeg' })
      jest.spyOn(component, 'validateCommunityImage').mockResolvedValue(true)

      await component.handleFile(imageFile, 'imageUrl')

      expect(component.previewImageUrl).toBe('data:image/jpeg;base64,mockImageData')
      expect(component.communityDetailsForm.get('imageUrl')?.value).toBe(imageFile)
    })
  })

  describe('editor handling', () => {
    it('should get text length from HTML content', () => {
      // Simple text
      expect(component.getEditorTextLength('Hello world')).toBe(11)

      // HTML content
      expect(component.getEditorTextLength('<p>Hello <strong>world</strong></p>')).toBe(11)

      // With nbsp
      expect(component.getEditorTextLength('<p>Hello&nbsp;world</p>')).toBe(11)

      // With whitespace
      expect(component.getEditorTextLength('<p>  Hello  world  </p>')).toBe(11)
    })

    it('should handle editor ready event', () => {
      const mockEditor = {
        editing: {
          view: {
            change: jest.fn(callback => {
              const mockWriter = {
                setStyle: jest.fn()
              }
              callback(mockWriter)
              return mockWriter
            }),
            document: {
              getRoot: jest.fn()
            }
          }
        }
      }

      // Mock document.querySelector
      document.querySelector = jest.fn().mockReturnValue({
        remove: jest.fn()
      })

      component.onReady(mockEditor)

      expect(mockEditor.editing.view.change).toHaveBeenCalled()
      expect(document.querySelector).toHaveBeenCalledWith('.ck.ck-powered-by')
    })
  })

  describe('utility methods', () => {
    it('should empty poster image', () => {
      component.previewUrl = 'test-url'
      component.emptyPosterImage()

      expect(component.previewUrl).toBe('')
      expect(component.communityDetailsForm.get('posterImageUrl')?.value).toBe('')
    })

    it('should empty image URL', () => {
      component.previewImageUrl = 'test-url'
      component.emptyImageUrl()

      expect(component.previewImageUrl).toBe('')
      expect(component.communityDetailsForm.get('imageUrl')?.value).toBe('')
    })

    it('should open snackbar', () => {
      component['openSnackBar']('Test message')
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test message')
    })
  })
})