import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { EventService, LoggerService, WsEvents } from '@sunbird-cb/utils-v2'
import { Subscription } from 'rxjs'
import { ViewerUtilService } from '../../viewer-util.service'
import { NsContent } from '@sunbird-cb/collection'
// import { WidgetContentService } from '@sunbird-cb/collection/src/public-api'
import { NSQuiz } from '../../plugins/quiz/quiz.model'
import { ViewerPreviewPopupComponent } from '../../viewer-preview-popup/viewer-preview-popup.component'
// import { ViewerDataService } from '../../viewer-data.service'
import { MatDialog } from '@angular/material/dialog'
import { WidgetContentService } from '@sunbird-cb/toc'
import { AccessControlService } from '@sunbird-cb/toc'
@Component({
    selector: 'viewer-practice',
    templateUrl: './practice-test.component.html',
    styleUrls: ['./practice-test.component.scss'],
})
export class PracticeTestComponent implements OnInit, OnDestroy {
    isPreviewMode = false
    forPreview = window.location.href.includes('/author/')
    testData: any = null
    oldData: NsContent.IContent | null = null
    alreadyRaised = false
    batchId = this.activatedRoute.snapshot.queryParamMap.get('batchId')
    isFetchingDataComplete = false
    quizJson: Partial<NSQuiz.IQuiz> = {
        timeLimit: 300,
        questions: [],
        isAssessment: false,
        allowSkip: 'No',
        maxQuestions: 0,
        requiresSubmit: 'Yes',
        showTimer: 'Yes',
    }
    private dataSubscription: Subscription | null = null
    private viewerDataSubscription: Subscription | null = null
    private telemetryIntervalSubscription: Subscription | null = null
    constructor(
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private accessControlSvc: AccessControlService,
        private viewerSvc: ViewerUtilService,
        // private configSvc: ConfigurationsService,
        private eventSvc: EventService,
        private contentSvc: WidgetContentService,
        private log: LoggerService,
        private router: Router,
        // private _viewerDataService: ViewerDataService,
    ) {
        // this._viewerDataService.resourceChangedSubject.subscribe(() => {
        //     // console.log(this._viewerDataService.resource)
        // })
    }
    ngOnInit(): void {
        this.isFetchingDataComplete = false
        if (window.location.href.includes('preAssessment')) {
            this.dataSubscription = this.activatedRoute.data.subscribe(
                async (data: any) => {
                    this.isFetchingDataComplete = false
                    this.testData = data.content.data
                    if (data && data?.content && data?.content?.data && data?.content?.data?.contextCategory === 'Pre Enrolment Assessment') {
                        this.contentSvc.currentMetaData = data
                    }
                    //   console.log(this.testData)
                    this.init()
                })
        }
        else if (
            this.activatedRoute.snapshot.queryParamMap.get('preview') &&
            !this.accessControlSvc.authoringConfig.newDesign
        ) {
            this.isPreviewMode = true
            this.viewerDataSubscription = this.viewerSvc
                .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
                .subscribe(data => {
                    this.isFetchingDataComplete = false
                    this.testData = data
                    if (data && data?.content && data?.content?.data && data?.content?.data?.contextCategory === 'Pre Enrolment Assessment') {
                        this.contentSvc.currentMetaData = data
                    }
                    this.init()
                })
        } else {
            this.dataSubscription = this.activatedRoute.data.subscribe(
                async (data: any) => {
                    this.isFetchingDataComplete = false
                    this.testData = data.content.data
                    if (data && data?.content && data?.content?.data && data?.content?.data?.contextCategory === 'Pre Enrolment Assessment') {
                        this.contentSvc.currentMetaData = data
                    }
                    //   console.log(this.testData)
                    this.init()
                })
        }

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.dataSubscription = this.activatedRoute.data.subscribe(
                    async data => {
                        this.isFetchingDataComplete = false
                        this.testData = data.content.data
                        this.init()
                    })
            }
        })

    }
    init() {
        if (this.testData) {
            this.oldData = this.testData
            // result.content.children[0].children[1].expectedDuration
            this.quizJson.maxQuestions = this.testData.maxQuestions
            this.quizJson.allowSkip = this.testData.allowSkip
            this.quizJson.requiresSubmit = this.testData.requiresSubmit
            this.quizJson.showTimer = this.testData.requiresSubmit
            this.quizJson.timeLimit = this.testData.expectedDuration
            this.alreadyRaised = true
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.testData)
        }
        setTimeout(() => {
            this.isFetchingDataComplete = true
            // this.openPreviewPopup()
        }, 100)

        // this.isFetchingDataComplete = true
    }

    openPreviewPopup() {
        this.dialog.open(ViewerPreviewPopupComponent, {
            width: '98%',
            maxWidth: '100vw',
            height: 'auto',
            maxHeight: '90vh',
            panelClass: 'assessment-preview',
            data: {
                isFetchingDataComplete: this.isFetchingDataComplete,
                testData: this.testData,
                isErrorOccured: this.isErrorOccured,
                quizJson: this.quizJson,
            },
        })
    }
    // ngOnChanges(changes: SimpleChanges): void {
    //     for (const change in changes) {
    //         if (change) {
    //             console.log(change)
    //         }
    //     }
    // }
    // async fetchContinueLearning(collectionId: string, identifier: string): Promise<boolean> {
    //     return new Promise(resolve => {
    //         let userId
    //         if (this.configSvc.userProfile) {
    //             userId = this.configSvc.userProfile.userId || ''
    //         }
    //         const req: NsContent.IContinueLearningDataReq = {
    //             request: {
    //                 userId,
    //                 batchId: this.batchId,
    //                 courseId: collectionId || '',
    //                 contentIds: [],
    //                 fields: ['progressdetails'],
    //             },
    //         }
    //         this.contentSvc.fetchContentHistoryV2(req).subscribe(
    //             data => {
    //                 if (data && data.result && data.result.contentList.length) {
    //                     for (const content of data.result.contentList) {
    //                         if (content.contentId === identifier && content.progressdetails) {
    //                             try {
    //                                 // const progressdetails = JSON.parse(content.progressdetails)
    //                                 // this.widgetResolverTestData.widgetData.resumePage = Number(content.progressdetails.current.pop())
    //                                 // console.log(progressdetails)
    //                             } catch { }

    //                         }
    //                     }
    //                 }
    //                 resolve(true)
    //             },
    //             () => resolve(true),
    //         )
    //     })
    // }
    isErrorOccured(event: any) {
        this.log.error(event)
    }
    raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
        if (this.forPreview) {
            return
        }
        const event = {
            eventType: WsEvents.WsEventType.Telemetry,
            eventLogLevel: WsEvents.WsEventLogLevel.Info,
            from: 'test',
            to: '',
            data: {
                state,
                type: WsEvents.WsTimeSpentType.Player,
                mode: WsEvents.WsTimeSpentMode.Play,
                content: data,
                identifier: data ? data.identifier : null,
                mimeType: NsContent.EMimeTypes.PDF,
                url: data ? data.artifactUrl : null,
            },
        }
        this.eventSvc.dispatchEvent(event)
    }
    ngOnDestroy() {
        if (this.testData) {
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.testData)
        }
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe()
        }
        if (this.viewerDataSubscription) {
            this.viewerDataSubscription.unsubscribe()
        }
        if (this.telemetryIntervalSubscription) {
            this.telemetryIntervalSubscription.unsubscribe()
        }
    }
}
