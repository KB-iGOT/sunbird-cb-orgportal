import { KnowledgeArtifactDetailsComponent } from './knowledge-artifact-details.component'
import { ActivatedRoute, Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService } from '@ws-widget/utils'
import { WidgetContentService } from '@ws-widget/collection'
import { EditorService } from '../../../../../../../author/src/lib/routing/modules/editor/services/editor.service'
import { AppTocService } from '../../services/app-toc.service'
import { of, throwError } from 'rxjs'

describe('KnowledgeArtifactDetailsComponent', () => {
    let component: KnowledgeArtifactDetailsComponent
    let mockActivatedRoute: Partial<ActivatedRoute>
    let mockTocService: jest.Mocked<AppTocService>
    let mockConfigService: jest.Mocked<ConfigurationsService>
    let mockDomSanitizer: jest.Mocked<DomSanitizer>
    let mockContentService: jest.Mocked<WidgetContentService>
    let mockEditorService: jest.Mocked<EditorService>
    let mockRouter: jest.Mocked<Router>

    beforeEach(() => {
        // Setup mock services
        mockTocService = {
            initData: jest.fn(),
            fetchContentWhatsNext: jest.fn(),
            getTocStructure: jest.fn(),
            subtitleOnBanners: true,
            showDescription: true,
        } as any

        mockConfigService = {
            restrictedFeatures: new Set(['downloadRequest']),
            pageNavBar: {},
            userProfile: {
                userId: 'test-user'
            },
        } as any

        mockDomSanitizer = {
            bypassSecurityTrustHtml: jest.fn(),
        } as any

        mockContentService = {
            setS3Cookie: jest.fn(),
        } as any

        mockEditorService = {
            deleteContent: jest.fn(),
        } as any

        mockRouter = {
            navigate: jest.fn(),
        } as any

        mockActivatedRoute = {
            data: of({
                content: {
                    identifier: 'test-content',
                    name: 'Test Content',
                    status: 'Live',
                    primaryCategory: 'Course',
                    artifactUrl: 'test-url',
                }
            }),
        }

        component = new KnowledgeArtifactDetailsComponent(
            mockActivatedRoute as ActivatedRoute,
            mockTocService as AppTocService,
            mockConfigService as ConfigurationsService,
            mockDomSanitizer as DomSanitizer,
            mockContentService as WidgetContentService,
            mockEditorService as EditorService,
            mockRouter as Router,
        )
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            mockTocService.fetchContentWhatsNext.mockReturnValue(of([]))
            mockDomSanitizer.bypassSecurityTrustHtml.mockReturnValue('sanitized-html' as any)
        })

        it('should initialize component data and fetch related resources', () => {
            component.ngOnInit()

            expect(mockTocService.initData).toHaveBeenCalled()
            expect(component.fetchingRelatedResources).toBeTruthy()
        })

        it('should handle error when fetching related resources', () => {
            mockTocService.fetchContentWhatsNext.mockReturnValue(throwError('error'))

            component.ngOnInit()

            expect(component.fetchingRelatedResources).toBeTruthy()
        })

        it('should set download flags based on restricted features', () => {
            component.ngOnInit()

            expect(component.isDownloadableDesktop).toBeTruthy()
            expect(component.isDownloadableMobile).toBeFalsy()
        })
    })

    describe('resetAndFetchTocStructure', () => {
        it('should initialize toc structure with correct values', () => {
            const mockContent = {
                identifier: 'test-content',
                primaryCategory: 'Course',
            }

            component.content = mockContent as any
            mockTocService.getTocStructure.mockReturnValue({
                assessment: 1,
                course: -1,
                video: 2,
            } as any)

            component.resetAndFetchTocStructure()

            expect(component.hasTocStructure).toBeTruthy()
            expect(component.tocStructure?.course).toBe(-1)
            expect(mockTocService.getTocStructure).toHaveBeenCalled()
        })
    })

    describe('deleteContent', () => {
        it('should successfully delete content and navigate', () => {
            mockEditorService.deleteContent.mockReturnValue(of(null))
            component.content = { identifier: 'test-id' } as any

            component.deleteContent()

            expect(mockEditorService.deleteContent).toHaveBeenCalledWith('test-id')
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/author/cbp/me'])
            expect(component.deletingContent).toBeFalsy()
        })

        it('should handle deletion error', () => {
            mockEditorService.deleteContent.mockReturnValue(throwError('error'))
            component.content = { identifier: 'test-id' } as any

            component.deleteContent()

            expect(component.deletingContent).toBeFalsy()
        })
    })

    describe('computed properties', () => {
        it('should correctly determine if image is greyed', () => {
            component.content = { status: 'Deleted' } as any
            expect(component.isGreyedImage).toBeTruthy()

            component.content = { status: 'Live' } as any
            expect(component.isGreyedImage).toBeFalsy()
        })

        it('should correctly determine if content is live or marked for deletion', () => {
            component.content = { status: 'Live' } as any
            expect(component.isLiveOrMarkForDeletion).toBeTruthy()

            component.content = { status: 'Draft' } as any
            expect(component.isLiveOrMarkForDeletion).toBeFalsy()
        })

        it('should correctly determine if content is downloadable', () => {
            component.content = { downloadUrl: 'test-url' } as any
            expect(component.isDownloadable).toBeTruthy()

            component.content = { downloadUrl: '' } as any
            expect(component.isDownloadable).toBeFalsy()
        })
    })

    describe('download', () => {
        it('should create and trigger download link', () => {
            const mockContent = {
                name: 'test-content',
                downloadUrl: 'test-url',
            }
            component.content = mockContent as any
            component.forPreview = false

            const mockLink = {
                click: jest.fn(),
            }
            jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
            jest.spyOn(document.body, 'appendChild').mockImplementation()
            jest.spyOn(document.body, 'removeChild').mockImplementation()

            component.download()

            expect(document.createElement).toHaveBeenCalledWith('a')
            expect(mockLink.click).toHaveBeenCalled()
        })
    })

    describe('setS3Cookie', () => {
        it('should call content service to set cookie', async () => {
            mockContentService.setS3Cookie.mockReturnValue(of(null))

            await component['setS3Cookie']('test-id')

            expect(mockContentService.setS3Cookie).toHaveBeenCalledWith('test-id')
        })

        it('should handle error when setting cookie', async () => {
            mockContentService.setS3Cookie.mockReturnValue(throwError('error'))

            await component['setS3Cookie']('test-id')

            expect(mockContentService.setS3Cookie).toHaveBeenCalledWith('test-id')
        })
    })

    describe('checkIfEditEnabled', () => {
        it('should set isAuthor to true for content creator', () => {
            component.content = {
                creatorContacts: [{ id: 'test-user' }],
            } as any

            component['checkIfEditEnabled']()

            expect(component.isAuthor).toBeTruthy()
        })

        it('should set isAuthor to false for non-creator', () => {
            component.content = {
                creatorContacts: [{ id: 'other-user' }],
            } as any

            component['checkIfEditEnabled']()

            expect(component.isAuthor).toBeTruthy()
        })
    })
})
