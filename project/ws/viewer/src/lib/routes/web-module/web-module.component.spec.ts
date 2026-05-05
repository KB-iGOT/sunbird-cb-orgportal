
// Mock packages with ESM/pdfjs transitive dependencies
jest.mock('../../viewer-util.service', () => ({
    ViewerUtilService: jest.fn(),
}))
jest.mock('@sunbird-cb/collection', () => ({
    NsContent: {
        EMimeTypes: {
            WEB_MODULE: 'application/web-module',
            WEB_MODULE_EXERCISE: 'application/web-module-exercise',
        },
    },
    NsDiscussionForum: {
        EDiscussionType: { LEARNING: 'Learning' },
    },
    WidgetContentService: jest.fn(),
}))

import { Subject, of } from 'rxjs'
import { WebModuleComponent } from './web-module.component'
import { WsEvents } from '@sunbird-cb/utils'
import { NsContent } from '@sunbird-cb/collection'

const buildContent = (overrides: any = {}): any => ({
    identifier: 'wm1',
    name: 'Test WebModule',
    description: 'A web module',
    artifactUrl: 'https://example.com/module/index.json',
    mimeType: 'application/web-module',
    contentType: 'WebModule',
    primaryCategory: 'Learning Resource',
    resumePage: 1,
    ...overrides,
})

describe('WebModuleComponent', () => {
    let component: WebModuleComponent
    let mockActivatedRoute: any
    let mockContentSvc: any
    let mockHttp: any
    let mockEventSvc: any
    let mockViewSvc: any

    beforeEach(() => {
        mockActivatedRoute = {
            snapshot: {
                paramMap: {
                    get: jest.fn().mockReturnValue('wm1'),
                },
                queryParams: {
                    collectionId: null as string | null,
                },
            },
        }

        mockContentSvc = {
            fetchContentHistory: jest.fn().mockReturnValue(of(null)),
        }

        mockHttp = {
            get: jest.fn().mockReturnValue(of({ manifest: 'data' })),
        }

        mockEventSvc = {
            dispatchEvent: jest.fn(),
        }

        mockViewSvc = {
            getContent: jest.fn().mockReturnValue(new Subject<any>()),
            getAuthoringUrl: jest.fn((url: string) => `authoring://${url}`),
        }

        component = new WebModuleComponent(
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

        it('should have webmoduleData null by default', () => {
            expect(component.webmoduleData).toBeNull()
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
            expect(component.discussionForumWidget!.widgetData.id).toBe('wm1')
            expect(component.discussionForumWidget!.widgetData.title).toBe('Test WebModule')
            expect(component.discussionForumWidget!.widgetData.description).toBe('A web module')
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

        it('should set isDisabled to forPreview value when true', () => {
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
            expect(dispatched.data.identifier).toBe('wm1')
        })

        it('should dispatch event with correct mimeType', () => {
            component.forPreview = false
            component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())

            const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
            expect(dispatched.data.mimeType).toBe(NsContent.EMimeTypes.WEB_MODULE)
        })

        it('should set identifier and url to null when data is null', () => {
            component.forPreview = false
            component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, null as any)

            const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
            expect(dispatched.data.identifier).toBeNull()
            expect(dispatched.data.url).toBeNull()
        })

        it('should set from to web-module', () => {
            component.forPreview = false
            component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())

            const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
            expect(dispatched.from).toBe('web-module')
        })

        it('should set eventType to Telemetry', () => {
            component.forPreview = false
            component.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, buildContent())

            const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
            expect(dispatched.eventType).toBe(WsEvents.WsEventType.Telemetry)
        })
    })

    // ─── fetchContinueLearning ────────────────────────────────────────────────

    describe('fetchContinueLearning', () => {
        it('should resolve true when fetchContentHistory returns null', async () => {
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            const result = await component.fetchContinueLearning('col1', 'wm1')
            expect(result).toBe(true)
        })

        it('should resolve true and call fetchContentHistory with collectionId', async () => {
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            await component.fetchContinueLearning('col1', 'wm1')
            expect(mockContentSvc.fetchContentHistory).toHaveBeenCalledWith('col1')
        })

        it('should set resumePage when data matches webModuleId and has progress', async () => {
            component.webmoduleData = buildContent()
            mockContentSvc.fetchContentHistory.mockReturnValue(of({
                identifier: 'wm1',
                continueData: { progress: '5' },
            }))
            await component.fetchContinueLearning('col1', 'wm1')
            expect(component.webmoduleData.resumePage).toBe(5)
        })

        it('should not update resumePage when identifier does not match', async () => {
            component.webmoduleData = buildContent({ resumePage: 1 })
            mockContentSvc.fetchContentHistory.mockReturnValue(of({
                identifier: 'other',
                continueData: { progress: '7' },
            }))
            await component.fetchContinueLearning('col1', 'wm1')
            expect(component.webmoduleData.resumePage).toBe(1)
        })

        it('should not update resumePage when continueData is missing', async () => {
            component.webmoduleData = buildContent({ resumePage: 1 })
            mockContentSvc.fetchContentHistory.mockReturnValue(of({
                identifier: 'wm1',
                continueData: null,
            }))
            await component.fetchContinueLearning('col1', 'wm1')
            expect(component.webmoduleData.resumePage).toBe(1)
        })

        it('should resolve true on fetchContentHistory error', async () => {
            mockContentSvc.fetchContentHistory.mockReturnValue({
                subscribe: (_next: any, error: any) => error(new Error('fail')),
            })
            const result = await component.fetchContinueLearning('col1', 'wm1')
            expect(result).toBe(true)
        })
    })

    // ─── ngOnInit ─────────────────────────────────────────────────────────────

    describe('ngOnInit', () => {
        it('should call viewSvc.getContent with resourceId from paramMap', () => {
            mockViewSvc.getContent.mockReturnValue(new Subject<any>())
            component.ngOnInit()
            expect(mockViewSvc.getContent).toHaveBeenCalledWith('wm1')
        })

        it('should set webmoduleData from getContent result', async () => {
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(component.webmoduleData).toBe(content)
        })

        it('should call formDiscussionForumWidget with content', async () => {
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            const spy = jest.spyOn(component, 'formDiscussionForumWidget')
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(spy).toHaveBeenCalledWith(content)
        })

        it('should set isErrorOccured when webmoduleData is null', async () => {
            mockViewSvc.getContent.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(component.isErrorOccured).toBe(true)
        })

        it('should set isErrorOccured when manifest is falsy', async () => {
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockHttp.get.mockReturnValue(of(null))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(component.isErrorOccured).toBe(true)
        })

        it('should set isFetchingDataComplete and alreadyRaised on success', async () => {
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.forPreview = false
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(component.isFetchingDataComplete).toBe(true)
            expect(component.alreadyRaised).toBe(true)
        })

        it('should raise Loaded event on first success', async () => {
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.forPreview = false
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
            const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
            expect(dispatched.data.state).toBe(WsEvents.EnumTelemetrySubType.Loaded)
        })

        it('should raise Unloaded for oldData on second emission', async () => {
            const subject = new Subject<any>()
            mockViewSvc.getContent.mockReturnValue(subject)
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.forPreview = false
            component.ngOnInit()

            subject.next(buildContent({ identifier: 'id1' }))
            await new Promise(r => setTimeout(r, 20))
            subject.next(buildContent({ identifier: 'id2' }))
            await new Promise(r => setTimeout(r, 20))

            const states = mockEventSvc.dispatchEvent.mock.calls.map((c: any) => c[0].data.state)
            expect(states).toContain(WsEvents.EnumTelemetrySubType.Unloaded)
        })

        it('should set resumePage to 1 after fetchContinueLearning', async () => {
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(component.webmoduleData.resumePage).toBe(1)
        })

        it('should use collectionId for fetchContinueLearning when present in queryParams', async () => {
            mockActivatedRoute.snapshot.queryParams = { collectionId: 'col1' }
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(mockContentSvc.fetchContentHistory).toHaveBeenCalledWith('col1')
        })

        it('should use identifier for fetchContinueLearning when no collectionId', async () => {
            mockActivatedRoute.snapshot.queryParams = {}
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(mockContentSvc.fetchContentHistory).toHaveBeenCalledWith('wm1')
        })

        it('should call http.get with authoring url when forPreview', async () => {
            component.forPreview = true
            const content = buildContent()
            const originalArtifactUrl = content.artifactUrl
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(mockViewSvc.getAuthoringUrl).toHaveBeenCalledWith(originalArtifactUrl)
        })

        it('should call http.get with artifactUrl when not forPreview', async () => {
            component.forPreview = false
            const content = buildContent()
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(mockHttp.get).toHaveBeenCalledWith(content.artifactUrl)
        })

        it('should set isErrorOccured for non-WEB_MODULE mimeType', async () => {
            const content = buildContent({ mimeType: 'application/pdf' })
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(mockHttp.get).not.toHaveBeenCalled()
            expect(component.isErrorOccured).toBe(true)
        })

        it('should handle WEB_MODULE_EXERCISE mimeType', async () => {
            const content = buildContent({ mimeType: 'application/web-module-exercise' })
            mockViewSvc.getContent.mockReturnValue(of(content))
            mockContentSvc.fetchContentHistory.mockReturnValue(of(null))
            component.ngOnInit()
            await new Promise(r => setTimeout(r, 20))
            expect(mockHttp.get).toHaveBeenCalled()
        })
    })

    // ─── ngOnDestroy ──────────────────────────────────────────────────────────

    describe('ngOnDestroy', () => {
        it('should unsubscribe dataSubscription if set', () => {
            const mockSub = { unsubscribe: jest.fn() }
            component['dataSubscription'] = mockSub as any
            component.webmoduleData = null
            component.ngOnDestroy()
            expect(mockSub.unsubscribe).toHaveBeenCalled()
        })

        it('should unsubscribe telemetryIntervalSubscription if set', () => {
            const mockSub = { unsubscribe: jest.fn() }
            component['telemetryIntervalSubscription'] = mockSub as any
            component.webmoduleData = null
            component.ngOnDestroy()
            expect(mockSub.unsubscribe).toHaveBeenCalled()
        })

        it('should not throw when all subscriptions are null', () => {
            component['dataSubscription'] = null
            component['telemetryIntervalSubscription'] = null
            component.webmoduleData = null
            expect(() => component.ngOnDestroy()).not.toThrow()
        })

        it('should raise Unloaded event when webmoduleData exists', () => {
            component.forPreview = false
            component.webmoduleData = buildContent()
            component.ngOnDestroy()
            expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
            const dispatched = mockEventSvc.dispatchEvent.mock.calls[0][0]
            expect(dispatched.data.state).toBe(WsEvents.EnumTelemetrySubType.Unloaded)
        })

        it('should not raise event when webmoduleData is null', () => {
            component.webmoduleData = null
            component.ngOnDestroy()
            expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
        })

        it('should not raise event when forPreview is true', () => {
            component.forPreview = true
            component.webmoduleData = buildContent()
            component.ngOnDestroy()
            expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
        })
    })
})