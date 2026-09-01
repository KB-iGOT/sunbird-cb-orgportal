import { EventMaterialsComponent } from './event-materials.component'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EventsService } from '../../services/events.service'
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'
import { LoaderService } from '../../../../../../../../../../../src/app/services/loader.service'
import { of, throwError } from 'rxjs'

// Mock window.env
const mockWindow = {
  env: {
    name: 'test-env',
    sitePath: 'test-site-path',
    karmYogiPath: 'test-karmyogi-path',
    cbpPath: 'test-cbp-path',
    domainName: 'test-domain'
  }
}

// Setup window mock
Object.defineProperty(window, 'env', {
  value: mockWindow.env,
  writable: true
})

jest.mock('@angular/material/snack-bar')
jest.mock('../../services/events.service')
jest.mock('../../../../../../../../../../../src/app/services/loader.service')
jest.mock('../../../../../../../../../../../src/environments/environment', () => ({
  environment: {
    production: false,
    name: 'test-env',
    sitePath: 'test-site-path',
    karmYogiPath: 'test-karmyogi-path',
    cbpPath: 'test-cbp-path',
    domainName: 'test-domain'
  }
}))

describe('EventMaterialsComponent', () => {
  let component: EventMaterialsComponent
  let mockMatSnackBar: jest.Mocked<MatSnackBar>
  let mockEventsService: jest.Mocked<EventsService>
  let mockActivatedRoute: Partial<ActivatedRoute>
  let mockLoaderService: jest.Mocked<LoaderService>
  let mockSnapshot: Partial<ActivatedRouteSnapshot>

  const mockUserProfile = {
    rootOrgId: 'test-org',
    departmentName: 'test-dept',
    userName: 'test-user',
    userId: 'test-id'
  }

  beforeEach(() => {
    // Reset window.env before each test
    Object.defineProperty(window, 'env', {
      value: mockWindow.env,
      writable: true
    })

    mockMatSnackBar = {
      open: jest.fn()
    } as any

    mockEventsService = {
      createContent: jest.fn(),
      uploadContent: jest.fn()
    } as any

    mockSnapshot = {
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      data: {
        configService: {
          userProfile: mockUserProfile
        }
      },
      outlet: 'primary',
      component: null,
      routeConfig: null,
      children: [],
      pathFromRoot: []
    } as Partial<ActivatedRouteSnapshot>

    mockActivatedRoute = {
      snapshot: mockSnapshot as ActivatedRouteSnapshot
    }

    mockLoaderService = {
      changeLoaderState: jest.fn()
    } as any

    component = new EventMaterialsComponent(
      mockMatSnackBar,
      mockEventsService,
      mockActivatedRoute as ActivatedRoute,
      mockLoaderService
    )
  })

  afterEach(() => {
    // Clean up window.env after each test
    jest.resetModules()
  })

  // ... rest of the test cases remain the same ...

  describe('saveFile', () => {
    beforeEach(() => {
      component.userProfile = mockUserProfile
      component.filePath = { type: 'application/pdf' }
    })

    it('should successfully save file and update materials list with domain URL', () => {
      const mockArtifactUrl = 'https://storage.googleapis.com/igot/test/file.pdf'

      mockEventsService.createContent = jest.fn().mockReturnValue(of({ result: { identifier: 'test-id' } }))
      mockEventsService.uploadContent = jest.fn().mockReturnValue(of({ result: { artifactUrl: mockArtifactUrl } }))

      component.saveFile()

      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(true)
      expect(mockEventsService.createContent).toHaveBeenCalled()
      expect(mockEventsService.uploadContent).toHaveBeenCalled()

      const createContentCall = mockEventsService.createContent.mock.calls[0][0]
      expect(createContentCall.request.content.createdFor).toContain(mockUserProfile.rootOrgId)
      expect(createContentCall.request.content.organisation).toContain(mockUserProfile.departmentName)
    })

    it('should call addNewFileToList when upload succeeds', () => {
      const mockArtifactUrl = 'https://storage.googleapis.com/igot/test/file.pdf'
      mockEventsService.createContent = jest.fn().mockReturnValue(of({ result: { identifier: 'test-id' } }))
      mockEventsService.uploadContent = jest.fn().mockReturnValue(of({ result: { artifactUrl: mockArtifactUrl } }))
      const spy = jest.spyOn(component, 'addNewFileToList')
      component.saveFile()
      expect(spy).toHaveBeenCalled()
    })

    it('should handle API error and show snackbar', () => {
      // RxJS 6: throwError(value) passes value directly to error handler
      const error = { error: { message: 'Upload failed' } }
      mockEventsService.createContent = jest.fn().mockReturnValue(throwError(error))
      component.saveFile()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Upload failed')
    })

    it('should show default error message when error has no message', () => {
      mockEventsService.createContent = jest.fn().mockReturnValue(throwError({}))
      component.saveFile()
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Something went wrong please try again')
    })

    it('should handle null artifactUrl response gracefully', () => {
      mockEventsService.createContent = jest.fn().mockReturnValue(of({ result: { identifier: 'test-id' } }))
      mockEventsService.uploadContent = jest.fn().mockReturnValue(of({ result: { artifactUrl: null } }))
      expect(() => component.saveFile()).not.toThrow()
    })

  })

  describe('ngOnInit', () => {
    it('should set userProfile from activeRoute snapshot', () => {
      component.ngOnInit()
      expect(component.userProfile).toEqual(mockUserProfile)
    })

    it('should not set userProfile when snapshot data is missing', () => {
      const routeWithoutProfile = { snapshot: { data: {} } } as any
      const comp = new EventMaterialsComponent(
        mockMatSnackBar, mockEventsService, routeWithoutProfile, mockLoaderService
      )
      comp.ngOnInit()
      expect(comp.userProfile).toBeUndefined()
    })
  })

  describe('onFileSelected', () => {
    it('should return early when no files are selected', () => {
      const spy = jest.spyOn(component, 'saveFile')
      component.onFileSelected([])
      expect(spy).not.toHaveBeenCalled()
    })

    it('should reject file with invalid MIME type and show snackbar', () => {
      const spy = jest.spyOn(component, 'saveFile')
      component.onFileSelected([{ type: 'image/png' }])
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Invalid file type. Please upload a PDF, PPT, PPTX, DOCX or DOC file.'
      )
      expect(spy).not.toHaveBeenCalled()
    })

    it('should accept PDF files and call FileReader', () => {
      const mockReader: any = { readAsDataURL: jest.fn(), onload: null }
      const OrigFileReader = global.FileReader
      global.FileReader = jest.fn(() => mockReader) as any
      component.onFileSelected([{ type: 'application/pdf' }])
      expect(mockReader.readAsDataURL).toHaveBeenCalled()
      global.FileReader = OrigFileReader
    })

    it('should call saveFile when FileReader onload fires', () => {
      const mockReader: any = { readAsDataURL: jest.fn(), onload: null }
      const OrigFileReader = global.FileReader
      global.FileReader = jest.fn(() => mockReader) as any
      const spy = jest.spyOn(component, 'saveFile').mockImplementation()
      component.onFileSelected([{ type: 'application/pdf' }])
      // trigger the onload callback
      mockReader.onload({})
      expect(spy).toHaveBeenCalled()
      expect(mockLoaderService.changeLoaderState).toHaveBeenCalledWith(false)
      global.FileReader = OrigFileReader
    })

    it('should accept DOCX files', () => {
      const mockReader: any = { readAsDataURL: jest.fn(), onload: null }
      const OrigFileReader = global.FileReader
      global.FileReader = jest.fn(() => mockReader) as any
      component.onFileSelected([{
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }])
      expect(mockReader.readAsDataURL).toHaveBeenCalled()
      global.FileReader = OrigFileReader
    })
  })

  describe('addNewFileToList', () => {
    it('should prepend a new material to the list', () => {
      component.materialsList = [{ title: 'existing', content: 'url', isNew: false }]
      component.addNewFileToList('https://example.com/file.pdf')
      expect(component.materialsList[0].content).toBe('https://example.com/file.pdf')
      expect(component.materialsList[0].isNew).toBe(true)
      expect(component.materialsList[0].title).toBe('')
      expect(component.currentIndex).toBe(0)
      expect(component.currentMaterialSaved).toBe(false)
    })
  })

  describe('updateMaterial', () => {
    it('should update material at given index and reset currentIndex', () => {
      component.materialsList = [
        { title: '', content: '', isNew: true },
        { title: 'other', content: 'other', isNew: false },
      ]
      component.currentIndex = 0
      const updated = { title: 'New Title', content: 'url', isNew: false }
      component.updateMaterial(updated, 0)
      expect(component.materialsList[0]).toEqual(updated)
      expect(component.currentIndex).toBe(-1)
      expect(component.currentMaterialSaved).toBe(true)
    })
  })

  describe('closeOrOpenMaterial', () => {
    it('should set currentIndex when opening and currentMaterialSaved is true', () => {
      component.currentMaterialSaved = true
      component.closeOrOpenMaterial(true, 2)
      expect(component.currentIndex).toBe(2)
    })

    it('should show snackbar when opening but currentMaterialSaved is false', () => {
      component.currentMaterialSaved = false
      component.closeOrOpenMaterial(true, 2)
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('please save the details before')
      expect(component.currentIndex).not.toBe(2)
    })

    it('should reset currentIndex to -1 when closing', () => {
      component.currentIndex = 3
      component.closeOrOpenMaterial(false, 3)
      expect(component.currentIndex).toBe(-1)
    })
  })

  describe('currentMaterialSaveUpdate', () => {
    it('should update currentMaterialSaved to true', () => {
      component.currentMaterialSaved = false
      component.currentMaterialSaveUpdate(true)
      expect(component.currentMaterialSaved).toBe(true)
    })

    it('should update currentMaterialSaved to false', () => {
      component.currentMaterialSaved = true
      component.currentMaterialSaveUpdate(false)
      expect(component.currentMaterialSaved).toBe(false)
    })
  })

  describe('deleteMaterialFromList', () => {
    it('should remove material from list when event is true', () => {
      component.materialsList = [
        { title: 'a', content: 'a', isNew: false },
        { title: 'b', content: 'b', isNew: false },
      ]
      component.deleteMaterialFromList(true, 0)
      expect(component.materialsList).toHaveLength(1)
      expect(component.materialsList[0].title).toBe('b')
    })

    it('should not remove when event is false', () => {
      component.materialsList = [
        { title: 'a', content: 'a', isNew: false },
      ]
      component.deleteMaterialFromList(false, 0)
      expect(component.materialsList).toHaveLength(1)
    })

    it('should set currentMaterialSaved to true when deleting index 0', () => {
      component.materialsList = [{ title: 'a', content: 'a', isNew: true }]
      component.currentMaterialSaved = false
      component.deleteMaterialFromList(true, 0)
      expect(component.currentMaterialSaved).toBe(true)
    })
  })

})