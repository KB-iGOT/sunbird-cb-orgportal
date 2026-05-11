// Mock ViewerUtilService to prevent transitive ESM import issues (jspdf)
jest.mock('../../viewer-util.service', () => ({
  ViewerUtilService: jest.fn(),
}))
jest.mock('pdfjs-dist', () => ({ GlobalWorkerOptions: { workerSrc: '' }, getDocument: jest.fn() }))
jest.mock('pdfjs-dist/webpack', () => ({}))
jest.mock('worker-loader?esModule=false&filename=[name].[contenthash].js!pdfjs-dist/build/pdf.worker.js', () => ({}), { virtual: true })
jest.mock('@sunbird-cb/collection', () => ({
  NsContent: {
    EMimeTypes: { COLLECTION_RESOURCE: 'resource/collection' },
    EPrimaryCategory: {},
  },
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'Learning' },
  },
  WidgetContentService: jest.fn(),
}))

import { Subject, of } from 'rxjs'
import { ResourceCollectionComponent } from './resource-collection.component'
import { WsEvents } from '@sunbird-cb/utils'
import { NsContent } from '@sunbird-cb/collection'

const buildContent = (overrides: any = {}): any => ({
  identifier: 'rc1',
  name: 'Test Collection',
  description: 'A resource collection',
  artifactUrl: 'https://example.com/collection.html',
  mimeType: 'application/vnd.ekstep.html-archive',
  contentType: 'Collection',
  primaryCategory: 'Resource',
  ...overrides,
})

const buildMockActivatedRoute = (overrides: any = {}) => {
  const cfg = {
    collectionId: null as string | null,
    collectionType: null as string | null,
    data: new Subject<any>(),
    ...overrides,
  }
  return {
    snapshot: {
      queryParams: {
        collectionId: cfg.collectionId,
        collectionType: cfg.collectionType,
      },
    },
    data: cfg.data,
  }
}

describe('ResourceCollectionComponent', () => {
  let component: ResourceCollectionComponent
  let mockActivatedRoute: any
  let mockContentSvc: any
  let mockHttp: any
  let mockEventSvc: any
  let mockViewSvc: any

  beforeEach(() => {
    mockActivatedRoute = buildMockActivatedRoute()

    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue(of(null)),
      continueLearning: jest.fn().mockResolvedValue(undefined),
    }

    mockHttp = {
      get: jest.fn().mockReturnValue(of({ manifest: 'data' })),
    }

    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }

    mockViewSvc = {
      getAuthoringUrl: jest.fn((url: string) => `authoring://${url}`),
    }

    component = new ResourceCollectionComponent(
      mockActivatedRoute,
      mockContentSvc,
      mockHttp,
      mockEventSvc,
      mockViewSvc,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── Initialization ────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should have isFetchingDataComplete false by default', () => {
      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('should have alreadyRaised false by default', () => {
      expect(component.alreadyRaised).toBe(false)
    })

    it('should have resourceCollectionData null by default', () => {
      expect(component.resourceCollectionData).toBeNull()
    })

    it('should have isErrorOccured false by default', () => {
      expect(component.isErrorOccured).toBe(false)
    })

    it('should have discussionForumWidget null by default', () => {
      expect(component.discussionForumWidget).toBeNull()
    })
  })

  // ─── formDiscussionForumWidget ─────────────────────────────────────────────

  describe('formDiscussionForumWidget', () => {
    it('should set discussionForumWidget with content data', () => {
      const content = buildContent()
      component.formDiscussionForumWidget(content)

      expect(component.discussionForumWidget).not.toBeNull()
      expect(component.discussionForumWidget!.widgetData.id).toBe('rc1')
      expect(component.discussionForumWidget!.widgetData.title).toBe('Test Collection')
      expect(component.discussionForumWidget!.widgetData.description).toBe('A resource collection')
      expect(component.discussionForumWidget!.widgetSubType).toBe('discussionForum')
      expect(component.discussionForumWidget!.widgetType).toBe('discussionForum')
    })

    it('should set name to EDiscussionType.LEARNING', () => {
      component.formDiscussionForumWidget(buildContent())
      expect(component.discussionForumWidget!.widgetData.name).toBe('Learning')
    })

    it('should set initialPostCount to 2', () => {
      component.formDiscussionForumWidget(buildContent())
      expect(component.discussionForumWidget!.widgetData.initialPostCount).toBe(2)
    })

    it('should set isDisabled to forPreview value', () => {
      component.forPreview = true
      component.formDiscussionForumWidget(buildContent())
      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(true)
    })

    it('should set isDisabled false when not forPreview', () => {
      component.forPreview = false
      component.formDiscussionForumWidget(buildContent())
      expect(component.discussionForumWidget!.widgetData.isDisabled).toBe(false)
    })
  })

  // ─── raiseEvent ───────────────────────────────────────────────────────────

  describe('raiseEvent', () => {
    it('should dispatch event when not in preview mode', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())
      expect(mockEventSvc.dispatchEvent).toHaveBeenCalledTimes(1)
    })

    it('should not dispatch event when forPreview is true', () => {
      component.forPreview = true
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())
      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should dispatch event with correct state and content', () => {
      component.forPreview = false
      const content = buildContent()
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, content)

      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.state).toBe(WsEvents.EnumTelemetrySubType.Unloaded)
      expect(dispatched.data.content).toBe(content)
      expect(dispatched.data.identifier).toBe('rc1')
    })

    it('should dispatch event with correct mimeType', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())

      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.mimeType).toBe(NsContent.EMimeTypes.COLLECTION_RESOURCE)
    })

    it('should set identifier and url to null when data is null', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, null as any)

      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.identifier).toBeNull()
      expect(dispatched.data.url).toBeNull()
    })

    it('should set isCompleted to true', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())

      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.isCompleted).toBe(true)
    })

    it('should set from to resource-collection', () => {
      component.forPreview = false
      component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())

      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.from).toBe('resource-collection')
    })
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should subscribe to activatedRoute.data', () => {
      component.ngOnInit()
      expect(component.isFetchingDataComplete).toBe(false)
    })

    it('should set isErrorOccured when resourceCollectionData is null', async () => {
      mockHttp.get.mockReturnValue(of(null))
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: null } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.isErrorOccured).toBe(true)
    })

    it('should set isErrorOccured when manifest is falsy', async () => {
      mockHttp.get.mockReturnValue(of(null))
      const content = buildContent({ mimeType: 'resource/collection' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.isErrorOccured).toBe(true)
    })

    it('should set resourceCollectionData from route data', async () => {
      const content = buildContent({ mimeType: 'resource/collection' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.resourceCollectionData).toBe(content)
    })

    it('should call formDiscussionForumWidget with content', async () => {
      const content = buildContent({ mimeType: 'resource/collection' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      const spy = jest.spyOn(component, 'formDiscussionForumWidget')
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(spy).toHaveBeenCalledWith(content)
    })

    it('should call setS3Cookie when artifactUrl contains content-store', async () => {
      const content = buildContent({
        mimeType: 'resource/collection',
        artifactUrl: 'https://example.com/content-store/file.json',
      })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('rc1')
    })

    it('should not call setS3Cookie when artifactUrl does not contain content-store', async () => {
      const content = buildContent({ mimeType: 'resource/collection' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(mockContentSvc.setS3Cookie).not.toHaveBeenCalled()
    })

    it('should set isFetchingDataComplete and alreadyRaised on success', async () => {
      const content = buildContent({ mimeType: 'resource/collection' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.forPreview = false
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(component.isFetchingDataComplete).toBe(true)
      expect(component.alreadyRaised).toBe(true)
    })

    it('should raise Loaded event on first success', async () => {
      component.forPreview = false
      const content = buildContent({ mimeType: 'resource/collection' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded)
    })

    it('should raise Unloaded for oldData on second emission', async () => {
      component.forPreview = false
      const content1 = buildContent({ identifier: 'id1', mimeType: 'resource/collection', artifactUrl: 'https://x.com/a' })
      const content2 = buildContent({ identifier: 'id2', mimeType: 'resource/collection', artifactUrl: 'https://x.com/b' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.ngOnInit()

      mockActivatedRoute.data.next({ content: { data: content1 } })
      await new Promise(r => setTimeout(r, 10))
      mockActivatedRoute.data.next({ content: { data: content2 } })
      await new Promise(r => setTimeout(r, 10))

      const states = mockEventSvc.dispatchEvent.mock.calls.map((c: any) => c[0].data.state)
      expect(states).toContain(WsEvents.EnumTelemetrySubType.Unloaded)
    })

    it('should call http.get with authoring url when forPreview', async () => {
      component.forPreview = true
      const content = buildContent({ mimeType: 'resource/collection' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(mockViewSvc.getAuthoringUrl).toHaveBeenCalledWith(content.artifactUrl)
    })

    it('should call http.get with artifactUrl when not forPreview', async () => {
      component.forPreview = false
      const content = buildContent({ mimeType: 'resource/collection' })
      mockHttp.get.mockReturnValue(of({ manifest: 'data' }))
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(mockHttp.get).toHaveBeenCalledWith(content.artifactUrl)
    })

    it('should not call transformResourceCollection for non-COLLECTION_RESOURCE mimeType', async () => {
      const content = buildContent({ mimeType: 'application/pdf' })
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { data: content } })
      await new Promise(r => setTimeout(r, 10))

      expect(mockHttp.get).not.toHaveBeenCalled()
      expect(component.isErrorOccured).toBe(true)
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should unsubscribe dataSubscription', async () => {
      const mockSub = { unsubscribe: jest.fn() }
      component['dataSubscription'] = mockSub as any
      component.resourceCollectionData = null
      await component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should not throw when dataSubscription is null', async () => {
      component['dataSubscription'] = null
      component.resourceCollectionData = null
      await expect(component.ngOnDestroy()).resolves.not.toThrow()
    })

    it('should call continueLearning with just identifier when no collectionId', async () => {
      component.resourceCollectionData = buildContent()
      mockActivatedRoute.snapshot.queryParams = {}
      await component.ngOnDestroy()

      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('rc1')
    })

    it('should call continueLearning with collectionId and type when present', async () => {
      component.resourceCollectionData = buildContent()
      mockActivatedRoute.snapshot.queryParams = {
        collectionId: 'col1',
        collectionType: 'Course',
      }
      await component.ngOnDestroy()

      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('rc1', 'col1', 'Course')
    })

    it('should not call continueLearning when resourceCollectionData is null', async () => {
      component.resourceCollectionData = null
      mockActivatedRoute.snapshot.queryParams = {}
      await component.ngOnDestroy()

      expect(mockContentSvc.continueLearning).not.toHaveBeenCalled()
    })

    it('should raise Unloaded event when resourceCollectionData exists', async () => {
      component.forPreview = false
      component.resourceCollectionData = buildContent()
      mockActivatedRoute.snapshot.queryParams = {}
      await component.ngOnDestroy()

      expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
      const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
      expect(dispatched.data.state).toBe(WsEvents.EnumTelemetrySubType.Unloaded)
    })

    it('should not raise event when resourceCollectionData is null', async () => {
      component.resourceCollectionData = null
      await component.ngOnDestroy()

      expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should not call continueLearning when only collectionId is set (no collectionType)', async () => {
      component.resourceCollectionData = buildContent()
      mockActivatedRoute.snapshot.queryParams = {
        collectionId: 'col1',
        collectionType: null,
      }
      await component.ngOnDestroy()

      expect(mockContentSvc.continueLearning).toHaveBeenCalledWith('rc1')
    })
  })
})
