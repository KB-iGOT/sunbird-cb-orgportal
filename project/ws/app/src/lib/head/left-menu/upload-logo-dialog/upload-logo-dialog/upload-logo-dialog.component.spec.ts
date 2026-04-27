import { UploadLogoDialogComponent } from './upload-logo-dialog.component'
import { of, throwError } from 'rxjs'

describe('UploadLogoDialogComponent', () => {
  let component: UploadLogoDialogComponent
  let mockDialogRef: any
  let mockWidgetService: any
  let mockMatSnackBar: any
  let mockData: any

  const makeImageFile = (name = 'logo.png', type = 'image/png') =>
    new File(['fake-content'], name, { type })

  const makeReaderMock = () => {
    const readerMock: any = {
      readAsDataURL: jest.fn(),
      onload: null as any,
      onerror: null as any,
    }
    return readerMock
  }

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockWidgetService = {
      uploadOrgLogo: jest.fn(),
      updateUrlLogo: jest.fn(),
    }
    mockMatSnackBar = { open: jest.fn() }
    mockData = {
      file: makeImageFile(),
      orgName: 'TestOrg',
      rootOrgId: 'org123',
    }

    // Prevent real FileReader from running during construction
    const readerMock = makeReaderMock()
      ; (global as any).FileReader = jest.fn(() => readerMock)

    component = new UploadLogoDialogComponent(
      mockDialogRef,
      mockWidgetService,
      mockMatSnackBar,
      mockData,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ─── create ───────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set fileName, orgName and rootOrgId from data', () => {
    expect(component.fileName).toBe('logo.png')
    expect(component.orgName).toBe('TestOrg')
    expect(component.rootOrgId).toBe('org123')
  })

  it('should not set properties when data fields are absent', () => {
    const readerMock = makeReaderMock()
      ; (global as any).FileReader = jest.fn(() => readerMock)
    const comp = new UploadLogoDialogComponent(
      mockDialogRef,
      mockWidgetService,
      mockMatSnackBar,
      {} as any,
    )
    expect(comp.fileName).toBe('')
    expect(comp.orgName).toBe('')
    expect(comp.rootOrgId).toBe('')
  })

  // ─── loadFile ─────────────────────────────────────────────────────────────

  describe('loadFile', () => {
    it('should show snackbar for non-image file type', () => {
      const csvFile = makeImageFile('test.csv', 'text/csv')
      component.loadFile(csvFile)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Invalid file type', 'X', { panelClass: ['error'] })
    })

    it('should call readAsDataURL for valid image file', () => {
      const readerMock = makeReaderMock()
        ; (global as any).FileReader = jest.fn(() => readerMock)
      const imageFile = makeImageFile()
      component.loadFile(imageFile)
      expect(readerMock.readAsDataURL).toHaveBeenCalledWith(imageFile)
    })

    it('should set imageChangedEvent in reader.onload callback', () => {
      const readerMock = makeReaderMock()
        ; (global as any).FileReader = jest.fn(() => readerMock)
      const imageFile = makeImageFile()
      component.loadFile(imageFile)
      readerMock.onload()
      expect(component.imageChangedEvent).toEqual({ target: { files: [imageFile] } })
    })

    it('should show snackbar in reader.onerror callback', () => {
      const readerMock = makeReaderMock()
        ; (global as any).FileReader = jest.fn(() => readerMock)
      component.loadFile(makeImageFile())
      readerMock.onerror()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Failed to read file. Please try again.')
    })

    it('should show snackbar when file has no type (null file)', () => {
      component.loadFile(null as any)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Invalid file type', 'X', { panelClass: ['error'] })
    })
  })

  // ─── onImageCropped ───────────────────────────────────────────────────────

  describe('onImageCropped', () => {
    it('should set croppedImage from event base64', () => {
      component.onImageCropped({ base64: 'data:image/png;base64,abc' })
      expect(component.croppedImage).toBe('data:image/png;base64,abc')
    })

    it('should set croppedImage to undefined when event has no base64', () => {
      component.onImageCropped({})
      expect(component.croppedImage).toBeUndefined()
    })
  })

  // ─── no-op lifecycle stubs ────────────────────────────────────────────────

  describe('imageLoaded / cropperReady / loadImageFailed', () => {
    it('imageLoaded should not throw', () => {
      expect(() => component.imageLoaded()).not.toThrow()
    })
    it('cropperReady should not throw', () => {
      expect(() => component.cropperReady()).not.toThrow()
    })
    it('loadImageFailed should not throw', () => {
      expect(() => component.loadImageFailed()).not.toThrow()
    })
  })

  // ─── onCancel ─────────────────────────────────────────────────────────────

  describe('onCancel', () => {
    it('should close the dialog', () => {
      component.onCancel()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })

  // ─── b64toBlob ────────────────────────────────────────────────────────────

  describe('b64toBlob', () => {
    it('should return a Blob from valid base64 data URI', () => {
      // 1x1 transparent PNG base64
      const dataURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const blob = component.b64toBlob(dataURI)
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/jpeg')
    })

    it('should return empty Blob when dataURI has no comma part', () => {
      const blob = component.b64toBlob('data:image/png;base64,')
      expect(blob).toBeInstanceOf(Blob)
    })
  })

  // ─── onUpload ─────────────────────────────────────────────────────────────

  describe('onUpload', () => {
    it('should show snackbar and return when croppedImage is null', () => {
      component.croppedImage = null
      component.onUpload()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Please crop the image first.', 'X', { panelClass: ['error'] })
      expect(mockWidgetService.uploadOrgLogo).not.toHaveBeenCalled()
    })

    it('should upload, update logo and close dialog on full success (response = success)', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      component.fileName = 'logo.png'
      component.rootOrgId = 'org123'
      component.orgName = 'TestOrg'
      mockWidgetService.uploadOrgLogo.mockReturnValue(
        of({ result: { qrcodepath: 'https://example.com/logo.png' } })
      )
      mockWidgetService.updateUrlLogo.mockReturnValue(
        of({ result: { response: 'SUCCESS' } })
      )
      component.onUpload()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Logo Updated Successfully')
      expect(mockDialogRef.close).toHaveBeenCalledWith('https://example.com/logo.png')
      expect(component.isLoading).toBe(false)
    })

    it('should not close dialog when updateUrlLogo response is not success', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      component.fileName = 'logo.png'
      mockWidgetService.uploadOrgLogo.mockReturnValue(
        of({ result: { qrcodepath: 'https://example.com/logo.png' } })
      )
      mockWidgetService.updateUrlLogo.mockReturnValue(
        of({ result: { response: 'FAILURE' } })
      )
      component.onUpload()
      expect(mockDialogRef.close).not.toHaveBeenCalled()
      expect(component.isLoading).toBe(false)
    })

    it('should set isLoading to false when uploadOrgLogo returns no qrcodepath', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      component.fileName = 'logo.png'
      mockWidgetService.uploadOrgLogo.mockReturnValue(of({ result: {} }))
      component.onUpload()
      expect(component.isLoading).toBe(false)
      expect(mockWidgetService.updateUrlLogo).not.toHaveBeenCalled()
    })

    it('should handle updateUrlLogo error', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      component.fileName = 'logo.png'
      mockWidgetService.uploadOrgLogo.mockReturnValue(
        of({ result: { qrcodepath: 'https://example.com/logo.png' } })
      )
      mockWidgetService.updateUrlLogo.mockReturnValue(throwError(() => new Error('update error')))
      component.onUpload()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong, please try again later')
      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(component.isLoading).toBe(false)
    })

    it('should handle uploadOrgLogo error', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      component.fileName = 'logo.png'
      mockWidgetService.uploadOrgLogo.mockReturnValue(throwError(() => new Error('upload error')))
      component.onUpload()
      expect(component.isLoading).toBe(false)
    })

    it('should show file too large snackbar when cropped image exceeds maxFileSize', () => {
      const smallPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      component.croppedImage = smallPng
      component.maxFileSize = 5
      component.fileName = 'big.png'
      // Spy on b64toBlob to return a blob larger than maxFileSize
      const largeBlob = new Blob([new Uint8Array(6 * 1024 * 1024)])
      jest.spyOn(component, 'b64toBlob').mockReturnValue(largeBlob)
      component.onUpload()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        `File size exceeds ${component.maxFileSize} MB. Please select a smaller file.`,
        'X',
        { panelClass: ['error'] }
      )
      expect(component.isLoading).toBe(false)
    })
  })

  // ─── zoom controls ────────────────────────────────────────────────────────

  describe('zoomChange', () => {
    it('should set zoomValue within bounds and update transform', () => {
      component.zoomChange(1.5)
      expect(component.zoomValue).toBe(1.5)
      expect(component.transform.scale).toBe(1.5)
    })

    it('should clamp zoomValue to minimum 0.3', () => {
      component.zoomChange(0.1)
      expect(component.zoomValue).toBe(0.3)
    })

    it('should clamp zoomValue to maximum 3', () => {
      component.zoomChange(5)
      expect(component.zoomValue).toBe(3)
    })
  })

  describe('zoomIn', () => {
    it('should increase zoomValue by 0.05 when below max', () => {
      component.zoomValue = 1.0
      component.zoomIn()
      expect(component.zoomValue).toBe(1.05)
      expect(component.transform.scale).toBe(1.05)
    })

    it('should not increase zoomValue when already at max (3)', () => {
      component.zoomValue = 3
      component.zoomIn()
      expect(component.zoomValue).toBe(3)
    })
  })

  describe('zoomOut', () => {
    it('should decrease zoomValue by 0.05 when above min', () => {
      component.zoomValue = 1.0
      component.zoomOut()
      expect(component.zoomValue).toBeCloseTo(0.95, 2)
      expect(component.transform.scale).toBeCloseTo(0.95, 2)
    })

    it('should not decrease zoomValue when already at min (0.3)', () => {
      component.zoomValue = 0.3
      component.zoomOut()
      expect(component.zoomValue).toBe(0.3)
    })
  })

  describe('updateZoom', () => {
    it('should update transform.scale to current zoomValue', () => {
      component.zoomValue = 2.0
      component.updateZoom()
      expect(component.transform.scale).toBe(2.0)
    })

    it('should preserve existing transform properties', () => {
      component.transform = { scale: 1, translateH: 0.1 } as any
      component.zoomValue = 1.5
      component.updateZoom()
      expect((component.transform as any).translateH).toBe(0.1)
      expect(component.transform.scale).toBe(1.5)
    })
  })
})
