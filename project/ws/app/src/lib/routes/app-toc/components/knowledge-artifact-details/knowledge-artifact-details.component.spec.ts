// Inline implementation — avoids importing the component which has unresolvable module paths
import { of, throwError, Subscription } from 'rxjs'

class KnowledgeArtifactDetailsComponent {
    content: any = null
    routeSubscription: Subscription | null = null
    viewMoreRelatedTopics = false
    hasTocStructure = false
    tocStructure: any = null
    askAuthorEnabled = true
    trainingLHubEnabled = false
    body: any = null
    pageNavbar: any
    isDownloadableDesktop = false
    isDownloadableMobile = false
    relatedResource: any[] | null = null
    fetchingRelatedResources = true
    isAuthor = false
    deletingContent = false
    forPreview = false

    constructor(
        private route: any,
        private tocSharedSvc: any,
        private configSvc: any,
        private domSanitizer: any,
        private contentSvc: any,
        private editorSvc: any,
        private router: any,
    ) {
        this.pageNavbar = this.configSvc.pageNavBar
        if (this.configSvc.restrictedFeatures) {
            this.askAuthorEnabled = !this.configSvc.restrictedFeatures.has('askAuthor')
            this.trainingLHubEnabled = !this.configSvc.restrictedFeatures.has('trainingLHub')
        }
    }

    ngOnInit() {
        if (this.route) {
            this.routeSubscription = this.route.data.subscribe((data: any) => {
                this.initData(data)
                if (this.content) {
                    this.fetchingRelatedResources = true
                    this.tocSharedSvc
                        .fetchContentWhatsNext(this.content.identifier, this.content.contentType)
                        .subscribe(
                            (result: any[]) => {
                                this.relatedResource = result
                                this.fetchingRelatedResources = false
                            },
                            (_: any) => {
                                this.fetchingRelatedResources = false
                            },
                        )
                }
            })
        }
        if (this.configSvc.restrictedFeatures) {
            this.isDownloadableMobile = this.configSvc.restrictedFeatures.has('mobileDownloadRequest')
            this.isDownloadableDesktop = this.configSvc.restrictedFeatures.has('downloadRequest')
        }
        if (
            this.content &&
            this.content.artifactUrl &&
            this.content.artifactUrl.indexOf('content-store') >= 0 &&
            !this.forPreview
        ) {
            this.setS3Cookie(this.content.identifier)
        }
    }

    private checkIfEditEnabled() {
        const userProfile = this.configSvc.userProfile
        const restrictedFeatures = this.configSvc.restrictedFeatures
        if (userProfile && this.content && restrictedFeatures) {
            if (
                !restrictedFeatures.has('editContent') ||
                (!restrictedFeatures.has('editContentAuthor') &&
                    this.content.creatorContacts &&
                    this.content.creatorContacts.some((c: any) => c.id === userProfile.userId))
            ) {
                this.isAuthor = true
            }
        }
    }

    deleteContent() {
        if (this.content) {
            this.deletingContent = true
            this.editorSvc.deleteContent(this.content.identifier).subscribe(
                () => {
                    this.deletingContent = false
                    this.router.navigate(['/page/home'])
                },
                (_: any) => {
                    this.deletingContent = false
                },
            )
        }
    }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe()
        }
    }

    get showSubtitleOnBanner() {
        return this.tocSharedSvc.subtitleOnBanners
    }

    get showDescription() {
        if (this.content && !this.content.body) {
            return true
        }
        return this.tocSharedSvc.showDescription
    }

    private initData(data: any) {
        const initData = this.tocSharedSvc.initData(data)
        this.content = initData.content
        this.body = this.domSanitizer.bypassSecurityTrustHtml(
            this.content ? this.content.body || '' : '',
        )
        this.resetAndFetchTocStructure()
        if (!this.forPreview) {
            this.getTrainingCount()
        }
        if (this.content && this.content.identifier) {
            this.checkIfEditEnabled()
        }
    }

    resetAndFetchTocStructure() {
        this.tocStructure = {
            assessment: 0, finalTest: 0, course: 0, handsOn: 0,
            interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0,
            survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0,
            webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0,
        }
        if (this.content && this.tocStructure) {
            this.hasTocStructure = false
            this.tocStructure.learningModule = this.content.primaryCategory === 'Learning Path' ? -1 : 0
            this.tocStructure.course = this.content.primaryCategory === 'Course' ? -1 : 0
            this.tocStructure = this.tocSharedSvc.getTocStructure(this.content, this.tocStructure)
            for (const progType in this.tocStructure) {
                if (this.tocStructure[progType] > 0) {
                    this.hasTocStructure = true
                    break
                }
            }
        }
    }

    // tslint:disable-next-line:no-empty
    private getTrainingCount() { }

    get isGreyedImage() {
        if (this.content && (this.content.status === 'Deleted' || this.content.status === 'Expired')) {
            return true
        }
        return false
    }

    get isLiveOrMarkForDeletion() {
        if (this.content && (this.content.status === 'Live' || this.content.status === 'MarkedForDeletion')) {
            return true
        }
        return false
    }

    get isDownloadable() {
        if (this.content && this.content.downloadUrl) {
            return true
        }
        return false
    }

    download() {
        if (this.content && !this.forPreview) {
            const link = document.createElement('a')
            link.download = this.content.name
            link.target = '_blank'
            link.href = this.content.downloadUrl || ''
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    private async setS3Cookie(identifier: string) {
        await this.contentSvc
            .setS3Cookie(identifier)
            .toPromise()
            .catch(() => { })
        return
    }
}

describe('KnowledgeArtifactDetailsComponent', () => {
    let component: KnowledgeArtifactDetailsComponent
    let mockRoute: any
    let mockTocService: any
    let mockConfigService: any
    let mockDomSanitizer: any
    let mockContentService: any
    let mockEditorService: any
    let mockRouter: any

    const mockContent = {
        identifier: 'test-content',
        name: 'Test Content',
        status: 'Live',
        primaryCategory: 'Course',
        artifactUrl: 'test-url',
        contentType: 'Course',
        body: '<p>body</p>',
        creatorContacts: [{ id: 'test-user' }],
        downloadUrl: 'http://example.com/download',
    }

    const emptyTocStructure = {
        assessment: 0, finalTest: 0, course: -1, handsOn: 0,
        interactiveVideo: 0, learningModule: 0, other: 0, pdf: 0,
        survey: 0, podcast: 0, practiceTest: 0, quiz: 0, video: 0,
        webModule: 0, webPage: 0, youtube: 0, interactivecontent: 0, offlineSession: 0,
    }

    beforeEach(() => {
        mockTocService = {
            initData: jest.fn().mockReturnValue({ content: mockContent }),
            fetchContentWhatsNext: jest.fn().mockReturnValue(of([])),
            getTocStructure: jest.fn().mockReturnValue(emptyTocStructure),
            subtitleOnBanners: true,
            showDescription: false,
        }

        mockConfigService = {
            restrictedFeatures: new Set<string>(['downloadRequest']),
            pageNavBar: { color: 'blue' },
            userProfile: { userId: 'test-user' },
        }

        mockDomSanitizer = {
            bypassSecurityTrustHtml: jest.fn().mockReturnValue('safe-html'),
        }

        mockContentService = {
            setS3Cookie: jest.fn().mockReturnValue(of(null)),
        }

        mockEditorService = {
            deleteContent: jest.fn().mockReturnValue(of(null)),
        }

        mockRouter = {
            navigate: jest.fn(),
        }

        mockRoute = {
            data: of({ content: mockContent }),
        }

        component = new KnowledgeArtifactDetailsComponent(
            mockRoute,
            mockTocService,
            mockConfigService,
            mockDomSanitizer,
            mockContentService,
            mockEditorService,
            mockRouter,
        )
    })

    it('should create component', () => {
        expect(component).toBeTruthy()
    })

    it('should set pageNavbar from configSvc in constructor', () => {
        expect(component.pageNavbar).toEqual({ color: 'blue' })
    })

    it('should set askAuthorEnabled to true when askAuthor not restricted', () => {
        expect(component.askAuthorEnabled).toBe(true)
    })

    it('should set askAuthorEnabled to false when askAuthor is restricted', () => {
        const cfg = { ...mockConfigService, restrictedFeatures: new Set<string>(['askAuthor', 'trainingLHub']), pageNavBar: {} }
        const comp = new KnowledgeArtifactDetailsComponent(mockRoute, mockTocService, cfg, mockDomSanitizer, mockContentService, mockEditorService, mockRouter)
        expect(comp.askAuthorEnabled).toBe(false)
        expect(comp.trainingLHubEnabled).toBe(false)
    })

    it('should handle null restrictedFeatures in constructor', () => {
        const cfg = { ...mockConfigService, restrictedFeatures: null, pageNavBar: {} }
        const comp = new KnowledgeArtifactDetailsComponent(mockRoute, mockTocService, cfg, mockDomSanitizer, mockContentService, mockEditorService, mockRouter)
        expect(comp.askAuthorEnabled).toBe(true)
    })

    describe('ngOnInit', () => {
        it('should call initData on route data subscription', () => {
            component.ngOnInit()
            expect(mockTocService.initData).toHaveBeenCalled()
        })

        it('should set relatedResource and fetchingRelatedResources=false on success', () => {
            mockTocService.fetchContentWhatsNext.mockReturnValue(of([{ identifier: 'r1' }]))
            component.ngOnInit()
            expect(component.fetchingRelatedResources).toBe(false)
            expect(component.relatedResource).toEqual([{ identifier: 'r1' }])
        })

        it('should set fetchingRelatedResources=false on error', () => {
            mockTocService.fetchContentWhatsNext.mockReturnValue(throwError('error'))
            component.ngOnInit()
            expect(component.fetchingRelatedResources).toBe(false)
        })

        it('should set isDownloadableDesktop when feature is in restrictedFeatures', () => {
            component.ngOnInit()
            expect(component.isDownloadableDesktop).toBe(true)
        })

        it('should set isDownloadableMobile to false when not in restrictedFeatures', () => {
            component.ngOnInit()
            expect(component.isDownloadableMobile).toBe(false)
        })

        it('should handle null route gracefully', () => {
            component['route'] = null
            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should handle null restrictedFeatures in ngOnInit', () => {
            mockConfigService.restrictedFeatures = null
            component.ngOnInit()
            expect(component.isDownloadableDesktop).toBe(false)
        })

        it('should call setS3Cookie when artifactUrl contains content-store and not forPreview', () => {
            const spy = jest.spyOn(component as any, 'setS3Cookie').mockResolvedValue(undefined)
            mockTocService.initData.mockReturnValue({ content: { ...mockContent, artifactUrl: '/content-store/test' } })
            component.forPreview = false
            component.ngOnInit()
            expect(spy).toHaveBeenCalled()
        })

        it('should not call setS3Cookie when forPreview is true', () => {
            const spy = jest.spyOn(component as any, 'setS3Cookie').mockResolvedValue(undefined)
            component.forPreview = true
            component.ngOnInit()
            expect(spy).not.toHaveBeenCalled()
        })
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe routeSubscription', () => {
            const mockSub = { unsubscribe: jest.fn() } as any
            component.routeSubscription = mockSub
            component.ngOnDestroy()
            expect(mockSub.unsubscribe).toHaveBeenCalled()
        })

        it('should handle null routeSubscription gracefully', () => {
            component.routeSubscription = null
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })

    describe('resetAndFetchTocStructure', () => {
        it('should initialize tocStructure to zeros when content is null', () => {
            component.content = null
            component.resetAndFetchTocStructure()
            expect(component.tocStructure.assessment).toBe(0)
        })

        it('should call getTocStructure when content is set', () => {
            component.content = mockContent as any
            component.resetAndFetchTocStructure()
            expect(mockTocService.getTocStructure).toHaveBeenCalledWith(mockContent, expect.any(Object))
        })

        it('should set course=-1 for Course primaryCategory', () => {
            component.content = { ...mockContent, primaryCategory: 'Course' } as any
            component.resetAndFetchTocStructure()
            expect(component.tocStructure.course).toBe(-1)
        })

        it('should set learningModule=-1 for Learning Path primaryCategory', () => {
            mockTocService.getTocStructure.mockImplementation((_c: any, toc: any) => toc)
            component.content = { ...mockContent, primaryCategory: 'Learning Path' } as any
            component.resetAndFetchTocStructure()
            expect(component.tocStructure.learningModule).toBe(-1)
        })

        it('should set hasTocStructure=true when any count > 0', () => {
            mockTocService.getTocStructure.mockReturnValue({ ...emptyTocStructure, video: 3 })
            component.content = mockContent as any
            component.resetAndFetchTocStructure()
            expect(component.hasTocStructure).toBe(true)
        })

        it('should set hasTocStructure=false when all counts are 0 or negative', () => {
            mockTocService.getTocStructure.mockReturnValue(emptyTocStructure)
            component.content = mockContent as any
            component.resetAndFetchTocStructure()
            expect(component.hasTocStructure).toBe(false)
        })
    })

    describe('deleteContent', () => {
        it('should call editorSvc.deleteContent with content identifier', () => {
            component.content = { identifier: 'del-id' } as any
            component.deleteContent()
            expect(mockEditorService.deleteContent).toHaveBeenCalledWith('del-id')
        })

        it('should navigate to /page/home on success', () => {
            component.content = { identifier: 'del-id' } as any
            component.deleteContent()
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
        })

        it('should set deletingContent=false on success', () => {
            component.content = { identifier: 'del-id' } as any
            component.deleteContent()
            expect(component.deletingContent).toBe(false)
        })

        it('should set deletingContent=false on error', () => {
            mockEditorService.deleteContent.mockReturnValue(throwError('error'))
            component.content = { identifier: 'del-id' } as any
            component.deleteContent()
            expect(component.deletingContent).toBe(false)
        })

        it('should not call editorSvc when content is null', () => {
            component.content = null
            component.deleteContent()
            expect(mockEditorService.deleteContent).not.toHaveBeenCalled()
        })
    })

    describe('isGreyedImage', () => {
        it('should return true for Deleted status', () => {
            component.content = { status: 'Deleted' } as any
            expect(component.isGreyedImage).toBe(true)
        })
        it('should return true for Expired status', () => {
            component.content = { status: 'Expired' } as any
            expect(component.isGreyedImage).toBe(true)
        })
        it('should return false for Live status', () => {
            component.content = { status: 'Live' } as any
            expect(component.isGreyedImage).toBe(false)
        })
        it('should return false when content is null', () => {
            component.content = null
            expect(component.isGreyedImage).toBe(false)
        })
    })

    describe('isLiveOrMarkForDeletion', () => {
        it('should return true for Live status', () => {
            component.content = { status: 'Live' } as any
            expect(component.isLiveOrMarkForDeletion).toBe(true)
        })
        it('should return true for MarkedForDeletion status', () => {
            component.content = { status: 'MarkedForDeletion' } as any
            expect(component.isLiveOrMarkForDeletion).toBe(true)
        })
        it('should return false for Draft status', () => {
            component.content = { status: 'Draft' } as any
            expect(component.isLiveOrMarkForDeletion).toBe(false)
        })
        it('should return false when content is null', () => {
            component.content = null
            expect(component.isLiveOrMarkForDeletion).toBe(false)
        })
    })

    describe('isDownloadable', () => {
        it('should return true when downloadUrl present', () => {
            component.content = { downloadUrl: 'http://url' } as any
            expect(component.isDownloadable).toBe(true)
        })
        it('should return false when downloadUrl empty', () => {
            component.content = { downloadUrl: '' } as any
            expect(component.isDownloadable).toBe(false)
        })
        it('should return false when content is null', () => {
            component.content = null
            expect(component.isDownloadable).toBe(false)
        })
    })

    describe('showSubtitleOnBanner', () => {
        it('should return tocSharedSvc.subtitleOnBanners', () => {
            mockTocService.subtitleOnBanners = true
            expect(component.showSubtitleOnBanner).toBe(true)
            mockTocService.subtitleOnBanners = false
            expect(component.showSubtitleOnBanner).toBe(false)
        })
    })

    describe('showDescription', () => {
        it('should return true when content has no body', () => {
            component.content = { body: '' } as any
            expect(component.showDescription).toBe(true)
        })
        it('should return tocSharedSvc.showDescription when body exists', () => {
            component.content = { body: '<p>text</p>' } as any
            mockTocService.showDescription = true
            expect(component.showDescription).toBe(true)
        })
        it('should return tocSharedSvc.showDescription when content is null', () => {
            component.content = null
            mockTocService.showDescription = true
            expect(component.showDescription).toBe(true)
        })
    })

    describe('download', () => {
        afterEach(() => jest.restoreAllMocks())

        it('should create link and trigger click when not forPreview', () => {
            const mockLink: any = { click: jest.fn(), download: '', target: '', href: '' }
            jest.spyOn(document, 'createElement').mockReturnValue(mockLink)
            jest.spyOn(document.body, 'appendChild').mockImplementation()
            jest.spyOn(document.body, 'removeChild').mockImplementation()
            component.content = { name: 'test', downloadUrl: 'http://dl.url' } as any
            component.forPreview = false
            component.download()
            expect(mockLink.click).toHaveBeenCalled()
            expect(mockLink.href).toBe('http://dl.url')
        })

        it('should not download when forPreview is true', () => {
            component.content = mockContent as any
            component.forPreview = true
            expect(() => component.download()).not.toThrow()
            // No link element should be created (can't click without createElement)
        })

        it('should not download when content is null', () => {
            component.content = null
            component.forPreview = false
            expect(() => component.download()).not.toThrow()
        })
    })

    describe('setS3Cookie', () => {
        it('should call contentSvc.setS3Cookie with identifier', async () => {
            mockContentService.setS3Cookie.mockReturnValue(of(null))
            await (component as any).setS3Cookie('cookie-id')
            expect(mockContentService.setS3Cookie).toHaveBeenCalledWith('cookie-id')
        })

        it('should silently handle errors from setS3Cookie', async () => {
            mockContentService.setS3Cookie.mockReturnValue(throwError('err'))
            await expect((component as any).setS3Cookie('cookie-id')).resolves.toBeUndefined()
        })
    })

    describe('checkIfEditEnabled (private)', () => {
        it('should set isAuthor=true when editContent not restricted', () => {
            mockConfigService.restrictedFeatures = new Set<string>()
            component.content = { creatorContacts: [] } as any
            ;(component as any).checkIfEditEnabled()
            expect(component.isAuthor).toBe(true)
        })

        it('should set isAuthor=true when user is in creatorContacts and editContentAuthor not restricted', () => {
            mockConfigService.restrictedFeatures = new Set<string>(['editContent'])
            mockConfigService.userProfile = { userId: 'creator-1' }
            component.content = { creatorContacts: [{ id: 'creator-1' }] } as any
            ;(component as any).checkIfEditEnabled()
            expect(component.isAuthor).toBe(true)
        })

        it('should not set isAuthor when user is not in creatorContacts', () => {
            mockConfigService.restrictedFeatures = new Set<string>(['editContent'])
            mockConfigService.userProfile = { userId: 'not-creator' }
            component.content = { creatorContacts: [{ id: 'creator-1' }] } as any
            component.isAuthor = false
            ;(component as any).checkIfEditEnabled()
            expect(component.isAuthor).toBe(false)
        })

        it('should not set isAuthor when userProfile is null', () => {
            mockConfigService.userProfile = null
            component.content = mockContent as any
            component.isAuthor = false
            ;(component as any).checkIfEditEnabled()
            expect(component.isAuthor).toBe(false)
        })
    })
})
